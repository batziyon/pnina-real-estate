/**
 * Retry Failed Inputs
 * 
 * Test if the 503 errors are consistent or transient
 */

import { GeminiPropertyExtractor } from "@/ai/infrastructure/providers/gemini/gemini-property-extractor";
import * as fs from "fs";
import * as path from "path";

// Load .env file manually
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          const cleanValue = value.replace(/^["']|["']$/g, '');
          process.env[key.trim()] = cleanValue;
        }
      }
    });
  } catch {
    console.log("⚠️  Could not load .env file");
  }
}

loadEnv();

const failedInputs = [
  {
    name: "B - With Details",
    input: "דירת 4 חדרים בגבעת שאול, קומה 3, יש מעלית וחניה"
  },
  {
    name: "D - Very Informal",
    input: "דירה ארבעה חדרים גדולה בגבעת שאול, יש מרפסת וחניה, קומה שלישית..."
  },
];

async function main() {
  console.log("=".repeat(70));
  console.log("RETRY FAILED INPUTS - CONSISTENCY TEST");
  console.log("=".repeat(70));
  console.log();
  console.log("This will retry the inputs that previously failed with 503");
  console.log("to determine if the errors are consistent or transient.");
  console.log();

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log("❌ GEMINI_API_KEY not found");
    process.exit(1);
  }

  const extractor = new GeminiPropertyExtractor(apiKey);
  
  for (const testCase of failedInputs) {
    console.log("=".repeat(70));
    console.log(`RETRY: ${testCase.name}`);
    console.log("=".repeat(70));
    console.log();
    console.log(`Input: "${testCase.input}"`);
    console.log();
    
    try {
      const result = await extractor.extractFromText(testCase.input);
      
      console.log("✅ NOW SUCCEEDED");
      console.log(`   Overall confidence: ${result.overallConfidence}`);
      console.log(`   → This suggests the 503 was TRANSIENT`);
      
    } catch (error: unknown) {
      console.log("❌ STILL FAILS");
      
      if (typeof error === 'object' && error !== null) {
        const err = error as { cause?: { status?: number; message?: string } };
        if (err.cause?.status) {
          console.log(`   HTTP Status: ${err.cause.status}`);
          if (err.cause.status === 503) {
            console.log(`   → 503 error is CONSISTENT`);
          }
        }
      }
    }
    
    console.log();
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("=".repeat(70));
  console.log("CONCLUSION");
  console.log("=".repeat(70));
  console.log();
  console.log("If errors are consistent:");
  console.log("  → Specific content or format triggers the 503");
  console.log("  → Not a rate limit issue");
  console.log();
  console.log("If errors are transient:");
  console.log("  → Rate limiting or temporary availability");
  console.log("  → Retry logic would help");
  console.log("=".repeat(70));
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
