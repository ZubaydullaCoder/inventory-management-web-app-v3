### **Frontend Development Breakdown Document**

**Version:** 1.1
**Date:** June 3, 2025
**Target Audience:** AI Implementation Agent
**Project:** Retail Inventory & Finance Manager

**Overall Goal:** To create a complete, static, and visually accurate frontend UI for the entire application using mock data. This will allow for a comprehensive UI/UX review before any backend logic is implemented. The focus is on component creation, layout, and "happy path" static data display.

---

### **Phase 0: Project Setup & Design System Foundation**

**Goal of the Phase:** To initialize the Next.js project, set up core tooling, and define the application's core visual identity (colors, fonts, spacing) before any components are built. This ensures all subsequent UI development is consistent.

**High-Level Instructions/Tasks:**

1.  **Initialize Next.js Project:**
    - **CLI:** Run `npx create-next-app@latest` with the following options:
      - App name: `retail-manager`
      - TypeScript: No
      - ESLint: Yes
      - Tailwind CSS: Yes
      - `src/` directory: Yes
      - App Router: Yes
      - Customize default import alias: Yes (`@/*`)
2.  **Configure `jsconfig.json`:**
    - Ensure the file is set up for path aliases and strict JS type-checking as per **Guide #6**.
3.  **Install Core Dependencies:**
    - **CLI:** Run `npm install @prisma/client @tanstack/react-query @tanstack/react-table next-auth@beta react-hook-form zod zustand date-fns lucide-react`.
4.  **Initialize ShadCN UI:**
    - **CLI:** Run `npx shadcn-ui@latest init`.
    - Follow the prompts to configure `components.json`.
5.  **Define Core Design System Tokens:**
    - **Task:** Open `tailwind.config.mjs`. In the `theme.extend` section, define the application's primary color palette (e.g., `primary`, `secondary`, `destructive`) to align with the project's branding.
    - **Task:** Open `src/app/globals.css`. Customize the root CSS variables for `shadcn/ui` themes (e.g., `--primary`, `--radius`) to match the design decisions. This is the single source of truth for colors and border-radius.
    - **Task:** Open `src/app/layout.jsx`. Configure and apply the primary application font (`Inter` from `next/font/google`) to the root `<html>` tag.
6.  **Install Foundational ShadCN UI Components:**
    - **CLI:** Run `npx shadcn-ui@latest add button card dialog input label separator tooltip dropdown-menu`.
7.  **Create Root Layout & Providers:**
    - Modify `src/app/layout.jsx` to wrap the `children` in all necessary providers: `QueryProvider`, `SessionProviderWrapper`.
8.  **Create Mock Data Files:**
    - Create `src/lib/mockData.js`. Populate it with mock data structures for `products`, `customers`, `sales`, etc., using JSDoc types defined in `src/lib/types.js`.

**List of Pages and Reusable Components Developed:**

- **Pages:** None.
- **Reusable Components:** `QueryProvider`, `SessionProviderWrapper`.
- **Core Files:** `tailwind.config.mjs`, `globals.css`, `layout.jsx`, `mockData.js`.

**Applied Best Practices & Patterns:**

- Design System First: Establishing visual tokens before component development.
- Project initialization via CLI.
- Centralized mock data management.

---

### **Phase 1: Public Pages & Authenticated Shell**

**Goal of the Phase:** To build the public-facing UI and the main authenticated application layout (shell), establishing the primary navigation patterns.

**High-Level Instructions/Tasks:**

1.  **Build Reusable Public Page Components:**
    - Create `AppHeader (Public)`: Shows "Features," "Pricing," "Login" links.
    - Create `AppFooter`: Contains standard footer links.
    - Create `PrimaryButton`: A styled `Button` component for primary CTAs.
    - Create `FeatureCard` and `PricingCard` components.
2.  **Build the Public Landing Page:**
    - Create `src/app/page.jsx`.
    - Assemble the page using the reusable components, following the UI/UX guide (Hero, Features, Pricing sections). Populate with static text.
3.  **Build the Authentication UI:**
    - Create `AuthModal`: A `Dialog` component with a "Continue with Google" button.
    - Create `src/app/login/page.jsx` which displays the `AuthModal`.
4.  **Create Authenticated App Layout:**
    - Create `AppLayout`: A component including a `Sidebar` and a `TopBar`.
    - `Sidebar`: Build the main navigation menu with links (Dashboard, Sales, etc.) and icons (`lucide-react`).
    - `TopBar`: Build the top bar with breadcrumbs and a "New Sale" button.
    - Integrate `AppLayout` into `src/app/(dashboard)/layout.jsx`. **Crucially, this layout must also render the `modal` prop for our Intercepting Routes pattern.**
5.  **Build the Dashboard Onboarding Component:**
    - Create `OnboardingGuide`: A static component with the three-step checklist and buttons.
6.  **Build the Main Dashboard Page (Initial State):**
    - Create `src/app/(dashboard)/dashboard/page.jsx`.
    - Display a `PageHeader` ("Welcome...") and the `OnboardingGuide` component.

**List of Pages and Reusable Components Developed:**

- **Pages:** `/` (Landing Page), `/login`, `/dashboard` (initial view).
- **Reusable Components:** `AppHeader (Public)`, `AppFooter`, `PrimaryButton`, `FeatureCard`, `PricingCard`, `AuthModal`, `AppLayout`, `Sidebar`, `TopBar`, `PageHeader`, `OnboardingGuide`.

