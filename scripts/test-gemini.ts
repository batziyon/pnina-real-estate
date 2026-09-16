/**
 * Gemini API Diagnostic Script
 * 
 * Tests minimal Gemini API connectivity with the installed SDK.
 * DO NOT commit this file with production API keys.
 * 
 * Run with: npx tsx scripts/test-gemini.ts
 */

import { GoogleGenAI } from "@google/genai";

// Read API key from environment
// Make sure GEMINI_API_KEY is set in your .env file and loaded by Next.js
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment");
  console.error("   Make sure your .env file contains GEMINI_API_KEY");
  process.exit(1);
}

console.log("✓ GEMINI_API_KEY is present (not showing value)");
console.log("✓ Using @google/genai SDK");
console.log("");

// Test different model names
const MODELS_TO_TEST = [
  "gemini-3.8-flash",           // Current (INVALID)
  "gemini-2.0-flash-exp",       // Latest experimental
  "gemini-1.5-flash",           // Stable
  "gemini-1.5-flash-latest",    // Latest stable
  "gemini-1.5-pro",             // Pro model
];

async function testModel(modelName: string): Promise<void> {
  console.log(`\n🔍 Testing model: ${modelName}`);
  console.log("─".repeat(50));
  
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY! });
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Return only the word OK.",
      config: {
        temperature: 0.1,
      },
    });

    const text = response.text;
    
    console.log(`✅ SUCCESS`);
    console.log(`   Response: ${text?.substring(0, 100)}`);
    
  } catch (error: unknown) {
    console.log(`❌ FAILED`);
    
    if (typeof error === 'object' && error !== null) {
      const err = error as { status?: number; message?: string; code?: number };
      
      if (err.status) {
        console.log(`   HTTP Status: ${err.status}`);
      }
      
      if (err.message) {
        console.log(`   Message: ${err.message}`);
      }
      
      if (err.code) {
        console.log(`   Error Code: ${err.code}`);
      }

      // Check if it's the specific 503 error
      if (err.status === 503 || err.code === 503) {
        console.log(`   ⚠️  This is the 503 error we're investigating`);
      }
    }
  }
}

async function main() {
  console.log("═".repeat(60));
  console.log("         Gemini API Diagnostic Script");
  console.log("═".repeat(60));
  
  for (const model of MODELS_TO_TEST) {
    await testModel(model);
  }
  
  console.log("\n" + "═".repeat(60));
  console.log("Diagnostic complete");
  console.log("═".repeat(60));
}

main().catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});
