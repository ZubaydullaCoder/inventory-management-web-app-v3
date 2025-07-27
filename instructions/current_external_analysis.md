Of course. I have analyzed your request and the codebase. This is a classic and important data synchronization issue that can lead to user confusion. My evaluation is that your request is clear, actionable, and crucial for ensuring data consistency across the application.

Here is the plan to resolve the stale category data issue.

### Step 1 — Intent Clarification & Request Evaluation

The request is perfectly clear. The core issue is that a mutation on one resource (a `Product`) is not triggering a data refresh for a related but separate resource (`Category`), leading to a stale client-side cache. The goal is to ensure that when a product's category is changed, any component displaying category information anywhere in the app will reflect this change automatically upon navigation, without requiring a manual page refresh.

### Step 2 — What Do We Implement?

**Current Behavior:**
A user on the main product list page edits a product, changing its category from "Electronics" to "Appliances". The product list itself updates correctly. However, when the user then navigates to the "Add New Product" page, the `CategoryList` component on that page still displays the old product counts for "Electronics" and "Appliances". The application is showing stale data because the cache for categories has not been informed that it is out of date.

**Expected Behavior After Implementation:**
After a user changes a product's category from "Electronics" to "Appliances", the underlying cache management system will be immediately notified. When the user navigates to the "Add New Product" page, the `CategoryList` component will automatically refetch the category data because it has been marked as stale. The user will see the correct, updated product counts for both "Electronics" (count decreased by one) and "Appliances" (count increased by one) instantly and seamlessly. This ensures data integrity and a trustworthy user experience across the entire application.

### Step 3 — How Do We Implement?

The root cause lies within the success handler of the product update mutation. The current implementation correctly invalidates the _product_ cache but is unaware that it must also invalidate the _category_ cache, as changing a product's category inherently changes the data for categories (specifically, their associated product counts).

The solution is to leverage TanStack Query's cache invalidation mechanism more comprehensively. We will tell the `useUpdateProduct` mutation that a successful update should also mark all category-related queries as stale.

**Technical Plan:**

1.  **Locate the Source of the Mutation:** The logic for updating a product is encapsulated in the `useUpdateProduct` hook, located in `src/hooks/use-product-queries.js`.

2.  **Identify the `onSuccess` Callback:** Inside this hook, the `useMutation` call has an `onSuccess` callback. This is where the current product cache invalidation happens:

    ```javascript
    // Inside useUpdateProduct...
    onSuccess: (_data, variables, context) => {
      // This line already exists and works for the product list.
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });

      // ... other logic for name checks ...
    },
    ```

3.  **Enhance the `onSuccess` Callback:** We will add a single, critical line to this callback. We will instruct the query client to also invalidate all queries related to categories. This will ensure that any component in the application that uses category data will refetch it the next time it is rendered.

    The query keys are centrally managed in `src/lib/queryKeys.js`, so we will use the established key for all category queries, which is `queryKeys.categories.all()`.

    **Proposed Code Addition:**

    ````javascript
    // In src/hooks/use-product-queries.js, inside the onSuccess callback of useUpdateProduct

    // This new line is the core of the fix.
    // It tells TanStack Query that any data related to categories is now stale.
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    ```    This is the most efficient and idiomatic approach. It doesn't require manual cache manipulation, which would be complex and error-prone. Instead, we declaratively state that the category data is no longer fresh, and let TanStack Query handle the refetching automatically.
    ````

### Step 4 — Final Plan Summary

The implementation is a highly targeted and safe change focused on a single file.

- **Phase 1: Locate and Analyze the Mutation Hook**

  - **File:** `src/hooks/use-product-queries.js`
  - **Action:** Open the file and find the `useUpdateProduct` function. Examine the `onSuccess` callback within its `useMutation` options to confirm the existing logic.

- **Phase 2: Implement Cross-Resource Cache Invalidation**

  - **File:** `src/hooks/use-product-queries.js`
  - **Action:** Add the line `queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });` inside the `onSuccess` callback. This will ensure that after a product is successfully updated, both product and category data are marked as stale.

- **Phase 3: Verification**
  - **Action:** Follow the user's reported scenario to test the fix:
    1.  Navigate to the main products list page.
    2.  Open the edit modal for a product and change its category. Save the change.
    3.  Navigate to the "Add New Product" page (`/inventory/products/new`).
    4.  Observe the `CategorySection` component and confirm that the product counts for the affected categories are immediately and correctly updated without requiring a page refresh.
