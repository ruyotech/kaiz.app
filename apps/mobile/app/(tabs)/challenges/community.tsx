import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CommunityChallenge {
    id: string;
    name: string;
    description: string;
    lifeWheelArea: string;
    participants: number;
    startDate: string;
    duration: number;
    metricType: string;
    isPopular?: boolean;
    isTrending?: boolean;
}

export default function CommunityChallengesScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'discover' | 'joined' | 'friends'>('discover');
    
    // Mock data - in real app, this would come from API
    const communityChallenges: CommunityChallenge[] = [
        {
            id: 'comm-1',
            name: '10K Steps Daily',
            description: 'Walk 10,000 steps every day for 30 days',
            lifeWheelArea: 'Health',
            participants: 1247,
            startDate: '2026-02-01',
            duration: 30,
            metricType: 'count',
            isPopular: true,
        },
        {
            id: 'comm-2',
            name: 'Meditation Streak',
            description: '21 days of daily meditation practice',
            lifeWheelArea: 'Growth',
            participants: 892,
            startDate: '2026-02-05',
            duration: 21,
            metricType: 'yesno',
            isTrending: true,
        },
        {
            id: 'comm-3',
            name: 'Reading Challenge',
            description: 'Read one book per week for 4 weeks',
            lifeWheelArea: 'Growth',
            participants: 634,
            startDate: '2026-02-10',
            duration: 28,
            metricType: 'completion',
        },
        {
            id: 'comm-4',
            name: 'No Spending Week',
            description: '7 days without non-essential purchases',
            lifeWheelArea: 'Finance',
            participants: 445,
            startDate: '2026-02-03',
            duration: 7,
            metricType: 'yesno',
            isTrending: true,
        },
    ];
    
    const getMetricIcon = (type: string) => {
        const icons: Record<string, string> = {
            count: '#',
            yesno: 'Y',
            streak: 'S',
            time: 'T',
            completion: 'C',
        };
        return icons[type] || 'M';
    };
    
    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="Community"
                subtitle="Challenge together"
                showBack
                useSafeArea={false}
            />
            
            <ScrollView className="flex-1">
                {/* Tab Navigation */}
                <View className="flex-row px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <TouchableOpacity
                        onPress={() => setActiveTab('discover')}
                        className={`flex-1 py-2 items-center rounded-lg ${
                            activeTab === 'discover' ? 'bg-blue-600' : ''
                        }`}
                    >
                        <Text className={`font-semibold ${
                            activeTab === 'discover' ? 'text-white' : 'text-gray-600'
                        }`}>
                            Discover
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => setActiveTab('joined')}
                        className={`flex-1 py-2 items-center rounded-lg mx-2 ${
                            activeTab === 'joined' ? 'bg-blue-600' : ''
                        }`}
                    >
                        <Text className={`font-semibold ${
                            activeTab === 'joined' ? 'text-white' : 'text-gray-600'
                        }`}>
                            Joined
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => setActiveTab('friends')}
                        className={`flex-1 py-2 items-center rounded-lg ${
                            activeTab === 'friends' ? 'bg-blue-600' : ''
                        }`}
                    >
                        <Text className={`font-semibold ${
                            activeTab === 'friends' ? 'text-white' : 'text-gray-600'
                        }`}>
                            Friends
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View className="p-4">
                    {activeTab === 'discover' && (
                        <>
                            {/* Featured Section */}
                            <View className="mb-6">
                                <Text className="text-xl font-bold mb-3">Trending Now</Text>
                                {communityChallenges
                                    .filter(c => c.isTrending)
                                    .map(challenge => (
                                        <Card key={challenge.id} className="mb-3">
                                            <View className="flex-row justify-between items-start mb-2">
                                                <View className="flex-1">
                                                    <View className="flex-row items-center mb-1">
                                                        <Text className="text-2xl mr-2">
                                                            {getMetricIcon(challenge.metricType)}
                                                        </Text>
                                                        <Text className="text-lg font-bold flex-1">
                                                            {challenge.name}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-gray-600 mb-2">
                                                        {challenge.description}
                                                    </Text>
                                                    <View className="flex-row items-center gap-2 mb-3">
                                                        <Badge variant="default">
                                                            {challenge.lifeWheelArea}
                                                        </Badge>
                                                        <Badge variant="info">
                                                            {challenge.duration} days
                                                        </Badge>
                                                        <View className="flex-row items-center">
                                                            <MaterialCommunityIcons 
                                                                name="account-group" 
                                                                size={16} 
                                                                color="#6b7280" 
                                                            />
                                                            <Text className="text-sm text-gray-600 ml-1">
                                                                {challenge.participants}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                            <View>
                                                <Button variant="primary" onPress={() => {}}>
                                                    Join Challenge
                                                </Button>
                                            </View>
                                        </Card>
                                    ))}
                            </View>
                            
                            {/* All Challenges */}
                            <View>
                                <Text className="text-xl font-bold mb-3">All Community Challenges</Text>
                                {communityChallenges.map(challenge => (
                                    <Card key={challenge.id} className="mb-3">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <View className="flex-1">
                                                <View className="flex-row items-center mb-1">
                                                    <Text className="text-2xl mr-2">
                                                        {getMetricIcon(challenge.metricType)}
                                                    </Text>
                                                    <Text className="text-lg font-bold flex-1">
                                                        {challenge.name}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-600 mb-2">
                                                    {challenge.description}
                                                </Text>
                                                <View className="flex-row items-center gap-2 mb-3">
                                                    <Badge variant="default">
                                                        {challenge.lifeWheelArea}
                                                    </Badge>
                                                    <Badge variant="info">
                                                        {challenge.duration} days
                                                    </Badge>
                                                    <View className="flex-row items-center">
                                                        <MaterialCommunityIcons 
                                                            name="account-group" 
                                                            size={16} 
                                                            color="#6b7280" 
                                                        />
                                                        <Text className="text-sm text-gray-600 ml-1">
                                                            {challenge.participants}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        <View>
                                            <Button variant="outline" onPress={() => {}}>
                                                View Details
                                            </Button>
                                        </View>
                                    </Card>
                                ))}
                            </View>
                        </>
                    )}
                    
                    {activeTab === 'joined' && (
                        <View className="items-center py-12">
                            <Text className="text-6xl mb-4"></Text>
                            <Text className="text-xl font-bold mb-2">No Joined Challenges</Text>
                            <Text className="text-gray-600 text-center">
                                Join a community challenge to see it here
                            </Text>
                        </View>
                    )}
                    
                    {activeTab === 'friends' && (
                        <View className="items-center py-12">
                             <MaterialCommunityIcons name="handshake-outline" size={56} color={colors.textTertiary} />
                            <Text className="text-xl font-bold mb-2">Connect with Friends</Text>
                            <Text className="text-gray-600 text-center mb-4">
                                Invite friends to challenge together
                            </Text>
                            <Button variant="primary" onPress={() => {}}>
                                Invite Friends
                            </Button>
                        </View>
                    )}
                </View>
            </ScrollView>
        </Container>
    );
}
