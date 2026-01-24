import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    EssentiaBook,
    EssentiaProgress,
    EssentiaHighlight,
    EssentiaFlashcard,
    EssentiaStreak,
    EssentiaUserStats,
    EssentiaChallenge,
    EssentiaUserChallenge,
    EssentiaBadge,
    EssentiaBadgeType,
    LifeWheelDimensionTag,
} from '../types/models';

interface EssentiaState {
    // Content
    allBooks: EssentiaBook[];
    challenges: EssentiaChallenge[];
    
    // User Data
    userStats: EssentiaUserStats | null;
    streak: EssentiaStreak | null;
    progress: EssentiaProgress[];
    savedBookIds: string[];
    history: string[]; // book IDs in order of last read
    highlights: EssentiaHighlight[];
    flashcards: EssentiaFlashcard[];
    userChallenges: EssentiaUserChallenge[];
    badges: EssentiaBadge[];
    
    // UI State
    loading: boolean;
    error: string | null;
    currentBookId: string | null;
    audioSpeed: number;
    autoPlayAudio: boolean;
    
    // Actions - Content
    setAllBooks: (books: EssentiaBook[]) => void;
    setChallenges: (challenges: EssentiaChallenge[]) => void;
    getBookById: (bookId: string) => EssentiaBook | undefined;
    getBooksByCategory: (lifeWheelAreaId: LifeWheelDimensionTag) => EssentiaBook[];
    searchBooks: (query: string) => EssentiaBook[];
    
    // Actions - Reading Progress
    startReading: (bookId: string) => void;
    updateProgress: (bookId: string, cardId: string, cardIndex: number) => void;
    completeBook: (bookId: string) => void;
    getBookProgress: (bookId: string) => EssentiaProgress | undefined;
    
    // Actions - Library
    toggleSaveBook: (bookId: string) => void;
    isBookSaved: (bookId: string) => boolean;
    addToHistory: (bookId: string) => void;
    getInProgressBooks: () => EssentiaProgress[];
    getCompletedBooks: () => string[];
    
    // Actions - Highlights & Flashcards
    addHighlight: (bookId: string, cardId: string, text: string, note?: string) => void;
    removeHighlight: (highlightId: string) => void;
    getHighlightsForBook: (bookId: string) => EssentiaHighlight[];
    generateFlashcard: (highlightId: string) => void;
    reviewFlashcard: (flashcardId: string, correct: boolean) => void;
    getFlashcardsDueToday: () => EssentiaFlashcard[];
    
    // Actions - Gamification
    addXP: (amount: number, reason?: string) => void;
    checkAndUpdateLevel: () => void;
    updateStreak: () => void;
    breakStreak: () => void;
    unlockBadge: (badgeType: EssentiaBadgeType) => void;
    checkBadgeUnlocks: () => void;
    
    // Actions - Challenges
    enrollInChallenge: (challengeId: string) => void;
    completeChallengeDayBook: (challengeId: string, bookId: string) => void;
    getActiveChallenge: () => EssentiaUserChallenge | undefined;
    
    // Actions - Settings
    setAudioSpeed: (speed: number) => void;
    setAutoPlayAudio: (enabled: boolean) => void;
    setDailyGoal: (minutes: number) => void;
    
    // Actions - Daily Updates
    getDailyPick: () => EssentiaBook | undefined;
    getTodayMinutesRead: () => number;
    
    // Utility
    reset: () => void;
}

const XP_PER_LEVEL = 1000;
const LEVEL_NAMES = ['Beginner', 'Reader', 'Scholar', 'Expert', 'Master', 'Sage'];

const getLevelInfo = (xp: number) => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const levelIndex = Math.min(Math.floor(level / 5), LEVEL_NAMES.length - 1);
    const levelName = LEVEL_NAMES[levelIndex];
    const nextLevelXP = level * XP_PER_LEVEL;
    
    return { level, levelName, nextLevelXP };
};

const calculateNextReviewDate = (flashcard: EssentiaFlashcard, correct: boolean): { date: string; interval: number; easeFactor: number } => {
    let { interval, easeFactor } = flashcard;
    
    if (correct) {
        interval = interval === 0 ? 1 : interval * 2;
        easeFactor = Math.min(easeFactor + 0.1, 2.5);
    } else {
        interval = 1;
        easeFactor = Math.max(easeFactor - 0.2, 1.3);
    }
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    
    return {
        date: nextDate.toISOString(),
        interval,
        easeFactor,
    };
};

