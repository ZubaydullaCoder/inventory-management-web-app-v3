/**
 * Dynamic section content component that adapts messaging based on user authentication status.
 *
 * @param {Object} props
 * @param {Object|null} props.session - The user session object from auth()
 * @param {string} props.section - The section identifier ('pricing' or 'cta')
 * @returns {JSX.Element} Dynamic content based on authentication status
 */
export default function DynamicSectionContent({ session, section }) {
  if (section === "pricing") {
    return (
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {session
            ? "Your Shop Management Dashboard"
            : "Simple, Transparent Pricing"}
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {session
            ? "Access your complete retail management solution. Manage inventory, track sales, and grow your business."
            : "Choose the plan that fits your business needs. All plans include core features."}
        </p>
      </div>
    );
  }

  if (section === "cta") {
    return (
      <>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {session
            ? "Welcome Back to Your Shop!"
            : "Ready to Transform Your Shop?"}
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {session
            ? "Your retail management dashboard is ready. Continue managing your inventory, sales, and business operations."
            : "Join hundreds of shop owners who have already modernized their operations with our comprehensive retail management solution."}
        </p>
      </>
    );
  }

  return null;
}
