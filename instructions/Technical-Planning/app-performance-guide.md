**Guide Document 5: Application Performance Optimization: Best Practices (JavaScript + JSDoc Edition)**

**Version:** 1.0
**Date:** June 3, 2025
**Target Audience:** AI Development Agent
**Project:** Retail Inventory & Finance Manager

**1. Introduction**

This document outlines best practices for building a fast, responsive, and resource-efficient application. Performance is a critical feature that directly impacts user experience and retention. The AI agent must implement these strategies by default.

**2. Leveraging Next.js App Router for Performance**

React Server Components (RSCs) are the Default:
Benefit: Reduces client-side JavaScript, improving initial load times.
AI Action: Always create components as Server Components unless client-side interactivity is required.
Streaming with React Suspense (Primary Strategy):
Benefit: Allows the server to send UI pieces as they become ready, improving TTFB and perceived performance. This avoids the entire page being blocked by one slow data fetch.
AI Action: This is our standard practice. The AI must wrap any component that fetches data (or receives data from a server fetch) in a <Suspense> boundary with a meaningful fallback prop (e.g., a skeleton component). The loading.jsx file should be used for route-level fallbacks, and manual <Suspense> wrappers should be used for component-level fallbacks.
// Example: A Server Component orchestrating a page
import { Suspense } from 'react';
import SalesReport from '@/components/features/reporting/SalesReport';
import ReportSkeleton from '@/components/ui/ReportSkeleton'; // A skeleton loader

export default function DashboardPage() {
return (

<div>
<h1>Dashboard</h1>
{/_ The user sees the skeleton instantly while the report data is fetched _/}
<Suspense fallback={<ReportSkeleton />}>
{/_ SalesReport is a Client Component using useSuspenseQuery _/}
<SalesReport />
</Suspense>
</div>
);
}

**3. Data Fetching Optimization**

- **Co-locate Data Fetches:** Fetch data directly within the Server Components that need it. This avoids prop-drilling and makes components more self-contained.
- **Parallel Data Fetching:** Avoid sequential data requests (request waterfalls). Fetch independent data in parallel.

  ```javascript
  // Example: Fetching multiple data sets in a Server Component
  import { getProductStats, getSalesSummary } from "@/lib/data";

  export default async function DashboardOverview() {
    // Start both requests without awaiting
    const productStatsPromise = getProductStats();
    const salesSummaryPromise = getSalesSummary();

    // Await them in parallel
    const [productStats, salesSummary] = await Promise.all([
      productStatsPromise,
      salesSummaryPromise,
    ]);

    return <div>{/* ... render stats and summary ... */}</div>;
  }
  ```

- **Caching:**
  - **Next.js `fetch` Caching:** The native `fetch` API is automatically extended by Next.js to cache requests. By default, fetches are cached indefinitely.
  - **AI Action:** For data that changes, use the `revalidate` option.
  ```javascript
  // Fetch data and revalidate at most every 60 seconds
  fetch("https://...", { next: { revalidate: 60 } });
  ```
  - **AI Action:** For highly dynamic data that should never be cached, use `cache: 'no-store'`.
  ```javascript
  // Fetch data on every request
  fetch("https://...", { cache: "no-store" });
  ```
  - **Database Queries (Prisma):** Prisma queries are not automatically cached by `fetch`. If you need to cache database results, wrap the query in a utility function that uses `React.cache` (for per-request memoization) or a more advanced caching strategy if needed.

**4. Client-Side Performance**

- **Keep Client Components Small:** Client Components add to the client-side JavaScript bundle. Keep them as small and focused as possible, pushing them to the "leaves" of the component tree.
- **Lazy Loading Client Components:** Use `next/dynamic` to load large Client Components or components with heavy third-party libraries only when they are needed (e.g., when a modal is opened or a component scrolls into view).

  ````javascript
  // Example: Lazy loading a complex chart component
  import { Suspense } from 'react';
  import dynamic from 'next/dynamic';
  import ChartSkeleton from '@/components/ui/ChartSkeleton';

  const HeavyChartComponent = dynamic(
    () => import('@/components/features/reporting/HeavyChartComponent'),
    {
      ssr: false, // Don't render this on the server if it relies on browser APIs
      loading: () => <ChartSkeleton />,
    }
  );

  export default function MyPage() {
    return (
      <div>
        <h2>Sales Chart</h2>
        <HeavyChartComponent />
      </div>
    );
  }
  ```*   **Bundle Size Analysis:** Use `@next/bundle-analyzer` to visually inspect what is contributing to the client-side bundle size. This is a key tool for identifying optimization opportunities.
  ````

**5. Asset Optimization**

- **Image Optimization (`next/image`):**
  - **AI Action:** **Mandatory.** Use the `<Image />` component from `next/image` for all images.
  - **Benefits:** Automatic resizing, format optimization (e.g., WebP), lazy loading by default, and prevention of Cumulative Layout Shift (CLS).
- **Font Optimization (`next/font`):**

  - **AI Action:** **Mandatory.** Use `next/font` to load all web fonts (e.g., Google Fonts).
  - **Benefits:** Self-hosts the font files, eliminating external network requests. Prevents layout shift by providing font metrics at build time.

  ```javascript
  // Example: src/app/layout.jsx
  import { Inter } from "next/font/google";

  const inter = Inter({ subsets: ["latin"] });

  export default function RootLayout({ children }) {
    return (
      <html lang="en" className={inter.className}>
        <body>{children}</body>
      </html>
    );
  }
  ```

**6. Code-Splitting**

- **Automatic Route-Based Splitting:** Next.js automatically splits JavaScript into smaller chunks on a per-route basis.
- **Manual Component-Based Splitting:** Use `next/dynamic` as described in section 4.2.

**7. Memoization in Client Components**

- **Principle:** Avoid premature optimization. Use these tools only after profiling reveals a performance bottleneck.
- **`React.memo`:** Wrap components in `React.memo` to prevent them from re-rendering if their props have not changed. This is useful for expensive components in a list.
- **`useMemo`:** Memoize the result of an expensive calculation.
- **`useCallback`:** Memoize a function definition, often to prevent child components wrapped in `React.memo` from re-rendering unnecessarily.

**8. AI Agent's Responsibility**

- Default to creating Server Components.
- Use `loading.jsx` for route-level loading states.
- Implement parallel data fetching patterns in Server Components.
- Use the `next/image` and `next/font` components for all images and fonts.
- Use `next/dynamic` to lazy-load large, non-critical Client Components.
- Apply memoization techniques (`React.memo`, `useMemo`, `useCallback`) only when a clear performance issue is identified, not by default.
