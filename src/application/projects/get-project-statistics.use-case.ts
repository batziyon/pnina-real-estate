/**
 * Get Project Statistics Use Case
 *
 * Returns aggregated statistics about projects.
 * Used for dashboard display.
 */

import type { ProjectRepository } from "@/domain/project/project.repository";

export interface ProjectStatistics {
  total: number;
  active: number;
}

export class GetProjectStatisticsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(): Promise<ProjectStatistics> {
    const [total, active] = await Promise.all([
      this.projectRepository.count({}),
      this.projectRepository.count({ status: "ACTIVE" }),
    ]);

    return {
      total,
      active,
    };
  }
}
