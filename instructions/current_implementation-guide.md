Analysis and Review of Product Display Workflow
This analysis evaluates the technical implementation of the product display feature, focusing on separation of concerns, code reusability, and performance, while identifying areas for improvement.

Step 1: Intent Clarification & Request Evaluation
The request is to analyze the existing implementation for displaying products in a data table. The goal is to evaluate the code against best practices like DRY (Don't Repeat Yourself), SoC (Separation of Concerns), clean code, and performance, and then propose a refactoring plan. The request is clear and actionable.

Step 2: What Do We Implement?
Current Behavior: The application displays a paginated list of products. The initial page is fetched on the server (products/page.jsx) for fast initial load. Subsequent interactions (pagination, sorting, filtering) are handled on the client in ProductDisplayList.jsx. This component uses the useGetProducts hook for data fetching but manages its own table state and logic, duplicating functionality from a generic DataTable component that already exists in the UI library. A significant drawback is that sorting and filtering are performed only on the client-side for the currently visible page, which provides an incomplete and potentially misleading user experience as it doesn't apply to the entire dataset.

Proposed Behavior After Implementation: The refactored implementation will improve user experience and code quality. ProductDisplayList.jsx will be simplified to delegate all table rendering and state management to the reusable DataTable component, eliminating redundant code. Crucially, sorting and filtering will be moved server-side. When a user sorts a column or filters the results, the table will now send a request to the backend API, which will return a correctly sorted and filtered list from the entire product database. This ensures that the user is always interacting with the complete and accurate dataset, leading to a more intuitive and reliable interface.

Step 3: How Do We Implement?
Enable Server-Side Operations:

API (/api/products/route.js): Update the GET handler to accept sort, order, and filter query parameters.
Data Access (/lib/data/products.js): Modify getProductsByShopId to use these new parameters to construct a Prisma query with orderBy and where clauses for sorting and filtering.
Data Fetching Hook (/hooks/use-product-queries.js): Enhance the useGetProducts hook to accept sorting and filtering state and pass it to the API.
Refactor the Frontend:

Product List (/components/features/products/display/product-display-list.jsx): This is the core of the refactor.
Remove the local useReactTable instance and its associated state management (sorting, columnFilters, etc.).
Import and use the generic DataTable component from @/components/ui/data-table.jsx.
Pass the necessary props to DataTable, including the data from useGetProducts, the productColumns, and state handlers (onSortingChange, onColumnFiltersChange, onPaginationChange) that will update the component's state and trigger new data fetches.
Configure the table for full manual (server-side) operations by setting manualSorting and manualFiltering to true.
Update Column Definitions:

Table Columns (/components/features/products/display/product-table-columns.jsx): Ensure the accessorKey for each column matches the corresponding field name in the Prisma schema to facilitate server-side sorting. For example, the "Category" column's accessorKey will be changed from category to category.name to allow direct sorting on the category's name field.
This approach centralizes table logic in the DataTable component, adheres to the DRY principle, and fixes the incorrect client-side sorting/filtering by moving it to the server, resulting in a more robust and maintainable feature.

Step 4: Final Plan Summary
Files to be Updated:

route.js: To handle new query params for sorting/filtering.
products.js: To update the Prisma query.
use-product-queries.js: To pass sorting/filtering state to the API.
product-display-list.jsx: To use the generic DataTable and manage server-side operations.
product-table-columns.jsx: To align accessor keys with database fields for sorting.
Relevant npm Packages:

@tanstack/react-query: Already in use, will be leveraged for server state management.
@tanstack/react-table: Already in use, will be leveraged via the generic DataTable component.
CLI Commands:

No new packages or commands are required.
Reused Components:

@/components/ui/data-table.jsx: The existing generic DataTable will be reused to render the products table, which is the core of this refactor.
