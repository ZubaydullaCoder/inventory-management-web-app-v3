"use client";

import * as React from "react";
import ProductTableContainer from "./product-table-container";
import {
  useGetProducts,
  useGetProductsCursor,
} from "@/hooks/use-product-queries";
import { useTableUrlState } from "@/hooks/use-table-url-state";
import { useTableCursorUrlState } from "@/hooks/use-table-cursor-url-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * ProductDisplayList - Strategic component for product data presentation.
 *
 * Primary Responsibilities:
 * 1. Selects and configures the appropriate pagination strategy (cursor vs offset)
 * 2. Manages error boundaries and error display
 * 3. Orchestrates data fetching based on the selected strategy
 * 4. Delegates all rendering concerns to ProductTableContainer
 *
 * This component acts as the strategic layer, making decisions about HOW to fetch
 * and paginate data, while ProductTableContainer handles the presentation layer.
 *
 * @param {Object} props
 * @param {Array} [props.initialData=[]] - Initial product data from server-side rendering
 * @param {number} [props.initialPage=1] - Initial page number for offset pagination
 * @param {number} [props.initialLimit=10] - Number of items per page
 * @param {boolean} [props.useCursorPagination=true] - Strategy selector: true for cursor pagination (recommended), false for offset
 */
export default function ProductDisplayList({
  initialData = [],
  initialPage = 1,
  initialLimit = 10,
  useCursorPagination = true,
}) {
  // STRATEGY SELECTION: Choose the appropriate pagination hook based on strategy
  const paginationHook = useCursorPagination
    ? useTableCursorUrlState
    : useTableUrlState;

  // CONFIGURATION: Set up initial configuration based on selected strategy
  const paginationConfig = useCursorPagination
    ? {
        cursor: null,
        direction: "forward",
        limit: initialLimit,
        sortBy: "createdAt",
        sortOrder: "desc",
        nameFilter: "",
        categoryFilter: "",
      }
    : {
        page: initialPage,
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
    handlePaginationChange,
    handleSortingChange,
    handleColumnFiltersChange,
    handlePageSizeChange,
    validatePage,
    isFiltered,
  } = paginationHook(paginationConfig);

  // DATA FETCHING: Select appropriate data hook based on pagination strategy
  const dataHook = useCursorPagination ? useGetProductsCursor : useGetProducts;
  const { data: productsData, isLoading, error } = dataHook(apiParams);

  // DATA PREPARATION: Prepare data with fallbacks for rendering
  const products = productsData?.products || (isLoading ? [] : initialData);
  const totalProducts = productsData?.totalProducts || initialData.length;

  // METADATA ASSEMBLY: Build pagination metadata based on strategy
  const paginationMetadata = useCursorPagination
    ? {
        // Cursor-based metadata for efficient pagination
        prevCursor: productsData?.prevCursor || null,
        nextCursor: productsData?.nextCursor || null,
        hasPrevPage: productsData?.hasPrevPage || false,
        hasNextPage: productsData?.hasNextPage || false,
        currentPageSize: apiParams.limit,
      }
    : {
        // Offset-based metadata for traditional pagination
        pageCount: Math.ceil(totalProducts / tableState.pagination.pageSize),
      };

  // PAGE VALIDATION: Ensure current page is valid (offset pagination only)
  React.useEffect(() => {
    if (
      !useCursorPagination &&
      productsData &&
      paginationMetadata.pageCount > 0
    ) {
      validatePage(paginationMetadata.pageCount);
    }
  }, [
    useCursorPagination,
    productsData,
    paginationMetadata.pageCount,
    validatePage,
  ]);

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
      tableState={tableState}
      handleStateChange={{
        onPaginationChange: useCursorPagination
          ? undefined
          : handlePaginationChange,
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: handleColumnFiltersChange,
      }}
      paginationMetadata={paginationMetadata}
      useCursorPagination={useCursorPagination}
      handleCursorChange={handleCursorChange}
      handlePageSizeChange={handlePageSizeChange}
      totalProducts={totalProducts}
      isLoading={isLoading}
      skeletonRowCount={
        apiParams.limit || tableState.pagination?.pageSize || 10
      }
    />
  );
}
