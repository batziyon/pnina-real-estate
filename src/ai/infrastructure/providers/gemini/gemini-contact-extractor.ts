/**
 * Gemini Contact Extractor Implementation
 *
 * Infrastructure layer — implements AIContactExtractor using Google Gemini.
 */

import { GoogleGenAI } from "@google/genai";
import type { AIContactExtractor } from "@/ai/domain/interfaces/ai-contact-extractor.interface";
import type { ContactExtractionResult } from "@/ai/domain/types/contact-extraction-result.types";
import { ContactExtractionResultSchema } from "@/validations/ai-contact-extraction.schema";
import { AIExtractionError } from "@/ai/application/errors/ai-extraction-error";
import { AIValidationError } from "@/ai/application/errors/ai-validation-error";
import { AIProviderUnavailableError } from "@/ai/application/errors/ai-provider-unavailable-error";

export class GeminiContactExtractor implements AIContactExtractor {
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

  async extractFromText(freeText: string): Promise<ContactExtractionResult> {
    if (!freeText || freeText.trim().length === 0) {
      throw new AIExtractionError("Free text input is required");
    }

    console.log(`\n[Gemini Contact] Starting extraction`);
    console.log(`[Gemini Contact] Primary model: ${this.primaryModel}`);
    console.log(`[Gemini Contact] Fallback model: ${this.fallbackModel || "none"}`);
    console.log(`[Gemini Contact] Text length: ${freeText.length} chars`);

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
      console.log(`\n[Gemini Contact] Primary model failed, trying fallback...`);
      console.log(`[Gemini Contact] Fallback model: ${this.fallbackModel}`);
      
      const fallbackResult = await this.tryModelWithRetry(this.fallbackModel!, freeText, 3);
      
      if (fallbackResult.success) {
        console.log(`[Gemini Contact] ✓ Extraction succeeded using fallback model`);
        return fallbackResult.result!;
      }

      // Both models failed
      console.error(`[Gemini Contact] Both primary and fallback models failed`);
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
  ): Promise<{ success: boolean; result?: ContactExtractionResult; error?: unknown }> {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini Contact] ${modelName} - Attempt ${attempt}/${maxAttempts}...`);
        
        const prompt = this.buildPrompt(freeText);

        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.1, // Low temperature for extraction accuracy
            responseMimeType: "application/json",
          },
        });

        console.log(`[Gemini Contact] ${modelName} - Received response from provider`);
        const rawJson = response.text;

        if (!rawJson) {
          console.error(`[Gemini Contact] ${modelName} - Empty response received`);
          throw new AIExtractionError("AI returned empty response");
        }

        console.log(`[Gemini Contact] ${modelName} - Response length: ${rawJson.length} chars`);

        // Parse JSON
        let parsed: unknown;
        try {
          parsed = JSON.parse(rawJson);
        } catch (err) {
          console.error(`[Gemini Contact] ${modelName} - JSON parse error:`, err);
          throw new AIValidationError("AI returned invalid JSON", err);
        }

        console.log(`[Gemini Contact] ${modelName} - JSON parsed successfully`);

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
          validated = ContactExtractionResultSchema.parse(withMetadata);
          console.log(`[Gemini Contact] ${modelName} - Validation successful`);
        } catch (zodError) {
          // Provide detailed validation error
          if (zodError instanceof Error && 'issues' in zodError) {
            const zodIssues = zodError as { issues: Array<{ path: string[]; message: string }> };
            const errorDetails = zodIssues.issues.map((issue) =>
              `${issue.path.join('.')}: ${issue.message}`
            ).join('; ');
            console.error(`[Gemini Contact] ${modelName} - Validation failed:`, errorDetails);
            throw new AIValidationError(
              `AI output validation failed: ${errorDetails}`,
              zodError
            );
          }
          console.error(`[Gemini Contact] ${modelName} - Validation failed:`, zodError);
          throw new AIValidationError("AI output validation failed", zodError);
        }

        // Success - return immediately
        if (attempt > 1) {
          console.log(`[Gemini Contact] ✓ ${modelName} succeeded on attempt ${attempt}`);
        } else {
          console.log(`[Gemini Contact] ✓ ${modelName} succeeded on first attempt`);
        }
        
        return { success: true, result: validated as ContactExtractionResult };

      } catch (error) {
        lastError = error;
        console.error(`[Gemini Contact] ${modelName} - Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));

        // Never retry validation errors - these are permanent issues
        if (error instanceof AIValidationError) {
          console.error(`[Gemini Contact] ${modelName} - Validation error - not retrying`);
          return { success: false, error };
        }

        // Check if this is a model unavailability error (404, NOT_FOUND)
        const isModelUnavailable = this.isModelUnavailableError(error);
        
        if (isModelUnavailable) {
          console.error(`[Gemini Contact] ${modelName} - Model unavailable (404/NOT_FOUND) - not retrying`);
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
          console.error(`[Gemini Contact] ${modelName} - Permanent error - not retrying`);
          return {
            success: false,
            error: new AIExtractionError(
              "Failed to extract contact data from text",
              error
            ),
          };
        }

        // This is a transient error - retry if we have attempts left
        if (attempt < maxAttempts) {
          const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
          console.log(
            `[Gemini Contact] ${modelName} - Transient error (503/429). ` +
            `Retrying in ${delayMs}ms... (${maxAttempts - attempt} attempts remaining)`
          );
          await this.delay(delayMs);
          continue;
        }

        // All attempts exhausted for this model
        console.error(
          `[Gemini Contact] ${modelName} - All ${maxAttempts} attempts failed`
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

    const err = error as { status?: number; code?: number; message?: string };
    
    const transientStatuses = [429, 500, 502, 503, 504];
    if (err.status && transientStatuses.includes(err.status)) {
      return true;
    }
    if (err.code && transientStatuses.includes(err.code)) {
      return true;
    }

    const withCause = error as { cause?: unknown };
    if (withCause.cause && typeof withCause.cause === 'object') {
      const cause = withCause.cause as { status?: number; code?: number; message?: string };
      if (cause.status && transientStatuses.includes(cause.status)) {
        return true;
      }
      if (cause.code && transientStatuses.includes(cause.code)) {
        return true;
      }

      if (cause.message && (
        cause.message.includes('"status":"UNAVAILABLE"') ||
        cause.message.includes('"status":"RESOURCE_EXHAUSTED"') ||
        cause.message.includes('"status":"INTERNAL"') ||
        cause.message.includes('"status":"DEADLINE_EXCEEDED"')
      )) {
        return true;
      }
    }

    if (err.message) {
      if (err.message.includes('"status":"UNAVAILABLE"') ||
          err.message.includes('"status":"RESOURCE_EXHAUSTED"') ||
          err.message.includes('"status":"INTERNAL"') ||
          err.message.includes('"status":"DEADLINE_EXCEEDED"')) {
        return true;
      }
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
   */
  private isModelUnavailableError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const err = error as { status?: number; code?: number; message?: string };
    
    if (err.status === 404 || err.code === 404) {
      return true;
    }

    const withCause = error as { cause?: unknown };
    if (withCause.cause && typeof withCause.cause === 'object') {
      const cause = withCause.cause as { status?: number; code?: number; message?: string };
      if (cause.status === 404 || cause.code === 404) {
        return true;
      }

      if (cause.message && (
        cause.message.includes('"status":"NOT_FOUND"') ||
        cause.message.includes('is not found for API') ||
        cause.message.includes('model not found') ||
        cause.message.includes('not supported for generateContent')
      )) {
        return true;
      }
    }

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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildPrompt(freeText: string): string {
    return `
אתה מערכת חילוץ מידע של פרטי קשר בעברית.

קלט: תיאור חופשי של איש קשר (שם, טלפון, אימייל, הערות).
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
4. שם (name) - חובה (אם לא מצאת, confidence נמוך)
5. טלפון (phone) - חלץ רק מספרים, ללא מקפים או רווחים (דוגמה: "0521234567")
6. אימייל (email) - חלץ כתובת אימייל מלאה
7. notes - כל מידע נוסף שנמצא (תחומי עניין, העדפות, הערות)
8. interests - מערך של מילות מפתח (דוגמה: ["דירה 4 חדרים", "קטמון", "עד 3 מיליון"])
9. source: "WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "AGENT_NETWORK", "OTHER" או null
10. stage: "NEW", "CONTACTED", "QUALIFIED", "NURTURING", "CONVERTED", "LOST" או null
11. confidence: 0.0-1.0 (גבוה רק אם המידע ברור ומפורש)

דוגמאות לחילוץ:
- "דוד כהן 052-1234567" →
  name: {"value": "דוד כהן", "confidence": {"confidence": 0.95}},
  phone: {"value": "0521234567", "confidence": {"confidence": 0.9}}
- "מחפש דירת 4 חדרים בקטמון" →
  interests: {"value": ["דירת 4 חדרים", "קטמון"], "confidence": {"confidence": 0.8}}
- "david@example.com" →
  email: {"value": "david@example.com", "confidence": {"confidence": 0.95}}
- "הגיע מאתר האינטרנט" →
  source: {"value": "WEBSITE", "confidence": {"confidence": 0.9}}

אם מידע חסר - ה-value יהיה null עם confidence נמוך.

טקסט:
${freeText}

החזר JSON מובנה עם כל השדות הבאים:
{
  "name": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "phone": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "email": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "source": {"value": <enum או null>, "confidence": {"confidence": <number>}},
  "stage": {"value": <enum או null>, "confidence": {"confidence": <number>}},
  "notes": {"value": <string או null>, "confidence": {"confidence": <number>}},
  "interests": {"value": <array של strings או null>, "confidence": {"confidence": <number>}},
  "missingFields": [<array של שמות שדות שלא נמצאו>],
  "overallConfidence": <ממוצע ה-confidence של כל השדות שנמצאו>
}
`.trim();
  }
}
