// src/lib/data/products.js

import prisma from "@/lib/prisma";
import { normalizeProductName } from "@/lib/utils";

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
 * @param {string} shopId - The ID of the shop whose products to fetch.
 * @param {{page?: number, limit?: number}} options - Pagination options.
 * @returns {Promise<PaginatedProductsResult>} An object containing the products and pagination metadata.
 */
export async function getProductsByShopId(shopId, { page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [products, totalProducts] = await prisma.$transaction([
    prisma.product.findMany({
      where: { shopId },
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      // Select only the necessary fields for the list view to optimize performance.
      select: {
        id: true,
        name: true,
        sellingPrice: true,
        purchasePrice: true,
        stock: true,
        unit: true,
        reorderPoint: true,
        categoryId: true,
        supplierId: true,
        isActive: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
        supplier: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.product.count({
      where: { shopId },
    }),
  ]);

  return {
    products,
    totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,
  };
}
