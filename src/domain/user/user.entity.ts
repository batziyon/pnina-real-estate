/**
 * User domain entity.
 *
 * Encapsulates role and active-state guards.
 * passwordHash is never exposed — only UserData (safe) is carried here.
 * No Prisma, no Next.js, no React.
 */

import type { UserData, UserRole } from "./user.types";

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly role: UserRole;
  readonly active: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(data: UserData) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.role = data.role;
    this.active = data.active;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // ---------------------------------------------------------------------------
  // Role guards
  // ---------------------------------------------------------------------------

  isAdmin(): boolean {
    return this.role === "ADMIN";
  }

  isAgent(): boolean {
    return this.role === "AGENT";
  }

  isEditor(): boolean {
    return this.role === "EDITOR";
  }

  /** True when the user has at least the permission level of the given role. */
  hasRole(role: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
      ADMIN: 3,
      EDITOR: 2,
      AGENT: 1,
    };
    return hierarchy[this.role] >= hierarchy[role];
  }

  isActive(): boolean {
    return this.active;
  }

  /**
   * Returns true when the user is allowed to act — active and not deactivated.
   */
  canAct(): boolean {
    return this.active;
  }

  toData(): UserData {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
