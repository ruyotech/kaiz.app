import React from 'react';
import { View } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <View className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
            {children}
        </View>
    );
}
