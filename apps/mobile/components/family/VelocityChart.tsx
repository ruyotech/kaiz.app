/**
 * VelocityChart.tsx - Family Velocity Chart Component
 * 
 * Displays family-wide and individual member velocity/progress
 */

import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FamilyVelocity, MemberVelocity } from '../../types/family.types';
import { useThemeContext } from '../../providers/ThemeProvider';

interface VelocityChartProps {
    velocity: FamilyVelocity;
    onMemberPress?: (userId: string) => void;
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

export function VelocityChart({ velocity, onMemberPress }: VelocityChartProps) {
    const { colors, isDark } = useThemeContext();
    const screenWidth = Dimensions.get('window').width;
    
    return (
        <View 
            className="rounded-2xl overflow-hidden"
            style={{ 
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
            }}
        >
            {/* Header */}
            <View 
                className="px-4 py-3"
                style={{ backgroundColor: '#8B5CF615' }}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons 
                            name="chart-line" 
                            size={20} 
                            color="#8B5CF6"
                        />
                        <Text 
                            className="text-lg font-bold ml-2"
                            style={{ color: colors.text }}
                        >
                            Family Velocity
                        </Text>
                    </View>
                    <View 
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: '#8B5CF6' }}
                    >
                        <Text className="text-white text-xs font-medium">
                            Week {velocity.weekNumber}
                        </Text>
                    </View>
                </View>
            </View>
            
            {/* Summary Stats */}
            <View 
                className="flex-row py-4 mx-4"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
                <View className="flex-1 items-center">
                    <Text 
                        className="text-3xl font-bold"
                        style={{ color: colors.text }}
                    >
                        {velocity.completedPoints}
                    </Text>
                    <Text 
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                    >
                        Points Done
                    </Text>
                </View>
                <View 
                    className="w-px"
                    style={{ backgroundColor: colors.border }}
                />
                <View className="flex-1 items-center">
                    <Text 
                        className="text-3xl font-bold"
                        style={{ color: colors.textSecondary }}
                    >
                        {velocity.totalPoints}
                    </Text>
                    <Text 
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                    >
                        Planned
                    </Text>
                </View>
                <View 
                    className="w-px"
                    style={{ backgroundColor: colors.border }}
                />
                <View className="flex-1 items-center">
                    <Text 
                        className="text-3xl font-bold"
                        style={{ color: '#10B981' }}
                    >
                        {velocity.averageCompletion}%
                    </Text>
                    <Text 
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                    >
                        Avg Rate
                    </Text>
                </View>
            </View>
            
            {/* Team Progress Bar */}
            <View className="px-4 py-4">
                <Text 
                    className="text-xs font-semibold mb-2"
                    style={{ color: colors.textSecondary }}
                >
                    TEAM PROGRESS
                </Text>
                <View 
                    className="h-4 rounded-full overflow-hidden flex-row"
                    style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                >
                    {velocity.memberVelocities.map((member, index) => {
                        const width = (member.completedPoints / velocity.totalPoints) * 100;
                        return (
                            <View
                                key={member.userId}
                                style={{
                                    width: `${width}%`,
                                    backgroundColor: COLORS[index % COLORS.length],
                                    height: '100%',
                                }}
                            />
                        );
                    })}
                </View>
                
                {/* Legend */}
                <View className="flex-row flex-wrap mt-2 gap-x-4 gap-y-1">
                    {velocity.memberVelocities.map((member, index) => (
                        <View key={member.userId} className="flex-row items-center">
                            <View 
                                className="w-3 h-3 rounded-full mr-1"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <Text 
                                className="text-xs"
                                style={{ color: colors.textSecondary }}
                            >
                                {member.displayName}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
            
            {/* Individual Members */}
            <View className="px-4 pb-4">
                <Text 
                    className="text-xs font-semibold mb-3"
                    style={{ color: colors.textSecondary }}
                >
                    INDIVIDUAL PROGRESS
                </Text>
                
                {velocity.memberVelocities.map((member, index) => (
                    <TouchableOpacity
                        key={member.userId}
                        onPress={() => onMemberPress?.(member.userId)}
                        className="flex-row items-center py-3"
                        style={{ 
                            borderBottomWidth: index < velocity.memberVelocities.length - 1 ? 1 : 0,
                            borderBottomColor: colors.border,
                        }}
                    >
                        {/* Avatar */}
                        <View 
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                        >
                            <Text className="text-lg">{member.avatar}</Text>
                        </View>
                        
                        {/* Info & Progress */}
                        <View className="flex-1">
                            <View className="flex-row items-center justify-between mb-1">
                                <Text 
                                    className="font-semibold"
                                    style={{ color: colors.text }}
                                >
                                    {member.displayName}
                                </Text>
                                <View className="flex-row items-center">
                                    {member.streak > 0 && (
                                        <View className="flex-row items-center mr-2">
                                            <Text className="text-xs">🔥</Text>
                                            <Text 
                                                className="text-xs font-bold ml-0.5"
                                                style={{ color: '#F59E0B' }}
                                            >
                                                {member.streak}
                                            </Text>
                                        </View>
                                    )}
                                    <Text 
                                        className="text-sm font-bold"
                                        style={{ color: COLORS[index % COLORS.length] }}
                                    >
                                        {member.completedPoints}/{member.plannedPoints}
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Progress Bar */}
                            <View 
                                className="h-2 rounded-full overflow-hidden"
                                style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                            >
                                <View 
                                    className="h-full rounded-full"
                                    style={{ 
                                        backgroundColor: COLORS[index % COLORS.length],
                                        width: `${member.completionRate}%`,
                                    }}
                                />
                            </View>
                            
                            {/* Completion Rate */}
                            <Text 
                                className="text-xs mt-1"
                                style={{ color: colors.textSecondary }}
                            >
                                {member.completionRate}% completion rate
                            </Text>
                        </View>
                        
                        <MaterialCommunityIcons 
                            name="chevron-right" 
                            size={20} 
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
