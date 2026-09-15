import type { PropertyRepository } from "@/domain/property/property.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PropertyData } from "@/domain/property/property.types";
import type { UserRole } from "@/domain/user/user.types";
import { getCreationViolations } from "@/domain/property/property.rules";
import { CreatePropertySchema } from "@/validations/property.schema";
import {
  EntityNotFoundError,
  ValidationError,
  UnauthorizedError,
} from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export class CreatePropertyUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(rawInput: unknown, actor: Actor): Promise<PropertyData> {
    // 1. Schema validation
    const parsed = CreatePropertySchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid property input.", fields);
    }

    const input = parsed.data;

    // 2. Determine agentId based on actor role (CRITICAL: server-controlled)
    let agentId: string;

    if (actor.role === "ADMIN") {
      // Admin can assign any agent (use client input if provided, else self)
      agentId = input.agentId ?? actor.id;

      // Verify agent exists and is active
      const agent = await this.userRepository.findById(agentId);
      if (!agent || !agent.active || agent.role !== "AGENT") {
        throw new ValidationError("Invalid agent ID.");
      }
    } else if (actor.role === "AGENT") {
      // Agent properties are auto-assigned to the agent (ignore client input)
      agentId = actor.id;
    } else if (actor.role === "EDITOR") {
      // Editor must specify a valid agent
      if (!input.agentId) {
        throw new ValidationError("EDITOR must specify an agent.");
      }

      // Verify agent exists and is active
      const agent = await this.userRepository.findById(input.agentId);
      if (!agent || !agent.active || agent.role !== "AGENT") {
        throw new ValidationError("Invalid agent ID.");
      }

      agentId = input.agentId;
    } else {
      throw new UnauthorizedError("You are not authorized to create properties.");
    }

    // 3. Domain creation rules
    const violations = getCreationViolations({
      ...input,
      agentId, // Use server-determined agentId
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

    // 4. Verify neighborhood exists
    const neighborhood = await this.neighborhoodRepository.findById(input.neighborhoodId);
    if (!neighborhood) {
      throw new EntityNotFoundError("Neighborhood", input.neighborhoodId);
    }

    // 5. Persist with server-controlled agentId
    return this.propertyRepository.create({
      ...input,
      agentId, // Server-controlled
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
