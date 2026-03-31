"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Users,
  ShieldCheck,
  Plus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";

const navItems = [
  { title: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { title: "프로젝트", href: "/projects", icon: FolderKanban },
  { title: "템플릿", href: "/templates", icon: Layers, admin: true },
  { title: "팀 관리", href: "/team", icon: Users, admin: true },
];

interface AppSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";

  const visibleItems = navItems.filter(
    (item) => !item.admin || isAdmin,
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">EduContentsFlow</span>
            <span className="text-xs leading-tight opacity-50">안전보건교육본부</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} prefetch={false} />}
                    isActive={pathname.startsWith(item.href)}
                  >
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border space-y-2 p-3">
        {isAdmin && (
          <Button
            render={<Link href="/projects/new" />}
            className="w-full justify-center"
            size="sm"
          >
            <Plus className="size-4" />
            새 프로젝트
          </Button>
        )}
        <UserNav user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
