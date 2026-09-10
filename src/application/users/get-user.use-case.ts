import type { UserRepository } from "@/domain/user/user.repository";
import type { UserData } from "@/domain/user/user.types";
import { EntityNotFoundError } from "@/application/errors";

export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<UserData> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new EntityNotFoundError("User", id);
    return user;
  }

  async executeByEmail(email: string): Promise<UserData> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new EntityNotFoundError("User", email);
    return user;
  }
}
