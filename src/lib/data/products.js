// src/lib/data/products.js

import prisma from "@/lib/prisma";
import { normalizeProductName } from "@/lib/utils";
import { fuzzySearchProducts, simpleSearchProducts } from "./products-search";

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
 */
export async function createProduct(productData, shopId) {
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
  // Normalize the product name before updating
  const normalizedProductData = {
    ...productData,
    name: normalizeProductName(productData.name),
  };

  const product = await prisma.product.update({
    where: {
      id: productId,
      shopId: shopId, // Ensure the product belongs to the shop
    },
    data: normalizedProductData,
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
