import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
    { id: 'today', label: 'Today', icon: 'home', route: '/essentia' },
    { id: 'explore', label: 'Explore', icon: 'compass', route: '/essentia/explore' },
    { id: 'library', label: 'Library', icon: 'bookshelf', route: '/essentia/library' },
    { id: 'growth', label: 'Growth', icon: 'chart-line', route: '/essentia/growth' },
];

export function EssentiaTabBar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const isActive = (route: string) => {
        if (route === '/essentia') {
            return pathname === '/(tabs)/essentia' || pathname === '/essentia';
        }
        return pathname.includes(route);
    };

    return (
        <View 
            className="bg-white border-t border-gray-200 flex-row items-center justify-around"
            style={{ paddingBottom: insets.bottom, paddingTop: 8 }}
        >
            {TABS.map(tab => (
                <TouchableOpacity
                    key={tab.id}
                    onPress={() => router.push(`/(tabs)${tab.route}` as any)}
                    className="items-center py-2 px-4"
                >
                    <MaterialCommunityIcons
                        name={tab.icon as any}
                        size={24}
                        color={isActive(tab.route) ? '#3B82F6' : '#9CA3AF'}
                    />
                    <Text 
                        className={`text-xs mt-1 font-medium ${
                            isActive(tab.route) ? 'text-blue-600' : 'text-gray-500'
                        }`}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}
