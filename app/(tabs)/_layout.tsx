import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="sdlc"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="check-circle" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="command-center"
                options={{
                    title: 'Command',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="gamepad-variant" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bills"
                options={{
                    title: 'Bills',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cash-multiple" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="challenges"
                options={{
                    title: 'Challenges',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="trophy" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="books"
                options={{
                    title: 'Books',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="motivation"
                options={{
                    title: 'Motivation',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="lightbulb-on" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
