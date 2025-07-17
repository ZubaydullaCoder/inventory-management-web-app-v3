"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { normalizeProductName } from "@/lib/utils";
import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  checkProductNameApi,
} from "@/lib/api/products";

/**
 * Hook to check if a product name already exists.
 * @param {string} name - The product name to check.
 * @param {{ enabled?: boolean, excludeId?: string, staleTime?: number }} options
 * @returns {Object} TanStack Query result object.
 */
export function useCheckProductName(
  name,
  { enabled = true, excludeId, staleTime = 10 * 60 * 1000 } = {} // 10 minutes default
) {
  const normalizedName = normalizeProductName(name);

  return useQuery({
    queryKey: [
      ...queryKeys.products.checkName(normalizedName),
      { excludeId: excludeId || null },
    ],
    queryFn: async () => {
      if (!normalizedName) {
        return { exists: false };
      }
      return checkProductNameApi(normalizedName, excludeId);
    },
    enabled: enabled && Boolean(normalizedName),
    staleTime, // Accept staleTime as parameter for different cache strategies
    gcTime: 15 * 60 * 1000, // Keep in cache longer for name checks
    retry: 1,
    refetchOnMount: false, // don't auto refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}

/**
 * Hook to fetch paginated products with TanStack Query.
 * Uses granular caching strategy optimized for product data volatility.
 * @param {{page?: number, limit?: number, sortBy?: string, sortOrder?: string, nameFilter?: string, categoryFilter?: string, enableFuzzySearch?: boolean}} options - Pagination, sorting, and filtering options.
 * @returns {Object} TanStack Query result object.
 */
export function useGetProducts(options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortOrder,
    nameFilter,
    categoryFilter,
    enableFuzzySearch = true,
  } = options;

  return useQuery({
    queryKey: queryKeys.products.list({
      page,
      limit,
      sortBy,
      sortOrder,
      nameFilter,
      categoryFilter,
      enableFuzzySearch,
    }),
    queryFn: () =>
      getProductsApi({
        page,
        limit,
        sortBy,
        sortOrder,
        nameFilter,
        categoryFilter,
        enableFuzzySearch,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes - products change frequently
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
    refetchOnMount: "always", // Always refetch on mount to ensure fresh data
  });
}

/**
 * Hook to create a new product with optimistic updates.
 * @returns {Object} TanStack Query mutation object.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductApi,
    // --- Optimistic update for product list ---
    onMutate: async (newProduct) => {
      const normalizedName = normalizeProductName(newProduct.name);
      // Cancel outgoing fetches for product lists
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

      // Snapshot previous cache
      const previousLists = queryClient.getQueriesData({
        queryKey: queryKeys.products.lists(),
      });

      // Optimistically update all cached product lists
      queryClient
        .getQueryCache()
        .findAll(queryKeys.products.lists())
        .forEach((query) => {
          const oldData = query.state.data;
          if (oldData && Array.isArray(oldData.products)) {
            queryClient.setQueryData(query.queryKey, {
              ...oldData,
              products: [
                {
                  ...newProduct,
                  id: newProduct.optimisticId || `optimistic-${Date.now()}`,
                  status: "pending",
                },
                ...oldData.products,
              ],
              totalProducts: (oldData.totalProducts || 0) + 1,
            });
          }
        });

      return { previousLists, normalizedName };
    },
    onError: (_err, _newProduct, context) => {
      // Rollback cache to previous state
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSuccess: (_data, variables, context) => {
      // Invalidate product lists to refetch from server
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      // Invalidate name check for this name
      if (context?.normalizedName) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.checkName(context.normalizedName),
        });
      }
    },
  });
}

/**
 * Hook to update an existing product with optimistic updates.
 * @returns {Object} TanStack Query mutation object.
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, productData }) =>
      updateProductApi(productId, productData),
    onMutate: async ({ productId, productData }) => {
      const normalizedName = normalizeProductName(productData.name);

      // --- NEW: Capture the old normalized name from existing cache ---
      let oldNormalizedName = null;
      const existingProduct = queryClient
        .getQueryCache()
        .findAll(queryKeys.products.lists())
        .flatMap((query) => query.state.data?.products || [])
        .find((product) => product.id === productId);

      if (existingProduct) {
        oldNormalizedName = normalizeProductName(existingProduct.name);
      }

      // Get cached categories to resolve category relationship
      const categoriesData = queryClient.getQueryData(
        queryKeys.categories.lists()
      );
      const categories = Array.isArray(categoriesData) ? categoriesData : [];

      // Resolve category object from categoryId
      let resolvedCategory = null;
      if (productData.categoryId) {
        resolvedCategory = categories.find(
          (cat) => cat.id === productData.categoryId
        );

        // If category not found in cache, create a placeholder with the ID
        // This ensures the optimistic update works even if categories aren't fully loaded
        if (!resolvedCategory) {
          resolvedCategory = {
            id: productData.categoryId,
            name: "Loading...", // Placeholder that will be updated when server responds
          };
        }
      }

      // Cancel outgoing fetches for product lists
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

      // Snapshot previous cache
      const previousLists = queryClient.getQueriesData({
        queryKey: queryKeys.products.lists(),
      });

      // Optimistically update all cached product lists with resolved category
      queryClient
        .getQueryCache()
        .findAll(queryKeys.products.lists())
        .forEach((query) => {
          const oldData = query.state.data;
          if (oldData && Array.isArray(oldData.products)) {
            queryClient.setQueryData(query.queryKey, {
              ...oldData,
              products: oldData.products.map((product) =>
                product.id === productId
                  ? {
                      ...product,
                      ...productData,
                      name: normalizedName,
                      category: resolvedCategory, // Include resolved category object
                    }
                  : product
              ),
            });
          }
        });

      return { previousLists, normalizedName, oldNormalizedName };
    },
    onError: (_err, _variables, context) => {
      // Rollback cache to previous state
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSuccess: (_data, variables, context) => {
      // Invalidate product lists to refetch from server
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });

      // Invalidate categories in case a new category was created during the product update
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });

      // --- ENHANCED: Invalidate ALL name check variations for both old and new names ---
      // This ensures creation form cache is properly cleared
      if (context?.normalizedName) {
        // Invalidate with excludeId variations
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.checkName(context.normalizedName),
        });
        // Also invalidate creation form queries (no excludeId)
        queryClient.removeQueries({
          queryKey: [
            ...queryKeys.products.checkName(context.normalizedName),
            { excludeId: null },
          ],
        });
      }
      if (
        context?.oldNormalizedName &&
        context.oldNormalizedName !== context.normalizedName
      ) {
        // Invalidate with excludeId variations
        queryClient.invalidateQueries({
          queryKey: queryKeys.products.checkName(context.oldNormalizedName),
        });
        // Also invalidate creation form queries (no excludeId)
        queryClient.removeQueries({
          queryKey: [
            ...queryKeys.products.checkName(context.oldNormalizedName),
            { excludeId: null },
          ],
        });
      }
    },
  });
}
