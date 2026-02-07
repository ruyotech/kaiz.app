import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NotificationBell } from '../notifications/NotificationBell';
import { useThemeContext } from '../../providers/ThemeProvider';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
    useSafeArea?: boolean;
    children?: React.ReactNode;
    showNotifications?: boolean;
}

export function ScreenHeader({ 
    title, 
    subtitle, 
    showBack = false, 
    rightAction, 
    useSafeArea = true, 
    children,
    showNotifications = true,
}: ScreenHeaderProps) {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();

    const content = (
        <>
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                    {showBack && (
                        <Pressable onPress={() => router.back()} className="mr-3">
                            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
                        </Pressable>
                    )}
                    <View className="flex-1">
                        <Text 
                            className="text-xl font-bold"
                            style={{ color: colors.text }}
                        >
                            {title}
                        </Text>
                        {subtitle && (
                            <Text 
                                className="text-sm mt-0.5"
                                style={{ color: colors.textSecondary }}
                            >
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>
                <View className="flex-row items-center ml-2">
                    {showNotifications && (
                        <View className="mr-2">
                            <NotificationBell size={22} variant="outlined" />
                        </View>
                    )}
                    {rightAction && (
                        <View>
                            {rightAction}
                        </View>
                    )}
                </View>
            </View>
            {children}
        </>
    );

    if (useSafeArea) {
        return (
            <SafeAreaView 
                edges={['top']} 
                style={{ 
                    backgroundColor: colors.card,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                }}
            >
                <View className={`px-4 ${children ? 'pb-0' : 'pb-3'}`}>
                    {content}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View 
            className={`px-4 pt-12 ${children ? 'pb-0' : 'pb-3'}`}
            style={{ 
                backgroundColor: colors.card,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
            }}
        >
            {content}
        </View>
    );
}
