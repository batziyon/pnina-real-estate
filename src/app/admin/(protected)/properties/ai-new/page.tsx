/**
 * AI Property Creation Page
 *
 * Admin page for creating properties using AI extraction.
 *
 * Path: /admin/properties/ai-new
 *
 * Access: ADMIN and AGENT only
 */

import { requireAuth } from "@/lib/auth-helpers";
import { AIPropertyIntakeForm } from "@/components/admin/AIPropertyIntakeForm";

export const metadata = {
  title: "יצירת נכס באמצעות AI | ניהול נכסים",
  description: "חילוץ נתונים מתוך תיאור חופשי באמצעות בינה מלאכותית",
};

export default async function AIPropertyNewPage() {
  const user = await requireAuth();

  // Only ADMIN and AGENT can use AI extraction
  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("רק מנהלים וסוכנים מורשים להשתמש ביצירת נכס באמצעות AI");
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          יצירת נכס באמצעות AI
        </h1>
        <p className="text-gray-600">
          הדבק תיאור נכס חופשי והמערכת תחלץ את הנתונים המובנים באופן אוטומטי
        </p>
      </div>

      <AIPropertyIntakeForm />
    </div>
  );
}
