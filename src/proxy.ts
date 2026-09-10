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

  // Protect /admin routes (UI)
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      // Not authenticated — redirect to login
      const loginUrl = new URL("/admin/login", req.url);
      return Response.redirect(loginUrl);
    }

    // Authenticated — allow
  }

  // Protect /api/admin routes (API)
  if (pathname.startsWith("/api/admin")) {
    if (!req.auth) {
      // Not authenticated — return 401
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Authenticated — allow (route handler will check authorization)
  }

  // Public routes — allow
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
