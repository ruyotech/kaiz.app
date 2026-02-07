import { logger } from '../../utils/logger';
/**
 * AttachmentPreviewModal.tsx - Full-screen Attachment Preview
 * 
 * Modern 2026 design for viewing:
 * - Images with zoom/pan
 * - Audio with playback controls
 * - PDF/Document info with download option
 * 
 * Features:
 * - Gesture-based navigation
 * - Dark overlay for immersive viewing
 * - Share and download options
 * - Accessible controls
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Image,
    Dimensions,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    ScrollView,
    Platform,
    Linking,
    Alert,
    Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import {
    GestureDetector,
    Gesture,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useAudioPlayer } from 'expo-audio';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

export interface AttachmentData {
    id?: string;
    filename: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number | null;
}

interface AttachmentPreviewModalProps {
    visible: boolean;
    onClose: () => void;
    attachment: AttachmentData | null;
    attachments?: AttachmentData[]; // For gallery navigation
    initialIndex?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatFileSize(bytes: number | null | undefined): string {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string): string {
    if (fileType?.startsWith('image/')) return 'image';
    if (fileType?.startsWith('audio/')) return 'music-circle';
    if (fileType?.startsWith('video/')) return 'video';
    if (fileType?.includes('pdf')) return 'file-pdf-box';
    if (fileType?.includes('word') || fileType?.includes('document')) return 'file-word-box';
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return 'file-excel-box';
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return 'file-powerpoint-box';
    if (fileType?.includes('zip') || fileType?.includes('compressed')) return 'folder-zip';
    return 'file-document';
}

// ============================================================================
// Image Viewer Component with Zoom
// ============================================================================

function ImageViewer({ 
    uri, 
    onClose 
}: { 
    uri: string; 
    onClose: () => void 
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = savedScale.value * event.scale;
        })
        .onEnd(() => {
            if (scale.value < 1) {
                scale.value = withSpring(1);
                savedScale.value = 1;
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            } else if (scale.value > 4) {
                scale.value = withSpring(4);
                savedScale.value = 4;
            } else {
                savedScale.value = scale.value;
            }
        });

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + event.translationX;
                translateY.value = savedTranslateY.value + event.translationY;
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            if (scale.value > 1) {
                scale.value = withSpring(1);
                savedScale.value = 1;
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else {
                scale.value = withSpring(2.5);
                savedScale.value = 2.5;
            }
        });

    const composedGesture = Gesture.Simultaneous(
        pinchGesture,
        panGesture,
        doubleTapGesture
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    if (error) {
        return (
            <View style={styles.centerContent}>
                <MaterialCommunityIcons name="image-broken" size={64} color="#9CA3AF" />
                <Text style={styles.errorText}>Failed to load image</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                        setError(false);
                        setLoading(true);
                    }}
                >
                    <Text style={styles.retryText}>Tap to retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={composedGesture}>
                <View style={styles.imageContainer}>
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                        </View>
                    )}
                    <Animated.Image
                        source={{ uri }}
                        style={[styles.fullImage, animatedStyle]}
                        resizeMode="contain"
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setError(true);
                        }}
                    />
                </View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

// ============================================================================
// Audio Player Component
// ============================================================================

function AudioPlayer({ 
    uri, 
    filename 
}: { 
    uri: string; 
    filename: string 
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const player = useAudioPlayer(uri, { updateInterval: 500 });

    useEffect(() => {
        if (player) {
            setLoading(false);
            setDuration(player.duration || 0);
            setPosition(player.currentTime || 0);
            setIsPlaying(player.playing);
        }
    }, [player, player?.duration, player?.currentTime, player?.playing]);

    const togglePlayback = async () => {
        try {
            if (player) {
                if (player.playing) {
                    player.pause();
                } else {
                    player.play();
                }
            }
        } catch (err) {
            logger.error('Error toggling playback:', err);
            setError(true);
        }
    };

    const seekTo = async (percentage: number) => {
        if (player && duration > 0) {
            const newPosition = duration * percentage;
            player.seekTo(newPosition);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View style={styles.audioPlayerContainer}>
            {/* Audio Visualization */}
            <View style={styles.audioVisContainer}>
                <View style={styles.audioWaveform}>
                    {[...Array(20)].map((_, i) => (
                        <View 
                            key={i}
                            style={[
                                styles.waveBar,
                                { 
                                    height: 20 + Math.random() * 40,
                                    backgroundColor: isPlaying ? '#3B82F6' : '#9CA3AF',
                                }
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* File Info */}
            <View style={styles.audioInfo}>
                <MaterialCommunityIcons name="music-circle" size={48} color="#3B82F6" />
                <Text style={styles.audioFilename} numberOfLines={2}>{filename}</Text>
            </View>

            {/* Progress Bar */}
            <TouchableOpacity 
                style={styles.progressContainer}
                activeOpacity={0.8}
                onPress={(e) => {
                    const { locationX } = e.nativeEvent;
                    const percentage = locationX / (SCREEN_WIDTH - 64);
                    seekTo(Math.min(1, Math.max(0, percentage)));
                }}
            >
                <View style={styles.progressTrack}>
                    <View 
                        style={[
                            styles.progressFill, 
                            { width: `${progressPercentage}%` }
                        ]} 
                    />
                </View>
            </TouchableOpacity>

            {/* Time Display */}
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* Playback Controls */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={() => seekTo(Math.max(0, (position - 10) / duration))}
                >
                    <MaterialCommunityIcons name="rewind-10" size={32} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.playButton}
                    onPress={togglePlayback}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="large" color="#FFFFFF" />
                    ) : (
                        <MaterialCommunityIcons 
                            name={isPlaying ? "pause" : "play"} 
                            size={48} 
                            color="#FFFFFF" 
                        />
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={() => seekTo(Math.min(1, (position + 10) / duration))}
                >
                    <MaterialCommunityIcons name="fast-forward-10" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ============================================================================
// Document Preview Component
// ============================================================================

function DocumentPreview({ 
    attachment,
    onDownload,
}: { 
    attachment: AttachmentData;
    onDownload: () => void;
}) {
    const iconName = getFileIcon(attachment.fileType);

    return (
        <View style={styles.documentContainer}>
            <View style={styles.documentIconContainer}>
                <MaterialCommunityIcons 
                    name={iconName as any} 
                    size={80} 
                    color="#3B82F6" 
                />
            </View>

            <Text style={styles.documentFilename} numberOfLines={3}>
                {attachment.filename}
            </Text>

            <View style={styles.documentMeta}>
                <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="file" size={16} color="#9CA3AF" />
                    <Text style={styles.metaText}>
                        {attachment.fileType || 'Unknown type'}
                    </Text>
                </View>
                <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="harddisk" size={16} color="#9CA3AF" />
                    <Text style={styles.metaText}>
                        {formatFileSize(attachment.fileSize)}
                    </Text>
                </View>
            </View>

            <View style={styles.documentActions}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={onDownload}
                >
                    <MaterialCommunityIcons name="download" size={24} color="#FFFFFF" />
                    <Text style={styles.actionText}>Open / Download</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.documentHint}>
                Document preview not available in-app.{'\n'}
                Tap the button above to open in your default app.
            </Text>
        </View>
    );
}

// ============================================================================
// Main Modal Component
// ============================================================================

export function AttachmentPreviewModal({
    visible,
    onClose,
    attachment,
    attachments = [],
    initialIndex = 0,
}: AttachmentPreviewModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    
    // Get current attachment
    const currentAttachment = attachments.length > 0 
        ? attachments[currentIndex] 
        : attachment;

    const isImage = currentAttachment?.fileType?.startsWith('image/');
    const isAudio = currentAttachment?.fileType?.startsWith('audio/');

    // Reset index when modal opens
    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
        }
    }, [visible, initialIndex]);

    const handleShare = useCallback(async () => {
        if (!currentAttachment?.fileUrl) return;
        
        try {
            await Share.share({
                url: currentAttachment.fileUrl,
                title: currentAttachment.filename,
            });
        } catch (error) {
            logger.error('Error sharing:', error);
        }
    }, [currentAttachment]);

    const handleDownload = useCallback(async () => {
        if (!currentAttachment?.fileUrl) return;
        
        try {
            const canOpen = await Linking.canOpenURL(currentAttachment.fileUrl);
            if (canOpen) {
                await Linking.openURL(currentAttachment.fileUrl);
            } else {
                Alert.alert('Cannot Open', 'Unable to open this file.');
            }
        } catch (error) {
            logger.error('Error opening file:', error);
            Alert.alert('Error', 'Failed to open file.');
        }
    }, [currentAttachment]);

    const navigatePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    const navigateNext = useCallback(() => {
        if (currentIndex < attachments.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex, attachments.length]);

    if (!currentAttachment) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={onClose}
                        accessibilityLabel="Close preview"
                    >
                        <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {currentAttachment.filename}
                        </Text>
                        {attachments.length > 1 && (
                            <Text style={styles.headerSubtitle}>
                                {currentIndex + 1} of {attachments.length}
                            </Text>
                        )}
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={handleShare}
                            accessibilityLabel="Share"
                        >
                            <MaterialCommunityIcons name="share-variant" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={handleDownload}
                            accessibilityLabel="Download"
                        >
                            <MaterialCommunityIcons name="download" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    {isImage ? (
                        <ImageViewer 
                            uri={currentAttachment.fileUrl} 
                            onClose={onClose}
                        />
                    ) : isAudio ? (
                        <AudioPlayer 
                            uri={currentAttachment.fileUrl}
                            filename={currentAttachment.filename}
                        />
                    ) : (
                        <DocumentPreview 
                            attachment={currentAttachment}
                            onDownload={handleDownload}
                        />
                    )}
                </View>

                {/* Navigation Arrows for Gallery */}
                {attachments.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <TouchableOpacity 
                                style={[styles.navButton, styles.navButtonLeft]}
                                onPress={navigatePrev}
                                accessibilityLabel="Previous attachment"
                            >
                                <MaterialCommunityIcons name="chevron-left" size={40} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                        {currentIndex < attachments.length - 1 && (
                            <TouchableOpacity 
                                style={[styles.navButton, styles.navButtonRight]}
                                onPress={navigateNext}
                                accessibilityLabel="Next attachment"
                            >
                                <MaterialCommunityIcons name="chevron-right" size={40} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* Pagination Dots */}
                {attachments.length > 1 && (
                    <View style={styles.pagination}>
                        {attachments.map((_, index) => (
                            <View 
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    index === currentIndex && styles.paginationDotActive
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>
        </Modal>
    );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {
        flex: 1,
        marginHorizontal: 16,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    headerSubtitle: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#9CA3AF',
        fontSize: 16,
        marginTop: 16,
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    imageContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.7,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Audio Player Styles
    audioPlayerContainer: {
        width: SCREEN_WIDTH - 48,
        padding: 24,
        alignItems: 'center',
    },
    audioVisContainer: {
        width: '100%',
        height: 80,
        marginBottom: 24,
        justifyContent: 'center',
    },
    audioWaveform: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    waveBar: {
        width: 4,
        borderRadius: 2,
    },
    audioInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    audioFilename: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    progressContainer: {
        width: '100%',
        paddingVertical: 16,
    },
    progressTrack: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 2,
    },
    timeContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    timeText: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Document Preview Styles
    documentContainer: {
        width: SCREEN_WIDTH - 48,
        padding: 32,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
    },
    documentIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    documentFilename: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    documentMeta: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 32,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    documentActions: {
        width: '100%',
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    documentHint: {
        color: '#6B7280',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    // Navigation
    navButton: {
        position: 'absolute',
        top: '50%',
        marginTop: -28,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navButtonLeft: {
        left: 16,
    },
    navButtonRight: {
        right: 16,
    },
    pagination: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    paginationDotActive: {
        backgroundColor: '#FFFFFF',
        width: 24,
    },
});

export default AttachmentPreviewModal;
