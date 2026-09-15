import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { ContactData, ContactFilters } from "@/domain/contact/contact.types";
import type { UserRole } from "@/domain/user/user.types";
import type { PaginationMeta, PaginationParams } from "@/types";
import { UnauthorizedError } from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class ListContactsUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(
    filters: ContactFilters,
    pagination: PaginationParams,
    actor: Actor
  ): Promise<{ data: ContactData[]; meta: PaginationMeta }> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError("You are not authorized to view contacts.");
    }

    // 2. Role-based filtering (server-side enforcement)
    const finalFilters = { ...filters };

    if (actor.role === "AGENT") {
      // Agent can only see contacts assigned to them
      finalFilters.assignedAgentId = actor.id;
    }
    // ADMIN can see all contacts (use filters as provided)

    // 3. Fetch contacts
    return this.contactRepository.findMany(finalFilters, pagination);
  }
}
