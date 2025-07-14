"use client";

import { useProductEditForm } from "@/hooks/use-product-edit-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductEditForm from "./product-edit-form";

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
        <ProductEditForm
          form={form}
          control={control}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          onClose={onClose}
          showChecking={showChecking}
          showDuplicate={showDuplicate}
          showAvailable={showAvailable}
          showError={showError}
          isSubmitDisabled={isSubmitDisabled}
          formState={formState}
        />
      </DialogContent>
    </Dialog>
  );
}
