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

    const handleResetDemo = () => {
        Alert.alert(
            '🔄 Reset Demo',
            'This will clear all app data and show the welcome/onboarding screens again. Perfect for testing the complete flow!',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        resetApp();
                        resetAuth();
                        resetPreferences();
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
        <Container>
            <ScreenHeader
                title="Settings"
                subtitle="Customize your experience"
            />

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

                {/* About */}
                <Card className="mb-8">
                    <View className="items-center py-4">
                        <Text className="text-gray-900 text-base font-bold">Kaiz LifeOS</Text>
                        <Text className="text-gray-500 text-sm mt-1">Your Life, Engineered</Text>
                        <Text className="text-gray-400 text-xs mt-2">Version 1.0.0</Text>
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
