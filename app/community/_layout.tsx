import { Stack } from 'expo-router';
import { View } from 'react-native';
import { CommunityTabBar } from '../../components/community/CommunityTabBar';

export default function CommunityLayout() {
    return (
        <View className="flex-1">
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="knowledge" />
                <Stack.Screen name="questions" />
                <Stack.Screen name="wins" />
                <Stack.Screen name="templates" />
                <Stack.Screen name="leaderboard" />
                <Stack.Screen name="support" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="article" />
                <Stack.Screen name="question-detail" />
            </Stack>
            <CommunityTabBar />
        </View>
    );
}
