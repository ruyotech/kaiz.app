'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { KAIZ_FEATURES, DEFAULT_ABOUT_CONTENT } from '@/types/content';
import { 
  ArrowRight, 
  Check, 
  Sparkles, 
  Zap,
  Target,
  Users,
  Shield,
  Play,
  Lock,
  CheckCircle2,
  Star,
  TrendingUp,
  Brain,
  Rocket
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const floatAnimation = {
  initial: { y: 0 },
  animate: { 
    y: [-10, 10, -10], 
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } 
  }
};

export default function AboutPage() {
  const content = DEFAULT_ABOUT_CONTENT;
  const features = KAIZ_FEATURES.filter(f => f.isActive).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      
      {/* EPIC Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          
          {/* Glowing orbs */}
          <motion.div 
            className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-primary-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-[80px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-400/50 rounded-full"
              style={{
                left: `${10 + (i * 4.5)}%`,
                top: `${20 + (i % 5) * 15}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-24 pb-20">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Top badges */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-medium text-sm">
                <Lock className="w-3.5 h-3.5" />
                256-bit AES Encryption
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 font-medium text-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {content.hero.tagline}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 font-medium text-sm">
                <Star className="w-3.5 h-3.5" />
                4.9/5 from 2,847 reviews
              </span>
            </motion.div>

            {/* Main headline with animated gradient */}
            <motion.div variants={fadeInUp} className="text-center mb-6">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none">
                <span className="block bg-gradient-to-r from-white via-primary-200 to-white bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  {content.hero.headline}
                </span>
              </h1>
            </motion.div>

            {/* Animated subtitle */}
            <motion.div variants={fadeInUp} className="text-center mb-8">
              <p className="text-2xl md:text-4xl font-light text-slate-300 leading-relaxed max-w-4xl mx-auto">
                {content.hero.subheadline.split('—')[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400 font-semibold">
                  — {content.hero.subheadline.split('—')[1]}
                </span>
              </p>
            </motion.div>

            {/* Value proposition cards - floating effect */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
            >
              {[
                { icon: Brain, role: 'You become', desc: 'The Product Manager', color: 'from-blue-500 to-cyan-500' },
                { icon: Target, role: 'Your week is', desc: 'A Sprint Cycle', color: 'from-purple-500 to-pink-500' },
                { icon: TrendingUp, role: 'Your habits are', desc: 'The Roadmap', color: 'from-orange-500 to-red-500' },
                { icon: Rocket, role: 'Your progress is', desc: '100% Measurable', color: 'from-green-500 to-emerald-500' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                  <div className="relative bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-slate-500/50 transition-all duration-300 h-full">
                    <item.icon className={`w-8 h-8 mb-3 bg-gradient-to-br ${item.color} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(135deg, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text' }} />
                    <p className="text-slate-400 text-sm mb-1">{item.role}</p>
                    <p className="text-white font-bold text-lg">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/register">
                <Button size="lg" className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 hover:from-primary-600 hover:via-purple-600 hover:to-pink-600 text-xl px-10 py-7 h-auto shadow-2xl shadow-primary-500/30 group">
                  <span className="relative z-10 flex items-center">
                    Start Your Transformation
                    <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>
              <Link href="/community">
                <Button size="lg" variant="outline" className="border-slate-500 hover:border-primary-400 hover:bg-primary-500/10 text-xl px-10 py-7 h-auto backdrop-blur group">
                  <Play className="mr-2 w-6 h-6 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Free forever plan
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                End-to-end encrypted
              </span>
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-400" />
                GDPR & SOC2 compliant
              </span>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div 
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
                  <motion.div 
                    className="w-1.5 h-1.5 bg-primary-400 rounded-full"
                    animate={{ y: [0, 16, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {content.philosophy.title}
              </h2>
              <p className="text-xl text-slate-400">
                Most apps collect intentions. <span className="text-primary-400 font-semibold">Kaiz produces outcomes.</span>
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur border border-slate-700/50 rounded-3xl p-8 md:p-12">
              <p className="text-lg text-slate-300 mb-8">
                Kaiz forces the missing behavior that actually changes your life:
              </p>
              
              <div className="space-y-4 mb-8">
                {content.philosophy.points.map((point, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className="flex items-start gap-4 group"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-primary-400" />
                    </span>
                    <p className="text-lg">
                      <span className="text-white font-medium">{point.text}</span>
                      <span className="text-slate-400">, </span>
                      <span className="text-primary-400 font-semibold">{point.highlight}</span>
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl blur-xl" />
                <div className="relative bg-slate-900/80 border border-primary-500/30 rounded-xl p-6 text-center">
                  <p className="text-xl md:text-2xl font-semibold text-white">
                    {content.philosophy.conclusion}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Sections */}
      {features.map((feature, index) => (
        <FeatureSection key={feature.id} feature={feature} index={index} />
      ))}

      {/* The Promise Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-primary-950/50 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              {content.promise.title}
            </motion.h2>

            <motion.p 
              variants={fadeInUp}
              className="text-2xl text-slate-300 mb-8"
            >
              {content.promise.subtitle}
            </motion.p>

            <motion.div variants={fadeInUp} className="space-y-2 mb-12">
              {content.promise.principles.map((principle, i) => (
                <p key={i} className="text-xl text-slate-400">{principle}</p>
              ))}
            </motion.div>

            {/* The Cycle */}
            <motion.div 
              variants={fadeInUp}
              className="relative mb-16"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-2xl" />
              <div className="relative bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
                <div className="flex flex-wrap items-center justify-center gap-4 text-2xl md:text-3xl font-bold">
                  {['Commit', 'Execute', 'Measure', 'Improve', 'Repeat'].map((step, i) => (
                    <span key={step} className="flex items-center gap-4">
                      <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {step}
                      </span>
                      {i < 4 && (
                        <span className="text-primary-500">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: Lock, label: 'Bank-Grade Security', desc: '256-bit AES encryption' },
                { icon: Shield, label: 'Privacy First', desc: 'Zero-knowledge architecture' },
                { icon: Zap, label: 'Offline Ready', desc: 'Works without WiFi' },
                { icon: Target, label: 'Results Driven', desc: 'Outcomes, not intentions' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4 hover:border-green-500/30 transition-colors">
                  <item.icon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </motion.div>

            {/* Final CTA */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 hover:from-primary-600 hover:via-purple-600 hover:to-pink-600 text-xl px-12 py-7 h-auto shadow-2xl shadow-primary-500/25">
                  Begin Your Transformation
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>

            <motion.p variants={fadeInUp} className="mt-6 text-slate-500">
              Free to start • No credit card required • Join 12,847+ life operators
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Feature Section Component
function FeatureSection({ feature, index }: { feature: typeof KAIZ_FEATURES[0], index: number }) {
  const isEven = index % 2 === 0;

  return (
    <section className={`py-20 relative ${index % 3 === 0 ? 'bg-slate-900/30' : ''}`}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className={`grid lg:grid-cols-2 gap-12 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
            {/* Content Side */}
            <motion.div variants={fadeInUp} className={isEven ? '' : 'lg:order-2'}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-4xl p-3 rounded-2xl bg-gradient-to-br ${feature.color} bg-opacity-20`}>
                  {feature.icon}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                {feature.title}
              </h2>
              
              <p className={`text-xl mb-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent font-medium`}>
                {feature.subtitle}
              </p>

              <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                {feature.description}
              </p>

              <ul className="space-y-3 mb-8">
                {feature.bulletPoints.map((point, i) => (
                  <motion.li
                    key={i}
                    variants={fadeInUp}
                    className="flex items-start gap-3"
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-slate-300">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Example Card Side */}
            <motion.div variants={scaleIn} className={isEven ? '' : 'lg:order-1'}>
              {feature.example && (
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl blur-xl opacity-20`} />
                  <div className="relative bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-3xl p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Example</span>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-sm text-slate-400 mb-1">Scenario:</p>
                        <p className="text-white">{feature.example.scenario}</p>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      <div className={`bg-gradient-to-br ${feature.color} bg-opacity-10 rounded-xl p-4 border border-slate-600/50`}>
                        <p className="text-sm text-slate-400 mb-1">Kaiz Response:</p>
                        <p className="text-white font-medium">{feature.example.outcome}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
