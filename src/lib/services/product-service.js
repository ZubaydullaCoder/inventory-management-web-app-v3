// src/lib/services/product-service.js

/**
 * @typedef {import('@/lib/zod-schemas').productCreateSchema} ProductCreateInput
 */

/**
 * Fetches a paginated list of products from the API.
 * @param {{page?: number, limit?: number}} filters - Pagination filters.
 * @returns {Promise<import('@/lib/data/products').PaginatedProductsResult>}
 */
export async function getProductsApi({ page = 1, limit = 10 }) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`/api/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

/**
 * Creates a new product by sending a POST request to the API.
 * @param {z.infer<ProductCreateInput>} newProductData - The data for the new product.
 * @returns {Promise<import('@prisma/client').Product>} The newly created product from the server.
 */
export async function createProductApi(newProductData) {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newProductData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create product");
  }
  return response.json();
}
