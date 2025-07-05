import { auth } from "@/auth";
import AppHeader from "@/components/features/landing/app-header";
import AppFooter from "@/components/features/landing/app-footer";
import HeroSection from "@/components/features/landing/sections/hero-section";
import FeaturesSection from "@/components/features/landing/sections/features-section";
import PricingSection from "@/components/features/landing/sections/pricing-section";
import FinalCtaSection from "@/components/features/landing/sections/final-cta-section";

/**
 * Main landing page for the Retail Inventory & Finance Manager application.
 * Dynamically adapts content based on user authentication status.
 * Serves as the entry point for both unauthenticated and authenticated users.
 *
 * @returns {JSX.Element} Landing page
 */
export default async function HomePage() {
  // Fetch the session on the server to determine authentication status
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader session={session} />

      <main className="flex-grow">
        <HeroSection session={session} />
        <FeaturesSection />
        <PricingSection session={session} />
        <FinalCtaSection session={session} />
      </main>

      <AppFooter />
    </div>
  );
}
