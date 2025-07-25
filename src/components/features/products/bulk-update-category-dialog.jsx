// src/components/features/products/bulk-update-category-dialog.jsx

"use client";

import * as React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CategorySection from "@/components/features/categories/category-section";
import { useUpdateProduct } from "@/hooks/use-product-queries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Bulk update category dialog component.
 * Uses Dialog component for consistent UX with other modals and follows existing patterns.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onOpenChange - Handler for open state changes
 * @param {Array} props.selectedProducts - Array of selected product objects
 * @param {Function} props.onSuccess - Handler called after successful update (clears row selection)
 * @returns {JSX.Element}
 */
export function BulkUpdateCategoryDialog({
  open,
  onOpenChange,
  selectedProducts = [],
  onSuccess,
}) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("");
  
  const { mutateAsync: updateProductAsync } = useUpdateProduct();

  const selectedCount = selectedProducts.length;

  /**
   * Handles the bulk update process with proper error handling
   */
  const handleBulkUpdate = React.useCallback(async () => {
    if (!selectedCategoryId || selectedCount === 0) return;

    setIsUpdating(true);
    onOpenChange(false); // Close dialog immediately

    let successCount = 0;
    let failedProducts = [];

    // Show initial loading toast
    const toastId = toast.loading(
      `Updating category for ${selectedCount} product${selectedCount > 1 ? 's' : ''}...`
    );

    try {
      // Process updates sequentially to avoid overwhelming the server
      for (const product of selectedProducts) {
        try {
          await updateProductAsync({
            productId: product.id,
            productData: { categoryId: selectedCategoryId }
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to update product ${product.name}:`, error);
          failedProducts.push({
            name: product.name,
            error: error?.message || "Unknown error"
          });
        }
      }

      // Dismiss loading toast
      toast.dismiss(toastId);

      // For success message, we can use a generic name since we don't have direct access to category data
      const categoryName = "selected category";

      // Show results
      if (successCount === selectedCount) {
        // All updates successful
        toast.success(
          `Successfully updated ${successCount} product${successCount > 1 ? 's' : ''} to "${categoryName}"!`
        );
      } else if (successCount > 0) {
        // Partial success
        toast.success(
          `Successfully updated ${successCount} out of ${selectedCount} products to "${categoryName}".`
        );
        
        // Show error details for failed products
        const failedNames = failedProducts.slice(0, 3).map(p => p.name).join(", ");
        const remainingCount = failedProducts.length > 3 ? ` and ${failedProducts.length - 3} more` : "";
        
        toast.error(
          `Failed to update: ${failedNames}${remainingCount}`,
          {
            duration: 6000, // Longer duration for error messages
          }
        );
      } else {
        // All updates failed
        toast.error(
          `Failed to update ${failedProducts.length} product${failedProducts.length > 1 ? 's' : ''}.`
        );
      }

      // Call success handler to clear row selection
      if (successCount > 0 && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Unexpected error during the process
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred during bulk category update.");
      console.error("Bulk update error:", error);
    } finally {
      setIsUpdating(false);
      // Reset selected category for next use
      setSelectedCategoryId("");
    }
  }, [selectedCategoryId, selectedCount, selectedProducts, updateProductAsync, onOpenChange, onSuccess]);

  // Reset selected category when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedCategoryId("");
    }
  }, [open]);

  // Generate dialog content based on selection count
  const dialogTitle = `Update Category for ${selectedCount} Product${selectedCount > 1 ? 's' : ''}`;
  
  const dialogDescription = React.useMemo(() => {
    if (selectedCount === 0) {
      return "No products selected for category update.";
    } else if (selectedCount === 1) {
      return `Update the category for "${selectedProducts[0]?.name}".`;
    } else if (selectedCount <= 3) {
      const names = selectedProducts.map(p => `"${p.name}"`).join(", ");
      return `Update the category for ${names}.`;
    } else {
      const firstThree = selectedProducts.slice(0, 3).map(p => `"${p.name}"`).join(", ");
      return `Update the category for ${firstThree} and ${selectedCount - 3} other product${selectedCount - 3 > 1 ? 's' : ''}.`;
    }
  }, [selectedCount, selectedProducts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <CategorySection
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
            title="Target Category"
            showCreateForm={true}
            showTitle={true}
          />
        </div>
        
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkUpdate}
            disabled={
              isUpdating || 
              !selectedCategoryId || 
              selectedCount === 0
            }
            className={cn(
              isUpdating && "cursor-not-allowed"
            )}
          >
            {isUpdating ? "Updating..." : `Update ${selectedCount} Product${selectedCount > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
