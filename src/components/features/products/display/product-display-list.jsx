"use client";

import * as React from "react";
import ProductTableContainer from "./product-table-container";
import { useGetProductsCursor } from "@/hooks/use-product-queries";
import { useTableCursorUrlState } from "@/hooks/use-table-cursor-url-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * ProductDisplayList - Component for product data presentation using cursor pagination.
 *
 * Primary Responsibilities:
 * 1. Manages error boundaries and error display
 * 2. Orchestrates data fetching using cursor pagination
 * 3. Manages row selection state locally
 * 4. Delegates all rendering concerns to ProductTableContainer
 *
 * @param {Object} props
 * @param {Array} [props.initialData=[]] - Initial product data from server-side rendering
 * @param {number} [props.initialLimit=10] - Number of items per page
 */
export default function ProductDisplayList({
  initialData = [],
  initialLimit = 10,
}) {
  // CONFIGURATION: Set up initial configuration for cursor pagination
  const paginationConfig = {
    cursor: null,
    direction: "forward",
    limit: initialLimit,
    sortBy: "createdAt",
    sortOrder: "desc",
    nameFilter: "",
    categoryFilter: "",
  };

  // STATE MANAGEMENT: Initialize URL-driven state and handlers
  const {
    tableState,
    apiParams,
    handleCursorChange,
    handleSortingChange,
    handleColumnFiltersChange,
    handlePageSizeChange,
    isFiltered,
  } = useTableCursorUrlState(paginationConfig);

  const [rowSelection, setRowSelection] = React.useState({});

  // DATA FETCHING: Use cursor-based data fetching
  const { data: productsData, isLoading, error } = useGetProductsCursor(apiParams);

  // DATA PREPARATION: Prepare data with fallbacks for rendering
  const products = productsData?.products || (isLoading ? [] : initialData);
  const totalProducts = productsData?.totalProducts || initialData.length;
  const filteredCount = productsData?.filteredCount;

  // METADATA ASSEMBLY: Build cursor pagination metadata
  const paginationMetadata = {
    prevCursor: productsData?.prevCursor || null,
    nextCursor: productsData?.nextCursor || null,
    hasPrevPage: productsData?.hasPrevPage || false,
    hasNextPage: productsData?.hasNextPage || false,
    currentPageSize: apiParams.limit,
  };

  // ERROR BOUNDARY: Handle and display errors appropriately
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load products: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // DELEGATION: Pass all prepared data and handlers to ProductTableContainer
  // This component has fulfilled its strategic responsibilities:
  // - Selected pagination strategy
  // - Fetched data using appropriate hooks
  // - Handled errors
  // Now delegate all presentation concerns to ProductTableContainer
  return (
    <ProductTableContainer
      products={products}
      tableState={{
        ...tableState,
        rowSelection,
      }}
      handleStateChange={{
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: handleColumnFiltersChange,
        onRowSelectionChange: setRowSelection,
      }}
      paginationMetadata={paginationMetadata}
      useCursorPagination={true}
      handleCursorChange={handleCursorChange}
      handlePageSizeChange={handlePageSizeChange}
      totalProducts={totalProducts}
      filteredCount={filteredCount}
      isLoading={isLoading}
      skeletonRowCount={apiParams.limit || 10}
    />
  );
}
