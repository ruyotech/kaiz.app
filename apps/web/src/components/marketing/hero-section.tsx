'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Glowing orbs with animation */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[120px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-conic from-primary-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-[100px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-400/60 rounded-full"
            style={{
              left: `${5 + (i * 6.5)}%`,
              top: `${15 + (i % 6) * 12}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Top badges row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
              <Lock className="w-3.5 h-3.5" />
              256-bit Encrypted
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-400 font-semibold">2,847</span>
              <span className="text-slate-300">achieving goals now</span>
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium">
              <Shield className="w-3.5 h-3.5" />
              GDPR Compliant
            </span>
          </motion.div>

          {/* Main headline with animated gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black mb-6 leading-tight tracking-tight"
          >
            <span className="block text-white">Run Your Life</span>
            <span className="block gradient-text-animated bg-[length:200%_auto] animate-gradient">Like a Product Team</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed"
          >
            Turn <span className="text-primary-400 font-semibold">"I should"</span> into <span className="text-green-400 font-semibold">"it shipped."</span>
            <br className="hidden sm:block" />
            Weekly sprints. Story points. A community that celebrates your wins.
          </motion.p>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-sm text-slate-500 mb-8"
          >
            Your data is protected with bank-grade security • End-to-end encryption • SOC2 Type II certified
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Button size="xl" className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 hover:from-primary-600 hover:via-purple-600 hover:to-pink-600 text-lg px-10 py-6 h-auto shadow-2xl shadow-primary-500/30 group" asChild>
              <Link href="/register">
                <span className="relative z-10 flex items-center font-semibold">
                  Join the Movement — It's Free
                  <Zap className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                </span>
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="border-slate-600 hover:border-primary-400 hover:bg-primary-500/10 text-lg px-10 py-6 h-auto backdrop-blur" asChild>
              <Link href="/community">
                See Live Community →
              </Link>
            </Button>
          </motion.div>

          {/* Social proof enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2 text-slate-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {['SM', 'AK', 'EL', 'JP', 'MR'][i-1]}
                  </div>
                ))}
              </div>
              <span className="font-medium">12,847 members</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">★★★★★</span>
              <span className="text-slate-400">4.9/5 from 2,340 reviews</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Free forever plan</span>
            </div>
          </motion.div>
        </div>

        {/* Floating achievement elements */}
        <motion.div 
          className="absolute top-24 left-8 lg:left-16"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.div 
            className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm backdrop-blur-sm"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🏁 Sprint Completed!
          </motion.div>
        </motion.div>
        <motion.div 
          className="absolute top-32 right-8 lg:right-16"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.div 
            className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm backdrop-blur-sm"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          >
            ⬆️ Level 15 Reached!
          </motion.div>
        </motion.div>
        <motion.div 
          className="absolute bottom-32 left-8 lg:left-24"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <motion.div 
            className="px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm backdrop-blur-sm"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          >
            🔥 100-Day Streak!
          </motion.div>
        </motion.div>
        <motion.div 
          className="absolute bottom-44 right-8 lg:right-20"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.7, x: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <motion.div 
            className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm backdrop-blur-sm"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, delay: 1.5 }}
          >
            🎯 Goal Achieved!
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary-400"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
