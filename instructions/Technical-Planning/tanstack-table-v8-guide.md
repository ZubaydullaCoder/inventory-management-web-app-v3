### **Guide Document 11: Advanced UI Patterns: Integrating TanStack Table for DataTables**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction & Core Philosophy**

This document provides the architectural guidelines for building all data tables in the application (e.g., for products, customers, sales history) using **TanStack Table v8**. This library will serve as the **headless logic engine** for managing table state, while **`shadcn/ui`'s `<Table>` components** will be used for the visual presentation.

The core philosophy is to delegate all complex table state management (sorting, filtering, pagination, etc.) to TanStack Table, keeping our React components clean, declarative, and focused solely on rendering the UI.

**2. Key Concepts of TanStack Table v8**

The AI agent must understand these fundamental v8 concepts:

- **Headless by Design:** The library provides hooks, not components. It manages state and provides helper functions, but it is our job to render the actual `<table>`, `<tr>`, `<td>`, etc.
- **The `useReactTable` Hook:** This is the central hook and the primary entry point to the library. It takes our `data`, `columns`, and state management configuration, and it returns the `table` instance which contains everything needed to build the table.
- **Immutable Core:** The v8 core is framework-agnostic. We will use the `@tanstack/react-table` adapter.
- **Column Definitions are Key:** The `columns` array is where we define the structure of our table. Each column object specifies its `accessorKey` (to link to a data property) and its `header`. This is also where we define how to render the cell's content via the `cell` property.
- **Feature-Based Hooks:** Functionality like sorting, filtering, and pagination is "opt-in." We import specific functions (e.g., `getCoreRowModel`, `getSortedRowModel`, `getPaginationRowModel`) and pass them to the `useReactTable` hook. This keeps the library tree-shakable and performant.

**3. Implementation Strategy & Best Practices**

**3.1. Creating a Reusable `DataTable` Component**

- **Goal:** To create a single, reusable `<DataTable />` component that can be used for all data lists in the application.
- **Structure:**
  - This component will be a **Client Component** (`'use client'`).
  - It will accept two primary props: `data` (the array of items to display) and `columns` (the TanStack Table column definition array).
  - Inside this component, the `useReactTable` hook will be called.
  - The component's return statement will contain the JSX for rendering the table structure, mapping over the state provided by the `table` instance (e.g., `table.getHeaderGroups()`, `table.getRowModel()`).
- **AI Action:** The AI must build this generic `<DataTable />` component as the foundation for all subsequent data tables.

**3.2. Defining Columns**

- **Separation of Concerns:** For each type of data (e.g., Products, Customers), the column definitions should be created in a separate file (e.g., `src/components/features/products/product-columns.js`).
- **Structure:** This file will export a `columns` array. This is where we will define which data fields are shown and how they are formatted.
- **Custom Cells:** The `cell` property in a column definition is a function that allows for custom rendering. This is where we will place JSX, for example, to format a date, display a `Badge` component, or render the "Actions" `DropdownMenu`.
- **AI Action:** When tasked with creating a new data table, the AI will first create the `columns` definition file, then pass that definition to the reusable `<DataTable />` component.

**3.3. Managing State: Server-Side vs. Client-Side**

- **Our Pattern (Server-Side Pagination/Filtering/Sorting):** For our application, all heavy operations like pagination, filtering, and sorting will be handled by the **server** via API calls. The client (TanStack Table) will primarily be responsible for _displaying_ the current state and _notifying_ our application when that state needs to change.
- **Implementation:**
  1.  We will manage the state for sorting, filtering, and pagination ourselves (e.g., using URL query parameters or a simple `useState`).
  2.  We will pass this state into the `state` option of the `useReactTable` hook.
  3.  We will also provide `onSortingChange`, `onGlobalFilterChange`, etc., functions to the hook.
  4.  When a user clicks a sort button, TanStack Table will call our `onSortingChange` function. Inside this function, we will update our state (e.g., update the URL query parameter), which will trigger TanStack Query to refetch the data from the API with the new sorting parameters.
- **AI Action:** The AI must configure `useReactTable` for **manual (server-side) data processing**. It should not use the library's built-in client-side filtering or sorting functions (`getFilteredRowModel`, etc.), as our datasets will be managed by the backend.

**3.4. Integration with `shadcn/ui`**

- **Rendering:** The `DataTable` component will use `shadcn/ui` components for all visual elements: `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableHead>`, `<TableBody>`, `<TableCell>`.
- **Interactivity:** Interactive elements like the "Actions" menu will use `shadcn/ui`'s `<DropdownMenu>`, and filter inputs will use the `<Input>` component.
- **AI Action:** The AI must map the headless state from the `table` instance to the appropriate `shadcn/ui` components to render the final UI.

**4. AI Agent's Responsibility**

- **Prioritize TanStack Table:** The AI must use the `@tanstack/react-table` library for all `DataTable` implementations.
- **Follow the Component Structure:** The AI must create the reusable `<DataTable />` component and separate `columns.js` files for each data type.
- **Configure for Server-Side Data:** The AI must configure the `useReactTable` hook for manual (server-side) sorting, filtering, and pagination.
- **Render with `shadcn/ui`:** The AI must use `shadcn/ui` components for rendering all parts of the table UI.
- **No Manual State Management:** The AI must not attempt to build its own state management for sorting, filtering, or pagination _within_ the `DataTable` component itself. It should rely entirely on the state and handlers provided by the `useReactTable` hook.
