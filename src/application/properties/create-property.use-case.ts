import type { PropertyRepository } from "@/domain/property/property.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { PropertyData } from "@/domain/property/property.types";
import { getCreationViolations } from "@/domain/property/property.rules";
import { CreatePropertySchema } from "@/validations/property.schema";
import {
  EntityNotFoundError,
  ValidationError,
} from "@/application/errors";
import type { PaginationParams } from "@/types";

export class CreatePropertyUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository
  ) {}

  async execute(rawInput: unknown): Promise<PropertyData> {
    // 1. Schema validation
    const parsed = CreatePropertySchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid property input.", fields);
    }

    const input = parsed.data;

    // 2. Domain creation rules
    const violations = getCreationViolations({
      ...input,
      description: input.description ?? null,
      address: input.address ?? null,
      rooms: input.rooms ?? null,
      area: input.area ?? null,
      floor: input.floor ?? null,
      totalFloors: input.totalFloors ?? null,
      projectId: input.projectId ?? null,
      parking: input.parking ?? false,
      elevator: input.elevator ?? false,
      balcony: input.balcony ?? false,
      safeRoom: input.safeRoom ?? false,
      storage: input.storage ?? false,
      airConditioning: input.airConditioning ?? false,
      accessible: input.accessible ?? false,
      furnished: input.furnished ?? false,
    });
    if (violations.length > 0) {
      const fields = Object.fromEntries(violations.map((v) => [v.field, v.message]));
      throw new ValidationError("Property creation rules violated.", fields);
    }

    // 3. Verify neighborhood exists
    const neighborhood = await this.neighborhoodRepository.findById(input.neighborhoodId);
    if (!neighborhood) {
      throw new EntityNotFoundError("Neighborhood", input.neighborhoodId);
    }

    // 4. Persist
    return this.propertyRepository.create({
      ...input,
      description: input.description ?? null,
      address: input.address ?? null,
      rooms: input.rooms ?? null,
      area: input.area ?? null,
      floor: input.floor ?? null,
      totalFloors: input.totalFloors ?? null,
      projectId: input.projectId ?? null,
      parking: input.parking ?? false,
      elevator: input.elevator ?? false,
      balcony: input.balcony ?? false,
      safeRoom: input.safeRoom ?? false,
      storage: input.storage ?? false,
      airConditioning: input.airConditioning ?? false,
      accessible: input.accessible ?? false,
      furnished: input.furnished ?? false,
    });
  }
}

// Suppress unused import — PaginationParams used indirectly through shared types
void (0 as unknown as PaginationParams);
