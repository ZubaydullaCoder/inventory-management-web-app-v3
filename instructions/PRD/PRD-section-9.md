**9. Out of Scope / Non-Functionality**

- **Purpose for AI:** To provide a definitive list of features, functionalities, and characteristics that the AI agent should **not** attempt to build or consider for the MVP. This prevents scope creep, manages development effort, and ensures the AI focuses exclusively on the prioritized requirements.

**9.1. Features & Functionalities Not Included in MVP**

- **9.1.1. Real Payment Gateway Integration:** As per constraint C1, no integration with any real payment providers (PayMe, Click, Stripe, etc.) will be implemented.
- **9.1.2. Automated Testing:** As per constraint C2, the generation of automated test suites (unit, integration, e2e) is out of scope.
- **9.1.3. Barcode Scanning & Hardware Integration:** No functionality for interacting with barcode scanners, receipt printers, or cash drawers.
- **9.1.4. Advanced & Customizable Reporting:** A report builder, custom dashboards, data visualization beyond simple charts, or predictive analytics are out of scope.
- **9.1.5. Native Mobile Application:** No development of a downloadable iOS or Android application. The focus is solely on the responsive web application.
- **9.1.6. Offline Functionality:** The application will not support any offline data storage, processing, or synchronization.
- **9.1.7. Multi-Language Support:** Beyond building the UI in a single primary language (English), no internationalization (i18n) or localization (l10n) features will be implemented.
- **9.1.8. Advanced User Permissions:** A granular, customizable role-based access control (RBAC) system is out of scope. The MVP will only use the two predefined `Shop Owner` and `Shop Staff` roles.
- **9.1.9. Advanced Purchase Order Management:** A full system for creating, sending, and tracking the status of Purchase Orders (POs) with suppliers is out of scope. The "Receive Stock" feature covers the inventory intake aspect only.
- **9.1.10. Advanced Supplier Relationship Management (SRM):** Beyond a simple list with contact info and debt tracking, features like supplier-specific product catalogs, performance tracking, or communication logs are out of scope.
- **9.1.11. Multi-Shop / Multi-Branch Functionality:** The system is designed for a single retail shop instance per account. Features to manage multiple store locations under one account are out of scope.
- **9.1.12. Ecommerce & Marketplace Integration:** No integration with any online sales platforms (e.g., Shopify, Amazon, Instagram) is in scope.
- **9.1.13. Complex Tax Calculation Engine:** The system will not handle complex, region-specific tax rules, tax-exempt items, or official tax reporting. All pricing is assumed to be simple and inclusive of any necessary taxes for MVP purposes.
- **9.1.14. Bulk Data Import/Export:** Features for importing existing product/customer lists from files (e.g., CSV, Excel) or exporting data sets are out of scope for the MVP. All initial data entry is manual.
- **9.1.15. Public or Third-Party API:** The application will not expose a REST or GraphQL API for external consumption. All APIs built will be for internal use by the application's frontend.
- **9.1.16. In-depth, Immutable Audit Trails:** While the system will log transactions, a comprehensive, unalterable audit trail for compliance purposes (e.g., logging every single data view or field change) is out of scope.

**9.2. Non-Functional Characteristics Not Prioritized for MVP**

- **9.2.1. Extreme Performance Scalability:** The application will be built to be performant for its target audience, but it will not be architected or optimized for massive enterprise-level scale (e.g., millions of concurrent users or tens of millions of products).
- **9.2.2. User-Facing Customization:** The ability for users to customize themes, layouts, colors, or dashboard widgets is out of scope. A single, clean, standard UI will be provided.
- **9.2.3. Real-time Collaboration:** Features like seeing multiple users editing the same sale in real-time (a la Google Docs) are out of scope. The system will rely on standard data locking or "last-write-wins" for simplicity.

---
