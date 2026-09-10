import type { ProjectRepository } from "@/domain/project/project.repository";
import type { ProjectData, ProjectFilters } from "@/domain/project/project.types";
import type { PaginationMeta, PaginationParams } from "@/types";

export class ListProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(
    filters: ProjectFilters,
    pagination: PaginationParams
  ): Promise<{ data: ProjectData[]; meta: PaginationMeta }> {
    const page = Math.max(1, pagination.page);
    const pageSize = Math.min(100, Math.max(1, pagination.pageSize));
    return this.projectRepository.findMany(filters, { page, pageSize });
  }

  /** Returns all active projects without pagination — for public listings. */
  async executeActive(): Promise<ProjectData[]> {
    return this.projectRepository.findAllActive();
  }
}
