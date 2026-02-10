/**
 * ActivityFeedItem.tsx - Family Activity Feed Item Component
 * 
 * Displays individual activity events in the family feed
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FamilyActivity, FamilyActivityType } from '../../types/family.types';
import { useThemeContext } from '../../providers/ThemeProvider';

interface ActivityFeedItemProps {
    activity: FamilyActivity;
    onPress?: () => void;
}

const ACTIVITY_CONFIG: Record<FamilyActivityType, {
    icon: string;
    color: string;
    getMessage: (activity: FamilyActivity) => string;
}> = {
    task_created: {
        icon: 'plus-circle',
        color: '#3B82F6',
        getMessage: (a) => `created task "${a.targetName}"`,
    },
    task_completed: {
        icon: 'check-circle',
        color: '#10B981',
        getMessage: (a) => `completed "${a.targetName}" (+${a.metadata?.storyPoints || 0} pts)`,
    },
    task_assigned: {
        icon: 'account-arrow-right',
        color: '#8B5CF6',
        getMessage: (a) => `assigned "${a.targetName}" to ${a.metadata?.assigneeName || 'someone'}`,
    },
    epic_created: {
        icon: 'flag-plus',
        color: '#F59E0B',
        getMessage: (a) => `created epic "${a.targetName}"`,
    },
    epic_completed: {
        icon: 'flag-checkered',
        color: '#10B981',
        getMessage: (a) => `completed epic "${a.targetName}"`,
    },
    member_joined: {
        icon: 'account-plus',
        color: '#06B6D4',
        getMessage: (a) => `joined the family!`,
    },
    member_left: {
        icon: 'account-minus',
        color: '#6B7280',
        getMessage: (a) => `left the family`,
    },
    kudos_sent: {
        icon: 'hand-clap',
        color: '#EC4899',
        getMessage: (a) => `sent kudos to ${a.targetName}`,
    },
    ceremony_completed: {
        icon: 'calendar-check',
        color: '#8B5CF6',
        getMessage: (a) => `completed ${a.metadata?.ceremonyType || 'ceremony'}`,
    },
    streak_milestone: {
        icon: 'fire',
        color: '#F59E0B',
        getMessage: (a) => `reached a ${a.metadata?.streakDays}-day streak!`,
    },
    independence_started: {
        icon: 'account-arrow-right-outline',
        color: '#8B5CF6',
        getMessage: (a) => `started their independence journey`,
    },
};

export function ActivityFeedItem({ activity, onPress }: ActivityFeedItemProps) {
    const { colors, isDark } = useThemeContext();
    
    const config = ACTIVITY_CONFIG[activity.type];
    
    const getTimeAgo = () => {
        const date = new Date(activity.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-start py-3 px-4"
            style={{ 
                borderBottomWidth: 1, 
                borderBottomColor: colors.border,
            }}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {/* Avatar & Icon */}
            <View className="relative mr-3">
                <View 
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                >
                    <Text className="text-xl">{activity.actorAvatar}</Text>
                </View>
                <View 
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                    style={{ backgroundColor: config.color }}
                >
                    <MaterialCommunityIcons 
                        name={config.icon as any} 
                        size={12} 
                        color="#fff"
                    />
                </View>
            </View>
            
            {/* Content */}
            <View className="flex-1">
                <Text 
                    className="text-sm leading-5"
                    style={{ color: colors.text }}
                >
                    <Text className="font-bold">{activity.actorName}</Text>
                    {' '}
                    <Text style={{ color: colors.textSecondary }}>
                        {config.getMessage(activity)}
                    </Text>
                </Text>
                <Text 
                    className="text-xs mt-1"
                    style={{ color: colors.textSecondary }}
                >
                    {getTimeAgo()}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
