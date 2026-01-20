import { View, Text, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';

interface SettingsDrawerProps {
    visible: boolean;
    onClose: () => void;
}

export function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(-320)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -320,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50"
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    className="absolute left-0 top-0 bottom-0 w-80 bg-white"
                    style={{
                        paddingTop: insets.top,
                        transform: [{ translateX: slideAnim }]
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        className="flex-1"
                    >
                        <View className="flex-1">
                            {/* Header */}
                            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                                <Text className="text-xl font-bold text-gray-800">Settings</Text>
                                <TouchableOpacity onPress={onClose} className="p-2">
                                    <MaterialCommunityIcons name="close" size={24} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            {/* Settings Options */}
                            <ScrollView className="flex-1">
                                {/* Language */}
                                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="translate" size={24} color="#374151" />
                                        <Text className="ml-3 text-base text-gray-800">Language</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-sm text-gray-500 mr-2">English</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                                    </View>
                                </TouchableOpacity>

                                {/* Dark Mode */}
                                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="theme-light-dark" size={24} color="#374151" />
                                        <Text className="ml-3 text-base text-gray-800">Dark Mode</Text>
                                    </View>
                                    <View className="bg-gray-200 rounded-full w-12 h-6 justify-center px-1">
                                        <View className="bg-white rounded-full w-5 h-5" />
                                    </View>
                                </TouchableOpacity>

                                {/* Notifications */}
                                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="bell-outline" size={24} color="#374151" />
                                        <Text className="ml-3 text-base text-gray-800">Notifications</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                                </TouchableOpacity>

                                {/* Privacy */}
                                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="shield-account" size={24} color="#374151" />
                                        <Text className="ml-3 text-base text-gray-800">Privacy & Security</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                                </TouchableOpacity>

                                {/* Data & Storage */}
                                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="database" size={24} color="#374151" />
                                        <Text className="ml-3 text-base text-gray-800">Data & Storage</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                                </TouchableOpacity>

                                {/* App Preferences */}
                                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="tune" size={24} color="#374151" />
                                        <Text className="ml-3 text-base text-gray-800">App Preferences</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                                </TouchableOpacity>

                                {/* Sync Settings */}
                                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="sync" size={24} color="#374151" />
                                        <Text className="ml-3 text-base text-gray-800">Sync Settings</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                                </TouchableOpacity>

                                {/* About */}
                                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="information-outline" size={24} color="#374151" />
                                        <Text className="ml-3 text-base text-gray-800">About</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                                </TouchableOpacity>

                                {/* Help & Support */}
                                <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="help-circle-outline" size={24} color="#374151" />
                                        <Text className="ml-3 text-base text-gray-800">Help & Support</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </ScrollView>

                            {/* Footer */}
                            <View className="p-4 border-t border-gray-200">
                                <Text className="text-xs text-gray-500 text-center">Version 1.0.0</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
}
