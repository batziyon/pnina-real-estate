/**
 * Domain types for the User aggregate.
 *
 * Persistence-independent — no Prisma, no Next.js, no React.
 * passwordHash is intentionally omitted from the public-facing UserData type.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type UserRole = "ADMIN" | "AGENT" | "EDITOR";

// ---------------------------------------------------------------------------
// Core user data shape (safe for application layer — no hash exposed)
// ---------------------------------------------------------------------------

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Internal representation that includes the password hash.
 * Only used inside the authentication use case and infrastructure layer.
 * Never returned to the presentation layer.
 */
export interface UserWithCredentials extends UserData {
  passwordHash: string | null;
}

// ---------------------------------------------------------------------------
// Input types for use cases
// ---------------------------------------------------------------------------

export type CreateUserInput = {
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  passwordHash?: string;
};

export type UpdateUserInput = Partial<{
  name: string;
  phone: string;
  role: UserRole;
  active: boolean;
}>;

// ---------------------------------------------------------------------------
// Filter / query types
// ---------------------------------------------------------------------------

export interface UserFilters {
  role?: UserRole;
  active?: boolean;
}
