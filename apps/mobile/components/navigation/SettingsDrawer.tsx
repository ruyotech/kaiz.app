/**
 * SettingsDrawer.tsx - Modern Settings Drawer for Kaiz LifeOS
 * 
 * A beautifully designed settings drawer with:
 * - Inset grouped card layout
 * - Modern Lucide-style icons via MaterialCommunityIcons
 * - Smooth animations
 * - Real data bindings to stores
 * - Tri-state theme mode (Light/Dark/System)
 * - Comprehensive settings based on app features
 * 
 * @author Kaiz Team
 * @version 2.0.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Animated,
    Alert,
    Switch,
    Linking,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Stores
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { usePreferencesStore, type ThemeMode, type SupportedLocale } from '../../store/preferencesStore';
import { useSettingsStore, type SprintViewMode, type AIModel } from '../../store/settingsStore';

// Hooks
import { useTranslation } from '../../hooks';

// Constants
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

// ============================================================================
// Types
// ============================================================================

interface SettingsDrawerProps {
    visible: boolean;
    onClose: () => void;
}

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
}

interface SettingSectionProps {
    title: string;
    titleIcon?: string;
    children: React.ReactNode;
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
}

// ============================================================================
// Reusable Components
// ============================================================================

/**
 * Modern inset grouped section container
 */
