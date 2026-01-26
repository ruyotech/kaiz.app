'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LIFE_WHEEL_AREAS } from '@/types';

const tasksData = [
  { id: 1, title: 'Morning workout routine', area: 'health', priority: 'do', status: 'done', dueDate: '2025-02-11' },
  { id: 2, title: 'Prepare presentation for client', area: 'career', priority: 'do', status: 'in_progress', dueDate: '2025-02-11' },
  { id: 3, title: 'Call mom for birthday', area: 'relationships', priority: 'schedule', status: 'todo', dueDate: '2025-02-12' },
  { id: 4, title: 'Volunteer at community event', area: 'contribution', priority: 'schedule', status: 'todo', dueDate: '2025-02-13' },
  { id: 5, title: 'Read 20 pages of book', area: 'personal_growth', priority: 'delegate', status: 'todo', dueDate: '2025-02-11' },
  { id: 6, title: 'Plan weekend hiking trip', area: 'fun_recreation', priority: 'eliminate', status: 'todo', dueDate: '2025-02-14' },
  { id: 7, title: 'Organize home office', area: 'physical_environment', priority: 'delegate', status: 'todo', dueDate: '2025-02-15' },
  { id: 8, title: 'Volunteer at food bank', area: 'contribution', priority: 'schedule', status: 'todo', dueDate: '2025-02-16' },
];

const priorityColors = {
  do: 'bg-red-500/20 border-red-500/50 text-red-400',
  schedule: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  delegate: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  eliminate: 'bg-gray-500/20 border-gray-500/50 text-gray-400',
};

const priorityLabels = {
  do: '🔥 Do First',
  schedule: '📅 Schedule',
  delegate: '👥 Delegate',
  eliminate: '🗑️ Eliminate',
};

export default function TasksPage() {
  const [view, setView] = useState<'list' | 'matrix'>('list');
  const [search, setSearch] = useState('');
  const [filterArea, setFilterArea] = useState<string | null>(null);

  const filteredTasks = tasksData.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesArea = !filterArea || task.area === filterArea;
    return matchesSearch && matchesArea;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <p className="text-slate-400">Manage your tasks across all life areas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            📋 List
          </Button>
          <Button
            variant={view === 'matrix' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('matrix')}
          >
            📊 Matrix
          </Button>
          <Button variant="gradient">+ New Task</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs bg-slate-700/50 border-white/10"
            />
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!filterArea ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterArea(null)}
              >
                All
              </Button>
              {Object.entries(LIFE_WHEEL_AREAS).slice(0, 4).map(([id, area]) => (
                <Button
                  key={id}
                  variant={filterArea === id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterArea(id)}
                >
                  {area.icon} {area.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {view === 'list' ? (
        /* List View */
        <Card className="bg-slate-800/50 border-white/10">
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {filteredTasks.map((task, index) => {
                const area = LIFE_WHEEL_AREAS[task.area as keyof typeof LIFE_WHEEL_AREAS];
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      readOnly
                      className="w-5 h-5 rounded border-white/20"
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: area?.color }}
                    />
                    <div className="flex-1">
                      <div className={cn(task.status === 'done' && 'line-through text-slate-500')}>
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {area?.name} • Due {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={cn('border', priorityColors[task.priority as keyof typeof priorityColors])}>
                      {priorityLabels[task.priority as keyof typeof priorityLabels]}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Matrix View (Eisenhower) */
        <div className="grid md:grid-cols-2 gap-4">
          {(['do', 'schedule', 'delegate', 'eliminate'] as const).map((priority) => (
            <motion.div
              key={priority}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className={cn('border-2', priorityColors[priority])}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {priorityLabels[priority]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredTasks
                      .filter((task) => task.priority === priority)
                      .map((task) => {
                        const area = LIFE_WHEEL_AREAS[task.area as keyof typeof LIFE_WHEEL_AREAS];
                        return (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                          >
                            <input
                              type="checkbox"
                              checked={task.status === 'done'}
                              readOnly
                              className="w-4 h-4 rounded"
                            />
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: area?.color }}
                            />
                            <span className={cn('flex-1 text-sm', task.status === 'done' && 'line-through text-slate-500')}>
                              {task.title}
                            </span>
                          </div>
                        );
                      })}
                    {filteredTasks.filter((t) => t.priority === priority).length === 0 && (
                      <div className="text-center text-slate-500 py-4">No tasks</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
