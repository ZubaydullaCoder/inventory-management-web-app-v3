import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

/**
 * Dashboard Layout Component for Authenticated Routes
 *
 * This layout wraps all authenticated pages and enforces security through
 * server-side authentication checks. It provides the main application shell
 * with sidebar navigation and top bar.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to render
 * @returns {JSX.Element} The dashboard layout with sidebar and topbar
 */
export default async function DashboardLayout({ children }) {
  // Defense in Depth: Server-side authentication check
  // This is a critical security layer as specified in guide-4-app-security-guide.md
  const session = await auth();

  // Guard clause: Redirect unauthenticated users to login
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Fixed width navigation */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col">
        {/* Top bar with user navigation and global actions */}
        <TopBar session={session} />

        {/* Page content */}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
