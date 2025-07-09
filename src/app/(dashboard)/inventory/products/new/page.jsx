// src/app/(dashboard)/inventory/products/new/page.jsx

import ProductCreationCockpit from "@/components/features/products/creation/product-creation-cockpit";

/**
 * Server Component page for bulk-adding products.
 * Renders the static page header and the interactive cockpit "island".
 *
 * @returns {JSX.Element} The cockpit page component
 */
export default function ProductCockpitPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header - This part is rendered on the server */}
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-foreground">Add New Products</h1>
        <p className="text-muted-foreground mt-2">
          Efficiently bulk-add products to your inventory. Changes appear
          instantly on the right.
        </p>
      </div>

      {/* The interactive part of the page is now isolated in this Client Component */}
      <ProductCreationCockpit />
    </div>
  );
}
