"use client";

/**
 * Property Interests Section — Client Component
 *
 * Displays and manages property interests (מתעניינים בנכס).
 */

import { useState, useEffect } from "react";
import type { PropertyInterestData } from "@/domain/property-interest/property-interest.types";

interface PropertyInterestWithContact extends PropertyInterestData {
  contact: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
}

interface PropertyInterestsSectionProps {
  propertyId: string;
}

export function PropertyInterestsSection({
  propertyId,
}: PropertyInterestsSectionProps) {
  const [interests, setInterests] = useState<PropertyInterestWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterests = async () => {
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/interests`);
      if (!response.ok) {
        throw new Error("Failed to fetch interests");
      }
      const data = await response.json();
      setInterests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינת מתעניינים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInterests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      INTERESTED: "מתעניין",
      WAITING: "ממתין",
      CONTACTED: "נוצר קשר",
      NOT_INTERESTED: "לא מעוניין",
    };
    return labels[status] || status;
  };

  const getSourceLabel = (source: string): string => {
    const labels: Record<string, string> = {
      INQUIRY: "פנייה",
      AGENT_ADDED: "הוספה על ידי סוכן",
      REQUIREMENT_MATCH: "התאמת דרישה",
      WEBSITE: "אתר",
    };
    return labels[source] || source;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      INTERESTED: "bg-green-100 text-green-800",
      WAITING: "bg-yellow-100 text-yellow-800",
      CONTACTED: "bg-blue-100 text-blue-800",
      NOT_INTERESTED: "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleStatusChange = async (interestId: string, newStatus: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/properties/${propertyId}/interests/${interestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      await fetchInterests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעדכון סטטוס");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (interestId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מתעניין זה?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/properties/${propertyId}/interests/${interestId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete");
      }

      await fetchInterests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה במחיקת המתעניין");
    } finally {
      setLoading(false);
    }
  };

  if (loading && interests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">טוען מתעניינים...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">מתעניינים בנכס</h2>
        <button
          type="button"
          disabled={loading}
          className="px-4 py-2 bg-[#135C87] text-white rounded-lg hover:bg-[#0f4a6d] transition-colors text-sm font-medium disabled:bg-gray-400"
        >
          + הוסף מתעניין
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {interests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          אין מתעניינים בנכס זה
        </div>
      ) : (
        <div className="space-y-3">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">
                      {interest.contact.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        interest.status
                      )}`}
                    >
                      {getStatusLabel(interest.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600 space-y-1">
                    {interest.contact.phone && (
                      <div>טלפון: {interest.contact.phone}</div>
                    )}
                    {interest.contact.email && (
                      <div>דוא״ל: {interest.contact.email}</div>
                    )}
                    <div className="text-gray-500">
                      מקור: {getSourceLabel(interest.source)}
                    </div>
                    {interest.notes && (
                      <div className="mt-2 text-gray-700 bg-gray-50 p-2 rounded">
                        {interest.notes}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      נוצר: {new Date(interest.createdAt).toLocaleDateString("he-IL")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={interest.status}
                    onChange={(e) =>
                      handleStatusChange(interest.id, e.target.value)
                    }
                    disabled={loading}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="INTERESTED">מתעניין</option>
                    <option value="WAITING">ממתין</option>
                    <option value="CONTACTED">נוצר קשר</option>
                    <option value="NOT_INTERESTED">לא מעוניין</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDelete(interest.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1 disabled:text-gray-400"
                  >
                    מחק
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
