## External Analysis and Plan for Adding "Delete" Action to Recently Added Products

### Step 1 — Intent Clarification & Request Evaluation

The user wants to add a "delete" action to each product item in the "Recently Added" list on the product creation page. This will allow users to remove products they have just added—both from the client-side session list and from the database—directly from that UI.

This request is clear, actionable, and necessary for a complete CRUD (Create, Read, Update, Delete) experience within the product creation workflow.

### Step 2 — What Do We Implement?

**Current Behavior:**

1.  A user adds a new product via the form.
2.  The product appears in the "Recently Added" list with a status ("Saving...", "Saved", "Failed").
3.  A successfully saved product has an "Edit" button.
4.  There is no mechanism to remove an item from this list if it was added by mistake.

**Desired Behavior:**

1.  A user adds a new product, and it appears in the "Recently Added" list.
2.  Each item in the list now has a "Delete" (trash can) icon next to the "Edit" icon.
3.  The "Delete" icon is enabled for products that are successfully saved or have failed to save, but disabled while a product is in the "pending" state to prevent race conditions.
4.  The user clicks the "Delete" icon.
5.  A confirmation dialog appears, consistent with the application's design, asking for confirmation (e.g., "Are you sure you want to delete 'Product Name'?").
6.  Upon confirmation, the product is instantly removed from the "Recently Added" list (optimistic UI update).
7.  In the background, a request is sent to the server to delete the product from the database.

### Step 3 — How Do We Implement?

The core of this task is to trigger the existing `useDeleteProduct` mutation and ensure its optimistic update logic also targets the local session cache. The implementation will mirror the delete functionality already present in the main products data table.

**Technical Plan:**

1.  **Centralize the Logic by Enhancing `useDeleteProduct`:**

    - The most critical and efficient step is to make the existing delete logic "session-aware."
    - **File:** `src/hooks/use-product-queries.js`
    - **Action:** Locate the `useDeleteProduct` mutation hook. Inside its `onMutate` callback, in addition to the existing logic that updates the main product lists, we will add logic to also optimistically update the session cache.
    - This involves getting the session data with `queryClient.getQueryData(queryKeys.products.sessionCreations())`, filtering out the deleted product, and updating the cache with `queryClient.setQueryData(...)`. This centralizes the logic, ensuring that any future use of `useDeleteProduct` will correctly update all relevant parts of the UI.

2.  **Add UI and State Management in the List Component:**

    - **File:** `src/components/features/products/creation/product-session-creation-list.jsx`
    - **Action:** This component will now be responsible for orchestrating the deletion.
      - Import and use the `useDeleteProduct` hook.
      - Use a `useState` hook to manage the product targeted for deletion (e.g., `[productToDelete, setProductToDelete]`).
      - Import and render the reusable `DeleteConfirmDialog`. Its `open` state will be controlled by whether `productToDelete` is not null.
      - Create the `handleConfirmDelete` function that calls the `deleteProduct` mutation with `productToDelete.id`.
      - Pass a `handleDelete` function down to each `ProductSessionCreationItem`. This function will set the `productToDelete` state.

3.  **Update the Item Component to Trigger Deletion:**
    - **File:** `src/components/features/products/creation/product-session-creation-item.jsx`
    - **Action:**
      - Add a new `onDelete` prop.
      - Add a new `Button` component with the `Trash2` icon next to the existing "Edit" button.
      - The button's `onClick` handler will call the `onDelete(product)` prop.
      - The button will be disabled based on the item's `status` prop (i.e., `disabled={status === 'pending'}`).

This approach is highly maintainable because the core cache manipulation logic is centralized in the custom hook, and it reuses the existing `DeleteConfirmDialog` component for a consistent user experience.

### Step 4 — Final Plan Summary

The development will proceed in the following granular phases:

- **Phase 1: Make the `useDeleteProduct` Hook Session-Aware**

  - **File:** `src/hooks/use-product-queries.js`
  - **Action:** Update the `onMutate` function in `useDeleteProduct` to also find and remove the product from the `sessionCreations` query cache.

- **Phase 2: Add the Delete Button to the Item UI**

  - **File:** `src/components/features/products/creation/product-session-creation-item.jsx`
  - **Action:** Add an `onDelete` prop and a new `Button` with a `Trash2` icon that calls this prop. The button's disabled state will be tied to the item's `status`.

- **Phase 3: Implement Deletion Orchestration in the List Component**
  - **File:** `src/components/features/products/creation/product-session-creation-list.jsx`
  - **Action:**
    1.  Introduce state to track the product being deleted.
    2.  Render the `DeleteConfirmDialog` and control its visibility with this new state.
    3.  Instantiate the `useDeleteProduct` hook.
    4.  Create the handler functions to open the dialog and to confirm the deletion (which will call the mutation).
    5.  Pass the delete handler to each `ProductSessionCreationItem`.
  - **Reference Pattern:** The logic for using a confirmation dialog and triggering a mutation from a list item can be found in `src/components/features/products/display/product-table-columns.jsx` within the `ProductActionsCell` component. This file should be referenced for consistency.
