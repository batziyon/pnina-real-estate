/**
 * CreateBuyerRequirementUseCase
 *
 * Business rules:
 * - ADMIN: can create requirements for any contact
 * - AGENT: can create requirements only for contacts assigned to them
 * - EDITOR: unauthorized
 * - All neighborhoods must exist and be active
 */

import type { BuyerRequirementRepository } from "@/domain/buyer-requirement/buyer-requirement.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type {
  BuyerRequirementData,
  CreateBuyerRequirementInput,
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

export class CreateBuyerRequirementUseCase {
  constructor(
    private readonly buyerRequirementRepository: BuyerRequirementRepository,
    private readonly contactRepository: ContactRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository
  ) {}

  async execute(
    input: CreateBuyerRequirementInput,
    actor: Actor
  ): Promise<BuyerRequirementData> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to create buyer requirements."
      );
    }

    // 2. Verify contact exists
    const contact = await this.contactRepository.findById(input.contactId);
    if (!contact) {
      throw new EntityNotFoundError("Contact", input.contactId);
    }

    // 3. Resource-level authorization (verify contact ownership/assignment)
    if (actor.role === "AGENT") {
      if (contact.assignedAgentId !== actor.id) {
        throw new UnauthorizedError(
          "You can only create requirements for contacts assigned to you."
        );
      }
    }
    // ADMIN can create for any contact

    // 4. Validate neighborhoods exist and are active
    if (input.neighborhoods.length > 0) {
      const neighborhoodIds = input.neighborhoods.map((n) => n.neighborhoodId);
      const neighborhoods = await Promise.all(
        neighborhoodIds.map((id) => this.neighborhoodRepository.findById(id))
      );

      const missingIds: string[] = [];
      const inactiveNames: string[] = [];

      neighborhoods.forEach((neighborhood, index) => {
        const id = neighborhoodIds[index];
        if (!neighborhood) {
          missingIds.push(id);
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

    // 5. Create the requirement
    return await this.buyerRequirementRepository.create(input);
  }
}
