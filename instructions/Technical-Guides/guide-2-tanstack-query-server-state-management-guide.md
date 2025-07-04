**Guide Document 2: TanStack Query & Server State Management in Next.js: Best Practices (JavaScript + JSDoc Edition)**

**Version:** 1.2
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

- **Centralized Management:** To prevent inconsistencies, all query keys must be managed in a central file.
- File: `src/lib/queryKeys.js`

```javascript
// src/lib/queryKeys.js

/**
 * @typedef {'products' | 'categories' | 'suppliers' | 'customers'} QueryKeyResource
 */

export const queryKeys = {
  /**
   * @param {QueryKeyResource} resource
   * @param {Record<string, any>} [params]
   */
  list: (resource, params) => [resource, "list", params].filter(Boolean),
  /**
   * @param {QueryKeyResource} resource
   * @param {string} id
   */
  detail: (resource, id) => [resource, "detail", id],
};
```

**5. Fetching Data (`useQuery`)**

- **Service Layer:** All data-fetching logic must be encapsulated within service functions (e.g., `product-service.js`). Components should not call `fetch` directly.
- **`useQuery` Hook:** Use the `useQuery` hook to fetch and cache data.

```javascript
// Example in a component
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/services/product-service";
import { queryKeys } from "@/lib/queryKeys";

function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.list("products", { page: 1, limit: 10 }),
    queryFn: () => getProducts({ page: 1, limit: 10 }),
  });
  // ...
}
```

**6. Mutating Data (`useMutation`) & Optimistic Updates**

- **Service Layer:** As with queries, all mutation logic (create, update, delete) must be in the service layer.
- **`useMutation` Hook:** Use the `useMutation` hook for data modification.
- **Optimistic Updates:** For a responsive UI, all mutations that modify a list of data (create, update, delete) **must** implement optimistic updates. This provides instant feedback to the user by updating the UI _before_ the server confirms the change.

**Standard Optimistic Update Pattern:**

The following pattern must be used for all mutations. It involves three key steps inside the `useMutation` hook:

1.  **`onMutate`:**
    - Cancel any ongoing queries for the same data to prevent them from overwriting our optimistic change.
    - Snapshot the current state of the data in the cache. This is our rollback point.
    - Optimistically update the cache with the new data.
    - Return the snapshot in a context object.
2.  **`onError`:**
    - If the mutation fails, use the context object from `onMutate` to roll the cache back to its previous state.
3.  **`onSettled`:**
    - After the mutation succeeds or fails, invalidate the query. This ensures the client-side cache is eventually consistent with the server state.

**Example: Optimistic Create**

```javascript
// /src/components/features/products/product-creation-form.jsx

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { createProduct } from "@/lib/services/product-service"; // Assume this calls the API

// ...

export default function ProductCreationForm({ onProductCreated }) {
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onMutate: async (newProductData) => {
      // 1. Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.list("products") });

      // 2. Snapshot the previous data
      const previousProducts = queryClient.getQueryData(
        queryKeys.list("products")
      );

      // 3. Optimistically update the cache
      queryClient.setQueryData(queryKeys.list("products"), (old) => {
        // This is a simplified example. For a paginated list,
        // you might add to the first page or handle it differently.
        const newProduct = {
          ...newProductData,
          id: `optimistic-${Date.now()}`, // Temporary ID
          _count: {}, // Default structure
        };
        return old
          ? {
              ...old,
              pages: [[newProduct, ...old.pages[0]], ...old.pages.slice(1)],
            }
          : old;
      });

      // 4. Return context with snapshot
      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      // 5. Rollback on error
      toast.error("Failed to create product. Restoring previous state.");
      if (context?.previousProducts) {
        queryClient.setQueryData(
          queryKeys.list("products"),
          context.previousProducts
        );
      }
    },
    onSettled: () => {
      // 6. Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.list("products") });
    },
    onSuccess: (data) => {
      toast.success("Product created successfully!");
      // The onProductCreated callback might still be useful for form resets etc.
      onProductCreated(data.data);
    },
  });

  // ...
}
```

**7. Invalidation and Refetching**

- Use `queryClient.invalidateQueries` to mark data as stale and trigger a refetch. This is the primary mechanism for ensuring data is up-to-date after a mutation.
- Be specific with invalidation keys to avoid unnecessary refetches.

**8. SSR and Hydration**

- **`initialData`:** On pages that use Server-Side Rendering (SSR), data fetched on the server can be passed as `initialData` to `useQuery`.
- **Hydration:** While `initialData` is sufficient for this project, be aware of the more advanced `Hydration` pattern for complex scenarios involving prefetching on the server. For our use case, passing `initialData` from a server component to a client component is the standard.

**9. Error Handling**

- Use the `error` object from `useQuery` and the `onError` callback in `useMutation` to handle errors gracefully.
- Use React Error Boundaries (`error.jsx` in App Router) to catch rendering errors.

**10. Organizing Query Logic (Custom Hooks)**

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

**11. Developer Tools**

- Use `ReactQueryDevtools` during development to inspect the cache and query states. It is already included in the `QueryProvider` example.

By following these practices, the AI agent can effectively leverage TanStack Query to build a responsive and resilient data layer for the application using JavaScript and JSDoc.
