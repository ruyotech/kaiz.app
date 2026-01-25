/**
 * ChatInput.tsx - Modern Chat Input Component for Expo SDK 54
 * 
 * Uses the latest 2026 Expo APIs:
 * - expo-image-picker (launchImageLibraryAsync, launchCameraAsync)
 * - expo-document-picker (getDocumentAsync with copyToCacheDirectory: true)
 * - expo-audio (new module, NOT expo-av which is deprecated)
 * - expo-file-system (for file preparation and upload normalization)
 * 
 * Features:
 * - Camera capture
 * - Gallery image picker  
 * - Document/file picker
 * - Voice recording with "Hold to Record" UI
 * - Attachment preview with thumbnails
 * - Audio playback preview
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    Animated,
    Pressable,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { 
    useAudioRecorder, 
    RecordingPresets,
    useAudioPlayer,
    requestRecordingPermissionsAsync,
} from 'expo-audio';

// ============================================================================
// Types
// ============================================================================

/**
 * Normalized attachment type for consistent handling across all input types
 */
export interface Attachment {
    uri: string;
    type: 'image' | 'file' | 'audio';
    name: string;
    mimeType: string;
    size: number;
}

export interface ChatInputProps {
    onSend: (message: string, attachments: Attachment[]) => void;
    placeholder?: string;
    disabled?: boolean;
    maxAttachments?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get file info using expo-file-system to normalize attachment data
 */
async function getFileInfo(uri: string): Promise<{ size: number; exists: boolean }> {
    try {
        const info = await FileSystem.getInfoAsync(uri);
        return {
            exists: info.exists,
            size: info.exists && 'size' in info ? info.size : 0,
        };
    } catch (error) {
        console.error('❌ Error getting file info:', error);
        return { exists: false, size: 0 };
    }
}

/**
 * Extract filename from URI
 */
function getFilenameFromUri(uri: string): string {
    const segments = uri.split('/');
    return segments[segments.length - 1] || 'unknown';
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        // Images
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        heic: 'image/heic',
        // Audio
        m4a: 'audio/m4a',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        aac: 'audio/aac',
        // Documents
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain',
        json: 'application/json',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format duration in seconds to mm:ss
 */
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Log attachment info for debugging/verification
 */
function logAttachmentInfo(attachment: Attachment, label: string = 'Attachment'): void {
    console.log(`\n📎 ===== ${label} =====`);
    console.log(`   URI: ${attachment.uri}`);
    console.log(`   Type: ${attachment.type}`);
    console.log(`   Name: ${attachment.name}`);
    console.log(`   MIME: ${attachment.mimeType}`);
    console.log(`   Size: ${formatFileSize(attachment.size)} (${attachment.size} bytes)`);
    console.log(`   ========================\n`);
}

// ============================================================================
// Main Component
// ============================================================================

export function ChatInput({
    onSend,
    placeholder = 'Type a message...',
    disabled = false,
    maxAttachments = 5,
}: ChatInputProps) {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [playingAudioUri, setPlayingAudioUri] = useState<string | null>(null);
    
    // Recording timer ref
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Voice wave animation refs
    const waveAnims = useRef([
        new Animated.Value(0.3),
        new Animated.Value(0.5),
        new Animated.Value(0.7),
        new Animated.Value(0.4),
        new Animated.Value(0.6),
    ]).current;

    // -------------------------------------------------------------------------
    // Expo Audio Hooks (SDK 54 - expo-audio module)
    // -------------------------------------------------------------------------
    
    // Audio recorder using the new expo-audio hook
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
        console.log('🎤 [Voice] Recording status:', status);
    });
    
    // Audio player for playback preview (null source when not playing)
    const audioPlayer = useAudioPlayer(playingAudioUri ?? null);

    // -------------------------------------------------------------------------
    // Permissions Hooks (SDK 54 style)
    // -------------------------------------------------------------------------
    
    const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

    // -------------------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------------------
    
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
            
            waveAnims.forEach((anim, i) => {
                animateWave(anim, 250 + i * 50);
            });
            
            // Start duration timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            // Reset animations
            waveAnims.forEach((anim, i) => {
                anim.setValue(0.3 + i * 0.1);
            });
            
