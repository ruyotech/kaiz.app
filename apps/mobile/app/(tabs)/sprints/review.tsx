/**
 * Sprint Review Screen
 *
 * Facilitates sprint review ceremony with achievement celebration,
 * completion analysis, and insights gathering.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStartCeremony } from '../../../hooks/queries';
import { useThemeContext } from '../../../providers/ThemeProvider';

interface CompletedTask {
    id: string;
    title: string;
    points: number;
    dimension: string;
    completedAt: string;
}

const DIMENSION_META: Record<string, { color: string; icon: string; name: string }> = {
    career: { color: '#3B82F6', icon: 'briefcase', name: 'Career' },
    health: { color: '#10B981', icon: 'heart-pulse', name: 'Health' },
    family: { color: '#EC4899', icon: 'home-heart', name: 'Family' },
    finance: { color: '#F59E0B', icon: 'cash', name: 'Finance' },
    growth: { color: '#8B5CF6', icon: 'school', name: 'Growth' },
    social: { color: '#06B6D4', icon: 'account-group', name: 'Social' },
    spirit: { color: '#6366F1', icon: 'meditation', name: 'Spirit' },
};

export default function SprintReviewScreen() {
    const { colors, isDark } = useThemeContext();
    const startCeremonyMutation = useStartCeremony();
    const [isStarted, setIsStarted] = useState(false);

    // Mock completed tasks
    const completedTasks: CompletedTask[] = [
        { id: '1', title: 'Complete project proposal', points: 5, dimension: 'career', completedAt: '2024-01-15' },
        { id: '2', title: 'Morning workout routine (7 days)', points: 7, dimension: 'health', completedAt: '2024-01-18' },
        { id: '3', title: 'Family dinner - weekly', points: 3, dimension: 'family', completedAt: '2024-01-14' },
        { id: '4', title: 'Read "Atomic Habits"', points: 5, dimension: 'growth', completedAt: '2024-01-17' },
        { id: '5', title: 'Meditation streak (5 days)', points: 5, dimension: 'spirit', completedAt: '2024-01-18' },
    ];

    const incompleteTasks = [
        { id: '6', title: 'Review investment portfolio', points: 5, dimension: 'finance', reason: 'Waiting on documents' },
        { id: '7', title: 'Declutter garage', points: 4, dimension: 'environment', reason: 'Ran out of time' },
    ];

    const totalCompleted = completedTasks.reduce((sum, t) => sum + t.points, 0);
    const totalPlanned = totalCompleted + incompleteTasks.reduce((sum, t) => sum + t.points, 0);
    const completionRate = Math.round((totalCompleted / totalPlanned) * 100);

    const getDim = (dimension: string) => DIMENSION_META[dimension] || { color: '#6B7280', icon: 'circle', name: dimension };

    const handleStartReview = async () => {
        await startCeremonyMutation.mutateAsync('review');
        setIsStarted(true);
    };

    if (!isStarted) {
        return (
            <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                <View className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold" style={{ color: colors.text }}>Sprint Review</Text>
                </View>

                <View className="flex-1 justify-center items-center p-6">
                    <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : '#F3E8FF' }}>
                        <MaterialCommunityIcons name="presentation" size={48} color="#A855F7" />
                    </View>

                    <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
                        Time to Celebrate!
                    </Text>
                    <Text className="text-center mb-8" style={{ color: colors.textSecondary }}>
                        Let's review what you've accomplished this sprint and celebrate your wins.
                    </Text>

                    <View className="rounded-2xl p-6 w-full mb-6" style={{ backgroundColor: colors.card }}>
                        <Text className="font-semibold mb-4" style={{ color: colors.text }}>Sprint Review includes:</Text>
                        {[
                            { icon: 'trophy', text: 'Celebrate completed achievements', color: '#F59E0B' },
                            { icon: 'chart-line', text: 'Analyze velocity & completion rate', color: '#3B82F6' },
                            { icon: 'magnify', text: 'Review incomplete items', color: '#EF4444' },
                            { icon: 'lightbulb', text: 'Gather insights for next sprint', color: '#10B981' },
                        ].map((item, idx) => (
                            <View key={idx} className="flex-row items-center mb-3">
                                <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                                <Text className="ml-3" style={{ color: colors.textSecondary }}>{item.text}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleStartReview}
                        className="w-full p-4 rounded-xl"
                        style={{ backgroundColor: '#A855F7' }}
                    >
                        <Text className="text-white text-center font-semibold text-lg">Start Review</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <View className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-xl font-semibold" style={{ color: colors.text }}>Sprint Review</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Sprint Stats */}
                <View
                    className="rounded-2xl p-6 mb-4"
                    style={{
                        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : '#FAF5FF',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#E9D5FF',
                    }}
                >
                    <View className="items-center mb-4">
                        <Text className="text-4xl mb-2">🏆</Text>
                        <Text className="text-2xl font-bold" style={{ color: colors.text }}>{completionRate}% Complete</Text>
                        <Text style={{ color: colors.textSecondary }}>{totalCompleted} of {totalPlanned} points delivered</Text>
                    </View>

                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <Text className="text-2xl font-bold" style={{ color: colors.success }}>{completedTasks.length}</Text>
                            <Text className="text-sm" style={{ color: colors.textSecondary }}>Completed</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold" style={{ color: colors.error }}>{incompleteTasks.length}</Text>
                            <Text className="text-sm" style={{ color: colors.textSecondary }}>Incomplete</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold" style={{ color: colors.primary }}>{Math.round(totalCompleted / 14)}</Text>
                            <Text className="text-sm" style={{ color: colors.textSecondary }}>Pts/Day</Text>
                        </View>
                    </View>
                </View>

                {/* Completed Tasks */}
                <View className="mb-4">
                    <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>✅ Completed This Sprint</Text>
                    {completedTasks.map(task => {
                        const dim = getDim(task.dimension);
                        return (
                            <View key={task.id} className="p-4 rounded-xl mb-2 flex-row items-center" style={{ backgroundColor: colors.card }}>
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: dim.color + '30' }}
                                >
                                    <MaterialCommunityIcons name={dim.icon as any} size={20} color={dim.color} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-medium" style={{ color: colors.text }}>{task.title}</Text>
                                    <Text className="text-sm" style={{ color: colors.textSecondary }}>{dim.name}</Text>
                                </View>
                                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }}>
                                    <Text style={{ color: colors.success }} className="font-semibold">+{task.points}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Incomplete Tasks */}
                {incompleteTasks.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>⏳ Carried Over</Text>
                        {incompleteTasks.map(task => {
                            const dim = getDim(task.dimension);
                            return (
                                <View
                                    key={task.id}
                                    className="p-4 rounded-xl mb-2"
                                    style={{
                                        backgroundColor: colors.card,
                                        borderLeftWidth: 4,
                                        borderLeftColor: '#F59E0B',
                                    }}
                                >
                                    <View className="flex-row items-center mb-2">
                                        <View
                                            className="w-8 h-8 rounded-full items-center justify-center mr-3"
                                            style={{ backgroundColor: dim.color + '30' }}
                                        >
                                            <MaterialCommunityIcons name={dim.icon as any} size={16} color={dim.color} />
                                        </View>
                                        <Text className="font-medium flex-1" style={{ color: colors.text }}>{task.title}</Text>
                                        <Text style={{ color: colors.textTertiary }}>{task.points} pts</Text>
                                    </View>
                                    <Text className="text-sm ml-11" style={{ color: '#F59E0B' }}>Reason: {task.reason}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Insights */}
                <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.card }}>
                    <View className="flex-row items-center mb-4">
                        <MaterialCommunityIcons name="chart-line" size={24} color={colors.success} />
                        <Text className="text-lg font-semibold ml-2" style={{ color: colors.text }}>Insights</Text>
                    </View>

                    <View className="flex-row items-start mb-3">
                        <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                        <Text className="ml-3 flex-1" style={{ color: colors.textSecondary }}>
                            Strong performance in Health dimension - keep the momentum!
                        </Text>
                    </View>
                    <View className="flex-row items-start mb-3">
                        <MaterialCommunityIcons name="alert-circle" size={20} color="#F59E0B" />
                        <Text className="ml-3 flex-1" style={{ color: colors.textSecondary }}>
                            Finance dimension needs attention next sprint
                        </Text>
                    </View>
                    <View className="flex-row items-start">
                        <MaterialCommunityIcons name="lightbulb" size={20} color="#3B82F6" />
                        <Text className="ml-3 flex-1" style={{ color: colors.textSecondary }}>
                            Consider reducing planned points by 5 for better completion rate
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mb-6">
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/sprints/retrospective')}
                        className="flex-1 p-4 rounded-xl flex-row items-center justify-center"
                        style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                        <MaterialCommunityIcons name="thought-bubble" size={20} color={colors.text} />
                        <Text className="font-semibold ml-2" style={{ color: colors.text }}>Start Retro</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-1 p-4 rounded-xl"
                        style={{ backgroundColor: colors.success }}
                    >
                        <Text className="text-white text-center font-semibold">Done</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
