**3. Key User Roles & Their Core Functional Interactions/Needs**

- **Purpose for AI:** To define distinct types of users, their permissions, and the specific system interactions they require. This is critical for implementing the application's authorization logic and for tailoring the UI to different user levels.

**3.1. Role: `Shop Owner` (Admin)**

- **Description:** This is the primary, root-level user for a given shop's account. This role is automatically assigned to the user who initially signs up. There is only one `Shop Owner` per shop account.
- **Core Functional Interactions/Needs:** This role has **unrestricted access** to all features and data within the boundaries of the shop's active subscription plan.

  - **Full System Configuration:**
    - **Subscription Management:** Can view subscription plans, select/change the shop's plan (simulated), and understand the associated limits.
    - **User Management:** Can invite new `Shop Staff` users via email, view a list of all users, and remove `Shop Staff` users from the shop account, up to the limit of the current subscription plan.
  - **Complete Product & Inventory Management:**
    - Can perform all CRUD operations on products: Add, Edit, View all details.
    - Can perform sensitive lifecycle actions: **Conditionally Delete** products (if no transaction history) and **Deactivate/Reactivate** products.
    - Can perform all inventory adjustments and receive stock.
  - **Unrestricted Sales & Accounts Management:**
    - Can perform all sales functions, including the ability to **override prices** during a transaction.
    - Can manage the full lifecycle of both **Accounts Receivable** (customer debts) and **Accounts Payable** (supplier debts), including recording payments received and payments made.
    - Can manage the Customer and Supplier lists.
  - **Full Reporting Access:**
    - Can view all financial reports, including sales, purchases, and profitability analysis.
    - Can view all detailed transaction history ledgers.

**3.2. Role: `Shop Staff` (Employee)**

- **Description:** A secondary, limited-access user role created by the `Shop Owner`. The number of `Shop Staff` users that can be added is determined by the shop's subscription plan (e.g., 0 for Basic, 2 for Standard, 6 for Premium).
- **Core Functional Interactions/Needs:** This role is focused on day-to-day operational tasks. The UI for this role will hide or disable access to sensitive or strategic functionalities.

  - **Primary Function: Sales Processing:**
    - Can access and operate the main Sales (POS) screen.
    - Can create new sales, search for products, add items, and adjust quantities.
    - Can finalize **Cash Sales**.
    - Can initiate and finalize **"On Account"** sales, including searching for existing customers or creating new ones on-the-fly within the sales modal.
    - **Restriction:** Cannot override the default selling price of an item during a sale unless this permission is explicitly granted in a future version. For MVP, this is disabled.
  - **Inventory Operations:**
    - Can view product details and current stock levels.
    - Can perform the "Receive Stock" workflow to add new inventory from purchases.
    - **Restriction:** Cannot perform manual stock adjustments unless explicitly permitted (for MVP, this is an owner-only task).
  - **Limited Data Viewing:**
    - Can view basic lists like Products and Customers.
    - **Restriction:** Cannot access the main Dashboard with financial KPIs, the Reports section (especially profit reports), or the Subscription/User Management pages.
  - **No Lifecycle Management:**
    - **Restriction:** Cannot add, edit, delete, or deactivate products in the main catalog (though they can use the "on-the-fly" creation during a sale, which creates an "incomplete" product for the owner to review).
    - **Restriction:** Cannot manage the core Supplier or Customer lists (add/edit/delete), but can create them contextually during sales or receiving workflows.

---
