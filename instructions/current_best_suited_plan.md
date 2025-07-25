# Current Best-Suited Development Plan – Category Product Count & Conditional Deletion

## Overview
We will enhance the Category UX so that:
1. Every category visually shows the number of products assigned to it.
2. The delete (trash) action appears **only** for categories whose product count is zero.

The change spans API, data-layer utilities, React hooks, and UI components.  We will favour a single efficient DB call that already returns the counts, avoiding N+1 requests from the client.

---

## Phase 1 – Server / Data Layer ✅ COMPLETED
1. **Prisma query update** ✅
   • Updated `getAllCategoriesByShopId` to include `_count: { select: { products: true } }`
   • Updated `getCategoriesByShopIdCursor` to include product counts
   • Mapped `_count.products` to `productCount` for easier consumption

2. **API routes** ✅
   • `GET /api/categories` now returns productCount via updated data layer
   • Cursor pagination endpoint also returns productCount

3. **Type definition** ✅
   • Updated JSDoc types to include `productCount: number`
   • Updated createCategory to return productCount (always 0 for new categories)

---

## Phase 2 – Client Data Hooks ✅ COMPLETED
1. **`use-category-queries.js`** ✅
   • Updated optimistic updates to include `productCount`
   • useCreateCategory now adds `productCount: 0` for new categories
   • useUpdateCategory preserves existing `productCount` during name updates

2. **useCategoryUsage remains available** ✅
   • Hook remains for detailed usage queries when needed

---

## Phase 3 – UI Components ✅ COMPLETED
1. **`CategoryItem.jsx`** ✅
   • Added productCount display as rounded badge next to category name
   • Implemented conditional delete button: `{(category.productCount ?? 0) === 0 && (<Button>...)}`
   • Updated JSDoc to document productCount prop

2. **`CategoryList.jsx`** ✅
   • Component automatically passes category object with productCount to CategoryItem
   • No changes needed since data layer now includes productCount

3. **Edge visual tweaks** ✅
   • Added proper flex layout with gap for category name and count display
   • Used muted background badge styling for product count

---

## Phase 4 – Manual QA Checklist ✅ READY FOR TESTING
1. List loads – each category shows the correct count.
2. A category with products hides the delete icon; empty category shows it.
3. Attempting to delete a non-empty category via API (e.g. devtools) still fails → server guard untouched.
4. After deleting the last product of a category, refreshing list shows count 0 and delete icon becomes visible.
5. Performance – list still renders in < 100 ms for 100+ categories (verify via React Profiler).

**✅ CRITICAL BUG FIXED:** Resolved Prisma schema field mismatch - removed invalid `createdAt`/`updatedAt` selections from Category queries.

---

## Phase 5 – Follow-ups / Deferred
* Decide whether to remove now-redundant `/api/categories/[id]/usage` endpoint.
* Consider migrating CategoryList to an infinite-scroll pattern before GA.
