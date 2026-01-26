'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const currentSprint = {
  name: 'Week 7 - February Growth',
  startDate: '2025-02-10',
  endDate: '2025-02-16',
  progress: 65,
  tasksCompleted: 18,
  totalTasks: 28,
  storyPoints: 34,
  totalPoints: 52,
};

const sprintTasks = [
  { id: 1, title: 'Complete project proposal', priority: 'high', status: 'done', points: 5 },
  { id: 2, title: 'Review team PRs', priority: 'medium', status: 'done', points: 3 },
  { id: 3, title: 'Update documentation', priority: 'low', status: 'in_progress', points: 2 },
  { id: 4, title: 'Fix authentication bug', priority: 'high', status: 'in_progress', points: 8 },
  { id: 5, title: 'Design new dashboard', priority: 'medium', status: 'todo', points: 5 },
  { id: 6, title: 'Write unit tests', priority: 'medium', status: 'todo', points: 3 },
];

const previousSprints = [
  { week: 'Week 6', completed: 26, total: 30, velocity: 48 },
  { week: 'Week 5', completed: 24, total: 28, velocity: 45 },
  { week: 'Week 4', completed: 22, total: 25, velocity: 42 },
];

export default function SprintPage() {
  return (
    <div className="space-y-6">
      {/* Current Sprint Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 border-primary-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{currentSprint.name}</h2>
                <p className="text-slate-400">
                  {new Date(currentSprint.startDate).toLocaleDateString()} -{' '}
                  {new Date(currentSprint.endDate).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="level" className="text-lg px-4 py-2">
                🏃 In Progress
              </Badge>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-3xl font-bold text-green-400">{currentSprint.progress}%</div>
                <div className="text-sm text-slate-400">Progress</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-3xl font-bold">
                  {currentSprint.tasksCompleted}/{currentSprint.totalTasks}
                </div>
                <div className="text-sm text-slate-400">Tasks</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-3xl font-bold text-blue-400">
                  {currentSprint.storyPoints}/{currentSprint.totalPoints}
                </div>
                <div className="text-sm text-slate-400">Story Points</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-3xl font-bold text-orange-400">3</div>
                <div className="text-sm text-slate-400">Days Left</div>
              </div>
            </div>

            <Progress value={currentSprint.progress} className="h-3" />
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sprint Backlog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Sprint Backlog</h3>
            <Button variant="outline" size="sm">
              + Add Task
            </Button>
          </div>

          {['todo', 'in_progress', 'done'].map((status) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-slate-800/50 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 uppercase">
                    {status.replace('_', ' ')} ({sprintTasks.filter((t) => t.status === status).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sprintTasks
                      .filter((task) => task.status === status)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={task.status === 'done'}
                              readOnly
                              className="w-4 h-4 rounded border-white/20"
                            />
                            <span className={task.status === 'done' ? 'line-through text-slate-500' : ''}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                task.priority === 'high'
                                  ? 'destructive'
                                  : task.priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.points} pts
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sprint Stats */}
        <div className="space-y-4">
          {/* Velocity Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Velocity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {previousSprints.map((sprint) => (
                    <div key={sprint.week}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">{sprint.week}</span>
                        <span>{sprint.velocity} pts</span>
                      </div>
                      <Progress value={(sprint.velocity / 60) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                  <div className="text-2xl font-bold text-green-400">45</div>
                  <div className="text-sm text-slate-400">Avg Velocity</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Focus Areas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Focus Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { area: 'Career', tasks: 12, color: 'bg-career' },
                    { area: 'Health', tasks: 8, color: 'bg-health' },
                    { area: 'Personal Growth', tasks: 5, color: 'bg-personal_growth' },
                    { area: 'Relationships', tasks: 3, color: 'bg-relationships' },
                  ].map((area) => (
                    <div key={area.area} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${area.color}`} />
                      <span className="flex-1 text-sm">{area.area}</span>
                      <span className="text-sm text-slate-400">{area.tasks} tasks</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
