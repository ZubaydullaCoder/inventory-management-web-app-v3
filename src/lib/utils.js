import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a product name by converting it to a URL-friendly slug.
 * This process includes:
 * - Transliterating Unicode characters to their closest ASCII equivalent.
 * - Converting the string to lowercase.
 * - Replacing spaces and special characters with a hyphen.
 * - Removing any characters that are not alphanumeric or hyphens.
 *
 * This ensures a consistent, URL-safe, and unique identifier for products,
 * preventing duplicates and improving data integrity.
 *
 * @param {string} name - The raw product name input.
 * @returns {string} The normalized product name.
 */
export function normalizeProductName(name) {
  if (!name || typeof name !== "string") {
    return "";
  }

  // Configure slugify to handle product names appropriately.
  // - `lower: true` converts the output to lowercase.
  // - `strict: true` removes any characters that are not valid in a URL slug.
  // - `trim: true` removes leading/trailing hyphens.
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
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
