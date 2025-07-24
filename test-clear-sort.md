# Clear Sorting Functionality Test

## Bug Description
The clear sorting functionality in the product data table was not working properly. When users sorted a column and then tried to clear the sort, the clear sort functionality was not responding.

## Root Cause
The issue was in the `handleSortingChange` function in `src/hooks/use-table-cursor-url-state.js`. The function only handled the case when there was an active sort (`newSorting.length > 0`) but did not handle the case when sorting was cleared (`newSorting.length === 0`).

## Fix Applied
Updated the `handleSortingChange` function in `useTableCursorUrlState` hook to handle both cases:

1. **Active Sort**: When `newSorting.length > 0`, update URL with new sort parameters
2. **Clear Sort**: When `newSorting.length === 0`, reset to default sort parameters

## Code Changes
- **File**: `src/hooks/use-table-cursor-url-state.js`
- **Function**: `handleSortingChange`
- **Change**: Added `else` block to handle clearing sort by resetting to `defaultState.sortBy` and `defaultState.sortOrder`

## Test Steps
1. Navigate to the products page
2. Click on any sortable column header (e.g., Name, Price, Stock)
3. Select "Asc" or "Desc" to sort the column
4. Click the column header again and select "Clear sort"
5. Verify that the sort is cleared and the table returns to the default sort order

## Expected Behavior
- The "Clear sort" option should only appear when a column is actively sorted
- Clicking "Clear sort" should reset the sorting to the default state (createdAt desc)
- The URL parameters should be updated to reflect the cleared sort state
- The cursor should be reset when clearing sort (for cursor pagination)

## Technical Details
The fix ensures consistency between the cursor-based and offset-based pagination hooks by implementing the same sorting clear logic in both hooks.
