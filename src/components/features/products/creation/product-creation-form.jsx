"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ProductFormFields from "../product-form-fields";
import { useProductCreationForm } from "@/hooks/use-product-creation-form";

/**
 * Renders product form UI only. All logic lives in `useProductForm`.
 */
export default function ProductCreationForm() {
  const {
    form,
    control,
    handleSubmit,
    onSubmit,
    nameInputRef,
    isCheckingName,
    isNameDuplicate,
    nameCheckError,
    showAvailable,
    isSubmitDisabled,
  } = useProductCreationForm();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <ProductFormFields
          form={form}
          control={control}
          nameInputRef={nameInputRef}
          isCheckingName={isCheckingName}
          isNameDuplicate={isNameDuplicate}
          nameCheckError={nameCheckError}
          showAvailable={showAvailable}
          isEdit={false}
        />

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            Save and Add Another
          </Button>
        </div>
      </form>
    </Form>
  );
}
