"use client";

/**
 * ContactPropertyInterestsSection — Client Component
 *
 * Displays all property interests for a contact with:
 * - Property details (title, type, price, neighborhood)
 * - Interest status and source
 * - Ability to update status
 * - Quick link to property detail
 */

import { useState } from "react";
import Link from "next/link";

interface PropertyInterest {
  id: string;
  propertyId: string;
  status: "INTERESTED" | "WAITING" | "CONTACTED" | "NOT_INTERESTED";
  source: "INQUIRY" | "AGENT_ADDED" | "REQUIREMENT_MATCH" | "WEBSITE";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    title: string;
    propertyType: string;
    dealType: string;
    price: string | null;
    neighborhoodName: string;
    status: string;
  };
}

interface Props {
  contactId: string;
  initialInterests: PropertyInterest[];
}

const statusLabels: Record<PropertyInterest["status"], string> = {
  INTERESTED: "מעוניין",
  WAITING: "ממתין",
  CONTACTED: "נוצר קשר",
  NOT_INTERESTED: "לא מעוניין",
};

const statusColors: Record<PropertyInterest["status"], string> = {
  INTERESTED: "bg-green-100 text-green-800",
  WAITING: "bg-yellow-100 text-yellow-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  NOT_INTERESTED: "bg-gray-100 text-gray-800",
};

const sourceLabels: Record<PropertyInterest["source"], string> = {
  INQUIRY: "פנייה מהאתר",
  AGENT_ADDED: "הוסף ע״י סוכן",
  REQUIREMENT_MATCH: "התאמה לדרישות",
  WEBSITE: "אתר",
};

export function ContactPropertyInterestsSection({
  contactId,
  initialInterests,
}: Props) {
  const [interests, setInterests] = useState<PropertyInterest[]>(initialInterests);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (
    interestId: string,
    newStatus: PropertyInterest["status"]
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/property-interests/${interestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh interests
      const refreshResponse = await fetch(
        `/api/admin/contacts/${contactId}/property-interests`
      );
      if (refreshResponse.ok) {
        const updated = await refreshResponse.json();
        setInterests(updated);
      }
    } catch (error) {
      console.error("Failed to update interest status:", error);
      alert("שגיאה בעדכון סטטוס");
    } finally {
      setLoading(false);
    }
  };

  if (interests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">אין עדיין נכסים במעקב</p>
        <p className="text-sm text-gray-400 mt-2">
          נכסים שבהם איש הקשר מביע עניין יופיעו כאן
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interests.map((interest) => (
        <div
          key={interest.id}
          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Property Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/admin/properties/${interest.propertyId}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {interest.property?.title || `נכס ${interest.propertyId}`}
                </Link>
                {interest.property && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      interest.property.status === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : interest.property.status === "SOLD"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {interest.property.status === "PUBLISHED"
                      ? "פעיל"
                      : interest.property.status === "SOLD"
                        ? "נמכר"
                        : interest.property.status}
                  </span>
                )}
              </div>

              {interest.property && (
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>
                    {interest.property.propertyType === "APARTMENT"
                      ? "דירה"
                      : interest.property.propertyType === "HOUSE"
                        ? "בית"
                        : interest.property.propertyType}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    {interest.property.dealType === "SALE" ? "למכירה" : "להשכרה"}
                  </span>
                  {interest.property.price && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium">₪{interest.property.price}</span>
                    </>
                  )}
                  <span className="text-gray-400">•</span>
                  <span>{interest.property.neighborhoodName}</span>
                </div>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>{sourceLabels[interest.source]}</span>
                <span className="text-gray-400">•</span>
                <span>
                  {new Date(interest.createdAt).toLocaleDateString("he-IL")}
                </span>
              </div>

              {interest.notes && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  {interest.notes}
                </p>
              )}
            </div>

            {/* Status Selector */}
            <div className="flex-shrink-0">
              <select
                value={interest.status}
                onChange={(e) =>
                  handleStatusChange(
                    interest.id,
                    e.target.value as PropertyInterest["status"]
                  )
                }
                disabled={loading}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer transition-colors ${
                  statusColors[interest.status]
                } ${loading ? "opacity-50 cursor-wait" : ""}`}
              >
                <option value="INTERESTED">מעוניין</option>
                <option value="WAITING">ממתין</option>
                <option value="CONTACTED">נוצר קשר</option>
                <option value="NOT_INTERESTED">לא מעוניין</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
