/**
 * AI Contact Creation Page
 *
 * Admin page for creating contacts using AI extraction.
 */

import { requireAuth } from "@/lib/auth-helpers";
import { AIContactIntakeForm } from "@/components/admin/AIContactIntakeForm";

export const metadata = {
  title: "יצירת איש קשר באמצעות AI | CRM",
  description: "חילוץ נתוני איש קשר מתוך טקסט חופשי",
};

export default async function AIContactNewPage() {
  const user = await requireAuth();

  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new Error("רק מנהלים וסוכנים מורשים");
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          יצירת איש קשר באמצעות AI
        </h1>
        <p className="text-gray-600">
          הדבק מידע על איש קשר והמערכת תחלץ את הנתונים באופן אוטומטי
        </p>
      </div>

      <AIContactIntakeForm />
    </div>
  );
}
