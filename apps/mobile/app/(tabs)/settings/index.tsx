/**
 * SettingsScreen.tsx - Modern Settings Page for Kaiz LifeOS
 * 
 * A beautifully designed settings screen featuring:
 * - Modern inset grouped card layout (iOS-style)
 * - Real data bindings from Zustand stores
 * - Tri-state theme mode (Light/Dark/System)
 * - Command Center, Sprints & App System settings
 * - Dynamic app version from expo-constants
 * - Full i18n localization support
 * 
 * @author Kaiz Team
 * @version 2.1.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Modal,
    Linking,
    Platform,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

// Stores
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { usePreferencesStore, type ThemeMode, type SupportedLocale } from '../../../store/preferencesStore';
import { useSettingsStore, type SprintViewMode, type AIModel } from '../../../store/settingsStore';
import { useBiometricStore } from '../../../store/biometricStore';

// Hooks
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemeContext } from '../../../providers/ThemeProvider';

// Constants
import { SUPPORTED_LANGUAGES } from '../../../utils/constants';

// ============================================================================
// Types
// ============================================================================

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface SettingItemProps {
    icon: IconName;
    iconColor: string;
    iconBgColor: string;
    label: string;
    sublabel?: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
    isLast?: boolean;
    colors?: any;
}

interface SettingSectionProps {
    title: string;
    titleIcon?: string;
    children: React.ReactNode;
    colors?: any;
}

interface ToggleSettingProps {
    icon: IconName;
    iconColor: string;
    iconBgColor: string;
    label: string;
    sublabel?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    isLast?: boolean;
    colors?: any;
}

// ============================================================================
// Reusable Components
// ============================================================================

/**
 * Modern inset grouped section container
 */
function SettingSection({ title, titleIcon, children, colors }: SettingSectionProps) {
    const { colors: themeColors } = useThemeContext();
    const c = colors || themeColors;
    
    return (
        <View className="mb-6">
            <View className="flex-row items-center mb-2.5 px-1">
                {titleIcon && (
                    <Text className="text-base mr-1.5">{titleIcon}</Text>
                )}
                <Text 
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: c.textSecondary }}
                >
                    {title}
                </Text>
            </View>
            <View 
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ 
                    backgroundColor: c.card,
                    borderWidth: 1,
                    borderColor: c.border,
                }}
            >
                {children}
            </View>
        </View>
    );
}

/**
 * Modern setting item with icon, labels, and optional chevron
 */
