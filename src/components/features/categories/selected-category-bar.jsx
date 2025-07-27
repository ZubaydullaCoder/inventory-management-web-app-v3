import React from "react";
import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryItem from "./category-item";
import { UNCATEGORIZED_ID } from "./category-list";

/**
 * Renders a selected category in a separate top bar
 * @param {Object} props
 * @param {Object} props.selectedCategory - The selected category object
 * @param {string} props.selectedCategoryId - Currently selected category ID
 * @param {function} props.onCategorySelect - Callback when category is selected
 * @param {function} [props.onDeleteSuccess] - Callback when selected category is deleted
 */
export default function SelectedCategoryBar({
  selectedCategory,
  selectedCategoryId,
  onCategorySelect,
  onDeleteSuccess,
}) {
  // Show "Uncategorized" when no category is selected
  if (!selectedCategoryId) {
    return (
      <div className="sticky top-0 bg-background p-3">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Uncategorized
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state when selectedCategoryId exists but selectedCategory is not loaded yet
  if (selectedCategoryId && !selectedCategory) {
    return (
      <div className="sticky top-0 bg-background p-3">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 animate-pulse bg-muted rounded" />
            <span className="text-sm font-medium text-muted-foreground">
              Loading...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Handle deselection when clicking on selected category
  const handleCategoryClick = (categoryId) => {
    if (categoryId === selectedCategoryId && onCategorySelect) {
      // If clicking on already selected category, deselect it
      onCategorySelect(UNCATEGORIZED_ID);
    }
  };

  // Handle successful deletion of selected category
  const handleDeleteSuccess = () => {
    if (onDeleteSuccess) {
      onDeleteSuccess();
    } else if (onCategorySelect) {
      // Fallback: clear selection using onCategorySelect
      onCategorySelect(UNCATEGORIZED_ID);
    }
  };

  return (
    <div className="sticky top-0 bg-background p-3">
      <CategoryItem
        category={selectedCategory}
        selectedCategoryId={selectedCategoryId}
        onSelect={handleCategoryClick}
        isSelectable={!!onCategorySelect}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
