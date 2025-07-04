import { Card, CardContent, CardDescription } from "@/components/ui/card";

/**
 * Feature card component for displaying product features in a visually appealing format.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component from lucide-react
 * @param {string} props.title - Feature title
 * @param {string} props.description - Feature description text
 * @returns {JSX.Element} Feature card component
 */
export default function FeatureCard({ icon, title, description }) {
  return (
    <Card className="h-full">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">{icon}</div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
