/**
 * Admin Valuation Requests List — Hebrew RTL
 */

import { requireAuth } from "@/lib/auth-helpers";
import { useCases } from "@/lib/container";
import { ValuationsTable } from "@/components/admin/ValuationsTable";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    neighborhoodId?: string;
  }>;
}

export default async function ValuationRequestsListPage({ searchParams }: PageProps) {
  await requireAuth();
  const params = await searchParams;

  const page = parseInt(params.page || "1", 10);
  const status = params.status || undefined;
  const neighborhoodId = params.neighborhoodId || undefined;

  const [result, neighborhoods] = await Promise.all([
    useCases.valuations.list.execute(
      {
        status: status as "NEW" | "CONTACTED" | "IN_PROGRESS" | "CLOSED" | undefined,
        neighborhoodId,
      },
      { page, pageSize: 20 }
    ),
    useCases.neighborhoods.list.execute(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">בקשות הערכת שווי</h1>
        <p className="text-gray-600 mt-1">ניהול בקשות הערכת שווי</p>
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

          {/* Neighborhood Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שכונה
            </label>
            <select
              name="neighborhoodId"
              defaultValue={neighborhoodId || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">הכל</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
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

      {/* Results Table */}
      <ValuationsTable valuations={result.data} neighborhoods={neighborhoods} />

      {/* Pagination */}
      {result.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}${status ? `&status=${status}` : ""}${
                neighborhoodId ? `&neighborhoodId=${neighborhoodId}` : ""
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
