/**
 * CoachMessage Component
 * 
 * Displays messages from the AI coach with appropriate styling
 * based on message type and tone.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CoachMessage as CoachMessageType, CoachTone } from '../../types/sensai.types';
import { toLocaleDateStringLocalized } from '../../utils/localizedDate';
import { useThemeContext } from '../../providers/ThemeProvider';

interface CoachMessageProps {
    message: CoachMessageType;
    onAction?: (actionId: string) => void;
    onDismiss?: () => void;
    showAvatar?: boolean;
}

// Theme-aware tone styles function
const getToneStyles = (tone: CoachTone, isDark: boolean) => {
    const styles: Record<CoachTone, { bg: string; border: string; icon: string; iconColor: string; avatarBg: string }> = {
        direct: {
            bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
            border: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
            icon: 'alert-circle',
            iconColor: '#F59E0B',
            avatarBg: isDark ? '#1F2937' : '#FFFFFF',
        },
        encouraging: {
            bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
            border: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE',
            icon: 'lightbulb-on',
            iconColor: '#3B82F6',
            avatarBg: isDark ? '#1F2937' : '#FFFFFF',
        },
        supportive: {
            bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
            border: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
            icon: 'hand-heart',
            iconColor: '#10B981',
            avatarBg: isDark ? '#1F2937' : '#FFFFFF',
        },
        celebratory: {
            bg: isDark ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF',
            border: isDark ? 'rgba(139, 92, 246, 0.3)' : '#DDD6FE',
            icon: 'party-popper',
            iconColor: '#8B5CF6',
            avatarBg: isDark ? '#1F2937' : '#FFFFFF',
        },
        challenging: {
            bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
            border: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
            icon: 'fire',
            iconColor: '#EF4444',
            avatarBg: isDark ? '#1F2937' : '#FFFFFF',
        },
    };
    return styles[tone];
};

const TYPE_ICONS: Record<string, string> = {
    greeting: 'hand-wave',
    standup: 'clipboard-check',
    intervention: 'shield-alert',
    celebration: 'trophy',
    tip: 'lightbulb',
    summary: 'chart-line',
};

export function CoachMessage({ message, onAction, onDismiss, showAvatar = true }: CoachMessageProps) {
    const { colors, isDark } = useThemeContext();
    const style = getToneStyles(message.tone, isDark);
    const icon = TYPE_ICONS[message.type] || 'robot';

    return (
        <View 
            className="rounded-2xl p-4 mb-3"
            style={{ 
                backgroundColor: style.bg,
                borderWidth: 1,
                borderColor: style.border
            }}
        >
            <View className="flex-row items-start">
                {showAvatar && (
                    <View 
                        className="w-10 h-10 rounded-full items-center justify-center mr-3 shadow-sm"
                        style={{ backgroundColor: style.avatarBg }}
                    >
                        <MaterialCommunityIcons 
                            name={icon as any} 
                            size={22} 
                            color={style.iconColor} 
                        />
                    </View>
                )}
                
                <View className="flex-1">
                    {message.title && (
                        <Text className="text-base font-bold mb-1" style={{ color: colors.text }}>
                            {message.title}
                        </Text>
                    )}
                    
                    <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
                        {message.message}
                    </Text>
                    
                    {/* Actions */}
                    {message.actions && message.actions.length > 0 && (
                        <View className="flex-row flex-wrap mt-3 gap-2">
                            {message.actions.map((action) => (
                                <TouchableOpacity
                                    key={action.id}
                                    onPress={() => onAction?.(action.id)}
                                    className="px-4 py-2 rounded-full"
                                    style={{ 
                                        backgroundColor: action.primary ? colors.primary : colors.card,
                                        borderWidth: action.primary ? 0 : 1,
                                        borderColor: colors.border
                                    }}
                                >
                                    <Text 
                                        className="text-sm font-medium"
                                        style={{ color: action.primary ? '#FFFFFF' : colors.text }}
                                    >
                                        {action.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                
                {onDismiss && (
                    <TouchableOpacity onPress={onDismiss} className="p-1">
                        <MaterialCommunityIcons name="close" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Timestamp */}
            <Text className="text-xs mt-2 ml-13" style={{ color: colors.textTertiary }}>
                {formatTimestamp(message.timestamp)}
            </Text>
        </View>
    );
}

function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return toLocaleDateStringLocalized(date, { month: 'short', day: 'numeric' });
}

export default CoachMessage;
