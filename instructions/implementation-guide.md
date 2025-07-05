Of course. Here are the descriptive technical instructions for the Claude AI model to implement Tasks 3.3 and 3.4. These instructions focus on component composition, prop drilling, and hook usage, leaving the specific UI and styling implementation to Claude's strengths.

---

### **AI Agent (Claude) Task Instructions: Product "Cockpit" and `DataTable` UI**

**Objective:** To build the complete user interface for creating and viewing products, leveraging the hooks and components created in previous steps. This involves implementing the two-column "Cockpit" for bulk creation and the main `DataTable` for viewing the product list.

### **Task 3.3: Build the "Cockpit" UI (`/new`)**

**1. Create the Cockpit Page Component (The Orchestrator):**

- **File Path:** `src/app/(dashboard)/inventory/products/new/page.jsx`
- **Component Type:** This **must** be a **React Server Component**.
- **Primary Responsibility:** To set up the two-column layout and render the client-side components that provide the interactive experience.

- **Implementation Steps:**
  1.  **Import Components:** Import `ProductForm` and `SessionCreationList` (which you will create next).
  2.  **Structure the Layout:**
      - Render a main container that creates a responsive two-column grid.
      - In the left column, render the `<ProductForm />` component.
      - In the right column, render the `<SessionCreationList />` component.

**2. Create the Product Form Component:**

- **File Path:** `src/components/features/products/product-form.jsx`
- **Component Type:** This **must** be a **Client Component** (`'use client'`).
- **Primary Responsibility:** To handle user input for a new product and trigger the creation mutation.

- **Implementation Steps:**
  1.  **Import Hooks and Components:**
      - Import `useCreateProduct` from `src/hooks/use-products.js`.
      - Import form-related `shadcn/ui` components (`Input`, `Label`, etc.) and `PrimaryButton`.
  2.  **Instantiate the Mutation Hook:**
      - Call `const createProductMutation = useCreateProduct();` at the top of the component.
  3.  **Manage Form State:**
      - Use `useState` to manage the state of each form input field (e.g., `name`, `sellingPrice`).
  4.  **Implement the Submit Handler:**
      - Create an `handleSubmit` function. This function will:
        - Prevent the default form submission.
        - Call `createProductMutation.mutate(...)`, passing it an object with the current form state.
        - After calling `mutate`, reset all form state variables to their initial empty values.
  5.  **Auto-focus on Mount:**
      - Use `useRef` and `useEffect` with an empty dependency array `[]` to programmatically set focus on the "Product Name" input field when the component first renders.
  6.  **Render the Form:**
      - Render a `<form>` element with an `onSubmit` handler pointing to your `handleSubmit` function.
      - Render all necessary input fields (`name`, `sellingPrice`, `purchasePrice`, etc.).
      - Render a `PrimaryButton` with `type="submit"`. The button's text should be "Save and Add Another". Add a disabled state bound to `createProductMutation.isPending`.

**3. Create the Session Creation List Component:**

- **File Path:** `src/components/features/products/session-creation-list.jsx`
- **Component Type:** This **must** be a **Client Component** (`'use client'`).
- **Primary Responsibility:** To display the list of products being added in the current session, reflecting the optimistic updates from the form.

- **Implementation Steps:**
  1.  **Import Hooks:** Import `useGetProducts` from `src/hooks/use-products.js`.
  2.  **Fetch Data from Cache:**
      - Call `const { data } = useGetProducts({ page: 1, limit: 10 });`. TanStack Query will provide the data from the cache, which is being optimistically updated by the `ProductForm`.
  3.  **Render the List:**
      - Map over `data?.products` to render a list of the newly created items.
      - For each item, display key information like the product name and price.
      - Each item should have an "Edit" button. For now, this button can be a placeholder; its modal functionality will be implemented later.
      - Handle the empty state: if `data?.products` is empty, display a message like "Products you add will appear here."

---

### **Task 3.4: Build the `DataTable` UI (`/products`)**

**1. Create the Column Definitions:**

- **File Path:** `src/components/features/products/product-columns.jsx`
- **Component Type:** This **must** be a **Client Component** (`'use client'`).
- **Primary Responsibility:** To define the structure and rendering logic for the columns in the products `DataTable`.

- **Implementation Steps:**
  1.  **Export a `columns` Array:** This file's default export should be an array named `columns`.
  2.  **Define Columns:** Create objects in the array for each column you want to display (e.g., "Name", "Selling Price", "Stock", "Category").
      - Use the `accessorKey` property to link to the data field (e.g., `'name'`).
      - Use the `header` property to define the column title.
  3.  **Define the "Actions" Column:**
      - Create a final column object for actions. It will not have an `accessorKey`.
      - Use the `cell` property to render a function. This function should return JSX for the `shadcn/ui` `DropdownMenu`, containing "Edit" and "Delete" items.

**2. Create the Reusable `DataTable` Component:**

- **File Path:** `src/components/ui/data-table.jsx`
- **Component Type:** This **must** be a **Client Component** (`'use client'`).
- **Primary Responsibility:** To provide a generic, reusable table component powered by TanStack Table v8.

- **Implementation Steps:**
  - Follow `guide-11-tanstack-table-v8-guide.md` and the official `shadcn/ui` `DataTable` example.
  - The component must accept `columns` and `data` as props.
  - Use the `useReactTable` hook to manage table state (sorting, filtering, pagination).
  - Map over the `table` instance's state to render the `<thead>`, `<tbody>`, and pagination controls.

**3. Create the Product List Page (Orchestrator):**

- **File Path:** `src/app/(dashboard)/inventory/products/page.jsx`
- **Component Type:** This **must** be a **React Server Component**.

- **Implementation Steps:**
  1.  **Import necessary components/functions:** `getProductsByShopId`, `ProductListClient`, and `Suspense`.
  2.  **Fetch Initial Data:** Call `await getProductsByShopId(...)` to get the first page of products on the server.
  3.  **Render with Suspense:**
      - Render a `<Suspense>` boundary with a fallback (e.g., a `<TableSkeleton />`).
      - Inside `Suspense`, render the `<ProductListClient />` component, passing the fetched data to an `initialData` prop.

**4. Create the Product List Client Component:**

- **File Path:** `src/components/features/products/product-list-client.jsx`
- **Component Type:** This **must** be a **Client Component** (`'use client'`).

- **Implementation Steps:**
  1.  **Import hooks and components:** `useGetProducts`, `productColumns`, and `DataTable`.
  2.  **Accept `initialData` Prop:** The component must accept the `initialData` prop from its parent Server Component.
  3.  **Initialize Query:**
      - Call `useGetProducts(...)`, passing the `initialData` to the `initialData` option of the `useQuery` hook. This will prevent a re-fetch on initial load.
  4.  **Render the Table:**
      - Render the `<DataTable />` component, passing `columns={productColumns}` and `data={data?.products || []}`.
