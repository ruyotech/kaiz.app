/**
 * SharedTaskCard.tsx - Family Shared Task Card Component
 * 
 * Displays a shared task with visibility indicator, assignee, and actions
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SharedTask, TaskVisibility, TASK_VISIBILITY_OPTIONS } from '../../types/family.types';
import { useThemeContext } from '../../providers/ThemeProvider';
import { useFamilyStore } from '../../store/familyStore';

interface SharedTaskCardProps {
    task: SharedTask;
    onPress?: () => void;
    onComplete?: () => void;
    onAssign?: () => void;
    showAssignee?: boolean;
}

const PRIORITY_CONFIG = {
    low: { color: '#6B7280', icon: 'arrow-down', label: 'Low' },
    medium: { color: '#F59E0B', icon: 'minus', label: 'Medium' },
    high: { color: '#EF4444', icon: 'arrow-up', label: 'High' },
    urgent: { color: '#DC2626', icon: 'alert-circle', label: 'Urgent' },
};

const STATUS_CONFIG = {
    todo: { color: '#6B7280', icon: 'circle-outline', label: 'To Do' },
    in_progress: { color: '#3B82F6', icon: 'progress-clock', label: 'In Progress' },
    done: { color: '#10B981', icon: 'check-circle', label: 'Done' },
    blocked: { color: '#EF4444', icon: 'alert-octagon', label: 'Blocked' },
};

export function SharedTaskCard({
    task,
    onPress,
    onComplete,
    onAssign,
    showAssignee = true,
}: SharedTaskCardProps) {
    const { colors, isDark } = useThemeContext();
    const { members } = useFamilyStore();
    
    const assignee = members.find(m => m.userId === task.assignedTo);
    const visibilityConfig = TASK_VISIBILITY_OPTIONS.find(v => v.type === task.visibility);
    const priorityConfig = PRIORITY_CONFIG[task.priority];
    const statusConfig = STATUS_CONFIG[task.status];
    
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    
    const formatDueDate = () => {
        if (!task.dueDate) return null;
        const date = new Date(task.dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return (
        <TouchableOpacity
            onPress={onPress}
            className="rounded-2xl p-4 mb-3"
            style={{ 
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: task.status === 'done' ? '#10B98140' : colors.border,
                opacity: task.status === 'done' ? 0.8 : 1,
            }}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View className="flex-row items-start">
                {/* Checkbox */}
                <TouchableOpacity
                    onPress={onComplete}
                    className="mr-3 mt-0.5"
                    disabled={task.status === 'done'}
                >
                    <MaterialCommunityIcons 
                        name={task.status === 'done' ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} 
                        size={24} 
                        color={task.status === 'done' ? '#10B981' : colors.textSecondary}
                    />
                </TouchableOpacity>
                
                {/* Content */}
                <View className="flex-1">
                    <View className="flex-row items-center flex-wrap mb-1">
                        {/* Visibility Badge */}
                        {visibilityConfig && (
                            <View 
                                className="flex-row items-center px-2 py-0.5 rounded-full mr-2"
                                style={{ backgroundColor: `${visibilityConfig.color}20` }}
                            >
                                <MaterialCommunityIcons 
                                    name={visibilityConfig.icon as any} 
                                    size={12} 
                                    color={visibilityConfig.color}
                                />
                                <Text 
                                    className="text-xs ml-1" 
                                    style={{ color: visibilityConfig.color }}
                                >
                                    {visibilityConfig.label}
                                </Text>
                            </View>
                        )}
                        
                        {/* Story Points */}
                        <View 
                            className="flex-row items-center px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                        >
                            <MaterialCommunityIcons 
                                name="star-four-points" 
                                size={10} 
                                color={colors.textSecondary}
                            />
                            <Text 
                                className="text-xs ml-1" 
                                style={{ color: colors.textSecondary }}
                            >
                                {task.storyPoints}
                            </Text>
                        </View>
                    </View>
                    
                    {/* Title */}
                    <Text 
                        className={`text-base font-semibold ${task.status === 'done' ? 'line-through' : ''}`}
                        style={{ color: task.status === 'done' ? colors.textSecondary : colors.text }}
                    >
                        {task.title}
                    </Text>
                    
                    {/* Description */}
                    {task.description && (
                        <Text 
                            className="text-sm mt-1" 
                            style={{ color: colors.textSecondary }}
                            numberOfLines={2}
                        >
                            {task.description}
                        </Text>
                    )}
                    
                    {/* Bottom Row */}
                    <View className="flex-row items-center mt-3 flex-wrap gap-2">
                        {/* Status */}
                        <View 
                            className="flex-row items-center px-2 py-1 rounded-lg"
                            style={{ backgroundColor: `${statusConfig.color}15` }}
                        >
                            <MaterialCommunityIcons 
                                name={statusConfig.icon as any} 
                                size={14} 
                                color={statusConfig.color}
                            />
                            <Text 
                                className="text-xs font-medium ml-1" 
                                style={{ color: statusConfig.color }}
                            >
                                {statusConfig.label}
                            </Text>
                        </View>
                        
                        {/* Priority */}
                        <View 
                            className="flex-row items-center px-2 py-1 rounded-lg"
                            style={{ backgroundColor: `${priorityConfig.color}15` }}
                        >
                            <MaterialCommunityIcons 
                                name={priorityConfig.icon as any} 
                                size={14} 
                                color={priorityConfig.color}
                            />
                            <Text 
                                className="text-xs font-medium ml-1" 
                                style={{ color: priorityConfig.color }}
                            >
                                {priorityConfig.label}
                            </Text>
                        </View>
                        
                        {/* Due Date */}
                        {formatDueDate() && (
                            <View 
                                className="flex-row items-center px-2 py-1 rounded-lg"
                                style={{ backgroundColor: isOverdue ? '#EF444415' : (isDark ? '#374151' : '#E5E7EB') }}
                            >
                                <MaterialCommunityIcons 
                                    name="calendar" 
                                    size={14} 
                                    color={isOverdue ? '#EF4444' : colors.textSecondary}
                                />
                                <Text 
                                    className="text-xs font-medium ml-1" 
                                    style={{ color: isOverdue ? '#EF4444' : colors.textSecondary }}
                                >
                                    {formatDueDate()}
                                </Text>
                            </View>
                        )}
                        
                        {/* Requires Approval */}
                        {task.requiresApproval && task.status === 'done' && !task.approvedBy && (
                            <View 
                                className="flex-row items-center px-2 py-1 rounded-lg"
                                style={{ backgroundColor: '#F59E0B15' }}
                            >
                                <MaterialCommunityIcons 
                                    name="shield-check-outline" 
                                    size={14} 
                                    color="#F59E0B"
                                />
                                <Text 
                                    className="text-xs font-medium ml-1" 
                                    style={{ color: '#F59E0B' }}
                                >
                                    Needs Approval
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            
            {/* Assignee Row */}
            {showAssignee && (
                <View 
                    className="flex-row items-center justify-between mt-3 pt-3"
                    style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                >
                    {assignee ? (
                        <View className="flex-row items-center">
                            <Text className="text-xl">{assignee.avatar}</Text>
                            <Text 
                                className="text-sm ml-2 font-medium" 
                                style={{ color: colors.text }}
                            >
                                {assignee.displayName}
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            onPress={onAssign}
                            className="flex-row items-center"
                        >
                            <View 
                                className="w-7 h-7 rounded-full items-center justify-center"
                                style={{ 
                                    backgroundColor: isDark ? '#374151' : '#E5E7EB',
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderStyle: 'dashed',
                                }}
                            >
                                <MaterialCommunityIcons 
                                    name="plus" 
                                    size={16} 
                                    color={colors.textSecondary}
                                />
                            </View>
                            <Text 
                                className="text-sm ml-2" 
                                style={{ color: colors.textSecondary }}
                            >
                                Assign someone
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    {task.status === 'done' && task.completedBy && (
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons 
                                name="check" 
                                size={14} 
                                color="#10B981"
                            />
                            <Text 
                                className="text-xs ml-1" 
                                style={{ color: colors.textSecondary }}
                            >
                                Completed
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}
