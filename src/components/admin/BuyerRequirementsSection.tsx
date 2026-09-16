"use client";

/**
 * Buyer Requirements Section — Hebrew RTL
 *
 * Displays buyer requirements for a contact with create/edit/deactivate actions.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Neighborhood {
  neighborhoodId: string;
  preferenceType: string;
  neighborhoodName?: string;
}

interface BuyerRequirement {
  id: string;
  contactId: string;
  dealType: string;
  propertyType: string | null;
  minRooms: number | null;
  maxRooms: number | null;
  minArea: number | null;
  maxArea: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  notes: string | null;
  active: boolean;
  neighborhoods: Neighborhood[];
  createdAt: string;
  updatedAt: string;
}

interface BuyerRequirementsSectionProps {
  contactId: string;
  initialRequirements: BuyerRequirement[];
}

export function BuyerRequirementsSection({
  contactId,
  initialRequirements,
}: BuyerRequirementsSectionProps) {
  const router = useRouter();
  const [requirements, setRequirements] = useState(initialRequirements);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const handleDeactivate = async (requirementId: string) => {
    if (!confirm("האם אתה בטוח שברצונך להשבית דרישה זו?")) {
      return;
    }

    setDeactivating(requirementId);

    try {
      const response = await fetch(
        `/api/admin/contacts/${contactId}/requirements/${requirementId}/deactivate`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Failed to deactivate");
      }

      // Update local state and refresh
      setRequirements(
        requirements.map((r) =>
          r.id === requirementId ? { ...r, active: false } : r
        )
      );

      router.refresh();
    } catch (error) {
      alert("שגיאה בהשבתת הדרישה");
      console.error(error);
    } finally {
      setDeactivating(null);
    }
  };

  const activeRequirements = requirements.filter((r) => r.active);
  const inactiveRequirements = requirements.filter((r) => !r.active);

  const formatDealType = (dealType: string) => {
    return dealType === "SALE" ? "קנייה" : "שכירות";
  };

  const formatPropertyType = (propertyType: string | null) => {
    const types: Record<string, string> = {
      APARTMENT: "דירה",
      PENTHOUSE: "פנטהאוז",
      HOUSE: "בית",
      VILLA: "וילה",
      DUPLEX: "דופלקס",
      STUDIO: "סטודיו",
      OFFICE: "משרד",
      COMMERCIAL: "מסחרי",
      LAND: "קרקע",
      OTHER: "אחר",
    };
    return propertyType ? types[propertyType] || propertyType : null;
  };

  const formatRange = (
    min: number | null,
    max: number | null,
    unit: string
  ) => {
    if (min && max) return `${min}–${max} ${unit}`;
    if (min) return `מ-${min} ${unit}`;
    if (max) return `עד ${max} ${unit}`;
    return null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("he-IL").format(price);
  };

  if (requirements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">אין עדיין דרישות חיפוש</p>
        <Link
          href={`/admin/contacts/${contactId}/requirements/new`}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + הוסף דרישה
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Requirements */}
      {activeRequirements.map((req) => (
        <div
          key={req.id}
          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                {formatDealType(req.dealType)}
              </span>
              {req.propertyType && (
                <>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-700">
                    {formatPropertyType(req.propertyType)}
                  </span>
                </>
              )}
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                פעילה
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/contacts/${contactId}/requirements/${req.id}/edit`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                עריכה
              </Link>
              <button
                onClick={() => handleDeactivate(req.id)}
                disabled={deactivating === req.id}
                className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
              >
                {deactivating === req.id ? "משבית..." : "השבתה"}
              </button>
            </div>
          </div>

          <div className="space-y-1 text-sm text-gray-700">
            {formatRange(req.minRooms, req.maxRooms, "חדרים") && (
              <div>📐 {formatRange(req.minRooms, req.maxRooms, "חדרים")}</div>
            )}
            {formatRange(req.minArea, req.maxArea, "מ\"ר") && (
              <div>📏 {formatRange(req.minArea, req.maxArea, "מ\"ר")}</div>
            )}
            {(req.minPrice || req.maxPrice) && (
              <div>
                💰{" "}
                {req.minPrice && req.maxPrice
                  ? `${formatPrice(req.minPrice)}–${formatPrice(req.maxPrice)} ₪`
                  : req.minPrice
                  ? `מ-${formatPrice(req.minPrice)} ₪`
                  : `עד ${formatPrice(req.maxPrice!)} ₪`}
              </div>
            )}
          </div>

          {req.neighborhoods.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-2">
                שכונות:
              </div>
              <div className="flex flex-wrap gap-2">
                {req.neighborhoods.map((n, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 text-xs rounded ${
                      n.preferenceType === "REQUIRED"
                        ? "bg-blue-100 text-blue-800 font-medium"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {n.neighborhoodName || n.neighborhoodId} —{" "}
                    {n.preferenceType === "REQUIRED" ? "חובה" : "מועדף"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {req.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600 italic">{req.notes}</div>
            </div>
          )}
        </div>
      ))}

      {/* Inactive Requirements */}
      {inactiveRequirements.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            הצג דרישות לא פעילות ({inactiveRequirements.length})
          </summary>
          <div className="mt-3 space-y-3">
            {inactiveRequirements.map((req) => (
              <div
                key={req.id}
                className="border border-gray-200 rounded-lg p-4 opacity-60"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-700">
                    {formatDealType(req.dealType)}
                  </span>
                  {req.propertyType && (
                    <>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">
                        {formatPropertyType(req.propertyType)}
                      </span>
                    </>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    לא פעילה
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  הושבתה ב-
                  {new Date(req.updatedAt).toLocaleDateString("he-IL")}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Add New Button */}
      <div className="pt-2">
        <Link
          href={`/admin/contacts/${contactId}/requirements/new`}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + הוסף דרישה נוספת
        </Link>
      </div>
    </div>
  );
}
