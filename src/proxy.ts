/**
 * Next.js 16 Proxy — Route Protection
 *
 * This is the lightweight edge-compatible proxy.
 * It imports ONLY the Edge-safe auth configuration.
 *
 * Authentication verification happens via Auth.js JWT validation only.
 * Heavy database operations remain in route handlers.
 *
 * DOES NOT import:
 * - Prisma
 * - container
 * - repositories
 * - database code
 * - LoginUseCase
 * - auth.ts (which has Credentials provider)
 */

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Create auth instance from Edge-safe config
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect /api/admin routes (API)
  // Return 401 JSON instead of redirecting
  if (pathname.startsWith("/api/admin")) {
    if (!req.auth) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Authenticated — allow (route handler will check authorization)
  }

  // All other routes are handled by authorized callback in auth.config.ts
  // - /admin/login: always allowed
  // - /admin/*: requires auth (NextAuth redirects if missing)
  // - public routes: allowed
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
