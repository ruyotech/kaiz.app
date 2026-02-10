/**
 * SubscriptionScreen.tsx - Subscription Settings for Kaiz 
 * 
 * Features:
 * - Current plan display with tier badge
 * - Renewal/expiration date
 * - Sprint period indicator ("Week 5 of 52 in 2026")
 * - Manage Plan → App Store / Play Store
 * - View Invoice History
 * - Family Members section (for family plan)
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO, differenceInDays } from 'date-fns';

// Stores
import { useAuthStore } from '../../../store/authStore';
import {
    useSubscriptionStore,
    SUBSCRIPTION_TIERS,
    getTierDisplayName,
    isPaidTier,
    getUpgradeOptions,
    type SubscriptionTier,
    type TierConfig,
} from '../../../store/subscriptionStore';

// Hooks
import { useTranslation } from '../../../hooks/useTranslation';

// ============================================================================
// Types
// ============================================================================

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// ============================================================================
// Components
// ============================================================================

/**
 * Subscription Tier Badge
 */
function TierBadge({ tier, size = 'md' }: { tier: SubscriptionTier; size?: 'sm' | 'md' | 'lg' }) {
    const config = SUBSCRIPTION_TIERS[tier];
    
    const sizeClasses = {
        sm: 'px-2 py-0.5',
        md: 'px-3 py-1',
        lg: 'px-4 py-1.5',
    };
    
    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };
    
    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 18,
    };
    
    return (
        <View
            className={`flex-row items-center rounded-full ${sizeClasses[size]}`}
            style={{ backgroundColor: config.badge.bgColor }}
        >
            <MaterialCommunityIcons
                name={config.badge.icon as IconName}
                size={iconSizes[size]}
                color={config.badge.color}
            />
            <Text
                className={`font-semibold ml-1 ${textSizes[size]}`}
                style={{ color: config.badge.color }}
            >
                {config.name}
            </Text>
        </View>
    );
}

/**
 * Feature List Item
 */
function FeatureItem({ text, included }: { text: string; included: boolean }) {
    return (
        <View className="flex-row items-center py-1.5">
            <MaterialCommunityIcons
                name={included ? 'check-circle' : 'close-circle-outline'}
                size={18}
                color={included ? '#10B981' : '#9CA3AF'}
            />
            <Text className={`ml-2 ${included ? 'text-gray-800' : 'text-gray-400'}`}>
                {text}
            </Text>
        </View>
    );
}

/**
 * Plan Card for upgrade options
 */
