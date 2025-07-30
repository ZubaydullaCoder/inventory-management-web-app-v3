"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { normalizeProductName } from "@/lib/utils";
import {
  createProductApi,
  updateProductApi,
  checkProductNameApi,
  getProductsCursorApi,
  deleteProductApi,
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
 * Hook to fetch products using cursor-based pagination with TanStack Query.
 * Better performance for large datasets compared to offset-based pagination.
* @param {{cursor?: string, direction?: 'forward'|'backward', limit?: number, sortBy?: string, sortOrder?: string, nameFilter?: string, categoryFilter?: string, unitFilter?: string, enableFuzzySearch?: boolean}} options - Cursor pagination, sorting, and filtering options.
 * @returns {Object} TanStack Query result object.
 */
export function useGetProductsCursor(options = {}) {
  const {
    cursor = null,
    direction = "forward",
    limit = 10,
    sortBy,
    sortOrder,
    nameFilter,
    categoryFilter,
    unitFilter,
    enableFuzzySearch = true,
  } = options;

  return useQuery({
    queryKey: queryKeys.products.cursorList({
      cursor,
      direction,
      limit,
      sortBy,
      sortOrder,
      nameFilter,
      categoryFilter,
      unitFilter,
      enableFuzzySearch,
    }),
    queryFn: () =>
      getProductsCursorApi({
        cursor,
        direction,
        limit,
        sortBy,
        sortOrder,
        nameFilter,
        categoryFilter,
        unitFilter,
        enableFuzzySearch,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes - products change frequently
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
    refetchOnMount: "always", // Always refetch on mount to ensure fresh data
    keepPreviousData: true, // Keep previous data while fetching new data for smoother UX
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
      const optimisticId = newProduct.optimisticId || `optimistic-${Date.now()}`;
      
      // Add new product to session creations cache with pending status
      queryClient.setQueryData(queryKeys.products.sessionCreations(), (old = []) => [
        {
          optimisticId,
          data: {
            ...newProduct,
            id: optimisticId,
          },
          status: "pending",
        },
        ...old,
      ]);
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

      return { previousLists, normalizedName, optimisticId };
    },
    onError: (_err, newProduct, context) => {
      // Mark the session creation as error
      if (context?.optimisticId) {
        queryClient.setQueryData(queryKeys.products.sessionCreations(), (old = []) =>
          old.map((item) =>
            item.optimisticId === context.optimisticId
              ? { ...item, status: "error" }
              : item
          )
        );
        
        // Auto-remove failed items after a delay
        setTimeout(() => {
          queryClient.setQueryData(queryKeys.products.sessionCreations(), (old = []) =>
            old.filter((item) => item.optimisticId !== context.optimisticId)
          );
        }, 5000);
      }
      
      // Rollback product lists cache to previous state
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSuccess: (data, variables, context) => {
      // Update the session creation with success status and real data
      if (context?.optimisticId) {
        queryClient.setQueryData(queryKeys.products.sessionCreations(), (old = []) =>
          old.map((item) =>
            item.optimisticId === context.optimisticId
              ? { ...item, data, status: "success" }
              : item
          )
        );
      }
      
      // Invalidate product lists to refetch from server
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      // Invalidate categories to reflect updated product counts
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
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
      // Only normalize name if it's provided in the update
      const normalizedName = productData.name !== undefined 
        ? normalizeProductName(productData.name) 
        : undefined;

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
                      // Only update name if it was provided in productData
                      ...(normalizedName !== undefined && { name: normalizedName }),
                      category: resolvedCategory, // Include resolved category object
                    }
                  : product
              ),
            });
          }
        });
        
      // Also update session creations if the product exists there
      const sessionCreations = queryClient.getQueryData(queryKeys.products.sessionCreations()) || [];
      queryClient.setQueryData(
        queryKeys.products.sessionCreations(),
        sessionCreations.map((item) =>
          item.data?.id === productId
            ? {
                ...item,
                data: {
                  ...item.data,
                  ...productData,
                  // Only update name if it was provided in productData
                  ...(normalizedName !== undefined && { name: normalizedName }),
                  category: resolvedCategory,
                },
              }
            : item
        )
      );

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
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });

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

