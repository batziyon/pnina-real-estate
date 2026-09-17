/**
 * DeletePropertyInterestUseCase
 *
 * Business rules:
 * - ADMIN: can delete any interest
 * - AGENT: can delete only if they own the contact OR the property
 * - EDITOR: unauthorized
 * - Hard delete (prefer status=NOT_INTERESTED for real contacts)
 * - Security: interest must belong to the specified property (resource boundary)
 */

import type { PropertyInterestRepository } from "@/domain/property-interest/property-interest.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type { UserRole } from "@/domain/user/user.types";
import {
  UnauthorizedError,
  EntityNotFoundError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class DeletePropertyInterestUseCase {
  constructor(
    private readonly propertyInterestRepository: PropertyInterestRepository,
    private readonly contactRepository: ContactRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(id: string, propertyId: string, actor: Actor): Promise<void> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to delete property interests."
      );
    }

    // 2. Fetch existing interest
    const interest = await this.propertyInterestRepository.findById(id);
    if (!interest) {
      throw new EntityNotFoundError("PropertyInterest", id);
    }

    // 3. Resource boundary check: verify interest belongs to the specified property
    if (interest.propertyId !== propertyId) {
      throw new EntityNotFoundError("PropertyInterest", id);
    }

    // 4. Resource-level authorization
    if (actor.role === "AGENT") {
      const [contact, property] = await Promise.all([
        this.contactRepository.findById(interest.contactId),
        this.propertyRepository.findById(interest.propertyId),
      ]);

      const ownsContact = contact?.assignedAgentId === actor.id;
      const ownsProperty = property?.agentId === actor.id;

      if (!ownsContact && !ownsProperty) {
        throw new UnauthorizedError(
          "You can only delete interests for contacts or properties you manage."
        );
      }
    }
    // ADMIN can delete any interest

    // 5. Delete interest
    await this.propertyInterestRepository.delete(id);
  }
}
