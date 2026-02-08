/**
 * Sprint Preferences Screen
 *
 * Configuration for sprint ceremonies, velocity display,
 * daily standup schedule, and weekly ceremony times.
 * Sprint length is always 1 week (not configurable).
 */

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSprintPreferences, useUpdateSprintPreferences } from '../../../hooks/queries';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { logger } from '../../../utils/logger';

type VelocityDisplay = 'average' | 'last_sprint';

const TIME_OPTIONS = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '14:00', '16:00', '18:00', '19:00', '20:00',
];

const PLANNING_TIME_OPTIONS = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '16:00', '18:00',
];

const RETRO_TIME_OPTIONS = [
    '09:00', '10:00', '11:00', '14:00', '16:00', '18:00', '19:00',
];

export default function PreferencesScreen() {
    const { colors, isDark } = useThemeContext();
    const { data: settings } = useSprintPreferences();
    const updateMutation = useUpdateSprintPreferences();

    // Velocity display preference
    const [velocityDisplay, setVelocityDisplay] = useState<VelocityDisplay>(
        (settings as any)?.velocityDisplay || 'average'
    );

    // Daily Standup / Yoga (DSY) schedule
    const [dsyTime, setDsyTime] = useState(settings?.dailyStandupTime || '09:00');
    const [dsyWeekends, setDsyWeekends] = useState((settings as any)?.dsyWeekends ?? false);

    // Sprint Planning — always Sundays
    const [planningTime, setPlanningTime] = useState((settings as any)?.planningTime || '10:00');

    // Retrospective — always Saturdays
    const [retroTime, setRetroTime] = useState((settings as any)?.retroTime || '16:00');

    // Max daily capacity
    const [maxDailyCapacity, setMaxDailyCapacity] = useState(settings?.maxDailyCapacity || 8);

    const [showDsyPicker, setShowDsyPicker] = useState(false);
    const [showPlanningPicker, setShowPlanningPicker] = useState(false);
    const [showRetroPicker, setShowRetroPicker] = useState(false);

    const handleSave = useCallback(async () => {
        try {
            await updateMutation.mutateAsync({
                dailyStandupTime: dsyTime,
                dsyWeekends,
                velocityDisplay,
                planningTime,
                retroTime,
                maxDailyCapacity,
                sprintLengthDays: 7, // always 1 week
            } as any);
            Alert.alert('Saved', 'Sprint preferences updated successfully.');
            router.back();
        } catch (error: unknown) {
            logger.error('PreferencesScreen', 'Failed to save preferences', error);
            Alert.alert('Error', 'Failed to save preferences. Please try again.');
        }
    }, [dsyTime, dsyWeekends, velocityDisplay, planningTime, retroTime, maxDailyCapacity, updateMutation]);

    const renderSection = (title: string, subtitle: string | null, children: React.ReactNode) => (
        <View className="mb-6">
            <Text className="text-sm uppercase tracking-wide mb-1 px-1" style={{ color: colors.textTertiary }}>
                {title}
            </Text>
            {subtitle && (
                <Text className="text-xs mb-3 px-1" style={{ color: colors.textSecondary }}>{subtitle}</Text>
            )}
            <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.card }}>
                {children}
            </View>
        </View>
    );

    const renderTimePicker = (
        options: string[],
        selected: string,
        onSelect: (time: string) => void,
        onClose: () => void
    ) => (
        <View className="p-4">
            <View className="flex-row flex-wrap">
                {options.map(time => (
                    <TouchableOpacity
                        key={time}
                        onPress={() => {
                            onSelect(time);
                            onClose();
                        }}
                        className="px-4 py-2 rounded-xl mr-2 mb-2"
                        style={{
                            backgroundColor: selected === time ? colors.primary : colors.backgroundSecondary,
                        }}
                    >
                        <Text style={{ color: selected === time ? '#fff' : colors.text, fontWeight: selected === time ? '600' : '400' }}>
                            {time}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View
                className="flex-row items-center justify-between p-4"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold" style={{ color: colors.text }}>Sprint Preferences</Text>
                </View>
                <TouchableOpacity onPress={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Text className="font-semibold" style={{ color: colors.primary }}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Sprint Length (always 1 week — informational) */}
                <View className="rounded-2xl p-4 mb-6 flex-row items-center" style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : '#EFF6FF' }}>
                    <MaterialCommunityIcons name="calendar-week" size={24} color="#3B82F6" />
                    <View className="ml-3 flex-1">
                        <Text className="font-semibold" style={{ color: '#3B82F6' }}>1-Week Sprints</Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            Sprints run Monday → Sunday. Planning on Sundays, retrospective on Saturdays.
                        </Text>
                    </View>
                </View>

                {/* Velocity Display */}
                {renderSection('Velocity Display', 'How velocity is shown on your dashboard', (
                    <View className="p-4">
                        {([
                            { id: 'average' as VelocityDisplay, label: 'Rolling Average', description: 'Average of last 4 sprints', icon: 'chart-line-variant' },
                            { id: 'last_sprint' as VelocityDisplay, label: 'Last Sprint', description: 'Points from your most recent sprint', icon: 'history' },
                        ]).map(option => (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => setVelocityDisplay(option.id)}
                                className="flex-row items-center p-3 rounded-xl mb-2"
                                style={{
                                    backgroundColor: velocityDisplay === option.id
                                        ? isDark ? 'rgba(16,185,129,0.2)' : '#ECFDF5'
                                        : colors.backgroundSecondary,
                                    borderWidth: velocityDisplay === option.id ? 1 : 0,
                                    borderColor: velocityDisplay === option.id ? colors.success : 'transparent',
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={option.icon as any}
                                    size={24}
                                    color={velocityDisplay === option.id ? colors.success : colors.textTertiary}
                                />
                                <View className="ml-3 flex-1">
                                    <Text className="font-medium" style={{ color: velocityDisplay === option.id ? colors.success : colors.text }}>
                                        {option.label}
                                    </Text>
                                    <Text className="text-sm" style={{ color: colors.textSecondary }}>{option.description}</Text>
                                </View>
                                {velocityDisplay === option.id && (
                                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                {/* Daily Standup / Yoga (DSY) */}
                {renderSection('Daily Standup', 'Your morning check-in ritual', (
                    <>
                        {/* Time Picker */}
                        <TouchableOpacity
                            onPress={() => setShowDsyPicker(!showDsyPicker)}
                            className="flex-row items-center p-4"
                            style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                        >
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <MaterialCommunityIcons name="coffee" size={20} color={colors.success} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium" style={{ color: colors.text }}>Standup Time</Text>
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>When to prompt for daily check-in</Text>
                            </View>
                            <View className="px-3 py-2 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <Text style={{ color: colors.text }}>{dsyTime}</Text>
                            </View>
                        </TouchableOpacity>
                        {showDsyPicker && renderTimePicker(TIME_OPTIONS, dsyTime, setDsyTime, () => setShowDsyPicker(false))}

                        {/* Weekends Toggle */}
                        <View
                            className="flex-row items-center p-4"
                            style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                        >
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <MaterialCommunityIcons name="calendar-weekend" size={20} color={colors.success} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium" style={{ color: colors.text }}>Include Weekends</Text>
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>Prompt for standup on Sat & Sun</Text>
                            </View>
                            <Switch
                                value={dsyWeekends}
                                onValueChange={setDsyWeekends}
                                trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: colors.success + '50' }}
                                thumbColor={dsyWeekends ? colors.success : isDark ? '#6B7280' : '#9CA3AF'}
                            />
                        </View>

                        {/* Daily Capacity */}
                        <View className="flex-row items-center p-4">
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <MaterialCommunityIcons name="battery-charging" size={20} color={colors.success} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium" style={{ color: colors.text }}>Max Daily Points</Text>
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>Daily capacity before warning</Text>
                            </View>
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => setMaxDailyCapacity(Math.max(4, maxDailyCapacity - 1))}
                                    className="w-8 h-8 rounded-full items-center justify-center"
                                    style={{ backgroundColor: colors.backgroundSecondary }}
                                >
                                    <MaterialCommunityIcons name="minus" size={16} color={colors.text} />
                                </TouchableOpacity>
                                <Text className="mx-3 w-8 text-center font-semibold" style={{ color: colors.text }}>
                                    {maxDailyCapacity}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setMaxDailyCapacity(Math.min(16, maxDailyCapacity + 1))}
                                    className="w-8 h-8 rounded-full items-center justify-center"
                                    style={{ backgroundColor: colors.backgroundSecondary }}
                                >
                                    <MaterialCommunityIcons name="plus" size={16} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                ))}

                {/* Sprint Planning — Sundays */}
                {renderSection('Sprint Planning', 'Plan your week ahead every Sunday', (
                    <>
                        <TouchableOpacity
                            onPress={() => setShowPlanningPicker(!showPlanningPicker)}
                            className="flex-row items-center p-4"
                        >
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <MaterialCommunityIcons name="clipboard-text-play" size={20} color="#3B82F6" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium" style={{ color: colors.text }}>Planning Time</Text>
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>Every Sunday</Text>
                            </View>
                            <View className="px-3 py-2 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <Text style={{ color: colors.text }}>{planningTime}</Text>
                            </View>
                        </TouchableOpacity>
                        {showPlanningPicker && renderTimePicker(PLANNING_TIME_OPTIONS, planningTime, setPlanningTime, () => setShowPlanningPicker(false))}
                    </>
                ))}

                {/* Retrospective — Saturdays */}
                {renderSection('Retrospective', 'Reflect on your week every Saturday', (
                    <>
                        <TouchableOpacity
                            onPress={() => setShowRetroPicker(!showRetroPicker)}
                            className="flex-row items-center p-4"
                        >
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <MaterialCommunityIcons name="comment-text-outline" size={20} color="#A855F7" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium" style={{ color: colors.text }}>Retrospective Time</Text>
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>Every Saturday</Text>
                            </View>
                            <View className="px-3 py-2 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <Text style={{ color: colors.text }}>{retroTime}</Text>
                            </View>
                        </TouchableOpacity>
                        {showRetroPicker && renderTimePicker(RETRO_TIME_OPTIONS, retroTime, setRetroTime, () => setShowRetroPicker(false))}
                    </>
                ))}

                {/* Data & Privacy */}
                {renderSection('Data & Privacy', null, (
                    <>
                        <TouchableOpacity className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <MaterialCommunityIcons name="download" size={20} color={colors.success} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium" style={{ color: colors.text }}>Export Data</Text>
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>Download your sprint analytics</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <MaterialCommunityIcons name="delete" size={20} color="#EF4444" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium" style={{ color: colors.text }}>Clear History</Text>
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>Remove all standup and ceremony history</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#EF4444" />
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center p-4">
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <MaterialCommunityIcons name="shield-check" size={20} color={colors.success} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-medium" style={{ color: colors.text }}>Privacy Policy</Text>
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>How we use your data</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </>
                ))}

                {/* Version */}
                <View className="items-center py-6">
                    <MaterialCommunityIcons name="cog" size={32} color={colors.textTertiary} />
                    <Text className="text-sm mt-2" style={{ color: colors.textTertiary }}>Sprint Preferences v1.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
