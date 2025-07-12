"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

/**
 * Navigation Group Component
 *
 * Renders a group of navigation items with support for:
 * - Simple links
 * - Collapsible nested items
 * - Active state highlighting
 * - Badges for notifications/counts
 *
 * @param {Object} props
 * @param {string} props.title - Group title
 * @param {Array} props.items - Navigation items
 * @returns {JSX.Element} Navigation group component
 */
export function NavGroup({ title, items }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url || "group"}`;

          // Simple navigation link
          if (!item.items) {
            return <NavLink key={key} item={item} pathname={pathname} />;
          }

          // Collapsible navigation group
          return <NavCollapsible key={key} item={item} pathname={pathname} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/**
 * Simple Navigation Link Component
 */
function NavLink({ item, pathname }) {
  const { setOpenMobile } = useSidebar();
  const IconComponent = item.icon;
  const isActive = pathname === item.url;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {IconComponent && <IconComponent />}
          <span>{item.title}</span>
          {item.badge && (
            <span className="ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-xs text-sidebar-primary-foreground">
              {item.badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/**
 * Collapsible Navigation Group Component
 */
function NavCollapsible({ item, pathname }) {
  const { setOpenMobile } = useSidebar();
  const IconComponent = item.icon;

  // Check if any child item is active to determine initial open state
  const isActive =
    item.items?.some((subItem) => pathname === subItem.url) || false;

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            {IconComponent && <IconComponent />}
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-xs text-sidebar-primary-foreground">
                {item.badge}
              </span>
            )}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const SubIconComponent = subItem.icon;
              const isSubActive = pathname === subItem.url;

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                    <Link
                      href={subItem.url}
                      onClick={() => setOpenMobile(false)}
                    >
                      {SubIconComponent && <SubIconComponent />}
                      <span>{subItem.title}</span>
                      {subItem.badge && (
                        <span className="ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-xs text-sidebar-primary-foreground">
                          {subItem.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
