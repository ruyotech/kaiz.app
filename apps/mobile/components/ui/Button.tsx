import React from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeContext } from '../../providers/ThemeProvider';

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
    const { colors, isDark } = useThemeContext();

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return { backgroundColor: colors.primary };
            case 'secondary':
                return { backgroundColor: isDark ? '#4B5563' : '#4B5563' };
            case 'outline':
                return { 
                    backgroundColor: 'transparent', 
                    borderWidth: 2, 
                    borderColor: colors.primary 
                };
            case 'ghost':
                return { backgroundColor: 'transparent' };
            default:
                return { backgroundColor: colors.primary };
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
            return colors.primary;
        }
        return colors.textInverse;
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
        ${getSizeStyles()}
        rounded-lg
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
            style={getVariantStyles()}
        >
            <View className="flex-row items-center justify-center">
                {loading && (
                    <ActivityIndicator
                        size="small"
                        color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse}
                        className="mr-2"
                    />
                )}
                <Text 
                    className={`${getTextSize()} font-semibold text-center`}
                    style={{ color: getTextColor() }}
                >
                    {children}
                </Text>
            </View>
        </Pressable>
    );
}
