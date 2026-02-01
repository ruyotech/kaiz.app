'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Calendar,
  ChevronDown,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

type TimeRange = '7d' | '30d' | '90d' | '12m';

export default function AdminRevenuePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Mock data
  const stats = {
    totalRevenue: 24650,
    revenueGrowth: 15.2,
    mrr: 8216,
    mrrGrowth: 8.3,
    activeSubscribers: 823,
    subscribersGrowth: 5.7,
    arpu: 29.95,
    arpuGrowth: 2.1,
    churnRate: 3.2,
    churnChange: -0.5,
    ltv: 359.40,
    ltvGrowth: 12.3,
  };

  const revenueByPlan = [
    { name: 'Pro Annual', revenue: 13872, users: 289, percentage: 56 },
    { name: 'Pro Monthly', revenue: 9360, users: 312, percentage: 38 },
    { name: 'Family', revenue: 1464, users: 122, percentage: 6 },
  ];

  const transactions = [
    { id: 1, user: 'John Smith', plan: 'Pro Annual', amount: 288, type: 'subscription', date: '2024-02-01' },
    { id: 2, user: 'Sarah Wilson', plan: 'Pro Monthly', amount: 30, type: 'subscription', date: '2024-02-01' },
    { id: 3, user: 'Mike Johnson', plan: 'Pro Monthly', amount: 30, type: 'subscription', date: '2024-01-31' },
    { id: 4, user: 'Emily Davis', plan: 'Pro Annual', amount: 288, type: 'renewal', date: '2024-01-30' },
    { id: 5, user: 'Alex Brown', plan: 'Family', amount: 12, type: 'subscription', date: '2024-01-30' },
  ];

  const monthlyData = [
    { month: 'Sep', revenue: 18500 },
    { month: 'Oct', revenue: 19200 },
    { month: 'Nov', revenue: 21000 },
    { month: 'Dec', revenue: 22100 },
    { month: 'Jan', revenue: 23800 },
    { month: 'Feb', revenue: 24650 },
  ];

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Revenue Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your income, subscriptions, and financial metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium transition-all">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueStatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueGrowth}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <RevenueStatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Monthly Recurring (MRR)"
          value={`$${stats.mrr.toLocaleString()}`}
          change={stats.mrrGrowth}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <RevenueStatCard
          icon={<Users className="w-5 h-5" />}
          label="Active Subscribers"
          value={stats.activeSubscribers.toLocaleString()}
          change={stats.subscribersGrowth}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <RevenueStatCard
          icon={<CreditCard className="w-5 h-5" />}
          label="Avg Revenue Per User"
          value={`$${stats.arpu.toFixed(2)}`}
          change={stats.arpuGrowth}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400 mb-1">Churn Rate</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{stats.churnRate}%</span>
            <span className={cn('text-xs flex items-center', stats.churnChange < 0 ? 'text-green-500' : 'text-red-500')}>
              {stats.churnChange < 0 ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
              {Math.abs(stats.churnChange)}%
            </span>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400 mb-1">Customer LTV</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">${stats.ltv.toFixed(2)}</span>
            <span className="text-xs text-green-500 flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              {stats.ltvGrowth}%
            </span>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400 mb-1">New Subscribers (30d)</div>
          <div className="text-xl font-bold">47</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="text-sm text-slate-400 mb-1">Churned (30d)</div>
          <div className="text-xl font-bold text-red-400">12</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <h2 className="font-semibold mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-end gap-2">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-primary to-cyan-500 rounded-t-lg transition-all"
                  style={{ height: `${(d.revenue / maxRevenue) * 200}px` }}
                />
                <span className="text-xs text-slate-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <h2 className="font-semibold mb-4">Revenue by Plan</h2>
          <div className="space-y-4">
            {revenueByPlan.map((plan) => (
              <div key={plan.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{plan.name}</span>
                  <div className="text-right">
                    <span className="font-semibold">${plan.revenue.toLocaleString()}</span>
                    <span className="text-sm text-slate-500 ml-2">({plan.users} users)</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full"
                    style={{ width: `${plan.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Monthly Revenue</span>
              <span className="text-xl font-bold text-primary">
                ${revenueByPlan.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-semibold">Recent Transactions</h2>
          <button className="text-sm text-primary hover:text-primary/80">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-sm font-medium text-slate-400">User</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-400">Plan</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-400">Type</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-400">Amount</th>
                <th className="px-4 py-3 text-sm font-medium text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium">{tx.user}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">{tx.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        tx.type === 'subscription'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      )}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-green-400">+${tx.amount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RevenueStatCard({
  icon,
  label,
  value,
  change,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number;
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
        <span className="text-slate-500">vs last period</span>
      </div>
    </div>
  );
}
