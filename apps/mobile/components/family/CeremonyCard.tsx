/**
 * CeremonyCard.tsx - Family Ceremony Card Component
 * 
 * Displays family ceremonies like standups, planning, and retrospectives
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FamilyCeremony, CeremonyType } from '../../types/family.types';
import { useThemeContext } from '../../providers/ThemeProvider';
import { useFamilyStore } from '../../store/familyStore';

interface CeremonyCardProps {
    ceremony: FamilyCeremony;
    onPress?: () => void;
    onStart?: () => void;
}

const CEREMONY_CONFIG: Record<CeremonyType, {
    icon: string;
    color: string;
    emoji: string;
    label: string;
}> = {
    standup: {
        icon: 'account-group',
        color: '#3B82F6',
        emoji: '🌅',
        label: 'Daily Standup',
    },
    sprint_planning: {
        icon: 'calendar-clock',
        color: '#8B5CF6',
        emoji: '📋',
        label: 'Sprint Planning',
    },
    retrospective: {
        icon: 'history',
        color: '#F59E0B',
        emoji: '🔄',
        label: 'Retrospective',
    },
    celebration: {
        icon: 'party-popper',
        color: '#10B981',
        emoji: '🎉',
        label: 'Celebration',
    },
};

export function CeremonyCard({ ceremony, onPress, onStart }: CeremonyCardProps) {
    const { colors, isDark } = useThemeContext();
    const { members } = useFamilyStore();
    
    const config = CEREMONY_CONFIG[ceremony.type];
    const isCompleted = !!ceremony.completedAt;
    const isToday = new Date(ceremony.scheduledAt).toDateString() === new Date().toDateString();
    const isPast = new Date(ceremony.scheduledAt) < new Date() && !isCompleted;
    
    const participants = ceremony.participants
        .map(userId => members.find(m => m.userId === userId))
        .filter(Boolean);
    
    const formatTime = () => {
        const date = new Date(ceremony.scheduledAt);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        if (date.toDateString() === today.toDateString()) {
            return `Today at ${timeStr}`;
        }
        if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow at ${timeStr}`;
        }
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        }) + ` at ${timeStr}`;
    };
    
    return (
        <TouchableOpacity
            onPress={onPress}
            className="rounded-2xl overflow-hidden mb-3"
            style={{ 
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: isToday && !isCompleted ? config.color : colors.border,
            }}
            activeOpacity={0.7}
        >
            {/* Header Banner */}
            <View 
                className="px-4 py-3 flex-row items-center justify-between"
                style={{ backgroundColor: `${config.color}15` }}
            >
                <View className="flex-row items-center">
                    <Text className="text-xl mr-2">{config.emoji}</Text>
                    <Text 
                        className="font-bold"
                        style={{ color: config.color }}
                    >
                        {config.label}
                    </Text>
                </View>
                {isCompleted ? (
                    <View 
                        className="flex-row items-center px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#10B98120' }}
                    >
                        <MaterialCommunityIcons 
                            name="check-circle" 
                            size={14} 
                            color="#10B981"
                        />
                        <Text 
                            className="text-xs font-medium ml-1"
                            style={{ color: '#10B981' }}
                        >
                            Completed
                        </Text>
                    </View>
                ) : isToday ? (
                    <View 
                        className="flex-row items-center px-2 py-1 rounded-full"
                        style={{ backgroundColor: config.color }}
                    >
                        <MaterialCommunityIcons 
                            name="clock-outline" 
                            size={14} 
                            color="#fff"
                        />
                        <Text className="text-xs font-medium ml-1 text-white">
                            Today
                        </Text>
                    </View>
                ) : isPast ? (
                    <View 
                        className="flex-row items-center px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#EF444420' }}
                    >
                        <MaterialCommunityIcons 
                            name="alert-circle" 
                            size={14} 
                            color="#EF4444"
                        />
                        <Text 
                            className="text-xs font-medium ml-1"
                            style={{ color: '#EF4444' }}
                        >
                            Missed
                        </Text>
                    </View>
                ) : null}
            </View>
            
            {/* Content */}
            <View className="p-4">
                <Text 
                    className="text-lg font-bold mb-1"
                    style={{ color: colors.text }}
                >
                    {ceremony.title}
                </Text>
                
                {ceremony.description && (
                    <Text 
                        className="text-sm mb-3"
                        style={{ color: colors.textSecondary }}
                    >
                        {ceremony.description}
                    </Text>
                )}
                
                {/* Time */}
                <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons 
                        name="clock-outline" 
                        size={16} 
                        color={colors.textSecondary}
                    />
                    <Text 
                        className="text-sm ml-2"
                        style={{ color: colors.textSecondary }}
                    >
                        {formatTime()}
                    </Text>
                </View>
                
                {/* Participants */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="flex-row">
                            {participants.slice(0, 4).map((member, index) => (
                                <View 
                                    key={member?.userId}
                                    className="w-8 h-8 rounded-full items-center justify-center -ml-2 first:ml-0"
                                    style={{ 
                                        backgroundColor: isDark ? '#374151' : '#E5E7EB',
                                        borderWidth: 2,
                                        borderColor: colors.card,
                                        zIndex: 4 - index,
                                    }}
                                >
                                    <Text className="text-sm">{member?.avatar}</Text>
                                </View>
                            ))}
                            {participants.length > 4 && (
                                <View 
                                    className="w-8 h-8 rounded-full items-center justify-center -ml-2"
                                    style={{ 
                                        backgroundColor: isDark ? '#374151' : '#E5E7EB',
                                        borderWidth: 2,
                                        borderColor: colors.card,
                                    }}
                                >
                                    <Text 
                                        className="text-xs font-bold"
                                        style={{ color: colors.textSecondary }}
                                    >
                                        +{participants.length - 4}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text 
                            className="text-sm ml-2"
                            style={{ color: colors.textSecondary }}
                        >
                            {participants.length} participant{participants.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    
                    {/* Start Button */}
                    {!isCompleted && isToday && onStart && (
                        <TouchableOpacity
                            onPress={onStart}
                            className="flex-row items-center px-4 py-2 rounded-xl"
                            style={{ backgroundColor: config.color }}
                        >
                            <MaterialCommunityIcons 
                                name="play" 
                                size={18} 
                                color="#fff"
                            />
                            <Text className="text-white font-bold ml-1">
                                Start
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                
                {/* Completed Info */}
                {isCompleted && ceremony.highlights.length > 0 && (
                    <View 
                        className="mt-3 pt-3"
                        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                    >
                        <Text 
                            className="text-xs font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            HIGHLIGHTS
                        </Text>
                        {ceremony.highlights.slice(0, 2).map((highlight) => (
                            <View key={highlight.id} className="flex-row items-start mb-1">
                                <Text className="text-sm mr-2">
                                    {highlight.type === 'achievement' ? '🏆' :
                                     highlight.type === 'challenge' ? '💪' :
                                     highlight.type === 'goal' ? '🎯' : '🙏'}
                                </Text>
                                <Text 
                                    className="text-sm flex-1"
                                    style={{ color: colors.text }}
                                    numberOfLines={1}
                                >
                                    {highlight.content}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}
