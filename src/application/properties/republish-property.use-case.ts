import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyData } from "@/domain/property/property.types";
import type { UserRole } from "@/domain/user/user.types";
import type { PropertyStatusHistoryRepository } from "@/domain/property-status-history/property-status-history.repository";
import type { StatusChangeReason } from "@/domain/property-status-history/property-status-history.types";
import {
  isValidStatusTransition,
  canBePublished,
  getPublishingViolations,
  canActorPublish,
} from "@/domain/property/property.rules";
import {
  EntityNotFoundError,
  BusinessRuleError,
  ValidationError,
  UnauthorizedError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export interface RepublishInput {
  reason: StatusChangeReason;
  notes?: string;
}

export class RepublishPropertyUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly statusHistoryRepository: PropertyStatusHistoryRepository
  ) {}

  async execute(id: string, input: RepublishInput, actor: Actor): Promise<PropertyData> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new EntityNotFoundError("Property", id);

    // 2. Authorization check
    if (!canActorPublish(actor.id, actor.role, property)) {
      throw new UnauthorizedError("You are not authorized to republish this property.");
    }

    // 3. Verify status transition is allowed
    if (!isValidStatusTransition(property.status, "PUBLISHED")) {
      throw new BusinessRuleError(
        `Cannot republish a property with status "${property.status}".`
      );
    }

    // 4. Verify all publishing requirements are satisfied
    if (!canBePublished(property)) {
      const violations = getPublishingViolations(property);
      const fields = Object.fromEntries(violations.map((v) => [v.field, v.message]));
      throw new ValidationError(
        "Property cannot be published: required fields are missing.",
        fields
      );
    }

    // 5. Require reason when transitioning from UNDER_CONTRACT
    if (property.status === "UNDER_CONTRACT" && !input.reason) {
      throw new ValidationError(
        "A reason is required when republishing a property from UNDER_CONTRACT status.",
        { reason: "Reason is required" }
      );
    }

    // 6. Create status history record with reason
    await this.statusHistoryRepository.create({
      propertyId: id,
      fromStatus: property.status,
      toStatus: "PUBLISHED",
      reason: input.reason,
      notes: input.notes,
      changedBy: actor.id,
    });

    // 7. Persist status change
    return this.propertyRepository.update(id, { status: "PUBLISHED" });
  }
}
