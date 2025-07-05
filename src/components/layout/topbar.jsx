import Link from "next/link";
import UserNav from "@/components/features/auth/user-nav";
import PrimaryButton from "@/components/ui/primary-button";
import { Plus } from "lucide-react";

/**
 * Top Bar Component for Dashboard Layout
 *
 * Provides the horizontal navigation bar at the top of the dashboard
 * including breadcrumbs, global actions, and user navigation.
 * This is a Server Component that receives the session as a prop.
 *
 * @param {Object} props
 * @param {Object} props.session - The authenticated user session object
 * @param {Object} props.session.user - The user object containing name, email, image, etc.
 * @returns {JSX.Element} Top bar component
 */
export function TopBar({ session }) {
  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumbs placeholder */}
        <div className="flex items-center space-x-4">
          <nav className="text-sm text-muted-foreground">
            {/* Placeholder for future breadcrumbs */}
            <span>Dashboard</span>
          </nav>
        </div>

        {/* Right side - Actions and user navigation */}
        <div className="flex items-center space-x-4">
          {/* Global "New Sale" action button */}
          <Link href="/dashboard/sales/new">
            <PrimaryButton className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Sale</span>
            </PrimaryButton>
          </Link>

          {/* User navigation dropdown */}
          <UserNav user={session.user} />
        </div>
      </div>
    </header>
  );
}
