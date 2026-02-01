'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  MoreHorizontal,
  FileText,
  X,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';

type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export default function AdminTemplatesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Fetch templates
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['adminTemplates'],
    queryFn: () => adminApi.getGlobalTemplates(),
    staleTime: 30000,
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createGlobalTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTemplates'] });
      setShowCreateModal(false);
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateGlobalTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTemplates'] });
      setEditingTemplate(null);
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteGlobalTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTemplates'] });
    },
  });

  const templates = templatesData || [];

  // Filter templates
  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch =
      !searchQuery ||
      template.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mock data for display
  const mockTemplates = filteredTemplates.length > 0 ? filteredTemplates : [
    {
      id: '1',
      title: 'Morning Routine Template',
      description: 'A comprehensive morning routine for productivity',
      category: 'DAILY_ROUTINES',
      status: 'PUBLISHED',
      usageCount: 1234,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Weekly Planning Sprint',
      description: 'Plan your week with this agile-inspired template',
      category: 'WEEKLY_PLANNING',
      status: 'PUBLISHED',
      usageCount: 867,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: '30-Day Fitness Challenge',
      description: 'Build a consistent workout habit',
      category: 'FITNESS',
      status: 'DRAFT',
      usageCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const displayTemplates = filteredTemplates.length > 0 ? filteredTemplates : mockTemplates;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Global Templates</h1>
          <p className="text-slate-400 text-sm mt-1">
            {displayTemplates.length} templates • Manage and publish templates for users
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium transition-all"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          {(['all', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Table */}
      {isLoading ? (
        <TemplatesSkeleton />
      ) : (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Template</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Category</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Usage</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Created</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayTemplates.map((template: any) => (
                  <TemplateRow
                    key={template.id}
                    template={template}
                    onEdit={() => setEditingTemplate(template)}
                    onDelete={() => deleteMutation.mutate(template.id)}
                    onDuplicate={() => {
                      // Duplicate logic
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTemplate(null);
          }}
          onSave={(data) => {
            if (editingTemplate) {
              updateMutation.mutate({ id: editingTemplate.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <BulkUploadModal onClose={() => setShowBulkUploadModal(false)} />
      )}
    </div>
  );
}

function TemplateRow({
  template,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  template: any;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'text-green-400 bg-green-500/20';
      case 'DRAFT':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium">{template.title}</div>
            <div className="text-sm text-slate-500 line-clamp-1">{template.description}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-400">{template.category?.replace('_', ' ')}</span>
      </td>
      <td className="px-4 py-3">
        <span className={cn('text-xs px-2 py-1 rounded-full', getStatusColor(template.status))}>
          {template.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm">{(template.usageCount || 0).toLocaleString()}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-slate-400">
          {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '-'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-36 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => {
                    onDuplicate();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  <Copy className="w-4 h-4" /> Duplicate
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function TemplateModal({
  template,
  onClose,
  onSave,
  isLoading,
}: {
  template: any;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: template?.title || '',
    description: template?.description || '',
    category: template?.category || 'DAILY_ROUTINES',
    status: template?.status || 'DRAFT',
    content: template?.content || '',
  });

  const categories = [
    'DAILY_ROUTINES',
    'WEEKLY_PLANNING',
    'GOAL_SETTING',
    'HABIT_TRACKING',
    'FITNESS',
    'MINDFULNESS',
    'PRODUCTIVITY',
    'LEARNING',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">{template ? 'Edit Template' : 'New Template'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Template title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
              placeholder="Describe what this template is for..."
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Content/Tasks */}
          <div>
            <label className="block text-sm font-medium mb-1">Template Content (JSON)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[200px] font-mono text-sm"
              placeholder='{"tasks": [{"title": "Task 1", "storyPoints": 2}]}'
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title}
              className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : template ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Bulk Upload Templates</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Upload area */}
          <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">
              Drag and drop a JSON file, or click to browse
            </p>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
            >
              Select File
            </label>
            {file && (
              <p className="text-sm text-primary mt-2">{file.name}</p>
            )}
          </div>

          {/* Download sample */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all">
            <Download className="w-4 h-4" />
            Download Sample JSON
          </button>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatesSkeleton() {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-slate-700" />
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-700 rounded w-1/2 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
