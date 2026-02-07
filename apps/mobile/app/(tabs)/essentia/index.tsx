import { logger } from '../../../utils/logger';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../components/layout/Container';
import { Card } from '../../../components/ui/Card';
import { useEssentiaStore } from '../../../store/essentiaStore';
import { EssentiaBook } from '../../../types/models';
import { essentiaApi } from '../../../services/api';
import { toLocaleDateStringLocalized } from '../../../utils/localizedDate';
import { useTranslation } from '../../../hooks/useTranslation';

const { width } = Dimensions.get('window');

export default function EssentiaTodayScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const {
        allBooks,
        setAllBooks,
        streak,
        userStats,
        getDailyPick,
        getInProgressBooks,
        getTodayMinutesRead,
    } = useEssentiaStore();

    const [loading, setLoading] = useState(true);
    const [dailyPick, setDailyPick] = useState<EssentiaBook | undefined>();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const booksData = await essentiaApi.getAllBooks();
            
            // Map API response to mobile types
            const mappedBooks: EssentiaBook[] = booksData.map((book: any) => ({
                id: book.id,
                title: book.title,
                author: book.author,
                lifeWheelAreaId: book.lifeWheelAreaId,
                category: book.category,
                duration: book.duration,
                cardCount: book.cardCount,
                difficulty: book.difficulty?.toLowerCase() as EssentiaBook['difficulty'],
                tags: book.tags || [],
                description: book.description,
                keyTakeaways: book.keyTakeaways || [],
                publicationYear: book.publicationYear,
                rating: Number(book.rating),
                completionCount: book.completionCount,
                createdAt: book.createdAt,
                updatedAt: book.updatedAt,
                cards: (book.cards || []).map((card: any) => ({
                    id: card.id,
                    type: card.type?.toLowerCase(),
                    order: card.order,
                    title: card.title,
                    text: card.text,
                    imageUrl: card.imageUrl,
                })),
            }));
            
            setAllBooks(mappedBooks);
            
            // Initialize user stats if needed
            if (!userStats) {
                useEssentiaStore.setState({
                    userStats: {
                        userId: 'current_user',
                        totalXP: 0,
                        level: 1,
                        levelName: 'Beginner',
                        nextLevelXP: 1000,
                        booksCompleted: 0,
                        totalMinutesRead: 0,
                        highlightsCreated: 0,
                        flashcardsReviewed: 0,
                        badges: [],
                        dailyGoalMinutes: 15,
                        joinedAt: new Date().toISOString(),
                        lastActiveAt: new Date().toISOString(),
                    },
                });
            }
            
            // Get daily pick
            const pick = getDailyPick();
            setDailyPick(pick);
        } catch (error) {
            logger.error('Failed to load Essentia data:', error);
            Alert.alert('Error', 'Failed to load books. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inProgressBooks = getInProgressBooks();
    const todayMinutes = getTodayMinutesRead();
    const dailyGoalMinutes = userStats?.dailyGoalMinutes || 15;
    const goalProgress = Math.min((todayMinutes / dailyGoalMinutes) * 100, 100);

    const greetingTime = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('essentia.goodMorning');
        if (hour < 18) return t('essentia.goodAfternoon');
        return t('essentia.goodEvening');
    };

    if (loading) {
        return (
            <Container>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">{t('common.loading')}</Text>
                </View>
            </Container>
        );
    }

    return (
        <Container>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="p-4 pb-2">
                    <Text className="text-3xl font-bold text-gray-900">
                        {greetingTime()}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                        {toLocaleDateStringLocalized(new Date(), { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </Text>
                </View>

                {/* Streak Widget */}
                {streak && (
                    <View className="mx-4 mb-4">
                        <Card className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <View className="flex-row items-center">
                                        <Text className="text-5xl mr-2">🔥</Text>
                                        <View>
                                            <Text className="text-3xl font-bold text-white">
                                                {streak.currentStreak}
                                            </Text>
                                            <Text className="text-sm text-white/80">
                                                {t('essentia.dayStreak')}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-white/90 mt-2">
                                        {t('essentia.keepItGoing')}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-xs text-white/70">{t('essentia.best')}</Text>
                                    <Text className="text-2xl font-bold text-white">
                                        {streak.longestStreak}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </View>
                )}

                {/* Daily Goal Progress */}
                <View className="mx-4 mb-4">
                    <Card className="p-4">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-lg font-semibold text-gray-900">
                                {t('essentia.todaysGoal')}
                            </Text>
                            <Text className="text-sm text-gray-500">
                                {todayMinutes}/{dailyGoalMinutes} {t('essentia.min')}
                            </Text>
                        </View>
                        
                        {/* Progress Bar */}
                        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <View 
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${goalProgress}%` }}
                            />
                        </View>
                        
                        {goalProgress >= 100 ? (
                            <Text className="text-sm text-green-600 font-medium mt-2">
                                {t('essentia.goalCompleted')}
                            </Text>
                        ) : (
                            <Text className="text-sm text-gray-600 mt-2">
                                {t('essentia.minutesToGo', { minutes: dailyGoalMinutes - todayMinutes })}
                            </Text>
                        )}
                    </Card>
                </View>

                {/* Daily Pick */}
                {dailyPick && (
                    <View className="mx-4 mb-4">
                        <Text className="text-xl font-bold text-gray-900 mb-3">
                            {t('essentia.todaysPick')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push(`/essentia/book-detail/${dailyPick.id}` as any)}
                            activeOpacity={0.9}
                        >
                            <Card className="p-0 overflow-hidden">
                                {/* Cover Image Placeholder */}
                                <View 
                                    className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 items-center justify-center"
                                    style={{ backgroundColor: '#8B5CF6' }}
                                >
                                    <MaterialCommunityIcons 
                                        name="book-open-page-variant" 
                                        size={64} 
                                        color="white" 
                                    />
                                </View>
                                
                                <View className="p-4">
                                    <Text className="text-2xl font-bold text-gray-900 mb-1">
                                        {dailyPick.title}
                                    </Text>
                                    <Text className="text-gray-600 mb-3">
                                        {t('essentia.by')} {dailyPick.author}
                                    </Text>
                                    
                                    <View className="flex-row items-center mb-3">
                                        <View className="flex-row items-center mr-4">
                                            <MaterialCommunityIcons 
                                                name="clock-outline" 
                                                size={16} 
                                                color="#6B7280" 
                                            />
                                            <Text className="text-sm text-gray-600 ml-1">
                                                {dailyPick.duration} {t('essentia.min')}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons 
                                                name="cards-outline" 
                                                size={16} 
                                                color="#6B7280" 
                                            />
                                            <Text className="text-sm text-gray-600 ml-1">
                                                {dailyPick.cardCount} {t('essentia.cards')}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <Text className="text-gray-700 mb-4">
                                        {dailyPick.description}
                                    </Text>
                                    
                                    <TouchableOpacity 
                                        className="bg-blue-600 rounded-lg py-3 items-center"
                                        onPress={() => router.push(`/essentia/reader/${dailyPick.id}` as any)}
                                    >
                                        <Text className="text-white font-semibold">
                                            {t('essentia.startReading')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Continue Reading */}
                {inProgressBooks.length > 0 && (
                    <View className="mx-4 mb-4">
                        <Text className="text-xl font-bold text-gray-900 mb-3">
                            {t('essentia.continueReading')}
                        </Text>
                        {inProgressBooks.slice(0, 3).map((progress) => {
                            const book = allBooks.find(b => b.id === progress.bookId);
                            if (!book) return null;
                            
                            return (
                                <TouchableOpacity
                                    key={progress.bookId}
                                    onPress={() => router.push(`/essentia/reader/${book.id}` as any)}
                                    className="mb-3"
                                >
                                    <Card className="p-4">
                                        <View className="flex-row items-center">
                                            <View 
                                                className="w-12 h-16 bg-purple-200 rounded items-center justify-center mr-3"
                                            >
                                                <MaterialCommunityIcons 
                                                    name="book-open-page-variant" 
                                                    size={24} 
                                                    color="#8B5CF6" 
                                                />
                                            </View>
                                            
                                            <View className="flex-1">
                                                <Text className="text-base font-semibold text-gray-900 mb-1">
                                                    {book.title}
                                                </Text>
                                                <Text className="text-sm text-gray-600 mb-2">
                                                    {book.author}
                                                </Text>
                                                
                                                {/* Progress Bar */}
                                                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <View 
                                                        className="h-full bg-blue-600 rounded-full"
                                                        style={{ width: `${progress.percentComplete}%` }}
                                                    />
                                                </View>
                                                <Text className="text-xs text-gray-500 mt-1">
                                                    {progress.percentComplete}% {t('essentia.complete')}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Quick Actions */}
                <View className="mx-4 mb-6">
                    <Text className="text-xl font-bold text-gray-900 mb-3">
                        {t('essentia.quickActions')}
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/essentia/explore' as any)}
                            className="flex-1 min-w-[45%]"
                        >
                            <Card className="p-4 items-center">
                                <MaterialCommunityIcons 
                                    name="compass-outline" 
                                    size={32} 
                                    color="#3B82F6" 
                                />
                                <Text className="text-sm font-medium text-gray-900 mt-2">
                                    {t('essentia.exploreTitle')}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => router.push('/essentia/library' as any)}
                            className="flex-1 min-w-[45%]"
                        >
                            <Card className="p-4 items-center">
                                <MaterialCommunityIcons 
                                    name="bookshelf" 
                                    size={32} 
                                    color="#8B5CF6" 
                                />
                                <Text className="text-sm font-medium text-gray-900 mt-2">
                                    {t('essentia.libraryTitle')}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => router.push('/essentia/growth' as any)}
                            className="flex-1 min-w-[45%]"
                        >
                            <Card className="p-4 items-center">
                                <MaterialCommunityIcons 
                                    name="chart-line" 
                                    size={32} 
                                    color="#10B981" 
                                />
                                <Text className="text-sm font-medium text-gray-900 mt-2">
                                    {t('essentia.growthTitle')}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </Container>
    );
}
