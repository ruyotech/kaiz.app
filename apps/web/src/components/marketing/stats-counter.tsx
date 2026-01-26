'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface StatProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon: string;
  color: string;
}

function AnimatedStat({ value, label, prefix = '', suffix = '', icon, color }: StatProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-800/50 backdrop-blur rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all"
    >
      <div className={`text-3xl mb-2`}>{icon}</div>
      <div className={`text-3xl font-bold ${color}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </motion.div>
  );
}

export function StatsCounter() {
  // Simulate incrementing stats
  const [bonus, setBonus] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBonus(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats: StatProps[] = [
    { value: 12847 + bonus, label: 'Active Members', icon: '👥', color: 'text-blue-400' },
    { value: 2847, label: 'Online Now', icon: '🟢', color: 'text-green-400' },
    { value: 847, label: 'Active Streaks', icon: '🔥', color: 'text-orange-400' },
    { value: 156, label: 'Sprints Completed Today', icon: '🏁', color: 'text-purple-400' },
    { value: 1247, label: 'Challenges Running', icon: '🎯', color: 'text-pink-400' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: '⭐', color: 'text-yellow-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <AnimatedStat key={index} {...stat} />
      ))}
    </div>
  );
}
