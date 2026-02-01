import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../providers/ThemeProvider';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    safeArea?: boolean;
}

export function Container({ children, className = '', safeArea = true }: ContainerProps) {
    const { colors, isDark } = useThemeContext();
    
    const content = (
        <View 
            className={`flex-1 ${className}`}
            style={{ backgroundColor: colors.background }}
        >
            {children}
        </View>
    );

    if (safeArea) {
        return (
            <SafeAreaView 
                className="flex-1"
                style={{ backgroundColor: colors.background }}
            >
                {content}
            </SafeAreaView>
        );
    }

    return content;
}