function SettingItem({
    icon,
    iconColor,
    iconBgColor,
    label,
    sublabel,
    value,
    onPress,
    rightElement,
    showChevron = true,
    isLast = false,
    colors,
}: SettingItemProps) {
    const { colors: themeColors } = useThemeContext();
    const c = colors || themeColors;
    
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.6 : 1}
            className="flex-row items-center px-4 py-3.5"
            style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: c.border }}
        >
            {/* Icon */}
            <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: iconBgColor }}
            >
                <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
            </View>
            
            {/* Labels */}
            <View className="flex-1">
                <Text className="text-[15px] font-medium" style={{ color: c.text }}>{label}</Text>
                {sublabel && (
                    <Text className="text-xs mt-0.5" style={{ color: c.textSecondary }}>{sublabel}</Text>
                )}
            </View>
            
            {/* Right side */}
            {rightElement ? (
                rightElement
            ) : (
                <View className="flex-row items-center">
                    {value && (
                        <Text className="text-sm mr-2" style={{ color: c.textSecondary }}>{value}</Text>
                    )}
                    {showChevron && onPress && (
                        <MaterialCommunityIcons name="chevron-right" size={20} color={c.textTertiary} />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

/**
 * Toggle setting item with native Switch
 */
function ToggleSetting({
    icon,
    iconColor,
    iconBgColor,
    label,
    sublabel,
    value,
    onValueChange,
    isLast = false,
    colors,
}: ToggleSettingProps) {
    const { colors: themeColors } = useThemeContext();
    const c = colors || themeColors;
    
    return (
        <View
            className="flex-row items-center px-4 py-3.5"
            style={{ borderBottomWidth: isLast ? 0 : 1, borderBottomColor: c.border }}
        >
            {/* Icon */}
            <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: iconBgColor }}
            >
                <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
            </View>
            
            {/* Labels */}
            <View className="flex-1">
                <Text className="text-[15px] font-medium" style={{ color: c.text }}>{label}</Text>
                {sublabel && (
                    <Text className="text-xs mt-0.5" style={{ color: c.textSecondary }}>{sublabel}</Text>
                )}
            </View>
            
            {/* Toggle */}
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: c.backgroundTertiary, true: '#34C759' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={c.backgroundTertiary}
            />
        </View>
    );
}

// ============================================================================
// Selection Modal Component
// ============================================================================

interface SelectionModalProps<T extends string> {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: Array<{ value: T; label: string; sublabel?: string; icon?: string }>;
    selectedValue: T;
    onSelect: (value: T) => void;
}

function SelectionModal<T extends string>({
    visible,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
}: SelectionModalProps<T>) {
    const { colors } = useThemeContext();
    
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 justify-end"
                style={{ backgroundColor: colors.overlay }}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    className="rounded-t-3xl max-h-[70%]"
                    style={{ backgroundColor: colors.card }}
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 rounded-full" style={{ backgroundColor: colors.border }} />
                    </View>
                    
                    {/* Header */}
                    <View 
                        className="flex-row justify-between items-center px-5 pb-4"
                        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                    >
                        <Text className="text-xl font-bold" style={{ color: colors.text }}>{title}</Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Options */}
                    <ScrollView className="px-5 py-4" bounces={false}>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => {
                                    onSelect(option.value);
                                    onClose();
                                }}
                                className="flex-row items-center py-4"
                                style={{ 
                                    borderBottomWidth: index < options.length - 1 ? 1 : 0, 
                                    borderBottomColor: colors.border 
                                }}
                            >
                                {option.icon && (
                                    <Text className="text-2xl mr-3">{option.icon}</Text>
                                )}
                                <View className="flex-1">
                                    <Text className="text-[16px] font-medium" style={{ color: colors.text }}>
                                        {option.label}
                                    </Text>
                                    {option.sublabel && (
                                        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                                            {option.sublabel}
                                        </Text>
                                    )}
                                </View>
                                {selectedValue === option.value && (
                                    <MaterialCommunityIcons name="check" size={22} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    
                    {/* Safe area bottom padding */}
                    <View className="h-8" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t, setLocale, locale } = useTranslation();
    
    // Stores
    const { reset: resetApp } = useAppStore();
    const { 
        reset: resetAuth, 
        logout, 
        user, 
    } = useAuthStore();
    const {
        timezone,
        theme: preferencesTheme,
        setTheme: setPreferencesTheme,
        reset: resetPreferences,
    } = usePreferencesStore();
    
    const {
        commandCenter,
        sprints,
        system,
        setAutoPlayVoiceNotes,
        setHapticFeedback,
        setAIModel,
        setShowTypingIndicator,
        setMessagePreview,
        setSendWithEnter,
        setDefaultSprintView,
        setShowCompletedTasks,
        setEnableTaskNotifications,
        setAutoStartPomodoro,
        setWeekStartsOn,
        setThemeMode,
        setReducedMotion,
        setSoundEffects,
        clearCache,
        reset: resetSettings,
    } = useSettingsStore();

    // Biometric store for Face ID / Touch ID
    const {
        isBiometricEnabled,
        capability: biometricCapability,
        isChecking: isBiometricChecking,
        checkBiometricCapability,
        enableBiometricWithCredentials,
        disableBiometric,
    } = useBiometricStore();
    
    // Modal states
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showSprintViewModal, setShowSprintViewModal] = useState(false);
    const [showAIModelModal, setShowAIModelModal] = useState(false);
    const [showWeekStartModal, setShowWeekStartModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [biometricPassword, setBiometricPassword] = useState('');

    // Check biometric capability on mount
    useEffect(() => {
        checkBiometricCapability();
    }, []);
    
    // App version - dynamic from Expo
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const buildNumber = Platform.select({
        ios: Constants.expoConfig?.ios?.buildNumber,
        android: Constants.expoConfig?.android?.versionCode?.toString(),
        default: '1',
    }) || '1';
    
    // Get current language
    const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === locale) || SUPPORTED_LANGUAGES[0];
    
    // Handlers
    const handleLogout = useCallback(() => {
        Alert.alert(
            `👋 ${t('settings.signOut.title')}`,
            t('settings.signOut.message'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('settings.signOut.button'),
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        setTimeout(() => router.replace('/(auth)/login'), 100);
                    },
                },
            ]
        );
    }, [logout, router, t]);
    
    const handleClearCache = useCallback(() => {
        Alert.alert(
            `🗑️ ${t('settings.storage.clearCacheTitle')}`,
            t('settings.storage.clearCacheMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.clear'),
                    onPress: async () => {
                        await clearCache();
                        Alert.alert(`✅ ${t('common.done')}`, t('settings.storage.clearCacheSuccess'));
                    },
                },
            ]
        );
    }, [clearCache, t]);

    /**
     * Handle Face ID / Touch ID toggle
     * When enabling, we require the user's password to store securely
     * When disabling, we just turn it off and clear credentials
     */
    const handleBiometricToggle = useCallback(async (enabled: boolean) => {
        if (enabled) {
            // User wants to enable biometric login
            if (!user?.email) {
                Alert.alert('Error', 'Please log in first to enable biometric login.');
                return;
            }
            
            // Show password prompt modal
            setShowPasswordModal(true);
        } else {
            // User wants to disable biometric login
            await disableBiometric();
        }
    }, [user?.email, disableBiometric]);

    /**
     * Handle password submission for biometric setup
     */
    const handleBiometricPasswordSubmit = useCallback(async () => {
        if (!user?.email || !biometricPassword) {
            Alert.alert('Error', 'Please enter your password.');
            return;
        }

        setShowPasswordModal(false);
        
        // This will check hardware, enrollment, request authentication, and store credentials
        const success = await enableBiometricWithCredentials(user.email, biometricPassword);
        
        // Clear the password from state immediately
        setBiometricPassword('');
        
        if (success) {
            Alert.alert(
                '✅ Enabled',
                `${biometricCapability?.displayName || 'Biometric'} login is now enabled. You can use it to log in quickly next time.`,
                [{ text: 'OK' }]
            );
        }
    }, [user?.email, biometricPassword, enableBiometricWithCredentials, biometricCapability?.displayName]);
    
    const handleThemeSelect = useCallback((mode: ThemeMode) => {
        setPreferencesTheme(mode);
        setThemeMode(mode);
    }, [setPreferencesTheme, setThemeMode]);
    
    // Theme mode label
    const getThemeModeLabel = (mode: ThemeMode): string => {
        switch (mode) {
            case 'light': return t('settings.appearance.themes.light');
            case 'dark': return t('settings.appearance.themes.dark');
            case 'auto': return t('settings.appearance.themes.system');
            default: return t('settings.appearance.themes.system');
        }
    };
    
    // Options for modals (with translations)
    const themeOptions: Array<{ value: ThemeMode; label: string; sublabel: string; icon: string }> = [
        { value: 'light', label: t('settings.appearance.themes.light'), sublabel: t('settings.appearance.themes.lightSubtitle'), icon: '☀️' },
        { value: 'dark', label: t('settings.appearance.themes.dark'), sublabel: t('settings.appearance.themes.darkSubtitle'), icon: '🌙' },
        { value: 'auto', label: t('settings.appearance.themes.system'), sublabel: t('settings.appearance.themes.systemSubtitle'), icon: '📱' },
    ];
    
    const sprintViewOptions: Array<{ value: SprintViewMode; label: string; sublabel: string; icon: string }> = [
        { value: 'calendar', label: t('settings.sprints.views.calendar'), sublabel: t('settings.sprints.views.calendarSubtitle'), icon: '📅' },
        { value: 'kanban', label: t('settings.sprints.views.kanban'), sublabel: t('settings.sprints.views.kanbanSubtitle'), icon: '📋' },
        { value: 'list', label: t('settings.sprints.views.list'), sublabel: t('settings.sprints.views.listSubtitle'), icon: '📝' },
    ];
    
    const aiModelOptions: Array<{ value: AIModel; label: string; sublabel: string; icon: string }> = [
        { value: 'auto', label: t('settings.commandCenter.aiModels.auto'), sublabel: t('settings.commandCenter.aiModels.autoSubtitle'), icon: '🤖' },
        { value: 'gpt-4', label: t('settings.commandCenter.aiModels.gpt4'), sublabel: t('settings.commandCenter.aiModels.gpt4Subtitle'), icon: '🧠' },
        { value: 'gpt-3.5', label: t('settings.commandCenter.aiModels.gpt35'), sublabel: t('settings.commandCenter.aiModels.gpt35Subtitle'), icon: '⚡' },
        { value: 'claude', label: t('settings.commandCenter.aiModels.claude'), sublabel: t('settings.commandCenter.aiModels.claudeSubtitle'), icon: '🎭' },
    ];
    
    const weekStartOptions: Array<{ value: 'sunday' | 'monday'; label: string; sublabel: string; icon: string }> = [
        { value: 'sunday', label: t('settings.sprints.weekDays.sunday'), sublabel: t('settings.sprints.weekDays.sundaySubtitle'), icon: '🌅' },
        { value: 'monday', label: t('settings.sprints.weekDays.monday'), sublabel: t('settings.sprints.weekDays.mondaySubtitle'), icon: '📆' },
    ];
    
    const languageOptions = SUPPORTED_LANGUAGES.map(lang => ({
        value: lang.code as SupportedLocale,
        label: lang.nativeName,
        sublabel: lang.name,
        icon: lang.flag,
    }));

    // Get theme context
    const { colors, isDark } = useThemeContext();
    
    return (
        <View className="flex-1" style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
            {/* Header */}
            <View className="px-5 pt-2 pb-4" style={{ backgroundColor: colors.background }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3 shadow-sm" style={{ backgroundColor: colors.primary }}>
                            <MaterialCommunityIcons name="cog" size={24} color="white" />
                        </View>
                        <View>
                            <Text className="text-2xl font-bold" style={{ color: colors.text }}>{t('settings.title')}</Text>
                            <Text className="text-sm" style={{ color: colors.textSecondary }}>{t('settings.subtitle')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.backgroundTertiary }}
                    >
                        <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Content */}
            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
            >
                
                {/* ============================================ */}
                {/* ACCOUNT & PROFILE */}
                {/* ============================================ */}
                <SettingSection title={t('settings.sections.accountProfile')} titleIcon="👤">
                    <SettingItem
                        icon="account-edit-outline"
                        iconColor="#3B82F6"
                        iconBgColor="#DBEAFE"
                        label={t('settings.account.editProfile')}
                        sublabel={user?.fullName || user?.email || t('settings.account.editProfileSubtitle')}
                        onPress={() => {/* Navigate to profile edit */}}
                    />
                    <SettingItem
                        icon="image-edit-outline"
                        iconColor="#8B5CF6"
                        iconBgColor="#EDE9FE"
                        label={t('settings.account.avatar')}
                        sublabel={t('settings.account.avatarSubtitle')}
                        onPress={() => {/* Open avatar picker */}}
                    />
                    <SettingItem
                        icon="crown"
                        iconColor="#F59E0B"
                        iconBgColor="#FEF3C7"
                        label="Subscription"
                        sublabel="Manage your plan and billing"
                        onPress={() => router.push('/(tabs)/settings/subscription')}
                        isLast
                    />
                </SettingSection>

                {/* ============================================ */}
                {/* INTEGRATIONS */}
                {/* ============================================ */}
                <SettingSection title="Integrations" titleIcon="🔗">
                    <SettingItem
                        icon="calendar-sync"
                        iconColor="#10B981"
                        iconBgColor="#D1FAE5"
                        label="Calendar Integrations"
                        sublabel="Connect Apple, Google, or Outlook calendars"
                        onPress={() => router.push('/(tabs)/settings/integrations')}
                        isLast
                    />
                </SettingSection>

                {/* ============================================ */}
                {/* SECURITY (Face ID / Touch ID) */}
                {/* ============================================ */}
                {biometricCapability?.isHardwareAvailable && (
                    <SettingSection title="Security" titleIcon="🔐">
                        {/* Face ID / Touch ID Toggle */}
                        <View
                            className="flex-row items-center px-4 py-3.5 border-b border-gray-100"
                        >
                            {/* Icon */}
                            <View
                                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                                style={{ backgroundColor: '#DBEAFE' }}
                            >
                                <MaterialCommunityIcons 
                                    name={biometricCapability.iconName as any} 
                                    size={20} 
                                    color="#3B82F6" 
                                />
                            </View>
                            
                            {/* Labels */}
                            <View className="flex-1">
                                <Text className="text-[15px] font-medium text-gray-900">
                                    {biometricCapability.displayName} Login
                                </Text>
                                <Text className="text-xs text-gray-500 mt-0.5">
                                    {biometricCapability.isEnrolled 
                                        ? `Use ${biometricCapability.displayName} for quick login`
                                        : `${biometricCapability.displayName} not set up on this device`
                                    }
                                </Text>
                            </View>
                            
                            {/* Toggle or Loading Indicator */}
                            {isBiometricChecking ? (
                                <ActivityIndicator size="small" color="#3B82F6" />
                            ) : (
                                <Switch
                                    value={isBiometricEnabled}
                                    onValueChange={handleBiometricToggle}
                                    trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                    thumbColor="#FFFFFF"
                                    ios_backgroundColor="#E5E5EA"
                                    disabled={!biometricCapability.isEnrolled}
                                />
                            )}
                        </View>
                        
                        {/* Info about biometric enrollment status */}
                        {!biometricCapability.isEnrolled && (
                            <TouchableOpacity
                                onPress={() => {
                                    if (Platform.OS === 'ios') {
                                        Linking.openURL('App-Prefs:FACEID_PASSCODE');
                                    } else {
                                        Linking.openSettings();
                                    }
                                }}
                                className="flex-row items-center px-4 py-3"
                            >
                                <MaterialCommunityIcons 
                                    name="information-outline" 
                                    size={16} 
                                    color="#F59E0B" 
                                />
                                <Text className="text-xs text-amber-600 ml-2 flex-1">
                                    Set up {biometricCapability.displayName} in device Settings to enable this feature
                                </Text>
                                <MaterialCommunityIcons 
                                    name="chevron-right" 
                                    size={16} 
                                    color="#F59E0B" 
                                />
                            </TouchableOpacity>
                        )}
                    </SettingSection>
                )}
                
                {/* ============================================ */}
                {/* COMMAND CENTER (AI/CHAT) */}
                {/* ============================================ */}
                <SettingSection title={t('settings.sections.commandCenter')} titleIcon="🤖">
                    <ToggleSetting
                        icon="volume-high"
                        iconColor="#10B981"
                        iconBgColor="#D1FAE5"
                        label={t('settings.commandCenter.autoPlayVoice')}
                        sublabel={t('settings.commandCenter.autoPlayVoiceSubtitle')}
                        value={commandCenter.autoPlayVoiceNotes}
                        onValueChange={setAutoPlayVoiceNotes}
                    />
                    <ToggleSetting
                        icon="vibrate"
                        iconColor="#F59E0B"
                        iconBgColor="#FEF3C7"
                        label={t('settings.commandCenter.hapticFeedback')}
                        sublabel={t('settings.commandCenter.hapticFeedbackSubtitle')}
                        value={commandCenter.hapticFeedback}
                        onValueChange={setHapticFeedback}
                    />
                    <ToggleSetting
                        icon="text-box-outline"
                        iconColor="#06B6D4"
                        iconBgColor="#CFFAFE"
                        label={t('settings.commandCenter.messagePreview')}
                        sublabel={t('settings.commandCenter.messagePreviewSubtitle')}
                        value={commandCenter.messagePreview}
                        onValueChange={setMessagePreview}
                    />
                    <ToggleSetting
                        icon="loading"
                        iconColor="#8B5CF6"
                        iconBgColor="#EDE9FE"
                        label={t('settings.commandCenter.typingIndicator')}
                        sublabel={t('settings.commandCenter.typingIndicatorSubtitle')}
                        value={commandCenter.showTypingIndicator}
                        onValueChange={setShowTypingIndicator}
                    />
                    <ToggleSetting
                        icon="send"
                        iconColor="#EC4899"
                        iconBgColor="#FCE7F3"
                        label={t('settings.commandCenter.sendWithEnter')}
                        sublabel={t('settings.commandCenter.sendWithEnterSubtitle')}
                        value={commandCenter.sendWithEnter}
                        onValueChange={setSendWithEnter}
                    />
                    <SettingItem
                        icon="robot-outline"
                        iconColor="#6366F1"
                        iconBgColor="#E0E7FF"
                        label={t('settings.commandCenter.aiModel')}
                        sublabel={t('settings.commandCenter.aiModelSubtitle')}
                        value={aiModelOptions.find(o => o.value === commandCenter.aiModel)?.label || t('settings.commandCenter.aiModels.auto')}
                        onPress={() => setShowAIModelModal(true)}
                        isLast
                    />
                </SettingSection>
                
                {/* ============================================ */}
                {/* SPRINTS & WORKFLOW */}
                {/* ============================================ */}
                <SettingSection title={t('settings.sections.sprintsWorkflow')} titleIcon="🏃">
                    <SettingItem
                        icon="view-dashboard-outline"
                        iconColor="#0EA5E9"
                        iconBgColor="#E0F2FE"
                        label={t('settings.sprints.defaultView')}
                        sublabel={t('settings.sprints.defaultViewSubtitle')}
                        value={sprintViewOptions.find(o => o.value === sprints.defaultView)?.label || t('settings.sprints.views.calendar')}
                        onPress={() => setShowSprintViewModal(true)}
                    />
                    <SettingItem
                        icon="calendar-week"
                        iconColor="#14B8A6"
                        iconBgColor="#CCFBF1"
                        label={t('settings.sprints.weekStartsOn')}
                        sublabel={t('settings.sprints.weekStartsOnSubtitle')}
                        value={sprints.weekStartsOn === 'monday' ? t('settings.sprints.weekDays.monday') : t('settings.sprints.weekDays.sunday')}
                        onPress={() => setShowWeekStartModal(true)}
                    />
                    <ToggleSetting
                        icon="checkbox-marked-circle-outline"
                        iconColor="#22C55E"
                        iconBgColor="#DCFCE7"
                        label={t('settings.sprints.showCompleted')}
                        sublabel={t('settings.sprints.showCompletedSubtitle')}
                        value={sprints.showCompletedTasks}
                        onValueChange={setShowCompletedTasks}
                    />
                    <ToggleSetting
                        icon="bell-ring-outline"
                        iconColor="#EF4444"
                        iconBgColor="#FEE2E2"
                        label={t('settings.sprints.taskNotifications')}
                        sublabel={t('settings.sprints.taskNotificationsSubtitle')}
                        value={sprints.enableTaskNotifications}
                        onValueChange={setEnableTaskNotifications}
                    />
                    <ToggleSetting
                        icon="timer-outline"
                        iconColor="#F97316"
                        iconBgColor="#FFEDD5"
                        label={t('settings.sprints.autoStartPomodoro')}
                        sublabel={t('settings.sprints.autoStartPomodoroSubtitle')}
                        value={sprints.autoStartPomodoro}
                        onValueChange={setAutoStartPomodoro}
                        isLast
                    />
                </SettingSection>
                
                {/* ============================================ */}
                {/* APPEARANCE */}
                {/* ============================================ */}
                <SettingSection title={t('settings.sections.appearance')} titleIcon="🎨">
                    <SettingItem
                        icon="theme-light-dark"
                        iconColor="#8B5CF6"
                        iconBgColor="#EDE9FE"
                        label={t('settings.appearance.theme')}
                        sublabel={t('settings.appearance.themeSubtitle')}
                        value={getThemeModeLabel(preferencesTheme)}
                        onPress={() => setShowThemeModal(true)}
                    />
                    <SettingItem
                        icon="translate"
                        iconColor="#0891B2"
                        iconBgColor="#CFFAFE"
                        label={t('settings.appearance.language')}
                        sublabel={currentLanguage.name}
                        value={currentLanguage.flag}
                        onPress={() => setShowLanguageModal(true)}
                    />
                    <ToggleSetting
                        icon="motion-outline"
                        iconColor="#64748B"
                        iconBgColor="#F1F5F9"
                        label={t('settings.appearance.reducedMotion')}
                        sublabel={t('settings.appearance.reducedMotionSubtitle')}
                        value={system.reducedMotion}
                        onValueChange={setReducedMotion}
                    />
                    <ToggleSetting
                        icon="volume-vibrate"
                        iconColor="#0D9488"
                        iconBgColor="#CCFBF1"
                        label={t('settings.appearance.soundEffects')}
                        sublabel={t('settings.appearance.soundEffectsSubtitle')}
                        value={system.soundEffects}
                        onValueChange={setSoundEffects}
                        isLast
                    />
                </SettingSection>
                
                {/* ============================================ */}
                {/* STORAGE & DATA */}
                {/* ============================================ */}
                <SettingSection title={t('settings.sections.storageData')} titleIcon="💾">
                    <SettingItem
                        icon="broom"
                        iconColor="#F59E0B"
                        iconBgColor="#FEF3C7"
                        label={t('settings.storage.clearCache')}
                        sublabel={t('settings.storage.clearCacheSubtitle')}
                        onPress={handleClearCache}
                    />
                    <SettingItem
                        icon="clock-outline"
                        iconColor="#6B7280"
                        iconBgColor="#F3F4F6"
                        label={t('settings.storage.timezone')}
                        sublabel={timezone}
                        showChevron={false}
                        isLast
                    />
                </SettingSection>
                
                {/* ============================================ */}
                {/* ABOUT */}
                {/* ============================================ */}
                <SettingSection title={t('settings.sections.about')} titleIcon="ℹ️">
                    <SettingItem
                        icon="information-outline"
                        iconColor="#6B7280"
                        iconBgColor="#F3F4F6"
                        label={t('settings.about.appVersion')}
                        value={`${appVersion} (${buildNumber})`}
                        showChevron={false}
                    />
                    <SettingItem
                        icon="web"
                        iconColor="#3B82F6"
                        iconBgColor="#DBEAFE"
                        label={t('settings.about.website')}
                        sublabel="kaizlifeos.com"
                        onPress={() => Linking.openURL('https://kaizlifeos.com')}
                    />
                    <SettingItem
                        icon="file-document-outline"
                        iconColor="#6B7280"
                        iconBgColor="#F3F4F6"
                        label={t('settings.about.privacyPolicy')}
                        onPress={() => Linking.openURL('https://kaizlifeos.com/privacy')}
                    />
                    <SettingItem
                        icon="text-box-outline"
                        iconColor="#6B7280"
                        iconBgColor="#F3F4F6"
                        label={t('settings.about.termsOfService')}
                        onPress={() => Linking.openURL('https://kaizlifeos.com/terms')}
                        isLast
                    />
                </SettingSection>
                
                {/* ============================================ */}
                {/* SIGN OUT */}
                {/* ============================================ */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6"
                >
                    <View className="flex-row items-center justify-center py-4">
                        <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
                        <Text className="text-[15px] font-semibold text-red-500 ml-2">
                            {t('settings.signOut.button')}
                        </Text>
                    </View>
                </TouchableOpacity>
                
                {/* Footer */}
                <View className="items-center pt-2 pb-6">
                    <Text className="text-xs text-gray-400">
                        {t('settings.footer.madeWith')}
                    </Text>
                    <Text className="text-[10px] text-gray-300 mt-1">
                        {t('settings.footer.copyright')}
                    </Text>
                </View>
            </ScrollView>
            
            {/* ============================================ */}
            {/* SELECTION MODALS */}
            {/* ============================================ */}
            
            {/* Theme Selection */}
            <SelectionModal<ThemeMode>
                visible={showThemeModal}
                onClose={() => setShowThemeModal(false)}
                title={t('settings.modals.chooseTheme')}
                options={themeOptions}
                selectedValue={preferencesTheme}
                onSelect={handleThemeSelect}
            />
            
            {/* Language Selection */}
            <SelectionModal<SupportedLocale>
                visible={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                title={t('settings.modals.chooseLanguage')}
                options={languageOptions}
                selectedValue={locale}
                onSelect={setLocale}
            />
            
            {/* Sprint View Selection */}
            <SelectionModal<SprintViewMode>
                visible={showSprintViewModal}
                onClose={() => setShowSprintViewModal(false)}
                title={t('settings.modals.defaultSprintView')}
                options={sprintViewOptions}
                selectedValue={sprints.defaultView}
                onSelect={setDefaultSprintView}
            />
            
            {/* AI Model Selection */}
            <SelectionModal<AIModel>
                visible={showAIModelModal}
                onClose={() => setShowAIModelModal(false)}
                title={t('settings.modals.aiModel')}
                options={aiModelOptions}
                selectedValue={commandCenter.aiModel}
                onSelect={setAIModel}
            />
            
            {/* Week Start Selection */}
            <SelectionModal<'sunday' | 'monday'>
                visible={showWeekStartModal}
                onClose={() => setShowWeekStartModal(false)}
                title={t('settings.modals.weekStartsOn')}
                options={weekStartOptions}
                selectedValue={sprints.weekStartsOn}
                onSelect={setWeekStartsOn}
            />

            {/* Password Modal for Face ID Setup */}
            <Modal
                visible={showPasswordModal}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowPasswordModal(false);
                    setBiometricPassword('');
                }}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            🔐 Enable {biometricCapability?.displayName || 'Biometric'} Login
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
                            Enter your password to securely enable {biometricCapability?.displayName || 'biometric'} login.
                        </Text>
                        
                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 mb-4"
                            placeholder="Enter your password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            value={biometricPassword}
                            onChangeText={setBiometricPassword}
                            autoFocus
                        />
                        
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowPasswordModal(false);
                                    setBiometricPassword('');
                                }}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-3"
                            >
                                <Text className="text-center text-gray-700 dark:text-gray-300 font-semibold">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={handleBiometricPasswordSubmit}
                                className="flex-1 bg-blue-600 rounded-xl py-3"
                            >
                                <Text className="text-center text-white font-semibold">
                                    Enable
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
