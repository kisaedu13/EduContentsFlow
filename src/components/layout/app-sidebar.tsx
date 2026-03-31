"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Users,
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
      <SidebarHeader className="border-b border-[#27272A] px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex size-[30px] items-center justify-center rounded-lg bg-[#4F46E5] text-white text-[13px] font-bold">
            E
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-white">EduContentsFlow</span>
            <span className="text-[11px] text-[#71717A]">안전보건교육본부</span>
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
                    className="transition-all duration-150"
                  >
                    <item.icon className="size-[18px]" />
                    <span className="text-[14px]">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-[#27272A] space-y-3 p-3">
        {isAdmin && (
          <Link
            href="/projects/new"
            className="flex items-center justify-center gap-1.5 w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg py-2.5 text-[14px] font-medium transition-all duration-150"
          >
            <Plus className="size-4" />
            새 프로젝트
          </Link>
        )}
        <UserNav user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
