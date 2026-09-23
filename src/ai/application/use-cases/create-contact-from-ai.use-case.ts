/**
 * Create Contact From AI Use Case
 *
 * Application layer — orchestrates AI extraction → validation → contact creation (draft).
 *
 * CRITICAL RULES:
 * - AI NEVER determines agentId (server-controlled)
 * - AI output ALWAYS requires human review
 * - Name is required (validation)
 * - At least phone OR email is required (validation)
 */

import type { AIContactExtractor } from "@/ai/domain/interfaces/ai-contact-extractor.interface";
import type { ContactExtractionResult } from "@/ai/domain/types/contact-extraction-result.types";
import type { UserRole } from "@/domain/user/user.types";

export interface Actor {
  id: string;
  role: UserRole;
}

export interface CreateContactFromAIResult {
  extraction: ContactExtractionResult;
  warnings: string[];
}

export class CreateContactFromAIUseCase {
  constructor(
    private readonly aiExtractor: AIContactExtractor
  ) {}

  async execute(params: {
    text: string;
    actor: Actor;
  }): Promise<CreateContactFromAIResult> {
    const { text } = params;
    const warnings: string[] = [];

    // 1. Extract with AI
    const extraction = await this.aiExtractor.extractFromText(text);

    // 2. Validate minimum requirements
    if (!extraction.name.value || extraction.name.value.trim().length === 0) {
      warnings.push("לא זוהה שם - חובה למלא את השדה הזה.");
    }

    if (!extraction.phone.value && !extraction.email.value) {
      warnings.push("לא זוהה טלפון או אימייל - נדרש לפחות אחד מהם.");
    }

    // 3. Add warnings for low-confidence fields
    if (extraction.name.confidence.confidence < 0.5) {
      warnings.push("שם איש הקשר חולץ עם רמת ביטחון נמוכה - מומלץ לבדוק ולערוך.");
    }

    if (extraction.phone.value && extraction.phone.confidence.confidence < 0.7) {
      warnings.push("מספר הטלפון חולץ עם רמת ביטחון נמוכה/בינונית - מומלץ לאמת את המספר.");
    }

    if (extraction.email.value && extraction.email.confidence.confidence < 0.7) {
      warnings.push("כתובת האימייל חולצה עם רמת ביטחון נמוכה/בינונית - מומלץ לאמת את הכתובת.");
    }

    // 4. Check if interests were extracted
    if (extraction.interests.value && extraction.interests.value.length > 0) {
      warnings.push(`זוהו ${extraction.interests.value.length} תחומי עניין - ניתן להוסיף או לערוך.`);
    }

    // 5. Overall confidence check
    if (extraction.overallConfidence < 0.6) {
      warnings.push("רמת הביטחון הכוללת נמוכה - מומלץ לבדוק את כל השדות בקפידה.");
    }

    return {
      extraction,
      warnings,
    };
  }
}
