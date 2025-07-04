import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

/**
 * Pricing card component for displaying subscription tier details.
 *
 * @param {Object} props
 * @param {string} props.planName - Name of the subscription plan
 * @param {string} props.price - Price display text
 * @param {string} props.description - Plan description
 * @param {string[]} props.features - Array of feature strings
 * @param {React.ReactNode} props.children - Call-to-action button passed from parent
 * @param {boolean} [props.recommended] - Whether this is the recommended plan
 * @returns {JSX.Element} Pricing card component
 */
export default function PricingCard({
  planName,
  price,
  description,
  features = [],
  children,
  recommended = false,
}) {
  return (
    <Card className={`h-full ${recommended ? "border-primary border-2" : ""}`}>
      <CardHeader className="text-center">
        {recommended && (
          <div className="bg-primary text-primary-foreground text-sm font-semibold py-1 px-3 rounded-full mx-auto mb-2 w-fit">
            Recommended
          </div>
        )}
        <CardTitle className="text-2xl">{planName}</CardTitle>
        <div className="text-3xl font-bold text-primary">{price}</div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="w-full">{children}</div>
      </CardFooter>
    </Card>
  );
}
