'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Sparkles,
  Shield,
  Users,
  Zap,
  Star,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { KAIZ_FEATURES } from '@/types/content';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

// Default pricing tiers (will be replaced by API data)
const defaultPricingTiers = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    billingPeriod: 'free' as const,
    description: 'Perfect for getting started with life organization',
    features: [
      'Life Wheel tracking with 8 dimensions',
      'Basic task management',
      'Up to 3 active goals',
      'Weekly sprints',
      'Community access',
      'Mobile app access',
    ],
    cta: { text: 'Get Started Free', href: '/signup' },
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    billingPeriod: 'month' as const,
    description: 'For individuals serious about personal growth',
    features: [
      'Everything in Free',
      'AI Scrum Master coaching',
      'Unlimited goals & challenges',
      'Advanced analytics & reports',
      'Focus Mode with deep work tracking',
      'Knowledge Hub access',
      'Priority email support',
    ],
    cta: { text: 'Start 14-Day Trial', href: '/signup?plan=pro' },
    popular: true,
  },
  {
    id: 'family',
    name: 'Family',
    price: 19.99,
    billingPeriod: 'month' as const,
    description: 'Coordinate and grow together as a family',
    features: [
      'Everything in Pro',
      'Up to 6 family members',
      'Family Squads feature',
      'Shared task boards & lists',
      'Chore gamification for kids',
      'Family calendar sync',
      'Joint goals & challenges',
      'Dedicated family support',
    ],
    cta: { text: 'Start Family Trial', href: '/signup?plan=family' },
    popular: false,
  },
];

const faqs = [
  {
    question: 'Can I switch plans at any time?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. If you upgrade, you\'ll be charged the prorated difference. If you downgrade, you\'ll receive credit towards your next billing cycle.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Absolutely! Both Pro and Family plans come with a 14-day free trial. No credit card required to start. Experience all features before committing.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your data is always yours. If you cancel, you\'ll keep access until the end of your billing period. After that, you\'ll be downgraded to Free and can still access your basic data. We keep your data safe for 90 days in case you want to reactivate.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Annual plans save you 20% compared to monthly billing. That\'s like getting 2+ months free every year.',
  },
  {
    question: 'Can I use Kaiz offline?',
    answer: 'The mobile app supports offline mode for core features. Your data syncs automatically when you\'re back online. Some features like AI coaching require an internet connection.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Security is our top priority. We use end-to-end encryption for sensitive data, never sell your personal information, and comply with GDPR and CCPA. Your financial data never touches our servers if you use local-only mode.',
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    return billingPeriod === 'year' ? basePrice * 12 * 0.8 : basePrice;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_60%)]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Simple, transparent pricing
            </span>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {' '}Growth Plan
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              Start free and upgrade as you grow. All plans include our core features 
              with no hidden fees or surprise charges.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1 rounded-full bg-slate-800/50 border border-slate-700">
              <button
                onClick={() => setBillingPeriod('month')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('year')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === 'year'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {defaultPricingTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  tier.popular
                    ? 'bg-gradient-to-b from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50'
                    : 'bg-slate-800/50 border border-slate-700/50'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-slate-400 text-sm">{tier.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">
                      {formatPrice(getPrice(tier.price))}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-slate-400">
                        /{billingPeriod === 'year' ? 'year' : 'mo'}
                      </span>
                    )}
                  </div>
                  {tier.price > 0 && billingPeriod === 'year' && (
                    <p className="text-sm text-green-400 mt-1">
                      ${(getPrice(tier.price) / 12).toFixed(2)}/mo billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.cta.href}
                  className={`block w-full py-3 px-6 rounded-xl font-medium text-center transition-all ${
                    tier.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {tier.cta.text}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Compare All Features
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              See exactly what's included in each plan
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-white font-medium">Free</th>
                  <th className="text-center py-4 px-4 text-white font-medium">Pro</th>
                  <th className="text-center py-4 px-4 text-white font-medium">Family</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Life Wheel Tracking', free: true, pro: true, family: true },
                  { feature: 'Weekly Sprints', free: true, pro: true, family: true },
                  { feature: 'Eisenhower Matrix', free: true, pro: true, family: true },
                  { feature: 'Command Center', free: true, pro: true, family: true },
                  { feature: 'Active Goals', free: '3', pro: 'Unlimited', family: 'Unlimited' },
                  { feature: 'Active Challenges', free: '1', pro: 'Unlimited', family: 'Unlimited' },
                  { feature: 'AI Scrum Master', free: false, pro: true, family: true },
                  { feature: 'Focus Mode', free: 'Basic', pro: 'Advanced', family: 'Advanced' },
                  { feature: 'Analytics & Reports', free: 'Basic', pro: 'Advanced', family: 'Advanced' },
                  { feature: 'Knowledge Hub', free: false, pro: true, family: true },
                  { feature: 'Family Squads', free: false, pro: false, family: true },
                  { feature: 'Team Members', free: '1', pro: '1', family: 'Up to 6' },
                  { feature: 'Shared Boards', free: false, pro: false, family: true },
                  { feature: 'Priority Support', free: false, pro: true, family: true },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-slate-800">
                    <td className="py-4 px-4 text-slate-300">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        <span className="text-slate-300">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        <span className="text-slate-300">{row.pro}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {typeof row.family === 'boolean' ? (
                        row.family ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        <span className="text-slate-300">{row.family}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: 'Secure & Private', desc: 'End-to-end encryption' },
              { icon: Zap, label: '14-Day Trial', desc: 'No credit card required' },
              { icon: Users, label: '50K+ Users', desc: 'Growing community' },
              { icon: Star, label: '4.9 Rating', desc: 'App Store reviews' },
            ].map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <badge.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-1">{badge.label}</h3>
                <p className="text-slate-400 text-sm">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400">
              Everything you need to know about Kaiz LifeOS pricing
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-white pr-4">{faq.question}</span>
                  <HelpCircle
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-400">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-blue-500/30 rounded-3xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of people who've taken control of their time, 
              goals, and personal growth with Kaiz LifeOS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-all"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-700/50 text-white font-medium rounded-xl hover:bg-slate-700 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}
