### **Backend Development Breakdown Document**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Implementation Agent
**Project:** Retail Inventory & Finance Manager

**Overall Goal:** To develop all backend functionalities (database, APIs, business logic) and integrate them with the static frontend UI. This process will replace all mock data with live data, implement all asynchronous operation states (loading, error, success), and make the application fully dynamic and interactive as defined in the PRD.

---

### **Phase 0: Database & Authentication Backend**

**Goal of the Phase:** To establish the database schema and implement the core authentication and user session management backend, enabling a secure, logged-in user experience.

**High-Level Instructions/Tasks:**

1.  **Set Up Database:**
    - Create a new project on NeonDB.
    - Obtain the PostgreSQL connection string and add it to the `.env.local` file as `DATABASE_URL`.
2.  **Define Prisma Schema:**
    - Open `prisma/schema.prisma`.
    - Define the initial models required for authentication and basic user context: `User`, `Account`, `Session`, `VerificationToken` (for NextAuth.js compatibility, even if not all are used by Google provider), and a basic `Shop` model to link users together.
    - Add the `Subscription` model with fields for `planId`, `status`, `currentPeriodEnd`, etc.
3.  **Run Initial Database Migration:**
    - **CLI:** Run `npx prisma migrate dev --name init` to sync the schema with the NeonDB database.
4.  **Configure Auth.js Backend:**
    - Open `src/lib/auth.config.js`.
    - Implement the `jwt` and `session` callbacks. In the `jwt` callback, after a user signs in, query your database to find or create a corresponding `User` and `Shop` record. Store the `userId`, `shopId`, and `role` in the JWT token.
    - Ensure the `session` callback exposes these custom properties to the `session` object.
5.  **Integrate Auth Backend with Frontend:**
    - **Task:** Modify the `LoginButton` component. The `signIn('google')` call will now trigger the real authentication flow.
    - **Task:** Modify the `Sidebar` and `TopBar` components. Use `await auth()` in the parent `(dashboard)/layout.jsx` to fetch the real user session. Pass the user's name and email down as props to be displayed.
    - **Task:** Implement the `signOut` functionality in a user dropdown menu in the `TopBar`.

**Applied Best Practices & Patterns:**

- Prisma for schema management and migrations.
- Auth.js JWT callbacks for linking provider accounts to the application's database.
- Prioritizing server-side `await auth()` for fetching session data in layouts.

---

### **Phase 1: Product & Inventory API**

**Goal of the Phase:** To build the backend APIs for all Product, Category, and Inventory management functionalities and connect them to the corresponding frontend UI.

**High-Level Instructions/Tasks:**

1.  **Update Prisma Schema:**
    - Add the `Product` and `Category` models to `schema.prisma`. Define all fields and relations as per the architecture document. Add `@@index` on frequently queried fields like `shopId`.
    - **CLI:** Run `npx prisma migrate dev --name add-product-models`.
2.  **Implement Product API Endpoints:**
    - Create the API route file `src/app/api/products/route.js`.
    - Implement the `POST` handler for creating a new product. It must perform authorization (`await auth()`) to ensure the user is a `Shop Owner` and validation (Zod) on the request body.
    - Implement the `GET` handler for fetching products, including logic for pagination (`take`, `skip`), filtering, and sorting.
3.  **Implement Category API Endpoints:**
    - Create and implement the API routes for CRUD operations on Categories.
4.  **Integrate the "Cockpit" Pages:**
    - **Task:** Modify the "Add New Product" page (`/inventory/products/new`).
    - Wire up the `Form` using `react-hook-form` and `zod` for validation.
    - On submit, use `useMutation` from TanStack Query to call the `POST /api/products` endpoint.
    - **Task:** The `SessionCreationList` on the right should now be a dynamic list. After a successful mutation, invalidate the relevant query to refetch the list and display the newly added item.
    - **Task:** Install `sonner` for notifications. **CLI:** `npx shadcn-ui@latest add sonner`. Add the `<Toaster />` component to the root layout. On mutation `onSuccess` or `onError`, call `toast.success('Product added!')` or `toast.error('Failed to add product.')`.
5.  **Integrate the `DataTable` Pages:**
    - **Task:** Modify the `/inventory/products` page.
    - Replace the mock data in the `DataTable` with a `useSuspenseQuery` call to the `GET /api/products` endpoint.
    - Implement the client-side filtering logic, which will trigger a refetch of the query with new filter parameters.
6.  **Integrate the "Edit Product" Intercepted Modal:**
    - **Task:** The modal at `/@modal/(.)products/edit/[id]` should now fetch the specific product's data using `useSuspenseQuery` and the `id` from the params.
    - **Task:** The `ProductEditForm` within the modal will use a `useMutation` hook to call a `PUT /api/products/[id]` endpoint.
    - On successful update, the mutation's `onSuccess` callback should invalidate the main product list query to ensure the `DataTable` shows the updated data when the modal closes.

