import type { ProjectRepository } from "@/domain/project/project.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { ProjectData } from "@/domain/project/project.types";
import { CreateProjectSchema } from "@/validations/project.schema";
import { EntityNotFoundError, ValidationError } from "@/application/errors";

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository
  ) {}

  async execute(rawInput: unknown): Promise<ProjectData> {
    const parsed = CreateProjectSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid project input.", fields);
    }

    const input = parsed.data;

    const neighborhood = await this.neighborhoodRepository.findById(input.neighborhoodId);
    if (!neighborhood) throw new EntityNotFoundError("Neighborhood", input.neighborhoodId);

    return this.projectRepository.create({
      name: input.name,
      description: input.description ?? null,
      neighborhoodId: input.neighborhoodId,
      address: input.address ?? null,
      status: input.status,
      coverImage: input.coverImage ?? null,
    });
  }
}
