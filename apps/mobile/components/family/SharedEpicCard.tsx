/**
 * SharedEpicCard.tsx - Family Shared Epic Card Component
 * 
 * Displays a shared family epic with progress, members, and tasks
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SharedEpic } from '../../types/family.types';
import { useThemeContext } from '../../providers/ThemeProvider';
import { useFamilyStore } from '../../store/familyStore';

interface SharedEpicCardProps {
    epic: SharedEpic;
    onPress?: () => void;
    compact?: boolean;
}

export function SharedEpicCard({ epic, onPress, compact = false }: SharedEpicCardProps) {
    const { colors, isDark } = useThemeContext();
    const { members, sharedTasks } = useFamilyStore();
    
    const assignedMembers = epic.assignedTo
        .map(userId => members.find(m => m.userId === userId))
        .filter(Boolean);
    
    const epicTasks = sharedTasks.filter(t => t.epicId === epic.id);
    const completedTasks = epicTasks.filter(t => t.status === 'done').length;
    
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    if (compact) {
        return (
            <TouchableOpacity
                onPress={onPress}
                className="rounded-xl p-3 mr-3"
                style={{ 
                    backgroundColor: `${epic.color}15`,
                    borderWidth: 1,
                    borderColor: `${epic.color}40`,
                    minWidth: 180,
                }}
            >
                <View className="flex-row items-center mb-2">
                    <Text className="text-2xl mr-2">{epic.icon}</Text>
                    <Text 
                        className="font-bold flex-1"
                        style={{ color: colors.text }}
                        numberOfLines={1}
                    >
                        {epic.title}
                    </Text>
                </View>
                
                {/* Progress Bar */}
                <View 
                    className="h-2 rounded-full overflow-hidden mb-2"
                    style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                >
                    <View 
                        className="h-full rounded-full"
                        style={{ 
                            backgroundColor: epic.color,
                            width: `${epic.progress}%`,
                        }}
                    />
                </View>
                
                <View className="flex-row items-center justify-between">
                    <Text 
                        className="text-xs font-medium"
                        style={{ color: epic.color }}
                    >
                        {epic.progress}% complete
                    </Text>
                    <View className="flex-row">
                        {assignedMembers.slice(0, 3).map((member, index) => (
                            <View 
                                key={member?.userId}
                                className="w-5 h-5 rounded-full items-center justify-center -ml-1 first:ml-0"
                                style={{ 
                                    backgroundColor: isDark ? '#374151' : '#E5E7EB',
                                    borderWidth: 1,
                                    borderColor: colors.card,
                                }}
                            >
                                <Text className="text-xs">{member?.avatar}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    
    return (
        <TouchableOpacity
            onPress={onPress}
            className="rounded-2xl overflow-hidden mb-3"
            style={{ 
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
            }}
            activeOpacity={0.7}
        >
            {/* Header with Color */}
            <View 
                className="px-4 py-3 flex-row items-center"
                style={{ backgroundColor: `${epic.color}15` }}
            >
                <Text className="text-2xl mr-3">{epic.icon}</Text>
                <View className="flex-1">
                    <Text 
                        className="text-lg font-bold"
                        style={{ color: colors.text }}
                    >
                        {epic.title}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                        <View 
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${epic.color}30` }}
                        >
                            <Text 
                                className="text-xs font-medium capitalize"
                                style={{ color: epic.color }}
                            >
                                {epic.status}
                            </Text>
                        </View>
                        {epic.targetDate && (
                            <View className="flex-row items-center ml-2">
                                <MaterialCommunityIcons 
                                    name="flag-outline" 
                                    size={12} 
                                    color={colors.textSecondary}
                                />
                                <Text 
                                    className="text-xs ml-1"
                                    style={{ color: colors.textSecondary }}
                                >
                                    {formatDate(epic.targetDate)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            
            {/* Content */}
            <View className="p-4">
                {epic.description && (
                    <Text 
                        className="text-sm mb-3"
                        style={{ color: colors.textSecondary }}
                        numberOfLines={2}
                    >
                        {epic.description}
                    </Text>
                )}
                
                {/* Progress */}
                <View className="mb-4">
                    <View className="flex-row items-center justify-between mb-1.5">
                        <Text 
                            className="text-sm font-medium"
                            style={{ color: colors.text }}
                        >
                            Progress
                        </Text>
                        <Text 
                            className="text-sm font-bold"
                            style={{ color: epic.color }}
                        >
                            {epic.progress}%
                        </Text>
                    </View>
                    <View 
                        className="h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                    >
                        <View 
                            className="h-full rounded-full"
                            style={{ 
                                backgroundColor: epic.color,
                                width: `${epic.progress}%`,
                            }}
                        />
                    </View>
                </View>
                
                {/* Stats Row */}
                <View 
                    className="flex-row py-3 mb-3"
                    style={{ 
                        borderTopWidth: 1, 
                        borderBottomWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <View className="flex-1 items-center">
                        <Text 
                            className="text-xl font-bold"
                            style={{ color: colors.text }}
                        >
                            {epicTasks.length}
                        </Text>
                        <Text 
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                        >
                            Total Tasks
                        </Text>
                    </View>
                    <View 
                        className="w-px"
                        style={{ backgroundColor: colors.border }}
                    />
                    <View className="flex-1 items-center">
                        <Text 
                            className="text-xl font-bold"
                            style={{ color: '#10B981' }}
                        >
                            {completedTasks}
                        </Text>
                        <Text 
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                        >
                            Completed
                        </Text>
                    </View>
                    <View 
                        className="w-px"
                        style={{ backgroundColor: colors.border }}
                    />
                    <View className="flex-1 items-center">
                        <Text 
                            className="text-xl font-bold"
                            style={{ color: '#F59E0B' }}
                        >
                            {epicTasks.length - completedTasks}
                        </Text>
                        <Text 
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                        >
                            Remaining
                        </Text>
                    </View>
                </View>
                
                {/* Assigned Members */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Text 
                            className="text-xs font-semibold mr-2"
                            style={{ color: colors.textSecondary }}
                        >
                            TEAM
                        </Text>
                        <View className="flex-row">
                            {assignedMembers.map((member, index) => (
                                <View 
                                    key={member?.userId}
                                    className="w-8 h-8 rounded-full items-center justify-center -ml-2 first:ml-0"
                                    style={{ 
                                        backgroundColor: isDark ? '#374151' : '#E5E7EB',
                                        borderWidth: 2,
                                        borderColor: colors.card,
                                        zIndex: assignedMembers.length - index,
                                    }}
                                >
                                    <Text className="text-sm">{member?.avatar}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    
                    <TouchableOpacity 
                        onPress={onPress}
                        className="flex-row items-center"
                    >
                        <Text 
                            className="text-sm font-medium mr-1"
                            style={{ color: epic.color }}
                        >
                            View Details
                        </Text>
                        <MaterialCommunityIcons 
                            name="chevron-right" 
                            size={18} 
                            color={epic.color}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}
