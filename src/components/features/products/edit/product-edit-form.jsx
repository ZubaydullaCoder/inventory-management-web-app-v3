"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ProductFormFields from "../product-form-fields";

export default function ProductEditForm({
  form,
  control,
  handleSubmit,
  onSubmit,
  onClose,
  showChecking,
  showDuplicate,
  showAvailable,
  showError,
  isSubmitDisabled,
  formState,
}) {
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <ProductFormFields
          form={form}
          control={control}
          nameInputRef={null}
          isCheckingName={showChecking}
          isNameDuplicate={showDuplicate}
          nameCheckError={showError}
          showAvailable={showAvailable}
          isEdit={true}
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
          <Button type="submit" className="flex-1" disabled={isSubmitDisabled}>
            {formState.isSubmitting && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Update Product
          </Button>
        </div>
      </form>
    </Form>
  );
}
