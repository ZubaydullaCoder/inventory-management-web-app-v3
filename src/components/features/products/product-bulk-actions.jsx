"use client";

import * as React from "react";
import { Trash2, Tag } from "lucide-react";
import { BulkDeleteProductsDialog } from "./bulk-delete-products-dialog";
import { BulkUpdateCategoryDialog } from "./bulk-update-category-dialog";
import { ProductBottomActionBar, ProductBottomActionBarAction } from "@/components/ui/product-bottom-action-bar";

/**
 * Product bulk actions component for bottom action bar.
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

  /**
   * Handles successful bulk operations by clearing selection
   * NOTE: This hook must be called before any conditional returns
   */
  const handleBulkSuccess = React.useCallback(() => {
    if (onClearSelection) {
      onClearSelection();
    }
  }, [onClearSelection]);

  const selectedCount = selectedProducts.length;

  // Don't render anything if no products are selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <ProductBottomActionBar
        selectedProducts={selectedProducts}
        onClearSelection={onClearSelection}
        className={className}
      >
        <ProductBottomActionBarAction
          onClick={() => setBulkDeleteOpen(true)}
          variant="outline"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Delete selected products"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </ProductBottomActionBarAction>

        <ProductBottomActionBarAction
          onClick={() => setBulkUpdateCategoryOpen(true)}
          variant="outline"
          title="Update category for selected products"
        >
          <Tag className="h-3.5 w-3.5" />
          Update Category
        </ProductBottomActionBarAction>
      </ProductBottomActionBar>

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
