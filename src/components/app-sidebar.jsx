// src/components/app-sidebar.jsx

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/layout/nav-group";
import { NavUser } from "@/components/layout/nav-user";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import { navigationGroups, companyInfo } from "@/lib/navigation-data";
import { Home, Command } from "lucide-react";

// Teams/workspaces data for the team switcher
const teams = [
  {
    name: companyInfo.name,
    logo: companyInfo.icon,
    plan: companyInfo.description,
  },
  {
    name: "Acme Store",
    logo: Command,
    plan: "Enterprise",
  },
];

/**
 * Application Sidebar Component
 *
 * Enhanced sidebar using shadcn-admin design patterns with:
 * - Team/workspace switcher in header
 * - Grouped navigation with collapsible sections
 * - Enhanced user profile in footer
 * - Modern visual styling and interactions
 *
 * @param {Object} props
 * @param {Object} [props.user] - User data for the footer navigation
 * @returns {JSX.Element} Application sidebar component
 */
export function AppSidebar({ user, ...props }) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        {navigationGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
