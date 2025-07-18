"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";

/**
 * Custom hook for URL-driven table state management.
 * Synchronizes pagination and sorting with URL parameters.
 * Uses local state for filters to prevent input lag.
 *
 * @param {Object} defaultState - Default table state values
 * @param {number} [defaultState.page] - Default page number
 * @param {number} [defaultState.limit] - Default page size
 * @param {string} [defaultState.sortBy] - Default sort field
 * @param {string} [defaultState.sortOrder] - Default sort order
 * @param {string} [defaultState.nameFilter] - Default name filter
 * @param {string} [defaultState.categoryFilter] - Default category filter
 * @returns {Object} Table state and update functions
 */
export function useTableUrlState(
  defaultState = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    nameFilter: "",
    categoryFilter: "",
  }
) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current URL parameters with validation (no filters in URL)
  const urlState = useMemo(() => {
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || defaultState.page.toString(), 10)
    );
    const limit = Math.max(
      1,
      Math.min(
        100,
        parseInt(searchParams.get("limit") || defaultState.limit.toString(), 10)
      )
    );
    const sortBy = searchParams.get("sortBy") || defaultState.sortBy;
    const sortOrder = searchParams.get("sortOrder") || defaultState.sortOrder;

    // Validate sort order
    const validSortOrder = ["asc", "desc"].includes(sortOrder)
      ? sortOrder
      : defaultState.sortOrder;

    // Validate sort field
    const validSortFields = [
      "createdAt",
      "name",
      "sellingPrice",
      "purchasePrice",
      "stock",
      "category",
    ];
    const validSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : defaultState.sortBy;

    return {
      page,
      limit,
      sortBy: validSortBy,
      sortOrder: validSortOrder,
    };
  }, [searchParams, defaultState]);

  // Local state for filter inputs (prevents URL lag)
  const [localFilters, setLocalFilters] = useState({
    nameFilter: defaultState.nameFilter,
    categoryFilter: defaultState.categoryFilter,
  });

  // Debounce filter values for API calls only (not URL updates)
  const [debouncedNameFilter] = useDebounce(localFilters.nameFilter, 300);
  const [debouncedCategoryFilter] = useDebounce(
    localFilters.categoryFilter,
    300
  );

  // Current state combines URL state with local filter state
  const currentState = useMemo(
    () => ({
      ...urlState,
      nameFilter: localFilters.nameFilter,
      categoryFilter: localFilters.categoryFilter,
    }),
    [urlState, localFilters]
  );

  // Convert to TanStack Table format (uses local filter state for immediate UI updates)
  const tableState = useMemo(() => {
    const sorting = currentState.sortBy
      ? [
          {
            id: currentState.sortBy,
            desc: currentState.sortOrder === "desc",
          },
        ]
      : [];

    const columnFilters = [];
    if (localFilters.nameFilter) {
      columnFilters.push({ id: "name", value: localFilters.nameFilter });
    }
    if (localFilters.categoryFilter) {
      columnFilters.push({
        id: "category",
        value: localFilters.categoryFilter,
      });
    }

    return {
      pagination: {
        pageIndex: urlState.page - 1, // Use URL state for pagination
        pageSize: urlState.limit,
      },
      sorting,
      columnFilters,
    };
  }, [currentState, localFilters, urlState]);

  // API parameters for server requests (uses debounced values)
  const apiParams = useMemo(() => {
    const params = {
      page: urlState.page,
      limit: urlState.limit,
    };

    if (urlState.sortBy) {
      params.sortBy = urlState.sortBy;
      params.sortOrder = urlState.sortOrder;
    }

    if (debouncedNameFilter) {
      params.nameFilter = debouncedNameFilter;
    }

    if (debouncedCategoryFilter) {
      params.categoryFilter = debouncedCategoryFilter;
    }

    return params;
  }, [urlState, debouncedNameFilter, debouncedCategoryFilter]);

  // Build URL with new parameters (no filters in URL)
  const buildUrl = useCallback(
    (newState) => {
      const params = new URLSearchParams();

      // Only add non-default parameters to keep URLs clean
      if (newState.page !== defaultState.page) {
        params.set("page", newState.page.toString());
      }
      if (newState.limit !== defaultState.limit) {
        params.set("limit", newState.limit.toString());
      }
      if (newState.sortBy !== defaultState.sortBy) {
        params.set("sortBy", newState.sortBy);
      }
      if (newState.sortOrder !== defaultState.sortOrder) {
        params.set("sortOrder", newState.sortOrder);
      }

      const queryString = params.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [pathname, defaultState]
  );

  // Update URL with new state
  const updateUrl = useCallback(
    (newState) => {
      const url = buildUrl(newState);
      router.push(url, { scroll: false });
    },
    [buildUrl, router]
  );

  // State update functions
  const updateState = useCallback(
    (updates) => {
      const newState = { ...urlState, ...updates };
      updateUrl(newState);
    },
    [urlState, updateUrl]
  );

  // Smart pagination reset when filters change
  const updateFilters = useCallback(
    (filters) => {
      setLocalFilters((prev) => ({
        ...prev,
        ...filters,
      }));
      // Reset pagination when filters change
      updateState({ page: 1 });
    },
    [updateState]
  );

  // TanStack Table state change handlers
  const handlePaginationChange = useCallback(
    (updaterOrValue) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(tableState.pagination)
          : updaterOrValue;

      updateState({
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      });
    },
    [tableState.pagination, updateState]
  );

  const handleSortingChange = useCallback(
    (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(tableState.sorting)
          : updaterOrValue;

      if (newSorting.length > 0) {
        const sort = newSorting[0];
        updateState({
          sortBy: sort.id,
          sortOrder: sort.desc ? "desc" : "asc",
        });
      } else {
        updateState({
          sortBy: defaultState.sortBy,
          sortOrder: defaultState.sortOrder,
        });
      }
    },
    [tableState.sorting, updateState, defaultState]
  );

  const handleColumnFiltersChange = useCallback(
    (updaterOrValue) => {
      const newFilters =
        typeof updaterOrValue === "function"
          ? updaterOrValue(tableState.columnFilters)
          : updaterOrValue;

      const nameFilter = newFilters.find((f) => f.id === "name")?.value || "";
      const categoryFilter =
        newFilters.find((f) => f.id === "category")?.value || "";

      // Update local filter state immediately (no URL update)
      setLocalFilters({
        nameFilter,
        categoryFilter,
      });

      // Reset pagination when filters change
      if (
        nameFilter !== localFilters.nameFilter ||
        categoryFilter !== localFilters.categoryFilter
      ) {
        updateState({ page: 1 });
      }
    },
    [tableState.columnFilters, localFilters, updateState]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setLocalFilters({
      nameFilter: "",
      categoryFilter: "",
    });
    updateState({ page: 1 });
  }, [updateState]);

  // Validate current page against total pages
  const validatePage = useCallback(
    (totalPages) => {
      if (totalPages > 0 && urlState.page > totalPages) {
        updateState({ page: 1 });
      }
    },
    [urlState.page, updateState]
  );

  return {
    // Current state (hybrid of URL and local state)
    state: currentState,
    tableState,
    apiParams,

    // State update functions
    updateState,
    updateFilters,
    resetFilters,
    validatePage,

    // TanStack Table handlers
    handlePaginationChange,
    handleSortingChange,
    handleColumnFiltersChange,

    // URL utilities
    buildUrl,

    // Helper flags (use debounced values for consistency)
    hasFilters: !!(debouncedNameFilter || debouncedCategoryFilter),
    isFiltered: !!(debouncedNameFilter || debouncedCategoryFilter),
  };
}
