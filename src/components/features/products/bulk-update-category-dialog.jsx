// src/components/features/products/bulk-update-category-dialog.jsx

"use client";

import * as React from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useGetCategories } from "@/hooks/use-category-queries";
import { useUpdateProduct } from "@/hooks/use-product-queries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Bulk update category dialog component.
 * Uses Sheet component for consistent UX and follows existing patterns.
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
  
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategories();
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

      // Find selected category name for success message
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      const categoryName = selectedCategory?.name || "selected category";

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
  }, [selectedCategoryId, selectedCount, selectedProducts, updateProductAsync, onOpenChange, onSuccess, categories]);

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{dialogTitle}</SheetTitle>
          <SheetDescription>{dialogDescription}</SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category-select">Target Category</Label>
            <Select 
              value={selectedCategoryId} 
              onValueChange={setSelectedCategoryId}
              disabled={categoriesLoading || isUpdating}
            >
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <SheetFooter className="flex flex-row justify-end gap-2">
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
              categoriesLoading || 
              selectedCount === 0
            }
            className={cn(
              isUpdating && "cursor-not-allowed"
            )}
          >
            {isUpdating ? "Updating..." : `Update ${selectedCount} Product${selectedCount > 1 ? 's' : ''}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
