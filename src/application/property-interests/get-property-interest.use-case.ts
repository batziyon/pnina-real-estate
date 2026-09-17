/**
 * GetPropertyInterestUseCase
 *
 * Business rules:
 * - ADMIN: can view any interest
 * - AGENT: can view only if they own the contact OR the property
 * - EDITOR: unauthorized
 */

import type { PropertyInterestRepository } from "@/domain/property-interest/property-interest.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { PropertyRepository } from "@/domain/property/property.repository";
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

export class GetPropertyInterestUseCase {
  constructor(
    private readonly propertyInterestRepository: PropertyInterestRepository,
    private readonly contactRepository: ContactRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(id: string, actor: Actor): Promise<PropertyInterestData> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to view property interests."
      );
    }

    // 2. Fetch interest
    const interest = await this.propertyInterestRepository.findById(id);
    if (!interest) {
      throw new EntityNotFoundError("PropertyInterest", id);
    }

    // 3. Resource-level authorization
    if (actor.role === "AGENT") {
      const [contact, property] = await Promise.all([
        this.contactRepository.findById(interest.contactId),
        this.propertyRepository.findById(interest.propertyId),
      ]);

      const ownsContact = contact?.assignedAgentId === actor.id;
      const ownsProperty = property?.agentId === actor.id;

      if (!ownsContact && !ownsProperty) {
        throw new UnauthorizedError(
          "You can only view interests for contacts or properties you manage."
        );
      }
    }
    // ADMIN can view any interest

    return interest;
  }
}
