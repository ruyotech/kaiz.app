import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationStore } from '../../store/navigationStore';
import { NAV_CONFIGS } from '../../utils/navigationConfig';
import { useRouter, usePathname } from 'expo-router';
import { AppSwitcher } from './AppSwitcher';
import { MoreMenu } from './MoreMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export function CustomTabBar() {
    const { currentApp, toggleAppSwitcher, toggleMoreMenu } = useNavigationStore();
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const icons = NAV_CONFIGS[currentApp];

    const handleIconPress = (route: string) => {
        if (route === 'more') {
            toggleMoreMenu();
        } else {
            router.push(route as any);
        }
    };

    const isActive = (route: string) => {
        if (route === 'more') return false;
        return pathname.startsWith(route);
    };

    // Get main and more icons for the current app
    const mainIcon = icons[0]; // First icon is the main one (e.g., Sprint, Daily)
    const moreIcon = icons[icons.length - 1]; // Last icon is always More

    return (
        <View>
            <View
                className="bg-white border-t border-gray-100"
                style={{
                    paddingBottom: insets.bottom,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 20,
                }}
            >
                <View className="flex-row items-end justify-around px-3 pb-1" style={{ paddingTop: 6 }}>
                    {/* 1. Apps Icon */}
                    <TouchableOpacity
                        className="items-center flex-1"
                        onPress={toggleAppSwitcher}
                    >
                        <MaterialCommunityIcons
                            name="view-grid"
                            size={30}
                            color="#6B7280"
                            style={{ marginBottom: -3 }}
                        />
                        <Text className="text-[10px] text-gray-600 font-medium">Apps</Text>
                    </TouchableOpacity>

                    {/* 2. Main App Icon */}
                    <TouchableOpacity
                        className="items-center flex-1"
                        onPress={() => handleIconPress(mainIcon.route)}
                    >
                        <MaterialCommunityIcons
                            name={mainIcon.icon as any}
                            size={30}
                            color={isActive(mainIcon.route) ? '#3B82F6' : '#6B7280'}
                            style={{ marginBottom: -3 }}
                        />
                        <Text
                            className="text-[10px] font-medium"
                            style={{
                                color: isActive(mainIcon.route) ? '#3B82F6' : '#6B7280'
                            }}
                        >
                            {mainIcon.name}
                        </Text>
                    </TouchableOpacity>

                    {/* 3. More Icon */}
                    <TouchableOpacity
                        className="items-center flex-1"
                        onPress={() => handleIconPress(moreIcon.route)}
                    >
                        <MaterialCommunityIcons
                            name={moreIcon.icon as any}
                            size={30}
                            color="#6B7280"
                            style={{ marginBottom: -3 }}
                        />
                        <Text className="text-[10px] text-gray-600 font-medium">
                            {moreIcon.name}
                        </Text>
                    </TouchableOpacity>

                    {/* 4. Command Center Icon */}
                    <TouchableOpacity
                        className="items-center flex-1"
                        onPress={() => router.push('/(tabs)/command-center')}
                    >
                        <MaterialCommunityIcons
                            name="plus" // Kept the simple plus as requested by "creative solid" earlier, but can revert if needed
                            size={32}
                            color={pathname.startsWith('/(tabs)/command-center') ? '#3B82F6' : '#6B7280'}
                            style={{ marginBottom: -3 }}
                        />
                        <Text
                            className="text-[10px] font-medium"
                            style={{
                                color: pathname.startsWith('/(tabs)/command-center') ? '#3B82F6' : '#6B7280'
                            }}
                        >
                            Create
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <AppSwitcher />
            <MoreMenu />
        </View>
    );
}
