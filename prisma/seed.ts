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
import { PrismaClient, TestimonialStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Jerusalem neighborhoods — sortOrder controls admin UI display order.
// Complete list of Jerusalem neighborhoods (alphabetical in Hebrew).
// ---------------------------------------------------------------------------

const neighborhoods: { name: string; sortOrder: number }[] = [
  { name: "אבו תור",                          sortOrder: 10 },
  { name: "בית הכרם",                         sortOrder: 20 },
  { name: "בית וגן",                          sortOrder: 30 },
  { name: "בית חנינא",                        sortOrder: 40 },
  { name: "בית צפאפא",                        sortOrder: 50 },
  { name: "בקעה",                             sortOrder: 60 },
  { name: "ג'אבל מוכבר",                      sortOrder: 70 },
  { name: "גבעת מרדכי",                       sortOrder: 80 },
  { name: "גבעת משואה",                       sortOrder: 90 },
  { name: "גבעת שאול",                        sortOrder: 100 },
  { name: "גוננים - קטמונים",                sortOrder: 110 },
  { name: "גילה",                             sortOrder: 120 },
  { name: "הבוכרים – בית ישראל",             sortOrder: 130 },
  { name: "הגבעה הצרפתית",                    sortOrder: 140 },
  { name: "המושבה האמריקאית",                 sortOrder: 150 },
  { name: "המושבה הגרמנית",                   sortOrder: 160 },
  { name: "הר חומה",                          sortOrder: 170 },
  { name: "הר נוף",                           sortOrder: 180 },
  { name: "הרובע היהודי",                     sortOrder: 190 },
  { name: "הרובע המוסלמי",                    sortOrder: 200 },
  { name: "ואדי ג'וז",                        sortOrder: 210 },
  { name: "טלביה – קוממיות",                  sortOrder: 220 },
  { name: "ימין משה",                         sortOrder: 230 },
  { name: "מאה שערים",                        sortOrder: 240 },
  { name: "מוסררה - מורשה",                   sortOrder: 250 },
  { name: "מלחה",                             sortOrder: 260 },
  { name: "ממילא",                            sortOrder: 270 },
  { name: "מעלות דפנה",                       sortOrder: 280 },
  { name: "מרכז העיר",                        sortOrder: 290 },
  { name: "נווה יעקב",                        sortOrder: 300 },
  { name: "נחלאות - לב העיר",                 sortOrder: 310 },
  { name: "ניות",                             sortOrder: 320 },
  { name: "סילואן",                           sortOrder: 330 },
  { name: "סנהדריה",                          sortOrder: 340 },
  { name: "עין כרם",                          sortOrder: 350 },
  { name: "עיסוויה",                          sortOrder: 360 },
  { name: "עיר גנים",                         sortOrder: 370 },
  { name: "פסגת זאב",                         sortOrder: 380 },
  { name: "פת",                               sortOrder: 390 },
  { name: "צור באחר – אום טובה",              sortOrder: 400 },
  { name: "קטמון",                            sortOrder: 410 },
  { name: "קריית יובל",                       sortOrder: 420 },
  { name: "קריית מנחם",                       sortOrder: 430 },
  { name: "קריית משה",                        sortOrder: 440 },
  { name: "ראס אל עמוד",                      sortOrder: 450 },
  { name: "רוממה",                            sortOrder: 460 },
  { name: "רחביה",                            sortOrder: 470 },
  { name: "רמות",                             sortOrder: 480 },
  { name: "רמת אשכול",                        sortOrder: 490 },
  { name: "רמת שלמה",                         sortOrder: 500 },
  { name: "רמת שרת ורמת דניה",                sortOrder: 510 },
  { name: "רסקו - גבעת הורדים",               sortOrder: 520 },
  { name: "שועפט",                            sortOrder: 530 },
  { name: "שיח ג'ראח",                        sortOrder: 540 },
  { name: "שמואל הנביא",                      sortOrder: 550 },
  { name: "תלפיות – ארנונה",                  sortOrder: 560 },
  { name: "תלפיות מזרח - ארמון הנציב",        sortOrder: 570 },
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

  // 3. Seed demo testimonials (for development)
  await seedDemoTestimonials();

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

/**
 * Seed demo testimonials (marked for easy removal).
 *
 * Creates 3-4 realistic Hebrew testimonials with status APPROVED.
 * Clearly marked as development/demo data.
 */
async function seedDemoTestimonials() {
  console.log("Seeding demo testimonials...");

  const demoTestimonials = [
    {
      id: "demo-testimonial-1",
      name: "משפחת כהן",
      displayName: "משפחת כהן - רחביה",
      content: "פנינה ליוותה אותנו בקנייה של דירה ברחביה. השירות היה מקצועי, היא ידעה בדיוק מה אנחנו מחפשים וחסכה לנו המון זמן. ממליצים בחום!",
      status: TestimonialStatus.APPROVED,
      createdAt: new Date("2026-01-15"),
    },
    {
      id: "demo-testimonial-2",
      name: "דוד ושרה לוי",
      displayName: "דוד ושרה לוי - קטמון",
      content: "רכשנו דירה בקטמון דרך פנינה. היא הייתה מאוד סבלנית, הסבירה כל פרט והייתה זמינה לכל שאלה. תודה על השירות המצוין!",
      status: TestimonialStatus.APPROVED,
      createdAt: new Date("2026-02-20"),
    },
    {
      id: "demo-testimonial-3",
      name: "אברהם מנדלבאום",
      displayName: "אברהם מנדלבאום - מרכז העיר",
      content: "מכרתי דירה במרכז העיר בעזרת פנינה. התהליך היה מהיר וחלק, והיא דאגה לכל הפרטים הקטנים. שירות אמין ואיכותי.",
      status: TestimonialStatus.APPROVED,
      createdAt: new Date("2026-03-10"),
    },
    {
      id: "demo-testimonial-4",
      name: "משפחת גולדשטיין",
      displayName: "משפחת גולדשטיין - גבעת שאול",
      content: "חיפשנו דירה בגבעת שאול למעלה משנה. פנינה הבינה בדיוק מה אנחנו צריכים ומצאה לנו את הדירה המושלמת. אנחנו מאוד מרוצים!",
      status: TestimonialStatus.APPROVED,
      createdAt: new Date("2026-04-05"),
    },
  ];

  for (const t of demoTestimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        displayName: t.displayName,
        content: t.content,
        status: t.status,
      },
      create: t,
    });
  }

  console.log(`✓ ${demoTestimonials.length} demo testimonials upserted (DEMO DATA - easy to remove).\n`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
