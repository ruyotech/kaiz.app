import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationStore } from '../../store/navigationStore';
import { NAV_CONFIGS } from '../../utils/navigationConfig';
import { useRouter, usePathname } from 'expo-router';
import { AppSwitcher } from './AppSwitcher';
import { MoreMenu } from './MoreMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const CREATE_OPTIONS = [
    { id: 'task', icon: 'checkbox-marked-circle-outline', label: 'Task', color: '#3B82F6', route: '/(tabs)/sdlc/create-task' },
    { id: 'challenge', icon: 'trophy-outline', label: 'Challenge', color: '#F59E0B', route: '/(tabs)/challenges/create' },
    { id: 'bill', icon: 'cash-multiple', label: 'Bill', color: '#10B981', route: '/(tabs)/bills/create' },
    { id: 'note', icon: 'note-text-outline', label: 'Note', color: '#8B5CF6', route: '/(tabs)/command-center' },
    { id: 'book', icon: 'book-open-variant', label: 'Book', color: '#EC4899', route: '/(tabs)/books/add' },
    { id: 'event', icon: 'calendar-star', label: 'Event', color: '#06B6D4', route: '/(tabs)/command-center' },
];

export function CustomTabBar() {
    const { currentApp, toggleAppSwitcher, toggleMoreMenu } = useNavigationStore();
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

    // Navigation helpers for normal tab bar
    const icons = NAV_CONFIGS[currentApp];
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
                {isOnCommandCenter ? (
                    // Command Center Input Interface
                    <View className="flex-row items-center px-3 py-2 gap-2">
                        {/* Apps Icon */}
                        <TouchableOpacity
                            onPress={toggleAppSwitcher}
                            className="w-11 h-11 items-center justify-center"
                        >
                            <MaterialCommunityIcons
                                name="view-grid"
                                size={26}
                                color="#6B7280"
                            />
                        </TouchableOpacity>

                        {/* Input Interface Container */}
                        <View className="flex-1 bg-gray-50 rounded-3xl border border-gray-200 flex-row items-center px-2 py-1.5">
                            {/* Plus Icon - Opens Menu with All Options */}
                            <TouchableOpacity
                                onPress={() => setShowCreateMenu(true)}
                                className="w-9 h-9 items-center justify-center"
                            >
                                <MaterialCommunityIcons name="plus-circle" size={24} color="#6B7280" />
                            </TouchableOpacity>

                            {/* Text Input - Now Wider */}
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Type a message..."
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 px-2 py-1 text-sm text-gray-800"
                                maxLength={500}
                            />

                            {/* Send Button */}
                            <TouchableOpacity
                                onPress={handleQuickCreate}
                                disabled={!input.trim()}
                                className={`w-8 h-8 rounded-full items-center justify-center ${input.trim() ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <MaterialCommunityIcons
                                    name="send"
                                    size={16}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Normal Tab Bar with 4 Icons
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
                                name="plus"
                                size={32}
                                color={isOnCommandCenter ? '#3B82F6' : '#6B7280'}
                                style={{ marginBottom: -3 }}
                            />
                            <Text
                                className="text-[10px] font-medium"
                                style={{
                                    color: isOnCommandCenter ? '#3B82F6' : '#6B7280'
                                }}
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
        </View>
    );
}