/**
 * Hook to delete a product with optimistic updates.
 * @returns {Object} TanStack Query mutation object.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductApi,
    onMutate: async (productId) => {
      // Cancel outgoing fetches for product lists
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

      // Snapshot previous cache
      const previousLists = queryClient.getQueriesData({
        queryKey: queryKeys.products.lists(),
      });

      // Optimistically remove product from all cached product lists
      queryClient
        .getQueryCache()
        .findAll(queryKeys.products.lists())
        .forEach((query) => {
          const oldData = query.state.data;
          if (oldData && Array.isArray(oldData.products)) {
            queryClient.setQueryData(query.queryKey, {
              ...oldData,
              products: oldData.products.filter(
                (product) => product.id !== productId
              ),
              totalProducts: Math.max((oldData.totalProducts || 0) - 1, 0),
            });
          }
        });

      // Also remove from session creations if it exists there
      const sessionCreations = queryClient.getQueryData(queryKeys.products.sessionCreations()) || [];
      queryClient.setQueryData(
        queryKeys.products.sessionCreations(),
        sessionCreations.filter((item) => item.data?.id !== productId)
      );

      return { previousLists };
    },
    onError: (_err, _productId, context) => {
      // Rollback cache to previous state on error
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      console.error('Failed to delete product:', _err);
    },
    onSuccess: () => {
      // Invalidate product lists to refetch from server and sync any changes
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      // Invalidate categories to reflect updated product counts
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });
}

/**
 * Hook to delete multiple products with optimistic updates and proper error handling.
 * Provides immediate UI feedback by removing all selected products optimistically,
 * then handles individual failures gracefully with partial rollback.
 * @returns {Object} TanStack Query mutation object.
 */
export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productIds) => {
      // Delete products sequentially to avoid overwhelming the server
      const results = [];
      const errors = [];
      
      for (const productId of productIds) {
        try {
          const result = await deleteProductApi(productId);
          results.push({ productId, success: true, result });
        } catch (error) {
          results.push({ productId, success: false, error });
          errors.push({ productId, error });
        }
      }
      
      const data = {
        results,
        errors,
        successCount: results.filter(r => r.success).length,
        failureCount: errors.length,
        totalCount: productIds.length,
      };
      
      // If all deletions failed, throw an error to trigger the error toast
      if (data.failureCount === data.totalCount) {
        throw new Error(`Failed to delete all ${data.totalCount} products`);
      }
      
      return data;
    },
    onMutate: async (productIds) => {
      // Cancel outgoing fetches for product lists
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

      // Snapshot previous cache
      const previousLists = queryClient.getQueriesData({
        queryKey: queryKeys.products.lists(),
      });

      // Store product data for potential rollback of failed deletions
      const productsToDelete = [];
      queryClient
        .getQueryCache()
        .findAll(queryKeys.products.lists())
        .forEach((query) => {
          const data = query.state.data;
          if (data && Array.isArray(data.products)) {
            data.products.forEach(product => {
              if (productIds.includes(product.id)) {
                productsToDelete.push(product);
              }
            });
          }
        });

      // Optimistically remove all selected products from cached product lists
      queryClient
        .getQueryCache()
        .findAll(queryKeys.products.lists())
        .forEach((query) => {
          const oldData = query.state.data;
          if (oldData && Array.isArray(oldData.products)) {
            queryClient.setQueryData(query.queryKey, {
              ...oldData,
              products: oldData.products.filter(
                (product) => !productIds.includes(product.id)
              ),
              totalProducts: Math.max((oldData.totalProducts || 0) - productIds.length, 0),
            });
          }
        });

      // Also remove from session creations if they exist there
      const sessionCreations = queryClient.getQueryData(queryKeys.products.sessionCreations()) || [];
      queryClient.setQueryData(
        queryKeys.products.sessionCreations(),
        sessionCreations.filter((item) => !productIds.includes(item.data?.id))
      );

      return { previousLists, productsToDelete, productIds };
    },
    onError: (_err, _productIds, context) => {
      // Complete rollback on unexpected error during the mutation process
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      console.error('Bulk delete error:', _err);
    },
    onSuccess: (data, productIds, context) => {
      // Handle partial failures by rolling back failed products
      if (data.errors.length > 0 && context?.productsToDelete) {
        const failedProductIds = data.errors.map(e => e.productId);
        const failedProducts = context.productsToDelete.filter(p => 
          failedProductIds.includes(p.id)
        );
        
        // Re-add failed products back to the cache
        queryClient
          .getQueryCache()
          .findAll(queryKeys.products.lists())
          .forEach((query) => {
            const currentData = query.state.data;
            if (currentData && Array.isArray(currentData.products)) {
              queryClient.setQueryData(query.queryKey, {
                ...currentData,
                products: [...currentData.products, ...failedProducts],
                totalProducts: (currentData.totalProducts || 0) + failedProducts.length,
              });
            }
          });
      }
      
      // Invalidate product lists to refetch from server and sync any changes
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}
