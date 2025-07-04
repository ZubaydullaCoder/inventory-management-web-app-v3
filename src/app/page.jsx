import { auth } from "@/auth";
import Link from "next/link";
import AppHeader from "@/components/features/landing/app-header";
import AppFooter from "@/components/features/landing/app-footer";
import AuthModal from "@/components/features/auth/auth-modal";
import LoginButton from "@/components/features/auth/login-button";
import PrimaryButton from "@/components/ui/primary-button";
import FeatureCard from "@/components/ui/feature-card";
import PricingCard from "@/components/ui/pricing-card";
import {
  BarChart3,
  Package,
  Receipt,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

/**
 * Main landing page for the Retail Inventory & Finance Manager application.
 * Dynamically adapts content based on user authentication status.
 * Serves as the entry point for both unauthenticated and authenticated users.
 *
 * @returns {JSX.Element} Landing page
 */
export default async function HomePage() {
  // Fetch the session on the server to determine authentication status
  const session = await auth();
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader session={session} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/20 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Take Control of Your{" "}
              <span className="text-primary">Retail Shop</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Replace manual paperwork with a modern, digital solution for
              inventory management, sales tracking, and financial reporting
              designed specifically for retail shops in Uzbekistan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link href="/dashboard">
                  <PrimaryButton className="text-lg px-8 py-6">
                    Go to Dashboard
                  </PrimaryButton>
                </Link>
              ) : (
                <AuthModal
                  trigger={
                    <PrimaryButton className="text-lg px-8 py-6">
                      Start Free Trial
                    </PrimaryButton>
                  }
                >
                  <LoginButton />
                </AuthModal>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Manage Your Shop
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Streamline your operations with powerful tools designed for
                modern retail management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Package className="h-8 w-8 text-primary" />}
                title="Inventory Management"
                description="Track stock levels, manage products, and get alerts when items are running low."
              />
              <FeatureCard
                icon={<Receipt className="h-8 w-8 text-primary" />}
                title="Sales Processing"
                description="Fast, keyboard-friendly sales recording with flexible pricing and payment options."
              />
              <FeatureCard
                icon={<BarChart3 className="h-8 w-8 text-primary" />}
                title="Financial Reporting"
                description="Comprehensive reports on sales, profits, and business performance."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Customer Management"
                description="Track customer purchases, manage credit accounts, and build relationships."
              />
              <FeatureCard
                icon={<TrendingUp className="h-8 w-8 text-primary" />}
                title="Business Analytics"
                description="Gain insights into your business with detailed analytics and trends."
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-primary" />}
                title="Secure & Reliable"
                description="Your data is protected with enterprise-grade security and regular backups."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your business needs. All plans include
                core features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard
                planName="Basic"
                price="Free"
                description="Perfect for small shops getting started"
                features={[
                  "Up to 100 products",
                  "Basic sales tracking",
                  "Simple inventory management",
                  "Email support",
                ]}
              >
                {session ? (
                  <Link href="/dashboard">
                    <PrimaryButton className="w-full">
                      Go to Dashboard
                    </PrimaryButton>
                  </Link>
                ) : (
                  <AuthModal
                    trigger={
                      <PrimaryButton className="w-full">
                        Get Started
                      </PrimaryButton>
                    }
                  >
                    <LoginButton />
                  </AuthModal>
                )}
              </PricingCard>

              <PricingCard
                planName="Standard"
                price="$19/month"
                description="Most popular choice for growing businesses"
                features={[
                  "Up to 1,000 products",
                  "Advanced reporting",
                  "Customer management",
                  "Multi-user access",
                  "Priority support",
                ]}
                recommended={true}
              >
                {session ? (
                  <Link href="/dashboard">
                    <PrimaryButton className="w-full">
                      Go to Dashboard
                    </PrimaryButton>
                  </Link>
                ) : (
                  <AuthModal
                    trigger={
                      <PrimaryButton className="w-full">
                        Start Free Trial
                      </PrimaryButton>
                    }
                  >
                    <LoginButton />
                  </AuthModal>
                )}
              </PricingCard>

              <PricingCard
                planName="Premium"
                price="$39/month"
                description="For established shops with advanced needs"
                features={[
                  "Unlimited products",
                  "Advanced analytics",
                  "Custom integrations",
                  "Dedicated support",
                  "Custom training",
                ]}
              >
                {session ? (
                  <Link href="/dashboard">
                    <PrimaryButton className="w-full">
                      Go to Dashboard
                    </PrimaryButton>
                  </Link>
                ) : (
                  <AuthModal
                    trigger={
                      <PrimaryButton className="w-full">
                        Start Free Trial
                      </PrimaryButton>
                    }
                  >
                    <LoginButton />
                  </AuthModal>
                )}
              </PricingCard>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Shop?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of shop owners who have already modernized their
              operations with our comprehensive retail management solution.
            </p>
            {session ? (
              <Link href="/dashboard">
                <PrimaryButton className="text-lg px-8 py-6">
                  Go to Dashboard
                </PrimaryButton>
              </Link>
            ) : (
              <AuthModal
                trigger={
                  <PrimaryButton className="text-lg px-8 py-6">
                    Start Your Free Trial Today
                  </PrimaryButton>
                }
              >
                <LoginButton />
              </AuthModal>
            )}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
