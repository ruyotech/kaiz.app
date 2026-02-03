'use client';

import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, AdminTaskTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '@/lib/api';

type TemplateType = 'TASK' | 'EVENT';
type SortField = 'name' | 'rating' | 'usageCount' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type BulkUploadMode = 'csv' | 'json';

// Life Wheel Areas matching backend
const LIFE_WHEEL_AREAS = [
  { id: 'life-health', name: 'Health', icon: '💪' },
  { id: 'life-career', name: 'Career', icon: '💼' },
  { id: 'life-finance', name: 'Finance', icon: '💰' },
  { id: 'life-family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'life-romance', name: 'Romance', icon: '❤️' },
  { id: 'life-friends', name: 'Friends', icon: '👥' },
  { id: 'life-growth', name: 'Growth', icon: '📚' },
  { id: 'life-fun', name: 'Fun', icon: '🎉' },
  { id: 'life-environment', name: 'Environment', icon: '🌍' },
];



interface ParsedTemplate {
  data: Partial<CreateTemplateRequest>;
  errors: string[];
  isValid: boolean;
  rowNumber: number;
}

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
  const [bulkUploadMode, setBulkUploadMode] = useState<BulkUploadMode>('csv');
  const [parsedTemplates, setParsedTemplates] = useState<ParsedTemplate[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [csvContent, setCsvContent] = useState('');


  // Form state for create/edit - simplified template fields
  const [formData, setFormData] = useState<Partial<CreateTemplateRequest>>({
    name: '',
    description: '', // Used as usage guide/info
    type: 'TASK',
    defaultLifeWheelAreaId: undefined,
    icon: '📋',
    color: '#3B82F6',
    tags: [],
  });

  // Fetch templates
  const { data: templates = [], isLoading, error } = useQuery<AdminTaskTemplate[]>({
    queryKey: ['admin-templates'],
    queryFn: () => adminApi.getGlobalTemplates(),
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
      alert(`Bulk upload complete: ${result.successCount} created, ${result.failedCount} failed`);
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
      defaultLifeWheelAreaId: undefined,
      icon: '📋',
      color: '#3B82F6',
      tags: [],
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
    // Populate essential fields from the template
    setFormData({
      name: template.name,
      description: template.description || '', // Usage guide/info
      type: template.type,
      defaultLifeWheelAreaId: template.defaultLifeWheelAreaId || undefined,
      icon: template.icon || '📋',
      color: template.color || '#3B82F6',
      tags: template.tags || [],
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

  // CSV Template Generator
  const downloadCsvTemplate = () => {
    const headers = ['name', 'description', 'type', 'defaultStoryPoints', 'icon', 'color', 'tags', 'suggestedSprint'];
    const sampleRows = [
      ['Morning Workout', '30 minute exercise routine', 'TASK', '3', '🏋️', '#EF4444', 'health,fitness', 'CURRENT'],
      ['Weekly Planning', 'Plan the week ahead', 'TASK', '2', '📅', '#3B82F6', 'productivity,planning', 'NEXT'],
      ['Team Standup', 'Daily team sync meeting', 'EVENT', '1', '👥', '#10B981', 'meetings,team', 'BACKLOG'],
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_bulk_upload.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV Parser
  const parseCSV = (content: string): ParsedTemplate[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const results: ParsedTemplate[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const errors: string[] = [];
      const data: Partial<CreateTemplateRequest> = {};

      // Map CSV columns to template fields
      headers.forEach((header, idx) => {
        const value = values[idx]?.trim() || '';
        switch (header) {
          case 'name':
            data.name = value;
            if (!value) errors.push('Name is required');
            break;
          case 'description':
            data.description = value;
            break;
          case 'type':
            if (value && !['TASK', 'EVENT'].includes(value.toUpperCase())) {
              errors.push('Type must be TASK or EVENT');
            } else if (!value) {
              errors.push('Type is required');
            } else {
              data.type = value.toUpperCase() as 'TASK' | 'EVENT';
            }
            break;
          case 'defaultstorypoints':
          case 'storypoints':
          case 'points':
            const points = parseInt(value);
            if (value && isNaN(points)) {
              errors.push('Story points must be a number');
            } else if (value) {
              data.defaultStoryPoints = points;
            }
            break;
          case 'icon':
            data.icon = value || '📋';
            break;
          case 'color':
            if (value && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
              errors.push('Color must be hex format (e.g., #3B82F6)');
            } else {
              data.color = value || '#3B82F6';
            }
            break;
          case 'tags':
            data.tags = value ? value.split(/[;,]/).map(t => t.trim()).filter(Boolean) : [];
            break;
          case 'suggestedsprint':
          case 'sprint':
            if (value && !['CURRENT', 'NEXT', 'BACKLOG'].includes(value.toUpperCase())) {
              errors.push('Sprint must be CURRENT, NEXT, or BACKLOG');
            } else if (value) {
              data.suggestedSprint = value.toUpperCase() as 'CURRENT' | 'NEXT' | 'BACKLOG';
            }
            break;
        }
      });

      results.push({
        data,
        errors,
        isValid: errors.length === 0,
        rowNumber: i + 1,
      });
    }

    return results;
  };

  // Helper to parse CSV line (handles quoted values)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  // Validation summary
  const validationSummary = useMemo(() => {
    const valid = parsedTemplates.filter(t => t.isValid).length;
    const invalid = parsedTemplates.filter(t => !t.isValid).length;
    return { valid, invalid, total: parsedTemplates.length };
  }, [parsedTemplates]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const isCSV = file.name.endsWith('.csv');

      if (isCSV) {
        setCsvContent(content);
        setBulkUploadMode('csv');
        const parsed = parseCSV(content);
        setParsedTemplates(parsed);
        setShowPreview(true);
        setBulkUploadError('');
      } else {
        setBulkUploadJson(content);
        setBulkUploadMode('json');
        setShowPreview(false);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvUpload = () => {
    const validTemplates = parsedTemplates
      .filter(t => t.isValid)
      .map(t => t.data as CreateTemplateRequest);

    if (validTemplates.length === 0) {
      setBulkUploadError('No valid templates to upload. Please fix errors and try again.');
      return;
    }

    bulkCreateMutation.mutate(validTemplates);
  };

  const resetBulkUpload = () => {
    setIsBulkUploadModalOpen(false);
    setBulkUploadJson('');
    setBulkUploadError('');
    setCsvContent('');
    setParsedTemplates([]);
    setShowPreview(false);
    setBulkUploadMode('csv');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Life Wheel</th>
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
                    className={`px-2 py-1 rounded-full text-xs font-medium ${template.type === 'TASK'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                      }`}
                  >
                    {template.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {template.defaultLifeWheelAreaId ? (
                    <span className="text-sm">
                      {LIFE_WHEEL_AREAS.find(a => a.id === template.defaultLifeWheelAreaId)?.icon || '🎯'}{' '}
                      {LIFE_WHEEL_AREAS.find(a => a.id === template.defaultLifeWheelAreaId)?.name || template.defaultLifeWheelAreaId}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
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
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditModalOpen ? 'Edit Template' : 'Create Template'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Guide / Info
                  <span className="text-gray-400 font-normal ml-1">(explains why & how to use this template)</span>
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  rows={4}
                  placeholder="Example: Use this template to track your daily morning workout. Best to schedule it first thing in the morning before checking emails. Aim for consistency over intensity."
                />
              </div>

              {/* Type and Life Wheel Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type || 'TASK'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TemplateType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="TASK">Task</option>
                    <option value="EVENT">Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Life Wheel Area</label>
                  <select
                    value={formData.defaultLifeWheelAreaId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultLifeWheelAreaId: e.target.value || undefined })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select area...</option>
                    {LIFE_WHEEL_AREAS.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.icon} {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon and Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="📋"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    value={formData.color || '#3B82F6'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Tags */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="productivity, work, health"
                />
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
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bulk Upload Templates</h2>
                <p className="text-gray-500 mt-1">Upload multiple templates via CSV or JSON</p>
              </div>
              <button
                onClick={downloadCsvTemplate}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
              >
                📥 Download CSV Template
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="px-6 pt-4 border-b">
              <div className="flex gap-4">
                <button
                  onClick={() => { setBulkUploadMode('csv'); setShowPreview(false); setParsedTemplates([]); }}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${bulkUploadMode === 'csv'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  📊 CSV Upload (Recommended)
                </button>
                <button
                  onClick={() => { setBulkUploadMode('json'); setShowPreview(false); setParsedTemplates([]); }}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${bulkUploadMode === 'json'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {'{ }'} JSON Upload (Advanced)
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload {bulkUploadMode.toUpperCase()} File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={bulkUploadMode === 'csv' ? '.csv' : '.json'}
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>

              {/* CSV Preview Mode */}
              {bulkUploadMode === 'csv' && showPreview && parsedTemplates.length > 0 && (
                <div className="space-y-4">
                  {/* Validation Summary */}
                  <div className="flex gap-4">
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-700">{validationSummary.valid}</div>
                      <div className="text-sm text-green-600">Valid rows</div>
                    </div>
                    <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-700">{validationSummary.invalid}</div>
                      <div className="text-sm text-red-600">Rows with errors</div>
                    </div>
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-700">{validationSummary.total}</div>
                      <div className="text-sm text-gray-600">Total rows</div>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-500">Row</th>
                            <th className="px-3 py-2 text-left text-gray-500">Status</th>
                            <th className="px-3 py-2 text-left text-gray-500">Name</th>
                            <th className="px-3 py-2 text-left text-gray-500">Type</th>
                            <th className="px-3 py-2 text-left text-gray-500">Points</th>
                            <th className="px-3 py-2 text-left text-gray-500">Errors</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {parsedTemplates.map((t) => (
                            <tr key={t.rowNumber} className={t.isValid ? 'bg-white' : 'bg-red-50'}>
                              <td className="px-3 py-2 text-gray-500">#{t.rowNumber}</td>
                              <td className="px-3 py-2">
                                {t.isValid ? (
                                  <span className="text-green-600">✓</span>
                                ) : (
                                  <span className="text-red-600">✗</span>
                                )}
                              </td>
                              <td className="px-3 py-2 font-medium">{t.data.name || '-'}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded text-xs ${t.data.type === 'TASK' ? 'bg-blue-100 text-blue-700' :
                                    t.data.type === 'EVENT' ? 'bg-green-100 text-green-700' :
                                      'bg-gray-100 text-gray-500'
                                  }`}>
                                  {t.data.type || 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-2">{t.data.defaultStoryPoints || '-'}</td>
                              <td className="px-3 py-2 text-red-600 text-xs">
                                {t.errors.join(', ') || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* JSON Mode */}
              {bulkUploadMode === 'json' && (
                <>
                  <div className="text-center text-gray-500">or paste JSON below</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      JSON Content
                    </label>
                    <textarea
                      value={bulkUploadJson}
                      onChange={(e) => setBulkUploadJson(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={10}
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
                </>
              )}

              {bulkUploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {bulkUploadError}
                </div>
              )}

              {/* Help Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Column Reference:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div><code className="bg-gray-200 px-1 rounded">name</code> - Required</div>
                  <div><code className="bg-gray-200 px-1 rounded">type</code> - TASK or EVENT (required)</div>
                  <div><code className="bg-gray-200 px-1 rounded">description</code> - Optional</div>
                  <div><code className="bg-gray-200 px-1 rounded">defaultStoryPoints</code> - Number</div>
                  <div><code className="bg-gray-200 px-1 rounded">icon</code> - Emoji</div>
                  <div><code className="bg-gray-200 px-1 rounded">color</code> - Hex (#RRGGBB)</div>
                  <div><code className="bg-gray-200 px-1 rounded">tags</code> - Comma-separated</div>
                  <div><code className="bg-gray-200 px-1 rounded">suggestedSprint</code> - CURRENT/NEXT/BACKLOG</div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <button
                onClick={resetBulkUpload}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <div className="flex gap-3">
                {bulkUploadMode === 'csv' && showPreview && validationSummary.invalid > 0 && (
                  <span className="flex items-center text-sm text-amber-600">
                    ⚠️ {validationSummary.invalid} rows will be skipped
                  </span>
                )}
                <button
                  onClick={bulkUploadMode === 'csv' ? handleCsvUpload : handleBulkUpload}
                  disabled={
                    (bulkUploadMode === 'csv' && validationSummary.valid === 0) ||
                    (bulkUploadMode === 'json' && !bulkUploadJson) ||
                    bulkCreateMutation.isPending
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkCreateMutation.isPending
                    ? 'Uploading...'
                    : bulkUploadMode === 'csv' && showPreview
                      ? `Upload ${validationSummary.valid} Valid Templates`
                      : 'Upload Templates'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
