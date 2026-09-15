/**
 * Admin Dashboard — Hebrew RTL
 *
 * Shows statistics and recent activity.
 * Server Component with data fetching.
 */

import { useCases } from "@/lib/container";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAuth();

  // Fetch statistics
  const [propertyStats, projectStats, recentProperties, recentInquiries] = await Promise.all([
    useCases.properties.getStatistics.execute(),
    useCases.projects.getStatistics.execute(),
    useCases.properties.list.execute({}, { page: 1, pageSize: 5 }),
    useCases.inquiries.list.execute({ status: "NEW" }, { page: 1, pageSize: 5 }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">לוח בקרה</h1>
        <p className="text-gray-600 mt-1">סקירה כללית של המערכת</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="סה״כ נכסים"
          value={propertyStats.total}
          icon="🏢"
          color="blue"
        />
        <StatCard
          title="נכסים מפורסמים"
          value={propertyStats.published}
          icon="✅"
          color="green"
        />
        <StatCard
          title="נכסים שנמכרו/הושכרו"
          value={propertyStats.sold + propertyStats.rented}
          icon="🤝"
          color="purple"
        />
        <StatCard
          title="פרויקטים פעילים"
          value={projectStats.active}
          icon="🏗️"
          color="orange"
        />
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">נכסים אחרונים</h2>
        </div>
        <div className="p-6">
          {recentProperties.data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">אין נכסים עדיין</p>
          ) : (
            <div className="space-y-3">
              {recentProperties.data.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{property.title}</h3>
                    <p className="text-sm text-gray-500">
                      {property.dealType === "SALE" ? "למכירה" : "להשכרה"} •{" "}
                      {property.price} ₪
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                      property.status
                    )}`}
                  >
                    {getStatusLabel(property.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">פניות חדשות</h2>
        </div>
        <div className="p-6">
          {recentInquiries.data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">אין פניות חדשות</p>
          ) : (
            <div className="space-y-3">
              {recentInquiries.data.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{inquiry.name}</h3>
                    <p className="text-sm text-gray-500">
                      {inquiry.phone} • {getInquiryTypeLabel(inquiry.type)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleDateString("he-IL")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: "blue" | "green" | "purple" | "orange";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
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
    DRAFT: "bg-gray-100 text-gray-700",
    PUBLISHED: "bg-green-100 text-green-700",
    RESERVED: "bg-yellow-100 text-yellow-700",
    SOLD: "bg-blue-100 text-blue-700",
    RENTED: "bg-purple-100 text-purple-700",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

function getInquiryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PROPERTY_INTEREST: "עניין בנכס",
    GENERAL_INQUIRY: "פנייה כללית",
    SELLING_INQUIRY: "פנייה למכירה",
  };
  return labels[type] || type;
}
