"use client";

import * as React from "react";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useBulkDeleteProducts } from "@/hooks/use-product-queries";
import { toast } from "sonner";

/**
 * Bulk delete products dialog component.
 * Reuses the existing DeleteConfirmDialog component for consistency.
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onOpenChange - Handler for open state changes
 * @param {Array} props.selectedProducts - Array of selected product objects
 * @param {Function} props.onSuccess - Handler called after successful deletion (clears row selection)
 * @returns {JSX.Element}
 */
export function BulkDeleteProductsDialog({
  open,
  onOpenChange,
  selectedProducts = [],
  onSuccess,
}) {
  const { mutateAsync: bulkDeleteProducts, isPending: isDeleting } = useBulkDeleteProducts();

  const selectedCount = selectedProducts.length;

  /**
   * Handles the bulk deletion process with optimistic updates and proper error handling
   */
  const handleBulkDelete = React.useCallback(() => {
    if (selectedCount === 0) return;

    onOpenChange(false); // Close dialog immediately
    
    // Clear selection immediately since products will be optimistically removed
    if (onSuccess) {
      onSuccess();
    }

    // Extract product IDs for the bulk delete mutation
    const productIds = selectedProducts.map(product => product.id);
    const productNames = selectedProducts.reduce((acc, product) => {
      acc[product.id] = product.name;
      return acc;
    }, {});

    const deletePromise = bulkDeleteProducts(productIds);
    
    toast.promise(deletePromise, {
      loading: `Deleting ${selectedCount} product${selectedCount > 1 ? 's' : ''}...`,
      success: (data) => {
        const { successCount, failureCount, errors } = data;

        // Show results based on success/failure counts
        if (failureCount === 0) {
          // All deletions successful
          return `Successfully deleted ${successCount} product${successCount > 1 ? 's' : ''}!`;
        } else if (successCount > 0) {
          // Partial success
          const failedNames = errors.slice(0, 3).map(e => productNames[e.productId]).join(", ");
          const remainingCount = errors.length > 3 ? ` and ${errors.length - 3} more` : "";
          
          return `Successfully deleted ${successCount} out of ${selectedCount} products. Failed to delete: ${failedNames}${remainingCount}`;
        } else {
          // All deletions failed
          return `Failed to delete ${failureCount} product${failureCount > 1 ? 's' : ''}.`;
        }
      },
      error: "An unexpected error occurred during bulk deletion."
    });
  }, [selectedCount, selectedProducts, bulkDeleteProducts, onOpenChange, onSuccess]);

  // Generate dialog content based on selection count
  const dialogTitle = `Delete ${selectedCount} Product${selectedCount > 1 ? 's' : ''}`;
  
  const dialogDescription = React.useMemo(() => {
    if (selectedCount === 0) {
      return "No products selected for deletion.";
    } else if (selectedCount === 1) {
      return `Are you sure you want to delete "${selectedProducts[0]?.name}"? This action cannot be undone.`;
    } else if (selectedCount <= 3) {
      const names = selectedProducts.map(p => `"${p.name}"`).join(", ");
      return `Are you sure you want to delete ${names}? This action cannot be undone.`;
    } else {
      const firstThree = selectedProducts.slice(0, 3).map(p => `"${p.name}"`).join(", ");
      return `Are you sure you want to delete ${firstThree} and ${selectedCount - 3} other product${selectedCount - 3 > 1 ? 's' : ''}? This action cannot be undone.`;
    }
  }, [selectedCount, selectedProducts]);

  return (
    <DeleteConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleBulkDelete}
      title={dialogTitle}
      description={dialogDescription}
      confirmText={selectedCount > 1 ? `Delete ${selectedCount} Products` : "Delete Product"}
      isPending={isDeleting}
    />
  );
}
