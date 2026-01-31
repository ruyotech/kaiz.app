/**
 * subscriptionStore.ts - Subscription Management Store for Kaiz LifeOS
 * 
 * Manages subscription tiers, sprint tracking within billing periods,
 * grace periods, and feature access control.
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Subscription tier definitions
 */
export type SubscriptionTier = 'free' | 'pro_monthly' | 'pro_annual' | 'family';

/**
 * Features available per subscription tier
 */
export interface TierFeatures {
    maxActiveSprints: number;
    unlimitedSprints: boolean;
    basicCeremonies: boolean;
    allCeremonies: boolean;
    analytics: boolean;
    customSprintNames: boolean;
    advancedExports: boolean;
    sharedWorkspace: boolean;
    familyCeremonies: boolean;
}

/**
 * Subscription tier configuration
 */
export interface TierConfig {
    id: SubscriptionTier;
    name: string;
    description: string;
    price: string;
    billingPeriod: 'none' | 'monthly' | 'annual';
    features: TierFeatures;
    badge: {
        color: string;
        bgColor: string;
        icon: string;
    };
}

/**
 * User's subscription information
 */
export interface SubscriptionInfo {
    tier: SubscriptionTier;
    startDate: string | null; // ISO date string
    endDate: string | null; // ISO date string
    renewalDate: string | null; // ISO date string
    isInGracePeriod: boolean;
    gracePeriodEndDate: string | null;
    billingPeriodStartDate: string | null; // Start of current billing period
    billingPeriod: 'none' | 'monthly' | 'annual'; // Type of billing period
    autoRenew: boolean;
}

/**
 * Sprint tracking within subscription period
 */
export interface SprintTracking {
    currentSprintNumber: number; // Within billing period
    totalSprintsInPeriod: number; // e.g., 4 for monthly, 52 for annual
    activeSprintCount: number; // For free tier limit
}

/**
 * Subscription store state
 */
interface SubscriptionState {
    subscription: SubscriptionInfo;
    sprintTracking: SprintTracking;
    
    // Computed/derived
    isSubscriptionActive: () => boolean;
    canAccessFeature: (feature: keyof TierFeatures) => boolean;
    canCreateSprint: () => boolean;
    getDaysUntilExpiry: () => number;
    getSprintPeriodLabel: () => string;
    getTierConfig: () => TierConfig;
    
    // Actions
    setSubscription: (info: Partial<SubscriptionInfo>) => void;
    updateSprintTracking: (tracking: Partial<SprintTracking>) => void;
    checkGracePeriod: () => void;
    openManageSubscription: () => void;
    reset: () => void;
}

// ============================================================================
// Tier Configurations
// ============================================================================

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
    free: {
        id: 'free',
        name: 'Free',
        description: '2 active sprints, basic ceremonies',
        price: '$0',
        billingPeriod: 'none',
        features: {
            maxActiveSprints: 2,
            unlimitedSprints: false,
            basicCeremonies: true,
            allCeremonies: false,
            analytics: false,
            customSprintNames: false,
            advancedExports: false,
            sharedWorkspace: false,
            familyCeremonies: false,
        },
        badge: {
            color: '#6B7280',
            bgColor: '#F3F4F6',
            icon: 'account-outline',
        },
    },
    pro_monthly: {
        id: 'pro_monthly',
        name: 'Pro Monthly',
        description: 'Unlimited sprints, all ceremonies, analytics',
        price: '$9.99/mo',
        billingPeriod: 'monthly',
        features: {
            maxActiveSprints: -1, // unlimited
            unlimitedSprints: true,
            basicCeremonies: true,
            allCeremonies: true,
            analytics: true,
            customSprintNames: false,
            advancedExports: false,
            sharedWorkspace: false,
            familyCeremonies: false,
        },
        badge: {
            color: '#3B82F6',
            bgColor: '#DBEAFE',
            icon: 'star',
        },
    },
    pro_annual: {
        id: 'pro_annual',
        name: 'Pro Annual',
        description: 'Everything in Pro + custom sprint names, advanced exports',
        price: '$79.99/yr',
        billingPeriod: 'annual',
        features: {
            maxActiveSprints: -1,
            unlimitedSprints: true,
            basicCeremonies: true,
            allCeremonies: true,
            analytics: true,
            customSprintNames: true,
            advancedExports: true,
            sharedWorkspace: false,
            familyCeremonies: false,
        },
        badge: {
            color: '#8B5CF6',
            bgColor: '#EDE9FE',
            icon: 'crown',
        },
    },
    family: {
        id: 'family',
        name: 'Family',
        description: 'Everything in Pro Annual + shared workspace, family ceremonies',
        price: '$14.99/mo',
        billingPeriod: 'monthly',
        features: {
            maxActiveSprints: -1,
            unlimitedSprints: true,
            basicCeremonies: true,
            allCeremonies: true,
            analytics: true,
            customSprintNames: true,
            advancedExports: true,
            sharedWorkspace: true,
            familyCeremonies: true,
        },
        badge: {
            color: '#10B981',
            bgColor: '#D1FAE5',
            icon: 'account-group',
        },
    },
};

