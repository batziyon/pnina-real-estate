/**
 * Domain types for the Testimonial aggregate.
 *
 * No Prisma, no Next.js, no React.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type TestimonialStatus = "PENDING" | "APPROVED" | "REJECTED";

// ---------------------------------------------------------------------------
// Core data shape
// ---------------------------------------------------------------------------

export interface TestimonialData {
  id: string;
  name: string;
  displayName: string | null;
  content: string;
  status: TestimonialStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export type CreateTestimonialInput = {
  name: string;
  displayName?: string;
  content: string;
};

export type UpdateTestimonialInput = Partial<{
  displayName: string;
  content: string;
  status: TestimonialStatus;
}>;

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface TestimonialFilters {
  status?: TestimonialStatus;
}
