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
    bgColor: string;
}> = {
    planning: {
        title: 'Sprint Planning',
        description: 'Select and commit to tasks for the upcoming sprint',
        icon: 'clipboard-list-outline',
        color: '#3B82F6',
        bgColor: 'bg-blue-50',
    },
    standup: {
        title: 'Daily Standup',
        description: 'Quick sync on progress and blockers',
        icon: 'account-voice',
        color: '#10B981',
        bgColor: 'bg-green-50',
    },
    midcheck: {
        title: 'Mid-Sprint Check',
        description: 'Review progress and adjust if needed',
        icon: 'chart-timeline-variant',
        color: '#F59E0B',
        bgColor: 'bg-amber-50',
    },
    review: {
        title: 'Sprint Review',
        description: 'Celebrate wins and analyze completion',
        icon: 'trophy-outline',
        color: '#8B5CF6',
        bgColor: 'bg-purple-50',
    },
    retrospective: {
        title: 'Retrospective',
        description: 'What worked, what didn\'t, and key learnings',
        icon: 'comment-multiple-outline',
        color: '#EC4899',
        bgColor: 'bg-pink-50',
    },
};

export function CeremonyCard({ ceremony, type, onStart, isAvailable }: CeremonyCardProps) {
    const config = CEREMONY_CONFIG[type];
    const isCompleted = ceremony?.status === 'completed';
    const isInProgress = ceremony?.status === 'in_progress';

    return (
        <View className={`${config.bgColor} rounded-2xl p-4 border border-gray-100`}>
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
                        <Text className="text-base font-bold text-gray-900">{config.title}</Text>
                        {isCompleted && (
                            <View className="bg-green-100 px-2 py-0.5 rounded-full ml-2">
                                <Text className="text-xs text-green-700 font-medium">Done</Text>
                            </View>
                        )}
                        {isInProgress && (
                            <View className="bg-blue-100 px-2 py-0.5 rounded-full ml-2">
                                <Text className="text-xs text-blue-700 font-medium">In Progress</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-sm text-gray-600 mt-1">{config.description}</Text>
                    
                    {ceremony?.scheduledFor && !isCompleted && (
                        <View className="flex-row items-center mt-2">
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                            <Text className="text-xs text-gray-500 ml-1">
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
                            <Text className="text-xs text-green-600 ml-1">
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
                    className={`mt-4 py-3 rounded-xl items-center ${
                        isAvailable 
                            ? 'bg-white border border-gray-200' 
                            : 'bg-gray-100'
                    }`}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons 
                            name={isInProgress ? 'arrow-right' : 'play'} 
                            size={18} 
                            color={isAvailable ? config.color : '#9CA3AF'} 
                        />
                        <Text className={`ml-2 font-semibold ${
                            isAvailable ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                            {isInProgress ? 'Continue' : 'Start'}
                        </Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default CeremonyCard;
