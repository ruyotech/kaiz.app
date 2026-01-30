import { View, Text, TouchableOpacity, Modal, Animated, Dimensions, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationStore } from '../../store/navigationStore';
import { useNotificationStore } from '../../store/notificationStore';
import { APPS } from '../../utils/navigationConfig';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

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
        // Don't change currentApp for overlays - they're not a context switch
        // These apps should preserve the current bottom bar context
        const overlayApps = ['templates', 'backlog', 'epics', 'taskSearch'];
        if (!overlayApps.includes(app.id)) {
            setCurrentApp(app.id);
        }
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
            <View className="flex-1 bg-[#0A0A0F]">
                {/* Gradient Background Overlay */}
                <LinearGradient
                    colors={['#1a1a2e', '#0A0A0F', '#0A0A0F']}
                    className="absolute inset-0"
                />
                
                {/* Decorative gradient orbs */}
                <View className="absolute top-20 -left-20 w-60 h-60 rounded-full opacity-20" 
                    style={{ backgroundColor: '#3B82F6', transform: [{ scale: 1.5 }] }} 
                />
                <View className="absolute top-40 -right-20 w-40 h-40 rounded-full opacity-15" 
                    style={{ backgroundColor: '#10B981' }} 
                />
                
                {/* Header */}
                <View 
                    className="flex-row justify-between items-center px-5"
                    style={{ paddingTop: insets.top + 8 }}
                >
                    {/* Close button */}
                    <TouchableOpacity 
                        onPress={toggleAppSwitcher}
                        className="w-11 h-11 rounded-full bg-white/5 border border-white/10 items-center justify-center"
                    >
                        <MaterialCommunityIcons name="close" size={22} color="#9CA3AF" />
                    </TouchableOpacity>
                    
                    {/* Notification Button */}
                    <TouchableOpacity 
                        onPress={handleNotifications}
                        className="flex-row items-center"
                        activeOpacity={0.7}
                    >
                        <Animated.View 
                            style={{
                                transform: [{ scale: unreadCount > 0 ? pulseAnim : 1 }],
                            }}
                            className="relative"
                        >
                            <View 
                                className={`w-11 h-11 rounded-full items-center justify-center border ${
                                    unreadCount > 0 ? 'bg-orange-500/15 border-orange-500/30' : 'bg-white/5 border-white/10'
                                }`}
                            >
                                <MaterialCommunityIcons 
                                    name={unreadCount > 0 ? "bell-ring" : "bell-outline"} 
                                    size={22} 
                                    color={unreadCount > 0 ? "#F97316" : "#9CA3AF"} 
                                />
                            </View>
                            {unreadCount > 0 && (
                                <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full items-center justify-center px-1">
                                    <Text className="text-white text-[10px] font-bold">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <Animated.View 
                    style={{ 
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}
                    className="px-5 pt-4 pb-3"
                >
                    <Text className="text-white/50 text-sm font-medium">{t('navigation.appSwitcher.subtitle')}</Text>
                    <Text className="text-white text-2xl font-bold mt-0.5">{t('navigation.appSwitcher.title')}</Text>
                </Animated.View>

                {/* Scrollable Apps Content */}
                <ScrollView 
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                >
                    {/* Featured Apps - Sprints & SensAI */}
                    <Animated.View 
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                        className="flex-row gap-3 mb-4"
                    >
                        {MAIN_APPS.slice(0, 2).map((app, index) => (
                            <FeaturedAppCard 
                                key={app.id} 
                                app={app} 
                                isActive={currentApp === app.id}
                                onPress={() => handleAppSelect(app)} 
                                t={t}
                                delay={index * 80}
                            />
                        ))}
                    </Animated.View>
                    
                    {/* Sprint Tools Section */}
                    <Animated.View 
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                        className="mb-4"
                    >
                        <View className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
                            <View className="px-4 pt-3 pb-2 flex-row items-center">
                                <View className="w-6 h-6 rounded-md bg-blue-500/20 items-center justify-center mr-2">
                                    <MaterialCommunityIcons name="tools" size={14} color="#3B82F6" />
                                </View>
                                <Text className="text-white/40 text-xs font-semibold uppercase tracking-wider">Sprint Tools</Text>
                            </View>
                            <View className="flex-row px-2 pb-3">
                                {MAIN_APPS.slice(2, 6).map((app, index) => (
                                    <CompactAppItem 
                                        key={app.id} 
                                        app={app} 
                                        isActive={currentApp === app.id}
                                        onPress={() => handleAppSelect(app)} 
                                        t={t}
                                        delay={(index + 2) * 40}
                                    />
                                ))}
                            </View>
                        </View>
                    </Animated.View>
                    
                    {/* Productivity Section */}
                    <Animated.View 
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                        className="mb-4"
                    >
                        <View className="flex-row items-center mb-2 px-1">
                            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#F59E0B" />
                            <Text className="text-white/40 text-xs font-semibold uppercase tracking-wider ml-1.5">Productivity</Text>
                        </View>
                        <View className="flex-row gap-3">
                            {MAIN_APPS.slice(6, 8).map((app, index) => (
                                <StandardAppCard 
                                    key={app.id} 
                                    app={app}
                                    isActive={currentApp === app.id}
                                    onPress={() => handleAppSelect(app)} 
                                    t={t}
                                    delay={(index + 6) * 60}
                                />
                            ))}
                        </View>
                    </Animated.View>
                    
                    {/* Growth Section */}
                    <Animated.View 
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                        className="mb-4"
                    >
                        <View className="flex-row items-center mb-2 px-1">
                            <MaterialCommunityIcons name="trending-up" size={16} color="#8B5CF6" />
                            <Text className="text-white/40 text-xs font-semibold uppercase tracking-wider ml-1.5">Growth</Text>
                        </View>
                        <View className="flex-row gap-3">
                            {MAIN_APPS.slice(8, 10).map((app, index) => (
                                <StandardAppCard 
                                    key={app.id} 
                                    app={app}
                                    isActive={currentApp === app.id}
                                    onPress={() => handleAppSelect(app)} 
                                    t={t}
                                    delay={(index + 8) * 60}
                                />
                            ))}
                        </View>
                    </Animated.View>
                    
                    {/* Social Section */}
                    <Animated.View 
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    >
                        <View className="flex-row items-center mb-2 px-1">
                            <MaterialCommunityIcons name="account-group-outline" size={16} color="#06B6D4" />
                            <Text className="text-white/40 text-xs font-semibold uppercase tracking-wider ml-1.5">Social</Text>
                        </View>
                        {MAIN_APPS.slice(10, 11).map((app) => (
                            <WideAppCard 
                                key={app.id} 
                                app={app}
                                isActive={currentApp === app.id}
                                onPress={() => handleAppSelect(app)} 
                                t={t}
                                delay={660}
                            />
                        ))}
                    </Animated.View>
                </ScrollView>

                {/* Footer Actions */}
                <Animated.View 
                    style={{ 
                        opacity: fadeAnim,
                        paddingBottom: insets.bottom + 12
                    }}
                    className="px-4 pt-3 border-t border-white/5"
                >
                    <View className="flex-row gap-3">
                        <TouchableOpacity 
                            onPress={handleSettings}
                            className="flex-1 flex-row items-center justify-center bg-white/[0.04] border border-white/[0.08] rounded-xl py-3"
                        >
                            <MaterialCommunityIcons name="cog-outline" size={20} color="#9CA3AF" />
                            <Text className="text-white/70 font-medium text-sm ml-2">{t('navigation.appSwitcher.settings')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleHelp}
                            className="flex-1 flex-row items-center justify-center bg-white/[0.04] border border-white/[0.08] rounded-xl py-3"
                        >
                            <MaterialCommunityIcons name="help-circle-outline" size={20} color="#9CA3AF" />
                            <Text className="text-white/70 font-medium text-sm ml-2">{t('navigation.appSwitcher.help')}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Featured App Card - Large prominent cards for main apps
function FeaturedAppCard({ 
    app, 
    isActive,
    onPress, 
    t, 
    delay = 0
}: { 
    app: typeof APPS[0]; 
    isActive: boolean;
    onPress: () => void; 
    t: (key: string) => string;
    delay?: number;
}) {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 10,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);
    
    return (
        <Animated.View
            style={{
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
                flex: 1,
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View 
                    className="rounded-2xl p-4 overflow-hidden"
                    style={{ 
                        backgroundColor: isActive ? app.color + '20' : 'rgba(255,255,255,0.03)',
                        borderWidth: isActive ? 1.5 : 1,
                        borderColor: isActive ? app.color + '60' : 'rgba(255,255,255,0.06)',
                    }}
                >
                    {/* Gradient accent */}
                    <View 
                        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20"
                        style={{ 
                            backgroundColor: app.color,
                            transform: [{ translateX: 30 }, { translateY: -30 }],
                        }}
                    />
                    
                    <View className="flex-row items-center">
                        <View 
                            className="w-12 h-12 rounded-xl items-center justify-center"
                            style={{ backgroundColor: app.color + '20' }}
                        >
                            <MaterialCommunityIcons
                                name={app.icon as any}
                                size={26}
                                color={app.color}
                            />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-white font-semibold text-base" numberOfLines={1}>
                                {t(app.nameKey)}
                            </Text>
                            {isActive && (
                                <View className="flex-row items-center mt-0.5">
                                    <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
                                    <Text className="text-white/40 text-xs">Active</Text>
                                </View>
                            )}
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// Standard App Card - Medium sized cards
function StandardAppCard({ 
    app, 
    isActive,
    onPress, 
    t, 
    delay = 0
}: { 
    app: typeof APPS[0]; 
    isActive: boolean;
    onPress: () => void; 
    t: (key: string) => string;
    delay?: number;
}) {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 10,
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
    
    return (
        <Animated.View
            style={{
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
                flex: 1,
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View 
                    className="rounded-2xl p-4 items-center"
                    style={{ 
                        backgroundColor: isActive ? app.color + '15' : 'rgba(255,255,255,0.03)',
                        borderWidth: 1,
                        borderColor: isActive ? app.color + '40' : 'rgba(255,255,255,0.06)',
                    }}
                >
                    <View 
                        className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                        style={{ backgroundColor: app.color + '20' }}
                    >
                        <MaterialCommunityIcons
                            name={app.icon as any}
                            size={28}
                            color={app.color}
                        />
                    </View>
                    <Text className="text-white font-medium text-sm text-center" numberOfLines={1}>
                        {t(app.nameKey)}
                    </Text>
                    {isActive && (
                        <View className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5" />
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// Wide App Card - Full width card for single items
function WideAppCard({ 
    app, 
    isActive,
    onPress, 
    t, 
    delay = 0
}: { 
    app: typeof APPS[0]; 
    isActive: boolean;
    onPress: () => void; 
    t: (key: string) => string;
    delay?: number;
}) {
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 10,
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
    
    return (
        <Animated.View
            style={{
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View 
                    className="rounded-2xl p-4 flex-row items-center"
                    style={{ 
                        backgroundColor: isActive ? app.color + '15' : 'rgba(255,255,255,0.03)',
                        borderWidth: 1,
                        borderColor: isActive ? app.color + '40' : 'rgba(255,255,255,0.06)',
                    }}
                >
                    <View 
                        className="w-12 h-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: app.color + '20' }}
                    >
                        <MaterialCommunityIcons
                            name={app.icon as any}
                            size={24}
                            color={app.color}
                        />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-white font-semibold text-base">
                            {t(app.nameKey)}
                        </Text>
                        <Text className="text-white/40 text-xs mt-0.5">Connect with others</Text>
                    </View>
                    {isActive && (
                        <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// Compact App Item for Sprint Tools section
function CompactAppItem({ 
    app, 
    isActive,
    onPress, 
    t, 
    delay = 0
}: { 
    app: typeof APPS[0]; 
    isActive: boolean;
    onPress: () => void; 
    t: (key: string) => string;
    delay?: number;
}) {
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;
    
    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    tension: 80,
                    friction: 10,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);
    
    return (
        <Animated.View
            style={{ 
                opacity: opacityAnim, 
                flex: 1,
                transform: [{ translateY }],
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                className="items-center px-1 py-2"
            >
                <View 
                    className="w-11 h-11 rounded-xl items-center justify-center mb-1.5"
                    style={{ 
                        backgroundColor: isActive ? app.color + '25' : app.color + '12',
                        borderWidth: isActive ? 1 : 0,
                        borderColor: app.color + '50',
                    }}
                >
                    <MaterialCommunityIcons
                        name={app.icon as any}
                        size={20}
                        color={app.color}
                    />
                </View>
                <Text 
                    className={`text-[10px] font-medium text-center ${isActive ? 'text-white' : 'text-white/60'}`}
                    numberOfLines={1}
                >
                    {t(app.nameKey)}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}
