/**
 * Test Real AI Extraction Endpoint
 * 
 * POST /api/admin/properties/ai-extract
 */

async function main() {
  console.log("=".repeat(70));
  console.log("TESTING AI EXTRACTION ENDPOINT");
  console.log("=".repeat(70));
  console.log();

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

  try {
    const response = await fetch("http://localhost:3000/api/admin/properties/ai-extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        freeText: testInput,
      }),
    });

    console.log(`Response status: ${response.status}`);
    console.log();

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ REQUEST FAILED");
      console.log(`Error: ${errorText.substring(0, 500)}`);
      console.log();
      console.log("=".repeat(70));
      console.log("AI EXTRACTION ENDPOINT FAILED");
      console.log("=".repeat(70));
      process.exit(1);
    }

    const data = await response.json();
    
    console.log("✅ REQUEST SUCCEEDED");
    console.log();
    console.log("Extracted fields:");
    console.log("-".repeat(70));
    
    // Show key fields without exposing full data
    const fields = [
      'title', 'description', 'dealType', 'propertyType', 
      'price', 'neighborhoodName', 'rooms', 'area',
      'floor', 'totalFloors', 'parking', 'elevator',
      'balcony', 'safeRoom', 'overallConfidence'
    ];
    
    fields.forEach(field => {
      if (data[field] !== undefined) {
        const value = data[field];
        if (typeof value === 'object' && value !== null) {
          console.log(`  ${field}:`, JSON.stringify(value));
        } else {
          console.log(`  ${field}:`, value);
        }
      }
    });
    
    console.log();
    console.log("Metadata:");
    if (data.metadata) {
      console.log(`  provider: ${data.metadata.provider}`);
      console.log(`  model: ${data.metadata.model}`);
      console.log(`  extractedAt: ${data.metadata.extractedAt}`);
    }
    
    console.log();
    console.log("=".repeat(70));
    console.log("AI EXTRACTION ENDPOINT VERIFIED");
    console.log("=".repeat(70));
    
  } catch (error) {
    console.log("❌ REQUEST ERROR");
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    }
    console.log();
    console.log("=".repeat(70));
    console.log("AI EXTRACTION ENDPOINT FAILED");
    console.log("=".repeat(70));
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
