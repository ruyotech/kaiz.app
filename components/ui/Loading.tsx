import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
    size?: 'small' | 'large';
    message?: string;
    fullScreen?: boolean;
}

export function Loading({ size = 'large', message, fullScreen = false }: LoadingProps) {
    const content = (
        <View className="items-center justify-center p-4">
            <ActivityIndicator size={size} color="#3B82F6" />
            {message && (
                <Text className="text-gray-600 mt-2">
                    {message}
                </Text>
            )}
        </View>
    );

    if (fullScreen) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                {content}
            </View>
        );
    }

    return content;
}
