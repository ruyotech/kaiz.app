/**
 * Sprint Planning Screen
 *
 * Facilitates sprint planning ceremony with capacity-based task selection,
 * commitment visualization, and balanced dimension distribution.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVelocityMetrics, useStartCeremony } from '../../../hooks/queries';
import { useThemeContext } from '../../../providers/ThemeProvider';

interface PlanningTask {
    id: string;
    title: string;
    points: number;
    dimension: string;
    selected: boolean;
}

const DIMENSION_COLORS: Record<string, string> = {
    career: '#3B82F6',
    health: '#10B981',
    family: '#EC4899',
    finance: '#F59E0B',
    growth: '#8B5CF6',
    social: '#06B6D4',
    spirit: '#6366F1',
    creativity: '#F97316',
    environment: '#14B8A6',
};

export default function SprintPlanningScreen() {
    const { colors, isDark } = useThemeContext();
    const { data: velocityMetrics } = useVelocityMetrics();
    const startCeremonyMutation = useStartCeremony();

    const [step, setStep] = useState<'capacity' | 'select' | 'review' | 'commit'>('capacity');
    const [capacity, setCapacity] = useState(velocityMetrics?.averageCompleted || 40);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [sprintGoal, setSprintGoal] = useState('');
    const [isStarted, setIsStarted] = useState(false);

    // Mock backlog tasks
    const [backlogTasks] = useState<PlanningTask[]>([
        { id: '1', title: 'Complete project proposal', points: 5, dimension: 'career', selected: false },
        { id: '2', title: 'Morning workout routine', points: 3, dimension: 'health', selected: false },
        { id: '3', title: 'Family dinner planning', points: 2, dimension: 'family', selected: false },
        { id: '4', title: 'Review investment portfolio', points: 5, dimension: 'finance', selected: false },
        { id: '5', title: 'Read 3 chapters of book', points: 3, dimension: 'growth', selected: false },
        { id: '6', title: 'Coffee with friend', points: 2, dimension: 'social', selected: false },
        { id: '7', title: 'Meditation practice', points: 2, dimension: 'spirit', selected: false },
        { id: '8', title: 'Creative writing session', points: 3, dimension: 'creativity', selected: false },
        { id: '9', title: 'Declutter home office', points: 4, dimension: 'environment', selected: false },
    ]);

    const selectedPoints = backlogTasks
        .filter(t => selectedTasks.includes(t.id))
        .reduce((sum, t) => sum + t.points, 0);

    const capacityUsed = Math.round((selectedPoints / capacity) * 100);
    const isOvercommitted = capacityUsed > 100;

    const dimensionCounts = selectedTasks.reduce((acc, taskId) => {
        const task = backlogTasks.find(t => t.id === taskId);
        if (task) {
            acc[task.dimension] = (acc[task.dimension] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const handleStartPlanning = async () => {
        await startCeremonyMutation.mutateAsync('planning');
        setIsStarted(true);
    };

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTasks(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const getDimensionColor = (dimension: string) => DIMENSION_COLORS[dimension] || '#6B7280';

    const renderCapacityStep = () => (
        <View className="flex-1 p-4">
            <View className="rounded-2xl p-6 mb-6" style={{ backgroundColor: colors.card }}>
                <Text className="text-xl font-semibold mb-2" style={{ color: colors.text }}>Set Your Sprint Capacity</Text>
                <Text className="mb-6" style={{ color: colors.textSecondary }}>
                    Based on your velocity, I recommend {velocityMetrics?.averageCompleted || 40} points for this sprint.
                </Text>

                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => setCapacity(Math.max(10, capacity - 5))}
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                        <MaterialCommunityIcons name="minus" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-4xl font-bold" style={{ color: colors.text }}>{capacity}</Text>
                        <Text style={{ color: colors.textSecondary }}>points</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setCapacity(capacity + 5)}
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                        <MaterialCommunityIcons name="plus" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {capacity > (velocityMetrics?.averageCompleted || 40) * 1.2 && (
                    <View className="p-3 rounded-lg flex-row items-center" style={{ backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3' }}>
                        <MaterialCommunityIcons name="alert" size={20} color="#EAB308" />
                        <Text className="ml-2 flex-1" style={{ color: isDark ? '#FDE047' : '#A16207' }}>
                            This is 20%+ above your average. Consider realistic commitments.
                        </Text>
                    </View>
                )}
            </View>

            <View className="rounded-2xl p-6" style={{ backgroundColor: colors.card }}>
                <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>Your Velocity History</Text>
                <View className="flex-row justify-between">
                    <View className="items-center">
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>Average</Text>
                        <Text className="text-xl font-bold" style={{ color: colors.text }}>{velocityMetrics?.averageCompleted || 38}</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>Best Sprint</Text>
                        <Text className="text-xl font-bold" style={{ color: colors.success }}>52</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>Last Sprint</Text>
                        <Text className="text-xl font-bold" style={{ color: colors.text }}>{velocityMetrics?.currentSprintCompleted || 35}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => setStep('select')}
                className="mt-6 p-4 rounded-xl"
                style={{ backgroundColor: colors.success }}
            >
                <Text className="text-white text-center font-semibold text-lg">Continue to Task Selection</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSelectStep = () => (
        <View className="flex-1 p-4">
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-semibold" style={{ color: colors.text }}>Capacity: {selectedPoints}/{capacity} points</Text>
                    <Text style={{ color: isOvercommitted ? colors.error : colors.success }}>
                        {capacityUsed}%
                    </Text>
                </View>
                <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <View
                        className="h-full"
                        style={{
                            width: `${Math.min(capacityUsed, 100)}%`,
                            backgroundColor: isOvercommitted ? colors.error : capacityUsed > 85 ? colors.warning : colors.success,
                        }}
                    />
                </View>
            </View>

            <View className="flex-row flex-wrap mb-4">
                {Object.entries(dimensionCounts).map(([dim, count]) => (
                    <View
                        key={dim}
                        className="px-3 py-1 rounded-full mr-2 mb-2"
                        style={{ backgroundColor: getDimensionColor(dim) + '30' }}
                    >
                        <Text style={{ color: getDimensionColor(dim) }}>{dim}: {count}</Text>
                    </View>
                ))}
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <Text className="text-sm mb-3" style={{ color: colors.textSecondary }}>Select tasks for this sprint:</Text>
                {backlogTasks.map(task => (
                    <TouchableOpacity
                        key={task.id}
                        onPress={() => toggleTaskSelection(task.id)}
                        className="p-4 rounded-xl mb-3 flex-row items-center"
                        style={{
                            backgroundColor: colors.card,
                            borderWidth: 2,
                            borderColor: selectedTasks.includes(task.id) ? colors.success : 'transparent',
                        }}
                    >
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: getDimensionColor(task.dimension) + '30' }}
                        >
                            <MaterialCommunityIcons
                                name={selectedTasks.includes(task.id) ? 'check' : 'plus'}
                                size={20}
                                color={selectedTasks.includes(task.id) ? colors.success : getDimensionColor(task.dimension)}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="font-medium" style={{ color: colors.text }}>{task.title}</Text>
                            <Text className="text-sm" style={{ color: colors.textSecondary }}>{task.dimension}</Text>
                        </View>
                        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.backgroundSecondary }}>
                            <Text className="font-semibold" style={{ color: colors.text }}>{task.points}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                    onPress={() => setStep('capacity')}
                    className="flex-1 p-4 rounded-xl"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <Text className="text-center font-semibold" style={{ color: colors.text }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setStep('review')}
                    className="flex-1 p-4 rounded-xl"
                    style={{ backgroundColor: colors.success }}
                    disabled={selectedTasks.length === 0}
                >
                    <Text className="text-white text-center font-semibold">Review Sprint</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderReviewStep = () => (
        <ScrollView className="flex-1 p-4">
            <View className="rounded-2xl p-6 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Sprint Summary</Text>

                <View className="flex-row justify-between mb-4">
                    <View>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>Tasks</Text>
                        <Text className="text-2xl font-bold" style={{ color: colors.text }}>{selectedTasks.length}</Text>
                    </View>
                    <View>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>Points</Text>
                        <Text className="text-2xl font-bold" style={{ color: colors.text }}>{selectedPoints}</Text>
                    </View>
                    <View>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>Capacity</Text>
                        <Text className="text-2xl font-bold" style={{ color: isOvercommitted ? colors.error : colors.success }}>
                            {capacityUsed}%
                        </Text>
                    </View>
                </View>

                {isOvercommitted && (
                    <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2' }}>
                        <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="alert-circle" size={24} color="#EF4444" />
                            <Text className="font-semibold ml-2" style={{ color: '#EF4444' }}>Overcommitment Warning</Text>
                        </View>
                        <Text style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>
                            You've committed to {capacityUsed - 100}% more than your capacity.
                            Consider removing {Math.ceil((selectedPoints - capacity) / 3)} tasks.
                        </Text>
                    </View>
                )}
            </View>

            <View className="rounded-2xl p-6 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>Sprint Goal</Text>
                <TextInput
                    value={sprintGoal}
                    onChangeText={setSprintGoal}
                    placeholder="What's the main focus of this sprint?"
                    placeholderTextColor={colors.placeholder}
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: colors.inputBackground, color: colors.text }}
                    multiline
                />
            </View>

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={() => setStep('select')}
                    className="flex-1 p-4 rounded-xl"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <Text className="text-center font-semibold" style={{ color: colors.text }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setStep('commit')}
                    className="flex-1 p-4 rounded-xl"
                    style={{ backgroundColor: colors.success }}
                >
                    <Text className="text-white text-center font-semibold">Commit Sprint</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderCommitStep = () => (
        <View className="flex-1 p-4 justify-center items-center">
            <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5' }}>
                <MaterialCommunityIcons name="check-circle" size={64} color="#10B981" />
            </View>

            <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>Sprint Committed!</Text>
            <Text className="text-center mb-8" style={{ color: colors.textSecondary }}>
                You've committed to {selectedTasks.length} tasks ({selectedPoints} points) for this sprint.
            </Text>

            {sprintGoal ? (
                <View className="p-4 rounded-xl mb-6 w-full" style={{ backgroundColor: colors.card }}>
                    <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>Sprint Goal</Text>
                    <Text style={{ color: colors.text }}>{sprintGoal}</Text>
                </View>
            ) : null}

            <View className="rounded-2xl p-6 w-full mb-6" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-4" style={{ color: colors.text }}>Tips:</Text>
                <View className="flex-row items-start mb-3">
                    <MaterialCommunityIcons name="lightbulb" size={20} color="#EAB308" />
                    <Text className="ml-3 flex-1" style={{ color: colors.textSecondary }}>
                        Focus on completing your highest priority tasks first
                    </Text>
                </View>
                <View className="flex-row items-start mb-3">
                    <MaterialCommunityIcons name="calendar-check" size={20} color="#10B981" />
                    <Text className="ml-3 flex-1" style={{ color: colors.textSecondary }}>
                        Daily standups start at your preferred time
                    </Text>
                </View>
                <View className="flex-row items-start">
                    <MaterialCommunityIcons name="shield-check" size={20} color="#3B82F6" />
                    <Text className="ml-3 flex-1" style={{ color: colors.textSecondary }}>
                        Track progress and adjust as needed
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => router.back()}
                className="w-full p-4 rounded-xl"
                style={{ backgroundColor: colors.success }}
            >
                <Text className="text-white text-center font-semibold text-lg">Start Sprint</Text>
            </TouchableOpacity>
        </View>
    );

    if (!isStarted) {
        return (
            <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                <View className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold" style={{ color: colors.text }}>Sprint Planning</Text>
                </View>

                <View className="flex-1 justify-center items-center p-6">
                    <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }}>
                        <MaterialCommunityIcons name="calendar-plus" size={48} color="#3B82F6" />
                    </View>

                    <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
                        Ready to Plan Your Sprint?
                    </Text>
                    <Text className="text-center mb-8" style={{ color: colors.textSecondary }}>
                        Let's select tasks for the upcoming sprint based on your capacity and life balance goals.
                    </Text>

                    <View className="rounded-2xl p-6 w-full mb-6" style={{ backgroundColor: colors.card }}>
                        <Text className="font-semibold mb-4" style={{ color: colors.text }}>Planning includes:</Text>
                        {[
                            { icon: 'speedometer', text: 'Capacity setting based on velocity' },
                            { icon: 'checkbox-marked', text: 'Task selection from backlog' },
                            { icon: 'chart-donut', text: 'Life dimension balance check' },
                            { icon: 'flag-checkered', text: 'Sprint goal definition' },
                        ].map((item, idx) => (
                            <View key={idx} className="flex-row items-center mb-3">
                                <MaterialCommunityIcons name={item.icon as any} size={20} color={colors.success} />
                                <Text className="ml-3" style={{ color: colors.textSecondary }}>{item.text}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleStartPlanning}
                        className="w-full p-4 rounded-xl"
                        style={{ backgroundColor: colors.success }}
                    >
                        <Text className="text-white text-center font-semibold text-lg">Start Planning</Text>
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
                <Text className="text-xl font-semibold flex-1" style={{ color: colors.text }}>Sprint Planning</Text>

                <View className="flex-row">
                    {['capacity', 'select', 'review', 'commit'].map((s, idx) => (
                        <View
                            key={s}
                            className="w-2 h-2 rounded-full mx-1"
                            style={{
                                backgroundColor: ['capacity', 'select', 'review', 'commit'].indexOf(step) >= idx
                                    ? colors.success
                                    : colors.backgroundSecondary,
                            }}
                        />
                    ))}
                </View>
            </View>

            {step === 'capacity' && renderCapacityStep()}
            {step === 'select' && renderSelectStep()}
            {step === 'review' && renderReviewStep()}
            {step === 'commit' && renderCommitStep()}
        </SafeAreaView>
    );
}
