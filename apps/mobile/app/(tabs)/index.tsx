import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// This screen redirects to sprint calendar
// We don't need a separate dashboard screen
export default function DashboardScreen() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to sprint calendar
        router.replace('/(tabs)/sprints/calendar' as any);
    }, []);

    return null;
}
