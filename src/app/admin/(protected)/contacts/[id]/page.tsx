/**
 * Contact Detail Page — Hebrew RTL
 *
 * Server Component showing contact details and future CRM hub sections.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { ContactForm } from "@/components/admin/ContactForm";
import { BuyerRequirementsSection } from "@/components/admin/BuyerRequirementsSection";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}

interface ContactDTO {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  assignedAgent: { id: string; name: string; email: string } | null;
  assignedAgentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default async function ContactDetailPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireAuth();
  const { id } = await params;
  const { edit } = await searchParams;

  const isEditMode = edit === "true";

  // Fetch contact
  const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/contacts/${id}`;

  let contact: ContactDTO;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        Cookie: (await import("next/headers")).cookies().toString(),
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      notFound();
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch contact: ${response.status}`);
    }

    contact = await response.json();
  } catch (error) {
    console.error("Error fetching contact:", error);
    notFound();
  }

  // Fetch agents for ADMIN
  let agents: Array<{ id: string; name: string; email: string }> = [];
  if (user.role === "ADMIN" && isEditMode) {
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

  // Fetch buyer requirements (only in view mode)
  let buyerRequirements: unknown[] = [];
  if (!isEditMode) {
    try {
      const requirementsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/contacts/${id}/requirements`,
        {
          headers: {
            Cookie: (await import("next/headers")).cookies().toString(),
          },
          cache: "no-store",
        }
      );
      if (requirementsResponse.ok) {
        buyerRequirements = await requirementsResponse.json();
      }
    } catch {
      // Ignore requirements fetch error
    }
  }

  // Edit mode: show form
  if (isEditMode) {
    return (
      <div className="max-w-3xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">ערוך איש קשר</h1>
          <p className="text-gray-600 mt-1">{contact.name}</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-lg shadow p-6">
          <ContactForm
            mode="edit"
            contact={contact}
            userRole={user.role}
            userId={user.id}
            agents={agents}
          />
        </div>
      </div>
    );
  }

  // View mode: show details and CRM hub
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            נוצר ב-{new Date(contact.createdAt).toLocaleDateString("he-IL")}
          </p>
        </div>
        <Link
          href={`/admin/contacts/${contact.id}?edit=true`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ערוך פרטים
        </Link>
      </div>

      {/* Contact Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">פרטי קשר</h2>
        <div className="space-y-3">
          {/* Phone */}
          {contact.phone && (
            <div className="flex items-center gap-3">
              <span className="text-gray-500">📞</span>
              <div>
                <div className="text-sm text-gray-500">טלפון</div>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {contact.phone}
                </a>
              </div>
            </div>
          )}

          {/* Email */}
          {contact.email && (
            <div className="flex items-center gap-3">
              <span className="text-gray-500">✉️</span>
              <div>
                <div className="text-sm text-gray-500">אימייל</div>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {contact.email}
                </a>
              </div>
            </div>
          )}

          {/* Assigned Agent */}
          <div className="flex items-center gap-3">
            <span className="text-gray-500">👤</span>
            <div>
              <div className="text-sm text-gray-500">סוכן מטפל</div>
              <div className="font-medium text-gray-900">
                {contact.assignedAgent ? contact.assignedAgent.name : "לא משויך"}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {(contact.phone || contact.email) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  📞 התקשר
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ✉️ שלח אימייל
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Internal Notes */}
      {contact.notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            הערות פנימיות
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
          <p className="text-xs text-gray-500 mt-2">
            הערות אלו הן פנימיות ולא מופיעות באתר הציבורי
          </p>
        </div>
      )}

      {/* Buyer Requirements - Real Implementation */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">דרישות חיפוש</h2>
        </div>
        <BuyerRequirementsSection
          contactId={contact.id}
          initialRequirements={buyerRequirements as never[]}
        />
      </div>

      {/* CRM Hub - Future Placeholder Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matching Properties */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            נכסים מתאימים
          </h2>
          <div className="text-center py-8">
            <p className="text-gray-500">נכסים מתאימים יוצגו כאן</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            פעילות אחרונה
          </h2>
          <div className="text-center py-8">
            <p className="text-gray-500">
              שיחות, פגישות, הערות ופעילות יופיעו כאן
            </p>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">משימות</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">משימות הקשורות לאיש הקשר יופיעו כאן</p>
          </div>
        </div>

        {/* Inquiries */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">פניות</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">פניות שהתקבלו מהאתר יופיעו כאן</p>
          </div>
        </div>
      </div>
    </div>
  );
}
