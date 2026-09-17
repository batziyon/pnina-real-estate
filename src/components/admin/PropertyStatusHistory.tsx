"use client";

/**
 * Property Status History — Client Component
 *
 * Displays property status change history.
 */

import { useState, useEffect } from "react";

interface StatusHistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string;
  notes: string | null;
  changedBy: string;
  changedByUser?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface PropertyStatusHistoryProps {
  propertyId: string;
}

export function PropertyStatusHistory({ propertyId }: PropertyStatusHistoryProps) {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/status-history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch status history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const getStatusLabel = (status: string | null): string => {
    if (!status) return "—";
    
    const labels: Record<string, string> = {
      DRAFT: "טיוטה",
      PUBLISHED: "מפורסם",
      UNDER_CONTRACT: "תחת חוזה",
      SOLD: "נמכר",
      RENTED: "הושכר",
      ARCHIVED: "ארכיון",
    };
    return labels[status] || status;
  };

  const getReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      DEAL_FELL_THROUGH: "עסקה נפלה",
      TRANSACTION_COMPLETED: "עסקה הושלמה",
      RENTAL_ENDED: "השכרה הסתיימה",
      OWNER_DECISION: "החלטת בעלים",
      PRICE_CHANGE: "שינוי מחיר",
      OTHER: "אחר",
    };
    return labels[reason] || reason;
  };

  const getStatusColor = (status: string | null): string => {
    if (!status) return "bg-gray-100 text-gray-600";
    
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      PUBLISHED: "bg-green-100 text-green-800",
      UNDER_CONTRACT: "bg-yellow-100 text-yellow-800",
      SOLD: "bg-blue-100 text-blue-800",
      RENTED: "bg-purple-100 text-purple-800",
      ARCHIVED: "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return null;
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">היסטוריית סטטוסים</h2>

      <div className="space-y-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="border-r-4 border-[#135C87] bg-gray-50 p-4 rounded"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      entry.fromStatus
                    )}`}
                  >
                    {getStatusLabel(entry.fromStatus)}
                  </span>
                  <span className="text-gray-400">←</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      entry.toStatus
                    )}`}
                  >
                    {getStatusLabel(entry.toStatus)}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  סיבה: {getReasonLabel(entry.reason)}
                </div>

                {entry.notes && (
                  <div className="mt-2 text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                    {entry.notes}
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  {entry.changedByUser ? `שונה על ידי: ${entry.changedByUser.name} • ` : ""}
                  {new Date(entry.createdAt).toLocaleDateString("he-IL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
