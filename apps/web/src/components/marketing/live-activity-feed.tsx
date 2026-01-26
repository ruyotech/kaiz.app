'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatRelativeTime, getActivityIcon, getInitials } from '@/lib/utils';

// Static activity templates
const activityTemplates = [
  { type: 'sprint_completed', title: 'completed their weekly sprint', user: 'Sarah M.', avatar: 'sarah', points: 28 },
  { type: 'challenge_completed', title: 'finished 30-Day Meditation', user: 'Alex K.', avatar: 'alex', streak: 30 },
  { type: 'badge_earned', title: 'earned Sprint Master badge', user: 'Jordan P.', avatar: 'jordan', badge: '🏆' },
  { type: 'streak_milestone', title: 'hit a 100-day streak!', user: 'Emma L.', avatar: 'emma', streak: 100 },
  { type: 'level_up', title: 'reached Level 15', user: 'Mike R.', avatar: 'mike', level: 15 },
  { type: 'challenge_joined', title: 'joined Morning Routine Challenge', user: 'Lisa T.', avatar: 'lisa', participants: 234 },
  { type: 'sprint_completed', title: 'crushed 35 story points!', user: 'David W.', avatar: 'david', points: 35 },
  { type: 'badge_earned', title: 'became a Community Mentor', user: 'Nina S.', avatar: 'nina', badge: '🌟' },
];

// Initial static activities with fixed IDs for SSR
const initialActivities = activityTemplates.map((activity, index) => ({
  id: `initial-${index}`,
  ...activity,
  timestamp: new Date(Date.now() - (index + 1) * 5000).toISOString(),
}));

export function LiveActivityFeed() {
  const [activities, setActivities] = useState(initialActivities);
  const counterRef = useRef(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const templateIndex = counterRef.current % activityTemplates.length;
        const newActivity = {
          id: `activity-${counterRef.current}`,
          ...activityTemplates[templateIndex],
          timestamp: new Date().toISOString(),
        };
        counterRef.current += 1;
        return [newActivity, ...prev.slice(0, 7)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-semibold">Live Activity</span>
        </div>
        <span className="text-sm text-slate-400">Updates every few seconds</span>
      </div>
      
      <div className="divide-y divide-white/5 max-h-[400px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -50, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 50, height: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex items-center gap-4 p-4 hover:bg-white/5 transition-colors',
                index === 0 && 'bg-primary-500/10'
              )}
            >
              <Avatar className="h-10 w-10 ring-2 ring-white/10">
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
  );
}
