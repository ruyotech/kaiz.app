/**
 * Daily Standup Screen
 *
 * Daily standup ceremony for checking in on progress,
 * identifying blockers, and setting focus for the day.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTodayStandup, useCompleteStandup, useCurrentSprintHealth } from '../../../hooks/queries';
import { SprintHealthCard } from '../../../components/sprints/SprintHealthCard';
import { StandupTask, StandupBlocker } from '../../../types/sensai.types';
import { useThemeContext } from '../../../providers/ThemeProvider';

type StandupStep = 'yesterday' | 'today' | 'blockers' | 'summary';

export default function StandupScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const { data: standupResponse } = useTodayStandup();
    const { data: currentSprintHealth } = useCurrentSprintHealth();
    const completeStandupMutation = useCompleteStandup();

    const todayStandup = standupResponse?.standup;
    const hasCompletedToday = standupResponse?.hasCompletedToday ?? false;

    const [step, setStep] = useState<StandupStep>('yesterday');
    const [blockerInput, setBlockerInput] = useState('');
    const [blockers, setBlockers] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'struggling' | null>(null);

    const completedYesterday = todayStandup?.completedYesterday || [];
    const focusToday = todayStandup?.focusToday || [];
    const existingBlockers = todayStandup?.blockers || [];

    const handleAddBlocker = () => {
        if (blockerInput.trim()) {
            setBlockers([...blockers, blockerInput.trim()]);
            setBlockerInput('');
        }
    };

    const handleRemoveBlocker = (index: number) => {
        setBlockers(blockers.filter((_, i) => i !== index));
    };

    const handleComplete = async () => {
        await completeStandupMutation.mutateAsync({
            blockers,
            notes,
            mood: mood || undefined,
        } as any);
        router.back();
    };

    const renderStepIndicator = () => (
        <View className="flex-row items-center justify-center py-4">
            {['yesterday', 'today', 'blockers', 'summary'].map((s, i) => (
                <View key={s} className="flex-row items-center">
                    <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{
                            backgroundColor: step === s ? colors.primary :
                                ['yesterday', 'today', 'blockers', 'summary'].indexOf(step) > i ? colors.success : colors.backgroundSecondary,
                        }}
                    >
                        {['yesterday', 'today', 'blockers', 'summary'].indexOf(step) > i ? (
                            <MaterialCommunityIcons name="check" size={18} color="white" />
                        ) : (
                            <Text style={{ color: step === s ? '#FFFFFF' : colors.textSecondary, fontWeight: step === s ? 'bold' : 'normal' }}>{i + 1}</Text>
                        )}
                    </View>
                    {i < 3 && <View className="w-8 h-0.5" style={{ backgroundColor: colors.backgroundSecondary }} />}
                </View>
            ))}
        </View>
    );

    const renderYesterdayStep = () => (
        <View className="flex-1">
            <View className="px-4 mb-4">
                <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>What shipped yesterday?</Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>Review your completed tasks</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                {completedYesterday.length > 0 ? (
                    completedYesterday.map((task: StandupTask) => (
                        <View
                            key={task.taskId}
                            className="rounded-xl p-4 mb-3"
                            style={{
                                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                                borderWidth: 1,
                                borderColor: isDark ? '#10B981' : '#A7F3D0',
                            }}
                        >
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                                <View className="flex-1 ml-3">
                                    <Text className="text-base font-medium" style={{ color: colors.text }}>{task.title}</Text>
                                    <Text className="text-sm" style={{ color: colors.textSecondary }}>{task.points} points</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="rounded-xl p-6 items-center" style={{ backgroundColor: colors.backgroundSecondary }}>
                        <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={40} color={colors.textTertiary} />
                        <Text className="mt-2" style={{ color: colors.textSecondary }}>No tasks completed yesterday</Text>
                        <Text className="text-sm mt-1" style={{ color: colors.textTertiary }}>That's okay, let's focus on today</Text>
                    </View>
                )}
            </ScrollView>

            <View className="px-4 pb-4">
                <TouchableOpacity
                    onPress={() => setStep('today')}
                    className="py-4 rounded-xl items-center"
                    style={{ backgroundColor: colors.primary }}
                >
                    <Text className="text-white font-bold text-base">Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTodayStep = () => (
        <View className="flex-1">
            <View className="px-4 mb-4">
                <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>What's the focus today?</Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>Your top priorities for the day</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                {focusToday.length > 0 ? (
                    focusToday.map((task: StandupTask, index: number) => (
                        <View
                            key={task.taskId}
                            className="rounded-xl p-4 mb-3"
                            style={{
                                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                                borderWidth: 1,
                                borderColor: isDark ? '#3B82F6' : '#BFDBFE',
                            }}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                                    <Text className="text-white font-bold">{index + 1}</Text>
                                </View>
                                <View className="flex-1 ml-3">
                                    <Text className="text-base font-medium" style={{ color: colors.text }}>{task.title}</Text>
                                    <Text className="text-sm" style={{ color: colors.textSecondary }}>{task.points} points</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View
                        className="rounded-xl p-6 items-center"
                        style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB' }}
                    >
                        <MaterialCommunityIcons name="calendar-alert" size={40} color="#F59E0B" />
                        <Text className="mt-2" style={{ color: isDark ? '#FCD34D' : '#B45309' }}>No tasks planned for today</Text>
                        <Text className="text-sm mt-1" style={{ color: isDark ? '#FBBF24' : '#D97706' }}>Consider adding tasks to your sprint</Text>
                    </View>
                )}
            </ScrollView>

            <View className="px-4 pb-4 flex-row">
                <TouchableOpacity
                    onPress={() => setStep('yesterday')}
                    className="flex-1 py-4 rounded-xl items-center mr-2"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <Text className="font-medium" style={{ color: colors.text }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setStep('blockers')}
                    className="flex-2 py-4 rounded-xl items-center ml-2 flex-1"
                    style={{ backgroundColor: colors.primary }}
                >
                    <Text className="text-white font-bold">Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderBlockersStep = () => (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View className="px-4 mb-4">
                <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>Any blockers?</Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>What's slowing you down or stopping progress?</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                {existingBlockers.filter((b: StandupBlocker) => !b.convertedToTask).map((blocker: StandupBlocker) => (
                    <View
                        key={blocker.id}
                        className="rounded-xl p-4 mb-3"
                        style={{
                            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                            borderWidth: 1,
                            borderColor: isDark ? '#EF4444' : '#FECACA',
                        }}
                    >
                        <View className="flex-row items-start">
                            <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
                            <View className="flex-1 ml-3">
                                <Text className="text-sm" style={{ color: colors.text }}>{blocker.description}</Text>
                            </View>
                        </View>
                    </View>
                ))}

                {blockers.map((blocker, index) => (
                    <View
                        key={index}
                        className="rounded-xl p-4 mb-3"
                        style={{
                            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
                            borderWidth: 1,
                            borderColor: isDark ? '#F59E0B' : '#FDE68A',
                        }}
                    >
                        <View className="flex-row items-start">
                            <MaterialCommunityIcons name="alert" size={20} color="#F59E0B" />
                            <Text className="flex-1 ml-3 text-sm" style={{ color: colors.text }}>{blocker}</Text>
                            <TouchableOpacity onPress={() => handleRemoveBlocker(index)}>
                                <MaterialCommunityIcons name="close-circle" size={20} color={colors.textTertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View className="flex-row items-center mb-4">
                    <TextInput
                        value={blockerInput}
                        onChangeText={setBlockerInput}
                        placeholder="Describe a blocker..."
                        placeholderTextColor={colors.placeholder}
                        className="flex-1 rounded-xl px-4 py-3 text-base"
                        style={{
                            backgroundColor: colors.inputBackground,
                            borderWidth: 1,
                            borderColor: colors.border,
                            color: colors.text,
                        }}
                        multiline
                        onSubmitEditing={handleAddBlocker}
                    />
                    <TouchableOpacity
                        onPress={handleAddBlocker}
                        className="ml-2 w-12 h-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                        disabled={!blockerInput.trim()}
                    >
                        <MaterialCommunityIcons name="plus" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {blockers.length === 0 && existingBlockers.length === 0 && (
                    <View
                        className="rounded-xl p-4 items-center"
                        style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }}
                    >
                        <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" />
                        <Text className="mt-2" style={{ color: isDark ? '#6EE7B7' : '#047857' }}>No blockers - clear path ahead!</Text>
                    </View>
                )}
            </ScrollView>

            <View className="px-4 pb-4 flex-row">
                <TouchableOpacity
                    onPress={() => setStep('today')}
                    className="flex-1 py-4 rounded-xl items-center mr-2"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <Text className="font-medium" style={{ color: colors.text }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setStep('summary')}
                    className="flex-2 py-4 rounded-xl items-center ml-2 flex-1"
                    style={{ backgroundColor: colors.primary }}
                >
                    <Text className="text-white font-bold">Continue</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );

    const renderSummaryStep = () => (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View className="px-4 mb-4">
                <Text className="text-xl font-bold mb-2" style={{ color: colors.text }}>How are you feeling?</Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>Quick check-in before we wrap up</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                <View className="flex-row justify-between mb-6">
                    {[
                        { value: 'great', emoji: 'rocket-launch-outline', label: 'Great' },
                        { value: 'good', emoji: 'emoticon-happy-outline', label: 'Good' },
                        { value: 'okay', emoji: 'emoticon-neutral-outline', label: 'Okay' },
                        { value: 'struggling', emoji: 'emoticon-sad-outline', label: 'Struggling' },
                    ].map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => setMood(option.value as any)}
                            className="flex-1 mx-1 py-4 rounded-xl items-center"
                            style={{
                                backgroundColor: mood === option.value
                                    ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE')
                                    : colors.backgroundSecondary,
                                borderWidth: mood === option.value ? 2 : 1,
                                borderColor: mood === option.value ? colors.primary : colors.border,
                            }}
                        >
                            <Text className="text-2xl mb-1">{option.emoji}</Text>
                            <Text
                                className="text-xs"
                                style={{
                                    color: mood === option.value ? colors.primary : colors.textSecondary,
                                    fontWeight: mood === option.value ? '600' : '400',
                                }}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>Any notes? (Optional)</Text>
                <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Quick thoughts for the day..."
                    placeholderTextColor={colors.placeholder}
                    className="rounded-xl px-4 py-3 text-base mb-6"
                    style={{
                        backgroundColor: colors.inputBackground,
                        borderWidth: 1,
                        borderColor: colors.border,
                        color: colors.text,
                    }}
                    multiline
                    numberOfLines={3}
                />

                <View className="rounded-xl p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Standup Summary</Text>
                    <View className="flex-row justify-between">
                        <View className="items-center">
                            <Text className="text-2xl font-bold" style={{ color: colors.success }}>{completedYesterday.length}</Text>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>Completed</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold" style={{ color: colors.primary }}>{focusToday.length}</Text>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>Today's Focus</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold" style={{ color: colors.warning }}>{blockers.length + existingBlockers.length}</Text>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>Blockers</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View className="px-4 pb-4 flex-row">
                <TouchableOpacity
                    onPress={() => setStep('blockers')}
                    className="flex-1 py-4 rounded-xl items-center mr-2"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <Text className="font-medium" style={{ color: colors.text }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleComplete}
                    disabled={completeStandupMutation.isPending}
                    className="flex-2 py-4 rounded-xl items-center ml-2 flex-1 flex-row justify-center"
                    style={{ backgroundColor: colors.success }}
                >
                    {completeStandupMutation.isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="check" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Complete</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );

    // If standup is already completed
    if (hasCompletedToday) {
        return (
            <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
                <View
                    className="flex-row items-center px-4 py-3"
                    style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold ml-4" style={{ color: colors.text }}>Today's Standup</Text>
                </View>

                <ScrollView className="flex-1 px-4 pt-4">
                    <View
                        className="rounded-2xl p-6 items-center mb-6"
                        style={{
                            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                            borderWidth: 1,
                            borderColor: isDark ? '#10B981' : '#A7F3D0',
                        }}
                    >
                        <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.success }}>
                            <MaterialCommunityIcons name="check" size={36} color="white" />
                        </View>
                        <Text className="text-xl font-bold" style={{ color: isDark ? '#6EE7B7' : '#065F46' }}>Standup Complete!</Text>
                        <Text className="text-sm mt-1" style={{ color: isDark ? '#34D399' : '#047857' }}>
                            Completed at {new Date(todayStandup?.completedAt || '').toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>

                    {currentSprintHealth && (
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>Sprint Health</Text>
                            <SprintHealthCard health={currentSprintHealth} />
                        </View>
                    )}

                    {/* Motivational message replacing CoachMessage */}
                    <View
                        className="rounded-2xl p-4 mb-6"
                        style={{
                            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#BBF7D0',
                        }}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="star-circle" size={24} color={colors.success} />
                            <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>Stay focused!</Text>
                        </View>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            You have {todayStandup?.focusToday?.length || 0} tasks to tackle today. Make progress, not perfection.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
            <View
                className="flex-row items-center px-4 py-3"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-lg font-bold ml-4" style={{ color: colors.text }}>Daily Standup</Text>
            </View>

            {renderStepIndicator()}

            {step === 'yesterday' && renderYesterdayStep()}
            {step === 'today' && renderTodayStep()}
            {step === 'blockers' && renderBlockersStep()}
            {step === 'summary' && renderSummaryStep()}
        </SafeAreaView>
    );
}
