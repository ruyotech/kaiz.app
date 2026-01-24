import { create } from 'zustand';
import {
    CommunityMember,
    CommunityBadge,
    CommunityBadgeType,
    KnowledgeArticle,
    ReleaseNote,
    WikiEntry,
    CommunityQuestion,
    CommunityAnswer,
    SuccessStory,
    StoryComment,
    CommunityTemplate,
    LeaderboardEntry,
    LeaderboardPeriod,
    LeaderboardCategory,
    AccountabilityPartner,
    PartnerRequest,
    MotivationGroup,
    FeatureRequest,
    BugReport,
    CommunityActivity,
    SecretCompliment,
    PublicKudos,
    CommunityPoll,
    WeeklyChallenge,
} from '../types/models';

interface CommunityFilters {
    articleCategory?: string;
    questionStatus?: string;
    questionTag?: string;
    templateType?: string;
    leaderboardPeriod: LeaderboardPeriod;
    leaderboardCategory: LeaderboardCategory;
}

interface CommunityState {
    // Current user's community profile
    currentMember: CommunityMember | null;
    
    // Knowledge Hub
    articles: KnowledgeArticle[];
    featuredArticle: KnowledgeArticle | null;
    releaseNotes: ReleaseNote[];
    wikiEntries: WikiEntry[];
    
    // Q&A
    questions: CommunityQuestion[];
    currentQuestion: CommunityQuestion | null;
    answers: CommunityAnswer[];
    
    // Success Stories
    stories: SuccessStory[];
    storyComments: StoryComment[];
    
    // Templates
    templates: CommunityTemplate[];
    featuredTemplates: CommunityTemplate[];
    
    // Leaderboard
    leaderboard: LeaderboardEntry[];
    userRank: LeaderboardEntry | null;
    
    // Support Circle
    partners: AccountabilityPartner[];
    partnerRequests: PartnerRequest[];
    motivationGroups: MotivationGroup[];
    
    // Feedback
    featureRequests: FeatureRequest[];
    
    // Activity & Social
    activityFeed: CommunityActivity[];
    receivedCompliments: SecretCompliment[];
    publicKudos: PublicKudos[];
    
    // Polls & Challenges
    activePoll: CommunityPoll | null;
    weeklyChallenge: WeeklyChallenge | null;
    
    // Badges
    allBadges: CommunityBadge[];
    
    // UI State
    loading: boolean;
    error: string | null;
    filters: CommunityFilters;
    
    // Actions - Data Loading
    fetchCommunityHome: () => Promise<void>;
    fetchArticles: (category?: string) => Promise<void>;
    fetchQuestions: (status?: string, tag?: string) => Promise<void>;
    fetchQuestionDetail: (questionId: string) => Promise<void>;
    fetchStories: () => Promise<void>;
    fetchTemplates: (type?: string) => Promise<void>;
    fetchLeaderboard: (period: LeaderboardPeriod, category: LeaderboardCategory) => Promise<void>;
    fetchPartners: () => Promise<void>;
    fetchMotivationGroups: () => Promise<void>;
    fetchActivityFeed: () => Promise<void>;
    
    // Actions - User Interactions
    upvoteQuestion: (questionId: string) => void;
    upvoteAnswer: (answerId: string) => void;
    postQuestion: (title: string, body: string, tags: string[]) => Promise<void>;
    postAnswer: (questionId: string, body: string) => Promise<void>;
    likeStory: (storyId: string) => void;
    celebrateStory: (storyId: string) => void;
    postStory: (story: Partial<SuccessStory>) => Promise<void>;
    downloadTemplate: (templateId: string) => Promise<void>;
    rateTemplate: (templateId: string, rating: number) => Promise<void>;
    bookmarkTemplate: (templateId: string) => void;
    sendPartnerRequest: (userId: string, message?: string) => Promise<void>;
    respondToPartnerRequest: (requestId: string, accept: boolean) => Promise<void>;
    joinGroup: (groupId: string) => Promise<void>;
    leaveGroup: (groupId: string) => Promise<void>;
    votePoll: (pollId: string, optionId: string) => Promise<void>;
    joinWeeklyChallenge: (challengeId: string) => Promise<void>;
    sendCompliment: (toUserId: string, message: string, category: string) => Promise<void>;
    sendKudos: (toUserId: string, message: string, category: string) => Promise<void>;
    submitFeatureRequest: (title: string, description: string) => Promise<void>;
    upvoteFeatureRequest: (requestId: string) => void;
    