// ============================================================================
// Default State
// ============================================================================

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
    tier: 'free',
    startDate: null,
    endDate: null,
    renewalDate: null,
    isInGracePeriod: false,
    gracePeriodEndDate: null,
    billingPeriodStartDate: null,
    billingPeriod: 'none',
    autoRenew: false,
};

const DEFAULT_SPRINT_TRACKING: SprintTracking = {
    currentSprintNumber: 1,
    totalSprintsInPeriod: 52, // Default to annual view
    activeSprintCount: 0,
};

// ============================================================================
// Helper Functions
// ============================================================================

const GRACE_PERIOD_DAYS = 7; // Days to complete current sprint after subscription lapses

function calculateGracePeriodEnd(endDate: string): string {
    const end = new Date(endDate);
    end.setDate(end.getDate() + GRACE_PERIOD_DAYS);
    return end.toISOString();
}

function getWeekOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useSubscriptionStore = create<SubscriptionState>()(
    persist(
        (set, get) => ({
            subscription: DEFAULT_SUBSCRIPTION,
            sprintTracking: DEFAULT_SPRINT_TRACKING,
            
            // Computed: Check if subscription is currently active
            isSubscriptionActive: () => {
                const { subscription } = get();
                
                // Free tier is always "active"
                if (subscription.tier === 'free') return true;
                
                // Check if within subscription period
                if (subscription.endDate) {
                    const now = new Date();
                    const endDate = new Date(subscription.endDate);
                    
                    if (now <= endDate) return true;
                    
                    // Check grace period
                    if (subscription.isInGracePeriod && subscription.gracePeriodEndDate) {
                        const graceEnd = new Date(subscription.gracePeriodEndDate);
                        return now <= graceEnd;
                    }
                }
                
                return false;
            },
            
            // Computed: Check feature access based on tier
            canAccessFeature: (feature: keyof TierFeatures) => {
                const { subscription } = get();
                const isActive = get().isSubscriptionActive();
                
                if (!isActive && subscription.tier !== 'free') {
                    // Subscription expired, treat as free tier
                    return SUBSCRIPTION_TIERS.free.features[feature] as boolean;
                }
                
                const tierConfig = SUBSCRIPTION_TIERS[subscription.tier];
                return tierConfig.features[feature] as boolean;
            },
            
            // Computed: Check if user can create a new sprint
            canCreateSprint: () => {
                const { subscription, sprintTracking } = get();
                const isActive = get().isSubscriptionActive();
                
                // Grace period: can complete current sprint but not start new ones
                if (subscription.isInGracePeriod) {
                    return false;
                }
                
                if (!isActive) return false;
                
                const tierConfig = SUBSCRIPTION_TIERS[subscription.tier];
                
                // Unlimited sprints
                if (tierConfig.features.unlimitedSprints) return true;
                
                // Check against max active sprints for free tier
                return sprintTracking.activeSprintCount < tierConfig.features.maxActiveSprints;
            },
            
            // Computed: Days until subscription expires
            getDaysUntilExpiry: () => {
                const { subscription } = get();
                
                if (!subscription.endDate) return -1; // No expiry (free tier)
                
                const now = new Date();
                const endDate = new Date(subscription.endDate);
                const diffMs = endDate.getTime() - now.getTime();
                
                return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            },
            
            // Computed: Get sprint period label (e.g., "Week 5 of 52 in 2026")
            getSprintPeriodLabel: () => {
                const { subscription, sprintTracking } = get();
                const now = new Date();
                const weekNum = getWeekOfYear(now);
                const year = now.getFullYear();
                
                if (subscription.tier === 'free') {
                    return `Week ${weekNum} of ${year}`;
                }
                
                // For paid tiers, show position in billing period
                if (subscription.billingPeriod === 'monthly') {
                    return `Week ${sprintTracking.currentSprintNumber} of 4`;
                }
                
                return `Week ${weekNum} of 52 in ${year}`;
            },
            
            // Computed: Get current tier configuration
            getTierConfig: () => {
                const { subscription } = get();
                return SUBSCRIPTION_TIERS[subscription.tier];
            },
            
            // Action: Update subscription info
            setSubscription: (info: Partial<SubscriptionInfo>) => {
                set((state) => ({
                    subscription: {
                        ...state.subscription,
                        ...info,
                    },
                }));
                
                // Check if we need to enter grace period
                get().checkGracePeriod();
            },
            
            // Action: Update sprint tracking
            updateSprintTracking: (tracking: Partial<SprintTracking>) => {
                set((state) => ({
                    sprintTracking: {
                        ...state.sprintTracking,
                        ...tracking,
                    },
                }));
            },
            
            // Action: Check and update grace period status
            checkGracePeriod: () => {
                const { subscription } = get();
                
                if (!subscription.endDate || subscription.tier === 'free') return;
                
                const now = new Date();
                const endDate = new Date(subscription.endDate);
                
                // Subscription has expired
                if (now > endDate) {
                    if (!subscription.isInGracePeriod) {
                        // Enter grace period
                        set((state) => ({
                            subscription: {
                                ...state.subscription,
                                isInGracePeriod: true,
                                gracePeriodEndDate: calculateGracePeriodEnd(subscription.endDate!),
                            },
                        }));
                    } else if (subscription.gracePeriodEndDate) {
                        // Check if grace period has also ended
                        const graceEnd = new Date(subscription.gracePeriodEndDate);
                        if (now > graceEnd) {
                            // Grace period ended, lock to free features
                            set((state) => ({
                                subscription: {
                                    ...state.subscription,
                                    isInGracePeriod: false,
                                    // Keep tier for reference but features will be limited
                                },
                            }));
                        }
                    }
                }
            },
            
            // Action: Open platform-specific subscription management
            openManageSubscription: () => {
                if (Platform.OS === 'ios') {
                    Linking.openURL('https://apps.apple.com/account/subscriptions');
                } else {
                    Linking.openURL('https://play.google.com/store/account/subscriptions');
                }
            },
            
            // Action: Reset to defaults
            reset: () => {
                set({
                    subscription: DEFAULT_SUBSCRIPTION,
                    sprintTracking: DEFAULT_SPRINT_TRACKING,
                });
            },
        }),
        {
            name: 'kaiz-subscription-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get user-friendly tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
    return SUBSCRIPTION_TIERS[tier].name;
}

/**
 * Check if a tier is a paid tier
 */
export function isPaidTier(tier: SubscriptionTier): boolean {
    return tier !== 'free';
}

/**
 * Get upgrade options for current tier
 */
export function getUpgradeOptions(currentTier: SubscriptionTier): TierConfig[] {
    const tierOrder: SubscriptionTier[] = ['free', 'pro_monthly', 'pro_annual', 'family'];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    return tierOrder
        .slice(currentIndex + 1)
        .map(tier => SUBSCRIPTION_TIERS[tier]);
}
