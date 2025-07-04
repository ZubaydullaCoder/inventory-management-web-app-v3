### **Guide 11: Headless Data Tables with Tanstack Table v8**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction & Core Philosophy**

This document outlines the architectural strategy for implementing all data tables in the application using **Tanstack Table v8**. This library is the designated engine for fulfilling **Pattern 1: The `DataTable` Ecosystem** from our UI/UX design guide.

The core philosophy is to leverage Tanstack Table as a **headless utility**. It will manage all complex table logic (state, data processing, APIs), while we retain 100% control over the UI rendering using our standard React components and `shadcn/ui` structure.

**2. Key Architectural Concepts (v8 Paradigm)**

The AI agent must understand and implement the following v8 concepts:

- **Headless by Design:** The library provides hooks and helper functions, not pre-styled components. The AI will be responsible for mapping the library's output to our custom JSX (`<table>`, `<tr>`, `<td>`, etc.) styled with Tailwind CSS.
- **Immutability:** The library treats data as immutable. It does not modify the original data array.
- **Column Definitions are Central:** The `columns` array is the primary configuration object. It defines the data accessor, the header, and how each cell should be rendered.
- **Explicit State Management:** Unlike v7, v8 requires you to explicitly manage the table's state (e.g., sorting, filtering, pagination). This gives us more control and makes it easier to hook into server-side data operations.

**3. The Implementation Pattern**

The AI agent will create a reusable, high-level `DataTable` component. This component will follow the structure established by `shadcn/ui`'s `DataTable` examples, which are built on Tanstack Table v8. The implementation will follow these logical steps:

#### **Step 1: Column Definition (`columns.jsx`)**

- For each type of data table (Products, Customers, Sales), a `columns.jsx` file will be created.
- This file will export an array of column definition objects.
- Each column object will define:
  - `accessorKey`: The key in the data object to display (e.g., `'sellingPrice'`).
  - `header`: The text or JSX for the column header.
  - `cell`: A function that receives the cell's context and returns the JSX for the cell's content. This is where we will render custom components, format data (e.g., currency), or create "Actions" dropdown menus.

#### **Step 2: The Reusable `DataTable` Component (`DataTable.jsx`)**

- This component will be the main wrapper. It will be responsible for taking the `data` and `columns` as props.
- Inside this component, the AI will use the `useReactTable` hook.
- The `useReactTable` hook will be configured with:
  - The `data` and `columns`.
  - **State Management:** It will be hooked into React `useState` for managing sorting, filtering, pagination, and row selection.
  - **Getter Functions:** It will be configured with the necessary `getCoreRowModel`, `getPaginationRowModel`, `getSortedRowModel`, etc.

#### **Step 3: Rendering the UI**

- The `DataTable` component will not render a hardcoded table. Instead, it will map over the state provided by the `useReactTable` instance.
- It will iterate through `table.getHeaderGroups()` to render the table headers.
- It will iterate through `table.getRowModel().rows` to render the table body rows and cells.
- This approach ensures that our UI is perfectly synchronized with the table's state (e.g., showing sorted or filtered rows).

#### **Step 4: Integrating Interactivity**

- **Pagination:** The component will render "Previous" and "Next" buttons that call `table.previousPage()` and `table.nextPage()`. The disabled state of these buttons will be driven by `table.getCanPreviousPage()` and `table.getCanNextPage()`.
- **Filtering:** An `<Input>` component will be placed above the table. Its `onChange` event will update the filtering state, which is passed to the `useReactTable` hook.
- **Sorting:** The `onClick` event on the column headers will call the column's `getToggleSortingHandler()`. The component will render sorting direction icons based on the column's `getIsSorted()` state.

**4. Server-Side Data Operations**

Our application will frequently use server-side pagination, sorting, and filtering for performance. Tanstack Table is designed for this.

- **The Pattern:**
  1.  The `DataTable` component's state (current page, sort direction, filter query) will be managed by `useState`.
  2.  These state variables will be passed as parameters to our Tanstack Query `useSuspenseQuery` hook.
  3.  The query hook will include these parameters in the API call to our backend (e.g., `/api/products?page=2&sortBy=name`).
  4.  The API endpoint will use these query parameters in the Prisma query (`take`, `skip`, `orderBy`).
  5.  The API will return the paginated data and the total item count.
- **Configuration:** The `useReactTable` hook will be configured with `manualPagination: true`, `manualSorting: true`, etc., to tell it that the data processing is happening on the server.

**5. AI Agent's Responsibility**

- **Install the Library:** The first step for any feature using a data table will be to ensure `@tanstack/react-table` is installed.
- **Follow the `shadcn/ui` Structure:** The AI must use the `shadcn/ui` `DataTable` component as the primary reference for building our reusable table component.
- **Separate Column Definitions:** For every new data table, the AI must create a separate `columns.jsx` file to define its structure. This promotes modularity.
- **Implement Server-Side Logic:** When a table is expected to handle large amounts of data, the AI must implement the server-side data operations pattern described above.
- **Render Custom Cells:** The AI must use the `cell` renderer function in the column definitions to integrate custom components, such as the "Actions" `DropdownMenu` from `shadcn/ui`.
