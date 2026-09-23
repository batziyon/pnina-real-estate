"use client";

/**
 * Buyer Requirement Form — Hebrew RTL
 *
 * Reusable form component for creating and editing buyer requirements.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Neighborhood {
  id: string;
  name: string;
  active: boolean;
}

interface NeighborhoodPreference {
  neighborhoodId: string;
  preferenceType: "REQUIRED" | "PREFERRED";
}

interface BuyerRequirementFormProps {
  mode: "create" | "edit";
  contactId: string;
  requirement?: {
    id: string;
    dealType: string;
    propertyType: string | null;
    minRooms: number | null;
    maxRooms: number | null;
    minArea: number | null;
    maxArea: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    notes: string | null;
    neighborhoods: Array<{
      neighborhoodId: string;
      preferenceType: string;
      neighborhoodName?: string;
    }>;
  };
  neighborhoods: Neighborhood[];
}

interface FormErrors {
  dealType?: string;
  propertyType?: string;
  minRooms?: string;
  maxRooms?: string;
  minArea?: string;
  maxArea?: string;
  minPrice?: string;
  maxPrice?: string;
  notes?: string;
  neighborhoods?: string;
  _form?: string;
}

export function BuyerRequirementForm({
  mode,
  contactId,
  requirement,
  neighborhoods,
}: BuyerRequirementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    dealType: requirement?.dealType || "SALE",
    propertyType: requirement?.propertyType || "",
    minRooms: requirement?.minRooms?.toString() || "",
    maxRooms: requirement?.maxRooms?.toString() || "",
    minArea: requirement?.minArea?.toString() || "",
    maxArea: requirement?.maxArea?.toString() || "",
    minPrice: requirement?.minPrice?.toString() || "",
    maxPrice: requirement?.maxPrice?.toString() || "",
    notes: requirement?.notes || "",
    // PHASE 2 fields
    minFloor: (requirement as any)?.minFloor?.toString() || "",
    maxFloor: (requirement as any)?.maxFloor?.toString() || "",
    requiresElevator: (requirement as any)?.requiresElevator || false,
    requiresParking: (requirement as any)?.requiresParking || false,
    requiresBalcony: (requirement as any)?.requiresBalcony || false,
    requiresSafeRoom: (requirement as any)?.requiresSafeRoom || false,
    accessibilityRequired: (requirement as any)?.accessibilityRequired || false,
    renovationPreference: (requirement as any)?.renovationPreference || "",
    newConstructionPreference: (requirement as any)?.newConstructionPreference === null ? "" : String((requirement as any)?.newConstructionPreference || ""),
    moveInTimeframe: (requirement as any)?.moveInTimeframe || "",
  });

  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<
    NeighborhoodPreference[]
  >(
    requirement?.neighborhoods.map((n) => ({
      neighborhoodId: n.neighborhoodId,
      preferenceType: n.preferenceType as "REQUIRED" | "PREFERRED",
    })) || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccess(false);

    try {
      // Build request payload
      const payload: Record<string, unknown> = {
        dealType: formData.dealType,
        propertyType: formData.propertyType || null,
        minRooms: formData.minRooms ? parseFloat(formData.minRooms) : null,
        maxRooms: formData.maxRooms ? parseFloat(formData.maxRooms) : null,
        minArea: formData.minArea ? parseFloat(formData.minArea) : null,
        maxArea: formData.maxArea ? parseFloat(formData.maxArea) : null,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
        notes: formData.notes.trim() || null,
        neighborhoods: selectedNeighborhoods,
        // PHASE 2 fields
        minFloor: formData.minFloor ? parseFloat(formData.minFloor) : null,
        maxFloor: formData.maxFloor ? parseFloat(formData.maxFloor) : null,
        requiresElevator: formData.requiresElevator,
        requiresParking: formData.requiresParking,
        requiresBalcony: formData.requiresBalcony,
        requiresSafeRoom: formData.requiresSafeRoom,
        accessibilityRequired: formData.accessibilityRequired,
        renovationPreference: formData.renovationPreference.trim() || null,
        newConstructionPreference: formData.newConstructionPreference === "" ? null : formData.newConstructionPreference === "true",
        moveInTimeframe: formData.moveInTimeframe.trim() || null,
      };

      // API call
      const url =
        mode === "create"
          ? `/api/admin/contacts/${contactId}/requirements`
          : `/api/admin/contacts/${contactId}/requirements/${requirement?.id}`;
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
          setErrors({ _form: data.message || "שגיאה בשמירת הדרישה" });
        }
        return;
      }

      // Success
      setSuccess(true);

      // Navigate back to contact page
      setTimeout(() => {
        router.push(`/admin/contacts/${contactId}`);
        router.refresh();
      }, 1000);
    } catch {
      setErrors({ _form: "שגיאה בחיבור לשרת" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNeighborhood = () => {
    setSelectedNeighborhoods([
      ...selectedNeighborhoods,
      { neighborhoodId: "", preferenceType: "PREFERRED" },
    ]);
  };

  const removeNeighborhood = (index: number) => {
    setSelectedNeighborhoods(selectedNeighborhoods.filter((_, i) => i !== index));
  };

  const updateNeighborhood = (
    index: number,
    field: "neighborhoodId" | "preferenceType",
    value: string
  ) => {
    const updated = [...selectedNeighborhoods];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedNeighborhoods(updated);
  };

  const activeNeighborhoods = neighborhoods.filter((n) => n.active);
  const selectedIds = selectedNeighborhoods.map((n) => n.neighborhoodId);

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
            ✓ הדרישה נשמרה בהצלחה! מעביר לדף איש הקשר...
          </p>
        </div>
      )}

      {/* Deal Type */}
      <div>
        <label
          htmlFor="dealType"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          סוג עסקה <span className="text-red-500">*</span>
        </label>
        <select
          id="dealType"
          value={formData.dealType}
          onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.dealType ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isSubmitting}
        >
          <option value="SALE">קנייה</option>
          <option value="RENT">שכירות</option>
        </select>
        {errors.dealType && (
          <p className="mt-1 text-sm text-red-600">{errors.dealType}</p>
        )}
      </div>

      {/* Property Type */}
      <div>
        <label
          htmlFor="propertyType"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          סוג נכס
        </label>
        <select
          id="propertyType"
          value={formData.propertyType}
          onChange={(e) =>
            setFormData({ ...formData, propertyType: e.target.value })
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.propertyType ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isSubmitting}
        >
          <option value="">הכל</option>
          <option value="APARTMENT">דירה</option>
          <option value="PENTHOUSE">פנטהאוז</option>
          <option value="HOUSE">בית</option>
          <option value="VILLA">וילה</option>
          <option value="DUPLEX">דופלקס</option>
          <option value="STUDIO">סטודיו</option>
          <option value="OFFICE">משרד</option>
          <option value="COMMERCIAL">מסחרי</option>
          <option value="LAND">קרקע</option>
          <option value="OTHER">אחר</option>
        </select>
        {errors.propertyType && (
          <p className="mt-1 text-sm text-red-600">{errors.propertyType}</p>
        )}
      </div>

      {/* Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="minRooms"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            מספר חדרים מינימלי
          </label>
          <input
            type="number"
            id="minRooms"
            value={formData.minRooms}
            onChange={(e) =>
              setFormData({ ...formData, minRooms: e.target.value })
            }
            step="0.5"
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.minRooms ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="לדוגמה: 3"
            disabled={isSubmitting}
          />
          {errors.minRooms && (
            <p className="mt-1 text-sm text-red-600">{errors.minRooms}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="maxRooms"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            מספר חדרים מקסימלי
          </label>
          <input
            type="number"
            id="maxRooms"
            value={formData.maxRooms}
            onChange={(e) =>
              setFormData({ ...formData, maxRooms: e.target.value })
            }
            step="0.5"
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.maxRooms ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="לדוגמה: 5"
            disabled={isSubmitting}
          />
          {errors.maxRooms && (
            <p className="mt-1 text-sm text-red-600">{errors.maxRooms}</p>
          )}
        </div>
      </div>

      {/* Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="minArea"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            שטח מינימלי (מ&quot;ר)
          </label>
          <input
            type="number"
            id="minArea"
            value={formData.minArea}
            onChange={(e) =>
              setFormData({ ...formData, minArea: e.target.value })
            }
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.minArea ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="לדוגמה: 90 מ&quot;ר"
            disabled={isSubmitting}
          />
          {errors.minArea && (
            <p className="mt-1 text-sm text-red-600">{errors.minArea}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="maxArea"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            שטח מקסימלי (מ&quot;ר)
          </label>
          <input
            type="number"
            id="maxArea"
            value={formData.maxArea}
            onChange={(e) =>
              setFormData({ ...formData, maxArea: e.target.value })
            }
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.maxArea ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="לדוגמה: 130 מ&quot;ר"
            disabled={isSubmitting}
          />
          {errors.maxArea && (
            <p className="mt-1 text-sm text-red-600">{errors.maxArea}</p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="minPrice"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            מחיר מינימלי (₪)
          </label>
          <input
            type="number"
            id="minPrice"
            value={formData.minPrice}
            onChange={(e) =>
              setFormData({ ...formData, minPrice: e.target.value })
            }
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.minPrice ? "border-red-500" : "border-gray-300"
            }`}
            placeholder={formData.dealType === "RENT" ? "לדוגמה: 5000" : "לדוגמה: 1800000"}
            disabled={isSubmitting}
          />
          {errors.minPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.minPrice}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="maxPrice"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            מחיר מקסימלי (₪)
          </label>
          <input
            type="number"
            id="maxPrice"
            value={formData.maxPrice}
            onChange={(e) =>
              setFormData({ ...formData, maxPrice: e.target.value })
            }
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.maxPrice ? "border-red-500" : "border-gray-300"
            }`}
            placeholder={formData.dealType === "RENT" ? "לדוגמה: 8000" : "לדוגמה: 2800000"}
            disabled={isSubmitting}
          />
          {errors.maxPrice && (
            <p className="mt-1 text-sm text-red-600">{errors.maxPrice}</p>
          )}
        </div>
      </div>

      {/* Neighborhoods */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          שכונות
        </label>
        <div className="space-y-3">
          {selectedNeighborhoods.map((pref, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={pref.neighborhoodId}
                onChange={(e) =>
                  updateNeighborhood(index, "neighborhoodId", e.target.value)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="">בחר שכונה</option>
                {activeNeighborhoods
                  .filter(
                    (n) =>
                      n.id === pref.neighborhoodId || !selectedIds.includes(n.id)
                  )
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
              </select>
              <select
                value={pref.preferenceType}
                onChange={(e) =>
                  updateNeighborhood(
                    index,
                    "preferenceType",
                    e.target.value as "REQUIRED" | "PREFERRED"
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="REQUIRED">חובה</option>
                <option value="PREFERRED">מועדף</option>
              </select>
              <button
                type="button"
                onClick={() => removeNeighborhood(index)}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                disabled={isSubmitting}
              >
                הסר
              </button>
            </div>
          ))}
          {selectedNeighborhoods.length < activeNeighborhoods.length && (
            <button
              type="button"
              onClick={addNeighborhood}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              + הוסף שכונה
            </button>
          )}
        </div>
        {errors.neighborhoods && (
          <p className="mt-1 text-sm text-red-600">{errors.neighborhoods}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          הערות לדרישה
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.notes ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="לדוגמה: לקוח גמיש באזור, מעדיף קומה גבוהה ומרפסת"
          disabled={isSubmitting}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
        )}
      </div>

      {/* PHASE 2 - Enhanced Requirements */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">דרישות מפורטות</h3>
        
        {/* Floor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="minFloor" className="block text-sm font-medium text-gray-700 mb-2">
              קומה מינימלית
            </label>
            <input
              type="number"
              id="minFloor"
              value={formData.minFloor}
              onChange={(e) => setFormData({ ...formData, minFloor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="maxFloor" className="block text-sm font-medium text-gray-700 mb-2">
              קומה מקסימלית
            </label>
            <input
              type="number"
              id="maxFloor"
              value={formData.maxFloor}
              onChange={(e) => setFormData({ ...formData, maxFloor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="20"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresElevator"
              checked={formData.requiresElevator}
              onChange={(e) => setFormData({ ...formData, requiresElevator: e.target.checked })}
              className="w-4 h-4"
              disabled={isSubmitting}
            />
            <label htmlFor="requiresElevator" className="text-sm">דורש מעלית</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresParking"
              checked={formData.requiresParking}
              onChange={(e) => setFormData({ ...formData, requiresParking: e.target.checked })}
              className="w-4 h-4"
              disabled={isSubmitting}
            />
            <label htmlFor="requiresParking" className="text-sm">דורש חניה</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresBalcony"
              checked={formData.requiresBalcony}
              onChange={(e) => setFormData({ ...formData, requiresBalcony: e.target.checked })}
              className="w-4 h-4"
              disabled={isSubmitting}
            />
            <label htmlFor="requiresBalcony" className="text-sm">דורש מרפסת</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresSafeRoom"
              checked={formData.requiresSafeRoom}
              onChange={(e) => setFormData({ ...formData, requiresSafeRoom: e.target.checked })}
              className="w-4 h-4"
              disabled={isSubmitting}
            />
            <label htmlFor="requiresSafeRoom" className="text-sm">דורש ממ&quot;ד</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="accessibilityRequired"
              checked={formData.accessibilityRequired}
              onChange={(e) => setFormData({ ...formData, accessibilityRequired: e.target.checked })}
              className="w-4 h-4"
              disabled={isSubmitting}
            />
            <label htmlFor="accessibilityRequired" className="text-sm">דרישות נגישות</label>
          </div>
        </div>

        {/* Renovation & Construction */}
        <div className="space-y-4">
          <div>
            <label htmlFor="renovationPreference" className="block text-sm font-medium text-gray-700 mb-2">
              העדפת שיפוץ
            </label>
            <input
              type="text"
              id="renovationPreference"
              value={formData.renovationPreference}
              onChange={(e) => setFormData({ ...formData, renovationPreference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="משופץ / דורש שיפוץ / גמיש"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="newConstructionPreference" className="block text-sm font-medium text-gray-700 mb-2">
              העדפת בנייה חדשה
            </label>
            <select
              id="newConstructionPreference"
              value={formData.newConstructionPreference}
              onChange={(e) => setFormData({ ...formData, newConstructionPreference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              disabled={isSubmitting}
            >
              <option value="">לא משנה</option>
              <option value="true">בנייה חדשה בלבד</option>
              <option value="false">לא בנייה חדשה</option>
            </select>
          </div>
          <div>
            <label htmlFor="moveInTimeframe" className="block text-sm font-medium text-gray-700 mb-2">
              מועד כניסה מבוקש
            </label>
            <input
              type="text"
              id="moveInTimeframe"
              value={formData.moveInTimeframe}
              onChange={(e) => setFormData({ ...formData, moveInTimeframe: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="מיידי / 3 חודשים / גמיש"
              disabled={isSubmitting}
            />
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
          {isSubmitting ? "שומר..." : "שמור דרישה"}
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
