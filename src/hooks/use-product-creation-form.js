import { useRef, useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "use-debounce";
import { productCreateSchema } from "@/lib/zod-schemas";
import { normalizeProductName } from "@/lib/utils";
import {
  useCreateProduct,
  useCheckProductName,
} from "@/hooks/use-product-queries";
import { toast } from "sonner";

/**
 * Encapsulates all form state and submission logic for ProductForm.
 * @param {{
 *   excludeId?: string
 * }} props
 */
export function useProductCreationForm({ excludeId } = {}) {
  // Default form values for reset
  const initialValues = {
    name: "",
    sellingPrice: "",
    purchasePrice: "",
    stock: "",
    unit: "",
    reorderPoint: "",
    categoryId: "",
    supplierId: "",
  };
  const nameInputRef = useRef(null);
  const { mutate } = useCreateProduct();

  // react-hook-form setup
  const form = useForm({
    resolver: zodResolver(productCreateSchema),
    defaultValues: initialValues,
  });
  const { control, handleSubmit, reset, watch, formState } = form;
  // Watch unit field to preserve user selection
  const unit = watch("unit");
  const [lastUnit, setLastUnit] = useState(initialValues.unit);
  useEffect(() => {
    setLastUnit(unit);
  }, [unit]);

  // Preserve last selected category
  const categoryId = watch("categoryId");
  const [lastCategory, setLastCategory] = useState(initialValues.categoryId);
  useEffect(() => {
    setLastCategory(categoryId);
  }, [categoryId]);

  // normalize & debounce name
  const rawName = watch("name");
  const normalized = normalizeProductName(rawName);
  const [debouncedName] = useDebounce(normalized, 500);

  // --- Only check for duplicates if user actually typed a name (dirty) and it's not empty ---
  const nameDirty = !!formState.dirtyFields?.name;
  const nameHasChanged = nameDirty && !!debouncedName;

  const {
    data: nameCheckResult,
    isFetching: isCheckingName,
    error: nameCheckError,
  } = useCheckProductName(debouncedName, {
    enabled: nameHasChanged,
    excludeId,
    // --- NEW: For creation form, use shorter staleTime for guaranteed accuracy ---
    staleTime: excludeId ? Infinity : 0,
  });

  const isNameDuplicate = Boolean(nameHasChanged && nameCheckResult?.exists);

  // --- Compute feedback flags for ProductNameField ---
  const showChecking = nameHasChanged && isCheckingName;
  const showDuplicate = nameHasChanged && !isCheckingName && isNameDuplicate;
  const showAvailable =
    nameHasChanged &&
    !isCheckingName &&
    !isNameDuplicate &&
    !nameCheckError &&
    !!rawName;
  const showError = nameHasChanged && !!nameCheckError;

  // auto-focus
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // submission handler
  const onSubmit = useCallback(
    (values) => {
      if (isNameDuplicate) {
        toast.error("Please choose a different product name.");
        return;
      }
      const optimisticId = `optimistic-${Date.now()}`;
      const processed = {
        ...values,
        name: debouncedName,
        sellingPrice: Number(values.sellingPrice),
        purchasePrice: Number(values.purchasePrice),
        stock: values.stock ? Number(values.stock) : undefined,
        unit: values.unit || undefined,
        reorderPoint: values.reorderPoint
          ? Number(values.reorderPoint)
          : undefined,
        categoryId: values.categoryId || undefined,
        supplierId: values.supplierId || undefined,
        optimisticId, // Include optimisticId in the data
      };

      // Reset form fields and preserve last selected unit and categoryId
      reset({ ...initialValues, unit: lastUnit, categoryId: lastCategory });
      setTimeout(() => nameInputRef.current?.focus(), 100);

      mutate(processed, {
        onSuccess: (product) => {
          toast.success("Product saved successfully!");
        },
        onError: (err) => {
          const msg = err.message.includes("already exists")
            ? "Product name already exists. Please choose a different name."
            : `Failed to save product: ${err.message}`;
          toast.error(msg);
        },
      });
    },
    [
      debouncedName,
      isNameDuplicate,
      mutate,
      reset,
      lastUnit,
      lastCategory,
    ]
  );

  // disable if duplicate, checking (fetching), or submitting
  const isSubmitDisabled =
    isNameDuplicate || isCheckingName || formState.isSubmitting;

  return {
    form,
    control,
    handleSubmit,
    onSubmit,
    nameInputRef,
    watch,
    isCheckingName: showChecking,
    isNameDuplicate: showDuplicate,
    nameCheckError: showError,
    showAvailable,
    isSubmitDisabled,
  };
}
