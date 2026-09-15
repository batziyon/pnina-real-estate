/**
 * Admin Properties List — Hebrew RTL
 *
 * Server Component with filters and pagination.
 */

import Link from "next/link";
import { useCases } from "@/lib/container";
import { requireAuth } from "@/lib/auth-helpers";
import type { PropertyFilters } from "@/domain/property/property.types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    dealType?: string;
    propertyType?: string;
    neighborhoodId?: string;
    agentId?: string;
  }>;
}

export default async function PropertiesListPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;

  // Parse query params
  const page = parseInt(params.page || "1", 10);
  const search = params.search || undefined;
  const status = params.status as PropertyFilters["status"] | undefined;
  const dealType = params.dealType as PropertyFilters["dealType"] | undefined;
  const propertyType = params.propertyType as PropertyFilters["propertyType"] | undefined;
  const neighborhoodId = params.neighborhoodId || undefined;
  const agentId = params.agentId || undefined;

  // Build filters with role-based access
  const filters: PropertyFilters = {
    ...(search && { search }),
    ...(status && { status }),
    ...(dealType && { dealType }),
    ...(propertyType && { propertyType }),
    ...(neighborhoodId && { neighborhoodId }),
  };

  // AGENT can only see their own properties
  if (user.role === "AGENT") {
    filters.agentId = user.id;
  } else if (agentId) {
    // ADMIN/EDITOR can filter by agent
    filters.agentId = agentId;
  }

  // Fetch properties
  const result = await useCases.properties.list.execute(filters, {
    page,
    pageSize: 20,
  });

  // Fetch neighborhoods for filter
  const neighborhoods = await useCases.neighborhoods.list.execute();

  // Fetch agents for ADMIN/EDITOR filter
  const agentsResult =
    user.role === "ADMIN" || user.role === "EDITOR"
      ? await useCases.users.list.execute({ role: "AGENT" }, { page: 1, pageSize: 100 })
      : { data: [] };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">נכסים</h1>
          <p className="text-gray-600 mt-1">ניהול נכסים במערכת</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + הוסף נכס חדש
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form method="get" className="space-y-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              חיפוש
            </label>
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="חפש לפי כותרת, תיאור או כתובת..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סטטוס
              </label>
              <select
                name="status"
                defaultValue={status || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">הכל</option>
                <option value="DRAFT">טיוטה</option>
                <option value="PUBLISHED">מפורסם</option>
                <option value="RESERVED">שמור</option>
                <option value="SOLD">נמכר</option>
                <option value="RENTED">הושכר</option>
                <option value="ARCHIVED">בארכיון</option>
              </select>
            </div>

            {/* Deal Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג עסקה
              </label>
              <select
                name="dealType"
                defaultValue={dealType || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">הכל</option>
                <option value="SALE">מכירה</option>
                <option value="RENT">השכרה</option>
              </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג נכס
              </label>
              <select
                name="propertyType"
                defaultValue={propertyType || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">הכל</option>
                <option value="APARTMENT">דירה</option>
                <option value="PENTHOUSE">פנטהאוז</option>
                <option value="HOUSE">בית</option>
                <option value="VILLA">וילה</option>
                <option value="DUPLEX">דופלקס</option>
                <option value="STUDIO">סטודיו</option>
                <option value="OFFICE">משרד</option>
                <option value="COMMERCIAL">מסחרי</option>
                <option value="LAND">קרקע</option>
                <option value="OTHER">אחר</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">הכל</option>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Agent Filter (ADMIN/EDITOR only) */}
            {(user.role === "ADMIN" || user.role === "EDITOR") && agentsResult.data.length > 0 && (
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סוכן
                </label>
                <select
                  name="agentId"
                  defaultValue={agentId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">כל הסוכנים</option>
                  {agentsResult.data.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              סנן
            </button>
          </div>
        </form>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {result.data.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">לא נמצאו נכסים</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  כותרת
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סוג עסקה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מחיר
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.data.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {property.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {property.dealType === "SALE" ? "מכירה" : "השכרה"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {property.price} ₪
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        property.status
                      )}`}
                    >
                      {getStatusLabel(property.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/properties/${property.id}`}
                      className="text-blue-600 hover:text-blue-900 ml-4"
                    >
                      ערוך
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {result.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map(
            (pageNum) => {
              const params = new URLSearchParams();
              params.set("page", pageNum.toString());
              if (search) params.set("search", search);
              if (status) params.set("status", status);
              if (dealType) params.set("dealType", dealType);
              if (propertyType) params.set("propertyType", propertyType);
              if (neighborhoodId) params.set("neighborhoodId", neighborhoodId);
              if (agentId) params.set("agentId", agentId);

              return (
                <Link
                  key={pageNum}
                  href={`?${params.toString()}`}
                  className={`px-4 py-2 rounded-lg ${
                    pageNum === page
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "טיוטה",
    PUBLISHED: "מפורסם",
    RESERVED: "שמור",
    SOLD: "נמכר",
    RENTED: "הושכר",
    ARCHIVED: "בארכיון",
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    PUBLISHED: "bg-green-100 text-green-800",
    RESERVED: "bg-yellow-100 text-yellow-800",
    SOLD: "bg-blue-100 text-blue-800",
    RENTED: "bg-purple-100 text-purple-800",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
