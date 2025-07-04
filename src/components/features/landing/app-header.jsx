import AuthModal from "@/components/features/auth/auth-modal";
import LoginButton from "@/components/features/auth/login-button";
import UserNav from "@/components/features/auth/user-nav";
import PrimaryButton from "@/components/ui/primary-button";

/**
 * Main application header component that adapts based on user authentication status.
 * Serves as the primary navigation for both unauthenticated and authenticated users.
 *
 * @param {Object} props
 * @param {Object|null} props.session - User session object from Auth.js (null if not logged in)
 * @param {Object} [props.session.user] - User object containing name, email, image, etc.
 * @returns {JSX.Element} Header component
 */
export default function AppHeader({ session }) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">RetailManager</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <UserNav user={session.user} />
            ) : (
              <AuthModal
                trigger={<PrimaryButton>Start Free Trial</PrimaryButton>}
              >
                <LoginButton />
              </AuthModal>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
