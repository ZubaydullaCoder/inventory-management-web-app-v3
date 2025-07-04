**Definitive Monetization Strategy: Retail Inventory & Finance Manager**

**Version:** 1.0 (Final for Technical Planning)
**Date:** (Current Date)

**1. Overview & Goals**

This document outlines the initial monetization strategy for the "Retail Inventory & Finance Manager" application. The primary goals of this strategy are:

- To offer a clear, tiered, and highly affordable pricing structure suitable for the spectrum of small to mid-sized retail businesses in Uzbekistan.
- To drive user adoption through a compelling and frictionless free trial of the full-featured product.
- To establish a logical upgrade path that allows the application to grow with the user's business.
- To provide the specific parameters for the AI agent to implement a _simulated_ 3-tier subscription model in the MVP.

**2. Target Audience & Tiered Approach**

The strategy employs a 3-tier model to cater to the distinct needs of different business sizes:

- **Free Trial:** For all new users to experience the full capabilities of the "Premium" plan.
- **"Basic" Plan:** Aimed at solo owner-operators and very small shops with basic inventory needs, just starting their digital journey.
- **"Standard" Plan:** Designed for established small businesses with a growing inventory and a small team (e.g., owner + a couple of staff members).
- **"Premium" Plan:** Suited for larger small businesses or those with more complex operations, requiring a larger team to have access to the system.

**3. Subscription Plan Details (Parameters for AI Simulation in MVP)**

| Parameter                | Free Trial             | "Basic" Plan                                            | "Standard" Plan                                         | "Premium" Plan                                          |
| :----------------------- | :--------------------- | :------------------------------------------------------ | :------------------------------------------------------ | :------------------------------------------------------ |
| **Duration**             | 14 Days                | N/A                                                     | N/A                                                     | N/A                                                     |
| **Monthly Price (UZS)**  | 0                      | **35,000 UZS** (Simulated)                              | **99,000 UZS** (Simulated)                              | **199,000 UZS** (Simulated)                             |
| **Annual Price (UZS)**   | N/A                    | **350,000 UZS** (Simulated)                             | **990,000 UZS** (Simulated)                             | **1,990,000 UZS** (Simulated)                           |
| _(Discount Note)_        |                        | _(Effectively 10 months payment for 12 months service)_ | _(Effectively 10 months payment for 12 months service)_ | _(Effectively 10 months payment for 12 months service)_ |
| **Product Limit**        | (Same as Premium Plan) | Up to **300** unique products                           | Up to **1,500** unique products                         | **Unlimited** products                                  |
| **User Account Limit**   | (Same as Premium Plan) | **1** User (Shop Owner)                                 | Up to **3** Users (1 Owner + 2 Staff)                   | Up to **7** Users (1 Owner + 6 Staff)                   |
| **Core Features Access** | All Core Features      | All Core Features (subject to above limits)             | All Core Features (subject to above limits)             | All Core Features (subject to above limits)             |

**4. Free Trial Mechanics (for AI Implementation)**

- **Activation:** Automatically starts for all new users upon successful registration.
- **Plan during Trial:** Users experience the **"Premium" Plan** limits and features. This is a key sales strategy to let them see the full potential of the application.
- **Post-Trial Behavior:** If no (simulated) subscription is chosen after 14 days, the account status changes to "Trial Expired." Access will be limited (e.g., read-only or new data entry disabled) with clear prompts to subscribe to a paid plan to restore full functionality.

**5. Simulated Subscription & "Payment" Flow (for AI Implementation)**

- **Plan Selection UI:** The application must display the "Basic," "Standard," and "Premium" plans side-by-side, clearly showing their respective (simulated) monthly/annual prices and key feature limits (Product Count, User Count).
- **"Checkout" Simulation:**
  1.  User selects a plan and a billing cycle.
  2.  User clicks a "Confirm Subscription" button.
  3.  A `Modal` appears to confirm the action, stating the plan and simulated cost.
  4.  Upon final confirmation, the system updates the user's account status to the chosen plan and sets a (dummy) renewal date. No real payment information is ever collected.
- **Subscription Status Display:** The user's account settings area must clearly display their current plan, its limits, and its (simulated) renewal date.

**6. Future Monetization Considerations (Post-MVP)**

- **Payment Gateway Integration:** The first step post-MVP will be to integrate with local Uzbek payment gateways (e.g., PayMe, Click) to process real payments.
- **Premium Feature Development:** The "Premium" tier is designed to host future advanced features, further justifying its value. Potential premium-only features include:
  - Advanced analytical reports and dashboards.
  - Multi-location/multi-branch support.
  - Granular user permissions (beyond the basic Owner/Staff roles).
  - Data import/export tools.

**7. Key Instructions for AI Agent (regarding this strategy for MVP)**

- Implement the UI to display **three** subscription plans (Basic, Standard, Premium) with the UZS prices and limits specified in the table above.
- Implement the logic for the 14-day free trial of the **"Premium"** plan.
- Ensure the system correctly enforces the specified **Product Limits (300, 1,500, Unlimited)** and **User Account Limits (1, 3, 7)** based on the (simulated) active plan.
- The subscription confirmation process is purely simulated.

---
