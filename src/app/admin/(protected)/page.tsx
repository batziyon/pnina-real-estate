/**
 * Admin Dashboard — Pnina Real Estate
 * Professional real estate CRM overview
 */

import { useCases } from "@/lib/container";
import { requireAuth } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireAuth();

  // Fetch statistics
  const [propertyStats, projectStats, recentProperties, recentInquiries] = await Promise.all([
    useCases.properties.getStatistics.execute(),
    useCases.projects.getStatistics.execute(),
    useCases.properties.list.execute({}, { page: 1, pageSize: 5 }),
    useCases.inquiries.list.execute({ status: "NEW" }, { page: 1, pageSize: 5 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`שלום, ${user.name}`}
        subtitle="סקירת מצב המשרד"
      />

      {/* Compact Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/properties">
          <div className="bg-white border border-gray-200 p-4 hover:border-blue-900 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-gray-900">{propertyStats.total}</div>
            <div className="text-sm text-gray-600 mt-0.5">סה״כ נכסים</div>
          </div>
        </Link>

        <Link href="/admin/properties?status=PUBLISHED">
          <div className="bg-white border border-gray-200 p-4 hover:border-green-600 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-green-700">{propertyStats.published}</div>
            <div className="text-sm text-gray-600 mt-0.5">מפורסמים</div>
          </div>
        </Link>

        <Link href="/admin/properties?status=SOLD">
          <div className="bg-white border border-gray-200 p-4 hover:border-blue-600 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-blue-700">{propertyStats.sold + propertyStats.rented}</div>
            <div className="text-sm text-gray-600 mt-0.5">נמכרו/הושכרו</div>
          </div>
        </Link>

        <Link href="/admin/projects">
          <div className="bg-white border border-gray-200 p-4 hover:border-orange-500 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-orange-600">{projectStats.active}</div>
            <div className="text-sm text-gray-600 mt-0.5">פרויקטים פעילים</div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <Card>
          <CardHeader 
            title="נכסים אחרונים" 
            action={
              <Link href="/admin/properties" className="text-sm text-blue-900 hover:text-blue-700 font-medium">
                כל הנכסים
              </Link>
            }
          />
          <CardContent padding="none">
            {recentProperties.data.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <p>אין נכסים עדיין</p>
                <Link href="/admin/properties/new" className="text-blue-900 hover:text-blue-700 font-medium mt-2 inline-block">
                  צור נכס ראשון
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentProperties.data.map((property) => (
                  <Link
                    key={property.id}
                    href={`/admin/properties/${property.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">{property.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {property.dealType === "SALE" ? "למכירה" : "להשכרה"} · {property.price ? `${property.price.toLocaleString()} ₪` : "מחיר טרם נקבע"}
                      </div>
                    </div>
                    <Badge size="sm" variant={getStatusVariant(property.status)}>
                      {getStatusLabel(property.status)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader 
            title="פניות חדשות" 
            action={
              <Link href="/admin/inquiries" className="text-sm text-blue-900 hover:text-blue-700 font-medium">
                כל הפניות
              </Link>
            }
          />
          <CardContent padding="none">
            {recentInquiries.data.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                אין פניות חדשות
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentInquiries.data.map((inquiry) => (
                  <Link
                    key={inquiry.id}
                    href={`/admin/inquiries`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{inquiry.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {inquiry.phone} · {getInquiryTypeLabel(inquiry.type)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(inquiry.createdAt).toLocaleDateString("he-IL")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "טיוטה",
    PUBLISHED: "מפורסם",
    UNDER_CONTRACT: "תחת חוזה",
    SOLD: "נמכר",
    RENTED: "הושכר",
    ARCHIVED: "ארכיון",
  };
  return labels[status] || status;
}

function getStatusVariant(status: string): "default" | "success" | "warning" | "danger" | "info" | "neutral" {
  const variants: Record<string, "default" | "success" | "warning" | "danger" | "info" | "neutral"> = {
    DRAFT: "neutral",
    PUBLISHED: "success",
    UNDER_CONTRACT: "warning",
    SOLD: "info",
    RENTED: "info",
    ARCHIVED: "neutral",
  };
  return variants[status] || "neutral";
}

function getInquiryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PROPERTY_INTEREST: "עניין בנכס",
    VALUATION_REQUEST: "הערכת שווי",
    COOPERATION: "שיתוף פעולה",
    GENERAL_CONTACT: "יצירת קשר",
  };
  return labels[type] || type;
}
