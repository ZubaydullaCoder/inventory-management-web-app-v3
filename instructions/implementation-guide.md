Here are my recommendations for cleaning and optimizing the `HomePage`.

---

### **1. Abstract the Repetitive Call-to-Action (CTA) Logic**

- **Observation:** The core conditional logic block is repeated four times:
  ```jsx
  {
    session ? (
      <Link href="/dashboard">
        <PrimaryButton>...</PrimaryButton>
      </Link>
    ) : (
      <AuthModal trigger={<PrimaryButton>...</PrimaryButton>}>
        <LoginButton />
      </AuthModal>
    );
  }
  ```
- **Best Practice Violation:** This is a clear violation of the **DRY (Don't Repeat Yourself)** principle. If we ever need to change the logic (e.g., change the dashboard URL, add an analytics event, or modify the `AuthModal` behavior), we would have to do it in four separate places, which is error-prone and inefficient.
- **Recommendation:** Create a new, reusable **Server Component** whose single responsibility is to render the correct call-to-action based on the session status. This new component will encapsulate the conditional logic perfectly.

#### **Technical Instruction for Claude AI:**

1.  **Create a new component file:** `src/components/features/auth/dynamic-cta-button.jsx`.
2.  **Make it a Server Component:** It will not use the `'use client'` directive.
3.  **Define its Props (API):**
    - `session`: It will accept the `session` object.
    - It must accept all other props that a standard button would, such as `className` and `children`. Use the spread syntax (`...props`) to pass these through.
4.  **Implement the Logic:**
    - Inside this component, implement the `session ? ... : ...` ternary logic.
    - The **"logged in"** branch should render a `Link` component pointing to `/dashboard`, wrapping a `PrimaryButton`. The button should receive the `children` and any other passed props.
    - The **"logged out"** branch should render the `AuthModal`. The `trigger` for the modal will be a `PrimaryButton` that also receives the `children` and other props. The child of the `AuthModal` will be the `LoginButton`.
5.  **Refactor `HomePage`:** Replace all four instances of the repetitive logic block with this new component, like so:

    ```jsx
    // In the Hero section
    <DynamicCtaButton session={session} className="text-lg px-8 py-6">
      Start Free Trial
    </DynamicCtaButton>

    // In the Pricing Card
    <DynamicCtaButton session={session} className="w-full">
      Get Started
    </DynamicCtaButton>
    ```

---

### **2. Decouple Page Content from Layout (Data-Driven UI)**

- **Observation:** The content for the `FeatureCard` and `PricingCard` components (titles, descriptions, features lists, icons) is hardcoded directly within the `HomePage.jsx` file.
- **Best Practice Violation:** This violates the **Separation of Concerns** principle. The `HomePage` component's primary responsibility should be to orchestrate the page's layout and structure, not to hold static content. This makes the page harder to read and the content harder to update.
- **Recommendation:** Move the static content for the landing page into a dedicated configuration file. Then, use the `.map()` function within `HomePage` to render the components dynamically from this data. This makes the `HomePage` component significantly cleaner and centralizes the content for easy management.

#### **Technical Instruction for Claude AI:**

1.  **Create a new data file:** `src/lib/config/landing-page-config.js`.
2.  **Define and Export Data Structures:** Inside this new file, create and export two constant arrays:
    - `featureCardsData`: An array of objects. Each object should contain the props needed for a `FeatureCard`: `title`, `description`, and `icon` (you will need to import the icon components from `lucide-react` here).
    - `pricingPlansData`: An array of objects. Each object should contain the props for a `PricingCard`: `planName`, `price`, `description`, `features` (as an array of strings), and a `recommended` boolean flag.
3.  **Refactor `HomePage` to be Data-Driven:**
    - Import the `featureCardsData` and `pricingPlansData` arrays into `HomePage.jsx`.
    - In the "Features Section", remove the six hardcoded `FeatureCard` components. Replace them with a `.map()` call on the `featureCardsData` array, rendering one `<FeatureCard />` for each item in the array and passing the data as props. Remember to use the `key` prop in the map (e.g., `key={feature.title}`).
    - In the "Pricing Section", do the same. Remove the three hardcoded `PricingCard` components and replace them with a `.map()` call on the `pricingPlansData` array.

By implementing these two recommendations, the `HomePage` component will be transformed from a long, repetitive file into a clean, professional, and highly maintainable orchestrator, perfectly aligning with our architectural goals.
