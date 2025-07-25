import { cn } from "@/lib/utils";

/**
 * A reusable card wrapper for form sections that provides consistent styling
 * and visual separation between different parts of a form.
 * 
 * @param {Object} props
 * @param {string} [props.title] - Optional title for the section
 * @param {React.ReactNode} props.children - The form fields/content to wrap
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.description] - Optional description text below title
 * @returns {JSX.Element}
 */
export default function FormSectionCard({ 
  title, 
  children, 
  className,
  description 
}) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-6 space-y-4",
      className
    )}>
      {title && (
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
