/**
 * Repository interface for the Project aggregate.
 *
 * Defines the persistence contract. Infrastructure implements this.
 * No Prisma imports here.
 */

import type { PaginationMeta, PaginationParams } from "@/types";
import type {
  CreateProjectInput,
  ProjectData,
  ProjectFilters,
  UpdateProjectInput,
} from "./project.types";

export interface ProjectRepository {
  /** Find a single project by ID. Returns null if not found. */
  findById(id: string): Promise<ProjectData | null>;

  /**
   * List projects with optional filters and pagination.
   * Filters on neighborhoodId, not city (Jerusalem-only brokerage).
   */
  findMany(
    filters: ProjectFilters,
    pagination: PaginationParams
  ): Promise<{ data: ProjectData[]; meta: PaginationMeta }>;

  /** Return all active projects (status = ACTIVE) without pagination. */
  findAllActive(): Promise<ProjectData[]>;

  /** Create a new project. Returns the created project. */
  create(input: CreateProjectInput): Promise<ProjectData>;

  /** Update an existing project. Returns the updated project. */
  update(id: string, input: UpdateProjectInput): Promise<ProjectData>;

  /** Delete a project. Fails if properties are still linked. */
  delete(id: string): Promise<void>;

  /** Count projects matching the given filters. */
  count(filters: ProjectFilters): Promise<number>;
}
