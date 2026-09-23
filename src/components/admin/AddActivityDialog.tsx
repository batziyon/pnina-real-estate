"use client";

/**
 * Add Activity Dialog
 * Dialog for manually recording a CRM activity
 */

import { useState } from "react";

interface Activity {
  id: string;
  contactId: string;
  activityType: string;
  title: string;
  description: string | null;
  activityDate: string;
  recordedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AddActivityDialogProps {
  contactId: string;
  isOpen: boolean;
  onClose: () => void;
  onActivityAdded: (activity: Activity) => void;
}

type ActivityType =
  | "PHONE_CALL"
  | "MEETING"
  | "EMAIL_SENT"
  | "PROPERTY_SENT"
  | "FOLLOW_UP"
  | "OTHER";

const activityTypes: Array<{ value: ActivityType; label: string }> = [
  { value: "PHONE_CALL", label: "שיחה" },
  { value: "MEETING", label: "פגישה" },
  { value: "EMAIL_SENT", label: "אימייל נשלח" },
  { value: "PROPERTY_SENT", label: "נכס נשלח" },
  { value: "FOLLOW_UP", label: "מעקב" },
  { value: "OTHER", label: "אחר" },
];

export function AddActivityDialog({
  contactId,
  isOpen,
  onClose,
  onActivityAdded,
}: AddActivityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    activityType: "PHONE_CALL" as ActivityType,
    title: "",
    description: "",
    activityDate: new Date().toISOString().slice(0, 16),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: formData.activityType,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          activityDate: new Date(formData.activityDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "שגיאה בשמירת הפעילות");
      }

      const newActivity = await response.json();
      onActivityAdded(newActivity);

      // Reset form
      setFormData({
        activityType: "PHONE_CALL",
        title: "",
        description: "",
        activityDate: new Date().toISOString().slice(0, 16),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירת הפעילות");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">הוספת פעילות</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Activity Type */}
          <div>
            <label
              htmlFor="activityType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              סוג פעילות <span className="text-red-500">*</span>
            </label>
            <select
              id="activityType"
              value={formData.activityType}
              onChange={(e) =>
                setFormData({ ...formData, activityType: e.target.value as ActivityType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              required
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              כותרת <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="תיאור קצר של הפעילות"
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              תיאור
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="פרטים נוספים"
              disabled={isSubmitting}
            />
          </div>

          {/* Activity Date */}
          <div>
            <label
              htmlFor="activityDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              תאריך ושעה <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="activityDate"
              value={formData.activityDate}
              onChange={(e) =>
                setFormData({ ...formData, activityDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "שומר..." : "שמור פעילות"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
