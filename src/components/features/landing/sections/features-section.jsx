import FeatureCard from "@/components/ui/feature-card";
import { featureCardsData } from "@/lib/config/landing-page-config";
import LandingSection from "../landing-section";

/**
 * Features section component for the landing page.
 * Displays the grid of application features.
 *
 * @returns {JSX.Element} Features section component
 */
export default function FeaturesSection() {
  return (
    <LandingSection id="features">
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
    </LandingSection>
  );
}
