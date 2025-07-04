### **Guide Document 10: Advanced UI Patterns: Intercepting Routes for Modals**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction & Goal**

This document outlines the specific architectural pattern for implementing "Resource Modals" using Next.js Parallel and Intercepting Routes. The primary goal is to enhance the user experience by providing shareable, bookmarkable URLs for modal-based tasks (like editing a product) while keeping the user in the context of their current page.

**Crucial Requirement:** This implementation will deviate from the default Next.js behavior. If a user performs a full page reload on a URL that would normally open a modal (e.g., `/products/edit/123`), they will be **redirected back to the underlying page** (e.g., `/products`) instead of seeing a fallback page.

This pattern should **only** be used for "Resource Modals" (editing/viewing specific data entities). Simpler "Action Modals" (e.g., "Confirm Delete") will continue to use client-side state.

**2. The Core Concept (How it Works)**

This pattern involves four key parts working together:

1.  **The Main Page:** The page displaying the list of items (e.g., `app/(dashboard)/products/page.jsx`). This page contains the links that will trigger the modal.
2.  **The Layout with a Parallel Slot:** The parent `layout.jsx` is configured to accept a `modal` prop. This `@modal` slot is a parallel route that can render UI alongside the main `children` prop.
3.  **The Intercepted Route (The Modal UI):** A special route (e.g., `app/(dashboard)/@modal/(.)products/edit/[id]/page.jsx`) that "intercepts" navigation. When a user clicks a link to `/products/edit/123` from within the app, Next.js renders the content of this intercepted route inside the `@modal` slot instead of performing a full page navigation. This content will be our `shadcn/ui` Modal component.
4.  **The Fallback Page (with Redirect Logic):** The actual page at the destination URL (e.g., `app/(dashboard)/products/edit/[id]/page.jsx`). This page will **not** be used to render UI. Its sole purpose is to detect a full page reload and redirect the user back to the main page.

**3. Step-by-Step Implementation Guide**

The AI agent must follow these steps precisely to implement an intercepted modal for editing a product.

**Step 1: Configure the Parallel Route Slot in the Layout**

Modify the relevant layout file to accept and render the `modal` prop alongside `children`.

- **File:** `src/app/(dashboard)/layout.jsx`

  ```javascript
  // src/app/(dashboard)/layout.jsx

  /**
   * @param {{ children: React.ReactNode, modal: React.ReactNode }} props
   */
  export default function DashboardLayout({ children, modal }) {
    return (
      <div className="dashboard-layout">
        {/* ... Sidebar, Header, etc. ... */}
        <main>
          {children}
          {modal} {/* This will render the intercepted modal */}
        </main>
      </div>
    );
  }
  ```

**Step 2: Create the Intercepted Route (The Modal Content)**

Create the file that will be rendered inside the `@modal` slot. This component is responsible for displaying the modal dialog.

- **File:** `src/app/(dashboard)/@modal/(.)products/edit/[id]/page.jsx`

  ```javascript
  // src/app/(dashboard)/@modal/(.)products/edit/[id]/page.jsx
  "use client";

  import { useRouter } from "next/navigation";
  import { useEffect } from "react";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  // Assume ProductEditForm is a component that contains the form logic
  import ProductEditForm from "@/components/features/products/ProductEditForm";

  /**
   * @param {{ params: { id: string } }} props
   */
  export default function EditProductModal({ params }) {
    const router = useRouter();

    // We use a controlled dialog that is always "open" when this component is mounted.
    // The router.back() call handles closing it.
    return (
      <Dialog open={true} onOpenChange={() => router.back()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product (ID: {params.id})</DialogTitle>
          </DialogHeader>
          {/* The actual form for editing the product */}
          <ProductEditForm
            productId={params.id}
            onSaveSuccess={() => router.back()}
          />
        </DialogContent>
      </Dialog>
    );
  }
  ```

**Step 3: Create the Fallback Page with Redirect Logic (Crucial Requirement)**

Create the page at the actual URL. This page will **not render any UI**. It will detect if it was loaded directly (via refresh or direct URL access) and redirect.

- **File:** `src/app/(dashboard)/products/edit/[id]/page.jsx`

  ```javascript
  // src/app/(dashboard)/products/edit/[id]/page.jsx
  import { headers } from "next/headers";
  import { redirect } from "next/navigation";

  export default function EditProductFallbackPage() {
    const headerList = headers();
    // The 'RSC' header is a special header sent by Next.js during client-side navigations.
    // Its absence indicates a full, direct page load from the browser.
    const isDirectLoad = !headerList.has("RSC");

    if (isDirectLoad) {
      // This is a full page reload. Redirect the user back to the main products list.
      redirect("/products");
    }

    // In the rare case this component *is* rendered (e.g., failed interception),
    // we render nothing to avoid showing a broken page. The redirect is the primary goal.
    return null;
  }
  ```

**Step 4: Trigger the Modal from the Main Page**

Use a standard Next.js `<Link>` component to navigate to the edit route. Next.js's router will automatically handle the interception.

- **File:** `src/app/(dashboard)/products/page.jsx` (or a child component like a `DataTable`)

  ```javascript
  import Link from "next/link";

  // Inside your component that lists products...
  // const productId = 'some-product-id';

  return <Link href={`/products/edit/${productId}`}>Edit Product</Link>;
  ```

**4. AI Agent's Responsibility**

- **Strategic Application:** The AI must only apply this pattern to "Resource Modals" as defined in our architectural discussions.
- **File Structure:** The AI must create the precise file structure, including the `@modal` slot directory and the `(.)` interception syntax.
- **Implement Redirect Logic:** The AI **must** implement the server-side redirect logic in the fallback page for every intercepted route to meet the project's specific UX requirements.
- **Use `<Link>`:** The AI must use the standard `<Link>` component to trigger the intercepted routes.
- **Modal Control:** The modal UI component in the intercepted route should be controlled (e.g., `open={true}`) and rely on `router.back()` for dismissal.
