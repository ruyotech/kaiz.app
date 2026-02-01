import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationStore, AppContext } from '../../store/navigationStore';
import { useNotificationStore } from '../../store/notificationStore';
import { APPS, NAV_CONFIGS } from '../../utils/navigationConfig';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// App groupings
const SPRINT_APP = APPS.find(app => app.id === 'sdlc')!;
const SPRINT_SUB_APPS = APPS.filter(app => ['backlog', 'epics', 'taskSearch', 'templates'].includes(app.id));
const PRODUCTIVITY_APPS = APPS.filter(app => ['sensai', 'pomodoro', 'challenges'].includes(app.id));
const GROWTH_APPS = APPS.filter(app => ['mindset', 'essentia'].includes(app.id));
const COMMUNITY_APP = APPS.find(app => app.id === 'community')!;

export function AppSwitcher() {
    const { isAppSwitcherOpen, toggleAppSwitcher, setCurrentApp, currentApp } = useNavigationStore();
    const { unreadCount } = useNotificationStore();
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const handleAppSelect = (app: typeof APPS[0]) => {
        // Don't change currentApp for overlays - they're not a context switch
        // These apps should preserve the current bottom bar context
        const overlayApps = ['templates', 'backlog', 'epics', 'taskSearch'];
        if (!overlayApps.includes(app.id)) {
            setCurrentApp(app.id);
        }
        router.push(app.route as any);
        toggleAppSwitcher();
    };

    const handleNotifications = () => {
        router.push('/(tabs)/notifications' as any);
        toggleAppSwitcher();
    };

    const handleSettings = () => {
        // Don't change currentApp - keep 2nd and 3rd navbar icons as they were
        router.push('/(tabs)/settings' as any);
        toggleAppSwitcher();
    };

    const handleHelp = () => {
        // Navigate to help/about section
        router.push('/(tabs)/settings/about' as any);
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
            <View className="flex-1 bg-gray-50">
                {/* Header */}
                <View 
                    className="flex-row justify-between items-center px-5 bg-white border-b border-gray-100"
                    style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}
                >
                    <Text className="text-xl font-bold text-gray-900">{t('navigation.appSwitcher.title')}</Text>
                    
                    {/* Notification Button - More Visible */}
                    <TouchableOpacity 
                        onPress={handleNotifications}
                        activeOpacity={0.7}
                    >
                        <View className="relative">
                            <View 
                                className={`w-11 h-11 rounded-xl items-center justify-center ${
                                    unreadCount > 0 ? 'bg-orange-500' : 'bg-gray-100'
                                }`}
                            >
                                <MaterialCommunityIcons 
                                    name={unreadCount > 0 ? "bell-ring" : "bell-outline"} 
                                    size={24} 
                                    color={unreadCount > 0 ? "#FFFFFF" : "#6B7280"} 
                                />
                            </View>
                            {unreadCount > 0 && (
                                <View className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 rounded-full items-center justify-center px-1 border-2 border-white">
                                    <Text className="text-white text-[11px] font-bold">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Scrollable Apps Content */}
                <ScrollView 
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                >
                    {/* Sprint Section - Main app with sub-apps */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-3 px-1">
                            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#3B82F6" />
                            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider ml-1.5">Sprint</Text>
                        </View>
                        
                        {/* Main Sprint App */}
                        <TouchableOpacity
                            onPress={() => handleAppSelect(SPRINT_APP)}
                            activeOpacity={0.7}
                            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                            style={{ 
                                borderColor: currentApp === 'sdlc' ? '#3B82F6' : '#F3F4F6',
                                borderWidth: currentApp === 'sdlc' ? 2 : 1,
                            }}
                        >
                            <View className="flex-row items-center">
                                <View 
                                    className="w-12 h-12 rounded-xl items-center justify-center"
                                    style={{ backgroundColor: '#3B82F620' }}
                                >
                                    <MaterialCommunityIcons name="view-dashboard-outline" size={26} color="#3B82F6" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-gray-900 font-semibold text-base">{t(SPRINT_APP.nameKey)}</Text>
                                    <Text className="text-gray-400 text-xs mt-0.5">Plan & track your sprints</Text>
                                </View>
                                {currentApp === 'sdlc' && (
                                    <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                )}
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                        
                        {/* Sprint Sub-apps Grid */}
                        <View className="flex-row flex-wrap bg-white rounded-2xl p-3 border border-gray-100" style={{ marginHorizontal: -4 }}>
                            {SPRINT_SUB_APPS.map((app) => (
                                <View key={app.id} style={{ width: '25%', paddingHorizontal: 4 }}>
                                    <TouchableOpacity
                                        onPress={() => handleAppSelect(app)}
                                        activeOpacity={0.7}
                                        className="items-center py-2"
                                    >
                                        <View 
                                            className="w-11 h-11 rounded-xl items-center justify-center mb-1.5"
                                            style={{ 
                                                backgroundColor: currentApp === app.id ? app.color + '25' : '#F3F4F6',
                                                borderWidth: currentApp === app.id ? 1.5 : 0,
                                                borderColor: app.color,
                                            }}
                                        >
                                            <MaterialCommunityIcons name={app.icon as any} size={22} color={app.color} />
                                        </View>
                                        <Text className="text-[10px] font-medium text-center text-gray-600" numberOfLines={1}>
                                            {t(app.nameKey)}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Productivity Section - SensAI, Focus, Challenges */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-3 px-1">
                            <MaterialCommunityIcons name="rocket-launch" size={16} color="#10B981" />
                            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider ml-1.5">Productivity</Text>
                        </View>
                        
                        <View className="flex-row" style={{ marginHorizontal: -6 }}>
                            {PRODUCTIVITY_APPS.map((app) => (
                                <View key={app.id} style={{ flex: 1, paddingHorizontal: 6 }}>
                                    <TouchableOpacity
                                        onPress={() => handleAppSelect(app)}
                                        activeOpacity={0.7}
                                        className="bg-white rounded-2xl p-3 items-center border border-gray-100"
                                        style={{ 
                                            borderColor: currentApp === app.id ? app.color : '#F3F4F6',
                                            borderWidth: currentApp === app.id ? 2 : 1,
                                        }}
                                    >
                                        <View 
                                            className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                                            style={{ backgroundColor: app.color + '20' }}
                                        >
                                            <MaterialCommunityIcons name={app.icon as any} size={26} color={app.color} />
                                        </View>
                                        <Text className="text-xs font-medium text-center text-gray-700" numberOfLines={1}>
                                            {t(app.nameKey)}
                                        </Text>
                                        {currentApp === app.id && (
                                            <View className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Growth Section - Mindset & Essentia */}
                    <View className="mb-5">
                        <View className="flex-row items-center mb-3 px-1">
                            <MaterialCommunityIcons name="trending-up" size={16} color="#8B5CF6" />
                            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider ml-1.5">Growth & Inspiration</Text>
                        </View>
                        
                        <View className="flex-row" style={{ marginHorizontal: -6 }}>
                            {GROWTH_APPS.map((app) => (
                                <View key={app.id} style={{ flex: 1, paddingHorizontal: 6 }}>
                                    <TouchableOpacity
                                        onPress={() => handleAppSelect(app)}
                                        activeOpacity={0.7}
                                        className="bg-white rounded-2xl p-4 flex-row items-center border border-gray-100"
                                        style={{ 
                                            borderColor: currentApp === app.id ? app.color : '#F3F4F6',
                                            borderWidth: currentApp === app.id ? 2 : 1,
                                        }}
                                    >
                                        <View 
                                            className="w-10 h-10 rounded-xl items-center justify-center"
                                            style={{ backgroundColor: app.color + '20' }}
                                        >
                                            <MaterialCommunityIcons name={app.icon as any} size={22} color={app.color} />
                                        </View>
                                        <View className="ml-2.5 flex-1">
                                            <Text className="text-sm font-medium text-gray-700" numberOfLines={1}>
                                                {t(app.nameKey)}
                                            </Text>
                                            <Text className="text-[10px] text-gray-400" numberOfLines={1}>
                                                {app.id === 'mindset' ? 'Quotes' : 'Books'}
                                            </Text>
                                        </View>
                                        {currentApp === app.id && (
                                            <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Community Section */}
                    <View className="mb-3">
                        <View className="flex-row items-center mb-3 px-1">
                            <MaterialCommunityIcons name="account-group-outline" size={16} color="#06B6D4" />
                            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider ml-1.5">Social</Text>
                        </View>
                        
                        <TouchableOpacity
                            onPress={() => handleAppSelect(COMMUNITY_APP)}
                            activeOpacity={0.7}
                            className="bg-white rounded-2xl p-4 flex-row items-center border border-gray-100"
                            style={{ 
                                borderColor: currentApp === 'community' ? '#06B6D4' : '#F3F4F6',
                                borderWidth: currentApp === 'community' ? 2 : 1,
                            }}
                        >
                            <View 
                                className="w-12 h-12 rounded-xl items-center justify-center"
                                style={{ backgroundColor: '#06B6D420' }}
                            >
                                <MaterialCommunityIcons name="account-group" size={26} color="#06B6D4" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-900 font-semibold text-base">{t(COMMUNITY_APP.nameKey)}</Text>
                                <Text className="text-gray-400 text-xs mt-0.5">Connect with others</Text>
                            </View>
                            {currentApp === 'community' && (
                                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                            )}
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Settings Button */}
                <View className="px-4 py-3 bg-white border-t border-gray-100">
                    <TouchableOpacity 
                        onPress={handleSettings}
                        className="flex-row items-center justify-center bg-gray-100 rounded-xl py-3"
                    >
                        <MaterialCommunityIcons name="cog-outline" size={20} color="#6B7280" />
                        <Text className="text-gray-700 font-medium text-sm ml-2">{t('navigation.appSwitcher.settings')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Navigation Bar */}
                {(() => {
                    const icons = NAV_CONFIGS[currentApp as AppContext] || NAV_CONFIGS['sdlc'];
                    const mainIcon = icons[0];
                    const moreIcon = icons[icons.length - 1];
                    
                    return (
                        <View 
                            className="bg-white border-t border-gray-200"
                            style={{ paddingBottom: insets.bottom }}
                        >
                            <View className="flex-row items-center justify-between px-6 py-2">
                                {/* 1. Apps Icon - Active state */}
                                <TouchableOpacity
                                    className="items-center"
                                    onPress={toggleAppSwitcher}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center bg-amber-100 border-2 border-amber-400">
                                        <MaterialCommunityIcons
                                            name="view-grid"
                                            size={26}
                                            color="#F59E0B"
                                        />
                                    </View>
                                    <Text className="text-[10px] font-semibold mt-1 text-amber-600">{t('navigation.appSwitcher.title')}</Text>
                                </TouchableOpacity>

                                {/* 2. Main App Icon */}
                                <TouchableOpacity
                                    className="items-center"
                                    onPress={() => {
                                        router.push(mainIcon.route as any);
                                        toggleAppSwitcher();
                                    }}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center bg-blue-50">
                                        <MaterialCommunityIcons
                                            name={mainIcon.icon as any}
                                            size={26}
                                            color="#3B82F6"
                                        />
                                    </View>
                                    <Text className="text-[10px] font-medium mt-1 text-blue-600">
                                        {t(mainIcon.nameKey)}
                                    </Text>
                                </TouchableOpacity>

                                {/* 3. More Icon */}
                                <TouchableOpacity
                                    className="items-center"
                                    onPress={() => {
                                        toggleAppSwitcher();
                                    }}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center bg-purple-50">
                                        <MaterialCommunityIcons
                                            name={moreIcon.icon as any}
                                            size={26}
                                            color="#8B5CF6"
                                        />
                                    </View>
                                    <Text className="text-[10px] font-medium mt-1 text-purple-600">
                                        {t(moreIcon.nameKey)}
                                    </Text>
                                </TouchableOpacity>

                                {/* 4. Create Icon */}
                                <TouchableOpacity
                                    className="items-center"
                                    onPress={() => {
                                        toggleAppSwitcher();
                                        router.push('/(tabs)/command-center' as any);
                                    }}
                                >
                                    <View className="w-12 h-12 rounded-2xl items-center justify-center bg-emerald-50">
                                        <MaterialCommunityIcons
                                            name="plus-circle"
                                            size={26}
                                            color="#10B981"
                                        />
                                    </View>
                                    <Text className="text-[10px] font-medium mt-1 text-emerald-600">{t('common.create')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })()}
            </View>
        </Modal>
    );
}
