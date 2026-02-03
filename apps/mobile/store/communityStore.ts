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
import { communityApi, ApiError } from '../services/api';

// ==========================================
// Types & Interfaces
// ==========================================

interface CommunityFilters {
    articleCategory?: string;
    questionStatus?: string;
    questionTag?: string;
    templateType?: string;
    leaderboardPeriod: LeaderboardPeriod;
    leaderboardCategory: LeaderboardCategory;
}

interface PaginationState {
    page: number;
    hasMore: boolean;
    isLoadingMore: boolean;
}

interface CommunityState {
    // Current user's community profile
    currentMember: CommunityMember | null;
    
    // Knowledge Hub
    articles: KnowledgeArticle[];
    featuredArticle: KnowledgeArticle | null;
    releaseNotes: ReleaseNote[];
    wikiEntries: WikiEntry[];
    
    // Knowledge Hub (Wiki / Feature Documentation)
    knowledgeCategories: any[];
    knowledgeItems: any[];
    featuredKnowledgeItems: any[];
    selectedKnowledgeCategory: string | null;
    knowledgeLoading: boolean;
    
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
    
    // Pagination states
    articlesPagination: PaginationState;
    questionsPagination: PaginationState;
    storiesPagination: PaginationState;
    templatesPagination: PaginationState;
    activityPagination: PaginationState;
    
    // Actions - Data Loading
    fetchCommunityHome: () => Promise<void>;
    fetchCurrentMember: () => Promise<void>;
    fetchArticles: (category?: string, loadMore?: boolean) => Promise<void>;
    fetchQuestions: (status?: string, tag?: string, loadMore?: boolean) => Promise<void>;
    fetchQuestionDetail: (questionId: string) => Promise<void>;
    fetchStories: (category?: string, loadMore?: boolean) => Promise<void>;
    fetchTemplates: (type?: string, loadMore?: boolean) => Promise<void>;
    fetchFeaturedTemplates: () => Promise<void>;
    fetchLeaderboard: (period: LeaderboardPeriod, category: LeaderboardCategory) => Promise<void>;
    fetchPartners: () => Promise<void>;
    fetchPartnerRequests: () => Promise<void>;
    fetchMotivationGroups: () => Promise<void>;
    fetchActivityFeed: (loadMore?: boolean) => Promise<void>;
    fetchAllBadges: () => Promise<void>;
    fetchFeatureRequests: () => Promise<void>;
    fetchReceivedCompliments: () => Promise<void>;
    
    // Knowledge Hub Actions
    fetchKnowledgeCategories: () => Promise<void>;
    fetchKnowledgeItems: (categoryId?: string, search?: string) => Promise<void>;
    fetchFeaturedKnowledgeItems: () => Promise<void>;
    setSelectedKnowledgeCategory: (categoryId: string | null) => void;
    
    // Actions - User Interactions
    upvoteQuestion: (questionId: string) => Promise<void>;
    upvoteAnswer: (answerId: string) => Promise<void>;
    postQuestion: (title: string, body: string, tags: string[]) => Promise<void>;
    postAnswer: (questionId: string, body: string) => Promise<void>;
    likeStory: (storyId: string) => Promise<void>;
    celebrateStory: (storyId: string) => Promise<void>;
    postStory: (story: Partial<SuccessStory>) => Promise<void>;
    downloadTemplate: (templateId: string) => Promise<any>;
    rateTemplate: (templateId: string, rating: number) => Promise<void>;
    bookmarkTemplate: (templateId: string) => Promise<void>;
    sendPartnerRequest: (userId: string, message?: string) => Promise<void>;
    respondToPartnerRequest: (requestId: string, accept: boolean) => Promise<void>;
    removePartner: (partnerId: string) => Promise<void>;
    joinGroup: (groupId: string) => Promise<void>;
    leaveGroup: (groupId: string) => Promise<void>;
    votePoll: (pollId: string, optionId: string) => Promise<void>;
    joinWeeklyChallenge: (challengeId: string) => Promise<void>;
    sendCompliment: (toUserId: string, message: string, category: string) => Promise<void>;
    sendKudos: (toUserId: string, message: string, category: string) => Promise<void>;
    submitFeatureRequest: (title: string, description: string) => Promise<void>;
    upvoteFeatureRequest: (requestId: string) => Promise<void>;
    celebrateActivity: (activityId: string) => Promise<void>;
    updateProfile: (data: Partial<{ displayName: string; avatar: string; bio: string }>) => Promise<void>;
    
