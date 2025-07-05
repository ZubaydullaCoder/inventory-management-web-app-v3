import { auth } from "@/auth";
import OnboardingComponent from "@/components/features/dashboard/onboarding-component";

/**
 * Dashboard Home Page (The Orchestrator)
 *
 * This Server Component handles data fetching and orchestrates the layout.
 * It fetches the user session and passes required data to the OnboardingComponent.
 * Follows the "Defense in Depth" security pattern with server-side auth verification.
 *
 * @returns {JSX.Element} Dashboard home page with onboarding flow
 */
export default async function DashboardPage() {
  // Fetch session data on the server to determine authentication status
  // This provides the user's information for personalization
  const session = await auth();

  return <OnboardingComponent userName={session?.user?.name} />;
}
