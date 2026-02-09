/**
 * CeremonyCard Component
 * 
 * Displays upcoming sprint ceremonies and quick actions.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SprintCeremony, SprintCeremonyType } from '../../types/sensai.types';
import { toLocaleDateStringLocalized } from '../../utils/localizedDate';
import { useThemeContext } from '../../providers/ThemeProvider';

interface CeremonyCardProps {
    ceremony?: SprintCeremony;
    type: SprintCeremonyType;
    onStart: () => void;
    isAvailable: boolean;
}

const CEREMONY_CONFIG: Record<SprintCeremonyType, {
    title: string;
    description: string;
    icon: string;
    color: string;
}> = {
    planning: {
        title: 'Sprint Planning',
        description: 'Select and commit to tasks for the upcoming sprint',
        icon: 'clipboard-list-outline',
        color: '#3B82F6',
    },
    standup: {
        title: 'Daily Standup',
        description: 'Quick sync on progress and blockers',
        icon: 'account-voice',
        color: '#10B981',
    },
    midcheck: {
        title: 'Mid-Sprint Check',
        description: 'Review progress and adjust if needed',
        icon: 'chart-timeline-variant',
        color: '#F59E0B',
    },
    review: {
        title: 'Sprint Review',
        description: 'Celebrate wins and analyze completion',
        icon: 'trophy-outline',
        color: '#8B5CF6',
    },
    retrospective: {
        title: 'Retrospective',
        description: 'What worked, what didn\'t, and key learnings',
        icon: 'comment-multiple-outline',
        color: '#EC4899',
    },
};

export function CeremonyCard({ ceremony, type, onStart, isAvailable }: CeremonyCardProps) {
    const config = CEREMONY_CONFIG[type];
    const { colors, isDark } = useThemeContext();
    const isCompleted = ceremony?.status === 'completed';
    const isInProgress = ceremony?.status === 'in_progress';

    return (
        <View
            className="rounded-2xl p-4"
            style={{
                backgroundColor: isDark ? `${config.color}10` : `${config.color}15`,
                borderWidth: 1,
                borderColor: isDark ? `${config.color}30` : `${config.color}25`,
            }}
        >
            <View className="flex-row items-start">
                <View 
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${config.color}20` }}
                >
                    <MaterialCommunityIcons 
                        name={isCompleted ? 'check-circle' : config.icon as any} 
                        size={26} 
                        color={isCompleted ? '#10B981' : config.color} 
                    />
                </View>
                
                <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                        <Text className="text-base font-bold" style={{ color: colors.text }}>{config.title}</Text>
                        {isCompleted && (
                            <View className="px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: '#10B98120' }}>
                                <Text className="text-xs font-medium" style={{ color: '#10B981' }}>Done</Text>
                            </View>
                        )}
                        {isInProgress && (
                            <View className="px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: `${config.color}20` }}>
                                <Text className="text-xs font-medium" style={{ color: config.color }}>In Progress</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>{config.description}</Text>
                    
                    {ceremony?.scheduledFor && !isCompleted && (
                        <View className="flex-row items-center mt-2">
                            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textTertiary} />
                            <Text className="text-xs ml-1" style={{ color: colors.textTertiary }}>
                                Scheduled: {toLocaleDateStringLocalized(ceremony.scheduledFor, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </Text>
                        </View>
                    )}
                    
                    {isCompleted && ceremony?.completedAt && (
                        <View className="flex-row items-center mt-2">
                            <MaterialCommunityIcons name="check" size={14} color="#10B981" />
                            <Text className="text-xs ml-1" style={{ color: '#10B981' }}>
                                Completed {toLocaleDateStringLocalized(ceremony.completedAt, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {!isCompleted && (
                <TouchableOpacity
                    onPress={onStart}
                    disabled={!isAvailable}
                    className="mt-4 py-3 rounded-xl items-center"
                    style={{
                        backgroundColor: isAvailable
                            ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')
                            : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
                        borderWidth: 1,
                        borderColor: isAvailable
                            ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)')
                            : 'transparent',
                    }}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons 
                            name={isInProgress ? 'arrow-right' : 'play'} 
                            size={18} 
                            color={isAvailable ? config.color : colors.textTertiary} 
                        />
                        <Text className="ml-2 font-semibold" style={{
                            color: isAvailable ? colors.text : colors.textTertiary,
                        }}>
                            {isInProgress ? 'Continue' : 'Start'}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default CeremonyCard;
