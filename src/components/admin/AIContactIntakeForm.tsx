"use client";

/**
 * AI Contact Intake Form
 * 
 * Allows pasting free-text contact information and extracts structured data
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AIContactIntakeForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extraction, setExtraction] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) {
      setError("אנא הזן טקסט לחילוץ");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setExtraction(null);
    setWarnings([]);

    try {
      const response = await fetch("/api/admin/contacts/ai-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "שגיאה בחילוץ הנתונים");
      }

      const data = await response.json();
      setExtraction(data.extraction);
      setWarnings(data.warnings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בחילוץ הנתונים");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateContact = () => {
    if (!extraction) return;

    // Navigate to new contact page with extracted data as query params
    const params = new URLSearchParams();
    if (extraction.name?.value) params.set("name", extraction.name.value);
    if (extraction.phone?.value) params.set("phone", extraction.phone.value);
    if (extraction.email?.value) params.set("email", extraction.email.value);
    if (extraction.notes?.value) params.set("notes", extraction.notes.value);
    if (extraction.source?.value) params.set("source", extraction.source.value);
    if (extraction.stage?.value) params.set("stage", extraction.stage.value);
    
    // Add interests as comma-separated values
    if (extraction.interests?.value && Array.isArray(extraction.interests.value) && extraction.interests.value.length > 0) {
      params.set("interests", extraction.interests.value.join(", "));
    }

    router.push(`/admin/contacts/new?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          הדבק מידע על איש קשר
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
          placeholder={`דוגמה:
שם: דוד כהן
טלפון: 052-1234567
אימייל: david@example.com
הערות: מעוניין בדירה 4 חדרים ברחביה, תקציב עד 3 מיליון`}
          disabled={isExtracting}
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleExtract}
            disabled={isExtracting || !text.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExtracting ? "מחלץ נתונים..." : "🤖 חלץ נתונים"}
          </button>
          <button
            onClick={() => {
              setText("");
              setExtraction(null);
              setWarnings([]);
              setError(null);
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            נקה
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="font-semibold text-yellow-900 mb-2">⚠️ אזהרות:</p>
          <ul className="list-disc list-inside space-y-1">
            {warnings.map((warning, idx) => (
              <li key={idx} className="text-yellow-800 text-sm">{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Extraction Results */}
      {extraction && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              ✅ נתונים שחולצו
            </h3>
            {extraction.overallConfidence && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">רמת ביטחון:</span>
                <span className={`text-sm font-semibold ${
                  extraction.overallConfidence >= 0.8 ? 'text-green-600' :
                  extraction.overallConfidence >= 0.6 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {Math.round(extraction.overallConfidence * 100)}%
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם {extraction.name?.confidence?.confidence < 0.7 && (
                    <span className="text-yellow-600 text-xs">(ביטחון נמוך)</span>
                  )}
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {extraction.name?.value || <span className="text-gray-400">לא זוהה</span>}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון {extraction.phone?.confidence?.confidence < 0.7 && (
                    <span className="text-yellow-600 text-xs">(ביטחון נמוך)</span>
                  )}
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {extraction.phone?.value || <span className="text-gray-400">לא זוהה</span>}
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל {extraction.email?.confidence?.confidence < 0.7 && (
                    <span className="text-yellow-600 text-xs">(ביטחון נמוך)</span>
                  )}
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  {extraction.email?.value || <span className="text-gray-400">לא זוהה</span>}
                </div>
              </div>

              {/* Source */}
              {extraction.source?.value && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מקור
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {extraction.source.value}
                  </div>
                </div>
              )}

              {/* Stage */}
              {extraction.stage?.value && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שלב
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {extraction.stage.value}
                  </div>
                </div>
              )}

              {/* Interests */}
              {extraction.interests?.value && Array.isArray(extraction.interests.value) && extraction.interests.value.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    תחומי עניין ({extraction.interests.value.length})
                  </label>
                  <div className="flex flex-wrap gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {extraction.interests.value.map((interest: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {extraction.notes?.value && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    הערות
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap">
                    {extraction.notes.value}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleCreateContact}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ✓ צור איש קשר עם הנתונים האלה
              </button>
              <p className="text-sm text-gray-500 mt-2 text-center">
                תועבר לטופס יצירת איש קשר עם הנתונים שחולצו
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 טיפ:</strong> המערכת משתמשת ב-AI מתקדם (Gemini) כדי לחלץ מידע מטקסט חופשי.
          ניתן להדביק מידע בכל פורמט - המערכת תזהה שמות, טלפונים, אימיילים, ותחומי עניין.
          רמת הביטחון מראה כמה המערכת בטוחה בכל שדה.
        </p>
      </div>
    </div>
  );
}
