/**
 * Server-side Authentication Helpers
 *
 * Adapts Auth.js session into application-friendly types.
 * These helpers bridge the presentation and application layers.
 *
 * IMPORTANT: These are server-side only.
 */

import "server-only";

import { auth } from "@/lib/auth";
import type { UserRole } from "@/domain/user/user.types";
import { UnauthorizedError } from "@/application/errors";

/**
 * Authenticated user shape for application layer.
 * Does NOT include passwordHash or other sensitive fields.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Returns the current session or null.
 * Use in routes that may be public or authenticated.
 */
export async function getSession() {
  return await auth();
}

/**
 * Returns the authenticated user or throws UnauthorizedError.
 * Use at the start of protected routes.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth();

  if (!session || !session.user) {
    throw new UnauthorizedError("You must be logged in to access this resource.");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

/**
 * Returns the authenticated user if they have the required role, else throws.
 * Use for role-gated operations.
 */
export async function requireRole(role: UserRole): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  if (user.role !== role) {
    throw new UnauthorizedError(`This operation requires ${role} role.`);
  }

  return user;
}

/**
 * Returns the authenticated user if they have at least the permission level.
 * Role hierarchy: ADMIN > EDITOR > AGENT
 *
 * Example: requireMinRole("EDITOR") allows EDITOR and ADMIN.
 */
export async function requireMinRole(minRole: UserRole): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  const hierarchy: Record<UserRole, number> = {
    ADMIN: 3,
    EDITOR: 2,
    AGENT: 1,
  };

  if (hierarchy[user.role] < hierarchy[minRole]) {
    throw new UnauthorizedError(
      `This operation requires at least ${minRole} role.`
    );
  }

  return user;
}
