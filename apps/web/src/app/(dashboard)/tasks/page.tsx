'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, epicApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  Trash2,
  Edit3,
  ChevronDown,
  Calendar,
  Flag,
  Target,
  X,
} from 'lucide-react';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
type TaskFilter = 'all' | TaskStatus;

const LIFE_AREAS = [
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

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskApi.getAll(),
    staleTime: 30000,
  });

  // Fetch epics for task assignment
  const { data: epicsData } = useQuery({
    queryKey: ['epics'],
    queryFn: () => epicApi.getAll(),
    staleTime: 60000,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowCreateModal(false);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const tasks = tasksData || [];
  const epics = epicsData || [];

  // Filter tasks
  const filteredTasks = tasks.filter((task: any) => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group by status for kanban-like view
  const tasksByStatus = {
    TODO: filteredTasks.filter((t: any) => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter((t: any) => t.status === 'IN_PROGRESS'),
    DONE: filteredTasks.filter((t: any) => t.status === 'DONE'),
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">
            {filteredTasks.length} tasks • {tasksByStatus.DONE.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          {(['all', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              {status === 'all' ? 'All' : status === 'IN_PROGRESS' ? 'In Progress' : status === 'TODO' ? 'To Do' : 'Done'}
            </button>
          ))}
        </div>
      </div>

      {/* Task columns */}
      {isLoading ? (
        <TasksSkeleton />
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-slate-500 mt-1">
            {searchQuery ? 'Try a different search term' : 'Create your first task to get started'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 text-primary hover:text-primary/80 font-medium"
          >
            Create Task →
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* To Do Column */}
          <TaskColumn
            title="To Do"
            count={tasksByStatus.TODO.length}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
          >
            {tasksByStatus.TODO.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={() => setEditingTask(task)}
                onDelete={() => deleteTaskMutation.mutate(task.id)}
              />
            ))}
          </TaskColumn>

          {/* In Progress Column */}
          <TaskColumn
            title="In Progress"
            count={tasksByStatus.IN_PROGRESS.length}
            color="text-yellow-400"
            bgColor="bg-yellow-500/10"
          >
            {tasksByStatus.IN_PROGRESS.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={() => setEditingTask(task)}
                onDelete={() => deleteTaskMutation.mutate(task.id)}
              />
            ))}
          </TaskColumn>

          {/* Done Column */}
          <TaskColumn
            title="Done"
            count={tasksByStatus.DONE.length}
            color="text-green-400"
            bgColor="bg-green-500/10"
          >
            {tasksByStatus.DONE.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={() => setEditingTask(task)}
                onDelete={() => deleteTaskMutation.mutate(task.id)}
              />
            ))}
          </TaskColumn>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTask) && (
        <TaskModal
          task={editingTask}
          epics={epics}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTask(null);
          }}
          onSave={(data) => {
            if (editingTask) {
              updateTaskMutation.mutate({ id: editingTask.id, data });
            } else {
              createTaskMutation.mutate(data);
            }
          }}
          isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
        />
      )}
    </div>
  );
}

function TaskColumn({
  title,
  count,
  color,
  bgColor,
  children,
}: {
  title: string;
  count: number;
  color: string;
  bgColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/30 rounded-xl border border-white/10">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('w-3 h-3 rounded-full', bgColor)} />
          <h3 className="font-medium">{title}</h3>
        </div>
        <span className={cn('text-sm', color)}>{count}</span>
      </div>
      <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">{children}</div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: any;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-500 bg-red-500/10';
      case 'HIGH':
        return 'text-orange-500 bg-orange-500/10';
      case 'MEDIUM':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    TODO: 'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    DONE: 'TODO',
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onStatusChange(task.id, nextStatus[task.status as TaskStatus])}
          className="mt-0.5 hover:scale-110 transition-transform"
        >
          {getStatusIcon(task.status)}
        </button>
        <div className="flex-1 min-w-0">
          <div className={cn('font-medium', task.status === 'DONE' && 'line-through text-slate-500')}>
            {task.title}
          </div>
          {task.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.priority && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full', getPriorityColor(task.priority))}>
                {task.priority}
              </span>
            )}
            {task.storyPoints && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                {task.storyPoints} pts
              </span>
            )}
            {task.lifeArea && (
              <span className="text-xs text-slate-500">{task.lifeArea.replace('_', ' ')}</span>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
          >
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-10">
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
  );
}

function TaskModal({
  task,
  epics,
  onClose,
  onSave,
  isLoading,
}: {
  task: any;
  epics: any[];
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    storyPoints: task?.storyPoints || 1,
    lifeArea: task?.lifeArea || '',
    epicId: task?.epicId || '',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      storyPoints: Number(formData.storyPoints),
      dueDate: formData.dueDate || null,
      epicId: formData.epicId || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">{task ? 'Edit Task' : 'New Task'}</h2>
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
              placeholder="What needs to be done?"
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
              placeholder="Add more details..."
            />
          </div>

          {/* Status & Priority */}
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
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Story Points & Life Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Story Points</label>
              <input
                type="number"
                value={formData.storyPoints}
                onChange={(e) => setFormData({ ...formData, storyPoints: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="1"
                max="13"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Life Area</label>
              <select
                value={formData.lifeArea}
                onChange={(e) => setFormData({ ...formData, lifeArea: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select area...</option>
                {LIFE_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Epic & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Epic</label>
              <select
                value={formData.epicId}
                onChange={(e) => setFormData({ ...formData, epicId: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">No epic</option>
                {epics.map((epic: any) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
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
              {isLoading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((col) => (
        <div key={col} className="bg-slate-900/30 rounded-xl border border-white/10">
          <div className="p-4 border-b border-white/10">
            <div className="h-5 bg-slate-700 rounded w-24 animate-pulse" />
          </div>
          <div className="p-3 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-3 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-700" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-slate-700 rounded w-1/2 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
