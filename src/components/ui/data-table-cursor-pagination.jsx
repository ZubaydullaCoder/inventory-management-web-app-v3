"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Cursor-based pagination controls for data tables.
 * Provides Previous/Next navigation instead of page numbers for better performance.
 *
 * @param {Object} props
 * @param {Object} props.paginationState - Current pagination state with cursor info
 * @param {string|null} props.paginationState.prevCursor - Cursor for previous page
 * @param {string|null} props.paginationState.nextCursor - Cursor for next page
 * @param {boolean} props.paginationState.hasPrevPage - Whether previous page exists
 * @param {boolean} props.paginationState.hasNextPage - Whether next page exists
 * @param {number} props.paginationState.currentPageSize - Current page size
 * @param {Function} props.onCursorChange - Callback for cursor navigation
 * @param {Function} props.onPageSizeChange - Callback for page size changes
 * @param {number} props.totalItems - Total number of items (unfiltered)
 * @param {number} props.currentCount - Current page item count
 * @param {number} [props.filteredCount] - Total filtered items count (when filters are applied)
 * @param {boolean} [props.isLoading] - Whether data is being loaded
 * @param {number[]} [props.pageSizeOptions] - Available page size options
 * @param {string} [props.className] - Additional CSS classes
 */
export function DataTableCursorPagination({
  paginationState,
  onCursorChange,
  onPageSizeChange,
  totalItems = 0,
  currentCount = 0,
  filteredCount,
  isLoading = false,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  ...props
}) {
  const { prevCursor, nextCursor, hasPrevPage, hasNextPage, currentPageSize } =
    paginationState || {};

  const handlePrevious = React.useCallback(() => {
    if (hasPrevPage && prevCursor) {
      onCursorChange(prevCursor, "backward");
    }
  }, [hasPrevPage, prevCursor, onCursorChange]);

  const handleNext = React.useCallback(() => {
    if (hasNextPage && nextCursor) {
      onCursorChange(nextCursor, "forward");
    }
  }, [hasNextPage, nextCursor, onCursorChange]);

  const handlePageSizeChange = React.useCallback(
    (value) => {
      onPageSizeChange(Number(value));
    },
    [onPageSizeChange]
  );

  // Show loading state in pagination info
  const displayInfo = React.useMemo(() => {
    if (isLoading) {
      return "Loading...";
    }

    if (totalItems === 0) {
      return "No items found";
    }

    if (currentCount === 0) {
      return `0 of ${totalItems.toLocaleString()} items`;
    }

    // Use the total unfiltered count for the display (what the user wants)
    // Show "showing X of Y items" where Y is always the total unfiltered count
    return `Showing ${currentCount.toLocaleString()} of ${totalItems.toLocaleString()} items`;
  }, [isLoading, totalItems, currentCount]);

  return (
    <div
      className={cn("flex items-center justify-between px-2", className)}
      {...props}
    >
      {/* Info section */}
      <div className="flex-1 text-sm text-muted-foreground">{displayInfo}</div>

      {/* Controls section */}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Items per page</p>
          <Select
            value={`${currentPageSize || 10}`}
            onValueChange={handlePageSizeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={currentPageSize || 10} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation section */}
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePrevious}
            disabled={!hasPrevPage || isLoading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Navigation status */}
          <div className="flex w-[120px] items-center justify-center text-sm font-medium">
            {isLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              <span>
                {!hasPrevPage && !hasNextPage
                  ? "Single page"
                  : `${hasPrevPage ? "← " : ""}Page${hasNextPage ? " →" : ""}`}
              </span>
            )}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNext}
            disabled={!hasNextPage || isLoading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
