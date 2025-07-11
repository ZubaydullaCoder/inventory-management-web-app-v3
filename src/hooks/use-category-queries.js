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
} from "@/lib/api/categories";
import { toast } from "sonner";

/**
 * Hook to fetch all categories with TanStack Query.
 * @returns {Object} TanStack Query result object.
 */
export function useGetCategories() {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: getCategoriesApi,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    onSuccess: (_data, variables, context) => {
      // Invalidate category lists to refetch from server
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });

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
              ? { ...category, ...categoryData, name: normalizedName }
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
      // Invalidate category lists to refetch from server
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });

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
      // Invalidate category lists to refetch from server
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      toast.success("Category deleted successfully!");
    },
  });
}
