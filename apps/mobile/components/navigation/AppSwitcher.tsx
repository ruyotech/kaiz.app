import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigationStore, AppContext } from '../../store/navigationStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { APPS, NAV_CONFIGS, SUB_APPS } from '../../utils/navigationConfig';
import type { App, SubApp } from '../../utils/navigationConfig';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '../../providers/ThemeProvider';
import { AppIcon } from '../ui/AppIcon';
import { navIcons, sectionIcons, moduleIcons, statusIcons, actionIcons } from '../../constants/icons';

// ============================================================================
// App groupings — derived from the central APPS list
// ============================================================================

const SPRINT_APP = APPS.find(app => app.id === 'sprints')!;
const SPRINT_SUB_APPS = APPS.filter(app => ['backlog', 'epics', 'taskSearch', 'templates'].includes(app.id));
const PRODUCTIVITY_APPS = APPS.filter(app => ['sensai', 'pomodoro', 'challenges'].includes(app.id));
const GROWTH_APPS = APPS.filter(app => ['mindset', 'essentia'].includes(app.id));
const COMMUNITY_APP = APPS.find(app => app.id === 'community')!;
const FAMILY_APP = APPS.find(app => app.id === 'family');

// ============================================================================
// Sub-App Grid — reusable 4-column grid component
// ============================================================================