**Applied Best Practices & Patterns:**

- Component-based architecture.
- Use of route groups `(dashboard)` for shared layouts.
- Preparation for Intercepting Routes by including the `modal` slot in the layout.

---

### **Phase 2: Data Entry & Management UI**

**Goal of the Phase:** To build the core data interaction UIs: the "Cockpit" for bulk creation and the `DataTable` for management, leveraging TanStack Table and Intercepting Routes.

**High-Level Instructions/Tasks:**

1.  **Install New ShadCN UI Components:**
    - **CLI:** Run `npx shadcn-ui@latest add table`.
2.  **Build the "Cockpit" UI Components:**
    - Create `CockpitLayout`: A reusable two-column layout component.
    - Create `SessionCreationList`: A component for the right column that renders a list of mock items, each with an "Edit" icon.
3.  **Build the Bulk Creation Pages (Cockpit):**
    - For `/inventory/products/new`, `/inventory/categories/new`, and `/customers/new`, implement the static UI using `CockpitLayout`.
    - The left column contains a static `Form`. The right column displays the `SessionCreationList` with mock data.
4.  **Build the Reusable `DataTable` Component:**
    - Following **Guide #11**, create a generic `DataTable` component.
    - This component will use **TanStack Table (`useReactTable` hook)** for its logic and **`shadcn/ui`'s `<Table>`** for rendering.
    - It will be configured for **manual (server-side) data processing**, as its state will be driven by API calls in the backend phase.
5.  **Create Column Definitions:**
    - Create `src/components/features/products/product-columns.js`. This file will export the `columns` array for the products table, defining headers and cell rendering (including the "Actions" `DropdownMenu`).
6.  **Build the Main Data List Pages:**
    - Create `/inventory/products`, `/inventory/categories`, and `/customers` pages.
    - Each page will use a `PageHeader` and the new `DataTable` component, passing it the appropriate `columns` definition and mock data from `mockData.js`.
7.  **Implement the Intercepted "Edit" Modal:**
    - Following **Guide #10**, implement the full file structure for an intercepted "Edit Product" modal.
    - Create the fallback page with redirect logic at `src/app/(dashboard)/products/edit/[id]/page.jsx`.
    - Create the modal UI at `src/app/(dashboard)/@modal/(.)products/edit/[id]/page.jsx`. The modal should contain the product `Form`, pre-filled with mock data.
    - Update the "Edit" link in the `DataTable`'s `DropdownMenu` to be a Next.js `<Link>` pointing to `/products/edit/[mock_id]`.

**List of Pages and Reusable Components Developed:**

- **Pages:** `/inventory/products/new`, `/inventory/categories/new`, `/customers/new`, `/inventory/products`, `/inventory/categories`, `/customers`, `/products/edit/[id]` (fallback), `/@modal/(.)products/edit/[id]` (modal UI).
- **Reusable Components:** `CockpitLayout`, `SessionCreationList`, `DataTable`.

**Applied Best Practices & Patterns:**

- Consistent application of "Cockpit" (Pattern 3) and `DataTable` (Pattern 1) ecosystems.
- Implementation of TanStack Table for robust, scalable data grids.
- Implementation of Intercepting Routes for "Resource Modals" (Pattern 2).

---

### **Phase 3: Specialized & Reporting Interfaces**

**Goal of the Phase:** To build the static UI for the remaining high-speed workflows and the data-dense reporting and settings pages.

**High-Level Instructions/Tasks:**

1.  **Install New ShadCN UI Components:**
    - **CLI:** Run `npx shadcn-ui@latest add tabs date-picker alert`.
2.  **Build the Sales (POS) Screen UI:**
    - Create `src/app/(dashboard)/sales/page.jsx` using a responsive `POSLayout`.
    - Build the static components for this screen: `ProductSearchInput`, `QuickAddItemGrid`, `TransactionList` (with mock `TransactionLineItem`s), and the `CheckoutArea`.
3.  **Build the "Receive Stock" Page UI:**
    - Create `src/app/(dashboard)/inventory/receive-stock/page.jsx` using the `CockpitLayout`.
4.  **Build Dashboard Widgets:**
    - Create `StatCard` and `ActionableWidget` components.
    - Update `src/app/(dashboard)/dashboard/page.jsx` to replace the `OnboardingGuide` with a grid of these widgets, populated with mock data. Include a `DateRangePicker` in the `PageHeader`.
5.  **Build the Reports & History Page:**
    - Create `src/app/(dashboard)/reports/page.jsx`.
    - Use `shadcn/ui`'s `Tabs` to create the tabbed layout. Each tab's content area should contain a `DataTable` with relevant mock data.
6.  **Build Accounts & Subscription Management Pages:**
    - Create `/customers/receivables` and `/purchases/payables` pages, each using the `DataTable`.
    - Create a `/settings/subscription` page using `Alert` and `PricingCard` components to display static mock subscription info.

**List of Pages and Reusable Components Developed:**

- **Pages:** `/sales`, `/inventory/receive-stock`, `/reports`, `/customers/receivables`, `/purchases/payables`, `/settings/subscription`.
- **Reusable Components:** `POSLayout`, `ProductSearchInput`, `TransactionLineItem`, `StatCard`, `ActionableWidget`, `DateRangePicker`.

**Applied Best Practices & Patterns:**

- Specialized layouts for high-speed workflows.
- Heavy reuse of the `DataTable` component across all reporting and management views.
- Consistent UI patterns for settings and reporting.
