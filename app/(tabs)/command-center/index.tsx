import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CREATE_OPTIONS = [
    { id: 'task', icon: 'checkbox-marked-circle-outline', label: 'Task', color: '#3B82F6', route: '/(tabs)/sdlc/create-task' },
    { id: 'challenge', icon: 'trophy-outline', label: 'Challenge', color: '#F59E0B', route: '/(tabs)/challenges/create' },
    { id: 'event', icon: 'calendar-star', label: 'Event', color: '#06B6D4', route: '/(tabs)/command-center' },
];

export default function CommandCenterScreen() {
    const router = useRouter();

    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="Create"
                subtitle="AI-powered quick input"
                showBack
                useSafeArea={false}
            />

            {/* Quick Create Cards */}
            <ScrollView className="flex-1 px-4 pt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-3">Quick Create</Text>
                <View className="flex-row gap-3 mb-6">
                    {CREATE_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            onPress={() => router.push(option.route as any)}
                            className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center"
                        >
                            <View
                                className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                                style={{ backgroundColor: option.color + '20' }}
                            >
                                <MaterialCommunityIcons
                                    name={option.icon as any}
                                    size={24}
                                    color={option.color}
                                />
                            </View>
                            <Text className="font-semibold text-gray-800 mb-1 text-center">{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* AI Suggestions */}
                <Text className="text-sm font-semibold text-gray-700 mb-3">AI Suggestions</Text>
                <View className="bg-purple-50 rounded-2xl p-4 border border-purple-100 mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                            <MaterialCommunityIcons name="creation" size={16} color="#8B5CF6" />
                        </View>
                        <Text className="text-sm font-semibold text-gray-800">Smart Parse</Text>
                    </View>
                    <Text className="text-sm text-gray-600 leading-5">
                        Use the + button below to access camera, gallery, file, or voice input. AI will automatically detect what you're creating.
                    </Text>
                </View>

                {/* Recent Activity */}
                <Text className="text-sm font-semibold text-gray-700 mb-3">Recent</Text>
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <View className="flex-row items-center mb-2">
                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                            <MaterialCommunityIcons name="checkbox-marked-circle" size={16} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-medium text-gray-800">Review designs</Text>
                            <Text className="text-xs text-gray-500">2 min ago • Task</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-white rounded-xl p-4 mb-20 shadow-sm">
                    <View className="flex-row items-center mb-2">
                        <View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center mr-3">
                            <MaterialCommunityIcons name="trophy" size={16} color="#F59E0B" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-medium text-gray-800">Morning meditation streak</Text>
                            <Text className="text-xs text-gray-500">10 min ago • Challenge</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Container>
    );
}
