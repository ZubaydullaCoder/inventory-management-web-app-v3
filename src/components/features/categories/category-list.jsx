"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import CategoryItem from "./category-item";
import SelectedCategoryBar from "./selected-category-bar";
import {
  useGetCategories,
  useGetCategoryById,
} from "@/hooks/use-category-queries";
import { useSimpleCategoryPagination } from "@/hooks/use-category-pagination";
import { normalizeCategoryName } from "@/lib/utils";
import { sortCategoriesWithSelectedFirst } from "@/lib/category-utils";

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

  // Fetch selected category separately to ensure it's always available
  const { data: selectedCategoryData } = useGetCategoryById(
    selectedCategoryId,
    {
      enabled: !!selectedCategoryId,
    }
  );

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
  const rawCategories = usePagination
    ? paginatedCategories
    : fallbackCategories.slice(0, pageSize);
  const isLoading = usePagination
    ? isPaginationLoading
    : fallbackResult.isLoading;
  const error = usePagination ? paginationError : fallbackResult.error;
  const isEmpty = usePagination
    ? isPaginationEmpty
    : rawCategories.length === 0;
  const hasMore = usePagination
    ? hasNextPage
    : fallbackCategories.length > pageSize;

  // Sort categories with selected first for enhanced UX
  // Always use separately fetched selected category to ensure persistence across pagination
  const { selectedCategory, otherCategories, hasSelected } = useMemo(() => {
    // If we have selectedCategoryData, use it as the selected category
    // This ensures the selected category persists even when not in current page
    if (selectedCategoryData) {
      const otherCats = rawCategories.filter(
        (cat) => cat.id !== selectedCategoryId
      );
      return {
        selectedCategory: selectedCategoryData,
        otherCategories: otherCats,
        hasSelected: true,
      };
    }

    // Fallback to the existing logic if no selectedCategoryData
    return sortCategoriesWithSelectedFirst(rawCategories, selectedCategoryId);
  }, [rawCategories, selectedCategoryId, selectedCategoryData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">
          Loading categories...
        </div>
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

  if (rawCategories.length === 0 && !selectedCategoryData) {
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
    <div>
      {hasSelected && (
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted-foreground/20" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">
              Selected Category
            </span>
          </div>
        </div>
      )}
      {/* Selected Category Bar - Fixed at top */}
      <SelectedCategoryBar
        selectedCategory={selectedCategory}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={onCategorySelect}
      />

      {/* Separator between selected and other categories */}

      <div className="relative py-2 mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            {hasSelected ? "Other Categories" : "Categories"}
          </span>
        </div>
      </div>

      {/* Scrollable list of other categories */}
      <div className="h-[350px] w-full overflow-y-auto">
        <div className="space-y-2 pr-4">
          {/* Other Categories */}
          {otherCategories.map((category) => (
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
            Showing {rawCategories.length} of {totalCategories} categories
            {searchQuery && ` matching "${searchQuery}"`}
          </>
        ) : (
          <>
            Showing {rawCategories.length} of {fallbackCategories.length}{" "}
            categories
            {searchQuery && ` matching "${searchQuery}"`}
          </>
        )}
      </div>
    </div>
  );
}
