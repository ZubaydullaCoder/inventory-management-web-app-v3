### **High-Level Architecture: Retail Inventory & Finance Manager**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction & Core Architectural Philosophy**

This document defines the technical architecture for the application. It is built upon a set of modern, performant, and maintainable patterns detailed in the project's nine guide documents.

The core philosophy is a **Hybrid, Server-First approach** using the **Next.js App Router**.

- **Framework:** Next.js (App Router) with JavaScript + JSDoc for type safety.
- **Data Fetching:** A hybrid model where Server Components handle initial data loads via internal `fetch` calls (leveraging the Next.js Data Cache), and TanStack Query manages all client-side state and mutations.
- **UI Rendering:** A Suspense-based model where Server Components orchestrate the layout and wrap data-dependent Client Components in `<Suspense>` boundaries for an excellent perceived performance.
- **Database:** NeonDB (PostgreSQL) accessed exclusively via the Prisma ORM.
- **Authentication:** Auth.js (NextAuth.v5) with a Google-only, JWT-based session strategy.
- **Security:** A "Defense in Depth" model with validation and authorization checks at the middleware, page, and API route layers.

**2. Directory Structure**

The project will adhere to the following structure within the `src/` directory. The AI agent must place all new files in their designated locations.

```
src/
├── app/
│   ├── (dashboard)/              # Route group for protected dashboard layout
│   │   ├── dashboard/
│   │   │   └── page.jsx          # Main dashboard page
│   │   ├── products/
│   │   │   └── page.jsx          # Product list page
│   │   ├── layout.jsx            # Shared dashboard layout (sidebar, header)
│   │   └── loading.jsx           # Global dashboard loading skeleton
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.js          # Auth.js catch-all route
│   │   ├── products/
│   │   │   └── route.js          # API for getting/creating products
│   │   └── sales/
│   │       └── route.js          # API for finalizing sales
│   ├── login/
│   │   └── page.jsx              # Custom login page
│   ├── layout.jsx                # Root layout (fonts, providers)
│   ├── globals.css               # Global styles for Tailwind
│   └── error.jsx                 # Root error boundary
├── components/
│   ├── features/                 # Large, feature-specific components
│   │   ├── products/
│   │   │   └── ProductListClient.jsx
│   │   └── sales/
│   │       └── SalesScreen.jsx
│   ├── ui/                       # Reusable, generic UI components (from shadcn/ui)
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Input.jsx
│   └── providers/                # All React context providers
│       ├── QueryProvider.jsx
│       └── SessionProviderWrapper.jsx
├── hooks/                        # Custom React hooks (e.g., useProducts)
├── lib/
│   ├── api/                      # Functions that implement API logic
│   ├── data/                     # Functions that directly access the DB (Prisma)
│   ├── services/                 # Functions for complex business logic (e.g., transactions)
│   ├── queryKeys.js              # Constants for TanStack Query keys
│   ├── auth.config.js            # Auth.js configuration
│   ├── prisma.js                 # Prisma client singleton instance
│   ├── types.js                  # Central JSDoc @typedef definitions
│   └── utils.js                  # Generic utility functions (e.g., currency formatting)
├── middleware.js                 # Next.js middleware for route protection
└── jsconfig.json                 # JS configuration for aliases and type-checking
```

**3. Data Flow Diagrams**

These diagrams illustrate the primary interaction patterns.

**3.1. Flow 1: Initial Page Load (Hybrid Approach - Viewing Products)**

This flow demonstrates our core SSR + Caching strategy.

```
USER         BROWSER           NEXT.JS SERVER                      DATABASE (Neon)
  | --GET /products--> |               |                               |
  |              | --Request------> |                               |
  |              |               | [ProductsPage.jsx (Server Comp)]  |
  |              |               | --fetch('/api/products')--------> |
  |              |               | [Next.js Data Cache Check]        |
  |              |               |   (Cache HIT? -> Skip to step 8)  |
  |              |               |   (Cache MISS? -> Continue)       |
  |              |               | [/api/products/route.js]          |
  |              |               | --prisma.product.findMany()-----> |
  |              |               |                                 | --Return Products--> |
  |              |               | <----Return Products------------- |
  |              |               | [Cache Response]                  |
  |              |               | [Render <Suspense> + Pass initialData] |
  | <----HTML/RSC Payload-------- |                               |
  | [Renders Page] |               |                               |
  | [ProductListClient.jsx mounts] |                               |
  | [useSuspenseQuery hydrates from initialData] |                   |
  | [UI is interactive] |                                           |
```

