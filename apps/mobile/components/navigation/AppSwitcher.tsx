import { View, Text, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationStore } from '../../store/navigationStore';
import { useNotificationStore } from '../../store/notificationStore';
import { APPS } from '../../utils/navigationConfig';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useEffect } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Filter out settings and notifications from main apps grid (they go to footer)
const MAIN_APPS = APPS.filter(app => app.id !== 'settings' && app.id !== 'notifications');

export function AppSwitcher() {
    const { isAppSwitcherOpen, toggleAppSwitcher, setCurrentApp, currentApp } = useNavigationStore();
    const { unreadCount } = useNotificationStore();
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    
    // Animation values for staggered entrance
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    
    // Pulsing animation for notification badge
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        if (isAppSwitcherOpen) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 65,
                    friction: 10,
                    useNativeDriver: true,
                }),
            ]).start();
            
            // Start pulsing animation for notification badge if there are unread notifications
            if (unreadCount > 0) {
                Animated.loop(
                    Animated.sequence([
                        Animated.parallel([
                            Animated.timing(pulseAnim, {
                                toValue: 1.2,
                                duration: 800,
                                useNativeDriver: true,
                            }),
                            Animated.timing(glowAnim, {
                                toValue: 1,
                                duration: 800,
                                useNativeDriver: true,
                            }),
                        ]),
                        Animated.parallel([
                            Animated.timing(pulseAnim, {
                                toValue: 1,
                                duration: 800,
                                useNativeDriver: true,
                            }),
                            Animated.timing(glowAnim, {
                                toValue: 0,
                                duration: 800,
                                useNativeDriver: true,
                            }),
                        ]),
                    ])
                ).start();
            }
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
            pulseAnim.setValue(1);
            glowAnim.setValue(0);
        }
    }, [isAppSwitcherOpen, unreadCount]);

    const handleAppSelect = (app: typeof APPS[0]) => {
        setCurrentApp(app.id);
        router.push(app.route as any);
        toggleAppSwitcher();
    };

    const handleNotifications = () => {
        router.push('/(tabs)/notifications' as any);
        toggleAppSwitcher();
    };

    const handleSettings = () => {
        setCurrentApp('settings');
        router.push('/(tabs)/settings' as any);
        toggleAppSwitcher();
    };

    const handleHelp = () => {
        // Navigate to help/about section
        router.push('/(tabs)/settings/about' as any);
        toggleAppSwitcher();
    };

    return (
        <Modal
            visible={isAppSwitcherOpen}
            transparent
            animationType="fade"
            onRequestClose={toggleAppSwitcher}
            statusBarTranslucent
        >
            <View className="flex-1 bg-gray-950/95">
                {/* Minimal Header - Close & Notification */}
                <View 
                    className="flex-row justify-between items-center px-6"
                    style={{ paddingTop: insets.top + 12 }}
                >
                    {/* Close button */}
                    <TouchableOpacity 
                        onPress={toggleAppSwitcher}
                        className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                    >
                        <MaterialCommunityIcons name="close" size={22} color="#fff" />
                    </TouchableOpacity>
                    
                    {/* Enhanced Notification Button */}
                    <TouchableOpacity 
                        onPress={handleNotifications}
                        className="flex-row items-center"
                        activeOpacity={0.7}
                    >
                        {unreadCount > 0 && (
                            <View className="mr-2">
                                <Text className="text-white/60 text-xs font-medium">
                                    {unreadCount} {t('navigation.appSwitcher.newNotifications')}
                                </Text>
                            </View>
                        )}
                        <Animated.View 
                            style={{
                                transform: [{ scale: unreadCount > 0 ? pulseAnim : 1 }],
                            }}
                            className="relative"
                        >
                            <View 
                                className={`w-12 h-12 rounded-2xl items-center justify-center ${
                                    unreadCount > 0 ? 'bg-orange-500/20' : 'bg-white/10'
                                }`}
                            >
                                <MaterialCommunityIcons 
                                    name={unreadCount > 0 ? "bell-ring" : "bell-outline"} 
                                    size={24} 
                                    color={unreadCount > 0 ? "#F97316" : "#fff"} 
                                />
                            </View>
                            
                            {/* Animated Badge with count */}
                            {unreadCount > 0 && (
                                <Animated.View 
                                    style={{
                                        opacity: glowAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [1, 0.8],
                                        }),
                                        transform: [{ scale: pulseAnim }],
                                    }}
                                    className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full items-center justify-center px-1 border-2 border-gray-950"
                                >
                                    <Text className="text-white text-[10px] font-bold">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </Animated.View>
                            )}
                            
                            {/* Glow effect ring */}
                            {unreadCount > 0 && (
                                <Animated.View 
                                    style={{
                                        position: 'absolute',
                                        top: -4,
                                        left: -4,
                                        right: -4,
                                        bottom: -4,
                                        borderRadius: 20,
                                        borderWidth: 2,
                                        borderColor: '#F97316',
                                        opacity: glowAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 0.5],
                                        }),
                                    }}
                                />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                {/* Title with greeting */}
                <Animated.View 
                    style={{ 
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}
                    className="px-6 pt-6 pb-4"
                >
                    <Text className="text-white/60 text-base font-medium">{t('navigation.appSwitcher.subtitle')}</Text>
                    <Text className="text-white text-3xl font-bold mt-1">{t('navigation.appSwitcher.title')}</Text>
                </Animated.View>

                {/* Apps Grid - Creative Honeycomb-inspired layout */}
                <Animated.View 
                    style={{ 
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}
                    className="flex-1 px-4 pt-4"
                >
                    {/* First row - 2 apps */}
                    <View className="flex-row justify-center mb-4">
                        {MAIN_APPS.slice(0, 2).map((app, index) => (
                            <AppCard 
                                key={app.id} 
                                app={app} 
                                isActive={currentApp === app.id}
                                onPress={() => handleAppSelect(app)} 
                                t={t}
                                delay={index * 50}
                                isLarge
                            />
                        ))}
                    </View>
                    
                    {/* Second row - 3 apps */}
                    <View className="flex-row justify-center mb-4">
                        {MAIN_APPS.slice(2, 5).map((app, index) => (
                            <AppCard 
                                key={app.id} 
                                app={app} 
                                isActive={currentApp === app.id}
                                onPress={() => handleAppSelect(app)} 
                                t={t}
                                delay={(index + 2) * 50}
                            />
                        ))}
                    </View>
                    
                    {/* Third row - 2 apps */}
                    <View className="flex-row justify-center">
                        {MAIN_APPS.slice(5, 7).map((app, index) => (
                            <AppCard 
                                key={app.id} 
                                app={app}
                                isActive={currentApp === app.id}
                                onPress={() => handleAppSelect(app)} 
                                t={t}
                                delay={(index + 5) * 50}
                                isLarge
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Footer - Settings & Help */}
                <Animated.View 
                    style={{ 
                        opacity: fadeAnim,
                        paddingBottom: insets.bottom + 16
                    }}
                    className="px-6 pt-4"
                >
                    <View className="flex-row justify-center gap-4">
                        {/* Settings */}
                        <TouchableOpacity 
                            onPress={handleSettings}
                            className="flex-row items-center bg-white/10 rounded-2xl px-6 py-4"
                        >
                            <View className="w-10 h-10 rounded-xl bg-gray-700 items-center justify-center mr-3">
                                <MaterialCommunityIcons name="cog-outline" size={22} color="#9CA3AF" />
                            </View>
                            <Text className="text-white font-semibold text-base">{t('navigation.appSwitcher.settings')}</Text>
                        </TouchableOpacity>

                        {/* Help */}
                        <TouchableOpacity 
                            onPress={handleHelp}
                            className="flex-row items-center bg-white/10 rounded-2xl px-6 py-4"
                        >
                            <View className="w-10 h-10 rounded-xl bg-cyan-900/50 items-center justify-center mr-3">
                                <MaterialCommunityIcons name="help-circle-outline" size={22} color="#22D3EE" />
                            </View>
                            <Text className="text-white font-semibold text-base">{t('navigation.appSwitcher.help')}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// App Card Component with glassmorphism effect
function AppCard({ 
    app, 
    isActive,
    onPress, 
    t, 
    delay = 0,
    isLarge = false 
}: { 
    app: typeof APPS[0]; 
    isActive: boolean;
    onPress: () => void; 
    t: (key: string) => string;
    delay?: number;
    isLarge?: boolean;
}) {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 65,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);
    
    const cardWidth = isLarge ? (SCREEN_WIDTH - 48) / 2 : (SCREEN_WIDTH - 56) / 3;
    
    return (
        <Animated.View
            style={{
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                style={{ 
                    width: cardWidth,
                    marginHorizontal: 4,
                }}
            >
                <View 
                    className={`rounded-3xl p-4 ${isLarge ? 'py-6' : 'py-4'}`}
                    style={{ 
                        backgroundColor: isActive ? app.color + '30' : 'rgba(255,255,255,0.08)',
                        borderWidth: isActive ? 2 : 0,
                        borderColor: app.color,
                    }}
                >
                    {/* Icon with gradient background */}
                    <View 
                        className={`self-center rounded-2xl items-center justify-center ${isLarge ? 'w-16 h-16' : 'w-14 h-14'}`}
                        style={{ backgroundColor: app.color + '25' }}
                    >
                        <MaterialCommunityIcons
                            name={app.icon as any}
                            size={isLarge ? 34 : 28}
                            color={app.color}
                        />
                    </View>
                    
                    {/* App name */}
                    <Text 
                        className={`text-white text-center font-semibold mt-3 ${isLarge ? 'text-base' : 'text-sm'}`}
                        numberOfLines={1}
                    >
                        {t(app.nameKey)}
                    </Text>
                    
                    {/* Active indicator */}
                    {isActive && (
                        <View 
                            className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: app.color }}
                        />
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}
