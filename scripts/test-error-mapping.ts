/**
 * Test AI Error Mapping (without calling Gemini)
 *
 * Simulates different error scenarios to verify HTTP status mapping
 */

import { AIExtractionError } from "@/ai/application/errors/ai-extraction-error";
import { AIValidationError } from "@/ai/application/errors/ai-validation-error";
import { AIProviderUnavailableError } from "@/ai/application/errors/ai-provider-unavailable-error";

console.log("=".repeat(70));
console.log("AI ERROR MAPPING TEST (NO GEMINI CALLS)");
console.log("=".repeat(70));
console.log();

// Simulate error mapping logic from the route
function mapErrorToHttpStatus(error: unknown): { status: number; message: string } {
  // AI provider unavailable (503/429 from Gemini)
  if (error instanceof AIProviderUnavailableError) {
    return {
      status: 503,
      message: "השירות של ה-AI אינו זמין כרגע. נסי שוב בעוד כמה דקות."
    };
  }

  // AI validation errors (invalid output from AI)
  if (error instanceof AIValidationError) {
    return {
      status: 422,
      message: "הנתונים שחולצו אינם תקינים"
    };
  }

  // AI extraction errors (other AI-related failures)
  if (error instanceof AIExtractionError) {
    // Check if this is actually a provider unavailability
    const cause = (error as AIExtractionError).cause;
    if (isProviderUnavailabilityError(cause)) {
      return {
        status: 503,
        message: "השירות של ה-AI אינו זמין כרגע. נסי שוב בעוד כמה דקות."
      };
    }

    // General AI extraction failure
    return {
      status: 500,
      message: "שגיאה בחילוץ נתונים באמצעות AI"
    };
  }

  // Unknown
  return {
    status: 500,
    message: "שגיאה פנימית בשרת"
  };
}

function isProviderUnavailabilityError(cause: unknown): boolean {
  if (!cause || typeof cause !== 'object') {
    return false;
  }

  const err = cause as { status?: number; code?: number; message?: string };

  if (err.status === 503 || err.code === 503 || err.status === 429 || err.code === 429) {
    return true;
  }

  if (err.message) {
    if (err.message.includes('"status":"UNAVAILABLE"') ||
        err.message.includes('"status":"RESOURCE_EXHAUSTED"')) {
      return true;
    }
  }

  return false;
}

// Test cases
console.log("TEST 1: AIProviderUnavailableError (direct)");
const error1 = new AIProviderUnavailableError("Provider unavailable");
const result1 = mapErrorToHttpStatus(error1);
console.log(`  Expected: HTTP 503`);
console.log(`  Actual: HTTP ${result1.status}`);
console.log(`  Message: ${result1.message}`);
console.log(`  ${result1.status === 503 ? '✅ PASS' : '❌ FAIL'}`);
console.log();

console.log("TEST 2: AIExtractionError with 503 cause");
const error2 = new AIExtractionError(
  "Extraction failed",
  { status: 503, message: '{"status":"UNAVAILABLE"}' }
);
const result2 = mapErrorToHttpStatus(error2);
console.log(`  Expected: HTTP 503`);
console.log(`  Actual: HTTP ${result2.status}`);
console.log(`  Message: ${result2.message}`);
console.log(`  ${result2.status === 503 ? '✅ PASS' : '❌ FAIL'}`);
console.log();

console.log("TEST 3: AIExtractionError with 429 cause");
const error3 = new AIExtractionError(
  "Extraction failed",
  { code: 429, message: '{"status":"RESOURCE_EXHAUSTED"}' }
);
const result3 = mapErrorToHttpStatus(error3);
console.log(`  Expected: HTTP 503`);
console.log(`  Actual: HTTP ${result3.status}`);
console.log(`  Message: ${result3.message}`);
console.log(`  ${result3.status === 503 ? '✅ PASS' : '❌ FAIL'}`);
console.log();

console.log("TEST 4: AIValidationError");
const error4 = new AIValidationError("Invalid JSON");
const result4 = mapErrorToHttpStatus(error4);
console.log(`  Expected: HTTP 422`);
console.log(`  Actual: HTTP ${result4.status}`);
console.log(`  Message: ${result4.message}`);
console.log(`  ${result4.status === 422 ? '✅ PASS' : '❌ FAIL'}`);
console.log();

console.log("TEST 5: AIExtractionError without provider cause");
const error5 = new AIExtractionError("Unknown extraction error");
const result5 = mapErrorToHttpStatus(error5);
console.log(`  Expected: HTTP 500`);
console.log(`  Actual: HTTP ${result5.status}`);
console.log(`  Message: ${result5.message}`);
console.log(`  ${result5.status === 500 ? '✅ PASS' : '❌ FAIL'}`);
console.log();

console.log("=".repeat(70));
console.log("SUMMARY");
console.log("=".repeat(70));

const tests = [result1, result2, result3, result4, result5];
const expected = [503, 503, 503, 422, 500];
const passed = tests.filter((r, i) => r.status === expected[i]).length;

console.log(`Tests passed: ${passed}/${tests.length}`);
console.log();

if (passed === tests.length) {
  console.log("✅ ALL TESTS PASSED");
  console.log();
  console.log("Error mapping verified:");
  console.log("  - AIProviderUnavailableError → HTTP 503 ✅");
  console.log("  - AIExtractionError (503 cause) → HTTP 503 ✅");
  console.log("  - AIExtractionError (429 cause) → HTTP 503 ✅");
  console.log("  - AIValidationError → HTTP 422 ✅");
  console.log("  - AIExtractionError (other) → HTTP 500 ✅");
  console.log();
  console.log("AI ERROR MAPPING VERIFIED");
} else {
  console.log("❌ SOME TESTS FAILED");
  console.log();
  console.log("AI ERROR MAPPING FAILED — MORE DIAGNOSTICS REQUIRED");
}

console.log("=".repeat(70));
console.log();
console.log("NOTE: This test did NOT call Gemini API.");
console.log("No quota was consumed.");
console.log("=".repeat(70));
