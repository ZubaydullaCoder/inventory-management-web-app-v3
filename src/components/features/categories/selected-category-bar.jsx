import React from "react";
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
  if (!selectedCategory) {
    return null; // Render nothing if no category is selected
  }

  return (
    <div className="sticky top-0 bg-background p-3">
      <CategoryItem
        category={selectedCategory}
        selectedCategoryId={selectedCategoryId}
        onSelect={onCategorySelect}
        isSelectable={!!onCategorySelect}
      />
    </div>
  );
}
