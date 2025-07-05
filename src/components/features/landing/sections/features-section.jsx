import FeatureCard from "@/components/ui/feature-card";
import { featureCardsData } from "@/lib/config/landing-page-config";

/**
 * Features section component for the landing page.
 * Displays the grid of application features.
 *
 * @returns {JSX.Element} Features section component
 */
export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Manage Your Shop
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your operations with powerful tools designed for modern
            retail management.
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
  );
}
