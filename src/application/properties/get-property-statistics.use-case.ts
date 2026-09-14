/**
 * Get Property Statistics Use Case
 *
 * Returns aggregated statistics about properties.
 * Used for dashboard display.
 */

import type { PropertyRepository } from "@/domain/property/property.repository";

export interface PropertyStatistics {
  total: number;
  published: number;
  sold: number;
  rented: number;
}

export class GetPropertyStatisticsUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(): Promise<PropertyStatistics> {
    const [total, published, sold, rented] = await Promise.all([
      this.propertyRepository.count({}),
      this.propertyRepository.count({ status: "PUBLISHED" }),
      this.propertyRepository.count({ status: "SOLD" }),
      this.propertyRepository.count({ status: "RENTED" }),
    ]);

    return {
      total,
      published,
      sold,
      rented,
    };
  }
}
