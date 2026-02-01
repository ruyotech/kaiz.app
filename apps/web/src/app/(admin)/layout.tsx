'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Bell,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Templates', href: '/admin/templates', icon: FileText },
  { name: 'Subscribers', href: '/admin/subscribers', icon: Users },
  { name: 'Revenue', href: '/admin/revenue', icon: TrendingUp },
  { name: 'Content', href: '/admin/content', icon: BookOpen },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-white/10 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Admin</span>}
          </Link>
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              setMobileMenuOpen(false);
            }}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors hidden lg:block"
          >
            <ChevronRight className={cn('w-5 h-5 transition-transform', sidebarOpen && 'rotate-180')} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}

          <div className="py-2">
            <div className={cn('h-px bg-white/10', sidebarOpen ? 'mx-3' : 'mx-2')} />
          </div>

          {/* Back to App */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Back to App</span>}
          </Link>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/10">
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-semibold text-white flex-shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm">{user?.fullName || 'Admin'}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')}>
        {/* Top bar */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 bg-slate-900/50 backdrop-blur sticky top-0 z-30">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title - desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 uppercase tracking-wide">
              Admin
            </span>
            <h1 className="text-lg font-semibold">
              {navigation.find((n) => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.name ||
                'Admin Panel'}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/notifications"
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
