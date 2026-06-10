
"use client";

import * as React from "react";
import { 
  Library, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Shield, 
  Sword, 
  ScrollText,
  Home,
  ChevronRight
} from "lucide-react";
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
  useSidebar
} from "@/components/ui/sidebar";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { title: "Dashboard", icon: Home, url: "/admin/dashboard" },
  { title: "Archives", icon: ScrollText, url: "/admin/archives" },
  { title: "Chronicles", icon: Calendar, url: "/admin/chronicles" },
  { title: "Protagonists", icon: Users, url: "/admin/protagonists" },
  { title: "Relics", icon: Sword, url: "/admin/relics" },
];

const metaItems = [
  { title: "Registry", icon: Shield, url: "/admin/registry" },
  { title: "Settings", icon: Settings, url: "/admin/settings" },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
            <Library className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
          </div>
          <span className={`font-headline text-lg font-bold tracking-tight text-foreground transition-opacity duration-200 ${state === 'collapsed' ? 'opacity-0' : 'opacity-100'}`}>
            Lorekeeper
          </span>
        </div>
      </SidebarHeader>
      
      <Separator className="opacity-10" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-headline text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 py-4">
            Core Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-primary/5 transition-all group"
                  >
                    <a href={item.url} className="flex items-center gap-3 py-6">
                      <item.icon className={`w-5 h-5 ${pathname === item.url ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} strokeWidth={1.5} />
                      <span className="font-body text-sm">{item.title}</span>
                      {pathname === item.url && <ChevronRight className="ml-auto w-3 h-3 text-primary" />}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="font-headline text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 py-4">
            Administrative
          </SidebarGroupLabel>
          <SidebarMenu>
            {metaItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className="hover:bg-primary/5 transition-all"
                >
                  <a href={item.url} className="flex items-center gap-3 py-6">
                    <item.icon className={`w-5 h-5 ${pathname === item.url ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} strokeWidth={1.5} />
                    <span className="font-body text-sm">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all font-headline text-xs uppercase tracking-widest"
              tooltip="Terminate Session"
            >
              <LogOut className="w-4 h-4 mr-2" strokeWidth={2} />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
