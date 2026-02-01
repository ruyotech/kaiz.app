/**
 * Family Tab Group Layout
 * 
 * Stack navigator for family-related screens
 */

import { Stack } from 'expo-router';
import { useThemeContext } from '../../../providers/ThemeProvider';

export default function FamilyLayout() {
    const { colors, isDark } = useThemeContext();
    
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Stack.Screen 
                name="index" 
                options={{ 
                    title: 'Family',
                    headerShown: false,
                }}
            />
            <Stack.Screen 
                name="members" 
                options={{ 
                    title: 'Members',
                    headerShown: false,
                    presentation: 'card',
                }}
            />
            <Stack.Screen 
                name="shared-tasks" 
                options={{ 
                    title: 'Shared Tasks',
                    headerShown: false,
                    presentation: 'card',
                }}
            />
            <Stack.Screen 
                name="shared-calendar" 
                options={{ 
                    title: 'Family Calendar',
                    headerShown: false,
                    presentation: 'card',
                }}
            />
            <Stack.Screen 
                name="family-standup" 
                options={{ 
                    title: 'Standup',
                    headerShown: false,
                    presentation: 'card',
                }}
            />
        </Stack>
    );
}
