'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';

const usersData = [
  { id: 1, name: 'Sarah Mitchell', email: 'sarah@example.com', avatar: 'sarah-m', tier: 'pro', status: 'active', streak: 127, joinedAt: '2024-03-15' },
  { id: 2, name: 'Alex Kozlov', email: 'alex@example.com', avatar: 'alex-k', tier: 'free', status: 'active', streak: 89, joinedAt: '2024-05-20' },
  { id: 3, name: 'Emma Liu', email: 'emma@example.com', avatar: 'emma-l', tier: 'enterprise', status: 'active', streak: 156, joinedAt: '2024-01-10' },
  { id: 4, name: 'Jordan Peters', email: 'jordan@example.com', avatar: 'jordan-p', tier: 'pro', status: 'inactive', streak: 0, joinedAt: '2024-06-01' },
  { id: 5, name: 'Mike Roberts', email: 'mike@example.com', avatar: 'mike-r', tier: 'family', status: 'active', streak: 67, joinedAt: '2024-04-22' },
  { id: 6, name: 'Lisa Thompson', email: 'lisa@example.com', avatar: 'lisa-t', tier: 'pro', status: 'active', streak: 34, joinedAt: '2024-07-08' },
  { id: 7, name: 'David Wilson', email: 'david@example.com', avatar: 'david-w', tier: 'free', status: 'suspended', streak: 0, joinedAt: '2024-02-14' },
  { id: 8, name: 'Nina Singh', email: 'nina@example.com', avatar: 'nina-s', tier: 'pro', status: 'active', streak: 78, joinedAt: '2024-08-30' },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesTier = !filterTier || user.tier === filterTier;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-slate-400">Manage and monitor all users</p>
        </div>
        <Button variant="gradient">+ Add User</Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs bg-slate-700/50 border-white/10"
            />
            <div className="flex gap-2">
              {['all', 'free', 'pro', 'family', 'enterprise'].map((tier) => (
                <Button
                  key={tier}
                  variant={filterTier === tier || (tier === 'all' && !filterTier) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTier(tier === 'all' ? null : tier)}
                  className="capitalize"
                >
                  {tier}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'inactive', 'suspended'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status || (status === 'all' && !filterStatus) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status === 'all' ? null : status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-slate-400">User</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Tier</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Streak</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Joined</th>
                  <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          user.tier === 'enterprise'
                            ? 'default'
                            : user.tier === 'pro'
                            ? 'level'
                            : user.tier === 'family'
                            ? 'success'
                            : 'secondary'
                        }
                        className="capitalize"
                      >
                        {user.tier}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          user.status === 'active'
                            ? 'success'
                            : user.status === 'suspended'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="capitalize"
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={cn(user.streak > 0 ? 'text-orange-400' : 'text-slate-500')}>
                        {user.streak > 0 ? `🔥 ${user.streak}` : '—'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Showing {filteredUsers.length} of {usersData.length} users
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
