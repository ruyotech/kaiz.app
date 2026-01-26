'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, formatRelativeTime, getActivityIcon, getInitials, getStreakEmoji } from '@/lib/utils';

// Mock data generators
const generateLiveActivity = () => {
  const activities = [
    { type: 'sprint_completed', title: 'completed Week 4 sprint', user: 'Sarah M.', avatar: 'sarah-m', points: 28 },
    { type: 'challenge_completed', title: 'finished 30-Day Meditation', user: 'Alex K.', avatar: 'alex-k', streak: 30 },
    { type: 'badge_earned', title: 'earned Velocity Master badge', user: 'Jordan P.', avatar: 'jordan-p' },
    { type: 'streak_milestone', title: 'hit a 100-day streak!', user: 'Emma L.', avatar: 'emma-l', streak: 100 },
    { type: 'level_up', title: 'reached Level 15', user: 'Mike R.', avatar: 'mike-r', level: 15 },
    { type: 'challenge_joined', title: 'joined Morning Routine Challenge', user: 'Lisa T.', avatar: 'lisa-t' },
    { type: 'sprint_completed', title: 'crushed 35 story points!', user: 'David W.', avatar: 'david-w', points: 35 },
    { type: 'badge_earned', title: 'became a Community Mentor', user: 'Nina S.', avatar: 'nina-s' },
  ];
  const activity = activities[Math.floor(Math.random() * activities.length)];
  return { id: Date.now(), ...activity, timestamp: new Date().toISOString() };
};

const leaderboardData = [
  { rank: 1, name: 'Sarah Mitchell', avatar: 'sarah-m', points: 4850, streak: 127, level: 24 },
  { rank: 2, name: 'Alex Kozlov', avatar: 'alex-k', points: 4620, streak: 89, level: 22 },
  { rank: 3, name: 'Emma Liu', avatar: 'emma-l', points: 4410, streak: 156, level: 21 },
  { rank: 4, name: 'Jordan Peters', avatar: 'jordan-p', points: 4180, streak: 45, level: 20 },
  { rank: 5, name: 'Mike Roberts', avatar: 'mike-r', points: 3920, streak: 67, level: 19 },
  { rank: 6, name: 'Lisa Thompson', avatar: 'lisa-t', points: 3780, streak: 34, level: 18 },
  { rank: 7, name: 'David Wilson', avatar: 'david-w', points: 3650, streak: 56, level: 18 },
  { rank: 8, name: 'Nina Singh', avatar: 'nina-s', points: 3520, streak: 78, level: 17 },
  { rank: 9, name: 'Chris Lee', avatar: 'chris-l', points: 3410, streak: 23, level: 16 },
  { rank: 10, name: 'Maria Garcia', avatar: 'maria-g', points: 3290, streak: 41, level: 16 },
];

const trendingChallenges = [
  { id: 1, name: '30-Day Morning Routine', emoji: '🌅', participants: 1247, progress: 78, color: 'from-orange-500 to-pink-500' },
  { id: 2, name: 'Read 10 Books', emoji: '📚', participants: 892, progress: 45, color: 'from-purple-500 to-blue-500' },
  { id: 3, name: 'Zero Inbox Sprint', emoji: '📧', participants: 634, progress: 92, color: 'from-blue-500 to-cyan-500' },
  { id: 4, name: 'Daily Meditation', emoji: '🧘', participants: 1567, progress: 63, color: 'from-green-500 to-teal-500' },
  { id: 5, name: 'Run 100 Miles', emoji: '🏃', participants: 456, progress: 31, color: 'from-red-500 to-orange-500' },
  { id: 6, name: 'Learn a Language', emoji: '🌍', participants: 789, progress: 54, color: 'from-indigo-500 to-purple-500' },
];

const successStories = [
  {
    id: 1,
    author: 'Jessica Chen',
    avatar: 'jessica-c',
    title: 'From Chaos to Clarity',
    excerpt: 'I went from forgetting appointments to running my life like a CEO. The weekly sprint system changed everything.',
    metrics: { sprints: 26, goals: 18, streak: 184 },
    likes: 847,
  },
  {
    id: 2,
    author: 'Marcus Thompson',
    avatar: 'marcus-t',
    title: 'Lost 30 lbs While Building My Startup',
    excerpt: 'Story points for workouts. Sprint goals for health. Kaiz helped me balance career ambition with personal wellbeing.',
    metrics: { sprints: 24, goals: 12, streak: 90 },
    likes: 1203,
  },
  {
    id: 3,
    author: 'Priya Sharma',
    avatar: 'priya-s',
    title: 'How I Finally Wrote My Book',
    excerpt: 'Breaking down "write a book" into weekly sprints made the impossible feel achievable. 12 weeks later: 65,000 words.',
    metrics: { sprints: 12, goals: 8, streak: 84 },
    likes: 956,
  },
];

