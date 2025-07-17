"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { cn } from "@/lib/utils";

/**
 * Reusable data table component with TanStack Table v8.
 * @param {Object} props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Table data
 * @param {Object} [props.state] - External table state
 * @param {Function} [props.onStateChange] - State change handler
 * @param {boolean} [props.manualPagination] - Whether pagination is handled manually
 * @param {boolean} [props.manualSorting] - Whether sorting is handled manually
 * @param {boolean} [props.manualFiltering] - Whether filtering is handled manually
 * @param {number} [props.pageCount] - Total page count for manual pagination
 * @param {boolean} [props.showToolbar] - Whether to show the toolbar
 * @param {boolean} [props.isLoading] - Loading state for selective skeleton rendering
 * @param {string} [props.className] - Additional CSS classes
 */
export function DataTable({
  columns,
  data,
  state,
  onStateChange,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  pageCount = -1,
  showToolbar = false,
  isLoading = false,
  className,
  ...props
}) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    pageCount: manualPagination ? pageCount : undefined,
    state: state || {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: onStateChange?.onSortingChange || setSorting,
    onColumnFiltersChange:
      onStateChange?.onColumnFiltersChange || setColumnFilters,
    onColumnVisibilityChange:
      onStateChange?.onColumnVisibilityChange || setColumnVisibility,
    onPaginationChange: onStateChange?.onPaginationChange || setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination,
    manualSorting,
    manualFiltering,
  });

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {showToolbar && <DataTableToolbar table={table} />}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {/* Show skeleton for loading data, normal content otherwise */}
                      {isLoading && row.original.isLoading ? (
                        <TableCellSkeleton columnId={cell.column.id} />
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

/**
 * Skeleton component for individual table cells based on column type.
 * @param {Object} props
 * @param {string} props.columnId - The column ID to determine skeleton style
 */
function TableCellSkeleton({ columnId }) {
  // Different skeleton widths based on typical column content
  const skeletonStyles = {
    name: "h-4 w-[120px]", // Product names are typically longer
    sellingPrice: "h-4 w-[60px]", // Prices are shorter
    purchasePrice: "h-4 w-[60px]",
    stock: "h-4 w-[40px]", // Stock numbers are short
    unit: "h-4 w-[50px]", // Units are short
    category: "h-4 w-[80px]", // Category names are medium
    supplier: "h-4 w-[80px]", // Supplier names are medium
    actions: "h-4 w-[80px]", // Action buttons are consistent
    default: "h-4 w-[60px]", // Default fallback
  };

  const skeletonClass = skeletonStyles[columnId] || skeletonStyles.default;

  return (
    <div className="animate-pulse">
      <div className={cn("bg-muted rounded", skeletonClass)} />
    </div>
  );
}
