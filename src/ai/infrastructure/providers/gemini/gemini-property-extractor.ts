/**
 * Gemini Property Extractor Implementation
 *
 * Infrastructure layer — implements AIPropertyExtractor using Google Gemini.
 * This is the ONLY place where Gemini SDK is imported.
 *
 * Updated to use @google/genai SDK (current official Google GenAI SDK).
 */

import { GoogleGenAI } from "@google/genai";
import type { AIPropertyExtractor } from "@/ai/domain/interfaces/ai-property-extractor.interface";
import type { PropertyExtractionResult } from "@/ai/domain/types/property-extraction-result.types";
import { PropertyExtractionResultSchema } from "@/validations/ai-extraction.schema";
import { AIExtractionError } from "@/ai/application/errors/ai-extraction-error";
import { AIValidationError } from "@/ai/application/errors/ai-validation-error";
import { AIProviderUnavailableError } from "@/ai/application/errors/ai-provider-unavailable-error";

export class GeminiPropertyExtractor implements AIPropertyExtractor {
  private readonly ai: GoogleGenAI;
  private readonly modelName: string;

  constructor(apiKey: string, modelName = "gemini-3.6-flash") {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  async extractFromText(freeText: string): Promise<PropertyExtractionResult> {
    if (!freeText || freeText.trim().length === 0) {
      throw new AIExtractionError("Free text input is required");
    }

    const maxAttempts = 3;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const prompt = this.buildPrompt(freeText);

        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents: prompt,
          config: {
            temperature: 0.1, // Low temperature for extraction accuracy
            responseMimeType: "application/json",
            // Note: responseSchema is not used because it requires complex type definitions
            // We rely on the prompt and Zod validation instead
          },
        });

        const rawJson = response.text;

        if (!rawJson) {
          throw new AIExtractionError("AI returned empty response");
        }

        // Parse JSON
        let parsed: unknown;
        try {
          parsed = JSON.parse(rawJson);
        } catch (err) {
          throw new AIValidationError("AI returned invalid JSON", err);
        }

        // Add metadata
        const withMetadata = {
          ...(parsed as Record<string, unknown>),
          metadata: {
            provider: "gemini",
            model: this.modelName,
            extractedAt: new Date(),
          },
        };

        // Validate with Zod
        let validated;
        try {
          validated = PropertyExtractionResultSchema.parse(withMetadata);
        } catch (zodError) {
          // Provide detailed validation error
          if (zodError instanceof Error && 'issues' in zodError) {
            const zodIssues = zodError as { issues: Array<{ path: string[]; message: string }> };
            const errorDetails = zodIssues.issues.map((issue) =>
              `${issue.path.join('.')}: ${issue.message}`
            ).join('; ');
            throw new AIValidationError(
              `AI output validation failed: ${errorDetails}`,
              zodError
            );
          }
          throw new AIValidationError("AI output validation failed", zodError);
        }

