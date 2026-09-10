import type { UserRepository } from "@/domain/user/user.repository";
import type { UserData } from "@/domain/user/user.types";
import { UpdateUserSchema } from "@/validations/user.schema";
import { EntityNotFoundError, ValidationError } from "@/application/errors";

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, rawInput: unknown): Promise<UserData> {
    const parsed = UpdateUserSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid user update input.", fields);
    }

    const existing = await this.userRepository.findById(id);
    if (!existing) throw new EntityNotFoundError("User", id);

    return this.userRepository.update(id, parsed.data);
  }
}
