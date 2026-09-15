import type { UserRepository } from "@/domain/user/user.repository";
import type { UserData } from "@/domain/user/user.types";
import { CreateUserSchema } from "@/validations/user.schema";
import { ValidationError, BusinessRuleError } from "@/application/errors";

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(rawInput: unknown): Promise<UserData> {
    const parsed = CreateUserSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid user input.", fields);
    }

    const input = parsed.data;

    // Normalize email: trim whitespace and convert to lowercase
    const email = input.email.trim().toLowerCase();

    // Prevent duplicate email
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new BusinessRuleError(`A user with email "${email}" already exists.`);
    }

    return this.userRepository.create({
      name: input.name,
      email,
      phone: input.phone,
      role: input.role,
    });
  }
}
