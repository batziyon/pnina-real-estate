/**
 * ListPropertyInterestsByPropertyUseCase
 *
 * Business rules:
 * - ADMIN: can list for any property
 * - AGENT: can list only for properties they own
 * - EDITOR: unauthorized
 * - Optional status filter
 */

import type { PropertyInterestRepository } from "@/domain/property-interest/property-interest.repository";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type {
  PropertyInterestData,
  PropertyInterestStatus,
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

export class ListPropertyInterestsByPropertyUseCase {
  constructor(
    private readonly propertyInterestRepository: PropertyInterestRepository,
    private readonly propertyRepository: PropertyRepository
  ) {}

  async execute(
    propertyId: string,
    statusFilter: PropertyInterestStatus | undefined,
    actor: Actor
  ): Promise<PropertyInterestData[]> {
    // 1. Authorization check
    if (actor.role === "EDITOR") {
      throw new UnauthorizedError(
        "You are not authorized to view property interests."
      );
    }

    // 2. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      throw new EntityNotFoundError("Property", propertyId);
    }

    // 3. Resource-level authorization
    if (actor.role === "AGENT") {
      if (property.agentId !== actor.id) {
        throw new UnauthorizedError(
          "You can only view interests for properties you manage."
        );
      }
    }
    // ADMIN can view for any property

    // 4. Fetch interests
    return await this.propertyInterestRepository.findByPropertyId(
      propertyId,
      statusFilter
    );
  }
}
