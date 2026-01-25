import React from 'react';
import { Text, View } from 'react-native';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return 'bg-green-100 text-green-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'info':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getSizeStyles = () => {
        if (size === 'sm') {
            return 'px-2 py-0.5 text-xs';
        }
        return 'px-3 py-1 text-sm';
    };

    const [bgColor, textColor] = getVariantStyles().split(' ');

    return (
        <View className={`${bgColor} ${getSizeStyles()} rounded-full self-start ${className}`}>
            <Text className={`${textColor} font-medium`}>
                {children}
            </Text>
        </View>
    );
}
