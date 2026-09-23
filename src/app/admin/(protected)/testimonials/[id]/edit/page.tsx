/**
 * Admin Edit Testimonial Page
 */

import { requireRole } from "@/lib/auth-helpers";
import { getCookieHeader } from "@/lib/server-fetch-helpers";
import { redirect, notFound } from "next/navigation";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTestimonialPage({ params }: PageProps) {
  // ADMIN only
  try {
    await requireRole("ADMIN");
  } catch {
    redirect("/admin");
  }

  const { id } = await params;

  // Fetch testimonial details
  const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/testimonials/${id}`;

  let testimonial: {
    id: string;
    name: string;
    displayName: string | null;
    content: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };

  try {
    const cookieHeader = await getCookieHeader();

    const response = await fetch(apiUrl, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      notFound();
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch testimonial (${response.status})`);
    }

    testimonial = await response.json();
  } catch (err) {
    console.error("Failed to fetch testimonial:", err);
    throw err;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">עריכת המלצה</h1>
        <p className="text-gray-600 mt-1">
          עדכן את פרטי ההמלצה של {testimonial.displayName || testimonial.name}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TestimonialForm mode="edit" testimonial={testimonial} />
      </div>
    </div>
  );
}
