"use client";

/**
 * Contact Form — Hebrew RTL
 *
 * Reusable form component for creating and editing contacts.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ContactFormProps {
  mode: "create" | "edit";
  contact?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    assignedAgentId: string | null;
  };
  userRole: "ADMIN" | "AGENT" | "EDITOR";
  userId: string;
  agents?: Array<{ id: string; name: string; email: string }>;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  assignedAgentId?: string;
  notes?: string;
  _form?: string;
}

export function ContactForm({
  mode,
  contact,
  userRole,
  userId,
  agents = [],
}: ContactFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    phone: contact?.phone || "",
    email: contact?.email || "",
    notes: contact?.notes || "",
    assignedAgentId:
      mode === "create" && userRole === "AGENT"
        ? userId
        : contact?.assignedAgentId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccess(false);

    try {
      // Build request payload
      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        notes: formData.notes.trim() || null,
      };

      // ADMIN can set/change agent assignment
      if (userRole === "ADMIN") {
        payload.assignedAgentId = formData.assignedAgentId || null;
      }

      // API call
      const url =
        mode === "create"
          ? "/api/admin/contacts"
          : `/api/admin/contacts/${contact?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.errors) {
          // Validation errors
          const fieldErrors: FormErrors = {};
          data.errors.forEach((err: { path: string[]; message: string }) => {
            const field = err.path[0];
            if (field) {
              fieldErrors[field as keyof FormErrors] = err.message;
            }
          });
          setErrors(fieldErrors);
        } else if (response.status === 403) {
          setErrors({ _form: "אין לך הרשאה לבצע פעולה זו" });
        } else {
          setErrors({ _form: data.message || "שגיאה בשמירת איש הקשר" });
        }
        return;
      }

      // Success
      setSuccess(true);

      // Navigate to detail page
      setTimeout(() => {
        router.push(`/admin/contacts/${data.id}`);
        router.refresh();
      }, 1000);
    } catch {
      setErrors({ _form: "שגיאה בחיבור לשרת" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEditAgent = userRole === "ADMIN";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form-level error */}
      {errors._form && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors._form}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            ✓ איש הקשר נשמר בהצלחה! מעביר לדף הפרטים...
          </p>
        </div>
      )}

      {/* Name (required) */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          שם מלא <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="שם מלא"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          טלפון
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="050-1234567"
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          אימייל
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="example@domain.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Assigned Agent (ADMIN only) */}
      {canEditAgent && (
        <div>
          <label
            htmlFor="assignedAgentId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            סוכן מטפל
          </label>
          <select
            id="assignedAgentId"
            value={formData.assignedAgentId}
            onChange={(e) =>
              setFormData({ ...formData, assignedAgentId: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.assignedAgentId ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          >
            <option value="">לא משויך</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
          {errors.assignedAgentId && (
            <p className="mt-1 text-sm text-red-600">{errors.assignedAgentId}</p>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          הערות פנימיות
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.notes ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="הערות פנימיות (לא יופיעו באתר הציבורי)"
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          הערות אלו הן פנימיות ולא יופיעו באתר הציבורי
        </p>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || success}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "שומר..." : "שמור איש קשר"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
