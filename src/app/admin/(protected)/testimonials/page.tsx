/**
 * Admin Testimonials List — Hebrew RTL
 */

import { requireRole } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { TestimonialActions } from "@/components/admin/TestimonialActions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}

export default async function TestimonialsListPage({ searchParams }: PageProps) {
  // ADMIN only
  try {
    await requireRole("ADMIN");
  } catch {
    redirect("/admin");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const status = params.status || undefined;

  // Fetch testimonials via API since we need the admin-specific use case
  const apiUrl = new URL("/api/admin/testimonials", process.env.NEXTAUTH_URL || "http://localhost:3000");
  apiUrl.searchParams.set("page", page.toString());
  apiUrl.searchParams.set("pageSize", "20");
  if (status) {
    apiUrl.searchParams.set("status", status);
  }

  const response = await fetch(apiUrl.toString(), {
    headers: {
      cookie: "", // cookies will be passed automatically in server components
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch testimonials");
  }

  const result = await response.json();

  type TestimonialFromAPI = {
    id: string;
    name: string;
    displayName: string | null;
    content: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">המלצות</h1>
        <p className="text-gray-600 mt-1">ניהול המלצות לקוחות</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form method="get" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סטטוס
            </label>
            <select
              name="status"
              defaultValue={status || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">הכל</option>
              <option value="PENDING">ממתין לאישור</option>
              <option value="APPROVED">מאושר</option>
              <option value="REJECTED">נדחה</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              סנן
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {result.data.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">לא נמצאו המלצות</p>
          </div>
        ) : (
          result.data.map((testimonial: TestimonialFromAPI) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {testimonial.displayName || testimonial.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        testimonial.status
                      )}`}
                    >
                      {getStatusLabel(testimonial.status)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{testimonial.content}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(testimonial.createdAt).toLocaleDateString("he-IL")}
                  </p>
                </div>

                <TestimonialActions
                  testimonialId={testimonial.id}
                  status={testimonial.status}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {result.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}${status ? `&status=${status}` : ""}`}
              className={`px-4 py-2 rounded-lg ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "ממתין לאישור",
    APPROVED: "מאושר",
    REJECTED: "נדחה",
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
