import type { InquiryRepository } from "@/domain/inquiry/inquiry.repository";
import type { InquiryData, InquiryFilters } from "@/domain/inquiry/inquiry.types";
import type { PaginationMeta, PaginationParams } from "@/types";

export class ListInquiriesUseCase {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async execute(
    filters: InquiryFilters,
    pagination: PaginationParams
  ): Promise<{ data: InquiryData[]; meta: PaginationMeta }> {
    const page = Math.max(1, pagination.page);
    const pageSize = Math.min(100, Math.max(1, pagination.pageSize));
    return this.inquiryRepository.findMany(filters, { page, pageSize });
  }
}
