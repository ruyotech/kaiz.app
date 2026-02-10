/**
 * MemberCard.tsx - Family Member Card Component
 * 
 * Displays family member information with avatar, role, stats, and actions
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FamilyMember, ROLE_CONFIGURATIONS } from '../../types/family.types';
import { useThemeContext } from '../../providers/ThemeProvider';

interface MemberCardProps {
    member: FamilyMember;
    onPress?: () => void;
    onSendKudos?: () => void;
    onManage?: () => void;
    showStats?: boolean;
    showActions?: boolean;
    isCurrentUser?: boolean;
    compact?: boolean;
}

export function MemberCard({
    member,
    onPress,
    onSendKudos,
    onManage,
    showStats = true,
    showActions = true,
    isCurrentUser = false,
    compact = false,
}: MemberCardProps) {
    const { colors, isDark } = useThemeContext();
    const roleConfig = ROLE_CONFIGURATIONS[member.role];
    
    // Calculate time since last active
    const getLastActiveText = () => {
        const lastActive = new Date(member.lastActiveAt);
        const now = new Date();
        const diffMs = now.getTime() - lastActive.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 5) return 'Online now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };
    
    if (compact) {
        return (
            <TouchableOpacity
                onPress={onPress}
                className="flex-row items-center p-3 rounded-xl mr-3"
                style={{ backgroundColor: colors.card, minWidth: 140 }}
            >
                <View className="relative">
                    <Text className="text-3xl">{member.avatar}</Text>
                    {member.isActive && (
                        <View 
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                            style={{ backgroundColor: '#10B981', borderColor: colors.card }}
                        />
                    )}
                </View>
                <View className="ml-2 flex-1">
                    <Text 
                        className="font-semibold text-sm" 
                        style={{ color: colors.text }}
                        numberOfLines={1}
                    >
                        {member.displayName}
                        {isCurrentUser && ' (You)'}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                        <MaterialCommunityIcons 
                            name={roleConfig.icon as any} 
                            size={12} 
                            color={roleConfig.color} 
                        />
                        <Text 
                            className="text-xs ml-1" 
                            style={{ color: colors.textSecondary }}
                        >
                            {roleConfig.label.split(' ')[0]}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    
    return (
        <TouchableOpacity
            onPress={onPress}
            className="rounded-2xl p-4 mb-3"
            style={{ 
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: isCurrentUser ? '#8B5CF6' : colors.border,
            }}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View className="flex-row items-center">
                {/* Avatar & Status */}
                <View className="relative">
                    <View 
                        className="w-14 h-14 rounded-full items-center justify-center"
                        style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                    >
                        <Text className="text-3xl">{member.avatar}</Text>
                    </View>
                    {member.isActive && (
                        <View 
                            className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2"
                            style={{ backgroundColor: '#10B981', borderColor: colors.card }}
                        />
                    )}
                </View>
                
                {/* Info */}
                <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                        <Text 
                            className="text-lg font-bold" 
                            style={{ color: colors.text }}
                        >
                            {member.displayName}
                        </Text>
                        {isCurrentUser && (
                            <View 
                                className="ml-2 px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: '#8B5CF6' }}
                            >
                                <Text className="text-white text-xs font-medium">You</Text>
                            </View>
                        )}
                    </View>
                    
                    <View className="flex-row items-center mt-1">
                        <View 
                            className="flex-row items-center px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${roleConfig.color}20` }}
                        >
                            <MaterialCommunityIcons 
                                name={roleConfig.icon as any} 
                                size={14} 
                                color={roleConfig.color} 
                            />
                            <Text 
                                className="text-xs font-medium ml-1"
                                style={{ color: roleConfig.color }}
                            >
                                {roleConfig.label}
                            </Text>
                        </View>
                        <Text 
                            className="text-xs ml-2"
                            style={{ color: colors.textSecondary }}
                        >
                            {getLastActiveText()}
                        </Text>
                    </View>
                </View>
                
                {/* Streak Badge */}
                {member.currentStreak > 0 && (
                    <View 
                        className="items-center px-2 py-1 rounded-lg"
                        style={{ backgroundColor: '#F59E0B20' }}
                    >
                        <Text className="text-lg"></Text>
                        <Text 
                            className="text-xs font-bold"
                            style={{ color: '#F59E0B' }}
                        >
                            {member.currentStreak}
                        </Text>
                    </View>
                )}
            </View>
            
            {/* Stats */}
            {showStats && (
                <View 
                    className="flex-row mt-4 pt-3"
                    style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                >
                    <View className="flex-1 items-center">
                        <Text 
                            className="text-xl font-bold" 
                            style={{ color: colors.text }}
                        >
                            {member.tasksCompleted}
                        </Text>
                        <Text 
                            className="text-xs" 
                            style={{ color: colors.textSecondary }}
                        >
                            Tasks Done
                        </Text>
                    </View>
                    <View 
                        className="w-px" 
                        style={{ backgroundColor: colors.border }} 
                    />
                    <View className="flex-1 items-center">
                        <Text 
                            className="text-xl font-bold" 
                            style={{ color: colors.text }}
                        >
                            {member.kudosReceived}
                        </Text>
                        <Text 
                            className="text-xs" 
                            style={{ color: colors.textSecondary }}
                        >
                            Kudos Received
                        </Text>
                    </View>
                    <View 
                        className="w-px" 
                        style={{ backgroundColor: colors.border }} 
                    />
                    <View className="flex-1 items-center">
                        <Text 
                            className="text-xl font-bold" 
                            style={{ color: colors.text }}
                        >
                            {member.currentStreak}
                        </Text>
                        <Text 
                            className="text-xs" 
                            style={{ color: colors.textSecondary }}
                        >
                            Day Streak
                        </Text>
                    </View>
                </View>
            )}
            
            {/* Actions */}
            {showActions && !isCurrentUser && (
                <View className="flex-row mt-3 gap-2">
                    {onSendKudos && (
                        <TouchableOpacity
                            onPress={onSendKudos}
                            className="flex-1 flex-row items-center justify-center py-2 rounded-xl"
                            style={{ backgroundColor: '#8B5CF620' }}
                        >
                            <MaterialCommunityIcons 
                                name="hand-clap" 
                                size={18} 
                                color="#8B5CF6" 
                            />
                            <Text 
                                className="ml-1.5 font-medium text-sm"
                                style={{ color: '#8B5CF6' }}
                            >
                                Send Kudos
                            </Text>
                        </TouchableOpacity>
                    )}
                    {onManage && (
                        <TouchableOpacity
                            onPress={onManage}
                            className="flex-row items-center justify-center px-4 py-2 rounded-xl"
                            style={{ backgroundColor: colors.border }}
                        >
                            <MaterialCommunityIcons 
                                name="cog" 
                                size={18} 
                                color={colors.textSecondary} 
                            />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}
