// Content Management Types - Editable from Admin Panel

export interface HeroContent {
  id: string;
  tagline: string;
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  updatedAt: string;
}

export interface AboutFeature {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  bulletPoints: string[];
  example?: {
    scenario: string;
    outcome: string;
  };
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  updatedAt: string;
}

export interface AboutPageContent {
  hero: {
    tagline: string;
    headline: string;
    subheadline: string;
    manifesto: string;
  };
  philosophy: {
    title: string;
    points: Array<{
      text: string;
      highlight: string;
    }>;
    conclusion: string;
  };
  features: AboutFeature[];
  promise: {
    title: string;
    subtitle: string;
    principles: string[];
    cta: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatarUrl?: string;
  quote: string;
  rating: number;
  metrics?: {
    label: string;
    before: string;
    after: string;
  };
  featured: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'features' | 'pricing' | 'privacy' | 'technical';
  order: number;
  isActive: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  order: number;
  isActive: boolean;
}

// Knowledge Hub Types
export interface KnowledgeCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  itemCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface KnowledgeItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  readTimeMinutes: number;
  tags: string[];
  icon: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  viewCount: number;
  helpfulCount: number;
  displayOrder: number;
  searchKeywords?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    discord?: string;
    youtube?: string;
  };
  contactEmail: string;
  supportEmail: string;
  analyticsId?: string;
  maintenanceMode: boolean;
  announcementBanner?: {
    text: string;
    link?: string;
    isActive: boolean;
  };
}

// Default content for the About page (can be overridden from admin)
export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  hero: {
    tagline: "Run your life like a product team",
    headline: "Kaiz ",
    subheadline: "Turning \"I should\" into \"it shipped\" — with reality, metrics, and compounding improvements.",
    manifesto: "Not by storing tasks, but by running your life with the same system that ships world-class software: Agile."
  },
  philosophy: {
    title: "Life as a Product, Not a Pile of Tasks",
    points: [
      { text: "Pick a goal", highlight: "not 200 wishes" },
      { text: "Commit within capacity", highlight: "not fantasy schedules" },
      { text: "Execute with focus", highlight: "not scattered effort" },
      { text: "Measure what happened", highlight: "not what you hoped" },
      { text: "Improve one thing every week", highlight: "so your system evolves" }
    ],
    conclusion: "This is how you stop repeating the same week forever."
  },
  features: [],
  promise: {
    title: "The Kaiz Promise",
    subtitle: "The infrastructure for a high-velocity life.",
    principles: [
      "Not \"more productivity.\"",
      "Not \"more hustle.\"",
      "A better operating system that compounds."
    ],
    cta: "Commit → Execute → Measure → Improve → Repeat"
  }
};

