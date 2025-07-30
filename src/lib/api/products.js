/**
 * @typedef {import('@/lib/zod-schemas').productCreateSchema} ProductCreateInput
 */


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

/**
 * Deletes a product by sending a DELETE request to the API.
 * @param {string} productId - The ID of the product to delete.
 * @returns {Promise<import('@prisma/client').Product>} The deleted product from the server.
 */
export async function deleteProductApi(productId) {
  const response = await fetch(`/api/products/${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete product");
  }
  return response.json();
}

/**
 * Fetches products using cursor-based pagination from the API.
 * @param {{cursor?: string, direction?: 'forward'|'backward', limit?: number, sortBy?: string, sortOrder?: string, nameFilter?: string, categoryFilter?: string, enableFuzzySearch?: boolean}} options - Cursor pagination, sorting, and filtering options.
 * @returns {Promise<import('@/lib/data/products').CursorPaginatedProductsResult>}
 */
export async function getProductsCursorApi({
  cursor = null,
  direction = "forward",
  limit = 10,
  sortBy,
  sortOrder,
  nameFilter,
  categoryFilter,
  enableFuzzySearch = true,
}) {
  const params = new URLSearchParams({
    pagination: "cursor",
    limit: limit.toString(),
    direction,
  });

  if (cursor) params.append("cursor", cursor);
  if (sortBy) params.append("sortBy", sortBy);
  if (sortOrder) params.append("sortOrder", sortOrder);
  if (nameFilter) params.append("nameFilter", nameFilter);
  if (categoryFilter) params.append("categoryFilter", categoryFilter);
  if (enableFuzzySearch !== undefined)
    params.append("enableFuzzySearch", enableFuzzySearch.toString());

  const response = await fetch(`/api/products?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products with cursor pagination");
  }
  return response.json();
}
