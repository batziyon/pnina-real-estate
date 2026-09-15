/**
 * Admin Inquiries List — Hebrew RTL
 */

import { useCases } from "@/lib/container";
import { requireAuth } from "@/lib/auth-helpers";
import { InquiriesTable } from "@/components/admin/InquiriesTable";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    type?: string;
  }>;
}

export default async function InquiriesListPage({ searchParams }: PageProps) {
  await requireAuth();
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const status = params.status || undefined;
  const type = params.type || undefined;

  const result = await useCases.inquiries.list.execute(
    {
      status: status as "NEW" | "CONTACTED" | "IN_PROGRESS" | "CLOSED" | undefined,
      type: type as "PROPERTY_INTEREST" | "VALUATION_REQUEST" | "COOPERATION" | "GENERAL_CONTACT" | undefined,
    },
    { page, pageSize: 20 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">פניות</h1>
        <p className="text-gray-600 mt-1">ניהול פניות לקוחות</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form method="get" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
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
              <option value="NEW">חדש</option>
              <option value="CONTACTED">נוצר קשר</option>
              <option value="IN_PROGRESS">בטיפול</option>
              <option value="CLOSED">סגור</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג פנייה
            </label>
            <select
              name="type"
              defaultValue={type || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">הכל</option>
              <option value="PROPERTY_INTEREST">עניין בנכס</option>
              <option value="VALUATION_REQUEST">בקשת הערכת שווי</option>
              <option value="COOPERATION">שיתוף פעולה</option>
              <option value="GENERAL_CONTACT">יצירת קשר כללית</option>
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

      {/* Inquiries Table */}
      <InquiriesTable inquiries={result.data} />

      {/* Pagination */}
      {result.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}${status ? `&status=${status}` : ""}${
                type ? `&type=${type}` : ""
              }`}
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
