/**
 * Admin Projects List — Hebrew RTL
 */

import Link from "next/link";
import { useCases } from "@/lib/container";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage() {
  await requireAuth();

  const result = await useCases.projects.list.execute({}, { page: 1, pageSize: 20 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">פרויקטים</h1>
          <p className="text-gray-600 mt-1">ניהול פרויקטים במערכת</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + הוסף פרויקט חדש
        </Link>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {result.data.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">לא נמצאו פרויקטים</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  שם
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  שכונה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.data.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {project.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {/* Neighborhood name would come from joined data */}
                      {project.neighborhoodId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.status === "ACTIVE" ? "פעיל" : "לא פעיל"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-blue-600 hover:text-blue-900"
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
    </div>
  );
}
