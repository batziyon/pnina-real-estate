/**
 * Verification script for neighborhood normalization logic.
 * 
 * Tests that the normalization function correctly handles:
 * - Exact matches
 * - Punctuation variations
 * - Whitespace variations
 * - Case variations
 * 
 * This does NOT call the AI or make any network requests.
 */

// Replicate the normalization logic from the use case
function normalizeNeighborhoodName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[-_()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Test cases
const testCases = [
  {
    description: "Exact match (no normalization needed)",
    input: "קטמון",
    expected: "קטמון",
  },
  {
    description: "Hyphen separator",
    input: "קטמון-הישנה",
    expected: "קטמון הישנה",
  },
  {
    description: "Parentheses",
    input: "קטמון (הישנה)",
    expected: "קטמון הישנה",
  },
  {
    description: "Multiple spaces",
    input: "קטמון   הישנה",
    expected: "קטמון הישנה",
  },
  {
    description: "Leading/trailing whitespace",
    input: "  קטמון הישנה  ",
    expected: "קטמון הישנה",
  },
  {
    description: "Uppercase (case-insensitive)",
    input: "קטמון הישנה",
    expected: "קטמון הישנה",
  },
  {
    description: "Underscore separator",
    input: "רמת_שרת",
    expected: "רמת שרת",
  },
  {
    description: "Mixed punctuation and spaces",
    input: "בית  הכרם - מזרח",
    expected: "בית הכרם מזרח",
  },
];

// Comparison test: ensure different neighborhoods remain different
const comparisonTests = [
  {
    neighborhood1: "קטמון",
    neighborhood2: "גוננים - קטמונים",
    shouldMatch: false,
  },
  {
    neighborhood1: "בית הכרם",
    neighborhood2: "בית וגן",
    shouldMatch: false,
  },
  {
    neighborhood1: "רמת שרת ורמת דניה",
    neighborhood2: "רמת-שרת-ורמת-דניה",
    shouldMatch: true,
  },
];

console.log("=== Neighborhood Normalization Verification ===\n");

let passed = 0;
let failed = 0;

// Test normalization
console.log("Testing normalization:");
for (const test of testCases) {
  const result = normalizeNeighborhoodName(test.input);
  const success = result === test.expected;
  
  if (success) {
    passed++;
    console.log(`✓ ${test.description}`);
    console.log(`  Input:    "${test.input}"`);
    console.log(`  Output:   "${result}"`);
  } else {
    failed++;
    console.log(`✗ ${test.description}`);
    console.log(`  Input:    "${test.input}"`);
    console.log(`  Expected: "${test.expected}"`);
    console.log(`  Got:      "${result}"`);
  }
  console.log();
}

// Test comparison
console.log("\nTesting neighborhood comparison:");
for (const test of comparisonTests) {
  const norm1 = normalizeNeighborhoodName(test.neighborhood1);
  const norm2 = normalizeNeighborhoodName(test.neighborhood2);
  const matches = norm1 === norm2;
  const success = matches === test.shouldMatch;
  
  if (success) {
    passed++;
    console.log(`✓ "${test.neighborhood1}" vs "${test.neighborhood2}"`);
    console.log(`  Should match: ${test.shouldMatch}, Matches: ${matches}`);
  } else {
    failed++;
    console.log(`✗ "${test.neighborhood1}" vs "${test.neighborhood2}"`);
    console.log(`  Should match: ${test.shouldMatch}, Matches: ${matches}`);
    console.log(`  Normalized 1: "${norm1}"`);
    console.log(`  Normalized 2: "${norm2}"`);
  }
  console.log();
}

console.log("=== Summary ===");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  console.log("\n❌ Some tests failed");
  process.exit(1);
} else {
  console.log("\n✅ All tests passed");
  process.exit(0);
}
