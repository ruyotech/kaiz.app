import React from 'react';
import { View, Text } from 'react-native';
import { getInitials } from '../../utils/formatters';

interface AvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg';
    imageUrl?: string | null;
}

export function Avatar({ name, size = 'md', imageUrl }: AvatarProps) {
    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'w-8 h-8 text-xs';
            case 'md':
                return 'w-12 h-12 text-base';
            case 'lg':
                return 'w-16 h-16 text-xl';
            default:
                return 'w-12 h-12 text-base';
        }
    };

    const initials = getInitials(name);

    return (
        <View className={`${getSizeStyles()} rounded-full bg-blue-600 items-center justify-center`}>
            <Text className="text-white font-semibold">
                {initials}
            </Text>
        </View>
    );
}
