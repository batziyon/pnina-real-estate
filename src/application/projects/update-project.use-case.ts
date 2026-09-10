import type { ProjectRepository } from "@/domain/project/project.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { ProjectData } from "@/domain/project/project.types";
import { UpdateProjectSchema } from "@/validations/project.schema";
import { EntityNotFoundError, ValidationError } from "@/application/errors";

export class UpdateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository
  ) {}

  async execute(id: string, rawInput: unknown): Promise<ProjectData> {
    const parsed = UpdateProjectSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fields = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      );
      throw new ValidationError("Invalid project update input.", fields);
    }

    const input = parsed.data;

    const existing = await this.projectRepository.findById(id);
    if (!existing) throw new EntityNotFoundError("Project", id);

    if (input.neighborhoodId && input.neighborhoodId !== existing.neighborhoodId) {
      const neighborhood = await this.neighborhoodRepository.findById(input.neighborhoodId);
      if (!neighborhood) throw new EntityNotFoundError("Neighborhood", input.neighborhoodId);
    }

    return this.projectRepository.update(id, input);
  }
}
