import type { PropertyRepository } from "@/domain/property/property.repository";
import type { PropertyData, PropertyFilters } from "@/domain/property/property.types";
import type { PaginationMeta, PaginationParams } from "@/types";

export class ListPropertiesUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(
    filters: PropertyFilters,
    pagination: PaginationParams
  ): Promise<{ data: PropertyData[]; meta: PaginationMeta }> {
    const page = Math.max(1, pagination.page);
    const pageSize = Math.min(100, Math.max(1, pagination.pageSize));
    return this.propertyRepository.findMany(filters, { page, pageSize });
  }
}
