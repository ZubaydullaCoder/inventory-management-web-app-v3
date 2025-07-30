// src/lib/data/products.js

import prisma from "@/lib/prisma";
import { normalizeProductName } from "@/lib/utils";
import { fuzzySearchProducts, simpleSearchProducts } from "./products-search";

/**
 * Unified search orchestrator that decides which search strategy to use
 * and returns product IDs for further processing.
 * @param {string} shopId - Shop ID to filter by
 * @param {string} nameFilter - Search query
 * @param {boolean} enableFuzzySearch - Whether fuzzy search is enabled
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} Array of matching products
 */
async function orchestrateProductSearch(
  shopId,
  nameFilter,
  enableFuzzySearch = true,
  maxResults = 50
) {
  const trimmedNameFilter = nameFilter ? nameFilter.trim() : "";

  if (!trimmedNameFilter) {
    return [];
  }

  // Use fuzzy search for meaningful queries when enabled
  if (enableFuzzySearch && trimmedNameFilter.length >= 2) {
    return await fuzzySearchProducts(trimmedNameFilter, shopId, maxResults);
  }

  // Fallback to simple search for short queries or when fuzzy search is disabled
  return await simpleSearchProducts(trimmedNameFilter, shopId, maxResults);
}

/**
 * Creates a regex pattern for character subsequence matching.
 * For "p1" → creates pattern to match "product-1" by checking if 'p' and '1' appear in order.
 * @param {string} query - The search query
 * @returns {string} Regex pattern for subsequence matching
 */
function createSubsequencePattern(query) {
  // Escape special regex characters and create subsequence pattern
  const chars = query
    .toLowerCase()
    .split("")
    .map((char) => {
      // Escape regex special characters
      return char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });

  // Create pattern that matches characters in sequence with any characters in between
  // For "p1" → "p.*1" which matches "product-1"
  return chars.join(".*");
}

/**
 * @typedef {import('@/lib/zod-schemas').productCreateSchema} ProductCreateInput
 */

/**
 * Checks if a product name already exists for a specific shop.
 * @param {string} shopId - The ID of the shop to check within.
 * @param {string} name - The product name to check.
 * @param {string} [excludeProductId] - Product ID to exclude from the check (for updates).
 * @returns {Promise<boolean>} True if the name is already taken, false otherwise.
 */
export async function isProductNameTaken(
  shopId,
  name,
  excludeProductId = null
) {
  const normalizedName = normalizeProductName(name);

  if (!normalizedName) {
    return false;
  }

  const whereClause = {
    shopId,
    name: normalizedName,
  };

  // Exclude the current product when checking for updates
  if (excludeProductId) {
    whereClause.NOT = {
      id: excludeProductId,
    };
  }

  const existingProduct = await prisma.product.findFirst({
    where: whereClause,
    select: {
      id: true,
    },
  });

  return !!existingProduct;
}

/**
 * Creates a new product for a specific shop.
 * @param {z.infer<ProductCreateInput>} productData - The validated product data.
 * @param {string} shopId - The ID of the shop this product belongs to.
 * @returns {Promise<import('@prisma/client').Product>} The newly created product.
 * @throws {Error} If the provided categoryId does not belong to the shop
 */
export async function createProduct(productData, shopId) {
  // Security Check: Validate that the category belongs to the shop if categoryId is provided
  if (productData.categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: productData.categoryId,
        shopId: shopId,
      },
      select: { id: true }, // Only need to check for existence
    });

    if (!category) {
      throw new Error(
        "Invalid category specified. The category must belong to your shop."
      );
    }
  }

  // Normalize the product name before creating
  const normalizedProductData = {
    ...productData,
    name: normalizeProductName(productData.name),
  };

  const product = await prisma.product.create({
    data: {
      ...normalizedProductData,
      shopId: shopId,
    },
  });
  return product;
}

