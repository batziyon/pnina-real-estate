/**
 * AI Container — Dependency Injection for AI Services
 *
 * Server-only module. Never import this from client components.
 */

import "server-only";

import { GeminiPropertyExtractor } from "@/ai/infrastructure/providers/gemini/gemini-property-extractor";
import { GeminiContactExtractor } from "@/ai/infrastructure/providers/gemini/gemini-contact-extractor";
import type { AIPropertyExtractor } from "@/ai/domain/interfaces/ai-property-extractor.interface";
import type { AIContactExtractor } from "@/ai/domain/interfaces/ai-contact-extractor.interface";

// Lazy singletons
let _propertyExtractor: AIPropertyExtractor | null = null;
let _contactExtractor: AIContactExtractor | null = null;

export function getAIPropertyExtractor(): AIPropertyExtractor {
  if (!_propertyExtractor) {
    const apiKey = process.env.GEMINI_API_KEY;
    const primaryModel = process.env.GEMINI_PRIMARY_MODEL || "gemini-3.6-flash";
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";
    
    console.log("[AI Container] Initializing GeminiPropertyExtractor...");
    console.log("[AI Container] API key present:", !!apiKey);
    console.log("[AI Container] Primary model:", primaryModel);
    console.log("[AI Container] Fallback model:", fallbackModel);
    
    if (!apiKey) {
      console.error("[AI Container] GEMINI_API_KEY not found in environment");
      throw new Error(
        "GEMINI_API_KEY environment variable is not configured. " +
        "AI property extraction cannot be used without an API key."
      );
    }
    
    _propertyExtractor = new GeminiPropertyExtractor(apiKey, primaryModel, fallbackModel);
    console.log("[AI Container] GeminiPropertyExtractor initialized successfully");
  }
  
  return _propertyExtractor;
}

export function getAIContactExtractor(): AIContactExtractor {
  if (!_contactExtractor) {
    const apiKey = process.env.GEMINI_API_KEY;
    const primaryModel = process.env.GEMINI_CONTACT_PRIMARY_MODEL || "gemini-3.6-flash";
    const fallbackModel = process.env.GEMINI_CONTACT_FALLBACK_MODEL || "gemini-2.5-flash";
    
    console.log("[AI Container] Initializing GeminiContactExtractor...");
    console.log("[AI Container] API key present:", !!apiKey);
    console.log("[AI Container] Primary model:", primaryModel);
    console.log("[AI Container] Fallback model:", fallbackModel);
    
    if (!apiKey) {
      console.error("[AI Container] GEMINI_API_KEY not found in environment");
      throw new Error(
        "GEMINI_API_KEY environment variable is not configured. " +
        "AI contact extraction cannot be used without an API key."
      );
    }
    
    _contactExtractor = new GeminiContactExtractor(apiKey, primaryModel, fallbackModel);
    console.log("[AI Container] GeminiContactExtractor initialized successfully");
  }
  
  return _contactExtractor;
}
