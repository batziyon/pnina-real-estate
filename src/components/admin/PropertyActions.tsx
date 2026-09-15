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

export function PropertyActions({ propertyId, status, canPublish }: PropertyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string, endpoint: string, confirmMessage: string) => {
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
        label: "שמור נכס",
        endpoint: "reserve",
        confirmMessage: "האם לשמור את הנכס?",
        className: "bg-yellow-600 hover:bg-yellow-700 text-white",
      });
    }
  }

  if (status === "RESERVED" && canPublish) {
    actions.push({
      label: "החזר לפרסום",
      endpoint: "publish",
      confirmMessage: "האם להחזיר את הנכס לפרסום?",
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    });
  }

  if ((status === "PUBLISHED" || status === "RESERVED") && canPublish) {
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

  if ((status === "DRAFT" || status === "PUBLISHED" || status === "RESERVED" || status === "SOLD" || status === "RENTED") && canPublish) {
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
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => handleAction(action.label, action.endpoint, action.confirmMessage)}
          disabled={loading}
          className={`px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400 ${action.className}`}
        >
          {loading ? "מעבד..." : action.label}
        </button>
      ))}
    </div>
  );
}
