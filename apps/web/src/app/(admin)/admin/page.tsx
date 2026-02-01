'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Users,
  CreditCard,
  TrendingUp,
  FileText,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  UserPlus,
  Activity,
  Calendar,
} from 'lucide-react';

export default function AdminOverviewPage() {
  // Mock stats - in real app these would come from API
  const stats = {
    totalUsers: 1247,
    usersGrowth: 12.5,
    activeSubscribers: 823,
    subscribersGrowth: 8.3,
    monthlyRevenue: 24650,
    revenueGrowth: 15.2,
    totalTemplates: 156,
    templatesGrowth: 23,
  };

  const recentActivity = [
    { type: 'signup', user: 'John Smith', email: 'john@example.com', time: '2 minutes ago' },
    { type: 'subscription', user: 'Sarah Wilson', plan: 'Pro Annual', time: '15 minutes ago' },
    { type: 'template', user: 'Mike Johnson', template: 'Morning Routine', time: '1 hour ago' },
    { type: 'signup', user: 'Emily Davis', email: 'emily@example.com', time: '2 hours ago' },
    { type: 'subscription', user: 'Alex Brown', plan: 'Pro Monthly', time: '3 hours ago' },
  ];

  const topPlans = [
    { name: 'Free', users: 424, revenue: 0, color: 'bg-slate-500' },
    { name: 'Pro Monthly', users: 312, revenue: 9360, color: 'bg-blue-500' },
    { name: 'Pro Annual', users: 289, revenue: 13872, color: 'bg-purple-500' },
    { name: 'Family', users: 122, revenue: 1464, color: 'bg-green-500' },
    { name: 'Enterprise', users: 100, revenue: 0, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.usersGrowth}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={<CreditCard className="w-5 h-5" />}
          label="Active Subscribers"
          value={stats.activeSubscribers.toLocaleString()}
          change={stats.subscribersGrowth}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change={stats.revenueGrowth}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Total Templates"
          value={stats.totalTemplates.toLocaleString()}
          change={stats.templatesGrowth}
          suffix="new"
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-slate-900/50 rounded-xl border border-white/10">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="font-semibold">Recent Activity</h2>
            <Link href="/admin/users" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    activity.type === 'signup'
                      ? 'bg-blue-500/20 text-blue-400'
                      : activity.type === 'subscription'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-purple-500/20 text-purple-400'
                  )}
                >
                  {activity.type === 'signup' ? (
                    <UserPlus className="w-5 h-5" />
                  ) : activity.type === 'subscription' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{activity.user}</div>
                  <div className="text-sm text-slate-400">
                    {activity.type === 'signup' && `New signup: ${activity.email}`}
                    {activity.type === 'subscription' && `Subscribed to ${activity.plan}`}
                    {activity.type === 'template' && `Created template: ${activity.template}`}
                  </div>
                </div>
                <div className="text-xs text-slate-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-slate-900/50 rounded-xl border border-white/10">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="font-semibold">Plan Distribution</h2>
            <Link href="/admin/revenue" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              Details <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {topPlans.map((plan) => {
              const totalUsers = topPlans.reduce((sum, p) => sum + p.users, 0);
              const percent = (plan.users / totalUsers) * 100;
              return (
                <div key={plan.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{plan.name}</span>
                    <span className="text-sm text-slate-400">{plan.users} users</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', plan.color)}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {plan.revenue > 0 && (
                    <div className="text-xs text-slate-500 mt-1">${plan.revenue.toLocaleString()}/mo</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction href="/admin/templates" icon={<FileText />} label="Manage Templates" />
          <QuickAction href="/admin/subscribers" icon={<Users />} label="View Subscribers" />
          <QuickAction href="/admin/revenue" icon={<TrendingUp />} label="Revenue Report" />
          <QuickAction href="/admin/content" icon={<Activity />} label="Update Content" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  suffix,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
  suffix?: string;
  color: string;
  bgColor: string;
}) {
  const isPositive = change >= 0;

  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', bgColor, color)}>
        {icon}
      </div>
      <div className={cn('text-2xl font-bold', color)}>{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
      <div className="flex items-center gap-1 mt-2 text-xs">
        {isPositive ? (
          <ArrowUpRight className="w-3 h-3 text-green-500" />
        ) : (
          <ArrowDownRight className="w-3 h-3 text-red-500" />
        )}
        <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-slate-500">{suffix || 'this month'}</span>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all text-center"
    >
      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
