/**
 * Repository interface for the Testimonial aggregate.
 *
 * No Prisma imports. Infrastructure implements this contract.
 */

import type { PaginationMeta, PaginationParams } from "@/types";
import type {
  CreateTestimonialInput,
  TestimonialData,
  TestimonialFilters,
  UpdateTestimonialInput,
} from "./testimonial.types";

export interface TestimonialRepository {
  /** Find a testimonial by ID. Returns null if not found. */
  findById(id: string): Promise<TestimonialData | null>;

  /** List testimonials with optional filters and pagination. */
  findMany(
    filters: TestimonialFilters,
    pagination: PaginationParams
  ): Promise<{ data: TestimonialData[]; meta: PaginationMeta }>;

  /**
   * Return only APPROVED testimonials for public display.
   * The domain rule: only APPROVED testimonials may appear publicly.
   */
  findApproved(): Promise<TestimonialData[]>;

  /** Create a new testimonial (status defaults to PENDING). */
  create(input: CreateTestimonialInput): Promise<TestimonialData>;

  /** Update a testimonial's content, displayName, or status. */
  update(id: string, input: UpdateTestimonialInput): Promise<TestimonialData>;

  /** Count testimonials matching the given filters. */
  count(filters: TestimonialFilters): Promise<number>;

  /** Count testimonials with PENDING status — for admin dashboard. */
  countPending(): Promise<number>;
}
