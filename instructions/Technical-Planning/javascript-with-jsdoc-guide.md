**Guide Document 6: JavaScript with JSDoc for Robust Development: Best Practices**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction**

This document outlines the best practices for writing high-quality, type-safe JavaScript using JSDoc annotations. While the project uses standard JavaScript (`.js`/`.jsx`), JSDoc is **mandatory** for providing the type-safety contracts essential for maintainability and for the AI agent to generate correct and predictable code.

**2. Core Principle: JSDoc as the Contract**

JSDoc comments are not just documentation; they are the definitive "contract" for how functions and data structures should behave. The project is configured with `"checkJs": true` in `jsconfig.json`, allowing VS Code and the development server to perform type-checking based on these annotations.

**3. Defining Types with `@typedef`**

- **Purpose:** To define complex object shapes, similar to an `interface` or `type` in TypeScript.
- **Best Practice:** For globally used types (e.g., `Product`, `Sale`, `Customer`), define them in a central file: `src/lib/types.js`. This allows them to be imported throughout the application, creating a single source of truth for data models.
- **AI Action:** The AI must use `@typedef` to define all shared data structures.

  ```javascript
  // src/lib/types.js

  /**
   * Represents a product in the inventory.
   * This is the canonical definition for a Product object.
   * @typedef {object} Product
   * @property {string} id - The unique identifier (UUID).
   * @property {string} name - The display name of the product.
   * @property {number} sellingPrice - The price to the customer.
   * @property {number} purchasePrice - The cost of the product.
   * @property {number} stock - The current quantity on hand.
   * @property {string | null} [sku] - Optional Stock Keeping Unit.
   * @property {Date} createdAt - Timestamp of creation.
   */

  /**
   * Represents the data required to create a new product.
   * @typedef {Omit<Product, 'id' | 'createdAt'>} ProductCreateInput
   */
  ```

**4. Documenting Functions**

- **Purpose:** To clearly define the parameters a function accepts and the value it returns.
- **Best Practice:** Every non-trivial function must have a JSDoc block.
- **AI Action:** The AI must document all generated functions.

  ```javascript
  // src/lib/utils/product-helpers.js
  import { Product } from "../types.js"; // This import is for JSDoc's benefit

  /**
   * Calculates the gross profit for a single product unit.
   * @param {Product} product - The product to calculate profit for.
   * @returns {number} The calculated gross profit.
   */
  export function calculateGrossProfit(product) {
    if (
      !product ||
      typeof product.sellingPrice !== "number" ||
      typeof product.purchasePrice !== "number"
    ) {
      return 0;
    }
    return product.sellingPrice - product.purchasePrice;
  }
  ```

**5. Importing and Using Types**

- **Purpose:** To use types defined in other files.
- **Best Practice:** Use the `import()` syntax within JSDoc to reference types from other modules. This provides strong typing and editor autocompletion.

  ```javascript
  // src/components/features/products/ProductCard.jsx

  /**
   * Displays a single product card.
   * @param {{ product: import('@/lib/types.js').Product }} props
   */
  export default function ProductCard({ product }) {
    return (
      <div>
        <h3>{product.name}</h3>
        <p>Price: {product.sellingPrice}</p>
        <p>Stock: {product.stock}</p>
      </div>
    );
  }
  ```

**6. Typing Variables with `@type`**

- **Purpose:** To apply a type to a variable or constant, especially when its type cannot be inferred automatically.
- **Best Practice:** Use this for initializing arrays or for casting objects to a known type.

  ```javascript
  /** @type {import('@/lib/types.js').Product[]} */
  const initialProducts = [];

  /** @type {HTMLInputElement | null} */
  const inputRef = document.querySelector("#my-input");
  ```

**7. Advanced JSDoc Patterns**

- **Union Types:** Use a pipe (`|`) to indicate a value can be one of several types.
  ```javascript
  /**
   * @param {string | number} id - The identifier.
   */
  function findById(id) {
    /* ... */
  }
  ```
- **Optional Parameters:** Use square brackets (`[]`) around the parameter name.
  ```javascript
  /**
   * @param {string} name
   * @param {string} [prefix] - An optional prefix.
   */
  function formatName(name, prefix) {
    /* ... */
  }
  ```
- **Generic Types (e.g., Arrays):**
  ```javascript
  /**
   * @returns {Promise<Array<import('@/lib/types.js').Product>>}
   */
  async function fetchAllProducts() {
    /* ... */
  }
  ```

**8. JSDoc and React Components**

- **Function Components:** Type the `props` object as shown in section 5.
- **`useState` Hook:** JSDoc can often infer the type from the initial value. For complex types, you can add an annotation.
  ```javascript
  const [product, setProduct] = useState(
    /** @type {import('@/lib/types.js').Product | null} */ (null)
  );
  ```
- **`useRef` Hook:** Be explicit about the type of the ref's `current` property.
  ```javascript
  /** @type {React.RefObject<HTMLInputElement>} */
  const nameInputRef = useRef(null);
  ```

**9. AI Agent's Responsibility**

- **Strict Adherence:** The AI must strictly adhere to using JSDoc for all new code.
- **Clarity over Brevity:** It is better to be explicit with JSDoc than to rely on type inference.
- **Centralized Types:** Use the `src/lib/types.js` file for all major data structures that are shared across the application.
- **Function Documentation:** Every function signature must be documented with `@param` and `@returns`.
- **React Prop Typing:** All React component props must be documented.

By enforcing these JSDoc practices, we ensure the JavaScript codebase remains robust, understandable, and easy for both human and AI developers to work with, effectively mitigating many of the risks associated with plain JavaScript.

---
