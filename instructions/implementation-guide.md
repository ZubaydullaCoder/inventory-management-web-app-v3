### **Technical Implementation Guide: Creating an Authentication-Aware Landing Page**

**Objective:** To refactor the existing static landing page (`HomePage`) so that it dynamically changes its content based on the user's authentication status. The primary changes will occur in the main header and all major call-to-action (CTA) buttons.

**Core Technical Pattern:** The logic will be driven by a server-side session check. The main `HomePage` Server Component will fetch the user's session using `await auth()`. It will then pass the session data down as props to its children or use conditional rendering to display the appropriate UI. This approach ensures the page remains a fast-loading Server Component while delegating interactive elements to small, isolated Client Components.

---

### **Task 1: Create the Interactive `UserNav` Component**

This is a new, interactive component for authenticated users.

- **File Path:** `src/components/features/auth/user-nav.jsx`
- **Component Type:** **Client Component**. The file _must_ start with the `'use client';` directive.
- **Purpose:** To display the logged-in user's avatar and provide a dropdown menu with user-specific actions, such as signing out.
- **Props (API):**
  - `user`: Expects an object representing the authenticated user, containing at least `name` and `image` properties (e.g., `{ name: 'Aziz', image: 'url-to-image' }`).
- **Composition & Structure:**
  - This component will be built using the `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuLabel`, `DropdownMenuSeparator`, and `DropdownMenuItem` components from `shadcn/ui`.
  - The `DropdownMenuTrigger` should contain the `Avatar` component (also from `shadcn/ui`).
  - The `Avatar` component should contain an `AvatarImage` with its `src` set to the `user.image` prop and an `AvatarFallback` that displays the user's initials (e.g., "AZ").
  - The `DropdownMenuContent` should contain:
    1.  A `DropdownMenuLabel` to show the user's name.
    2.  A `DropdownMenuSeparator`.
    3.  A `DropdownMenuItem` for "Dashboard". This should wrap a `next/link` component pointing to `/dashboard`.
    4.  Another `DropdownMenuItem` for "Sign Out". This will be a button element.
- **Logic & Interactivity:**
  - Import the `signOut` function from `next-auth/react`.
  - The "Sign Out" `DropdownMenuItem` must have an `onClick` event handler that calls the `signOut()` function. No callback URL is needed if the default behavior (redirect to the current page) is acceptable.

---

### **Task 2: Refactor `AppHeaderPublic` into a Generic `AppHeader`**

The existing header needs to be made smarter. It will now decide what to display based on the user's session.

- **File Path:** Rename `src/components/features/landing/app-header-public.jsx` to `src/components/features/landing/app-header.jsx`.
- **Component Type:** Server Component.
- **Purpose:** To serve as the application's main header, capable of displaying both unauthenticated and authenticated states.
- **Props (API):**
  - `session`: Expects the session object obtained from `await auth()`. It can be `null` if the user is not logged in.
- **Composition & Structure:**
  - The overall structure remains the same (a `<header>` tag with a container).
  - In the right-hand navigation/action area, implement a **conditional (ternary) operator**.
  - **Condition:** Check if `session?.user` exists.
  - **If `true` (user is logged in):** Render the new `UserNav` component created in Task 1. Pass the `session.user` object to its `user` prop.
  - **If `false` (user is not logged in):** Render the existing `AuthModal` component, configured with a `PrimaryButton` as its trigger and the `LoginButton` as its child.

---

### **Task 3: Update the Main `HomePage` to Drive the Logic**

This is the top-level orchestrator. It will fetch the session and pass it down to all relevant components.

- **File Path:** `src/app/page.jsx`
- **Component Type:** Server Component.
- **Purpose:** To fetch the authentication status and control the content displayed on the landing page.
- **Data Fetching & Logic:**
  - At the very top of the `HomePage` function component, add the following line to get the session on the server: `const session = await auth();`.
- **Composition & Structure Updates:**
  1.  **Header:** Find the `AppHeaderPublic` component instance and rename it to `AppHeader`. Pass the `session` object you just fetched as a prop: `<AppHeader session={session} />`.
  2.  **Hero Section CTA:** Locate the `AuthModal` instance in the hero section. Wrap it in a conditional check.
      - If `session` is null, render the `AuthModal` as it is now.
      - If `session` exists, render a `PrimaryButton` that contains a `next/link` component pointing to `/dashboard`. The button text should be "Go to Dashboard".
  3.  **Pricing Section CTAs:** Repeat the same conditional logic for each of the three `PricingCard` components.
      - If `session` is null, the `AuthModal` trigger buttons remain.
      - If `session` exists, replace the `AuthModal` in each card with a `PrimaryButton` linking to `/dashboard`. You can vary the button style (e.g., primary vs. secondary) if desired, but the link should be consistent.
  4.  **Final CTA Section:** Apply the same conditional logic to the final CTA at the bottom of the page, replacing the `AuthModal` with a link to the dashboard for logged-in users.

By following these technical instructions, the landing page will become fully dynamic and responsive to the user's authentication state, providing a more intelligent and context-aware user experience, all while preserving the performance benefits of our Server Component architecture.