**Applied Best Practices & Patterns:**

- RESTful API design for resources.
- Defense in Depth: Authorization (`auth()`) and validation (Zod) in every API route.
- Integration of TanStack Query's `useMutation` and `useSuspenseQuery`.
- User feedback via `sonner` toasts.

---

### **Phase 2: Sales & Customer API**

**Goal of the Phase:** To build the backend for the most critical and complex workflows: processing sales and managing customer credit.

**High-Level Instructions/Tasks:**

1.  **Update Prisma Schema:**
    - Add the `Sale`, `SaleItem`, `Customer`, and `CustomerCreditLog` models. Define all relations (e.g., a `Sale` has many `SaleItem`s, a `Sale` belongs to a `Customer`).
    - **CLI:** Run `npx prisma migrate dev --name add-sales-models`.
2.  **Implement Sales API Endpoint:**
    - Create `src/app/api/sales/route.js`.
    - Implement the `POST` handler. This is a critical transaction.
    - **Task:** The logic **must** be wrapped in `prisma.$transaction()`.
    - Inside the transaction:
      1.  Create the `Sale` record.
      2.  Create all associated `SaleItem` records.
      3.  Decrement the `stock` for each `Product` involved.
      4.  If it's an "On Account" sale, update the `outstandingBalance` on the `Customer` model.
3.  **Implement Customer API Endpoints:**
    - Create API routes for CRUD operations on Customers.
4.  **Integrate the Sales (POS) Screen:**
    - **Task:** The `ProductSearchInput` should now use a `useQuery` to fetch search results from a dedicated search endpoint as the user types (use debouncing).
    - **Task:** The state of the in-progress transaction (the list of `TransactionLineItem`s) will be managed by a client-side state manager (Zustand).
    - **Task:** The "Complete Sale (Cash)" and "Finalize On Account" buttons will trigger a `useMutation` hook that sends the entire transaction state to the `POST /api/sales` endpoint.
    - On `onSuccess`, clear the Zustand store and show a success toast.
5.  **Integrate the "Finalize On Account" Modal:**
    - **Task:** The `CreatableSelect` component should now fetch existing customers from the `GET /api/customers` endpoint.
    - If a new customer is created, it should call the `POST /api/customers` endpoint first, before proceeding with the sale finalization.

**Applied Best practices & Patterns:**

- Database transactions (`prisma.$transaction`) for atomic operations.
- Zustand for managing complex, client-side state (the in-progress sale).
- Debouncing for search inputs to prevent excessive API calls.

---

### **Phase 3: Reporting & Subscription Logic Backend**

**Goal of the Phase:** To build the backend logic for aggregating data for reports and enforcing subscription limitations.

**High-Level Instructions/Tasks:**

1.  **Implement Reporting API Endpoints:**
    - Create new API routes (e.g., `/api/reports/summary`).
    - These endpoints will contain complex Prisma queries using aggregation features like `_sum`, `_count`, and `groupBy` to calculate metrics (Total Sales, Total Profit) over a given date range.
2.  **Integrate Dashboard Widgets:**
    - **Task:** Connect the `StatCard`s and `ActionableWidget`s on the main dashboard page to the new reporting endpoints using `useSuspenseQuery`.
    - **Task:** The `DateRangePicker` will now act as a filter, passing its date range to the queries to refetch the report data.
3.  **Integrate Reports & History Page:**
    - **Task:** Connect the `DataTable`s in each tab of the `/reports` page to their respective data sources (e.g., an API route that returns a paginated list of all `Sale` records).
4.  **Implement Subscription Logic Backend:**
    - **Task:** Create a middleware or utility function that can be used in API routes to check subscription status.
    - The function will take the `shopId` from the session, look up the shop's `Subscription` status in the DB, and check the current `productCount` or `userCount` against the plan's limits.
    - **Task:** In the `POST /api/products` route, before creating a new product, call this utility. If the user is over their limit, return a `403 Forbidden` error with a clear message.
5.  **Integrate Subscription UI:**
    - **Task:** The "Subscription Management" page should now fetch the user's actual subscription status from the backend.
    - **Task:** The simulated "Confirm Subscription" flow will now use a `useMutation` to call an API route that updates the user's `Subscription` record in the database.

**Applied Best Practices & Patterns:**

- Prisma's `aggregate` and `groupBy` features for efficient reporting queries.
- Backend-driven authorization based on business logic (subscription limits).
- Clear separation of reporting queries from transactional queries.
