/**
 * Verify Exact Model Identifier for Gemini 3.8 Flash
 * 
 * Tests both with and without "models/" prefix
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
  } catch (error) {
    console.log("⚠️  Could not load .env file");
  }
}

loadEnv();

async function main() {
  console.log("=".repeat(70));
  console.log("GEMINI MODEL IDENTIFIER VERIFICATION");
  console.log("=".repeat(70));
  console.log();

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log("❌ GEMINI_API_KEY not found");
    process.exit(1);
  }

  console.log("✅ API Key loaded");
  console.log();

  const client = new GoogleGenAI({ apiKey });

  // Test identifiers
  const identifiersToTest = [
    "gemini-3.8-flash",
    "models/gemini-3.8-flash"
  ];

  const results: Array<{
    identifier: string;
    success: boolean;
    status?: number;
    message?: string;
    response?: string;
  }> = [];

  console.log("TESTING MODEL IDENTIFIERS");
  console.log("-".repeat(70));
  console.log();

  for (const modelIdentifier of identifiersToTest) {
    console.log(`Testing: "${modelIdentifier}"`);
    console.log("-".repeat(40));
    
    try {
      const response = await client.models.generateContent({
        model: modelIdentifier,
        contents: "Return the word OK.",
      });
      
      const text = response.text;
      
      console.log("✅ SUCCESS");
      console.log(`   Response: ${text?.substring(0, 100) || '(empty)'}`);
      
      results.push({
        identifier: modelIdentifier,
        success: true,
        response: text
      });
      
    } catch (error: unknown) {
      console.log("❌ FAILED");
      
      let status: number | undefined;
      let message: string | undefined;
      
      if (typeof error === 'object' && error !== null) {
        const err = error as { status?: number; message?: string; code?: number };
        
        status = err.status || err.code;
        message = err.message;
        
        if (status) {
          console.log(`   HTTP Status: ${status}`);
        }
        
        if (message) {
          console.log(`   Message: ${message.substring(0, 200)}`);
        }
      }
      
      results.push({
        identifier: modelIdentifier,
        success: false,
        status,
        message
      });
    }
    
    console.log();
  }

  // ========================================================================
  // ANALYSIS
  // ========================================================================
  console.log("=".repeat(70));
  console.log("ANALYSIS");
  console.log("=".repeat(70));
  console.log();

  const withoutPrefix = results.find(r => r.identifier === "gemini-3.8-flash");
  const withPrefix = results.find(r => r.identifier === "models/gemini-3.8-flash");

  console.log("A. Which identifier is accepted by generateContent?");
  if (withoutPrefix?.success) {
    console.log(`   ✅ "gemini-3.8-flash" (WITHOUT prefix) works`);
  }
  if (withPrefix?.success) {
    console.log(`   ✅ "models/gemini-3.8-flash" (WITH prefix) works`);
  }
  if (!withoutPrefix?.success && !withPrefix?.success) {
    console.log(`   ❌ Neither identifier works`);
  }
  console.log();

  console.log("B. Does gemini-3.8-flash work without the prefix?");
  if (withoutPrefix?.success) {
    console.log("   ✅ YES - works without prefix");
  } else {
    console.log("   ❌ NO - fails without prefix");
    if (withoutPrefix?.status) {
      console.log(`   Status: ${withoutPrefix.status}`);
    }
  }
  console.log();

  console.log("C. Does models/gemini-3.8-flash work with the prefix?");
  if (withPrefix?.success) {
    console.log("   ✅ YES - works with prefix");
  } else {
    console.log("   ❌ NO - fails with prefix");
    if (withPrefix?.status) {
      console.log(`   Status: ${withPrefix.status}`);
    }
  }
  console.log();

  console.log("D. Is the current production model identifier wrong?");
  console.log(`   Current production uses: "gemini-3.8-flash"`);
  if (withoutPrefix?.success) {
    console.log("   ✅ NO - current identifier is correct");
  } else if (withPrefix?.success) {
    console.log("   ❌ YES - should use: \"models/gemini-3.8-flash\"");
  } else {
    console.log("   ❌ YES - model is unavailable with both identifiers");
  }
  console.log();

  // ========================================================================
  // RECOMMENDATION
  // ========================================================================
  console.log("=".repeat(70));
  console.log("RECOMMENDATION");
  console.log("=".repeat(70));
  console.log();

  if (withPrefix?.success && !withoutPrefix?.success) {
    console.log("✅ CLEAR RECOMMENDATION:");
    console.log('   Change production model from:');
    console.log('   "gemini-3.8-flash"');
    console.log('   to:');
    console.log('   "models/gemini-3.8-flash"');
    console.log();
    console.log("   This will fix the 503 error.");
  } else if (withoutPrefix?.success) {
    console.log("⚠️  UNEXPECTED RESULT:");
    console.log("   Current identifier works in isolation.");
    console.log("   The production 503 error may be:");
    console.log("   - Request-specific (prompt, config, etc.)");
    console.log("   - Rate limiting");
    console.log("   - Temporary unavailability");
  } else {
    console.log("❌ BOTH IDENTIFIERS FAIL:");
    console.log("   Neither identifier works.");
    console.log("   Consider alternative models:");
    console.log("   - models/gemini-3.6-flash");
    console.log("   - models/gemini-3.7-flash");
    console.log("   - models/gemma-4-26b-a4b-it (confirmed working)");
  }

  console.log();
  console.log("=".repeat(70));
  
  if ((withPrefix?.success || withoutPrefix?.success)) {
    console.log("MODEL IDENTIFIER CONFIRMED — READY TO FIX");
  } else {
    console.log("MODEL IDENTIFIER STILL UNCLEAR — MORE DIAGNOSTICS REQUIRED");
  }
  
  console.log("=".repeat(70));
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
