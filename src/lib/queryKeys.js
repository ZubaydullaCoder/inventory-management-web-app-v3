// src/lib/queryKeys.js

/**
 * @description Centralized query keys for TanStack Query.
 * This provides a single source of truth for cache keys, ensuring consistency.
 */
export const queryKeys = {
  products: {
    all: () => ["products"],
    lists: () => [...queryKeys.products.all(), "list"],
    list: (filters) => [...queryKeys.products.lists(), { filters }],
    cursorLists: () => [...queryKeys.products.all(), "cursorList"],
    cursorList: (filters) => [...queryKeys.products.cursorLists(), { filters }],
    details: () => [...queryKeys.products.all(), "detail"],
    detail: (id) => [...queryKeys.products.details(), id],
    checkName: (name) => [...queryKeys.products.all(), "checkName", name],
    sessionCreations: () => [...queryKeys.products.all(), "session-creations"],
  },
  categories: {
    all: () => ["categories"],
    lists: () => [...queryKeys.categories.all(), "list"],
    list: (filters) => [...queryKeys.categories.lists(), { filters }],
    paginated: (search, pageSize) => [
      ...queryKeys.categories.all(),
      "paginated",
      { search, pageSize },
    ],
    details: () => [...queryKeys.categories.all(), "detail"],
    detail: (id) => [...queryKeys.categories.details(), id],
    checkName: (name) => [...queryKeys.categories.all(), "checkName", name],
    usage: (categoryId) => [...queryKeys.categories.all(), "usage", categoryId],
  },
  // ... other resource keys will be added here in the future
};
