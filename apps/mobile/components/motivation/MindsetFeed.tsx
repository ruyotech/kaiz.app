import { logger } from '../../utils/logger';
import { useEffect, useRef, useState } from 'react';
import { View, Dimensions, Share, Pressable } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import { MindsetCard } from './MindsetCard';
import { useMindsetStore } from '../../store/mindsetStore';
import { MindsetContent, MindsetTheme } from '../../types/models';

interface MindsetFeedProps {
    onLongPress?: (content: MindsetContent) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_HEIGHT * 0.25;

export function MindsetFeed({ onLongPress }: MindsetFeedProps) {
    const {
        feedContent,
        currentIndex,
        themes,
        currentTheme,
        nextContent,
        previousContent,
        updateDwellTime,
        toggleFavorite,
        isFavorite,
    } = useMindsetStore();

    const translateY = useSharedValue(0);
    const [localIndex, setLocalIndex] = useState(currentIndex);
    const dwellStartTime = useRef<number>(Date.now());
    const cardRef = useRef<View>(null);

    // Find current theme object
    const activeTheme = themes.find((t) => t.id === currentTheme) || themes[0];

    // Get current and adjacent content
    const currentContent = feedContent[localIndex];
    const nextContentItem = feedContent[localIndex + 1];

    useEffect(() => {
        setLocalIndex(currentIndex);
    }, [currentIndex]);

    // Track dwell time
    useEffect(() => {
        dwellStartTime.current = Date.now();

        return () => {
            if (currentContent) {
                const dwellTime = Date.now() - dwellStartTime.current;
                updateDwellTime(currentContent.id, dwellTime);
            }
        };
    }, [currentContent?.id]);

    const handleNext = () => {
        if (localIndex < feedContent.length - 1) {
            setLocalIndex(localIndex + 1);
            nextContent();
        } else {
            // End of feed - regenerate
            nextContent();
            setLocalIndex(0);
        }
    };

    const handlePrevious = () => {
        if (localIndex > 0) {
            setLocalIndex(localIndex - 1);
            previousContent();
        }
    };

    const handleShare = async () => {
        if (!currentContent || !cardRef.current) return;

        try {
            const uri = await captureRef(cardRef, {
                format: 'jpg',
                quality: 0.95,
                result: 'tmpfile',
            });

            await Share.share({
                url: uri,
                message: currentContent.author
                    ? `"${currentContent.body}" — ${currentContent.author}`
                    : currentContent.body,
            });
        } catch (error) {
            logger.error('Share error:', error);
        }
    };

    const handleFavorite = () => {
        if (currentContent) {
            toggleFavorite(currentContent.id);
        }
    };

    const handleLongPress = () => {
        if (currentContent && onLongPress) {
            onLongPress(currentContent);
        }
    };

    // Swipe gesture (TikTok-style vertical)
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow upward swipe for next content
            if (event.translationY < 0) {
                translateY.value = event.translationY;
            } else if (localIndex > 0) {
                // Allow downward swipe only if there's previous content
                translateY.value = event.translationY * 0.3; // Dampen the reverse scroll
            }
        })
        .onEnd((event) => {
            const velocity = event.velocityY;
            
            // Swipe up (next) - with velocity threshold or distance threshold
            if (event.translationY < -SWIPE_THRESHOLD || velocity < -800) {
                translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 250 }, (finished) => {
                    if (finished) {
                        runOnJS(handleNext)();
                        translateY.value = 0; // Reset immediately instead of spring
                    }
                });
            }
            // Swipe down (previous) - less sensitive
            else if ((event.translationY > SWIPE_THRESHOLD * 0.5 || velocity > 800) && localIndex > 0) {
                translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
                    if (finished) {
                        runOnJS(handlePrevious)();
                        translateY.value = 0; // Reset immediately instead of spring
                    }
                });
            }
            // Snap back smoothly
            else {
                translateY.value = withSpring(0, { 
                    damping: 20,
                    stiffness: 300,
                    overshootClamping: true
                });
            }
        });

    // Long press gesture for actions
    const longPressGesture = Gesture.LongPress()
        .minDuration(500)
        .onStart(() => {
            runOnJS(handleLongPress)();
        });

    const composedGesture = Gesture.Race(longPressGesture, panGesture);

    // Current card animation
    const currentCardStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            Math.abs(translateY.value),
            [0, SWIPE_THRESHOLD],
            [1, 0.95],
            Extrapolate.CLAMP
        );

        const opacity = interpolate(
            Math.abs(translateY.value),
            [0, SWIPE_THRESHOLD * 2],
            [1, 0],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { translateY: translateY.value },
                { scale },
            ],
            opacity,
        };
    });

    // Next card parallax animation (peek from bottom)
    const nextCardStyle = useAnimatedStyle(() => {
        const translateYNext = interpolate(
            translateY.value,
            [-SCREEN_HEIGHT, 0],
            [0, SCREEN_HEIGHT * 0.1],
            Extrapolate.CLAMP
        );

        const scale = interpolate(
            translateY.value,
            [-SWIPE_THRESHOLD, 0],
            [1, 0.9],
            Extrapolate.CLAMP
        );

        const opacity = interpolate(
            translateY.value,
            [-SWIPE_THRESHOLD, 0],
            [1, 0.3],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                { translateY: translateYNext },
                { scale },
            ],
            opacity,
        };
    });

    if (!currentContent || !activeTheme) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-900">
                <MaterialCommunityIcons name="lightbulb-on-outline" size={64} color="#6B7280" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            {/* Next card (underneath) */}
            {nextContentItem && (
                <Animated.View
                    style={[
                        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
                        nextCardStyle,
                    ]}
                >
                    <MindsetCard content={nextContentItem} theme={activeTheme} />
                </Animated.View>
            )}

            {/* Current card */}
            <GestureDetector gesture={composedGesture}>
                <Animated.View style={[{ flex: 1 }, currentCardStyle]} ref={cardRef} collapsable={false}>
                    <MindsetCard content={currentContent} theme={activeTheme} />
                </Animated.View>
            </GestureDetector>

            {/* Action buttons (floating) */}
            <View className="absolute bottom-20 right-6 gap-4">
                <Pressable
                    onPress={handleShare}
                    className="w-12 h-12 rounded-full items-center justify-center bg-black/30 backdrop-blur-md border border-white/20"
                >
                    <MaterialCommunityIcons name="share-variant-outline" size={24} color="white" />
                </Pressable>

                <Pressable
                    onPress={handleFavorite}
                    className="w-12 h-12 rounded-full items-center justify-center bg-black/30 backdrop-blur-md border border-white/20"
                >
                    <MaterialCommunityIcons
                        name={isFavorite(currentContent.id) ? 'heart' : 'heart-outline'}
                        size={24}
                        color={isFavorite(currentContent.id) ? '#EF4444' : 'white'}
                    />
                </Pressable>
            </View>
        </View>
    );
}
