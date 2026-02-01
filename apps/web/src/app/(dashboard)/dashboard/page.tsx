'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { taskApi, sprintApi, challengeApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Plus,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskApi.getAll(),
    staleTime: 30000,
    retry: 1,
  });

  // Fetch active sprint
  const { data: sprintData, isLoading: sprintLoading, error: sprintError } = useQuery({
    queryKey: ['activeSprint'],
    queryFn: () => sprintApi.getCurrent(),
    staleTime: 60000,
    retry: 1,
  });

  // Fetch challenges
  const { data: challengesData, isLoading: challengesLoading, error: challengesError } = useQuery({
    queryKey: ['myChallenges'],
    queryFn: () => challengeApi.getActive(),
    staleTime: 60000,
    retry: 1,
  });

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Dashboard data:', { tasksData, sprintData, challengesData });
    console.log('Dashboard errors:', { tasksError, sprintError, challengesError });
  }

  const tasks = tasksData || [];
  const sprint = sprintData;
  const challenges = challengesData || [];

  // Calculate stats
  const todoTasks = tasks.filter((t: any) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t: any) => t.status === 'DONE');
  const totalTasks = tasks.length;
  const completedPercent = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  // Active challenges
  const activeChallenges = challenges.filter((c: any) => c.status === 'ACTIVE').slice(0, 3);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-slate-400">
              {sprint ? (
                <>
                  {sprint.name} • <span className="text-green-400">Active</span> • {sprint.plannedPoints || 0} story points
                </>
              ) : (
                'No active sprint. Create one to track your progress!'
              )}
            </p>
          </div>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Completed"
          value={doneTasks.length}
          subvalue={`of ${totalTasks} tasks`}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="In Progress"
          value={inProgressTasks.length}
          subvalue="tasks active"
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="To Do"
          value={todoTasks.length}
          subvalue="tasks remaining"
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Challenges"
          value={activeChallenges.length}
          subvalue="active"
          color="text-orange-400"
          bgColor="bg-orange-500/10"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-slate-900/50 rounded-xl border border-white/10">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="font-semibold">Recent Tasks</h2>
            <Link href="/tasks" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            {tasksLoading ? (
              <TaskSkeleton />
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="w-10 h-10 text-slate-600" />}
                title="No tasks yet"
                description="Create your first task to get started"
                actionLabel="Create Task"
                actionHref="/tasks"
              />
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task: any) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Challenges */}
        <div className="bg-slate-900/50 rounded-xl border border-white/10">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="font-semibold">Active Challenges</h2>
            <Link href="/challenges" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              Browse <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4">
            {challengesLoading ? (
              <ChallengeSkeleton />
            ) : activeChallenges.length === 0 ? (
              <EmptyState
                icon={<Flame className="w-10 h-10 text-slate-600" />}
                title="No active challenges"
                description="Join a challenge to build better habits"
                actionLabel="Browse Challenges"
                actionHref="/challenges"
              />
            ) : (
              <div className="space-y-3">
                {activeChallenges.map((challenge: any) => (
                  <ChallengeItem key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction href="/tasks" icon={<Plus />} label="New Task" />
          <QuickAction href="/challenges" icon={<Flame />} label="Start Challenge" />
          <QuickAction href="/community" icon={<Sparkles />} label="Community" />
          <QuickAction href="/calendar" icon={<Calendar />} label="Calendar" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subvalue,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subvalue: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', bgColor, color)}>
        {icon}
      </div>
      <div className={cn('text-3xl font-bold', color)}>{value}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
      <div className="text-xs text-slate-500">{subvalue}</div>
    </div>
  );
}

function TaskItem({ task }: { task: any }) {
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

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      {getStatusIcon(task.status)}
      <div className="flex-1 min-w-0">
        <div className={cn('font-medium truncate', task.status === 'DONE' && 'line-through text-slate-500')}>
          {task.title}
        </div>
        {task.lifeArea && <div className="text-xs text-slate-500">{task.lifeArea}</div>}
      </div>
      {task.storyPoints && (
        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
          {task.storyPoints} pts
        </span>
      )}
    </div>
  );
}

function ChallengeItem({ challenge }: { challenge: any }) {
  const progress = challenge.currentStreak || 0;
  const total = challenge.targetDays || 30;
  const percent = Math.min((progress / total) * 100, 100);

  return (
    <div className="p-4 rounded-lg bg-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{challenge.emoji || '🎯'}</span>
          <span className="font-medium">{challenge.title}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-300">
          {progress}/{total} days
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-2">{total - progress} days remaining</div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all text-center"
    >
      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {icon}
      <h3 className="font-medium mt-3">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
      <Link
        href={actionHref}
        className="mt-4 text-sm text-primary hover:text-primary/80 font-medium"
      >
        {actionLabel} →
      </Link>
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 animate-pulse">
          <div className="w-5 h-5 rounded-full bg-slate-700" />
          <div className="flex-1">
            <div className="h-4 bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-700 rounded w-1/4 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChallengeSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="p-4 rounded-lg bg-white/5 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-slate-700" />
            <div className="h-4 bg-slate-700 rounded w-1/2" />
          </div>
          <div className="h-2 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}
