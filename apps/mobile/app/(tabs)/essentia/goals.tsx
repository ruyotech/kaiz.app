import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../components/layout/Container';
import { Card } from '../../../components/ui/Card';
import { useEssentiaStore } from '../../../store/essentiaStore';

export default function EssentiaGoalsScreen() {
    const router = useRouter();
    const { userStats, streak, setDailyGoal, getTodayMinutesRead } = useEssentiaStore();
    
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [newGoal, setNewGoal] = useState('');

    const todayMinutes = getTodayMinutesRead();
    const dailyGoal = userStats?.dailyGoalMinutes || 15;
    const progressPercent = Math.min((todayMinutes / dailyGoal) * 100, 100);
    const isGoalMet = todayMinutes >= dailyGoal;

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Generate week progress from streak history
    const weekProgress = weekDays.map((day, index) => {
        const streakDay = streak?.streakHistory?.slice(-7)[index];
        return {
            day,
            completed: streakDay?.booksCompleted ? streakDay.booksCompleted > 0 : false,
            minutes: streakDay?.minutesRead || 0,
        };
    });

    const handleSaveGoal = () => {
        const goalMinutes = parseInt(newGoal);
        if (goalMinutes > 0 && goalMinutes <= 480) {
            setDailyGoal(goalMinutes);
            setShowGoalModal(false);
            setNewGoal('');
        }
    };

    const goalSuggestions = [
        { minutes: 10, label: '10 min', description: 'Quick learner' },
        { minutes: 15, label: '15 min', description: 'Consistent' },
        { minutes: 30, label: '30 min', description: 'Dedicated' },
        { minutes: 60, label: '1 hour', description: 'Power reader' },
    ];

    return (
        <Container>
            <View className="flex-1">
                {/* Header */}
                <View className="p-4 pb-2">
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900">Reading Goals</Text>
                        <TouchableOpacity 
                            onPress={() => setShowGoalModal(true)}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <MaterialCommunityIcons name="cog-outline" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    {/* Today's Progress */}
                    <Card className="p-6 mb-4">
                        <View className="items-center">
                            <Text className="text-sm text-gray-600 mb-2">Today's Progress</Text>
                            
                            {/* Circular Progress */}
                            <View className="w-40 h-40 items-center justify-center mb-4">
                                <View 
                                    className="absolute w-40 h-40 rounded-full border-8 border-gray-200"
                                />
                                <View 
                                    className={`absolute w-40 h-40 rounded-full border-8 ${isGoalMet ? 'border-green-500' : 'border-purple-500'}`}
                                    style={{
                                        borderColor: 'transparent',
                                        borderTopColor: isGoalMet ? '#10B981' : '#8B5CF6',
                                        borderRightColor: progressPercent > 25 ? (isGoalMet ? '#10B981' : '#8B5CF6') : 'transparent',
                                        borderBottomColor: progressPercent > 50 ? (isGoalMet ? '#10B981' : '#8B5CF6') : 'transparent',
                                        borderLeftColor: progressPercent > 75 ? (isGoalMet ? '#10B981' : '#8B5CF6') : 'transparent',
                                        transform: [{ rotate: '-45deg' }],
                                    }}
                                />
                                <View className="items-center">
                                    {isGoalMet ? (
                                        <MaterialCommunityIcons name="check-circle" size={40} color="#10B981" />
                                    ) : (
                                        <Text className="text-4xl font-bold text-gray-900">{todayMinutes}</Text>
                                    )}
                                    <Text className="text-sm text-gray-600">
                                        {isGoalMet ? 'Goal achieved!' : `/ ${dailyGoal} min`}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-lg font-semibold text-gray-900">
                                {isGoalMet 
                                    ? 'Amazing work today!' 
                                    : `${dailyGoal - todayMinutes} minutes to go`}
                            </Text>
                        </View>
                    </Card>

                    {/* Week Overview */}
                    <Card className="p-4 mb-4">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">This Week</Text>
                        <View className="flex-row justify-between">
                            {weekProgress.map((day, index) => (
                                <View key={index} className="items-center">
                                    <View 
                                        className={`w-10 h-10 rounded-full items-center justify-center mb-2 ${
                                            day.completed ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                    >
                                        {day.completed ? (
                                            <MaterialCommunityIcons name="check" size={20} color="white" />
                                        ) : (
                                            <Text className="text-xs text-gray-500">{day.minutes || '-'}</Text>
                                        )}
                                    </View>
                                    <Text className="text-xs text-gray-600 font-medium">{day.day}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>

                    {/* Streak Info */}
                    <Card className="p-4 mb-4">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-14 h-14 bg-orange-100 rounded-2xl items-center justify-center mr-4">
                                    <Text className="text-2xl"></Text>
                                </View>
                                <View>
                                    <Text className="text-3xl font-bold text-gray-900">
                                        {streak?.currentStreak || 0}
                                    </Text>
                                    <Text className="text-sm text-gray-600">Day streak</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-lg font-semibold text-gray-900">
                                    {streak?.longestStreak || 0}
                                </Text>
                                <Text className="text-xs text-gray-500">Best streak</Text>
                            </View>
                        </View>
                    </Card>

                    {/* Reading Stats */}
                    <Text className="text-lg font-semibold text-gray-900 mb-3">All Time Stats</Text>
                    <View className="flex-row gap-3 mb-4">
                        <Card className="flex-1 p-4 items-center">
                            <MaterialCommunityIcons name="clock-outline" size={28} color="#8B5CF6" />
                            <Text className="text-2xl font-bold text-gray-900 mt-2">
                                {userStats?.totalMinutesRead || 0}
                            </Text>
                            <Text className="text-xs text-gray-600">Minutes Read</Text>
                        </Card>
                        <Card className="flex-1 p-4 items-center">
                            <MaterialCommunityIcons name="book-check" size={28} color="#10B981" />
                            <Text className="text-2xl font-bold text-gray-900 mt-2">
                                {userStats?.booksCompleted || 0}
                            </Text>
                            <Text className="text-xs text-gray-600">Books Done</Text>
                        </Card>
                    </View>

                    {/* Milestones */}
                    <Card className="p-4 mb-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">Milestones</Text>
                        {[
                            { target: 100, label: 'Read 100 minutes', icon: 'timer-sand' },
                            { target: 500, label: 'Read 500 minutes', icon: 'timer' },
                            { target: 1000, label: 'Read 1000 minutes', icon: 'trophy' },
                        ].map((milestone, index) => {
                            const achieved = (userStats?.totalMinutesRead || 0) >= milestone.target;
                            const progress = Math.min(((userStats?.totalMinutesRead || 0) / milestone.target) * 100, 100);
                            
                            return (
                                <View key={index} className="flex-row items-center mb-3 last:mb-0">
                                    <View 
                                        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                                            achieved ? 'bg-green-100' : 'bg-gray-100'
                                        }`}
                                    >
                                        <MaterialCommunityIcons 
                                            name={achieved ? 'check' : milestone.icon as any} 
                                            size={20} 
                                            color={achieved ? '#10B981' : '#9CA3AF'} 
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-medium ${achieved ? 'text-green-600' : 'text-gray-900'}`}>
                                            {milestone.label}
                                        </Text>
                                        {!achieved && (
                                            <View className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                <View 
                                                    className="h-full bg-purple-500 rounded-full" 
                                                    style={{ width: `${progress}%` }} 
                                                />
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </Card>

                    <View className="h-24" />
                </ScrollView>
            </View>

            {/* Goal Setting Modal */}
            <Modal visible={showGoalModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Set Daily Goal</Text>
                            <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-600 mb-4">
                            How many minutes do you want to read each day?
                        </Text>

                        {/* Quick Select */}
                        <View className="flex-row flex-wrap gap-3 mb-6">
                            {goalSuggestions.map(suggestion => (
                                <TouchableOpacity
                                    key={suggestion.minutes}
                                    onPress={() => {
                                        setDailyGoal(suggestion.minutes);
                                        setShowGoalModal(false);
                                    }}
                                    className={`flex-1 min-w-[45%] p-4 rounded-xl border-2 ${
                                        dailyGoal === suggestion.minutes 
                                            ? 'border-purple-500 bg-purple-50' 
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <Text className="text-lg font-bold text-gray-900">{suggestion.label}</Text>
                                    <Text className="text-sm text-gray-600">{suggestion.description}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom Input */}
                        <Text className="text-sm text-gray-600 mb-2">Or set a custom goal:</Text>
                        <View className="flex-row items-center gap-3">
                            <TextInput
                                value={newGoal}
                                onChangeText={setNewGoal}
                                placeholder="Enter minutes"
                                keyboardType="number-pad"
                                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                            />
                            <TouchableOpacity
                                onPress={handleSaveGoal}
                                className="bg-purple-600 px-6 py-3 rounded-xl"
                            >
                                <Text className="text-white font-semibold">Save</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="h-8" />
                    </View>
                </View>
            </Modal>
        </Container>
    );
}
