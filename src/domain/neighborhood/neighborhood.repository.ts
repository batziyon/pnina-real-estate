/**
 * Repository interface for the Neighborhood aggregate.
 *
 * No Prisma imports. Infrastructure implements this contract.
 */

import type {
  CreateNeighborhoodInput,
  NeighborhoodData,
  UpdateNeighborhoodInput,
} from "./neighborhood.types";

export interface NeighborhoodRepository {
  /** Find a neighborhood by ID. Returns null if not found. */
  findById(id: string): Promise<NeighborhoodData | null>;

  /** Find a neighborhood by its unique name. Returns null if not found. */
  findByName(name: string): Promise<NeighborhoodData | null>;

  /** Return all neighborhoods ordered by sortOrder ascending. */
  findAll(): Promise<NeighborhoodData[]>;

  /** Return only active neighborhoods — used in property/project creation dropdowns. */
  findAllActive(): Promise<NeighborhoodData[]>;

  /** Create a new neighborhood. */
  create(input: CreateNeighborhoodInput): Promise<NeighborhoodData>;

  /** Update a neighborhood. */
  update(id: string, input: UpdateNeighborhoodInput): Promise<NeighborhoodData>;

  /** Deactivate a neighborhood (sets active = false). */
  deactivate(id: string): Promise<NeighborhoodData>;
}
