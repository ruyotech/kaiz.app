import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/marketing/hero-section';
import { LiveActivityFeed } from '@/components/marketing/live-activity-feed';
import { CommunityShowcase } from '@/components/marketing/community-showcase';
import { LeaderboardPreview } from '@/components/marketing/leaderboard-preview';
import { SuccessStoriesCarousel } from '@/components/marketing/success-stories-carousel';
import { StatsCounter } from '@/components/marketing/stats-counter';
import { FeaturesGrid } from '@/components/marketing/features-grid';
import { LifeWheelDemo } from '@/components/marketing/life-wheel-demo';
import { CTASection } from '@/components/marketing/cta-section';
import { Footer } from '@/components/marketing/footer';
import { Navbar } from '@/components/marketing/navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <Navbar />
      
      {/* Hero with Live Activity */}
      <HeroSection />
      
      {/* Live Community Pulse - The Hook! */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-green-400 font-medium">Live Community Activity</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Join <span className="gradient-text-animated">12,847</span> People Transforming Their Lives
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Real people. Real progress. Real-time.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LiveActivityFeed />
            </div>
            <div>
              <StatsCounter />
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard & Success Stories - Social Proof */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <LeaderboardPreview />
            <SuccessStoriesCarousel />
          </div>
        </div>
      </section>

      {/* Community Showcase - FOMO Inducing */}
      <CommunityShowcase />

      {/* Life Wheel Interactive Demo */}
      <LifeWheelDemo />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
