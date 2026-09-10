import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyData } from "@/domain/property/property.types";
import { isValidStatusTransition } from "@/domain/property/property.rules";
import { EntityNotFoundError, BusinessRuleError } from "@/application/errors";

export class ArchivePropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(id: string): Promise<PropertyData> {
    const property = await this.propertyRepository.findById(id);
    if (!property) throw new EntityNotFoundError("Property", id);

    if (!isValidStatusTransition(property.status, "ARCHIVED")) {
      throw new BusinessRuleError(
        `Cannot archive a property with status "${property.status}".`
      );
    }

    return this.propertyRepository.archive(id);
  }
}
