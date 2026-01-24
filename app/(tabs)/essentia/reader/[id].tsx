import { View, Text, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEssentiaStore } from '../../../../store/essentiaStore';
import { EssentiaCard } from '../../../../types/models';

const { width, height } = Dimensions.get('window');

export default function CardReaderScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { 
        getBookById, 
        getBookProgress, 
        updateProgress, 
        completeBook, 
        autoPlayAudio,
        audioSpeed 
    } = useEssentiaStore();
    
    const book = getBookById(id!);
    const progress = getBookProgress(id!);
    
    const [currentCardIndex, setCurrentCardIndex] = useState(progress?.currentCardIndex || 0);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    
    const pan = useRef(new Animated.ValueXY()).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (book && currentCardIndex < book.cards.length) {
            const currentCard = book.cards[currentCardIndex];
            updateProgress(book.id, currentCard.id, currentCardIndex);
        }
    }, [currentCardIndex]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                pan.setValue({ x: gestureState.dx, y: 0 });
            },
            onPanResponderRelease: (_, gestureState) => {
                const swipeThreshold = width * 0.3;
                
                if (gestureState.dx > swipeThreshold) {
                    // Swipe right - previous card
                    animateCardChange('previous');
                } else if (gestureState.dx < -swipeThreshold) {
                    // Swipe left - next card
                    animateCardChange('next');
                } else {
                    // Return to center
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const animateCardChange = (direction: 'next' | 'previous') => {
        const toValue = direction === 'next' ? -width : width;
        
        Animated.parallel([
            Animated.timing(pan, {
                toValue: { x: toValue, y: 0 },
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Update card index
            if (direction === 'next' && currentCardIndex < (book?.cards.length || 0) - 1) {
                setCurrentCardIndex(currentCardIndex + 1);
            } else if (direction === 'previous' && currentCardIndex > 0) {
                setCurrentCardIndex(currentCardIndex - 1);
            }
            
            // Reset animations
            pan.setValue({ x: 0, y: 0 });
            opacity.setValue(1);
        });
    };

    const handleNext = () => {
        if (book && currentCardIndex < book.cards.length - 1) {
            animateCardChange('next');
        } else if (book && currentCardIndex === book.cards.length - 1) {
            // Book completed
            completeBook(book.id);
            router.back();
        }
    };

    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            animateCardChange('previous');
        }
    };

    const handleClose = () => {
        router.back();
    };

    if (!book) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">Book not found</Text>
            </View>
        );
    }

    const currentCard = book.cards[currentCardIndex];
    const progressPercent = ((currentCardIndex + 1) / book.cards.length) * 100;

    return (
        <View className="flex-1 bg-white">
            {/* Progress Bar */}
            <View className="absolute top-0 left-0 right-0 z-10">
                <View className="flex-row px-4 pt-12 pb-2">
                    {book.cards.map((_, index) => (
                        <View 
                            key={index} 
                            className="flex-1 h-1 mx-0.5 rounded-full overflow-hidden"
                            style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                        >
                            {index <= currentCardIndex && (
                                <View className="h-full bg-blue-600" />
                            )}
                        </View>
                    ))}
                </View>
                
                {/* Header Controls */}
                <View className="flex-row items-center justify-between px-4 pb-2">
                    <TouchableOpacity onPress={handleClose} className="p-2">
                        <MaterialCommunityIcons name="close" size={28} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-sm font-medium text-gray-600">
                        {currentCardIndex + 1} / {book.cards.length}
                    </Text>
                    <TouchableOpacity className="p-2">
                        <MaterialCommunityIcons name="bookmark-outline" size={24} color="#111827" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Card Content */}
            <Animated.View
                {...panResponder.panHandlers}
                style={{
                    transform: [{ translateX: pan.x }],
                    opacity,
                    flex: 1,
                    justifyContent: 'center',
                    paddingTop: 100,
                }}
            >
                <View className="flex-1 px-6 justify-center">
                    {/* Card Type Badge */}
                    <View className="self-start px-3 py-1 bg-purple-100 rounded-full mb-4">
                        <Text className="text-xs font-semibold text-purple-700 uppercase">
                            {currentCard.type}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                        {currentCard.title}
                    </Text>

                    {/* Visual Placeholder */}
                    {currentCard.imageUrl && (
                        <View className="w-full h-48 bg-purple-100 rounded-2xl mb-6 items-center justify-center">
                            <MaterialCommunityIcons 
                                name="image-outline" 
                                size={64} 
                                color="#A78BFA" 
                            />
                        </View>
                    )}

                    {/* Text Content */}
                    <Text className="text-lg text-gray-700 leading-relaxed mb-8">
                        {currentCard.text}
                    </Text>

                    {/* Quiz Options (if quiz card) */}
                    {currentCard.type === 'quiz' && currentCard.quizOptions && (
                        <View className="mb-8">
                            {currentCard.quizOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="bg-gray-100 rounded-xl p-4 mb-3"
                                >
                                    <Text className="text-gray-900">{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </Animated.View>

            {/* Bottom Controls */}
            <View className="px-6 pb-8">
                {/* Audio Controls (if available) */}
                {currentCard.audioUrl && (
                    <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                        <View className="flex-row items-center justify-around">
                            <TouchableOpacity className="p-2">
                                <MaterialCommunityIcons name="rewind" size={24} color="#6B7280" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={() => setIsAudioPlaying(!isAudioPlaying)}
                                className="w-14 h-14 bg-blue-600 rounded-full items-center justify-center"
                            >
                                <MaterialCommunityIcons 
                                    name={isAudioPlaying ? 'pause' : 'play'} 
                                    size={28} 
                                    color="white" 
                                />
                            </TouchableOpacity>
                            
                            <TouchableOpacity className="p-2">
                                <MaterialCommunityIcons name="fast-forward" size={24} color="#6B7280" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity className="px-3 py-2 bg-gray-200 rounded-full">
                                <Text className="text-sm font-medium text-gray-700">{audioSpeed}x</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Navigation */}
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={handlePrevious}
                        disabled={currentCardIndex === 0}
                        className="p-4"
                    >
                        <MaterialCommunityIcons 
                            name="chevron-left" 
                            size={32} 
                            color={currentCardIndex === 0 ? '#D1D5DB' : '#111827'} 
                        />
                    </TouchableOpacity>
                    
                    <Text className="text-sm text-gray-500">
                        Swipe or tap to navigate
                    </Text>
                    
                    <TouchableOpacity
                        onPress={handleNext}
                        className="p-4"
                    >
                        <MaterialCommunityIcons 
                            name="chevron-right" 
                            size={32} 
                            color="#111827" 
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
