# Product Components

This directory contains all product-related components for the inventory management system.

## Bulk Actions

### ProductBulkActions Component

The `ProductBulkActions` component provides a toolbar that appears when products are selected in the data table. It includes:

**Features:**
- **Selection Counter**: Displays the count of selected products
- **Bulk Delete**: Button to delete multiple products at once
- **Bulk Category Update**: Button to update the category for multiple products
- **Clear Selection**: X button to clear the current selection

**Integration:**
- Automatically appears when products are selected in the table
- Integrated into `ProductTableContainer` 
- Uses existing `BulkDeleteProductsDialog` and `BulkUpdateCategoryDialog` components
- Follows the same pattern as other toolbar components in the system

**Usage:**
```jsx
<ProductBulkActions
  selectedProducts={selectedProducts} // Array of selected product objects
  onClearSelection={handleClearSelection} // Function to clear row selection
  className="mb-4" // Optional additional CSS classes
/>
```

**Design:**
- Appears above the data table when products are selected
- Uses consistent styling with other UI components
- Includes proper icons for visual clarity
- Destructive styling for delete actions
- Proper accessibility with screen reader support

**Error Handling:**
- Both bulk operations handle partial failures gracefully
- Shows detailed toast notifications for success/failure states
- Processes operations sequentially to avoid server overload
- Automatically clears selection after successful operations

### Related Components

- `BulkDeleteProductsDialog`: Handles bulk deletion with confirmation
- `BulkUpdateCategoryDialog`: Handles bulk category updates with selection
- `ProductTableContainer`: Main container that integrates the bulk actions
- `DataTable`: Base table component with row selection support
