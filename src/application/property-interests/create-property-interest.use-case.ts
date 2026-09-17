/**
 * CreatePropertyInterestUseCase
 *
 * Business rules:
 * - ADMIN: can create for any contact/property
 * - AGENT: can create only if they own the contact OR the property
 * - EDITOR: unauthorized
 * - Idempotent: duplicate (contactId, propertyId) returns existing record
 * - Race-safe: handles concurrent duplicate creation gracefully
 */

import type { PropertyInterestRepository } from "@/domain/property-interest/property-interest.repository";
import type { ContactRepository } from "@/domain/contact/contact.repository";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type {
  PropertyInterestData,
  CreatePropertyInterestInput,
} from "@/domain/property-interest/property-interest.types";
import type { UserRole } from "@/domain/user/user.types";
import {
  UnauthorizedError,
  EntityNotFoundError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class CreatePropertyInterestUseCase {
  constructor(
    private readonly propertyInterestRepository: PropertyInterestRepository,
    private readonly contactRepository: ContactRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(
    input: CreatePropertyInterestInput,
    actor: Actor
  ): Promise<PropertyInterestData> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to create property interests."
      );
    }

    // 2. Verify property exists
    const property = await this.propertyRepository.findById(input.propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", input.propertyId);
    }

    // 3. Verify contact exists
    const contact = await this.contactRepository.findById(input.contactId);
    if (!contact) {
      throw new EntityNotFoundError("Contact", input.contactId);
    }

    // 4. Resource-level authorization
    if (actor.role === "AGENT") {
      const ownsContact = contact.assignedAgentId === actor.id;
      const ownsProperty = property.agentId === actor.id;

      if (!ownsContact && !ownsProperty) {
        throw new UnauthorizedError(
          "You can only create interests for contacts or properties you manage."
        );
      }
    }
    // ADMIN can create for any contact/property

    // 5. Check if interest already exists (idempotency)
    const existing = await this.propertyInterestRepository.findByContactAndProperty(
      input.contactId,
      input.propertyId
    );

    if (existing) {
      // Idempotent: return existing record without error
      return existing;
    }

    // 6. Create new interest
    try {
      return await this.propertyInterestRepository.create(input);
    } catch (error: unknown) {
      // Handle race condition: another request created it between check and create
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        // Prisma unique constraint violation
        const newExisting = await this.propertyInterestRepository.findByContactAndProperty(
          input.contactId,
          input.propertyId
        );
        if (newExisting) return newExisting;
      }
      throw error; // Re-throw other errors
    }
  }
}
