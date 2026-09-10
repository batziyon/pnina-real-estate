import type { ValuationRequestRepository } from "@/domain/valuation/valuation.repository";
import type { ValuationRequestData, ValuationRequestFilters } from "@/domain/valuation/valuation.types";
import type { PaginationMeta, PaginationParams } from "@/types";

export class ListValuationRequestsUseCase {
  constructor(private readonly valuationRepository: ValuationRequestRepository) {}

  async execute(
    filters: ValuationRequestFilters,
    pagination: PaginationParams
  ): Promise<{ data: ValuationRequestData[]; meta: PaginationMeta }> {
    const page = Math.max(1, pagination.page);
    const pageSize = Math.min(100, Math.max(1, pagination.pageSize));
    return this.valuationRepository.findMany(filters, { page, pageSize });
  }
}
