**Phase 1: Project Scaffolding, Authentication, and Public Landing Page**
**Version:** 1.0
**Status:** In Progress

---

### 1. Goal of This Phase

The primary goal of this phase is to establish the complete technical foundation of the project and build the initial user-facing features: the public landing page and the core authentication system. By the end of this phase, the application will be a runnable entity where a new user can visit the site, understand the value proposition, and securely sign up/log in using their Google account, preparing them for the authenticated experience to be built in subsequent phases.

---

### 2. Applied Patterns & Best Practices

This phase will strictly adhere to the principles laid out in the technical guides. Key applications include:

- **Architectural Foundation:**

  - **Directory Structure:** The project will be set up using the prescribed `src/` directory structure (`guide-1-nextjs-core-principles-guide.md`), establishing clear locations for routes, components, libraries, and hooks from the outset.
  - **JSDoc as Contract:** All new functions and type definitions will be documented with JSDoc to enforce type safety (`guide-6-javascript-with-jsdoc-guide.md`).
  - **Three-Layer Backend:** Although we are not yet building complex business logic, the authentication callbacks will respect this pattern by keeping the `auth.config.js` file lean and preparing for future service layer integrations (`guide-13-backend-design-system-guide.md`).

- **Authentication & Security:**

  - **JWT Session Strategy:** We will configure `Auth.js` to use a stateless JWT strategy, which is ideal for modern, scalable web applications (`guide-3-authjs-guide.md`).
  - **Middleware for Protection:** The `middleware.js` file will be implemented as the first line of defense to protect all routes under the `/dashboard` group (`guide-4-app-security-guide.md`).
  - **Defense in Depth:** We acknowledge that middleware is not the only security layer. This phase lays the groundwork for subsequent checks within Server Components and API routes.

- **Frontend Development:**
  - **Server Components by Default:** The landing page and its structural components (`AppHeader`, `AppFooter`) will be built as React Server Components (RSCs) to minimize the client-side JavaScript bundle (`guide-1-nextjs-core-principles-guide.md`).
  - **Client Component Isolation:** The interactive `LoginButton` will be a small, isolated Client Component (`'use client'`), pushed as deep into the component tree as possible to preserve the performance benefits of RSCs.
  - **Design System Implementation:** The UI will be built using the core design tokens (colors, fonts) and reusable components (`PrimaryButton`, `Modal`) defined in the design system guide (`guide-12-frontend-design-system-guide.md`).

---

### 3. Granular Development Tasks

These tasks are sequential and form the step-by-step implementation plan for Phase 1.

#### **Part 1: Project Setup & Configuration**

- **Task 1.1: Initialize Git Repository**

  - Action: Run `git init` in the project root to set up version control.

- **Task 1.2: Create Core Directory Structure**

  - Action: Manually create the following directory structure inside the `src/` folder, as per the architecture guide:
    ```
    src/
    ├── app/
    ├── components/
    │   ├── features/
    │   └── ui/
    ├── hooks/
    └── lib/
    ```

- **Task 1.3: Configure `jsconfig.json` for Type Safety & Aliases**

  - Action: Create `jsconfig.json` in the project root with the exact configuration from `guide-1-nextjs-core-principles-guide.md` to enable path aliases (`@/*`) and strict type-checking.

- **Task 1.4: Configure Design System (Tailwind & Fonts)**

  - Action 1: Modify `globals.css` to replace the default `shadcn/ui` HSL values with the project's brand colors (Primary: `rgb(255, 189, 47)`).
  - Action 2: Modify `tailwind.config.js` if necessary to align with design tokens.
  - Action 3: Implement the "Nunito" font using `next/font/google` in the root layout, as specified in the design system guide.

- **Task 1.5: Set Up Environment Variables**

  - Action: Create a `.env.local` file in the project root.
  - Content: Add the necessary variables for `Auth.js` and Prisma. Placeholder values should be used for now.

    ```env
    # Auth.js
    AUTH_SECRET="GENERATE_A_STRONG_SECRET_HERE" # Use `openssl rand -base64 32`
    AUTH_GOOGLE_ID=""
    AUTH_GOOGLE_SECRET=""
    AUTH_URL="http://localhost:3000"
    AUTH_TRUST_HOST=true

    # Database
    DATABASE_URL="postgresql://..."
    ```

- **Task 1.6: Install Core Dependencies**

  - Action: Run the following CLI command to install the necessary packages for authentication, database interaction, and UI.
    ```bash
    npm install next-auth@beta lucide-react zod prisma @prisma/client
    ```

- **Task 1.7: Initialize Prisma**
  - Action: Run the CLI command `npx prisma init` to create the `prisma` directory and the `schema.prisma` file.

