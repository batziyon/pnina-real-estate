/**
 * Test AI Extraction Directly (without HTTP)
 * 
 * Test the GeminiPropertyExtractor directly to verify the model works
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

async function main() {
  console.log("=".repeat(70));
  console.log("TESTING AI EXTRACTION (DIRECT)");
  console.log("=".repeat(70));
  console.log();

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log("❌ GEMINI_API_KEY not found");
    process.exit(1);
  }

  console.log("✅ API Key loaded");
  console.log();

  // Create extractor (will use default model: gemini-3.6-flash)
  const extractor = new GeminiPropertyExtractor(apiKey);
  
  const testInput = `
דירת 4 חדרים למכירה בתל אביב
שכונת פלורנטין
מחיר: 3,200,000 ₪
שטח: 95 מ"ר
קומה 3 מתוך 5
יש מעלית וחניה
מרפסת 12 מ"ר
ממ"ד
  `.trim();

  console.log("Input text:");
  console.log(testInput);
  console.log();
  console.log("-".repeat(70));
  console.log();

  try {
    console.log("Calling Gemini AI...");
    const result = await extractor.extractFromText(testInput);
    
    console.log("✅ EXTRACTION SUCCEEDED");
    console.log();
    console.log("Extracted fields:");
    console.log("-".repeat(70));
    
    // Show key fields
    const fields = [
      'title', 'dealType', 'propertyType', 
      'price', 'neighborhoodName', 'rooms', 'area',
      'floor', 'totalFloors', 'parking', 'elevator',
      'balcony', 'safeRoom', 'overallConfidence'
    ];
    
    fields.forEach(field => {
      if (result[field as keyof typeof result] !== undefined) {
        const value = result[field as keyof typeof result];
        if (typeof value === 'object' && value !== null && 'value' in value) {
          const fieldValue = value as { value: unknown; confidence?: { confidence: number } };
          console.log(`  ${field}:`, {
            value: fieldValue.value,
            confidence: fieldValue.confidence?.confidence
          });
        } else {
          console.log(`  ${field}:`, value);
        }
      }
    });
    
    console.log();
    console.log("Metadata:");
    if (result.metadata) {
      console.log(`  provider: ${result.metadata.provider}`);
      console.log(`  model: ${result.metadata.model}`);
    }
    
    console.log();
    console.log("Structured data returned: YES");
    console.log();
    console.log("=".repeat(70));
    console.log("AI EXTRACTION VERIFIED");
    console.log("=".repeat(70));
    
  } catch (error) {
    console.log("❌ EXTRACTION FAILED");
    console.log();
    
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
      console.log(`Type: ${error.constructor.name}`);
      
      // Show the full error details
      if ('cause' in error && error.cause) {
        console.log();
        console.log("Cause:");
        console.log(error.cause);
      }
      
      // Show stack trace
      if (error.stack) {
        console.log();
        console.log("Stack (first 500 chars):");
        console.log(error.stack.substring(0, 500));
      }
    } else {
      console.log("Unknown error type:", error);
    }
    
    console.log();
    console.log("=".repeat(70));
    console.log("AI EXTRACTION FAILED");
    console.log("=".repeat(70));
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
