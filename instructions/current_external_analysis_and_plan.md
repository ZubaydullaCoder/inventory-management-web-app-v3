Yes, you are absolutely correct. This is a classic and subtle bug often found in cursor-based pagination implementations. Your detailed observation is spot on.

### Step 1 — Intent Clarification & Request Evaluation

The user has identified a data integrity bug in the product table's cursor-based pagination. When navigating backward page by page, one product is incorrectly dropped from the list on each page view, leading to an inconsistent and confusing user experience. The core intent is to fix this data-slicing error so that pagination is stable and reliable in both forward and backward directions.

This is a critical bug that needs to be addressed.

### Step 2 — What Do We Implement?

**Current (Buggy) Behavior:**

1.  The user is on a page of products (e.g., Page 3).
2.  They click the "Previous" button to go to Page 2.
3.  The backend correctly fetches the 10 items for Page 2, plus one extra item from Page 1 to confirm that a "previous" page exists.
4.  However, the backend logic incorrectly slices the array, cutting off a valid product instead of the extra one.
5.  The UI then renders only 9 products for Page 2, and the pagination text incorrectly reads "Showing 9 of 10 items".

**Desired (Correct) Behavior:**

1.  The user is on Page 3 and clicks "Previous".
2.  The backend fetches the 11 items (10 for the page + 1 extra).
3.  The backend logic correctly identifies the direction as "backward" and slices off the correct "extra" item.
4.  It returns a full set of 10 products for Page 2.
5.  The UI renders all 10 products, and the pagination text correctly reads "Showing 10 of 10 items". Navigation in both directions is now stable and predictable.

### Step 3 — How Do We Implement?

The root cause of this bug is located in the backend data-fetching logic, specifically in how the array of results is sliced after being fetched from the database for backward pagination.

**Root Cause Analysis:**

- **File:** `src/lib/data/products.js`
- **Function:** `getProductsByShopIdCursor`
- **The Flaw:** When navigating backward, the database query correctly fetches `limit + 1` items in reverse order (e.g., items 20 down to 10). The code then reverses this array in JavaScript to get the correct display order (10 up to 20). The "extra" item (item 10) is now at the _beginning_ of the array. However, the current code, `orderedProducts.slice(0, limit)`, always takes the first 10 items, which incorrectly includes the "extra" item and cuts off the last valid item (item 20).

**The Solution:**

The fix is to make the array slicing logic direction-aware.

1.  **Locate the Slicing Logic:**

    - In `src/lib/data/products.js`, find the line:
      ```javascript
      const finalProducts = orderedProducts.slice(0, limit);
      ```

2.  **Implement Conditional Slicing:**

    - This line must be updated to handle the two cases. When an extra item exists (`hasMoreItemsInCurrentDirection` is true):
      - If the direction is **forward**, we slice the end: `orderedProducts.slice(0, limit)`.
      - If the direction is **backward**, we must slice the beginning: `orderedProducts.slice(1)`.
    - This ensures we always remove the "extra" item that was only fetched to detect the presence of an adjacent page.

3.  **Ensure Consistency:**
    - This same pagination logic is used for categories. The identical bug exists in `src/lib/data/categories.js` in the `getCategoriesByShopIdCursor` function. The same fix should be applied there to maintain consistency and prevent future issues.

### Step 4 — Final Plan Summary

The development will be executed in two simple, sequential phases to ensure a complete fix.

- **Phase 1: Fix Product Pagination Logic**

  - **File:** `src/lib/data/products.js`
  - **Action:** In the `getProductsByShopIdCursor` function, replace the static `slice(0, limit)` logic with a conditional slice that correctly handles the `backward` direction when `hasMoreItemsInCurrentDirection` is true.

- **Phase 2: Fix Category Pagination Logic for Consistency**
  - **File:** `src/lib/data/categories.js`
  - **Action:** Apply the exact same logical fix to the `getCategoriesByShopIdCursor` function to ensure both paginated features in the application behave correctly and consistently.
