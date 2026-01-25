import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, Animated, Linking } from 'react-native';
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
import { Audio } from 'expo-av';
import { aiApi } from '../../services/api';

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

type AttachmentType = {
    type: 'image' | 'file' | 'voice';
    uri: string;
    name?: string;
    source?: 'camera' | 'gallery';
} | null;

type PendingAction = 'camera' | 'image' | 'file' | 'voice' | null;

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
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [attachment, setAttachment] = useState<AttachmentType>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const isExecutingAction = useRef(false);
    
    // Voice wave animation
    const waveAnim1 = useRef(new Animated.Value(0.3)).current;
    const waveAnim2 = useRef(new Animated.Value(0.5)).current;
    const waveAnim3 = useRef(new Animated.Value(0.7)).current;
    const waveAnim4 = useRef(new Animated.Value(0.4)).current;
    const waveAnim5 = useRef(new Animated.Value(0.6)).current;
    const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Animate voice waves when recording
    useEffect(() => {
        if (isRecording) {
            const animateWave = (anim: Animated.Value, duration: number) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: false }),
                        Animated.timing(anim, { toValue: 0.2, duration, useNativeDriver: false }),
                    ])
                ).start();
            };
            animateWave(waveAnim1, 300);
            animateWave(waveAnim2, 400);
            animateWave(waveAnim3, 250);
            animateWave(waveAnim4, 350);
            animateWave(waveAnim5, 280);
            
            // Start recording timer
            recordingTimer.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            waveAnim1.setValue(0.3);
            waveAnim2.setValue(0.5);
            waveAnim3.setValue(0.7);
            waveAnim4.setValue(0.4);
            waveAnim5.setValue(0.6);
            
            // Clear timer
            if (recordingTimer.current) {
                clearInterval(recordingTimer.current);
                recordingTimer.current = null;
            }
        }
        
        return () => {
            if (recordingTimer.current) {
                clearInterval(recordingTimer.current);
            }
        };
    }, [isRecording]);

    // Simple handlers that set pending action and close modal
    const handleCamera = () => {
        setPendingAction('camera');
        setShowCreateMenu(false);
    };

    const handleImagePicker = () => {
        setPendingAction('image');
        setShowCreateMenu(false);
    };

    const handleFilePicker = () => {
        setPendingAction('file');
        setShowCreateMenu(false);
    };

    const handleVoiceInput = () => {
        setPendingAction('voice');
        setShowCreateMenu(false);
    };

    // Actual launcher functions (called from useEffect after modal closes)
    const launchCamera = useCallback(async () => {
        try {
            console.log('📷 Requesting camera permission...');
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            console.log('📷 Camera permission result:', permissionResult);
            
            if (!permissionResult.granted) {
                if (!permissionResult.canAskAgain) {
                    Alert.alert(
                        'Camera Permission Required',
                        'Camera access was denied. Please enable it in Settings to take photos.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() }
                        ]
                    );
                } else {
                    Alert.alert('Permission Required', 'Camera access is needed to take photos.');
                }
                return;
            }

            console.log('📷 Launching camera...');
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
            });
            console.log('📷 Camera result:', JSON.stringify(result));

            if (!result.canceled && result.assets && result.assets[0]) {
                console.log('📷 Setting attachment with URI:', result.assets[0].uri);
                setAttachment({
                    type: 'image',
                    uri: result.assets[0].uri,
                    source: 'camera',
                });
            }
        } catch (error) {
            console.error('📷 Camera error:', error);
            Alert.alert('Error', 'Failed to access camera. Please try again.');
        }
    }, []);

    const launchImagePicker = useCallback(async () => {
        try {
            console.log('🖼️ Requesting media library permission...');
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('🖼️ Media library permission result:', permissionResult);
            
            if (!permissionResult.granted) {
                if (!permissionResult.canAskAgain) {
                    Alert.alert(
                        'Photo Library Permission Required',
                        'Photo library access was denied. Please enable it in Settings.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() }
                        ]
                    );
                } else {
                    Alert.alert('Permission Required', 'Photo library access is needed to select images.');
                }
                return;
            }

            console.log('🖼️ Launching image library...');
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: false,
                quality: 0.8,
            });
            console.log('🖼️ Image library result:', JSON.stringify(result));

            if (!result.canceled && result.assets && result.assets[0]) {
                console.log('🖼️ Setting attachment with URI:', result.assets[0].uri);
                setAttachment({
                    type: 'image',
                    uri: result.assets[0].uri,
                    source: 'gallery',
                });
            } else {
                console.log('🖼️ User cancelled or no assets');
            }
        } catch (error) {
            console.error('🖼️ Image picker error:', error);
            Alert.alert('Error', 'Failed to access photo library. Please try again.');
        }
    }, []);

    const launchFilePicker = useCallback(async () => {
        try {
            console.log('📄 Launching document picker...');
            
            // Note: Document picker can be unstable on iOS simulator
            // It works better on real devices
            const result = await DocumentPicker.getDocumentAsync({
                type: ['*/*'],
                copyToCacheDirectory: true,
                multiple: false,
            });
            console.log('📄 Document picker result:', JSON.stringify(result));

            if (!result.canceled && result.assets && result.assets[0]) {
                console.log('📄 Setting attachment with file:', result.assets[0].name);
                setAttachment({
                    type: 'file',
                    uri: result.assets[0].uri,
                    name: result.assets[0].name || 'Document',
                });
            } else {
                console.log('📄 User cancelled or no assets');
            }
        } catch (error: any) {
            console.error('📄 Document picker error:', error);
            Alert.alert('Error', 'Failed to pick file. Please try again.');
        }
    }, []);

    const startVoiceRecording = useCallback(async () => {
        try {
            console.log('🎤 Requesting audio permission...');
            const permission = await Audio.requestPermissionsAsync();
            console.log('🎤 Audio permission result:', permission);
            
            if (!permission.granted) {
                if (!permission.canAskAgain) {
                    Alert.alert(
                        'Microphone Permission Required',
                        'Microphone access was denied. Please enable it in Settings to record voice.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() }
                        ]
                    );
                } else {
                    Alert.alert('Permission Required', 'Microphone access is needed to record voice.');
                }
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('🎤 Starting recording...');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recordingRef.current = recording;
            setIsRecording(true);
            setRecordingDuration(0);
            console.log('🎤 Recording started');
        } catch (error) {
            console.error('🎤 Voice recording error:', error);
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    }, []);

    // Execute pending action after modal is closed
    // This useEffect must be after the launcher functions are defined
    useEffect(() => {
        if (pendingAction && !showCreateMenu && !isExecutingAction.current) {
            isExecutingAction.current = true;
            const currentAction = pendingAction;
            setPendingAction(null); // Clear immediately to prevent re-triggering
            
            const executeAction = async () => {
                console.log('🔄 Executing pending action:', currentAction);
                try {
                    switch (currentAction) {
                        case 'camera':
                            await launchCamera();
                            break;
                        case 'image':
                            await launchImagePicker();
                            break;
                        case 'file':
                            await launchFilePicker();
                            break;
                        case 'voice':
                            await startVoiceRecording();
                            break;
                    }
                } finally {
                    isExecutingAction.current = false;
                }
            };
            // Small delay to ensure modal animation is complete
            const timer = setTimeout(executeAction, 200);
            return () => {
                clearTimeout(timer);
                isExecutingAction.current = false;
            };
        }
    }, [pendingAction, showCreateMenu, launchCamera, launchImagePicker, launchFilePicker, startVoiceRecording]);
    
    // Cancel voice recording
    const cancelVoiceRecording = async () => {
        console.log('🎤 Cancelling recording...');
        try {
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                recordingRef.current = null;
            }
        } catch (error) {
            console.error('🎤 Error stopping recording:', error);
        }
        setIsRecording(false);
        setRecordingDuration(0);
    };
    
    // Accept voice recording
    const acceptVoiceRecording = async () => {
        console.log('🎤 Accepting recording...');
        try {
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                const uri = recordingRef.current.getURI();
                console.log('🎤 Recording saved to:', uri);
                recordingRef.current = null;
                
                const duration = recordingDuration;
                setIsRecording(false);
                setRecordingDuration(0);
                
                setAttachment({
                    type: 'voice',
                    uri: uri || 'voice-recording',
                    name: `Voice Message (${formatRecordingTime(duration)})`,
                });
            } else {
                setIsRecording(false);
                setRecordingDuration(0);
            }
        } catch (error) {
            console.error('🎤 Error accepting recording:', error);
            setIsRecording(false);
            setRecordingDuration(0);
        }
    };
    
    // Format recording time
    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Clear attachment
    const clearAttachment = () => {
        setAttachment(null);
    };

    // Process image input through mock API
    const processImageInput = async (imageUri: string, source: 'camera' | 'gallery') => {
        setIsProcessing(true);
        try {
            const response = await aiApi.parseInput({
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
            const response = await aiApi.parseInput({
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
            const response = await aiApi.parseInput({
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
        // Check if there's an attachment or text to process
        if (!attachment && !input.trim()) return;
        
        setIsProcessing(true);
        try {
            let response: { success: boolean; detectedType: string; parsedData: { title: string; description?: string } } | undefined;
            
            if (attachment) {
                // Process attachment
                if (attachment.type === 'image') {
                    response = await aiApi.parseInput({
                        type: 'image',
                        content: attachment.uri,
                        source: attachment.source,
                    });
                } else if (attachment.type === 'file') {
                    response = await aiApi.parseInput({
                        type: 'file',
                        content: attachment.uri,
                        fileName: attachment.name,
                    });
                } else if (attachment.type === 'voice') {
                    response = await aiApi.parseInput({
                        type: 'voice',
                        content: 'Simulated voice transcription: Add a new task to review the project designs by Friday',
                    });
                }
            } else {
                // Process text input
                response = await aiApi.parseInput({
                    type: 'text',
                    content: input,
                });
            }
            
            if (response?.success) {
                const attachmentInfo = attachment 
                    ? `Attachment: ${attachment.type === 'image' ? 'Photo' : attachment.type === 'file' ? attachment.name : 'Voice'}\n\n`
                    : '';
                
                const detectedType = response.detectedType;
                const parsedData = response.parsedData;
                
                Alert.alert(
                    'AI Parsed Input',
                    `${attachmentInfo}Detected: ${detectedType}\n\nTitle: ${parsedData.title}\n\nDescription: ${parsedData.description || 'None'}`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Create', 
                            onPress: () => {
                                setInput('');
                                setAttachment(null);
                                navigateToCreate(detectedType, parsedData);
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
                    <View className="px-3 py-2">
                        {/* Voice Recording UI or Normal Input */}
                        {isRecording ? (
                            // Voice Recording Interface
                            <View className="flex-row items-center">
                                <View className="flex-1 bg-red-50 rounded-3xl border border-red-200 flex-row items-center px-3 py-2">
                                    {/* Cancel/Stop Button */}
                                    <TouchableOpacity
                                        onPress={cancelVoiceRecording}
                                        className="w-10 h-10 rounded-full items-center justify-center bg-red-100"
                                    >
                                        <MaterialCommunityIcons name="close" size={22} color="#EF4444" />
                                    </TouchableOpacity>

                                    {/* Voice Wave Animation */}
                                    <View className="flex-1 flex-row items-center justify-center px-4">
                                        <View className="flex-row items-center space-x-1">
                                            {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5].map((anim, index) => (
                                                <Animated.View
                                                    key={index}
                                                    style={{
                                                        width: 4,
                                                        height: anim.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: [8, 28],
                                                        }),
                                                        backgroundColor: '#EF4444',
                                                        borderRadius: 2,
                                                        marginHorizontal: 2,
                                                    }}
                                                />
                                            ))}
                                        </View>
                                        <Text className="ml-4 text-red-500 font-semibold text-base">
                                            {formatRecordingTime(recordingDuration)}
                                        </Text>
                                    </View>

                                    {/* Accept/Check Button */}
                                    <TouchableOpacity
                                        onPress={acceptVoiceRecording}
                                        className="w-10 h-10 rounded-full items-center justify-center bg-green-500"
                                    >
                                        <MaterialCommunityIcons name="check" size={22} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            // Normal Input Interface Container
                            <View className="flex-row items-center">
                                <View className="flex-1 bg-gray-50 rounded-3xl border border-gray-200 px-2 py-1.5">
                                    {/* Attachment Chip - Small inline preview like AI chats */}
                                    {attachment && (
                                        <View className="flex-row items-center mb-1.5">
                                            <View className="flex-row items-center bg-white rounded-xl px-2 py-1.5 border border-gray-200 shadow-sm">
                                                {attachment.type === 'image' ? (
                                                    <Image 
                                                        source={{ uri: attachment.uri }} 
                                                        className="w-8 h-8 rounded-lg"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View 
                                                        className="w-8 h-8 rounded-lg items-center justify-center"
                                                        style={{ backgroundColor: attachment.type === 'file' ? '#FEF3C7' : '#FEE2E2' }}
                                                    >
                                                        <MaterialCommunityIcons 
                                                            name={attachment.type === 'file' ? 'file-document' : 'microphone'} 
                                                            size={18} 
                                                            color={attachment.type === 'file' ? '#F59E0B' : '#EF4444'} 
                                                        />
                                                    </View>
                                                )}
                                                <Text className="ml-2 text-xs text-gray-600 max-w-[120px]" numberOfLines={1}>
                                                    {attachment.type === 'image' 
                                                        ? `Photo` 
                                                        : attachment.name || 'File'}
                                                </Text>
                                                <TouchableOpacity 
                                                    onPress={clearAttachment}
                                                    className="ml-1 w-5 h-5 items-center justify-center"
                                                >
                                                    <MaterialCommunityIcons name="close-circle" size={16} color="#9CA3AF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                    
                                    {/* Input Row */}
                                    <View className="flex-row items-center">
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
                                            placeholder={attachment ? "Add a message..." : "Type a message..."}
                                            placeholderTextColor="#9CA3AF"
                                            className="flex-1 px-2 py-1 text-base text-gray-800"
                                            maxLength={500}
                                        />

                                        {/* Send Button */}
                                        <TouchableOpacity
                                            onPress={handleQuickCreate}
                                            disabled={(!input.trim() && !attachment) || isProcessing}
                                            className={`w-9 h-9 rounded-full items-center justify-center ${
                                                (input.trim() || attachment) ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                        >
                                            {isProcessing ? (
                                                <ActivityIndicator color="white" size="small" />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    name="send"
                                                    size={18}
                                                    color="white"
                                                />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
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
