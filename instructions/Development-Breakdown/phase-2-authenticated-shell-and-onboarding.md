### `phase-2-authenticated-shell-and-onboarding.md`

**Phase 2: Authenticated Shell & Initial Onboarding**
**Version:** 1.0
**Status:** In Progress

---

### 1. Goal of This Phase

The primary goal is to build the core authenticated user experience. This involves creating the main application layout (sidebar, top bar) and implementing the complete "Data Entry Cockpit" workflow. By the end of this phase, a newly signed-up user will be presented with a guided onboarding checklist and will be able to efficiently bulk-add their essential business data (Categories, Suppliers, Customers, and Products) into the system, viewing the results in powerful data tables.

---

### 2. Applied Patterns & Best Practices

This phase is a direct implementation of the application's core architectural and UI/UX philosophies.

- **Architectural Patterns:**

  - **Feature-Based Structure:** All new logic will be organized by feature (e.g., `src/components/features/products/`, `src/hooks/use-products.js`), ensuring high cohesion and modularity as per `guide-7`.
  - **Three-Layer Backend:** All API endpoints (`/api/products`, `/api/categories`, etc.) will strictly follow the `API Layer -> Service/Data Layer` pattern. Prisma queries will be isolated in the data layer, and API routes will handle only HTTP concerns (`guide-13`).
  - **Shared Service Function:** Logic for creating and fetching resources will be written once in the service/data layer and called directly by Server Components for initial loads and by API routes for client-side actions (`guide-7`).

- **Data & State Management:**

  - **Optimistic Updates:** All "Cockpit" forms that add items to a list (`SessionCreationList`) **must** use the full optimistic update pattern with `useMutation` from TanStack Query. This provides the instant feedback crucial to the user experience (`guide-2`).
  - **Server-Side Data Fetching for Tables:** The main `DataTable` views will be populated via server-side data fetching, passing `initialData` to a client component that hydrates a `useQuery` hook (`guide-2`, `guide-8`).
  - **Headless `DataTable`:** All list views will be implemented using a single, reusable `DataTable` component powered by TanStack Table v8, with column definitions (`columns.jsx`) separated for each data type (`guide-11`).

- **UI/UX & Security:**
  - **The "Cockpit" Pattern:** The two-column layout for bulk data entry will be implemented exactly as designed, with a focus on keyboard-first interaction (auto-focus on form fields) (`workflow-phase-1.md`).
  - **The `Modal` for Focused Tasks:** The "edit-in-place" functionality within the `SessionCreationList` and `DataTable` will be handled by a consistent `Modal` component, reinforcing predictability (`workflow-phase-1.md`).
  - **Defense in Depth:** All new authenticated pages (Server Components) will begin with an `await auth()` check to re-verify the session, ensuring UI access is secure (`guide-4`).

---

### 3. Granular Development Tasks

#### **Part 1: Build the Authenticated Application Shell**

- **Task 1.1: Create Authenticated Route Group & Layout**
  - Action: Create a route group `src/app/(dashboard)/`.
  - Action: Create `src/app/(dashboard)/layout.jsx`. This Server Component will fetch the user's session with `await auth()` and redirect to `/login` if unauthenticated.
- **Task 1.2: Build Core Layout Components**
  - Action: Create `src/components/layout/sidebar.jsx`. This Server Component will contain `Link` elements for navigation (Dashboard, Products, Customers, etc.).
  - Action: Create `src/components/layout/topbar.jsx`. This component will include a placeholder for breadcrumbs and the global "New Sale" button.
  - Action: Compose the `Sidebar` and `TopBar` within the `(dashboard)/layout.jsx` to form the main application shell.

#### **Part 2: Extend Database Schema & Create Onboarding UI**

- **Task 2.1: Add Core Business Models to Prisma Schema**
  - Action: Modify `prisma/schema.prisma` to add the `Product`, `Category`, `Supplier`, and `Customer` models. Define all necessary fields and relations (e.g., a `Product` has a `categoryId`). Add `@@index` to all foreign keys (`shopId`, `categoryId`, etc.) for performance.
- **Task 2.2: Run Database Migration**
  - Action: Run the CLI command `npx prisma migrate dev --name add-core-business-models` to apply the schema changes to the database.
- **Task 2.3: Create the Dashboard Onboarding Component**
  - Action: Create the main dashboard page at `src/app/(dashboard)/dashboard/page.jsx`. This file will define the UI for the `/dashboard` route.
  - Action: Create `src/components/features/dashboard/onboarding-component.jsx`.
  - Content: This component will display a welcome message and the guided checklist with buttons linking to the `/new` page for each resource type (e.g., "Go to Categories" links to `/inventory/categories/new`). The `onboarding-component.jsx` will be imported and rendered by the `.../dashboard/page.jsx`.

