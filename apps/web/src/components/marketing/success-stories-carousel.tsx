'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, getInitials } from '@/lib/utils';

const stories = [
  {
    id: 1,
    author: 'Jessica Chen',
    avatar: 'jessica-c',
    title: 'From Chaos to Clarity: My 6-Month Transformation',
    excerpt: 'I went from forgetting appointments to running my life like a CEO. The weekly sprint system changed everything.',
    category: 'transformation',
    metrics: [
      { label: 'Sprints Completed', value: '26' },
      { label: 'Goals Achieved', value: '18' },
      { label: 'Current Streak', value: '184 days' },
    ],
    likeCount: 847,
    celebrateCount: 234,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
  {
    id: 2,
    author: 'Marcus Thompson',
    avatar: 'marcus-t',
    title: 'Lost 30 lbs While Building My Startup',
    excerpt: 'Story points for workouts. Sprint goals for health. Kaiz helped me balance career ambition with personal wellbeing.',
    category: 'milestone',
    metrics: [
      { label: 'Weight Lost', value: '30 lbs' },
      { label: 'Workout Streak', value: '90 days' },
      { label: 'Life Balance Score', value: '+45%' },
    ],
    likeCount: 1203,
    celebrateCount: 456,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: 3,
    author: 'Priya Sharma',
    avatar: 'priya-s',
    title: 'How I Finally Wrote My Book (in 12 Sprints)',
    excerpt: 'Breaking down "write a book" into weekly sprints made the impossible feel achievable. 12 weeks later: 65,000 words.',
    category: 'habit_streak',
    metrics: [
      { label: 'Words Written', value: '65,000' },
      { label: 'Writing Streak', value: '84 days' },
      { label: 'Chapters Done', value: '24' },
    ],
    likeCount: 956,
    celebrateCount: 312,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
  },
];

export function SuccessStoriesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextStory = () => setCurrentIndex((prev) => (prev + 1) % stories.length);
  const prevStory = () => setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-slate-800/50 backdrop-blur rounded-2xl border border-white/10 overflow-hidden"
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">✨ Success Stories</h3>
            <p className="text-slate-400">Real transformations, real people</p>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={prevStory} className="border-white/20">
              ←
            </Button>
            <Button size="icon" variant="outline" onClick={nextStory} className="border-white/20">
              →
            </Button>
          </div>
        </div>
      </div>

      <div className="relative h-[400px] overflow-hidden">
        <AnimatePresence mode="wait">
          {stories.map((story, index) => (
            index === currentIndex && (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-6"
              >
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary-500/50">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.avatar}`} />
                    <AvatarFallback>{getInitials(story.author)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{story.author}</div>
                    <Badge variant="success" className="text-xs capitalize">{story.category.replace('_', ' ')}</Badge>
                  </div>
                </div>

                {/* Content */}
                <h4 className="text-xl font-bold mb-3">{story.title}</h4>
                <p className="text-slate-400 mb-6">{story.excerpt}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {story.metrics.map((metric, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-primary-400">{metric.value}</div>
                      <div className="text-xs text-slate-400">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Engagement */}
                <div className="flex items-center gap-6 text-sm text-slate-400">
                  <span>❤️ {story.likeCount.toLocaleString()} likes</span>
                  <span>🎉 {story.celebrateCount.toLocaleString()} celebrations</span>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 p-4 border-t border-white/10">
        {stories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex ? 'bg-primary-500 w-6' : 'bg-white/20'
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}
