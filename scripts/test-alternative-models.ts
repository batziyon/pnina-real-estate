/**
 * Test Alternative Gemini Models
 * 
 * Test the recommended alternative models to find a working replacement
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
  console.log("TESTING ALTERNATIVE GEMINI MODELS");
  console.log("=".repeat(70));
  console.log();

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log("❌ GEMINI_API_KEY not found");
    process.exit(1);
  }

  const client = new GoogleGenAI({ apiKey });

  // Test the most promising alternatives
  const modelsToTest = [
    { name: "gemini-3.6-flash", withPrefix: "models/gemini-3.6-flash" },
    { name: "gemini-3.7-flash", withPrefix: "models/gemini-3.7-flash" },
    { name: "gemini-3.5-flash", withPrefix: "models/gemini-3.5-flash" },
    { name: "gemma-4-26b-a4b-it", withPrefix: "models/gemma-4-26b-a4b-it" },
  ];

  const workingModels: string[] = [];

  for (const model of modelsToTest) {
    console.log(`Testing: ${model.withPrefix}`);
    console.log("-".repeat(40));
    
    // Test with prefix first (more likely to work based on list response)
    try {
      const response = await client.models.generateContent({
        model: model.withPrefix,
        contents: "Return the word OK.",
      });
      
      const text = response.text;
      
      console.log("✅ SUCCESS WITH PREFIX");
      console.log(`   Response: ${text?.substring(0, 50) || '(empty)'}`);
      workingModels.push(model.withPrefix);
      
    } catch (error: unknown) {
      // Try without prefix
      try {
        const response = await client.models.generateContent({
          model: model.name,
          contents: "Return the word OK.",
        });
        
        const text = response.text;
        
        console.log("✅ SUCCESS WITHOUT PREFIX");
        console.log(`   Response: ${text?.substring(0, 50) || '(empty)'}`);
        workingModels.push(model.name);
        
      } catch (error2: unknown) {
        console.log("❌ FAILED (both with and without prefix)");
        
        if (typeof error === 'object' && error !== null) {
          const err = error as { status?: number; message?: string };
          if (err.status) {
            console.log(`   Status: ${err.status}`);
          }
        }
      }
    }
    
    console.log();
  }

  // ========================================================================
  // RESULTS
  // ========================================================================
  console.log("=".repeat(70));
  console.log("RESULTS");
  console.log("=".repeat(70));
  console.log();

  if (workingModels.length === 0) {
    console.log("❌ NO WORKING MODELS FOUND");
    console.log();
    console.log("All tested models failed. This suggests:");
    console.log("- API quota exhausted");
    console.log("- Account/billing issue");
    console.log("- Regional restriction");
    console.log();
    console.log("MODEL IDENTIFIER STILL UNCLEAR — MORE DIAGNOSTICS REQUIRED");
  } else {
    console.log(`✅ FOUND ${workingModels.length} WORKING MODEL(S):`);
    console.log();
    
    workingModels.forEach((model, i) => {
      console.log(`${i + 1}. ${model}`);
    });
    
    console.log();
    console.log("=".repeat(70));
    console.log("RECOMMENDATION FOR PRODUCTION");
    console.log("=".repeat(70));
    console.log();
    
    const recommended = workingModels[0];
    console.log(`✅ Use: "${recommended}"`);
    console.log();
    console.log("Update GeminiPropertyExtractor:");
    console.log(`   constructor(apiKey: string, modelName = "${recommended}") {`);
    console.log();
    console.log("Or add to .env:");
    console.log(`   GEMINI_MODEL_NAME="${recommended}"`);
    console.log();
    console.log("MODEL IDENTIFIER CONFIRMED — READY TO FIX");
  }
  
  console.log("=".repeat(70));
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
