import { useRef, useEffect, useCallback } from "react";
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
 *   onOptimisticAdd: Function,
 *   onSuccess: Function,
 *   onError: Function
 * }} props
 */
export function useProductCreationForm({
  onOptimisticAdd,
  onSuccess,
  onError,
  excludeId,
}) {
  const nameInputRef = useRef(null);
  const { mutate } = useCreateProduct();

  // react-hook-form setup
  const form = useForm({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      sellingPrice: "",
      purchasePrice: "",
      stock: "",
      reorderPoint: "",
      categoryId: "",
      supplierId: "",
    },
  });
  const { control, handleSubmit, reset, watch, formState } = form;

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
        reorderPoint: values.reorderPoint
          ? Number(values.reorderPoint)
          : undefined,
        categoryId: values.categoryId || undefined,
        supplierId: values.supplierId || undefined,
      };

      onOptimisticAdd({
        optimisticId,
        data: { ...processed, id: optimisticId },
        status: "pending",
      });
      reset();
      setTimeout(() => nameInputRef.current?.focus(), 100);

      mutate(processed, {
        onSuccess: (product) => {
          onSuccess({ data: product, optimisticId });
          toast.success("Product saved successfully!");
        },
        onError: (err) => {
          onError(optimisticId);
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
      onOptimisticAdd,
      onSuccess,
      onError,
      reset,
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
