import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SprintsIndex() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to sprint calendar
        router.replace('/(tabs)/sprints/calendar' as any);
    }, []);

    return null;
}
