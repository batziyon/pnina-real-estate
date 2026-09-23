/**
 * Create New Testimonial — Admin
 * 
 * Allows admin to manually add testimonials
 */

import { requireRole } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export const dynamic = "force-dynamic";

export default async function NewTestimonialPage() {
  // ADMIN only
  try {
    await requireRole("ADMIN");
  } catch {
    redirect("/admin");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">הוסף המלצה חדשה</h1>
        <p className="text-gray-600 mt-1">הוסף המלצת לקוח ידנית</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TestimonialForm mode="create" />
      </div>
    </div>
  );
}
