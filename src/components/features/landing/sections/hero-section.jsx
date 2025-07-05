import DynamicCtaButton from "@/components/features/auth/dynamic-cta-button";

/**
 * Hero section component for the landing page.
 * Displays the main headline, sub-headline, and primary call-to-action.
 *
 * @param {Object} props
 * @param {Object|null} props.session - The user session object from auth()
 * @returns {JSX.Element} Hero section component
 */
export default function HeroSection({ session }) {
  return (
    <section className="bg-gradient-to-b from-background to-muted/20 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Take Control of Your <span className="text-primary">Retail Shop</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Replace manual paperwork with a modern, digital solution for inventory
          management, sales tracking, and financial reporting designed
          specifically for retail shops in Uzbekistan.
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
  );
}
