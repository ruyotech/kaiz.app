import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useThemeContext } from '../../providers/ThemeProvider';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: ViewStyle;
}

export function Card({ children, className = '', style }: CardProps) {
    const { colors, isDark } = useThemeContext();
    
    return (
        <View 
            className={`rounded-lg shadow-md p-4 ${className}`} 
            style={[
                { 
                    backgroundColor: colors.card,
                    shadowColor: colors.shadow,
                },
                style
            ]}
        >
            {children}
        </View>
    );
}
