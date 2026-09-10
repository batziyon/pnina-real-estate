import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyData } from "@/domain/property/property.types";
import {
  isValidStatusTransition,
  canBePublished,
  getPublishingViolations,
} from "@/domain/property/property.rules";
import {
  EntityNotFoundError,
  BusinessRuleError,
  ValidationError,
} from "@/application/errors";

export class PublishPropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(id: string): Promise<PropertyData> {
    // 1. Verify property exists
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new EntityNotFoundError("Property", id);

    // 2. Verify status transition is allowed
    if (!isValidStatusTransition(property.status, "PUBLISHED")) {
      throw new BusinessRuleError(
        `Cannot publish a property with status "${property.status}".`
      );
    }

    // 3. Verify all publishing requirements are satisfied
    if (!canBePublished(property)) {
      const violations = getPublishingViolations(property);
      const fields = Object.fromEntries(violations.map((v) => [v.field, v.message]));
      throw new ValidationError(
        "Property cannot be published: required fields are missing.",
        fields
      );
    }

    // 4. Persist status change
    return this.propertyRepository.update(id, { status: "PUBLISHED" });
  }
}
