// src/hooks/use-products.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  getProductsApi,
  createProductApi,
} from "@/lib/services/product-service";

// Placeholder for a toast library, e.g., react-hot-toast or sonner
const toast = {
  success: (message) => console.log(`SUCCESS: ${message}`),
  error: (message) => console.error(`ERROR: ${message}`),
};

/**
 * Custom hook to fetch a paginated list of products.
 * @param {{page: number, limit: number}} filters
 * @returns The result of the useQuery hook.
 */
export function useGetProducts({ page, limit }) {
  return useQuery({
    queryKey: queryKeys.products.list({ page, limit }),
    queryFn: () => getProductsApi({ page, limit }),
    // keepPreviousData is essential for a smooth pagination experience
    keepPreviousData: true,
  });
}

/**
 * Custom hook to create a new product with optimistic updates.
 * @returns The result of the useMutation hook.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductApi,
    /**
     * This function runs before the mutation, enabling optimistic updates.
     */
    onMutate: async (newProductData) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

      // 2. Snapshot the previous value
      const previousProductsData = queryClient.getQueryData(
        queryKeys.products.list({ page: 1, limit: 10 })
      );

      // 3. Optimistically update to the new value
      queryClient.setQueryData(
        queryKeys.products.list({ page: 1, limit: 10 }),
        (oldData) => {
          const newProduct = {
            ...newProductData,
            id: `optimistic-${Date.now()}`, // Temporary ID
            isActive: true,
            category: null, // Default structure
            supplier: null, // Default structure
          };

          if (!oldData || !oldData.products) {
            return {
              products: [newProduct],
              totalProducts: 1,
              totalPages: 1,
              currentPage: 1,
            };
          }

          // Add the new product to the beginning of the first page
          const newProducts = [newProduct, ...oldData.products];

          return {
            ...oldData,
            products: newProducts,
            totalProducts: oldData.totalProducts + 1,
          };
        }
      );

      // 4. Return a context object with the snapshotted value
      return { previousProductsData };
    },
    /**
     * If the mutation fails, use the context returned from onMutate to roll back.
     */
    onError: (err, newProduct, context) => {
      toast.error("Failed to create product. Restoring previous state.");
      if (context?.previousProductsData) {
        queryClient.setQueryData(
          queryKeys.products.list({ page: 1, limit: 10 }),
          context.previousProductsData
        );
      }
    },
    /**
     * Always refetch after error or success to ensure client state is in sync with the server.
     */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
    },
  });
}
