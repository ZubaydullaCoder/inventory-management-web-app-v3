import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
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

  // Read sidebar state from cookies for persistence
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={session.user} />
      <SidebarInset>
        {/* Top bar with user navigation and global actions */}
        <TopBar session={session} />

        {/* Page content with proper spacing */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
