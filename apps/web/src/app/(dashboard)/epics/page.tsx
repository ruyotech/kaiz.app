'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { epicApi, taskApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Target,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  Edit3,
  Trash2,
  X,
  Calendar,
} from 'lucide-react';

export default function EpicsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEpic, setEditingEpic] = useState<any>(null);
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);

  // Fetch epics
  const { data: epicsData, isLoading } = useQuery({
    queryKey: ['epics'],
    queryFn: () => epicApi.getAll(),
    staleTime: 30000,
  });

  // Create epic mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => epicApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] });
      setShowCreateModal(false);
    },
  });

  // Update epic mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => epicApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] });
      setEditingEpic(null);
    },
  });

  // Delete epic mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => epicApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epics'] });
    },
  });

  const epics = epicsData || [];

  // Filter epics
  const filteredEpics = epics.filter((epic: any) => {
    return (
      !searchQuery ||
      epic.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group by status
  const activeEpics = filteredEpics.filter((e: any) => e.status === 'IN_PROGRESS' || e.status === 'TODO');
  const completedEpics = filteredEpics.filter((e: any) => e.status === 'DONE');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Epics</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filteredEpics.length} epics • {completedEpics.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          New Epic
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search epics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Epics List */}
      {isLoading ? (
        <EpicsSkeleton />
      ) : filteredEpics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium">No epics found</h3>
          <p className="text-slate-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'Create your first epic to organize tasks'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-primary hover:text-primary/80 font-medium"
          >
            Create Epic →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Epics */}
          {activeEpics.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
                Active ({activeEpics.length})
              </h2>
              <div className="space-y-3">
                {activeEpics.map((epic: any) => (
                  <EpicCard
                    key={epic.id}
                    epic={epic}
                    isExpanded={expandedEpic === epic.id}
                    onToggle={() => setExpandedEpic(expandedEpic === epic.id ? null : epic.id)}
                    onEdit={() => setEditingEpic(epic)}
                    onDelete={() => deleteMutation.mutate(epic.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Epics */}
          {completedEpics.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
                Completed ({completedEpics.length})
              </h2>
              <div className="space-y-3">
                {completedEpics.map((epic: any) => (
                  <EpicCard
                    key={epic.id}
                    epic={epic}
                    isExpanded={expandedEpic === epic.id}
                    onToggle={() => setExpandedEpic(expandedEpic === epic.id ? null : epic.id)}
                    onEdit={() => setEditingEpic(epic)}
                    onDelete={() => deleteMutation.mutate(epic.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingEpic) && (
        <EpicModal
          epic={editingEpic}
          onClose={() => {
            setShowCreateModal(false);
            setEditingEpic(null);
          }}
          onSave={(data) => {
            if (editingEpic) {
              updateMutation.mutate({ id: editingEpic.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function EpicCard({
  epic,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  epic: any;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const tasks = epic.tasks || [];
  const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'text-green-500 bg-green-500/10';
      case 'IN_PROGRESS':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="mt-1"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl">{epic.emoji || '🎯'}</span>
              <h3 className={cn('font-semibold', epic.status === 'DONE' && 'line-through text-slate-500')}>
                {epic.title}
              </h3>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(epic.status))}>
                {epic.status?.replace('_', ' ')}
              </span>
            </div>

            {epic.description && (
              <p className="text-sm text-slate-400 mb-3 line-clamp-1">{epic.description}</p>
            )}

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-slate-400">
                {completedTasks}/{totalTasks} tasks
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              {epic.lifeArea && (
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {epic.lifeArea.replace('_', ' ')}
                </span>
              )}
              {epic.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(epic.dueDate).toLocaleDateString()}
                </span>
              )}
              {epic.totalStoryPoints && (
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  {epic.totalStoryPoints} pts
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
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
        </div>
      </div>

      {/* Expanded tasks list */}
      {isExpanded && tasks.length > 0 && (
        <div className="border-t border-white/10 bg-slate-800/30 p-4">
          <div className="space-y-2">
            {tasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"
              >
                {task.status === 'DONE' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : task.status === 'IN_PROGRESS' ? (
                  <Clock className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500" />
                )}
                <span className={cn('flex-1 text-sm', task.status === 'DONE' && 'line-through text-slate-500')}>
                  {task.title}
                </span>
                {task.storyPoints && (
                  <span className="text-xs text-slate-500">{task.storyPoints} pts</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EpicModal({
  epic,
  onClose,
  onSave,
  isLoading,
}: {
  epic: any;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: epic?.title || '',
    description: epic?.description || '',
    emoji: epic?.emoji || '🎯',
    status: epic?.status || 'TODO',
    lifeArea: epic?.lifeArea || '',
    dueDate: epic?.dueDate ? epic.dueDate.split('T')[0] : '',
  });

  const emojis = ['🎯', '🚀', '💼', '📚', '💪', '🎨', '🌱', '⭐', '🔥', '💡'];
  const lifeAreas = [
    'CAREER',
    'HEALTH',
    'RELATIONSHIPS',
    'PERSONAL_GROWTH',
    'FINANCE',
    'SPIRITUAL',
    'SOCIAL',
    'FUN',
    'HOME',
    'FAMILY',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      dueDate: formData.dueDate || null,
      lifeArea: formData.lifeArea || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">{epic ? 'Edit Epic' : 'New Epic'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium mb-2">Emoji</label>
            <div className="flex gap-2 flex-wrap">
              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setFormData({ ...formData, emoji: e })}
                  className={cn(
                    'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                    formData.emoji === e ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., Launch New Product"
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
              placeholder="What's the goal of this epic?"
            />
          </div>

          {/* Status & Life Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Life Area</label>
              <select
                value={formData.lifeArea}
                onChange={(e) => setFormData({ ...formData, lifeArea: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select area...</option>
                {lifeAreas.map((area) => (
                  <option key={area} value={area}>
                    {area.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
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
              {isLoading ? 'Saving...' : epic ? 'Save Changes' : 'Create Epic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EpicsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-900/50 rounded-xl border border-white/10 p-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-5 h-5 rounded bg-slate-700" />
            <div className="flex-1">
              <div className="h-5 bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-2 bg-slate-700 rounded w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
