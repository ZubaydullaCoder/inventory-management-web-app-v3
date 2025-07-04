<!-- Guide 7: Architectural Principles: SoC, Reusability & Modularity -->
<!-- filepath: d:\web development\2025\codevision works\inventory-management-app\inventory-nextjs-copilot-pro-chat-mode-4\instructions\Technical-Guides\guide-7-app-architecture-principles-soc-reusability-guide.md -->

**Guide Document 7: Architectural Principles: SoC, Reusability & Modularity (JavaScript + JSDoc Edition)**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction**

This document establishes the high-level architectural principles that govern the structure of our application. Adherence to these principles—Separation of Concerns (SoC), Reusability (DRY), and Modularity—is mandatory for the AI agent to produce a clean, scalable, and maintainable codebase.

**2. Separation of Concerns (SoC)**

Each part of the application must have a single, distinct responsibility. This makes the code easier to understand, debug, and modify.

- **UI vs. Routing Logic:**

  - **Concern:** Routing, data fetching orchestration.
  - **Location:** `src/app/**/page.jsx` and `layout.jsx` files.
  - **Responsibility:** These files should be lean. They define the route, fetch the initial data for the page, and arrange the high-level layout by composing components. They should not contain complex JSX or business logic.
  - **Concern:** UI presentation.
  - **Location:** `src/components/**/*.jsx`.
  - **Responsibility:** These components are the building blocks of the UI (buttons, forms, cards). They receive data via props and render JSX. They should be unaware of the route they are being rendered on.

- **API Transport Layer vs. Business/Data Logic:**

  - **Concern:** Handling HTTP requests and responses, validating incoming data.
  - **Location:** `src/app/api/**/route.js`.
  - **Responsibility:** API routes are the "front door." They parse the request, validate the payload using Zod, call a service/data function to perform the actual work, and format the HTTP response (success or error).
  - **Concern:** Executing business logic and database operations.
  - **Location:** `src/lib/services/` or `src/lib/data/`.
  - **Responsibility:** These modules contain the core logic. They take simple JavaScript objects as input, perform operations (e.g., Prisma queries), and return the result. They know nothing about HTTP.
  - **AI Action:** Do not place Prisma queries directly inside `route.js` files. Create a separate function in a `services` or `data` directory and call it from the route handler.

  - **Pattern Update:**

    - **Shared Service Function Pattern:**  
      For any business/data logic that is needed by both Server Components and API routes, implement it as a reusable function in the service/data layer (e.g., `getDashboardCounts`).
      - **Server Components** call this function directly for SSR.
      - **API Routes** call the same function for client-driven requests.
      - **Never** fetch your own API route from a Server Component for session-specific data.

  - **AI Action:**
    - Always create a shared function for logic needed by both server and client.
    - Never duplicate business logic between API routes and Server Components.

- **Client State vs. Server State:**
  - **Concern:** Asynchronous server data (fetching, caching, updating).
  - **Tool:** **TanStack Query**.
  - **Responsibility:** Manages all data that lives on the server.
  - **Concern:** Ephemeral UI state (e.g., "is a modal open?", content of an uncontrolled form input).
  - **Tool:** **Zustand** (or `useState` for local state).
  - **Responsibility:** Manages state that is temporary, synchronous, and only relevant to the client UI.
- **UI Composition and State (Loading, Error, Success):**
  Principle: Our Suspense-based pattern provides a clear separation of concerns for rendering UI based on data-fetching states.
  Server Component's Concern: Orchestration. It decides what components to render and fetches the initial data. It does not know about loading or error states.
  React Suspense's Concern: Handling the loading state. Its only job is to show a fallback UI while waiting for the component inside it to render.
  error.jsx Boundary's Concern: Handling the error state. Its only job is to render an error UI if the component inside it fails.
  Client Component's Concern: Handling the success state and interactivity. It uses useSuspenseQuery and is only responsible for rendering the UI when data is successfully available.

**3. Reusability (Don't Repeat Yourself - DRY)**

Avoid duplicating code. Encapsulate logic and UI that is used in more than one place.

- **Reusable UI Components:**

  - **Location:** `src/components/ui/` and `src/components/features/`.
  - **AI Action:** Before building a new piece of UI, check if a similar component already exists. Create generic, reusable components (e.g., `DataGrid`, `StatCard`) that can be configured via props. The `ProductCard` component, for instance, should be reusable wherever a product needs to be displayed.

- **Custom Hooks:**

  - **Location:** `src/hooks/`.
  - **AI Action:** Encapsulate any non-trivial client-side logic that involves React hooks into a custom hook. This is mandatory for all TanStack Query calls (`useProducts`, `useCreateProduct`) and useful for other logic (e.g., `useDebounce`, `useWindowSize`).

- **Utility Functions:**
  - **Location:** `src/lib/utils.js`.
  - **AI Action:** Create pure, generic helper functions for common, stateless operations like formatting currency, calculating dates, or sanitizing strings.

**4. Modularity**

Build the application as a collection of independent, loosely coupled modules. A module should be replaceable without breaking the entire application.

- **Feature-Based Structure:**

  - **Principle:** Group code by feature, not by type. This keeps related files together.
  - **AI Action:** When developing a new feature (e.g., "Customer Credit Management"), create a directory for it (`src/features/customers/`) and place related components, hooks, and service functions within it.
    - `src/features/customers/components/CustomerCreditForm.jsx`
    - `src/features/customers/hooks/useCustomerCredit.js`
    - `src/features/customers/services/creditService.js`
  - The corresponding API route (`app/api/customers/credit/route.js`) would then import and use `creditService.js`.

- **Clear Interfaces (via JSDoc):**

  - **Principle:** A module's public "API" (its exported functions and component props) is its contract with the rest of the application.
  - **AI Action:** All exported functions and component props **must** be clearly documented with JSDoc. This allows other modules to use them without needing to understand their internal implementation.

- **Minimize Coupling:**
  - **Principle:** Modules should know as little as possible about each other.
  - **AI Action:** A component should not rely on the internal state of another component. Data should flow down via props. Functions in a service module should not directly depend on another service module if it can be avoided; instead, orchestrate them from a higher level (like the API route handler).

**5. AI Agent's Responsibility**

- **Strict Adherence:**
  - Always use the "Shared Service Function" pattern for any logic needed by both server and client.
  - Maintain a single source of truth for business/data logic.
- **Structure First:** When tasked with a new feature, the AI should first propose the file and module structure based on these principles.
- **Refactor for Clarity:** The AI should be able to identify code that violates these principles (e.g., a Prisma query in a `route.js` file) and refactor it into the correct structure.
- **Default to Reusability:** When generating code, the AI should default to creating a reusable function or component rather than writing single-use logic inside a larger component.
- **Enforce Boundaries:** The AI must maintain the clear boundaries between the UI, API, and data/service layers.