function SettingSection({ title, titleIcon, children }: SettingSectionProps) {
    return (
        <View className="mb-5">
            <View className="flex-row items-center mb-2 px-1">
                {titleIcon && (
                    <Text className="text-base mr-1.5">{titleIcon}</Text>
                )}
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {title}
                </Text>
            </View>
            <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
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
}: SettingItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.6 : 1}
            className={`flex-row items-center px-4 py-3.5 ${!isLast ? 'border-b border-gray-100' : ''}`}
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
                <Text className="text-[15px] font-medium text-gray-900">{label}</Text>
                {sublabel && (
                    <Text className="text-xs text-gray-500 mt-0.5">{sublabel}</Text>
                )}
            </View>
            
            {/* Right side */}
            {rightElement ? (
                rightElement
            ) : (
                <View className="flex-row items-center">
                    {value && (
                        <Text className="text-sm text-gray-500 mr-2">{value}</Text>
                    )}
                    {showChevron && onPress && (
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" />
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
}: ToggleSettingProps) {
    return (
        <View
            className={`flex-row items-center px-4 py-3.5 ${!isLast ? 'border-b border-gray-100' : ''}`}
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
                <Text className="text-[15px] font-medium text-gray-900">{label}</Text>
                {sublabel && (
                    <Text className="text-xs text-gray-500 mt-0.5">{sublabel}</Text>
                )}
            </View>
            
            {/* Toggle */}
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E5EA"
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
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50 justify-end"
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    className="bg-white rounded-t-3xl max-h-[70%]"
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-2">
                        <View className="w-10 h-1 bg-gray-300 rounded-full" />
                    </View>
                    
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-5 pb-4 border-b border-gray-100">
                        <Text className="text-xl font-bold text-gray-900">{title}</Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <MaterialCommunityIcons name="close" size={24} color="#8E8E93" />
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
                                className={`flex-row items-center py-4 ${
                                    index < options.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                            >
                                {option.icon && (
                                    <Text className="text-2xl mr-3">{option.icon}</Text>
                                )}
                                <View className="flex-1">
                                    <Text className="text-[16px] font-medium text-gray-900">
                                        {option.label}
                                    </Text>
                                    {option.sublabel && (
                                        <Text className="text-sm text-gray-500 mt-0.5">
                                            {option.sublabel}
                                        </Text>
                                    )}
                                </View>
                                {selectedValue === option.value && (
                                    <MaterialCommunityIcons name="check" size={22} color="#007AFF" />
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

export function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(-360)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();
    
    // Translations
    const { t } = useTranslation();
    
    // Stores
    const { reset: resetApp } = useAppStore();
    const { reset: resetAuth, logout, user } = useAuthStore();
    const {
        locale,
        setLocale,
        theme: preferencesTheme,
        setTheme: setPreferencesTheme,
        reset: resetPreferences,
    } = usePreferencesStore();
    
    const {
        commandCenter,
        sprints,
        system,
        appInfo,
        setAutoPlayVoiceNotes,
        setHapticFeedback,
        setAIModel,
        setDefaultSprintView,
        setShowCompletedTasks,
        setEnableTaskNotifications,
        setAutoStartPomodoro,
        setThemeMode,
        clearCache,
        reset: resetSettings,
        hydrateAppInfo,
    } = useSettingsStore();
    
    // Modal states
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showSprintViewModal, setShowSprintViewModal] = useState(false);
    const [showAIModelModal, setShowAIModelModal] = useState(false);
    
    // App version
    const appVersion = '1.0.0';
    const buildNumber = '1';
    
    // Get current language
    const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === locale) || SUPPORTED_LANGUAGES[0];
    
    // Animation effects
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
            
            // Hydrate app info when drawer opens
            hydrateAppInfo();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -360,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);
    
    // Handlers
    const handleLogout = useCallback(() => {
        Alert.alert(
            '👋 Logout',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        onClose();
                        await logout();
                        setTimeout(() => router.replace('/(auth)/login'), 100);
                    },
                },
            ]
        );
    }, [onClose, logout, router]);
    
    const handleClearCache = useCallback(() => {
        Alert.alert(
            '🗑️ Clear Cache',
            'This will remove temporary files including cached images and voice notes. Your data will not be affected.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    onPress: async () => {
                        await clearCache();
                        Alert.alert('✅ Done', 'Cache cleared successfully!');
                    },
                },
            ]
        );
    }, [clearCache]);
    
    const handleThemeSelect = useCallback((mode: ThemeMode) => {
        setPreferencesTheme(mode);
        setThemeMode(mode);
    }, [setPreferencesTheme, setThemeMode]);
    
    // Theme mode label
    const getThemeModeLabel = (mode: ThemeMode): string => {
        switch (mode) {
            case 'light': return 'Light';
            case 'dark': return 'Dark';
            case 'auto': return 'System';
            default: return 'System';
        }
    };
    
    // Theme options
    const themeOptions: Array<{ value: ThemeMode; label: string; sublabel: string; icon: string }> = [
        { value: 'light', label: 'Light', sublabel: 'Always use light theme', icon: '☀️' },
        { value: 'dark', label: 'Dark', sublabel: 'Always use dark theme', icon: '🌙' },
        { value: 'auto', label: 'System', sublabel: 'Match device settings', icon: '📱' },
    ];
    
    // Sprint view options
    const sprintViewOptions: Array<{ value: SprintViewMode; label: string; sublabel: string; icon: string }> = [
        { value: 'calendar', label: 'Calendar', sublabel: 'View tasks on a calendar grid', icon: '📅' },
        { value: 'kanban', label: 'Kanban', sublabel: 'Drag and drop columns', icon: '📋' },
        { value: 'list', label: 'List', sublabel: 'Simple task list view', icon: '📝' },
    ];
    
    // AI model options
    const aiModelOptions: Array<{ value: AIModel; label: string; sublabel: string; icon: string }> = [
        { value: 'auto', label: 'Auto', sublabel: 'Best model for each task', icon: '🤖' },
        { value: 'gpt-4', label: 'GPT-4', sublabel: 'Most capable, slower', icon: '🧠' },
        { value: 'gpt-3.5', label: 'GPT-3.5', sublabel: 'Faster responses', icon: '⚡' },
        { value: 'claude', label: 'Claude', sublabel: 'Anthropic AI', icon: '🎭' },
    ];
    
    // Language options for modal
    const languageOptions = SUPPORTED_LANGUAGES.map(lang => ({
        value: lang.code as SupportedLocale,
        label: lang.nativeName,
        sublabel: lang.name,
        icon: lang.flag,
    }));
    
    if (!visible) return null;
    
    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Backdrop */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    opacity: backdropAnim,
                }}
            >
                <TouchableOpacity
                    className="flex-1"
                    activeOpacity={1}
                    onPress={onClose}
                />
            </Animated.View>
            
            {/* Drawer Panel */}
            <Animated.View
                className="absolute left-0 top-0 bottom-0 w-[340px] bg-gray-50"
                style={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    transform: [{ translateX: slideAnim }],
                    shadowColor: '#000',
                    shadowOffset: { width: 4, height: 0 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    className="flex-1"
                >
                    {/* Header */}
                    <View className="px-5 pt-4 pb-3">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center mr-3">
                                <MaterialCommunityIcons name="cog" size={22} color="white" />
                            </View>
                            <View>
                                <Text className="text-xl font-bold text-gray-900">Settings</Text>
                            </View>
                        </View>
                    </View>
                    
                    {/* Content */}
                    <ScrollView
                        className="flex-1 px-4"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
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
                                sublabel={user?.fullName || t('settings.account.editProfileSubtitle')}
                                onPress={() => {}}
                            />
                            <SettingItem
                                icon="image-edit-outline"
                                iconColor="#8B5CF6"
                                iconBgColor="#EDE9FE"
                                label={t('settings.account.avatar')}
                                sublabel={t('settings.account.avatarSubtitle')}
                                onPress={() => {}}
                                isLast
                            />
                        </SettingSection>
                        
                        {/* ============================================ */}
                        {/* COMMAND CENTER (AI) */}
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
                            <SettingItem
                                icon="robot-outline"
                                iconColor="#6366F1"
                                iconBgColor="#E0E7FF"
                                label={t('settings.commandCenter.aiModel')}
                                sublabel={t('settings.commandCenter.aiModelSubtitle')}
                                value={aiModelOptions.find(o => o.value === commandCenter.aiModel)?.label || 'Auto'}
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
                                value={sprintViewOptions.find(o => o.value === sprints.defaultView)?.label || 'Calendar'}
                                onPress={() => setShowSprintViewModal(true)}
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
                        {/* LOGOUT */}
                        {/* ============================================ */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4"
                        >
                            <View className="flex-row items-center justify-center py-4">
                                <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
                                <Text className="text-[15px] font-semibold text-red-500 ml-2">
                                    {t('settings.signOut.button')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        
                        {/* Footer */}
                        <View className="items-center pt-2 pb-4">
                            <Text className="text-xs text-gray-400">
                                {t('settings.footer.madeWith')}
                            </Text>
                            <Text className="text-[10px] text-gray-300 mt-1">
                                {t('settings.footer.copyright')}
                            </Text>
                        </View>
                    </ScrollView>
                </TouchableOpacity>
            </Animated.View>
            
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
        </Modal>
    );
}
