import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationStore, AppContext } from '../../store/navigationStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { NAV_CONFIGS } from '../../utils/navigationConfig';
import { useRouter, usePathname } from 'expo-router';
import { AppSwitcher } from './AppSwitcher';
import { MoreMenu } from './MoreMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { mockApi } from '../../services/mockApi';

const CREATE_OPTIONS = [
    { id: 'task', icon: 'checkbox-marked-circle-outline', label: 'Task', color: '#3B82F6', route: '/(tabs)/sdlc/create-task' },
    { id: 'challenge', icon: 'trophy-outline', label: 'Challenge', color: '#F59E0B', route: '/(tabs)/challenges/create' },
    { id: 'event', icon: 'calendar-star', label: 'Event', color: '#06B6D4', route: '/(tabs)/command-center' },
];

const INPUT_OPTIONS = [
    { id: 'camera', icon: 'camera', label: 'Camera', color: '#10B981' },
    { id: 'image', icon: 'image', label: 'Image', color: '#8B5CF6' },
    { id: 'file', icon: 'file-document', label: 'File', color: '#F59E0B' },
    { id: 'voice', icon: 'microphone', label: 'Voice', color: '#EF4444' },
];

export function CustomTabBar() {
    const { currentApp, toggleAppSwitcher, toggleMoreMenu } = useNavigationStore();
    const { isActive: isPomodoroActive, timeRemaining, isPaused } = usePomodoroStore();
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const [input, setInput] = useState('');
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    // Handle camera capture
    const handleCamera = async () => {
        setShowCreateMenu(false);
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Camera access is needed to take photos');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await processImageInput(result.assets[0].uri, 'camera');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to access camera');
        }
    };

    // Handle image picker
    const handleImagePicker = async () => {
        setShowCreateMenu(false);
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Gallery access is needed to select images');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await processImageInput(result.assets[0].uri, 'gallery');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to access gallery');
        }
    };

    // Handle file picker
    const handleFilePicker = async () => {
        setShowCreateMenu(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                await processFileInput(result.assets[0].uri, result.assets[0].name);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    // Handle voice input
    const handleVoiceInput = async () => {
        setShowCreateMenu(false);
        if (isRecording) {
            setIsRecording(false);
            await processVoiceInput();
        } else {
            setIsRecording(true);
            // Simulate voice recording for 3 seconds
            setTimeout(async () => {
                setIsRecording(false);
                await processVoiceInput();
            }, 3000);
        }
    };

    // Process image input through mock API
    const processImageInput = async (imageUri: string, source: 'camera' | 'gallery') => {
        setIsProcessing(true);
        try {
            const response = await mockApi.parseAIInput({
                type: 'image',
                content: imageUri,
                source,
            });
            
            if (response.success) {
                Alert.alert(
                    'AI Parsed Input',
                    `Detected: ${response.detectedType}\n\nTitle: ${response.parsedData.title}\n\nDescription: ${response.parsedData.description || 'None'}`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Create', 
                            onPress: () => navigateToCreate(response.detectedType, response.parsedData)
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to process image');
        } finally {
            setIsProcessing(false);
        }
    };

    // Process file input through mock API
    const processFileInput = async (fileUri: string, fileName: string) => {
        setIsProcessing(true);
        try {
            const response = await mockApi.parseAIInput({
                type: 'file',
                content: fileUri,
                fileName,
            });
            
            if (response.success) {
                Alert.alert(
                    'AI Parsed File',
                    `File: ${fileName}\n\nDetected: ${response.detectedType}\n\nTitle: ${response.parsedData.title}\n\nDescription: ${response.parsedData.description || 'None'}`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Create', 
                            onPress: () => navigateToCreate(response.detectedType, response.parsedData)
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to process file');
        } finally {
            setIsProcessing(false);
        }
    };

    // Process voice input through mock API
    const processVoiceInput = async () => {
        setIsProcessing(true);
        try {
            const response = await mockApi.parseAIInput({
                type: 'voice',
                content: 'Simulated voice transcription: Add a new task to review the project designs by Friday',
            });
            
            if (response.success) {
                Alert.alert(
                    'AI Parsed Voice Input',
                    `Detected: ${response.detectedType}\n\nTitle: ${response.parsedData.title}\n\nDescription: ${response.parsedData.description || 'None'}`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Create', 
                            onPress: () => navigateToCreate(response.detectedType, response.parsedData)
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to process voice input');
        } finally {
            setIsProcessing(false);
        }
    };

    // Navigate to appropriate create screen with pre-filled data
    const navigateToCreate = (type: string, data: any) => {
        switch (type) {
            case 'task':
                router.push({
                    pathname: '/(tabs)/sdlc/create-task',
                    params: { prefillTitle: data.title, prefillDescription: data.description },
                });
                break;
            case 'challenge':
                router.push({
                    pathname: '/(tabs)/challenges/create',
                    params: { prefillName: data.title, prefillDescription: data.description },
                });
                break;
            case 'event':
                router.push('/(tabs)/command-center');
                break;
            default:
                router.push('/(tabs)/sdlc/create-task');
        }
    };

    const handleQuickCreate = async () => {
        if (input.trim()) {
            setIsProcessing(true);
            try {
                const response = await mockApi.parseAIInput({
                    type: 'text',
                    content: input,
                });
                
                if (response.success) {
                    Alert.alert(
                        'AI Parsed Input',
                        `Detected: ${response.detectedType}\n\nTitle: ${response.parsedData.title}\n\nDescription: ${response.parsedData.description || 'None'}`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                                text: 'Create', 
                                onPress: () => {
                                    setInput('');
                                    navigateToCreate(response.detectedType, response.parsedData);
                                }
                            },
                        ]
                    );
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to process input');
            } finally {
                setIsProcessing(false);
            }
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

                            {/* Create Options */}
                            <Text className="text-sm font-semibold text-gray-700 mb-3">Create New</Text>
                            <View className="flex-row gap-3 mb-6 pb-4 border-b border-gray-200">
                                {CREATE_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => handleCreateOption(option)}
                                        className="flex-1 items-center py-4 bg-gray-50 rounded-xl"
                                    >
                                        <View
                                            className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                                            style={{ backgroundColor: option.color + '20' }}
                                        >
                                            <MaterialCommunityIcons
                                                name={option.icon as any}
                                                size={24}
                                                color={option.color}
                                            />
                                        </View>
                                        <Text className="text-xs font-medium" style={{ color: option.color }}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Smart Input Options Row */}
                            <Text className="text-sm font-semibold text-gray-700 mb-3">Smart Input</Text>
                            <View className="flex-row gap-3">
                                {INPUT_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => {
                                            if (option.id === 'camera') handleCamera();
                                            else if (option.id === 'image') handleImagePicker();
                                            else if (option.id === 'file') handleFilePicker();
                                            else if (option.id === 'voice') handleVoiceInput();
                                        }}
                                        disabled={isProcessing}
                                        className={`flex-1 items-center py-4 rounded-xl ${
                                            option.id === 'voice' && isRecording ? 'bg-red-50' : 'bg-gray-50'
                                        }`}
                                    >
                                        <View
                                            className="w-12 h-12 rounded-full items-center justify-center mb-2"
                                            style={{ backgroundColor: option.color + '20' }}
                                        >
                                            {isProcessing ? (
                                                <ActivityIndicator color={option.color} />
                                            ) : (
                                                <MaterialCommunityIcons 
                                                    name={option.id === 'voice' && isRecording ? 'stop' : option.icon as any} 
                                                    size={24} 
                                                    color={option.color} 
                                                />
                                            )}
                                        </View>
                                        <Text className="text-xs font-medium" style={{ color: option.color }}>
                                            {option.id === 'voice' && isRecording ? 'Recording...' : option.label}
                                        </Text>
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