            // Clear timer
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
        
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, [isRecording]);

    // -------------------------------------------------------------------------
    // Camera Handler
    // -------------------------------------------------------------------------
    
    const handleCamera = useCallback(async () => {
        try {
            console.log('📷 [Camera] Checking permissions...');
            
            // Use the hook-based permission
            if (!cameraPermission?.granted) {
                const result = await requestCameraPermission();
                if (!result.granted) {
                    Alert.alert(
                        'Camera Permission Required',
                        'Please enable camera access in Settings to take photos.',
                        [{ text: 'OK' }]
                    );
                    return;
                }
            }
            
            console.log('📷 [Camera] Launching camera...');
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
                exif: false,
            });
            
            if (result.canceled) {
                console.log('📷 [Camera] User cancelled');
                return;
            }
            
            const asset = result.assets[0];
            console.log('📷 [Camera] Photo captured:', asset.uri);
            
            // Get file info for normalization
            const fileInfo = await getFileInfo(asset.uri);
            const filename = getFilenameFromUri(asset.uri);
            
            const attachment: Attachment = {
                uri: asset.uri,
                type: 'image',
                name: filename,
                mimeType: asset.mimeType || getMimeType(filename),
                size: fileInfo.size || asset.fileSize || 0,
            };
            
            logAttachmentInfo(attachment, 'Camera Photo');
            
            if (attachments.length < maxAttachments) {
                setAttachments(prev => [...prev, attachment]);
            } else {
                Alert.alert('Limit Reached', `Maximum ${maxAttachments} attachments allowed.`);
            }
        } catch (error) {
            console.error('📷 [Camera] Error:', error);
            Alert.alert('Error', 'Failed to capture photo. Please try again.');
        }
    }, [cameraPermission, requestCameraPermission, attachments.length, maxAttachments]);

    // -------------------------------------------------------------------------
    // Gallery Handler
    // -------------------------------------------------------------------------
    
    const handleGallery = useCallback(async () => {
        try {
            console.log('🖼️ [Gallery] Checking permissions...');
            
            // Use the hook-based permission
            if (!mediaLibraryPermission?.granted) {
                const result = await requestMediaLibraryPermission();
                if (!result.granted) {
                    Alert.alert(
                        'Photo Library Permission Required',
                        'Please enable photo library access in Settings to select images.',
                        [{ text: 'OK' }]
                    );
                    return;
                }
            }
            
            console.log('🖼️ [Gallery] Launching image library...');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                selectionLimit: maxAttachments - attachments.length,
                quality: 0.8,
                exif: false,
            });
            
            if (result.canceled) {
                console.log('🖼️ [Gallery] User cancelled');
                return;
            }
            
            console.log(`🖼️ [Gallery] Selected ${result.assets.length} image(s)`);
            
            const newAttachments: Attachment[] = [];
            
            for (const asset of result.assets) {
                const fileInfo = await getFileInfo(asset.uri);
                const filename = getFilenameFromUri(asset.uri);
                
                const attachment: Attachment = {
                    uri: asset.uri,
                    type: 'image',
                    name: filename,
                    mimeType: asset.mimeType || getMimeType(filename),
                    size: fileInfo.size || asset.fileSize || 0,
                };
                
                logAttachmentInfo(attachment, 'Gallery Image');
                newAttachments.push(attachment);
            }
            
            const availableSlots = maxAttachments - attachments.length;
            const toAdd = newAttachments.slice(0, availableSlots);
            
            if (toAdd.length < newAttachments.length) {
                Alert.alert('Some Images Skipped', `Only ${toAdd.length} image(s) added. Maximum ${maxAttachments} attachments allowed.`);
            }
            
            setAttachments(prev => [...prev, ...toAdd]);
        } catch (error) {
            console.error('🖼️ [Gallery] Error:', error);
            Alert.alert('Error', 'Failed to access photo library. Please try again.');
        }
    }, [mediaLibraryPermission, requestMediaLibraryPermission, attachments.length, maxAttachments]);

    // -------------------------------------------------------------------------
    // Document Picker Handler
    // -------------------------------------------------------------------------
    
    const handleFilePicker = useCallback(async () => {
        try {
            console.log('📄 [File] Launching document picker...');
            
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true, // CRUCIAL: ensures file is accessible by expo-file-system
                multiple: true,
            });
            
            if (result.canceled) {
                console.log('📄 [File] User cancelled');
                return;
            }
            
            console.log(`📄 [File] Selected ${result.assets.length} file(s)`);
            
            const newAttachments: Attachment[] = [];
            
            for (const asset of result.assets) {
                // Verify file is accessible
                const fileInfo = await getFileInfo(asset.uri);
                
                if (!fileInfo.exists) {
                    console.warn(`📄 [File] File not accessible: ${asset.uri}`);
                    continue;
                }
                
                const attachment: Attachment = {
                    uri: asset.uri,
                    type: 'file',
                    name: asset.name || getFilenameFromUri(asset.uri),
                    mimeType: asset.mimeType || getMimeType(asset.name || ''),
                    size: fileInfo.size || asset.size || 0,
                };
                
                logAttachmentInfo(attachment, 'Document');
                newAttachments.push(attachment);
            }
            
            const availableSlots = maxAttachments - attachments.length;
            const toAdd = newAttachments.slice(0, availableSlots);
            
            if (toAdd.length < newAttachments.length) {
                Alert.alert('Some Files Skipped', `Only ${toAdd.length} file(s) added. Maximum ${maxAttachments} attachments allowed.`);
            }
            
            setAttachments(prev => [...prev, ...toAdd]);
        } catch (error) {
            console.error('📄 [File] Error:', error);
            Alert.alert('Error', 'Failed to pick file. Please try again.');
        }
    }, [attachments.length, maxAttachments]);

    // -------------------------------------------------------------------------
    // Voice Recording Handlers (expo-audio - SDK 54)
    // -------------------------------------------------------------------------
    
    const startRecording = useCallback(async () => {
        try {
            console.log('🎤 [Voice] Requesting microphone permission...');
            
            // Request permission using the new expo-audio module
            const permissionStatus = await requestRecordingPermissionsAsync();
            
            if (!permissionStatus.granted) {
                Alert.alert(
                    'Microphone Permission Required',
                    'Please enable microphone access in Settings to record voice messages.',
                    [{ text: 'OK' }]
                );
                return;
            }
            
            console.log('🎤 [Voice] Preparing recorder...');
            
            // Prepare the recorder before starting (required in SDK 54)
            await audioRecorder.prepareToRecordAsync();
            
            console.log('🎤 [Voice] Starting recording...');
            
            // Use the recorder from useAudioRecorder hook
            audioRecorder.record();
            
            setIsRecording(true);
            setRecordingDuration(0);
            
            console.log('🎤 [Voice] Recording started');
        } catch (error) {
            console.error('🎤 [Voice] Error starting recording:', error);
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    }, [audioRecorder]);
    
    const stopRecording = useCallback(async (save: boolean = true) => {
        try {
            console.log(`🎤 [Voice] Stopping recording (save: ${save})...`);
            
            // Stop the recording
            await audioRecorder.stop();
            
            if (save && audioRecorder.uri) {
                const uri = audioRecorder.uri;
                console.log('🎤 [Voice] Recording saved to:', uri);
                
                // Get file info
                const fileInfo = await getFileInfo(uri);
                const filename = `voice_${Date.now()}.m4a`;
                
                const attachment: Attachment = {
                    uri,
                    type: 'audio',
                    name: filename,
                    mimeType: 'audio/m4a',
                    size: fileInfo.size,
                };
                
                logAttachmentInfo(attachment, 'Voice Recording');
                
                if (attachments.length < maxAttachments) {
                    setAttachments(prev => [...prev, attachment]);
                } else {
                    Alert.alert('Limit Reached', `Maximum ${maxAttachments} attachments allowed.`);
                }
            } else {
                console.log('🎤 [Voice] Recording discarded');
            }
            
            setIsRecording(false);
            setRecordingDuration(0);
        } catch (error) {
            console.error('🎤 [Voice] Error stopping recording:', error);
            setIsRecording(false);
            setRecordingDuration(0);
        }
    }, [audioRecorder, attachments.length, maxAttachments]);
    
    const cancelRecording = useCallback(() => {
        stopRecording(false);
    }, [stopRecording]);
    
    const acceptRecording = useCallback(() => {
        stopRecording(true);
    }, [stopRecording]);

    // -------------------------------------------------------------------------
    // Audio Playback Handler
    // -------------------------------------------------------------------------
    
    const handlePlayAudio = useCallback((uri: string) => {
        if (playingAudioUri === uri) {
            // Toggle pause/play
            if (audioPlayer.playing) {
                audioPlayer.pause();
            } else {
                audioPlayer.play();
            }
        } else {
            // Play new audio
            setPlayingAudioUri(uri);
            // The useAudioPlayer hook will automatically load and we can play
            setTimeout(() => {
                audioPlayer.play();
            }, 100);
        }
    }, [playingAudioUri, audioPlayer]);

    // -------------------------------------------------------------------------
    // Remove Attachment
    // -------------------------------------------------------------------------
    
    const removeAttachment = useCallback((index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    }, []);

    // -------------------------------------------------------------------------
    // Send Message
    // -------------------------------------------------------------------------
    
    const handleSend = useCallback(() => {
        if ((!message.trim() && attachments.length === 0) || disabled || isProcessing) {
            return;
        }
        
        console.log('\n📤 ===== SENDING MESSAGE =====');
        console.log(`   Message: "${message.trim()}"`);
        console.log(`   Attachments: ${attachments.length}`);
        attachments.forEach((att, i) => {
            logAttachmentInfo(att, `Attachment ${i + 1}`);
        });
        console.log('==============================\n');
        
        onSend(message.trim(), attachments);
        setMessage('');
        setAttachments([]);
    }, [message, attachments, disabled, isProcessing, onSend]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    
    const canSend = (message.trim() || attachments.length > 0) && !disabled && !isProcessing && !isRecording;

    return (
        <View className="bg-white border-t border-gray-200">
            {/* Attachment Preview Area */}
            {attachments.length > 0 && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="px-3 py-2 border-b border-gray-100"
                    contentContainerStyle={{ gap: 8 }}
                >
                    {attachments.map((attachment, index) => (
                        <View 
                            key={`${attachment.uri}-${index}`}
                            className="relative"
                        >
                            {attachment.type === 'image' ? (
                                // Image thumbnail
                                <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                                    <Image 
                                        source={{ uri: attachment.uri }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>
                            ) : attachment.type === 'audio' ? (
                                // Audio preview with playback
                                <Pressable 
                                    onPress={() => handlePlayAudio(attachment.uri)}
                                    className="w-32 h-16 rounded-xl bg-red-50 border border-red-200 flex-row items-center px-2"
                                >
                                    <View className="w-8 h-8 rounded-full bg-red-500 items-center justify-center">
                                        <MaterialCommunityIcons 
                                            name={playingAudioUri === attachment.uri && audioPlayer.playing ? 'pause' : 'play'} 
                                            size={16} 
                                            color="white" 
                                        />
                                    </View>
                                    <View className="ml-2 flex-1">
                                        <Text className="text-xs text-red-600 font-medium" numberOfLines={1}>
                                            Voice Note
                                        </Text>
                                        <Text className="text-[10px] text-red-400">
                                            {formatFileSize(attachment.size)}
                                        </Text>
                                    </View>
                                </Pressable>
                            ) : (
                                // File preview
                                <View className="w-32 h-16 rounded-xl bg-amber-50 border border-amber-200 flex-row items-center px-2">
                                    <View className="w-8 h-8 rounded-lg bg-amber-100 items-center justify-center">
                                        <MaterialCommunityIcons name="file-document" size={18} color="#F59E0B" />
                                    </View>
                                    <View className="ml-2 flex-1">
                                        <Text className="text-xs text-amber-700 font-medium" numberOfLines={1}>
                                            {attachment.name}
                                        </Text>
                                        <Text className="text-[10px] text-amber-500">
                                            {formatFileSize(attachment.size)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            
                            {/* Remove button */}
                            <TouchableOpacity
                                onPress={() => removeAttachment(index)}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-800 items-center justify-center"
                            >
                                <MaterialCommunityIcons name="close" size={12} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Recording UI or Normal Input */}
            {isRecording ? (
                // Voice Recording Interface
                <View className="flex-row items-center px-3 py-2">
                    <View className="flex-1 bg-red-50 rounded-3xl border border-red-200 flex-row items-center px-3 py-2">
                        {/* Cancel Button */}
                        <TouchableOpacity
                            onPress={cancelRecording}
                            className="w-10 h-10 rounded-full bg-red-100 items-center justify-center"
                        >
                            <MaterialCommunityIcons name="close" size={22} color="#EF4444" />
                        </TouchableOpacity>

                        {/* Voice Wave Animation */}
                        <View className="flex-1 flex-row items-center justify-center px-4">
                            <View className="flex-row items-center">
                                {waveAnims.map((anim, index) => (
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
                                {formatDuration(recordingDuration)}
                            </Text>
                        </View>

                        {/* Accept Button */}
                        <TouchableOpacity
                            onPress={acceptRecording}
                            className="w-10 h-10 rounded-full bg-green-500 items-center justify-center"
                        >
                            <MaterialCommunityIcons name="check" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                // Normal Input Interface
                <View className="flex-row items-end px-3 py-2 gap-2">
                    {/* Action Buttons */}
                    <View className="flex-row items-center gap-1 pb-1">
                        {/* Camera */}
                        <TouchableOpacity
                            onPress={handleCamera}
                            disabled={disabled || isProcessing}
                            className="w-9 h-9 rounded-full items-center justify-center"
                            style={{ backgroundColor: '#ECFDF5' }}
                        >
                            <MaterialCommunityIcons name="camera" size={20} color="#10B981" />
                        </TouchableOpacity>
                        
                        {/* Gallery */}
                        <TouchableOpacity
                            onPress={handleGallery}
                            disabled={disabled || isProcessing}
                            className="w-9 h-9 rounded-full items-center justify-center"
                            style={{ backgroundColor: '#F3E8FF' }}
                        >
                            <MaterialCommunityIcons name="image" size={20} color="#8B5CF6" />
                        </TouchableOpacity>
                        
                        {/* File */}
                        <TouchableOpacity
                            onPress={handleFilePicker}
                            disabled={disabled || isProcessing}
                            className="w-9 h-9 rounded-full items-center justify-center"
                            style={{ backgroundColor: '#FEF3C7' }}
                        >
                            <MaterialCommunityIcons name="file-document" size={20} color="#F59E0B" />
                        </TouchableOpacity>
                    </View>

                    {/* Text Input */}
                    <View className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2 min-h-[40px] max-h-[120px]">
                        <TextInput
                            value={message}
                            onChangeText={setMessage}
                            placeholder={placeholder}
                            placeholderTextColor="#9CA3AF"
                            multiline
                            className="text-base text-gray-800"
                            style={{ maxHeight: 100 }}
                            editable={!disabled && !isProcessing}
                        />
                    </View>

                    {/* Mic / Send Button */}
                    <View className="pb-1">
                        {canSend ? (
                            <TouchableOpacity
                                onPress={handleSend}
                                className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center"
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <MaterialCommunityIcons name="send" size={20} color="white" />
                                )}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={startRecording}
                                disabled={disabled}
                                className="w-10 h-10 rounded-full items-center justify-center"
                                style={{ backgroundColor: '#FEE2E2' }}
                            >
                                <MaterialCommunityIcons name="microphone" size={22} color="#EF4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

// ============================================================================
// Test / Demo Component
// ============================================================================

/**
 * Demo wrapper to test the ChatInput component
 * Shows how to use the component and logs all attachment data
 */
export function ChatInputDemo() {
    const handleSend = (message: string, attachments: Attachment[]) => {
        console.log('\n🚀 ========== DEMO: Message Received ==========');
        console.log(`📝 Message: "${message}"`);
        console.log(`📎 Attachments Count: ${attachments.length}`);
        
        attachments.forEach((att, i) => {
            console.log(`\n--- Attachment ${i + 1} ---`);
            console.log(`  URI: ${att.uri}`);
            console.log(`  Type: ${att.type}`);
            console.log(`  Name: ${att.name}`);
            console.log(`  MIME Type: ${att.mimeType}`);
            console.log(`  Size: ${formatFileSize(att.size)} (${att.size} bytes)`);
            
            // Verify the file is accessible
            FileSystem.getInfoAsync(att.uri).then(info => {
                console.log(`  ✅ File exists: ${info.exists}`);
                if (info.exists && 'size' in info) {
                    console.log(`  ✅ Verified size: ${info.size} bytes`);
                }
            }).catch(err => {
                console.log(`  ❌ File access error: ${err.message}`);
            });
        });
        
        console.log('================================================\n');
        
        Alert.alert(
            'Message Sent!',
            `Message: "${message || '(no text)'}"\nAttachments: ${attachments.length}`,
            [{ text: 'OK' }]
        );
    };
    
    return (
        <View className="flex-1 bg-gray-100">
            <View className="flex-1 items-center justify-center p-4">
                <Text className="text-lg font-semibold text-gray-700 mb-2">
                    ChatInput Demo
                </Text>
                <Text className="text-sm text-gray-500 text-center">
                    Test the input below. Check console for attachment URIs and file info.
                </Text>
            </View>
            <ChatInput onSend={handleSend} />
        </View>
    );
}

export default ChatInput;
