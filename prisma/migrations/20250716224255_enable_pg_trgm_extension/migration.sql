-- Enable pg_trgm extension for fuzzy search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram indexes for product name fuzzy search
CREATE INDEX IF NOT EXISTS product_name_trigram_idx ON "Product" USING gin (name gin_trgm_ops);
