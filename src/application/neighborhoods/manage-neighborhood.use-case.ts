import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { NeighborhoodData } from "@/domain/neighborhood/neighborhood.types";
import {
  CreateNeighborhoodSchema,
  UpdateNeighborhoodSchema,
} from "@/validations/neighborhood.schema";
import {
  EntityNotFoundError,
  ValidationError,
  BusinessRuleError,
} from "@/application/errors";

export class ManageNeighborhoodUseCase {
  constructor(private readonly neighborhoodRepository: NeighborhoodRepository) {}

  async create(rawInput: unknown): Promise<NeighborhoodData> {
    const parsed = CreateNeighborhoodSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid neighborhood input.", fields);
    }

    // Prevent duplicates — name is unique in the schema but give a clearer error
    const existing = await this.neighborhoodRepository.findByName(parsed.data.name);
    if (existing) {
      throw new BusinessRuleError(
        `A neighborhood named "${parsed.data.name}" already exists.`
      );
    }

    return this.neighborhoodRepository.create(parsed.data);
  }

  async update(id: string, rawInput: unknown): Promise<NeighborhoodData> {
    const parsed = UpdateNeighborhoodSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid neighborhood update input.", fields);
    }

    const existing = await this.neighborhoodRepository.findById(id);
    if (!existing) throw new EntityNotFoundError("Neighborhood", id);

    // If renaming, check the new name isn't already taken
    if (parsed.data.name && parsed.data.name !== existing.name) {
      const conflict = await this.neighborhoodRepository.findByName(parsed.data.name);
      if (conflict) {
        throw new BusinessRuleError(
          `A neighborhood named "${parsed.data.name}" already exists.`
        );
      }
    }

    return this.neighborhoodRepository.update(id, parsed.data);
  }

  async deactivate(id: string): Promise<NeighborhoodData> {
    const existing = await this.neighborhoodRepository.findById(id);
    if (!existing) throw new EntityNotFoundError("Neighborhood", id);
    // Deactivation is always permitted — it does not delete the record.
    return this.neighborhoodRepository.deactivate(id);
  }
}
