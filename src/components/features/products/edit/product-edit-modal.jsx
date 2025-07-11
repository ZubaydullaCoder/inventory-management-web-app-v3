"use client";

import { useProductEditForm } from "@/hooks/use-product-edit-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ProductNameField from "../creation/product-name-field";
import NumberField from "../number-field";
import UnitSelectField from "../unit-select-field";
import CategoryCreatableSelect from "../category-creatable-select";

/**
 * Modal component for editing an existing product.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.product - The product to edit
 * @param {Function} props.onSuccess - Callback function called when update succeeds
 * @returns {JSX.Element} The edit product modal component
 */
export default function ProductEditModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}) {
  const {
    form,
    control,
    handleSubmit,
    onSubmit,
    showChecking,
    showDuplicate,
    showAvailable,
    showError,
    isSubmitDisabled,
    formState,
  } = useProductEditForm({ product, isOpen, onSuccess, onClose });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ProductNameField
              control={control}
              nameInputRef={null}
              isCheckingName={showChecking}
              isNameDuplicate={showDuplicate}
              nameCheckError={showError}
              showAvailable={showAvailable}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberField
                control={control}
                name="sellingPrice"
                label="Selling Price"
                placeholder="0.00"
                step="0.01"
                required
              />
              <NumberField
                control={control}
                name="purchasePrice"
                label="Purchase Price"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberField
                control={control}
                name="stock"
                label="Current Stock"
                placeholder="0"
              />
              <NumberField
                control={control}
                name="reorderPoint"
                label="Reorder Point"
                placeholder="0"
              />
            </div>

            <UnitSelectField
              control={control}
              name="unit"
              label="Unit of Measure"
            />

            <CategoryCreatableSelect
              control={control}
              name="categoryId"
              label="Category"
            />

            <FormField
              control={control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitDisabled}
              >
                {formState.isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Update Product
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
