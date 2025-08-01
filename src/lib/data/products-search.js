/**
 * Advanced PostgreSQL Fuzzy Search Implementation with Two-Stage Precision Filtering
 *
 * This module implements a sophisticated multi-strategy search system for products
 * that handles exact matches, typos, abbreviations, and fuzzy matching using
 * PostgreSQL's advanced text search capabilities.
 *
 * Search Architecture:
 * STAGE 1 - Broad Candidate Selection (Database-level):
 * 1. Exact Match - Direct equality matching
 * 2. Prefix Match - Starts with pattern
 * 3. Substring Match - Contains pattern
 * 4. Acronym Match - Handles abbreviations like "p1" → "product-1"
 * 5. Fuzzy Match (Trigram) - Handles typos via similarity
 * 6. Levenshtein Distance - Advanced typo tolerance
 *
 * STAGE 2 - Precision Filtering (In-memory):
 * For multi-word queries, applies token-based filtering to ensure all query
 * tokens are present in the product name or SKU, improving precision while
 * preserving typo tolerance from Stage 1.
 *
 * @module ProductSearch
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Search configuration for different strategies
 */
const SEARCH_CONFIG = {
  // Trigram similarity thresholds
  trigram: {
    veryShort: { length: 2, threshold: 0.1 }, // "p1" type queries
    short: { length: 4, threshold: 0.15 }, // "prod" type queries
    medium: { length: 8, threshold: 0.25 }, // "product" type queries
    long: { length: Infinity, threshold: 0.35 }, // longer queries
  },

  // Levenshtein distance limits
  levenshtein: {
    maxDistance: 3,
    shortQueryMaxDistance: 1, // For queries ≤ 3 chars
  },

  // Result limits for each strategy
  limits: {
    exact: 50,
    prefix: 30,
    substring: 25,
    acronym: 20,
    trigram: 15,
    levenshtein: 10,
  },
};

/**
 * Get appropriate trigram threshold based on query length
 * @param {string} query - Search query
 * @returns {number} Similarity threshold
 */
function getTrigramThreshold(query) {
  const length = query.length;
  if (length <= SEARCH_CONFIG.trigram.veryShort.length) {
    return SEARCH_CONFIG.trigram.veryShort.threshold;
  } else if (length <= SEARCH_CONFIG.trigram.short.length) {
    return SEARCH_CONFIG.trigram.short.threshold;
  } else if (length <= SEARCH_CONFIG.trigram.medium.length) {
    return SEARCH_CONFIG.trigram.medium.threshold;
  }
  return SEARCH_CONFIG.trigram.long.threshold;
}

/**
 * Get appropriate Levenshtein distance based on query length
 * @param {string} query - Search query
 * @returns {number} Maximum allowed distance
 */
function getLevenshteinDistance(query) {
  return query.length <= 3
    ? SEARCH_CONFIG.levenshtein.shortQueryMaxDistance
    : SEARCH_CONFIG.levenshtein.maxDistance;
}

/**
 * Strategy 1: Exact Match
 * Direct equality matching (case-insensitive)
 */
async function exactMatch(query, shopId, limit = SEARCH_CONFIG.limits.exact) {
  return await prisma.$queryRaw`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p."categoryId",
      p.stock,
      p."sellingPrice",
      p."purchasePrice",
      p.unit,
      p."createdAt",
      'exact' as match_type,
      1.0 as match_score,
      c.name as category_name
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE p."shopId" = ${shopId}
      AND (
        LOWER(p.name) = LOWER(${query})
        OR LOWER(p.sku) = LOWER(${query})
      )
    ORDER BY p.name
    LIMIT ${limit}
  `;
}

/**
 * Strategy 2: Prefix Match
 * Matches items that start with the query
 */
async function prefixMatch(query, shopId, limit = SEARCH_CONFIG.limits.prefix) {
  return await prisma.$queryRaw`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p."categoryId",
      p.stock,
      p."sellingPrice",
      p."purchasePrice",
      p.unit,
      p."createdAt",
      'prefix' as match_type,
      0.9 as match_score,
      c.name as category_name
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE p."shopId" = ${shopId}
      AND (
        LOWER(p.name) LIKE LOWER(${query + "%"})
        OR LOWER(p.sku) LIKE LOWER(${query + "%"})
      )
    ORDER BY p.name
    LIMIT ${limit}
  `;
}

/**
 * Strategy 3: Substring Match
 * Matches items that contain the query anywhere
 */
