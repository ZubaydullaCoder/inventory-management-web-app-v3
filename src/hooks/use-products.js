// src/hooks/use-products.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Hook to check if a product name already exists.
 * @param {string} name - The product name to check.
 * @returns {Object} TanStack Query result object.
 */
export function useCheckProductName(name) {
  return useQuery({
    queryKey: queryKeys.products.checkName(name),
    queryFn: async () => {
      if (!name || name.trim() === "") {
        return { exists: false };
      }
      const response = await fetch(
        `/api/products/check-name?name=${encodeURIComponent(name.trim())}`
      );
      if (!response.ok) {
        throw new Error("Failed to check product name");
      }
      return response.json();
    },
    enabled: Boolean(name && name.trim()),
    staleTime: Infinity,
    retry: 1,
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
    queryFn: async () => {
      const response = await fetch(`/api/products?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
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
    mutationFn: async (productData) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
}
