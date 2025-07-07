import { Nunito } from "next/font/google";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Font setup as per the design guide (guide-12).
// Using a CSS variable is a robust way to integrate with Tailwind CSS.
const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

/**
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: "Retail Inventory & Finance Manager",
  description:
    "Take Control of Your Shop with a modern inventory and finance management solution.",
};

/**
 * The root layout for the entire application.
 *
 * This component establishes the global HTML structure, applies the primary font,
 * and wraps the application in essential client-side context providers.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={nunito.variable}>
        {/*
          The SessionProviderWrapper makes the NextAuth.js session available
          to all client components via the `useSession` hook.
        */}
        <SessionProviderWrapper>
          {/*
            The QueryProvider sets up the TanStack Query client, enabling
            client-side data fetching, caching, and state management.
          */}
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