    // Actions - Filters & UI
    setFilters: (filters: Partial<CommunityFilters>) => void;
    clearError: () => void;
    resetPagination: (key: keyof Pick<CommunityState, 'articlesPagination' | 'questionsPagination' | 'storiesPagination' | 'templatesPagination' | 'activityPagination'>) => void;
}

// ==========================================
// Helper Functions
// ==========================================

const DEFAULT_PAGE_SIZE = 20;

const createPaginationState = (): PaginationState => ({
    page: 0,
    hasMore: true,
    isLoadingMore: false,
});

// Error handler
const handleApiError = (error: unknown): string => {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

// ==========================================
// Store Implementation
// ==========================================

export const useCommunityStore = create<CommunityState>((set, get) => ({
    // Initial State
    currentMember: null,
    articles: [],
    featuredArticle: null,
    releaseNotes: [],
    wikiEntries: [],
    
    // Knowledge Hub initial state
    knowledgeCategories: [],
    knowledgeItems: [],
    featuredKnowledgeItems: [],
    selectedKnowledgeCategory: null,
    knowledgeLoading: false,
    
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
    
    // Pagination states
    articlesPagination: createPaginationState(),
    questionsPagination: createPaginationState(),
    storiesPagination: createPaginationState(),
    templatesPagination: createPaginationState(),
    activityPagination: createPaginationState(),
    
    // ==========================================
    // Data Loading Actions
    // ==========================================
    
    fetchCommunityHome: async () => {
        set({ loading: true, error: null });
        try {
            const homeData = await communityApi.getCommunityHome();
            
            set({
                currentMember: homeData.currentMember as CommunityMember,
                featuredArticle: homeData.featuredArticle,
                activePoll: homeData.activePoll,
                weeklyChallenge: homeData.weeklyChallenge,
                activityFeed: homeData.recentActivity || [],
                loading: false,
            });
            
            // Load additional data in parallel
            const { fetchStories, fetchFeaturedTemplates, fetchAllBadges } = get();
            Promise.all([
                fetchStories(),
                fetchFeaturedTemplates(),
                fetchAllBadges(),
            ]).catch(console.error);
            
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
        }
    },
    
    fetchCurrentMember: async () => {
        try {
            const member = await communityApi.getCurrentMember();
            set({ currentMember: member as CommunityMember });
        } catch (error) {
            set({ error: handleApiError(error) });
        }
    },
    
    fetchArticles: async (category, loadMore = false) => {
        const { articlesPagination, articles } = get();
        const page = loadMore ? articlesPagination.page + 1 : 0;
        
        if (loadMore && (!articlesPagination.hasMore || articlesPagination.isLoadingMore)) {
            return;
        }
        
        set(state => ({
            loading: !loadMore,
            articlesPagination: { 
                ...state.articlesPagination, 
                isLoadingMore: loadMore 
            },
        }));
        
        try {
            const response = await communityApi.getArticles({
                category,
                page,
                size: DEFAULT_PAGE_SIZE,
            });
            
            set(state => ({
                articles: loadMore 
                    ? [...articles, ...response.content] 
                    : response.content,
                articlesPagination: {
                    page,
                    hasMore: response.hasNext,
                    isLoadingMore: false,
                },
                filters: category 
                    ? { ...state.filters, articleCategory: category }
                    : state.filters,
                loading: false,
            }));
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false,
                articlesPagination: { 
                    ...get().articlesPagination, 
                    isLoadingMore: false 
                },
            });
        }
    },
    
    fetchQuestions: async (status, tag, loadMore = false) => {
        const { questionsPagination, questions } = get();
        const page = loadMore ? questionsPagination.page + 1 : 0;
        
        if (loadMore && (!questionsPagination.hasMore || questionsPagination.isLoadingMore)) {
            return;
        }
        
        set(state => ({
            loading: !loadMore,
            questionsPagination: { 
                ...state.questionsPagination, 
                isLoadingMore: loadMore 
            },
        }));
        
        try {
            const response = await communityApi.getQuestions({
                status,
                tag,
                page,
                size: DEFAULT_PAGE_SIZE,
            });
            
            const content = response?.content || [];
            
            set(state => ({
                questions: loadMore 
                    ? [...(questions || []), ...content] 
                    : content,
                questionsPagination: {
                    page,
                    hasMore: response?.hasNext ?? false,
                    isLoadingMore: false,
                },
                filters: { 
                    ...state.filters, 
                    questionStatus: status,
                    questionTag: tag,
                },
                loading: false,
            }));
        } catch (error) {
            set({ 
                questions: loadMore ? questions : [],
                error: handleApiError(error), 
                loading: false,
                questionsPagination: { 
                    ...get().questionsPagination, 
                    isLoadingMore: false 
                },
            });
        }
    },
    
    fetchQuestionDetail: async (questionId) => {
        set({ loading: true, error: null });
        try {
            const [question, answers] = await Promise.all([
                communityApi.getQuestionById(questionId),
                communityApi.getAnswers(questionId),
            ]);
            
            set({ 
                currentQuestion: question, 
                answers, 
                loading: false 
            });
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
        }
    },
    
    fetchStories: async (category, loadMore = false) => {
        const { storiesPagination, stories } = get();
        const page = loadMore ? storiesPagination.page + 1 : 0;
        
        if (loadMore && (!storiesPagination.hasMore || storiesPagination.isLoadingMore)) {
            return;
        }
        
        set(state => ({
            loading: !loadMore,
            storiesPagination: { 
                ...state.storiesPagination, 
                isLoadingMore: loadMore 
            },
        }));
        
        try {
            const response = await communityApi.getStories({
                category,
                page,
                size: DEFAULT_PAGE_SIZE,
            });
            
            set({
                stories: loadMore 
                    ? [...stories, ...response.content] 
                    : response.content,
                storiesPagination: {
                    page,
                    hasMore: response.hasNext,
                    isLoadingMore: false,
                },
                loading: false,
            });
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false,
                storiesPagination: { 
                    ...get().storiesPagination, 
                    isLoadingMore: false 
                },
            });
        }
    },
    
    fetchTemplates: async (type, loadMore = false) => {
        const { templatesPagination, templates } = get();
        const page = loadMore ? templatesPagination.page + 1 : 0;
        
        if (loadMore && (!templatesPagination.hasMore || templatesPagination.isLoadingMore)) {
            return;
        }
        
        set(state => ({
            loading: !loadMore,
            templatesPagination: { 
                ...state.templatesPagination, 
                isLoadingMore: loadMore 
            },
        }));
        
        try {
            const response = await communityApi.getTemplates({
                type,
                page,
                size: DEFAULT_PAGE_SIZE,
            });
            
            const content = response?.content || [];
            
            set(state => ({
                templates: loadMore 
                    ? [...(templates || []), ...content] 
                    : content,
                templatesPagination: {
                    page,
                    hasMore: response?.hasNext ?? false,
                    isLoadingMore: false,
                },
                filters: type 
                    ? { ...state.filters, templateType: type }
                    : state.filters,
                loading: false,
            }));
        } catch (error) {
            set({ 
                templates: loadMore ? templates : [],
                error: handleApiError(error), 
                loading: false,
                templatesPagination: { 
                    ...get().templatesPagination, 
                    isLoadingMore: false 
                },
            });
        }
    },
    
    fetchFeaturedTemplates: async () => {
        try {
            const featuredTemplates = await communityApi.getFeaturedTemplates();
            set({ featuredTemplates });
        } catch (error) {
            console.error('Failed to fetch featured templates:', error);
        }
    },
    
    fetchLeaderboard: async (period, category) => {
        set({ loading: true, error: null });
        try {
            const [leaderboard, userRank] = await Promise.all([
                communityApi.getLeaderboard(period, category),
                communityApi.getUserRank(period, category).catch(() => null),
            ]);
            
            set({ 
                leaderboard,
                userRank,
                filters: { 
                    ...get().filters, 
                    leaderboardPeriod: period, 
                    leaderboardCategory: category 
                },
                loading: false,
            });
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
        }
    },
    
    fetchPartners: async () => {
        set({ loading: true, error: null });
        try {
            const partners = await communityApi.getPartners();
            set({ partners, loading: false });
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
        }
    },
    
    fetchPartnerRequests: async () => {
        try {
            const partnerRequests = await communityApi.getPartnerRequests();
            set({ partnerRequests });
        } catch (error) {
            set({ error: handleApiError(error) });
        }
    },
    
    fetchMotivationGroups: async () => {
        set({ loading: true, error: null });
        try {
            const response = await communityApi.getGroups();
            set({ motivationGroups: response.content, loading: false });
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
        }
    },
    
    fetchActivityFeed: async (loadMore = false) => {
        const { activityPagination, activityFeed } = get();
        const page = loadMore ? activityPagination.page + 1 : 0;
        
        if (loadMore && (!activityPagination.hasMore || activityPagination.isLoadingMore)) {
            return;
        }
        
        set(state => ({
            activityPagination: { 
                ...state.activityPagination, 
                isLoadingMore: loadMore 
            },
        }));
        
        try {
            const response = await communityApi.getActivityFeed(page, DEFAULT_PAGE_SIZE);
            
            set({
                activityFeed: loadMore 
                    ? [...activityFeed, ...response.content] 
                    : response.content,
                activityPagination: {
                    page,
                    hasMore: response.hasNext,
                    isLoadingMore: false,
                },
            });
        } catch (error) {
            set({ 
                error: handleApiError(error),
                activityPagination: { 
                    ...get().activityPagination, 
                    isLoadingMore: false 
                },
            });
        }
    },
    
    fetchAllBadges: async () => {
        try {
            const allBadges = await communityApi.getAllBadges();
            set({ allBadges });
        } catch (error) {
            console.error('Failed to fetch badges:', error);
        }
    },
    
    fetchFeatureRequests: async () => {
        set({ loading: true, error: null });
        try {
            const response = await communityApi.getFeatureRequests();
            set({ featureRequests: response.content, loading: false });
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
        }
    },
    
    fetchReceivedCompliments: async () => {
        try {
            const receivedCompliments = await communityApi.getReceivedCompliments();
            set({ receivedCompliments });
        } catch (error) {
            console.error('Failed to fetch compliments:', error);
        }
    },
    
    // ==========================================
    // User Interaction Actions
    // ==========================================
    
    upvoteQuestion: async (questionId) => {
        const { questions } = get();
        const question = questions.find(q => q.id === questionId);
        if (!question) return;
        
        // Optimistic update
        const wasUpvoted = question.isUpvotedByUser;
        set(state => ({
            questions: state.questions.map(q => 
                q.id === questionId 
                    ? { 
                        ...q, 
                        upvoteCount: wasUpvoted ? q.upvoteCount - 1 : q.upvoteCount + 1,
                        isUpvotedByUser: !wasUpvoted 
                    }
                    : q
            ),
        }));
        
        try {
            const result = await communityApi.toggleQuestionUpvote(questionId);
            // Update with actual server values
            set(state => ({
                questions: state.questions.map(q => 
                    q.id === questionId 
                        ? { ...q, upvoteCount: result.upvoteCount, isUpvotedByUser: result.upvoted }
                        : q
                ),
            }));
        } catch (error) {
            // Rollback on error
            set(state => ({
                questions: state.questions.map(q => 
                    q.id === questionId 
                        ? { ...q, upvoteCount: question.upvoteCount, isUpvotedByUser: wasUpvoted }
                        : q
                ),
                error: handleApiError(error),
            }));
        }
    },
    
    upvoteAnswer: async (answerId) => {
        const { answers } = get();
        const answer = answers.find(a => a.id === answerId);
        if (!answer) return;
        
        const wasUpvoted = answer.isUpvotedByUser;
        set(state => ({
            answers: state.answers.map(a => 
                a.id === answerId 
                    ? { 
                        ...a, 
                        upvoteCount: wasUpvoted ? a.upvoteCount - 1 : a.upvoteCount + 1,
                        isUpvotedByUser: !wasUpvoted 
                    }
                    : a
            ),
        }));
        
        try {
            const result = await communityApi.toggleAnswerUpvote(answerId);
            set(state => ({
                answers: state.answers.map(a => 
                    a.id === answerId 
                        ? { ...a, upvoteCount: result.upvoteCount, isUpvotedByUser: result.upvoted }
                        : a
                ),
            }));
        } catch (error) {
            set(state => ({
                answers: state.answers.map(a => 
                    a.id === answerId 
                        ? { ...a, upvoteCount: answer.upvoteCount, isUpvotedByUser: wasUpvoted }
                        : a
                ),
                error: handleApiError(error),
            }));
        }
    },
    
    postQuestion: async (title, body, tags) => {
        set({ loading: true, error: null });
        try {
            const newQuestion = await communityApi.createQuestion({ title, body, tags });
            set(state => ({ 
                questions: [newQuestion, ...state.questions],
                loading: false 
            }));
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
            throw error;
        }
    },
    
    postAnswer: async (questionId, body) => {
        set({ loading: true, error: null });
        try {
            const newAnswer = await communityApi.createAnswer(questionId, { body });
            set(state => ({ 
                answers: [...state.answers, newAnswer],
                currentQuestion: state.currentQuestion 
                    ? { ...state.currentQuestion, answerCount: state.currentQuestion.answerCount + 1 }
                    : null,
                loading: false 
            }));
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
            throw error;
        }
    },
    
    likeStory: async (storyId) => {
        const { stories } = get();
        const story = stories.find(s => s.id === storyId);
        if (!story) return;
        
        const wasLiked = story.isLikedByUser;
        set(state => ({
            stories: state.stories.map(s => 
                s.id === storyId 
                    ? { 
                        ...s, 
                        likeCount: wasLiked ? s.likeCount - 1 : s.likeCount + 1,
                        isLikedByUser: !wasLiked 
                    }
                    : s
            ),
        }));
        
        try {
            const result = await communityApi.toggleStoryLike(storyId);
            set(state => ({
                stories: state.stories.map(s => 
                    s.id === storyId 
                        ? { ...s, likeCount: result.likeCount, isLikedByUser: result.liked }
                        : s
                ),
            }));
        } catch (error) {
            set(state => ({
                stories: state.stories.map(s => 
                    s.id === storyId 
                        ? { ...s, likeCount: story.likeCount, isLikedByUser: wasLiked }
                        : s
                ),
                error: handleApiError(error),
            }));
        }
    },
    
    celebrateStory: async (storyId) => {
        const { stories } = get();
        const story = stories.find(s => s.id === storyId);
        if (!story) return;
        
        const wasCelebrated = story.isCelebratedByUser;
        set(state => ({
            stories: state.stories.map(s => 
                s.id === storyId 
                    ? { 
                        ...s, 
                        celebrateCount: wasCelebrated ? s.celebrateCount - 1 : s.celebrateCount + 1,
                        isCelebratedByUser: !wasCelebrated 
                    }
                    : s
            ),
        }));
        
        try {
            const result = await communityApi.toggleStoryCelebrate(storyId);
            set(state => ({
                stories: state.stories.map(s => 
                    s.id === storyId 
                        ? { ...s, celebrateCount: result.celebrateCount, isCelebratedByUser: result.celebrated }
                        : s
                ),
            }));
        } catch (error) {
            set(state => ({
                stories: state.stories.map(s => 
                    s.id === storyId 
                        ? { ...s, celebrateCount: story.celebrateCount, isCelebratedByUser: wasCelebrated }
                        : s
                ),
                error: handleApiError(error),
            }));
        }
    },
    
    postStory: async (story) => {
        set({ loading: true, error: null });
        try {
            const newStory = await communityApi.createStory({
                title: story.title || '',
                story: story.story || '',
                category: story.category || 'other',
                lifeWheelAreaId: story.lifeWheelAreaId,
                metrics: story.metrics,
            });
            set(state => ({ 
                stories: [newStory, ...state.stories],
                loading: false 
            }));
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
            throw error;
        }
    },
    
    downloadTemplate: async (templateId) => {
        try {
            const template = await communityApi.downloadTemplate(templateId);
            // Update download count
            set(state => ({
                templates: state.templates.map(t => 
                    t.id === templateId 
                        ? { ...t, downloadCount: t.downloadCount + 1 }
                        : t
                ),
            }));
            return template;
        } catch (error) {
            set({ error: handleApiError(error) });
            throw error;
        }
    },
    
    rateTemplate: async (templateId, rating) => {
        try {
            const result = await communityApi.rateTemplate(templateId, rating);
            set(state => ({
                templates: state.templates.map(t => 
                    t.id === templateId 
                        ? { ...t, rating: result.rating, ratingCount: result.ratingCount }
                        : t
                ),
            }));
        } catch (error) {
            set({ error: handleApiError(error) });
            throw error;
        }
    },
    
    bookmarkTemplate: async (templateId) => {
        const { templates } = get();
        const template = templates.find(t => t.id === templateId);
        if (!template) return;
        
        const wasBookmarked = template.isBookmarked;
        set(state => ({
            templates: state.templates.map(t => 
                t.id === templateId 
                    ? { ...t, isBookmarked: !wasBookmarked }
                    : t
            ),
        }));
        
        try {
            await communityApi.toggleTemplateBookmark(templateId);
        } catch (error) {
            set(state => ({
                templates: state.templates.map(t => 
                    t.id === templateId 
                        ? { ...t, isBookmarked: wasBookmarked }
                        : t
                ),
                error: handleApiError(error),
            }));
        }
    },
    
    sendPartnerRequest: async (userId, message) => {
        set({ loading: true, error: null });
        try {
            await communityApi.sendPartnerRequest({ toUserId: userId, message });
            set({ loading: false });
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
            throw error;
        }
    },
    
    respondToPartnerRequest: async (requestId, accept) => {
        set({ loading: true, error: null });
        try {
            await communityApi.respondToPartnerRequest(requestId, accept);
            
            if (accept) {
                // Refresh partners list after accepting
                await get().fetchPartners();
            }
            
            // Remove the request from the list
            set(state => ({
                partnerRequests: state.partnerRequests.filter(r => r.id !== requestId),
                loading: false,
            }));
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
            throw error;
        }
    },
    
    removePartner: async (partnerId) => {
        set({ loading: true, error: null });
        try {
            await communityApi.removePartner(partnerId);
            set(state => ({
                partners: state.partners.filter(p => p.id !== partnerId),
                loading: false,
            }));
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
            throw error;
        }
    },
    
    joinGroup: async (groupId) => {
        const { motivationGroups } = get();
        const group = motivationGroups.find(g => g.id === groupId);
        if (!group || group.isJoined) return;
        
        // Optimistic update
        set(state => ({
            motivationGroups: state.motivationGroups.map(g => 
                g.id === groupId 
                    ? { ...g, isJoined: true, memberCount: g.memberCount + 1 }
                    : g
            ),
        }));
        
        try {
            await communityApi.joinGroup(groupId);
        } catch (error) {
            // Rollback
            set(state => ({
                motivationGroups: state.motivationGroups.map(g => 
                    g.id === groupId 
                        ? { ...g, isJoined: false, memberCount: g.memberCount - 1 }
                        : g
                ),
                error: handleApiError(error),
            }));
        }
    },
    
    leaveGroup: async (groupId) => {
        const { motivationGroups } = get();
        const group = motivationGroups.find(g => g.id === groupId);
        if (!group || !group.isJoined) return;
        
        // Optimistic update
        set(state => ({
            motivationGroups: state.motivationGroups.map(g => 
                g.id === groupId 
                    ? { ...g, isJoined: false, memberCount: g.memberCount - 1 }
                    : g
            ),
        }));
        
        try {
            await communityApi.leaveGroup(groupId);
        } catch (error) {
            // Rollback
            set(state => ({
                motivationGroups: state.motivationGroups.map(g => 
                    g.id === groupId 
                        ? { ...g, isJoined: true, memberCount: g.memberCount + 1 }
                        : g
                ),
                error: handleApiError(error),
            }));
        }
    },
    
    votePoll: async (pollId, optionId) => {
        const { activePoll } = get();
        if (!activePoll || activePoll.userVotedOptionId) return;
        
        // Optimistic update
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
        
        try {
            const result = await communityApi.votePoll(pollId, optionId);
            set({ activePoll: result });
        } catch (error) {
            // Rollback
            set({
                activePoll,
                error: handleApiError(error),
            });
        }
    },
    
    joinWeeklyChallenge: async (challengeId) => {
        const { weeklyChallenge } = get();
        if (!weeklyChallenge || weeklyChallenge.isJoined) return;
        
        // Optimistic update
        set(state => ({
            weeklyChallenge: state.weeklyChallenge?.id === challengeId 
                ? {
                    ...state.weeklyChallenge,
                    isJoined: true,
                    participantCount: state.weeklyChallenge.participantCount + 1,
                }
                : state.weeklyChallenge,
        }));
        
        try {
            await communityApi.joinWeeklyChallenge(challengeId);
        } catch (error) {
            // Rollback
            set({
                weeklyChallenge,
                error: handleApiError(error),
            });
        }
    },
    
    sendCompliment: async (toUserId, message, category) => {
        try {
            await communityApi.sendCompliment({ toUserId, message, category });
        } catch (error) {
            set({ error: handleApiError(error) });
            throw error;
        }
    },
    
    sendKudos: async (toUserId, message, category) => {
        try {
            const newKudos = await communityApi.sendKudos({ toUserId, message, category });
            set(state => ({
                publicKudos: [newKudos, ...state.publicKudos],
            }));
        } catch (error) {
            set({ error: handleApiError(error) });
            throw error;
        }
    },
    
    submitFeatureRequest: async (title, description) => {
        set({ loading: true, error: null });
        try {
            const newRequest = await communityApi.submitFeatureRequest({ title, description });
            set(state => ({
                featureRequests: [newRequest, ...state.featureRequests],
                loading: false,
            }));
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
            throw error;
        }
    },
    
    upvoteFeatureRequest: async (requestId) => {
        const { featureRequests } = get();
        const request = featureRequests.find(r => r.id === requestId);
        if (!request) return;
        
        const wasUpvoted = request.isUpvotedByUser;
        set(state => ({
            featureRequests: state.featureRequests.map(r => 
                r.id === requestId 
                    ? { 
                        ...r, 
                        upvoteCount: wasUpvoted ? r.upvoteCount - 1 : r.upvoteCount + 1,
                        isUpvotedByUser: !wasUpvoted 
                    }
                    : r
            ),
        }));
        
        try {
            const result = await communityApi.toggleFeatureRequestUpvote(requestId);
            set(state => ({
                featureRequests: state.featureRequests.map(r => 
                    r.id === requestId 
                        ? { ...r, upvoteCount: result.upvoteCount, isUpvotedByUser: result.upvoted }
                        : r
                ),
            }));
        } catch (error) {
            set(state => ({
                featureRequests: state.featureRequests.map(r => 
                    r.id === requestId 
                        ? { ...r, upvoteCount: request.upvoteCount, isUpvotedByUser: wasUpvoted }
                        : r
                ),
                error: handleApiError(error),
            }));
        }
    },
    
    celebrateActivity: async (activityId) => {
        const { activityFeed } = get();
        const activity = activityFeed.find(a => a.id === activityId);
        if (!activity) return;
        
        // Optimistic update
        set(state => ({
            activityFeed: state.activityFeed.map(a => 
                a.id === activityId 
                    ? { ...a, celebrateCount: a.celebrateCount + 1 }
                    : a
            ),
        }));
        
        try {
            const result = await communityApi.celebrateActivity(activityId);
            set(state => ({
                activityFeed: state.activityFeed.map(a => 
                    a.id === activityId 
                        ? { ...a, celebrateCount: result.celebrateCount }
                        : a
                ),
            }));
        } catch (error) {
            // Rollback
            set(state => ({
                activityFeed: state.activityFeed.map(a => 
                    a.id === activityId 
                        ? { ...a, celebrateCount: activity.celebrateCount }
                        : a
                ),
                error: handleApiError(error),
            }));
        }
    },
    
    updateProfile: async (data) => {
        set({ loading: true, error: null });
        try {
            const updatedMember = await communityApi.updateProfile(data);
            set({ 
                currentMember: updatedMember as CommunityMember,
                loading: false 
            });
        } catch (error) {
            set({ 
                error: handleApiError(error), 
                loading: false 
            });
            throw error;
        }
    },
    
    // ==========================================
    // Knowledge Hub Actions
    // ==========================================
    
    fetchKnowledgeCategories: async () => {
        set({ knowledgeLoading: true });
        try {
            const categories = await communityApi.getKnowledgeCategories();
            set({ knowledgeCategories: categories, knowledgeLoading: false });
        } catch (error) {
            set({ error: handleApiError(error), knowledgeLoading: false });
        }
    },
    
    fetchKnowledgeItems: async (categoryId, search) => {
        set({ knowledgeLoading: true });
        try {
            const items = await communityApi.getKnowledgeItems({
                categoryId: categoryId || undefined,
                search: search || undefined,
            });
            set({ knowledgeItems: items, knowledgeLoading: false });
        } catch (error) {
            set({ error: handleApiError(error), knowledgeLoading: false });
        }
    },
    
    fetchFeaturedKnowledgeItems: async () => {
        try {
            const items = await communityApi.getFeaturedKnowledgeItems();
            set({ featuredKnowledgeItems: items });
        } catch (error) {
            set({ error: handleApiError(error) });
        }
    },
    
    setSelectedKnowledgeCategory: (categoryId) => {
        set({ selectedKnowledgeCategory: categoryId });
    },
    
    // ==========================================
    // Filter & UI Actions
    // ==========================================
    
    setFilters: (filters) => {
        set(state => ({
            filters: { ...state.filters, ...filters },
        }));
    },
    
    clearError: () => {
        set({ error: null });
    },
    
    resetPagination: (key) => {
        set({
            [key]: createPaginationState(),
        });
    },
}));
