import { Stack } from 'expo-router';

export default function SprintsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="calendar" />
            <Stack.Screen name="reports" />
            <Stack.Screen name="task/[id]" />
            <Stack.Screen name="epic/[id]" />
            <Stack.Screen name="create-task" />
            <Stack.Screen name="search-tasks" />
            <Stack.Screen name="backlog" />
            <Stack.Screen name="retro/index" />
            <Stack.Screen name="epics/index" />
            <Stack.Screen name="epics/create" />
            <Stack.Screen name="velocity/index" />
            <Stack.Screen name="wiki/index" />
            <Stack.Screen name="task/edit" />
            <Stack.Screen name="templates" />
            <Stack.Screen name="create-template" />
        </Stack>
    );
}
