/**
 * Repository interface for the Inquiry aggregate.
 *
 * Defines the persistence contract. Infrastructure implements this.
 * No Prisma imports here.
 */

import type { PaginationMeta, PaginationParams } from "@/types";
import type {
  CreateInquiryInput,
  InquiryData,
  InquiryFilters,
  UpdateInquiryInput,
} from "./inquiry.types";

export interface InquiryRepository {
  /** Find a single inquiry by ID. Returns null if not found. */
  findById(id: string): Promise<InquiryData | null>;

  /** List inquiries with optional filters and pagination. */
  findMany(
    filters: InquiryFilters,
    pagination: PaginationParams
  ): Promise<{ data: InquiryData[]; meta: PaginationMeta }>;

  /** Create a new inquiry. propertyId is optional — only PROPERTY_INTEREST requires it. */
  create(input: CreateInquiryInput): Promise<InquiryData>;

  /** Update an inquiry's status, notes, or assigned agent. */
  update(id: string, input: UpdateInquiryInput): Promise<InquiryData>;

  /** Assign an inquiry to a specific agent. */
  assign(id: string, agentId: string): Promise<InquiryData>;

  /** Count inquiries matching the given filters. */
  count(filters: InquiryFilters): Promise<number>;

  /** Count new (unread) inquiries — used for the admin dashboard badge. */
  countNew(): Promise<number>;
}
