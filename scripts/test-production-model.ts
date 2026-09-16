/**
 * Test Production Gemini Model (gemini-3.6-flash)
 * 
 * Verify the model works after the fix
 */

import { GoogleGenAI } from "@google/genai";
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
  console.log("TESTING PRODUCTION MODEL: gemini-3.6-flash");
  console.log("=".repeat(70));
  console.log();

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log("❌ GEMINI_API_KEY not found");
    process.exit(1);
  }

  const client = new GoogleGenAI({ apiKey });
  const MODEL = "gemini-3.6-flash";

  console.log(`Model: ${MODEL}`);
  console.log();

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: "Return the word OK.",
    });
    
    const text = response.text;
    
    console.log("✅ MINIMAL GENERATION SUCCESS");
    console.log(`   Response: ${text}`);
    console.log();
    console.log("=".repeat(70));
    console.log("PRODUCTION MODEL VERIFIED");
    console.log("=".repeat(70));
    
  } catch (error: unknown) {
    console.log("❌ MINIMAL GENERATION FAILED");
    
    if (typeof error === 'object' && error !== null) {
      const err = error as { status?: number; message?: string };
      
      if (err.status) {
        console.log(`   Status: ${err.status}`);
      }
      
      if (err.message) {
        console.log(`   Message: ${err.message.substring(0, 200)}`);
      }
    }
    
    console.log();
    console.log("=".repeat(70));
    console.log("PRODUCTION MODEL FAILED");
    console.log("=".repeat(70));
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
