import { logger } from '../../utils/logger';
import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Animated, Linking } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigationStore, AppContext } from '../../store/navigationStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { useNotificationStore } from '../../store/notificationStore';
import { NAV_CONFIGS } from '../../utils/navigationConfig';
import { useRouter, usePathname } from 'expo-router';
import { AppSwitcher } from './AppSwitcher';
import { AppIcon } from '../ui/AppIcon';
import { navIcons, moduleIcons, actionIcons } from '../../constants/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { aiApi, commandCenterApi } from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';
import { useThemeContext } from '../../providers/ThemeProvider';

const CREATE_OPTIONS = [
    { id: 'task', icon: 'checkbox-marked-circle-outline', label: 'Task', color: '#3B82F6', route: '/(tabs)/sprints/create-task' },
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
    const { currentApp, toggleAppSwitcher } = useNavigationStore();
    const { isActive: isPomodoroActive, timeRemaining, isPaused } = usePomodoroStore();
    const { unreadCount } = useNotificationStore();
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const [input, setInput] = useState('');
    const [showCreateMenu, setShowCreateMenu] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [attachment, setAttachment] = useState<AttachmentType>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const isExecutingAction = useRef(false);
    
    // Reset execution state when menu opens (in case previous action got stuck)
    useEffect(() => {
        if (showCreateMenu) {
            logger.log('📋 [Menu] Opening create menu, resetting execution state');
            isExecutingAction.current = false;
        }
    }, [showCreateMenu]);
    
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
        logger.log('📷 [Smart Input] Camera button pressed');
        setPendingAction('camera');
        setShowCreateMenu(false);
    };

    const handleImagePicker = () => {
        logger.log('🖼️ [Smart Input] Image button pressed');
        setPendingAction('image');
        setShowCreateMenu(false);
    };

    const handleFilePicker = () => {
        logger.log('📄 [Smart Input] File button pressed');
        setPendingAction('file');
        setShowCreateMenu(false);
    };

    const handleVoiceInput = () => {
        logger.log('🎤 [Smart Input] Voice button pressed');
        setPendingAction('voice');
        setShowCreateMenu(false);
    };

    // Actual launcher functions (called from useEffect after modal closes)
    const launchCamera = useCallback(async () => {
        try {
            logger.log('📷 Requesting camera permission...');
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            logger.log('📷 Camera permission result:', permissionResult);
            
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

            logger.log('📷 Launching camera...');
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
            });
            logger.log('📷 Camera result:', JSON.stringify(result));

            if (!result.canceled && result.assets && result.assets[0]) {
                logger.log('📷 Setting attachment with URI:', result.assets[0].uri);
                setAttachment({
                    type: 'image',
                    uri: result.assets[0].uri,
                    source: 'camera',
                });
            }
        } catch (error) {
            logger.error('📷 Camera error:', error);
            Alert.alert('Error', 'Failed to access camera. Please try again.');
        }
    }, []);

    const launchImagePicker = useCallback(async () => {
        try {
            logger.log('🖼️ Requesting media library permission...');
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            logger.log('🖼️ Media library permission result:', permissionResult);
            
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

            logger.log('🖼️ Launching image library...');
            
            // Add timeout protection for simulator issues
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('TIMEOUT'));
                }, 10000); // 10 second timeout
            });
            
            const pickerPromise = ImagePicker.launchImageLibraryAsync({
                allowsEditing: false,
                quality: 0.8,
            });
            
            const result = await Promise.race([pickerPromise, timeoutPromise]);
            logger.log('🖼️ Image library result:', JSON.stringify(result));

            if (!result.canceled && result.assets && result.assets[0]) {
                logger.log('🖼️ Setting attachment with URI:', result.assets[0].uri);
                setAttachment({
                    type: 'image',
                    uri: result.assets[0].uri,
                    source: 'gallery',
                });
            } else {
                logger.log('🖼️ User cancelled or no assets');
            }
        } catch (error: unknown) {
            logger.error('🖼️ Image picker error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage === 'TIMEOUT') {
                Alert.alert(
                    'Image Picker Issue',
                    'The image picker is not responding. This can happen on the iOS Simulator. Try reloading the app or test on a real device.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'Failed to access photo library. Please try again.');
            }
        }
    }, []);

    const launchFilePicker = useCallback(async () => {
        try {
            logger.log('📄 Launching document picker...');
            
            // Document picker is unreliable on iOS simulator
            // Show warning and use shorter timeout
            const isSimulator = __DEV__ && Platform.OS === 'ios';
            
            if (isSimulator) {
                logger.log('📄 Running on iOS simulator - document picker may not work');
            }
            
            // Create a timeout promise - 5 seconds is enough
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('TIMEOUT'));
                }, 5000); // 5 second timeout
            });
            
            const pickerPromise = DocumentPicker.getDocumentAsync({
                type: ['*/*'],
                copyToCacheDirectory: true,
                multiple: false,
            });
            
            // Race between the picker and timeout
            const result = await Promise.race([pickerPromise, timeoutPromise]);
            logger.log('📄 Document picker result:', JSON.stringify(result));

            if (!result.canceled && result.assets && result.assets[0]) {
                logger.log('📄 Setting attachment with file:', result.assets[0].name);
                setAttachment({
                    type: 'file',
                    uri: result.assets[0].uri,
                    name: result.assets[0].name || 'Document',
                });
            } else {
                logger.log('📄 User cancelled or no assets');
            }
        } catch (error: unknown) {
            logger.error('📄 Document picker error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage === 'TIMEOUT') {
                Alert.alert(
                    'File Picker Unavailable',
                    'The file picker is not responding. This commonly happens on the iOS Simulator.\n\nPlease test on a real device, or use Image picker instead.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'Failed to pick file. Please try again.');
            }
        }
    }, []);

    const startVoiceRecording = useCallback(async () => {
        try {
            logger.log('🎤 Requesting audio permission...');
            const permission = await Audio.requestPermissionsAsync();
            logger.log('🎤 Audio permission result:', JSON.stringify(permission));
            
            if (!permission.granted) {
                logger.log('🎤 Permission not granted, canAskAgain:', permission.canAskAgain);
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

            logger.log('🎤 Setting audio mode...');
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            logger.log('🎤 Creating recording...');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            logger.log('🎤 Recording object created:', recording);
            recordingRef.current = recording;
            setIsRecording(true);
            setRecordingDuration(0);
            logger.log('🎤 Recording started successfully!');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorName = error instanceof Error ? error.name : 'UnknownError';
            logger.error('🎤 Voice recording error:', error);
            logger.error('🎤 Error name:', errorName);
            logger.error('🎤 Error message:', errorMessage);
            Alert.alert('Error', `Failed to start recording: ${errorMessage}`);
        }
    }, []);

    // Execute pending action after modal is closed
    // This useEffect must be after the launcher functions are defined
    useEffect(() => {
        // Only log when there's something meaningful to track
        if (pendingAction || showCreateMenu) {
            logger.log('🔄 [useEffect] Check:', {
                pendingAction,
                showCreateMenu,
                isExecuting: isExecutingAction.current
            });
        }
        
        if (pendingAction && !showCreateMenu && !isExecutingAction.current) {
            logger.log('🔄 [useEffect] Conditions met, will execute:', pendingAction);
            isExecutingAction.current = true;
            const currentAction = pendingAction;
            
            // Execute immediately without setTimeout - the modal is already closed
            const executeAction = async () => {
                logger.log('🚀 [Execute] Starting action:', currentAction);
                // Clear pending action AFTER we've captured it
                setPendingAction(null);
                
                try {
                    switch (currentAction) {
                        case 'camera':
                            logger.log('🚀 [Execute] Calling launchCamera...');
                            await launchCamera();
                            logger.log('🚀 [Execute] launchCamera completed');
                            break;
                        case 'image':
                            logger.log('🚀 [Execute] Calling launchImagePicker...');
                            await launchImagePicker();
                            logger.log('🚀 [Execute] launchImagePicker completed');
                            break;
                        case 'file':
                            logger.log('🚀 [Execute] Calling launchFilePicker...');
                            await launchFilePicker();
                            logger.log('🚀 [Execute] launchFilePicker completed');
                            break;
                        case 'voice':
                            logger.log('🚀 [Execute] Calling startVoiceRecording...');
                            await startVoiceRecording();
                            logger.log('🚀 [Execute] startVoiceRecording completed');
                            break;
                    }
                } catch (error) {
                    logger.error('🚀 [Execute] Error:', error);
                } finally {
                    isExecutingAction.current = false;
                    logger.log('🚀 [Execute] Action complete, isExecuting reset');
                }
            };
            
            // Execute immediately - using requestAnimationFrame to ensure we're after the render
            requestAnimationFrame(() => {
                executeAction();
            });
        }
    }, [pendingAction, showCreateMenu, launchCamera, launchImagePicker, launchFilePicker, startVoiceRecording]);
    
    // Cancel voice recording
    const cancelVoiceRecording = async () => {
        logger.log('🎤 Cancelling recording...');
        try {
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                recordingRef.current = null;
            }
        } catch (error) {
            logger.error('🎤 Error stopping recording:', error);
        }
        setIsRecording(false);
        setRecordingDuration(0);
    };
    
    // Accept voice recording
    const acceptVoiceRecording = async () => {
        logger.log('🎤 Accepting recording...');
        try {
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                const uri = recordingRef.current.getURI();
                logger.log('🎤 Recording saved to:', uri);
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
            logger.error('🎤 Error accepting recording:', error);
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
                    pathname: '/(tabs)/sprints/create-task' as any,
                    params: { prefillTitle: data.title, prefillDescription: data.description },
                });
                break;
            case 'challenge':
                router.push({
                    pathname: '/(tabs)/challenges/create' as any,
                    params: { prefillName: data.title, prefillDescription: data.description },
                });
                break;
            case 'event':
                router.push('/(tabs)/command-center');
                break;
            default:
                router.push('/(tabs)/sprints/create-task' as any);
        }
    };

    const handleQuickCreate = async () => {
        // Check if there's an attachment or text to process
        if (!attachment && !input.trim()) {
            logger.log('📤 [Send] No content to send - attachment:', attachment, 'input:', input);
            return;
        }
        
        logger.log('📤 [Send] Processing with AI...', {
            hasAttachment: !!attachment,
            attachmentType: attachment?.type,
            attachmentUri: attachment?.uri,
            textInput: input.trim(),
        });
        
        setIsProcessing(true);
        try {
            // Build attachments array for API
            const attachments = attachment ? [{
                type: attachment.type as 'image' | 'file' | 'voice',
                uri: attachment.uri,
                name: attachment.name,
                mimeType: attachment.type === 'image' ? 'image/jpeg' 
                    : attachment.type === 'voice' ? 'audio/m4a' 
                    : 'application/octet-stream',
            }] : [];
            
            // Send to backend AI processing endpoint
            const response = await commandCenterApi.processWithAI(
                input.trim() || null,
                attachments
            );
            
            logger.log('📤 [Send] AI response:', response);
            
            if (response.success && response.data) {
                const aiResponse = response.data;
                
                // Check if AI needs clarification
                if (aiResponse.intentDetected === 'clarification_needed' || 
                    (aiResponse.clarifyingQuestions && aiResponse.clarifyingQuestions.length > 0)) {
                    // AI has questions - show them
                    const questions = aiResponse.clarifyingQuestions?.join('\n\n') || 'Could you provide more details?';
                    Alert.alert(
                        '🤔 Need More Info',
                        `${aiResponse.reasoning}\n\n${questions}`,
                        [
                            { 
                                text: 'OK', 
                                onPress: () => {
                                    // Keep input so user can add more info
                                    logger.log('📤 [Send] User needs to clarify');
                                }
                            },
                        ]
                    );
                } else {
                    // AI created a draft - show for approval
                    const draftType = aiResponse.intentDetected.charAt(0).toUpperCase() + aiResponse.intentDetected.slice(1);
                    const draftTitle = (aiResponse.draft as any).title || (aiResponse.draft as any).name || 'New Item';
                    
                    Alert.alert(
                        `✨ ${draftType} Created`,
                        `${aiResponse.reasoning}\n\n"${draftTitle}"\n\nConfidence: ${Math.round(aiResponse.confidenceScore * 100)}%`,
                        [
                            {
                                text: 'Reject',
                                style: 'destructive',
                                onPress: async () => {
                                    await commandCenterApi.rejectDraft(aiResponse.id);
                                    logger.log('📤 [Send] Draft rejected');
                                }
                            },
                            { 
                                text: 'Approve', 
                                style: 'default',
                                onPress: async () => {
                                    const approveResult = await commandCenterApi.approveDraft(aiResponse.id);
                                    if (approveResult.success) {
                                        Alert.alert('Success', `${draftType} created successfully!`);
                                    } else {
                                        Alert.alert('Error', 'Failed to create ' + draftType.toLowerCase());
                                    }
                                    logger.log('📤 [Send] Draft approved');
                                    setInput('');
                                    setAttachment(null);
                                }
                            },
                        ]
                    );
                }
            } else {
                // Show error from backend or generic error
                Alert.alert(
                    'Error',
                    typeof response.error === 'string' ? response.error : 'Failed to process with AI',
                    [{ text: 'OK' }]
                );
            }
        } catch (error: unknown) {
            logger.error('📤 [Send] Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to process input';
            Alert.alert('Error', errorMessage);
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
    const mainIcon = NAV_CONFIGS[currentApp as AppContext] ?? NAV_CONFIGS['sprints'];

    const handleIconPress = (route: string) => {
        router.push(route as any);
    };

    const isActive = (route: string) => {
        return pathname.startsWith(route);
    };

    const isDashboardActive = pathname.startsWith('/(tabs)/dashboard');

    // Check if we're on the Command Center screen
    const isOnCommandCenter = pathname.includes('/command-center');

    // Hide custom input on Command Center since it has its own input
    if (isOnCommandCenter) {
        return null;
    }

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
                                <View 
                                    className="flex-1 rounded-3xl px-2 py-1.5"
                                    style={{ 
                                        backgroundColor: colors.inputBackground,
                                        borderWidth: 1,
                                        borderColor: colors.border
                                    }}
                                >
                                    {/* Attachment Chip - Small inline preview like AI chats */}
                                    {attachment && (
                                        <View className="flex-row items-center mb-1.5">
                                            <View 
                                                className="flex-row items-center rounded-xl px-2 py-1.5"
                                                style={{ 
                                                    backgroundColor: colors.card,
                                                    borderWidth: 1,
                                                    borderColor: colors.border,
                                                    shadowColor: colors.shadow
                                                }}
                                            >
                                                {attachment.type === 'image' ? (
                                                    <Image 
                                                        source={{ uri: attachment.uri }} 
                                                        className="w-8 h-8 rounded-lg"
                                                        contentFit="cover"
                                                        cachePolicy="memory-disk"
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
                                                <Text 
                                                    className="ml-2 text-xs max-w-[120px]" 
                                                    numberOfLines={1}
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    {attachment.type === 'image' 
                                                        ? `Photo` 
                                                        : attachment.name || 'File'}
                                                </Text>
                                                <TouchableOpacity 
                                                    onPress={clearAttachment}
                                                    className="ml-1 w-5 h-5 items-center justify-center"
                                                >
                                                    <MaterialCommunityIcons name="close-circle" size={16} color={colors.textTertiary} />
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
                                            <MaterialCommunityIcons name="plus-circle" size={24} color={colors.textTertiary} />
                                        </TouchableOpacity>

                                        {/* Text Input */}
                                        <TextInput
                                            value={input}
                                            onChangeText={setInput}
                                            placeholder={attachment ? "Add a message..." : "Type a message..."}
                                            placeholderTextColor={colors.placeholder}
                                            className="flex-1 px-2 py-1"
                                            style={{ color: colors.text, fontSize: 16 }}
                                            maxLength={500}
                                        />

                                        {/* Send Button */}
                                        <TouchableOpacity
                                            onPress={handleQuickCreate}
                                            disabled={(!input.trim() && !attachment) || isProcessing}
                                            className="w-9 h-9 rounded-full items-center justify-center"
                                            style={{ 
                                                backgroundColor: (input.trim() || attachment) ? colors.primary : colors.border 
                                            }}
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
                                <AppIcon icon={navIcons.apps} size={28} color="#F59E0B" />
                            </View>
                            <Text className="text-[10px] font-medium mt-0.5" style={{ color: '#F59E0B' }}>{t('navigation.appSwitcher.title')}</Text>
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
                                <AppIcon
                                    icon={mainIcon.icon}
                                    size={28}
                                    color={isActive(mainIcon.route) ? '#2563EB' : '#3B82F6'}
                                />
                            </View>
                            <Text
                                className="text-[10px] font-semibold mt-0.5"
                                style={{ color: isActive(mainIcon.route) ? '#2563EB' : '#3B82F6' }}
                            >
                                {t(mainIcon.nameKey)}
                            </Text>
                        </TouchableOpacity>

                        {/* 3. Dashboard (replaces More) - Blue background + notification badge */}
                        <TouchableOpacity
                            className="items-center"
                            onPress={() => handleIconPress('/(tabs)/dashboard')}
                        >
                            <View className="relative">
                                <View
                                    className="w-12 h-12 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: isDashboardActive ? '#DBEAFE' : '#EFF6FF' }}
                                >
                                    <AppIcon
                                        icon={moduleIcons.dashboard}
                                        size={28}
                                        color={isDashboardActive ? '#2563EB' : '#3B82F6'}
                                    />
                                </View>
                                {unreadCount > 0 && (
                                    <View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full items-center justify-center px-1 border-2 border-white">
                                        <Text className="text-white text-[9px] font-bold">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                className="text-[10px] font-semibold mt-0.5"
                                style={{ color: isDashboardActive ? '#2563EB' : '#3B82F6' }}
                            >
                                {t('navigation.tabs.dashboard')}
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
                                <AppIcon
                                    icon={actionIcons.addCircle}
                                    size={28}
                                    color={isOnCommandCenter ? '#059669' : '#10B981'}
                                />
                            </View>
                            <Text
                                className="text-[10px] font-medium mt-0.5"
                                style={{ color: isOnCommandCenter ? '#059669' : '#10B981' }}
                            >
                                {t('common.create')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <AppSwitcher />

            {/* Create & Attachment Options Modal */}
            <Modal visible={showCreateMenu} transparent animationType="slide">
                <Pressable
                    className="flex-1 justify-end"
                    style={{ backgroundColor: colors.overlay }}
                    onPress={() => setShowCreateMenu(false)}
                >
                    <Pressable>
                        <View 
                            className="rounded-t-3xl pt-4 pb-8 px-4"
                            style={{ backgroundColor: colors.card }}
                        >
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold" style={{ color: colors.text }}>{t('navigation.createMenu.title')}</Text>
                                <TouchableOpacity onPress={() => setShowCreateMenu(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Create Options */}
                            <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>Create New</Text>
                            <View 
                                className="flex-row gap-3 mb-6 pb-4"
                                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                            >
                                {CREATE_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => handleCreateOption(option)}
                                        className="flex-1 items-center py-4 rounded-xl"
                                        style={{ backgroundColor: colors.backgroundTertiary }}
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
                            <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>Smart Input</Text>
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
                                        className="flex-1 items-center py-4 rounded-xl"
                                        style={{ 
                                            backgroundColor: option.id === 'voice' && isRecording 
                                                ? colors.errorLight 
                                                : colors.backgroundTertiary 
                                        }}
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
