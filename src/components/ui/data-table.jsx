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
import { DataTableCursorPagination } from "@/components/ui/data-table-cursor-pagination";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { TableCellSkeleton } from "@/components/ui/table-cell-skeleton";
import { cn } from "@/lib/utils";

/**
 * Reusable data table component with TanStack Table v8.
 * @param {Object} props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Table data
 * @param {Object} [props.state] - External table state (sorting, columnFilters, pagination, rowSelection, columnVisibility)
 * @param {Function} [props.onStateChange] - State change handler object with callbacks for each state type
 * @param {boolean} [props.manualPagination] - Whether pagination is handled manually
 * @param {boolean} [props.manualSorting] - Whether sorting is handled manually
 * @param {boolean} [props.manualFiltering] - Whether filtering is handled manually
 * @param {number} [props.pageCount] - Total page count for manual pagination
 * @param {Object} [props.cursorPaginationState] - Cursor pagination state (alternative to pageCount)
 * @param {Function} [props.onCursorChange] - Cursor change handler for cursor pagination
 * @param {Function} [props.onPageSizeChange] - Page size change handler for cursor pagination
 * @param {number} [props.totalItems] - Total items count for cursor pagination display
 * @param {number} [props.filteredCount] - Filtered items count for cursor pagination display
 * @param {boolean} [props.useCursorPagination] - Whether to use cursor-based pagination instead of offset
 * @param {boolean} [props.showToolbar] - Whether to show the toolbar
 * @param {boolean} [props.isLoading] - Loading state for selective skeleton rendering
 * @param {React.ComponentType} [props.bulkActionsComponent] - Component to render when rows are selected
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
  cursorPaginationState,
  onCursorChange,
  onPageSizeChange,
  totalItems = 0,
  filteredCount,
  useCursorPagination = false,
  showToolbar = false,
  isLoading = false,
  bulkActionsComponent,
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

  // Merge external state with internal state, prioritizing external state when provided
  const mergedState = React.useMemo(() => {
    if (state) {
      return {
        sorting: state.sorting ?? sorting,
        columnVisibility: state.columnVisibility ?? columnVisibility,
        rowSelection: state.rowSelection ?? rowSelection,
        columnFilters: state.columnFilters ?? columnFilters,
        pagination: state.pagination ?? pagination,
      };
    }
    return {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    };
  }, [state, sorting, columnVisibility, rowSelection, columnFilters, pagination]);

  const table = useReactTable({
    data,
    columns,
    pageCount: manualPagination ? pageCount : undefined,
    state: mergedState,
enableRowSelection: true,
    onRowSelectionChange: onStateChange?.onRowSelectionChange || setRowSelection,
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
      {showToolbar && <DataTableToolbar table={table} bulkActionsComponent={bulkActionsComponent} />}
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
      {/* Conditional pagination rendering based on pagination type */}
      {useCursorPagination ? (
        <DataTableCursorPagination
          paginationState={cursorPaginationState}
          onCursorChange={onCursorChange}
          onPageSizeChange={onPageSizeChange}
          totalItems={totalItems}
          currentCount={data.length}
          filteredCount={filteredCount}
          isLoading={isLoading}
        />
      ) : (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