/**
 * Updates an existing product for a specific shop.
 * @param {string} productId - The ID of the product to update.
 * @param {z.infer<ProductCreateInput>} productData - The validated product data.
 * @param {string} shopId - The ID of the shop this product belongs to.
 * @returns {Promise<import('@prisma/client').Product>} The updated product.
 */
export async function updateProduct(productId, productData, shopId) {
  // Build update data selectively, only normalizing name when it's provided
  const updateData = { ...productData };

  if (Object.prototype.hasOwnProperty.call(productData, "name")) {
    // If name is explicitly provided in the update payload, normalize it
    updateData.name = normalizeProductName(productData.name);
  }

  // Remove keys with value === undefined to avoid accidentally overwriting
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  const product = await prisma.product.update({
    where: {
      id: productId,
      shopId, // Ensure the product belongs to the shop
    },
    data: updateData,
  });

  return product;
}

/**
 * @typedef {object} PaginatedProductsResult
 * @property {Array<object>} products - The array of fetched products.
 * @property {number} totalProducts - The total number of products available for the shop.
 * @property {number} totalPages - The total number of pages.
 * @property {number} currentPage - The current page number.
 */

/**
 * @typedef {object} CursorPaginatedProductsResult
 * @property {Array<object>} products - The array of fetched products.
 * @property {string|null} nextCursor - Cursor for the next page, null if no more pages.
 * @property {string|null} prevCursor - Cursor for the previous page, null if first page.
 * @property {boolean} hasNextPage - Whether there are more pages after this one.
 * @property {boolean} hasPrevPage - Whether there are pages before this one.
 * @property {number} totalProducts - The total number of products in the shop (unfiltered).
 * @property {number} filteredCount - The total number of products matching current filters.
 */

/**
 * Fetches a paginated list of products for a specific shop.
 * Includes category and supplier names for display purposes.
 * Uses optimized database-level filtering with fuzzy search capabilities.
 * @param {string} shopId - The ID of the shop whose products to fetch.
 * @param {{page?: number, limit?: number, sortBy?: string, sortOrder?: string, nameFilter?: string, categoryFilter?: string, enableFuzzySearch?: boolean}} options - Pagination, sorting, and filtering options.
 * @returns {Promise<PaginatedProductsResult>} An object containing the products and pagination metadata.
 */
