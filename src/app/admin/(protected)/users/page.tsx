/**
 * Admin Users List — Hebrew RTL
 *
 * ADMIN only - server-side authorization check.
 */

import { redirect } from "next/navigation";
import { useCases } from "@/lib/container";
import { requireRole } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function UsersListPage() {
  // Server-side authorization - ADMIN only
  try {
    await requireRole("ADMIN");
  } catch {
    redirect("/admin");
  }

  const result = await useCases.users.list.execute({}, { page: 1, pageSize: 50 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">משתמשים</h1>
        <p className="text-gray-600 mt-1">ניהול משתמשי המערכת</p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {result.data.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">לא נמצאו משתמשים</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  שם
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  אימייל
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  תפקיד
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  סטטוס
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.data.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {getRoleLabel(user.role)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.active ? "פעיל" : "לא פעיל"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "מנהל",
    AGENT: "סוכן",
    EDITOR: "עורך",
  };
  return labels[role] || role;
}