    // Actions - Filters & UI
    setFilters: (filters: Partial<CommunityFilters>) => void;
    clearError: () => void;
}

// Mock data generators for initial state
const generateMockMember = (): CommunityMember => ({
    id: 'current-user',
    userId: 'user-1',
    displayName: 'Sprint Champion',
    avatar: '🚀',
    bio: 'Shipping life goals one sprint at a time',
    level: 12,
    levelTitle: 'Achiever',
    reputationPoints: 2450,
    badges: ['sprint_starter', 'first_post', 'helpful_hero'],
    role: 'member',
    joinedAt: '2025-06-15T00:00:00Z',
    isOnline: true,
    sprintsCompleted: 24,
    helpfulAnswers: 15,
    templatesShared: 3,
    currentStreak: 18,
    showActivity: true,
    acceptPartnerRequests: true,
});

export const useCommunityStore = create<CommunityState>((set, get) => ({
    // Initial State
    currentMember: generateMockMember(),
    articles: [],
    featuredArticle: null,
    releaseNotes: [],
    wikiEntries: [],
    questions: [],
    currentQuestion: null,
    answers: [],
    stories: [],
    storyComments: [],
    templates: [],
    featuredTemplates: [],
    leaderboard: [],
    userRank: null,
    partners: [],
    partnerRequests: [],
    motivationGroups: [],
    featureRequests: [],
    activityFeed: [],
    receivedCompliments: [],
    publicKudos: [],
    activePoll: null,
    weeklyChallenge: null,
    allBadges: [],
    loading: false,
    error: null,
    filters: {
        leaderboardPeriod: 'weekly',
        leaderboardCategory: 'reputation',
    },
    
    // Data Loading Actions
    fetchCommunityHome: async () => {
        set({ loading: true, error: null });
        try {
            // Simulate API call - in real app, this would call mockApi
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Set featured article
            set({
                featuredArticle: {
                    id: 'featured-1',
                    title: 'Master Your Sprint Planning: 10 Strategies That Work',
                    excerpt: 'Discover proven techniques to plan sprints that actually ship results...',
                    content: '',
                    category: 'strategy',
                    coverImageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
                    authorId: 'team',
                    authorName: 'Kaiz Team',
                    publishedAt: '2026-01-20T10:00:00Z',
                    readTimeMinutes: 8,
                    viewCount: 1250,
                    likeCount: 342,
                    tags: ['productivity', 'planning', 'sprint'],
                },
                activePoll: {
                    id: 'poll-1',
                    question: 'What was your biggest win this sprint?',
                    options: [
                        { id: 'opt-1', text: 'Completed all planned tasks', voteCount: 145 },
                        { id: 'opt-2', text: 'Started a new habit', voteCount: 98 },
                        { id: 'opt-3', text: 'Improved my velocity', voteCount: 67 },
                        { id: 'opt-4', text: 'Balanced multiple life areas', voteCount: 112 },
                    ],
                    totalVotes: 422,
                    endsAt: '2026-01-26T23:59:59Z',
                    createdAt: '2026-01-20T00:00:00Z',
                },
                weeklyChallenge: {
                    id: 'wc-1',
                    title: 'Focus Week Challenge',
                    description: 'Complete 5 deep work sessions of 25+ minutes each',
                    lifeWheelAreaId: 'lw-2',
                    startDate: '2026-01-20T00:00:00Z',
                    endDate: '2026-01-26T23:59:59Z',
                    participantCount: 847,
                    completionCount: 234,
                    rewardXp: 500,
                    rewardBadge: 'velocity_master',
                },
                loading: false,
            });
            
            // Load activity feed
            get().fetchActivityFeed();
            get().fetchStories();
        } catch (error) {
            set({ error: 'Failed to load community data', loading: false });
        }
    },
    
    fetchArticles: async (category) => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const mockArticles: KnowledgeArticle[] = [
                {
                    id: 'art-1',
                    title: 'Understanding the Eisenhower Matrix',
                    excerpt: 'Learn how to prioritize tasks effectively using this powerful framework...',
                    content: '',
                    category: 'productivity',
                    authorId: 'team',
                    authorName: 'Kaiz Team',
                    publishedAt: '2026-01-18T10:00:00Z',
                    readTimeMinutes: 5,
                    viewCount: 890,
                    likeCount: 156,
                    tags: ['prioritization', 'eisenhower'],
                },
                {
                    id: 'art-2',
                    title: 'Weekly Review: Your Key to Continuous Improvement',
                    excerpt: 'Why retrospectives matter and how to run them effectively...',
                    content: '',
                    category: 'strategy',
                    authorId: 'team',
                    authorName: 'Kaiz Team',
                    publishedAt: '2026-01-15T10:00:00Z',
                    readTimeMinutes: 7,
                    viewCount: 654,
                    likeCount: 98,
                    tags: ['retrospective', 'improvement'],
                },
                {
                    id: 'art-3',
                    title: 'New Feature: Life Wheel Analytics',
                    excerpt: 'Track your life balance with our new visual analytics dashboard...',
                    content: '',
                    category: 'announcement',
                    authorId: 'team',
                    authorName: 'Kaiz Team',
                    publishedAt: '2026-01-10T10:00:00Z',
                    readTimeMinutes: 3,
                    viewCount: 1200,
                    likeCount: 287,
                    tags: ['feature', 'analytics'],
                },
            ];
            
            const filtered = category 
                ? mockArticles.filter(a => a.category === category)
                : mockArticles;
                
            set({ articles: filtered, loading: false });
        } catch (error) {
            set({ error: 'Failed to load articles', loading: false });
        }
    },
    
    fetchQuestions: async (status, tag) => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const mockQuestions: CommunityQuestion[] = [
                {
                    id: 'q-1',
                    title: 'How do I handle carryover tasks between sprints?',
                    body: 'I often have tasks that don\'t get completed. What\'s the best practice?',
                    authorId: 'user-2',
                    authorName: 'ProductivityPro',
                    authorAvatar: '👨‍💻',
                    tags: ['sprints', 'planning', 'backlog'],
                    status: 'answered',
                    viewCount: 234,
                    upvoteCount: 45,
                    answerCount: 8,
                    acceptedAnswerId: 'a-1',
                    createdAt: '2026-01-22T14:30:00Z',
                    updatedAt: '2026-01-23T09:15:00Z',
                },
                {
                    id: 'q-2',
                    title: 'Best way to integrate focus sessions with tasks?',
                    body: 'I want to track my deep work better. Any tips?',
                    authorId: 'user-3',
                    authorName: 'FocusSeeker',
                    authorAvatar: '🎯',
                    tags: ['focus', 'pomodoro', 'tasks'],
                    status: 'open',
                    viewCount: 156,
                    upvoteCount: 28,
                    answerCount: 3,
                    createdAt: '2026-01-23T10:00:00Z',
                    updatedAt: '2026-01-23T10:00:00Z',
                },
                {
                    id: 'q-3',
                    title: 'How to set realistic velocity goals?',
                    body: 'I keep overcommitting. Need help finding my real capacity.',
                    authorId: 'user-4',
                    authorName: 'NewSprinter',
                    authorAvatar: '🏃',
                    tags: ['velocity', 'capacity', 'planning'],
                    status: 'open',
                    viewCount: 89,
                    upvoteCount: 19,
                    answerCount: 5,
                    createdAt: '2026-01-21T16:45:00Z',
                    updatedAt: '2026-01-22T11:30:00Z',
                },
            ];
            
            let filtered = mockQuestions;
            if (status) filtered = filtered.filter(q => q.status === status);
            if (tag) filtered = filtered.filter(q => q.tags.includes(tag));
            
            set({ questions: filtered, loading: false });
        } catch (error) {
            set({ error: 'Failed to load questions', loading: false });
        }
    },
    
    fetchQuestionDetail: async (questionId) => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const question = get().questions.find(q => q.id === questionId);
            
            const mockAnswers: CommunityAnswer[] = [
                {
                    id: 'a-1',
                    questionId,
                    body: 'Great question! The key is to run a proper retrospective at the end of each sprint. Review your carryover and ask: Was it truly necessary? Was it too large? Should it be broken down? Then decide: move to next sprint, back to backlog, or cancel.',
                    authorId: 'mod-1',
                    authorName: 'SprintMaster',
                    authorAvatar: '🏆',
                    authorRole: 'mentor',
                    upvoteCount: 34,
                    isVerified: true,
                    isAccepted: true,
                    createdAt: '2026-01-22T16:00:00Z',
                    updatedAt: '2026-01-22T16:00:00Z',
                },
                {
                    id: 'a-2',
                    questionId,
                    body: 'I use a simple rule: if a task carries over twice, I break it down into smaller pieces. Usually means the original task was too vague or too large.',
                    authorId: 'user-5',
                    authorName: 'AgileAce',
                    authorAvatar: '⚡',
                    authorRole: 'contributor',
                    upvoteCount: 18,
                    isVerified: false,
                    isAccepted: false,
                    createdAt: '2026-01-22T17:30:00Z',
                    updatedAt: '2026-01-22T17:30:00Z',
                },
            ];
            
            set({ 
                currentQuestion: question || null, 
                answers: mockAnswers, 
                loading: false 
            });
        } catch (error) {
            set({ error: 'Failed to load question details', loading: false });
        }
    },
    
    fetchStories: async () => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const mockStories: SuccessStory[] = [
                {
                    id: 's-1',
                    authorId: 'user-6',
                    authorName: 'MomentumMaker',
                    authorAvatar: '🌟',
                    title: 'From chaos to clarity: 30 sprints later',
                    story: 'When I started using Kaiz, I was overwhelmed with scattered todos everywhere. Now, 30 sprints later, I\'ve completed 2 major life goals, improved my health score by 40%, and finally feel in control of my time.',
                    category: 'transformation',
                    lifeWheelAreaId: 'lw-4',
                    metrics: [
                        { label: 'Sprints Completed', value: '30' },
                        { label: 'Goals Achieved', value: '2 major' },
                        { label: 'Health Improvement', value: '+40%' },
                    ],
                    likeCount: 156,
                    commentCount: 23,
                    celebrateCount: 89,
                    createdAt: '2026-01-20T08:00:00Z',
                },
                {
                    id: 's-2',
                    authorId: 'user-7',
                    authorName: 'StreakChaser',
                    authorAvatar: '🔥',
                    title: '100-day meditation streak achieved!',
                    story: 'Thanks to the challenges feature, I finally built a sustainable meditation habit. The accountability partners feature was a game-changer - my partner and I kept each other motivated through the tough days.',
                    category: 'habit_streak',
                    lifeWheelAreaId: 'lw-1',
                    metrics: [
                        { label: 'Streak Days', value: '100' },
                        { label: 'Total Minutes', value: '2,500' },
                    ],
                    likeCount: 234,
                    commentCount: 45,
                    celebrateCount: 178,
                    createdAt: '2026-01-19T15:00:00Z',
                },
                {
                    id: 's-3',
                    authorId: 'user-8',
                    authorName: 'VelocityVic',
                    authorAvatar: '🚀',
                    title: 'Finally shipped my side project!',
                    story: 'After 3 months of consistent sprints, my side project is live! Breaking it into epics and tracking velocity helped me stay realistic about timelines. No more "I\'ll do it someday" - it\'s done!',
                    category: 'milestone',
                    lifeWheelAreaId: 'lw-2',
                    metrics: [
                        { label: 'Epics Completed', value: '5' },
                        { label: 'Story Points', value: '89' },
                        { label: 'Time to Ship', value: '12 weeks' },
                    ],
                    likeCount: 312,
                    commentCount: 67,
                    celebrateCount: 245,
                    createdAt: '2026-01-18T12:00:00Z',
                },
            ];
            
            set({ stories: mockStories, loading: false });
        } catch (error) {
            set({ error: 'Failed to load stories', loading: false });
        }
    },
    
    fetchTemplates: async (type) => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const mockTemplates: CommunityTemplate[] = [
                {
                    id: 't-1',
                    name: 'Weekly Sprint Kickoff Ritual',
                    description: 'A structured approach to planning your week with intention and focus',
                    type: 'ritual',
                    authorId: 'user-9',
                    authorName: 'RitualMaster',
                    content: {},
                    lifeWheelAreaId: 'generic',
                    tags: ['planning', 'weekly', 'ritual'],
                    downloadCount: 1245,
                    rating: 4.8,
                    ratingCount: 156,
                    createdAt: '2025-12-01T00:00:00Z',
                    updatedAt: '2026-01-15T00:00:00Z',
                },
                {
                    id: 't-2',
                    name: 'Health & Fitness Sprint Plan',
                    description: 'Pre-built sprint with balanced health tasks: exercise, nutrition, sleep',
                    type: 'sprint_plan',
                    authorId: 'user-10',
                    authorName: 'FitnessFan',
                    content: {},
                    lifeWheelAreaId: 'lw-1',
                    tags: ['health', 'fitness', 'wellness'],
                    downloadCount: 892,
                    rating: 4.6,
                    ratingCount: 98,
                    createdAt: '2025-11-15T00:00:00Z',
                    updatedAt: '2026-01-10T00:00:00Z',
                },
                {
                    id: 't-3',
                    name: 'Deep Work Challenge',
                    description: '30-day challenge to build your focus muscle with structured deep work sessions',
                    type: 'challenge',
                    authorId: 'user-11',
                    authorName: 'FocusGuru',
                    content: {},
                    lifeWheelAreaId: 'lw-4',
                    tags: ['focus', 'productivity', 'deep-work'],
                    downloadCount: 2103,
                    rating: 4.9,
                    ratingCount: 287,
                    createdAt: '2025-10-20T00:00:00Z',
                    updatedAt: '2026-01-20T00:00:00Z',
                },
                {
                    id: 't-4',
                    name: 'Definition of Done Checklist',
                    description: 'Comprehensive checklist to ensure tasks are truly complete',
                    type: 'checklist',
                    authorId: 'team',
                    authorName: 'Kaiz Team',
                    content: {},
                    tags: ['process', 'quality', 'completion'],
                    downloadCount: 3456,
                    rating: 4.7,
                    ratingCount: 412,
                    createdAt: '2025-09-01T00:00:00Z',
                    updatedAt: '2025-12-15T00:00:00Z',
                },
            ];
            
            const filtered = type 
                ? mockTemplates.filter(t => t.type === type)
                : mockTemplates;
            
            set({ 
                templates: filtered,
                featuredTemplates: mockTemplates.slice(0, 3),
                loading: false 
            });
        } catch (error) {
            set({ error: 'Failed to load templates', loading: false });
        }
    },
    
    fetchLeaderboard: async (period, category) => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const mockLeaderboard: LeaderboardEntry[] = [
                {
                    rank: 1,
                    memberId: 'user-12',
                    displayName: 'SprintNinja',
                    avatar: '🥷',
                    level: 45,
                    value: 8750,
                    change: 0,
                    badges: ['community_champion', 'streak_legend', 'velocity_master'],
                },
                {
                    rank: 2,
                    memberId: 'user-13',
                    displayName: 'VelocityKing',
                    avatar: '👑',
                    level: 38,
                    value: 7230,
                    change: 2,
                    badges: ['velocity_master', 'knowledge_keeper'],
                },
                {
                    rank: 3,
                    memberId: 'user-14',
                    displayName: 'GoalCrusher',
                    avatar: '💪',
                    level: 35,
                    value: 6890,
                    change: -1,
                    badges: ['sprint_mentor', 'helpful_hero'],
                },
                {
                    rank: 4,
                    memberId: 'user-15',
                    displayName: 'FocusMaster',
                    avatar: '🎯',
                    level: 32,
                    value: 5450,
                    change: 1,
                    badges: ['template_creator', 'accountability_ace'],
                },
                {
                    rank: 5,
                    memberId: 'current-user',
                    displayName: 'Sprint Champion',
                    avatar: '🚀',
                    level: 12,
                    value: 2450,
                    change: 3,
                    badges: ['sprint_starter', 'first_post'],
                },
            ];
            
            set({ 
                leaderboard: mockLeaderboard,
                userRank: mockLeaderboard.find(e => e.memberId === 'current-user') || null,
                filters: { ...get().filters, leaderboardPeriod: period, leaderboardCategory: category },
                loading: false 
            });
        } catch (error) {
            set({ error: 'Failed to load leaderboard', loading: false });
        }
    },
    
    fetchPartners: async () => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const mockPartners: AccountabilityPartner[] = [
                {
                    id: 'p-1',
                    partnerId: 'user-16',
                    partnerName: 'MotivationBuddy',
                    partnerAvatar: '🤝',
                    partnerLevel: 18,
                    connectedSince: '2025-10-15T00:00:00Z',
                    sharedChallenges: ['c-1', 'c-2'],
                    lastInteraction: '2026-01-23T09:00:00Z',
                    checkInStreak: 12,
                },
                {
                    id: 'p-2',
                    partnerId: 'user-17',
                    partnerName: 'GymPartner',
                    partnerAvatar: '💪',
                    partnerLevel: 22,
                    connectedSince: '2025-11-01T00:00:00Z',
                    sharedChallenges: ['c-3'],
                    lastInteraction: '2026-01-22T18:00:00Z',
                    checkInStreak: 8,
                },
            ];
            
            const mockRequests: PartnerRequest[] = [
                {
                    id: 'pr-1',
                    fromUserId: 'user-18',
                    fromUserName: 'NewSprinter',
                    fromUserAvatar: '🌱',
                    toUserId: 'current-user',
                    message: 'Would love to have you as my accountability partner for the focus challenge!',
                    status: 'pending',
                    createdAt: '2026-01-22T14:00:00Z',
                },
            ];
            
            set({ 
                partners: mockPartners, 
                partnerRequests: mockRequests, 
                loading: false 
            });
        } catch (error) {
            set({ error: 'Failed to load partners', loading: false });
        }
    },
    
    fetchMotivationGroups: async () => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const mockGroups: MotivationGroup[] = [
                {
                    id: 'g-1',
                    name: 'Early Bird Sprinters',
                    description: 'For those who plan their week on Sunday evenings',
                    lifeWheelAreaId: 'generic',
                    memberCount: 234,
                    maxMembers: 500,
                    isPrivate: false,
                    createdByUserId: 'mod-1',
                    createdAt: '2025-08-01T00:00:00Z',
                    isJoined: true,
                    tags: ['planning', 'morning', 'routine'],
                },
                {
                    id: 'g-2',
                    name: 'Health Warriors',
                    description: 'Dedicated to health and fitness goals',
                    coverImageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
                    lifeWheelAreaId: 'lw-1',
                    memberCount: 456,
                    maxMembers: 1000,
                    isPrivate: false,
                    createdByUserId: 'mod-2',
                    createdAt: '2025-07-15T00:00:00Z',
                    tags: ['health', 'fitness', 'wellness'],
                },
                {
                    id: 'g-3',
                    name: 'Side Project Builders',
                    description: 'Ship your side projects with community support',
                    lifeWheelAreaId: 'lw-2',
                    memberCount: 189,
                    maxMembers: 300,
                    isPrivate: false,
                    createdByUserId: 'user-19',
                    createdAt: '2025-09-10T00:00:00Z',
                    tags: ['projects', 'building', 'shipping'],
                },
            ];
            
            set({ motivationGroups: mockGroups, loading: false });
        } catch (error) {
            set({ error: 'Failed to load groups', loading: false });
        }
    },
    
    fetchActivityFeed: async () => {
        try {
            const mockActivity: CommunityActivity[] = [
                {
                    id: 'act-1',
                    userId: 'user-20',
                    userName: 'Sarah',
                    userAvatar: '👩‍💼',
                    type: 'sprint_completed',
                    title: 'completed Sprint 4',
                    description: '28/32 points shipped',
                    timestamp: '2026-01-24T08:30:00Z',
                    celebrateCount: 12,
                },
                {
                    id: 'act-2',
                    userId: 'user-21',
                    userName: 'Mike',
                    userAvatar: '👨‍💻',
                    type: 'badge_earned',
                    title: 'earned Velocity Master',
                    metadata: { badge: 'velocity_master' },
                    timestamp: '2026-01-24T07:15:00Z',
                    celebrateCount: 24,
                },
                {
                    id: 'act-3',
                    userId: 'user-22',
                    userName: 'Emily',
                    userAvatar: '👩‍🎨',
                    type: 'streak_milestone',
                    title: 'hit a 50-day streak!',
                    description: 'Meditation challenge',
                    timestamp: '2026-01-24T06:00:00Z',
                    celebrateCount: 45,
                },
                {
                    id: 'act-4',
                    userId: 'user-23',
                    userName: 'Alex',
                    userAvatar: '🧑‍💼',
                    type: 'template_shared',
                    title: 'shared a new template',
                    description: 'Morning Routine Ritual',
                    timestamp: '2026-01-23T22:00:00Z',
                    celebrateCount: 8,
                },
                {
                    id: 'act-5',
                    userId: 'user-24',
                    userName: 'Jordan',
                    userAvatar: '🎮',
                    type: 'challenge_completed',
                    title: 'completed 30-Day Code Challenge',
                    timestamp: '2026-01-23T20:30:00Z',
                    celebrateCount: 34,
                },
            ];
            
            set({ activityFeed: mockActivity });
        } catch (error) {
            set({ error: 'Failed to load activity feed' });
        }
    },
    
    // User Interaction Actions
    upvoteQuestion: (questionId) => {
        set(state => ({
            questions: state.questions.map(q => 
                q.id === questionId 
                    ? { 
                        ...q, 
                        upvoteCount: q.isUpvotedByUser ? q.upvoteCount - 1 : q.upvoteCount + 1,
                        isUpvotedByUser: !q.isUpvotedByUser 
                    }
                    : q
            ),
        }));
    },
    
    upvoteAnswer: (answerId) => {
        set(state => ({
            answers: state.answers.map(a => 
                a.id === answerId 
                    ? { 
                        ...a, 
                        upvoteCount: a.isUpvotedByUser ? a.upvoteCount - 1 : a.upvoteCount + 1,
                        isUpvotedByUser: !a.isUpvotedByUser 
                    }
                    : a
            ),
        }));
    },
    
    postQuestion: async (title, body, tags) => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const newQuestion: CommunityQuestion = {
                id: `q-${Date.now()}`,
                title,
                body,
                authorId: 'current-user',
                authorName: 'Sprint Champion',
                authorAvatar: '🚀',
                tags,
                status: 'open',
                viewCount: 0,
                upvoteCount: 0,
                answerCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            
            set(state => ({ 
                questions: [newQuestion, ...state.questions],
                loading: false 
            }));
        } catch (error) {
            set({ error: 'Failed to post question', loading: false });
        }
    },
    
    postAnswer: async (questionId, body) => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const newAnswer: CommunityAnswer = {
                id: `a-${Date.now()}`,
                questionId,
                body,
                authorId: 'current-user',
                authorName: 'Sprint Champion',
                authorAvatar: '🚀',
                authorRole: 'member',
                upvoteCount: 0,
                isVerified: false,
                isAccepted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            
            set(state => ({ 
                answers: [...state.answers, newAnswer],
                loading: false 
            }));
        } catch (error) {
            set({ error: 'Failed to post answer', loading: false });
        }
    },
    
    likeStory: (storyId) => {
        set(state => ({
            stories: state.stories.map(s => 
                s.id === storyId 
                    ? { 
                        ...s, 
                        likeCount: s.isLikedByUser ? s.likeCount - 1 : s.likeCount + 1,
                        isLikedByUser: !s.isLikedByUser 
                    }
                    : s
            ),
        }));
    },
    
    celebrateStory: (storyId) => {
        set(state => ({
            stories: state.stories.map(s => 
                s.id === storyId 
                    ? { 
                        ...s, 
                        celebrateCount: s.isCelebratedByUser ? s.celebrateCount - 1 : s.celebrateCount + 1,
                        isCelebratedByUser: !s.isCelebratedByUser 
                    }
                    : s
            ),
        }));
    },
    
    postStory: async (story) => {
        set({ loading: true });
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const newStory: SuccessStory = {
                id: `s-${Date.now()}`,
                authorId: 'current-user',
                authorName: 'Sprint Champion',
                authorAvatar: '🚀',
                title: story.title || '',
                story: story.story || '',
                category: story.category || 'other',
                lifeWheelAreaId: story.lifeWheelAreaId,
                metrics: story.metrics,
                likeCount: 0,
                commentCount: 0,
                celebrateCount: 0,
                createdAt: new Date().toISOString(),
            };
            
            set(state => ({ 
                stories: [newStory, ...state.stories],
                loading: false 
            }));
        } catch (error) {
            set({ error: 'Failed to post story', loading: false });
        }
    },
    
    downloadTemplate: async (templateId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            set(state => ({
                templates: state.templates.map(t => 
                    t.id === templateId 
                        ? { ...t, downloadCount: t.downloadCount + 1 }
                        : t
                ),
            }));
        } catch (error) {
            set({ error: 'Failed to download template' });
        }
    },
    
    rateTemplate: async (templateId, rating) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            set(state => ({
                templates: state.templates.map(t => 
                    t.id === templateId 
                        ? { 
                            ...t, 
                            rating: ((t.rating * t.ratingCount) + rating) / (t.ratingCount + 1),
                            ratingCount: t.ratingCount + 1 
                        }
                        : t
                ),
            }));
        } catch (error) {
            set({ error: 'Failed to rate template' });
        }
    },
    
    bookmarkTemplate: (templateId) => {
        set(state => ({
            templates: state.templates.map(t => 
                t.id === templateId 
                    ? { ...t, isBookmarked: !t.isBookmarked }
                    : t
            ),
        }));
    },
    
    sendPartnerRequest: async (userId, message) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // In real app, would create request via API
        } catch (error) {
            set({ error: 'Failed to send partner request' });
        }
    },
    
    respondToPartnerRequest: async (requestId, accept) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            if (accept) {
                const request = get().partnerRequests.find(r => r.id === requestId);
                if (request) {
                    const newPartner: AccountabilityPartner = {
                        id: `p-${Date.now()}`,
                        partnerId: request.fromUserId,
                        partnerName: request.fromUserName,
                        partnerAvatar: request.fromUserAvatar,
                        partnerLevel: 5,
                        connectedSince: new Date().toISOString(),
                        sharedChallenges: [],
                        lastInteraction: new Date().toISOString(),
                        checkInStreak: 0,
                    };
                    
                    set(state => ({
                        partners: [...state.partners, newPartner],
                        partnerRequests: state.partnerRequests.filter(r => r.id !== requestId),
                    }));
                }
            } else {
                set(state => ({
                    partnerRequests: state.partnerRequests.filter(r => r.id !== requestId),
                }));
            }
        } catch (error) {
            set({ error: 'Failed to respond to request' });
        }
    },
    
    joinGroup: async (groupId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            set(state => ({
                motivationGroups: state.motivationGroups.map(g => 
                    g.id === groupId 
                        ? { ...g, isJoined: true, memberCount: g.memberCount + 1 }
                        : g
                ),
            }));
        } catch (error) {
            set({ error: 'Failed to join group' });
        }
    },
    
    leaveGroup: async (groupId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            set(state => ({
                motivationGroups: state.motivationGroups.map(g => 
                    g.id === groupId 
                        ? { ...g, isJoined: false, memberCount: g.memberCount - 1 }
                        : g
                ),
            }));
        } catch (error) {
            set({ error: 'Failed to leave group' });
        }
    },
    
    votePoll: async (pollId, optionId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            set(state => ({
                activePoll: state.activePoll?.id === pollId 
                    ? {
                        ...state.activePoll,
                        options: state.activePoll.options.map(o => 
                            o.id === optionId 
                                ? { ...o, voteCount: o.voteCount + 1 }
                                : o
                        ),
                        totalVotes: state.activePoll.totalVotes + 1,
                        userVotedOptionId: optionId,
                    }
                    : state.activePoll,
            }));
        } catch (error) {
            set({ error: 'Failed to submit vote' });
        }
    },
    
    joinWeeklyChallenge: async (challengeId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            set(state => ({
                weeklyChallenge: state.weeklyChallenge?.id === challengeId 
                    ? {
                        ...state.weeklyChallenge,
                        isJoined: true,
                        participantCount: state.weeklyChallenge.participantCount + 1,
                    }
                    : state.weeklyChallenge,
            }));
        } catch (error) {
            set({ error: 'Failed to join challenge' });
        }
    },
    
    sendCompliment: async (toUserId, message, category) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            // In real app, would send via API
        } catch (error) {
            set({ error: 'Failed to send compliment' });
        }
    },
    
    sendKudos: async (toUserId, message, category) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const newKudos: PublicKudos = {
                id: `k-${Date.now()}`,
                fromUserId: 'current-user',
                fromUserName: 'Sprint Champion',
                fromUserAvatar: '🚀',
                toUserId,
                toUserName: 'Recipient',
                toUserAvatar: '⭐',
                message,
                category,
                likeCount: 0,
                createdAt: new Date().toISOString(),
            };
            
            set(state => ({
                publicKudos: [newKudos, ...state.publicKudos],
            }));
        } catch (error) {
            set({ error: 'Failed to send kudos' });
        }
    },
    
    submitFeatureRequest: async (title, description) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const newRequest: FeatureRequest = {
                id: `fr-${Date.now()}`,
                title,
                description,
                authorId: 'current-user',
                authorName: 'Sprint Champion',
                status: 'submitted',
                upvoteCount: 1,
                commentCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isUpvotedByUser: true,
            };
            
            set(state => ({
                featureRequests: [newRequest, ...state.featureRequests],
            }));
        } catch (error) {
            set({ error: 'Failed to submit feature request' });
        }
    },
    
    upvoteFeatureRequest: (requestId) => {
        set(state => ({
            featureRequests: state.featureRequests.map(r => 
                r.id === requestId 
                    ? { 
                        ...r, 
                        upvoteCount: r.isUpvotedByUser ? r.upvoteCount - 1 : r.upvoteCount + 1,
                        isUpvotedByUser: !r.isUpvotedByUser 
                    }
                    : r
            ),
        }));
    },
    
    // Filter & UI Actions
    setFilters: (filters) => {
        set(state => ({
            filters: { ...state.filters, ...filters },
        }));
    },
    
    clearError: () => {
        set({ error: null });
    },
}));