export const KAIZ_FEATURES: AboutFeature[] = [
  {
    id: '1',
    slug: 'life-wheel',
    title: 'The Life Wheel That Makes "Balance" Real',
    subtitle: 'Balance shouldn\'t be a mood. It should be visible.',
    description: 'Kaiz tracks every action against the 9 Life Wheel dimensions and shows you what you\'re investing in (and what you\'re neglecting), how your life is trending over weeks/months, and when your "Career spike" is silently killing "Family" or "Health".',
    bulletPoints: [
      'Track investments across 9 life dimensions',
      'Visualize life trends over weeks and months',
      'Get alerts when one area dominates others',
      'Receive smart suggestions for rebalancing'
    ],
    example: {
      scenario: 'You finish a sprint with 90% Career tasks and zero Relationships.',
      outcome: 'Kaiz flags it and suggests: "Add one Q2 Family task next sprint: \'Plan Saturday outing (2 pts)\'."'
    },
    icon: '🎡',
    color: 'from-purple-500 to-pink-500',
    order: 1,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    slug: 'weekly-sprints',
    title: 'Weekly Sprints That Respect Physics',
    subtitle: 'Capacity + Guardrails for realistic planning.',
    description: 'Kaiz makes you choose what fits — and protects you from overcommit. Every week you run a real Sprint with planned points vs completed points, velocity trend, churn tracking, and carryover debt visibility.',
    bulletPoints: [
      'Planned points vs completed points tracking',
      'Velocity trend (your real capacity)',
      'Churn detection (mid-week additions)',
      'Carryover debt awareness'
    ],
    example: {
      scenario: 'Your average velocity is 28 points. Sunday planning tries to commit 55.',
      outcome: 'Kaiz guards: "Overcommit risk: +27 points. Pick what ships."'
    },
    icon: '🏃',
    color: 'from-blue-500 to-cyan-500',
    order: 2,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    slug: 'eisenhower-matrix',
    title: 'Prioritization That Actually Changes Decisions',
    subtitle: 'Eisenhower Matrix built into everything.',
    description: 'Kaiz turns your backlog into a decision engine. You can instantly view everything in the Eisenhower Matrix: Q1 (urgent crises), Q2 (growth zone), Q3 (noise), Q4 (waste).',
    bulletPoints: [
      'Q1: Urgent crises - handle immediately',
      'Q2: Growth zone - where your future is built',
      'Q3: Noise - delegate or minimize',
      'Q4: Waste - eliminate ruthlessly'
    ],
    example: {
      scenario: 'You keep living in Q1 firefighting mode.',
      outcome: 'Kaiz nudges you to reclaim Q2 with one strategic task. That\'s how your life stops being reactive.'
    },
    icon: '🎯',
    color: 'from-red-500 to-orange-500',
    order: 3,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    slug: 'command-center',
    title: 'Calendar as the Command Center',
    subtitle: 'Past • Current • Future Sprints in one view.',
    description: 'The calendar isn\'t just dates — it\'s where your life becomes operational. Switch sprints in one tap, see tasks with status + Eisenhower + life dimension, timebox into real blocks, and overlay Google/Outlook calendars.',
    bulletPoints: [
      'Switch Past / Current / Future sprints instantly',
      'Tasks visible with status, priority, and dimension',
      'Timebox tasks into real blocks (not wishful thinking)',
      'Overlay external calendars read-only'
    ],
    example: {
      scenario: '"This week is crushed by meetings"',
      outcome: 'Kaiz sees your blocked time and warns when sprint scope doesn\'t fit.'
    },
    icon: '📅',
    color: 'from-green-500 to-emerald-500',
    order: 4,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    slug: 'focus-mode',
    title: 'Focus Mode That Produces Deep Work',
    subtitle: 'Not just timers — work done under focus.',
    description: 'Kaiz doesn\'t track "time spent." It tracks work done under focus. Focus sessions link to tasks (so time has meaning), with distraction capture and analytics showing where your deep work is actually going.',
    bulletPoints: [
      'Focus sessions linked to specific tasks',
      'Distraction capture without breaking flow',
      'Analytics showing deep work distribution',
      'Execution telemetry — for humans'
    ],
    example: {
      scenario: 'You think you\'re working on "Personal Growth"',
      outcome: 'But 90% of deep work is "Work Q1 emergencies." Kaiz shows the truth and helps you rebalance.'
    },
    icon: '🎧',
    color: 'from-indigo-500 to-purple-500',
    order: 5,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    slug: 'universal-intake',
    title: 'Universal Intake: Capture Anything',
    subtitle: 'Zero-friction capture → structured action.',
    description: 'Forward, upload, or screenshot anything: emails, PDFs, images, voice notes, random thoughts, documents. Kaiz extracts details and proposes outputs (always with confirmation).',
    bulletPoints: [
      'Capture emails, PDFs, images, voice notes',
      'AI extracts details automatically',
      'Proposes Tasks, Events, Epics',
      'Attachments stored and searchable forever'
    ],
    example: {
      scenario: 'You screenshot a contractor quote.',
      outcome: 'Kaiz proposes: Epic: "Bathroom Renovation" with tasks: "Order materials (5)", "Schedule plumber (3)", "Pick tile (2)"'
    },
    icon: '📥',
    color: 'from-yellow-500 to-orange-500',
    order: 6,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    slug: 'family-squads',
    title: 'Family Squads: Shared Life Without Shared Secrets',
    subtitle: 'Run a household like a team — with privacy.',
    description: 'Shared chores sprint, shared calendar events, points/rewards system for kids, parent/child firewall so children cannot see journals or restricted items.',
    bulletPoints: [
      'Shared chores and family sprints',
      'Shared calendar for birthdays, school events',
      'Points/rewards gamification for kids',
      'Parent/child privacy firewall'
    ],
    example: {
      scenario: 'Kids see: "Clean room (2)", "Take trash out (1)"',
      outcome: 'Parents keep: private notes, and sensitive life ops completely private.'
    },
    icon: '👨‍👩‍👧‍👦',
    color: 'from-pink-500 to-rose-500',
    order: 7,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    slug: 'challenges',
    title: 'Challenges That Turn Goals Into Play',
    subtitle: 'Steps, Streaks, and Programs.',
    description: 'Run structured challenges that feel like a game but work like a system: "10k steps daily", "No sugar sprint", "Debt payoff program". Get recurrence + streak tracking, sprint integration, and community leaderboards.',
    bulletPoints: [
      'Recurrence + streak tracking',
      'Sprint velocity integration (optional)',
      'Community participation + leaderboards',
      'Weekly retrospective insights'
    ],
    example: {
      scenario: 'A steps challenge shows you fail Tuesdays consistently.',
      outcome: 'Kaiz suggests: "Add a 1-point \'evening walk\' block Tuesday." That\'s how behavior changes.'
    },
    icon: '🏆',
    color: 'from-amber-500 to-yellow-500',
    order: 9,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '10',
    slug: 'ai-scrum-master',
    title: 'The AI Scrum Master',
    subtitle: 'The Coach That Protects Your System.',
    description: 'Not a chatbot. A role. Kaiz Copilot monitors your sprint and intervenes intelligently. Hard rule: AI never changes your life without consent. It proposes. You decide.',
    bulletPoints: [
      '"You\'re overcommitted"',
      '"Your Q2 has been empty for 3 weeks"',
      '"Carryover debt is trending up"',
      '"Focus time collapsed — schedule 2 protected blocks"'
    ],
    example: {
      scenario: 'Energy drops detected from your patterns.',
      outcome: 'AI triggers Motivation Hub content and suggests Book Summary for skill gaps (focus, planning, etc.)'
    },
    icon: '🤖',
    color: 'from-violet-500 to-purple-500',
    order: 10,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '11',
    slug: 'motivation-hub',
    title: 'Motivation Hub: Precision Coaching',
    subtitle: 'Not quotes — targeted, trackable, personal.',
    description: 'Motivation tagged to life dimensions, save/favorite/collections, automation rules tied to your real performance. Motivation becomes a feature that moves the needle, not wallpaper.',
    bulletPoints: [
      'Tagged to life dimensions',
      'Save/favorite/collections',
      'Automation rules tied to performance',
      'Triggered by real metrics, not random'
    ],
    example: {
      scenario: 'Sprint health score drops, Health dimension neglected.',
      outcome: 'Recovery prompts + "minimum viable workout" micro-challenge + growth discipline prompt.'
    },
    icon: '💪',
    color: 'from-orange-500 to-red-500',
    order: 11,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '12',
    slug: 'knowledge-hub',
    title: 'Knowledge Hub: Book Summaries → Action',
    subtitle: 'Learning treated like shipping.',
    description: 'Summaries broken into digestible slides, reading state tracked, AI recommends the right summary at the right time. Learning becomes execution, not entertainment.',
    bulletPoints: [
      'Summaries as digestible slides',
      'Reading state tracked',
      'AI-timed recommendations',
      'Convert insights to tasks'
    ],
    example: {
      scenario: 'Your sprint shows churn + scattered focus.',
      outcome: 'Kaiz suggests a deep work summary, then offers to create a "Focus Protocol" process improvement task.'
    },
    icon: '📚',
    color: 'from-cyan-500 to-blue-500',
    order: 12,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '13',
    slug: 'reports',
    title: 'Reports: One Place for Evidence',
    subtitle: 'Kaiz shows you. It doesn\'t ask how you feel.',
    description: 'Sprint outcomes, focus analytics, life wheel trends, exports. Your life becomes measurable — and therefore improvable.',
    bulletPoints: [
      'Sprint outcomes: planned vs done, velocity, churn',
      'Focus analytics: deep work by dimension/epic',
      'Life wheel trends: neglected areas, recoveries',
      'Exports: PDF/CSV, portable, yours'
    ],
    example: {
      scenario: 'You want to see your progress.',
      outcome: 'Not "how do you feel about progress?" — hard data on what actually happened.'
    },
    icon: '📊',
    color: 'from-slate-500 to-zinc-500',
    order: 13,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '14',
    slug: 'community',
    title: 'Community That Scales Your Operating System',
    subtitle: 'An ecosystem, not a solo tool.',
    description: 'Forums for playbooks and workflows, template marketplace, events and e-conferences with tickets, challenges that bring people into structured execution.',
    bulletPoints: [
      'Forums for playbooks and workflows',
      'Template marketplace (task/epic/program bundles)',
      'Events and e-conferences with tickets',
      'Challenges with community participation'
    ],
    example: {
      scenario: 'You don\'t just use Kaiz.',
      outcome: 'You join a system of operators — share, learn, compete, grow together.'
    },
    icon: '🌐',
    color: 'from-blue-500 to-indigo-500',
    order: 14,
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: '15',
    slug: 'privacy-trust',
    title: 'Built for Trust: Offline-First + Privacy-First',
    subtitle: 'Real life, not perfect Wi-Fi.',
    description: 'Works offline (tasks, focus sessions, intake), deterministic sync, zero-knowledge encryption for sensitive zones, B2B "Company Pays, User Owns" model.',
    bulletPoints: [
      'Works offline — tasks, focus, intake',
      'Deterministic sync and conflict handling',
      'Zero-knowledge encryption for sensitive data',
      'Employer sees only aggregate metrics, never personal content'
    ],
    example: {
      scenario: 'Your employer pays for Kaiz.',
      outcome: 'They see adoption metrics only. Never your task titles, life wheel scores, journals, or personal content. Safe to use at work.'
    },
    icon: '🔒',
    color: 'from-gray-500 to-slate-500',
    order: 15,
    isActive: true,
    updatedAt: new Date().toISOString()
  }
];
