'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, AdminTaskTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '@/lib/api';

type TemplateType = 'TASK' | 'EVENT';
type SortField = 'name' | 'rating' | 'usageCount' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TemplateType | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdminTaskTemplate | null>(null);
  const [bulkUploadJson, setBulkUploadJson] = useState('');
  const [bulkUploadError, setBulkUploadError] = useState('');

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<CreateTemplateRequest>>({
    name: '',
    description: '',
    type: 'TASK',
    defaultStoryPoints: 1,
    icon: '📋',
    color: '#3B82F6',
    tags: [],
    suggestedSprint: null,
  });

  // Fetch templates
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: adminApi.getGlobalTemplates,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: adminApi.createGlobalTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) =>
      adminApi.updateGlobalTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      setIsEditModalOpen(false);
      setEditingTemplate(null);
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteGlobalTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: adminApi.bulkDeleteTemplates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      setSelectedIds(new Set());
    },
  });

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: (templates: CreateTemplateRequest[]) => 
      adminApi.bulkCreateTemplates(templates),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      setIsBulkUploadModalOpen(false);
      setBulkUploadJson('');
      setBulkUploadError('');
      alert(`Bulk upload complete: ${result.successCount} created, ${result.failureCount} failed`);
    },
    onError: (error: Error) => {
      setBulkUploadError(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'TASK',
      defaultStoryPoints: 1,
      icon: '📋',
      color: '#3B82F6',
      tags: [],
      suggestedSprint: null,
    });
  };

  // Filter and sort templates
  const filteredTemplates = templates
    .filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesType = typeFilter === 'all' || template.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'usageCount':
          comparison = (a.usageCount || 0) - (b.usageCount || 0);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTemplates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTemplates.map((t) => t.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCreate = () => {
    if (!formData.name) return;
    createMutation.mutate(formData as CreateTemplateRequest);
  };

  const handleEdit = (template: AdminTaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      type: template.type,
      defaultStoryPoints: template.defaultStoryPoints || 1,
      icon: template.icon || '📋',
      color: template.color || '#3B82F6',
      tags: template.tags || [],
      suggestedSprint: template.suggestedSprint,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!editingTemplate || !formData.name) return;
    updateMutation.mutate({
      id: editingTemplate.id,
      data: formData as UpdateTemplateRequest,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} templates?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleBulkUpload = () => {
    setBulkUploadError('');
    try {
      const parsed = JSON.parse(bulkUploadJson);
      const templates = Array.isArray(parsed) ? parsed : [parsed];
      
      // Validate structure
      for (const t of templates) {
        if (!t.name || !t.type) {
          throw new Error('Each template must have at least "name" and "type" fields');
        }
        if (!['TASK', 'EVENT'].includes(t.type)) {
          throw new Error('Template type must be "TASK" or "EVENT"');
        }
      }
      
      bulkCreateMutation.mutate(templates);
    } catch (e) {
      setBulkUploadError(e instanceof Error ? e.message : 'Invalid JSON format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkUploadJson(content);
    };
    reader.readAsText(file);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Stats
  const taskCount = templates.filter((t) => t.type === 'TASK').length;
  const eventCount = templates.filter((t) => t.type === 'EVENT').length;
  const totalUsage = templates.reduce((sum, t) => sum + (t.usageCount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading templates: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Templates</h1>
          <p className="text-gray-600 mt-1">Manage system-wide task and event templates</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsBulkUploadModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📤 Bulk Upload
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Template
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
          <div className="text-sm text-gray-500">Total Templates</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{taskCount}</div>
          <div className="text-sm text-gray-500">Task Templates</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">{eventCount}</div>
          <div className="text-sm text-gray-500">Event Templates</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-purple-600">{totalUsage}</div>
          <div className="text-sm text-gray-500">Total Usage</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TemplateType | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="TASK">Tasks</option>
          <option value="EVENT">Events</option>
        </select>
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            🗑️ Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredTemplates.length && filteredTemplates.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Icon</th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Points</th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rating')}
              >
                Rating {getSortIcon('rating')}
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('usageCount')}
              >
                Usage {getSortIcon('usageCount')}
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                Created {getSortIcon('createdAt')}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTemplates.map((template, index) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(template.id)}
                    onChange={() => handleSelectOne(template.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium text-sm">
                    #{index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl"
                    style={{ backgroundColor: template.color || '#E5E7EB' }}
                  >
                    {template.icon || '📋'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{template.name}</div>
                  {template.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {template.description}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.type === 'TASK'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {template.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{template.defaultStoryPoints || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-gray-600">
                      {template.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-400 text-xs">({template.ratingCount || 0})</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{template.usageCount || 0}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">
                  {new Date(template.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm || typeFilter !== 'all'
              ? 'No templates match your filters'
              : 'No templates yet. Create your first template!'}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditModalOpen ? 'Edit Template' : 'Create Template'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Template description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TemplateType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TASK">Task</option>
                    <option value="EVENT">Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.defaultStoryPoints}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultStoryPoints: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="📋"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="productivity, work, health"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suggested Sprint
                </label>
                <select
                  value={formData.suggestedSprint || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      suggestedSprint: e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="MORNING">Morning</option>
                  <option value="AFTERNOON">Afternoon</option>
                  <option value="EVENING">Evening</option>
                  <option value="ANYTIME">Anytime</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isEditModalOpen ? handleUpdate : handleCreate}
                disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : isEditModalOpen
                  ? 'Update'
                  : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Bulk Upload Templates</h2>
              <p className="text-gray-500 mt-1">Upload multiple templates at once via JSON</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload JSON File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="text-center text-gray-500">or paste JSON below</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  JSON Content
                </label>
                <textarea
                  value={bulkUploadJson}
                  onChange={(e) => setBulkUploadJson(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={12}
                  placeholder={`[
  {
    "name": "Morning Workout",
    "description": "30 minute exercise routine",
    "type": "TASK",
    "defaultStoryPoints": 3,
    "icon": "🏋️",
    "color": "#EF4444",
    "tags": ["health", "fitness"]
  }
]`}
                />
              </div>
              {bulkUploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {bulkUploadError}
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Required Fields:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    <code className="bg-gray-200 px-1 rounded">name</code> - Template name
                  </li>
                  <li>
                    <code className="bg-gray-200 px-1 rounded">type</code> - &quot;TASK&quot; or
                    &quot;EVENT&quot;
                  </li>
                </ul>
                <h4 className="font-medium text-gray-900 mb-2 mt-3">Optional Fields:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    <code className="bg-gray-200 px-1 rounded">description</code>,{' '}
                    <code className="bg-gray-200 px-1 rounded">defaultStoryPoints</code>,{' '}
                    <code className="bg-gray-200 px-1 rounded">icon</code>,{' '}
                    <code className="bg-gray-200 px-1 rounded">color</code>,{' '}
                    <code className="bg-gray-200 px-1 rounded">tags</code>,{' '}
                    <code className="bg-gray-200 px-1 rounded">suggestedSprint</code>
                  </li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsBulkUploadModalOpen(false);
                  setBulkUploadJson('');
                  setBulkUploadError('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={!bulkUploadJson || bulkCreateMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {bulkCreateMutation.isPending ? 'Uploading...' : 'Upload Templates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
