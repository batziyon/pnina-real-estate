/**
 * Project domain entity.
 *
 * Lightweight encapsulation for a Project record.
 * No Prisma, no Next.js, no React.
 *
 * Geographic model: Projects are located by neighborhoodId (FK to
 * Neighborhood). There is no city field — Jerusalem-only brokerage.
 */

import type { ProjectData, ProjectStatus } from "./project.types";

const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT:     ["ACTIVE", "ARCHIVED"],
  ACTIVE:    ["COMPLETED", "ARCHIVED", "DRAFT"],
  COMPLETED: ["ARCHIVED"],
  ARCHIVED:  ["DRAFT"],
};

export class Project {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly neighborhoodId: string;
  readonly address: string | null;
  readonly status: ProjectStatus;
  readonly coverImage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: ProjectData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.neighborhoodId = data.neighborhoodId;
    this.address = data.address;
    this.status = data.status;
    this.coverImage = data.coverImage;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isActive(): boolean {
    return this.status === "ACTIVE";
  }

  isArchived(): boolean {
    return this.status === "ARCHIVED";
  }

  canTransitionTo(next: ProjectStatus): boolean {
    return ALLOWED_TRANSITIONS[this.status].includes(next);
  }

  toData(): ProjectData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      neighborhoodId: this.neighborhoodId,
      address: this.address,
      status: this.status,
      coverImage: this.coverImage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
