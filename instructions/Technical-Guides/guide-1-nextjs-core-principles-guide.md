**Guide Document 1: Modern Next.js: Core Principles, Patterns & Component Architecture (JavaScript + JSDoc Edition)**

**Version:** 1.1
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction**

This document outlines the core principles, patterns, and architectural strategies for developing the "Retail Inventory & Finance Manager" application using Next.js (App Router). The application will be written in **JavaScript**, with type safety enforced through **JSDoc annotations**. The AI agent must adhere to these guidelines to ensure a consistent, performant, and maintainable codebase.

**2. Core Philosophy: App Router & Server-First with JSDoc Type Safety**

- **App Router:** The application will exclusively use the Next.js App Router.
- **Server Components by Default:** Most components will be React Server Components (RSCs) unless client-side interactivity is required.
- **JavaScript with JSDoc for Type Safety:**
  - All code will be written in standard JavaScript (`.js`/`.jsx` files).
  - **JSDoc comments are mandatory** for defining the shapes of objects, function parameters, and return values. This is the primary mechanism for providing a clear "contract" for the AI agent to understand data structures and generate correct code.
  - The project will be configured (`jsconfig.json`) to enable VS Code and other tools to perform type-checking based on these JSDoc annotations, catching many errors before runtime.

**3. JSDoc Best Practices for AI Agent**

The AI agent must use the following JSDoc syntax to document all non-trivial code.

- **Defining Object Types (`@typedef`):** Use `@typedef` to define reusable object shapes, similar to a TypeScript `interface`. These can be defined in a central file (e.g., `src/lib/types.js`) or co-located with the code that uses them.
  ```javascript
  // src/lib/types.js
  /**
   * Represents a product in the inventory.
   * @typedef {object} Product
   * @property {string} id - The unique identifier for the product.
   * @property {string} name - The name of the product.
   * @property {number} purchasePrice - The cost to purchase the product.
   * @property {number} sellingPrice - The price to sell the product.
   * @property {number} stock - The current stock quantity.
   */
  ```
- **Documenting Functions (`@param`, `@returns`):**
  ```javascript
  /**
   * Calculates the profit for a single product.
   * @param {Product} product - The product object to calculate profit for.
   * @returns {number} The calculated profit.
   */
  function calculateProfit(product) {
    return product.sellingPrice - product.purchasePrice;
  }
  ```
- **Importing Types:** You can import types defined with `@typedef`.
  ```javascript
  /**
   * @param {import('./types.js').Product} product
   * @param {number} quantity
   */
  export function calculateLineItemTotal(product, quantity) {
    return product.sellingPrice * quantity;
  }
  ```
- **Inline Type Annotation (`@type`):**
  ```javascript
  /** @type {import('./types.js').Product[]} */
  const featuredProducts = [];
  ```

**4. Recommended Project Structure**

