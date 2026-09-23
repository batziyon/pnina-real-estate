"use client";

/**
 * Contact Form — Business-First UX
 * Simple, progressive disclosure form for real estate agents
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

type ContactRole = "BUYER" | "SELLER" | "RENTER" | "LANDLORD" | "INVESTOR" | "COLLABORATOR" | "OTHER";

interface ContactFormSimpleProps {
  mode: "create" | "edit";
  contact?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    notes: string | null;
    assignedAgentId: string | null;
    roles?: Array<{ role: ContactRole }>;
  };
  userRole: "ADMIN" | "AGENT" | "EDITOR";
  userId: string;
  agents?: Array<{ id: string; name: string; email: string }>;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  roles?: string;
  assignedAgentId?: string;
  _form?: string;
}

const roleLabels: Record<ContactRole, string> = {
  BUYER: "קונה",
  SELLER: "מוכר",
  RENTER: "שוכר",
  LANDLORD: "משכיר",
  INVESTOR: "משקיע",
  COLLABORATOR: "שיתוף פעולה",
  OTHER: "אחר",
};

export function ContactFormSimple({
  mode,
  contact,
  userRole,
  userId,
  agents = [],
}: ContactFormSimpleProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extract existing roles
  const existingRoles = contact?.roles?.map(r => r.role) || [];

  // Form state
  const [formData, setFormData] = useState({
    name: contact?.name || "",
    phone: contact?.phone || "",
    email: contact?.email || "",
    roles: existingRoles as ContactRole[],
    assignedAgentId:
      mode === "create" && userRole === "AGENT"
        ? userId
        : contact?.assignedAgentId || "",
  });

  // Advanced fields state
  const [advancedData, setAdvancedData] = useState({
    notes: contact?.notes || "",
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

  const toggleRole = (role: ContactRole) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  };

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
        roles: formData.roles,
        // Advanced fields (if shown)
        ...(showAdvanced && {
          notes: advancedData.notes.trim() || null,
          preferredName: advancedData.preferredName.trim() || null,
          secondaryPhone: advancedData.secondaryPhone.trim() || null,
          secondaryEmail: advancedData.secondaryEmail.trim() || null,
          preferredCommunication: advancedData.preferredCommunication,
          currentCity: advancedData.currentCity.trim() || null,
          currentNeighborhood: advancedData.currentNeighborhood.trim() || null,
          currentAddress: advancedData.currentAddress.trim() || null,
          currentPropertyStatus: advancedData.currentPropertyStatus.trim() || null,
          interestedInSelling: advancedData.interestedInSelling,
          sellingTimeframe: advancedData.sellingTimeframe.trim() || null,
          sellingReason: advancedData.sellingReason.trim() || null,
          valuationRequested: advancedData.valuationRequested,
          valuationCompleted: advancedData.valuationCompleted,
        }),
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

      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">פרטים בסיסיים</h3>

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
            autoFocus
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

        {/* Roles (Multi-select) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            תפקידים
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(roleLabels) as ContactRole[]).map((role) => (
              <label
                key={role}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  formData.roles.includes(role)
                    ? "bg-blue-50 border-blue-500"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="w-4 h-4"
                  disabled={isSubmitting}
                />
                <span className="text-sm">{roleLabels[role]}</span>
              </label>
            ))}
          </div>
          {errors.roles && (
            <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
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
                  {agent.name}
                </option>
              ))}
            </select>
            {errors.assignedAgentId && (
              <p className="mt-1 text-sm text-red-600">{errors.assignedAgentId}</p>
            )}
          </div>
        )}
      </div>

      {/* Advanced Information Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        disabled={isSubmitting}
      >
        {showAdvanced ? "▼" : "◀"} פרטים נוספים {showAdvanced ? "(הסתר)" : "(הצג)"}
      </button>

      {/* Advanced Fields */}
      {showAdvanced && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
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
              value={advancedData.notes}
              onChange={(e) =>
                setAdvancedData({ ...advancedData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="הערות פנימיות"
              disabled={isSubmitting}
            />
          </div>

          {/* Preferred Name */}
          <div>
            <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700 mb-2">
              שם מועדף
            </label>
            <input
              type="text"
              id="preferredName"
              value={advancedData.preferredName}
              onChange={(e) =>
                setAdvancedData({ ...advancedData, preferredName: e.target.value })
              }
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
                value={advancedData.secondaryPhone}
                onChange={(e) =>
                  setAdvancedData({ ...advancedData, secondaryPhone: e.target.value })
                }
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
                value={advancedData.secondaryEmail}
                onChange={(e) =>
                  setAdvancedData({ ...advancedData, secondaryEmail: e.target.value })
                }
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
              value={advancedData.preferredCommunication}
              onChange={(e) =>
                setAdvancedData({ ...advancedData, preferredCommunication: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={isSubmitting}
            >
              <option value="PHONE">טלפון</option>
              <option value="EMAIL">אימייל</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>

          {/* Current Property divider */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold mb-3 text-gray-900">מצב נוכחי</h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700 mb-2">
                    עיר
                  </label>
                  <input
                    type="text"
                    id="currentCity"
                    value={advancedData.currentCity}
                    onChange={(e) =>
                      setAdvancedData({ ...advancedData, currentCity: e.target.value })
                    }
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
                    value={advancedData.currentNeighborhood}
                    onChange={(e) =>
                      setAdvancedData({ ...advancedData, currentNeighborhood: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  כתובת
                </label>
                <input
                  type="text"
                  id="currentAddress"
                  value={advancedData.currentAddress}
                  onChange={(e) =>
                    setAdvancedData({ ...advancedData, currentAddress: e.target.value })
                  }
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
                  value={advancedData.currentPropertyStatus}
                  onChange={(e) =>
                    setAdvancedData({ ...advancedData, currentPropertyStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="בעלות / שכירות"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Selling Interest divider */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold mb-3 text-gray-900">עניין במכירה</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="interestedInSelling"
                  checked={advancedData.interestedInSelling}
                  onChange={(e) =>
                    setAdvancedData({ ...advancedData, interestedInSelling: e.target.checked })
                  }
                  className="w-4 h-4"
                  disabled={isSubmitting}
                />
                <label htmlFor="interestedInSelling" className="text-sm font-medium text-gray-700">
                  מעוניין למכור
                </label>
              </div>

              {advancedData.interestedInSelling && (
                <>
                  <div>
                    <label htmlFor="sellingTimeframe" className="block text-sm font-medium text-gray-700 mb-2">
                      מסגרת זמן
                    </label>
                    <input
                      type="text"
                      id="sellingTimeframe"
                      value={advancedData.sellingTimeframe}
                      onChange={(e) =>
                        setAdvancedData({ ...advancedData, sellingTimeframe: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="דחוף / 3-6 חודשים"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="sellingReason" className="block text-sm font-medium text-gray-700 mb-2">
                      סיבה
                    </label>
                    <input
                      type="text"
                      id="sellingReason"
                      value={advancedData.sellingReason}
                      onChange={(e) =>
                        setAdvancedData({ ...advancedData, sellingReason: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Valuation divider */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold mb-3 text-gray-900">שומה</h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="valuationRequested"
                  checked={advancedData.valuationRequested}
                  onChange={(e) =>
                    setAdvancedData({ ...advancedData, valuationRequested: e.target.checked })
                  }
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
                  checked={advancedData.valuationCompleted}
                  onChange={(e) =>
                    setAdvancedData({ ...advancedData, valuationCompleted: e.target.checked })
                  }
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
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || success}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "שומר..." : mode === "create" ? "צור איש קשר" : "שמור שינויים"}
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
