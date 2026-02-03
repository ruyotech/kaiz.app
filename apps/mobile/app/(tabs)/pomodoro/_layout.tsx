import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function PomodoroLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="history" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}
