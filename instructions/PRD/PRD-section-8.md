**8. Technical & Functional Assumptions & Constraints**

- **Purpose for AI:** To provide the AI development agent with a clear understanding of the underlying assumptions that guide the product's design and the specific constraints (technical or functional) within which it must operate. This helps the AI make appropriate implementation choices and avoid developing features that violate these boundaries.

**8.1. Assumptions**

- **A1 (Target Environment):** The application will be developed as a responsive web application, intended for primary use on modern browsers (latest versions of Chrome, Firefox, Edge, Safari) across desktop, laptop, tablet, and mobile devices.
- **A2 (User Profile):** Users (`Shop Owner`, `Shop Staff`) are assumed to have basic computer and web literacy. The UI/UX must be designed for intuitiveness and efficiency, minimizing the need for extensive training.
- **A3 (Data Scale for MVP):** The system architecture for the MVP should be optimized for the data volumes of small to mid-sized retail businesses. This includes up to a few thousand unique products and several hundred transactions per day. Extreme-scale performance tuning is not an MVP requirement.
- **A4 (Connectivity):** The application is designed for online use. A stable internet connection is assumed to be available to the user during all interactions. No offline functionality will be implemented.
- **A5 (Localization):**
  - **Currency:** The system will operate exclusively with a single currency: **Uzbek Som (UZS)**. All financial data storage and display will use this currency.
  - **Language:** The user interface for the MVP will be developed in a single language: **English**. A localization framework may be put in place, but translation into other languages (e.g., Uzbek, Russian) is out of scope for the MVP.
- **A6 (Data Accuracy):** The system will assume that the data entered by users (e.g., product names, purchase costs, selling prices, stock counts) is accurate. While the application will have standard input validations (e.g., ensuring a price is a number), it is not responsible for the business-level correctness of the entered data.

**8.2. Constraints**

- **C1 (Authentication Method):** User authentication for the MVP will be implemented **exclusively via Google OAuth**. There will be no traditional email/password registration, "forgot password" flows, or other authentication providers.
- **C2 (Simulated Payments):** All subscription-related payment flows are to be **simulated**. The AI must not integrate any real-world payment gateways. The implementation must focus on the UI/UX of plan selection and the backend logic for managing subscription states and enforcing plan-based limitations.
- **C3 (No Automated Testing in Scope):** The AI agent is **not** required to write or generate automated test files (e.g., unit tests, integration tests) as part of the MVP development scope. Functional correctness will be verified manually against the Acceptance Criteria in Section 7.
- **C4 (Technology Stack):** The application must be implemented using the technology stack that will be defined in the **Phase 2: Technical Planning & Architectural Guidance** document. The AI must adhere to the choices made for the frontend framework (e.g., Next.js), backend framework (e.g., Node.js/Express.js), language (TypeScript), and database.
- **C5 (Hardware Integration):** Direct integration with any physical hardware, including barcode scanners, receipt printers, or cash drawers, is **strictly out of scope** for the MVP.
- **C6 (Third-Party Service Integrations):** No complex third-party service integrations (e.g., external accounting software like QuickBooks, advanced analytics platforms like Mixpanel, or email marketing services like Mailchimp) are required for the MVP.
- **C7 (Security Focus for MVP):** Security implementation will focus on standard, best-practice web application security. This includes:
  - Secure user authentication and session management.
  - Backend authorization checks for all API endpoints to enforce user roles.
  - Input validation and sanitization to prevent common injection attacks.
  - Adherence to framework-level security features (e.g., Next.js/React features to prevent XSS).
  - Advanced security audits, penetration testing, and compliance with specific standards are out of scope for MVP.
- **C8 (Predefined Subscription Tiers):** The three subscription tiers (Basic, Standard, Premium) and their specific limitations (product count, user count) are predefined. The system should not include an interface for an admin to dynamically create or modify these plans for the MVP.
