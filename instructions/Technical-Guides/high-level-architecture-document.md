### **High-Level Architecture: Retail Inventory & Finance Manager (Definitive Edition)**

**Version:** 1.1  
**Date:** June 3, 2025  
**Target Audience:** AI Development Agent  
**Project:** Retail Inventory & Finance Manager

**1. Introduction & Core Architectural Philosophy**

This document defines the technical architecture for the application. It is built upon a set of modern, performant, and maintainable patterns detailed in the project's 13 guide documents.

The core philosophy is a **Hybrid, Server-First approach** using the **Next.js App Router**.

- **Framework:** Next.js (App Router) with JavaScript + JSDoc for type safety.
- **Data Fetching:** A hybrid model where Server Components handle initial data loads via internal `fetch` calls (leveraging the Next.js Data Cache), and TanStack Query manages all client-side state and mutations.
- **UI Rendering & State:** A Suspense-based model where Server Components orchestrate the layout and wrap data-dependent Client Components in `<Suspense>` boundaries. Modals for specific resources (e.g., editing an item) **must** be implemented using a **traditional modal component** rendered in the React tree, not via intercepting or parallel routes.
- **Optimistic Updates:** All client-side mutations that affect lists or tables (e.g., product CRUD, sales, stock) **must** implement optimistic updates using TanStack Query, so the UI reflects changes instantly.
- **Database:** NeonDB (PostgreSQL) accessed exclusively via the Prisma ORM.
- **Authentication:** Auth.js (NextAuth.v5) with a Google-only, JWT-based session strategy.
- **Data Tables:** All tabular data **must** be rendered using a reusable `DataTable` component powered by **Tanstack Table v8**.
- **Security:** A "Defense in Depth" model with validation and authorization checks at the middleware, page, and API route layers.

**2. Directory Structure**

The project will adhere to the following structure within the `src/` directory. The AI agent must place all new files in their designated locations.

```
src/
├── app/
│   ├── (dashboard)/              # Route group for protected dashboard layout
│   │   ├── products/
│   │   │   ├── [id]/             # Product detail/edit routes
│   │   │   │   └── edit/
│   │   │   │       └── page.jsx  # Edit product page (renders modal in tree)
│   │   │   └── page.jsx          # Main product list page
│   │   ├── layout.jsx            # Shared dashboard layout
│   │   └── loading.jsx           # Global dashboard loading skeleton
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.js          # Auth.js catch-all route
│   │   └── products/
│   │       └── route.js          # API for products
│   ├── login/
│   │   └── page.jsx              # Login page/modal
│   ├── layout.jsx                # Root layout
│   └── error.jsx                 # Root error boundary
├── components/
│   ├── features/                 # Large, feature-specific components
│   │   └── products/
│   │       └── ProductListClient.jsx
│   ├── ui/                       # Reusable, generic UI components (from shadcn/ui)
│   │   ├── DataTable.jsx         # Our reusable Tanstack Table component
│   │   └── Modal.jsx             # A generic modal wrapper for traditional modals
│   └── providers/                # All React context providers
├── hooks/                        # Custom React hooks (e.g., useProducts)
├── lib/
│   ├── api/                      # Functions that implement API logic
│   ├── data/                     # Functions that directly access the DB (Prisma)
│   ├── services/                 # Functions for complex business logic
│   ├── queryKeys.js              # Constants for TanStack Query keys
│   ├── auth.config.js            # Auth.js configuration
│   ├── prisma.js                 # Prisma client singleton instance
│   ├── types.js                  # Central JSDoc @typedef definitions
│   └── utils.js                  # Generic utility functions
├── middleware.js                 # Next.js middleware for route protection
└── jsconfig.json                 # JS configuration for aliases and type-checking
```

**3. Data Flow Diagrams**

These diagrams illustrate the primary interaction patterns.

**3.1. Flow 1: Initial Page Load (Hybrid Approach - Viewing Products)**

This flow remains the same and is our core SSR + Caching strategy.

```
USER         BROWSER           NEXT.JS SERVER                      DATABASE (Neon)
  | --GET /products--> |               |                               |
  |              | --Request------> |                               |
  |              |               | [ProductsPage.jsx (Server Comp)]  |
  |              |               | --fetch('/api/products')--------> |
  |              |               | [Next.js Data Cache Check]        |
  |              |               | [/api/products/route.js]          |
  |              |               | --prisma.product.findMany()-----> |
  |              |               |                                 | --Return Products--> |
  |              |               | <----Return Products------------- |
  |              |               | [Render <Suspense> + Pass initialData] |
  | <----HTML/RSC Payload-------- |                               |
  | [Renders Page] |               |                               |
  | [ProductListClient.jsx mounts] |                               |
  | [useSuspenseQuery hydrates from initialData] |                   |
```

**3.2. Flow 2: Opening an "Edit Product" Modal (Traditional Modal Approach)**

This flow illustrates the new modal strategy using a traditional React modal.

```
USER         BROWSER (DataTable)      URL BAR             NEXT.JS ROUTER
  | --Click "Edit" button-----------> |                   |
  |              |                   |                   |
  |              | [Opens Modal in React tree]            |
  |              | [Modal overlays current page]          |
  |              | [URL may update via shallow routing]   |
  |              | [Modal closes on action or cancel]     |
  |              | [UI updates via TanStack Query]        |
```

**4. API Endpoint Specification (MVP)**

This list remains unchanged.

- **Products:** `GET /api/products`, `POST /api/products`, `GET /api/products/[id]`, `PUT /api/products/[id]`, `DELETE /api/products/[id]`
- **Sales:** `POST /api/sales`
- **Inventory:** `POST /api/inventory/adjust`
- **Customers & Credit:** `GET /api/customers`, `POST /api/customers`, `POST /api/credit`
- **Authentication:** `GET /api/auth/*`, `POST /api/auth/*`

**5. Authentication & Authorization Flow**

This flow is now based on traditional modal usage for login.

1.  A user requests a protected route (e.g., `/dashboard`).
2.  `middleware.js` intercepts and redirects to `/login`.
3.  The browser navigates to `/login`. The login UI is rendered as a traditional modal over the current page, not via intercepting route.
4.  The user clicks "Continue with Google," triggering the `signIn()` function.
5.  After success, Auth.js redirects to `/dashboard`.
6.  `middleware.js` allows the request, and the dashboard page loads.

**6. Database Schema Overview**

This list remains unchanged.

- `User`, `Product`, `Category`, `Sale`, `SaleItem`, `Customer`, `CustomerCreditLog`, `Subscription`.

**7. AI Agent Implementation Notes**

- **Adhere to All Guides:** All generated code must strictly follow the 13 detailed guide documents.
- **Implement the Holy Trinity of UI Patterns:**
  1.  **Hybrid Fetching:** All initial page data loads must use the Server Component `fetch` -> API Route -> Prisma pattern.
  2.  **Suspense for Loading:** All data-dependent Client Components must be wrapped in `<Suspense>` with a fallback.
  3.  **Traditional Modals:** All resource-specific modals (edit, view details) must use a traditional modal component rendered in the React tree, not intercepting or parallel routes.
- **Optimistic Updates:** All CRUD operations that affect lists or tables must use optimistic updates for instant UI feedback, following the TanStack Query guide.
- **Use Tanstack Table:** All tabular data must be implemented using our reusable `DataTable` component powered by Tanstack Table v8.
- **Isolate Logic:** Strictly maintain the separation between API routes, service functions, and data access functions as defined in the Backend Design System.
- **Security is Paramount:** Implement "Defense in Depth" by checking authorization at all required layers.