async function substringMatch(
  query,
  shopId,
  limit = SEARCH_CONFIG.limits.substring
) {
  return await prisma.$queryRaw`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p."categoryId",
      p.stock,
      p."sellingPrice",
      p."purchasePrice",
      p.unit,
      p."createdAt",
      'substring' as match_type,
      0.8 as match_score,
      c.name as category_name
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE p."shopId" = ${shopId}
      AND (
        LOWER(p.name) LIKE LOWER(${"%" + query + "%"})
        OR LOWER(p.sku) LIKE LOWER(${"%" + query + "%"})
      )
    ORDER BY p.name
    LIMIT ${limit}
  `;
}

/**
 * Strategy 4: Acronym/Abbreviation Match
 * Handles cases like "p1" → "product-1", "ap" → "apple pie"
 */
async function acronymMatch(
  query,
  shopId,
  limit = SEARCH_CONFIG.limits.acronym
) {
  // Create pattern for matching acronyms
  // For "p1" → match "p.*1" pattern in name
  const acronymPattern = query.split("").join(".*");

  return await prisma.$queryRaw`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p."categoryId",
      p.stock,
      p."sellingPrice",
      p."purchasePrice",
      p.unit,
      p."createdAt",
      'acronym' as match_type,
      0.7 as match_score,
      c.name as category_name
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE p."shopId" = ${shopId}
      AND (
        LOWER(p.name) ~ LOWER(${acronymPattern})
        OR LOWER(p.sku) ~ LOWER(${acronymPattern})
      )
    ORDER BY p.name
    LIMIT ${limit}
  `;
}

/**
 * Strategy 5: Trigram Fuzzy Match
 * Uses PostgreSQL trigram similarity for typo tolerance
 */
async function trigramMatch(
  query,
  shopId,
  limit = SEARCH_CONFIG.limits.trigram
) {
  const threshold = getTrigramThreshold(query);

  return await prisma.$queryRaw`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p."categoryId",
      p.stock,
      p."sellingPrice",
      p."purchasePrice",
      p.unit,
      p."createdAt",
      'trigram' as match_type,
      GREATEST(
        similarity(LOWER(p.name), LOWER(${query})),
        similarity(LOWER(p.sku), LOWER(${query}))
      ) as match_score,
      c.name as category_name
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE p."shopId" = ${shopId}
      AND (
        similarity(LOWER(p.name), LOWER(${query})) > ${threshold}
        OR similarity(LOWER(p.sku), LOWER(${query})) > ${threshold}
      )
    ORDER BY match_score DESC, p.name
    LIMIT ${limit}
  `;
}

/**
 * Strategy 6: Levenshtein Distance Match
 * Advanced typo tolerance using edit distance
 */
async function levenshteinMatch(
  query,
  shopId,
  limit = SEARCH_CONFIG.limits.levenshtein
) {
  const maxDistance = getLevenshteinDistance(query);

  return await prisma.$queryRaw`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p."categoryId",
      p.stock,
      p."sellingPrice",
      p."purchasePrice",
      p.unit,
      p."createdAt",
      'levenshtein' as match_type,
      (1.0 - (LEAST(
        levenshtein(LOWER(p.name), LOWER(${query})),
        levenshtein(LOWER(p.sku), LOWER(${query}))
      )::float / GREATEST(length(p.name), length(${query})))) as match_score,
      c.name as category_name
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    WHERE p."shopId" = ${shopId}
      AND (
        levenshtein(LOWER(p.name), LOWER(${query})) <= ${maxDistance}
        OR levenshtein(LOWER(p.sku), LOWER(${query})) <= ${maxDistance}
      )
    ORDER BY match_score DESC, p.name
    LIMIT ${limit}
  `;
}

/**
 * Multi-Strategy Fuzzy Search with Two-Stage Precision Filtering
 * 
 * STAGE 1: Executes multiple search strategies in parallel to gather broad candidates
 * that handle typos, abbreviations, and various matching patterns.
 *
 * STAGE 2: For multi-word queries, applies precision filtering to ensure all query
 * tokens are present in results, improving relevance while preserving typo tolerance.
 *
 * Example behavior:
 * - Single word "otverka" → Returns all products containing "otverka" (Stage 1 only)
 * - Multi-word "otverka qizil marka a50" → Returns products containing ALL tokens (Stage 1 + Stage 2)
 *
 * @param {string} query - Search query (single or multi-word)
* @param {string} shopId - Shop ID to filter by
 * @param {number} maxResults - Maximum results to return
 * @param {string} dateRangeFilter - Date range filter string
 * @returns {Promise<Array>} Ranked search results with match metadata
 */
