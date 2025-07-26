# Bug Fix Plan – Category Pagination Auto-Back

## Step 1 — Intent Clarification & Request Evaluation

The current bug appears when a user is on **page > 1** of the paginated category list and deletes all categories shown on that page. After the deletion the UI remains on the now-empty page and shows _“No categories”_. The correct UX is to automatically move the user back to the previous page (if one exists) so that they immediately see the remaining categories.

Acceptance criteria

1. When `categories.length === 0` _and_ `hasPreviousPage === true`, the UI should navigate one page backward.
2. If the first page also becomes empty the message _“No categories yet”_ is still shown.
3. Behaviour is consistent whether a search filter is active or not.

---

## Step 2 — What Do We Implement? (Current ▶ Expected)

• **Current behaviour**: `useSimpleCategoryPagination` returns an empty `categories` array for the current cursor after the deletion. `CategoryList` renders its empty state even though earlier pages still contain data.

• **Expected behaviour**: As soon as an empty result set is detected **and** there is at least one previous page, the pagination logic should automatically execute `goToPreviousPage()` so the user is shown that page instead of an empty view.

Edge cases handled:

- Deleting last item on the **first** page → stays on first page, empty state shows.
- Intermediate deletions that don’t empty the page → no navigation.
- Same logic applies while a search filter is applied.

---

## Step 3 — How Do We Implement? (Technical)

Relevant code:

- `src/hooks/use-category-pagination.js` ➜ `useSimpleCategoryPagination`
- `src/components/features/categories/category-list.jsx` consumes the hook

Approach options:

1. Detect empty-page & navigate inside **CategoryList** using an effect.
2. **Preferred**: add the logic **inside `useSimpleCategoryPagination`** so every consumer gets the fix.

Chosen implementation:

1. Inside `useSimpleCategoryPagination`, add a state flag `autoBackTriggered` to avoid infinite loops.
2. Add a `useEffect` that triggers `goToPreviousPage()` when current page is empty _and_ `hasPreviousPage` is true, and resets the flag when data appears.
3. No API or UI markup changes.

---

## Step 4 — Granular Development Phases

1. **Phase 0 – Environment prep**
   - Create a new git branch `fix/category-pagination-autoback`.
2. **Phase 1 – Code change**
   - Implement changes described above in `use-category-pagination.js`.
3. **Phase 2 – Manual test scenarios** (ask user to verify):
   - A) Two-page list → delete all items on page 2 → automatic redirect to page 1.
   - B) Delete last item on page 1 → empty state shows, no redirect.
   - C) Apply search that returns 2 pages → repeat test A.
4. **Phase 3 – Review & polish**
   - Lint/format, ensure no warnings.
5. **Phase 4 – Commit & PR**
   - Commit message: “fix: auto-navigate to previous page when current category page becomes empty”.
   - Open PR for review.
