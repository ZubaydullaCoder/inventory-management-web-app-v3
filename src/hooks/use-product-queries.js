// src/hooks/use-products.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { normalizeProductName } from "@/lib/utils";
import {
  getProductsApi,
  createProductApi,
  checkProductNameApi,
} from "@/lib/api/products";

/**
 * Hook to check if a product name already exists.
 * @param {string} name - The product name to check.
 * @returns {Object} TanStack Query result object.
 */
export function useCheckProductName(name) {
  const normalizedName = normalizeProductName(name);

  return useQuery({
    queryKey: queryKeys.products.checkName(normalizedName),
    queryFn: async () => {
      if (!normalizedName) {
        return { exists: false };
      }
      return checkProductNameApi(normalizedName);
    },
    enabled: Boolean(normalizedName),
    staleTime: Infinity,
    retry: 1,
    refetchOnMount: true, // Always refetch when component mounts with this key
  });
}

/**
 * Hook to fetch paginated products with TanStack Query.
 * @param {{page?: number, limit?: number}} options - Pagination options.
 * @returns {Object} TanStack Query result object.
 */
export function useGetProducts(options = {}) {
  const { page = 1, limit = 10 } = options;
  return useQuery({
    queryKey: queryKeys.products.list({ page, limit }),
    queryFn: () => getProductsApi({ page, limit }),
    staleTime: 5 * 60 * 1000,
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
