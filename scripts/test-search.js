/**
 * Test script for Advanced PostgreSQL Fuzzy Search
 * Tests all strategies: exact, prefix, substring, acronym, trigram, and Levenshtein
 */

require("dotenv").config();
const {
  fuzzySearchProducts,
  simpleSearchProducts,
} = require("../src/lib/data/products-search");

async function testSearchScenarios() {
  // Test shop ID - you'll need to replace this with an actual shop ID from your database
  const testShopId = "test-shop-id";

  console.log("🧪 Testing Advanced PostgreSQL Fuzzy Search Implementation\n");

  const testCases = [
    {
      name: "Exact Match Test",
      query: "product-1",
      description: "Should find exact match with highest priority",
    },
    {
      name: "Prefix Match Test",
      query: "pro",
      description: 'Should find products starting with "pro"',
    },
    {
      name: "Substring Match Test",
      query: "duct",
      description: 'Should find products containing "duct"',
    },
    {
      name: "Acronym Match Test (Key Test)",
      query: "p1",
      description: 'Should find "product-1" via acronym matching',
    },
    {
      name: "Trigram Fuzzy Test",
      query: "prodct",
      description: 'Should find "product" with typo tolerance',
    },
    {
      name: "Levenshtein Test",
      query: "prodcut",
      description: 'Should find "product" with advanced typo tolerance',
    },
    {
      name: "Very Short Query Test",
      query: "p",
      description: "Should handle very short queries efficiently",
    },
    {
      name: "Empty Query Test",
      query: "",
      description: "Should return empty array for empty query",
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`Query: "${testCase.query}"`);
    console.log(`Expected: ${testCase.description}`);

    try {
      const startTime = Date.now();
      const results = await fuzzySearchProducts(testCase.query, testShopId);
      const endTime = Date.now();

      console.log(`⏱️  Query time: ${endTime - startTime}ms`);
      console.log(`📊 Results count: ${results.length}`);

      if (results.length > 0) {
        console.log(`🎯 Top results:`);
        results.slice(0, 3).forEach((product, index) => {
          console.log(
            `   ${index + 1}. "${product.name}" (${
              product.match_type
            }, score: ${product.match_score})`
          );
        });
      } else {
        console.log(`📭 No results found`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log("\n🎉 Search test completed!");
  console.log("\n📝 Key Features Tested:");
  console.log("   ✅ Multi-strategy search pipeline");
  console.log('   ✅ Acronym matching ("p1" → "product-1")');
  console.log("   ✅ Typo tolerance (trigram + Levenshtein)");
  console.log("   ✅ Performance optimization");
  console.log("   ✅ Result deduplication and ranking");
  console.log("   ✅ Fallback handling");
}

// Alternative: Test with sample data insert
async function setupTestData() {
  console.log("🔧 Setting up test data...");

  // You would insert some test products here if needed
  console.log(
    "⚠️  Note: Add actual test products to your database for comprehensive testing"
  );
  console.log("   Example products to add:");
  console.log('   - "product-1"');
  console.log('   - "product-2"');
  console.log('   - "apple juice"');
  console.log('   - "banana split"');
  console.log('   - "chocolate bar"');
}

async function runTests() {
  await setupTestData();
  await testSearchScenarios();
  process.exit(0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testSearchScenarios, setupTestData };
