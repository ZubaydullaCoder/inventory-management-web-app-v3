**6. Core Features & Functionalities**

- **Purpose for AI:** To provide a granular, feature-by-feature specification of what to build. Each point represents a distinct piece of functionality the AI must implement.

**6.1. Product & Category Management**
_ **6.1.1. Add New Product:** Form for creating a new product with fields: Name (Required), Category, Supplier (Optional), Purchase Price, Selling Price (Required), Unit of Measure, Initial Stock Quantity, Reorder Point (Optional), Internal SKU/Product Code (Optional). If SKU is blank, the system must generate a unique ID.
_ **6.1.2. View/Search Product List:** A responsive `DataTable` displaying active products with key columns. Must include robust search (by name/SKU) and filtering (by category). Must support sorting and pagination.
_ **6.1.3. Edit Product:** A `Modal` containing the product form, pre-filled with existing data, for modifying any product attribute.
_ **6.1.4. Categories Management:** A dedicated interface for creating, renaming, and deleting product categories. Deletion is only permitted if no products are assigned to the category.
_ **6.1.5. Delete Product (Conditional):** A function, accessible from the product list, that permanently deletes a product record **only if** a system check confirms it has zero associated transaction history (sales, purchases, adjustments, credit logs). If history exists, the action is blocked with an informative message.
_ **6.1.6. Deactivate/Reactivate Product:** A function to toggle a product's `isActive` status. Inactive products must be hidden from all active lookups (e.g., POS search, new purchase orders) but must remain in the database for historical reporting.

**6.2. Inventory Control**
_ **6.2.1. Receive Stock (Purchases):** A dedicated interface for recording the receipt of new inventory. It must allow for:
_ Selection of a Supplier (optional, using a `CreatableSelect` component).
_ Adding multiple products to a single receiving session.
_ Specifying quantity received and purchase cost for each item.
_ Finalizing the session with a status of "Paid in Full" or "On Credit."
_ **6.2.2. Real-time Stock Level Updates:** The system must automatically and accurately increment/decrement product stock levels based on finalized Purchases, Sales, Returns, and Manual Adjustments.
_ **6.2.3. Low Stock Report/Widget:** A dedicated report and/or a dashboard widget that lists all products currently at or below their specified reorder point.
_ **6.2.4. Manual Stock Adjustments:** A form for the `Shop Owner` to manually alter a product's stock count (positive or negative) with a mandatory "Reason" field (e.g., dropdown with "Damage," "Shrinkage," "Count Correction," "Other"). Each adjustment must be logged.

**6.3. Sales Processing (Point of Sale - POS)**
_ **6.3.0. Guiding Principle:** The UI must be optimized for extreme speed, responsiveness, and keyboard-only operation.
_ **6.3.1. High-Speed Transaction Building:** An interface allowing rapid addition of items via an auto-focused, predictive `ProductSearchInput` and a `QuickAddItem` grid.
_ **6.3.2. Flexible Line Item Editing:** Each line item in the in-progress sale must have editable inputs for Selling Price, Quantity, and Total Line Price, with interlinked calculations. The entire flow must be navigable via keyboard (Arrows, Tab, Enter, Esc).
_ **6.3.3. Price Override:** `Shop Owner` role can manually change the selling price of any line item for the current transaction.
_ **6.3.4. On-the-Fly Product Creation:** A "+" button on the POS screen that opens a minimal `Modal` to create a new, "incomplete" product record (Name, Selling Price only) to avoid disrupting the sale.
_ **6.3.5. Dual Finalization Flow:**
_ **Cash Sale:** A primary button to finalize the sale as a cash transaction.
_ **On Account Sale:** A secondary button that opens a modal to search for/create a customer and finalize the sale by adding the total to their account balance. \* **6.3.6. In-Progress Sale Editing:** The user must be able to navigate back to and edit any line item in the current transaction list before finalization.

**6.4. Post-Sale Adjustments (Returns & Exchanges)**
_ **6.4.1. Past Sale Search & Lookup:** An interface to find previous sales transactions via flexible search criteria (date, customer, product, amount).
_ **6.4.2. Return/Exchange Mode:** A special UI mode, initiated from a past sale, that allows the user to:
_ Select items and quantities from the original sale to be returned (creating negative value line items).
_ Add new items to the transaction for an exchange (creating positive value line items). \* **6.4.3. Finalize Return/Exchange:** A function to complete the return transaction, which calculates the net balance (refund due or new amount owed), creates a new linked transaction record of type 'return', and correctly adjusts inventory levels for all affected items.

**6.5. Customer & Supplier Management (CRM/SRM)**
_ **6.5.1. Customer Management:** An interface to view, add, edit, and manage a list of customers (Name, Phone, Address).
_ **6.5.2. Supplier Management:** An interface to view, add, edit, and manage a list of suppliers. \* **6.5.3. On-the-Fly Creation:** The ability to create new customers and suppliers contextually from the "On Account" sales modal and "Receive Stock" page, respectively, using a `CreatableSelect` component.

**6.6. Accounts Management (Payables & Receivables)**
_ **6.6.1. Accounts Receivable Ledger:** A dedicated page listing all customers with an outstanding balance. Must include a function to "Record Payment" from a customer, which reduces their balance and logs the payment.
_ **6.6.2. Accounts Payable Ledger:** A dedicated page listing all suppliers the shop owes money to. Must include a function to "Record Payment" to a supplier, which reduces the shop's debt and logs the payment.

**6.7. Reporting & History**
_ **6.7.1. Dashboard:** A main dashboard with widgets for key metrics (Sales, Profit), and actionable lists (Low Stock, Incomplete Products, Account Balances). Data is filterable by a `DateRangePicker`.
_ **6.7.2. Detailed Transaction Ledgers:** Searchable, filterable `DataTable` views for all Sales History, Purchase History, and Stock Adjustment History. \* **6.7.3. Aggregated Reports:** Reports that aggregate data over a selected time period, including a Sales Summary and a Basic Profitability Report (calculating profit based on sales price vs. recorded purchase cost).

**6.8. User & Subscription Management**
_ **6.8.1. User Authentication:** Secure user login via Google OAuth only for MVP.
_ **6.8.2. Role-Based Access Control (RBAC):** The system must enforce the permissions defined for the `Shop Owner` and `Shop Staff` roles throughout the backend and UI.
_ **6.8.3. User Invitation & Management:** An interface for the `Shop Owner` to invite staff via email and manage the list of users associated with the shop account.
_ **6.8.4. Simulated Subscription Management:**
_ An interface to display the 3-tier subscription plans (Basic, Standard, Premium) with their features and (simulated) prices.
_ A simulated flow for a user to select and "activate" a plan.
_ Backend logic to enforce plan-based limitations (Product Count, User Count) based on the shop's currently active (simulated) plan.
_ Automatic 14-day free trial management for new sign-ups.
