**7. Functional Acceptance Criteria / Key Testable Outcomes**

- **Purpose for AI:** To provide clear, specific, and testable conditions that must be met for each key feature to be considered "correctly implemented." The AI must build code that satisfies these criteria. For MVP, verification will be primarily manual.

**7.1. Product Management**

- **For Feature 6.1.5: Delete Product (Conditional):**
  - **AC 7.1.1:** When the `Shop Owner` triggers the "Delete" action for a product, the system must first execute checks against the sales, purchases, stock adjustments, and customer credit transaction tables for any records linked to this product's ID.
  - **AC 7.1.2:** If the checks in AC 7.1.1 find zero associated transaction records, the system must permanently remove the product record from the database. A success message must be displayed.
  - **AC 7.1.3:** If the checks in AC 7.1.1 find one or more associated transaction records, the system must block the deletion, the product record must remain in the database, and an error message must be displayed to the user explaining why it cannot be deleted and suggesting deactivation instead.

**7.2. Sales Processing (POS)**

- **For Feature 6.3.1 & 6.3.2 (High-Speed Transaction Building & Editing):**

  - **AC 7.2.1:** Upon selecting a product from the `ProductSearchInput` using the Enter key, the product must be added as a new line item to the in-progress sale, and keyboard focus must immediately be set to the `Selling Price` input of that new line.
  - **AC 7.2.2:** When focus is on the `Selling Price` input, pressing Enter must move focus to the `Quantity` input of the same line item.
  - **AC 7.2.3:** When focus is on the `Quantity` or `Total Line Price` input, pressing Enter must confirm the line item's values and immediately return keyboard focus to the main `ProductSearchInput`.
  - **AC 7.2.4:** When focus is in the `ProductSearchInput`, pressing the Up Arrow key must move focus into the transaction list, specifically to an interactive element on the last line item.
  - **AC 7.2.5:** When focus is within the transaction list, the Up and Down Arrow keys must correctly navigate between the line items.
  - **AC 7.2.6:** Modifying a `Quantity` input must instantly recalculate and update the `Total Line Price` input for that item, and the overall sale's Total.
  - **AC 7.2.7:** Modifying a `Total Line Price` input must instantly recalculate and update the `Quantity` input for that item, and the overall sale's Total.

- **For Feature 6.3.4: On-the-Fly Product Creation:**

  - **AC 7.2.8:** Clicking the "+" button on the POS screen must open a `Modal` containing a form with, at minimum, "Product Name" and "Selling Price" fields.
  - **AC 7.2.9:** Upon saving the form in the modal, a new product record must be created in the database with a status of 'incomplete'.
  - **AC 7.2.10:** The newly created "incomplete" product must be immediately added as a line item to the current in-progress sale.

- **For Feature 6.3.5: Dual Finalization Flow ("On Account"):**
  - **AC 7.2.11:** Clicking the "Finalize On Account" button must open a `Modal` containing a `CreatableSelect` customer search/creation component.
  - **AC 7.2.12:** If a new customer is created within this modal, a new customer record must be persisted to the database.
  - **AC 7.2.13:** Upon finalization, the created sales record must be correctly linked to the selected/created customer's ID, and the customer's `outstanding_balance` must be increased by the sale's total amount.

**7.3. Post-Sale Adjustments**

- **For Feature 6.4.3: Finalize Return/Exchange:**
  - **AC 7.3.1:** Upon finalizing a return/exchange, a new transaction record of type 'return' must be created and linked to the original sale's ID.
  - **AC 7.3.2:** The stock level for any fully or partially returned item must be **incremented** by the returned quantity.
  - **AC 7.3.3:** The stock level for any new item sold as part of the exchange must be **decremented** by the sold quantity.
  - **AC 7.3.4:** If a net refund was due and the original sale was "On Account," the customer's `outstanding_balance` must be appropriately decreased.

**7.4. Accounts Management**

- **For Feature 6.2.1 & 6.6.2 (On Credit Purchases & Accounts Payable):**
  - **AC 7.4.1:** When a "Receive Stock" session is finalized with the status "On Credit," the total cost of the purchase must be added to the selected supplier's `outstanding_debt` balance.
  - **AC 7.4.2:** When a `Shop Owner` records a payment made to a supplier, a payment log must be created, and the supplier's `outstanding_debt` balance must be decreased by the payment amount.

**7.5. User & Subscription Management**

- **For Feature 6.8.4: Simulated Subscription Management:**
  - **AC 7.5.1:** A `Shop Owner` on the "Standard" plan (User Limit: 3) who has 3 active users must be prevented from inviting a 4th user. The UI must display an informative message explaining the limit has been reached.
  - **AC 7.5.2:** A user on the "Basic" plan (Product Limit: 300) who has 300 products must be prevented from creating a 301st product. The UI must display an informative message.
  - **AC 7.5.3:** A `Shop Staff` user must not see UI elements for, or be able to access the routes for, `/settings/subscription` or `/settings/users`. Access must be blocked on both the frontend and the backend API.
  - **AC 7.5.4:** A new user upon registration must have their account status set to "Trial" with an expiry date of 14 days in the future. After this date, the system must automatically change their status to "Trial Expired," triggering limitations on functionality.

**7.6. General UI/UX**

- **AC 7.6.1 (Responsiveness):** All pages must render legibly and be functionally usable on three representative screen widths: mobile (~375px), tablet (~768px), and desktop (~1280px). No critical information or actions may be hidden or inaccessible due to layout issues.
- **AC 7.6.2 (Feedback):** All data-mutating actions (Save, Delete, Update, Finalize) must provide clear visual feedback to the user upon completion, either through a success/error `Alert` or by visibly updating the relevant data on the screen.