export default function CommunityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'leaderboard' | 'challenges' | 'stories'>('activity');
  const [onlineCount, setOnlineCount] = useState(2847);

  // Simulate live activity feed
  useEffect(() => {
    // Initial activities
    setActivities(Array.from({ length: 10 }, generateLiveActivity));

    const interval = setInterval(() => {
      setActivities(prev => [generateLiveActivity(), ...prev.slice(0, 19)]);
      setOnlineCount(prev => prev + Math.floor(Math.random() * 10) - 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-6"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-green-400 font-medium">{onlineCount.toLocaleString()} people online now</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            The <span className="gradient-text-animated">Achievers</span> Community
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto"
          >
            Join 12,847+ people who support each other's journey. Find accountability partners, 
            join challenges, and celebrate every win.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button size="lg" variant="gradient" asChild>
              <Link href="/register">Join the Community</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20">
              Watch What's Happening ↓
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-800/50 rounded-xl p-1 gap-1">
            {[
              { id: 'activity', label: '🔴 Live Feed', count: activities.length },
              { id: 'leaderboard', label: '🏆 Leaderboard' },
              { id: 'challenges', label: '🎯 Challenges', count: trendingChallenges.length },
              { id: 'stories', label: '✨ Success Stories' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-6 py-3 rounded-lg font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-2 text-xs opacity-70">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* Live Activity Feed */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="font-semibold">Live Activity Stream</span>
                  </div>
                  <span className="text-sm text-slate-400">Real-time updates</span>
                </div>

                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          'flex items-center gap-4 p-4 hover:bg-white/5 transition-colors',
                          index === 0 && 'bg-primary-500/10'
                        )}
                      >
                        <Avatar className="h-12 w-12 ring-2 ring-white/10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.avatar}`} />
                          <AvatarFallback>{getInitials(activity.user)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-semibold text-white">{activity.user}</span>
                            <span className="text-slate-400"> {activity.title}</span>
                          </p>
                          <p className="text-xs text-slate-500">{formatRelativeTime(activity.timestamp)}</p>
                        </div>

                        <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Join CTA */}
              <div className="mt-8 text-center">
                <p className="text-slate-400 mb-4">Want to see your wins here?</p>
                <Button variant="gradient" size="lg" asChild>
                  <Link href="/register">Join the Community →</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Leaderboard */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">🏆 Weekly Champions</h2>
                      <p className="text-slate-400">Top performers this week</p>
                    </div>
                    <Badge variant="streak">Resets Sunday</Badge>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {leaderboardData.map((entry, index) => (
                    <motion.div
                      key={entry.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'flex items-center gap-4 p-4 hover:bg-white/5 transition-colors',
                        entry.rank === 1 && 'bg-gradient-to-r from-yellow-500/10 to-transparent',
                        entry.rank === 2 && 'bg-gradient-to-r from-slate-400/10 to-transparent',
                        entry.rank === 3 && 'bg-gradient-to-r from-orange-500/10 to-transparent'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                        entry.rank === 1 && 'bg-yellow-500/20 text-yellow-400',
                        entry.rank === 2 && 'bg-slate-400/20 text-slate-300',
                        entry.rank === 3 && 'bg-orange-500/20 text-orange-400',
                        entry.rank > 3 && 'bg-white/5 text-slate-400'
                      )}>
                        {entry.rank <= 3 ? ['👑', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                      </div>

                      <Avatar className="h-12 w-12 ring-2 ring-white/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.avatar}`} />
                        <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{entry.name}</span>
                          <Badge variant="level" className="text-xs">Lv.{entry.level}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span>{getStreakEmoji(entry.streak)} {entry.streak} days</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-primary-400">{entry.points.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">points</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-slate-400 mb-4">Think you can make the top 10?</p>
                <Button variant="gradient" size="lg" asChild>
                  <Link href="/register">Start Climbing →</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Challenges */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {trendingChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group relative bg-slate-800/50 backdrop-blur rounded-xl border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all cursor-pointer"
                  >
                    <div className={`h-2 bg-gradient-to-r ${challenge.color}`} />

                    <div className="p-6">
                      <div className="text-5xl mb-4">{challenge.emoji}</div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                        {challenge.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 border-2 border-slate-800"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-400">
                          {challenge.participants.toLocaleString()} participants
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Community Progress</span>
                          <span className="font-medium">{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2" />
                      </div>

                      <Button className="w-full mt-4" variant="outline">
                        Join Challenge
                      </Button>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-slate-400 mb-4">Ready to challenge yourself?</p>
                <Button variant="gradient" size="lg" asChild>
                  <Link href="/register">Browse All Challenges →</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Success Stories */}
          {activeTab === 'stories' && (
            <motion.div
              key="stories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="space-y-6">
                {successStories.map((story, index) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-slate-800/50 border-white/10 hover:border-primary-500/30 transition-all overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14 ring-2 ring-primary-500/50">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.avatar}`} />
                            <AvatarFallback>{getInitials(story.author)}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white">{story.author}</span>
                              <Badge variant="success" className="text-xs">Verified Story</Badge>
                            </div>

                            <h3 className="text-xl font-bold mb-2 text-white">{story.title}</h3>
                            <p className="text-slate-400 mb-4">{story.excerpt}</p>

                            <div className="flex flex-wrap gap-4 mb-4">
                              <div className="px-3 py-1 rounded-lg bg-white/5 text-sm">
                                🏁 {story.metrics.sprints} Sprints
                              </div>
                              <div className="px-3 py-1 rounded-lg bg-white/5 text-sm">
                                🎯 {story.metrics.goals} Goals
                              </div>
                              <div className="px-3 py-1 rounded-lg bg-white/5 text-sm">
                                🔥 {story.metrics.streak} Day Streak
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span>❤️ {story.likes.toLocaleString()} inspired</span>
                              <Button variant="ghost" size="sm" className="text-primary-400">
                                Read Full Story →
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-slate-400 mb-4">Ready to write your own success story?</p>
                <Button variant="gradient" size="lg" asChild>
                  <Link href="/register">Start Your Journey →</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
    <Footer />
    </>
  );
}
