import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Dashboard Card Component
 *
 * A specialized card component for dashboard widgets with consistent styling
 * that matches the shadcn-admin design patterns.
 *
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Dashboard card component
 */
export function DashboardCard({ title, children, className, ...props }) {
  return (
    <Card className={className} {...props}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default DashboardCard;
