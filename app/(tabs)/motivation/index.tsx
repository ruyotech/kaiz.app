import { View, Text, TouchableOpacity, Share, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockApi } from '../../../services/mockApi';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

export default function MotivationScreen() {
    const [dailyQuote, setDailyQuote] = useState<any>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [bgColor, setBgColor] = useState('#3B82F6'); // Default blue, will be from settings later

    const translateY = useSharedValue(0);

    useEffect(() => {
        mockApi.getDailyQuote().then(setDailyQuote);
        // TODO: Load bg color from settings
    }, []);

    const getNewQuote = async () => {
        const quote = await mockApi.getDailyQuote();
        setDailyQuote(quote);
    };

    const handleShare = async () => {
        if (!dailyQuote) return;
        try {
            await Share.share({
                message: `"${dailyQuote.text}" — ${dailyQuote.author}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // TODO: Save to favorites in storage
    };

    // Swipe gesture to get new quote (vertical like Instagram/TikTok)
    const swipeGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateY.value = e.translationY;
        })
        .onEnd((e) => {
            const height = Dimensions.get('window').height;
            if (Math.abs(e.translationY) > height / 4) {
                // Swipe threshold met
                runOnJS(getNewQuote)();
            }
            translateY.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!dailyQuote) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: bgColor }}>
                <MaterialCommunityIcons name="format-quote-open" size={64} color="rgba(255, 255, 255, 0.3)" />
                <Text className="text-white/90 mt-4">Loading inspiration</Text>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: bgColor }}>
            <GestureDetector gesture={swipeGesture}>
                <Animated.View
                    className="flex-1"
                    style={animatedStyle}
                >
                    {/* Action Icons - Right Side (Vertical like Instagram/TikTok) */}
                    <View className="absolute right-4 top-0 bottom-0 justify-center z-10 gap-5">
                        <TouchableOpacity
                            onPress={handleShare}
                            className="bg-white/20 w-14 h-14 rounded-full items-center justify-center backdrop-blur-sm"
                        >
                            <MaterialCommunityIcons name="share-variant" size={28} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleFavorite}
                            className="bg-white/20 w-14 h-14 rounded-full items-center justify-center backdrop-blur-sm"
                        >
                            <MaterialCommunityIcons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={28}
                                color={isFavorite ? '#EF4444' : 'white'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={getNewQuote}
                            className="bg-white/20 w-14 h-14 rounded-full items-center justify-center backdrop-blur-sm"
                        >
                            <MaterialCommunityIcons name="refresh" size={28} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-white/20 w-14 h-14 rounded-full items-center justify-center backdrop-blur-sm"
                        >
                            <MaterialCommunityIcons name="dots-vertical" size={28} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Main Quote Card */}
                    <View className="flex-1 items-center justify-center pl-8 pr-24">
                        <MaterialCommunityIcons
                            name="format-quote-open"
                            size={48}
                            color="rgba(255, 255, 255, 0.3)"
                        />

                        <Text className="text-white text-3xl font-serif italic text-center my-8 leading-relaxed">
                            {dailyQuote.text}
                        </Text>

                        <Text className="text-white/90 text-xl text-center font-medium">
                            — {dailyQuote.author}
                        </Text>

                        {/* Swipe Hint */}
                        <View className="mt-12 flex-row items-center">
                            <MaterialCommunityIcons name="gesture-swipe-vertical" size={20} color="rgba(255, 255, 255, 0.5)" />
                            <Text className="text-white/50 text-sm ml-2">Swipe up for new quote</Text>
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}
