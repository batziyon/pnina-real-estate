/**
 * DeactivateBuyerRequirementUseCase
 *
 * Business rules:
 * - ADMIN: can deactivate requirements for any contact
 * - AGENT: can deactivate requirements only for contacts assigned to them
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

export class DeactivateBuyerRequirementUseCase {
  constructor(
    private readonly buyerRequirementRepository: BuyerRequirementRepository,
    private readonly contactRepository: ContactRepository
  ) {}

  async execute(id: string, actor: Actor): Promise<BuyerRequirementData> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to deactivate buyer requirements."
      );
    }

    // 2. Fetch existing requirement
    const requirement = await this.buyerRequirementRepository.findById(id);
    if (!requirement) {
      throw new EntityNotFoundError("BuyerRequirement", id);
    }

    // 3. Fetch associated contact
    const contact = await this.contactRepository.findById(
      requirement.contactId
    );
    if (!contact) {
      throw new EntityNotFoundError("Contact", requirement.contactId);
    }

    // 4. Resource-level authorization
    if (actor.role === "AGENT") {
      if (contact.assignedAgentId !== actor.id) {
        throw new UnauthorizedError(
          "You can only deactivate requirements for contacts assigned to you."
        );
      }
    }
    // ADMIN can deactivate any requirement

    // 5. Deactivate
    return await this.buyerRequirementRepository.deactivate(id);
  }
}
