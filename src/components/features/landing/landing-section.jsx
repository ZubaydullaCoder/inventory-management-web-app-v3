import { cn } from "@/lib/utils";

/**
 * A reusable wrapper for top-level sections on the landing page.
 * Provides consistent structure and styling for all landing page sections.
 *
 * @param {Object} props
 * @param {string} [props.id] - Optional ID for the section (for navigation)
 * @param {string} [props.className] - Additional classes to apply to the section
 * @param {boolean} [props.muted] - Whether to apply muted background styling
 * @param {React.ReactNode} props.children - The section content
 * @returns {JSX.Element} Section wrapper component
 */
export default function LandingSection({
  id,
  className,
  muted = false,
  children,
}) {
  return (
    <section
      id={id}
      className={cn("py-16 md:py-24", muted && "bg-muted/20", className)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
