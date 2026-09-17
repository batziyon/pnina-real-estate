"use client";

/**
 * Valuation Request Form
 * 
 * Form for property valuation requests
 */

import { useState, useEffect } from "react";

interface Neighborhood {
  id: string;
  name: string;
}

export function ValuationRequestForm() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    neighborhoodId: "",
    address: "",
    propertyType: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        const response = await fetch("/api/neighborhoods");
        if (response.ok) {
          const data = await response.json();
          setNeighborhoods(data);
        }
      } catch (error) {
        console.error("Error fetching neighborhoods:", error);
      }
    }
    fetchNeighborhoods();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("/api/valuation-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          neighborhoodId: formData.neighborhoodId,
          address: formData.address || null,
          propertyType: formData.propertyType || null,
          message: formData.message || null,
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
          setErrors({ general: data.error?.message || "שגיאה בשליחת הבקשה" });
        }
        return;
      }

      setSubmitted(true);
    } catch (error) {
      setErrors({ general: "שגיאה בשליחת הבקשה. אנא נסו שוב." });
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
          הבקשה נשלחה בהצלחה!
        </h3>
        <p className="text-gray-600">
          תודה על פנייתכם. נחזור אליכם בהקדם עם הערכת שווי מקצועית.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">הערכת שווי</h3>
        <p className="text-sm text-gray-600 mb-6">
          קבלו הערכת שווי מקצועית לנכס שלכם ללא התחייבות
        </p>
      </div>

      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="val-name" className="block text-sm font-medium text-gray-700 mb-2">
            שם מלא <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="val-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="val-phone" className="block text-sm font-medium text-gray-700 mb-2">
            טלפון <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="val-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
            required
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="val-email" className="block text-sm font-medium text-gray-700 mb-2">
          אימייל
        </label>
        <input
          type="email"
          id="val-email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full px-4 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="val-neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
            שכונה <span className="text-red-500">*</span>
          </label>
          <select
            id="val-neighborhood"
            value={formData.neighborhoodId}
            onChange={(e) => setFormData({ ...formData, neighborhoodId: e.target.value })}
            className={`w-full px-4 py-2 border ${errors.neighborhoodId ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
            required
          >
            <option value="">בחר שכונה</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
          {errors.neighborhoodId && <p className="mt-1 text-sm text-red-600">{errors.neighborhoodId}</p>}
        </div>

        <div>
          <label htmlFor="val-property-type" className="block text-sm font-medium text-gray-700 mb-2">
            סוג נכס
          </label>
          <select
            id="val-property-type"
            value={formData.propertyType}
            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
            className={`w-full px-4 py-2 border ${errors.propertyType ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
          >
            <option value="">בחר סוג נכס</option>
            <option value="APARTMENT">דירה</option>
            <option value="PENTHOUSE">פנטהאוז</option>
            <option value="HOUSE">בית</option>
            <option value="VILLA">וילה</option>
            <option value="DUPLEX">דופלקס</option>
            <option value="STUDIO">סטודיו</option>
            <option value="OTHER">אחר</option>
          </select>
          {errors.propertyType && <p className="mt-1 text-sm text-red-600">{errors.propertyType}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="val-address" className="block text-sm font-medium text-gray-700 mb-2">
          כתובת
        </label>
        <input
          type="text"
          id="val-address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className={`w-full px-4 py-2 border ${errors.address ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
          placeholder="רחוב ומספר בית"
        />
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
      </div>

      <div>
        <label htmlFor="val-message" className="block text-sm font-medium text-gray-700 mb-2">
          פרטים נוספים
        </label>
        <textarea
          id="val-message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`w-full px-4 py-2 border ${errors.message ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#135C87]`}
          placeholder="מידע נוסף שיעזור לנו להעריך את הנכס..."
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3 text-base font-medium text-white bg-[#135C87] hover:bg-[#0f4a6d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "שולח..." : "שלח בקשה"}
      </button>
    </form>
  );
}
