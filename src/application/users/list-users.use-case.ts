import type { UserRepository } from "@/domain/user/user.repository";
import type { UserData, UserFilters } from "@/domain/user/user.types";
import type { PaginationMeta, PaginationParams } from "@/types";

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    filters: UserFilters,
    pagination: PaginationParams
  ): Promise<{ data: UserData[]; meta: PaginationMeta }> {
    const page = Math.max(1, pagination.page);
    const pageSize = Math.min(100, Math.max(1, pagination.pageSize));
    return this.userRepository.findMany(filters, { page, pageSize });
  }

  /** Returns all active agents — for admin management and assignment dropdowns. */
  async executeActiveAgents(): Promise<UserData[]> {
    return this.userRepository.findAllActiveAgents();
  }
}
