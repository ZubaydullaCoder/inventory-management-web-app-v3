import { Button } from "@/components/ui/button";

/**
 * Secondary action button component that adheres to the application's design system.
 * This component wraps the shadcn/ui Button with consistent secondary styling.
 *
 * @param {Object} props - All standard button props are forwarded to the underlying Button component
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.type] - Button type (button, submit, reset)
 * @param {boolean} [props.disabled] - Whether the button is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Styled secondary button
 */
export default function SecondaryButton({ children, ...props }) {
  return (
    <Button
      variant="secondary"
      className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium"
      {...props}
    >
      {children}
    </Button>
  );
}
