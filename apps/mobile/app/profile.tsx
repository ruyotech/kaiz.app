import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../components/layout/Container';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSubscriptionStore, SUBSCRIPTION_TIERS, isPaidTier } from '../store/subscriptionStore';
import { useRouter } from 'expo-router';
import { useTranslation } from '../hooks';
import { useThemeContext } from '../providers/ThemeProvider';

// Subscription Badge Component
function SubscriptionBadge({ tier, onPress }: { tier: string; onPress: () => void }) {
    // Map legacy tier names to subscription store tiers
    const tierKey = tier === 'pro' ? 'pro_monthly' : tier as keyof typeof SUBSCRIPTION_TIERS;
    const config = SUBSCRIPTION_TIERS[tierKey] || SUBSCRIPTION_TIERS.free;
    
    return (
        <TouchableOpacity 
            onPress={onPress}
            className="flex-row items-center px-3 py-1.5 rounded-full mt-2"
            style={{ backgroundColor: config.badge.bgColor }}
            activeOpacity={0.7}
        >
            <MaterialCommunityIcons
                name={config.badge.icon as any}
                size={16}
                color={config.badge.color}
            />
            <Text 
                className="font-semibold text-sm ml-1.5"
                style={{ color: config.badge.color }}
            >
                {config.name}
            </Text>
            <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={config.badge.color}
                style={{ marginLeft: 4 }}
            />
        </TouchableOpacity>
    );
}

// Upgrade Prompt Component for free users
function UpgradePrompt({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 mb-4"
            style={{ backgroundColor: '#3B82F6' }}
            activeOpacity={0.8}
        >
            <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                    <MaterialCommunityIcons name="rocket-launch" size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-base">Unlock Pro Features</Text>
                    <Text className="text-white/80 text-sm">Unlimited sprints, all ceremonies & more</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
            </View>
        </TouchableOpacity>
    );
}

// Settings menu item component
function SettingsMenuItem({ 
    icon, 
    iconColor, 
    iconBgColor, 
    title, 
    subtitle, 
    badge, 
    onPress,
    colors,
}: {
    icon: string;
    iconColor: string;
    iconBgColor: string;
    title: string;
    subtitle?: string;
    badge?: number;
    onPress: () => void;
    colors: any;
}) {
    return (
        <TouchableOpacity 
            onPress={onPress}
            className="flex-row items-center py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            activeOpacity={0.7}
        >
            <View 
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: iconBgColor }}
            >
                <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: colors.text }}>{title}</Text>
                {subtitle && <Text className="text-sm" style={{ color: colors.textSecondary }}>{subtitle}</Text>}
            </View>
            <View className="flex-row items-center">
                {badge !== undefined && badge > 0 && (
                    <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 mr-2">
                        <Text className="text-xs font-bold text-white">{badge}</Text>
                    </View>
                )}
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
            </View>
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user, logout } = useAuthStore();
    const { unreadCount } = useNotificationStore();
    const { subscription } = useSubscriptionStore();
    const { colors, isDark } = useThemeContext();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const navigateToSubscription = () => {
        router.push('/(tabs)/settings/subscription');
    };

    if (!user) return null;

    // Check if user is on free tier
    const isFreeTier = subscription.tier === 'free' || user.subscriptionTier === 'free';

    return (
        <Container>
            <ScreenHeader title={t('profile.title')} showBack showNotifications={false} />

            <ScrollView className="flex-1 p-4">
                {/* Upgrade Prompt for Free Users */}
                {isFreeTier && <UpgradePrompt onPress={navigateToSubscription} />}

                {/* User Info */}
                <Card className="mb-4">
                    <View className="items-center mb-4">
                        <Avatar name={user.fullName} size="lg" />
                        <Text className="text-2xl font-bold mt-3" style={{ color: colors.text }}>{user.fullName}</Text>
                        <Text style={{ color: colors.textSecondary }}>{user.email}</Text>
                        {/* Subscription Badge */}
                        <SubscriptionBadge 
                            tier={subscription.tier || user.subscriptionTier} 
                            onPress={navigateToSubscription}
                        />
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
                        <View className="flex-row justify-between mb-2">
                            <Text style={{ color: colors.textSecondary }}>Account Type</Text>
                            <Text className="font-semibold capitalize" style={{ color: colors.text }}>{user.accountType.replace('_', ' ')}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={navigateToSubscription}
                            className="flex-row justify-between mb-2"
                        >
                            <Text style={{ color: colors.textSecondary }}>Subscription</Text>
                            <View className="flex-row items-center">
                                <Text className="font-semibold capitalize" style={{ color: colors.primary }}>
                                    {SUBSCRIPTION_TIERS[subscription.tier]?.name || user.subscriptionTier}
                                </Text>
                                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
                            </View>
                        </TouchableOpacity>
                        <View className="flex-row justify-between">
                            <Text style={{ color: colors.textSecondary }}>Timezone</Text>
                            <Text className="font-semibold" style={{ color: colors.text }}>{user.timezone}</Text>
                        </View>
                    </View>
                </Card>

                {/* Settings Section */}
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>{t('settings.title')}</Text>
                    
                    <SettingsMenuItem
                        icon="bell"
                        iconColor="#3B82F6"
                        iconBgColor={isDark ? '#1E3A5F' : '#DBEAFE'}
                        title={t('profile.menu.notifications')}
                        subtitle={t('profile.menu.notificationsSubtitle')}
                        badge={unreadCount}
                        onPress={() => router.push('/notification-settings')}
                        colors={colors}
                    />
                    
                    <SettingsMenuItem
                        icon="palette"
                        iconColor="#8B5CF6"
                        iconBgColor={isDark ? '#4C1D95' : '#EDE9FE'}
                        title={t('profile.menu.appearance')}
                        subtitle={t('profile.menu.appearanceSubtitle')}
                        onPress={() => router.push('/(tabs)/settings')}
                        colors={colors}
                    />
                    
                    <SettingsMenuItem
                        icon="shield-check"
                        iconColor="#10B981"
                        iconBgColor={isDark ? '#064E3B' : '#D1FAE5'}
                        title={t('profile.menu.privacy')}
                        subtitle={t('profile.menu.privacySubtitle')}
                        onPress={() => router.push('/(tabs)/settings')}
                        colors={colors}
                    />
                    
                    <SettingsMenuItem
                        icon="help-circle"
                        iconColor="#F59E0B"
                        iconBgColor={isDark ? '#78350F' : '#FEF3C7'}
                        title={t('profile.menu.help')}
                        subtitle={t('profile.menu.helpSubtitle')}
                        onPress={() => router.push('/(tabs)/settings')}
                        colors={colors}
                    />
                </Card>

                {/* Stats */}
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>Your Stats</Text>
                    <View className="flex-row justify-between mb-2">
                        <Text style={{ color: colors.textSecondary }}>Total Tasks</Text>
                        <Text className="font-semibold" style={{ color: colors.text }}>49</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text style={{ color: colors.textSecondary }}>Completed Points</Text>
                        <Text className="font-semibold" style={{ color: colors.text }}>213</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text style={{ color: colors.textSecondary }}>Active Challenges</Text>
                        <Text className="font-semibold" style={{ color: colors.text }}>3</Text>
                    </View>
                </Card>

                {/* Actions */}
                <Button onPress={handleLogout} variant="outline" fullWidth>
                    Sign Out
                </Button>
            </ScrollView>
        </Container>
    );
}
