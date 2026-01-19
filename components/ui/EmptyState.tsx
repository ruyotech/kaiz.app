import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', title, message, action }: EmptyStateProps) {
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
        </View>
    );
}
