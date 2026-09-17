/**
 * ListPropertyInterestsByContactUseCase
 *
 * Business rules:
 * - ADMIN: can list for any contact
 * - AGENT: can list only for contacts they own
 * - EDITOR: unauthorized
 */

import type { PropertyInterestRepository } from "@/domain/property-interest/property-interest.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { PropertyInterestData } from "@/domain/property-interest/property-interest.types";
import type { UserRole } from "@/domain/user/user.types";
import {
  UnauthorizedError,
  EntityNotFoundError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class ListPropertyInterestsByContactUseCase {
  constructor(
    private readonly propertyInterestRepository: PropertyInterestRepository,
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(contactId: string, actor: Actor): Promise<PropertyInterestData[]> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to view property interests."
      );
    }

    // 2. Verify contact exists
    const contact = await this.contactRepository.findById(contactId);
    if (!contact) {
      throw new EntityNotFoundError("Contact", contactId);
    }

    // 3. Resource-level authorization
    if (actor.role === "AGENT") {
      if (contact.assignedAgentId !== actor.id) {
        throw new UnauthorizedError(
          "You can only view interests for contacts you manage."
        );
      }
    }
    // ADMIN can view for any contact

    // 4. Fetch interests
    return await this.propertyInterestRepository.findByContactId(contactId);
  }
}
