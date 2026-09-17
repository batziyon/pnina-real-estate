"use client";

/**
 * Property Form — Client Component
 *
 * Handles property creation and editing with validation.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UpdatePropertySchemaClient } from "@/validations/property.schema.client";
import type { NeighborhoodData } from "@/domain/neighborhood/neighborhood.types";
import type { UserData } from "@/domain/user/user.types";
import type { PropertyData, DealType, PropertyType } from "@/domain/property/property.types";
import { PropertyMediaUpload } from "./PropertyMediaUpload";
import { PropertyVideoUpload } from "./PropertyVideoUpload";

interface PropertyFormProps {
  neighborhoods: NeighborhoodData[];
  agents: UserData[];
  userRole: string;
  initialData?: PropertyData;
}

export function PropertyForm({
  neighborhoods,
  agents,
  userRole,
  initialData,
}: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    dealType: (initialData?.dealType || "SALE") as DealType,
    propertyType: (initialData?.propertyType || "APARTMENT") as PropertyType,
    price: initialData?.price || "",
    neighborhoodId: initialData?.neighborhoodId || "",
    address: initialData?.address || "",
    rooms: initialData?.rooms || "",
    area: initialData?.area || "",
    floor: initialData?.floor?.toString() || "",
    totalFloors: initialData?.totalFloors?.toString() || "",
    agentId: initialData?.agentId || "",
    projectId: initialData?.projectId || "",
    // Features
    parking: initialData?.parking || false,
    elevator: initialData?.elevator || false,
    balcony: initialData?.balcony || false,
    safeRoom: initialData?.safeRoom || false,
    storage: initialData?.storage || false,
    airConditioning: initialData?.airConditioning || false,
    accessible: initialData?.accessible || false,
    furnished: initialData?.furnished || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      // Client-side Zod validation with Hebrew messages
      const validationPayload = {
        ...formData,
        floor: formData.floor ? parseInt(formData.floor, 10) : null,
        totalFloors: formData.totalFloors
          ? parseInt(formData.totalFloors, 10)
          : null,
        agentId: formData.agentId || undefined,
        projectId: formData.projectId || undefined,
      };

      const result = UpdatePropertySchemaClient.safeParse(validationPayload);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join(".");
          fieldErrors[path] = err.message;
        });
        setValidationErrors(fieldErrors);
        setError("יש לתקן את השגיאות בטופס");
        return;
      }

      const url = isEdit
        ? `/api/admin/properties/${initialData.id}`
        : "/api/admin/properties";

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validationPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save property");
      }

      const property = await response.json();
      router.push(`/admin/properties/${property.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירת הנכס");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">מידע בסיסי</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            כותרת *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {validationErrors.title && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            תיאור
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {validationErrors.description && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג עסקה *
            </label>
            <select
              required
              value={formData.dealType}
              onChange={(e) =>
                setFormData({ ...formData, dealType: e.target.value as DealType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="SALE">מכירה</option>
              <option value="RENT">השכרה</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג נכס *
            </label>
            <select
              required
              value={formData.propertyType}
              onChange={(e) =>
                setFormData({ ...formData, propertyType: e.target.value as PropertyType })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מחיר *
            </label>
            <input
              type="text"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            {validationErrors.price && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שכונה *
            </label>
            <select
              required
              value={formData.neighborhoodId}
              onChange={(e) =>
                setFormData({ ...formData, neighborhoodId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">בחר שכונה</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
            {validationErrors.neighborhoodId && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.neighborhoodId}</p>
            )}
          </div>
        </div>

        {/* Agent Assignment */}
        {(userRole === "ADMIN" || userRole === "EDITOR") && agents.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוכן מטפל
            </label>
            <select
              value={formData.agentId}
              onChange={(e) =>
                setFormData({ ...formData, agentId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">בחר סוכן</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">פרטי הנכס</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            כתובת
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              חדרים
            </label>
            <input
              type="text"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="3.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שטח (מ&quot;ר)
            </label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              קומה
            </label>
            <input
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מתוך כמה קומות
            </label>
            <input
              type="number"
              value={formData.totalFloors}
              onChange={(e) =>
                setFormData({ ...formData, totalFloors: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">מאפיינים</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "parking", label: "חניה" },
            { key: "elevator", label: "מעלית" },
            { key: "balcony", label: "מרפסת" },
            { key: "safeRoom", label: "ממ״ד" },
            { key: "storage", label: "מחסן" },
            { key: "airConditioning", label: "מזגן" },
            { key: "accessible", label: "נגיש" },
            { key: "furnished", label: "מרוהט" },
          ].map((feature) => (
            <label key={feature.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData[feature.key as keyof typeof formData] as boolean}
                onChange={(e) =>
                  setFormData({ ...formData, [feature.key]: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{feature.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Media Section */}
      {isEdit && initialData && (
        <>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">תמונות</h2>
            <PropertyMediaUpload
              propertyId={initialData.id}
              onUploadComplete={() => {
                // Refresh page to show new images
                window.location.reload();
              }}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">סרטוני הנכס</h2>
            <PropertyVideoUpload
              propertyId={initialData.id}
              onUploadComplete={() => {
                // Refresh page to show new videos
                window.location.reload();
              }}
            />
          </div>
        </>
      )}

      {/* Publish Settings */}
      {isEdit && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">הגדרות פרסום</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>סטטוס נוכחי:</strong>{" "}
              {initialData?.status === "DRAFT" && "טיוטה"}
              {initialData?.status === "PUBLISHED" && "פורסם"}
              {initialData?.status === "UNDER_CONTRACT" && "בחוזה"}
              {initialData?.status === "SOLD" && "נמכר"}
              {initialData?.status === "RENTED" && "הושכר"}
              {initialData?.status === "ARCHIVED" && "בארכיון"}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              לשינוי סטטוס הפרסום, השתמש בכפתורי הפעולה בעמוד הנכס.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
        >
          {loading ? "שומר..." : isEdit ? "עדכן נכס" : "צור נכס"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
