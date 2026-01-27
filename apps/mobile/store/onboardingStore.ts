/**
 * Onboarding Store
 * 
 * Manages the new engaging onboarding flow that collects:
 * - Basic info (name, email) - marketing friendly
 * - Plan type (Individual, Family, Corporate)
 * - Life goals and task templates selection
 * - Important dates (birthdays, anniversaries)
 * - Work preferences
 * 
 * Goal: User enters with an optimum list of tasks/epics for 2-3 sprints
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Plan types
export type PlanType = 'individual' | 'family' | 'corporate';

// Task template categories for quick selection
export interface TaskTemplateCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    templates: TaskTemplate[];
}

export interface TaskTemplate {
    id: string;
    title: string;
    description: string;
    storyPoints: number;
    lifeWheelAreaId: string;
    eisenhowerQuadrant: string;
    isRecurring: boolean;
    recurrencePattern?: {
        frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
        interval: number;
    };
    suggestedSprint: 'current' | 'next' | 'backlog';
}

export interface EpicTemplate {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    lifeWheelAreaId: string;
    taskTemplateIds: string[];
    estimatedWeeks: number;
}

// Important dates (birthdays, anniversaries, etc.)
export interface ImportantDate {
    id: string;
    personName: string;
    relationship: 'family' | 'friend' | 'colleague' | 'other';
    dateType: 'birthday' | 'anniversary' | 'other';
    date: string; // MM-DD format
    year?: number; // optional year for age calculation
    reminderDaysBefore: number;
}

// Onboarding data structure
export interface OnboardingData {
    // Step 1: Welcome & Name
    firstName: string;
    lastName: string;
    
    // Step 2: Plan Selection
    planType: PlanType;
    corporateCode?: string; // For corporate users - employer code
    familyRole?: 'owner' | 'adult' | 'child';
    
    // Step 3: Life Wheel Assessment (1-10 ratings)
    lifeWheelScores: Record<string, number>; // areaId -> score
    
    // Step 4: Quick Goals (What do you want to achieve?)
    selectedGoalCategories: string[];
    selectedBundleId?: string; // Quick start bundle
    
    // Step 5: Task Templates Selection
    selectedTaskTemplates: string[];
    selectedEpicTemplates: string[];
    
    // Step 6: Important Dates (Optional)
    importantDates: ImportantDate[];
    
    // Step 7: Work Style (simplified)
    preferredWorkStyle: 'morning' | 'afternoon' | 'evening' | 'flexible';
    weeklyCommitmentHours: number;
    
    // Marketing-friendly optional data
    howDidYouHear?: string;
    mainGoal?: string;
}

// Pre-defined goal categories with visual appeal
export const GOAL_CATEGORIES: TaskTemplateCategory[] = [
    {
        id: 'health',
        name: 'Health & Fitness',
        icon: '💪',
        color: '#10B981',
        description: 'Exercise, nutrition, sleep',
        templates: [
            {
                id: 'health-1',
                title: 'Morning workout routine',
                description: '30 min exercise to start the day',
                storyPoints: 2,
                lifeWheelAreaId: 'life-health',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'daily', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'health-2',
                title: 'Meal prep for the week',
                description: 'Prepare healthy meals in advance',
                storyPoints: 3,
                lifeWheelAreaId: 'life-health',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'health-3',
                title: 'Schedule annual checkup',
                description: 'Book doctor appointment',
                storyPoints: 1,
                lifeWheelAreaId: 'life-health',
                eisenhowerQuadrant: 'q2',
                isRecurring: false,
                suggestedSprint: 'next',
            },
            {
                id: 'health-4',
                title: 'Track daily water intake',
                description: 'Drink 8 glasses of water',
                storyPoints: 1,
                lifeWheelAreaId: 'life-health',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'daily', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'health-5',
                title: 'Evening walk or stretch',
                description: '15 min wind-down activity',
                storyPoints: 1,
                lifeWheelAreaId: 'life-health',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'daily', interval: 1 },
                suggestedSprint: 'current',
            },
        ],
    },
    {
        id: 'career',
        name: 'Career & Work',
        icon: '💼',
        color: '#3B82F6',
        description: 'Professional growth, skills',
        templates: [
            {
                id: 'career-1',
                title: 'Update resume/LinkedIn',
                description: 'Keep professional profile current',
                storyPoints: 3,
                lifeWheelAreaId: 'life-career',
                eisenhowerQuadrant: 'q2',
                isRecurring: false,
                suggestedSprint: 'next',
            },
            {
                id: 'career-2',
                title: 'Learn a new skill',
                description: '1 hour of professional development',
                storyPoints: 2,
                lifeWheelAreaId: 'life-career',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'career-3',
                title: 'Network with a colleague',
                description: 'Build professional relationships',
                storyPoints: 2,
                lifeWheelAreaId: 'life-career',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'biweekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'career-4',
                title: 'Review career goals',
                description: 'Quarterly career reflection',
                storyPoints: 2,
                lifeWheelAreaId: 'life-career',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 3 },
                suggestedSprint: 'backlog',
            },
        ],
    },
    {
        id: 'finance',
        name: 'Finance & Money',
        icon: '💰',
        color: '#F59E0B',
        description: 'Budget, savings, investments',
        templates: [
            {
                id: 'finance-1',
                title: 'Review weekly spending',
                description: 'Check expenses against budget',
                storyPoints: 1,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'finance-2',
                title: 'Pay monthly bills',
                description: 'Ensure all bills are paid on time',
                storyPoints: 2,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q1',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'finance-3',
                title: 'Review investment portfolio',
                description: 'Check investments performance',
                storyPoints: 2,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'next',
            },
            {
                id: 'finance-4',
                title: 'Set savings goal',
                description: 'Define monthly savings target',
                storyPoints: 2,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q2',
                isRecurring: false,
                suggestedSprint: 'current',
            },
        ],
    },
    {
        id: 'relationships',
        name: 'Family & Relationships',
        icon: '❤️',
        color: '#EF4444',
        description: 'Quality time, connections',
        templates: [
            {
                id: 'relationships-1',
                title: 'Family dinner night',
                description: 'Weekly quality time with family',
                storyPoints: 2,
                lifeWheelAreaId: 'life-relationships',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'relationships-2',
                title: 'Call a friend or relative',
                description: 'Stay connected with loved ones',
                storyPoints: 1,
                lifeWheelAreaId: 'life-relationships',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'relationships-3',
                title: 'Date night',
                description: 'Quality time with partner',
                storyPoints: 3,
                lifeWheelAreaId: 'life-relationships',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'biweekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'relationships-4',
                title: 'Send thank you message',
                description: 'Express gratitude to someone',
                storyPoints: 1,
                lifeWheelAreaId: 'life-relationships',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
        ],
    },
    {
        id: 'growth',
        name: 'Personal Growth',
        icon: '📚',
        color: '#8B5CF6',
        description: 'Learning, mindfulness, hobbies',
        templates: [
            {
                id: 'growth-1',
                title: 'Read for 30 minutes',
                description: 'Daily reading habit',
                storyPoints: 1,
                lifeWheelAreaId: 'life-growth',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'daily', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'growth-2',
                title: 'Morning meditation',
                description: '10 min mindfulness practice',
                storyPoints: 1,
                lifeWheelAreaId: 'life-growth',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'daily', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'growth-3',
                title: 'Journal reflection',
                description: 'Write about the day',
                storyPoints: 1,
                lifeWheelAreaId: 'life-growth',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'daily', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'growth-4',
                title: 'Learn something new',
                description: 'Online course or tutorial',
                storyPoints: 2,
                lifeWheelAreaId: 'life-growth',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
        ],
    },
    {
        id: 'fun',
        name: 'Fun & Recreation',
        icon: '🎮',
        color: '#06B6D4',
        description: 'Hobbies, entertainment, rest',
        templates: [
            {
                id: 'fun-1',
                title: 'Hobby time',
                description: 'Enjoy your favorite activity',
                storyPoints: 2,
                lifeWheelAreaId: 'life-fun',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'fun-2',
                title: 'Plan a fun activity',
                description: 'Schedule something enjoyable',
                storyPoints: 1,
                lifeWheelAreaId: 'life-fun',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'fun-3',
                title: 'Digital detox hour',
                description: 'Unplug from devices',
                storyPoints: 1,
                lifeWheelAreaId: 'life-fun',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'daily', interval: 1 },
                suggestedSprint: 'current',
            },
        ],
    },
    {
        id: 'home',
        name: 'Home & Environment',
        icon: '🏡',
        color: '#84CC16',
        description: 'Organization, cleaning, projects',
        templates: [
            {
                id: 'home-1',
                title: 'Weekly cleaning routine',
                description: 'Keep living space tidy',
                storyPoints: 2,
                lifeWheelAreaId: 'life-environment',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'home-2',
                title: 'Declutter one area',
                description: 'Organize a drawer, closet, or room',
                storyPoints: 2,
                lifeWheelAreaId: 'life-environment',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'home-3',
                title: 'Home maintenance check',
                description: 'Check for repairs needed',
                storyPoints: 2,
                lifeWheelAreaId: 'life-environment',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'next',
            },
        ],
    },
    {
        id: 'social',
        name: 'Social Life',
        icon: '👥',
        color: '#EC4899',
        description: 'Friends, community, events',
        templates: [
            {
                id: 'social-1',
                title: 'Plan a social outing',
                description: 'Meet friends for an activity',
                storyPoints: 2,
                lifeWheelAreaId: 'life-social',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'biweekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'social-2',
                title: 'Attend community event',
                description: 'Participate in local activities',
                storyPoints: 2,
                lifeWheelAreaId: 'life-social',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'next',
            },
            {
                id: 'social-3',
                title: 'Reconnect with old friend',
                description: 'Reach out to someone you miss',
                storyPoints: 1,
                lifeWheelAreaId: 'life-social',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'next',
            },
        ],
    },
    {
        id: 'bills',
        name: 'Bills & Reminders',
        icon: '💳',
        color: '#DC2626',
        description: 'Never miss a payment',
        templates: [
            {
                id: 'bills-1',
                title: 'Credit card payment due',
                description: 'Pay credit card before due date',
                storyPoints: 1,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q1',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'bills-2',
                title: 'Rent/Mortgage payment',
                description: 'Monthly housing payment',
                storyPoints: 1,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q1',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'bills-3',
                title: 'Utility bills (Electric/Gas/Water)',
                description: 'Pay monthly utilities',
                storyPoints: 1,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q1',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'bills-4',
                title: 'Internet/Phone bill',
                description: 'Pay monthly telecom bills',
                storyPoints: 1,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q1',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'bills-5',
                title: 'Insurance premium',
                description: 'Pay insurance (health/car/home)',
                storyPoints: 1,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q1',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'bills-6',
                title: 'Subscription review',
                description: 'Review and cancel unused subscriptions',
                storyPoints: 2,
                lifeWheelAreaId: 'life-finance',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'monthly', interval: 3 },
                suggestedSprint: 'backlog',
            },
        ],
    },
    {
        id: 'family-calls',
        name: 'Stay Connected',
        icon: '📞',
        color: '#7C3AED',
        description: 'Regular check-ins with loved ones',
        templates: [
            {
                id: 'call-1',
                title: 'Call Mom',
                description: 'Weekly check-in with mom',
                storyPoints: 1,
                lifeWheelAreaId: 'life-relationships',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'call-2',
                title: 'Call Dad',
                description: 'Weekly check-in with dad',
                storyPoints: 1,
                lifeWheelAreaId: 'life-relationships',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'call-3',
                title: 'Video call with siblings',
                description: 'Bi-weekly family video chat',
                storyPoints: 1,
                lifeWheelAreaId: 'life-relationships',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'biweekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'call-4',
                title: 'Check in with grandparents',
                description: 'Regular call to grandparents',
                storyPoints: 1,
                lifeWheelAreaId: 'life-relationships',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'weekly', interval: 1 },
                suggestedSprint: 'current',
            },
            {
                id: 'call-5',
                title: 'Catch up with best friend',
                description: 'Regular friend check-in',
                storyPoints: 1,
                lifeWheelAreaId: 'life-relationships',
                eisenhowerQuadrant: 'q2',
                isRecurring: true,
                recurrencePattern: { frequency: 'biweekly', interval: 1 },
                suggestedSprint: 'current',
            },
        ],
    },
];

// Epic templates for bigger goals
export const EPIC_TEMPLATES: EpicTemplate[] = [
    {
        id: 'epic-fitness-journey',
        title: '🏃 Fitness Journey',
        description: 'Build a sustainable exercise routine',
        icon: '🏃',
        color: '#10B981',
        lifeWheelAreaId: 'life-health',
        taskTemplateIds: ['health-1', 'health-4', 'health-5'],
        estimatedWeeks: 8,
    },
    {
        id: 'epic-financial-freedom',
        title: '💎 Financial Freedom',
        description: 'Get your finances in order',
        icon: '💎',
        color: '#F59E0B',
        lifeWheelAreaId: 'life-finance',
        taskTemplateIds: ['finance-1', 'finance-2', 'finance-4'],
        estimatedWeeks: 12,
    },
    {
        id: 'epic-learn-skill',
        title: '🎓 Learn New Skill',
        description: 'Master something new in 30 days',
        icon: '🎓',
        color: '#8B5CF6',
        lifeWheelAreaId: 'life-growth',
        taskTemplateIds: ['career-2', 'growth-4'],
        estimatedWeeks: 4,
    },
    {
        id: 'epic-relationship-boost',
        title: '💕 Relationship Boost',
        description: 'Strengthen your connections',
        icon: '💕',
        color: '#EF4444',
        lifeWheelAreaId: 'life-relationships',
        taskTemplateIds: ['relationships-1', 'relationships-2', 'relationships-3'],
        estimatedWeeks: 8,
    },
    {
        id: 'epic-mindfulness',
        title: '🧘 Mindfulness Practice',
        description: 'Build daily meditation habit',
        icon: '🧘',
        color: '#8B5CF6',
        lifeWheelAreaId: 'life-growth',
        taskTemplateIds: ['growth-2', 'growth-3'],
        estimatedWeeks: 6,
    },
    {
        id: 'epic-home-organization',
        title: '🏠 Home Organization',
        description: 'Transform your living space',
        icon: '🏠',
        color: '#84CC16',
        lifeWheelAreaId: 'life-environment',
        taskTemplateIds: ['home-1', 'home-2'],
        estimatedWeeks: 4,
    },
    {
        id: 'epic-reading-challenge',
        title: '📖 Reading Challenge',
        description: 'Read 12 books this year',
        icon: '📖',
        color: '#8B5CF6',
        lifeWheelAreaId: 'life-growth',
        taskTemplateIds: ['growth-1'],
        estimatedWeeks: 52,
    },
    {
        id: 'epic-career-growth',
        title: '🚀 Career Growth',
        description: 'Level up professionally',
        icon: '🚀',
        color: '#3B82F6',
        lifeWheelAreaId: 'life-career',
        taskTemplateIds: ['career-1', 'career-2', 'career-3'],
        estimatedWeeks: 12,
    },
];

// Life Wheel Assessment - Engaging questions to identify areas for improvement
export interface LifeWheelQuestion {
    id: string;
    areaId: string;      // Maps to life wheel area
    categoryId: string;  // Maps to GOAL_CATEGORIES
    question: string;
    subtext: string;
    icon: string;
    lowScoreMessage: string;   // Shown when score is low (1-4)
    highScoreMessage: string;  // Shown when score is high (8-10)
    suggestedTemplates: string[]; // Template IDs to suggest when score is low
}

export const LIFE_WHEEL_ASSESSMENT: LifeWheelQuestion[] = [
    {
        id: 'assess-health',
        areaId: 'life-health',
        categoryId: 'health',
        question: "How energized and healthy do you feel?",
        subtext: "Think about your energy levels, fitness, and overall wellbeing",
        icon: '💪',
        lowScoreMessage: "Let's boost your energy! Small daily habits make a big difference.",
        highScoreMessage: "Amazing! You're taking great care of yourself. Keep it up!",
        suggestedTemplates: ['health-1', 'health-2', 'health-4', 'health-5'],
    },
    {
        id: 'assess-career',
        areaId: 'life-career',
        categoryId: 'career',
        question: "How satisfied are you with your career progress?",
        subtext: "Consider your professional growth, skills, and fulfillment",
        icon: '💼',
        lowScoreMessage: "Time to invest in your future! Let's build some career-boosting habits.",
        highScoreMessage: "You're crushing it professionally! Let's keep that momentum.",
        suggestedTemplates: ['career-1', 'career-2', 'career-3', 'career-4'],
    },
    {
        id: 'assess-finance',
        areaId: 'life-finance',
        categoryId: 'finance',
        question: "How in control of your finances do you feel?",
        subtext: "Think about budgeting, savings, and financial peace of mind",
        icon: '💰',
        lowScoreMessage: "Financial freedom starts with small steps. Let's build good money habits!",
        highScoreMessage: "Great financial discipline! Let's keep you on track.",
        suggestedTemplates: ['finance-1', 'finance-2', 'finance-3', 'finance-4'],
    },
    {
        id: 'assess-relationships',
        areaId: 'life-relationships',
        categoryId: 'relationships',
        question: "How connected do you feel to your loved ones?",
        subtext: "Consider the quality of your relationships and time spent together",
        icon: '❤️',
        lowScoreMessage: "Relationships need nurturing. Let's help you stay connected!",
        highScoreMessage: "Beautiful! Strong relationships are the foundation of happiness.",
        suggestedTemplates: ['relationships-1', 'relationships-2', 'relationships-3', 'call-1', 'call-2'],
    },
    {
        id: 'assess-growth',
        areaId: 'life-growth',
        categoryId: 'growth',
        question: "How much are you learning and growing?",
        subtext: "Think about personal development, new skills, and self-improvement",
        icon: '📚',
        lowScoreMessage: "Growth mindset activated! Small daily learning adds up to big results.",
        highScoreMessage: "You're a lifelong learner! Let's keep feeding that curiosity.",
        suggestedTemplates: ['growth-1', 'growth-2', 'growth-3', 'growth-4'],
    },
    {
        id: 'assess-fun',
        areaId: 'life-fun',
        categoryId: 'fun',
        question: "How much joy and fun are in your life?",
        subtext: "Consider hobbies, entertainment, and doing things you love",
        icon: '🎮',
        lowScoreMessage: "Life should be fun! Let's make sure you have time for what you enjoy.",
        highScoreMessage: "You know how to enjoy life! Balance is beautiful.",
        suggestedTemplates: ['fun-1', 'fun-2', 'fun-3'],
    },
    {
        id: 'assess-home',
        areaId: 'life-environment',
        categoryId: 'home',
        question: "How organized and peaceful is your living space?",
        subtext: "Think about your home environment and how it makes you feel",
        icon: '🏡',
        lowScoreMessage: "A calm space = calm mind. Let's create your sanctuary!",
        highScoreMessage: "Your space is your haven! Great job maintaining it.",
        suggestedTemplates: ['home-1', 'home-2', 'home-3'],
    },
    {
        id: 'assess-social',
        areaId: 'life-social',
        categoryId: 'social',
        question: "How active is your social life?",
        subtext: "Consider friendships, community involvement, and social activities",
        icon: '👥',
        lowScoreMessage: "Humans are social creatures! Let's help you connect more.",
        highScoreMessage: "You're a social butterfly! Keep those connections strong.",
        suggestedTemplates: ['social-1', 'social-2', 'social-3'],
    },
];

// Quick Start Bundles - Pre-packaged task selections for easy onboarding
export interface QuickStartBundle {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    targetAudience: string;
    templateIds: string[];
    epicIds: string[];
}

export const QUICK_START_BUNDLES: QuickStartBundle[] = [
    {
        id: 'bundle-balanced',
        name: '⚖️ Balanced Life',
        description: 'A little bit of everything for a well-rounded week',
        icon: '⚖️',
        color: '#10B981',
        targetAudience: 'For those wanting overall balance',
        templateIds: ['health-1', 'finance-1', 'relationships-2', 'growth-1', 'home-1'],
        epicIds: [],
    },
    {
        id: 'bundle-fitness',
        name: '🏋️ Fitness Focus',
        description: 'Get in shape with consistent workout routines',
        icon: '🏋️',
        color: '#EF4444',
        targetAudience: 'For fitness enthusiasts',
        templateIds: ['health-1', 'health-2', 'health-4', 'health-5'],
        epicIds: ['epic-fitness-journey'],
    },
    {
        id: 'bundle-financial',
        name: '💎 Money Master',
        description: 'Take control of your finances',
        icon: '💎',
        color: '#F59E0B',
        targetAudience: 'For financial goals',
        templateIds: ['finance-1', 'finance-2', 'finance-3', 'bills-1', 'bills-2', 'bills-3'],
        epicIds: ['epic-financial-freedom'],
    },
    {
        id: 'bundle-family',
        name: '👨‍👩‍👧‍👦 Family First',
        description: 'Stay connected with loved ones',
        icon: '👨‍👩‍👧‍👦',
        color: '#EC4899',
        targetAudience: 'For family-focused individuals',
        templateIds: ['relationships-1', 'relationships-2', 'relationships-3', 'call-1', 'call-2', 'call-4'],
        epicIds: ['epic-relationship-boost'],
    },
    {
        id: 'bundle-learner',
        name: '🎓 Lifelong Learner',
        description: 'Grow your mind and skills',
        icon: '🎓',
        color: '#8B5CF6',
        targetAudience: 'For continuous learners',
        templateIds: ['growth-1', 'growth-2', 'growth-3', 'growth-4', 'career-2'],
        epicIds: ['epic-learn-skill', 'epic-reading-challenge'],
    },
    {
        id: 'bundle-bills',
        name: '📋 Bill Tracker',
        description: 'Never miss a payment again',
        icon: '📋',
        color: '#DC2626',
        targetAudience: 'For organization lovers',
        templateIds: ['bills-1', 'bills-2', 'bills-3', 'bills-4', 'bills-5', 'finance-1'],
        epicIds: [],
    },
    {
        id: 'bundle-minimal',
        name: '🌱 Minimalist Start',
        description: 'Start small, build from there',
        icon: '🌱',
        color: '#84CC16',
        targetAudience: 'For those new to planning',
        templateIds: ['health-4', 'growth-1', 'relationships-2'],
        epicIds: [],
    },
];

// How did you hear about us options
export const REFERRAL_SOURCES = [
    { id: 'friend', label: 'Friend or family', icon: '👥' },
    { id: 'social', label: 'Social media', icon: '📱' },
    { id: 'search', label: 'Google search', icon: '🔍' },
    { id: 'appstore', label: 'App Store', icon: '📲' },
    { id: 'podcast', label: 'Podcast', icon: '🎙️' },
    { id: 'blog', label: 'Blog or article', icon: '📝' },
    { id: 'employer', label: 'My employer', icon: '🏢' },
    { id: 'other', label: 'Other', icon: '✨' },
];

// Relationship types for important dates
export const RELATIONSHIP_TYPES = [
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'friend', label: 'Friend', icon: '🤝' },
    { id: 'colleague', label: 'Colleague', icon: '💼' },
    { id: 'other', label: 'Other', icon: '👤' },
];

// Store state
interface OnboardingState {
    data: OnboardingData;
    currentStep: number;
    totalSteps: number;
    isComplete: boolean;
    
    // Actions
    setFirstName: (name: string) => void;
    setLastName: (name: string) => void;
    setPlanType: (type: PlanType) => void;
    setCorporateCode: (code: string) => void;
    setFamilyRole: (role: 'owner' | 'adult' | 'child') => void;
    setLifeWheelScore: (areaId: string, score: number) => void;
    selectBundle: (bundleId: string) => void;
    toggleGoalCategory: (categoryId: string) => void;
    toggleTaskTemplate: (templateId: string) => void;
    toggleEpicTemplate: (epicId: string) => void;
    addImportantDate: (date: ImportantDate) => void;
    removeImportantDate: (dateId: string) => void;
    setWorkStyle: (style: 'morning' | 'afternoon' | 'evening' | 'flexible') => void;
    setWeeklyCommitmentHours: (hours: number) => void;
    setHowDidYouHear: (source: string) => void;
    setMainGoal: (goal: string) => void;
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    completeOnboarding: () => void;
    reset: () => void;
    
    // Helpers
    getSelectedTemplates: () => TaskTemplate[];
    getSelectedEpics: () => EpicTemplate[];
    getEstimatedWeeklyPoints: () => number;
    getLowScoringAreas: () => LifeWheelQuestion[];
    getSuggestedTemplatesFromAssessment: () => string[];
}

const DEFAULT_DATA: OnboardingData = {
    firstName: '',
    lastName: '',
    planType: 'individual',
    corporateCode: undefined,
    familyRole: undefined,
    lifeWheelScores: {},
    selectedGoalCategories: [],
    selectedBundleId: undefined,
    selectedTaskTemplates: [],
    selectedEpicTemplates: [],
    importantDates: [],
    preferredWorkStyle: 'flexible',
    weeklyCommitmentHours: 10,
    howDidYouHear: undefined,
    mainGoal: undefined,
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            data: DEFAULT_DATA,
            currentStep: 0,
            totalSteps: 6,
            isComplete: false,
            
            setFirstName: (name) => set(state => ({
                data: { ...state.data, firstName: name }
            })),
            
            setLastName: (name) => set(state => ({
                data: { ...state.data, lastName: name }
            })),
            
            setPlanType: (type) => set(state => ({
                data: { ...state.data, planType: type }
            })),
            
            setCorporateCode: (code) => set(state => ({
                data: { ...state.data, corporateCode: code }
            })),
            
            setFamilyRole: (role) => set(state => ({
                data: { ...state.data, familyRole: role }
            })),
            
            setLifeWheelScore: (areaId, score) => set(state => ({
                data: {
                    ...state.data,
                    lifeWheelScores: {
                        ...state.data.lifeWheelScores,
                        [areaId]: score,
                    }
                }
            })),
            
            selectBundle: (bundleId) => set(state => {
                const bundle = QUICK_START_BUNDLES.find(b => b.id === bundleId);
                if (!bundle) return state;
                
                return {
                    data: {
                        ...state.data,
                        selectedBundleId: bundleId,
                        selectedTaskTemplates: bundle.templateIds,
                        selectedEpicTemplates: bundle.epicIds,
                    }
                };
            }),
            
            toggleGoalCategory: (categoryId) => set(state => {
                const current = state.data.selectedGoalCategories;
                const newSelection = current.includes(categoryId)
                    ? current.filter(id => id !== categoryId)
                    : [...current, categoryId];
                
                // Auto-select templates from selected categories
                const category = GOAL_CATEGORIES.find(c => c.id === categoryId);
                let newTemplates = [...state.data.selectedTaskTemplates];
                
                if (category) {
                    if (newSelection.includes(categoryId)) {
                        // Add first 2 templates from category
                        const templatesToAdd = category.templates.slice(0, 2).map(t => t.id);
                        newTemplates = [...new Set([...newTemplates, ...templatesToAdd])];
                    } else {
                        // Remove templates from this category
                        const templateIds = category.templates.map(t => t.id);
                        newTemplates = newTemplates.filter(id => !templateIds.includes(id));
                    }
                }
                
                return {
                    data: {
                        ...state.data,
                        selectedGoalCategories: newSelection,
                        selectedTaskTemplates: newTemplates,
                    }
                };
            }),
            
            toggleTaskTemplate: (templateId) => set(state => {
                const current = state.data.selectedTaskTemplates;
                const newSelection = current.includes(templateId)
                    ? current.filter(id => id !== templateId)
                    : [...current, templateId];
                return {
                    data: { ...state.data, selectedTaskTemplates: newSelection }
                };
            }),
            
            toggleEpicTemplate: (epicId) => set(state => {
                const current = state.data.selectedEpicTemplates;
                const newSelection = current.includes(epicId)
                    ? current.filter(id => id !== epicId)
                    : [...current, epicId];
                return {
                    data: { ...state.data, selectedEpicTemplates: newSelection }
                };
            }),
            
            addImportantDate: (date) => set(state => ({
                data: {
                    ...state.data,
                    importantDates: [...state.data.importantDates, date]
                }
            })),
            
            removeImportantDate: (dateId) => set(state => ({
                data: {
                    ...state.data,
                    importantDates: state.data.importantDates.filter(d => d.id !== dateId)
                }
            })),
            
            setWorkStyle: (style) => set(state => ({
                data: { ...state.data, preferredWorkStyle: style }
            })),
            
            setWeeklyCommitmentHours: (hours) => set(state => ({
                data: { ...state.data, weeklyCommitmentHours: hours }
            })),
            
            setHowDidYouHear: (source) => set(state => ({
                data: { ...state.data, howDidYouHear: source }
            })),
            
            setMainGoal: (goal) => set(state => ({
                data: { ...state.data, mainGoal: goal }
            })),
            
            setCurrentStep: (step) => set({ currentStep: step }),
            
            nextStep: () => set(state => ({
                currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
            })),
            
            prevStep: () => set(state => ({
                currentStep: Math.max(state.currentStep - 1, 0)
            })),
            
            completeOnboarding: () => set({ isComplete: true }),
            
            reset: () => set({
                data: DEFAULT_DATA,
                currentStep: 0,
                isComplete: false,
            }),
            
            getSelectedTemplates: () => {
                const state = get();
                const allTemplates = GOAL_CATEGORIES.flatMap(c => c.templates);
                return allTemplates.filter(t => 
                    state.data.selectedTaskTemplates.includes(t.id)
                );
            },
            
            getSelectedEpics: () => {
                const state = get();
                return EPIC_TEMPLATES.filter(e => 
                    state.data.selectedEpicTemplates.includes(e.id)
                );
            },
            
            getEstimatedWeeklyPoints: () => {
                const state = get();
                const templates = state.getSelectedTemplates();
                
                let weeklyPoints = 0;
                templates.forEach(t => {
                    if (t.isRecurring && t.recurrencePattern) {
                        switch (t.recurrencePattern.frequency) {
                            case 'daily':
                                weeklyPoints += t.storyPoints * 7;
                                break;
                            case 'weekly':
                                weeklyPoints += t.storyPoints;
                                break;
                            case 'biweekly':
                                weeklyPoints += t.storyPoints * 0.5;
                                break;
                            case 'monthly':
                                weeklyPoints += t.storyPoints * 0.25;
                                break;
                        }
                    } else {
                        weeklyPoints += t.storyPoints * 0.2; // One-time spread over 5 weeks
                    }
                });
                
                return Math.round(weeklyPoints);
            },
            
            getLowScoringAreas: () => {
                const state = get();
                const scores = state.data.lifeWheelScores;
                
                // Return areas where user scored 5 or below (need improvement)
                return LIFE_WHEEL_ASSESSMENT.filter(q => {
                    const score = scores[q.areaId];
                    return score !== undefined && score <= 5;
                }).sort((a, b) => {
                    // Sort by lowest score first
                    const scoreA = scores[a.areaId] || 0;
                    const scoreB = scores[b.areaId] || 0;
                    return scoreA - scoreB;
                });
            },
            
            getSuggestedTemplatesFromAssessment: () => {
                const state = get();
                const lowAreas = state.getLowScoringAreas();
                
                // Collect suggested templates from low-scoring areas
                const suggestedIds: string[] = [];
                lowAreas.forEach(area => {
                    suggestedIds.push(...area.suggestedTemplates);
                });
                
                // Return unique template IDs
                return [...new Set(suggestedIds)];
            },
        }),
        {
            name: 'onboarding-data',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
