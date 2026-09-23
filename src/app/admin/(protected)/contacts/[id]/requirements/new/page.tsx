/**
 * Create New Buyer Requirement — Hebrew RTL
 *
 * Server Component that renders the buyer requirement form.
 */

import { requireAuth } from "@/lib/auth-helpers";
import { getCookieHeader } from "@/lib/server-fetch-helpers";
import { BuyerRequirementForm } from "@/components/admin/BuyerRequirementForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NewBuyerRequirementPage({ params }: PageProps) {
  await requireAuth();
  const { id: contactId } = await params;
  const cookieHeader = await getCookieHeader();

  // Verify contact exists
  try {
    const contactResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/contacts/${contactId}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    );

    if (!contactResponse.ok) {
      notFound();
    }
  } catch {
    notFound();
  }

  // Fetch neighborhoods
  let neighborhoods: Array<{ id: string; name: string; active: boolean }> = [];
  try {
    const neighborhoodsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/neighborhoods`,
      { cache: "no-store" }
    );
    if (neighborhoodsResponse.ok) {
      neighborhoods = await neighborhoodsResponse.json();
    }
  } catch {
    // Ignore neighborhoods fetch error
  }

  return (
    <div className="max-w-3xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">דרישת חיפוש חדשה</h1>
        <p className="text-gray-600 mt-1">הוסף דרישת חיפוש חדשה לאיש הקשר</p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg shadow p-6">
        <BuyerRequirementForm
          mode="create"
          contactId={contactId}
          neighborhoods={neighborhoods}
        />
      </div>
    </div>
  );
}
