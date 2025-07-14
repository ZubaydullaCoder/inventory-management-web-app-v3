/**
 * @typedef {import('@/lib/zod-schemas').productCreateSchema} ProductCreateInput
 */

/**
 * Fetches a paginated list of products from the API.
 * @param {{page?: number, limit?: number, sortBy?: string, sortOrder?: string, nameFilter?: string, categoryFilter?: string}} options - Pagination, sorting, and filtering options.
 * @returns {Promise<import('@/lib/data/products').PaginatedProductsResult>}
 */
export async function getProductsApi({
  page = 1,
  limit = 10,
  sortBy,
  sortOrder,
  nameFilter,
  categoryFilter,
}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);
  if (nameFilter) params.append("nameFilter", nameFilter);
  if (categoryFilter) params.append("categoryFilter", categoryFilter);

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

/**
 * Updates an existing product by sending a PUT request to the API.
 * @param {string} productId - The ID of the product to update.
 * @param {z.infer<ProductCreateInput>} updatedProductData - The updated product data.
 * @returns {Promise<import('@prisma/client').Product>} The updated product from the server.
 */
export async function updateProductApi(productId, updatedProductData) {
  const response = await fetch(`/api/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedProductData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update product");
  }
  return response.json();
}

/**
 * Checks if a product name already exists for the authenticated user's shop.
 * @param {string} name - The product name to check.
 * @param {string} [excludeId] - Product ID to exclude from the check (for updates).
 * @returns {Promise<{exists: boolean}>}
 */
export async function checkProductNameApi(name, excludeId) {
  const params = new URLSearchParams({ name });
  if (excludeId) params.append("excludeId", excludeId);

  const response = await fetch(`/api/products/check-name?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to check product name");
  }
  return response.json();
}
