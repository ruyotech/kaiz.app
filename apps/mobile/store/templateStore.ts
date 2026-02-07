import { logger } from '../utils/logger';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskTemplate, CreateTemplateRequest, TemplateFilterOptions } from '../types/models';
import { taskTemplateApi, RatingResponse, FavoriteResponse } from '../services/api';

interface TemplateState {
    // Data
    globalTemplates: TaskTemplate[];
    userTemplates: TaskTemplate[];
    favoriteTemplates: TaskTemplate[];
    
    // UI State
    loading: boolean;
    error: string | null;
    selectedTemplate: TaskTemplate | null;
    
    // Filters
    activeFilter: TemplateFilterOptions;
    
    // Fetch operations
    fetchAllTemplates: () => Promise<void>;
    fetchGlobalTemplates: () => Promise<void>;
    fetchUserTemplates: () => Promise<void>;
    fetchFavoriteTemplates: () => Promise<void>;
    fetchTemplatesByArea: (areaId: string) => Promise<void>;
    searchTemplates: (query: string) => Promise<TaskTemplate[]>;
    
    // CRUD operations
    createTemplate: (data: CreateTemplateRequest) => Promise<TaskTemplate>;
    updateTemplate: (id: string, data: Partial<CreateTemplateRequest>) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    
    // Actions
    toggleFavorite: (id: string) => Promise<boolean>;
    rateTemplate: (id: string, rating: number) => Promise<RatingResponse>;
    cloneTemplate: (id: string) => Promise<TaskTemplate>;
    useTemplate: (id: string) => Promise<void>;
    addTemplateTag: (id: string, tag: string) => Promise<string[]>;
    removeTemplateTag: (id: string, tag: string) => Promise<string[]>;
    
    // Selection
    selectTemplate: (template: TaskTemplate | null) => void;
    getTemplateById: (id: string) => TaskTemplate | undefined;
    
    // Filters
    setFilter: (filter: TemplateFilterOptions) => void;
    clearFilter: () => void;
    
    // Computed getters
    getFilteredTemplates: () => TaskTemplate[];
    getTemplatesByLifeWheelArea: (areaId: string) => TaskTemplate[];
    getTopRatedTemplates: (limit?: number) => TaskTemplate[];
    getMostUsedTemplates: (limit?: number) => TaskTemplate[];
    
    // Utility
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    globalTemplates: [],
    userTemplates: [],
    favoriteTemplates: [],
    loading: false,
    error: null,
    selectedTemplate: null,
    activeFilter: {},
};