**3.2. Flow 2: Data Mutation (Finalizing a Sale)**

This flow demonstrates our client-side mutation and security pattern.

```
USER         BROWSER (SalesScreen.jsx)   NEXT.JS SERVER                      DATABASE (Neon)
  | --Click "Finalize"--> |                       |                               |
  |              | [useMutation hook runs]   |                               |
  |              | --POST /api/sales------> |                               |
  |              |                       | [/api/sales/route.js]             |
  |              |                       | --auth() check------------------> | (Checks session)
  |              |                       | [Validate data with Zod]          |
  |              |                       | --saleService.finalizeSale()----> |
  |              |                       | [prisma.$transaction starts]      |
  |              |                       |                                 | --CREATE Sale--> |
  |              |                       |                                 | --UPDATE Product stock--> |
  |              |                       | <----Success/Error--------------- |
  |              | <----JSON Response--------- |                               |
  |              | [onSuccess callback]      |                               |
  |              | [queryClient.invalidateQueries()] |                       |
```

**4. API Endpoint Specification (MVP)**

The application will expose the following RESTful endpoints:

- **Products**
  - `GET /api/products`: Get a paginated list of products.
  - `POST /api/products`: Create a new product.
  - `GET /api/products/[id]`: Get a single product.
  - `PUT /api/products/[id]`: Update a product.
  - `DELETE /api/products/[id]`: Conditionally delete a product.
- **Sales**
  - `POST /api/sales`: Finalize a new sale transaction.
- **Inventory**
  - `POST /api/inventory/adjust`: Perform a manual stock adjustment.
- **Customers & Credit**
  - `GET /api/customers`: Get a list of customers.
  - `POST /api/customers`: Create a new customer.
  - `POST /api/credit`: Log a new credit transaction for a customer.
- **Authentication**
  - `GET /api/auth/*`, `POST /api/auth/*`: Handled by Auth.js.

**5. Authentication & Authorization Flow**

1.  A user requests a protected route (e.g., `/dashboard`).
2.  `middleware.js` intercepts the request and uses `auth()` to check for a valid session cookie.
3.  If no session exists, the user is redirected to `/login`.
4.  The user clicks "Sign in with Google," triggering the `signIn('google')` function.
5.  After successful Google authentication, Auth.js creates a JWT session cookie and redirects the user back to `/dashboard`.
6.  `middleware.js` runs again, finds the valid session, and allows the request to proceed.
7.  The `DashboardPage.jsx` Server Component can now use `await auth()` to securely access user session data.

**6. Database Schema Overview**

The following models will be defined in `schema.prisma`.

- **`User`**: Stores user information from Google. Linked to all primary data.
- **`Product`**: The core inventory item model. Includes fields like `name`, `sellingPrice`, `purchasePrice`, `stock`.
- **`Category`**: For organizing products.
- **`Sale`**: A record of a single transaction. Includes total amount and timestamp.
- **`SaleItem`**: A line item in a sale, linking a `Sale` to a `Product` and storing the quantity and price at the time of sale.
- **`Customer`**: Basic information for customers who take items on credit.
- **`CustomerCreditLog`**: A log of items taken on credit and repayments.
- **`Subscription`**: Manages the user's plan status (`Trial`, `Basic`, `Standard`) and expiry dates.

**7. AI Agent Implementation Notes**

- **Adhere to Guides:** All generated code must strictly follow the nine detailed guide documents.
- **Follow the Hybrid Pattern:** All initial page data loads must use the Server Component `fetch` -> API Route -> Prisma pattern.
- **Use Suspense:** All data-dependent Client Components must be wrapped in `<Suspense>` with a fallback.
- **Isolate Logic:** Strictly maintain the separation between API routes, service functions, and data access functions.
- **Security is Paramount:** Implement "Defense in Depth" by checking authorization at all required layers.
