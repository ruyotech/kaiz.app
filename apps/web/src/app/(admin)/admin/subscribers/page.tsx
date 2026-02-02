'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, User, PaginatedResponse } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Tag,
  MessageSquare,
  CreditCard,
  Star,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

type SubscriberFilter = 'all' | 'FREE' | 'PREMIUM' | 'ENTERPRISE';

// Map User to display format
interface DisplaySubscriber {
  id: string;
  fullName: string;
  email: string;
  plan: string;
  status: 'ACTIVE' | 'TRIAL' | 'CHURNED';
  subscriptionTier: string;
  joinedAt: string;
  lastActive: string;
  totalSpent: number;
  tags: string[];
  avatarUrl: string | null;
}

function mapUserToSubscriber(user: User): DisplaySubscriber {
  // Map subscription tier to user-friendly plan names
  const planMap: Record<string, string> = {
    'FREE': 'Free',
    'PREMIUM': 'Pro Monthly',
    'ENTERPRISE': 'Enterprise',
  };

  // Determine status based on subscription tier
  const status: 'ACTIVE' | 'TRIAL' | 'CHURNED' =
    user.subscriptionTier === 'FREE' ? 'TRIAL' : 'ACTIVE';

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    plan: planMap[user.subscriptionTier] || user.subscriptionTier,
    status,
    subscriptionTier: user.subscriptionTier,
    joinedAt: user.createdAt || '',
    lastActive: user.createdAt || '', // Use createdAt as fallback
    totalSpent: user.subscriptionTier === 'PREMIUM' ? 29 : user.subscriptionTier === 'ENTERPRISE' ? 99 : 0,
    tags: user.subscriptionTier === 'PREMIUM' ? ['Premium'] : user.subscriptionTier === 'ENTERPRISE' ? ['Enterprise', 'Priority Support'] : [],
    avatarUrl: user.avatarUrl,
  };
}

export default function AdminSubscribersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<SubscriberFilter>('all');
  const [selectedUser, setSelectedUser] = useState<DisplaySubscriber | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Fetch subscribers from backend
  const { data: subscribersData, isLoading, error } = useQuery<PaginatedResponse<User>>({
    queryKey: ['adminSubscribers', currentPage, tierFilter],
    queryFn: () => adminApi.getAllUsers({
      page: currentPage,
      size: itemsPerPage,
      subscriptionTier: tierFilter === 'all' ? undefined : tierFilter
    }),
    staleTime: 30000,
  });

  // Map backend users to display format
  const subscribers: DisplaySubscriber[] = (subscribersData?.content || []).map(mapUserToSubscriber);

  // Filter by search query (client-side)
  const filteredSubscribers = subscribers.filter((sub) => {
    if (!searchQuery) return true;
    return sub.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Use backend pagination info
  const totalPages = subscribersData?.totalPages || 1;
  const totalElements = subscribersData?.totalElements || 0;

  // Stats - calculate from current page data and total
  const stats = {
    total: totalElements,
    premium: subscribers.filter(s => s.subscriptionTier === 'PREMIUM').length,
    enterprise: subscribers.filter(s => s.subscriptionTier === 'ENTERPRISE').length,
    free: subscribers.filter(s => s.subscriptionTier === 'FREE').length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subscribers & CRM</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage subscribers, track leads, and reduce churn
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium transition-all">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.total} color="text-blue-400" bgColor="bg-blue-500/10" />
        <StatCard label="Premium" value={stats.premium} color="text-green-400" bgColor="bg-green-500/10" />
        <StatCard label="Enterprise" value={stats.enterprise} color="text-purple-400" bgColor="bg-purple-500/10" />
        <StatCard label="Free" value={stats.free} color="text-yellow-400" bgColor="bg-yellow-500/10" />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300">Failed to load subscribers. Please try again.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Subscription Tier filter */}
        <div className="flex items-center gap-2">
          {(['all', 'FREE', 'PREMIUM', 'ENTERPRISE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => { setTierFilter(filter); setCurrentPage(0); }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                tierFilter === filter
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              {filter === 'all' ? 'All' : filter.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Subscribers Table */}
      {isLoading ? (
        <SubscribersSkeleton />
      ) : (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">User</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Plan</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Joined</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Last Active</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Revenue</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubscribers.map((sub) => (
                  <SubscriberRow
                    key={sub.id}
                    subscriber={sub}
                    onSelect={() => setSelectedUser(sub)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <div className="text-sm text-slate-400">
                Showing {currentPage * itemsPerPage + 1} to{' '}
                {Math.min((currentPage + 1) * itemsPerPage, totalElements)} of{' '}
                {totalElements}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
      <div className={cn('text-2xl font-bold', color)}>{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function SubscriberRow({
  subscriber,
  onSelect,
}: {
  subscriber: any;
  onSelect: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-400 bg-green-500/20';
      case 'TRIAL':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'CHURNED':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getPlanColor = (plan: string) => {
    if (plan.includes('Pro')) return 'text-primary';
    if (plan.includes('Family')) return 'text-purple-400';
    return 'text-slate-400';
  };

  return (
    <tr className="hover:bg-white/5 transition-colors cursor-pointer" onClick={onSelect}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center font-semibold text-white">
            {subscriber.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="font-medium">{subscriber.fullName}</div>
            <div className="text-sm text-slate-500">{subscriber.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn('text-sm font-medium', getPlanColor(subscriber.plan))}>
          {subscriber.plan}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn('text-xs px-2 py-1 rounded-full', getStatusColor(subscriber.status))}>
          {subscriber.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-400">
          {subscriber.joinedAt ? new Date(subscriber.joinedAt).toLocaleDateString() : '-'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-400">
          {subscriber.lastActive ? new Date(subscriber.lastActive).toLocaleDateString() : '-'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-medium">${subscriber.totalSpent || 0}</span>
      </td>
      <td className="px-4 py-3">
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-10">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
                  <Mail className="w-4 h-4" /> Send Email
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
                  <Tag className="w-4 h-4" /> Add Tag
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
                  <MessageSquare className="w-4 h-4" /> Add Note
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function UserDetailModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">User Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          {/* User Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center font-bold text-2xl text-white">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.fullName}</h3>
              <p className="text-slate-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {user.tags?.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <CreditCard className="w-4 h-4" /> Current Plan
              </div>
              <div className="font-semibold">{user.plan}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Star className="w-4 h-4" /> Status
              </div>
              <div className="font-semibold">{user.status}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Calendar className="w-4 h-4" /> Joined
              </div>
              <div className="font-semibold">
                {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '-'}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Users className="w-4 h-4" /> Total Revenue
              </div>
              <div className="font-semibold">${user.totalSpent || 0}</div>
            </div>
          </div>

          {/* Add Note */}
          <div>
            <label className="block text-sm font-medium mb-2">Add Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
              placeholder="Add a note about this user..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all">
              <Mail className="w-4 h-4" /> Send Email
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium transition-all">
              <Tag className="w-4 h-4" /> Add Tag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscribersSkeleton() {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-700" />
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-1/4" />
              <div className="h-3 bg-slate-700 rounded w-1/3 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
