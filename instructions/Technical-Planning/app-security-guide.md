**Guide Document 4: Application Security: Principles & Best Practices (JavaScript + JSDoc Edition)**

**Version:** 1.1
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction**

This document outlines critical security principles for developing the "Retail Inventory & Finance Manager" application. The AI agent MUST adhere to these guidelines. Security is a foundational requirement. All code examples use **JavaScript with JSDoc**.

**2. Core Security Principles**

- **Defense in Depth:** Implement multiple layers of security. If one layer is bypassed, others must still protect the application. This is the key lesson from the Next.js middleware exploit—middleware must not be the sole gatekeeper.
- **Principle of Least Privilege:** Grant users and components only the minimum permissions necessary.
- **Never Trust User Input:** Validate, sanitize, and encode all data from users on both client and server sides.
- **Fail Securely:** Deny access by default if a system fails.
- **Stay Updated:** Regularly update frameworks and libraries (e.g., `next`, `next-auth`) to patch known vulnerabilities.

**3. Authentication & Session Management (Auth.js Focus)**

Refer to "Guide Document 3" for implementation details. Key security aspects:

- **Strong `AUTH_SECRET`:** Keep this secret and strong.
- **Secure JWT Handling:** Use the default secure, HTTP-only cookies provided by Auth.js. Do not include non-essential sensitive data in the JWT payload.
- **CSRF Protection:** Rely on the built-in protections provided by Auth.js.
- **Secure Redirect URIs:** Configure precise, HTTPS-only redirect URIs in your Google Cloud Console.

**4. Authorization & Access Control (RBAC)**

This is the most critical section for preventing unauthorized access.

- **Define Roles:** `Shop Owner`, `Shop Staff` (as per PRD).
- **Assign Roles:** Roles can be assigned in the `jwt` callback in `auth.config.js` (e.g., by looking up user info from your database after they sign in).
- **Enforce Permissions – The "Defense in Depth" Strategy:**

  1.  **Middleware (Initial Check - `src/middleware.js`):**
      - Use Auth.js middleware to protect broad route categories (e.g., `/dashboard/*`).
      - It performs initial checks like "is user logged in?".
      - **CRITICAL:** Do not rely solely on middleware for fine-grained access control. It is the first, but not the only, line of defense.
  2.  **Page/Layout Level (Server Components - `page.jsx`, `layout.jsx`):**

      - **Always re-verify authentication and specific permissions _within_ Server Components that render sensitive pages.** This is the definitive check for UI access.
      - Fetch the session using `await auth()`.
      - Redirect or render an "access denied" UI if permissions are insufficient.

      ````javascript
      // Example: src/app/dashboard/settings/page.jsx
      import { auth } from '@/auth';
      import { redirect } from 'next/navigation';
      // import { getUserPermissions } from '@/lib/permissions'; // Hypothetical

      export default async function SettingsPage() {
        const session = await auth();
        if (!session?.user) redirect('/login');

        /** @type {import('next-auth').Session & { user: { id: string, role?: string } }} */
        const typedSession = session;

        // Example: Role-based check
        // if (typedSession.user.role !== 'Shop Owner') {
        //   redirect('/dashboard?error=unauthorized');
        // }

        // ... render page content
      }
      ```    3.  **API Route Level (`src/app/api/.../route.js`):**
      *   **Always re-verify authentication and permissions within every API route handler** that performs sensitive operations. This is the definitive check for data access.
      *   Fetch the session using `await auth()`.
      *   Check user ID and roles before processing the request.
      ```javascript
      // Example: src/app/api/products/[id]/route.js
      import { auth } from '@/auth';
      import { NextResponse } from 'next/server';
      import prisma from '@/lib/prisma';

      /**
       * @param {Request} request
       * @param {{ params: { id: string } }} context
       */
      export async function PUT(request, { params }) {
        const session = await auth();
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Example: Check if user has permission to edit this specific product
        // const hasPermission = await checkProductEditPermission(session.user.id, params.id);
        // if (!hasPermission) {
        //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const productData = await request.json();
        // ... update product in DB using Prisma ...
        return NextResponse.json({ message: 'Product updated' });
      }
      ````

- **AI Action:** The AI must implement these multi-layered checks for all protected features.

**5. Input Validation & Sanitization**

- **Client-Side Validation (UX):** Use Zod with React Hook Form for immediate user feedback. This is for UX, not security.
- **Server-Side Validation (Security):**
  - **Always re-validate all input on the server.** This is non-negotiable.
  - Use Zod schemas to validate API request bodies, URL parameters, etc.
- **Cross-Site Scripting (XSS) Prevention:**
  - React automatically escapes dynamic content in JSX, providing strong default protection.
  - Avoid `dangerouslySetInnerHTML`.
- **SQL Injection Prevention:**
  - **Use Prisma ORM exclusively.** The AI must never construct SQL queries by concatenating strings with user input. Prisma's methods use parameterized queries, which prevent SQLi.

**6. API Security**

- **Authentication & Authorization:** As detailed in section 4.3.
- **Data Validation:** Use Zod to validate all incoming request payloads on the server.
- **HTTPS Only:** Enforce HTTPS in production (Vercel does this by default).
- **Rate Limiting:** Consider for post-MVP to protect against brute-force attacks.
- **Sensitive Data Exposure:** Only return necessary data in API responses.

**7. Database Security (Prisma & Neon)**

- **Prisma for Querying:** Use Prisma for all database interactions.
- **Secure Connection Strings:** Store the Neon database URL in environment variables (`.env.local`). Do not expose it to the client.
- **Data Encryption:** Rely on NeonDB's encryption at rest and in transit (SSL/TLS).

**8. Dependency Management**

- **Regularly Update Dependencies:** Keep `next`, `next-auth`, `prisma`, and all other packages updated to their latest stable versions. This is the primary defense against known vulnerabilities.
- Use `npm outdated` or a tool like Dependabot to monitor dependencies.

**9. Secure Error Handling**

- **Generic Error Messages:** Do not reveal stack traces or internal system details to the client in production.
- **Server-Side Logging:** Log detailed errors on the server for debugging.

**10. Lessons from the Next.js Middleware Exploit (Reiteration)**

The exploit where the `x-middleware-subrequest` header could be manipulated to bypass middleware highlights:

1.  **Single Point of Failure:** Relying only on middleware for auth is a critical mistake.
2.  **Defense in Depth is Paramount:** Auth checks must exist at multiple levels:
    - Middleware (initial filter).
    - Server Components (UI access control).
    - API Routes (data access control).
3.  **Trust but Verify Frameworks:** Architectural patterns must be robust enough to withstand potential (though rare) framework-level flaws. Staying updated is the primary mitigation.

**11. AI Agent's Responsibility**

The AI agent must:

- Strictly follow all specified security practices.
- Implement robust server-side input validation for all user-supplied data.
- Ensure authentication and authorization checks are present at all appropriate layers (middleware, pages, and API routes) for every sensitive feature.
