import Link from "next/link";
import UserNav from "@/components/features/auth/user-nav";
import PrimaryButton from "@/components/ui/primary-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";

/**
 * Top Bar Component for Dashboard Layout
 *
 * Provides the horizontal navigation bar at the top of the dashboard with:
 * - Fixed sticky positioning that stays visible when scrolling
 * - Card-like styling with backdrop blur and shadow effects
 * - Breadcrumb navigation and global actions
 * - User navigation dropdown
 *
 * This is a Server Component that receives the session as a prop.
 *
 * @param {Object} props
 * @param {Object} props.session - The authenticated user session object
 * @param {Object} props.session.user - The user object containing name, email, image, etc.
 * @returns {JSX.Element} Top bar component with enhanced styling
 */
export function TopBar({ session }) {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 shadow-sm">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Dashboard</span>
        </nav>
      </div>

      <div className="ml-auto flex items-center gap-2 px-4">
        {/* Global "New Sale" action button */}
        <Link href="/dashboard/sales/new">
          <PrimaryButton size="sm" className="gap-1.5 shadow-sm">
            <Plus className="h-3.5 w-3.5" />
            New Sale
          </PrimaryButton>
        </Link>

        {/* User navigation dropdown */}
        <UserNav user={session.user} />
      </div>
    </header>
  );
}
