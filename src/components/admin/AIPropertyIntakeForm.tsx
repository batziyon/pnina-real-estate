"use client";

/**
 * AI Property Intake Form
 *
 * Allows admin/agent to paste free-text property description and extract
 * structured property data using AI.
 *
 * Flow:
 * 1. User pastes property description (Hebrew/English)
 * 2. Click "חלץ נתונים" → API call
 * 3. Show loading state
 * 4. Display extraction result with confidence indicators
 * 5. User can edit extracted values
 * 6. Click "שמור טיוטה" → navigate to property edit page
 *
 * Features:
 * - Confidence badges (HIGH: green, MEDIUM: yellow, LOW: red)
 * - Editable extracted values
 * - Warnings for missing/uncertain fields
 * - Clear indication this is a DRAFT
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PropertyExtractionResult } from "@/ai/domain/types/property-extraction-result.types";
import type { PropertyData } from "@/domain/property/property.types";

interface AIExtractResponse {
  success: boolean;
  property: PropertyData;
  extraction: PropertyExtractionResult;
  warnings: string[];
}

export function AIPropertyIntakeForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<AIExtractResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError("נא להזין תיאור נכס של לפחות 20 תווים");
      return;
    }

    setError(null);
    setIsExtracting(true);

    try {
      const response = await fetch("/api/admin/properties/ai-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "שגיאה בחילוץ נתונים");
      }

      setResult(data);
    } catch (err) {
      console.error("AI extraction error:", err);
      setError(err instanceof Error ? err.message : "שגיאה לא צפויה");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveDraft = () => {
    if (!result?.property.id) return;
    router.push(`/admin/properties/${result.property.id}/edit`);
  };

  const getConfidenceBadge = (fieldConfidence: { confidence: number; reason?: string }) => {
    // Convert 0-1 scale to HIGH/MEDIUM/LOW
    let level: "HIGH" | "MEDIUM" | "LOW";
    if (fieldConfidence.confidence >= 0.8) {
      level = "HIGH";
    } else if (fieldConfidence.confidence >= 0.5) {
      level = "MEDIUM";
    } else {
      level = "LOW";
    }

    const colors = {
      HIGH: "bg-green-100 text-green-800 border-green-300",
      MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
      LOW: "bg-red-100 text-red-800 border-red-300",
    };

    const labels = {
      HIGH: "ביטחון גבוה",
      MEDIUM: "ביטחון בינוני",
      LOW: "ביטחון נמוך",
    };

    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-medium border rounded ${colors[level]}`}
        title={fieldConfidence.reason}
      >
        {labels[level]} ({Math.round(fieldConfidence.confidence * 100)}%)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          ✨ יצירת נכס באמצעות AI
        </h2>
        <p className="text-sm text-blue-700">
          הדבק תיאור נכס בעברית או אנגלית, והמערכת תחלץ את הנתונים המובנים באופן
          אוטומטי. התוצאה תישמר כ<strong>טיוטה</strong> ותצריך אישור ידני לפני
          פרסום.
        </p>
      </div>

      {/* Input Section */}
      {!result && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              תיאור הנכס (מינימום 20 תווים)
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="דוגמה:

דירת 4 חדרים למכירה בתל אביב, רחוב דיזנגוף 100
דירה מרווחת בקומה 3 עם מעלית
80 מ״ר + מרפסת 15 מ״ר
3 כיווני אוויר, משופצת לחלוטין
מיזוג מרכזי, חניה, מחסן
מחיר: 3,500,000 ₪
זמין לכניסה מיידית"
              disabled={isExtracting}
            />
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={isExtracting || !text.trim()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isExtracting ? "מחלץ נתונים..." : "חלץ נתונים באמצעות AI"}
          </button>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Success Header */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              ✓ נתונים חולצו בהצלחה
            </h3>
            <p className="text-sm text-green-700">
              הנכס נשמר כ<strong>טיוטה</strong>. נא לבדוק את הנתונים ולערוך אותם
              במידת הצורך לפני הפרסום.
            </p>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                ⚠️ שים לב
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {result.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Extracted Fields */}
          <div className="border border-gray-200 rounded-lg divide-y">
            <div className="bg-gray-50 px-4 py-3">
              <h4 className="font-semibold text-gray-900">שדות שחולצו</h4>
            </div>

            {/* Title */}
            <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
              <div className="text-sm font-medium text-gray-700">כותרת</div>
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  {getConfidenceBadge(result.extraction.title.confidence)}
                </div>
                <div className="text-sm text-gray-900">
                  {result.extraction.title.value || "(לא חולץ)"}
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
              <div className="text-sm font-medium text-gray-700">סוג נכס</div>
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  {getConfidenceBadge(result.extraction.propertyType.confidence)}
                </div>
                <div className="text-sm text-gray-900">
                  {result.extraction.propertyType.value || "(לא חולץ)"}
                </div>
              </div>
            </div>

            {/* Deal Type */}
            <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
              <div className="text-sm font-medium text-gray-700">סוג עסקה</div>
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  {getConfidenceBadge(result.extraction.dealType.confidence)}
                </div>
                <div className="text-sm text-gray-900">
                  {result.extraction.dealType.value || "(לא חולץ)"}
                </div>
              </div>
            </div>

            {/* Price */}
            {result.extraction.price && (
              <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
                <div className="text-sm font-medium text-gray-700">מחיר</div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getConfidenceBadge(result.extraction.price.confidence)}
                  </div>
                  <div className="text-sm text-gray-900">
                    {result.extraction.price.value ? `₪${result.extraction.price.value}` : "(לא חולץ)"}
                  </div>
                </div>
              </div>
            )}

            {/* Rooms */}
            {result.extraction.rooms && (
              <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
                <div className="text-sm font-medium text-gray-700">חדרים</div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getConfidenceBadge(result.extraction.rooms.confidence)}
                  </div>
                  <div className="text-sm text-gray-900">
                    {result.extraction.rooms.value}
                  </div>
                </div>
              </div>
            )}

            {/* Area */}
            {result.extraction.area && (
              <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
                <div className="text-sm font-medium text-gray-700">שטח</div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getConfidenceBadge(result.extraction.area.confidence)}
                  </div>
                  <div className="text-sm text-gray-900">
                    {result.extraction.area.value} מ״ר
                  </div>
                </div>
              </div>
            )}

            {/* Floor */}
            {result.extraction.floor !== undefined && (
              <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
                <div className="text-sm font-medium text-gray-700">קומה</div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getConfidenceBadge(result.extraction.floor.confidence)}
                  </div>
                  <div className="text-sm text-gray-900">
                    {result.extraction.floor.value}
                  </div>
                </div>
              </div>
            )}

            {/* Neighborhood */}
            <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
              <div className="text-sm font-medium text-gray-700">שכונה</div>
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  {getConfidenceBadge(
                    result.extraction.neighborhoodName.confidence
                  )}
                </div>
                <div className="text-sm text-gray-900">
                  {result.extraction.neighborhoodName.value || "(לא חולץ)"}
                </div>
              </div>
            </div>

            {/* Description */}
            {result.extraction.description && (
              <div className="px-4 py-3 grid grid-cols-3 gap-4 items-start">
                <div className="text-sm font-medium text-gray-700">תיאור</div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getConfidenceBadge(result.extraction.description.confidence)}
                  </div>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {result.extraction.description.value}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSaveDraft}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ערוך טיוטה
            </button>
            <button
              onClick={() => {
                setResult(null);
                setText("");
                setError(null);
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              התחל מחדש
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
