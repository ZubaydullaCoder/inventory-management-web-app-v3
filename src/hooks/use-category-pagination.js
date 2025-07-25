// src/hooks/use-category-pagination.js

"use client";

import { useState, useMemo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getCategoriesPaginatedApi } from "@/lib/api/categories";
import { normalizeCategoryName } from "@/lib/utils";

/**
 * Custom hook for category pagination with search and filtering functionality.
 * Uses cursor-based pagination for optimal performance with large datasets.
 * 
 * @param {Object} options - Hook options
 * @param {number} [options.pageSize=10] - Number of items per page
 * @param {string} [options.searchQuery=""] - Search query for filtering categories
 * @param {boolean} [options.enabled=true] - Whether the query should be enabled
 * @returns {Object} Pagination state and methods
 */
export function useCategoryPagination({
  pageSize = 10,
  searchQuery = "",
  enabled = true,
} = {}) {
  const queryClient = useQueryClient();
  const [direction, setDirection] = useState("forward");
  
  // Normalize search query
  const normalizedSearch = useMemo(() => {
    return searchQuery ? normalizeCategoryName(searchQuery.trim()) : "";
  }, [searchQuery]);

  // Use React Query's infinite query for cursor-based pagination
  const {
    data,
    error,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.categories.paginated(normalizedSearch, pageSize),
    queryFn: ({ pageParam }) => {
      const cursor = pageParam?.cursor || null;
      const currentDirection = pageParam?.direction || "forward";
      
      return getCategoriesPaginatedApi({
        cursor,
        direction: currentDirection,
        limit: pageSize,
        search: normalizedSearch,
      });
    },
    initialPageParam: { cursor: null, direction: "forward" },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage && lastPage.nextCursor) {
        return {
          cursor: lastPage.nextCursor,
          direction: "forward",
        };
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.hasPrevPage && firstPage.prevCursor) {
        return {
          cursor: firstPage.prevCursor,
          direction: "backward",
        };
      }
      return undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Flatten pages to get all categories
  const categories = useMemo(() => {
    if (!data?.pages) return [];
    
    return data.pages.flatMap((page) => page.categories || []);
  }, [data?.pages]);

  // Get metadata from the first page
  const totalCategories = data?.pages?.[0]?.totalCategories || 0;
  const currentPageCategories = data?.pages?.[data.pages.length - 1]?.categories || [];

  // Navigation methods
  const goToNextPage = async () => {
    if (hasNextPage) {
      setDirection("forward");
      await fetchNextPage();
    }
  };

  const goToPreviousPage = async () => {
    if (hasPreviousPage) {
      setDirection("backward");
      await fetchPreviousPage();
    }
  };

  // Reset pagination when search changes
  const resetPagination = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.categories.paginated(normalizedSearch, pageSize),
    });
  };

  // Load more for infinite scroll (if needed)
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Helper methods
  const isEmpty = categories.length === 0 && !isLoading;
  const isLoadingMore = isFetchingNextPage || isFetchingPreviousPage;

  return {
    // Data
    categories,
    currentPageCategories,
    totalCategories,
    
    // Loading states
    isLoading,
    isFetching,
    isError,
    error,
    isEmpty,
    isLoadingMore,
    
    // Pagination state
    hasNextPage,
    hasPreviousPage,
    direction,
    
    // Methods
    goToNextPage,
    goToPreviousPage,
    loadMore,
    resetPagination,
    refetch,
    
    // React Query utilities
    fetchNextPage,
    fetchPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  };
}

/**
 * Simple hook for basic category pagination without infinite scroll.
 * Better for traditional page-by-page navigation.
 * 
 * @param {Object} options - Hook options
 * @param {number} [options.pageSize=10] - Number of items per page
 * @param {string} [options.searchQuery=""] - Search query for filtering categories
 * @param {boolean} [options.enabled=true] - Whether the query should be enabled
 * @returns {Object} Simple pagination state and methods
 */
export function useSimpleCategoryPagination({
  pageSize = 10,
  searchQuery = "",
  enabled = true,
} = {}) {
  const [currentCursor, setCurrentCursor] = useState(null);
  const [direction, setDirection] = useState("forward");
  const [pageHistory, setPageHistory] = useState([]);
  
  // Normalize search query
  const normalizedSearch = useMemo(() => {
    return searchQuery ? normalizeCategoryName(searchQuery.trim()) : "";
  }, [searchQuery]);

  const {
    data,
    error,
    isFetching,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...queryKeys.categories.paginated(normalizedSearch, pageSize), currentCursor, direction],
    queryFn: ({ pageParam }) => {
      const cursor = pageParam?.cursor || currentCursor;
      const queryDirection = pageParam?.direction || direction;
      
      return getCategoriesPaginatedApi({
        cursor,
        direction: queryDirection,
        limit: pageSize,
        search: normalizedSearch,
      });
    },
    initialPageParam: { cursor: currentCursor, direction },
    getNextPageParam: (lastPage) => {
      return lastPage?.hasNextPage ? { cursor: lastPage.nextCursor, direction: "forward" } : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage?.hasPrevPage ? { cursor: firstPage.prevCursor, direction: "backward" } : undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const currentPage = data?.pages?.[0];
  const categories = currentPage?.categories || [];
  const totalCategories = currentPage?.totalCategories || 0;
  const hasNextPage = currentPage?.hasNextPage || false;
  const hasPreviousPage = pageHistory.length > 0 || currentPage?.hasPrevPage || false;

  // Navigation methods
  const goToNextPage = () => {
    if (hasNextPage && currentPage?.nextCursor) {
      setPageHistory((prev) => [...prev, { cursor: currentCursor, direction }]);
      setCurrentCursor(currentPage.nextCursor);
      setDirection("forward");
    }
  };

  const goToPreviousPage = () => {
    if (pageHistory.length > 0) {
      const previousPage = pageHistory[pageHistory.length - 1];
      setCurrentCursor(previousPage.cursor);
      setDirection(previousPage.direction);
      setPageHistory((prev) => prev.slice(0, -1));
    } else if (currentPage?.prevCursor) {
      setCurrentCursor(currentPage.prevCursor);
      setDirection("backward");
    }
  };

  // Reset to first page
  const resetToFirstPage = () => {
    setCurrentCursor(null);
    setDirection("forward");
    setPageHistory([]);
  };

  const isEmpty = categories.length === 0 && !isLoading;

  return {
    // Data
    categories,
    totalCategories,
    
    // Loading states
    isLoading,
    isFetching,
    isError,
    error,
    isEmpty,
    
    // Pagination state
    hasNextPage,
    hasPreviousPage,
    currentPageNumber: pageHistory.length + 1,
    
    // Methods
    goToNextPage,
    goToPreviousPage,
    resetToFirstPage,
    refetch,
  };
}