- **`src/` Directory:** All application-specific code will reside within a `src/` directory.
- **`jsconfig.json`:** A `jsconfig.json` file will be configured in the root to enable path aliases (`@/*`) and strict type-checking for JavaScript files.
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"]
      },
      "checkJs": true,
      "jsx": "preserve"
    },
    "include": ["src/**/*.js", "src/**/*.jsx", "next-env.d.js"],
    "exclude": ["node_modules"]
  }
  ```
- **Core Subdirectories within `src/`:**
  - **`src/app/`**: All routes, layouts, and UI. API routes will be in `src/app/api/.../route.js`.
  - **`src/components/`**: Shared, reusable React components (`.jsx`).
    - `src/components/ui/`: Components from `shadcn/ui`.
    - `src/components/features/`: Feature-specific components.
  - **`src/lib/`**: Utility functions and helper modules (`.js`).
    - `src/lib/prisma.js` (Prisma client instance).
    - `src/lib/utils.js` (General utility functions).
    - `src/lib/authOptions.js` (NextAuth.js configuration).
    - `src/lib/types.js` (Central location for shared JSDoc `@typedef` definitions).
  - **`src/hooks/`**: Custom React hooks (`.js`).
- **File Naming Conventions:**
  - **Directory and File Names (non-component):** `kebab-case` (e.g., `product-details`, `user-settings.js`).
  - **React Component Files:** `kebab-case` (e.g., `product-form.jsx`).
  - **React Component Names (in code):** `PascalCase` (e.g., `function ProductForm() {}`).

**5. Routing with the App Router**

- **`page.jsx`:** Defines the unique UI for a route.
- **`layout.jsx`:** Defines shared UI. A root `src/app/layout.jsx` is mandatory.
- **Dynamic Segments:** `app/products/[productId]/page.jsx`.
- **API Routes:** `app/api/products/route.js`.

**6. Component Architecture: Server vs. Client Components**

This is a fundamental aspect of the App Router.
Server Components (RSCs - Default):
Purpose: Fetching data, accessing backend resources, and reducing client-side JavaScript.
Application in this Project: Most page-level components, layouts, and components that primarily display data.
Client Components ('use client' directive):
Purpose: Required for interactivity (onClick), state (useState), effects (useEffect), and browser-only APIs.
Application in this Project: Forms, the interactive POS screen, and any component that manages its own state.
Strategy for Composition (Primary Pattern):
Start with Server Components. They orchestrate the page layout and data fetching.
Use React Suspense for Loading States: When a Server Component needs to render a Client Component that fetches its own data or depends on server-fetched data, it must wrap the Client Component in a <Suspense> boundary with a fallback prop (e.g., a skeleton loader).
Push Client Components to the Leaves: Keep Client Components as small and focused as possible.

**7. Special Files and Their Usage**

- `loading.jsx`
- `error.jsx` (Must be a Client Component)
- `global-error.jsx` (Must be a Client Component)
- `template.jsx`
- `default.jsx`

**8. Data Fetching Strategy**

**Updated Hybrid Pattern: "Shared Service Function" Approach**

- **Server Components (SSR):**  
  For session-specific or user-specific data, Server Components should call a shared service/data function (e.g., `getDashboardCounts(userId)`) directly. This avoids unnecessary internal HTTP requests and leverages the session context already available on the server.

  - **No fetch to internal API routes from Server Components for session-specific data.**
  - **Benefit:** Maximum performance, security, and simplicity.

- **API Route (for Client Components):**  
  The same shared service/data function is called from the API route (e.g., `/api/dashboard/counts`). The API route is responsible for authentication and acts as the secure HTTP interface for client-side requests (e.g., TanStack Query, manual refresh, widgets).

- **Client Components:**  
  Use TanStack Query to fetch data from the API route. This enables client-driven updates, refetching, and cache management.

**Summary Table:**

| Context          | Pattern                                     |
| ---------------- | ------------------------------------------- |
| Server Component | Direct call to shared service/data function |
| API Route        | Call shared service/data function           |
| Client Component | Fetch via API route (TanStack Query/fetch)  |

**Result:**

- The core logic is written once and reused.
- The server path is fast and secure.
- The client path is decoupled and secure.

**9. API Routes (`app/api/.../route.js`)**

- **Purpose:** To build backend API endpoints.
- **Structure:** Each `route.js` file exports `async` functions named after HTTP methods.

  ```javascript
  // src/app/api/example/route.js
  import { NextResponse } from "next/server";

  /**
   * Handles GET requests to /api/example
   * @param {Request} request The incoming request object.
   * @returns {NextResponse} A JSON response.
   */
  export async function GET(request) {
    // ... logic
    return NextResponse.json({ message: "Hello" });
  }

  /**
   * Handles POST requests to /api/example
   * @param {Request} request The incoming request object.
   * @returns {NextResponse} A JSON response.
   */
  export async function POST(request) {
    const data = await request.json();
    // ... logic with data
    return NextResponse.json({ received: data }, { status: 201 });
  }
  ```

**10. Metadata for SEO**

- **Static Metadata:**

  ```javascript
  // src/app/about/page.jsx

  /** @type {import('next').Metadata} */
  export const metadata = {
    title: "About Us",
    description: "Learn more about our company.",
  };

  export default function AboutPage() {
    /* ... */
  }
  ```

- **Dynamic Metadata:**

  ```javascript
  // src/app/products/[productId]/page.jsx

  /**
   * Generates metadata for a specific product page.
   * @param {{ params: { productId: string } }} props
   * @returns {Promise<import('next').Metadata>}
   */
  export async function generateMetadata({ params }) {
    // const product = await getProductDetails(params.productId);
    // return { title: product.name };
    return { title: `Product ${params.productId}` }; // Placeholder
  }

  export default function ProductDetailPage({ params }) {
    /* ... */
  }
  ```

**11. Key Architectural Considerations for "Retail Inventory & Finance Manager"**

Dashboard Sections (/dashboard/...): These routes will share a common dashboard layout.jsx. Pages will be Server Components that fetch initial data and render Client Components within <Suspense> boundaries.
// app/dashboard/products/page.jsx
export default async function ProductsPage() {
const initialProducts = await getProductsFromServer(); // Fetches via API route
return (
<Suspense fallback={<ProductListSkeleton />}>
<ProductListClient initialProductData={initialProducts} />
</Suspense>
);
}
Use code with caution.
JavaScript
Sales Processing (POS) Screen: This will be a heavily interactive Client Component ('use client').
Forms: Forms for adding/editing products will be Client Components, likely loaded within a modal, which can also be wrapped in Suspense.

By adhering to these guidelines, the AI agent will be able to generate code that is idiomatic to modern Next.js development, performant, and type-safe through the use of JSDoc, aligning with the architectural vision for this application.
