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
    // PHASE 2 - Enhanced fields
    preferredName: (contact as any)?.preferredName || "",
    secondaryPhone: (contact as any)?.secondaryPhone || "",
    secondaryEmail: (contact as any)?.secondaryEmail || "",
    preferredCommunication: (contact as any)?.preferredCommunication || "PHONE",
    currentCity: (contact as any)?.currentCity || "",
    currentNeighborhood: (contact as any)?.currentNeighborhood || "",
    currentAddress: (contact as any)?.currentAddress || "",
    currentPropertyStatus: (contact as any)?.currentPropertyStatus || "",
    interestedInSelling: (contact as any)?.interestedInSelling || false,
    sellingTimeframe: (contact as any)?.sellingTimeframe || "",
    sellingReason: (contact as any)?.sellingReason || "",
    valuationRequested: (contact as any)?.valuationRequested || false,
    valuationCompleted: (contact as any)?.valuationCompleted || false,
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
        // PHASE 2 - Enhanced fields
        preferredName: formData.preferredName.trim() || null,
        secondaryPhone: formData.secondaryPhone.trim() || null,
        secondaryEmail: formData.secondaryEmail.trim() || null,
        preferredCommunication: formData.preferredCommunication,
        currentCity: formData.currentCity.trim() || null,
        currentNeighborhood: formData.currentNeighborhood.trim() || null,
        currentAddress: formData.currentAddress.trim() || null,
        currentPropertyStatus: formData.currentPropertyStatus.trim() || null,
        interestedInSelling: formData.interestedInSelling,
        sellingTimeframe: formData.sellingTimeframe.trim() || null,
        sellingReason: formData.sellingReason.trim() || null,
        valuationRequested: formData.valuationRequested,
        valuationCompleted: formData.valuationCompleted,
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

      {/* PHASE 2 - Enhanced Contact Fields */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">מידע נוסף</h3>
        
        <div className="space-y-4">
          {/* Preferred Name */}
          <div>
            <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700 mb-2">
              שם מועדף
            </label>
            <input
              type="text"
              id="preferredName"
              value={formData.preferredName}
              onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="איך לפנות ללקוח"
              disabled={isSubmitting}
            />
          </div>

          {/* Secondary Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="secondaryPhone" className="block text-sm font-medium text-gray-700 mb-2">
                טלפון משני
              </label>
              <input
                type="tel"
                id="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="secondaryEmail" className="block text-sm font-medium text-gray-700 mb-2">
                אימייל משני
              </label>
              <input
                type="email"
                id="secondaryEmail"
                value={formData.secondaryEmail}
                onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Preferred Communication */}
          <div>
            <label htmlFor="preferredCommunication" className="block text-sm font-medium text-gray-700 mb-2">
              אמצעי תקשורת מועדף
            </label>
            <select
              id="preferredCommunication"
              value={formData.preferredCommunication}
              onChange={(e) => setFormData({ ...formData, preferredCommunication: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={isSubmitting}
            >
              <option value="PHONE">טלפון</option>
              <option value="EMAIL">אימייל</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>

          {/* Current Property Info */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold mb-3">נכס נוכחי</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700 mb-2">
                    עיר
                  </label>
                  <input
                    type="text"
                    id="currentCity"
                    value={formData.currentCity}
                    onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="currentNeighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                    שכונה
                  </label>
                  <input
                    type="text"
                    id="currentNeighborhood"
                    value={formData.currentNeighborhood}
                    onChange={(e) => setFormData({ ...formData, currentNeighborhood: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  כתובת מלאה
                </label>
                <input
                  type="text"
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="currentPropertyStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  סטטוס נכס
                </label>
                <input
                  type="text"
                  id="currentPropertyStatus"
                  value={formData.currentPropertyStatus}
                  onChange={(e) => setFormData({ ...formData, currentPropertyStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="בעלות / שכירות / אחר"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Selling Interest */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold mb-3">עניין במכירה</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="interestedInSelling"
                  checked={formData.interestedInSelling}
                  onChange={(e) => setFormData({ ...formData, interestedInSelling: e.target.checked })}
                  className="w-4 h-4"
                  disabled={isSubmitting}
                />
                <label htmlFor="interestedInSelling" className="text-sm font-medium text-gray-700">
                  מעוניין למכור נכס נוכחי
                </label>
              </div>
              {formData.interestedInSelling && (
                <>
                  <div>
                    <label htmlFor="sellingTimeframe" className="block text-sm font-medium text-gray-700 mb-2">
                      מסגרת זמן למכירה
                    </label>
                    <input
                      type="text"
                      id="sellingTimeframe"
                      value={formData.sellingTimeframe}
                      onChange={(e) => setFormData({ ...formData, sellingTimeframe: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="דחוף / 3-6 חודשים / אחר"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="sellingReason" className="block text-sm font-medium text-gray-700 mb-2">
                      סיבת המכירה
                    </label>
                    <input
                      type="text"
                      id="sellingReason"
                      value={formData.sellingReason}
                      onChange={(e) => setFormData({ ...formData, sellingReason: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Valuation */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold mb-3">שומה</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="valuationRequested"
                  checked={formData.valuationRequested}
                  onChange={(e) => setFormData({ ...formData, valuationRequested: e.target.checked })}
                  className="w-4 h-4"
                  disabled={isSubmitting}
                />
                <label htmlFor="valuationRequested" className="text-sm font-medium text-gray-700">
                  ביקש שומה
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="valuationCompleted"
                  checked={formData.valuationCompleted}
                  onChange={(e) => setFormData({ ...formData, valuationCompleted: e.target.checked })}
                  className="w-4 h-4"
                  disabled={isSubmitting}
                />
                <label htmlFor="valuationCompleted" className="text-sm font-medium text-gray-700">
                  שומה הושלמה
                </label>
              </div>
            </div>
          </div>
        </div>
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
