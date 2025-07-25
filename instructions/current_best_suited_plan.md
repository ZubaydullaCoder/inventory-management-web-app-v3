# Product Creation Form - Category Section Refactoring Plan

## Overview

Refactor the product creation form to separate the category section into a dedicated card-styled component with enhanced functionality including filtering, CRUD operations, and cursor-based pagination.

## Current State

- Category selection uses a dropdown component (`CategoryCreatableSelect`)
- Categories can be created inline within the dropdown
- No separate visual distinction for category management
- Limited category management features

## Target State

- Separate card-styled category management section
- Full CRUD operations for categories
- Search/filter functionality
- Cursor-based pagination for large category lists
- Visual separation from product form fields
- Maintain integration with product form state

## Implementation Phases

### ✅ Phase 1: Create Category Management Component Structure (COMPLETED)

**Files created:**

1. ✅ `src/components/features/categories/category-management-card.jsx`
   - Main container component with Card styling
   - Orchestrates all category functionality
   - Handles search state and category selection
2. ✅ `src/components/features/categories/category-list.jsx`

   - Displays paginated category list
   - Basic pagination ready for Phase 2 enhancement
   - Shows edit/delete actions per category
   - Includes loading, error, and empty states

3. ✅ `src/components/features/categories/category-search-filter.jsx`

   - Search input for filtering categories
   - Real-time search with debouncing (300ms)
   - Controlled and uncontrolled input support

4. ✅ `src/components/features/categories/category-create-edit-form.jsx`

   - Inline form for creating new categories
   - Edit mode for existing categories
   - Name validation and duplicate checking with real-time feedback
   - Toast notifications for success/error states

5. ✅ `src/components/features/categories/category-item.jsx`

   - Individual category item component
   - Shows category name with edit/delete actions
   - Handles selection for product form with visual feedback
   - Inline edit and delete confirmation modes

6. ✅ `src/components/features/categories/index.js`

   - Centralized exports for easy component imports

7. ✅ `src/app/(dashboard)/category-test/page.jsx`
   - Test page demonstrating Phase 1 functionality
   - Includes debug information and feature showcase

### ✅ Phase 2: Implement Category Pagination Hook (COMPLETED)

**Files created/modified:**

1. ✅ `src/hooks/use-category-pagination.js`

   - Implemented cursor-based pagination logic with useInfiniteQuery
   - Created both infinite scroll and simple pagination variants
   - Handle filter/search state with debouncing
   - Integrated with existing category queries

2. ✅ Updated `src/lib/api/categories.js`

   - Added `getCategoriesPaginatedApi` function for cursor-based pagination
   - Added search/filter parameters support
   - Maintains backward compatibility with existing API

3. ✅ Created `src/app/api/categories/cursor/route.js`

   - Implemented server-side cursor-based pagination
   - Added search functionality with case-insensitive filtering
   - Added proper validation and error handling

4. ✅ Updated `src/lib/data/categories.js`

   - Added `getCategoriesByShopIdCursor` function
   - Implemented cursor condition building and ordering
   - Added helper functions for cursor generation

5. ✅ Updated `src/lib/queryKeys.js`

   - Added pagination-specific query keys
   - Ensures proper cache management for paginated queries

6. ✅ Updated `src/components/features/categories/category-list.jsx`
   - Integrated pagination hooks with fallback to non-paginated
   - Added pagination controls (Previous/Next buttons)
   - Maintains backward compatibility

### ✅ Phase 3: Integrate Category Card into Product Forms (COMPLETED)

**Files modified:**

1. ✅ `src/components/features/products/creation/product-creation-form.jsx`

   - ✅ Removed `CategoryCreatableSelect` component import
   - ✅ Added `CategoryManagementCard` import from categories index
   - ✅ Added hidden form field for categoryId integration
   - ✅ Added `watch` function to monitor categoryId changes
   - ✅ Integrated new category management card with selection handler
   - ✅ Added `handleCategorySelect` function to update form state

2. ✅ `src/components/features/products/creation/product-creation-cockpit.jsx`

   - ✅ Updated layout from 2-column grid to single-column stacked layout
   - ✅ Maintained responsive design principles
   - ✅ Improved spacing and visual hierarchy
   - ✅ Category card now integrated within product form section

3. ✅ `src/components/features/products/edit/product-edit-form.jsx`

   - ✅ Applied same changes as creation form
   - ✅ Replaced `CategoryCreatableSelect` with `CategoryManagementCard`
   - ✅ Added category selection handler and form integration
   - ✅ Ensured selected category is properly highlighted
   - ✅ Added hidden categoryId field for form binding

4. ✅ `src/hooks/use-product-creation-form.js`
   - ✅ No changes required - hook already exposes `watch` function needed for integration
   - ✅ Category persistence between form resets already working via existing logic

### ✅ Phase 4: Implement Enhanced Category CRUD Operations (COMPLETED)

**Features implemented:**

