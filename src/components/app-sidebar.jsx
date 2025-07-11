// src/components/app-sidebar.jsx

"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tags,
  Receipt,
  Users,
  Truck,
  TrendingUp,
  Settings,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

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

/**
 * Application Sidebar Component
 *
 * A collapsible sidebar using shadcn/ui sidebar components.
 * Provides navigation for the authenticated dashboard area with:
 * - Collapsible functionality (icon mode when collapsed)
 * - Responsive behavior (overlay on mobile)
 * - Persistent state via cookies
 * - Keyboard shortcuts (Ctrl+B / Cmd+B)
 *
 * @returns {JSX.Element} Application sidebar component
 */
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">RetailManager</span>
                  <span className="truncate text-xs">Inventory & Finance</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <Link href={item.href}>
                    <IconComponent />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
