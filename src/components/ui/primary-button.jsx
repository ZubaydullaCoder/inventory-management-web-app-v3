import { Button } from "@/components/ui/button";

/**
 * Primary action button component that adheres to the application's design system.
 * This component wraps the shadcn/ui Button with consistent primary styling.
 *
 * @param {Object} props - All standard button props are forwarded to the underlying Button component
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.type] - Button type (button, submit, reset)
 * @param {boolean} [props.disabled] - Whether the button is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Styled primary button
 */
export default function PrimaryButton({ children, ...props }) {
  return (
    <Button
      variant="default"
      className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      {...props}
    >
      {children}
    </Button>
  );
}
