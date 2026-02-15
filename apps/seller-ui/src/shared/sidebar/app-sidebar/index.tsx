"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
import Link from "next/link";
import { BookTemplate, Home, SquarePlus, HandCoins, PackageSearch, CalendarPlus, Calendar, Mail, BellRing, TicketPercent, LogOut, Store, Settings, User, ChevronRight, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useSeller from "@/hooks/useSeller";
import { Skeleton } from "@/components/ui/skeleton";


export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {

  const { seller, isLoading } = useSeller();

  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "SC";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-r bg-gradient-to-b from-background to-muted/20"
    >
      <SidebarHeader className="border-b border-border/40 py-4 px-4">
        <Link href={'/'} className="flex items-center gap-3 group">
          {isLoading ? (
            <>
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </>
          ) : seller?.shop?.logo?.url ? (
            <>
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl overflow-hidden bg-muted shadow-lg group-hover:shadow-primary/25 transition-all">
                <img
                  src={seller.shop.logo.url}
                  alt={seller.shop.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-lg font-bold tracking-tight">{seller.shop.name}</span>
                <span className="text-xs text-muted-foreground">Seller Dashboard</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg group-hover:shadow-primary/25 transition-all">
                <Store className="size-5" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-lg font-bold tracking-tight">
                  {seller?.shop?.name || "Artistry Cart"}
                </span>
                <span className="text-xs text-muted-foreground">Seller Dashboard</span>
              </div>
            </>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Overview Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={data.overview} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Products Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Products
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={data.products} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Events & Promotions Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Marketing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={data.marketing} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Communications Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Communications
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={data.communications} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuration Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Configuration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={data.configuration} />
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-3">
        {isLoading ? (
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-full hover:bg-accent/50 data-[state=open]:bg-accent transition-colors"
              >
                <Avatar className="size-8 rounded-lg border-2 border-primary/20">
                  <AvatarImage
                    src={seller?.avatar?.url || seller?.shop?.logo?.url}
                    alt={seller?.name || "Seller"}
                  />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                    {getInitials(seller?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm leading-tight">
                  <span className="font-semibold truncate max-w-[140px]">
                    {seller?.name || "Seller"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {seller?.email || "seller@example.com"}
                  </span>
                </div>
                <ChevronRight className="ml-auto size-4 text-muted-foreground" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="w-56 mb-2"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {seller?.name || "Seller"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {seller?.email || "seller@example.com"}
                  </p>
                  {seller?.shop?.name && (
                    <p className="text-xs leading-none text-muted-foreground pt-1 border-t mt-1">
                      Shop: {seller.shop.name}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 size-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Store className="mr-2 size-4" />
                Shop Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 size-4" />
                Dashboard Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}


export const data = {
  overview: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: BookTemplate,
    },
    {
      title: "Payments",
      url: "/dashboard/payments",
      icon: HandCoins,
    },
  ],
  products: [
    {
      title: "Create Product",
      url: "/dashboard/create-product",
      icon: SquarePlus,
    },
    {
      title: "All Products",
      url: "/dashboard/all-products",
      icon: PackageSearch,
    },
  ],
  marketing: [
    {
      title: "Create Event",
      url: "/dashboard/events",
      icon: CalendarPlus,
    },
    {
      title: "All Events",
      url: "/dashboard/all-events",
      icon: Calendar,
    },
    {
      title: "Discounts",
      url: "/dashboard/discounts",
      icon: TicketPercent,
    },

  ],
  communications: [
    {
      title: "Inbox",
      url: "/dashboard/inbox",
      icon: Mail,
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: BellRing,
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: Sparkles,
    },
  ],
  configuration: [
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BookTemplate, // Placeholder icon
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ]
};