import { View, Text, Pressable, Dimensions, Modal, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    SharedValue,
} from 'react-native-reanimated';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../components/layout/Container';
import { Button } from '../../components/ui/Button';
import { usePreferencesStore, SupportedLocale } from '../../store/preferencesStore';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WelcomeSlide {
    id: number;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    gradient: [string, string];
    feature: string;
}

const WELCOME_SLIDES: WelcomeSlide[] = [
    {
        id: 0,
        icon: '🚀',
        title: 'Welcome to Kaiz LifeOS',
        subtitle: 'Your Life, Engineered',
        description: 'Run your life like a product team. Turn "I should" into "it shipped" with the same system that ships world-class software: Agile.',
        gradient: ['#667eea', '#764ba2'],
        feature: 'intro',
    },
    {
        id: 1,
        icon: '📊',
        title: 'Life Wheel Balance',
        subtitle: 'Make Balance Visible',
        description: 'Track 8 life dimensions in real-time. See what you\'re investing in, what you\'re neglecting, and get smart recovery suggestions.',
        gradient: ['#f093fb', '#f5576c'],
        feature: 'balance',
    },
    {
        id: 2,
        icon: '⚡',
        title: 'Weekly Sprints',
        subtitle: 'Capacity + Guardrails',
        description: 'Plan within your real capacity. Track velocity, prevent overcommit, and measure what actually ships every week.',
        gradient: ['#4facfe', '#00f2fe'],
        feature: 'sprints',
    },
    {
        id: 3,
        icon: '🎯',
        title: 'Eisenhower Matrix',
        subtitle: 'Prioritize Like a Pro',
        description: 'See everything in Q1-Q4 quadrants. Kaiz watches your Q2 (growth zone) and nudges you when you\'re stuck in firefighting.',
        gradient: ['#43e97b', '#38f9d7'],
        feature: 'prioritization',
    },
    {
        id: 4,
        icon: '🤖',
        title: 'AI Scrum Master',
        subtitle: 'Your System Coach',
        description: 'Get intelligent sprint monitoring, capacity warnings, and personalized coaching. AI proposes, you decide.',
        gradient: ['#fa709a', '#fee140'],
        feature: 'ai',
    },
];

