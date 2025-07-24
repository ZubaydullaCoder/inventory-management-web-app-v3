// src/lib/api/categories.js

/**
 * @typedef {import('@/lib/zod-schemas').categoryCreateSchema} CategoryCreateInput
 */

/**
 * Fetches all categories from the API.
 * @returns {Promise<Array<import('@prisma/client').Category>>}
 */
export async function getCategoriesApi() {
  const response = await fetch("/api/categories");

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

/**
 * Creates a new category by sending a POST request to the API.
 * @param {z.infer<CategoryCreateInput>} newCategoryData - The data for the new category.
 * @returns {Promise<import('@prisma/client').Category>} The newly created category from the server.
 */
export async function createCategoryApi(newCategoryData) {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newCategoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create category");
  }
  return response.json();
}

/**
 * Updates an existing category by sending a PUT request to the API.
 * @param {string} categoryId - The ID of the category to update.
 * @param {z.infer<CategoryCreateInput>} updatedCategoryData - The updated category data.
 * @returns {Promise<import('@prisma/client').Category>} The updated category from the server.
 */
export async function updateCategoryApi(categoryId, updatedCategoryData) {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedCategoryData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update category");
  }
  return response.json();
}

/**
 * Checks if a category name already exists for the authenticated user's shop.
 * @param {string} name - The category name to check.
 * @param {string} [excludeId] - Category ID to exclude from the check (for updates).
 * @returns {Promise<{exists: boolean}>}
 */
export async function checkCategoryNameApi(name, excludeId) {
  const params = new URLSearchParams({ name });
  if (excludeId) params.append("excludeId", excludeId);

  const response = await fetch(
    `/api/categories/check-name?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error("Failed to check category name");
  }
  return response.json();
}

/**
 * Fetches categories with cursor-based pagination and search filtering.
 * @param {{
 *   cursor?: string,
 *   direction?: 'forward'|'backward',
 *   limit?: number,
 *   search?: string
 * }} options - Pagination and filtering options.
 * @returns {Promise<{
 *   categories: Array<import('@prisma/client').Category>,
 *   nextCursor: string|null,
 *   prevCursor: string|null,
 *   hasNextPage: boolean,
 *   hasPrevPage: boolean,
 *   totalCategories: number
 * }>}
 */
export async function getCategoriesPaginatedApi({
  cursor = null,
  direction = "forward",
  limit = 10,
  search = "",
} = {}) {
  const params = new URLSearchParams();
  
  if (cursor) params.append("cursor", cursor);
  params.append("direction", direction);
  params.append("limit", limit.toString());
  if (search) params.append("search", search);

  const response = await fetch(`/api/categories/cursor?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch paginated categories");
  }
  return response.json();
}

/**
 * Gets category usage information (how many products are assigned to it).
 * @param {string} categoryId - The ID of the category to check.
 * @returns {Promise<{isUsed: boolean, productCount: number}>}
 */
export async function getCategoryUsageApi(categoryId) {
  const response = await fetch(`/api/categories/${categoryId}/usage`);

  if (!response.ok) {
    throw new Error("Failed to fetch category usage");
  }
  return response.json();
}

/**
 * Deletes a category by sending a DELETE request to the API.
 * @param {string} categoryId - The ID of the category to delete.
 * @returns {Promise<void>}
 */
export async function deleteCategoryApi(categoryId) {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete category");
  }
}
