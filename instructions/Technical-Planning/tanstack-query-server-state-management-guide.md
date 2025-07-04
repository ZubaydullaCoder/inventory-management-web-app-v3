**Guide Document 2: TanStack Query & Server State Management in Next.js: Best Practices (JavaScript + JSDoc Edition)**

**Version:** 1.1
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction**

This document outlines best practices for using TanStack Query (v5) for server state management within the "Retail Inventory & Finance Manager" Next.js application. TanStack Query will be the primary tool in **Client Components** for fetching, caching, synchronizing, and updating server data. All code examples will use **JavaScript with JSDoc annotations** for type safety.

**2. Core Principles**

- **Server State vs. Client State:** TanStack Query manages _server state_. It is distinct from global UI client state (managed by Zustand).
- **Stale-While-Revalidate:** Data is served from the cache immediately (stale), while a background fetch updates it (revalidate).
- **Declarative Approach:** Use TanStack Query's hooks to describe data dependencies and mutations declaratively.

**3. Setup and Configuration**

- **`QueryClient` Instance:**

  - Create a single, shared `QueryClient` instance for the browser to hold the cache and configuration.
  - File: `src/lib/queryClient.js`

  ```javascript
  // src/lib/queryClient.js
  import { QueryClient } from "@tanstack/react-query";

  const queryClientOptions = {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
        retry: 1,
      },
    },
  };

  /** @type {QueryClient | undefined} */
  let browserQueryClient = undefined;

  function makeQueryClient() {
    return new QueryClient(queryClientOptions);
  }

  /**
   * Gets the QueryClient instance.
   * On the server, it creates a new client for each request.
   * In the browser, it returns a singleton instance.
   * @returns {QueryClient}
   */
  export function getQueryClient() {
    if (typeof window === "undefined") {
      return makeQueryClient();
    } else {
      if (!browserQueryClient) browserQueryClient = makeQueryClient();
      return browserQueryClient;
    }
  }
  ```

- **`QueryClientProvider`:**

  - Wrap the application in a provider. This must be a Client Component.
  - File: `src/components/providers/QueryProvider.jsx`

  ```javascript
  // src/components/providers/QueryProvider.jsx
  "use client";

  import { QueryClientProvider } from "@tanstack/react-query";
  import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
  import { useState } from "react";
  import { getQueryClient } from "@/lib/queryClient";

  /**
   * Provides the TanStack Query client to the application.
   * @param {{ children: React.ReactNode }} props
   */
  export default function QueryProvider({ children }) {
    const [queryClient] = useState(() => getQueryClient());

    return (
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    );
  }
  ```

  - **Usage in Root Layout:**

  ```javascript
  // src/app/layout.jsx
  import QueryProvider from "@/components/providers/QueryProvider";

  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    );
  }
  ```

**4. Query Keys**

- **Structure:** Use an array for query keys. Create helper functions for consistency.
- **AI Action:** The AI must use these structured keys.
- File: `src/lib/queryKeys.js`
  ```javascript
  // src/lib/queryKeys.js
  export const productKeys = {
    all: ["products"],
    lists: () => [...productKeys.all, "list"],
    /** @param {object} filters - The filters for the product list. */
    list: (filters) => [...productKeys.lists(), filters],
    details: () => [...productKeys.all, "detail"],
    /** @param {string} id - The ID of the product. */
    detail: (id) => [...productKeys.details(), id],
  };
  ```

**5. Fetching Data with `useQuery`**

- **Usage:** For read operations in Client Components.

  ```javascript
  // In a Client Component
  "use client";
  import { useQuery } from "@tanstack/react-query";
  import { productKeys } from "@/lib/queryKeys";

  /**
   * Fetches products from the API.
   * @param {{ category?: string }} filters
   * @returns {Promise<import('@/lib/types.js').Product[]>}
   */
  async function fetchProducts(filters) {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    const response = await fetch(`/api/products?${params.toString()}`);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  }

  /**
   * @param {{ initialCategory?: string }} props
   */
  function ProductList({ initialCategory }) {
    const [category, setCategory] = useState(initialCategory);
    const queryKey = productKeys.list({ category });

    const {
      data: products,
      error,
      isLoading,
    } = useQuery({
      queryKey: queryKey,
      queryFn: () => fetchProducts({ category }),
    });

    if (isLoading) return <p>Loading products...</p>;
    if (error) return <p>Error: {error.message}</p>;

    // ... render products
  }
  ```

