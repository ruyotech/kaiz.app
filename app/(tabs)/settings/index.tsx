import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Modal, Pressable } from 'react-native';
import { useState } from 'react';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { usePreferencesStore, SupportedLocale } from '../../../store/preferencesStore';
import { SUPPORTED_LANGUAGES } from '../../../utils/constants';

const LIFE_WHEEL_AREAS = [
    { id: 'lw-1', name: 'Health & Fitness', icon: '💪' },
    { id: 'lw-2', name: 'Career & Work', icon: '💼' },
    { id: 'lw-3', name: 'Finance & Money', icon: '💰' },
    { id: 'lw-4', name: 'Personal Growth', icon: '📚' },
    { id: 'lw-5', name: 'Relationships & Family', icon: '❤️' },
    { id: 'lw-6', name: 'Social Life', icon: '👥' },
    { id: 'lw-7', name: 'Fun & Recreation', icon: '🎮' },
    { id: 'lw-8', name: 'Environment & Home', icon: '🏡' },
];

export default function SettingsScreen() {
    const router = useRouter();
    const { reset: resetApp } = useAppStore();
    const { reset: resetAuth, logout, isDemoUser } = useAuthStore();
    const {
        locale,
        setLocale,
        timezone,
        theme,
        setTheme,
        selectedLifeWheelAreaIds,
        toggleLifeWheelArea,
        enableDailyReminders,
        enableAiInsights,
        enableChallengeUpdates,
        enableBillReminders,
        allowAnalytics,
        allowPersonalization,
        setNotificationPreferences,
        setPrivacyPreferences,
        reset: resetPreferences,
    } = usePreferencesStore();

    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);

    const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === locale) || SUPPORTED_LANGUAGES[0];

    const handleResetDemo = async () => {
        Alert.alert(
            '🔄 Reset Demo',
            'This will clear all app data and show the welcome screen. Perfect for testing the complete flow from the beginning!',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        // Clear all stores
                        resetApp();
                        resetAuth();
                        resetPreferences();
                        
                        // Wait a moment for AsyncStorage to clear
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        // Go to the very beginning (welcome/splash screen)
                        // @ts-ignore - Dynamic route
                        router.replace('/');
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        // @ts-ignore - Dynamic route
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const handleLanguageSelect = (langCode: SupportedLocale) => {
        setLocale(langCode);
        setShowLanguageModal(false);
    };

    const handleThemeSelect = (newTheme: 'light' | 'dark' | 'auto') => {
        setTheme(newTheme);
        setShowThemeModal(false);
    };

    const isAreaSelected = (areaId: string) => selectedLifeWheelAreaIds.includes(areaId);

    return (
        <Container safeArea={false}>
            {/* Header with Close Button */}
            <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
                        <Text className="text-sm text-gray-600 mt-1">Customize your experience</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center ml-3"
                    >
                        <MaterialCommunityIcons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Demo Mode Indicator */}
                {isDemoUser && (
                    <View className="mb-4 bg-purple-100 p-4 rounded-xl flex-row items-center">
                        <Text className="text-3xl mr-3">🎭</Text>
                        <View className="flex-1">
                            <Text className="text-purple-900 font-bold text-base">Demo Mode Active</Text>
                            <Text className="text-purple-700 text-sm mt-0.5">
                                You're using a demo account with pre-filled data
                            </Text>
                        </View>
                    </View>
                )}

                {/* Localization Section */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Localization</Text>
                <Card className="mb-4">
                    <TouchableOpacity 
                        onPress={() => setShowLanguageModal(true)}
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                    >
                        <View className="flex-row items-center flex-1">
                            <Text className="text-3xl mr-3">{currentLanguage.flag}</Text>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-900">Language</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">
                                    {currentLanguage.nativeName}
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View className="py-4">
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="clock-outline" size={24} color="#6B7280" className="mr-3" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Timezone</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">{timezone}</Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Appearance Section */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">Appearance</Text>
                <Card className="mb-4">
                    <TouchableOpacity 
                        onPress={() => setShowThemeModal(true)}
                        className="flex-row items-center justify-between py-4"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="theme-light-dark" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Theme</Text>
                                <Text className="text-xs text-gray-500 mt-0.5 capitalize">{theme === 'auto' ? 'Auto (System)' : theme}</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </Card>

                {/* Life Wheel Areas Section */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">Life Wheel Areas</Text>
                <Card className="mb-4">
                    <Text className="text-xs text-gray-500 mb-3">
                        Select which life dimensions you want to track and balance
                    </Text>
                    {LIFE_WHEEL_AREAS.map((area, index) => (
                        <View
                            key={area.id}
                            className={`flex-row items-center justify-between py-3 ${
                                index < LIFE_WHEEL_AREAS.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                        >
                            <View className="flex-row items-center flex-1">
                                <Text className="text-2xl mr-3">{area.icon}</Text>
                                <Text className="text-gray-700">{area.name}</Text>
                            </View>
                            <Switch
                                value={isAreaSelected(area.id)}
                                onValueChange={() => toggleLifeWheelArea(area.id)}
                                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                                thumbColor={isAreaSelected(area.id) ? '#3B82F6' : '#F3F4F6'}
                            />
                        </View>
                    ))}
                </Card>

                {/* Notifications Section */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">Notifications</Text>
                <Card className="mb-4">
                    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">Daily Sprint Reminders</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                Morning planning & evening review prompts
                            </Text>
                        </View>
                        <Switch
                            value={enableDailyReminders}
                            onValueChange={(value) => setNotificationPreferences({ enableDailyReminders: value })}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={enableDailyReminders ? '#3B82F6' : '#F3F4F6'}
                        />
                    </View>

                    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">AI Scrum Master Insights</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                Smart coaching & capacity warnings
                            </Text>
                        </View>
                        <Switch
                            value={enableAiInsights}
                            onValueChange={(value) => setNotificationPreferences({ enableAiInsights: value })}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={enableAiInsights ? '#3B82F6' : '#F3F4F6'}
                        />
                    </View>

                    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">Challenge Updates</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                Streak tracking & team progress
                            </Text>
                        </View>
                        <Switch
                            value={enableChallengeUpdates}
                            onValueChange={(value) => setNotificationPreferences({ enableChallengeUpdates: value })}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={enableChallengeUpdates ? '#3B82F6' : '#F3F4F6'}
                        />
                    </View>

                    <View className="flex-row items-center justify-between py-3">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">Bill Reminders</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                Payment due dates & alerts
                            </Text>
                        </View>
                        <Switch
                            value={enableBillReminders}
                            onValueChange={(value) => setNotificationPreferences({ enableBillReminders: value })}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={enableBillReminders ? '#3B82F6' : '#F3F4F6'}
                        />
                    </View>
                </Card>

                {/* Privacy Section */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">Privacy</Text>
                <Card className="mb-4">
                    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">Analytics</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                Help improve Kaiz (anonymous data only)
                            </Text>
                        </View>
                        <Switch
                            value={allowAnalytics}
                            onValueChange={(value) => setPrivacyPreferences({ allowAnalytics: value })}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={allowAnalytics ? '#3B82F6' : '#F3F4F6'}
                        />
                    </View>

                    <View className="flex-row items-center justify-between py-3">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">Personalization</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                AI recommendations based on your patterns
                            </Text>
                        </View>
                        <Switch
                            value={allowPersonalization}
                            onValueChange={(value) => setPrivacyPreferences({ allowPersonalization: value })}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={allowPersonalization ? '#3B82F6' : '#F3F4F6'}
                        />
                    </View>
                </Card>

                {/* Account Section */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">Account</Text>
                <Card className="mb-4">
                    <TouchableOpacity 
                        onPress={handleResetDemo}
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                                <MaterialCommunityIcons name="restart" size={20} color="#3B82F6" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-sm font-semibold text-gray-900">Reset Demo</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">
                                    Clear data and restart onboarding flow
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleLogout}
                        className="flex-row items-center justify-between py-4"
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
                                <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-sm font-semibold text-gray-900">Logout</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">
                                    Return to login screen
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </Card>

                {/* Sprint Preferences */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">Sprint Settings</Text>
                <Card className="mb-4">
                    <TouchableOpacity 
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="calendar-week" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Week Starts On</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">Monday</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="speedometer" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Velocity Target</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">25-35 points/week (Moderate)</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-row items-center justify-between py-4"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="format-list-checks" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Default Task Points</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">3 points (Medium)</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </Card>

                {/* AI Coach Settings */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">AI Scrum Master</Text>
                <Card className="mb-4">
                    <TouchableOpacity 
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="robot-happy" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Coaching Style</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">Supportive Coach</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">Overcommit Warnings</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                Alert when sprint scope exceeds velocity
                            </Text>
                        </View>
                        <Switch
                            value={true}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={'#3B82F6'}
                        />
                    </View>

                    <View className="flex-row items-center justify-between py-3">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">Q2 Balance Monitor</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                Nudge when important tasks are neglected
                            </Text>
                        </View>
                        <Switch
                            value={true}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={'#3B82F6'}
                        />
                    </View>
                </Card>

                {/* Data & Sync */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">Data & Sync</Text>
                <Card className="mb-4">
                    <TouchableOpacity 
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="cloud-sync" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Sync Status</Text>
                                <Text className="text-xs text-green-600 mt-0.5">✓ All data synced</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">Offline Mode</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                Work without internet, sync later
                            </Text>
                        </View>
                        <Switch
                            value={true}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={'#3B82F6'}
                        />
                    </View>

                    <TouchableOpacity 
                        className="flex-row items-center justify-between py-4"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="database-export" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Export Data</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">Download your data (CSV/PDF)</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </Card>

                {/* About & Support */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">About & Support</Text>
                <Card className="mb-4">
                    <TouchableOpacity 
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="help-circle" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Help Center</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">Guides, tutorials & FAQs</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-row items-center justify-between py-4 border-b border-gray-100"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="book-open-variant" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">About Kaiz LifeOS</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">Learn about the system</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-row items-center justify-between py-4"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="information" size={24} color="#6B7280" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-gray-900">Version</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">1.0.0 (Build 100)</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Card>

                {/* Follow Us */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">Follow Us</Text>
                <Card className="mb-8">
                    <Text className="text-sm text-gray-600 text-center mb-4">
                        Join our community and stay updated
                    </Text>
                    <View className="flex-row justify-center items-center gap-4">
                        <TouchableOpacity className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center">
                            <MaterialCommunityIcons name="twitter" size={28} color="#1DA1F2" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-14 h-14 rounded-full bg-purple-100 items-center justify-center">
                            <MaterialCommunityIcons name="instagram" size={28} color="#E4405F" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center">
                            <MaterialCommunityIcons name="linkedin" size={28} color="#0A66C2" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center">
                            <MaterialCommunityIcons name="youtube" size={28} color="#FF0000" />
                        </TouchableOpacity>
                    </View>
                    <View className="mt-4 pt-4 border-t border-gray-100">
                        <TouchableOpacity className="flex-row items-center justify-center py-2">
                            <MaterialCommunityIcons name="web" size={20} color="#6B7280" />
                            <Text className="text-sm text-gray-700 ml-2 font-medium">kaizlifeos.com</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                visible={showLanguageModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowLanguageModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        className="bg-white rounded-t-3xl"
                    >
                        <View className="p-6">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-2xl font-bold text-gray-900">Select Language</Text>
                                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="max-h-96">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.code}
                                        onPress={() => handleLanguageSelect(lang.code)}
                                        className={`flex-row items-center py-4 px-4 rounded-lg mb-2 ${
                                            locale === lang.code ? 'bg-blue-50' : 'bg-gray-50'
                                        }`}
                                    >
                                        <Text className="text-3xl mr-4">{lang.flag}</Text>
                                        <View className="flex-1">
                                            <Text className="text-base font-semibold text-gray-900">
                                                {lang.nativeName}
                                            </Text>
                                            <Text className="text-sm text-gray-600">{lang.name}</Text>
                                        </View>
                                        {locale === lang.code && (
                                            <MaterialCommunityIcons name="check-circle" size={24} color="#3B82F6" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Theme Selection Modal */}
            <Modal
                visible={showThemeModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowThemeModal(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowThemeModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        className="bg-white rounded-t-3xl"
                    >
                        <View className="p-6">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-2xl font-bold text-gray-900">Select Theme</Text>
                                <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            <View className="gap-3">
                                {[
                                    { value: 'light' as const, label: 'Light', icon: 'white-balance-sunny' },
                                    { value: 'dark' as const, label: 'Dark', icon: 'moon-waning-crescent' },
                                    { value: 'auto' as const, label: 'Auto (System)', icon: 'theme-light-dark' },
                                ].map((themeOption) => (
                                    <TouchableOpacity
                                        key={themeOption.value}
                                        onPress={() => handleThemeSelect(themeOption.value)}
                                        className={`flex-row items-center py-4 px-4 rounded-lg ${
                                            theme === themeOption.value ? 'bg-blue-50' : 'bg-gray-50'
                                        }`}
                                    >
                                        <MaterialCommunityIcons 
                                            name={themeOption.icon as any} 
                                            size={24} 
                                            color={theme === themeOption.value ? '#3B82F6' : '#6B7280'} 
                                        />
                                        <Text className={`text-base font-semibold ml-4 flex-1 ${
                                            theme === themeOption.value ? 'text-blue-900' : 'text-gray-900'
                                        }`}>
                                            {themeOption.label}
                                        </Text>
                                        {theme === themeOption.value && (
                                            <MaterialCommunityIcons name="check-circle" size={24} color="#3B82F6" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </Container>
    );
}
