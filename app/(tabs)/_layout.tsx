import { Stack } from 'expo-router';
import { View } from 'react-native';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';

export default function TabsLayout() {
    return (
        <View className="flex-1">


            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="sdlc" />
                <Stack.Screen name="challenges" />
                <Stack.Screen name="essentia" />
                <Stack.Screen name="motivation" />
                <Stack.Screen name="command-center" />
                <Stack.Screen name="community" />
                <Stack.Screen name="settings" />
            </Stack>

            <CustomTabBar />
        </View>
    );
}
