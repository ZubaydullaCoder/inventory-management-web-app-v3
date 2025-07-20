Guide 12: Application Design System & Component Library (Recreated)

Version: 1.1
Date: June 3, 2025
Target Audience: AI Development Agent
Project: Retail Inventory & Finance Manager

1. Core Philosophy & Aesthetic

This document defines the visual language and component library for the application. The goal is to create a minimalist, modern, and consistent user interface that is professional and intuitive for inventory management tasks.

The design system is built upon three pillars:

Design Tokens: A core set of predefined values (colors, fonts, spacing) that ensure consistency.

shadcn/ui: Our base component library, providing accessible and unstyled primitives.

Custom Application Components: A curated set of reusable components built by composing and styling shadcn/ui primitives according to our specific needs.

2. Foundations (Design Tokens)

These are the primitive values of our design. They must be configured in tailwind.config.js and the global CSS file to ensure application-wide consistency.

2.1. Color Palette

The application uses a custom color palette to match our brand identity. The primary color and background colors are defined in Tailwind and globals.css using HSL values.

**Primary Color:**

- HSL: 198.6, 88.7%, 48.4%
- Example: `hsl(198.6, 88.7%, 48.4%)` (a vibrant blue/cyan)

**Background Color (Light):**

- HSL: 0, 0%, 100%
- Example: `hsl(0, 0%, 100%)` (white)

**Background Color (Dark):**

- HSL: 26, 39%, 10%
- Example: `hsl(26, 39%, 10%)` (dark blue/gray)

**AI Action:**  
During project setup, ensure these HSL values are used for the primary and background colors in both Tailwind config and globals.css.

2.2. Typography

The application uses the "Inter" font family for a modern, clean look.

**Font:** Inter

**AI Action:**  
In the root `layout.jsx`, use `next/font/google` to import and apply the Inter font to the entire application.

Example:

```js
// src/app/layout.jsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      {/* ... */}
    </html>
  );
}
```

2.3. Spacing & Sizing

Rule: All margins, padding, and gaps must use Tailwind's default spacing scale (e.g., p-4, m-8, gap-2). This ensures a consistent visual rhythm. Do not use arbitrary values like p-[10px].

2.4. Border Radius

Rule: The standard border radius for all elements (cards, buttons, inputs) is defined by the --radius CSS variable, which is set to 0.5rem. This corresponds to the rounded-md utility class in Tailwind.

1. The Core Component Library

This is the catalog of our application's specific, reusable components. The AI agent must use these components wherever applicable, rather than creating one-off styles. They are built by styling and composing shadcn/ui primitives.

PrimaryButton

Purpose: For the main, most important action on a page or in a modal.

Composition: A styled shadcn/ui Button component using the primary color variant.

SecondaryButton

Purpose: For secondary actions that are less important than the primary action.

Composition: A styled shadcn/ui Button with the secondary color variant.

PageHeader

Purpose: To provide a consistent title and action bar for every main page.

Composition: An <h1> for the title and a container for action buttons.

Modal

Purpose: To provide a focused context for tasks like editing or creating items.

Composition: Built using shadcn/ui's Dialog component. It will include a DialogHeader, DialogTitle, DialogContent, and DialogFooter.

DataTable

Purpose: The standard for displaying all lists of data.

Composition: A complex component built using @tanstack/react-table and styled with shadcn/ui's Table components, as detailed in Guide #11.

StatCard

Purpose: To display a key performance indicator (KPI) on the dashboard.

Composition: Built using shadcn/ui's Card component.

CreatableSelect

Purpose: A specialized dropdown that allows users to either select an existing item or create a new one on the fly.

Composition: This will be built using a combination of shadcn/ui's Command and Popover components.

4. Layout & Composition Patterns

This section defines how core components are assembled into consistent page layouts.

The "Cockpit" Layout:

Purpose: For bulk data entry screens.

Structure: A responsive two-column grid.

The DataTable Page Layout:

Purpose: For all main data list views.

Structure: A single-column layout containing the PageHeader, filter bar, and the main DataTable.

The Main Dashboard Layout:

Purpose: For the "Mission Control" overview.

Structure: A responsive grid layout for widgets and StatCards.

5. Iconography

Library: lucide-react is the exclusive icon library for this project.

Consistency: The AI must ensure icons are used consistently (e.g., Pencil for edit, Trash2 for delete).

Sizing: Use standard Tailwind size classes (h-4 w-4, h-5 w-5) to maintain visual harmony.

6. AI Agent's Responsibility

Setup First: During the initial project setup phase, the AI must configure tailwind.config.js and globals.css according to the tokens defined in this guide.

Component-First Development: The AI must prioritize creating and using the reusable components defined in this guide.

No One-Off Styles: The AI should avoid applying one-off, arbitrary styles. All visual elements should be derived from the design tokens and component library.

Adherence to Layouts: When creating new pages, the AI must adhere to the standard page layout patterns defined here.
