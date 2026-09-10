/**
 * Testimonial domain entity.
 *
 * Encapsulates the publishability rule:
 *   A testimonial is publicly publishable ONLY when status = APPROVED.
 *
 * No Prisma, no Next.js, no React.
 */

import type { TestimonialData, TestimonialStatus } from "./testimonial.types";

export class Testimonial {
  readonly id: string;
  readonly name: string;
  readonly displayName: string | null;
  readonly content: string;
  readonly status: TestimonialStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: TestimonialData) {
    this.id = data.id;
    this.name = data.name;
    this.displayName = data.displayName;
    this.content = data.content;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * A testimonial is publicly publishable ONLY when its status is APPROVED.
   * PENDING and REJECTED testimonials must never appear on the public website.
   */
  isPubliclyPublishable(): boolean {
    return this.status === "APPROVED";
  }

  isPending(): boolean {
    return this.status === "PENDING";
  }

  isApproved(): boolean {
    return this.status === "APPROVED";
  }

  isRejected(): boolean {
    return this.status === "REJECTED";
  }

  /** The name to show publicly — displayName if set, otherwise name. */
  publicName(): string {
    return this.displayName ?? this.name;
  }

  toData(): TestimonialData {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      content: this.content,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
