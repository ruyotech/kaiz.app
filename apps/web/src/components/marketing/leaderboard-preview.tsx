'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, getStreakEmoji, getInitials } from '@/lib/utils';

const leaderboardData = [
  { rank: 1, name: 'Sarah Mitchell', avatar: 'sarah-m', points: 4850, streak: 127, level: 24, change: 0, badges: ['streak_legend', 'community_champion'] },
  { rank: 2, name: 'Alex Kozlov', avatar: 'alex-k', points: 4620, streak: 89, level: 22, change: 2, badges: ['velocity_master'] },
  { rank: 3, name: 'Emma Liu', avatar: 'emma-l', points: 4410, streak: 156, level: 21, change: -1, badges: ['sprint_mentor', 'streak_legend'] },
  { rank: 4, name: 'Jordan Peters', avatar: 'jordan-p', points: 4180, streak: 45, level: 20, change: 1, badges: ['helpful_hero'] },
  { rank: 5, name: 'Mike Roberts', avatar: 'mike-r', points: 3920, streak: 67, level: 19, change: -2, badges: ['template_creator'] },
];

export function LeaderboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 overflow-hidden"
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">🏆 Top Achievers</h3>
            <p className="text-slate-400">This week's champions</p>
          </div>
          <Badge variant="streak" className="text-sm">Weekly</Badge>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {leaderboardData.map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-4 p-4 hover:bg-white/5 transition-colors',
              entry.rank === 1 && 'bg-gradient-to-r from-yellow-500/10 to-transparent'
            )}
          >
            {/* Rank */}
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
              entry.rank === 1 && 'bg-yellow-500/20 text-yellow-400',
              entry.rank === 2 && 'bg-slate-400/20 text-slate-300',
              entry.rank === 3 && 'bg-orange-500/20 text-orange-400',
              entry.rank > 3 && 'bg-white/5 text-slate-400'
            )}>
              {entry.rank === 1 ? '👑' : `#${entry.rank}`}
            </div>

            {/* Avatar */}
            <Avatar className="h-12 w-12 ring-2 ring-white/10">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.avatar}`} />
              <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{entry.name}</span>
                <Badge variant="level" className="text-xs">Lv.{entry.level}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span>{getStreakEmoji(entry.streak)} {entry.streak} days</span>
                <span>•</span>
                <span>{entry.points.toLocaleString()} pts</span>
              </div>
            </div>

            {/* Change */}
            <div className={cn(
              'text-sm font-medium',
              entry.change > 0 && 'text-green-400',
              entry.change < 0 && 'text-red-400',
              entry.change === 0 && 'text-slate-500'
            )}>
              {entry.change > 0 && `↑${entry.change}`}
              {entry.change < 0 && `↓${Math.abs(entry.change)}`}
              {entry.change === 0 && '—'}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-white/5 text-center">
        <a href="/community/leaderboard" className="text-primary-400 hover:text-primary-300 font-medium">
          View Full Leaderboard →
        </a>
      </div>
    </motion.div>
  );
}