const SubAppGrid = React.memo(function SubAppGrid({
    subApps,
    onSelect,
    colors,
    t,
}: {
    subApps: SubApp[];
    onSelect: (sub: SubApp) => void;
    colors: Record<string, string>;
    t: (key: string) => string;
}) {
    if (subApps.length === 0) return null;
    return (
        <View
            className="flex-row flex-wrap rounded-2xl p-3 mt-2"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
        >
            {subApps.map((sub) => (
                <View key={sub.id} style={{ width: '25%', paddingHorizontal: 4 }}>
                    <TouchableOpacity
                        onPress={() => onSelect(sub)}
                        activeOpacity={0.7}
                        className="items-center py-2"
                    >
                        <View
                            className="w-11 h-11 rounded-xl items-center justify-center mb-1.5"
                            style={{ backgroundColor: sub.color + '20' }}
                        >
                            <AppIcon icon={sub.icon} size={22} color={sub.color} />
                        </View>
                        <Text className="text-[10px] font-medium text-center" style={{ color: colors.textSecondary }} numberOfLines={1}>
                            {t(sub.nameKey)}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
});

// ============================================================================
// AppSwitcher
// ============================================================================

export function AppSwitcher() {
    const { isAppSwitcherOpen, toggleAppSwitcher, setCurrentApp, currentApp } = useNavigationStore();
    const { canAccessFeature } = useSubscriptionStore();
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { colors } = useThemeContext();

    const hasFamilyAccess = canAccessFeature('sharedWorkspace');

    // Merge SPRINT_SUB_APPS (from APPS) with extra sprint sub-apps from SUB_APPS config
    const allSprintSubApps: SubApp[] = [
        ...SPRINT_SUB_APPS.map(app => ({ id: app.id, nameKey: app.nameKey, icon: app.icon, color: app.color, route: app.route })),
        ...(SUB_APPS.sprints ?? []),
    ];

    const handleAppSelect = (app: App | SubApp) => {
        // Don't change currentApp for overlays — they preserve the current bottom bar context
        const overlayIds = ['templates', 'backlog', 'epics', 'taskSearch'];
        if (!overlayIds.includes(app.id)) {
            setCurrentApp(app.id as AppContext);
        }
        router.push(app.route as any);
        toggleAppSwitcher();
    };

    const handleSubAppSelect = (sub: SubApp) => {
        router.push(sub.route as any);
        toggleAppSwitcher();
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
                                    <Text className="text-xs mt-0.5" style={{ color: colors.textTertiary }}>Plan & track your sprints</Text>
                                </View>
                                {currentApp === 'sprints' && (
                                    <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }} />
                                )}
                                <AppIcon icon={navIcons.chevronRight} size={20} color={colors.textTertiary} />
                            </View>
                        </TouchableOpacity>

                        {/* Sprint Sub-apps Grid (4 col × 3 rows max) */}
                        <SubAppGrid subApps={allSprintSubApps} onSelect={handleSubAppSelect} colors={colors} t={t} />
                    </View>

                    {/* ====== Productivity Section — SensAI, Focus, Challenges ====== */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-3 px-1">
                            <AppIcon icon={sectionIcons.rocketLaunch} size={16} color="#10B981" />
                            <Text className="text-xs font-semibold uppercase tracking-wider ml-1.5" style={{ color: colors.textSecondary }}>Productivity</Text>
                        </View>

                        <View className="flex-row" style={{ marginHorizontal: -6 }}>
                            {PRODUCTIVITY_APPS.map((app) => (
                                <View key={app.id} style={{ flex: 1, paddingHorizontal: 6 }}>
                                    <TouchableOpacity
                                        onPress={() => handleAppSelect(app)}
                                        activeOpacity={0.7}
                                        className="rounded-2xl p-3 items-center"
                                        style={{
                                            backgroundColor: colors.card,
                                            borderColor: currentApp === app.id ? app.color : colors.border,
                                            borderWidth: currentApp === app.id ? 2 : 1,
                                        }}
                                    >
                                        <View
                                            className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                                            style={{ backgroundColor: app.color + '20' }}
                                        >
                                            <AppIcon icon={app.icon} size={26} color={app.color} />
                                        </View>
                                        <Text className="text-xs font-medium text-center" style={{ color: colors.textSecondary }} numberOfLines={1}>
                                            {t(app.nameKey)}
                                        </Text>
                                        {currentApp === app.id && (
                                            <View className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: colors.success }} />
                                        )}
                                    </TouchableOpacity>

                                    {/* Sub-apps grid for each productivity app */}
                                    {SUB_APPS[app.id as AppContext] && SUB_APPS[app.id as AppContext]!.length > 0 && currentApp === app.id && (
                                        <SubAppGrid subApps={SUB_APPS[app.id as AppContext]!} onSelect={handleSubAppSelect} colors={colors} t={t} />
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Expanded sub-apps for the active productivity app (full width beneath the row) */}
                        {PRODUCTIVITY_APPS.some(app => currentApp === app.id && SUB_APPS[app.id as AppContext]) && (
                            <SubAppGrid
                                subApps={SUB_APPS[currentApp as AppContext] ?? []}
                                onSelect={handleSubAppSelect}
                                colors={colors}
                                t={t}
                            />
                        )}
                    </View>

                    {/* ====== Growth Section — Mindset & Essentia ====== */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-3 px-1">
                            <AppIcon icon={sectionIcons.trendingUp} size={16} color="#8B5CF6" />
                            <Text className="text-xs font-semibold uppercase tracking-wider ml-1.5" style={{ color: colors.textSecondary }}>Growth & Inspiration</Text>
                        </View>

                        <View className="flex-row" style={{ marginHorizontal: -6 }}>
                            {GROWTH_APPS.map((app) => (
                                <View key={app.id} style={{ flex: 1, paddingHorizontal: 6 }}>
                                    <TouchableOpacity
                                        onPress={() => handleAppSelect(app)}
                                        activeOpacity={0.7}
                                        className="rounded-2xl p-4 flex-row items-center"
                                        style={{
                                            backgroundColor: colors.card,
                                            borderColor: currentApp === app.id ? app.color : colors.border,
                                            borderWidth: currentApp === app.id ? 2 : 1,
                                        }}
                                    >
                                        <View
                                            className="w-10 h-10 rounded-xl items-center justify-center"
                                            style={{ backgroundColor: app.color + '20' }}
                                        >
                                            <AppIcon icon={app.icon} size={22} color={app.color} />
                                        </View>
                                        <View className="ml-2.5 flex-1">
                                            <Text className="text-sm font-medium" style={{ color: colors.textSecondary }} numberOfLines={1}>
                                                {t(app.nameKey)}
                                            </Text>
                                            <Text className="text-[10px]" style={{ color: colors.textTertiary }} numberOfLines={1}>
                                                {app.id === 'mindset' ? 'Quotes' : 'Books'}
                                            </Text>
                                        </View>
                                        {currentApp === app.id && (
                                            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.success }} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        {/* Expanded sub-apps for the active growth app */}
                        {GROWTH_APPS.some(app => currentApp === app.id && SUB_APPS[app.id as AppContext]) && (
                            <SubAppGrid
                                subApps={SUB_APPS[currentApp as AppContext] ?? []}
                                onSelect={handleSubAppSelect}
                                colors={colors}
                                t={t}
                            />
                        )}
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
                                <Text className="text-xs mt-0.5" style={{ color: colors.textTertiary }}>Connect with others</Text>
                            </View>
                            {currentApp === 'community' && (
                                <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }} />
                            )}
                            <AppIcon icon={navIcons.chevronRight} size={20} color={colors.textTertiary} />
                        </TouchableOpacity>

                        {/* Community sub-apps */}
                        {SUB_APPS.community && (
                            <SubAppGrid subApps={SUB_APPS.community} onSelect={handleSubAppSelect} colors={colors} t={t} />
                        )}
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
                                        {hasFamilyAccess ? 'Collaborate with family' : 'Upgrade to unlock'}
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

                            {/* Family sub-apps */}
                            {hasFamilyAccess && SUB_APPS.family && (
                                <SubAppGrid subApps={SUB_APPS.family} onSelect={handleSubAppSelect} colors={colors} t={t} />
                            )}
                        </View>
                    )}
                </ScrollView>

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
                                    onPress={() => {
                                        router.push(mainIcon.route as any);
                                        toggleAppSwitcher();
                                    }}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                                        <AppIcon icon={mainIcon.icon} size={26} color={colors.primary} />
                                    </View>
                                    <Text className="text-[10px] font-medium mt-1" style={{ color: colors.primary }}>
                                        {t(mainIcon.nameKey)}
                                    </Text>
                                </TouchableOpacity>

                                {/* 3. Dashboard (replaced "More") */}
                                <TouchableOpacity
                                    className="items-center"
                                    onPress={() => {
                                        router.push('/(tabs)/dashboard' as any);
                                        toggleAppSwitcher();
                                    }}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                                        <AppIcon icon={moduleIcons.dashboard} size={26} color="#3B82F6" />
                                    </View>
                                    <Text className="text-[10px] font-medium mt-1" style={{ color: '#3B82F6' }}>
                                        {t('navigation.tabs.dashboard')}
                                    </Text>
                                </TouchableOpacity>

                                {/* 4. Create */}
                                <TouchableOpacity
                                    className="items-center"
                                    onPress={() => {
                                        toggleAppSwitcher();
                                        router.push('/(tabs)/command-center' as any);
                                    }}
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
