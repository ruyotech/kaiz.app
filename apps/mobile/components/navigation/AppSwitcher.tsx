import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigationStore, AppContext } from '../../store/navigationStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { APPS, NAV_CONFIGS } from '../../utils/navigationConfig';
import type { App } from '../../utils/navigationConfig';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '../../providers/ThemeProvider';
import { AppIcon } from '../ui/AppIcon';
import { navIcons, sectionIcons, moduleIcons, statusIcons, actionIcons, settingsIcons } from '../../constants/icons';

// ============================================================================
// App groupings — derived from the central APPS list
// ============================================================================

const SPRINT_APP = APPS.find(app => app.id === 'sprints')!;
const PRODUCTIVITY_APPS = APPS.filter(app => ['pomodoro', 'challenges'].includes(app.id));
const GROWTH_APPS = APPS.filter(app => ['mindset', 'essentia'].includes(app.id));
const COMMUNITY_APP = APPS.find(app => app.id === 'community')!;
const FAMILY_APP = APPS.find(app => app.id === 'family');

// Short descriptions for each app card
const APP_DESCRIPTIONS: Partial<Record<string, string>> = {
    sprints: 'Plan & track your sprints',
    challenges: 'Track your challenges',
    pomodoro: 'Focus & time management',
    essentia: 'Books & knowledge',
    mindset: 'Quotes & inspiration',
    community: 'Connect with others',
    family: 'Collaborate with family',
};

// ============================================================================
// AppSwitcher
// ============================================================================

