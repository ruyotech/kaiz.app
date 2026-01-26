'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LIFE_WHEEL_AREAS } from '@/types';

// Fixed demo values to avoid hydration mismatch
const DEMO_VALUES: Record<string, number> = {
  career: 75,
  health: 68,
  contribution: 82,
  relationships: 90,
  family: 85,
  personal_growth: 72,
  recreation: 65,
  environment: 78,
};

const dimensions = Object.entries(LIFE_WHEEL_AREAS).map(([id, data]) => ({
  id,
  ...data,
  value: DEMO_VALUES[id] || 75,
}));

export function LifeWheelDemo() {
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);

  return (
    <section className="py-20 bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Balance All 8 <span className="gradient-text-animated">Life Dimensions</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Stop sacrificing one area for another. Kaiz shows you where you're thriving 
            and where you need attention.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Life Wheel Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-80 h-80 md:w-96 md:h-96"
          >
            {/* Concentric circles */}
            {[100, 75, 50, 25].map((size) => (
              <div
                key={size}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
                style={{ width: `${size}%`, height: `${size}%` }}
              />
            ))}

            {/* Dimension segments */}
            {dimensions.map((dim, index) => {
              const angle = (index * 360) / dimensions.length - 90;
              const radian = (angle * Math.PI) / 180;
              const radius = (dim.value / 100) * 45; // 45% max radius
              const x = Math.cos(radian) * radius;
              const y = Math.sin(radian) * radius;

              return (
                <motion.div
                  key={dim.id}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute top-1/2 left-1/2 cursor-pointer"
                  style={{
                    transform: `translate(calc(-50% + ${x}%), calc(-50% + ${y}%))`,
                  }}
                  onMouseEnter={() => setHoveredDimension(dim.id)}
                  onMouseLeave={() => setHoveredDimension(null)}
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={cn(
                      'w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all',
                      hoveredDimension === dim.id ? 'ring-4 ring-white/50' : ''
                    )}
                    style={{ backgroundColor: dim.color }}
                  >
                    {dim.icon}
                  </motion.div>
                </motion.div>
              );
            })}

            {/* Center score */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex flex-col items-center justify-center shadow-xl">
              <span className="text-2xl md:text-3xl font-bold">78</span>
              <span className="text-xs opacity-80">Balance</span>
            </div>
          </motion.div>

          {/* Dimension details */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {dimensions.map((dim, index) => (
              <motion.div
                key={dim.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer',
                  hoveredDimension === dim.id ? 'bg-white/10' : 'hover:bg-white/5'
                )}
                onMouseEnter={() => setHoveredDimension(dim.id)}
                onMouseLeave={() => setHoveredDimension(null)}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${dim.color}20` }}
                >
                  {dim.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{dim.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${dim.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: dim.color }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{dim.value}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