#### **Part 2: Authentication Backend (Auth.js & Prisma)**

- **Task 2.1: Define Core Prisma Schema**

  - Action: Edit `prisma/schema.prisma` to define the initial models required for authentication and user context, as per the PRD. This includes `User`, `Shop`, `Subscription`, and the `Account` model required by NextAuth.
  - Note: We will add `enum` for `Role` and `SubscriptionPlan` for future use.

- **Task 2.2: Create Auth.js Configuration (`auth.config.js`)**

  - Action: Create the file `src/lib/auth.config.js`.
  - Content: Configure the Google provider, set the session strategy to `jwt`, and define the `authorized` callback logic for middleware as specified in `guide-3-authjs-guide.md`.

- **Task 2.3: Create Main Auth.js Initializer**

  - Action: Create the file `src/auth.js` in the root of `src/`.
  - Content: This file will initialize `NextAuth` with the configuration from `auth.config.js` and export the handlers and helper functions (`auth`, `signIn`, `signOut`).

- **Task 2.4: Create Auth.js API Route Handler**

  - Action: Create the file `src/app/api/auth/[...nextauth]/route.js`.
  - Content: This file will simply export the `GET` and `POST` handlers from `src/auth.js`.

- **Task 2.5: Implement Middleware for Route Protection**

  - Action: Create the file `src/middleware.js`.
  - Content: Implement the middleware to protect all routes under `/dashboard/*` using the `auth` function from `src/auth.js` and the matcher config from `guide-3-authjs-guide.md`.

- **Task 2.6: Run Initial Database Migration**
  - Action: Run `npx prisma migrate dev --name init-auth-and-user-schema` to create the initial database tables based on the schema defined in Task 2.1.

#### **Part 3: Public Landing Page & UI Components**

- **Task 3.1: Create the Root Layout**

  - Action: Modify `src/app/layout.jsx`.
  - Content: Apply the "Nunito" font class to the `<html>` tag. Wrap the `{children}` prop with the necessary client-side providers: `SessionProviderWrapper` (for `Auth.js`) and `QueryProvider` (for TanStack Query, in preparation for future phases).

- **Task 3.2: Build Reusable Public UI Components**

  - Action: Create the following reusable Server Components based on the UI/UX workflow document:
    - `src/components/features/landing/app-header-public.jsx`
    - `src/components/features/landing/app-footer-public.jsx`
    - `src/components/ui/primary-button.jsx` (Styled `shadcn/ui` Button)
    - `src/components/ui/feature-card.jsx`
    - `src/components/ui/pricing-card.jsx`

- **Task 3.3: Build Authentication UI Components**

  - Action: Create the authentication components.
    - `src/components/features/auth/auth-modal.jsx`: A Client Component that uses the `shadcn/ui` `Dialog` component to act as a wrapper.
    - `src/components/features/auth/login-button.jsx`: A Client Component (`'use client'`) that contains the "Continue with Google" button. It will use the `signIn` function from `next-auth/react`.

- **Task 3.4: Assemble the Public Landing Page**
  - Action: Create the main landing page at `src/app/page.jsx`.
  - Content: This will be a Server Component that composes the components created in the tasks above to build the sections defined in `workflow-phase-0.md`: Hero, Features, Pricing, and Final CTA. The "Start Free Trial" buttons will trigger the `AuthModal`.

---

### 4. Leveraged External Packages & API

- **`next-auth`** (`v5 beta`)
  - **Purpose:** Core library for handling authentication.
  - **API Used:** `NextAuth(authConfig)`, `auth`, `signIn`, `signOut`, `useSession`, `SessionProvider`.
- **`lucide-react`**
  - **Purpose:** Icon library for consistent and clean icons.
  - **API Used:** Will be used as standard React components (e.g., `<CheckCircle />`, `<Zap />`) within `FeatureCard` components.
- **`prisma` / `@prisma/client`**
  - **Purpose:** ORM for database interaction and schema management.
  - **API Used:** `npx prisma init`, `npx prisma migrate dev`. The client will be used to fulfill NextAuth's adapter requirements implicitly.
- **`shadcn/ui`**
  - **Purpose:** Base component library for building our custom, reusable UI components.
  - **API Used:** Primitives like `Button`, `Dialog`, `Card` will be composed and styled to create our application-specific components (`PrimaryButton`, `AuthModal`, `PricingCard`).

---

### 5. Status of Uncompleted Phases

- **Phase 2: Authenticated Shell & Initial Onboarding** - _Not Started_
- **Phase 3: Daily Operations (POS & Inventory Intake)** - _Not Started_
- **Phase 4: Business Management & Reporting** - _Not Started_