export default function WelcomeScreen() {
    const router = useRouter();
    const { locale, setLocale } = usePreferencesStore();
    const scrollViewRef = useRef<GHScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const scrollX = useSharedValue(0);

    const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === locale) || SUPPORTED_LANGUAGES[0];

    const handleScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        scrollX.value = offsetX;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    const scrollToNext = () => {
        if (currentIndex < WELCOME_SLIDES.length - 1) {
            scrollViewRef.current?.scrollTo({
                x: (currentIndex + 1) * SCREEN_WIDTH,
                animated: true,
            });
        } else {
            // Go to onboarding setup
            // @ts-ignore - Dynamic route
            router.push('/(onboarding)/setup');
        }
    };

    const scrollToIndex = (index: number) => {
        scrollViewRef.current?.scrollTo({
            x: index * SCREEN_WIDTH,
            animated: true,
        });
    };

    const handleSkip = () => {
        // @ts-ignore - Dynamic route
        router.push('/(onboarding)/setup');
    };

    const handleLanguageSelect = (langCode: SupportedLocale) => {
        setLocale(langCode);
        setShowLanguageModal(false);
    };

    return (
        <Container safeArea={false}>
            <StatusBar barStyle="light-content" />
            <View className="flex-1">
                {/* Top Bar with Language Selector and Skip */}
                <View className="absolute top-12 left-0 right-0 z-10 px-6 flex-row justify-between items-center">
                    {/* Language Selector */}
                    <Pressable
                        onPress={() => setShowLanguageModal(true)}
                        className="bg-white/20 backdrop-blur-lg rounded-full px-4 py-2 flex-row items-center gap-2"
                    >
                        <Text className="text-2xl">{currentLanguage.flag}</Text>
                        <Text className="text-white font-semibold text-sm">{currentLanguage.nativeName}</Text>
                    </Pressable>

                    {/* Skip Button */}
                    <Pressable onPress={handleSkip}>
                        <Text className="text-base font-semibold text-white">
                            Skip
                        </Text>
                    </Pressable>
                </View>

                {/* Feature Slides */}
                <GHScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    bounces={false}
                >
                    {WELCOME_SLIDES.map((slide) => (
                        <WelcomeSlide
                            key={slide.id}
                            slide={slide}
                            scrollX={scrollX}
                        />
                    ))}
                </GHScrollView>

                {/* Bottom Section */}
                <View className="absolute bottom-0 left-0 right-0 px-8 pb-12 bg-transparent">
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
                                    'clamp'
                                );

                                const opacity = interpolate(
                                    scrollX.value,
                                    inputRange,
                                    [0.3, 1, 0.3],
                                    'clamp'
                                );

                                return {
                                    width,
                                    opacity,
                                };
                            });

                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => scrollToIndex(index)}
                                >
                                    <Animated.View
                                        style={[dotStyle]}
                                        className="h-2 bg-white rounded-full mx-1"
                                    />
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Action Button */}
                    <Button onPress={scrollToNext} fullWidth size="lg">
                        {currentIndex === WELCOME_SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                    </Button>
                </View>

                {/* Language Selection Modal */}
                <Modal
                    visible={showLanguageModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowLanguageModal(false)}
                >
                    <TouchableOpacity
                        className="flex-1 bg-black/50 justify-end"
                        activeOpacity={1}
                        onPress={() => setShowLanguageModal(false)}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl"
                        >
                            <View className="p-6">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-2xl font-bold text-gray-900">Select Language</Text>
                                    <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                        <MaterialCommunityIcons name="close" size={24} color="#374151" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView className="max-h-96">
                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                        <TouchableOpacity
                                            key={lang.code}
                                            onPress={() => handleLanguageSelect(lang.code)}
                                            className={`flex-row items-center py-4 px-4 rounded-lg mb-2 ${
                                                locale === lang.code ? 'bg-blue-50' : 'bg-gray-50'
                                            }`}
                                        >
                                            <Text className="text-3xl mr-4">{lang.flag}</Text>
                                            <View className="flex-1">
                                                <Text className="text-base font-semibold text-gray-900">
                                                    {lang.nativeName}
                                                </Text>
                                                <Text className="text-sm text-gray-600">{lang.name}</Text>
                                            </View>
                                            {locale === lang.code && (
                                                <MaterialCommunityIcons name="check-circle" size={24} color="#3B82F6" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            </View>
        </Container>
    );
}

function WelcomeSlide({
    slide,
    scrollX,
}: {
    slide: WelcomeSlide;
    scrollX: SharedValue<number>;
}) {
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (slide.id - 1) * SCREEN_WIDTH,
            slide.id * SCREEN_WIDTH,
            (slide.id + 1) * SCREEN_WIDTH,
        ];

        const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], 'clamp');
        const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], 'clamp');

        return {
            transform: [{ scale }],
            opacity,
        };
    });

    return (
        <View style={{ width: SCREEN_WIDTH }} className="flex-1">
            <LinearGradient
                colors={slide.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1"
            >
                <Animated.View
                    style={[animatedStyle]}
                    className="flex-1 justify-center items-center px-8 pt-28 pb-32"
                >
                    {/* Icon */}
                    <View className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-lg items-center justify-center mb-10">
                        <Text className="text-8xl">{slide.icon}</Text>
                    </View>

                    {/* Title */}
                    <Text className="text-4xl font-bold text-center mb-3 text-white">
                        {slide.title}
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-xl font-semibold text-center mb-6 text-white/90">
                        {slide.subtitle}
                    </Text>

                    {/* Description */}
                    <Text className="text-base text-center text-white/80 leading-7 px-4">
                        {slide.description}
                    </Text>
                </Animated.View>
            </LinearGradient>
        </View>
    );
}
