// src/lib/data/categories.js

import prisma from "@/lib/prisma";
import { normalizeCategoryName } from "@/lib/utils";

/**
 * @typedef {import('@/lib/zod-schemas').categoryCreateSchema} CategoryCreateInput
 */

/**
 * Checks if a category name already exists for a specific shop.
 * @param {string} shopId - The ID of the shop to check within.
 * @param {string} name - The category name to check.
 * @param {string} [excludeCategoryId] - Category ID to exclude from the check (for updates).
 * @returns {Promise<boolean>} True if the name is already taken, false otherwise.
 */
export async function isCategoryNameTaken(
  shopId,
  name,
  excludeCategoryId = null
) {
  const normalizedName = normalizeCategoryName(name);

  if (!normalizedName) {
    return false;
  }

  const whereClause = {
    shopId,
    name: normalizedName,
  };

  // Exclude the current category when checking for updates
  if (excludeCategoryId) {
    whereClause.id = { not: excludeCategoryId };
  }

  const existingCategory = await prisma.category.findFirst({
    where: whereClause,
    select: {
      id: true,
    },
  });

  return !!existingCategory;
}

/**
 * Creates a new category for a specific shop.
 * @param {z.infer<CategoryCreateInput>} categoryData - The validated category data.
 * @param {string} shopId - The ID of the shop this category belongs to.
 * @returns {Promise<import('@prisma/client').Category>} The newly created category.
 */
export async function createCategory(categoryData, shopId) {
  // Normalize the category name before creating
  const normalizedCategoryData = {
    ...categoryData,
    name: normalizeCategoryName(categoryData.name),
  };

  const category = await prisma.category.create({
    data: {
      ...normalizedCategoryData,
      shopId: shopId,
    },
  });
  return category;
}

/**
 * Updates an existing category for a specific shop.
 * @param {string} categoryId - The ID of the category to update.
 * @param {z.infer<CategoryCreateInput>} categoryData - The validated category data.
 * @param {string} shopId - The ID of the shop this category belongs to.
 * @returns {Promise<import('@prisma/client').Category>} The updated category.
 */
export async function updateCategory(categoryId, categoryData, shopId) {
  // Normalize the category name before updating
  const normalizedCategoryData = {
    ...categoryData,
    name: normalizeCategoryName(categoryData.name),
  };

  const category = await prisma.category.update({
    where: {
      id: categoryId,
      shopId: shopId, // Ensure the category belongs to the shop
    },
    data: normalizedCategoryData,
  });
  return category;
}

/**
 * @typedef {object} PaginatedCategoriesResult
 * @property {Array<object>} categories - The array of fetched categories.
 * @property {number} totalCategories - The total number of categories available for the shop.
 * @property {number} totalPages - The total number of pages.
 * @property {number} currentPage - The current page number.
 */

/**
 * Fetches a paginated list of categories for a specific shop.
 * @param {string} shopId - The ID of the shop whose categories to fetch.
 * @param {{page?: number, limit?: number}} options - Pagination options.
 * @returns {Promise<PaginatedCategoriesResult>} An object containing the categories and pagination metadata.
 */