export const useTemplateStore = create<TemplateState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ============ Fetch Operations ============

            fetchAllTemplates: async () => {
                set({ loading: true, error: null });
                try {
                    logger.log('📋 fetchAllTemplates: Starting...');
                    const [global, user, favorites] = await Promise.all([
                        taskTemplateApi.getGlobalTemplates(),
                        taskTemplateApi.getUserTemplates(),
                        taskTemplateApi.getFavoriteTemplates(),
                    ]);
                    logger.log('📋 fetchAllTemplates: Results:');
                    logger.log('📋 - Global:', Array.isArray(global) ? global.length : 'not array', typeof global);
                    logger.log('📋 - User:', Array.isArray(user) ? user.length : 'not array', typeof user);
                    logger.log('📋 - Favorites:', Array.isArray(favorites) ? favorites.length : 'not array', typeof favorites);
                    if (global && !Array.isArray(global)) {
                        logger.log('📋 - Global raw:', JSON.stringify(global).substring(0, 300));
                    }
                    set({
                        globalTemplates: global || [],
                        userTemplates: user || [],
                        favoriteTemplates: favorites || [],
                        loading: false,
                    });
                } catch (error) {
                    logger.error('📋 fetchAllTemplates: Error:', error);
                    set({ error: 'Failed to fetch templates', loading: false });
                }
            },

            fetchGlobalTemplates: async () => {
                set({ loading: true, error: null });
                try {
                    logger.log('📋 Fetching global templates...');
                    const templates = await taskTemplateApi.getGlobalTemplates();
                    logger.log('📋 Global templates received:');
                    logger.log('📋 - Type:', typeof templates);
                    logger.log('📋 - Is Array:', Array.isArray(templates));
                    logger.log('📋 - Length:', templates?.length);
                    logger.log('📋 - First item:', templates?.[0] ? JSON.stringify(templates[0]).substring(0, 200) : 'none');
                    logger.log('📋 - Raw data:', JSON.stringify(templates).substring(0, 500));
                    set({ globalTemplates: templates || [], loading: false });
                } catch (error) {
                    logger.error('📋 Failed to fetch global templates:', error);
                    set({ error: 'Failed to fetch global templates', loading: false });
                }
            },

            fetchUserTemplates: async () => {
                set({ loading: true, error: null });
                try {
                    const templates = await taskTemplateApi.getUserTemplates();
                    set({ userTemplates: templates, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch user templates', loading: false });
                }
            },

            fetchFavoriteTemplates: async () => {
                set({ loading: true, error: null });
                try {
                    const templates = await taskTemplateApi.getFavoriteTemplates();
                    set({ favoriteTemplates: templates, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch favorite templates', loading: false });
                }
            },

            fetchTemplatesByArea: async (areaId: string) => {
                set({ loading: true, error: null });
                try {
                    const templates = await taskTemplateApi.getGlobalTemplatesByArea(areaId);
                    set({ globalTemplates: templates, loading: false });
                } catch (error) {
                    set({ error: 'Failed to fetch templates by area', loading: false });
                }
            },

            searchTemplates: async (query: string) => {
                set({ loading: true, error: null });
                try {
                    const templates = await taskTemplateApi.searchTemplates(query);
                    set({ loading: false });
                    return templates;
                } catch (error) {
                    set({ error: 'Failed to search templates', loading: false });
                    return [];
                }
            },

            // ============ CRUD Operations ============

            createTemplate: async (data: CreateTemplateRequest) => {
                set({ loading: true, error: null });
                try {
                    const newTemplate = await taskTemplateApi.createTemplate(data as unknown as Parameters<typeof taskTemplateApi.createTemplate>[0]);
                    set(state => ({
                        userTemplates: [...state.userTemplates, newTemplate],
                        loading: false,
                    }));
                    return newTemplate;
                } catch (error) {
                    set({ error: 'Failed to create template', loading: false });
                    throw error;
                }
            },

            updateTemplate: async (id: string, data: Partial<CreateTemplateRequest>) => {
                set({ loading: true, error: null });
                try {
                    const updated = await taskTemplateApi.updateTemplate(id, data);
                    set(state => ({
                        userTemplates: state.userTemplates.map(t => t.id === id ? updated : t),
                        selectedTemplate: state.selectedTemplate?.id === id ? updated : state.selectedTemplate,
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to update template', loading: false });
                    throw error;
                }
            },

            deleteTemplate: async (id: string) => {
                set({ loading: true, error: null });
                try {
                    await taskTemplateApi.deleteTemplate(id);
                    set(state => ({
                        userTemplates: state.userTemplates.filter(t => t.id !== id),
                        favoriteTemplates: state.favoriteTemplates.filter(t => t.id !== id),
                        selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
                        loading: false,
                    }));
                } catch (error) {
                    set({ error: 'Failed to delete template', loading: false });
                    throw error;
                }
            },

            // ============ Actions ============

            toggleFavorite: async (id: string) => {
                try {
                    const response = await taskTemplateApi.toggleFavorite(id);
                    const { isFavorite } = response;

                    set(state => {
                        // Update isFavorite in all template lists
                        const updateTemplates = (templates: TaskTemplate[]) =>
                            templates.map(t => t.id === id ? { ...t, isFavorite } : t);

                        const updatedGlobal = updateTemplates(state.globalTemplates);
                        const updatedUser = updateTemplates(state.userTemplates);

                        // Update favorites list
                        let updatedFavorites = state.favoriteTemplates;
                        if (isFavorite) {
                            const template = [...updatedGlobal, ...updatedUser].find(t => t.id === id);
                            if (template && !updatedFavorites.find(t => t.id === id)) {
                                updatedFavorites = [...updatedFavorites, { ...template, isFavorite: true }];
                            }
                        } else {
                            updatedFavorites = updatedFavorites.filter(t => t.id !== id);
                        }

                        return {
                            globalTemplates: updatedGlobal,
                            userTemplates: updatedUser,
                            favoriteTemplates: updatedFavorites,
                            selectedTemplate: state.selectedTemplate?.id === id
                                ? { ...state.selectedTemplate, isFavorite }
                                : state.selectedTemplate,
                        };
                    });

                    return isFavorite;
                } catch (error) {
                    set({ error: 'Failed to toggle favorite' });
                    throw error;
                }
            },

            rateTemplate: async (id: string, rating: number) => {
                try {
                    const response = await taskTemplateApi.rateTemplate(id, rating);

                    set(state => {
                        const updateRating = (templates: TaskTemplate[]) =>
                            templates.map(t =>
                                t.id === id
                                    ? { ...t, rating: response.averageRating, ratingCount: response.ratingCount, userRating: response.userRating }
                                    : t
                            );

                        return {
                            globalTemplates: updateRating(state.globalTemplates),
                            userTemplates: updateRating(state.userTemplates),
                            favoriteTemplates: updateRating(state.favoriteTemplates),
                            selectedTemplate: state.selectedTemplate?.id === id
                                ? { ...state.selectedTemplate, rating: response.averageRating, ratingCount: response.ratingCount, userRating: response.userRating }
                                : state.selectedTemplate,
                        };
                    });

                    return response;
                } catch (error) {
                    set({ error: 'Failed to rate template' });
                    throw error;
                }
            },

            cloneTemplate: async (id: string) => {
                set({ loading: true, error: null });
                try {
                    const cloned = await taskTemplateApi.cloneTemplate(id);
                    set(state => ({
                        userTemplates: [...state.userTemplates, cloned],
                        loading: false,
                    }));
                    return cloned;
                } catch (error) {
                    set({ error: 'Failed to clone template', loading: false });
                    throw error;
                }
            },

            useTemplate: async (id: string) => {
                try {
                    await taskTemplateApi.useTemplate(id);
                    // Increment usage count locally
                    set(state => {
                        const incrementUsage = (templates: TaskTemplate[]) =>
                            templates.map(t => t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t);

                        return {
                            globalTemplates: incrementUsage(state.globalTemplates),
                            userTemplates: incrementUsage(state.userTemplates),
                            favoriteTemplates: incrementUsage(state.favoriteTemplates),
                        };
                    });
                } catch (error) {
                    // Silent fail - usage tracking is not critical
                    logger.warn('Failed to track template usage:', error);
                }
            },

            addTemplateTag: async (id: string, tag: string) => {
                try {
                    const response = await taskTemplateApi.addTag(id, tag);
                    const updatedUserTags = response.tags;

                    set(state => {
                        const updateUserTags = (templates: TaskTemplate[]) =>
                            templates.map(t => t.id === id ? { ...t, userTags: updatedUserTags } : t);

                        return {
                            globalTemplates: updateUserTags(state.globalTemplates),
                            userTemplates: updateUserTags(state.userTemplates),
                            favoriteTemplates: updateUserTags(state.favoriteTemplates),
                            selectedTemplate: state.selectedTemplate?.id === id
                                ? { ...state.selectedTemplate, userTags: updatedUserTags }
                                : state.selectedTemplate,
                        };
                    });

                    return updatedUserTags;
                } catch (error) {
                    set({ error: 'Failed to add tag' });
                    throw error;
                }
            },

            removeTemplateTag: async (id: string, tag: string) => {
                try {
                    const response = await taskTemplateApi.removeTag(id, tag);
                    const updatedUserTags = response.tags;

                    set(state => {
                        const updateUserTags = (templates: TaskTemplate[]) =>
                            templates.map(t => t.id === id ? { ...t, userTags: updatedUserTags } : t);

                        return {
                            globalTemplates: updateUserTags(state.globalTemplates),
                            userTemplates: updateUserTags(state.userTemplates),
                            favoriteTemplates: updateUserTags(state.favoriteTemplates),
                            selectedTemplate: state.selectedTemplate?.id === id
                                ? { ...state.selectedTemplate, userTags: updatedUserTags }
                                : state.selectedTemplate,
                        };
                    });

                    return updatedUserTags;
                } catch (error) {
                    set({ error: 'Failed to remove tag' });
                    throw error;
                }
            },

            // ============ Selection ============

            selectTemplate: (template: TaskTemplate | null) => {
                set({ selectedTemplate: template });
            },

            getTemplateById: (id: string) => {
                const { globalTemplates, userTemplates } = get();
                return [...globalTemplates, ...userTemplates].find(t => t.id === id);
            },

            // ============ Filters ============

            setFilter: (filter: TemplateFilterOptions) => {
                set({ activeFilter: filter });
            },

            clearFilter: () => {
                set({ activeFilter: {} });
            },

            // ============ Computed Getters ============

            getFilteredTemplates: () => {
                const { globalTemplates, userTemplates, favoriteTemplates, activeFilter } = get();

                if (activeFilter.favoritesOnly) {
                    return favoriteTemplates;
                }

                let templates = [...globalTemplates, ...userTemplates];

                if (activeFilter.type) {
                    templates = templates.filter(t => t.type === activeFilter.type);
                }

                if (activeFilter.lifeWheelAreaId) {
                    templates = templates.filter(t => t.defaultLifeWheelAreaId === activeFilter.lifeWheelAreaId);
                }

                if (activeFilter.search) {
                    const search = activeFilter.search.toLowerCase();
                    templates = templates.filter(t =>
                        t.name.toLowerCase().includes(search) ||
                        t.description?.toLowerCase().includes(search) ||
                        t.tags.some(tag => tag.toLowerCase().includes(search))
                    );
                }

                // Sort
                switch (activeFilter.sortBy) {
                    case 'rating':
                        templates.sort((a, b) => b.rating - a.rating);
                        break;
                    case 'usage':
                        templates.sort((a, b) => b.usageCount - a.usageCount);
                        break;
                    case 'name':
                        templates.sort((a, b) => a.name.localeCompare(b.name));
                        break;
                    case 'createdAt':
                        templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                        break;
                    default:
                        // Default: global first, then by rating
                        templates.sort((a, b) => {
                            if (a.creatorType !== b.creatorType) {
                                return a.creatorType === 'system' ? -1 : 1;
                            }
                            return b.rating - a.rating;
                        });
                }

                return templates;
            },

            getTemplatesByLifeWheelArea: (areaId: string) => {
                const { globalTemplates, userTemplates } = get();
                return [...globalTemplates, ...userTemplates].filter(t => t.defaultLifeWheelAreaId === areaId);
            },

            getTopRatedTemplates: (limit = 10) => {
                const { globalTemplates } = get();
                return [...globalTemplates]
                    .filter(t => t.ratingCount > 0)
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, limit);
            },

            getMostUsedTemplates: (limit = 10) => {
                const { globalTemplates, userTemplates } = get();
                return [...globalTemplates, ...userTemplates]
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .slice(0, limit);
            },

            // ============ Utility ============

            clearError: () => {
                set({ error: null });
            },

            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'template-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Only persist essential data, not loading states
                globalTemplates: state.globalTemplates,
                userTemplates: state.userTemplates,
                favoriteTemplates: state.favoriteTemplates,
            }),
        }
    )
);
