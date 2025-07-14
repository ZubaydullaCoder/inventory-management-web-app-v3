"use client";

import * as React from "react";
import { MoreHorizontal, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import ProductEditModal from "@/components/features/products/edit/product-edit-modal";
import { NumericFormat } from "react-number-format";

/**
 * Actions cell component for the products table.
 * @param {Object} props
 * @param {Object} props.product - The product data
 */
function ProductActionsCell({ product }) {
  const [showEditModal, setShowEditModal] = React.useState(false);

  const handleCopyId = React.useCallback(() => {
    navigator.clipboard.writeText(product.id);
    // You could add a toast notification here
  }, [product.id]);

  const handleEdit = React.useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleEditSuccess = React.useCallback(() => {
    setShowEditModal(false);
    // The table will automatically update via TanStack Query cache invalidation
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="mr-2 h-4 w-4" />
            Copy product ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        product={product}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}

/**
 * Column definitions for the products table.
 * @returns {Array} Array of column definitions for TanStack Table
 */
export const productColumns = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name");
      return <div className="font-medium">{name}</div>;
    },
    enableSorting: true,
    enableHiding: false,
    filterFn: "includesString", // Enable text filtering for product names
  },
  {
    accessorKey: "category.name",
    id: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <div className="text-muted-foreground">
          {category?.name || "Uncategorized"}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.category?.name || "";
      const b = rowB.original.category?.name || "";
      return a.localeCompare(b);
    },
  },
  {
    accessorKey: "sellingPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      // Use the value directly, do NOT divide by 100
      const price = row.getValue("sellingPrice");
      return (
        <div className="font-medium">
          <NumericFormat
            value={price}
            displayType="text"
            thousandSeparator=" "
            decimalScale={0}
            suffix=" so'm"
          />
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue("stock");
      const unit = row.original.unit;

      return (
        <div className="text-muted-foreground">
          {stock}{" "}
          {unit && (
            <span className="text-muted-foreground text-sm">{unit}</span>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "purchasePrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cost" />
    ),
    cell: ({ row }) => {
      // Use the value directly, do NOT divide by 100
      const cost = row.getValue("purchasePrice");
      return (
        <div className="text-muted-foreground">
          <NumericFormat
            value={cost}
            displayType="text"
            thousandSeparator=" "
            decimalScale={0}
            suffix=" so'm"
          />
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt");
      const formatted = new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return <div className="text-muted-foreground text-sm">{formatted}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
      return <ProductActionsCell product={product} />;
    },
  },
];
