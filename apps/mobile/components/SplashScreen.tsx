import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    withRepeat,
    Easing,
} from 'react-native-reanimated';
import { Container } from './layout/Container';

interface SplashScreenProps {
    onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
    const [showTagline, setShowTagline] = useState(false);
    
    // Animations
    const logoScale = useSharedValue(0);
    const logoRotation = useSharedValue(0);
    const taglineOpacity = useSharedValue(0);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        // Logo entrance animation
        logoScale.value = withSpring(1, {
            damping: 10,
            stiffness: 100,
        });

        // Subtle rotation
        logoRotation.value = withSequence(
            withTiming(-5, { duration: 300 }),
            withTiming(5, { duration: 300 }),
            withTiming(0, { duration: 300 })
        );

        // Pulse effect
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Show tagline after logo animation
        setTimeout(() => {
            setShowTagline(true);
            taglineOpacity.value = withTiming(1, { duration: 600 });
        }, 600);

        // Finish splash after animations
        setTimeout(() => {
            onFinish();
        }, 2500);
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: logoScale.value },
            { rotate: `${logoRotation.value}deg` },
        ],
    }));

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const taglineAnimatedStyle = useAnimatedStyle(() => ({
        opacity: taglineOpacity.value,
    }));

    return (
        <Container safeArea={false}>
            <View className="flex-1 justify-center items-center bg-gradient-to-br from-blue-600 to-purple-600">
                {/* Background Gradient Effect */}
                <View className="absolute inset-0 bg-blue-600" />
                
                {/* Pulsing Circle Background */}
                <Animated.View 
                    style={[pulseAnimatedStyle]}
                    className="absolute w-64 h-64 rounded-full bg-blue-400 opacity-20"
                />

                {/* Logo Container */}
                <Animated.View 
                    style={[logoAnimatedStyle]}
                    className="items-center"
                >
                    {/* Logo Circle */}
                    <View className="w-32 h-32 rounded-full bg-white items-center justify-center mb-6 shadow-2xl">
                        <Text className="text-7xl"></Text>
                    </View>

                    {/* App Name */}
                    <Text className="text-5xl font-bold text-white mb-2">
                        Kaiz1
                    </Text>
                </Animated.View>

                {/* Tagline */}
                {showTagline && (
                    <Animated.View style={[taglineAnimatedStyle]}>
                        <Text className="text-xl text-white opacity-90 font-medium">
                            Your Life, Engineered
                        </Text>
                    </Animated.View>
                )}

                {/* Loading Indicator */}
                <View className="absolute bottom-20">
                    <View className="flex-row gap-2">
                        <LoadingDot delay={0} />
                        <LoadingDot delay={200} />
                        <LoadingDot delay={400} />
                    </View>
                </View>
            </View>
        </Container>
    );
}

function LoadingDot({ delay }: { delay: number }) {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        setTimeout(() => {
            opacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 600 }),
                    withTiming(0.3, { duration: 600 })
                ),
                -1,
                true
            );
        }, delay);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[animatedStyle]}
            className="w-2 h-2 rounded-full bg-white"
        />
    );
}
