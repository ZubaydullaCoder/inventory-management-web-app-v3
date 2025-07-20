"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";

/**
 * Custom hook for cursor-based URL-driven table state management.
 * Handles cursor navigation instead of page-based pagination for better performance.
 * Synchronizes cursor state with URL parameters and manages filter state locally.
 *
 * @param {Object} defaultState - Default table state values
 * @param {string|null} [defaultState.cursor] - Default cursor value
 * @param {string} [defaultState.direction] - Default cursor direction ('forward' | 'backward')
 * @param {number} [defaultState.limit] - Default page size
 * @param {string} [defaultState.sortBy] - Default sort field
 * @param {string} [defaultState.sortOrder] - Default sort order
 * @param {string} [defaultState.nameFilter] - Default name filter
 * @param {string} [defaultState.categoryFilter] - Default category filter
 * @returns {Object} Table state and update functions
 */
export function useTableCursorUrlState(
  defaultState = {
    cursor: null,
    direction: "forward",
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

  // Parse current URL parameters with validation (cursor-specific parameters)
  const urlState = useMemo(() => {
    const cursor = searchParams.get("cursor") || defaultState.cursor;
    const direction = searchParams.get("direction") || defaultState.direction;
    const limit = Math.max(
      1,
      Math.min(
        100,
        parseInt(searchParams.get("limit") || defaultState.limit.toString(), 10)
      )
    );
    const sortBy = searchParams.get("sortBy") || defaultState.sortBy;
    const sortOrder = searchParams.get("sortOrder") || defaultState.sortOrder;

    // Validate direction
    const validDirection = ["forward", "backward"].includes(direction)
      ? direction
      : defaultState.direction;

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
      cursor,
      direction: validDirection,
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

  // Debounce filter values for API calls (not URL updates)
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

  // Convert to TanStack Table format (cursor-based)
  const tableState = useMemo(
    () => ({
      sorting: [
        {
          id: currentState.sortBy,
          desc: currentState.sortOrder === "desc",
        },
      ],
      columnFilters: [
        ...(currentState.nameFilter
          ? [{ id: "name", value: currentState.nameFilter }]
          : []),
        ...(currentState.categoryFilter
          ? [{ id: "category", value: currentState.categoryFilter }]
          : []),
      ],
      cursor: {
        value: currentState.cursor,
        direction: currentState.direction,
        pageSize: currentState.limit,
      },
    }),
    [currentState]
  );

  // API parameters for data fetching (uses debounced filter values)
  const apiParams = useMemo(
    () => ({
      cursor: urlState.cursor,
      direction: urlState.direction,
      limit: urlState.limit,
      sortBy: urlState.sortBy,
      sortOrder: urlState.sortOrder,
      nameFilter: debouncedNameFilter,
      categoryFilter: debouncedCategoryFilter,
      enableFuzzySearch: true,
    }),
    [urlState, debouncedNameFilter, debouncedCategoryFilter]
  );

  // Update URL with new parameters (debounced for filters)
  const updateUrl = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value != null && value !== "" && value !== defaultState[key]) {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      });

      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, pathname, router, defaultState]
  );

  // Handle cursor navigation (replaces pagination)
  const handleCursorChange = useCallback(
    (newCursor, direction = "forward") => {
      updateUrl({
        cursor: newCursor,
        direction,
        // Reset cursor when other parameters change
        ...(direction === "reset"
          ? { cursor: null, direction: "forward" }
          : {}),
      });
    },
    [updateUrl]
  );

  // Handle sorting changes (resets cursor)
  const handleSortingChange = useCallback(
    (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(tableState.sorting) : updater;

      if (newSorting.length > 0) {
        const { id: sortBy, desc } = newSorting[0];
        updateUrl({
          sortBy,
          sortOrder: desc ? "desc" : "asc",
          cursor: null, // Reset cursor when sorting changes
          direction: "forward",
        });
      }
    },
    [updateUrl, tableState.sorting]
  );

  // Handle filter changes (local state only, resets cursor when debounced)
  const handleColumnFiltersChange = useCallback(
    (updater) => {
      const newFilters =
        typeof updater === "function"
          ? updater(tableState.columnFilters)
          : updater;

      const nameFilter = newFilters.find((f) => f.id === "name")?.value || "";
      const categoryFilter =
        newFilters.find((f) => f.id === "category")?.value || "";

      setLocalFilters({ nameFilter, categoryFilter });
    },
    [tableState.columnFilters]
  );

  // Reset cursor when filters change (via debounced effect)
  useEffect(() => {
    if (
      debouncedNameFilter !== localFilters.nameFilter ||
      debouncedCategoryFilter !== localFilters.categoryFilter
    ) {
      // Only reset if we currently have a cursor
      if (urlState.cursor) {
        updateUrl({
          cursor: null,
          direction: "forward",
        });
      }
    }
  }, [
    debouncedNameFilter,
    debouncedCategoryFilter,
    urlState.cursor,
    updateUrl,
  ]);

  // Handle page size changes (resets cursor)
  const handlePageSizeChange = useCallback(
    (newSize) => {
      updateUrl({
        limit: newSize,
        cursor: null, // Reset cursor when page size changes
        direction: "forward",
      });
    },
    [updateUrl]
  );

  // Check if any filters are active
  const isFiltered = useMemo(
    () => Boolean(localFilters.nameFilter || localFilters.categoryFilter),
    [localFilters]
  );

  // Reset all filters and cursor
  const resetFilters = useCallback(() => {
    setLocalFilters({
      nameFilter: "",
      categoryFilter: "",
    });
    updateUrl({
      cursor: null,
      direction: "forward",
    });
  }, [updateUrl]);

  return {
    // State objects
    tableState,
    currentState,
    apiParams,

    // Navigation functions
    handleCursorChange,
    handleSortingChange,
    handleColumnFiltersChange,
    handlePageSizeChange,

    // Utility functions
    resetFilters,
    isFiltered,

    // Raw URL state for external use
    urlState,
  };
}
