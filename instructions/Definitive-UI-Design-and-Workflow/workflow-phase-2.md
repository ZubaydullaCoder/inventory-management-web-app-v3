**Definitive UI/UX Design & Workflow**

**Phase 2: Daily Operations (The High-Speed Cockpit)**

- **Goal:** To design specialized, highly optimized interfaces for the daily, repetitive tasks of processing sales and receiving inventory. The design must embody the principles of speed, keyboard-centric control, and intuitive clarity to minimize friction and maximize user efficiency under time pressure.
- **Consistency Check:** This phase introduces a specialized `POSLayout` but heavily reuses core components (`ProductSearchInput`, `Modal`, `CreatableSelect`) to maintain a familiar feel. The keyboard interaction patterns established here are paramount and set the standard for all data-entry-intensive features across the application.

**1. The Sales (POS) Screen**

- **URL:** `app.yourdomain.uz/sales`
- **Layout:** A dedicated, full-screen `POSLayout` designed as a command center. It's a responsive two-column layout that transforms into a usable single-column or tabbed view on mobile devices.
- **Left Column: Input & Selection (The "Action Zone")**
  - **`ProductSearchInput`:** The primary point of interaction. It is large, prominent, and keyboard focus is automatically placed here when the screen is ready for a new transaction or a new item. It provides instant, predictive search results as the user types.
  - **"On-the-Fly Product" Button (+):** A small, easily accessible `IconButton` located next to the search bar. Clicking it opens a `Modal` with a minimal form (Product Name, Selling Price) to handle uncatalogued items without disrupting the sales flow.
  - **`QuickAddItem` Grid:** Below the search, a configurable grid of buttons for the shop's top-selling items. This provides a one-touch/one-shortcut method for adding products, bypassing the search for these common goods.
- **Right Column: Current Transaction (The "Status Zone")**
  - **Transaction List:** The main area, displaying a running list of `TransactionLineItem`s added to the current, in-progress sale.
  - **`TransactionLineItem` Component:** A highly interactive component where all key fields are live inputs.
    - **Display:** Shows Product Name, and three editable fields: `Selling Price`, `Quantity`, and `Total Line Price`.
    - **Interaction:** Clicking any of these input fields allows for direct editing (mouse/touch path).
  - **Checkout Area:** At the bottom, this area shows the Subtotal and a large, bold **Total**. It contains two distinct finalization buttons, establishing a clear choice for the user:
    - **`PrimaryButton`: "Complete Sale (Cash)"**. The default, most common action. It may trigger a quick `Modal` or inline field for "Amount Tendered" to calculate change.
    - **`SecondaryButton`: "Finalize On Account"**. This triggers the specialized credit sale workflow.
- **Definitive Keyboard-Centric Workflow:**
  1.  **Start:** Focus is in `ProductSearchInput`.
  2.  **Search & Select:** Staff types "phillips scr", uses arrow keys to highlight the correct screwdriver, presses **Enter**.
  3.  **Add & Focus Price:** The item appears in the transaction list. Focus immediately jumps to the **`Selling Price`** input for that new line. The default price is pre-selected.
  4.  **Confirm Price & Focus Quantity:** Staff presses **Enter** to accept the price. Focus jumps to the **`Quantity`** input. The "1" is pre-selected.
  5.  **Set Quantity & Refocus Search:** Staff types the desired quantity (e.g., "3") and presses **Enter**. The line item's totals update, and focus instantly returns to the `ProductSearchInput`, ready for the next item.
  6.  **Editing a Previous Item:** Staff presses the **Up Arrow (↑)** key to move focus from the search bar into the transaction list. They use Up/Down arrows to navigate between items and Tab to move between fields within an item. After making an edit and pressing Enter, focus returns to the `ProductSearchInput`. Pressing **Escape (Esc)** also returns focus to the search bar.

**2. The "Finalize On Account" Workflow (Revised & Detailed)**

- **Trigger:** Staff clicks the "Finalize On Account" button.
- **UI:** A single, purpose-built **`Modal`** appears.
- **Modal Layout & Content:**
  - **Top:** A `CreatableSelect` component, auto-focused, for searching or creating a customer.
  - **Middle:** A `CustomerInfoForm` with fields for Name, Phone, Address. **This form is initially disabled.**
  - **Contextual Info:** A non-editable `StatCard` or info display: **"Current Outstanding Balance: [Amount] UZS"**. This appears _after_ an existing customer is selected.
  - **Bottom:** A section to input an "Initial Payment" (if any), which defaults to "0".
  - **Modal Actions:** A `PrimaryButton` for "Save and Complete Sale" and a "Cancel" button.
- **Interaction Flow:**
  1.  Staff searches for an existing customer, "Mr. Karim," and selects him from the results.
  2.  **UI Action:** The `CustomerInfoForm` is instantly populated with Mr. Karim's data in **fully editable input fields**. The "Current Outstanding Balance" info appears.
  3.  **Edge Case (Updating Info):** The staff notices Mr. Karim has a new phone number. They directly type the new number into the "Phone Number" input field.
  4.  **Interaction (New Customer):** If the customer was not found, the `CreatableSelect` offers to "Create '[New Name]'". Upon selection, the `CustomerInfoForm` becomes enabled for data entry.
  5.  Staff clicks "Save and Complete Sale." The modal closes, the sale is finalized, Mr. Karim's contact info is updated, and his account balance is increased by the sale amount.

**3. The "Receive Stock" Page (Revised & Detailed)**

- **URL:** `app.yourdomain.uz/inventory/receive-stock`
- **Goal:** To provide an efficient, "heads-down" data entry experience for logging new inventory, with the same conveniences as the sales screen.
- **Layout:** A consistent two-column "cockpit" layout.
- **Left Column: Receiving Session Details**
  - **Supplier Selection:** A `CreatableSelect` component at the top to search for or create a supplier on-the-fly.
  - **Product Entry:** The `ProductSearchInput` is present, and next to it is a **"+" (On-the-Fly Product) button**.
- **Right Column: Summary & Finalization**
  - A running "Total Cost" of the shipment.
  - Payment options: "Paid in Full" or "On Credit."
  - A `PrimaryButton` to **"Add to Inventory."**
- **Edge Case Workflow (New Product during Receiving):**
  1.  A new item arrives that is not in the system. Staff searches and finds nothing.
  2.  Staff clicks the **"+" button**.
  3.  The "Add New Product" `Modal` opens, containing the **full product creation form**. This is critical because the Purchase Cost is known at this moment and must be captured.
  4.  Staff fills in all the details for the new item and saves the modal.
  5.  The modal closes. The new item is automatically added to the "Receiving List" on the main page, and focus is placed on its "Quantity Received" input, allowing the workflow to continue seamlessly.

This definitive design for Phase 2 provides highly specialized and optimized interfaces for the application's most critical daily tasks, ensuring user efficiency and satisfaction during high-pressure situations by incorporating all refined workflows and edge cases.
