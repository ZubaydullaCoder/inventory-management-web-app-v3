import Link from "next/link";
import PrimaryButton from "@/components/ui/primary-button";
import SecondaryButton from "@/components/ui/secondary-button";

/**
 * Onboarding checklist component for new users.
 * Renders a visual guide with step-by-step setup instructions and navigation links.
 *
 * @param {Object} props
 * @param {string} props.userName - The authenticated user's display name
 * @returns {JSX.Element} Onboarding checklist component
 */
export default function OnboardingComponent({ userName }) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome to your Dashboard, {userName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Let's get your shop set up in just a few steps
        </p>
      </div>

      {/* Onboarding Checklist Card */}
      <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Getting Started Checklist
        </h2>

        <div className="space-y-8">
          {/* Step 1: Create Categories */}
          <div className="flex items-start space-x-4 p-6 bg-muted/30 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
              1
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Create Categories
              </h3>
              <p className="text-muted-foreground mb-4">
                Organize your products by creating categories. This will help
                you manage and find items quickly.
              </p>
              <Link href="/inventory/categories/new">
                <PrimaryButton>Create Categories</PrimaryButton>
              </Link>
            </div>
          </div>

          {/* Step 2: Add Suppliers & Customers */}
          <div className="flex items-start space-x-4 p-6 bg-muted/30 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
              2
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Add Suppliers & Customers
              </h3>
              <p className="text-muted-foreground mb-4">
                Set up your business contacts. Add suppliers for inventory
                management and customers for sales tracking.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/purchases/suppliers/new">
                  <PrimaryButton>Add Suppliers</PrimaryButton>
                </Link>
                <Link href="/customers/new">
                  <SecondaryButton>Add Customers</SecondaryButton>
                </Link>
              </div>
            </div>
          </div>

          {/* Step 3: Add Your Products */}
          <div className="flex items-start space-x-4 p-6 bg-muted/30 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
              3
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Add Your Products
              </h3>
              <p className="text-muted-foreground mb-4">
                The main event! Add your inventory items with details like
                pricing, stock levels, and categories.
              </p>
              <Link href="/inventory/products/new">
                <PrimaryButton>Add Products</PrimaryButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Need Help?
            </h3>
            <p className="text-muted-foreground mb-4">
              Once you complete these steps, you'll have a fully functional
              retail management system.
            </p>
            <p className="text-sm text-muted-foreground">
              You can always come back to this checklist from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