export function AppSwitcher() {
    const { isAppSwitcherOpen, toggleAppSwitcher, setCurrentApp, currentApp, toggleMoreMenu } = useNavigationStore();
    const { canAccessFeature } = useSubscriptionStore();
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useThemeContext();

    const hasFamilyAccess = canAccessFeature('sharedWorkspace');

    const navigateAndClose = (route: string) => {
        router.push(route as any);
        toggleAppSwitcher();
    };

    const handleAppSelect = (app: App) => {
        setCurrentApp(app.id as AppContext);
        navigateAndClose(app.route);
    };

    return (
        <Modal
            visible={isAppSwitcherOpen}
            transparent
            animationType="fade"
            onRequestClose={toggleAppSwitcher}
            statusBarTranslucent
        >
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                {/* Scrollable Apps Content — no header, starts directly with safe-area padding */}
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 24 }}
                >
                    {/* ====== Sprint Section ====== */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-3 px-1">
                            <AppIcon icon={sectionIcons.lightningBolt} size={16} color="#3B82F6" />
                            <Text className="text-xs font-semibold uppercase tracking-wider ml-1.5" style={{ color: colors.textSecondary }}>Sprint</Text>
                        </View>

                        {/* Main Sprint App Card */}
                        <TouchableOpacity
                            onPress={() => handleAppSelect(SPRINT_APP)}
                            activeOpacity={0.7}
                            className="rounded-2xl p-4"
                            style={{
                                backgroundColor: colors.card,
                                borderColor: currentApp === 'sprints' ? '#3B82F6' : colors.border,
                                borderWidth: currentApp === 'sprints' ? 2 : 1,
                            }}
                        >
                            <View className="flex-row items-center">
                                <View
                                    className="w-12 h-12 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: '#3B82F620' }}
                                >
                                    <AppIcon icon={SPRINT_APP.icon} size={26} color="#3B82F6" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="font-semibold text-base" style={{ color: colors.text }}>{t(SPRINT_APP.nameKey)}</Text>
                                    <Text className="text-xs mt-0.5" style={{ color: colors.textTertiary }}>{APP_DESCRIPTIONS.sprints}</Text>
                                </View>
                                {currentApp === 'sprints' && (
                                    <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }} />
                                )}
                                <AppIcon icon={navIcons.chevronRight} size={20} color={colors.textTertiary} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* ====== Productivity Section — SensAI, Challenges, Focus ====== */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-3 px-1">
                            <AppIcon icon={sectionIcons.rocketLaunch} size={16} color="#10B981" />
                            <Text className="text-xs font-semibold uppercase tracking-wider ml-1.5" style={{ color: colors.textSecondary }}>Productivity</Text>
                        </View>

                        {PRODUCTIVITY_APPS.map((app) => (
                            <View key={app.id} className="mb-3">
                                <TouchableOpacity
                                    onPress={() => handleAppSelect(app)}
                                    activeOpacity={0.7}
                                    className="rounded-2xl p-4"
                                    style={{
                                        backgroundColor: colors.card,
                                        borderColor: currentApp === app.id ? app.color : colors.border,
                                        borderWidth: currentApp === app.id ? 2 : 1,
                                    }}
                                >
                                    <View className="flex-row items-center">
                                        <View
                                            className="w-12 h-12 rounded-xl items-center justify-center"
                                            style={{ backgroundColor: app.color + '20' }}
                                        >
                                            <AppIcon icon={app.icon} size={26} color={app.color} />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="font-semibold text-base" style={{ color: colors.text }}>{t(app.nameKey)}</Text>
                                            <Text className="text-xs mt-0.5" style={{ color: colors.textTertiary }}>
                                                {APP_DESCRIPTIONS[app.id] ?? ''}
                                            </Text>
                                        </View>
                                        {currentApp === app.id && (
                                            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }} />
                                        )}
                                        <AppIcon icon={navIcons.chevronRight} size={20} color={colors.textTertiary} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* ====== Growth Section — Essentia & Mindset ====== */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-3 px-1">
                            <AppIcon icon={sectionIcons.trendingUp} size={16} color="#8B5CF6" />
                            <Text className="text-xs font-semibold uppercase tracking-wider ml-1.5" style={{ color: colors.textSecondary }}>Growth & Inspiration</Text>
                        </View>

                        {GROWTH_APPS.map((app) => (
                            <View key={app.id} className="mb-3">
                                <TouchableOpacity
                                    onPress={() => handleAppSelect(app)}
                                    activeOpacity={0.7}
                                    className="rounded-2xl p-4"
                                    style={{
                                        backgroundColor: colors.card,
                                        borderColor: currentApp === app.id ? app.color : colors.border,
                                        borderWidth: currentApp === app.id ? 2 : 1,
                                    }}
                                >
                                    <View className="flex-row items-center">
                                        <View
                                            className="w-12 h-12 rounded-xl items-center justify-center"
                                            style={{ backgroundColor: app.color + '20' }}
                                        >
                                            <AppIcon icon={app.icon} size={26} color={app.color} />
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="font-semibold text-base" style={{ color: colors.text }}>{t(app.nameKey)}</Text>
                                            <Text className="text-xs mt-0.5" style={{ color: colors.textTertiary }}>
                                                {APP_DESCRIPTIONS[app.id] ?? ''}
                                            </Text>
                                        </View>
                                        {currentApp === app.id && (
                                            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }} />
                                        )}
                                        <AppIcon icon={navIcons.chevronRight} size={20} color={colors.textTertiary} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* ====== Community Section ====== */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-3 px-1">
                            <AppIcon icon={sectionIcons.accountGroupOutline} size={16} color="#06B6D4" />
                            <Text className="text-xs font-semibold uppercase tracking-wider ml-1.5" style={{ color: colors.textSecondary }}>Social</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => handleAppSelect(COMMUNITY_APP)}
                            activeOpacity={0.7}
                            className="rounded-2xl p-4 flex-row items-center"
                            style={{
                                backgroundColor: colors.card,
                                borderColor: currentApp === 'community' ? '#06B6D4' : colors.border,
                                borderWidth: currentApp === 'community' ? 2 : 1,
                            }}
                        >
                            <View
                                className="w-12 h-12 rounded-xl items-center justify-center"
                                style={{ backgroundColor: '#06B6D420' }}
                            >
                                <AppIcon icon={COMMUNITY_APP.icon} size={26} color="#06B6D4" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="font-semibold text-base" style={{ color: colors.text }}>{t(COMMUNITY_APP.nameKey)}</Text>
                                <Text className="text-xs mt-0.5" style={{ color: colors.textTertiary }}>{APP_DESCRIPTIONS.community}</Text>
                            </View>
                            {currentApp === 'community' && (
                                <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }} />
                            )}
                            <AppIcon icon={navIcons.chevronRight} size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    {/* ====== Family Section — Premium Feature ====== */}
                    {FAMILY_APP && (
                        <View className="mb-3">
                            <View className="flex-row items-center mb-3 px-1">
                                <AppIcon icon={sectionIcons.heartOutline} size={16} color="#EC4899" />
                                <Text className="text-xs font-semibold uppercase tracking-wider ml-1.5" style={{ color: colors.textSecondary }}>Family</Text>
                                {!hasFamilyAccess && (
                                    <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F59E0B20' }}>
                                        <Text className="text-[10px] font-bold" style={{ color: '#F59E0B' }}>PREMIUM</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={() => handleAppSelect(FAMILY_APP)}
                                activeOpacity={0.7}
                                className="rounded-2xl p-4 flex-row items-center"
                                style={{
                                    backgroundColor: colors.card,
                                    borderColor: currentApp === 'family' ? '#EC4899' : colors.border,
                                    borderWidth: currentApp === 'family' ? 2 : 1,
                                    opacity: hasFamilyAccess ? 1 : 0.85,
                                }}
                            >
                                <View
                                    className="w-12 h-12 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: '#EC489920' }}
                                >
                                    <AppIcon icon={FAMILY_APP.icon} size={26} color="#EC4899" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="font-semibold text-base" style={{ color: colors.text }}>{t(FAMILY_APP.nameKey)}</Text>
                                    <Text className="text-xs mt-0.5" style={{ color: colors.textTertiary }}>
                                        {hasFamilyAccess ? APP_DESCRIPTIONS.family : 'Upgrade to unlock'}
                                    </Text>
                                </View>
                                {currentApp === 'family' && hasFamilyAccess && (
                                    <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }} />
                                )}
                                {!hasFamilyAccess && (
                                    <AppIcon icon={statusIcons.lock} size={18} color={colors.textTertiary} style={{ marginRight: 4 }} />
                                )}
                                <AppIcon icon={navIcons.chevronRight} size={20} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* Settings Footer */}
                <View className="px-4 py-3" style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <TouchableOpacity
                        onPress={() => navigateAndClose('/(tabs)/settings')}
                        className="flex-row items-center justify-center rounded-xl py-3"
                        style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                        <AppIcon icon={settingsIcons.cogOutline} size={20} color={colors.textSecondary} />
                        <Text className="font-medium text-sm ml-2" style={{ color: colors.textSecondary }}>{t('navigation.appSwitcher.settings')}</Text>
                    </TouchableOpacity>
                </View>

                {/* ====== Bottom Navigation Bar ====== */}
                {(() => {
                    const mainIcon = NAV_CONFIGS[currentApp as AppContext] ?? NAV_CONFIGS['sprints'];

                    return (
                        <View
                            style={{
                                backgroundColor: colors.card,
                                borderTopWidth: 1,
                                borderTopColor: colors.border,
                                paddingBottom: insets.bottom,
                            }}
                        >
                            <View className="flex-row items-center justify-between px-6 py-2">
                                {/* 1. Apps — Active state (we're inside the switcher) */}
                                <TouchableOpacity className="items-center" onPress={toggleAppSwitcher}>
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: '#FEF3C7', borderWidth: 2, borderColor: '#F59E0B' }}>
                                        <AppIcon icon={navIcons.apps} size={26} color="#F59E0B" />
                                    </View>
                                    <Text className="text-[10px] font-semibold mt-1" style={{ color: '#F59E0B' }}>{t('navigation.appSwitcher.title')}</Text>
                                </TouchableOpacity>

                                {/* 2. Current App */}
                                <TouchableOpacity
                                    className="items-center"
                                    onPress={() => navigateAndClose(mainIcon.route)}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                                        <AppIcon icon={mainIcon.icon} size={26} color={colors.primary} />
                                    </View>
                                    <Text className="text-[10px] font-medium mt-1" style={{ color: colors.primary }}>
                                        {t(mainIcon.nameKey)}
                                    </Text>
                                </TouchableOpacity>

                                {/* 3. … More — contextual sub-apps */}
                                <TouchableOpacity
                                    className="items-center"
                                    onPress={toggleMoreMenu}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: '#E0E7FF' }}>
                                        <AppIcon icon={navIcons.more} size={26} color="#6366F1" />
                                    </View>
                                    <Text className="text-[10px] font-medium mt-1" style={{ color: '#6366F1' }}>
                                        {t('navigation.tabs.more')}
                                    </Text>
                                </TouchableOpacity>

                                {/* 4. Create */}
                                <TouchableOpacity
                                    className="items-center"
                                    onPress={() => navigateAndClose('/(tabs)/command-center')}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                                        <AppIcon icon={actionIcons.addCircle} size={26} color="#10B981" />
                                    </View>
                                    <Text className="text-[10px] font-medium mt-1" style={{ color: '#10B981' }}>{t('common.create')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })()}
            </View>
        </Modal>
    );
}
