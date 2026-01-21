import { View, Text, TouchableOpacity, Share, Dimensions, Image } from 'react-native';
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
    const screenHeight = Dimensions.get('window').height;

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
            if (Math.abs(e.translationY) > screenHeight / 4) {
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
            <View className="flex-1 items-center justify-center bg-gray-900">
                <MaterialCommunityIcons name="format-quote-open" size={64} color="rgba(255, 255, 255, 0.3)" />
                <Text className="text-white/90 mt-4">Loading inspiration...</Text>
            </View>
        );
    }

    // Default nature background image
    const bgImage = { uri: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=2070&auto=format&fit=crop' };

    return (
        <View className="flex-1">
            <Image
                source={bgImage}
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
            />
            {/* Dark overlay for text readability */}
            <View className="absolute inset-0 bg-black/40" />

            <GestureDetector gesture={swipeGesture}>
                <Animated.View
                    className="flex-1 flex-row"
                    style={animatedStyle}
                >
                    {/* Main Quote Card - Full width centered */}
                    <View className="flex-1 items-center justify-center px-8">
                        <MaterialCommunityIcons
                            name="format-quote-open"
                            size={48}
                            color="rgba(255, 255, 255, 0.3)"
                        />

                        <Text className="text-white text-3xl font-serif italic text-center my-8 leading-relaxed shadow-lg">
                            {dailyQuote.text}
                        </Text>

                        <Text className="text-white/90 text-xl text-center font-medium shadow-md">
                            — {dailyQuote.author}
                        </Text>

                        {/* Swipe Hint */}
                        <View className="mt-12 flex-row items-center">
                            <MaterialCommunityIcons name="gesture-swipe-vertical" size={20} color="rgba(255, 255, 255, 0.5)" />
                            <Text className="text-white/50 text-sm ml-2">Swipe up for new quote</Text>
                        </View>
                    </View>

                    {/* Action Icons - Bottom Absolute - Horizontal Centered */}
                    <View className="absolute bottom-12 w-full flex-row justify-center gap-8">
                        <TouchableOpacity
                            onPress={handleShare}
                            className="bg-black/30 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md border border-white/10"
                        >
                            <MaterialCommunityIcons name="share-variant" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleFavorite}
                            className="bg-black/30 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md border border-white/10"
                        >
                            <MaterialCommunityIcons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={24}
                                color={isFavorite ? '#EF4444' : 'white'}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={getNewQuote}
                            className="bg-black/30 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md border border-white/10"
                        >
                            <MaterialCommunityIcons name="refresh" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}
