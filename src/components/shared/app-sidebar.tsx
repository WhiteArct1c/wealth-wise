"use client";

import * as React from "react";
import {
  Wallet,
  Tag,
  Target,
  Receipt,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { AppLogo } from "./app-logo";

const menuItems = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Gestão Financeira",
    items: [
      {
        title: "Transações",
        url: "/transactions",
        icon: Receipt,
      },
      {
        title: "Contas",
        url: "/accounts",
        icon: Wallet,
      },
      {
        title: "Categorias",
        url: "/categories",
        icon: Tag,
      },
      {
        title: "Metas",
        url: "/goals",
        icon: Target,
      },
    ],
  },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string | null;
    email: string;
    avatar?: string | null;
  };
};

function SidebarLogo() {
  const { state } = useSidebar();
  
  return (
    <div className="px-2 py-4 group-data-[collapsible=icon]:px-0">
      <AppLogo
        variant={state === "collapsed" ? "compact" : "default"}
        showSubtitle={state !== "collapsed"}
        href="/dashboard"
      />
    </div>
  );
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.url}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

