import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a product name for consistent storage and comparison.
 * This process includes:
 * - Trimming leading and trailing whitespace
 * - Collapsing multiple consecutive spaces into single spaces
 * - Preserving case, special characters, and Unicode characters
 *
 * This ensures consistent data handling while maintaining human-readable
 * product names that preserve the user's intended formatting.
 *
 * @param {string} name - The raw product name input.
 * @returns {string} The normalized product name.
 */
export function normalizeProductName(name) {
  if (!name || typeof name !== "string") {
    return "";
  }

  // Trim whitespace and collapse multiple spaces
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Normalizes a category name using the same logic as product names.
 * This ensures consistent naming patterns across the application.
 *
 * @param {string} name - The raw category name input
 * @returns {string} The normalized name
 */
export function normalizeCategoryName(name) {
  return normalizeProductName(name);
}
