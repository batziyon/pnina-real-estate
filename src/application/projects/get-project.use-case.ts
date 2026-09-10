import type { ProjectRepository } from "@/domain/project/project.repository";
import type { ProjectData } from "@/domain/project/project.types";
import { EntityNotFoundError } from "@/application/errors";

export class GetProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(id: string): Promise<ProjectData> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new EntityNotFoundError("Project", id);
    return project;
  }
}