function PlanCard({
    config,
    isCurrent,
    onSelect,
}: {
    config: TierConfig;
    isCurrent: boolean;
    onSelect: () => void;
}) {
    return (
        <TouchableOpacity
            onPress={onSelect}
            disabled={isCurrent}
            className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
                isCurrent ? 'border-blue-500' : 'border-gray-100'
            }`}
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="text-lg font-bold text-gray-900">{config.name}</Text>
                    <Text className="text-sm text-gray-500">{config.description}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-xl font-bold text-blue-600">{config.price}</Text>
                    {isCurrent && (
                        <View className="bg-blue-100 px-2 py-0.5 rounded-full mt-1">
                            <Text className="text-xs text-blue-600 font-medium">Current</Text>
                        </View>
                    )}
                </View>
            </View>
            
            {/* Features Preview */}
            <View className="mt-2 pt-2 border-t border-gray-100">
                <FeatureItem
                    text={config.features.unlimitedSprints ? 'Unlimited sprints' : `${config.features.maxActiveSprints} active sprints`}
                    included={true}
                />
                <FeatureItem text="All ceremonies" included={config.features.allCeremonies} />
                <FeatureItem text="Analytics dashboard" included={config.features.analytics} />
                <FeatureItem text="Advanced exports" included={config.features.advancedExports} />
                <FeatureItem text="Family workspace" included={config.features.sharedWorkspace} />
            </View>
        </TouchableOpacity>
    );
}

/**
 * Info Row Component
 */
function InfoRow({
    icon,
    iconColor,
    label,
    value,
    valueColor,
    onPress,
}: {
    icon: IconName;
    iconColor: string;
    label: string;
    value: string;
    valueColor?: string;
    onPress?: () => void;
}) {
    const content = (
        <View className="flex-row items-center py-3 border-b border-gray-100">
            <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: `${iconColor}20` }}
            >
                <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
            </View>
            <Text className="flex-1 text-gray-600">{label}</Text>
            <Text
                className="font-semibold"
                style={{ color: valueColor || '#111827' }}
            >
                {value}
            </Text>
            {onPress && (
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#9CA3AF"
                    style={{ marginLeft: 4 }}
                />
            )}
        </View>
    );
    
    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }
    
    return content;
}

// ============================================================================
// Main Screen
// ============================================================================

export default function SubscriptionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuthStore();
    
    const {
        subscription,
        sprintTracking,
        isSubscriptionActive,
        getDaysUntilExpiry,
        getSprintPeriodLabel,
        getTierConfig,
        openManageSubscription,
        setSubscription,
    } = useSubscriptionStore();
    
    const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
    
    const tierConfig = getTierConfig();
    const isActive = isSubscriptionActive();
    const daysUntilExpiry = getDaysUntilExpiry();
    const sprintPeriodLabel = getSprintPeriodLabel();
    
    // Format dates
    const formatDateSafe = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            return format(parseISO(dateStr), 'MMM d, yyyy');
        } catch {
            return 'N/A';
        }
    };
    
    // Get status color
    const getStatusColor = () => {
        if (!isActive) return '#EF4444'; // Red
        if (subscription.isInGracePeriod) return '#F59E0B'; // Amber
        if (daysUntilExpiry >= 0 && daysUntilExpiry <= 7) return '#F59E0B'; // Amber
        return '#10B981'; // Green
    };
    
    // Get status text
    const getStatusText = () => {
        if (!isActive) return 'Expired';
        if (subscription.isInGracePeriod) return 'Grace Period';
        if (daysUntilExpiry >= 0 && daysUntilExpiry <= 7) return `${daysUntilExpiry} days left`;
        return 'Active';
    };
    
    const handleUpgrade = (tier: TierConfig) => {
        // TEST MODE: Direct subscription change with confirmation
        // In production, this would initiate IAP flow via App Store/Play Store
        Alert.alert(
            `Upgrade to ${tier.name}`,
            `Are you sure you want to upgrade to ${tier.name} for ${tier.price}?\n\n(Test mode: This will activate immediately)`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Upgrade Now',
                    onPress: () => {
                        // Calculate subscription dates (1 month or 1 year from now)
                        const now = new Date();
                        const endDate = new Date(now);
                        if (tier.billingPeriod === 'annual') {
                            endDate.setFullYear(endDate.getFullYear() + 1);
                        } else {
                            endDate.setMonth(endDate.getMonth() + 1);
                        }
                        
                        // Update subscription directly
                        setSubscription({
                            tier: tier.id,
                            startDate: now.toISOString(),
                            endDate: endDate.toISOString(),
                            renewalDate: endDate.toISOString(),
                            billingPeriod: tier.billingPeriod === 'annual' ? 'annual' : 'monthly',
                            isInGracePeriod: false,
                            gracePeriodEndDate: null,
                            autoRenew: true,
                        });
                        
                        Alert.alert(
                            'Upgrade Successful!',
                            `You are now on the ${tier.name} plan. Enjoy your new features!`,
                            [{ text: 'Great!' }]
                        );
                    },
                },
            ]
        );
    };
    
    const handleViewInvoices = () => {
        // In production, navigate to invoice history
        Alert.alert(
            'Invoice History',
            'Invoice history will be available in a future update.',
            [{ text: 'OK' }]
        );
    };
    
    const handleManageFamilyMembers = () => {
        // Navigate to family members screen (to be implemented)
        Alert.alert(
            'Family Members',
            'Family member management will be available in a future update.',
            [{ text: 'OK' }]
        );
    };
    
    const upgradeOptions = getUpgradeOptions(subscription.tier);
    
    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View
                className="bg-white px-4 pb-4 border-b border-gray-100"
                style={{ paddingTop: insets.top + 8 }}
            >
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center -ml-2"
                    >
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900 ml-2">Subscription</Text>
                </View>
            </View>
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Current Plan Card */}
                <View className="bg-white mx-4 mt-4 rounded-2xl p-4 shadow-sm">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <Text className="text-sm text-gray-500 mb-1">Current Plan</Text>
                            <TierBadge tier={subscription.tier} size="lg" />
                        </View>
                        <View className="items-end">
                            <View
                                className="flex-row items-center px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: `${getStatusColor()}20` }}
                            >
                                <View
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: getStatusColor() }}
                                />
                                <Text
                                    className="text-sm font-semibold"
                                    style={{ color: getStatusColor() }}
                                >
                                    {getStatusText()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    
                    {/* Subscription Info */}
                    <View className="border-t border-gray-100 pt-3">
                        <InfoRow
                            icon="calendar-clock"
                            iconColor="#3B82F6"
                            label="Sprint Period"
                            value={sprintPeriodLabel}
                        />
                        
                        {isPaidTier(subscription.tier) && (
                            <>
                                <InfoRow
                                    icon="calendar-check"
                                    iconColor="#10B981"
                                    label="Renewal Date"
                                    value={formatDateSafe(subscription.renewalDate)}
                                />
                                
                                {subscription.isInGracePeriod && (
                                    <InfoRow
                                        icon="alert-circle"
                                        iconColor="#F59E0B"
                                        label="Grace Period Ends"
                                        value={formatDateSafe(subscription.gracePeriodEndDate)}
                                        valueColor="#F59E0B"
                                    />
                                )}
                            </>
                        )}
                        
                        <InfoRow
                            icon="run-fast"
                            iconColor="#8B5CF6"
                            label="Active Sprints"
                            value={
                                tierConfig.features.unlimitedSprints
                                    ? `${sprintTracking.activeSprintCount} (Unlimited)`
                                    : `${sprintTracking.activeSprintCount} of ${tierConfig.features.maxActiveSprints}`
                            }
                        />
                    </View>
                </View>
                
                {/* Grace Period Warning */}
                {subscription.isInGracePeriod && (
                    <View className="bg-amber-50 mx-4 mt-4 rounded-xl p-4 border border-amber-200">
                        <View className="flex-row items-start">
                            <MaterialCommunityIcons
                                name="alert-circle"
                                size={24}
                                color="#F59E0B"
                            />
                            <View className="flex-1 ml-3">
                                <Text className="text-amber-800 font-semibold mb-1">
                                    Subscription Expired
                                </Text>
                                <Text className="text-amber-700 text-sm">
                                    You can complete your current sprint, but future planning is locked.
                                    Renew to continue your journey.
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                
                {/* Actions */}
                <View className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm">
                    <TouchableOpacity
                        onPress={openManageSubscription}
                        className="flex-row items-center px-4 py-4 border-b border-gray-100"
                        activeOpacity={0.7}
                    >
                        <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-blue-100">
                            <MaterialCommunityIcons
                                name={Platform.OS === 'ios' ? 'apple' : 'google-play'}
                                size={20}
                                color="#3B82F6"
                            />
                        </View>
                        <Text className="flex-1 text-[15px] font-medium text-gray-900">
                            Manage Plan
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    
                    {isPaidTier(subscription.tier) && (
                        <TouchableOpacity
                            onPress={handleViewInvoices}
                            className="flex-row items-center px-4 py-4 border-b border-gray-100"
                            activeOpacity={0.7}
                        >
                            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-gray-100">
                                <MaterialCommunityIcons
                                    name="receipt"
                                    size={20}
                                    color="#6B7280"
                                />
                            </View>
                            <Text className="flex-1 text-[15px] font-medium text-gray-900">
                                View Invoice History
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                    
                    {subscription.tier === 'family' && (
                        <TouchableOpacity
                            onPress={handleManageFamilyMembers}
                            className="flex-row items-center px-4 py-4"
                            activeOpacity={0.7}
                        >
                            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-green-100">
                                <MaterialCommunityIcons
                                    name="account-group"
                                    size={20}
                                    color="#10B981"
                                />
                            </View>
                            <Text className="flex-1 text-[15px] font-medium text-gray-900">
                                Family Members
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
                
                {/* Upgrade Options */}
                {upgradeOptions.length > 0 && (
                    <View className="mx-4 mt-6 mb-4">
                        <TouchableOpacity
                            onPress={() => setShowUpgradeOptions(!showUpgradeOptions)}
                            className="flex-row items-center justify-between mb-3"
                        >
                            <Text className="text-lg font-semibold text-gray-900">
                                Upgrade Your Plan
                            </Text>
                            <MaterialCommunityIcons
                                name={showUpgradeOptions ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color="#6B7280"
                            />
                        </TouchableOpacity>
                        
                        {showUpgradeOptions && (
                            <View>
                                {upgradeOptions.map((config) => (
                                    <PlanCard
                                        key={config.id}
                                        config={config}
                                        isCurrent={config.id === subscription.tier}
                                        onSelect={() => handleUpgrade(config)}
                                    />
                                ))}
                            </View>
                        )}
                        
                        {!showUpgradeOptions && (
                            <TouchableOpacity
                                onPress={() => setShowUpgradeOptions(true)}
                                className="bg-blue-600 rounded-xl py-3 items-center"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-semibold text-base">
                                    View Upgrade Options
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                
                {/* Feature Comparison */}
                <View className="mx-4 mt-2 mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Your Features
                    </Text>
                    <View className="bg-white rounded-2xl p-4 shadow-sm">
                        <FeatureItem
                            text={
                                tierConfig.features.unlimitedSprints
                                    ? 'Unlimited sprints'
                                    : `${tierConfig.features.maxActiveSprints} active sprints max`
                            }
                            included={true}
                        />
                        <FeatureItem text="Basic ceremonies (DSU, Planning)" included={tierConfig.features.basicCeremonies} />
                        <FeatureItem text="All ceremonies (Review, Retro)" included={tierConfig.features.allCeremonies} />
                        <FeatureItem text="Analytics & velocity tracking" included={tierConfig.features.analytics} />
                        <FeatureItem text="Custom sprint names" included={tierConfig.features.customSprintNames} />
                        <FeatureItem text="Advanced PDF exports" included={tierConfig.features.advancedExports} />
                        <FeatureItem text="Shared family workspace" included={tierConfig.features.sharedWorkspace} />
                        <FeatureItem text="Family ceremonies" included={tierConfig.features.familyCeremonies} />
                    </View>
                </View>
                
                {/* Bottom padding */}
                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
        </View>
    );
}
