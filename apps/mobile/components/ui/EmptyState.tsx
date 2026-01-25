import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    action?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon = '📭', title, message, action, actionLabel, onAction }: EmptyStateProps) {
    return (
        <View className="flex-1 items-center justify-center p-8">
            <Text className="text-6xl mb-4">{icon}</Text>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
                {title}
            </Text>
            <Text className="text-base text-gray-600 text-center mb-4">
                {message}
            </Text>
            {action}
            {actionLabel && onAction && (
                <TouchableOpacity onPress={onAction} className="mt-2 px-4 py-2 bg-blue-600 rounded-lg">
                    <Text className="text-white font-medium">{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
