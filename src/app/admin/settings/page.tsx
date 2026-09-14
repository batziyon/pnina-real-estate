/**
 * Admin Settings Page — Hebrew RTL
 *
 * Placeholder for future settings functionality.
 */

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";

export default async function SettingsPage() {
  // Server-side authorization - ADMIN only
  try {
    await requireRole("ADMIN");
  } catch {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">הגדרות</h1>
        <p className="text-gray-600 mt-1">הגדרות כלליות של המערכת</p>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">
          דף הגדרות בבנייה
        </p>
        <p className="text-gray-400 text-sm mt-2">
          כאן יופיעו הגדרות כלליות של המערכת בעתיד
        </p>
      </div>
    </div>
  );
}
