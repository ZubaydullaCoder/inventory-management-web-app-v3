import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Settings,
  Home,
  Tags,
  Receipt,
  Truck,
} from "lucide-react";

/**
 * Sidebar Navigation Component
 *
 * Provides the main navigation for the authenticated dashboard area.
 * This is a Server Component that renders static navigation links.
 *
 * @returns {JSX.Element} Sidebar navigation component
 */
export function Sidebar() {
  /**
   * Navigation items configuration
   * @type {Array<{href: string, label: string, icon: React.ComponentType}>}
   */
  const navigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/products",
      label: "Products",
      icon: Package,
    },
    {
      href: "/dashboard/categories",
      label: "Categories",
      icon: Tags,
    },
    {
      href: "/dashboard/sales",
      label: "Sales",
      icon: Receipt,
    },
    {
      href: "/dashboard/customers",
      label: "Customers",
      icon: Users,
    },
    {
      href: "/dashboard/suppliers",
      label: "Suppliers",
      icon: Truck,
    },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: TrendingUp,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        {/* Logo/Brand */}
        <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            RetailManager
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