**6. Modifying Data with `useMutation`**

- **Usage:** For create, update, or delete (CUD) operations.

  ```javascript
  // In a Client Component
  "use client";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { productKeys } from "@/lib/queryKeys";

  /**
   * Creates a new product via the API.
   * @param {import('@/lib/types.js').ProductCreateInput} newProductData
   * @returns {Promise<import('@/lib/types.js').Product>}
   */
  async function createProduct(newProductData) {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProductData),
    });
    if (!response.ok) throw new Error("Failed to create product");
    return response.json();
  }

  function AddProductForm() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
      mutationFn: createProduct,
      onSuccess: (newProduct) => {
        // Invalidate and refetch the list of products
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        console.log("Product created:", newProduct);
      },
      onError: (error) => {
        console.error("Failed to create product:", error.message);
      },
    });

    /** @param {import('@/lib/types.js').ProductCreateInput} formData */
    const handleSubmit = (formData) => {
      mutation.mutate(formData);
    };

    // ... render form
  }
  ```

**7. Cache Invalidation and Refetching**

- Use `queryClient.invalidateQueries({ queryKey: ... })` in the `onSuccess` callback of mutations to mark relevant queries as stale and trigger refetches.

**8. Integration with Next.js App Router (Server & Client Components)**

- **Primary Data Fetching in Server Components:** Fetch critical data for the initial page load directly in Server Components.
- **Hydrating Client Components with Initial Data:** Pass data fetched on the server as props to Client Components and use the `initialData` option of `useQuery`.

  ```javascript
  // src/app/products/[productId]/page.jsx (Server Component)
  import { getProduct } from '@/lib/data/products'; // Assume this fetches from DB
  import ProductDetailClient from '@/components/features/products/ProductDetailClient';

  /**
   * @param {{ params: { productId: string } }} props
   */
  export default async function ProductPage({ params }) {
    const product = await getProduct(params.productId);
    return <ProductDetailClient initialProductData={product} />;
  }

  // src/components/features/products/ProductDetailClient.jsx (Client Component)
  'use client';
  import { useQuery } from '@tanstack/react-query';
  import { productKeys } from '@/lib/queryKeys';

  /**
   * Fetches a single product by its ID from the API.
   * @param {string} id
   * @returns {Promise<import('@/lib/types.js').Product>}
   */
  async function fetchProductById(id) {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  }

  /**
   * @param {{ initialProductData: import('@/lib/types.js').Product }} props
   */
  export default function ProductDetailClient({ initialProductData }) {
    const { data: product } = useQuery({
      queryKey: productKeys.detail(initialProductData.id),
      queryFn: () => fetchProductById(initialProductData.id),
      initialData: initialProductData,
      staleTime: 1000 * 60 * 5, // Keep initial data fresh for 5 mins
    });

    // ... render product details using the 'product' object
  }
  ```

**9. Error Handling**

- Use the `error` object from `useQuery` and the `onError` callback in `useMutation` to handle errors gracefully.
- Use React Error Boundaries (`error.jsx` in App Router) to catch rendering errors.

**10. Optimistic Updates**

- For a smoother UX, consider optimistic updates using `onMutate` and `onSettled` in `useMutation`. This is an advanced pattern suitable for post-MVP optimization.

**11. Organizing Query Logic (Custom Hooks)**

- Encapsulate `useQuery` and `useMutation` logic into custom hooks for reusability.

  ```javascript
  // src/hooks/useProducts.js
  "use client";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { productKeys } from "@/lib/queryKeys";

  // Assume API functions are defined elsewhere (e.g., src/lib/api/products.js)
  import { getProductsApi, createProductApi } from "@/lib/api/products";

  /**
   * @param {object} filters
   */
  export function useGetProducts(filters) {
    return useQuery({
      queryKey: productKeys.list(filters),
      queryFn: () => getProductsApi(filters),
    });
  }

  export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: createProductApi,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      },
    });
  }
  ```

**12. Developer Tools**

- Use `ReactQueryDevtools` during development to inspect the cache and query states. It is already included in the `QueryProvider` example.

By following these practices, the AI agent can effectively leverage TanStack Query to build a responsive and resilient data layer for the application using JavaScript and JSDoc.
