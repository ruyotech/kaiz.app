'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
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
} from 'lucide-react';

type SubscriberFilter = 'all' | 'active' | 'trial' | 'churned' | 'leads';

export default function AdminSubscribersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriberFilter>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch subscribers
  const { data: subscribersData, isLoading } = useQuery({
    queryKey: ['adminSubscribers', currentPage, statusFilter],
    queryFn: () => adminApi.getAllUsers({ 
      page: currentPage, 
      size: 10,
      subscriptionTier: statusFilter === 'all' ? undefined : statusFilter 
    }),
    staleTime: 30000,
  });

  const subscribers = subscribersData?.content || [];

  // Mock data for display
  const mockSubscribers = [
    {
      id: '1',
      fullName: 'John Smith',
      email: 'john@example.com',
      plan: 'Pro Annual',
      status: 'ACTIVE',
      joinedAt: '2024-01-15',
      lastActive: '2024-02-01',
      totalSpent: 288,
      tags: ['Power User', 'Beta Tester'],
    },
    {
      id: '2',
      fullName: 'Sarah Wilson',
      email: 'sarah@example.com',
      plan: 'Pro Monthly',
      status: 'ACTIVE',
      joinedAt: '2024-01-20',
      lastActive: '2024-02-01',
      totalSpent: 60,
      tags: ['Early Adopter'],
    },
    {
      id: '3',
      fullName: 'Mike Johnson',
      email: 'mike@example.com',
      plan: 'Free',
      status: 'TRIAL',
      joinedAt: '2024-01-28',
      lastActive: '2024-01-30',
      totalSpent: 0,
      tags: ['Lead'],
    },
    {
      id: '4',
      fullName: 'Emily Davis',
      email: 'emily@example.com',
      plan: 'Pro Annual',
      status: 'CHURNED',
      joinedAt: '2023-06-15',
      lastActive: '2023-12-01',
      totalSpent: 288,
      tags: [],
    },
    {
      id: '5',
      fullName: 'Alex Brown',
      email: 'alex@example.com',
      plan: 'Family',
      status: 'ACTIVE',
      joinedAt: '2024-01-10',
      lastActive: '2024-02-01',
      totalSpent: 144,
      tags: ['Family Plan'],
    },
  ];

  const displaySubscribers = subscribers.length > 0 ? subscribers : mockSubscribers;

  // Filter subscribers
  const filteredSubscribers = displaySubscribers.filter((sub: any) => {
    const matchesSearch =
      !searchQuery ||
      sub.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && sub.status === 'ACTIVE') ||
      (statusFilter === 'trial' && sub.status === 'TRIAL') ||
      (statusFilter === 'churned' && sub.status === 'CHURNED') ||
      (statusFilter === 'leads' && (sub.plan === 'Free' || sub.status === 'TRIAL'));
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: displaySubscribers.length,
    active: displaySubscribers.filter((s: any) => s.status === 'ACTIVE').length,
    trial: displaySubscribers.filter((s: any) => s.status === 'TRIAL').length,
    churned: displaySubscribers.filter((s: any) => s.status === 'CHURNED').length,
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
        <StatCard label="Active" value={stats.active} color="text-green-400" bgColor="bg-green-500/10" />
        <StatCard label="Trial" value={stats.trial} color="text-yellow-400" bgColor="bg-yellow-500/10" />
        <StatCard label="Churned" value={stats.churned} color="text-red-400" bgColor="bg-red-500/10" />
      </div>

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

        {/* Status filter */}
        <div className="flex items-center gap-2">
          {(['all', 'active', 'trial', 'leads', 'churned'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                statusFilter === filter
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              {filter}
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
                {paginatedSubscribers.map((sub: any) => (
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredSubscribers.length)} of{' '}
                {filteredSubscribers.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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
