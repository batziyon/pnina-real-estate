"use client";

/**
 * Property Actions — Client Component
 *
 * Handles publish, archive, and delete actions.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PropertyActionsProps {
  propertyId: string;
  status: string;
}

export function PropertyActions({ propertyId, status }: PropertyActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!confirm("האם אתה בטוח שברצונך לפרסם את הנכס?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/properties/${propertyId}/publish`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Failed to publish property");
      }

      router.refresh();
    } catch (err) {
      alert("שגיאה בפרסום הנכס");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canPublish = status === "DRAFT" || status === "ARCHIVED";

  return (
    <div className="flex items-center gap-2">
      {canPublish && (
        <button
          onClick={handlePublish}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? "מפרסם..." : "פרסם"}
        </button>
      )}
    </div>
  );
}
