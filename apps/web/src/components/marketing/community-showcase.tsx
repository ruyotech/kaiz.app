'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const challenges = [
  { id: 1, name: '30-Day Morning Routine', emoji: '🌅', participants: 1247, category: 'Health', color: 'from-orange-500 to-pink-500' },
  { id: 2, name: 'Read 10 Books', emoji: '📚', participants: 892, category: 'Growth', color: 'from-purple-500 to-blue-500' },
  { id: 3, name: 'Zero Inbox Sprint', emoji: '📧', participants: 634, category: 'Career', color: 'from-blue-500 to-cyan-500' },
  { id: 4, name: 'Daily Meditation', emoji: '🧘', participants: 1567, category: 'Wellness', color: 'from-green-500 to-teal-500' },
];

const onlineMembers = [
  { name: 'Sarah', avatar: 'sarah-1' },
  { name: 'Alex', avatar: 'alex-2' },
  { name: 'Jordan', avatar: 'jordan-3' },
  { name: 'Emma', avatar: 'emma-4' },
  { name: 'Mike', avatar: 'mike-5' },
];

export function CommunityShowcase() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-primary-950/50 to-slate-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <Badge variant="outline" className="border-primary-500/50 text-primary-400 mb-4">
            🌟 Community Hub
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your <span className="gradient-text-animated">Tribe</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join challenges, find accountability partners, and celebrate wins together.
            You're not doing this alone.
          </p>
        </div>

        {/* Active Challenges */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">🔥 Trending Challenges</h3>
            <Button variant="outline" className="border-white/20" asChild>
              <Link href="/community/challenges">Browse All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative bg-slate-800/50 backdrop-blur rounded-xl border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all cursor-pointer"
              >
                {/* Gradient top */}
                <div className={`h-2 bg-gradient-to-r ${challenge.color}`} />
                
                <div className="p-5">
                  <div className="text-4xl mb-3">{challenge.emoji}</div>
                  <h4 className="font-bold mb-2 group-hover:text-primary-400 transition-colors">
                    {challenge.name}
                  </h4>
                  <Badge variant="secondary" className="mb-4">{challenge.category}</Badge>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 border-2 border-slate-800"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-400">
                      {challenge.participants.toLocaleString()} joined
                    </span>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Online Now */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur rounded-2xl border border-white/10 p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex -space-x-3">
                  {onlineMembers.map((member, i) => (
                    <Avatar key={i} className="h-12 w-12 ring-4 ring-slate-900">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  <div className="w-12 h-12 rounded-full bg-slate-700 ring-4 ring-slate-900 flex items-center justify-center text-sm font-semibold">
                    +2.8k
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
              </div>
              <div>
                <div className="font-bold text-lg">2,847 people online now</div>
                <div className="text-slate-400">Working on their sprints, crushing challenges</div>
              </div>
            </div>

            <Button variant="gradient" size="lg" asChild>
              <Link href="/register">
                Join the Community →
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
