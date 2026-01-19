import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    safeArea?: boolean;
}

export function Container({ children, className = '', safeArea = true }: ContainerProps) {
    const content = (
        <View className={`flex-1 bg-gray-50 ${className}`}>
            {children}
        </View>
    );

    if (safeArea) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                {content}
            </SafeAreaView>
        );
    }

    return content;
}
