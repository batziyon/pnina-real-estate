import type { PropertyRepository } from "@/domain/property/property.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { PropertyData } from "@/domain/property/property.types";
import { UpdatePropertySchema } from "@/validations/property.schema";
import { EntityNotFoundError, ValidationError } from "@/application/errors";

export class UpdatePropertyUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository
  ) {}

  async execute(id: string, rawInput: unknown): Promise<PropertyData> {
    // 1. Schema validation
    const parsed = UpdatePropertySchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid update input.", fields);
    }

    const input = parsed.data;

    // 2. Verify property exists
    const existing = await this.propertyRepository.findById(id);
    if (!existing) throw new EntityNotFoundError("Property", id);

    // 3. If neighborhoodId is being changed, verify it exists
    if (input.neighborhoodId && input.neighborhoodId !== existing.neighborhoodId) {
      const neighborhood = await this.neighborhoodRepository.findById(input.neighborhoodId);
      if (!neighborhood) throw new EntityNotFoundError("Neighborhood", input.neighborhoodId);
    }

    // 4. Persist
    return this.propertyRepository.update(id, input);
  }
}
