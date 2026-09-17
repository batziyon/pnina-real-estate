/**
 * Create Property From AI Use Case
 *
 * Application layer — orchestrates AI extraction → validation → property creation.
 *
 * CRITICAL RULES:
 * - AI NEVER determines agentId (server-controlled)
 * - AI NEVER publishes (always creates DRAFT)
 * - AI output ALWAYS requires human review
 * - Price ALWAYS requires human confirmation
 * - Neighborhood name must be resolved to valid neighborhoodId
 */

import type { AIPropertyExtractor } from "@/ai/domain/interfaces/ai-property-extractor.interface";
import type { PropertyRepository } from "@/domain/property/property.repository";
import type { NeighborhoodRepository } from "@/domain/neighborhood/neighborhood.repository";
import type { PropertyData, CreatePropertyInput } from "@/domain/property/property.types";
import type { PropertyExtractionResult } from "@/ai/domain/types/property-extraction-result.types";
import type { UserRole } from "@/domain/user/user.types";
import { ValidationError } from "@/application/errors";

export interface Actor {
  id: string;
  role: UserRole;
}

export interface CreatePropertyFromAIResult {
  property: PropertyData | null;
  extraction: PropertyExtractionResult;
  warnings: string[];
}

export class CreatePropertyFromAIUseCase {
  constructor(
    private readonly aiExtractor: AIPropertyExtractor,
    private readonly propertyRepository: PropertyRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository
  ) {}

  async execute(params: {
    text: string;
    actor: Actor;
  }): Promise<CreatePropertyFromAIResult> {
    const { text, actor } = params;
    const warnings: string[] = [];

    // 1. Extract with AI
    const extraction = await this.aiExtractor.extractFromText(text);

    // 2. Resolve neighborhood
    let neighborhoodId: string | undefined;

    if (extraction.neighborhoodName.value) {
      const neighborhoods = await this.neighborhoodRepository.findAll();
      const normalizedInput = this.normalizeNeighborhoodName(extraction.neighborhoodName.value);

      const match = neighborhoods.find((n) => {
        const normalizedDb = this.normalizeNeighborhoodName(n.name);
        return normalizedDb === normalizedInput;
      });

      if (match) {
        neighborhoodId = match.id;
      } else {
        // AI provided a neighborhood but it doesn't match any DB record
        // DO NOT throw error - preserve extraction and let user select manually
        warnings.push(
          `לא הצלחתי לזהות את השכונה "${extraction.neighborhoodName.value}". אנא בחר שכונה מהרשימה.`
        );
        neighborhoodId = undefined;
      }
    } else {
      // AI did not provide a neighborhood at all
      // This is acceptable - return extraction without creating property
      warnings.push("לא צוין שם שכונה. אנא בחר שכונה מהרשימה.");
    }

    // Add warnings for low-confidence fields
    if (extraction.title.confidence.confidence < 0.5) {
      warnings.push("כותרת הנכס חולצה עם רמת ביטחון נמוכה - מומלץ לבדוק ולערוך.");
    }

    if (extraction.price.value === null) {
      warnings.push("לא צוין מחיר. אנא הוסף מחיר לפני פרסום.");
    } else if (extraction.price.confidence.confidence < 0.8) {
      warnings.push("מחיר הנכס חולץ עם רמת ביטחון נמוכה/בינונית - חובה לאשר את המחיר.");
    }

    if (!extraction.rooms.value) {
      warnings.push("לא צוין מספר חדרים.");
    }

    if (!extraction.area.value) {
      warnings.push("לא צוין שטח הנכס.");
    }

    // 3. If no neighborhood was resolved, return extraction without creating property
    if (!neighborhoodId) {
      return {
        property: null,
        extraction,
        warnings,
      };
    }

    // 4. Map extraction to CreatePropertyInput
    const propertyInput: CreatePropertyInput = {
      // Core fields
      title: extraction.title.value || "נכס חדש (טעון בדיקה)",
      description: extraction.description.value ?? null,
      dealType: extraction.dealType.value || "SALE",
      propertyType: extraction.propertyType.value || "APARTMENT",
      // Price: nullable - null when not found
      price: extraction.price.value || null,

      // Location
      neighborhoodId: neighborhoodId, // Now guaranteed to be non-empty
      address: extraction.address.value ?? null,

      // Details
      rooms: extraction.rooms.value ?? null,
      area: extraction.area.value ?? null,
      floor: extraction.floor.value ?? null,
      totalFloors: extraction.totalFloors.value ?? null,

      // Features (only if AI extracted them with confidence)
      parking: extraction.parking.value ?? false,
      elevator: extraction.elevator.value ?? false,
      balcony: extraction.balcony.value ?? false,
      safeRoom: extraction.safeRoom.value ?? false,
      storage: extraction.storage.value ?? false,
      airConditioning: extraction.airConditioning.value ?? false,
      accessible: extraction.accessible.value ?? false,
      furnished: extraction.furnished.value ?? false,

      // CRITICAL: Server-controlled fields
      agentId: actor.id, // Always set to the authenticated actor
      projectId: null, // AI never determines project
      internalNotes: null, // AI doesn't extract this

      // CRITICAL: Force DRAFT status
      status: "DRAFT",
    };

    // 5. Validate minimum requirements (title is required)
    if (!propertyInput.title || propertyInput.title.trim().length === 0) {
      throw new ValidationError(
        "כותרת הנכס חסרה. אנא הוסף כותרת.",
        { title: "כותרת חובה" }
      );
    }

    // 6. Create property as DRAFT
    const property = await this.propertyRepository.create(propertyInput);

    return {
      property,
      extraction,
      warnings,
    };
  }

  /**
   * Normalize neighborhood name for consistent matching.
   *
   * Handles common formatting variations:
   * - Case differences
   * - Extra whitespace
   * - Common punctuation separators (-, _, parentheses)
   *
   * Examples:
   * - "קטמון הישנה" → "קטמון הישנה"
   * - "קטמון-הישנה" → "קטמון הישנה"
   * - "קטמון (הישנה)" → "קטמון הישנה"
   * - "קטמון   הישנה" → "קטמון הישנה"
   *
   * IMPORTANT: This does NOT perform fuzzy matching.
   * After normalization, an exact match is still required.
   */
  private normalizeNeighborhoodName(name: string): string {
    return name
      .trim()                        // Remove leading/trailing whitespace
      .toLowerCase()                 // Case-insensitive comparison
      .replace(/[-_()]/g, ' ')       // Replace punctuation separators with space
      .replace(/\s+/g, ' ')          // Collapse multiple spaces into one
      .trim();                       // Remove any resulting leading/trailing space
  }
}
