/**
 * Auth.js Configuration — Edge-Safe
 *
 * This file contains ONLY Edge-compatible Auth.js configuration.
 * It is imported by proxy.ts (Edge Runtime) and auth.ts (Node Runtime).
 *
 * MUST NOT import:
 * - Prisma
 * - @prisma/client
 * - container
 * - repositories
 * - application use cases
 * - database code
 * - Node-only libraries
 *
 * Session strategy: JWT (stateless, no database)
 * Callbacks: Pure session/token manipulation (no database queries)
 */

import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/domain/user/user.types";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, add user data to JWT
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      // Make user data available in session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login", // Custom login page (Phase 9)
  },

  // Providers are added in auth.ts (Node.js runtime only)
  providers: [],
};
