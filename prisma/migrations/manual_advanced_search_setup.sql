-- Enhanced PostgreSQL Fuzzy Search Migration
-- This migration adds advanced search capabilities including:
-- 1. fuzzystrmatch extension for Levenshtein distance
-- 2. Enhanced trigram indexes for better performance
-- 3. Regex support for acronym matching

-- Enable fuzzystrmatch extension for Levenshtein distance calculations
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Ensure pg_trgm is enabled (should already be from previous migration)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing indexes to recreate them with better configuration
DROP INDEX IF EXISTS "Product_name_trgm_idx";
DROP INDEX IF EXISTS "Product_sku_trgm_idx";

-- Create enhanced trigram indexes with better operator support
CREATE INDEX "Product_name_trgm_idx" ON "Product" USING GIN (LOWER(name) gin_trgm_ops);
CREATE INDEX "Product_sku_trgm_idx" ON "Product" USING GIN (LOWER(sku) gin_trgm_ops);

-- Create additional indexes for exact and prefix matching performance
CREATE INDEX IF NOT EXISTS "Product_name_lower_idx" ON "Product" (LOWER(name));
CREATE INDEX IF NOT EXISTS "Product_sku_lower_idx" ON "Product" (LOWER(sku));

-- Create indexes for prefix matching (text_pattern_ops for LIKE queries)
CREATE INDEX IF NOT EXISTS "Product_name_prefix_idx" ON "Product" (LOWER(name) text_pattern_ops);
CREATE INDEX IF NOT EXISTS "Product_sku_prefix_idx" ON "Product" (LOWER(sku) text_pattern_ops);

-- Composite index for shop-based searches with name ordering
CREATE INDEX IF NOT EXISTS "Product_shop_name_idx" ON "Product" ("shopId", LOWER(name));
CREATE INDEX IF NOT EXISTS "Product_shop_sku_idx" ON "Product" ("shopId", LOWER(sku));

-- Set pg_trgm similarity threshold globally for better short query handling
-- This affects the % operator behavior
SET pg_trgm.similarity_threshold = 0.1;
