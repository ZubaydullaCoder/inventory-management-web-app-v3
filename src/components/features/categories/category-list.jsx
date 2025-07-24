"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import CategoryItem from "./category-item";
import { useGetCategories } from "@/hooks/use-category-queries";
import { useSimpleCategoryPagination } from "@/hooks/use-category-pagination";
import { normalizeCategoryName } from "@/lib/utils";

/**
 * List component for displaying paginated categories with search filtering
 * @param {Object} props
 * @param {string} [props.searchQuery] - Search filter query
 * @param {string} [props.selectedCategoryId] - Currently selected category ID
 * @param {function} [props.onCategorySelect] - Callback when category is selected
 * @param {number} [props.pageSize] - Number of items per page (for future pagination)
 */
export default function CategoryList({
  searchQuery = "",
  selectedCategoryId,
  onCategorySelect,
  pageSize = 10,
  usePagination = true, // New prop to enable/disable pagination
}) {
  // Use paginated categories when enabled, fallback to regular fetch
  const paginationResult = useSimpleCategoryPagination({
    pageSize,
    searchQuery,
    enabled: usePagination,
  });

  const fallbackResult = useGetCategories();
  
  // Choose which data source to use
  const {
    categories: paginatedCategories,
    totalCategories,
    isLoading: isPaginationLoading,
    isError: isPaginationError,
    error: paginationError,
    isEmpty: isPaginationEmpty,
    hasNextPage,
    hasPreviousPage,
    currentPageNumber,
    goToNextPage,
    goToPreviousPage,
  } = paginationResult;

  // Fallback to non-paginated when pagination is disabled
  const fallbackCategories = useMemo(() => {
    if (usePagination || !fallbackResult.data) return [];
    
    if (!searchQuery.trim()) {
      return fallbackResult.data;
    }

    const normalizedQuery = normalizeCategoryName(searchQuery);
    return fallbackResult.data.filter((category) =>
      normalizeCategoryName(category.name).includes(normalizedQuery)
    );
  }, [fallbackResult.data, searchQuery, usePagination]);

  // Use appropriate data source
  const categories = usePagination ? paginatedCategories : fallbackCategories.slice(0, pageSize);
  const isLoading = usePagination ? isPaginationLoading : fallbackResult.isLoading;
  const error = usePagination ? paginationError : fallbackResult.error;
  const isEmpty = usePagination ? isPaginationEmpty : categories.length === 0;
  const hasMore = usePagination ? hasNextPage : fallbackCategories.length > pageSize;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-destructive">
          Failed to load categories. Please try again.
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-sm text-muted-foreground mb-2">
          No categories yet
        </div>
        <div className="text-xs text-muted-foreground">
          Create your first category to get started
        </div>
      </div>
    );
  }

  if (isEmpty && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-sm text-muted-foreground mb-2">
          No categories found for "{searchQuery}"
        </div>
        <div className="text-xs text-muted-foreground">
          Try a different search term or create a new category
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="h-[300px] w-full overflow-y-auto">
        <div className="space-y-2 pr-4">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              selectedCategoryId={selectedCategoryId}
              onSelect={onCategorySelect}
              isSelectable={!!onCategorySelect}
            />
          ))}
        </div>
      </div>

      {/* Pagination Controls */}
      {usePagination && (hasNextPage || hasPreviousPage) && (
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={!hasPreviousPage}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-xs text-muted-foreground">
            Page {currentPageNumber}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={!hasNextPage}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Fallback Load More for non-paginated */}
      {!usePagination && hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("Load more categories - fallback mode");
            }}
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            Load More ({fallbackCategories.length - pageSize} remaining)
          </Button>
        </div>
      )}

      {/* Show total count */}
      <div className="text-xs text-muted-foreground text-center">
        {usePagination ? (
          <>
            Showing {categories.length} of {totalCategories} categories
            {searchQuery && ` matching "${searchQuery}"`}
          </>
        ) : (
          <>
            Showing {categories.length} of {fallbackCategories.length} categories
            {searchQuery && ` matching "${searchQuery}"`}
          </>
        )}
      </div>
    </div>
  );
}
