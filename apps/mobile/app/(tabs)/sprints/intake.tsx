/**
 * Quick Intake Screen
 *
 * Universal intake system for capturing tasks, ideas, and items
 * with AI-powered categorization and prioritization.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useProcessIntake } from '../../../hooks/queries';
import { IntakeResult } from '../../../types/sensai.types';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { logger } from '../../../utils/logger';

type IntakeType = 'task' | 'idea' | 'commitment' | 'goal';

const DIMENSION_META: Record<string, { color: string; name: string }> = {
    'lw-1': { color: '#EF4444', name: 'Health' },
    'lw-2': { color: '#3B82F6', name: 'Career' },
    'lw-3': { color: '#EC4899', name: 'Family' },
    'lw-4': { color: '#F59E0B', name: 'Finance' },
    'lw-5': { color: '#8B5CF6', name: 'Growth' },
    career: { color: '#3B82F6', name: 'Career' },
    health: { color: '#10B981', name: 'Health' },
    family: { color: '#EC4899', name: 'Family' },
    finance: { color: '#F59E0B', name: 'Finance' },
    growth: { color: '#8B5CF6', name: 'Growth' },
};

export default function IntakeScreen() {
    const { colors, isDark } = useThemeContext();
    const processIntakeMutation = useProcessIntake();

    const [input, setInput] = useState('');
    const [type, setType] = useState<IntakeType>('task');
    const [result, setResult] = useState<IntakeResult | null>(null);
    const [recentIntakes, setRecentIntakes] = useState<Array<{ text: string; result: IntakeResult }>>([]);

    const typeConfig: Record<IntakeType, { icon: string; color: string; label: string; placeholder: string }> = {
        task: { icon: 'checkbox-marked-circle-outline', color: '#3B82F6', label: 'Task', placeholder: 'What needs to get done?' },
        idea: { icon: 'lightbulb-outline', color: '#F59E0B', label: 'Idea', placeholder: "What's on your mind?" },
        commitment: { icon: 'handshake', color: '#EC4899', label: 'Commitment', placeholder: 'What did you commit to?' },
        goal: { icon: 'flag-checkered', color: '#10B981', label: 'Goal', placeholder: 'What do you want to achieve?' },
    };

    const handleSubmit = async () => {
        if (!input.trim()) return;
        try {
            const intakeResult = await processIntakeMutation.mutateAsync({
                type: 'text',
                content: `[${type}] ${input}`,
            });
            setResult(intakeResult as IntakeResult);
            setRecentIntakes([{ text: input, result: intakeResult as IntakeResult }, ...recentIntakes.slice(0, 4)]);
            setInput('');
        } catch (error: unknown) {
            logger.error('IntakeScreen', 'Intake processing failed', error);
        }
    };

    const getDimColor = (dimension: string) => DIMENSION_META[dimension]?.color || '#6B7280';
    const getDimName = (dimension: string) => DIMENSION_META[dimension]?.name || dimension;

    const renderResult = () => {
        if (!result || !result.parsedTask) return null;
        const parsedTask = result.parsedTask;
        const dimension = result.suggestedDimension || 'lw-2';

        return (
            <View className="rounded-2xl p-6 mb-4" style={{ backgroundColor: colors.card }}>
                <View className="flex-row items-center mb-4">
                    <MaterialCommunityIcons name="chart-line" size={24} color={colors.success} />
                    <Text className="text-lg font-semibold ml-2" style={{ color: colors.text }}>Analysis</Text>
                </View>

                <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <Text className="font-medium mb-2" style={{ color: colors.text }}>{parsedTask.title}</Text>
                    {parsedTask.description && (
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>{parsedTask.description}</Text>
                    )}
                </View>

                <View className="flex-row flex-wrap mb-4">
                    <View className="px-3 py-2 rounded-full mr-2 mb-2" style={{ backgroundColor: getDimColor(dimension) + '30' }}>
                        <Text style={{ color: getDimColor(dimension) }}>{getDimName(dimension)}</Text>
                    </View>
                    <View className="px-3 py-2 rounded-full mr-2 mb-2" style={{ backgroundColor: colors.backgroundSecondary }}>
                        <Text style={{ color: colors.text }}>{parsedTask.estimatedPoints} points</Text>
                    </View>
                    {parsedTask.priority && (
                        <View className="px-3 py-2 rounded-full mb-2" style={{
                            backgroundColor: parsedTask.priority === 'high' ? (isDark ? 'rgba(239,68,68,0.3)' : '#FEF2F2') :
                                parsedTask.priority === 'medium' ? (isDark ? 'rgba(245,158,11,0.3)' : '#FFFBEB') : colors.backgroundSecondary,
                        }}>
                            <Text style={{
                                color: parsedTask.priority === 'high' ? '#EF4444' :
                                    parsedTask.priority === 'medium' ? '#F59E0B' : colors.textSecondary,
                            }}>
                                {parsedTask.priority} priority
                            </Text>
                        </View>
                    )}
                </View>

                {result.suggestedSchedule && (
                    <View className="p-4 rounded-xl mb-4" style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : '#EFF6FF' }}>
                        <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="calendar-clock" size={20} color="#3B82F6" />
                            <Text className="font-semibold ml-2" style={{ color: '#3B82F6' }}>Suggested Schedule</Text>
                        </View>
                        <Text style={{ color: colors.textSecondary }}>
                            {result.suggestedSchedule.optimalTime || 'This week'}
                            {result.suggestedSchedule.reasoning && ` - ${result.suggestedSchedule.reasoning}`}
                        </Text>
                    </View>
                )}

                {result.coachMessage && (
                    <View className="p-4 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5' }}>
                        <Text style={{ color: colors.success }}>{result.coachMessage}</Text>
                    </View>
                )}

                <View className="flex-row gap-3 mt-4">
                    <TouchableOpacity
                        onPress={() => setResult(null)}
                        className="flex-1 p-3 rounded-xl"
                        style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                        <Text className="text-center font-semibold" style={{ color: colors.text }}>Adjust</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setResult(null)}
                        className="flex-1 p-3 rounded-xl"
                        style={{ backgroundColor: colors.success }}
                    >
                        <Text className="text-white text-center font-semibold">Add to Backlog</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-xl font-semibold" style={{ color: colors.text }}>Quick Intake</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Type Selector */}
                <View className="flex-row mb-4">
                    {(Object.keys(typeConfig) as IntakeType[]).map(t => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setType(t)}
                            className="flex-1 p-3 rounded-xl mr-2 items-center"
                            style={{
                                backgroundColor: type === t ? colors.card : colors.backgroundSecondary,
                                borderWidth: type === t ? 2 : 0,
                                borderColor: type === t ? typeConfig[t].color : 'transparent',
                            }}
                        >
                            <MaterialCommunityIcons
                                name={typeConfig[t].icon as any}
                                size={24}
                                color={type === t ? typeConfig[t].color : colors.textTertiary}
                            />
                            <Text className="text-xs mt-1" style={{ color: type === t ? colors.text : colors.textTertiary }}>
                                {typeConfig[t].label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Input Area */}
                <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder={typeConfig[type].placeholder}
                        placeholderTextColor={colors.placeholder}
                        className="text-lg mb-4"
                        style={{ color: colors.text, minHeight: 100 }}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!input.trim() || processIntakeMutation.isPending}
                        className="p-4 rounded-xl flex-row items-center justify-center"
                        style={{
                            backgroundColor: input.trim() && !processIntakeMutation.isPending ? colors.success : colors.backgroundSecondary,
                        }}
                    >
                        {processIntakeMutation.isPending ? (
                            <>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text className="text-white font-semibold ml-2">Processing...</Text>
                            </>
                        ) : (
                            <>
                                <MaterialCommunityIcons name="brain" size={20} color="#fff" />
                                <Text className="text-white font-semibold ml-2">Process with AI</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Quick Tips */}
                {!result && (
                    <View className="rounded-2xl p-6 mb-4" style={{ backgroundColor: colors.card }}>
                        <View className="flex-row items-center mb-4">
                            <MaterialCommunityIcons name="lightbulb" size={20} color="#F59E0B" />
                            <Text className="font-semibold ml-2" style={{ color: colors.text }}>Tips for Better Intake</Text>
                        </View>
                        <Text className="mb-2" style={{ color: colors.textSecondary }}>
                            • Include context: "Review budget <Text style={{ color: colors.primary }}>with Sarah</Text>"
                        </Text>
                        <Text className="mb-2" style={{ color: colors.textSecondary }}>
                            • Add timing: "Call mom <Text style={{ color: colors.primary }}>this weekend</Text>"
                        </Text>
                        <Text className="mb-2" style={{ color: colors.textSecondary }}>
                            • Mention effort: "Write report - <Text style={{ color: colors.primary }}>about 2 hours</Text>"
                        </Text>
                        <Text style={{ color: colors.textSecondary }}>
                            • Set importance: "<Text style={{ color: colors.primary }}>Urgent:</Text> Submit application"
                        </Text>
                    </View>
                )}

                {renderResult()}

                {/* Recent Intakes */}
                {recentIntakes.length > 0 && !result && (
                    <View className="mb-4">
                        <Text className="text-sm mb-3" style={{ color: colors.textSecondary }}>Recent Intakes</Text>
                        {recentIntakes.map((intake, idx) => {
                            const dim = intake.result.suggestedDimension || 'lw-2';
                            const intakeTask = intake.result.parsedTask;
                            if (!intakeTask) return null;
                            return (
                                <View key={idx} className="p-4 rounded-xl mb-2 flex-row items-center" style={{ backgroundColor: colors.card }}>
                                    <View
                                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: getDimColor(dim) + '30' }}
                                    >
                                        <MaterialCommunityIcons name="check" size={16} color={getDimColor(dim)} />
                                    </View>
                                    <View className="flex-1">
                                        <Text style={{ color: colors.text }} numberOfLines={1}>{intakeTask.title}</Text>
                                        <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                            {getDimName(dim)} • {intakeTask.estimatedPoints} pts
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Voice Input Hint */}
                <View className="rounded-2xl p-4 items-center" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <MaterialCommunityIcons name="microphone" size={32} color={colors.textTertiary} />
                    <Text className="text-sm mt-2" style={{ color: colors.textTertiary }}>Voice input coming soon</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
