import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Internal helper function to normalize text input.
 * Handles common text normalization tasks including:
 * - Trimming leading and trailing whitespace
 * - Collapsing multiple consecutive spaces into single spaces
 * - Preserving case, special characters, and Unicode characters
 *
 * @private
 * @param {string} text - The raw text input to normalize
 * @returns {string} The normalized text
 */
function normalizeText(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Trim whitespace and collapse multiple spaces
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Normalizes a product name for consistent storage and comparison.
 * Uses the core text normalization logic while maintaining human-readable
 * product names that preserve the user's intended formatting.
 *
 * @param {string} name - The raw product name input
 * @returns {string} The normalized product name
 */
export function normalizeProductName(name) {
  return normalizeText(name);
}

/**
 * Normalizes a category name for consistent storage and comparison.
 * Uses the same normalization logic as product names to ensure
 * consistent naming patterns across the application.
 *
 * @param {string} name - The raw category name input
 * @returns {string} The normalized category name
 */
export function normalizeCategoryName(name) {
  return normalizeText(name);
}
