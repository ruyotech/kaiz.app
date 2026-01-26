'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const challengesData = [
  {
    id: 1,
    title: '30-Day Meditation Challenge',
    category: 'mindfulness',
    description: 'Build a daily meditation habit for inner peace',
    participants: 2847,
    duration: 30,
    progress: 60,
    daysLeft: 12,
    reward: '500 XP + Zen Master Badge',
    joined: true,
    trending: true,
  },
  {
    id: 2,
    title: 'Read 12 Books in 12 Months',
    category: 'learning',
    description: 'Expand your knowledge one book at a time',
    participants: 1523,
    duration: 365,
    progress: 25,
    daysLeft: 274,
    reward: '1000 XP + Bookworm Badge',
    joined: true,
    trending: false,
  },
  {
    id: 3,
    title: 'February Fitness Blitz',
    category: 'fitness',
    description: '28 days of consistent workout sessions',
    participants: 4521,
    duration: 28,
    progress: 40,
    daysLeft: 17,
    reward: '800 XP + Iron Will Badge',
    joined: true,
    trending: true,
  },
  {
    id: 4,
    title: 'Digital Detox Weekend',
    category: 'wellness',
    description: 'Unplug and reconnect with life',
    participants: 892,
    duration: 3,
    progress: 0,
    daysLeft: 5,
    reward: '200 XP + Unplugged Badge',
    joined: false,
    trending: false,
  },
  {
    id: 5,
    title: 'Connect With 10 People',
    category: 'social',
    description: 'Build meaningful connections this month',
    participants: 1247,
    duration: 30,
    progress: 0,
    daysLeft: 30,
    reward: '600 XP + Social Butterfly Badge',
    joined: false,
    trending: true,
  },
];

const categoryColors: Record<string, string> = {
  fitness: 'bg-red-500',
  mindfulness: 'bg-purple-500',
  learning: 'bg-blue-500',
  wellness: 'bg-green-500',
  social: 'bg-pink-500',
  productivity: 'bg-yellow-500',
};

const leaderboard = [
  { rank: 1, name: 'Sarah M.', avatar: 'sarah-m', points: 12450, streak: 127 },
  { rank: 2, name: 'Alex K.', avatar: 'alex-k', points: 11890, streak: 89 },
  { rank: 3, name: 'Emma L.', avatar: 'emma-l', points: 10250, streak: 156 },
  { rank: 4, name: 'You', avatar: 'you', points: 8420, streak: 45, isUser: true },
  { rank: 5, name: 'Mike R.', avatar: 'mike-r', points: 7890, streak: 67 },
];

export default function ChallengesPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'available'>('all');

  const filteredChallenges = challengesData.filter((challenge) => {
    if (filter === 'active') return challenge.joined;
    if (filter === 'available') return !challenge.joined;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Challenges</h2>
          <p className="text-slate-400">Push your limits and earn rewards</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'available'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Challenges Grid */}
        <div className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-white/10 hover:border-white/20 transition-all h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${categoryColors[challenge.category]} text-white`}>
                        {challenge.category}
                      </Badge>
                      {challenge.trending && (
                        <Badge variant="destructive" className="animate-pulse">
                          🔥 Trending
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{challenge.description}</p>

                    {challenge.joined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span className="text-primary-400">{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                      <span>👥 {challenge.participants.toLocaleString()} joined</span>
                      <span>⏱️ {challenge.daysLeft}d left</span>
                    </div>

                    <div className="text-xs text-slate-500 mb-4">
                      🎁 Reward: {challenge.reward}
                    </div>

                    <Button
                      variant={challenge.joined ? 'outline' : 'gradient'}
                      className="w-full"
                    >
                      {challenge.joined ? 'View Progress' : 'Join Challenge'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 border-primary-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-4xl font-bold mb-1">8,420</div>
                <div className="text-slate-400 mb-4">Total XP Earned</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xl font-bold">3</div>
                    <div className="text-xs text-slate-500">Active</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">12</div>
                    <div className="text-xs text-slate-500">Completed</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">5</div>
                    <div className="text-xs text-slate-500">Badges</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">🏆 Weekly Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((user) => (
                    <div
                      key={user.rank}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        user.isUser ? 'bg-primary-500/20 ring-1 ring-primary-500/50' : ''
                      }`}
                    >
                      <div className={`w-6 text-center font-bold ${
                        user.rank === 1 ? 'text-yellow-400' :
                        user.rank === 2 ? 'text-slate-300' :
                        user.rank === 3 ? 'text-orange-400' : 'text-slate-500'
                      }`}>
                        {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-slate-500">🔥 {user.streak} days</div>
                      </div>
                      <div className="text-sm font-bold text-primary-400">
                        {user.points.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">🎖️ Your Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {['🏃', '📚', '🧘', '💪', '🌟'].map((badge, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl bg-white/5 flex items-center justify-center text-2xl"
                    >
                      {badge}
                    </div>
                  ))}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`locked-${i}`}
                      className="aspect-square rounded-xl bg-white/5 flex items-center justify-center text-xl text-slate-600"
                    >
                      🔒
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
