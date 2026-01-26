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

interface CoachMessageProps {
    message: CoachMessageType;
    onAction?: (actionId: string) => void;
    onDismiss?: () => void;
    showAvatar?: boolean;
}

const TONE_STYLES: Record<CoachTone, { bg: string; border: string; icon: string; iconColor: string }> = {
    direct: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'alert-circle',
        iconColor: '#F59E0B',
    },
    encouraging: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'lightbulb-on',
        iconColor: '#3B82F6',
    },
    supportive: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'hand-heart',
        iconColor: '#10B981',
    },
    celebratory: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'party-popper',
        iconColor: '#8B5CF6',
    },
    challenging: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'fire',
        iconColor: '#EF4444',
    },
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
    const style = TONE_STYLES[message.tone];
    const icon = TYPE_ICONS[message.type] || 'robot';

    return (
        <View className={`${style.bg} ${style.border} border rounded-2xl p-4 mb-3`}>
            <View className="flex-row items-start">
                {showAvatar && (
                    <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                        <MaterialCommunityIcons 
                            name={icon as any} 
                            size={22} 
                            color={style.iconColor} 
                        />
                    </View>
                )}
                
                <View className="flex-1">
                    {message.title && (
                        <Text className="text-base font-bold text-gray-900 mb-1">
                            {message.title}
                        </Text>
                    )}
                    
                    <Text className="text-sm text-gray-700 leading-5">
                        {message.message}
                    </Text>
                    
                    {/* Actions */}
                    {message.actions && message.actions.length > 0 && (
                        <View className="flex-row flex-wrap mt-3 gap-2">
                            {message.actions.map((action) => (
                                <TouchableOpacity
                                    key={action.id}
                                    onPress={() => onAction?.(action.id)}
                                    className={`px-4 py-2 rounded-full ${
                                        action.primary 
                                            ? 'bg-blue-600' 
                                            : 'bg-white border border-gray-200'
                                    }`}
                                >
                                    <Text className={`text-sm font-medium ${
                                        action.primary ? 'text-white' : 'text-gray-700'
                                    }`}>
                                        {action.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                
                {onDismiss && (
                    <TouchableOpacity onPress={onDismiss} className="p-1">
                        <MaterialCommunityIcons name="close" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Timestamp */}
            <Text className="text-xs text-gray-400 mt-2 ml-13">
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
