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
 * Deletes a category by ID for a specific shop.
 * @param {string} categoryId - The ID of the category to delete.
 * @param {string} shopId - The ID of the shop this category belongs to.
 * @returns {Promise<import('@prisma/client').Category>} The deleted category.
 */
export async function deleteCategory(categoryId, shopId) {
  const category = await prisma.category.delete({
    where: {
      id: categoryId,
      shopId: shopId, // Ensure the category belongs to the shop
    },
  });
  return category;
}
