import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Package2, Users, Calendar, Settings, LogOut, BarChart3, ShoppingCart, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Дашборд',
    href: '/admin/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Пользователи',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Контент',
    href: '/admin/content',
    icon: Package2,
  },
  {
    name: 'Товары',
    href: '/admin/products',
    icon: ShoppingCart,
  },
  {
    name: 'Записи',
    href: '/admin/appointments',
    icon: Calendar,
  },
  {
    name: 'Настройки',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    name: 'Касса',
    href: '/admin/cash-register',
    icon: Wallet,
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Sidebar trigger button - visible on all screen sizes */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </div>

      {/* Collapsible sidebar for both mobile and desktop */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="flex flex-col w-64">
          <nav className="grid gap-2 text-lg font-medium">
            <div className="flex items-center gap-2 text-lg font-semibold py-4">
              <Package2 className="h-6 w-6" />
              <span>Салон красоты</span>
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </a>
              );
            })}
            <div className="mt-auto pt-4">
              <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => { handleLogout(); setSidebarOpen(false); }}>
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col w-full pt-16">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}