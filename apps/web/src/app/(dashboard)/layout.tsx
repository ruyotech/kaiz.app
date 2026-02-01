'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Flame,
  Calendar,
  Users,
  BookOpen,
  Brain,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  Sparkles,
  Home,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Epics', href: '/epics', icon: Target },
  { name: 'Challenges', href: '/challenges', icon: Flame },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Essentia', href: '/essentia', icon: BookOpen },
  { name: 'SensAI', href: '/sensai', icon: Brain },
];

const secondaryNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
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
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-xl text-white">
              K
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Kaiz</span>}
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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

          {secondaryNav.map((item) => {
            const isActive = pathname === item.href;
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
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/10">
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center font-semibold text-white flex-shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm">{user?.fullName || 'User'}</div>
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
            <h1 className="text-xl font-semibold">
              {navigation.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))?.name ||
                secondaryNav.find((n) => pathname === n.href)?.name ||
                'Dashboard'}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 bg-slate-800/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>

            {/* Quick actions */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-all">
              <Sparkles className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