export async function fuzzySearchProducts(query, shopId, maxResults = 50, dateRangeFilter = "") {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.trim();
  const results = new Map(); // Use Map to handle deduplication by product ID

  try {
    const searchStrategies = [
      { strategy: exactMatch, priority: 6 },
      { strategy: prefixMatch, priority: 5 },
      { strategy: substringMatch, priority: 4 },
      { strategy: acronymMatch, priority: 3 },
      { strategy: trigramMatch, priority: 2 },
      { strategy: levenshteinMatch, priority: 1 },
    ];

    for (const { strategy, priority } of searchStrategies) {
      if (results.size >= maxResults) {
        break; // Stop if we have enough results
      }

      const strategyResults = await strategy(normalizedQuery, shopId, maxResults);

      strategyResults.forEach((product) => {
        if (!results.has(product.id)) {
          results.set(product.id, {
            ...product,
            priority,
            // Convert BigInt to regular number for JSON serialization
            id: Number(product.id),
            categoryId: product.categoryId ? Number(product.categoryId) : null,
            stock: Number(product.stock),
            sellingPrice: Number(product.sellingPrice),
            purchasePrice: Number(product.purchasePrice),
            match_score: Number(product.match_score),
            // Add category object for compatibility
            category: product.category_name
              ? {
                  id: product.categoryId,
                  name: product.category_name,
                }
              : null,
          });
        }
      });
    }

    // Convert to array for filtering
    let finalResults = Array.from(results.values());

    // STAGE 2: Precision Filtering for multi-word queries
    const queryTokens = normalizedQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (queryTokens.length > 1) {
      finalResults = finalResults.filter(product => {
        const productName = product.name.toLowerCase();
        const productSku = product.sku ? product.sku.toLowerCase() : '';
        const searchableText = `${productName} ${productSku}`;
        
        return queryTokens.every(token => searchableText.includes(token));
      });
    }
    
    if (dateRangeFilter && dateRangeFilter.trim()) {
      const [from, to] = dateRangeFilter.split(",").map(ts => ts ? new Date(Number(ts)) : null);
      if (from && to) {
        finalResults = finalResults.filter(p => p.createdAt >= from && p.createdAt <= to);
      } else if (from) {
        finalResults = finalResults.filter(p => p.createdAt >= from);
      } else if (to) {
        finalResults = finalResults.filter(p => p.createdAt <= to);
      }
    }
    
    // Sort by priority and score, then limit results
    return finalResults
      .sort((a, b) => {
        // First sort by priority (higher priority first)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // Then by match score (higher score first)
        if (a.match_score !== b.match_score) {
          return b.match_score - a.match_score;
        }
        // Finally by name alphabetically
        return a.name.localeCompare(b.name);
      })
      .slice(0, maxResults)
      .map((product) => {
        // Remove internal priority field before returning
        const { priority, ...cleanProduct } = product;
        return cleanProduct;
      });
  } catch (error) {
    console.error("Fuzzy search error:", error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * Simple product search (fallback for when fuzzy search is not needed)
 * @param {string} query - Search query
 * @param {string} shopId - Shop ID to filter by
* @param {number} maxResults - Maximum results to return
 * @param {string} dateRangeFilter - Date range filter string
 * @returns {Promise<Array>} Search results
 */
export async function simpleSearchProducts(query, shopId, maxResults = 50, dateRangeFilter = "") {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const results = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p."categoryId",
        p.stock,
        p."sellingPrice",
        p."purchasePrice",
        p.unit,
        p."createdAt",
        c.name as category_name
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE p."shopId" = ${shopId}
        AND (
          LOWER(p.name) LIKE LOWER(${"%" + query.trim() + "%"})
          OR LOWER(p.sku) LIKE LOWER(${"%" + query.trim() + "%"})
        )
      ORDER BY 
        CASE 
          WHEN LOWER(p.name) = LOWER(${query.trim()}) THEN 1
          WHEN LOWER(p.name) LIKE LOWER(${query.trim() + "%"}) THEN 2
          ELSE 3
        END,
        p.name
      LIMIT ${maxResults}
    `;

    if (dateRangeFilter && dateRangeFilter.trim()) {
      const [from, to] = dateRangeFilter.split(",").map(ts => ts ? new Date(Number(ts)) : null);
      if (from && to) {
        results = results.filter(p => p.createdAt >= from && p.createdAt <= to);
      } else if (from) {
        results = results.filter(p => p.createdAt >= from);
      } else if (to) {
        results = results.filter(p => p.createdAt <= to);
      }
    }

    return results.map((product) => ({
      ...product,
      id: Number(product.id),
      categoryId: product.categoryId ? Number(product.categoryId) : null,
      stock: Number(product.stock),
      sellingPrice: Number(product.sellingPrice),
      purchasePrice: Number(product.purchasePrice),
      // Add category object for compatibility
      category: product.category_name
        ? {
            id: product.categoryId,
            name: product.category_name,
          }
        : null,
      createdAt: product.createdAt,
    }));
  } catch (error) {
    console.error("Simple search error:", error);
    throw new Error(`Search failed: ${error.message}`);
  }
}
