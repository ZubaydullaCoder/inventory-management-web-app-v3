import DynamicCtaButton from "@/components/features/auth/dynamic-cta-button";
import DynamicSectionContent from "@/components/features/landing/dynamic-section-content";

/**
 * Final CTA section component for the landing page.
 * Displays the final call-to-action at the bottom of the page.
 *
 * @param {Object} props
 * @param {Object|null} props.session - The user session object from auth()
 * @returns {JSX.Element} Final CTA section component
 */
export default function FinalCtaSection({ session }) {
  return (
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
  );
}
