import DynamicCtaButton from "@/components/features/auth/dynamic-cta-button";
import DynamicSectionContent from "@/components/features/landing/dynamic-section-content";
import PricingCard from "@/components/ui/pricing-card";
import { pricingPlansData } from "@/lib/config/landing-page-config";

/**
 * Pricing section component for the landing page.
 * Displays the subscription plan options.
 *
 * @param {Object} props
 * @param {Object|null} props.session - The user session object from auth()
 * @returns {JSX.Element} Pricing section component
 */
export default function PricingSection({ session }) {
  return (
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
  );
}
