"use client";

/**
 * Testimonial Form Component
 * 
 * Used for creating/editing testimonials in admin
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TestimonialFormProps {
  mode: "create" | "edit";
  testimonial?: {
    id: string;
    name: string;
    displayName: string | null;
    content: string;
    status: string;
  };
}

export function TestimonialForm({ mode, testimonial }: TestimonialFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: testimonial?.name || "",
    displayName: testimonial?.displayName || "",
    content: testimonial?.content || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = mode === "create" 
        ? "/api/admin/testimonials"
        : `/api/admin/testimonials/${testimonial?.id}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          displayName: formData.displayName || undefined,
          content: formData.content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "שגיאה בשמירת ההמלצה");
      }

      router.push("/admin/testimonials");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירת ההמלצה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          שם *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="שם המליץ"
          disabled={isSubmitting}
        />
        <p className="text-sm text-gray-500 mt-1">
          השם שישמר במערכת (לא יופיע לציבור אם יש שם תצוגה)
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
          שם לתצוגה (אופציונלי)
        </label>
        <input
          type="text"
          id="displayName"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="לדוגמה: משפחת כהן - רחביה"
          disabled={isSubmitting}
        />
        <p className="text-sm text-gray-500 mt-1">
          השם שיופיע לציבור. אם ריק, יוצג השם הרגיל
        </p>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          תוכן ההמלצה *
        </label>
        <textarea
          id="content"
          required
          rows={6}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="תוכן ההמלצה..."
          disabled={isSubmitting}
        />
      </div>

      {mode === "create" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 ההמלצה תיוצר במצב <strong>PENDING</strong> ותצטרך אישור לפני פרסום
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "שומר..." : mode === "create" ? "צור המלצה" : "שמור שינויים"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
