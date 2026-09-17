import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyData } from "@/domain/property/property.types";
import type { UserRole } from "@/domain/user/user.types";
import type { PropertyStatusHistoryRepository } from "@/domain/property-status-history/property-status-history.repository";
import { isValidStatusTransition, canActorPublish } from "@/domain/property/property.rules";
import {
  EntityNotFoundError,
  BusinessRuleError,
  UnauthorizedError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class ArchivePropertyUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly statusHistoryRepository: PropertyStatusHistoryRepository
  ) {}

  async execute(id: string, actor: Actor): Promise<PropertyData> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new EntityNotFoundError("Property", id);

    // Authorization check - same rules as publish/status changes
    if (!canActorPublish(actor.id, actor.role, property)) {
      throw new UnauthorizedError("You are not authorized to archive this property.");
    }

    if (!isValidStatusTransition(property.status, "ARCHIVED")) {
      throw new BusinessRuleError(
        `Cannot archive a property with status "${property.status}".`
      );
    }

    // Create status history record
    await this.statusHistoryRepository.create({
      propertyId: id,
      fromStatus: property.status,
      toStatus: "ARCHIVED",
      reason: "OTHER",
      changedBy: actor.id,
    });

    return this.propertyRepository.archive(id);
  }
}
