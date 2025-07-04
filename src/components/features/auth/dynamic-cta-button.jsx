import Link from "next/link";
import AuthModal from "@/components/features/auth/auth-modal";
import LoginButton from "@/components/features/auth/login-button";
import PrimaryButton from "@/components/ui/primary-button";

/**
 * Dynamic Call-to-Action button component that renders different actions
 * based on the user's authentication status.
 *
 * This Server Component encapsulates the session-based conditional logic
 * to eliminate code duplication across the landing page.
 *
 * @param {Object} props
 * @param {Object|null} props.session - The user session object from auth()
 * @param {React.ReactNode} props.children - Button text content for unauthenticated users
 * @param {string} [props.className] - Additional CSS classes for the button
 * @param {string} [props.authenticatedText] - Custom text to show when user is authenticated
 * @param {string} [props.context] - Context for the button (e.g., 'pricing', 'hero', 'cta')
 * @param {...any} props.rest - Other props passed to the underlying PrimaryButton
 * @returns {JSX.Element} Either a Link to dashboard or AuthModal with LoginButton
 */
export default function DynamicCtaButton({
  session,
  children,
  className,
  authenticatedText,
  context = "default",
  ...props
}) {
  if (session) {
    // User is authenticated - provide contextual button text
    let buttonText = authenticatedText;
    
    if (!buttonText) {
      // Default authenticated text based on context
      switch (context) {
        case "pricing":
          buttonText = "Go to Dashboard";
          break;
        case "hero":
          buttonText = "Go to Dashboard";
          break;
        case "cta":
          buttonText = "Access Your Dashboard";
          break;
        default:
          buttonText = "Go to Dashboard";
      }
    }

    return (
      <Link href="/dashboard">
        <PrimaryButton className={className} {...props}>
          {buttonText}
        </PrimaryButton>
      </Link>
    );
  }

  // User is not authenticated - show auth modal
  return (
    <AuthModal
      trigger={
        <PrimaryButton className={className} {...props}>
          {children}
        </PrimaryButton>
      }
    >
      <LoginButton />
    </AuthModal>
  );
}
