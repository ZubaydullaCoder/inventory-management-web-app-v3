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
