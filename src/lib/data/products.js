// src/lib/data/products.js

import prisma from "@/lib/prisma";

/**
 * @typedef {import('@/lib/zod-schemas').productCreateSchema} ProductCreateInput
 */

/**
 * Checks if a product name already exists for a specific shop.
 * @param {string} shopId - The ID of the shop to check within.
 * @param {string} name - The product name to check.
 * @returns {Promise<boolean>} True if the name is already taken, false otherwise.
 */
export async function isProductNameTaken(shopId, name) {
  if (!name || name.trim() === "") {
    return false;
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      shopId_name: {
        shopId,
        name: name.trim(),
      },
    },
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
  const product = await prisma.product.create({
    data: {
      ...productData,
      shopId: shopId,
    },
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
        stock: true,
        isActive: true,
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
