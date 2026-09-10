/**
 * ValuationRequest domain entity.
 *
 * Encapsulates status transition rules.
 * No Prisma, no Next.js, no React.
 */

import type { ValuationRequestData, ValuationRequestStatus } from "./valuation.types";

const ALLOWED_TRANSITIONS: Record<ValuationRequestStatus, ValuationRequestStatus[]> = {
  NEW:         ["CONTACTED", "IN_PROGRESS", "CLOSED"],
  CONTACTED:   ["IN_PROGRESS", "CLOSED"],
  IN_PROGRESS: ["CONTACTED", "CLOSED"],
  CLOSED:      [],
};

export class ValuationRequest {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string | null;
  readonly neighborhoodId: string;
  readonly address: string | null;
  readonly propertyType: ValuationRequestData["propertyType"];
  readonly rooms: string | null;
  readonly area: string | null;
  readonly message: string | null;
  readonly status: ValuationRequestStatus;
  readonly notes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: ValuationRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.neighborhoodId = data.neighborhoodId;
    this.address = data.address;
    this.propertyType = data.propertyType;
    this.rooms = data.rooms;
    this.area = data.area;
    this.message = data.message;
    this.status = data.status;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isNew(): boolean {
    return this.status === "NEW";
  }

  isClosed(): boolean {
    return this.status === "CLOSED";
  }

  canTransitionTo(next: ValuationRequestStatus): boolean {
    return ALLOWED_TRANSITIONS[this.status].includes(next);
  }

  toData(): ValuationRequestData {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      neighborhoodId: this.neighborhoodId,
      address: this.address,
      propertyType: this.propertyType,
      rooms: this.rooms,
      area: this.area,
      message: this.message,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
