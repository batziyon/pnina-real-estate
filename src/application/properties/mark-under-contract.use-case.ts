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

export class MarkPropertyUnderContractUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly statusHistoryRepository: PropertyStatusHistoryRepository
  ) {}

  async execute(id: string, actor: Actor): Promise<PropertyData> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new EntityNotFoundError("Property", id);

    // Authorization: same rules as publish
    if (!canActorPublish(actor.id, actor.role, property)) {
      throw new UnauthorizedError("You are not authorized to mark this property as under contract.");
    }

    if (!isValidStatusTransition(property.status, "UNDER_CONTRACT")) {
      throw new BusinessRuleError(
        `Cannot mark as under contract a property with status "${property.status}".`
      );
    }

    // Create status history record
    await this.statusHistoryRepository.create({
      propertyId: id,
      fromStatus: property.status,
      toStatus: "UNDER_CONTRACT",
      reason: "OTHER",
      changedBy: actor.id,
    });

    return this.propertyRepository.update(id, { status: "UNDER_CONTRACT" });
  }
}
