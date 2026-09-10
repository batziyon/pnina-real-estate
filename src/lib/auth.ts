/**
 * Auth.js v5 Configuration — Node.js Runtime
 *
 * This file runs in Node.js runtime and handles heavy authentication operations.
 * It imports database-dependent code (LoginUseCase, container, repositories).
 *
 * The Edge-safe configuration is in auth.config.ts.
 * This file extends that config with Credentials provider.
 *
 * Security:
 * - Credentials verification delegated to LoginUseCase
 * - Session contains only safe user data (id, email, name, role)
 * - passwordHash never in session
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials presence
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Lazy-load heavy dependencies (Prisma/container)
          // This is safe here because authorize() only runs in Node.js runtime
          const { LoginUseCase } = await import("@/application/auth/login.use-case");
          const { userRepository } = await import("@/lib/container");

          // Delegate authentication to application layer
          const loginUseCase = new LoginUseCase(userRepository);
          const user = await loginUseCase.execute({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          // Return safe user data for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          // Generic failure — do not expose error details
          console.error("Authentication failed:", error);
          return null;
        }
      },
    }),
  ],
});
