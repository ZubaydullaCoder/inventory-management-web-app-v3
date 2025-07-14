# Retail Inventory & Finance Manager

Welcome to the **Retail Inventory & Finance Manager**.

This application is designed to transform small to mid-sized retail businesses in Uzbekistan from paper-based operations to an efficient digital platform.

## Overview

The app offers effective solutions for inventory and financial management, optimizing processes and enhancing visibility into sales and profitability metrics. It automates product management, sales processing, financial data, and user roles, making it an ideal choice for retail businesses seeking efficiency and growth.

## Project Structure

- **Framework**: Built with [Next.js](https://nextjs.org), utilizing a hybrid server-first approach.
- **Language**: Developed in JavaScript with JSDoc type annotations.
- **Database**: Backed by PostgreSQL using Prisma ORM for robust and optimized data interactions.
- **Authentication**: Implements Google OAuth using Auth.js for secure and streamlined user access.
- **UI Library**: Uses shadcn/ui components and TanStack Query for efficient UI and data management.

## Core Features

1. **Inventory Management**: Comprehensive product lifecycle and stock management.
2. **Sales Processing (POS)**: Quick and flexible transaction handling, supporting cash and on-account sales.
3. **Accounts Management**: Dual-sided accounts management for both receivables and payables.
4. **Reporting**: Provides detailed reports on finances and inventory health.
5. **User & Subscription Management**: Role-based user management leveraging a simulated 3-tier subscription model (Basic, Standard, Premium).

## Subscription Model

- **Free Trial**: Experience all features of the Premium plan for 14 days.
- **Basic Plan**: Suitable for small operations with a limit of 300 products and 1 user.
- **Standard Plan**: Supports growing businesses with up to 1,500 products and 3 users.
- **Premium Plan**: Offers comprehensive capabilities with unlimited products and up to 7 users.

## Target Users

### Shop Owner (Admin)
- **Full System Access**: Complete control over all features and data within subscription limits.
- **Product Management**: Add, edit, delete, and deactivate products with lifecycle management.
- **Sales & Pricing**: Process sales with price override capabilities and manage all transaction types.
- **Accounts Management**: Handle both customer receivables and supplier payables.
- **User Management**: Invite and manage staff members within plan limits.
- **Reporting**: Access to all financial reports and detailed transaction history.

### Shop Staff (Employee)
- **Sales Processing**: Operate the POS system for cash and on-account transactions.
- **Inventory Operations**: View product details and receive stock from purchases.
- **Limited Access**: Cannot access financial reports, user management, or product lifecycle functions.
- **Restrictions**: Price overrides and manual stock adjustments are owner-only functions.

## Technical Architecture

### Core Philosophy
- **Hybrid Server-First Approach**: Uses Next.js App Router with Server Components for initial data loads and Client Components for interactivity.
- **Suspense-Based Loading**: All data-dependent components are wrapped in Suspense boundaries for optimal user experience.
- **Optimistic Updates**: All CRUD operations implement optimistic updates using TanStack Query for instant UI feedback.
- **Traditional Modal Pattern**: Resource-specific modals are rendered in the React tree, not via intercepting routes.

### Data Flow
- **Server Components**: Direct calls to shared service functions for session-specific data.
- **Client Components**: Use TanStack Query to fetch data from API routes.
- **API Routes**: Secure HTTP interface calling shared service functions.
- **Database**: PostgreSQL accessed exclusively via Prisma ORM.

### Security Model
- **Defense in Depth**: Authorization checks at middleware, page, and API route layers.
- **Role-Based Access Control**: Strict enforcement of Shop Owner and Shop Staff permissions.
- **Input Validation**: Comprehensive validation and sanitization to prevent injection attacks.

## Key User Stories

### Product & Inventory Management
- Add new products with complete details (name, category, pricing, stock)
- Edit existing product information and manage categories
- Conditionally delete products (only if no transaction history exists)
- Deactivate discontinued products while preserving historical data
- Receive stock with supplier tracking and cost recording
- Monitor low stock levels with automated alerts

### Sales Processing
- High-speed, keyboard-centric transaction building
- Flexible price overrides for shop owners
- On-the-fly product creation during sales
- Dual finalization: cash sales and on-account sales
- Customer management with debt tracking
- Return and exchange processing with full audit trail

### Financial Management
- Comprehensive accounts receivable and payable tracking
- Detailed transaction history with search capabilities
- Profitability analysis with cost of goods sold calculations
- Real-time financial reporting and dashboard metrics

## Directory Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── products/         # Product management pages
│   │   ├── sales/            # Sales processing interfaces
│   │   ├── reports/          # Financial reporting
│   │   └── layout.jsx        # Shared dashboard layout
│   ├── api/                  # API routes
│   └── layout.jsx            # Root layout
├── components/
│   ├── features/             # Feature-specific components
│   ├── ui/                   # Reusable UI components (shadcn/ui)
│   └── providers/            # React context providers
├── hooks/                    # Custom React hooks
├── lib/
│   ├── api/                  # API implementation functions
│   ├── data/                 # Direct database access (Prisma)
│   ├── services/             # Business logic functions
│   └── utils.js              # Utility functions
└── middleware.js             # Route protection middleware
```

## Development Guidelines

### Code Standards
- **JavaScript with JSDoc**: Type safety through comprehensive JSDoc annotations
- **Component Architecture**: Server Components by default, Client Components for interactivity
- **File Naming**: kebab-case for directories and files, PascalCase for React components
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

### Performance Optimization
- **Server-Side Rendering**: Initial page loads optimized with SSR
- **Code Splitting**: Automatic optimization through Next.js App Router
- **Database Optimization**: Efficient queries with Prisma ORM and proper indexing
- **Caching Strategy**: Leverages Next.js Data Cache for improved performance

## Subscription Plans Detail

| Feature | Free Trial | Basic | Standard | Premium |
|---------|------------|-------|----------|----------|
| Duration | 14 days | Monthly/Annual | Monthly/Annual | Monthly/Annual |
| Price (UZS) | Free | 35,000/mo | 99,000/mo | 199,000/mo |
| Products | Unlimited | 300 | 1,500 | Unlimited |
| Users | 7 | 1 | 3 | 7 |
| Core Features | All | All | All | All |

## Out of Scope (MVP)

- Real payment gateway integration (simulated for MVP)
- Advanced reporting and analytics
- Multi-location/multi-branch support
- Offline functionality
- Hardware integration (barcode scanners, receipt printers)
- Advanced user permission systems
- Automated testing implementation

## Future Enhancements

- Integration with local Uzbek payment gateways (PayMe, Click)
- Advanced analytical dashboards
- Multi-branch management capabilities
- Enhanced supplier relationship management
- Bulk import/export functionality
- Mobile application development

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
