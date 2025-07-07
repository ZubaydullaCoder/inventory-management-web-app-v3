// src/hooks/use-products.js
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  getProductsApi,
  createProductApi,
} from "@/lib/services/product-service";

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
 * Custom hook to create a new product.
 * This hook is now a pure mutation engine. It no longer contains
 * optimistic update logic itself, allowing the calling component to have full control.
 * @returns The result of the useMutation hook.
 */
export function useCreateProduct() {
  // The hook is now simplified to only handle the mutation function.
  // All onMutate, onSuccess, onError logic will be handled in the component.
  return useMutation({
    mutationFn: createProductApi,
  });
}