export async function getProductsByShopId(
  shopId,
  {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    nameFilter = "",
    categoryFilter = "",
    enableFuzzySearch = true,
  }
) {
  try {
    const skip = (page - 1) * limit;
    const trimmedNameFilter = nameFilter ? nameFilter.trim() : "";

    // Use PostgreSQL native fuzzy search for name filtering when enabled
    if (enableFuzzySearch && trimmedNameFilter) {
      // Use database-level fuzzy search with comprehensive typo tolerance
      const fuzzyResults = await fuzzySearchProducts(
        trimmedNameFilter,
        shopId,
        limit * 3 // Get more results to account for additional filtering
      );

      // Apply category filter if specified
      let filteredResults = fuzzyResults;
      if (categoryFilter && categoryFilter.trim()) {
        filteredResults = fuzzyResults.filter(
          (product) => product.categoryId === categoryFilter.trim()
        );
      }

      // Apply sorting (fuzzy search already sorts by relevance, then similarity, then createdAt)
      if (sortBy !== "createdAt" && sortBy !== "similarity") {
        filteredResults.sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];

          // Handle nested category sorting
          if (sortBy === "category") {
            aValue = a.category?.name || "";
            bValue = b.category?.name || "";
          }

          if (sortOrder === "desc") {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      // Apply pagination
      const paginatedResults = filteredResults.slice(skip, skip + limit);
      const totalProducts = filteredResults.length;
      const totalPages = Math.ceil(totalProducts / limit);

      return {
        products: paginatedResults,
        totalProducts,
        totalPages,
        currentPage: page,
      };
    }

    // Fallback to standard filtering for short queries or when fuzzy search is disabled
    const whereClause = {
      shopId,
    };

    // Add standard name filtering for short queries
    if (trimmedNameFilter) {
      whereClause.name = {
        contains: trimmedNameFilter,
        mode: "insensitive",
      };
    }

    // Add category filtering
    if (categoryFilter && categoryFilter.trim()) {
      whereClause.categoryId = categoryFilter.trim();
    }

    // Build ORDER BY clause
    const orderBy = {};

    // Handle nested sorting for category names
    if (sortBy === "category") {
      orderBy.category = {
        name: sortOrder,
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Optimized field selection - only fetch what we need for display
    const selectFields = {
      id: true,
      name: true,
      sellingPrice: true,
      purchasePrice: true,
      stock: true,
      unit: true,
      reorderPoint: true,
      categoryId: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
    };

    // Execute queries in parallel for better performance
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        select: selectFields,
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return {
      products,
      totalProducts,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Fetches products using cursor-based (keyset) pagination for better performance.
 * This approach scales better than offset-based pagination for large datasets.
 * @param {string} shopId - The ID of the shop whose products to fetch.
 * @param {{
 *   cursor?: string,
 *   direction?: 'forward'|'backward',
 *   limit?: number,
 *   sortBy?: string,
 *   sortOrder?: string,
 *   nameFilter?: string,
 *   categoryFilter?: string,
 *   enableFuzzySearch?: boolean
 * }} options - Cursor pagination and filtering options.
 * @returns {Promise<CursorPaginatedProductsResult>} Products with cursor pagination metadata.
 */
export async function getProductsByShopIdCursor(
  shopId,
  {
    cursor = null,
    direction = "forward",
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    nameFilter = "",
    categoryFilter = "",
    enableFuzzySearch = true,
  }
) {
  try {
    const trimmedNameFilter = nameFilter ? nameFilter.trim() : "";

    // Use PostgreSQL native fuzzy search for name filtering when enabled and query is meaningful
    if (
      enableFuzzySearch &&
      trimmedNameFilter &&
      trimmedNameFilter.length >= 2
    ) {
      return await getCursorPaginatedFuzzySearchResults(
        shopId,
        trimmedNameFilter,
        {
          cursor,
          direction,
          limit,
          sortBy,
          sortOrder,
          categoryFilter,
        }
      );
    }

    // Build where clause for standard filtering
    const whereClause = {
      shopId,
      ...(trimmedNameFilter && {
        name: {
          contains: trimmedNameFilter,
          mode: "insensitive",
        },
      }),
      ...(categoryFilter &&
        categoryFilter.trim() && {
          categoryId: categoryFilter.trim(),
        }),
    };

    // Build cursor condition for pagination
    const cursorCondition = buildCursorCondition(
      cursor,
      sortBy,
      sortOrder,
      direction
    );
    if (cursorCondition) {
      Object.assign(whereClause, cursorCondition);
    }

    // Build ORDER BY clause
    const orderBy = buildOrderByClause(sortBy, sortOrder);

    // Optimized field selection
    const selectFields = {
      id: true,
      name: true,
      sellingPrice: true,
      purchasePrice: true,
      stock: true,
      unit: true,
      reorderPoint: true,
      categoryId: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      supplier: {
        select: {
          id: true,
          name: true,
        },
      },
    };

    // Fetch one extra item to determine if there are more pages
    const take = limit + 1;
    const actualDirection =
      direction === "backward" ? reverseOrder(orderBy) : orderBy;

    const [products, filteredCount, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: actualDirection,
        take,
        select: selectFields,
      }),
      // Get filtered count (same as current query filters)
      prisma.product.count({
        where: {
          shopId,
          ...(trimmedNameFilter && {
            name: {
              contains: trimmedNameFilter,
              mode: "insensitive",
            },
          }),
          ...(categoryFilter &&
            categoryFilter.trim() && {
              categoryId: categoryFilter.trim(),
            }),
        },
      }),
      // Only get total unfiltered count on the first page load for efficiency
      cursor
        ? Promise.resolve(null) // Return null if not the first page
        : prisma.product.count({
            where: { shopId },
          }),
    ]);

    // Handle backward pagination (reverse the results)
    const orderedProducts =
      direction === "backward" ? products.reverse() : products;

    // Check if there are more pages
    // For cursor pagination, we need to properly determine if there are more pages
    // We fetched limit + 1 items, so if we got more than limit, there are more pages
    const hasMoreItemsInCurrentDirection = orderedProducts.length > limit;

    const hasNextPage =
      direction === "forward"
        ? hasMoreItemsInCurrentDirection
        : Boolean(cursor); // If we came from somewhere, we can go forward

    const hasPrevPage =
      direction === "backward"
        ? hasMoreItemsInCurrentDirection
        : Boolean(cursor); // If we came from somewhere, we can go backward

    // Remove the extra item if present, handling both directions correctly
    const finalProducts = hasMoreItemsInCurrentDirection
      ? direction === "backward"
        ? orderedProducts.slice(1) // For backward pagination, remove first item (the extra one)
        : orderedProducts.slice(0, limit) // For forward pagination, remove last item
      : orderedProducts; // No extra item, use all

    // Generate cursors for next/previous pages
    const nextCursor =
      hasNextPage && finalProducts.length > 0
        ? generateCursor(finalProducts[finalProducts.length - 1], sortBy)
        : null;

    const prevCursor =
      hasPrevPage && finalProducts.length > 0
        ? generateCursor(finalProducts[0], sortBy)
        : null;

    return {
      products: finalProducts,
      nextCursor,
      prevCursor,
      hasNextPage,
      hasPrevPage,
      totalProducts: totalProducts || 0,
      filteredCount: filteredCount || 0,
    };
  } catch (error) {
    console.error("Error fetching products with cursor pagination:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Helper function to build cursor condition for WHERE clause
 * @param {string|null} cursor - The cursor value
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order
 * @param {string} direction - Pagination direction
 * @returns {object|null} Cursor condition for WHERE clause
 */
function buildCursorCondition(cursor, sortBy, sortOrder, direction) {
  if (!cursor) return null;

  try {
    const cursorData = JSON.parse(Buffer.from(cursor, "base64").toString());
    const { value, id } = cursorData;

    const isForward = direction === "forward";
    const isDesc = sortOrder === "desc";

    // Determine comparison operator based on direction and sort order
    let operator;
    if (isForward) {
      operator = isDesc ? "lt" : "gt";
    } else {
      operator = isDesc ? "gt" : "lt";
    }

    if (sortBy === "createdAt") {
      return {
        OR: [
          { createdAt: { [operator]: value } },
          {
            createdAt: value,
            id: { [operator]: id },
          },
        ],
      };
    } else if (sortBy === "name") {
      return {
        OR: [
          { name: { [operator]: value } },
          {
            name: value,
            id: { [operator]: id },
          },
        ],
      };
    } else {
      // For other fields, use similar pattern
      return {
        OR: [
          { [sortBy]: { [operator]: value } },
          {
            [sortBy]: value,
            id: { [operator]: id },
          },
        ],
      };
    }
  } catch (error) {
    console.error("Invalid cursor format:", error);
    return null;
  }
}

/**
 * Helper function to build ORDER BY clause
 * @param {string} sortBy - Sort field
 * @param {string} sortOrder - Sort order
 * @returns {object} ORDER BY clause
 */
function buildOrderByClause(sortBy, sortOrder) {
  if (sortBy === "category") {
    return [
      { category: { name: sortOrder } },
      { id: sortOrder }, // Secondary sort for consistency
    ];
  } else {
    return [
      { [sortBy]: sortOrder },
      { id: sortOrder }, // Secondary sort for consistency
    ];
  }
}

/**
 * Helper function to reverse order for backward pagination
 * @param {object} orderBy - Original order by clause
 * @returns {object} Reversed order by clause
 */
function reverseOrder(orderBy) {
  return orderBy.map((order) => {
    const field = Object.keys(order)[0];
    const direction = Object.values(order)[0];

    if (typeof direction === "object") {
      // Handle nested ordering (like category.name)
      const nestedField = Object.keys(direction)[0];
      const nestedDirection = direction[nestedField];
      return {
        [field]: {
          [nestedField]: nestedDirection === "asc" ? "desc" : "asc",
        },
      };
    } else {
      // Handle simple ordering
      return { [field]: direction === "asc" ? "desc" : "asc" };
    }
  });
}

/**
 * Helper function to generate cursor from a product record
 * @param {object} product - Product record
 * @param {string} sortBy - Sort field
 * @returns {string} Base64 encoded cursor
 */
function generateCursor(product, sortBy) {
  const cursorData = {
    id: product.id,
    value:
      sortBy === "category" ? product.category?.name || "" : product[sortBy],
  };

  return Buffer.from(JSON.stringify(cursorData)).toString("base64");
}

/**
 * Handle cursor-based pagination for fuzzy search results
 * @param {string} shopId - Shop ID
 * @param {string} query - Search query
 * @param {object} options - Pagination options
 * @returns {Promise<CursorPaginatedProductsResult>} Paginated fuzzy search results
 */
async function getCursorPaginatedFuzzySearchResults(shopId, query, options) {
  const { cursor, direction, limit, sortBy, sortOrder, categoryFilter } =
    options;

  // For fuzzy search, we need to get all results first, then apply cursor pagination
  // This is a limitation of complex fuzzy search queries
  // Get significantly more results to ensure we capture the full dataset for accurate total count
  const [fuzzyResults, totalProducts] = await Promise.all([
    fuzzySearchProducts(query, shopId, Math.max(limit * 10, 100)), // Get more results for accurate total count
    // Get total unfiltered count for the shop
    prisma.product.count({ where: { shopId } }),
  ]);

  // Apply category filter if specified
  let filteredResults = fuzzyResults;
  if (categoryFilter && categoryFilter.trim()) {
    filteredResults = fuzzyResults.filter(
      (product) => product.category?.id === categoryFilter.trim()
    );
  }

  // Apply sorting if not relevance-based
  if (sortBy !== "createdAt" && sortBy !== "similarity") {
    filteredResults.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "category") {
        aValue = a.category?.name || "";
        bValue = b.category?.name || "";
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });
  }

  // Apply cursor-based pagination to in-memory results
  let startIndex = 0;
  if (cursor) {
    try {
      const cursorData = JSON.parse(Buffer.from(cursor, "base64").toString());
      const cursorId = cursorData.id;

      const cursorIndex = filteredResults.findIndex((p) => p.id === cursorId);
      if (cursorIndex !== -1) {
        startIndex =
          direction === "forward"
            ? cursorIndex + 1
            : Math.max(0, cursorIndex - limit);
      }
    } catch (error) {
      console.error("Invalid cursor for fuzzy search:", error);
    }
  }

  const endIndex = startIndex + limit;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // Calculate pagination metadata
  const hasNextPage = endIndex < filteredResults.length;
  const hasPrevPage = startIndex > 0;

  const nextCursor =
    hasNextPage && paginatedResults.length > 0
      ? generateCursor(paginatedResults[paginatedResults.length - 1], sortBy)
      : null;

  const prevCursor =
    hasPrevPage && paginatedResults.length > 0
      ? generateCursor(paginatedResults[0], sortBy)
      : null;

  return {
    products: paginatedResults,
    nextCursor,
    prevCursor,
    hasNextPage,
    hasPrevPage,
    totalProducts: totalProducts || 0, // Total unfiltered count
    filteredCount: filteredResults.length, // Total filtered count
  };
}
