// src/lib/category-utils.js

/**
 * Sorts categories to place the selected category first, followed by others
 * @param {Array} categories - Array of category objects
 * @param {string|null} selectedCategoryId - ID of the selected category
 * @returns {Object} Object containing selected category and remaining categories
 */
export function sortCategoriesWithSelectedFirst(categories, selectedCategoryId) {
  if (!categories || categories.length === 0) {
    return {
      selectedCategory: null,
      otherCategories: [],
      hasSelected: false
    };
  }

  if (!selectedCategoryId) {
    return {
      selectedCategory: null,
      otherCategories: categories,
      hasSelected: false
    };
  }

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const otherCategories = categories.filter(cat => cat.id !== selectedCategoryId);

  return {
    selectedCategory,
    otherCategories,
    hasSelected: !!selectedCategory
  };
}

/**
 * Checks if a newly created category should be prioritized at the top
 * @param {Object} category - Category object to check
 * @param {number} recentThresholdMs - Threshold in milliseconds to consider "recent" (default: 30 seconds)
 * @returns {boolean} Whether the category is newly created
 */
export function isNewlyCreatedCategory(category, recentThresholdMs = 30000) {
  if (!category?.createdAt) return false;
  
  const createdTime = new Date(category.createdAt).getTime();
  const now = Date.now();
  
  return (now - createdTime) <= recentThresholdMs;
}

/**
 * Sorts categories with newly created ones first, then selected, then others
 * @param {Array} categories - Array of category objects  
 * @param {string|null} selectedCategoryId - ID of the selected category
 * @returns {Object} Object containing categorized and sorted categories
 */
export function sortCategoriesWithPriority(categories, selectedCategoryId) {
  if (!categories || categories.length === 0) {
    return {
      selectedCategory: null,
      newCategories: [],
      otherCategories: [],
      hasSelected: false,
      hasNew: false
    };
  }

  // First, separate by creation time
  const newCategories = categories.filter(cat => 
    isNewlyCreatedCategory(cat) && cat.id !== selectedCategoryId
  );
  
  const remainingCategories = categories.filter(cat => 
    !isNewlyCreatedCategory(cat)
  );

  // Then, separate selected from remaining
  const selectedCategory = remainingCategories.find(cat => cat.id === selectedCategoryId);
  const otherCategories = remainingCategories.filter(cat => cat.id !== selectedCategoryId);

  return {
    selectedCategory,
    newCategories,
    otherCategories,
    hasSelected: !!selectedCategory,
    hasNew: newCategories.length > 0
  };
}
