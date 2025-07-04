**Definitive UI/UX Design & Workflow**

**Core Principle of Consistency:**
The design will be built on a foundation of reusable components and consistent interaction patterns. A user who learns how to interact with one part of the app (e.g., adding a category) will intuitively understand how to interact with another (e.g., adding a supplier).

- **Pattern 1: The `DataTable` Ecosystem:** All lists of data (products, customers, sales history) will use a standardized, interactive `DataTable` with consistent sorting, filtering, pagination, and an "Actions" menu (⋮).
- **Pattern 2: The `Modal` for Focused Tasks:** Editing items, confirming actions, or simple creation tasks will primarily happen in `Modal` overlays to keep the user in context.
- **Pattern 3: The "Cockpit" for Bulk Creation:** All initial setup tasks (adding products, categories, etc.) will use the efficient two-column layout with the `SessionCreationList` for immediate feedback.
- **Pattern 4: Keyboard-First Interaction:** All data entry-heavy screens will be optimized for keyboard-only operation with logical focus management (Tab, Arrows, Enter, Esc).

---

**Phase 0: Discovery & Authentication (The Front Door)**

- **Goal:** To establish trust, communicate value, and provide a frictionless entry point into the application.
- **Consistency Check:** The visual branding (logo, colors, typography) established here on the public page will be carried into the authenticated application to create a seamless transition.

**1. The Public Landing Page**

- **URL:** `app.yourdomain.uz`
- **Layout:** A modern, clean, single-page scrolling design. Fully responsive.
- **Reusable Components:** `AppHeader` (Public), `AppFooter`, `PrimaryButton`, `FeatureCard`, `PricingCard`.
- **Sections:**
  - **Hero:**
    - **Header:** Logo, "Features," "Pricing," "Login" link, and a "Start Free Trial" `PrimaryButton`.
    - **Content:** Compelling headline ("Take Control of Your Shop"), sub-headline (explaining the "what" and "why"), and a large "Start Your 14-Day Free Trial" `PrimaryButton`. Text below: "No credit card required."
  - **Features:** A grid of `FeatureCard`s, each with an icon, title (e.g., "High-Speed Sales"), and benefit-oriented description.
  - **Pricing:** Side-by-side `PricingCard`s for "Basic" and "Standard" plans, showing (simulated) UZS prices and key limits.
  - **Final CTA:** A final "Ready to Get Started?" section with another "Start Free Trial" button before the footer.
  - **Footer:** Standard links (Terms, Privacy, Contact), copyright.

**2. The Authentication Flow**

- **Trigger:** User clicks any "Start Free Trial" or "Login" button.
- **UI:** An `AuthModal` overlays the page. This establishes the `Modal` as our pattern for focused, contextual actions.
- **Interaction:**
  1.  The modal appears with a title ("Welcome") and instructional text.
  2.  A single, prominent **"Continue with Google"** button is the only action. This simplifies the process immensely and sets a precedent for clear, single-purpose actions.
  3.  User clicks the button and completes the standard Google OAuth pop-up flow.
  4.  **On Success:**
      - The `AuthModal` closes.
      - The user is smoothly transitioned (via a page redirect) into the authenticated part of the application, landing on their personal dashboard. The `AppHeader` changes from the public version to the authenticated version, but the logo and branding remain, ensuring visual continuity.
  5.  **On Failure:** A non-intrusive error message appears within the modal, allowing the user to try again without being kicked out of the flow.

This design for Phase 0 is clean, professional, and highly focused. It uses modern web design patterns and establishes a consistent visual identity and interaction model (the `Modal`) that will be built upon in the subsequent phases. The entire process is designed to be as simple and trustworthy as possible to maximize user conversion from visitor to trial user.
