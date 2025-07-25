// src/hooks/use-category-queries.js

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { normalizeCategoryName } from "@/lib/utils";
import { queryKeys } from "@/lib/queryKeys";
import {
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  checkCategoryNameApi,
  deleteCategoryApi,
  getCategoryUsageApi,
} from "@/lib/api/categories";
import { toast } from "sonner";

/**
 * Hook to fetch all categories with TanStack Query.
 * Uses longer cache time since categories change less frequently than products.
 * @returns {Object} TanStack Query result object.
 */
export function useGetCategories() {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: getCategoriesApi,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change less frequently
    gcTime: 15 * 60 * 1000, // Keep in cache longer
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single category by ID.
 * @param {string} categoryId - The category ID to fetch
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.enabled=true] - Whether the query should be enabled
 * @returns {Object} TanStack Query result object.
 */
export function useGetCategoryById(categoryId, { enabled = true } = {}) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.categories.detail(categoryId),
    queryFn: async () => {
      // For now, we'll get it from the categories list since we don't have a specific API endpoint
      const categories = await getCategoriesApi();
      return categories.find((cat) => cat.id === categoryId) || null;
    },
    enabled: enabled && Boolean(categoryId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to check if a category name already exists.
 * @param {string} name - The category name to check.
 * @param {{ enabled?: boolean, excludeId?: string, staleTime?: number }} options
 * @returns {Object} TanStack Query result object.
 */
export function useCheckCategoryName(
  name,
  { enabled = true, excludeId, staleTime = Infinity } = {}
) {
  const normalizedName = normalizeCategoryName(name);

  return useQuery({
    queryKey: [
      ...queryKeys.categories.checkName(normalizedName),
      { excludeId: excludeId || null },
    ],
    queryFn: async () => {
      if (!normalizedName) {
        return { exists: false };
      }
      return checkCategoryNameApi(normalizedName, excludeId);
    },
    enabled: enabled && Boolean(normalizedName),
    staleTime,
    retry: 1,
    refetchOnMount: false,
  });
}

/**
 * Hook to create a new category with optimistic updates.
 * @returns {Object} TanStack Query mutation object.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategoryApi,
    // --- Optimistic update for category list ---
    onMutate: async (newCategory) => {
      const normalizedName = normalizeCategoryName(newCategory.name);

      // Cancel outgoing fetches for category lists
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.lists(),
      });

      // Snapshot previous cache
      const previousCategories = queryClient.getQueryData(
        queryKeys.categories.lists()
      );

      // Optimistically update cache
      if (previousCategories && Array.isArray(previousCategories)) {
        queryClient.setQueryData(queryKeys.categories.lists(), [
          {
            ...newCategory,
            id: `optimistic-${Date.now()}`,
            name: normalizedName,
            productCount: 0, // New categories always start with 0 products
          },
          ...previousCategories,
        ]);
      }

      return { previousCategories, normalizedName };
    },
    onError: (_err, _newCategory, context) => {
      // Rollback cache to previous state
      if (context?.previousCategories) {
        queryClient.setQueryData(
          queryKeys.categories.lists(),
          context.previousCategories
        );
      }
    },
    onSuccess: (data, variables, context) => {
      // Manually update the cache with the returned category data
      queryClient.setQueryData(queryKeys.categories.lists(), (oldData) => {
        if (!oldData) return [data];
        // Replace the optimistic category with the real one
        return oldData.map((category) =>
          category.id.startsWith("optimistic-") ? data : category
        );
      });

      // Invalidate all category-related queries so paginated lists refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(),
      });

      // Invalidate name check for this name
      if (context?.normalizedName) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.checkName(context.normalizedName),
        });
      }
    },
  });
}

/**
 * Hook to update an existing category with optimistic updates.
 * @returns {Object} TanStack Query mutation object.
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, categoryData }) =>
      updateCategoryApi(categoryId, categoryData),
    onMutate: async ({ categoryId, categoryData }) => {
      const normalizedName = normalizeCategoryName(categoryData.name);

      // Cancel outgoing fetches for category lists
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.lists(),
      });

      // Snapshot previous cache
      const previousCategories = queryClient.getQueryData(
        queryKeys.categories.lists()
      );

      // Optimistically update cache
      if (previousCategories && Array.isArray(previousCategories)) {
        queryClient.setQueryData(
          queryKeys.categories.lists(),
          previousCategories.map((category) =>
            category.id === categoryId
              ? { 
                  ...category, 
                  ...categoryData, 
                  name: normalizedName,
                  // Preserve productCount since updates don't change product assignments
                  productCount: category.productCount ?? 0
                }
              : category
          )
        );
      }

      return { previousCategories, normalizedName };
    },
    onError: (_err, _variables, context) => {
      // Rollback cache to previous state
      if (context?.previousCategories) {
        queryClient.setQueryData(
          queryKeys.categories.lists(),
          context.previousCategories
        );
      }
    },
    onSuccess: (_data, variables, context) => {
      // Invalidate all category-related queries so paginated lists refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(),
      });

      // Invalidate name check for this name
      if (context?.normalizedName) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.checkName(context.normalizedName),
        });
      }
    },
  });
}

/**
 * Hook to get category usage information (product count).
 * @param {string} categoryId - The category ID to check.
 * @param {{ enabled?: boolean }} options
 * @returns {Object} TanStack Query result object.
 */
export function useCategoryUsage(categoryId, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...queryKeys.categories.usage(categoryId)],
    queryFn: () => getCategoryUsageApi(categoryId),
    enabled: enabled && Boolean(categoryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to delete a category with optimistic updates.
 * @returns {Object} TanStack Query mutation object.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategoryApi,
    onMutate: async (categoryId) => {
      // Cancel outgoing fetches for category lists
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.lists(),
      });

      // Snapshot previous cache
      const previousCategories = queryClient.getQueryData(
        queryKeys.categories.lists()
      );

      // Optimistically update cache
      if (previousCategories && Array.isArray(previousCategories)) {
        queryClient.setQueryData(
          queryKeys.categories.lists(),
          previousCategories.filter((category) => category.id !== categoryId)
        );
      }

      return { previousCategories };
    },
    onError: (_err, _categoryId, context) => {
      // Rollback cache to previous state
      if (context?.previousCategories) {
        queryClient.setQueryData(
          queryKeys.categories.lists(),
          context.previousCategories
        );
      }
    },
    onSuccess: () => {
      // Invalidate all category-related queries to ensure deleted category disappears from all views
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(),
      });
      toast.success("Category deleted successfully!");
    },
  });
}
