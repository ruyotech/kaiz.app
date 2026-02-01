'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

const faqCategories = [
  { id: 'all', label: 'All Questions' },
  { id: 'general', label: 'General' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing & Billing' },
  { id: 'privacy', label: 'Privacy & Security' },
  { id: 'mobile', label: 'Mobile App' },
];

const faqs = [
  {
    category: 'general',
    question: 'What is Kaiz ?',
    answer: 'Kaiz is a comprehensive life operating system that combines task management, habit tracking, goal setting, and personal development tools into one seamless experience. It\'s designed to help you balance all areas of your life while making meaningful progress toward your goals. Think of it as your personal command center for life.',
  },
  {
    category: 'general',
    question: 'Who is Kaiz for?',
    answer: 'Kaiz is for anyone who wants to be more intentional about their life—whether you\'re a busy professional juggling career and family, a student managing studies and personal growth, an entrepreneur building a business, or simply someone who wants to live more deliberately. Our Family plan also makes it perfect for households who want to coordinate and grow together.',
  },
  {
    category: 'general',
    question: 'How is Kaiz different from other productivity apps?',
    answer: 'Unlike single-purpose apps, Kaiz takes a holistic approach. Instead of just managing tasks, we help you visualize and balance all dimensions of your life through the Life Wheel. We combine agile methodology (Weekly Sprints), proven prioritization (Eisenhower Matrix), and AI coaching (Scrum Master) into one cohesive system. Plus, everything syncs between web and mobile.',
  },
  {
    category: 'features',
    question: 'What is the Life Wheel?',
    answer: 'The Life Wheel is a visual representation of 8 key life dimensions: Career, Health, Spiritual, Relationships, Family, Personal Growth, Recreation, and Environment. You rate each dimension regularly, and Kaiz shows you patterns over time. This helps you identify which areas need more attention and celebrate where you\'re thriving.',
  },
  {
    category: 'features',
    question: 'How do Weekly Sprints work?',
    answer: 'Inspired by agile software development, Weekly Sprints help you break big goals into focused weekly cycles. At the start of each week, you plan what you\'ll accomplish. At the end, you review and reflect. Over time, you\'ll see your "velocity" (how much you consistently accomplish) improve, and the AI Scrum Master helps you plan more effectively.',
  },
  {
    category: 'features',
    question: 'What is the AI Scrum Master?',
    answer: 'The AI Scrum Master is your personal productivity coach. It learns your patterns, nudges you when tasks are overdue, celebrates your wins, and helps you plan your week. Unlike a real manager, it\'s available 24/7 and never makes you feel bad—it\'s designed to encourage, not nag. It adapts to your communication style and productivity rhythms.',
  },
  {
    category: 'features',
    question: 'Can I use Kaiz for habit tracking?',
    answer: 'Absolutely! Our 30-Day Challenges feature is specifically designed for building habits. You can join pre-built challenges (like "30 Days of Meditation" or "Daily Exercise") or create custom ones. The community leaderboards add a fun competitive element, and streak tracking keeps you motivated.',
  },
  {
    category: 'features',
    question: 'What is the Command Center?',
    answer: 'The Command Center is your universal inbox—a single place to capture everything that comes to mind. Voice memos, quick text notes, photos of whiteboards or receipts—everything goes here first. Kaiz (with AI assistance) then helps you sort and route items to the right place: tasks, goals, notes, or even delete.',
  },
  {
    category: 'features',
    question: 'What are Family Squads?',
    answer: 'Family Squads bring agile methodology to your household. Create shared task boards for chores, shopping lists, and event planning. Assign tasks to family members, add point-based rewards for kids (gamification!), and sync calendars. No more "I forgot" excuses—everyone can see what needs doing.',
  },
  {
    category: 'pricing',
    question: 'Is there a free plan?',
    answer: 'Yes! Kaiz offers a generous free tier that includes Life Wheel tracking, basic task management, up to 3 active goals, Weekly Sprints, and community access. Many users find Free sufficient for getting started. Upgrade to Pro or Family when you want advanced features like AI coaching, unlimited goals, or family coordination.',
  },
  {
    category: 'pricing',
    question: 'How much does Kaiz Pro cost?',
    answer: 'Kaiz Pro is $9.99/month when billed monthly, or $95.88/year (which saves you 20%—that\'s $7.99/month!). Pro includes everything in Free plus AI Scrum Master, unlimited goals and challenges, advanced analytics, Focus Mode with stats, Knowledge Hub, and priority support.',
  },
  {
    category: 'pricing',
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes! Both Pro and Family plans come with a 14-day free trial. No credit card required to start—just sign up and start using all features immediately. You\'ll only be asked for payment info if you decide to continue after the trial.',
  },
  {
    category: 'pricing',
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. There are no contracts or cancellation fees. You can cancel your subscription at any time from your account settings. You\'ll retain access to paid features until the end of your current billing period, then automatically downgrade to Free.',
  },
  {
    category: 'pricing',
    question: 'What happens to my data if I cancel?',
    answer: 'Your data is always yours. If you cancel, you\'ll keep access until the end of your billing period. After that, you\'ll be downgraded to Free—you can still access your data, but some features will be limited. We keep your full data safe for 90 days in case you want to reactivate.',
  },
  {
    category: 'pricing',
    question: 'Do you offer refunds?',
    answer: 'If you\'re not satisfied within the first 30 days of a new paid subscription, contact our support team for a full refund—no questions asked. After 30 days, we handle refund requests on a case-by-case basis.',
  },
  {
    category: 'privacy',
    question: 'Is my data secure?',
    answer: 'Security is our top priority. We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Sensitive financial data can be stored in local-only mode if you prefer. We undergo regular security audits and comply with SOC 2 Type II standards.',
  },
  {
    category: 'privacy',
    question: 'Do you sell my data?',
    answer: 'Never. We will never sell, rent, or share your personal data with third parties for marketing purposes. Your data is used solely to provide and improve the Kaiz service. Our business model is subscriptions, not advertising.',
  },
  {
    category: 'privacy',
    question: 'Can I export my data?',
    answer: 'Yes! You can export all your data at any time in standard formats (JSON, CSV). Go to Settings > Data & Privacy > Export Data. Your data belongs to you, and we make it easy to take it with you.',
  },
  {
    category: 'privacy',
    question: 'Are you GDPR compliant?',
    answer: 'Yes, we\'re fully compliant with GDPR (for EU users), CCPA (for California users), and other major privacy regulations. You have the right to access, correct, and delete your data. We also have a Data Processing Agreement (DPA) available for enterprise customers.',
  },
  {
    category: 'mobile',
    question: 'What platforms is Kaiz available on?',
    answer: 'Kaiz is available as a native iOS app (iPhone and iPad), native Android app, and a full-featured web application. All platforms sync seamlessly via the cloud, so you can start a task on your phone and complete it on your computer.',
  },
  {
    category: 'mobile',
    question: 'Does Kaiz work offline?',
    answer: 'Yes! The mobile apps support offline mode for core features including task management, habit tracking, and note-taking. Your changes sync automatically when you\'re back online. Some features like AI coaching and bank sync require an internet connection.',
  },
  {
    category: 'mobile',
    question: 'Can I use widgets on my home screen?',
    answer: 'Absolutely! Both iOS and Android apps include home screen widgets for quick access to your daily tasks, habit streaks, Life Wheel snapshot, and quick capture. On iOS, you can also use Shortcuts integration for advanced automation.',
  },
  {
    category: 'mobile',
    question: 'Is there Apple Watch / Wear OS support?',
    answer: 'Yes! Our Apple Watch app lets you check tasks, log habits, start Focus sessions, and quick-capture thoughts from your wrist. Wear OS support is currently in beta and will be fully launched soon.',
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_60%)]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </span>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Frequently Asked
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {' '}Questions
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Everything you need to know about Kaiz . Can't find what you're 
              looking for? Reach out to our support team.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No questions found</h3>
              <p className="text-slate-400">
                Try adjusting your search or browse a different category.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-white pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === index ? 'auto' : 0,
                      opacity: openFaq === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 border-t border-slate-700/50 pt-4">
                      <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                      <span className="inline-block mt-4 px-3 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-full capitalize">
                        {faq.category}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-slate-400">
              Our support team is here to help you get the most out of Kaiz.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center"
            >
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Live Chat</h3>
              <p className="text-slate-400 mb-6">
                Chat with our support team in real-time. Average response time: under 5 minutes.
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors">
                Start Chat
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center"
            >
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Email Support</h3>
              <p className="text-slate-400 mb-6">
                Send us a detailed message. We'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:support@kaiz.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-600 transition-colors"
              >
                support@kaiz.com
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-slate-700/50 rounded-3xl p-12"
          >
            <Sparkles className="w-10 h-10 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Join thousands of people transforming their lives with Kaiz .
              Start free, upgrade when you're ready.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
}
