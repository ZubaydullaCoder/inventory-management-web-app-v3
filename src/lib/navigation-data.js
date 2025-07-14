/**
 * Navigation data structure for the application sidebar
 * Organized by groups with support for badges, icons, and nested navigation
 */

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
  ShoppingCart,
  FileText,
  BarChart3,
  Users2,
  Building2,
} from "lucide-react";

/**
 * @typedef {Object} NavItem
 * @property {string} title - Display title for the navigation item
 * @property {string} [url] - URL path for navigation
 * @property {React.ComponentType} [icon] - Icon component
 * @property {string} [badge] - Badge text (e.g., count, "new")
 * @property {NavItem[]} [items] - Nested navigation items
 */

/**
 * @typedef {Object} NavGroup
 * @property {string} title - Group title
 * @property {NavItem[]} items - Navigation items in this group
 */

/**
 * Navigation groups organized by business function
 * @type {NavGroup[]}
 */
export const navigationGroups = [
  {
    title: "General",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        title: "Inventory",
        icon: Package,
        items: [
          {
            title: "Products",
            url: "/inventory/products",
            icon: Package,
          },
          {
            title: "Add Products",
            url: "/inventory/products/new",
            icon: Package,
          },
          {
            title: "Categories",
            url: "/inventory/categories",
            icon: Tags,
          },
        ],
      },
      {
        title: "Sales",
        icon: ShoppingCart,
        items: [
          {
            title: "All Sales",
            url: "/dashboard/sales",
            icon: Receipt,
          },
          {
            title: "New Sale",
            url: "/dashboard/sales/new",
            icon: FileText,
          },
        ],
      },
      {
        title: "Contacts",
        icon: Users,
        items: [
          {
            title: "Customers",
            url: "/dashboard/customers",
            icon: Users2,
          },
          {
            title: "Suppliers",
            url: "/dashboard/suppliers",
            icon: Building2,
          },
        ],
      },
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

/**
 * Company/team information for the header
 */
export const companyInfo = {
  name: "RetailManager",
  description: "Inventory & Finance",
  icon: Home,
};
