/**
 * Property domain entity.
 *
 * Encapsulates the state and invariants of a single property.
 * Business rules that operate on a single Property live here or in
 * property.rules.ts.  Infrastructure, Prisma, React, and Next.js must NOT
 * be imported into this file.
 *
 * Geographic model: Properties are located by neighborhoodId (FK to
 * Neighborhood). There is no city field — this is a Jerusalem-only brokerage.
 */

import type {
  DealType,
  PropertyData,
  PropertyFeatures,
  PropertyStatus,
  PropertyType,
} from "./property.types";
import { isValidStatusTransition } from "./property.rules";

// ---------------------------------------------------------------------------
// Valid status transitions
// ---------------------------------------------------------------------------

// Note: Transition rules are defined in property.rules.ts
// This duplicate definition is kept for backwards compatibility but should be removed

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------

export class Property {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly dealType: DealType;
  readonly propertyType: PropertyType;
  readonly price: string;
  readonly neighborhoodId: string;
  readonly address: string | null;
  readonly rooms: string | null;
  readonly area: string | null;
  readonly floor: number | null;
  readonly totalFloors: number | null;
  readonly status: PropertyStatus;
  readonly features: PropertyFeatures;
  readonly agentId: string;
  readonly projectId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: PropertyData) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.dealType = data.dealType;
    this.propertyType = data.propertyType;
    this.price = data.price;
    this.neighborhoodId = data.neighborhoodId;
    this.address = data.address;
    this.rooms = data.rooms;
    this.area = data.area;
    this.floor = data.floor;
    this.totalFloors = data.totalFloors;
    this.status = data.status;
    this.agentId = data.agentId;
    this.projectId = data.projectId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.features = {
      parking: data.parking,
      elevator: data.elevator,
      balcony: data.balcony,
      safeRoom: data.safeRoom,
      storage: data.storage,
      airConditioning: data.airConditioning,
      accessible: data.accessible,
      furnished: data.furnished,
    };
  }

  // ---------------------------------------------------------------------------
  // Status helpers
  // ---------------------------------------------------------------------------

  isDraft(): boolean {
    return this.status === "DRAFT";
  }

  isPublished(): boolean {
    return this.status === "PUBLISHED";
  }

  isArchived(): boolean {
    return this.status === "ARCHIVED";
  }

  isSoldOrRented(): boolean {
    return this.status === "SOLD" || this.status === "RENTED";
  }

  canTransitionTo(next: PropertyStatus): boolean {
    return isValidStatusTransition(this.status, next);
  }

  // ---------------------------------------------------------------------------
  // Publishability guard
  // ---------------------------------------------------------------------------

  /**
   * Returns an array of human-readable problems that prevent publishing.
   * An empty array means the property is ready to publish.
   */
  publishingBlockers(): string[] {
    const problems: string[] = [];

    if (!this.title.trim()) {
      problems.push("Title is required.");
    }

    if (!this.agentId) {
      problems.push("An agent must be assigned before publishing.");
    }

    if (!this.neighborhoodId) {
      problems.push("A neighborhood must be assigned before publishing.");
    }

    const price = parseFloat(this.price);
    if (isNaN(price) || price <= 0) {
      problems.push("A valid price is required before publishing.");
    }

    return problems;
  }

  isReadyToPublish(): boolean {
    return this.publishingBlockers().length === 0;
  }

  // ---------------------------------------------------------------------------
  // Plain data
  // ---------------------------------------------------------------------------

  toData(): PropertyData {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dealType: this.dealType,
      propertyType: this.propertyType,
      price: this.price,
      neighborhoodId: this.neighborhoodId,
      address: this.address,
      rooms: this.rooms,
      area: this.area,
      floor: this.floor,
      totalFloors: this.totalFloors,
      status: this.status,
      agentId: this.agentId,
      projectId: this.projectId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this.features,
    };
  }
}
