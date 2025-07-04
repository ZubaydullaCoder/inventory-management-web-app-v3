**Definitive UI/UX Design & Workflow**

**Phase 1: Initial Setup & Onboarding (The "Data Entry Cockpit")**

- **Goal:** To provide a guided, efficient, and rewarding experience for the user (Aziz) as he populates his new account with essential business data. The design must mitigate the potential tedium of data entry.
- **Consistency Check:** This phase heavily relies on the consistent application of the **"Cockpit" layout (Pattern 3)** and the **`Modal` for editing (Pattern 2)** across different data types (Categories, Suppliers, Customers, Products). This repetition builds user confidence and muscle memory quickly.

**1. The First Login & Dashboard Onboarding Guide**

- **URL:** `app.yourdomain.uz/dashboard`
- **Layout:** The `AppLayout` (Authenticated) is now the main shell.
  - **`Sidebar` (Left):** The user's primary navigation hub is immediately visible, showing the full scope of the application's features (Dashboard, Sales, Inventory, Purchases, etc.). This provides a mental map of the app.
  - **`TopBar` (Top):** Displays breadcrumbs (`Home / Dashboard`) and a global "New Sale" button.
- **Main Content Area:**
  - **`PageHeader`:** "Welcome to your Dashboard, Aziz!"
  - **Onboarding Component:** Instead of data charts (which are empty), the main area is dedicated to a guided setup checklist.
    - **UI:** A visually appealing card with step-by-step actions.
    - **Content:**
      1.  **"Step 1: Create Categories"** - Brief text explaining why. A `PrimaryButton` "Go to Categories."
      2.  **"Step 2: Add Suppliers & Customers"** - Brief text. Two buttons: "Add Suppliers" and "Add Customers."
      3.  **"Step 3: Add Your Products"** - The main event. A `PrimaryButton` "Start Adding Products."
    - **Interaction:** This component turns a potentially confusing "blank slate" into a clear, actionable starting point.

**2. The Bulk Creation "Cockpit" Pages**

- **Applies to:**
  - `/inventory/categories/new`
  - `/purchases/suppliers/new`
  - `/customers/new`
  - `/inventory/products/new`
- **Goal:** To provide a highly efficient, single-screen experience for adding multiple data entries in one session.
- **Layout:** The consistent two-column "Cockpit" layout.
  - **Left Column:** The main data entry **`Form`**.
  - **Right Column:** The **`SessionCreationList`** component.
- **Workflow Example (Adding Products):**
  1.  Aziz clicks "Start Adding Products" and lands on `/inventory/products/new`.
  2.  **Focus is immediately in the first field of the `Form`** on the left ("Product Name").
  3.  He fills out the form for his first product.
  4.  He presses **Enter** (or clicks the default `PrimaryButton`).
      - **Button Label:** **"Save and Add Another"**.
      - **Action:** The product is saved. The new product instantly appears at the top of the `SessionCreationList` on the right. The `Form` on the left clears, and focus returns to the "Product Name" field, ready for the next entry.
  5.  He adds several more products this way, seeing the right-hand list grow with each save, which provides a strong sense of progress and immediate feedback.
  6.  **Correction Mid-Flow:** He notices a typo in an item he just added to the list.
      - He clicks the "Edit" icon next to that item in the `SessionCreationList`.
      - A **`Modal`** opens with the form pre-filled for that item. He makes the correction and saves the modal.
      - The item in the list updates, and he can continue his main data entry task without losing his place. This is a crucial, frictionless editing loop.
  7.  **Finishing the Session:** After adding the last product, he clicks the **`SecondaryButton`**, "Save and Finish."
      - **Action:** The final product is saved and added to the list, and he is then redirected to the main `DataTable` view (`/inventory/products`) where he can see all the products he just added.

**3. The Main Data List Views**

- **Applies to:**
  - `/inventory/products`
  - `/inventory/categories`
  - `/purchases/suppliers`
  - `/customers`
- **Goal:** To provide a clear, organized, and powerful way to view, search, and manage existing data.
- **Layout:** A standard, clean page layout.
- **UI Components & Interaction:**
  - **`PageHeader`:** Contains the page title (e.g., "Products") and the `PrimaryButton` to "Add New Product" (which links to the "Cockpit" page). It also contains a search/filter bar for the table below.
  - **`DataTable` (Pattern 1):**
    - **Initial State:** If no data exists yet, an `EmptyState` component is shown, guiding the user to add their first item.
    - **Populated State:** The table displays the data with sortable columns.
    - **Actions:** The rightmost column is "Actions," containing a kebab menu (⋮). Clicking it reveals a `DropdownMenu` with options like "Edit," "Deactivate," and conditional "Delete."
    - **Editing:** Clicking "Edit" from this menu opens the same `Modal` with the pre-filled form used in the `SessionCreationList`, ensuring a consistent editing experience whether the user is in a bulk-add session or managing the main list.

This design for Phase 1 is entirely focused on making the most labor-intensive part of the user journey as efficient and painless as possible. By establishing and consistently reusing the "Cockpit" and `DataTable`/`Modal` patterns, the application becomes predictable and easy to master, setting a positive tone for the user's ongoing relationship with the product.
