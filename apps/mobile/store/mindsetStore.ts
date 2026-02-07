import { logger } from '../utils/logger';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MindsetContent, MindsetTheme, LifeWheelDimensionTag } from '../types/models';

interface MindsetState {
    // Content & Themes
    allContent: MindsetContent[];
    themes: MindsetTheme[];
    currentTheme: string;
    
    // Feed State
    feedContent: MindsetContent[];
    currentIndex: number;
    
    // Favorites
    favorites: string[]; // content IDs
    
    // Algorithm State
    weakDimensions: LifeWheelDimensionTag[];
    lastAlgorithmUpdate: string | null;
    interventionRatio: number; // 0-1, default 0.4 (40%)
    
    // Session Tracking
    currentSessionId: string | null;
    sessionStartTime: string | null;
    totalDwellTime: number;
    
    // Actions
    setAllContent: (content: MindsetContent[]) => void;
    setThemes: (themes: MindsetTheme[]) => void;
    setCurrentTheme: (themeId: string) => void;
    
    // Feed Management
    generateFeed: () => void;
    nextContent: () => void;
    previousContent: () => void;
    updateDwellTime: (contentId: string, ms: number) => void;
    
    // Favorites
    toggleFavorite: (contentId: string) => void;
    isFavorite: (contentId: string) => boolean;
    
    // Algorithm
    updateWeakDimensions: (dimensions: LifeWheelDimensionTag[]) => void;
    getWeightedFeed: () => MindsetContent[];
    
    // Session
    startSession: () => void;
    endSession: () => void;
    
    // Actions (Kaiz Integration)
    internalize: (contentId: string) => void; // Save to journal
    operationalize: (contentId: string) => void; // Convert to task
    
    reset: () => void;
}

export const useMindsetStore = create<MindsetState>()(
    persist(
        (set, get) => ({
            // Initial State
            allContent: [],
            themes: [],
            currentTheme: 'minimalist',
            feedContent: [],
            currentIndex: 0,
            favorites: [],
            weakDimensions: [],
            lastAlgorithmUpdate: null,
            interventionRatio: 0.4,
            currentSessionId: null,
            sessionStartTime: null,
            totalDwellTime: 0,

            // Content & Theme Setup
            setAllContent: (content) => {
                set({ allContent: content });
                // Auto-generate initial feed
                get().generateFeed();
            },

            setThemes: (themes) => set({ themes }),

            setCurrentTheme: (themeId) => set({ currentTheme: themeId }),

            // Feed Management
            generateFeed: () => {
                const weightedFeed = get().getWeightedFeed();
                set({ 
                    feedContent: weightedFeed,
                    currentIndex: 0 
                });
            },

            nextContent: () => {
                const { currentIndex, feedContent } = get();
                if (currentIndex < feedContent.length - 1) {
                    set({ currentIndex: currentIndex + 1 });
                } else {
                    // Regenerate feed when reaching the end
                    get().generateFeed();
                }
            },

            previousContent: () => {
                const { currentIndex } = get();
                if (currentIndex > 0) {
                    set({ currentIndex: currentIndex - 1 });
                }
            },

            updateDwellTime: (contentId, ms) => {
                set((state) => ({
                    allContent: state.allContent.map((content) =>
                        content.id === contentId
                            ? { ...content, dwellTimeMs: (content.dwellTimeMs || 0) + ms }
                            : content
                    ),
                    totalDwellTime: state.totalDwellTime + ms,
                }));
            },

            // Favorites
            toggleFavorite: (contentId) => {
                set((state) => {
                    const isFav = state.favorites.includes(contentId);
                    return {
                        favorites: isFav
                            ? state.favorites.filter((id) => id !== contentId)
                            : [...state.favorites, contentId],
                        allContent: state.allContent.map((content) =>
                            content.id === contentId
                                ? { ...content, isFavorite: !isFav }
                                : content
                        ),
                    };
                });
            },

            isFavorite: (contentId) => {
                return get().favorites.includes(contentId);
            },

            // Algorithm - Contextual Injection Engine
            updateWeakDimensions: (dimensions) => {
                set({
                    weakDimensions: dimensions,
                    lastAlgorithmUpdate: new Date().toISOString(),
                });
                // Regenerate feed with new targeting
                get().generateFeed();
            },

            getWeightedFeed: () => {
                const { allContent, weakDimensions, interventionRatio } = get();
                
                if (allContent.length === 0) return [];

                // Separate content by type
                const genericContent = allContent.filter(
                    (c) => c.dimensionTag === 'generic' || c.interventionWeight < 50
                );
                const interventionContent = allContent.filter(
                    (c) => c.dimensionTag !== 'generic' && c.interventionWeight >= 50
                );

                // Target intervention content for weak dimensions
                const targetedContent = interventionContent.filter((c) =>
                    weakDimensions.includes(c.dimensionTag)
                );

                // Calculate how many of each type to include
                const totalItems = 20; // Feed size
                const interventionCount = Math.floor(totalItems * interventionRatio);
                const genericCount = totalItems - interventionCount;

                // Build feed
                const feed: MindsetContent[] = [];

                // Add targeted intervention content
                const shuffledTargeted = shuffle([...targetedContent]);
                feed.push(...shuffledTargeted.slice(0, Math.min(interventionCount, shuffledTargeted.length)));

                // Fill remaining intervention slots with general intervention content if needed
                if (feed.length < interventionCount) {
                    const remainingIntervention = interventionContent.filter(
                        (c) => !targetedContent.includes(c)
                    );
                    const shuffledRemaining = shuffle(remainingIntervention);
                    feed.push(...shuffledRemaining.slice(0, interventionCount - feed.length));
                }

                // Add generic content
                const shuffledGeneric = shuffle([...genericContent]);
                feed.push(...shuffledGeneric.slice(0, genericCount));

                // Final shuffle for natural feel
                return shuffle(feed);
            },

            // Session Management
            startSession: () => {
                set({
                    currentSessionId: `session-${Date.now()}`,
                    sessionStartTime: new Date().toISOString(),
                    totalDwellTime: 0,
                });
            },

            endSession: () => {
                // Could save session data to analytics here
                set({
                    currentSessionId: null,
                    sessionStartTime: null,
                });
            },

            // Kaiz Integration Actions
            internalize: (contentId) => {
                const content = get().allContent.find((c) => c.id === contentId);
                if (content) {
                    logger.log('📝 Internalize to Journal:', content.body);
                    // TODO: Integrate with journal/notes store
                }
            },

            operationalize: (contentId) => {
                const content = get().allContent.find((c) => c.id === contentId);
                if (content) {
                    logger.log('✅ Operationalize to Task:', content.body);
                    // TODO: Integrate with task store
                    // Create task with dimension from content.dimensionTag
                }
            },

            reset: () => {
                set({
                    allContent: [],
                    themes: [],
                    currentTheme: 'minimalist',
                    feedContent: [],
                    currentIndex: 0,
                    favorites: [],
                    weakDimensions: [],
                    lastAlgorithmUpdate: null,
                    interventionRatio: 0.4,
                    currentSessionId: null,
                    sessionStartTime: null,
                    totalDwellTime: 0,
                });
            },
        }),
        {
            name: 'mindset-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist user preferences, not dynamic feed
            partialize: (state) => ({
                currentTheme: state.currentTheme,
                favorites: state.favorites,
                interventionRatio: state.interventionRatio,
            }),
        }
    )
);

// Utility: Shuffle array (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
