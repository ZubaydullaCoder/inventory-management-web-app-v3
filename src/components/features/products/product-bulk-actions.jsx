"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Tag, X } from "lucide-react";
import { BulkDeleteProductsDialog } from "./bulk-delete-products-dialog";
import { BulkUpdateCategoryDialog } from "./bulk-update-category-dialog";
import { cn } from "@/lib/utils";

/**
 * Product bulk actions toolbar component.
 * Appears when products are selected and provides bulk action buttons.
 * Integrates with the bulk delete and category update dialogs.
 *
 * @param {Object} props
 * @param {Array} props.selectedProducts - Array of selected product objects
 * @param {Function} props.onClearSelection - Handler to clear row selection
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element|null} - Returns null when no products are selected
 */
export function ProductBulkActions({
  selectedProducts = [],
  onClearSelection,
  className,
}) {
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [bulkUpdateCategoryOpen, setBulkUpdateCategoryOpen] = React.useState(false);

  const selectedCount = selectedProducts.length;

  // Don't render anything if no products are selected
  if (selectedCount === 0) {
    return null;
  }

  /**
   * Handles successful bulk operations by clearing selection
   */
  const handleBulkSuccess = React.useCallback(() => {
    if (onClearSelection) {
      onClearSelection();
    }
  }, [onClearSelection]);

  return (
    <>
      <div className={cn(
        "flex items-center justify-between rounded-md border bg-background p-2 shadow-sm",
        className
      )}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <span>{selectedCount}</span>
            <span className="text-muted-foreground">
              {selectedCount === 1 ? "product" : "products"} selected
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkUpdateCategoryOpen(true)}
              className="h-8"
            >
              <Tag className="mr-2 h-3.5 w-3.5" />
              Update Category
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>

      {/* Bulk Delete Dialog */}
      <BulkDeleteProductsDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        selectedProducts={selectedProducts}
        onSuccess={handleBulkSuccess}
      />

      {/* Bulk Update Category Dialog */}
      <BulkUpdateCategoryDialog
        open={bulkUpdateCategoryOpen}
        onOpenChange={setBulkUpdateCategoryOpen}
        selectedProducts={selectedProducts}
        onSuccess={handleBulkSuccess}
      />
    </>
  );
}
