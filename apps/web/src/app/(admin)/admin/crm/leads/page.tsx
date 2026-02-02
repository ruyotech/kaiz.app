'use client';

import { useState, useEffect, useCallback } from 'react';
import { crmApi, Lead, CreateLeadRequest, UpdateLeadRequest } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    Users,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    Building,
    Tag,
    Clock,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Lead['status'] | ''>('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadLeads = useCallback(async () => {
        try {
            setLoading(true);
            let response;

            if (searchQuery) {
                response = await crmApi.searchLeads(searchQuery, page, 20);
            } else {
                response = await crmApi.getLeads({
                    page,
                    size: 20,
                    status: statusFilter || undefined,
                });
            }

            setLeads(response.data || []);
            setTotalPages(response.meta?.totalPages || 0);
            setTotal(response.meta?.total || 0);
        } catch (err) {
            console.error('Failed to load leads:', err);
            setMessage({ type: 'error', text: 'Failed to load leads' });
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, page]);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleCreateLead = async (data: CreateLeadRequest) => {
        try {
            setSaving(true);
            await crmApi.createLead(data);
            setShowAddModal(false);
            setMessage({ type: 'success', text: 'Lead created successfully' });
            loadLeads();
        } catch (err) {
            console.error('Failed to create lead:', err);
            setMessage({ type: 'error', text: 'Failed to create lead' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateLead = async (id: string, data: UpdateLeadRequest) => {
        try {
            setSaving(true);
            await crmApi.updateLead(id, data);
            setSelectedLead(null);
            setMessage({ type: 'success', text: 'Lead updated successfully' });
            loadLeads();
        } catch (err) {
            console.error('Failed to update lead:', err);
            setMessage({ type: 'error', text: 'Failed to update lead' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            await crmApi.deleteLead(id);
            setMessage({ type: 'success', text: 'Lead deleted successfully' });
            loadLeads();
        } catch (err) {
            console.error('Failed to delete lead:', err);
            setMessage({ type: 'error', text: 'Failed to delete lead' });
        }
    };

    const handleConvertLead = async (id: string) => {
        try {
            await crmApi.convertLead(id);
            setMessage({ type: 'success', text: 'Lead converted to customer!' });
            loadLeads();
        } catch (err) {
            console.error('Failed to convert lead:', err);
            setMessage({ type: 'error', text: 'Failed to convert lead' });
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

    const statuses: Lead['status'][] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'NURTURING'];

    return (
        <div className="space-y-6">
            {/* Message Toast */}
            {message && (
                <div className={cn(
                    'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in',
                    message.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                )}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Leads</h1>
                    <p className="text-gray-400 mt-1">{total} total leads</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                    <Plus className="w-4 h-4" />
                    Add Lead
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search leads by name, email, or company..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value as Lead['status'] | '');
                        setPage(0);
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-w-[150px]"
                >
                    <option value="">All Statuses</option>
                    {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Leads Table */}
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    </div>
                ) : leads.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                        <h3 className="text-lg font-medium text-white mb-2">No leads found</h3>
                        <p className="text-gray-400 mb-4">
                            {searchQuery ? 'Try adjusting your search' : 'Add your first lead to get started'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Lead
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left p-4 text-gray-400 font-medium">Lead</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Company</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Priority</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Score</th>
                                        <th className="text-left p-4 text-gray-400 font-medium">Created</th>
                                        <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-white">{lead.fullName || 'No name'}</p>
                                                    <p className="text-sm text-gray-400 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {lead.email}
                                                    </p>
                                                    {lead.phone && (
                                                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                                            <Phone className="w-3 h-3" />
                                                            {lead.phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {lead.company ? (
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Building className="w-4 h-4 text-gray-500" />
                                                        <div>
                                                            <p>{lead.company}</p>
                                                            {lead.jobTitle && (
                                                                <p className="text-sm text-gray-500">{lead.jobTitle}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => handleUpdateLead(lead.id, { status: e.target.value as Lead['status'] })}
                                                    className={cn(
                                                        'px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-purple-500/50 cursor-pointer',
                                                        getStatusColor(lead.status)
                                                    )}
                                                >
                                                    {statuses.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <span className={cn('font-medium', getPriorityColor(lead.priority))}>
                                                    {lead.priority}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full max-w-[60px] h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                            style={{ width: `${Math.min(lead.leadScore, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-gray-400 text-sm">{lead.leadScore}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-400 text-sm">
                                                    {new Date(lead.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {!lead.isConverted && lead.status !== 'WON' && lead.status !== 'LOST' && (
                                                        <button
                                                            onClick={() => handleConvertLead(lead.id)}
                                                            className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                                                        >
                                                            Convert
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedLead(lead)}
                                                        className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLead(lead.id)}
                                                        className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center p-4 border-t border-white/10">
                                <p className="text-sm text-gray-400">
                                    Page {page + 1} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(Math.max(0, page - 1))}
                                        disabled={page === 0}
                                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add Lead Modal */}
            {showAddModal && (
                <LeadFormModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleCreateLead}
                    saving={saving}
                />
            )}

            {/* Edit Lead Modal */}
            {selectedLead && (
                <LeadFormModal
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onSubmit={(data) => handleUpdateLead(selectedLead.id, data)}
                    saving={saving}
                />
            )}
        </div>
    );
}

// Lead Form Modal Component
function LeadFormModal({
    lead,
    onClose,
    onSubmit,
    saving,
}: {
    lead?: Lead;
    onClose: () => void;
    onSubmit: (data: any) => void;
    saving: boolean;
}) {
    const [formData, setFormData] = useState({
        email: lead?.email || '',
        fullName: lead?.fullName || '',
        phone: lead?.phone || '',
        company: lead?.company || '',
        jobTitle: lead?.jobTitle || '',
        source: lead?.source || '',
        priority: lead?.priority || 'MEDIUM',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (lead) {
            // Update mode - exclude email
            const { email, notes, ...updateData } = formData;
            onSubmit(updateData);
        } else {
            // Create mode - include all fields
            onSubmit(formData as CreateLeadRequest);
        }
    };

    const priorities: Lead['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg glass-card rounded-xl border border-white/10 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">
                        {lead ? 'Edit Lead' : 'Add New Lead'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={!!lead}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Phone
                            </label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                placeholder="+1 555-123-4567"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Company
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                placeholder="Acme Inc."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Job Title
                            </label>
                            <input
                                type="text"
                                value={formData.jobTitle}
                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                placeholder="Product Manager"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Source
                            </label>
                            <input
                                type="text"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                placeholder="Website, Referral, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Lead['priority'] })}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                {priorities.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!lead && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                                placeholder="Initial notes about this lead..."
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {lead ? 'Update Lead' : 'Create Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
