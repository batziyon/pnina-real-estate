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
    
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not configured. " +
        "AI property extraction cannot be used without an API key."
      );
    }
    
    _extractor = new GeminiPropertyExtractor(apiKey);
  }
  
  return _extractor;
}
