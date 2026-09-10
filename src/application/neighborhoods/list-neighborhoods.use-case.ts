import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { NeighborhoodData } from "@/domain/neighborhood/neighborhood.types";

export class ListNeighborhoodsUseCase {
  constructor(private readonly neighborhoodRepository: NeighborhoodRepository) {}

  /** Returns all neighborhoods — for admin management views. */
  async execute(): Promise<NeighborhoodData[]> {
    return this.neighborhoodRepository.findAll();
  }

  /** Returns only active neighborhoods — for public dropdowns and forms. */
  async executeActive(): Promise<NeighborhoodData[]> {
    return this.neighborhoodRepository.findAllActive();
  }
}
