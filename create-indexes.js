// Create trigram indexes for better fuzzy search performance
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createTrigramIndexes() {
  console.log(
    "🔧 Creating trigram indexes for better fuzzy search performance...\n"
  );

  try {
    // Create trigram index for product names
    console.log("1. Creating trigram index for product names...");
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS product_name_trigram_idx 
      ON "Product" USING gin (name gin_trgm_ops);
    `;
    console.log("   ✅ Product name trigram index created");

    // Verify indexes were created
    console.log("\n2. Verifying indexes...");
    const indexes = await prisma.$queryRaw`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'Product' 
      AND indexdef LIKE '%gin_trgm_ops%';
    `;

    console.log(`   📊 Trigram indexes found: ${indexes.length}`);
    indexes.forEach((idx) => {
      console.log(`   - ${idx.indexname}`);
    });

    console.log("\n✅ Trigram indexes created successfully!");
  } catch (error) {
    console.error("❌ Error creating trigram indexes:", error);
    console.error("Error details:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTrigramIndexes();
