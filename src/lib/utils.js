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
 * Formats a price value as Uzbek so'm currency.
 * Uses whole numbers (no decimal places) with space as thousands separator and "so'm" suffix.
 *
 * @param {number|string} price - The price value to format
 * @param {Object} options - Formatting options
 * @param {number} options.decimalScale - Number of decimal places (default: 0 for whole numbers)
 * @param {boolean} options.showSuffix - Whether to show "so'm" suffix (default: true)
 * @returns {string} The formatted currency string
 */
export function formatCurrency(price, options = {}) {
  const { decimalScale = 0, showSuffix = true } = options;

  // Handle null, undefined, or invalid values
  if (price === null || price === undefined || price === "") {
    return showSuffix ? "0 so'm" : "0";
  }

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  // Handle NaN
  if (isNaN(numericPrice)) {
    return showSuffix ? "0 so'm" : "0";
  }

  // Format with space as thousands separator and specified decimal places
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalScale,
    maximumFractionDigits: decimalScale,
    useGrouping: true,
  })
    .format(numericPrice)
    .replace(/,/g, " ");

  return showSuffix ? `${formatted} so'm` : formatted;
}
