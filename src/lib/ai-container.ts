/**
 * AI Container — Dependency Injection for AI Services
 *
 * Server-only module. Never import this from client components.
 */

import "server-only";

import { GeminiPropertyExtractor } from "@/ai/infrastructure/providers/gemini/gemini-property-extractor";
import type { AIPropertyExtractor } from "@/ai/domain/interfaces/ai-property-extractor.interface";

// Lazy singleton
let _extractor: AIPropertyExtractor | null = null;

export function getAIPropertyExtractor(): AIPropertyExtractor {
  if (!_extractor) {
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
    
    _extractor = new GeminiPropertyExtractor(apiKey, primaryModel, fallbackModel);
    console.log("[AI Container] GeminiPropertyExtractor initialized successfully");
  }
  
  return _extractor;
}
