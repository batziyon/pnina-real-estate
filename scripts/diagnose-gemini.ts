/**
 * Gemini Connectivity Diagnostic
 * 
 * Tests:
 * 1. Environment variable presence
 * 2. SDK version
 * 3. List available models
 * 4. Test minimal generation
 * 5. Test current configured model
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
          // Remove surrounding quotes if present
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
console.log("GEMINI CONNECTIVITY DIAGNOSTIC");
console.log("=".repeat(70));
console.log();

// ============================================================================
// 1. VERIFY ENVIRONMENT
// ============================================================================
console.log("1. ENVIRONMENT VERIFICATION");
console.log("-".repeat(70));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.log("❌ GEMINI_API_KEY: MISSING");
  console.log("   The environment variable is not set.");
  process.exit(1);
} else {
  console.log("✅ GEMINI_API_KEY: PRESENT");
  
  // Check for common mistakes
  if (apiKey.startsWith('"') || apiKey.startsWith("'")) {
    console.log("⚠️  WARNING: API key appears to have surrounding quotes");
  }
  
  if (apiKey.includes(" ")) {
    console.log("⚠️  WARNING: API key contains spaces");
  }
  
  console.log(`   Length: ${apiKey.length} characters`);
}
console.log();

// ============================================================================
// 2. VERIFY SDK VERSION
// ============================================================================
console.log("2. SDK VERSION");
console.log("-".repeat(70));

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const genaiVersion = packageJson.dependencies['@google/genai'];
  console.log(`✅ @google/genai: ${genaiVersion}`);
} catch (error) {
  console.log(`⚠️  Could not read package.json`);
}
console.log();

// ============================================================================
// 3. INITIALIZE CLIENT
// ============================================================================
console.log("3. CLIENT INITIALIZATION");
console.log("-".repeat(70));

let client: GoogleGenAI;
try {
  client = new GoogleGenAI({ apiKey });
  console.log("✅ GoogleGenAI client initialized");
} catch (error) {
  console.log("❌ Failed to initialize client");
  if (error instanceof Error) {
    console.log(`   Error: ${error.message}`);
  }
  process.exit(1);
}
console.log();

// ============================================================================
// 4. LIST AVAILABLE MODELS
// ============================================================================
console.log("4. LIST AVAILABLE MODELS");
console.log("-".repeat(70));

let availableModels: string[] = [];
try {
  // Try to list models if the SDK supports it
  const modelsResponse = await client.models.list();
  
  console.log(`   Raw response type: ${typeof modelsResponse}`);
  console.log(`   Is array: ${Array.isArray(modelsResponse)}`);
  
  // Try to iterate if it's an async iterator
  if (modelsResponse && typeof modelsResponse[Symbol.asyncIterator] === 'function') {
    console.log("   Response is async iterable, reading models...");
    for await (const model of modelsResponse as AsyncIterable<{ name: string }>) {
      if (model && model.name) {
        availableModels.push(model.name);
      }
    }
    console.log(`✅ Found ${availableModels.length} models:`);
    availableModels.forEach((model, i) => {
      console.log(`   ${i + 1}. ${model}`);
    });
  } else if (modelsResponse && typeof modelsResponse === 'object') {
    // Check if it has a models property
    const response = modelsResponse as { models?: Array<{ name: string }> };
    if (response.models && Array.isArray(response.models)) {
      availableModels = response.models.map(m => m.name);
      console.log(`✅ Found ${availableModels.length} models:`);
      availableModels.forEach((model, i) => {
        console.log(`   ${i + 1}. ${model}`);
      });
    } else {
      console.log("⚠️  Model listing returned unexpected format");
      console.log(`   Keys: ${Object.keys(modelsResponse).join(', ')}`);
    }
  }
} catch (error) {
  console.log("⚠️  Could not list models");
  if (error instanceof Error) {
    console.log(`   Error: ${error.message}`);
  }
}

// If we didn't get models, try common known names
if (availableModels.length === 0) {
  console.log();
  console.log("   Will test with known Gemini 2.0 and 1.5 model names...");
  availableModels = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-pro"
  ];
}
console.log();

// ============================================================================
// 5. TEST MINIMAL GENERATION WITH FIRST AVAILABLE MODEL
// ============================================================================
console.log("5. MINIMAL GENERATION TEST");
console.log("-".repeat(70));

let workingModel: string | null = null;

for (const modelName of availableModels) {
  console.log(`Testing model: ${modelName}`);
  
  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: "Return the word OK.",
    });
    
    const text = response.text;
    console.log(`✅ SUCCESS`);
    console.log(`   Response: ${text?.substring(0, 100) || '(empty)'}`);
    workingModel = modelName;
    break; // Found a working model, stop testing
    
  } catch (error: unknown) {
    console.log(`❌ FAILED`);
    
    if (typeof error === 'object' && error !== null) {
      const err = error as { status?: number; message?: string; code?: number };
      
      if (err.status) {
        console.log(`   HTTP Status: ${err.status}`);
      }
      
      if (err.code) {
        console.log(`   Error Code: ${err.code}`);
      }
      
      if (err.message) {
        console.log(`   Message: ${err.message}`);
      }
    }
    
    console.log();
  }
}

if (!workingModel) {
  console.log("❌ No working model found among tested models");
}
console.log();

// ============================================================================
// 6. TEST CURRENT CONFIGURED MODEL
// ============================================================================
console.log("6. TEST CURRENT CONFIGURED MODEL");
console.log("-".repeat(70));

const currentModel = "gemini-3.8-flash"; // From GeminiPropertyExtractor default
console.log(`Current configured model: ${currentModel}`);

const isInList = availableModels.includes(currentModel);
console.log(`Is in available models list: ${isInList ? 'YES' : 'NO'}`);

if (!isInList) {
  console.log("⚠️  WARNING: Current model is NOT in the available models list");
  console.log("   This is likely the root cause of the 503 error.");
}

console.log();
console.log("Testing current model...");

try {
  const response = await client.models.generateContent({
    model: currentModel,
    contents: "Return the word OK.",
  });
  
  const text = response.text;
  console.log(`✅ Current model works!`);
  console.log(`   Response: ${text?.substring(0, 100) || '(empty)'}`);
  
} catch (error: unknown) {
  console.log(`❌ Current model FAILED`);
  
  if (typeof error === 'object' && error !== null) {
    const err = error as { status?: number; message?: string; code?: number };
    
    if (err.status) {
      console.log(`   HTTP Status: ${err.status}`);
    }
    
    if (err.code) {
      console.log(`   Error Code: ${err.code}`);
    }
    
    if (err.message) {
      console.log(`   Message: ${err.message}`);
    }
    
    if (err.status === 503 || err.code === 503) {
      console.log();
      console.log("   ⚠️  This is the 503 error from production!");
      console.log("   The model name is likely invalid or unavailable.");
    }
    
    if (err.status === 400) {
      console.log();
      console.log("   ⚠️  This suggests an API key or request format issue.");
    }
  }
}

console.log();

// ============================================================================
// 7. FINAL REPORT
// ============================================================================
console.log("=".repeat(70));
console.log("FINAL DIAGNOSTIC REPORT");
console.log("=".repeat(70));
console.log();

console.log("A. @google/genai version:");
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`   ${packageJson.dependencies['@google/genai']}`);
} catch {
  console.log("   Unknown");
}
console.log();

console.log("B. GEMINI_API_KEY present:");
console.log(`   ${apiKey ? 'YES' : 'NO'}`);
console.log();

console.log("C. API authentication status:");
if (workingModel) {
  console.log("   ✅ AUTHENTICATED - API key is valid");
} else if (!apiKey) {
  console.log("   ❌ NO API KEY");
} else {
  console.log("   ❓ UNCLEAR - Could not verify with any model");
}
console.log();

console.log("D. Models tested:");
availableModels.forEach(model => {
  const status = model === workingModel ? '✅' : '❌';
  console.log(`   ${status} ${model}`);
});
console.log();

console.log("E. Current configured model:");
console.log(`   ${currentModel}`);
console.log();

console.log("F. Current model exists in API:");
console.log(`   ${isInList ? 'YES (in list)' : 'NO (not in list)'}`);
console.log();

console.log("G. Minimal generation result:");
if (workingModel) {
  console.log(`   ✅ SUCCESS with ${workingModel}`);
} else {
  console.log("   ❌ FAILED with all tested models");
}
console.log();

console.log("H. Working model:");
console.log(`   ${workingModel || 'NONE FOUND'}`);
console.log();

console.log("I. ROOT CAUSE:");
if (!apiKey) {
  console.log("   GEMINI_API_KEY environment variable is missing");
} else if (currentModel !== workingModel && workingModel) {
  console.log(`   The configured model "${currentModel}" is invalid/unavailable`);
  console.log(`   A working model is: "${workingModel}"`);
} else if (!workingModel) {
  console.log("   Could not find any working model");
  console.log("   Possible causes:");
  console.log("   - API key is invalid");
  console.log("   - Project/quota restrictions");
  console.log("   - Region restrictions");
  console.log("   - SDK version incompatibility");
} else {
  console.log("   Current model works in isolation");
  console.log("   The production error may be request-specific");
}
console.log();

console.log("J. NEXT FIX REQUIRED:");
if (!apiKey) {
  console.log("   1. Set GEMINI_API_KEY in .env file");
  console.log("   2. Restart the application");
} else if (workingModel && currentModel !== workingModel) {
  console.log(`   1. Change model from "${currentModel}" to "${workingModel}"`);
  console.log("   2. Update GeminiPropertyExtractor constructor default");
  console.log("   3. Or pass the working model via environment variable");
} else if (!workingModel) {
  console.log("   1. Verify API key is correct");
  console.log("   2. Check Google Cloud project settings");
  console.log("   3. Verify billing is enabled");
  console.log("   4. Check API quotas and limits");
} else {
  console.log("   1. Test the full property extraction prompt");
  console.log("   2. Check if the issue is prompt-specific");
}
console.log();

console.log("=".repeat(70));
if (workingModel && currentModel !== workingModel) {
  console.log("ROOT CAUSE IDENTIFIED — READY TO FIX");
} else if (!workingModel && apiKey) {
  console.log("ROOT CAUSE NOT YET IDENTIFIED — MORE DIAGNOSTICS REQUIRED");
} else if (!apiKey) {
  console.log("ROOT CAUSE IDENTIFIED — READY TO FIX");
} else {
  console.log("ROOT CAUSE PARTIALLY IDENTIFIED — FURTHER TESTING NEEDED");
}
console.log("=".repeat(70));
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
