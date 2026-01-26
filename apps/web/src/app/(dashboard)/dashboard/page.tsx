'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const stats = [
  { label: 'Sprint Progress', value: 67, max: 100, unit: '%', icon: '🏃', color: 'text-blue-400' },
  { label: 'Tasks Done', value: 12, max: 18, unit: '', icon: '✅', color: 'text-green-400' },
  { label: 'Current Streak', value: 45, max: 0, unit: ' days', icon: '🔥', color: 'text-orange-400' },
  { label: 'Story Points', value: 28, max: 42, unit: ' pts', icon: '📊', color: 'text-purple-400' },
];

const activeChallenges = [
  { name: 'Morning Routine', progress: 23, total: 30, emoji: '🌅' },
  { name: 'Daily Meditation', progress: 15, total: 30, emoji: '🧘' },
  { name: 'Read 10 Books', progress: 4, total: 10, emoji: '📚' },
];

const recentTasks = [
  { title: 'Review Q1 goals', points: 3, status: 'done', area: 'Career' },
  { title: 'Morning workout', points: 2, status: 'done', area: 'Health' },
  { title: 'Team standup meeting', points: 1, status: 'in_progress', area: 'Career' },
  { title: 'Read 30 minutes', points: 2, status: 'todo', area: 'Growth' },
  { title: 'Family dinner planning', points: 2, status: 'todo', area: 'Relationships' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Good morning, John! 👋</h2>
            <p className="text-slate-400">
              Week 4 Sprint • <span className="text-green-400">On track</span> • 6 days remaining
            </p>
          </div>
          <Button variant="gradient" asChild>
            <Link href="/dashboard/sprint">View Sprint →</Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  {stat.max > 0 && (
                    <span className="text-xs text-slate-500">
                      {stat.value}/{stat.max}
                    </span>
                  )}
                </div>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}{stat.unit}
                </div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                {stat.max > 0 && (
                  <Progress value={(stat.value / stat.max) * 100} className="h-1.5 mt-3" />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Today's Tasks</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/tasks">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        task.status === 'done'
                          ? 'bg-green-500 border-green-500'
                          : task.status === 'in_progress'
                          ? 'border-yellow-500'
                          : 'border-slate-500'
                      }`}
                    >
                      {task.status === 'done' && <span className="text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-500">{task.area}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {task.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Challenges */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Active Challenges</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/challenges">Browse</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeChallenges.map((challenge, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{challenge.emoji}</span>
                        <span className="font-medium">{challenge.name}</span>
                      </div>
                      <Badge variant="outline" className="border-white/20">
                        {challenge.progress}/{challenge.total}
                      </Badge>
                    </div>
                    <Progress
                      value={(challenge.progress / challenge.total) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-slate-500 mt-2">
                      {challenge.total - challenge.progress} days remaining
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Life Wheel Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Life Balance This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {[
                { name: 'Health', value: 75, emoji: '💪', color: '#22c55e' },
                { name: 'Career', value: 90, emoji: '💼', color: '#3b82f6' },
                { name: 'Spiritual', value: 45, emoji: '🧘', color: '#eab308' },
                { name: 'Growth', value: 80, emoji: '🌱', color: '#a855f7' },
                { name: 'Relations', value: 55, emoji: '❤️', color: '#ec4899' },
                { name: 'Social', value: 40, emoji: '🎉', color: '#f97316' },
                { name: 'Fun', value: 35, emoji: '🎮', color: '#14b8a6' },
                { name: 'Home', value: 60, emoji: '🏡', color: '#84cc16' },
              ].map((area) => (
                <div key={area.name} className="text-center">
                  <div
                    className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl mb-2"
                    style={{ backgroundColor: `${area.color}20` }}
                  >
                    {area.emoji}
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{area.name}</div>
                  <div className="text-sm font-semibold" style={{ color: area.color }}>
                    {area.value}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
