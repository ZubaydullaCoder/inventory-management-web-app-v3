# Fix Cursor Pagination Total Items Count

## Problem Analysis
The data table cursor pagination shows incorrect total item counts after navigation. Currently, `totalProducts` is only fetched on the first page load (`cursor === null`) and returns `0` for subsequent pages, causing the UI to display incorrect totals like "showing 10 of 10 items" instead of "showing 10 of 21 items".

## Root Cause
In `src/lib/data/products.js`, the `getProductsByShopIdCursor` function has this logic:
```javascript
// Only count when necessary (expensive operation)
cursor === null
  ? prisma.product.count({ where: { shopId } })
  : Promise.resolve(0),
```

This optimization causes `totalProducts` to be `0` on all pages except the first.

## Implementation Plan

### Phase 1: Fix Database Query Logic ✅
- **File**: `src/lib/data/products.js`
- **Change**: Modify `getProductsByShopIdCursor` to always fetch total count
- **Approach**: Use proper where clause for total count that matches the filtered results

### Phase 2: Handle Fuzzy Search Total Count ✅
- **File**: `src/lib/data/products.js` 
- **Change**: Fix `getCursorPaginatedFuzzySearchResults` to return proper total count
- **Approach**: Ensure fuzzy search results include accurate total count

### Phase 3: Optimize Performance (Optional)
- **Consideration**: Implement caching or other optimizations if total count queries become performance bottlenecks
- **Approach**: Monitor performance and implement Redis caching if needed

## Expected Outcome
After implementation:
- First page: "showing 10 of 21 items" ✓
- Second page: "showing 10 of 21 items" ✓ (instead of current "showing 10 of 10 items" ✗)
- Last page: "showing 1 of 21 items" ✓ (if only 1 item on last page)
- Consistent total count across all pagination navigation

## Implementation Steps
1. ✅ Update `getProductsByShopIdCursor` function to always fetch accurate total count
2. ✅ Fix fuzzy search pagination total count
3. 🔄 Test with different filter scenarios (name filter, category filter)
4. 🔄 Verify performance impact and optimize if necessary
