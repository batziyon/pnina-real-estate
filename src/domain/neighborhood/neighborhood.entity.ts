/**
 * Neighborhood domain entity.
 *
 * Provides guards for publishability and active-state.
 * No Prisma, no Next.js, no React.
 */

import type { NeighborhoodData } from "./neighborhood.types";

export class Neighborhood {
  readonly id: string;
  readonly name: string;
  readonly active: boolean;
  readonly sortOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: NeighborhoodData) {
    this.id = data.id;
    this.name = data.name;
    this.active = data.active;
    this.sortOrder = data.sortOrder;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isActive(): boolean {
    return this.active;
  }

  /**
   * A neighborhood is assignable when it is active.
   * Inactive neighborhoods must not appear in property or project creation flows.
   */
  isAssignable(): boolean {
    return this.active;
  }

  toData(): NeighborhoodData {
    return {
      id: this.id,
      name: this.name,
      active: this.active,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
