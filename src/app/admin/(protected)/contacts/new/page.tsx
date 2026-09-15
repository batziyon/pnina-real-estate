/**
 * Create New Contact — Hebrew RTL
 *
 * Server Component that renders the contact form.
 */

import { requireAuth } from "@/lib/auth-helpers";
import { ContactForm } from "@/components/admin/ContactForm";

export const dynamic = "force-dynamic";

export default async function NewContactPage() {
  const user = await requireAuth();

  // Fetch agents for ADMIN
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

  return (
    <div className="max-w-3xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">איש קשר חדש</h1>
        <p className="text-gray-600 mt-1">הוסף איש קשר חדש למערכת ה-CRM</p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg shadow p-6">
        <ContactForm
          mode="create"
          userRole={user.role}
          userId={user.id}
          agents={agents}
        />
      </div>
    </div>
  );
}