1. ✅ **Create Category**

   - ✅ Inline creation form at top of card (already implemented in Phase 1)
   - ✅ Real-time duplicate checking with debouncing
   - ✅ Optimistic updates with TanStack Query
   - ✅ Toast notifications for success/error states

2. ✅ **Edit Category**

   - ✅ Inline editing with save/cancel functionality
   - ✅ Name validation and normalization
   - ✅ Duplicate name checking (excluding current category)
   - ✅ Optimistic updates for instant UI feedback

3. ✅ **Delete Category - Enhanced Safety**

   - ✅ Confirmation dialog with clear messaging
   - ✅ Server-side safety checks for products using category
   - ✅ Prevent deletion if products are assigned
   - ✅ Detailed error messages with product count
   - ✅ Enhanced error handling for various edge cases

4. ✅ **Select Category**
   - ✅ Click to select for product form integration
   - ✅ Visual feedback with checkmark and highlighting
   - ✅ Smooth sync with form state via React Hook Form

**New files created:**

1. ✅ `src/app/api/categories/[id]/route.js`

   - Complete API endpoint for individual category operations
   - PUT method for category updates with validation
   - DELETE method with enhanced safety checks
   - Comprehensive error handling for all scenarios

2. ✅ `src/app/api/categories/[id]/usage/route.js`
   - New endpoint to check category usage by products
   - Returns product count and usage status
   - Security checks to ensure category belongs to user's shop

**Enhanced files:**

3. ✅ `src/lib/data/categories.js`

   - Added `checkCategoryUsage()` function for safety checks
   - Enhanced `deleteCategory()` with force option and usage validation
   - Improved error messages with detailed product count information

4. ✅ `src/lib/api/categories.js`

   - Added `getCategoryUsageApi()` function for usage information
   - Updated API layer to support new functionality

5. ✅ `src/hooks/use-category-queries.js`

   - Added `useCategoryUsage()` hook for product count queries
   - Enhanced existing hooks with better error handling

6. ✅ `src/lib/queryKeys.js`
   - Added `usage(categoryId)` query key for caching usage information

**Technical Enhancements:**

- ✅ **Enhanced Error Handling**: Comprehensive error messages for duplicate names, missing categories, and constraint violations
- ✅ **Safety Checks**: Server-side validation prevents deletion of categories with assigned products
- ✅ **Optimistic Updates**: All operations provide instant UI feedback with rollback on error
- ✅ **Real-time Validation**: Name checking with debouncing and visual feedback
- ✅ **Product Count Display**: Ready for UI enhancement to show usage information

### Phase 5: Enhance UI/UX

**Improvements:**

1. **Visual Design**

   - Use shadcn Card components consistently
   - Add proper spacing and typography
   - Implement loading states
   - Add empty states

2. **Interactions**

   - Smooth transitions for edit mode
   - Keyboard navigation support
   - Focus management

3. **Responsive Design**
   - Stack vertically on mobile
   - Adjust card height for different screens
   - Ensure touch-friendly interactions

### Phase 6: Testing  Optimization

**Tasks:**

1. **Performance**

   - Implement virtual scrolling for large lists
   - Optimize re-renders
   - Cache pagination results

2. **Edge Cases**

   - Handle API errors gracefully
   - Test with no categories
   - Test with many categories (100+)

3. **Integration**
   - Ensure product form validation works
   - Test category persistence
   - Verify optimistic updates

## Technical Considerations

### State Management

- Use React Hook Form for category selection integration
- Leverage TanStack Query for server state
- Local state for UI interactions (edit mode, search)

### Reusable Components

- Leverage existing shadcn components:
  - Card, CardHeader, CardContent
  - Input for search
  - Button for actions
  - ScrollArea for list

### API Integration

- Extend existing category API endpoints
- Maintain backward compatibility
- Use existing hooks where possible

### Design Patterns

- Follow existing codebase patterns
- Use composition for flexibility
- Implement proper error boundaries

## Success Criteria

1. Category section is visually separated in a card
2. Users can search/filter categories efficiently
3. CRUD operations work seamlessly
4. Pagination handles large datasets
5. Integration with product form is smooth
6. No regression in existing functionality

## Next Steps

**Phase 1 Status: ✅ COMPLETED**

- All component structures created and tested
- Full CRUD functionality implemented
- Search and filtering working
- Card-based UI with shadcn components
- Test page created at `/category-test`

**Upcoming phases:**

1. ✅ Phase 1 - Create component structure (COMPLETED)
2. ✅ Phase 2 - Implement cursor-based pagination (COMPLETED)
3. ✅ Phase 3 - Integration with product forms (COMPLETED)
4. ✅ Phase 4 - Enhanced CRUD operations (COMPLETED)
5. ⏳ Phase 5 - Polish UI/UX
6. ⏳ Phase 6 - Testing & optimization

<citations>
  <document>
      <document_type>RULE</document_type>
      <document_id>IR9THCr4cENzfwchO9Aiom</document_id>
  </document>
</citations>
