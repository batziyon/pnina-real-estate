/**
 * UpdateBuyerRequirementUseCase
 *
 * Business rules:
 * - ADMIN: can update requirements for any contact
 * - AGENT: can update requirements only for contacts assigned to them
 * - EDITOR: unauthorized
 * - All neighborhoods must exist and be active (if provided)
 */

import type { BuyerRequirementRepository } from "@/domain/buyer-requirement/buyer-requirement.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type {
  BuyerRequirementData,
  UpdateBuyerRequirementInput,
} from "@/domain/buyer-requirement/buyer-requirement.types";
import type { UserRole } from "@/domain/user/user.types";
import {
  UnauthorizedError,
  EntityNotFoundError,
  ValidationError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class UpdateBuyerRequirementUseCase {
  constructor(
    private readonly buyerRequirementRepository: BuyerRequirementRepository,
    private readonly contactRepository: ContactRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository
  ) {}

  async execute(
    id: string,
    input: UpdateBuyerRequirementInput,
    actor: Actor
  ): Promise<BuyerRequirementData> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to update buyer requirements."
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

    // 4. Resource-level authorization (verify contact ownership/assignment)
    if (actor.role === "AGENT") {
      if (contact.assignedAgentId !== actor.id) {
        throw new UnauthorizedError(
          "You can only update requirements for contacts assigned to you."
        );
      }
    }
    // ADMIN can update any requirement

    // 5. Validate neighborhoods if provided
    if (input.neighborhoods && input.neighborhoods.length > 0) {
      const neighborhoodIds = input.neighborhoods.map((n) => n.neighborhoodId);
      const neighborhoods = await Promise.all(
        neighborhoodIds.map((nId) => this.neighborhoodRepository.findById(nId))
      );

      const missingIds: string[] = [];
      const inactiveNames: string[] = [];

      neighborhoods.forEach((neighborhood, index) => {
        const nId = neighborhoodIds[index];
        if (!neighborhood) {
          missingIds.push(nId);
        } else if (!neighborhood.active) {
          inactiveNames.push(neighborhood.name);
        }
      });

      if (missingIds.length > 0) {
        throw new ValidationError(
          `השכונות הבאות לא נמצאו: ${missingIds.join(", ")}`
        );
      }

      if (inactiveNames.length > 0) {
        throw new ValidationError(
          `השכונות הבאות אינן פעילות: ${inactiveNames.join(", ")}`
        );
      }
    }

    // 6. Update the requirement
    return await this.buyerRequirementRepository.update(id, input);
  }
}
