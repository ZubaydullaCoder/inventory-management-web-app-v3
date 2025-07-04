import {
  BarChart3,
  Package,
  Receipt,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

/**
 * Landing page content configuration
 * Centralizes all static content for the landing page to improve maintainability
 * and separate concerns between data and presentation.
 */

/**
 * Feature cards data for the Features section
 * @type {Array<{title: string, description: string, icon: React.ReactNode}>}
 */
export const featureCardsData = [
  {
    title: "Inventory Management",
    description:
      "Track stock levels, manage products, and get alerts when items are running low.",
    icon: <Package className="h-8 w-8 text-primary" />,
  },
  {
    title: "Sales Processing",
    description:
      "Fast, keyboard-friendly sales recording with flexible pricing and payment options.",
    icon: <Receipt className="h-8 w-8 text-primary" />,
  },
  {
    title: "Financial Reporting",
    description:
      "Comprehensive reports on sales, profits, and business performance.",
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
  },
  {
    title: "Customer Management",
    description:
      "Track customer purchases, manage credit accounts, and build relationships.",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    title: "Business Analytics",
    description:
      "Gain insights into your business with detailed analytics and trends.",
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
  },
  {
    title: "Secure & Reliable",
    description:
      "Your data is protected with enterprise-grade security and regular backups.",
    icon: <Shield className="h-8 w-8 text-primary" />,
  },
];

/**
 * Pricing plans data for the Pricing section
 * @type {Array<{planName: string, price: string, description: string, features: string[], recommended: boolean, ctaText: string}>}
 */
export const pricingPlansData = [
  {
    planName: "Basic",
    price: "Free",
    description: "Perfect for small shops getting started",
    features: [
      "Up to 100 products",
      "Basic sales tracking",
      "Simple inventory management",
      "Email support",
    ],
    recommended: false,
    ctaText: "Get Started",
  },
  {
    planName: "Standard",
    price: "$19/month",
    description: "Most popular choice for growing businesses",
    features: [
      "Up to 1,000 products",
      "Advanced reporting",
      "Customer management",
      "Multi-user access",
      "Priority support",
    ],
    recommended: true,
    ctaText: "Start Free Trial",
  },
  {
    planName: "Premium",
    price: "$39/month",
    description: "For established shops with advanced needs",
    features: [
      "Unlimited products",
      "Advanced analytics",
      "Custom integrations",
      "Dedicated support",
      "Custom training",
    ],
    recommended: false,
    ctaText: "Start Free Trial",
  },
];
