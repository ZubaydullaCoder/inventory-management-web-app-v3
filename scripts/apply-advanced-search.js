/**
 * Script to apply advanced search database setup
 * Applies fuzzystrmatch extension and enhanced indexes
 */

require("dotenv").config();
const fs = require("fs");
const { Client } = require("pg");

async function applyAdvancedSearch() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable not found");
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    console.log("🔗 Connecting to database...");
    await client.connect();

    console.log("📝 Reading SQL migration file...");
    const sql = fs.readFileSync(
      "prisma/migrations/manual_advanced_search_setup.sql",
      "utf8"
    );

    console.log("🚀 Applying advanced search extensions...");
    await client.query(sql);

    console.log("✅ Advanced search extensions applied successfully!");
    console.log("📋 Applied:");
    console.log("   - fuzzystrmatch extension (Levenshtein distance)");
    console.log("   - Enhanced trigram indexes");
    console.log("   - Prefix matching indexes");
    console.log("   - Composite shop indexes");
    console.log("   - Optimized similarity threshold");
  } catch (error) {
    console.error("❌ Error applying advanced search setup:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyAdvancedSearch();
