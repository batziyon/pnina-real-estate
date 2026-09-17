import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyStatusHistoryRepository } from "@/domain/property-status-history/property-status-history.repository";
import type { PropertyStatusHistoryData } from "@/domain/property-status-history/property-status-history.types";
import type { UserRole } from "@/domain/user/user.types";
import { canActorEditProperty } from "@/domain/property/property.rules";
import {
  EntityNotFoundError,
  UnauthorizedError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class GetPropertyStatusHistoryUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly statusHistoryRepository: PropertyStatusHistoryRepository
  ) {}

  async execute(propertyId: string, actor: Actor): Promise<PropertyStatusHistoryData[]> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) throw new EntityNotFoundError("Property", propertyId);

    // 2. Authorization check - user must be able to view this property
    if (!canActorEditProperty(actor.id, actor.role, property)) {
      throw new UnauthorizedError("You are not authorized to view this property's history.");
    }

    // 3. Retrieve status history
    return this.statusHistoryRepository.findByPropertyId(propertyId);
  }
}
