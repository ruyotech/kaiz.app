'use client';

import { motion } from 'framer-motion';

const features = [
  {
    icon: '🏃',
    title: 'Weekly Sprints',
    description: 'Run your life in focused 7-day cycles. Plan on Sunday, execute all week, review on Saturday.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '📊',
    title: 'Story Points',
    description: 'Estimate effort realistically. No more overcommitting. Your velocity shows your true capacity.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: '🎯',
    title: 'Eisenhower Matrix',
    description: 'Auto-categorize by urgency and importance. Stop firefighting, start building your future.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: '🏆',
    title: 'Challenges',
    description: 'Join solo or group challenges. Build streaks. Compete on leaderboards. Make habits stick.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: '🤝',
    title: 'Accountability Partners',
    description: 'Find your tribe. Get matched with like-minded achievers. Celebrate wins together.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: '🧠',
    title: 'AI Scrum Master',
    description: "Get smart nudges when you're overcommitting, neglecting areas, or need a motivation boost.",
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    icon: '📱',
    title: 'Mobile + Web',
    description: 'Seamless sync between mobile app and web dashboard. Plan on desktop, execute on the go.',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Mode',
    description: 'Run your household like a team. Shared goals, individual tasks, family leaderboard.',
    gradient: 'from-amber-500 to-orange-500',
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="gradient-text-animated">Ship Your Life</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            The complete operating system for high performers who treat life as seriously as work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="group relative bg-slate-800/50 backdrop-blur rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
