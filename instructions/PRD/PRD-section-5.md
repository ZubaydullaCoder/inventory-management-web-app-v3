**5. Proposed Solution / Product Functional Overview**

- **Purpose for AI:** To provide the AI with a high-level blueprint of the system's architecture, its core modules, and how these functional blocks interact. This serves as a conceptual map before the AI begins implementing individual features.

**5.1. High-Level System Concept**

The "Retail Inventory & Finance Manager" is a responsive, single-page web application (SPA) designed for use on modern browsers across desktop, tablet, and mobile devices. It will function as a centralized, real-time system of record for a retail shop's core operational data: products, inventory, sales, and accounts.

The application is architected as a multi-user system with role-based access control (`Shop Owner`, `Shop Staff`). A shop's access to certain features and data capacities (e.g., number of users, products) is governed by a tiered subscription model, which will be simulated in the MVP.

**5.2. Core Functional Modules**

The application's logic will be organized into several distinct but interconnected modules:

- **Authentication & User Management Module:**

  - Handles user registration (via Google OAuth for MVP), login, and session management.
  - Manages user roles (`Shop Owner`, `Shop Staff`) and enforces permissions based on these roles.
  - Contains the logic for inviting and managing staff users within a shop account.

- **Subscription Management Module (Simulated):**

  - Manages the state of a shop's subscription (Trial, Basic, Standard, Premium).
  - Enforces plan-based limitations (e.g., product counts, user counts) by checking the shop's current subscription state before allowing certain actions.
  - Provides the interface for users to view plans and simulate changing their subscription.

- **Product & Inventory Module:**

  - The central repository for all product information.
  - Manages the full product lifecycle (Create, Read, Update, Conditional Delete, Deactivate).
  - Contains the core logic for tracking `stock_on_hand`. This value is modified exclusively through structured transactions (Sales, Purchases, Adjustments), never directly, to ensure data integrity.

- **Sales & Returns Module (POS):**

  - Provides the high-speed, keyboard-centric Point of Sale interface.
  - Manages the state of an in-progress (in-memory) transaction.
  - Handles the finalization of sales, which triggers updates to the Inventory, Financial, and Accounts Receivable modules.
  - Contains the workflow for processing post-sale adjustments (Returns/Exchanges) by creating new, linked, reversing transactions.

- **Accounts Management Module:**

  - This module manages two key sub-ledgers:
    1.  **Accounts Receivable:** Tracks balances owed by customers. It is updated by "On Account" sales and customer payment records.
    2.  **Accounts Payable:** Tracks balances owed to suppliers. It is updated by "On Credit" purchases and records of payments made to suppliers.
  - Manages the simple CRM/SRM lists for Customers and Suppliers.

- **Reporting & History Module:**
  - Provides interfaces to view historical data.
  - Contains logic to query and aggregate raw transaction data into meaningful financial reports (e.g., calculating profit from sales and purchase costs).
  - Presents detailed, searchable ledgers of all sales, purchases, and stock adjustment transactions.

**5.3. High-Level Data Flow Example (A Completed Sale)**

1.  A `Shop Staff` user interacts with the **Sales Module** to build an in-progress transaction object.
2.  Upon finalization, the **Sales Module** sends the transaction data to be persisted.
3.  The **Inventory Module** is notified; it decrements the stock levels for the products sold.
4.  If the sale was "On Account," the **Accounts Management Module** is notified; it increases the outstanding balance for the selected customer.
5.  The raw transaction data is now available to the **Reporting & History Module** for inclusion in future reports and historical lookups.
