import { Stack } from 'expo-router';

export default function SprintsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Core sprint screens */}
            <Stack.Screen name="index" />
            <Stack.Screen name="calendar" />
            <Stack.Screen name="backlog" />

            {/* Task & epic management */}
            <Stack.Screen name="task/[id]" />
            <Stack.Screen name="task/edit" />
            <Stack.Screen name="epic/[id]" />
            <Stack.Screen name="create-task" />
            <Stack.Screen name="search-tasks" />
            <Stack.Screen name="epics/index" />
            <Stack.Screen name="epics/create" />
            <Stack.Screen name="templates" />
            <Stack.Screen name="create-template" />

            {/* Sprint ceremonies */}
            <Stack.Screen name="standup" />
            <Stack.Screen name="planning" />
            <Stack.Screen name="retrospective" />
            <Stack.Screen name="review" />

            {/* Analytics & tools */}
            <Stack.Screen name="velocity" />
            <Stack.Screen name="intake" />
            <Stack.Screen name="insights" />
            <Stack.Screen name="preferences" />
        </Stack>
    );
}
