import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationStore, AppContext } from '../../store/navigationStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { NAV_CONFIGS } from '../../utils/navigationConfig';
import { useRouter, usePathname } from 'expo-router';
import { AppSwitcher } from './AppSwitcher';
import { MoreMenu } from './MoreMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const CREATE_OPTIONS = [
    { id: 'task', icon: 'checkbox-marked-circle-outline', label: 'Task', color: '#3B82F6', route: '/(tabs)/sdlc/create-task' },
    { id: 'challenge', icon: 'trophy-outline', label: 'Challenge', color: '#F59E0B', route: '/(tabs)/challenges/create' },
    { id: 'book', icon: 'book-open-variant', label: 'Book', color: '#EC4899', route: '/(tabs)/books/add' },
    { id: 'event', icon: 'calendar-star', label: 'Event', color: '#06B6D4', route: '/(tabs)/command-center' },
];

export function CustomTabBar() {
    const { currentApp, toggleAppSwitcher, toggleMoreMenu } = useNavigationStore();
    const { isActive: isPomodoroActive, timeRemaining, isPaused } = usePomodoroStore();
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const [input, setInput] = useState('');
    const [showCreateMenu, setShowCreateMenu] = useState(false);

    const handleQuickCreate = () => {
        if (input.trim()) {
            // AI processing logic would go here
            console.log('Processing input:', input);
            setInput('');
        }
    };

    const handleCreateOption = (option: typeof CREATE_OPTIONS[0]) => {
        setShowCreateMenu(false);
        if (option.route) {
            router.push(option.route as any);
        }
    };

    // Format time for pomodoro display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Navigation helpers for normal tab bar
    const icons = NAV_CONFIGS[currentApp as AppContext] || NAV_CONFIGS['sdlc'];
    const mainIcon = icons[0];
    const moreIcon = icons[icons.length - 1];

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

    // Check if we're on the Command Center screen
    const isOnCommandCenter = pathname.includes('/command-center');

    // Debug log to verify pathname
    console.log('Current pathname:', pathname, 'isOnCommandCenter:', isOnCommandCenter);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <View style={{ paddingBottom: insets.bottom }}>
                {isOnCommandCenter ? (
                    // Command Center Input Interface
                    <View className="flex-row items-center px-3 py-2">
                        {/* Input Interface Container - Full width */}
                        <View className="flex-1 bg-gray-50 rounded-3xl border border-gray-200 flex-row items-center px-3 py-2">
                            {/* Plus Icon */}
                            <TouchableOpacity
                                onPress={() => setShowCreateMenu(true)}
                                className="w-8 h-8 items-center justify-center"
                            >
                                <MaterialCommunityIcons name="plus-circle" size={24} color="#6B7280" />
                            </TouchableOpacity>

                            {/* Text Input */}
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Type a message..."
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 px-2 py-1 text-base text-gray-800"
                                maxLength={500}
                            />

                            {/* Send Button */}
                            <TouchableOpacity
                                onPress={handleQuickCreate}
                                disabled={!input.trim()}
                                className={`w-9 h-9 rounded-full items-center justify-center ${input.trim() ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <MaterialCommunityIcons
                                    name="send"
                                    size={18}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Clean Tab Bar - All icons bigger with colored backgrounds
                    <View className="flex-row items-center justify-between px-6 pb-1" style={{ paddingTop: 8 }}>
                        {/* 1. Apps Icon - Orange/Amber background */}
                        <TouchableOpacity
                            className="items-center"
                            onPress={toggleAppSwitcher}
                        >
                            <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                                <MaterialCommunityIcons
                                    name="view-grid"
                                    size={28}
                                    color="#F59E0B"
                                />
                            </View>
                            <Text className="text-[10px] font-medium mt-0.5" style={{ color: '#F59E0B' }}>Apps</Text>
                        </TouchableOpacity>

                        {/* 2. Main App Icon - Blue background */}
                        <TouchableOpacity
                            className="items-center"
                            onPress={() => handleIconPress(mainIcon.route)}
                        >
                            <View 
                                className="w-12 h-12 rounded-2xl items-center justify-center" 
                                style={{ backgroundColor: isActive(mainIcon.route) ? '#DBEAFE' : '#EFF6FF' }}
                            >
                                <MaterialCommunityIcons
                                    name={mainIcon.icon as any}
                                    size={28}
                                    color={isActive(mainIcon.route) ? '#2563EB' : '#3B82F6'}
                                />
                            </View>
                            <Text
                                className="text-[10px] font-semibold mt-0.5"
                                style={{ color: isActive(mainIcon.route) ? '#2563EB' : '#3B82F6' }}
                            >
                                {mainIcon.name}
                            </Text>
                        </TouchableOpacity>

                        {/* 3. More Icon - Purple background */}
                        <TouchableOpacity
                            className="items-center"
                            onPress={() => handleIconPress(moreIcon.route)}
                        >
                            <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: '#F3E8FF' }}>
                                <MaterialCommunityIcons
                                    name={moreIcon.icon as any}
                                    size={28}
                                    color="#8B5CF6"
                                />
                            </View>
                            <Text className="text-[10px] font-semibold mt-0.5" style={{ color: '#8B5CF6' }}>
                                {moreIcon.name}
                            </Text>
                        </TouchableOpacity>

                        {/* 4. Create (Control Center) - Green background */}
                        <TouchableOpacity
                            className="items-center"
                            onPress={() => router.push('/(tabs)/command-center')}
                        >
                            <View 
                                className="w-12 h-12 rounded-2xl items-center justify-center" 
                                style={{ backgroundColor: isOnCommandCenter ? '#D1FAE5' : '#ECFDF5' }}
                            >
                                <MaterialCommunityIcons
                                    name="plus-circle"
                                    size={28}
                                    color={isOnCommandCenter ? '#059669' : '#10B981'}
                                />
                            </View>
                            <Text
                                className="text-[10px] font-medium mt-0.5"
                                style={{ color: isOnCommandCenter ? '#059669' : '#10B981' }}
                            >
                                Create
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <AppSwitcher />
            <MoreMenu />

            {/* Create & Attachment Options Modal */}
            <Modal visible={showCreateMenu} transparent animationType="slide">
                <Pressable
                    className="flex-1 bg-black/50 justify-end"
                    onPress={() => setShowCreateMenu(false)}
                >
                    <Pressable>
                        <View className="bg-white rounded-t-3xl pt-4 pb-8 px-4">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold">What would you like to do?</Text>
                                <TouchableOpacity onPress={() => setShowCreateMenu(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            {/* Attachment Options Row */}
                            <View className="flex-row gap-3 mb-6 pb-4 border-b border-gray-200">
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCreateMenu(false);
                                        console.log('Camera');
                                    }}
                                    className="flex-1 items-center py-4 bg-gray-50 rounded-xl"
                                >
                                    <MaterialCommunityIcons name="camera" size={28} color="#6B7280" />
                                    <Text className="text-sm font-medium text-gray-700 mt-2">Camera</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCreateMenu(false);
                                        console.log('Image');
                                    }}
                                    className="flex-1 items-center py-4 bg-gray-50 rounded-xl"
                                >
                                    <MaterialCommunityIcons name="image" size={28} color="#6B7280" />
                                    <Text className="text-sm font-medium text-gray-700 mt-2">Image</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCreateMenu(false);
                                        console.log('Microphone');
                                    }}
                                    className="flex-1 items-center py-4 bg-gray-50 rounded-xl"
                                >
                                    <MaterialCommunityIcons name="microphone" size={28} color="#6B7280" />
                                    <Text className="text-sm font-medium text-gray-700 mt-2">Voice</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Create Options */}
                            <Text className="text-sm font-semibold text-gray-700 mb-3">Create New</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {CREATE_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => handleCreateOption(option)}
                                        className="flex-1 min-w-[30%] items-center py-4"
                                    >
                                        <View
                                            className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                                            style={{ backgroundColor: option.color + '20' }}
                                        >
                                            <MaterialCommunityIcons
                                                name={option.icon as any}
                                                size={28}
                                                color={option.color}
                                            />
                                        </View>
                                        <Text className="text-sm font-medium text-gray-700">{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </KeyboardAvoidingView >
    );
}
