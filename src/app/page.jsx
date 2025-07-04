import { auth } from "@/auth";
import AppHeader from "@/components/features/landing/app-header";
import AppFooter from "@/components/features/landing/app-footer";
import DynamicCtaButton from "@/components/features/auth/dynamic-cta-button";
import DynamicSectionContent from "@/components/features/landing/dynamic-section-content";
import FeatureCard from "@/components/ui/feature-card";
import PricingCard from "@/components/ui/pricing-card";
import {
  featureCardsData,
  pricingPlansData,
} from "@/lib/config/landing-page-config";

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
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/20 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Take Control of Your{" "}
              <span className="text-primary">Retail Shop</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Replace manual paperwork with a modern, digital solution for
              inventory management, sales tracking, and financial reporting
              designed specifically for retail shops in Uzbekistan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <DynamicCtaButton 
                session={session} 
                className="text-lg px-8 py-6"
                context="hero"
                authenticatedText="Access Your Dashboard"
              >
                Start Free Trial
              </DynamicCtaButton>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Manage Your Shop
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Streamline your operations with powerful tools designed for
                modern retail management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featureCardsData.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <DynamicSectionContent session={session} section="pricing" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlansData.map((plan) => (
                <PricingCard
                  key={plan.planName}
                  planName={plan.planName}
                  price={plan.price}
                  description={plan.description}
                  features={plan.features}
                  recommended={plan.recommended}
                >
                  <DynamicCtaButton 
                    session={session} 
                    className="w-full"
                    context="pricing"
                    authenticatedText="Manage Shop"
                  >
                    {plan.ctaText}
                  </DynamicCtaButton>
                </PricingCard>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <DynamicSectionContent session={session} section="cta" />
            <DynamicCtaButton 
              session={session} 
              className="text-lg px-8 py-6"
              context="cta"
              authenticatedText="Continue to Dashboard"
            >
              Start Your Free Trial Today
            </DynamicCtaButton>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
