import type { PropertyRepository } from "@/domain/property/property.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { PropertyData } from "@/domain/property/property.types";
import type { UserRole } from "@/domain/user/user.types";
import { UpdatePropertySchema } from "@/validations/property.schema";
import { EntityNotFoundError, ValidationError, UnauthorizedError } from "@/application/errors";
import { canActorEditProperty } from "@/domain/property/property.rules";

export interface Actor {
  id: string;
  role: UserRole;
}

export class UpdatePropertyUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository
  ) {}

  async execute(id: string, rawInput: unknown, actor: Actor): Promise<PropertyData> {
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

    // 3. Authorization check (domain rule)
    if (!canActorEditProperty(actor.id, actor.role, existing)) {
      throw new UnauthorizedError("You are not authorized to edit this property.");
    }

    // 4. If neighborhoodId is being changed, verify it exists
    if (input.neighborhoodId && input.neighborhoodId !== existing.neighborhoodId) {
      const neighborhood = await this.neighborhoodRepository.findById(input.neighborhoodId);
      if (!neighborhood) throw new EntityNotFoundError("Neighborhood", input.neighborhoodId);
    }

    // 5. Persist
    return this.propertyRepository.update(id, input);
  }
}
