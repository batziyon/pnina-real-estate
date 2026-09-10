/**
 * Domain types for the Neighborhood aggregate.
 *
 * Neighborhoods are Jerusalem's geographic lookup table.
 * They are the only geographic entity in this brokerage system.
 * No Prisma, no Next.js, no React.
 */

export interface NeighborhoodData {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateNeighborhoodInput = {
  name: string;
  active?: boolean;
  sortOrder?: number;
};

export type UpdateNeighborhoodInput = Partial<{
  name: string;
  active: boolean;
  sortOrder: number;
}>;
