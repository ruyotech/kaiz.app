import { Stack } from 'expo-router';
import { View } from 'react-native';
import { CustomTabBar } from '../../components/navigation/CustomTabBar';

export default function TabsLayout() {
    return (
        <View className="flex-1">


            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="sdlc" />
                <Stack.Screen name="bills" />
                <Stack.Screen name="challenges" />
                <Stack.Screen name="books" />
                <Stack.Screen name="motivation" />
                <Stack.Screen name="command-center" />
            </Stack>

            <CustomTabBar />
        </View>
    );
}
