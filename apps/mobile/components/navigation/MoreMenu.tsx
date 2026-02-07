import { View, Text, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationStore } from '../../store/navigationStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { MORE_MENUS } from '../../utils/navigationConfig';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useTranslation } from '../../hooks/useTranslation';
import { useThemeContext } from '../../providers/ThemeProvider';

export function MoreMenu() {
    const { isMoreMenuOpen, toggleMoreMenu, currentApp } = useNavigationStore();
    const { clearAllNotifications } = useNotificationStore();
    const { logout } = useAuthStore();
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();

    // Fallback to sprints menu items if current app doesn't have a menu defined
    const menuItems = MORE_MENUS[currentApp] || MORE_MENUS['sprints'] || [];

    const handleItemPress = (route: string) => {
        // Handle special actions
        if (route === 'logout') {
            Alert.alert(
                t('navigation.moreMenu.signOut'),
                t('navigation.moreMenu.signOutConfirm'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    { 
                        text: t('navigation.moreMenu.signOut'), 
                        style: 'destructive',
                        onPress: () => {
                            toggleMoreMenu();
                            logout();
                            router.replace('/(auth)/login');
                        }
                    },
                ]
            );
            return;
        }
        
        if (route === 'clear-notifications') {
            Alert.alert(
                t('navigation.moreMenu.clearNotifications'),
                t('navigation.moreMenu.clearNotificationsConfirm'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    { 
                        text: t('navigation.moreMenu.clearAll'), 
                        style: 'destructive',
                        onPress: () => {
                            clearAllNotifications();
                            toggleMoreMenu();
                        }
                    },
                ]
            );
            return;
        }

        router.push(route as any);
        toggleMoreMenu();
    };

    return (
        <Modal
            visible={isMoreMenuOpen}
            transparent
            animationType="fade"
            onRequestClose={toggleMoreMenu}
        >
            <Pressable
                className="flex-1 justify-end"
                style={{ backgroundColor: colors.overlay }}
                onPress={toggleMoreMenu}
            >
                <Pressable 
                    className="rounded-t-3xl p-6"
                    style={{ backgroundColor: colors.card }}
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text 
                            className="text-2xl font-bold"
                            style={{ color: colors.text }}
                        >{t('navigation.moreMenu.title')}</Text>
                        <TouchableOpacity onPress={toggleMoreMenu}>
                            <MaterialCommunityIcons name="close" size={24} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <View>
                        {menuItems.map((item, index) => {
                            const isDestructive = item.route === 'logout' || item.route === 'clear-notifications';
                            return (
                                <TouchableOpacity
                                    key={index}
                                    className="flex-row items-center py-4"
                                    style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                                    onPress={() => handleItemPress(item.route)}
                                >
                                    <View 
                                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: isDestructive ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2') : (isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF') }}
                                    >
                                        <MaterialCommunityIcons
                                            name={item.icon as any}
                                            size={20}
                                            color={isDestructive ? '#EF4444' : colors.primary}
                                        />
                                    </View>
                                    <Text 
                                        className="text-base flex-1"
                                        style={{ color: isDestructive ? '#EF4444' : colors.text }}
                                    >
                                        {t(item.nameKey)}
                                    </Text>
                                    {!isDestructive && (
                                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
