import { Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getCurrentProfile } from "@/lib/auth";

async function SidebarWithProfile() {
  const profile = await getCurrentProfile();
  return (
    <AppSidebar
      user={{
        name: profile.name,
        email: profile.email,
        role: profile.role,
      }}
    />
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Suspense fallback={<div className="w-[var(--sidebar-width)]" />}>
        <SidebarWithProfile />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