#### **Part 3: Implement the Full "Cockpit" & "DataTable" Pattern for PRODUCTS**

_We will build the "Products" feature end-to-end first to serve as the template for all other data types._

- **Task 3.1: Create Backend Logic (API, Data Layer, Validation)**
  - Action: Create `src/lib/data/products.js` to house all Prisma queries (`createProduct`, `getProductsByShopId`, `updateProduct`, etc.). All queries must use `select` to fetch only necessary data. List queries must implement pagination.
  - Action: Create `src/lib/zod-schemas.js` and define a `productSchema` for validation.
  - Action: Create `src/app/api/products/route.js`. This API route will handle `GET` and `POST` requests. It will use the `productSchema` for validation, call the corresponding function from `products.js`, and handle all auth checks and error responses.
- **Task 3.2: Create Frontend State Management (Custom Hooks)**
  - Action: Create `src/hooks/use-products.js`.
  - Content: Implement `useCreateProduct`, which will use `useMutation` and the full optimistic update pattern. On `onMutate`, it will update the query cache for the product list. Implement `useGetProducts` which will wrap `useQuery`.
- **Task 3.3: Build the "Cockpit" UI (`/new`)**
  - Action: Create `src/app/(dashboard)/inventory/products/new/page.jsx`. This Server Component will render the two-column Cockpit layout.
  - Action: Create `src/components/features/products/product-form.jsx`. This Client Component will contain the form fields, use the `useCreateProduct` hook, and auto-focus the first field.
  - Action: Create `src/components/features/products/session-creation-list.jsx`. This Client Component will read the product list from the TanStack Query cache to display optimistically updated items. It will include the "Edit" button and logic to open the editing modal.
- **Task 3.4: Build the `DataTable` UI (`/products`)**
  - Action: Create `src/components/features/products/display/product-data-table.jsx`. This file will define the column structure for the products table, including the "Actions" column with an edit dropdown menu.
  - Action: Create the reusable `src/components/ui/data-table.jsx` component based on the `shadcn/ui` example and `guide-11`.
  - Action: Create `src/app/(dashboard)/inventory/products/page.jsx`. This Server Component will fetch the initial list of products and render a client component and avialable static contents, `ProductDisplayList`, passing the data as `initialData`.
  - Action: Create `src/components/features/products/display/product-display-list.jsx`. This Client Component will use the `useGetProducts` hook (hydrated with `initialData`) and render the reusable `DataTable` with the product data and columns.

#### **Part 4: Replicate Pattern for Categories, Suppliers, & Customers**

- **Task 4.1: Apply the End-to-End Pattern**
  - Action: Repeat the sequence of tasks from Part 3 for `Categories`, `Suppliers`, and `Customers`. This involves creating a new set of files for each feature, following the established template:
    - Data layer file (`categories.js`, etc.)
    - API route (`/api/categories/route.js`, etc.)
    - Custom hook (`use-categories.js`, etc.)
    - Cockpit page (`.../categories/new/page.jsx`, etc.)
    - Form component (`category-form.jsx`, etc.)
    - `DataTable` page (`.../categories/page.jsx`, etc.)
    - Column definition file (`category-columns.jsx`, etc.)

---

### 4. Leveraged External Packages & API

- **`@tanstack/react-table` (`v8`)**
  - **Purpose:** To power the headless logic for all `DataTable` components.
  - **API Used:** `useReactTable`, `getCoreRowModel`, `getPaginationRowModel`, `getSortedRowModel`, `ColumnDef`.
- **`@tanstack/react-query` (`v5`)**
  - **Purpose:** For all client-side server state management, including optimistic updates.
  - **API Used:** `useQuery`, `useMutation`, `queryClient.setQueryData`, `queryClient.invalidateQueries`.
- **`zod`**
  - **Purpose:** For strict, schema-based validation of all API request payloads.
  - **API Used:** `z.object`, `z.string`, `z.number`, `.min()`, `.optional()`, `.parse()`.
- **`lucide-react`**
  - **Purpose:** For all UI iconography.
  - **API Used:** `Pencil` (for edit), `Trash2` (for delete), `PlusCircle` (for "Add New"), etc.

---

### 5. Status of Uncompleted Phases

- **Phase 3: Daily Operations (POS & Inventory Intake)** - _Not Started_
- **Phase 4: Business Management & Reporting** - _Not Started_
