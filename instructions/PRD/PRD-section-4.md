**4. User Stories / Key Functional Scenarios**

- **Purpose for AI:** To provide specific, actionable requirements in a "user-centric" format that can be directly translated into development tasks and functional outcomes.

**4.1. Product & Inventory Management**

- **US1 (Add Product):** As a `Shop Owner`, I want to manually input product details (name, category, purchase price, selling price, initial stock, optional SKU) into a form and save it as a new product record, so that I can track this item in my inventory.
- **US2 (Edit Product):** As a `Shop Owner`, I want to select an existing product and modify its details in a form, so that I can keep my product information accurate.
- **US3 (Delete Mistaken Product):** As a `Shop Owner`, if I add a product by mistake and it has no associated transaction history, I want to be able to permanently delete it, so that my product catalog does not contain erroneous entries.
- **US4 (Deactivate Discontinued Product):** As a `Shop Owner`, I want to mark a product as 'inactive' when I no longer plan to sell it, so it doesn't appear in active searches for new sales/purchases, but its historical data is preserved for reporting.
- **US5 (Receive Stock):** As a `Shop Owner/Staff`, I want to search for products, enter the quantity received and the purchase cost, and finalize the receipt, so that my inventory levels are accurately increased and the purchase is logged.
- **US6 (Adjust Stock Manually):** As a `Shop Owner`, I want to select a product and manually change its stock quantity with a reason (e.g., "damage," "count correction"), so that my system inventory matches physical reality.
- **US7 (Monitor Low Stock):** As a `Shop Owner`, I want to view a list or receive a notification for products whose stock levels are at or below a reorder point I define, so I can efficiently manage reordering.

**4.2. Sales & Customer Interaction**

- **US8 (Process High-Speed Sale):** As a `Shop Owner/Staff`, I want to use a keyboard-centric interface to rapidly search for products, add them to a sale, and adjust their price/quantity, with focus automatically returning to the search bar after each item, so that I can process multi-item transactions with maximum speed.
- **US9 (Override Price):** As a `Shop Owner`, during a sale, I want to be able to manually change the selling price of a line item, so that I can offer flexible pricing to customers.
- **US10 (Create Product On-the-Fly during Sale):** As a `Shop Owner/Staff`, if a customer brings an uncatalogued item to the counter, I want to use a quick-add function to create a new product record by entering only its name and selling price, so that I can complete the sale without disruption.
- **US11 (Finalize Cash Sale):** As a `Shop Owner/Staff`, I want to click a primary "Complete Sale (Cash)" button to finalize a transaction, record the payment, and have the system automatically update inventory and financial records.
- **US12 (Finalize "On Account" Sale):** As a `Shop Owner/Staff`, I want to click a secondary "Finalize On Account" button, which opens a modal where I can search for an existing customer or create a new one on-the-fly, so that I can complete the sale and charge the total amount to the customer's account balance.
- **US13 (Edit In-Progress Sale):** As a `Shop Owner/Staff`, before finalizing a sale, I want to be able to use my mouse or keyboard (arrow keys) to select any item already in the transaction list and edit its price or quantity, so that I can easily correct mistakes or accommodate customer changes.
- **US14 (Process Return/Exchange):** As a `Shop Owner/Staff`, I want to find a past sale transaction, initiate a "Return/Exchange" process, select which items are being returned, add new items for exchange, and have the system calculate the final balance (refund or new amount due), so that I can accurately handle post-sale adjustments while maintaining a clear audit trail.

**4.3. Accounts & Financial Management**

- **US15 (Manage Customer Debt):** As a `Shop Owner`, I want to view a list of all customers who have an outstanding balance (Accounts Receivable) and be able to record payments they make to reduce their debt.
- **US16 (Manage Supplier Debt):** As a `Shop Owner`, I want to be able to receive stock from a supplier "on credit" and view a list of all suppliers to whom I owe money (Accounts Payable), so that I can track and manage my own business debts.
- **US17 (Record Payment to Supplier):** As a `Shop Owner`, I want to select a supplier to whom I owe money and record a payment I have made to them, so that my outstanding debt to that supplier is accurately reduced.
- **US18 (View Transaction History):** As a `Shop Owner`, I want to view a detailed, searchable ledger of all past sales and purchase transactions, so that I can review specific historical events.
- **US19 (View Profitability):** As a `Shop Owner`, I want to view a report that shows my total sales, total cost of goods sold, and resulting profit over a selected time period, so I can understand the financial performance of my business.

**4.4. User & Subscription Management**

- **US20 (Manage Staff):** As a `Shop Owner`, I want to invite new staff members via email, view a list of all users in my shop, and remove staff members, up to the user limit of my current subscription plan.
- **US21 (Experience Trial & Subscription):** As a new `Shop Owner`, I want to automatically start a free trial, and later be able to view the available subscription plans (Basic, Standard, Premium) and (simulate) choosing a plan to activate its specific feature and data limits.
- **US22 (Understand Plan Limits):** As a `Shop Owner`, if I attempt an action that exceeds my current plan's limits (e.g., adding a 4th user on a 3-user plan), I want the system to prevent the action and clearly inform me that I need to upgrade.
