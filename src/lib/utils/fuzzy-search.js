// src/lib/utils/fuzzy-search.js

/**
 * Utility functions and constants for fuzzy search functionality.
 * This module provides configuration and helper functions for PostgreSQL trigram-based fuzzy search.
 */

/**
 * Configuration constants for fuzzy search behavior
 */
export const FUZZY_SEARCH_CONFIG = {
  /** Minimum query length to trigger fuzzy search */
  MIN_QUERY_LENGTH: 3,
  
  /** Default similarity threshold (0-1, where 1 is exact match) */
  DEFAULT_SIMILARITY_THRESHOLD: 0.2,
  
  /** Similarity threshold for strict matching (3 chars) - lowered for better matching */
  STRICT_SIMILARITY_THRESHOLD: 0.15,
  
  /** Similarity threshold for loose matching */
  LOOSE_SIMILARITY_THRESHOLD: 0.1,
};

/**
 * Determines if a search query should use fuzzy search based on its characteristics.
 * @param {string} query - The search query to evaluate
 * @param {object} options - Configuration options
 * @param {boolean} options.enableFuzzySearch - Whether fuzzy search is enabled
 * @param {number} options.minLength - Minimum query length for fuzzy search
 * @returns {boolean} True if fuzzy search should be used
 */
export function shouldUseFuzzySearch(
  query, 
  { 
    enableFuzzySearch = true, 
    minLength = FUZZY_SEARCH_CONFIG.MIN_QUERY_LENGTH 
  } = {}
) {
  if (!enableFuzzySearch || !query) {
    return false;
  }
  
  const trimmed = query.trim();
  return trimmed.length >= minLength;
}

/**
 * Calculates an appropriate similarity threshold based on query characteristics.
 * Shorter queries use higher thresholds to reduce noise.
 * @param {string} query - The search query
 * @returns {number} Similarity threshold between 0 and 1
 */
export function calculateSimilarityThreshold(query) {
  if (!query) return FUZZY_SEARCH_CONFIG.DEFAULT_SIMILARITY_THRESHOLD;
  
  const length = query.trim().length;
  
  // Shorter queries need higher thresholds to avoid too many false positives
  if (length <= 3) return FUZZY_SEARCH_CONFIG.STRICT_SIMILARITY_THRESHOLD;
  if (length <= 5) return FUZZY_SEARCH_CONFIG.DEFAULT_SIMILARITY_THRESHOLD;
  
  // Longer queries can use lower thresholds for better fuzzy matching
  return FUZZY_SEARCH_CONFIG.LOOSE_SIMILARITY_THRESHOLD;
}

/**
 * Formats similarity score for display purposes.
 * @param {number} score - Raw similarity score (0-1)
 * @returns {string} Formatted percentage string
 */
export function formatSimilarityScore(score) {
  return `${Math.round(score * 100)}%`;
}

/**
 * Performance tips and usage examples for fuzzy search functionality.
 */
export const FUZZY_SEARCH_DOCS = `
## PostgreSQL Trigram Fuzzy Search

This implementation uses PostgreSQL's pg_trgm extension for fuzzy text matching.

### How it works:
1. **Trigrams**: Text is broken into 3-character sequences for comparison
2. **Similarity scoring**: Compares trigram overlap between search term and database values
3. **Performance**: Uses GIN indexes for fast trigram lookups

### Usage patterns:
- Short queries (1-2 chars): Uses standard ILIKE for performance
- Medium queries (3+ chars): Uses trigram similarity with adaptive thresholds
- Typo tolerance: Handles common misspellings and character transpositions

### Examples:
- "appl" matches "Apple iPhone" (similarity ~0.4)
- "samung" matches "Samsung Galaxy" (similarity ~0.7)
- "lptop" matches "Laptop Computer" (similarity ~0.3)

### Performance considerations:
- Trigram indexes are created automatically via migration
- Results are sorted by similarity score DESC, then creation date
- Similarity threshold adapts to query length for optimal relevance
`;
