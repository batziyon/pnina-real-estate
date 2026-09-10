/**
 * Domain types for the Project aggregate.
 *
 * Persistence-independent — no Prisma, no Next.js, no React.
 *
 * Geographic model: Jerusalem-only brokerage.
 * Projects are located by Neighborhood (FK), not by a free-text city field.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type ProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

// ---------------------------------------------------------------------------
// Core project data shape
// ---------------------------------------------------------------------------

export interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  /** FK to Neighborhood — the sole geographic locator in this system. */
  neighborhoodId: string;
  address: string | null;
  status: ProjectStatus;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Input types for use cases
// ---------------------------------------------------------------------------

export type CreateProjectInput = Omit<ProjectData, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: ProjectStatus;
};

export type UpdateProjectInput = Partial<
  Omit<ProjectData, "id" | "createdAt" | "updatedAt">
>;

// ---------------------------------------------------------------------------
// Filter / query types
// ---------------------------------------------------------------------------

export interface ProjectFilters {
  status?: ProjectStatus;
  neighborhoodId?: string;
}
