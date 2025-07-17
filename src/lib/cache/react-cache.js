// src/lib/cache/react-cache.js
import { cache } from "react";

/**
 * Creates a cached version of a database query function.
 * Uses React.cache for per-request memoization to prevent duplicate queries.
 *
 * @param {Function} queryFn - The database query function to cache
 * @returns {Function} The cached version of the function
 */
export function createQueryCache(queryFn) {
  return cache(queryFn);
}

/**
 * Cache wrapper for product queries.
 * Prevents duplicate product fetches within the same request.
 */
export const cachedProductQueries = {
  /**
   * Cached version of getProductsByShopId
   * @param {string} shopId
   * @param {object} options
   * @returns {Promise}
   */
  getProductsByShopId: cache(async (shopId, options) => {
    // Import here to avoid circular dependency
    const { getProductsByShopId } = await import("@/lib/data/products");
    return getProductsByShopId(shopId, options);
  }),

  /**
   * Cached version of isProductNameTaken
   * @param {string} shopId
   * @param {string} name
   * @param {string} excludeProductId
   * @returns {Promise<boolean>}
   */
  isProductNameTaken: cache(async (shopId, name, excludeProductId) => {
    const { isProductNameTaken } = await import("@/lib/data/products");
    return isProductNameTaken(shopId, name, excludeProductId);
  }),
};
