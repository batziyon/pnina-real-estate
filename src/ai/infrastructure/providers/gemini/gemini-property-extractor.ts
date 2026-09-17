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
  private readonly primaryModel: string;
  private readonly fallbackModel: string | null;

  constructor(
    apiKey: string,
    primaryModel = "gemini-3.6-flash",
    fallbackModel: string | null = "gemini-2.5-flash"
  ) {
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.primaryModel = primaryModel;
    this.fallbackModel = fallbackModel;
  }

  async extractFromText(freeText: string): Promise<PropertyExtractionResult> {
    if (!freeText || freeText.trim().length === 0) {
      throw new AIExtractionError("Free text input is required");
    }

    console.log(`\n[Gemini] Starting extraction`);
    console.log(`[Gemini] Primary model: ${this.primaryModel}`);
    console.log(`[Gemini] Fallback model: ${this.fallbackModel || "none"}`);
    console.log(`[Gemini] Text length: ${freeText.length} chars`);

    // Try primary model first
    const primaryResult = await this.tryModelWithRetry(this.primaryModel, freeText, 3);
    
    if (primaryResult.success) {
      return primaryResult.result!;
    }

    // Primary model failed - check if we should try fallback
    const shouldTryFallback = this.fallbackModel && (
      this.isTransientError(primaryResult.error) ||
      this.isModelUnavailableError(primaryResult.error)
    );

    if (shouldTryFallback) {
      console.log(`\n[Gemini] Primary model failed, trying fallback...`);
      console.log(`[Gemini] Fallback model: ${this.fallbackModel}`);
      
      const fallbackResult = await this.tryModelWithRetry(this.fallbackModel!, freeText, 3);
      
      if (fallbackResult.success) {
        console.log(`[Gemini] ✓ Extraction succeeded using fallback model`);
        return fallbackResult.result!;
      }

      // Both models failed
      console.error(`[Gemini] Both primary and fallback models failed`);
      throw new AIProviderUnavailableError(
        "AI provider is temporarily unavailable",
        fallbackResult.error
      );
    }

    // No fallback or error type doesn't warrant fallback
    if (primaryResult.error instanceof AIValidationError || primaryResult.error instanceof AIExtractionError) {
      throw primaryResult.error;
    }

    throw new AIProviderUnavailableError(
      "AI provider is temporarily unavailable",
      primaryResult.error
    );
  }

  /**
   * Try a specific model with retry logic
   */
  private async tryModelWithRetry(
    modelName: string,
    freeText: string,
    maxAttempts: number
  ): Promise<{ success: boolean; result?: PropertyExtractionResult; error?: unknown }> {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini] ${modelName} - Attempt ${attempt}/${maxAttempts}...`);
        
        const prompt = this.buildPrompt(freeText);

        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.1, // Low temperature for extraction accuracy
            responseMimeType: "application/json",
            // Note: responseSchema is not used because it requires complex type definitions
            // We rely on the prompt and Zod validation instead
          },
        });

        console.log(`[Gemini] ${modelName} - Received response from provider`);
        const rawJson = response.text;

        if (!rawJson) {
          console.error(`[Gemini] ${modelName} - Empty response received`);
          throw new AIExtractionError("AI returned empty response");
        }

        console.log(`[Gemini] ${modelName} - Response length: ${rawJson.length} chars`);

        // Parse JSON
        let parsed: unknown;
        try {
          parsed = JSON.parse(rawJson);
        } catch (err) {
          console.error(`[Gemini] ${modelName} - JSON parse error:`, err);
          throw new AIValidationError("AI returned invalid JSON", err);
        }

        console.log(`[Gemini] ${modelName} - JSON parsed successfully`);

        // Add metadata
        const withMetadata = {
          ...(parsed as Record<string, unknown>),
          metadata: {
            provider: "gemini",
            model: modelName,
            extractedAt: new Date(),
          },
        };

        // Validate with Zod
        let validated;
        try {
          validated = PropertyExtractionResultSchema.parse(withMetadata);
          console.log(`[Gemini] ${modelName} - Validation successful`);
        } catch (zodError) {
          // Provide detailed validation error
          if (zodError instanceof Error && 'issues' in zodError) {
            const zodIssues = zodError as { issues: Array<{ path: string[]; message: string }> };
            const errorDetails = zodIssues.issues.map((issue) =>
              `${issue.path.join('.')}: ${issue.message}`
            ).join('; ');
            console.error(`[Gemini] ${modelName} - Validation failed:`, errorDetails);
            throw new AIValidationError(
              `AI output validation failed: ${errorDetails}`,
              zodError
            );
          }
          console.error(`[Gemini] ${modelName} - Validation failed:`, zodError);
          throw new AIValidationError("AI output validation failed", zodError);
        }

        // Success - return immediately
        if (attempt > 1) {
          console.log(`[Gemini] ✓ ${modelName} succeeded on attempt ${attempt}`);
        } else {
          console.log(`[Gemini] ✓ ${modelName} succeeded on first attempt`);
        }
        
        return { success: true, result: validated as PropertyExtractionResult };

      } catch (error) {
        lastError = error;
        console.error(`[Gemini] ${modelName} - Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));

        // Never retry validation errors - these are permanent issues
        if (error instanceof AIValidationError) {
          console.error(`[Gemini] ${modelName} - Validation error - not retrying`);
          return { success: false, error };
        }

        // Check if this is a model unavailability error (404, NOT_FOUND)
        const isModelUnavailable = this.isModelUnavailableError(error);
        
        if (isModelUnavailable) {
          // Model doesn't exist or isn't available - fail immediately to try fallback
          console.error(`[Gemini] ${modelName} - Model unavailable (404/NOT_FOUND) - not retrying`);
          return {
            success: false,
            error: new AIProviderUnavailableError(
              "Model is unavailable",
              error
            ),
          };
        }

        // Check if this is a transient error that should be retried
        const isRetryable = this.isTransientError(error);

        if (!isRetryable) {
          // Permanent error (auth, malformed request, etc.) - fail immediately
          console.error(`[Gemini] ${modelName} - Permanent error - not retrying`);
          return {
            success: false,
            error: new AIExtractionError(
              "Failed to extract property data from text",
              error
            ),
          };
        }

        // This is a transient error - retry if we have attempts left
        if (attempt < maxAttempts) {
          const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
          console.log(
            `[Gemini] ${modelName} - Transient error (503/429). ` +
            `Retrying in ${delayMs}ms... (${maxAttempts - attempt} attempts remaining)`
          );
          await this.delay(delayMs);
          continue;
        }

        // All attempts exhausted for this model
        console.error(
          `[Gemini] ${modelName} - All ${maxAttempts} attempts failed`
        );
        return { success: false, error };
      }
    }

    // Should never reach here, but TypeScript needs it
    return { success: false, error: lastError };
  }

  /**
   * Check if an error is transient (429, 500, 502, 503, 504) and should trigger retry
   */
  private isTransientError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    // Check direct error properties
    const err = error as { status?: number; code?: number; message?: string };
    
    // Transient HTTP status codes
    const transientStatuses = [429, 500, 502, 503, 504];
    if (err.status && transientStatuses.includes(err.status)) {
      return true;
    }
    if (err.code && transientStatuses.includes(err.code)) {
      return true;
    }

    // Check cause chain for nested transient errors
    const withCause = error as { cause?: unknown };
    if (withCause.cause && typeof withCause.cause === 'object') {
      const cause = withCause.cause as { status?: number; code?: number; message?: string };
      if (cause.status && transientStatuses.includes(cause.status)) {
        return true;
      }
      if (cause.code && transientStatuses.includes(cause.code)) {
        return true;
      }

      // Check for status strings in message
      if (cause.message && (
        cause.message.includes('"status":"UNAVAILABLE"') ||
        cause.message.includes('"status":"RESOURCE_EXHAUSTED"') ||
        cause.message.includes('"status":"INTERNAL"') ||
        cause.message.includes('"status":"DEADLINE_EXCEEDED"')
      )) {
        return true;
      }
    }

    // Check message for status indicators
    if (err.message) {
      if (err.message.includes('"status":"UNAVAILABLE"') ||
          err.message.includes('"status":"RESOURCE_EXHAUSTED"') ||
          err.message.includes('"status":"INTERNAL"') ||
          err.message.includes('"status":"DEADLINE_EXCEEDED"')) {
        return true;
      }
      // Check for numeric codes in message
      for (const status of transientStatuses) {
        if (err.message.includes(`"code":${status}`)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if an error is a model unavailability error (404, NOT_FOUND)
   * This should trigger immediate fallback without retries
   */
  private isModelUnavailableError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const err = error as { status?: number; code?: number; message?: string };
    
    // Check for 404 status
    if (err.status === 404 || err.code === 404) {
      return true;
    }

    // Check cause chain
    const withCause = error as { cause?: unknown };
    if (withCause.cause && typeof withCause.cause === 'object') {
      const cause = withCause.cause as { status?: number; code?: number; message?: string };
      if (cause.status === 404 || cause.code === 404) {
        return true;
      }

      // Check for NOT_FOUND status in message
      if (cause.message && (
        cause.message.includes('"status":"NOT_FOUND"') ||
        cause.message.includes('is not found for API') ||
        cause.message.includes('model not found') ||
        cause.message.includes('not supported for generateContent')
      )) {
        return true;
      }
    }

    // Check message for NOT_FOUND indicators
    if (err.message) {
      if (err.message.includes('"status":"NOT_FOUND"') ||
          err.message.includes('is not found for API') ||
          err.message.includes('model not found') ||
          err.message.includes('not supported for generateContent') ||
          err.message.includes('"code":404')) {
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
