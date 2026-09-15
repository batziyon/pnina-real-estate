"use client";

import { useState } from "react";
import type { InquiryData } from "@/domain/inquiry/inquiry.types";

interface InquiryRowWithEditProps {
  inquiry: InquiryData;
  onUpdate: () => void;
}

export function InquiryRowWithEdit({ inquiry, onUpdate }: InquiryRowWithEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(inquiry.status);
  const [notes, setNotes] = useState(inquiry.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: notes || null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update inquiry");
      }

      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעדכון הפנייה");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-6 py-4" colSpan={6}>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">
                {inquiry.name} | {inquiry.phone}
                {inquiry.email && ` | ${inquiry.email}`}
              </p>
              {inquiry.message && (
                <p className="text-sm text-gray-600 mb-4">{inquiry.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סטטוס
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InquiryData["status"])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NEW">חדש</option>
                  <option value="CONTACTED">נוצר קשר</option>
                  <option value="IN_PROGRESS">בטיפול</option>
                  <option value="CLOSED">סגור</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  הערות פנימיות
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הוסף הערות..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
              >
                {loading ? "שומר..." : "שמור"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setStatus(inquiry.status);
                  setNotes(inquiry.notes || "");
                  setError(null);
                }}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                ביטול
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
        {inquiry.email && <div className="text-sm text-gray-500">{inquiry.email}</div>}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{inquiry.phone}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500">{getInquiryTypeLabel(inquiry.type)}</div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            inquiry.status
          )}`}
        >
          {getStatusLabel(inquiry.status)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(inquiry.createdAt).toLocaleDateString("he-IL")}
      </td>
      <td className="px-6 py-4">
        {inquiry.message && (
          <div className="text-sm text-gray-600 max-w-xs truncate">{inquiry.message}</div>
        )}
        {inquiry.notes && <div className="text-xs text-blue-600 mt-1">הערות פנימיות</div>}
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-900 text-sm font-medium mt-1"
        >
          ערוך
        </button>
      </td>
    </tr>
  );
}

function getInquiryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PROPERTY_INTEREST: "עניין בנכס",
    VALUATION_REQUEST: "בקשת הערכת שווי",
    COOPERATION: "שיתוף פעולה",
    GENERAL_CONTACT: "יצירת קשר כללית",
  };
  return labels[type] || type;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: "חדש",
    CONTACTED: "נוצר קשר",
    IN_PROGRESS: "בטיפול",
    CLOSED: "סגור",
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    CONTACTED: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    CLOSED: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
