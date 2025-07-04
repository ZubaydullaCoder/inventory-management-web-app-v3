### **Guide 13: Backend Design System & Service Architecture**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction & Core Philosophy**

This document defines the architectural design system for the entire backend of the application. A frontend design system creates a predictable user interface; this backend design system creates a **predictable, reusable, and consistent service architecture**.

The AI agent must treat these patterns as the mandatory "source of truth" for all server-side development.

**Core Philosophy:**

- **Separation of Concerns:** Each layer of the backend has one job.
- **Explicit Contracts:** The inputs and outputs of every function are clearly defined with JSDoc.
- **Thin API Layer, Thick Logic Layer:** API routes are just the "front door." The core business logic is encapsulated in deeper, reusable service and data modules.

- **Optimistic Update Support:** The backend must support frontend optimistic update patterns by returning the full, updated resource after any mutation (create, update, delete). This enables the frontend to reconcile the cache and maintain UI consistency.

**2. The Standard Service Pattern: Three-Layer Architecture**

Every backend feature that involves data processing or database interaction **must** be implemented using this three-layer pattern. This is the foundational structure of our backend.

- **Layer 1: The API Layer (`/app/api/.../route.js`)**

  - **Responsibility:** To handle HTTP communication and act as a secure gateway.
  - **It MUST:**
    1.  Receive and parse the incoming `Request` object.
    2.  Perform an **Authentication & Authorization** check using `await auth()`.
    3.  Perform **Validation** on the request body or parameters using a Zod schema.
    4.  Call a function from the Service or Data Layer, passing in simple, validated data.
    5.  Catch any errors from the layers below and return a standardized JSON error response.
    6.  Format the successful response and send it back to the client using `NextResponse.json()`.
        - For mutations, always return the full, updated resource object so the frontend can reconcile optimistic updates.
  - **It MUST NOT:**
    1.  Contain any direct Prisma calls.
    2.  Contain any complex business logic.

- **Layer 2: The Service Layer (`/lib/services/...`)**

  - **Responsibility:** To orchestrate complex business logic and transactions.
  - **It MUST:**
    1.  Be used when an operation involves multiple steps or affects multiple data models (e.g., "Finalize Sale," which creates a sale and updates product stock).
    2.  Contain `prisma.$transaction()` calls to ensure atomicity.
    3.  Call multiple functions from the Data Layer to achieve its goal.
  - **It MUST NOT:**
    1.  Know anything about HTTP requests or responses.

- **Layer 3: The Data Layer (`/lib/data/...`)**
  - **Responsibility:** To execute direct, single-model database operations using Prisma.
  - **It MUST:**
    1.  Contain functions that perform a specific CRUD operation on a single model (e.g., `getProductById`, `createProduct`, `updateProductStock`).
    2.  Use Prisma best practices: `select` for minimizing data, pagination (`take`/`skip`), and appropriate filtering (`where`).
  - **It MUST NOT:**
    1.  Contain complex, multi-step business logic.

**Shared Service Function Pattern (Update):**

- **Pattern:**

  - All core business/data logic must be implemented as reusable functions in the service/data layer.
  - These functions are called directly by Server Components for SSR and by API routes for client-driven requests.
  - This ensures a single source of truth and maximizes performance and security.

- **Consumers:**

  - **Server Components:** Call the shared function directly (no HTTP fetch).
  - **API Routes:** Call the shared function and expose it securely to the client.

- **Result:**
  - No duplication of logic.
  - Both server and client paths are secure and efficient.
  - **Optimistic Update Ready:** API endpoints must always return the updated resource so the client can reconcile optimistic updates in TanStack Query.

**3. The "Service Component" Catalog (Our Reusable Logic)**

This catalog defines the standard, reusable patterns—our "backend components"—that must be used.

- **Authentication & Authorization Component:**

  - **Pattern:** Every protected API route must immediately call `await auth()` and check for a valid session and user. Access must be denied if checks fail.
  - **Example:**
    ```javascript
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Further role checks can go here...
    ```

- **Validation Component:**

  - **Pattern:** Use Zod schemas to define the expected shape of all API request bodies. Parse the incoming data against the schema within a `try...catch` block.
  - **Example:**
    ```javascript
    const NewProductSchema = z.object({
      name: z.string().min(1),
      price: z.number().positive(),
    });
    try {
      const productData = NewProductSchema.parse(await request.json());
      // ... call service layer with validated productData
    } catch (error) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    ```

- **Error Handling & Response Component:**
  - **Pattern:** All backend errors must be caught and returned in a consistent JSON format. Do not let unexpected errors crash the process.
  - **Success Response:** `return NextResponse.json(data, { status: 200 });`
  - **Error Response:** `return NextResponse.json({ error: 'Descriptive message' }, { status: <HTTP_STATUS_CODE> });`

**4. API Endpoint Design (`route.js`)**

- **RESTful Principles:** The AI must use the correct HTTP verb for the action being performed.
  - `GET`: Retrieve data.
  - `POST`: Create new data.
  - `PUT` / `PATCH`: Update existing data.
  - `DELETE`: Remove data.
- **URL Naming:** Use plural nouns for resource collections (e.g., `/api/products`, `/api/customers`).

**5. Naming & Location Conventions**

This reinforces the structure defined in the main architecture document.

- **API Layer:** `src/app/api/[resource]/route.js`
- **Service Layer:** `src/lib/services/[feature]Service.js` (e.g., `saleService.js`)
- **Data Layer:** `src/lib/data/[resource].js` (e.g., `products.js`, `users.js`)
- **Function Naming:** Names must be descriptive verbs (e.g., `createProduct`, `getProductById`, `finalizeSaleTransaction`).

**6. AI Agent's Responsibility**

- **Default to the Three-Layer Pattern and Shared Service Function:**
  - For any logic needed by both server and client, implement it once in the service/data layer and reuse it in both places.
- **Never Bypass a Layer:** The AI is forbidden from placing Prisma queries in API routes or complex business logic in data access functions.
- **Compose Reusable Logic:** The AI must reuse the standard "service components" for auth, validation, and error handling in every API endpoint.
- **Generate Clear Contracts:** All functions in the Service and Data layers must have complete JSDoc annotations, defining their parameters and return values, to serve as the clear "API contract" for the layer above.

## Prisma Client Connection Management

**Important:** When using Prisma Client in a Next.js or serverless environment, always use the singleton pattern for the Prisma client instance. Do **not** call `prisma.$disconnect()` after each query or request. Prisma manages the connection pool automatically, and manual disconnection can cause connection errors, especially in development or serverless environments. Only disconnect the client when the entire application is shutting down (rare in serverless/Next.js).

**Best Practice:**

- Create and export a single Prisma client instance (singleton) in a shared file (e.g., `src/lib/prisma.js`).
- Import and use this instance throughout your app.
- Never call `prisma.$disconnect()` in API routes, service files, or after queries.

This prevents accidental disconnections and ensures stable database connectivity.
