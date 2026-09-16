/**
 * ListContactBuyerRequirementsUseCase
 *
 * Business rules:
 * - ADMIN: can list requirements for any contact
 * - AGENT: can list requirements only for contacts assigned to them
 * - EDITOR: unauthorized
 */

import type { BuyerRequirementRepository } from "@/domain/buyer-requirement/buyer-requirement.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { BuyerRequirementData } from "@/domain/buyer-requirement/buyer-requirement.types";
import type { UserRole } from "@/domain/user/user.types";
import {
  UnauthorizedError,
  EntityNotFoundError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class ListContactBuyerRequirementsUseCase {
  constructor(
    private readonly buyerRequirementRepository: BuyerRequirementRepository,
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(
    contactId: string,
    actor: Actor
  ): Promise<BuyerRequirementData[]> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to view buyer requirements."
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
          "You can only view requirements for contacts assigned to you."
        );
      }
    }
    // ADMIN can view any contact's requirements

    // 4. Fetch requirements
    return await this.buyerRequirementRepository.findByContactId(contactId);
  }
}