export async function getCategoriesByShopId(shopId, { page = 1, limit = 100 }) {
  const skip = (page - 1) * limit;

  const [categories, totalCategories] = await prisma.$transaction([
    prisma.category.findMany({
      where: { shopId },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.category.count({
      where: { shopId },
    }),
  ]);

  const totalPages = Math.ceil(totalCategories / limit);

  return {
    categories,
    totalCategories,
    totalPages,
    currentPage: page,
  };
}

/**
 * Fetches all categories for a specific shop (for dropdowns/selects).
 * @param {string} shopId - The ID of the shop whose categories to fetch.
 * @returns {Promise<Array<import('@prisma/client').Category>>} The array of all categories.
 */
export async function getAllCategoriesByShopId(shopId) {
  const categories = await prisma.category.findMany({
    where: { shopId },
    orderBy: { name: "asc" },
  });

  return categories;
}

/**
 * @typedef {object} CursorPaginatedCategoriesResult
 * @property {Array<object>} categories - The array of fetched categories.
 * @property {string|null} nextCursor - Cursor for the next page, null if no more pages.
 * @property {string|null} prevCursor - Cursor for the previous page, null if first page.
 * @property {boolean} hasNextPage - Whether there are more pages after this one.
 * @property {boolean} hasPrevPage - Whether there are pages before this one.
 * @property {number} totalCategories - The total number of categories (for pagination UI).
 */

/**
 * Fetches categories using cursor-based (keyset) pagination for better performance.
 * This approach scales better than offset-based pagination for large datasets.
 * @param {string} shopId - The ID of the shop whose categories to fetch.
 * @param {{
 *   cursor?: string,
 *   direction?: 'forward'|'backward',
 *   limit?: number,
 *   search?: string
 * }} options - Cursor pagination and filtering options.
 * @returns {Promise<CursorPaginatedCategoriesResult>} Categories with cursor pagination metadata.
 */
export async function getCategoriesByShopIdCursor(
  shopId,
  {
    cursor = null,
    direction = "forward",
    limit = 10,
    search = "",
  }
) {
  try {
    const trimmedSearch = search ? search.trim() : "";

    // Build where clause for filtering
    const whereClause = {
      shopId,
      ...(trimmedSearch && {
        name: {
          contains: trimmedSearch,
          mode: "insensitive",
        },
      }),
    };

    // Build cursor condition for pagination
    const cursorCondition = buildCategoryCursorCondition(
      cursor,
      direction
    );
    if (cursorCondition) {
      Object.assign(whereClause, cursorCondition);
    }

    // Build ORDER BY clause (categories are sorted by name)
    const orderBy = buildCategoryOrderByClause(direction);

    // Fetch one extra item to determine if there are more pages
    const take = limit + 1;

    const [categories, totalCategories] = await Promise.all([
      prisma.category.findMany({
        where: whereClause,
        orderBy,
        take,
      }),
      // Only count when necessary (expensive operation)
      cursor === null
        ? prisma.category.count({ where: { shopId } })
        : Promise.resolve(0),
    ]);

    // Handle backward pagination (reverse the results)
    const orderedCategories =
      direction === "backward" ? categories.reverse() : categories;

    // Check if there are more pages
    const hasMoreItemsInCurrentDirection = orderedCategories.length > limit;

    const hasNextPage =
      direction === "forward"
        ? hasMoreItemsInCurrentDirection
        : Boolean(cursor); // If we came from somewhere, we can go forward

    const hasPrevPage =
      direction === "backward"
        ? hasMoreItemsInCurrentDirection
        : Boolean(cursor); // If we came from somewhere, we can go backward

    // Remove the extra item if present
    const finalCategories = orderedCategories.slice(0, limit);

    // Generate cursors for next/previous pages
    const nextCursor =
      hasNextPage && finalCategories.length > 0
        ? generateCategoryCursor(finalCategories[finalCategories.length - 1])
        : null;

    const prevCursor =
      hasPrevPage && finalCategories.length > 0
        ? generateCategoryCursor(finalCategories[0])
        : null;

    return {
      categories: finalCategories,
      nextCursor,
      prevCursor,
      hasNextPage,
      hasPrevPage,
      totalCategories: totalCategories || 0,
    };
  } catch (error) {
    console.error("Error fetching categories with cursor pagination:", error);
    throw new Error("Failed to fetch categories");
  }
}

/**
 * Helper function to build cursor condition for WHERE clause
 * @param {string|null} cursor - The cursor value
 * @param {string} direction - Pagination direction
 * @returns {object|null} Cursor condition for WHERE clause
 */
function buildCategoryCursorCondition(cursor, direction) {
  if (!cursor) return null;

  try {
    const cursorData = JSON.parse(Buffer.from(cursor, "base64").toString());
    const { name, id } = cursorData;

    const isForward = direction === "forward";
    const operator = isForward ? "gt" : "lt";

    // For category pagination, we sort by name (asc) then by id for consistency
    return {
      OR: [
        { name: { [operator]: name } },
        {
          name: name,
          id: { [operator]: id },
        },
      ],
    };
  } catch (error) {
    console.error("Invalid cursor format:", error);
    return null;
  }
}

/**
 * Helper function to build ORDER BY clause for categories
 * @param {string} direction - Pagination direction
 * @returns {object} ORDER BY clause
 */
function buildCategoryOrderByClause(direction) {
  const baseOrder = [
    { name: "asc" },
    { id: "asc" }, // Secondary sort for consistency
  ];

  // For backward pagination, we reverse the order
  if (direction === "backward") {
    return [
      { name: "desc" },
      { id: "desc" },
    ];
  }

  return baseOrder;
}

/**
 * Helper function to generate cursor from a category record
 * @param {object} category - Category record
 * @returns {string} Base64 encoded cursor
 */
function generateCategoryCursor(category) {
  const cursorData = {
    id: category.id,
    name: category.name,
  };

  return Buffer.from(JSON.stringify(cursorData)).toString("base64");
}

/**
 * Checks if a category is being used by any products.
 * @param {string} categoryId - The ID of the category to check.
 * @param {string} shopId - The ID of the shop to check within.
 * @returns {Promise<{isUsed: boolean, productCount: number}>} Usage information.
 */
export async function checkCategoryUsage(categoryId, shopId) {
  const productCount = await prisma.product.count({
    where: {
      categoryId: categoryId,
      shopId: shopId,
    },
  });

  return {
    isUsed: productCount > 0,
    productCount,
  };
}

/**
 * Deletes a category by ID for a specific shop.
 * Includes safety check to prevent deletion of categories with assigned products.
 * @param {string} categoryId - The ID of the category to delete.
 * @param {string} shopId - The ID of the shop this category belongs to.
 * @param {boolean} [force=false] - Whether to force deletion even if products are assigned.
 * @returns {Promise<import('@prisma/client').Category>} The deleted category.
 * @throws {Error} If category is in use and force is false.
 */
export async function deleteCategory(categoryId, shopId, force = false) {
  // Check if category is being used by products
  if (!force) {
    const usage = await checkCategoryUsage(categoryId, shopId);
    if (usage.isUsed) {
      throw new Error(
        `Cannot delete category. ${usage.productCount} product${
          usage.productCount > 1 ? "s are" : " is"
        } assigned to this category.`
      );
    }
  }

  const category = await prisma.category.delete({
    where: {
      id: categoryId,
      shopId: shopId, // Ensure the category belongs to the shop
    },
  });
  return category;
}
