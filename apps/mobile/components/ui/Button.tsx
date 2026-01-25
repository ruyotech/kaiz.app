import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';

interface ButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    className?: string;
}

export function Button({
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
}: ButtonProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return 'bg-blue-600 active:bg-blue-700';
            case 'secondary':
                return 'bg-gray-600 active:bg-gray-700';
            case 'outline':
                return 'bg-transparent border-2 border-blue-600 active:bg-blue-50';
            case 'ghost':
                return 'bg-transparent active:bg-gray-100';
            default:
                return 'bg-blue-600 active:bg-blue-700';
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-2';
            case 'md':
                return 'px-4 py-3';
            case 'lg':
                return 'px-6 py-4';
            default:
                return 'px-4 py-3';
        }
    };

    const getTextColor = () => {
        if (variant === 'outline' || variant === 'ghost') {
            return 'text-blue-600';
        }
        return 'text-white';
    };

    const getTextSize = () => {
        switch (size) {
            case 'sm':
                return 'text-sm';
            case 'md':
                return 'text-base';
            case 'lg':
                return 'text-lg';
            default:
                return 'text-base';
        }
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        rounded-lg
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
        >
            <View className="flex-row items-center justify-center">
                {loading && (
                    <ActivityIndicator
                        size="small"
                        color={variant === 'outline' || variant === 'ghost' ? '#2563EB' : '#FFFFFF'}
                        className="mr-2"
                    />
                )}
                <Text className={`${getTextColor()} ${getTextSize()} font-semibold text-center`}>
                    {children}
                </Text>
            </View>
        </Pressable>
    );
}
