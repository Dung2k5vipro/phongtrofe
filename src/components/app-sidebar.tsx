'use client';

import * as React from 'react';
import { Building2, Building, Receipt, AlertTriangle, Settings, Shield } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import NavUser from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getMainUser } from '@/lib/auth-storage';
import type { AuthUser } from '@/types/auth';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Đọc user từ localStorage chỉ trên client để tránh Hydration mismatch
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setUser(getMainUser());
    setMounted(true);
  }, []);

  const navMain = React.useMemo(() => {
    const baseItems = [
      {
        title: 'Quản lý cơ bản',
        url: '#',
        icon: Building,
        isActive: true,
        items: [
          { title: 'Tòa nhà', url: '/dashboard/toa-nha' },
          { title: 'Phòng', url: '/dashboard/phong' },
          { title: 'Khách thuê', url: '/dashboard/khach-thue' },
        ],
      },
      {
        title: 'Tài chính',
        url: '#',
        icon: Receipt,
        items: [
          { title: 'Hợp đồng', url: '/dashboard/hop-dong' },
          { title: 'Hóa đơn', url: '/dashboard/hoa-don' },
          { title: 'Thanh toán', url: '/dashboard/thanh-toan' },
        ],
      },
      {
        title: 'Vận hành',
        url: '#',
        icon: AlertTriangle,
        items: [
          { title: 'Sự cố', url: '/dashboard/su-co' },
          { title: 'Thông báo', url: '/dashboard/thong-bao' },
          { title: 'Xem web', url: '/dashboard/xem-web' },
        ],
      },
      {
        title: 'Cài đặt',
        url: '#',
        icon: Settings,
        items: [
          { title: 'Hồ sơ', url: '/dashboard/ho-so' },
          { title: 'Cài đặt', url: '/dashboard/cai-dat' },
        ],
      },
    ];

    // Chỉ thêm mục Quản trị sau khi đã mounted (client-side) để tránh hydration mismatch
    if (mounted) {
      const role = user?.vaiTro ?? user?.role;
      if (role === 'admin') {
        baseItems.splice(3, 0, {
          title: 'Quản trị',
          url: '#',
          icon: Shield,
          items: [{ title: 'Quản lý tài khoản', url: '/dashboard/quan-ly-tai-khoan' }],
        });
      }
    }

    return baseItems;
  }, [user, mounted]);

  const userData = React.useMemo(
    () => ({
      name: user?.ten ?? user?.name ?? 'User',
      email: user?.email ?? 'user@example.com',
      avatar: user?.anhDaiDien ?? user?.avatar,
    }),
    [user]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Phòng trọ</span>
                  <span className="truncate text-xs">Quản lý</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
