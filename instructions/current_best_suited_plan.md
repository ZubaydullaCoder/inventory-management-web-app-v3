Step 1 — Intent Clarification & Request Evaluation  
The request is clear and actionable:  
• Add a “Delete” action (button + logic) to each row of the Product data table.  
• Remove the existing “Copy Product ID” action.  
The goal is feature parity with the shadcn template’s Task table pattern, but adapted to our current project conventions (Server Components default, PascalCase React files, TanStack Query for data-fetching, etc.). No ambiguity; ready to proceed.

Step 2 — What Do We Implement? (Before → After narrative)  
Current behaviour  
• Dropdown menu in each row offers only two actions:  
 ① “Copy product ID” (copies ID to clipboard)  
 ② “Edit product” (opens modal)  
• There is no way to delete a product from the UI. Deletion, if possible, must be done elsewhere (DB or API).

After implementation  
• Dropdown menu will offer:  
 ① “Edit product” (existing)  
 ② Divider  
 ③ “Delete product” (new) – opens a confirmation dialog. When confirmed:  
 – Calls an async mutation (deleteProduct) that hits our API route DELETE /api/products/:id.  
 – Displays optimistic “Deleting…” toast; on success ➜ “Product deleted”; on error ➜ error toast.  
 – Invalidates the “products” query cache so the table refreshes automatically.  
• “Copy product ID” disappears entirely (icon import removed, skeleton width unchanged).  
Edge cases & safeguards  
• Deleting a product still referenced elsewhere (e.g. sales) should return a handled 409/400 response from the API; UI surfaces the message.  
• For skeleton rows (isLoading flag) the actions cell remains disabled.  
• Confirmation dialog prevents accidental deletion; ESC / outside-click cancels.  
• Keyboard shortcut ⌘⌫ on Mac / Delete on Windows will be wired later (optional).

Step 3 — How Do We Implement? (technical plan)  
A. Locate integration points  
 • src/components/features/products/display/product-table-columns.jsx – houses ProductActionsCell.  
 • No existing delete API; we create a RESTful route file: src/app/api/products/[id]/route.ts with DELETE handler that wraps prisma.product.delete.  
 • Query keys & helpers live under src/lib/react-query/products.ts (we’ll add if missing).

B. Re-use patterns from shadcn template  
 • Dropdown + confirmation + optimistic toast exactly mirrors tasks-table-columns.tsx pattern.  
 • We will replicate:  
 – DeleteDialog component (small, headless) → place in ui/alert-dialog.  
 – toast.promise flow for pending/success/error.

C. Mutation & cache invalidation  
 • Add deleteProduct mutation via @tanstack/react-query (useMutation).  
 • In onSuccess, call queryClient.invalidateQueries(['products']).

D. State flow  
 • ProductActionsCell now owns a local showDeleteDialog state flag (similar to showEditModal).  
 • When user confirms, fire the mutation, close dialog afterward.

E. No new NPM packages required; we already depend on @tanstack/react-query, prisma, lucide-react, and sonner.

F. Code optimisations  
 • Remove unused Copy icon import.  
 • Keep actions cell small (icon button remains 8×8).  
 • Factor “DeleteDialog” into a reusable component so other tables can share it later.

Step 4 — Final Plan Summary  
📁 Files to create / update / remove  
 • NEW src/app/api/products/[id]/route.ts ↳ DELETE handler.  
 • UPDATE src/components/features/products/display/product-table-columns.jsx  
 – Remove copy-ID menu item & Copy icon import.  
 – Add “Delete” item, confirmation dialog state, delete mutation hook.  
 • NEW src/components/ui/delete-confirm-dialog.jsx (reusable).  
 • NEW (or update) src/lib/react-query/products.js – export useDeleteProduct hook.  
 • UPDATE src/components/ui/table-cell-skeleton.jsx (if action skeleton width changes; probably unchanged).  
 • DELETE nothing else; just remove unused icon import.

📦 NPM packages  
 • None—existing deps suffice.

💻 CLI commands (when implementing)  
 • No installs. Typical workflow: pnpm dev, pnpm prisma generate (API route uses existing Prisma client), pnpm lint.

🔄 Reused components / logic  
 • Dropdown & toast pattern from shadcn’s tasks-table-columns.tsx.  
 • @/components/ui/alert-dialog (if already present) or new DeleteConfirmDialog.  
 • React-Query client & invalidation utilities already used in edit flow.
