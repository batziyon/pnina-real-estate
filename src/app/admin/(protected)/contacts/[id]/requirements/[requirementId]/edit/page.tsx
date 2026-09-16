/**
 * Edit Buyer Requirement — Hebrew RTL
 *
 * Server Component that renders the buyer requirement form for editing.
 */

import { requireAuth } from "@/lib/auth-helpers";
import { BuyerRequirementForm } from "@/components/admin/BuyerRequirementForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string; requirementId: string }>;
}

export default async function EditBuyerRequirementPage({ params }: PageProps) {
  await requireAuth();
  const { id: contactId, requirementId } = await params;

  // Fetch requirement
  let requirement;
  try {
    const requirementResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/contacts/${contactId}/requirements/${requirementId}`,
      {
        headers: {
          Cookie: (await import("next/headers")).cookies().toString(),
        },
        cache: "no-store",
      }
    );

    if (!requirementResponse.ok) {
      notFound();
    }

    requirement = await requirementResponse.json();
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
        <h1 className="text-3xl font-bold text-gray-900">ערוך דרישת חיפוש</h1>
        <p className="text-gray-600 mt-1">
          {requirement.dealType === "SALE" ? "קנייה" : "שכירות"}
          {requirement.propertyType && ` · ${requirement.propertyType}`}
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-lg shadow p-6">
        <BuyerRequirementForm
          mode="edit"
          contactId={contactId}
          requirement={requirement}
          neighborhoods={neighborhoods}
        />
      </div>
    </div>
  );
}
