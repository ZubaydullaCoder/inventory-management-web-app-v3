import DynamicCtaButton from "@/components/features/auth/dynamic-cta-button";
import DynamicSectionContent from "@/components/features/landing/dynamic-section-content";
import PricingCard from "@/components/ui/pricing-card";
import { pricingPlansData } from "@/lib/config/landing-page-config";
import LandingSection from "../landing-section";

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
    <LandingSection id="pricing" muted>
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
    </LandingSection>
  );
}
