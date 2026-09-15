/**
 * Admin Contacts List — Hebrew RTL
 *
 * Server Component with search, filters, and pagination.
 */

import Link from "next/link";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    assignedAgentId?: string;
  }>;
}

interface ContactDTO {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  assignedAgent: { id: string; name: string; email: string } | null;
  createdAt: string;
}

interface ContactListResponse {
  data: ContactDTO[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export default async function ContactsListPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;

  // Parse query params
  const page = parseInt(params.page || "1", 10);
  const search = params.search || undefined;
  const assignedAgentId = params.assignedAgentId || undefined;

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.set("page", page.toString());
  queryParams.set("pageSize", "20");
  if (search) queryParams.set("search", search);
  if (assignedAgentId) queryParams.set("assignedAgentId", assignedAgentId);

  // Fetch contacts from API
  const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/contacts?${queryParams.toString()}`;
  let result: ContactListResponse;
  let error: string | null = null;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Cookie: (await import("next/headers")).cookies().toString(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      error = `שגיאה בטעינת אנשי הקשר (${response.status})`;
      result = { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } };
    } else {
      result = await response.json();
    }
  } catch {
    error = "שגיאה בחיבור לשרת";
    result = { data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } };
  }

  // Fetch agents for ADMIN filter
  let agents: Array<{ id: string; name: string; email: string }> = [];
  if (user.role === "ADMIN") {
    try {
      const agentsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/users?role=AGENT&pageSize=100`,
        {
          headers: {
            Cookie: (await import("next/headers")).cookies().toString(),
          },
          cache: "no-store",
        }
      );
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        agents = agentsData.data || [];
      }
    } catch {
      // Ignore agents fetch error
    }
  }

  const hasFilters = search || assignedAgentId;
  const isEmpty = result.data.length === 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">אנשי קשר</h1>
          <p className="text-gray-600 mt-1">מאגר אנשי הקשר המרכזי של ה-CRM</p>
        </div>
        <Link
          href="/admin/contacts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + איש קשר חדש
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form method="get" className="space-y-4">
          {/* Search Input */}
          <div>
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="🔍 חיפוש לפי שם, טלפון או אימייל"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>

          {/* Agent Filter (ADMIN only) */}
          {user.role === "ADMIN" && agents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סוכן מטפל
                </label>
                <select
                  name="assignedAgentId"
                  defaultValue={assignedAgentId || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">כל הסוכנים</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Submit and Clear */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              סנן
            </button>
            {hasFilters && (
              <Link
                href="/admin/contacts"
                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                נקה סינון
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Contacts Table/Cards */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isEmpty && !hasFilters ? (
          // Empty state - no contacts at all
          <div className="p-12 text-center">
            <p className="text-gray-900 text-xl font-medium mb-2">אין עדיין אנשי קשר</p>
            <p className="text-gray-600 mb-6">
              אנשי קשר שיגיעו מהאתר, טלפון, WhatsApp או הוספה ידנית יופיעו כאן.
            </p>
            <Link
              href="/admin/contacts/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + הוסף איש קשר
            </Link>
          </div>
        ) : isEmpty && hasFilters ? (
          // Empty state - search returned no results
          <div className="p-12 text-center">
            <p className="text-gray-900 text-xl font-medium mb-2">אין תוצאות לחיפוש</p>
            <p className="text-gray-600 mb-6">נסה לשנות את פרמטרי החיפוש</p>
            <Link
              href="/admin/contacts"
              className="inline-block px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              נקה חיפוש
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      טלפון
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      אימייל
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סוכן מטפל
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      נוצר בתאריך
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.data.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/contacts/${contact.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900"
                        >
                          {contact.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.phone || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.email || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contact.assignedAgent ? contact.assignedAgent.name : "לא משויך"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleDateString("he-IL")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/contacts/${contact.id}`}
                          className="text-blue-600 hover:text-blue-900 ml-3"
                        >
                          צפייה
                        </Link>
                        <Link
                          href={`/admin/contacts/${contact.id}?edit=true`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          עריכה
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {result.data.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/admin/contacts/${contact.id}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {contact.phone && <div>📞 {contact.phone}</div>}
                    {contact.email && <div>✉️ {contact.email}</div>}
                    <div>
                      👤 {contact.assignedAgent ? contact.assignedAgent.name : "לא משויך"}
                    </div>
                    <div className="text-gray-400">
                      {new Date(contact.createdAt).toLocaleDateString("he-IL")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {result.meta.totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-gray-600">
            עמוד {result.meta.page} מתוך {result.meta.totalPages} · {result.meta.total} אנשי קשר
          </div>
          <div className="flex items-center gap-2">
            {result.meta.page > 1 && (
              <Link
                href={`?${new URLSearchParams({ ...params, page: (result.meta.page - 1).toString() }).toString()}`}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← הקודם
              </Link>
            )}
            {result.meta.page < result.meta.totalPages && (
              <Link
                href={`?${new URLSearchParams({ ...params, page: (result.meta.page + 1).toString() }).toString()}`}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                הבא →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
