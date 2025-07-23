/**
 * Advanced PostgreSQL Fuzzy Search Implementation
 *
 * This module implements a sophisticated multi-strategy search system for products
 * that handles exact matches, typos, abbreviations, and fuzzy matching using
 * PostgreSQL's advanced text search capabilities.
 *
 * Strategies:
 * 1. Exact Match - Direct equality matching
 * 2. Prefix Match - Starts with pattern
 * 3. Substring Match - Contains pattern
 * 4. Acronym Match - Handles abbreviations like "p1" → "product-1"
 * 5. Fuzzy Match (Trigram) - Handles typos via similarity
 * 6. Levenshtein Distance - Advanced typo tolerance
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
 * Multi-Strategy Fuzzy Search
 * Combines all strategies and returns ranked, deduplicated results
 *
 * @param {string} query - Search query
 * @param {string} shopId - Shop ID to filter by
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} Ranked search results
 */
export async function fuzzySearchProducts(query, shopId, maxResults = 50) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.trim();
  const results = new Map(); // Use Map to handle deduplication by product ID

  try {
    // Execute all strategies in parallel for performance
    const [
      exactResults,
      prefixResults,
      substringResults,
      acronymResults,
      trigramResults,
      levenshteinResults,
    ] = await Promise.all([
      exactMatch(normalizedQuery, shopId),
      prefixMatch(normalizedQuery, shopId),
      substringMatch(normalizedQuery, shopId),
      acronymMatch(normalizedQuery, shopId),
      trigramMatch(normalizedQuery, shopId),
      levenshteinMatch(normalizedQuery, shopId),
    ]);

    // Combine results with strategy prioritization
    // Higher priority strategies will override lower ones for same product
    const allStrategies = [
      { results: levenshteinResults, priority: 1 },
      { results: trigramResults, priority: 2 },
      { results: acronymResults, priority: 3 },
      { results: substringResults, priority: 4 },
      { results: prefixResults, priority: 5 },
      { results: exactResults, priority: 6 }, // Highest priority
    ];

    // Process results in priority order (lowest priority first)
    allStrategies.forEach(({ results: strategyResults, priority }) => {
      strategyResults.forEach((product) => {
        const existing = results.get(product.id);
        if (!existing || existing.priority < priority) {
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
    });

    // Convert to array, sort by priority and score, then limit results
    return Array.from(results.values())
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
 * @returns {Promise<Array>} Search results
 */
export async function simpleSearchProducts(query, shopId, maxResults = 50) {
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
