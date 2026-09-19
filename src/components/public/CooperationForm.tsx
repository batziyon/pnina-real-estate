"use client";

/**
 * Cooperation Form
 * 
 * Form for professional cooperation inquiries
 */

import { useState } from "react";

export function CooperationForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "COOPERATION",
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          message: formData.message || null,
          propertyId: null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error?.details) {
          const fieldErrors: Record<string, string> = {};
          data.error.details.forEach((err: { path?: string[]; message: string }) => {
            if (err.path && err.path.length > 0) {
              fieldErrors[err.path[0]] = err.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error?.message || "שגיאה בשליחת הפנייה" });
        }
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setErrors({ general: "שגיאה בשליחת הפנייה. אנא נסו שוב." });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          הפנייה נשלחה בהצלחה!
        </h3>
        <p className="text-gray-600">
          תודה על פנייתכם. נחזור אליכם בהקדם לדון באפשרויות שיתוף הפעולה.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="mb-2 text-[1.35rem] font-semibold text-gray-900">שיתוף פעולה</h3>
        <p className="mb-6 text-[1rem] text-gray-600">
          מעוניינים בשיתוף פעולה מקצועי? נשמח לשמוע ממכם
        </p>
      </div>

      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {errors.general}
        </div>
      )}

      <div>
        <label htmlFor="coop-name" className="mb-2 block text-[1rem] font-medium text-gray-700">
          שם מלא <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="coop-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-4 py-3 text-[1rem] border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
          required
        />
        {errors.name && <p className="mt-1 text-[0.95rem] text-red-600">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="coop-phone" className="mb-2 block text-[1rem] font-medium text-gray-700">
            טלפון <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="coop-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-4 py-3 text-[1rem] border ${errors.phone ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
            required
          />
          {errors.phone && <p className="mt-1 text-[0.95rem] text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="coop-email" className="mb-2 block text-[1rem] font-medium text-gray-700">
            אימייל
          </label>
          <input
            type="email"
            id="coop-email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-3 text-[1rem] border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
          />
          {errors.email && <p className="mt-1 text-[0.95rem] text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="coop-message" className="mb-2 block text-[1rem] font-medium text-gray-700">
          הצעה / פרטים
        </label>
        <textarea
          id="coop-message"
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`w-full px-4 py-3 text-[1rem] border ${errors.message ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
          placeholder="ספרו לנו על ההצעה או סוג שיתוף הפעולה שמעניין אתכם..."
        />
        {errors.message && <p className="mt-1 text-[0.95rem] text-red-600">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3 text-[1rem] font-medium text-white bg-[#135C87] hover:bg-[#0f4a6d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "שולח..." : "שלח פנייה"}
      </button>
    </form>
  );
}
