/**
 * Advanced PostgreSQL Fuzzy Search Implementation for Categories
 *
 * This module implements a sophisticated multi-strategy search system for categories
 * that handles exact matches, typos, abbreviations, and fuzzy matching using
 * PostgreSQL's advanced text search capabilities.
 *
 * Strategies:
 * 1. Exact Match - Direct equality matching
 * 2. Prefix Match - Starts with pattern
 * 3. Substring Match - Contains pattern
 * 4. Acronym Match - Handles abbreviations like "c1" → "category-1"
 * 5. Fuzzy Match (Trigram) - Handles typos via similarity
 * 6. Levenshtein Distance - Advanced typo tolerance
 *
 * @module CategorySearch
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Search configuration for different strategies
 */
const SEARCH_CONFIG = {
  // Trigram similarity thresholds
  trigram: {
    veryShort: { length: 2, threshold: 0.1 }, // "c1" type queries
    short: { length: 4, threshold: 0.15 }, // "cat" type queries
    medium: { length: 8, threshold: 0.25 }, // "category" type queries
    long: { length: Infinity, threshold: 0.35 }, // longer queries
  },

  // Levenshtein distance limits
  levenshtein: {
    maxDistance: 3,
    shortQueryMaxDistance: 1, // For queries ≤ 3 chars
  },

  // Result limits for each strategy
  limits: {
    exact: 20,
    prefix: 15,
    substring: 10,
    acronym: 10,
    trigram: 8,
    levenshtein: 5,
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
      c.id,
      c.name,
      c."shopId",
      'exact' as match_type,
      1.0 as match_score,
      COUNT(p.id)::int as product_count
    FROM "Category" c
    LEFT JOIN "Product" p ON c.id = p."categoryId"
    WHERE c."shopId" = ${shopId}
      AND LOWER(c.name) = LOWER(${query})
    GROUP BY c.id, c.name, c."shopId"
    ORDER BY c.name
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
      c.id,
      c.name,
      c."shopId",
      'prefix' as match_type,
      0.9 as match_score,
      COUNT(p.id)::int as product_count
    FROM "Category" c
    LEFT JOIN "Product" p ON c.id = p."categoryId"
    WHERE c."shopId" = ${shopId}
      AND LOWER(c.name) LIKE LOWER(${query + "%"})
    GROUP BY c.id, c.name, c."shopId"
    ORDER BY c.name
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
      c.id,
      c.name,
      c."shopId",
      'substring' as match_type,
      0.8 as match_score,
      COUNT(p.id)::int as product_count
    FROM "Category" c
    LEFT JOIN "Product" p ON c.id = p."categoryId"
    WHERE c."shopId" = ${shopId}
      AND LOWER(c.name) LIKE LOWER(${"%" + query + "%"})
    GROUP BY c.id, c.name, c."shopId"
    ORDER BY c.name
    LIMIT ${limit}
  `;
}

/**
 * Strategy 4: Acronym/Abbreviation Match
 * Handles cases like "c1" → "category-1", "bc" → "beverage category"
 */
async function acronymMatch(
  query,
  shopId,
  limit = SEARCH_CONFIG.limits.acronym
) {
  // Create pattern for matching acronyms
  // For "c1" → match "c.*1" pattern in name
  const acronymPattern = query.split("").join(".*");

  return await prisma.$queryRaw`
    SELECT 
      c.id,
      c.name,
      c."shopId",
      'acronym' as match_type,
      0.7 as match_score,
      COUNT(p.id)::int as product_count
    FROM "Category" c
    LEFT JOIN "Product" p ON c.id = p."categoryId"
    WHERE c."shopId" = ${shopId}
      AND LOWER(c.name) ~ LOWER(${acronymPattern})
    GROUP BY c.id, c.name, c."shopId"
    ORDER BY c.name
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
      c.id,
      c.name,
      c."shopId",
      'trigram' as match_type,
      similarity(LOWER(c.name), LOWER(${query})) as match_score,
      COUNT(p.id)::int as product_count
    FROM "Category" c
    LEFT JOIN "Product" p ON c.id = p."categoryId"
    WHERE c."shopId" = ${shopId}
      AND similarity(LOWER(c.name), LOWER(${query})) > ${threshold}
    GROUP BY c.id, c.name, c."shopId"
    ORDER BY match_score DESC, c.name
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
      c.id,
      c.name,
      c."shopId",
      'levenshtein' as match_type,
      (1.0 - (levenshtein(LOWER(c.name), LOWER(${query}))::float / GREATEST(length(c.name), length(${query})))) as match_score,
      COUNT(p.id)::int as product_count
    FROM "Category" c
    LEFT JOIN "Product" p ON c.id = p."categoryId"
    WHERE c."shopId" = ${shopId}
      AND levenshtein(LOWER(c.name), LOWER(${query})) <= ${maxDistance}
    GROUP BY c.id, c.name, c."shopId"
    ORDER BY match_score DESC, c.name
    LIMIT ${limit}
  `;
}

/**
 * Multi-Strategy Fuzzy Search for Categories
 * Combines all strategies and returns ranked, deduplicated results
 *
 * @param {string} query - Search query
 * @param {string} shopId - Shop ID to filter by
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} Ranked search results
 */
export async function fuzzySearchCategories(query, shopId, maxResults = 25) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.trim();
  const results = new Map(); // Use Map to handle deduplication by category ID

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
    // Higher priority strategies will override lower ones for same category
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
      strategyResults.forEach((category) => {
        const existing = results.get(category.id);
        if (!existing || existing.priority < priority) {
          results.set(category.id, {
            ...category,
            priority,
            // Convert BigInt to regular number for JSON serialization
            id: category.id.toString(),
            shopId: category.shopId.toString(),
            match_score: Number(category.match_score),
            productCount: Number(category.product_count),
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
      .map((category) => {
        // Remove internal priority field before returning
        const { priority, ...cleanCategory } = category;
        return cleanCategory;
      });
  } catch (error) {
    console.error("Category fuzzy search error:", error);
    throw new Error(`Category search failed: ${error.message}`);
  }
}

/**
 * Simple category search (fallback for when fuzzy search is not needed)
 * @param {string} query - Search query
 * @param {string} shopId - Shop ID to filter by
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} Search results
 */
export async function simpleSearchCategories(query, shopId, maxResults = 25) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const results = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.name,
        c."shopId",
        COUNT(p.id)::int as product_count
      FROM "Category" c
      LEFT JOIN "Product" p ON c.id = p."categoryId"
      WHERE c."shopId" = ${shopId}
        AND LOWER(c.name) LIKE LOWER(${"%" + query.trim() + "%"})
      GROUP BY c.id, c.name, c."shopId"
      ORDER BY 
        CASE 
          WHEN LOWER(c.name) = LOWER(${query.trim()}) THEN 1
          WHEN LOWER(c.name) LIKE LOWER(${query.trim() + "%"}) THEN 2
          ELSE 3
        END,
        c.name
      LIMIT ${maxResults}
    `;

    return results.map((category) => ({
      ...category,
      id: category.id.toString(),
      shopId: category.shopId.toString(),
      productCount: Number(category.product_count),
    }));
  } catch (error) {
    console.error("Simple category search error:", error);
    throw new Error(`Category search failed: ${error.message}`);
  }
}
