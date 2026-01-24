import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import Animated, { 
    useAnimatedScrollHandler, 
    useSharedValue, 
    useAnimatedStyle,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../components/layout/Container';
import { Button } from '../../components/ui/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WELCOME_SLIDES = [
    {
        id: 1,
        emoji: '🎯',
        title: 'Welcome to Kaiz LifeOS',
        subtitle: 'Your Life, Engineered',
        description: 'Transform your life into an agile sprint system. Balance work, health, relationships, and personal growth—all in one place.',
        color: 'bg-blue-500',
    },
    {
        id: 2,
        emoji: '📊',
        title: 'Sprint-Based Living',
        subtitle: 'Weekly Sprints, Daily Progress',
        description: 'Plan your week like a pro. Break down big goals into weekly sprints with story points, track velocity, and avoid overcommit.',
        color: 'bg-purple-500',
    },
    {
        id: 3,
        emoji: '🎭',
        title: 'Eisenhower Matrix',
        subtitle: 'Prioritize What Matters',
        description: 'Organize tasks by urgency and importance. Focus on Q2 (Important, Not Urgent) work—where your future is built.',
        color: 'bg-green-500',
    },
    {
        id: 4,
        emoji: '🤖',
        title: 'AI Scrum Master',
        subtitle: 'Your Personal Coach',
        description: 'Get smart insights, capacity warnings, and balance nudges. Your AI coach helps you stay on track without burnout.',
        color: 'bg-orange-500',
    },
    {
        id: 5,
        emoji: '⚖️',
        title: 'Life Wheel Balance',
        subtitle: 'Track All Dimensions',
        description: 'Monitor your sprint points across health, career, relationships, and more. See where you\'re thriving and where you\'re neglecting.',
        color: 'bg-pink-500',
    },
];

export default function WelcomeScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const scrollViewRef = useRef<any>(null);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleNext = () => {
        if (currentIndex < WELCOME_SLIDES.length - 1) {
            const nextIndex = currentIndex + 1;
            scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        } else {
            handleGetStarted();
        }
    };

    const handleSkip = () => {
        handleGetStarted();
    };

    const handleGetStarted = () => {
        // @ts-ignore - Dynamic route
        router.replace('/(onboarding)/setup');
    };

    const handleScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    return (
        <Container safeArea={false}>
            <View className="flex-1 pt-12">
                {/* Skip Button */}
                {currentIndex < WELCOME_SLIDES.length - 1 && (
                    <View className="absolute top-14 right-6 z-10">
                        <TouchableOpacity onPress={handleSkip} className="px-4 py-2">
                            <Text className="text-gray-600 font-semibold">Skip</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Slides */}
                <Animated.ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={scrollHandler}
                    onMomentumScrollEnd={handleScroll}
                    scrollEventThrottle={16}
                    className="flex-1"
                >
                    {WELCOME_SLIDES.map((slide) => (
                        <View key={slide.id} style={{ width: SCREEN_WIDTH }} className="flex-1 px-8 justify-center">
                            {/* Emoji */}
                            <View className="items-center mb-8">
                                <View className={`w-32 h-32 rounded-full ${slide.color} items-center justify-center`}>
                                    <Text className="text-6xl">{slide.emoji}</Text>
                                </View>
                            </View>

                            {/* Content */}
                            <View className="items-center">
                                <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
                                    {slide.title}
                                </Text>
                                <Text className="text-lg font-semibold text-blue-600 text-center mb-6">
                                    {slide.subtitle}
                                </Text>
                                <Text className="text-base text-gray-600 text-center leading-6 px-4">
                                    {slide.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </Animated.ScrollView>

                {/* Pagination Dots */}
                <View className="flex-row justify-center items-center mb-8">
                    {WELCOME_SLIDES.map((_, index) => {
                        const dotStyle = useAnimatedStyle(() => {
                            const inputRange = [
                                (index - 1) * SCREEN_WIDTH,
                                index * SCREEN_WIDTH,
                                (index + 1) * SCREEN_WIDTH,
                            ];

                            const width = interpolate(
                                scrollX.value,
                                inputRange,
                                [8, 24, 8],
                                Extrapolation.CLAMP
                            );

                            const opacity = interpolate(
                                scrollX.value,
                                inputRange,
                                [0.3, 1, 0.3],
                                Extrapolation.CLAMP
                            );

                            return {
                                width,
                                opacity,
                            };
                        });

                        return (
                            <Animated.View
                                key={index}
                                className="h-2 rounded-full bg-blue-600 mx-1"
                                style={dotStyle}
                            />
                        );
                    })}
                </View>

                {/* Bottom Button */}
                <View className="px-6 pb-8">
                    <Button onPress={handleNext} size="lg">
                        {currentIndex === WELCOME_SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                    </Button>
                </View>
            </View>
        </Container>
    );
}
