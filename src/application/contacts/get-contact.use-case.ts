import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { ContactData } from "@/domain/contact/contact.types";
import type { UserRole } from "@/domain/user/user.types";
import {
  EntityNotFoundError,
  UnauthorizedError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class GetContactUseCase {
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(id: string, actor: Actor): Promise<ContactData> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError("You are not authorized to view contacts.");
    }

    // 2. Fetch contact
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new EntityNotFoundError("Contact", id);
    }

    // 3. Resource-level authorization
    if (actor.role === "AGENT") {
      // Agent can only view contacts assigned to them
      if (contact.assignedAgentId !== actor.id) {
        throw new UnauthorizedError(
          "You can only view contacts assigned to you."
        );
      }
    }
    // ADMIN can view any contact

    return contact;
  }
}
