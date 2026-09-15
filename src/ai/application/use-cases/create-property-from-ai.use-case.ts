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
  property: PropertyData;
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
      const match = neighborhoods.find(
        (n) =>
          n.name.trim().toLowerCase() ===
          extraction.neighborhoodName.value!.trim().toLowerCase()
      );
      
      if (match) {
        neighborhoodId = match.id;
      } else {
        // Neighborhood not found - will be caught by validation below
        neighborhoodId = undefined;
        warnings.push(`לא הצלחתי לזהות את השכונה "${extraction.neighborhoodName.value}". אנא בחר שכונה מהרשימה.`);
      }
    } else {
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

    // 3. Map extraction to CreatePropertyInput
    const propertyInput: CreatePropertyInput = {
      // Core fields
      title: extraction.title.value || "נכס חדש (טעון בדיקה)",
      description: extraction.description.value ?? null,
      dealType: extraction.dealType.value || "SALE",
      propertyType: extraction.propertyType.value || "APARTMENT",
      price: extraction.price.value || "0",

      // Location
      neighborhoodId: neighborhoodId || "", // Will fail validation if empty
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

      // CRITICAL: Force DRAFT status
      status: "DRAFT",
    };

    // 4. Validate minimum requirements
    if (!neighborhoodId) {
      throw new ValidationError(
        "לא הצלחתי לזהות את השכונה. אנא בחר שכונה מהרשימה.",
        { neighborhoodId: "שכונה לא תקינה או חסרה" }
      );
    }

    if (!propertyInput.title || propertyInput.title.trim().length === 0) {
      throw new ValidationError(
        "כותרת הנכס חסרה. אנא הוסף כותרת.",
        { title: "כותרת חובה" }
      );
    }

    // 5. Create property as DRAFT
    const property = await this.propertyRepository.create(propertyInput);

    return {
      property,
      extraction,
      warnings,
    };
  }
}
