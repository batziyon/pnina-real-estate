"use client";

/**
 * Testimonial Actions — Client Component
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TestimonialActionsProps {
  testimonialId: string;
  status: string;
}

export function TestimonialActions({ testimonialId, status }: TestimonialActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm("האם לאשר המלצה זו?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to approve testimonial");
      }

      router.refresh();
    } catch (err) {
      alert("שגיאה באישור ההמלצה");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("האם לדחות המלצה זו?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}/reject`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reject testimonial");
      }

      router.refresh();
    } catch (err) {
      alert("שגיאה בדחיית ההמלצה");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status !== "PENDING") {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
      >
        {loading ? "מעבד..." : "אשר"}
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm"
      >
        {loading ? "מעבד..." : "דחה"}
      </button>
    </div>
  );
}
