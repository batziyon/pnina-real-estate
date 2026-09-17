/**
 * Server-only Prisma client singleton.
 *
 * IMPORTANT: This file must NEVER be imported from a Client Component.
 * The "server-only" package enforces this at build time.
 *
 * Prisma 7 requires an explicit driver adapter. This project uses
 * @prisma/adapter-pg with the `pg` PostgreSQL client.
 *
 * In development, Next.js hot-reloads modules frequently, which would
 * exhaust the database connection pool if a new PrismaClient were created
 * on every reload. We cache the instance on globalThis in development only.
 */

import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function createPrismaClient(): PrismaClient {
  const connectionString = process.env["DATABASE_URL"];

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Add it to your .env file (never commit it)."
    );
  }

  // Use smaller connection pool in development to avoid exhaustion on hot-reloads.
  // In dev mode, Next.js frequently hot-reloads modules, and each reload can create
  // new connections. A smaller pool prevents accumulating connections across reloads.
  // Production uses the pg default (10 connections per instance).
  const poolConfig =
    process.env["NODE_ENV"] === "production"
      ? connectionString // Use string (default pool config)
      : { connectionString, max: 3 }; // Development: limit to 3

  const adapter = new PrismaPg(poolConfig);
  return new PrismaClient({ adapter });
}

// ---------------------------------------------------------------------------
// Singleton pattern — one instance per process.
// In development the instance survives hot-reloads via globalThis cache.
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}
