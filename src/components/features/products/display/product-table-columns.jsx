"use client";

import * as React from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useDeleteProduct } from "@/hooks/use-product-queries";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

/**
 * Actions cell component for the products table.
 * @param {Object} props
 * @param {Object} props.product - The product data
 */
function ProductActionsCell({ product }) {
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { mutateAsync: deleteProductAsync, isPending: isDeleting } =
    useDeleteProduct();

  const handleEdit = React.useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleEditSuccess = React.useCallback(() => {
    setShowEditModal(false);
    // The table will automatically update via TanStack Query cache invalidation
  }, []);

  const handleDelete = React.useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(() => {
    setShowDeleteDialog(false);

    const deletePromise = deleteProductAsync(product.id);

    toast.promise(deletePromise, {
      loading: "Deleting product...",
      success: "Product deleted successfully!",
      error: (err) => {
        console.error("Delete error:", err);
        return err?.message || "Failed to delete product";
      },
    });
  }, [deleteProductAsync, product.id]);

  // Skip actions for skeleton rows
  if (product.isLoading) {
    return <div className="h-8 w-8" />;
  }

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
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit product
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        product={product}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        isPending={isDeleting}
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
    id: "select",
    header: ({ table }) => {
      const isAllSelected = table.getIsAllPageRowsSelected();
      const isIndeterminate = table.getIsSomePageRowsSelected() && !isAllSelected;
      
      return (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
        />
      );
    },
    cell: ({ row }) => {
      // Skip checkboxes for skeleton rows during loading
      if (row.original.isLoading) {
        return <div className="h-4 w-4" />;
      }
      
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name");
      return <div className="font-medium text-primary">{name}</div>;
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
    enableColumnFilter: true, // Enable filtering for this column
    filterFn: (row, id, value) => {
      // Custom filter function for category filtering
      if (!value || value.length === 0) return true;
      const categoryName = row.original.category?.name || "";
      return value.includes(categoryName);
    },
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
        <div className="text-muted-foreground">
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