        // Success - return immediately
        if (attempt > 1) {
          console.log(`[Gemini] Extraction succeeded on attempt ${attempt}`);
        }
        return validated as PropertyExtractionResult;

      } catch (error) {
        lastError = error;

        // Never retry validation errors - these are permanent issues
        if (error instanceof AIValidationError) {
          throw error;
        }

        // Check if this is a transient 503 error that should be retried
        const isRetryable = this.isTransient503Error(error);

        if (!isRetryable) {
          // Permanent error (auth, malformed request, etc.) - fail immediately
          throw new AIExtractionError(
            "Failed to extract property data from text",
            error
          );
        }

        // This is a transient 503/429 - retry if we have attempts left
        if (attempt < maxAttempts) {
          const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
          console.log(
            `[Gemini] Attempt ${attempt} failed with transient error (503/429). ` +
            `Retrying in ${delayMs}ms... (${maxAttempts - attempt} attempts remaining)`
          );
          await this.delay(delayMs);
          continue;
        }

        // All attempts exhausted - throw with original error preserved
        console.error(
          `[Gemini] All ${maxAttempts} attempts failed. Provider: ${this.modelName}`
        );
        throw new AIProviderUnavailableError(
          "AI provider is temporarily unavailable",
          error
        );
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new AIProviderUnavailableError(
      "AI provider is temporarily unavailable",
      lastError
    );
  }

  /**
   * Check if an error is a transient 503/UNAVAILABLE or 429/RESOURCE_EXHAUSTED that should be retried
   */
  private isTransient503Error(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    // Check direct error properties
    const err = error as { status?: number; code?: number; message?: string };
    if (err.status === 503 || err.code === 503 || err.status === 429 || err.code === 429) {
      return true;
    }

    // Check cause chain for nested 503/429
    const withCause = error as { cause?: unknown };
    if (withCause.cause && typeof withCause.cause === 'object') {
      const cause = withCause.cause as { status?: number; code?: number; message?: string };
      if (cause.status === 503 || cause.code === 503 || cause.status === 429 || cause.code === 429) {
        return true;
      }

      // Check for UNAVAILABLE or RESOURCE_EXHAUSTED status in message
      if (cause.message && (
        cause.message.includes('"status":"UNAVAILABLE"') ||
        cause.message.includes('"status":"RESOURCE_EXHAUSTED"')
      )) {
        return true;
      }
    }

    // Check message for status indicators
    if (err.message) {
      if (err.message.includes('"status":"UNAVAILABLE"') ||
          err.message.includes('"status":"RESOURCE_EXHAUSTED"') ||
          err.message.includes('"code":503') ||
          err.message.includes('"code":429')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Promise-based delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildPrompt(freeText: string): string {
    return `
אתה מערכת חילוץ מידע לנדל"ן בעברית.

קלט: תיאור חופשי של נכס בעברית.
פלט: JSON מובנה.

CRITICAL: כל שדה חייב להיות אובייקט עם המבנה הבא:
{
  "value": <ערך או null>,
  "confidence": {
    "confidence": <מספר בין 0.0 ל-1.0>,
    "reason": <הסבר אופציונלי>
  }
}

חוקים קריטיים:
1. חלץ ONLY מידע שנאמר במפורש בטקסט
2. אל תמציא או תנחש מידע חסר
3. אם שדה לא צוין - value יהיה null
4. עבור תכונות בוליאניות (parking, elevator וכו') - value יהיה true ONLY אם צוין במפורש, אחרת null
5. עבור מחיר - חלץ רק את המספר כמחרוזת (ללא ₪, "מיליון", "אלף")
6. עבור שכונה - חלץ את השם המדויק שצוין
7. עבור propertyType השתמש ב: "APARTMENT", "PENTHOUSE", "HOUSE", "VILLA", "DUPLEX", "STUDIO", "OFFICE", "COMMERCIAL", "LAND", "OTHER"
8. עבור dealType השתמש ב: "SALE" או "RENT"
9. confidence: 0.0-1.0 (גבוה רק אם המידע ברור ומפורש)
10. rooms, area, price חייבים להיות מחרוזות (strings)
11. floor, totalFloors חייבים להיות מספרים שלמים (integers) או null

דוגמאות לחילוץ:
- "דירת 4 חדרים" →
  rooms: {"value": "4", "confidence": {"confidence": 0.9}},
  propertyType: {"value": "APARTMENT", "confidence": {"confidence": 0.9}}
- "105 מ\"ר" → area: {"value": "105", "confidence": {"confidence": 0.9}}
- "קומה 3 מתוך 5" →
  floor: {"value": 3, "confidence": {"confidence": 0.9}},
  totalFloors: {"value": 5, "confidence": {"confidence": 0.9}}
- "מעלית" → elevator: {"value": true, "confidence": {"confidence": 0.9}}
- "3.2 מיליון ש\"ח" → price: {"value": "3200000", "confidence": {"confidence": 0.8}}
- "למכירה" → dealType: {"value": "SALE", "confidence": {"confidence": 1.0}}
- "להשכרה" → dealType: {"value": "RENT", "confidence": {"confidence": 1.0}}

אם מידע חסר - ה-value יהיה null עם confidence נמוך.

טקסט:
${freeText}

החזר JSON מובנה עם כל השדות הבאים:
{
  "title": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "description": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "dealType": {"value": <"SALE" או "RENT" או null>, "confidence": {"confidence": <number>}},
  "propertyType": {"value": <enum או null>, "confidence": {"confidence": <number>}},
  "price": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "neighborhoodName": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "address": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "rooms": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "area": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "floor": {"value": <integer או null>, "confidence": {"confidence": <number>}},
  "totalFloors": {"value": <integer או null>, "confidence": {"confidence": <number>}},
  "parking": {"value": <boolean או null>, "confidence": {"confidence": <number>}},
  "elevator": {"value": <boolean או null>, "confidence": {"confidence": <number>}},
  "balcony": {"value": <boolean או null>, "confidence": {"confidence": <number>}},
  "safeRoom": {"value": <boolean או null>, "confidence": {"confidence": <number>}},
  "storage": {"value": <boolean או null>, "confidence": {"confidence": <number>}},
  "airConditioning": {"value": <boolean או null>, "confidence": {"confidence": <number>}},
  "accessible": {"value": <boolean או null>, "confidence": {"confidence": <number>}},
  "furnished": {"value": <boolean או null>, "confidence": {"confidence": <number>}},
  "missingFields": [<array של שמות שדות שלא נמצאו>],
  "overallConfidence": <ממוצע ה-confidence של כל השדות שנמצאו>
}
`.trim();
  }
}
