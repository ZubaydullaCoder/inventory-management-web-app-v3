import React from "react";
import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import CategoryItem from "./category-item";

/**
 * Renders a selected category in a separate top bar
 * @param {Object} props
 * @param {Object} props.selectedCategory - The selected category object
 * @param {string} props.selectedCategoryId - Currently selected category ID
 * @param {function} props.onCategorySelect - Callback when category is selected
 */
export default function SelectedCategoryBar({
  selectedCategory,
  selectedCategoryId,
  onCategorySelect,
}) {
  // Show "Uncategorized" when no category is selected
  if (!selectedCategoryId) {
    return (
      <div className="sticky top-0 bg-background p-3">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Uncategorized</span>
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
            <span className="text-sm font-medium text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  

  // Handle deselection when clicking on selected category
  const handleCategoryClick = (categoryId) => {
    if (categoryId === selectedCategoryId && onCategorySelect) {
      // If clicking on already selected category, deselect it
      onCategorySelect("");
    }
  };

  return (
    <div className="sticky top-0 bg-background p-3">
      <CategoryItem
        category={selectedCategory}
        selectedCategoryId={selectedCategoryId}
        onSelect={handleCategoryClick}
        isSelectable={!!onCategorySelect}
      />
    </div>
  );
}
