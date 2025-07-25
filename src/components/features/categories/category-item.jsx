"use client";

import { useState } from "react";
import { Edit, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CategoryCreateEditModal from "./category-create-edit-modal";
import { useDeleteCategory } from "@/hooks/use-category-queries";
import { toast } from "sonner";

/**
 * Individual category item component with selection, edit, and delete functionality
 * @param {Object} props
 * @param {Object} props.category - The category object
 * @param {number} [props.category.productCount] - Number of products in this category
 * @param {string} [props.selectedCategoryId] - Currently selected category ID
 * @param {function} [props.onSelect] - Callback when category is selected
 * @param {boolean} [props.isSelectable] - Whether the category can be selected
 */
export default function CategoryItem({
  category,
  selectedCategoryId,
  onSelect,
  isSelectable = true,
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { mutate: deleteCategory } = useDeleteCategory();

  const isSelected = selectedCategoryId === category.id;

  const handleSelect = () => {
    if (isSelectable && onSelect) {
      onSelect(category.id);
    }
  };

  const handleEditSuccess = () => {
    // Category will be updated automatically via TanStack Query
    // No need to manage local state since we're using modal
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    deleteCategory(category.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        // Success toast is shown by the hook
      },
      onError: (error) => {
        const errorMessage = error.message.includes("products assigned")
          ? "Cannot delete category with assigned products. Remove products first."
          : `Failed to delete category: ${error.message}`;
        toast.error(errorMessage);
        setShowDeleteConfirm(false);
      },
    });
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (showDeleteConfirm) {
    return (
      <div
        className="p-3 border rounded-lg bg-destructive/5 border-destructive/20"
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to parent
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Delete "{category.name}"? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              type="button" // Explicitly set type to prevent form submission
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteConfirm();
              }}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              type="button" // Explicitly set type to prevent form submission
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteCancel();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 border rounded-lg transition-colors",
        isSelectable && "cursor-pointer hover:bg-muted/50",
        isSelected && "bg-primary/10 border-primary/50",
        !isSelectable && "opacity-75"
      )}
      onClick={handleSelect}
    >
      <div className="flex items-center gap-2 flex-1">
        {isSelected && <Check className="w-4 h-4 text-primary" />}
        <div className="flex items-center gap-2">
          <span
            className={cn("text-sm font-medium", isSelected && "text-primary")}
          >
            {category.name}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {category.productCount ?? 0}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <CategoryCreateEditModal
          category={category}
          onSuccess={handleEditSuccess}
          trigger={
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit className="w-3 h-3" />
            </Button>
          }
        />
        {(category.productCount ?? 0) === 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
