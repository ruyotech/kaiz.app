import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export function GlobalHeader() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleMenuPress = () => {
        // TODO: Open drawer/menu
        console.log('Menu pressed');
    };

    const handleNotificationsPress = () => {
        // Navigate to notifications screen
        router.push('/notifications' as any);
    };

    return (
        <View
            className="bg-white border-b border-gray-200 flex-row items-center justify-between px-4"
            style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
        >
            {/* Hamburger Menu - Left */}
            <TouchableOpacity
                onPress={handleMenuPress}
                className="p-2"
            >
                <MaterialCommunityIcons name="menu" size={24} color="#374151" />
            </TouchableOpacity>

            {/* App Title (optional - can be customized per screen) */}
            <Text className="text-lg font-bold text-gray-800">Kaiz1</Text>

            {/* Notifications - Right */}
            <TouchableOpacity
                onPress={handleNotificationsPress}
                className="p-2"
            >
                <MaterialCommunityIcons name="bell-outline" size={24} color="#374151" />
                {/* Notification badge - can be conditionally shown */}
                <View className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2" />
            </TouchableOpacity>
        </View>
    );
}
