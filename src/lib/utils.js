import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a product name by trimming whitespace, collapsing all Unicode separator spaces,
 * and converting to lowercase for case-insensitive matching.
 * This ensures consistent name checking and prevents duplicate names with different spacing or casing.
 *
 * @param {string} name - The raw product name input
 * @returns {string} The normalized name
 */
export function normalizeProductName(name) {
  if (!name || typeof name !== "string") {
    return "";
  }

  // Trim, collapse all Unicode separator whitespace, and convert to lowercase
  return name
    .trim()
    .replace(/\p{Z}+/gu, " ")
    .toLowerCase();
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

/**
 * Formats a numeric string/value by inserting spaces as thousand separators.
 * E.g. "10000" or 10000 → "10 000"
 *
 * @param {string|number} value
 * @returns {string}
 */
export function formatNumberWithSpaces(value) {
  if (value == null) return "";
  const str = String(value).replace(/\s+/g, "");
  if (!/^\d+$/.test(str)) return str;
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Parses a formatted numeric string by removing all spaces.
 *
 * @param {string} str
 * @returns {string}
 */
export function parseNumberWithSpaces(str) {
  return String(str).replace(/\s+/g, "");
}
