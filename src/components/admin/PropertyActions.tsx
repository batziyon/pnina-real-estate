"use client";

/**
 * Property Actions — Client Component
 *
 * Handles all status transitions based on business rules.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PropertyActionsProps {
  propertyId: string;
  status: string;
  canPublish: boolean; // Server determines this based on user role
}

interface RepublishModalProps {
  onConfirm: (reason: string, notes?: string) => void;
  onCancel: () => void;
}

function RepublishModal({ onConfirm, onCancel }: RepublishModalProps) {
  const [reason, setReason] = useState("DEAL_FELL_THROUGH");
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">החזר נכס לפרסום</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            סיבה *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="DEAL_FELL_THROUGH">העסקה נכשלה</option>
            <option value="OWNER_DECISION">החלטת הבעלים</option>
            <option value="PRICE_CHANGE">שינוי מחיר</option>
            <option value="OTHER">אחר</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            הערות (אופציונלי)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="הוסף הערות נוספות..."
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ביטול
          </button>
          <button
            onClick={() => onConfirm(reason, notes || undefined)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            אשר
          </button>
        </div>
      </div>
    </div>
  );
}

export function PropertyActions({ propertyId, status, canPublish }: PropertyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRepublishModal, setShowRepublishModal] = useState(false);

  const handleAction = async (action: string, endpoint: string, confirmMessage: string, requiresReason?: boolean) => {
    if (requiresReason) {
      setShowRepublishModal(true);
      return;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/${endpoint}`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action}`);
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : `שגיאה ב${action}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepublish = async (reason: string, notes?: string) => {
    setShowRepublishModal(false);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}/republish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to republish property");
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "שגיאה בהחזרת נכס לפרסום");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Define available actions based on current status and allowed transitions
  const actions = [];

  if (status === "DRAFT" && canPublish) {
    actions.push({
      label: "פרסם",
      endpoint: "publish",
      confirmMessage: "האם לפרסם את הנכס?",
      className: "bg-green-600 hover:bg-green-700 text-white",
    });
  }

  if (status === "PUBLISHED") {
    if (canPublish) {
      actions.push({
        label: "החזר לטיוטה",
        endpoint: "unpublish",
        confirmMessage: "האם להחזיר את הנכס לטיוטה?",
        className: "bg-gray-600 hover:bg-gray-700 text-white",
      });
      actions.push({
        label: "סמן בחוזה",
        endpoint: "reserve",
        confirmMessage: "האם לסמן את הנכס כבחוזה?",
        className: "bg-yellow-600 hover:bg-yellow-700 text-white",
      });
    }
  }

  if (status === "UNDER_CONTRACT" && canPublish) {
    actions.push({
      label: "החזר לפרסום",
      endpoint: "republish",
      confirmMessage: "האם להחזיר את הנכס לפרסום?",
      className: "bg-blue-600 hover:bg-blue-700 text-white",
      requiresReason: true,
    });
  }

  if ((status === "PUBLISHED" || status === "UNDER_CONTRACT") && canPublish) {
    actions.push({
      label: "סמן נמכר",
      endpoint: "mark-sold",
      confirmMessage: "האם לסמן את הנכס כנמכר?",
      className: "bg-purple-600 hover:bg-purple-700 text-white",
    });
    actions.push({
      label: "סמן הושכר",
      endpoint: "mark-rented",
      confirmMessage: "האם לסמן את הנכס כהושכר?",
      className: "bg-indigo-600 hover:bg-indigo-700 text-white",
    });
  }

  if (status === "RENTED" && canPublish) {
    actions.push({
      label: "החזר לפרסום",
      endpoint: "publish",
      confirmMessage: "האם להחזיר את הנכס לפרסום?",
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    });
  }

  if ((status === "DRAFT" || status === "PUBLISHED" || status === "UNDER_CONTRACT" || status === "SOLD" || status === "RENTED") && canPublish) {
    actions.push({
      label: "העבר לארכיון",
      endpoint: "archive",
      confirmMessage: "האם להעביר את הנכס לארכיון?",
      className: "bg-red-600 hover:bg-red-700 text-white",
    });
  }

  if (status === "ARCHIVED" && canPublish) {
    actions.push({
      label: "שחזר מארכיון",
      endpoint: "unpublish",
      confirmMessage: "האם לשחזר את הנכס מהארכיון?",
      className: "bg-green-600 hover:bg-green-700 text-white",
    });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      {showRepublishModal && (
        <RepublishModal
          onConfirm={handleRepublish}
          onCancel={() => setShowRepublishModal(false)}
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleAction(action.label, action.endpoint, action.confirmMessage, action.requiresReason)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400 ${action.className}`}
          >
            {loading ? "מעבד..." : action.label}
          </button>
        ))}
      </div>
    </>
  );
}
