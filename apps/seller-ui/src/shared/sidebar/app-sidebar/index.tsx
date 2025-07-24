"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
import Link from "next/link";
import { BookTemplate, Home, Settings, Trash } from "lucide-react";


export function AppSidebar({
  ...props
}:  React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="bg-background-90"
    >
      <SidebarHeader className="pt-6 px-3 pb-0">
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
          
          </div>

          <span className="text-2xl font-semibold">
            <Link href={'/'}>Seller Dashboard</Link>
          </span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="px-3 mt-10 gap-y-6">
        <NavMain items={data.navMain} />
        
      </SidebarContent>
      <SidebarFooter>
     
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}


export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Templates",
      url: "/templates",
      icon: BookTemplate,
    },
    {
      title: "Trash",
      url: "/trash",
      icon: Trash,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
};