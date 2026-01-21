import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
    const router = useRouter();
    const [motivationBgColor, setMotivationBgColor] = useState('#3B82F6');
    const [notificationFrequency, setNotificationFrequency] = useState('daily');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const bgColorOptions = [
        { name: 'Ocean Blue', value: '#3B82F6', gradient: ['#3B82F6', '#2563EB'] },
        { name: 'Sunset Orange', value: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
        { name: 'Forest Green', value: '#10B981', gradient: ['#10B981', '#059669'] },
        { name: 'Royal Purple', value: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
        { name: 'Rose Pink', value: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
        { name: 'Midnight', value: '#1F2937', gradient: ['#1F2937', '#111827'] },
    ];

    const frequencyOptions = [
        { label: 'Daily (Morning)', value: 'daily' },
        { label: 'Every 12 hours', value: 'twice-daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Never', value: 'never' },
    ];

    return (
        <Container>
            <ScreenHeader
                title="Settings"
                subtitle="Customize your experience"
            />

            <ScrollView className="flex-1 p-4">
                {/* Motivation Settings */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Motivation</Text>

                <Card className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">Background Color</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {bgColorOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setMotivationBgColor(option.value)}
                                className="items-center"
                            >
                                <View
                                    className="w-14 h-14 rounded-full items-center justify-center"
                                    style={{ backgroundColor: option.value }}
                                >
                                    {motivationBgColor === option.value && (
                                        <MaterialCommunityIcons name="check" size={24} color="white" />
                                    )}
                                </View>
                                <Text className="text-xs text-gray-600 mt-1">{option.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                <Card className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">Notification Frequency</Text>
                    {frequencyOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => setNotificationFrequency(option.value)}
                            className="flex-row items-center justify-between py-3 border-b border-gray-100"
                        >
                            <Text className="text-gray-700">{option.label}</Text>
                            {notificationFrequency === option.value && (
                                <MaterialCommunityIcons name="check-circle" size={24} color="#3B82F6" />
                            )}
                        </TouchableOpacity>
                    ))}
                </Card>

                <Card className="mb-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-700">Auto-refresh in App</Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                Get a new quote when opening the app
                            </Text>
                        </View>
                        <Switch
                            value={autoRefresh}
                            onValueChange={setAutoRefresh}
                            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                            thumbColor={autoRefresh ? '#3B82F6' : '#F3F4F6'}
                        />
                    </View>
                </Card>

                {/* Life Wheel Settings */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-6">Life Wheel</Text>

                <Card className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-3">Tracked Areas</Text>
                    <Text className="text-xs text-gray-500 mb-3">
                        Select which life areas you want to track and improve
                    </Text>
                    {[
                        { name: 'Health & Fitness', icon: 'heart-pulse', enabled: true },
                        { name: 'Career & Finance', icon: 'briefcase', enabled: true },
                        { name: 'Relationships', icon: 'account-group', enabled: true },
                        { name: 'Personal Growth', icon: 'school', enabled: true },
                        { name: 'Recreation & Fun', icon: 'gamepad-variant', enabled: false },
                        { name: 'Contribution & Legacy', icon: 'hand-heart', enabled: true },
                    ].map((area, index) => (
                        <View
                            key={index}
                            className="flex-row items-center justify-between py-3 border-b border-gray-100"
                        >
                            <View className="flex-row items-center flex-1">
                                <MaterialCommunityIcons name={area.icon as any} size={24} color="#6B7280" />
                                <Text className="text-gray-700 ml-3">{area.name}</Text>
                            </View>
                            <Switch
                                value={area.enabled}
                                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                                thumbColor={area.enabled ? '#3B82F6' : '#F3F4F6'}
                            />
                        </View>
                    ))}
                </Card>

                {/* General Settings */}
                <Text className="text-lg font-bold text-gray-800 mb-3 mt-6">General</Text>

                <Card className="mb-4">
                    <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="theme-light-dark" size={24} color="#6B7280" />
                            <Text className="text-gray-700 ml-3">Theme</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 mr-2">Light</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="earth" size={24} color="#6B7280" />
                            <Text className="text-gray-700 ml-3">Language</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 mr-2">English</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between py-3">
                        <View className="flex-row items-center flex-1">
                            <MaterialCommunityIcons name="database-export" size={24} color="#6B7280" />
                            <Text className="text-gray-700 ml-3">Export Data</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </Card>

                {/* About */}
                <Card className="mb-8">
                    <View className="items-center py-4">
                        <Text className="text-gray-500 text-sm">Kaiz1 Mobile</Text>
                        <Text className="text-gray-400 text-xs mt-1">Version 1.0.0</Text>
                    </View>
                </Card>
            </ScrollView>
        </Container>
    );
}