const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

export const useEssentiaStore = create<EssentiaState>()(
    persist(
        (set, get) => ({
            // Initial State
            allBooks: [],
            challenges: [],
            userStats: null,
            streak: null,
            progress: [],
            savedBookIds: [],
            history: [],
            highlights: [],
            flashcards: [],
            userChallenges: [],
            badges: [],
            loading: false,
            error: null,
            currentBookId: null,
            audioSpeed: 1.0,
            autoPlayAudio: true,
            
            // Content Actions
            setAllBooks: (books) => set({ allBooks: books }),
            
            setChallenges: (challenges) => set({ challenges }),
            
            getBookById: (bookId) => {
                return get().allBooks.find(book => book.id === bookId);
            },
            
            getBooksByCategory: (lifeWheelAreaId) => {
                return get().allBooks.filter(book => book.lifeWheelAreaId === lifeWheelAreaId);
            },
            
            searchBooks: (query) => {
                const lowerQuery = query.toLowerCase();
                return get().allBooks.filter(book => 
                    book.title.toLowerCase().includes(lowerQuery) ||
                    book.author.toLowerCase().includes(lowerQuery) ||
                    book.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
                );
            },
            
            // Reading Progress Actions
            startReading: (bookId) => {
                const book = get().getBookById(bookId);
                if (!book) return;
                
                const existingProgress = get().progress.find(p => p.bookId === bookId);
                if (existingProgress) {
                    // Resume reading
                    set({ currentBookId: bookId });
                    return;
                }
                
                // Start new reading session
                const newProgress: EssentiaProgress = {
                    bookId,
                    userId: 'current_user', // Replace with actual user ID
                    currentCardId: book.cards[0].id,
                    currentCardIndex: 0,
                    percentComplete: 0,
                    startedAt: new Date().toISOString(),
                    lastReadAt: new Date().toISOString(),
                    timeSpent: 0,
                };
                
                set(state => ({
                    progress: [...state.progress, newProgress],
                    currentBookId: bookId,
                }));
                
                get().addToHistory(bookId);
            },
            
            updateProgress: (bookId, cardId, cardIndex) => {
                const book = get().getBookById(bookId);
                if (!book) return;
                
                const percentComplete = Math.round((cardIndex / book.cards.length) * 100);
                
                set(state => ({
                    progress: state.progress.map(p =>
                        p.bookId === bookId
                            ? {
                                ...p,
                                currentCardId: cardId,
                                currentCardIndex: cardIndex,
                                percentComplete,
                                lastReadAt: new Date().toISOString(),
                            }
                            : p
                    ),
                }));
            },
            
            completeBook: (bookId) => {
                const book = get().getBookById(bookId);
                if (!book) return;
                
                // Update progress
                set(state => ({
                    progress: state.progress.map(p =>
                        p.bookId === bookId
                            ? {
                                ...p,
                                percentComplete: 100,
                                completedAt: new Date().toISOString(),
                                lastReadAt: new Date().toISOString(),
                            }
                            : p
                    ),
                }));
                
                // Award XP
                get().addXP(100, 'Completed book');
                
                // Update streak
                get().updateStreak();
                
                // Update stats
                set(state => ({
                    userStats: state.userStats ? {
                        ...state.userStats,
                        booksCompleted: state.userStats.booksCompleted + 1,
                        totalMinutesRead: state.userStats.totalMinutesRead + book.duration,
                        lastActiveAt: new Date().toISOString(),
                    } : null,
                }));
                
                // Check for badge unlocks
                get().checkBadgeUnlocks();
            },
            
            getBookProgress: (bookId) => {
                return get().progress.find(p => p.bookId === bookId);
            },
            
            // Library Actions
            toggleSaveBook: (bookId) => {
                set(state => ({
                    savedBookIds: state.savedBookIds.includes(bookId)
                        ? state.savedBookIds.filter(id => id !== bookId)
                        : [...state.savedBookIds, bookId],
                }));
            },
            
            isBookSaved: (bookId) => {
                return get().savedBookIds.includes(bookId);
            },
            
            addToHistory: (bookId) => {
                set(state => ({
                    history: [bookId, ...state.history.filter(id => id !== bookId)],
                }));
            },
            
            getInProgressBooks: () => {
                return get().progress.filter(p => 
                    p.percentComplete > 0 && p.percentComplete < 100
                );
            },
            
            getCompletedBooks: () => {
                return get().progress
                    .filter(p => p.percentComplete === 100)
                    .map(p => p.bookId);
            },
            
            // Highlights & Flashcards Actions
            addHighlight: (bookId, cardId, text, note) => {
                const newHighlight: EssentiaHighlight = {
                    id: `highlight_${Date.now()}`,
                    userId: 'current_user',
                    bookId,
                    cardId,
                    text,
                    note,
                    createdAt: new Date().toISOString(),
                };
                
                set(state => ({
                    highlights: [...state.highlights, newHighlight],
                    userStats: state.userStats ? {
                        ...state.userStats,
                        highlightsCreated: state.userStats.highlightsCreated + 1,
                    } : null,
                }));
                
                // Auto-generate flashcard
                get().generateFlashcard(newHighlight.id);
            },
            
            removeHighlight: (highlightId) => {
                set(state => ({
                    highlights: state.highlights.filter(h => h.id !== highlightId),
                    flashcards: state.flashcards.filter(f => f.highlightId !== highlightId),
                }));
            },
            
            getHighlightsForBook: (bookId) => {
                return get().highlights.filter(h => h.bookId === bookId);
            },
            
            generateFlashcard: (highlightId) => {
                const highlight = get().highlights.find(h => h.id === highlightId);
                if (!highlight) return;
                
                // Simple question generation (in production, use AI)
                const question = `What is the key insight about: ${highlight.text.substring(0, 50)}...?`;
                
                const newFlashcard: EssentiaFlashcard = {
                    id: `flashcard_${Date.now()}`,
                    userId: 'current_user',
                    highlightId: highlight.id,
                    bookId: highlight.bookId,
                    question,
                    answer: highlight.text,
                    nextReviewDate: new Date().toISOString(),
                    reviewCount: 0,
                    correctCount: 0,
                    incorrectCount: 0,
                    easeFactor: 2.0,
                    interval: 0,
                    createdAt: new Date().toISOString(),
                };
                
                set(state => ({
                    flashcards: [...state.flashcards, newFlashcard],
                }));
            },
            
            reviewFlashcard: (flashcardId, correct) => {
                const flashcard = get().flashcards.find(f => f.id === flashcardId);
                if (!flashcard) return;
                
                const { date, interval, easeFactor } = calculateNextReviewDate(flashcard, correct);
                
                set(state => ({
                    flashcards: state.flashcards.map(f =>
                        f.id === flashcardId
                            ? {
                                ...f,
                                nextReviewDate: date,
                                reviewCount: f.reviewCount + 1,
                                correctCount: correct ? f.correctCount + 1 : f.correctCount,
                                incorrectCount: correct ? f.incorrectCount : f.incorrectCount + 1,
                                easeFactor,
                                interval,
                                lastReviewedAt: new Date().toISOString(),
                            }
                            : f
                    ),
                    userStats: state.userStats ? {
                        ...state.userStats,
                        flashcardsReviewed: state.userStats.flashcardsReviewed + 1,
                    } : null,
                }));
                
                // Award XP
                get().addXP(10, 'Reviewed flashcard');
            },
            
            getFlashcardsDueToday: () => {
                const today = new Date().toISOString();
                return get().flashcards.filter(f => f.nextReviewDate <= today);
            },
            
            // Gamification Actions
            addXP: (amount, reason) => {
                set(state => ({
                    userStats: state.userStats ? {
                        ...state.userStats,
                        totalXP: state.userStats.totalXP + amount,
                    } : null,
                }));
                
                get().checkAndUpdateLevel();
            },
            
            checkAndUpdateLevel: () => {
                const stats = get().userStats;
                if (!stats) return;
                
                const { level, levelName, nextLevelXP } = getLevelInfo(stats.totalXP);
                
                if (level > stats.level) {
                    set(state => ({
                        userStats: state.userStats ? {
                            ...state.userStats,
                            level,
                            levelName,
                            nextLevelXP,
                        } : null,
                    }));
                    
                    // Check for level-based badges
                    get().checkBadgeUnlocks();
                }
            },
            
            updateStreak: () => {
                const streak = get().streak;
                const today = getTodayDateString();
                
                if (!streak) {
                    // Initialize streak
                    set({
                        streak: {
                            userId: 'current_user',
                            currentStreak: 1,
                            longestStreak: 1,
                            lastActiveDate: today,
                            streakFreezes: 0,
                            streakHistory: [{
                                date: today,
                                booksCompleted: 1,
                                minutesRead: 0,
                            }],
                        },
                    });
                    return;
                }
                
                // Check if already updated today
                if (streak.lastActiveDate === today) {
                    // Update today's stats
                    set(state => ({
                        streak: state.streak ? {
                            ...state.streak,
                            streakHistory: state.streak.streakHistory.map(h =>
                                h.date === today
                                    ? { ...h, booksCompleted: h.booksCompleted + 1 }
                                    : h
                            ),
                        } : null,
                    }));
                    return;
                }
                
                // Check if yesterday
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toISOString().split('T')[0];
                
                if (streak.lastActiveDate === yesterdayString) {
                    // Continue streak
                    const newStreak = streak.currentStreak + 1;
                    set(state => ({
                        streak: state.streak ? {
                            ...state.streak,
                            currentStreak: newStreak,
                            longestStreak: Math.max(newStreak, state.streak.longestStreak),
                            lastActiveDate: today,
                            streakHistory: [
                                ...state.streak.streakHistory,
                                { date: today, booksCompleted: 1, minutesRead: 0 },
                            ],
                        } : null,
                    }));
                    
                    // Award bonus XP for streaks
                    if (newStreak % 7 === 0) {
                        get().addXP(50, `${newStreak}-day streak bonus`);
                    }
                    
                    // Check for streak badges
                    get().checkBadgeUnlocks();
                } else {
                    // Streak broken
                    get().breakStreak();
                }
            },
            
            breakStreak: () => {
                const today = getTodayDateString();
                set(state => ({
                    streak: state.streak ? {
                        ...state.streak,
                        currentStreak: 1,
                        lastActiveDate: today,
                        streakHistory: [
                            ...state.streak.streakHistory,
                            { date: today, booksCompleted: 1, minutesRead: 0 },
                        ],
                    } : null,
                }));
            },
            
            unlockBadge: (badgeType) => {
                const existingBadge = get().badges.find(b => b.type === badgeType);
                if (existingBadge) return;
                
                const badgeDefinitions: Record<EssentiaBadgeType, { name: string; description: string }> = {
                    early_bird: { name: 'Early Bird', description: 'Read before 8 AM' },
                    night_owl: { name: 'Night Owl', description: 'Read after 10 PM' },
                    speed_reader: { name: 'Speed Reader', description: 'Complete 5 books in one day' },
                    consistent: { name: 'Consistent', description: '30-day reading streak' },
                    scholar: { name: 'Scholar', description: '100 books completed' },
                    category_master: { name: 'Category Master', description: 'Read 10 books in one category' },
                    '7_day_streak': { name: '7-Day Streak', description: 'Read for 7 consecutive days' },
                    '30_day_streak': { name: '30-Day Streak', description: 'Read for 30 consecutive days' },
                    '100_day_streak': { name: '100-Day Streak', description: 'Read for 100 consecutive days' },
                    '365_day_streak': { name: 'Year of Learning', description: 'Read for 365 consecutive days' },
                    first_book: { name: 'First Book', description: 'Complete your first book' },
                    '100_books': { name: 'Century Club', description: 'Complete 100 books' },
                };
                
                const definition = badgeDefinitions[badgeType];
                if (!definition) return;
                
                const newBadge: EssentiaBadge = {
                    type: badgeType,
                    name: definition.name,
                    description: definition.description,
                    unlockedAt: new Date().toISOString(),
                };
                
                set(state => ({
                    badges: [...state.badges, newBadge],
                    userStats: state.userStats ? {
                        ...state.userStats,
                        badges: [...state.userStats.badges, badgeType],
                    } : null,
                }));
            },
            
            checkBadgeUnlocks: () => {
                const { userStats, streak } = get();
                if (!userStats) return;
                
                // Check first book
                if (userStats.booksCompleted === 1) {
                    get().unlockBadge('first_book');
                }
                
                // Check 100 books
                if (userStats.booksCompleted === 100) {
                    get().unlockBadge('100_books');
                    get().unlockBadge('scholar');
                }
                
                // Check streaks
                if (streak) {
                    if (streak.currentStreak === 7) get().unlockBadge('7_day_streak');
                    if (streak.currentStreak === 30) get().unlockBadge('30_day_streak');
                    if (streak.currentStreak === 30) get().unlockBadge('consistent');
                    if (streak.currentStreak === 100) get().unlockBadge('100_day_streak');
                    if (streak.currentStreak === 365) get().unlockBadge('365_day_streak');
                }
            },
            
            // Challenge Actions
            enrollInChallenge: (challengeId) => {
                const existingEnrollment = get().userChallenges.find(
                    uc => uc.challengeId === challengeId && uc.status === 'active'
                );
                
                if (existingEnrollment) return;
                
                const newUserChallenge: EssentiaUserChallenge = {
                    id: `user_challenge_${Date.now()}`,
                    userId: 'current_user',
                    challengeId,
                    startDate: new Date().toISOString(),
                    currentDay: 1,
                    completedBookIds: [],
                    status: 'active',
                };
                
                set(state => ({
                    userChallenges: [...state.userChallenges, newUserChallenge],
                }));
            },
            
            completeChallengeDayBook: (challengeId, bookId) => {
                set(state => ({
                    userChallenges: state.userChallenges.map(uc => {
                        if (uc.challengeId === challengeId && uc.status === 'active') {
                            const completedBooks = [...uc.completedBookIds, bookId];
                            const challenge = state.challenges.find(c => c.id === challengeId);
                            
                            // Check if challenge is complete
                            const isComplete = challenge && completedBooks.length >= challenge.bookIds.length;
                            
                            return {
                                ...uc,
                                completedBookIds: completedBooks,
                                currentDay: uc.currentDay + 1,
                                status: isComplete ? 'completed' as const : uc.status,
                                completedAt: isComplete ? new Date().toISOString() : undefined,
                            };
                        }
                        return uc;
                    }),
                }));
                
                // Award XP for challenge day completion
                get().addXP(50, 'Challenge day completed');
                
                // Check if challenge fully completed
                const userChallenge = get().userChallenges.find(
                    uc => uc.challengeId === challengeId
                );
                
                if (userChallenge?.status === 'completed') {
                    const challenge = get().challenges.find(c => c.id === challengeId);
                    if (challenge) {
                        get().addXP(challenge.rewards.xp, 'Challenge completed');
                        if (challenge.rewards.badge) {
                            get().unlockBadge(challenge.rewards.badge);
                        }
                    }
                }
            },
            
            getActiveChallenge: () => {
                return get().userChallenges.find(uc => uc.status === 'active');
            },
            
            // Settings Actions
            setAudioSpeed: (speed) => set({ audioSpeed: speed }),
            
            setAutoPlayAudio: (enabled) => set({ autoPlayAudio: enabled }),
            
            setDailyGoal: (minutes) => {
                set(state => ({
                    userStats: state.userStats ? {
                        ...state.userStats,
                        dailyGoalMinutes: minutes,
                    } : null,
                }));
            },
            
            // Daily Updates
            getDailyPick: () => {
                const { allBooks, history, userStats } = get();
                
                // Filter out read books
                const unreadBooks = allBooks.filter(book => !history.includes(book.id));
                
                if (unreadBooks.length === 0) return undefined;
                
                // Simple recommendation: pick from user's interests
                // In production, use a more sophisticated algorithm
                return unreadBooks[Math.floor(Math.random() * unreadBooks.length)];
            },
            
            getTodayMinutesRead: () => {
                const today = getTodayDateString();
                const streak = get().streak;
                
                if (!streak) return 0;
                
                const todayEntry = streak.streakHistory.find(h => h.date === today);
                return todayEntry?.minutesRead || 0;
            },
            
            // Utility
            reset: () => {
                set({
                    progress: [],
                    savedBookIds: [],
                    history: [],
                    highlights: [],
                    flashcards: [],
                    userChallenges: [],
                    badges: [],
                    currentBookId: null,
                    audioSpeed: 1.0,
                    autoPlayAudio: true,
                });
            },
        }),
        {
            name: 'essentia-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Persist user-specific data only
                userStats: state.userStats,
                streak: state.streak,
                progress: state.progress,
                savedBookIds: state.savedBookIds,
                history: state.history,
                highlights: state.highlights,
                flashcards: state.flashcards,
                userChallenges: state.userChallenges,
                badges: state.badges,
                audioSpeed: state.audioSpeed,
                autoPlayAudio: state.autoPlayAudio,
            }),
        }
    )
);
