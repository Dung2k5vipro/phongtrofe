'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { DynamicBreadcrumb } from '@/components/ui/dynamic-breadcrumb';
import { PageProgress } from '@/components/ui/page-progress';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
          <PageProgress />
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <DynamicBreadcrumb />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
