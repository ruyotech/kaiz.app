import { Stack } from 'expo-router';
import { View } from 'react-native';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';
import { useThemeContext } from '../../providers/ThemeProvider';

export default function TabsLayout() {
    const { colors } = useThemeContext();
    
    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="sprints" />
                <Stack.Screen name="sensai" />
                <Stack.Screen name="challenges" />
                <Stack.Screen name="essentia" />
                <Stack.Screen name="motivation" />
                <Stack.Screen name="command-center" />
                <Stack.Screen name="community" />
                <Stack.Screen name="family" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="notifications" />
            </Stack>

            <CustomTabBar />
        </View>
    );
}
