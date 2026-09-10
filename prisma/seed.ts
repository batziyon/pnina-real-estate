/**
 * Prisma Seed — Initial Data
 *
 * Seeds:
 * 1. Jerusalem neighborhoods (reference data)
 * 2. Bootstrap admin user (if environment variables provided)
 *
 * Idempotent: uses upsert on unique fields.
 * Running this script multiple times will not create duplicates.
 */

import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Jerusalem neighborhoods — sortOrder controls admin UI display order.
// ---------------------------------------------------------------------------

const neighborhoods: { name: string; sortOrder: number }[] = [
  // Central / prestigious
  { name: "רחביה",              sortOrder: 10 },
  { name: "טלביה",              sortOrder: 20 },
  { name: "מרכז העיר",          sortOrder: 30 },
  { name: "נחלאות",             sortOrder: 40 },
  { name: "ניות",               sortOrder: 50 },

  // South / German Colony area
  { name: "בקעה",               sortOrder: 60 },
  { name: "המושבה הגרמנית",     sortOrder: 70 },
  { name: "המושבה האמריקאית",   sortOrder: 80 },
  { name: "קטמון",              sortOrder: 90 },
  { name: "קטמון הישנה",        sortOrder: 100 },
  { name: "ארנונה",             sortOrder: 110 },
  { name: "תלפיות",             sortOrder: 120 },

  // West
  { name: "בית הכרם",           sortOrder: 130 },
  { name: "רמת שרת",            sortOrder: 140 },
  { name: "עין כרם",            sortOrder: 150 },

  // North / North-East
  { name: "רמות",               sortOrder: 160 },
  { name: "פסגת זאב",           sortOrder: 170 },
  { name: "גבעת משואה",         sortOrder: 180 },

  // South / periphery
  { name: "גילה",               sortOrder: 190 },
  { name: "הר חומה",            sortOrder: 200 },
];

async function main() {
  console.log("=== Seeding Database ===\n");

  // 1. Seed neighborhoods
  console.log(`Seeding ${neighborhoods.length} Jerusalem neighborhoods...`);

  for (const n of neighborhoods) {
    await prisma.neighborhood.upsert({
      where:  { name: n.name },
      update: { sortOrder: n.sortOrder },   // keep sortOrder in sync on re-runs
      create: { name: n.name, sortOrder: n.sortOrder, active: true },
    });
  }

  console.log(`✓ ${neighborhoods.length} neighborhoods upserted.\n`);

  // 2. Bootstrap admin user
  await seedAdminUser();

  console.log("\n=== Seeding Complete ===");
}

/**
 * Bootstrap admin user from environment variables.
 *
 * Reads BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD.
 * If missing, skips admin creation (safe for CI/CD).
 * If present, creates or updates the admin user idempotently.
 */
async function seedAdminUser() {
  const email = process.env["BOOTSTRAP_ADMIN_EMAIL"];
  const password = process.env["BOOTSTRAP_ADMIN_PASSWORD"];

  if (!email || !password) {
    console.warn("⚠ BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD not set.");
    console.warn("  Skipping admin user seed.");
    return;
  }

  console.log("Seeding admin user...");

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Upsert admin user
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      // Update password hash and ensure active/admin on re-runs
      passwordHash,
      active: true,
      role: "ADMIN",
    },
    create: {
      email,
      name: "System Admin",
      role: "ADMIN",
      active: true,
      passwordHash,
      phone: null,
    },
  });

  console.log(`✓ Admin user seeded/updated: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
