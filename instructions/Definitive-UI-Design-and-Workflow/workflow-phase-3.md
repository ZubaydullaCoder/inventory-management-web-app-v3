**Definitive UI/UX Design & Workflow**

**Phase 3: Periodic Management & Review (The "Business Health" Center)**

- **Goal:** To transition the user from day-to-day operations to high-level business management. The design must present data in a clear, digestible, and actionable format, helping the owner make informed decisions.
- **Consistency Check:** This phase relies heavily on the consistent use of the `DataTable`, `PageTabs`, `StatCard`, and `Modal` components established in earlier phases. The user will already be familiar with how to interact with these elements, making the experience feel predictable and professional.

**1. The Main Dashboard (The "Mission Control")**

- **URL:** `app.yourdomain.uz/dashboard`
- **Layout:** A responsive grid layout that provides a comprehensive, at-a-glance overview.
- **UI Components & Interaction:**
  - **`PageHeader`:**
    - _Title:_ "Dashboard"
    - _Primary Action:_ A **`DateRangePicker`** ("Today," "This Week," "This Month," "Custom"). All data on the dashboard dynamically updates based on the selected range.
  - **KPI Row:** A row of prominent **`StatCard`** components at the top, displaying the most critical metrics for the selected period:
    - "Total Sales" (Revenue)
    - "Total Profit"
    - "Number of Sales"
    - "Average Sale Value"
  - **Actionable Widgets Grid:** A two-column grid below the KPIs.
    - **Left Column (Urgent To-Do's):**
      - **"Low Stock Items" Widget:** A scrollable list of products at or below their reorder point. Each item shows Name, Stock Level, and is a direct link to the product's edit modal. A "View Full Report" link navigates to a filtered product list.
      - **"Incomplete Products" Widget:** A critical list of all products created "on-the-fly" from the Sales or Receiving screens. Each item is a link that opens the full product edit `Modal`, prompting the owner to complete the necessary data (e.g., Purchase Cost).
    - **Right Column (Financial Overview):**
      - **"Accounts Receivable" Widget:** A `StatCard` showing the total amount of money owed _to_ the shop by customers. A "View Details" link navigates to the full Accounts Receivable page.
      - **"Accounts Payable" Widget:** A `StatCard` showing the total amount of money the shop owes _to_ suppliers. A "View Details" link navigates to the full Accounts Payable page.
  - **Visualizations:** A simple, clean bar chart at the bottom showing "Sales vs. Profit" over the selected date range.

**2. Reports & History Pages**

- **Goal:** To provide detailed, searchable records of all business activities.
- **Layout:** A unified page using **`PageTabs`** to prevent clutter and keep related information together.
- **URL:** `app.yourdomain.uz/reports` (or similar)
- **UI Components & Interaction:**
  - **`PageHeader`:** Title ("Business Reports & History"), a global `DateRangePicker`, and a search bar for finding specific transactions.
  - **`PageTabs`:**
    - **Tab 1: "Reports" (Aggregated Data):**
      - Contains sub-views for Sales Summary, Profit by Product, etc. Each view uses a `DataTable` to present aggregated data for the selected period.
    - **Tab 2: "Sales History" (Transaction Ledger):**
      - A `DataTable` listing every individual sale. Columns: Sale ID, Date/Time, Customer, Total Amount, Status (Paid/On Account).
      - **Interaction:** Clicking any row opens a `Modal` showing a detailed receipt of that specific sale, including all line items.
    - **Tab 3: "Purchase History" (Transaction Ledger):**
      - A `DataTable` listing every stock receiving event. Columns: Purchase ID, Date/Time, Supplier, Total Cost, Status (Paid/On Credit).
      - **Interaction:** Clicking a row opens a `Modal` with the full details of that shipment.
    - **Tab 4: "Stock Adjustments" (Audit Trail):**
      - A `DataTable` listing all manual stock changes. Columns: Date/Time, Product, Quantity Adjusted (+/-), Reason.

**3. Accounts Management (Receivable & Payable)**

- **Goal:** To provide a clear and simple interface for managing debts.
- **Layout:** Two distinct pages, but using the same consistent design pattern.
- **URL:** `/customers/receivables` and `/purchases/payables`
- **UI for Both Pages:**
  - **`PageHeader`:** Clear title ("Money Owed By Customers" / "Money Owed To Suppliers").
  - **`DataTable`:**
    - Lists all customers/suppliers with a non-zero balance.
    - Columns: Name, Contact Info, **Outstanding Balance**.
    - **"Actions" Column (⋮):**
      - The primary action is **"Record Payment."** Clicking this opens a `Modal`.
      - The `Modal` is titled "Record Payment for [Name]". It shows the current balance and has an input for "Payment Amount" (pre-filled with the full balance).
      - Upon confirming the payment in the modal, the `DataTable` refreshes, and the customer/supplier's balance is updated (they may disappear from the list if their balance becomes zero).
      - Another action could be "View History," which navigates to a filtered view of the transaction history for just that customer/supplier.

**4. Subscription Management Page**

- This page falls under a "Settings" area and follows the design laid out in the previous "Phase 4 & 5" description, using `Alerts` and `PricingCards` to clearly communicate the user's (simulated) subscription status and options.

---
