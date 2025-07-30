"use client";

import { useMemo } from "react";
import { useGetCategories } from "@/hooks/use-category-queries";

/**
 * Hook to fetch categories and transform them into filter options format.
 * This hook specifically prepares category data for use in filtering components like DataTableFacetedFilter.
 * @returns {Object} Object containing loading state, error, and transformed options
 */
export function useCategoriesForFiltering() {
  const { data: categories, isLoading, error } = useGetCategories();

  // Transform categories into the options format expected by shadcn filter components
  const categoryOptions = useMemo(() => {
    if (!categories || !Array.isArray(categories)) {
      return [];
    }

    return categories.map((category) => ({
      label: category.name,
      value: category.name, // Use name as value for filtering (matches server-side categoryFilter)
      count: category.productCount || 0, // Include product count for better UX
    }));
  }, [categories]);

  return {
    categoryOptions,
    isLoading,
    error,
    hasCategories: categoryOptions.length > 0,
  };
}
