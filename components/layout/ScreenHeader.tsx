import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack = false, rightAction }: ScreenHeaderProps) {
    const router = useRouter();

    return (
        <View className="bg-white border-b border-gray-200 px-4 py-3">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    {showBack && (
                        <Pressable onPress={() => router.back()} className="mr-3">
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#2563EB" />
                        </Pressable>
                    )}
                    <View className="flex-1">
                        <Text className="text-xl font-bold text-gray-900">{title}</Text>
                        {subtitle && (
                            <Text className="text-sm text-gray-600 mt-0.5">{subtitle}</Text>
                        )}
                    </View>
                </View>
                {rightAction && (
                    <View className="ml-2">
                        {rightAction}
                    </View>
                )}
            </View>
        </View>
    );
}
