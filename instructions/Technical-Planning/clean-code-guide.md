**Guide Document 8: Clean Code & Maintainability: Guidelines (JavaScript + JSDoc Edition)**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction**

This document defines the standards for writing clean, readable, and maintainable code. Functional code is not enough; the code must be easy for a human developer to understand and modify. The AI agent must treat these guidelines as strict rules to ensure a high-quality, professional codebase.

**2. Tooling: The Foundation of Consistency**

Our project will enforce consistency through automated tooling. The AI agent must generate code that strictly adheres to the rules defined by these tools.

- **Prettier:** This tool will be used for automatic code formatting. It ensures a consistent visual style (spacing, line breaks, etc.) across the entire project. There are no exceptions to its formatting rules.
- **ESLint:** This tool will be used to statically analyze the code and find problems. It will be configured with rules for JavaScript, React, and Next.js to catch common errors, enforce best practices, and prevent anti-patterns. The AI must generate code that is free of any ESLint errors or warnings.

**3. Naming Conventions**

Names should be descriptive and consistent.

- **Variables and Functions:** Use `camelCase` (e.g., `productPrice`, `calculateTotal`).
- **Constants:**
  - Use `UPPER_SNAKE_CASE` for hardcoded, global constants (e.g., `MAX_PRODUCTS_IN_CART = 50`).
  - Use `PascalCase` for React components (e.g., `ProductCard`).
  - Use `camelCase` for other constants whose values are not hardcoded (e.g., `const products = await fetchProducts()`).
- **Booleans:** Prefix with `is`, `has`, or `can` (e.g., `isSubmitting`, `hasPermission`, `canEdit`).
- **Functions:** Names should be verbs that describe what the function does (e.g., `fetchProducts`, `validateUserInput`).
- **Clarity over Brevity:** `findProductById` is better than `getProduct`.

**4. Functions**

- **Single Responsibility Principle (SRP):** A function should do one thing and do it well. A function that fetches products, validates them, and then transforms them for the UI should be broken into three separate functions.
- **Keep them Small:** Aim for functions that are no more than 20-30 lines long. Small functions are easier to understand, test, and reuse.
- **Limit Parameters:** A function should ideally have three or fewer parameters. If more are needed, pass them as a single object with clearly named properties. This is more readable and easier to extend.

  ```javascript
  // Good
  /**
   * @param {{ product: Product, quantity: number, discount?: number }} options
   */
  function calculateLineItem(options) {
    const { product, quantity, discount = 0 } = options;
    // ...
  }

  // Bad
  function calculateLineItem(product, quantity, discount, taxRate, user) {
    /* ... */
  }
  ```

- **Prefer Pure Functions:** Where possible, functions should be pure—their output should depend only on their inputs, with no side effects. This is especially true for utility functions in `src/lib/utils.js`.

**5. Comments and Documentation**

- **JSDoc is Mandatory:** As per Guide #6, JSDoc for types, parameters, and return values is required for all non-trivial functions and data structures.
- **Comment the "Why", not the "What":** The code itself should explain _what_ it is doing through clear naming. Use comments (`//`) only to explain _why_ a certain approach was taken, especially if the logic is complex or non-obvious.

  ```javascript
  // Bad: Redundant comment
  // Increment the counter
  i++;

  // Good: Explains the "why"
  // We must process this item last to ensure its dependencies are already handled.
  items.push(items.splice(specialItemIndex, 1)[0]);
  ```

- **No Commented-Out Code:** Dead code should be deleted from the repository, not commented out. Use version control (Git) to retrieve old code if needed.

**6. Conditional Logic**

- **Avoid Deep Nesting:** Deeply nested `if/else` blocks are hard to follow. Use **guard clauses (early returns)** to simplify logic.

  ```javascript
  // Bad: Deep nesting
  function processPayment(user, cart) {
    if (user) {
      if (cart.items.length > 0) {
        // ... process payment
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // Good: Guard clauses
  function processPayment(user, cart) {
    if (!user) return false;
    if (cart.items.length === 0) return false;

    // ... process payment
    return true;
  }
  ```

- **Readability is Key:** Prioritize clear, readable logic over clever, one-line solutions. A simple `if/else` block is often better than a complex ternary operator.

**7. Error Handling**

- **Be Explicit:** Use `try...catch` blocks for operations that can fail, such as API calls.
- **Don't Swallow Errors:** Never have an empty `catch` block. At a minimum, log the error (`console.error(error)`).
- **Throw `Error` Objects:** When creating your own errors, throw a new `Error` object with a descriptive message.

**8. React/JSX Specifics**

- **Destructure Props:** Always destructure props at the top of the component for clarity.
- **Keep JSX Clean:** If conditional rendering logic is complex, prepare variables or components before the `return` statement.

  ```javascript
  // Good
  function UserProfile({ user }) {
    const canEdit = user.role === "admin";
    let actionButton = <LoginButton />;
    if (user) {
      actionButton = canEdit ? <EditProfileButton /> : <ViewProfileButton />;
    }

    return (
      <div>
        <h1>{user?.name || "Guest"}</h1>
        {actionButton}
      </div>
    );
  }
  ```

- **Use Constants for Magic Strings:** Avoid using raw string literals for things like event names, status codes, or action types. Define them as constants.

**9. AI Agent's Responsibility**

- **Be a Model Citizen:** The AI's primary goal is to generate code that is not just functional but is also clean, readable, and easily maintainable by a human developer.
- **Follow All Rules:** The AI must strictly adhere to all ESLint and Prettier rules configured in the project.
- **Prioritize Readability:** When given a choice between a short, clever solution and a slightly longer but more explicit and readable one, the AI must choose readability.
