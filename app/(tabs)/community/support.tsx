import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { AccountabilityPartner, MotivationGroup, PartnerRequest } from '../../../types/models';

export default function SupportCircleScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'partners' | 'groups'>('partners');
    
    const { 
        partners,
        partnerRequests,
        motivationGroups,
        fetchPartners,
        fetchMotivationGroups,
        respondToPartnerRequest,
        joinGroup,
        leaveGroup,
        loading 
    } = useCommunityStore();

    useEffect(() => {
        fetchPartners();
        fetchMotivationGroups();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchPartners(), fetchMotivationGroups()]);
        setRefreshing(false);
    };

    const handleAcceptRequest = (request: PartnerRequest) => {
        Alert.alert(
            'Accept Partner Request',
            `Accept ${request.fromUserName} as your accountability partner?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Accept', onPress: () => respondToPartnerRequest(request.id, true) }
            ]
        );
    };

    const handleDeclineRequest = (request: PartnerRequest) => {
        Alert.alert(
            'Decline Request',
            `Decline ${request.fromUserName}'s partner request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Decline', style: 'destructive', onPress: () => respondToPartnerRequest(request.id, false) }
            ]
        );
    };

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffDays = Math.floor((now.getTime() - then.getTime()) / 86400000);
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return `${Math.floor(diffDays / 30)}mo ago`;
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-white border-b border-gray-200">
                <View className="px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()} className="mr-3">
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-xl font-bold text-gray-900">Support Circle</Text>
                                <Text className="text-xs text-gray-500">Partners & groups for motivation</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="bg-purple-600 px-4 py-2 rounded-full">
                            <Text className="text-white text-sm font-semibold">Find Partner</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Switcher */}
                    <View className="flex-row mt-4 bg-gray-100 rounded-xl p-1">
                        <TouchableOpacity
                            className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${
                                activeTab === 'partners' ? 'bg-white shadow-sm' : ''
                            }`}
                            onPress={() => setActiveTab('partners')}
                        >
                            <MaterialCommunityIcons 
                                name="account-group" 
                                size={18} 
                                color={activeTab === 'partners' ? '#9333EA' : '#6B7280'} 
                            />
                            <Text 
                                className={`ml-2 text-sm font-medium ${
                                    activeTab === 'partners' ? 'text-purple-600' : 'text-gray-500'
                                }`}
                            >
                                Partners ({partners.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${
                                activeTab === 'groups' ? 'bg-white shadow-sm' : ''
                            }`}
                            onPress={() => setActiveTab('groups')}
                        >
                            <MaterialCommunityIcons 
                                name="account-multiple" 
                                size={18} 
                                color={activeTab === 'groups' ? '#9333EA' : '#6B7280'} 
                            />
                            <Text 
                                className={`ml-2 text-sm font-medium ${
                                    activeTab === 'groups' ? 'text-purple-600' : 'text-gray-500'
                                }`}
                            >
                                Groups
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {activeTab === 'partners' && (
                    <>
                        {/* Pending Requests */}
                        {partnerRequests.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-sm font-semibold text-gray-700 mb-3">
                                    Partner Requests ({partnerRequests.length})
                                </Text>
                                {partnerRequests.map((request) => (
                                    <View 
                                        key={request.id}
                                        className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-purple-200"
                                    >
                                        <View className="flex-row items-center">
                                            <Text className="text-3xl">{request.fromUserAvatar}</Text>
                                            <View className="ml-3 flex-1">
                                                <Text className="text-base font-semibold text-gray-900">
                                                    {request.fromUserName}
                                                </Text>
                                                {request.message && (
                                                    <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
                                                        "{request.message}"
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <View className="flex-row mt-3">
                                            <TouchableOpacity 
                                                className="flex-1 bg-purple-600 py-2 rounded-full mr-2"
                                                onPress={() => handleAcceptRequest(request)}
                                            >
                                                <Text className="text-white text-center font-semibold">Accept</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                className="flex-1 bg-gray-100 py-2 rounded-full ml-2"
                                                onPress={() => handleDeclineRequest(request)}
                                            >
                                                <Text className="text-gray-600 text-center font-medium">Decline</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Active Partners */}
                        <Text className="text-sm font-semibold text-gray-700 mb-3">
                            Your Partners
                        </Text>
                        
                        {partners.length === 0 ? (
                            <View className="items-center justify-center py-12 bg-white rounded-2xl">
                                <Text className="text-5xl mb-4">🤝</Text>
                                <Text className="text-gray-500 text-base text-center mb-2">
                                    No accountability partners yet
                                </Text>
                                <Text className="text-gray-400 text-sm text-center px-8 mb-4">
                                    Partners help you stay motivated and accountable for your goals
                                </Text>
                                <TouchableOpacity className="bg-purple-600 px-6 py-2 rounded-full">
                                    <Text className="text-white font-semibold">Find a Partner</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            partners.map((partner) => (
                                <View 
                                    key={partner.id}
                                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                                >
                                    <View className="flex-row items-center">
                                        <Text className="text-4xl">{partner.partnerAvatar}</Text>
                                        <View className="ml-3 flex-1">
                                            <View className="flex-row items-center">
                                                <Text className="text-base font-semibold text-gray-900">
                                                    {partner.partnerName}
                                                </Text>
                                                <View className="bg-purple-100 px-2 py-0.5 rounded-full ml-2">
                                                    <Text className="text-purple-600 text-xs font-medium">
                                                        Lvl {partner.partnerLevel}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-sm text-gray-500 mt-0.5">
                                                Partners since {new Date(partner.connectedSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    {/* Stats */}
                                    <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                                        <View className="flex-1 items-center">
                                            <View className="flex-row items-center">
                                                <MaterialCommunityIcons name="fire" size={16} color="#EF4444" />
                                                <Text className="text-base font-bold text-gray-900 ml-1">
                                                    {partner.checkInStreak}
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-gray-500">Check-in Streak</Text>
                                        </View>
                                        <View className="flex-1 items-center">
                                            <View className="flex-row items-center">
                                                <MaterialCommunityIcons name="trophy" size={16} color="#F59E0B" />
                                                <Text className="text-base font-bold text-gray-900 ml-1">
                                                    {partner.sharedChallenges.length}
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-gray-500">Shared Challenges</Text>
                                        </View>
                                        <View className="flex-1 items-center">
                                            <Text className="text-xs text-gray-400">Last active</Text>
                                            <Text className="text-sm font-medium text-gray-600">
                                                {getTimeAgo(partner.lastInteraction)}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    {/* Actions */}
                                    <View className="flex-row mt-3">
                                        <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-purple-50 py-2 rounded-full mr-2">
                                            <MaterialCommunityIcons name="message" size={16} color="#9333EA" />
                                            <Text className="text-purple-600 font-medium ml-1">Message</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-green-50 py-2 rounded-full ml-2">
                                            <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                                            <Text className="text-green-600 font-medium ml-1">Check In</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}

                {activeTab === 'groups' && (
                    <>
                        <Text className="text-sm font-semibold text-gray-700 mb-3">
                            Motivation Groups
                        </Text>
                        
                        {motivationGroups.map((group) => (
                            <View 
                                key={group.id}
                                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                            >
                                <View className="flex-row items-start">
                                    <View 
                                        className="w-12 h-12 rounded-xl items-center justify-center"
                                        style={{ backgroundColor: '#F3E8FF' }}
                                    >
                                        <MaterialCommunityIcons name="account-multiple" size={24} color="#9333EA" />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <View className="flex-row items-center">
                                            <Text className="text-base font-semibold text-gray-900">
                                                {group.name}
                                            </Text>
                                            {group.isJoined && (
                                                <View className="bg-green-100 px-2 py-0.5 rounded-full ml-2">
                                                    <Text className="text-green-600 text-xs font-medium">Joined</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
                                            {group.description}
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* Tags */}
                                <View className="flex-row flex-wrap mt-3">
                                    {group.tags.map((tag, index) => (
                                        <View 
                                            key={index}
                                            className="bg-gray-100 rounded-full px-2 py-0.5 mr-2 mb-1"
                                        >
                                            <Text className="text-xs text-gray-600">#{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                                
                                {/* Footer */}
                                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="account-group" size={16} color="#9CA3AF" />
                                        <Text className="text-sm text-gray-500 ml-1">
                                            {group.memberCount}/{group.maxMembers} members
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                        className={`px-4 py-1.5 rounded-full ${
                                            group.isJoined ? 'bg-gray-100' : 'bg-purple-600'
                                        }`}
                                        onPress={() => group.isJoined ? leaveGroup(group.id) : joinGroup(group.id)}
                                    >
                                        <Text 
                                            className={`text-sm font-semibold ${
                                                group.isJoined ? 'text-gray-600' : 'text-white'
                                            }`}
                                        >
                                            {group.isJoined ? 'Leave' : 'Join'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {/* Create Group CTA */}
                        <View className="bg-purple-50 rounded-2xl p-4 mt-4">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="plus-circle" size={24} color="#9333EA" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-purple-800 font-bold">Start Your Own Group</Text>
                                    <Text className="text-purple-600 text-sm">
                                        Create a space for people with similar goals
                                    </Text>
                                </View>
                                <TouchableOpacity className="bg-purple-600 px-4 py-2 rounded-full">
                                    <Text className="text-white text-sm font-semibold">Create</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
