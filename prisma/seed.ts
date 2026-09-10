/**
 * Prisma Seed — Initial Jerusalem Neighborhoods
 *
 * Idempotent: uses upsert on the unique `name` field.
 * Running this script multiple times will not create duplicates.
 *
 * Only seeds non-sensitive reference data (neighborhoods).
 * No fake users, properties, customers, or personal data.
 */

import "dotenv/config";
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
  console.log(`Seeding ${neighborhoods.length} Jerusalem neighborhoods...`);

  for (const n of neighborhoods) {
    await prisma.neighborhood.upsert({
      where:  { name: n.name },
      update: { sortOrder: n.sortOrder },   // keep sortOrder in sync on re-runs
      create: { name: n.name, sortOrder: n.sortOrder, active: true },
    });
  }

  console.log(`Done. ${neighborhoods.length} neighborhoods upserted.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
