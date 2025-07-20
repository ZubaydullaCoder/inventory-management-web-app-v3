-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- DropIndex
DROP INDEX "product_name_trigram_idx";
