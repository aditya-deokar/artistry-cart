"use client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  
  return (
    <SidebarMenu className="gap-1">
      {items.map((item, idx) => {
        const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));
        
        return (
          <SidebarMenuItem key={idx}>
            <SidebarMenuButton 
              asChild 
              tooltip={item.title}
              className={cn(
                "relative transition-all duration-200 ease-in-out",
                "hover:bg-accent/80 hover:text-accent-foreground",
                "group-data-[collapsible=icon]:hover:bg-accent",
                isActive && [
                  "bg-primary/10 text-primary font-semibold",
                  "hover:bg-primary/15 hover:text-primary",
                  "border-l-2 border-primary",
                  "shadow-sm"
                ]
              )}
            >
              <Link 
                href={item.url} 
                className="flex items-center gap-3 w-full"
              >
                <item.icon 
                  className={cn(
                    "size-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )} 
                />
                <span className="flex-1 text-sm font-medium">
                  {item.title}
                </span>
                {isActive && (
                  <div className="size-2 rounded-full bg-primary animate-pulse group-data-[collapsible=icon]:hidden" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
