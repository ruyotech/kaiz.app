import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../components/layout/Container';
import { Card } from '../../../components/ui/Card';
import { useEssentiaStore } from '../../../store/essentiaStore';

export default function EssentiaGrowthScreen() {
    const { userStats, streak, badges, getFlashcardsDueToday } = useEssentiaStore();
    
    const flashcardsDue = getFlashcardsDueToday();
    const levelProgress = userStats ? ((userStats.totalXP % 1000) / 1000) * 100 : 0;

    return (
        <Container>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4 pb-2">
                    <Text className="text-3xl font-bold text-gray-900 mb-6">Growth</Text>
                </View>

                {/* Level Progress */}
                <View className="mx-4 mb-4">
                    <Card className="p-6">
                        <View className="items-center">
                            <View className="w-32 h-32 rounded-full border-8 border-blue-200 items-center justify-center mb-4">
                                <Text className="text-3xl font-bold text-blue-600">{userStats?.level || 1}</Text>
                                <Text className="text-sm text-gray-600">{userStats?.levelName}</Text>
                            </View>
                            <Text className="text-lg font-semibold text-gray-900 mb-2">
                                {userStats?.totalXP || 0} / {userStats?.nextLevelXP || 1000} XP
                            </Text>
                            <View className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <View className="h-full bg-blue-600 rounded-full" style={{ width: `${levelProgress}%` }} />
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Stats Overview */}
                <View className="mx-4 mb-4">
                    <Text className="text-xl font-bold text-gray-900 mb-3">Your Stats</Text>
                    <View className="flex-row gap-3">
                        <Card className="flex-1 p-4 items-center">
                            <MaterialCommunityIcons name="book-check" size={32} color="#3B82F6" />
                            <Text className="text-2xl font-bold text-gray-900 mt-2">{userStats?.booksCompleted || 0}</Text>
                            <Text className="text-sm text-gray-600">Books</Text>
                        </Card>
                        <Card className="flex-1 p-4 items-center">
                            <MaterialCommunityIcons name="clock-outline" size={32} color="#8B5CF6" />
                            <Text className="text-2xl font-bold text-gray-900 mt-2">{userStats?.totalMinutesRead || 0}</Text>
                            <Text className="text-sm text-gray-600">Minutes</Text>
                        </Card>
                    </View>
                </View>

                {/* Streak Calendar */}
                {streak && (
                    <View className="mx-4 mb-4">
                        <Text className="text-xl font-bold text-gray-900 mb-3">Streak Calendar</Text>
                        <Card className="p-4">
                            <View className="flex-row items-center justify-between mb-4">
                                <View>
                                    <Text className="text-3xl font-bold text-orange-600">🔥 {streak.currentStreak}</Text>
                                    <Text className="text-sm text-gray-600">Current Streak</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-2xl font-bold text-gray-900">{streak.longestStreak}</Text>
                                    <Text className="text-sm text-gray-600">Best Streak</Text>
                                </View>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {streak.streakHistory.slice(-30).map((day, index) => (
                                    <View
                                        key={index}
                                        className={`w-8 h-8 rounded items-center justify-center ${
                                            day.booksCompleted > 0 ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                    >
                                        <Text className="text-xs text-white font-bold">{day.booksCompleted}</Text>
                                    </View>
                                ))}
                            </View>
                        </Card>
                    </View>
                )}

                {/* Flashcard Review */}
                <View className="mx-4 mb-4">
                    <Text className="text-xl font-bold text-gray-900 mb-3">Brain Bank</Text>
                    <Card className="p-4">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-2xl font-bold text-gray-900">{flashcardsDue.length}</Text>
                                <Text className="text-sm text-gray-600">Cards due today</Text>
                            </View>
                            <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg">
                                <Text className="text-white font-semibold">Review Now</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="mt-4 pt-4 border-t border-gray-200">
                            <View className="flex-row justify-between">
                                <Text className="text-sm text-gray-600">Total Flashcards</Text>
                                <Text className="text-sm font-semibold text-gray-900">
                                    {userStats?.highlightsCreated || 0}
                                </Text>
                            </View>
                            <View className="flex-row justify-between mt-2">
                                <Text className="text-sm text-gray-600">Cards Reviewed</Text>
                                <Text className="text-sm font-semibold text-gray-900">
                                    {userStats?.flashcardsReviewed || 0}
                                </Text>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Badges */}
                <View className="mx-4 mb-6">
                    <Text className="text-xl font-bold text-gray-900 mb-3">Achievements</Text>
                    <Card className="p-4">
                        {badges.length === 0 ? (
                            <View className="items-center py-6">
                                <MaterialCommunityIcons name="trophy-outline" size={48} color="#D1D5DB" />
                                <Text className="text-gray-500 mt-2">No badges yet</Text>
                                <Text className="text-sm text-gray-400 text-center mt-1">
                                    Complete books and maintain streaks to unlock badges
                                </Text>
                            </View>
                        ) : (
                            <View className="flex-row flex-wrap gap-3">
                                {badges.map(badge => (
                                    <View key={badge.type} className="w-20 items-center">
                                        <View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center mb-2">
                                            <MaterialCommunityIcons name="trophy" size={32} color="#F59E0B" />
                                        </View>
                                        <Text className="text-xs text-gray-900 text-center" numberOfLines={2}>
                                            {badge.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Card>
                </View>
            </ScrollView>
        </Container>
    );
}
