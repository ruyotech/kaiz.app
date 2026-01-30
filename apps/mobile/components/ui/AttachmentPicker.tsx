/**
 * AttachmentPicker.tsx - Reusable Attachment Picker Component
 * 
 * Provides unified attachment picking functionality:
 * - Camera capture
 * - Gallery image picker
 * - Document/file picker
 * - Voice recording
 * 
 * Uses Expo SDK 54 APIs:
 * - expo-image-picker
 * - expo-document-picker
 * - expo-audio
 * - expo-file-system
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    Alert,
    Animated,
    ScrollView,
    Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system/next';
import { 
    useAudioRecorder, 
    RecordingPresets,
    requestRecordingPermissionsAsync,
} from 'expo-audio';

// ============================================================================
// Types
// ============================================================================

export interface CommentAttachment {
    uri: string;
    type: 'image' | 'file' | 'audio';
    name: string;
    mimeType: string;
    size: number;
}

interface AttachmentPickerProps {
    visible: boolean;
    onClose: () => void;
    onAttachmentAdded: (attachment: CommentAttachment) => void;
    maxAttachments?: number;
    currentAttachmentsCount?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getFileInfo(uri: string): Promise<{ size: number; exists: boolean }> {
    try {
        // Use the new expo-file-system/next API
        const file = new File(uri);
        const exists = file.exists;
        if (exists) {
            // For size, we use the File's size property
            const size = file.size ?? 0;
            return { exists: true, size };
        }
        return { exists: false, size: 0 };
    } catch (error) {
        console.error('❌ Error getting file info:', error);
        return { exists: false, size: 0 };
    }
}

function getFilenameFromUri(uri: string): string {
    const segments = uri.split('/');
    return segments[segments.length - 1] || 'unknown';
}

function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        heic: 'image/heic',
        m4a: 'audio/m4a',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        aac: 'audio/aac',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain',
        json: 'application/json',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Attachment Picker Component
// ============================================================================

export function AttachmentPicker({
    visible,
    onClose,
    onAttachmentAdded,
    maxAttachments = 5,
    currentAttachmentsCount = 0,
}: AttachmentPickerProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Voice wave animation refs
    const waveAnims = useRef([
        new Animated.Value(0.3),
        new Animated.Value(0.5),
        new Animated.Value(0.7),
        new Animated.Value(0.4),
        new Animated.Value(0.6),
    ]).current;

    // Audio recorder hook
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
        console.log('🎤 [Voice] Recording status:', status);
    });

    // Permissions
    const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

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
            
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            waveAnims.forEach((anim, i) => {
                anim.setValue(0.3 + i * 0.1);
            });
            
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

    const canAddMore = currentAttachmentsCount < maxAttachments;

    // Camera Handler
    const handleCamera = useCallback(async () => {
        if (!canAddMore) {
            Alert.alert('Limit Reached', `Maximum ${maxAttachments} attachments allowed.`);
            return;
        }
        
        try {
            if (!cameraPermission?.granted) {
                const result = await requestCameraPermission();
                if (!result.granted) {
                    Alert.alert('Camera Permission Required', 'Please enable camera access in Settings.');
                    return;
                }
            }
            
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
                exif: false,
            });
            
            if (result.canceled) return;
            
            const asset = result.assets[0];
            const fileInfo = await getFileInfo(asset.uri);
            const filename = getFilenameFromUri(asset.uri);
            
            const attachment: CommentAttachment = {
                uri: asset.uri,
                type: 'image',
                name: filename,
                mimeType: asset.mimeType || getMimeType(filename),
                size: fileInfo.size || asset.fileSize || 0,
            };
            
            onAttachmentAdded(attachment);
            onClose();
        } catch (error) {
            console.error('📷 [Camera] Error:', error);
            Alert.alert('Error', 'Failed to capture photo. Please try again.');
        }
    }, [cameraPermission, requestCameraPermission, canAddMore, maxAttachments, onAttachmentAdded, onClose]);

    // Gallery Handler
    const handleGallery = useCallback(async () => {
        if (!canAddMore) {
            Alert.alert('Limit Reached', `Maximum ${maxAttachments} attachments allowed.`);
            return;
        }
        
        try {
            if (!mediaLibraryPermission?.granted) {
                const result = await requestMediaLibraryPermission();
                if (!result.granted) {
                    Alert.alert('Photo Library Permission Required', 'Please enable photo library access in Settings.');
                    return;
                }
            }
            
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
                exif: false,
            });
            
            if (result.canceled) return;
            
            const asset = result.assets[0];
            const fileInfo = await getFileInfo(asset.uri);
            const filename = getFilenameFromUri(asset.uri);
            
            const attachment: CommentAttachment = {
                uri: asset.uri,
                type: 'image',
                name: filename,
                mimeType: asset.mimeType || getMimeType(filename),
                size: fileInfo.size || asset.fileSize || 0,
            };
            
            onAttachmentAdded(attachment);
            onClose();
        } catch (error) {
            console.error('🖼️ [Gallery] Error:', error);
            Alert.alert('Error', 'Failed to access photo library. Please try again.');
        }
    }, [mediaLibraryPermission, requestMediaLibraryPermission, canAddMore, maxAttachments, onAttachmentAdded, onClose]);

    // File Picker Handler
    const handleFilePicker = useCallback(async () => {
        if (!canAddMore) {
            Alert.alert('Limit Reached', `Maximum ${maxAttachments} attachments allowed.`);
            return;
        }
        
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: false,
            });
            
            if (result.canceled) return;
            
            const asset = result.assets[0];
            const fileInfo = await getFileInfo(asset.uri);
            
            if (!fileInfo.exists) {
                Alert.alert('Error', 'File not accessible.');
                return;
            }
            
            const attachment: CommentAttachment = {
                uri: asset.uri,
                type: 'file',
                name: asset.name || getFilenameFromUri(asset.uri),
                mimeType: asset.mimeType || getMimeType(asset.name || ''),
                size: fileInfo.size || asset.size || 0,
            };
            
            onAttachmentAdded(attachment);
            onClose();
        } catch (error) {
            console.error('📄 [File] Error:', error);
            Alert.alert('Error', 'Failed to pick file. Please try again.');
        }
    }, [canAddMore, maxAttachments, onAttachmentAdded, onClose]);

    // Voice Recording Handlers
    const startRecording = useCallback(async () => {
        if (!canAddMore) {
            Alert.alert('Limit Reached', `Maximum ${maxAttachments} attachments allowed.`);
            return;
        }
        
        try {
            const permissionStatus = await requestRecordingPermissionsAsync();
            
            if (!permissionStatus.granted) {
                Alert.alert('Microphone Permission Required', 'Please enable microphone access in Settings.');
                return;
            }
            
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
            
            setIsRecording(true);
            setRecordingDuration(0);
        } catch (error) {
            console.error('🎤 [Voice] Error starting recording:', error);
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    }, [audioRecorder, canAddMore, maxAttachments]);

    const stopRecording = useCallback(async (save: boolean = true) => {
        try {
            await audioRecorder.stop();
            
            if (save && audioRecorder.uri) {
                const uri = audioRecorder.uri;
                const fileInfo = await getFileInfo(uri);
                const filename = `voice_${Date.now()}.m4a`;
                
                const attachment: CommentAttachment = {
                    uri,
                    type: 'audio',
                    name: filename,
                    mimeType: 'audio/m4a',
                    size: fileInfo.size,
                };
                
                onAttachmentAdded(attachment);
                onClose();
            }
            
            setIsRecording(false);
            setRecordingDuration(0);
        } catch (error) {
            console.error('🎤 [Voice] Error stopping recording:', error);
            setIsRecording(false);
            setRecordingDuration(0);
        }
    }, [audioRecorder, onAttachmentAdded, onClose]);

    const cancelRecording = useCallback(() => {
        stopRecording(false);
    }, [stopRecording]);

    const acceptRecording = useCallback(() => {
        stopRecording(true);
    }, [stopRecording]);

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <Pressable
                className="flex-1 bg-black/50 justify-end"
                onPress={() => {
                    if (isRecording) {
                        cancelRecording();
                    }
                    onClose();
                }}
            >
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <View className="bg-white rounded-t-3xl pt-4 pb-8 px-4">
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-gray-900">Add Attachment</Text>
                            <TouchableOpacity 
                                onPress={() => {
                                    if (isRecording) {
                                        cancelRecording();
                                    }
                                    onClose();
                                }}
                            >
                                <MaterialCommunityIcons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {isRecording ? (
                            // Voice Recording Interface
                            <View className="py-6">
                                <View className="bg-red-50 rounded-2xl p-6 items-center">
                                    {/* Voice Wave Animation */}
                                    <View className="flex-row items-center justify-center mb-4">
                                        {waveAnims.map((anim, index) => (
                                            <Animated.View
                                                key={index}
                                                style={{
                                                    width: 6,
                                                    height: anim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [12, 40],
                                                    }),
                                                    backgroundColor: '#EF4444',
                                                    borderRadius: 3,
                                                    marginHorizontal: 3,
                                                }}
                                            />
                                        ))}
                                    </View>
                                    
                                    <Text className="text-red-500 font-bold text-2xl mb-4">
                                        {formatDuration(recordingDuration)}
                                    </Text>
                                    
                                    <Text className="text-gray-500 text-sm mb-6">Recording voice message...</Text>
                                    
                                    <View className="flex-row gap-4">
                                        <TouchableOpacity
                                            onPress={cancelRecording}
                                            className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center"
                                        >
                                            <MaterialCommunityIcons name="close" size={28} color="#6B7280" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={acceptRecording}
                                            className="w-16 h-16 rounded-full bg-green-500 items-center justify-center"
                                        >
                                            <MaterialCommunityIcons name="check" size={28} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            // Attachment Options Grid
                            <View className="flex-row flex-wrap gap-4">
                                {/* Camera */}
                                <TouchableOpacity
                                    onPress={handleCamera}
                                    className="flex-1 min-w-[45%] bg-green-50 rounded-2xl p-5 items-center"
                                    style={{ minWidth: '45%' }}
                                >
                                    <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center mb-3">
                                        <MaterialCommunityIcons name="camera" size={28} color="#10B981" />
                                    </View>
                                    <Text className="text-gray-800 font-semibold">Camera</Text>
                                    <Text className="text-gray-500 text-xs mt-1">Take a photo</Text>
                                </TouchableOpacity>

                                {/* Gallery */}
                                <TouchableOpacity
                                    onPress={handleGallery}
                                    className="flex-1 min-w-[45%] bg-purple-50 rounded-2xl p-5 items-center"
                                    style={{ minWidth: '45%' }}
                                >
                                    <View className="w-14 h-14 rounded-full bg-purple-100 items-center justify-center mb-3">
                                        <MaterialCommunityIcons name="image" size={28} color="#8B5CF6" />
                                    </View>
                                    <Text className="text-gray-800 font-semibold">Gallery</Text>
                                    <Text className="text-gray-500 text-xs mt-1">Choose image</Text>
                                </TouchableOpacity>

                                {/* File */}
                                <TouchableOpacity
                                    onPress={handleFilePicker}
                                    className="flex-1 min-w-[45%] bg-amber-50 rounded-2xl p-5 items-center"
                                    style={{ minWidth: '45%' }}
                                >
                                    <View className="w-14 h-14 rounded-full bg-amber-100 items-center justify-center mb-3">
                                        <MaterialCommunityIcons name="file-document" size={28} color="#F59E0B" />
                                    </View>
                                    <Text className="text-gray-800 font-semibold">File</Text>
                                    <Text className="text-gray-500 text-xs mt-1">Pick document</Text>
                                </TouchableOpacity>

                                {/* Voice */}
                                <TouchableOpacity
                                    onPress={startRecording}
                                    className="flex-1 min-w-[45%] bg-red-50 rounded-2xl p-5 items-center"
                                    style={{ minWidth: '45%' }}
                                >
                                    <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center mb-3">
                                        <MaterialCommunityIcons name="microphone" size={28} color="#EF4444" />
                                    </View>
                                    <Text className="text-gray-800 font-semibold">Voice</Text>
                                    <Text className="text-gray-500 text-xs mt-1">Record audio</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!isRecording && (
                            <Text className="text-center text-gray-400 text-xs mt-4">
                                {currentAttachmentsCount}/{maxAttachments} attachments added
                            </Text>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ============================================================================
// Attachment Preview Component
// ============================================================================

interface AttachmentPreviewProps {
    attachments: CommentAttachment[];
    onRemove: (index: number) => void;
    compact?: boolean;
}

export function AttachmentPreview({ attachments, onRemove, compact = false }: AttachmentPreviewProps) {
    if (attachments.length === 0) return null;

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
        >
            {attachments.map((attachment, index) => (
                <View key={`${attachment.uri}-${index}`} className="relative">
                    {attachment.type === 'image' ? (
                        <View className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl overflow-hidden bg-gray-100`}>
                            <Image 
                                source={{ uri: attachment.uri }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                    ) : attachment.type === 'audio' ? (
                        <View className={`${compact ? 'w-24 h-12' : 'w-32 h-16'} rounded-xl bg-red-50 border border-red-200 flex-row items-center px-2`}>
                            <View className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-red-500 items-center justify-center`}>
                                <MaterialCommunityIcons name="microphone" size={compact ? 12 : 16} color="white" />
                            </View>
                            <View className="ml-2 flex-1">
                                <Text className={`${compact ? 'text-[10px]' : 'text-xs'} text-red-600 font-medium`} numberOfLines={1}>
                                    Voice
                                </Text>
                                <Text className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-red-400`}>
                                    {formatFileSize(attachment.size)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View className={`${compact ? 'w-24 h-12' : 'w-32 h-16'} rounded-xl bg-amber-50 border border-amber-200 flex-row items-center px-2`}>
                            <View className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-amber-100 items-center justify-center`}>
                                <MaterialCommunityIcons name="file-document" size={compact ? 12 : 18} color="#F59E0B" />
                            </View>
                            <View className="ml-2 flex-1">
                                <Text className={`${compact ? 'text-[10px]' : 'text-xs'} text-amber-700 font-medium`} numberOfLines={1}>
                                    {attachment.name}
                                </Text>
                                <Text className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-amber-500`}>
                                    {formatFileSize(attachment.size)}
                                </Text>
                            </View>
                        </View>
                    )}
                    
                    {/* Remove button */}
                    <TouchableOpacity
                        onPress={() => onRemove(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-800 items-center justify-center"
                    >
                        <MaterialCommunityIcons name="close" size={12} color="white" />
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
}

export default AttachmentPicker;
