/**
 * Inquiry domain entity.
 *
 * Encapsulates status transition rules for an inquiry.
 * No Prisma, no Next.js, no React.
 */

import type { InquiryData, InquiryStatus, InquiryType } from "./inquiry.types";

const ALLOWED_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  NEW:         ["CONTACTED", "IN_PROGRESS", "CLOSED"],
  CONTACTED:   ["IN_PROGRESS", "CLOSED"],
  IN_PROGRESS: ["CONTACTED", "CLOSED"],
  CLOSED:      [],
};

export class Inquiry {
  readonly id: string;
  readonly propertyId: string | null;
  readonly agentId: string | null;
  readonly name: string;
  readonly phone: string;
  readonly email: string | null;
  readonly message: string | null;
  readonly type: InquiryType;
  readonly status: InquiryStatus;
  readonly notes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: InquiryData) {
    this.id = data.id;
    this.propertyId = data.propertyId;
    this.agentId = data.agentId;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.message = data.message;
    this.type = data.type;
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

  isAssigned(): boolean {
    return this.agentId !== null;
  }

  isPropertyInterest(): boolean {
    return this.type === "PROPERTY_INTEREST";
  }

  isValuationRequest(): boolean {
    return this.type === "VALUATION_REQUEST";
  }

  canTransitionTo(next: InquiryStatus): boolean {
    return ALLOWED_TRANSITIONS[this.status].includes(next);
  }

  toData(): InquiryData {
    return {
      id: this.id,
      propertyId: this.propertyId,
      agentId: this.agentId,
      name: this.name,
      phone: this.phone,
      email: this.email,
      message: this.message,
      type: this.type,
      status: this.status,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
