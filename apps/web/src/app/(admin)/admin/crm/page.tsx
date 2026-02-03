'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { crmApi, Lead, CrmStats } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    Users,
    TrendingUp,
    Target,
    CheckCircle,
    XCircle,
    Clock,
    Plus,
    Search,
    ChevronRight,
    Phone,
    Mail,
    Building,
} from 'lucide-react';

export default function CrmPage() {
    const [stats, setStats] = useState<CrmStats | null>(null);
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [highPriorityLeads, setHighPriorityLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsRes, recentRes, priorityRes] = await Promise.all([
                crmApi.getStats(),
                crmApi.getRecentLeads(),
                crmApi.getHighPriorityLeads(),
            ]);
            setStats(statsRes);
            setRecentLeads(recentRes || []);
            setHighPriorityLeads(priorityRes || []);
        } catch (err) {
            console.error('Failed to load CRM data:', err);
            setError('Failed to load CRM data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-500/20 text-blue-400';
            case 'CONTACTED': return 'bg-purple-500/20 text-purple-400';
            case 'QUALIFIED': return 'bg-emerald-500/20 text-emerald-400';
            case 'PROPOSAL': return 'bg-amber-500/20 text-amber-400';
            case 'NEGOTIATION': return 'bg-orange-500/20 text-orange-400';
            case 'WON': return 'bg-green-500/20 text-green-400';
            case 'LOST': return 'bg-red-500/20 text-red-400';
            case 'NURTURING': return 'bg-cyan-500/20 text-cyan-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'text-red-400';
            case 'HIGH': return 'text-orange-400';
            case 'MEDIUM': return 'text-yellow-400';
            case 'LOW': return 'text-gray-400';
            default: return 'text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">CRM Dashboard</h1>
                    <p className="text-gray-400 mt-1">Track and manage your leads pipeline</p>
                </div>
                <Link
                    href="/admin/crm/leads"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                    <Plus className="w-4 h-4" />
                    Add Lead
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Leads</p>
                            <p className="text-2xl font-bold text-white">{stats?.totalLeads || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                            <Target className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Qualified</p>
                            <p className="text-2xl font-bold text-white">{stats?.qualifiedLeads || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Won (Converted)</p>
                            <p className="text-2xl font-bold text-white">{stats?.wonLeads || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Conversion Rate</p>
                            <p className="text-2xl font-bold text-white">{stats?.conversionRate?.toFixed(1) || 0}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pipeline Stats */}
            <div className="glass-card p-6 rounded-xl border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Pipeline Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                    {Object.entries(stats?.leadsByStatus || {}).map(([status, count]) => (
                        <div
                            key={status}
                            className="p-3 rounded-lg bg-white/5 border border-white/5 text-center"
                        >
                            <p className={cn('text-xs font-medium mb-1', getStatusColor(status).split(' ')[1])}>
                                {status.replace('_', ' ')}
                            </p>
                            <p className="text-xl font-bold text-white">{count}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Leads */}
                <div className="glass-card rounded-xl border border-white/10">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
                        <Link
                            href="/admin/crm/leads"
                            className="text-sm text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                        >
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {recentLeads.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No leads yet</p>
                                <p className="text-sm mt-1">Add your first lead to get started</p>
                            </div>
                        ) : (
                            recentLeads.slice(0, 5).map((lead) => (
                                <div key={lead.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-white">
                                                {lead.fullName || lead.email}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {lead.email}
                                                </span>
                                                {lead.company && (
                                                    <span className="flex items-center gap-1">
                                                        <Building className="w-3 h-3" />
                                                        {lead.company}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(lead.status))}>
                                            {lead.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* High Priority Leads */}
                <div className="glass-card rounded-xl border border-white/10">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">High Priority Leads</h2>
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                            Needs Attention
                        </span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {highPriorityLeads.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50 text-green-400" />
                                <p>All caught up!</p>
                                <p className="text-sm mt-1">No high priority leads need attention</p>
                            </div>
                        ) : (
                            highPriorityLeads.slice(0, 5).map((lead) => (
                                <div key={lead.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-white">
                                                    {lead.fullName || lead.email}
                                                </h3>
                                                <span className={cn('text-xs font-medium', getPriorityColor(lead.priority))}>
                                                    {lead.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">{lead.email}</p>
                                            {lead.lastActivityAt && (
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Last activity: {new Date(lead.lastActivityAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(lead.status))}>
                                            {lead.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Lead Sources */}
            {stats?.leadsBySource && Object.keys(stats.leadsBySource).length > 0 && (
                <div className="glass-card p-6 rounded-xl border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4">Lead Sources</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.entries(stats.leadsBySource).map(([source, count]) => (
                            <div
                                key={source}
                                className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5"
                            >
                                <p className="text-sm text-gray-400 mb-1">{source}</p>
                                <p className="text-2xl font-bold text-white">{count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
