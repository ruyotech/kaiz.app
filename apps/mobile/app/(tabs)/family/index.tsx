/**
 * Family Dashboard Screen - Main Family Hub
 * 
 * Central hub for family workspace showing:
 * - Family overview and quick stats
 * - Member activity
 * - Shared epics progress
 * - Upcoming ceremonies
 * - Activity feed
 */

import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    RefreshControl,
    Alert,
    Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useFamilyStore } from '../../../store/familyStore';
import { useTaskStore } from '../../../store/taskStore';
import { useAuthStore } from '../../../store/authStore';
import { useSubscriptionStore, SUBSCRIPTION_TIERS } from '../../../store/subscriptionStore';
import { MemberCard } from '../../../components/family/MemberCard';
import { SharedEpicCard } from '../../../components/family/SharedEpicCard';
import { CeremonyCard } from '../../../components/family/CeremonyCard';
import { ActivityFeedItem } from '../../../components/family/ActivityFeedItem';
import { VelocityChart } from '../../../components/family/VelocityChart';
import { KudosModal } from '../../../components/family/KudosModal';
import { FamilyMember } from '../../../types/family.types';

export default function FamilyDashboardScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const { user } = useAuthStore();
    const { canAccessFeature, subscription, setSubscription } = useSubscriptionStore();
    const { setViewScope } = useTaskStore();
    const {
        currentFamily,
        members,
        sharedEpics,
        sharedTasks,
        ceremonies,
        activityFeed,
        familyVelocity,
        kudos,
        unreadKudosCount,
        loading,
        hasPermission,
        fetchFamily,
        fetchMyFamily,
        fetchMembers,
        fetchSharedEpics,
        fetchSharedTasks,
        fetchCeremonies,
        fetchActivityFeed,
        fetchFamilyVelocity,
        fetchKudos,
        generateInviteCode,
    } = useFamilyStore();
    
    const [refreshing, setRefreshing] = useState(false);
    const [showKudosModal, setShowKudosModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    
    // Check if user has family plan access
    const hasFamilyAccess = canAccessFeature('sharedWorkspace');
    const familyTier = SUBSCRIPTION_TIERS.family;
    
    // Handle upgrade to family plan (TEST MODE)
    const handleUpgradeToFamily = () => {
        Alert.alert(
            `Upgrade to ${familyTier.name}`,
            `Are you sure you want to upgrade to ${familyTier.name} for ${familyTier.price}?\n\n(Test mode: This will activate immediately)`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Upgrade Now',
                    onPress: () => {
                        const now = new Date();
                        const endDate = new Date(now);
                        endDate.setMonth(endDate.getMonth() + 1);
                        
                        setSubscription({
                            tier: 'family',
                            startDate: now.toISOString(),
                            endDate: endDate.toISOString(),
                            renewalDate: endDate.toISOString(),
                            billingPeriod: 'monthly',
                            isInGracePeriod: false,
                            gracePeriodEndDate: null,
                            autoRenew: true,
                        });
                        
                        Alert.alert(
                            '🎉 Welcome to Family Plan!',
                            'You can now create or join a family workspace. Enjoy collaborating with your loved ones!',
                            [{ text: 'Get Started!' }]
                        );
                    },
                },
            ]
        );
    };
    
    useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        // First fetch user's family (will use mock if API unavailable)
        await fetchMyFamily();
        
        // Then load family-related data
        await Promise.all([
            fetchMembers(),
            fetchSharedEpics(),
            fetchSharedTasks(),
            fetchCeremonies(),
            fetchActivityFeed(),
            fetchFamilyVelocity(),
            fetchKudos(),
        ]);
    };
    
    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };
    
    const handleShareInvite = async () => {
        try {
            const code = await generateInviteCode();
            await Share.share({
                message: `Join our family workspace on Kaiz ! Use invite code: ${code}`,
                title: 'Join Our Family',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to generate invite code');
        }
    };
    
    const handleSendKudos = (member: FamilyMember) => {
        setSelectedMember(member);
        setShowKudosModal(true);
    };
    
    // Get stats
    const completedTasks = sharedTasks.filter(t => t.status === 'done').length;
    const activeEpics = sharedEpics.filter(e => e.status === 'active').length;
    const todaysCeremonies = ceremonies.filter(c => 
        new Date(c.scheduledAt).toDateString() === new Date().toDateString() && !c.completedAt
    );
    
    // No family state
    if (!currentFamily) {
        // Check if user doesn't have family plan - show upgrade prompt
        if (!hasFamilyAccess) {
            return (
                <View className="flex-1" style={{ backgroundColor: colors.background }}>
                    <SafeAreaView edges={['top']} className="bg-purple-600">
                        <View className="px-4 py-4">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-white text-xl font-bold">Family</Text>
                                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: '#F59E0B' }}>
                                    <Text className="text-white text-xs font-bold">PREMIUM</Text>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                    
                    <ScrollView 
                        className="flex-1" 
                        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Hero Section */}
                        <View className="items-center mb-8">
                            <View 
                                className="w-28 h-28 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: '#EC489920' }}
                            >
                                <Text className="text-6xl">👨‍👩‍👧‍👦</Text>
                            </View>
                            <Text 
                                className="text-2xl font-bold text-center mb-2"
                                style={{ color: colors.text }}
                            >
                                Family Workspace
                            </Text>
                            <Text 
                                className="text-base text-center"
                                style={{ color: colors.textSecondary }}
                            >
                                Collaborate, grow, and achieve goals together as a family
                            </Text>
                        </View>
                        
                        {/* Features */}
                        <View 
                            className="rounded-2xl p-5 mb-6"
                            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                        >
                            <Text 
                                className="text-lg font-bold mb-4"
                                style={{ color: colors.text }}
                            >
                                What's Included
                            </Text>
                            
                            {[
                                { icon: 'account-multiple', text: 'Up to 6 family members', color: '#3B82F6' },
                                { icon: 'clipboard-list', text: 'Shared task boards & epics', color: '#10B981' },
                                { icon: 'calendar-sync', text: 'Family calendar sync', color: '#F59E0B' },
                                { icon: 'account-voice', text: 'Family standups & ceremonies', color: '#8B5CF6' },
                                { icon: 'hand-clap', text: 'Kudos & celebration system', color: '#EC4899' },
                                { icon: 'chart-line', text: 'Family velocity tracking', color: '#06B6D4' },
                                { icon: 'gamepad-variant', text: 'Gamification for kids', color: '#EF4444' },
                            ].map((feature, index) => (
                                <View key={index} className="flex-row items-center mb-3">
                                    <View 
                                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: feature.color + '20' }}
                                    >
                                        <MaterialCommunityIcons 
                                            name={feature.icon as any} 
                                            size={20} 
                                            color={feature.color}
                                        />
                                    </View>
                                    <Text 
                                        className="flex-1 text-base"
                                        style={{ color: colors.text }}
                                    >
                                        {feature.text}
                                    </Text>
                                    <MaterialCommunityIcons 
                                        name="check-circle" 
                                        size={20} 
                                        color="#10B981"
                                    />
                                </View>
                            ))}
                        </View>
                        
                        {/* Pricing Card */}
                        <View 
                            className="rounded-2xl p-5 mb-6 border-2"
                            style={{ 
                                backgroundColor: '#EC489910',
                                borderColor: '#EC4899',
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <View>
                                    <Text 
                                        className="text-xl font-bold"
                                        style={{ color: colors.text }}
                                    >
                                        {familyTier.name} Plan
                                    </Text>
                                    <Text 
                                        className="text-sm"
                                        style={{ color: colors.textSecondary }}
                                    >
                                        Everything you need for your family
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text 
                                        className="text-2xl font-bold"
                                        style={{ color: '#EC4899' }}
                                    >
                                        {familyTier.price}
                                    </Text>
                                </View>
                            </View>
                            
                            <TouchableOpacity
                                onPress={handleUpgradeToFamily}
                                className="py-4 rounded-xl items-center"
                                style={{ backgroundColor: '#EC4899' }}
                            >
                                <Text className="text-white font-bold text-lg">Upgrade to Family Plan</Text>
                            </TouchableOpacity>
                            
                            <Text 
                                className="text-xs text-center mt-3"
                                style={{ color: colors.textSecondary }}
                            >
                                14-day free trial • Cancel anytime
                            </Text>
                        </View>
                        
                        {/* Current Plan Info */}
                        <View 
                            className="rounded-xl p-4 flex-row items-center"
                            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                        >
                            <MaterialCommunityIcons 
                                name="information-outline" 
                                size={20} 
                                color={colors.textSecondary}
                            />
                            <Text 
                                className="flex-1 text-sm ml-2"
                                style={{ color: colors.textSecondary }}
                            >
                                You're currently on the{' '}
                                <Text style={{ fontWeight: 'bold', color: colors.text }}>
                                    {SUBSCRIPTION_TIERS[subscription.tier].name}
                                </Text>
                                {' '}plan
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/settings/subscription' as any)}>
                                <Text style={{ color: '#3B82F6', fontWeight: '600' }}>View Plans</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            );
        }
        
        // Has family access but no family created yet
        return (
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                <SafeAreaView edges={['top']} className="bg-purple-600">
                    <View className="px-4 py-4">
                        <Text className="text-white text-xl font-bold">Family</Text>
                    </View>
                </SafeAreaView>
                
                <View className="flex-1 items-center justify-center px-6">
                    <View 
                        className="w-24 h-24 rounded-full items-center justify-center mb-6"
                        style={{ backgroundColor: '#8B5CF620' }}
                    >
                        <Text className="text-5xl">👨‍👩‍👧‍👦</Text>
                    </View>
                    <Text 
                        className="text-2xl font-bold text-center mb-2"
                        style={{ color: colors.text }}
                    >
                        No Family Workspace
                    </Text>
                    <Text 
                        className="text-base text-center mb-8"
                        style={{ color: colors.textSecondary }}
                    >
                        Create a family workspace to collaborate with your loved ones
                    </Text>
                    
                    <TouchableOpacity
                        onPress={() => router.push('/family/create' as any)}
                        className="flex-row items-center px-6 py-3 rounded-xl mb-3"
                        style={{ backgroundColor: '#8B5CF6' }}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                        <Text className="text-white font-bold ml-2">Create Family</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => router.push('/family/join' as any)}
                        className="flex-row items-center px-6 py-3 rounded-xl"
                        style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                    >
                        <MaterialCommunityIcons name="account-plus" size={20} color={colors.textSecondary} />
                        <Text 
                            className="font-medium ml-2"
                            style={{ color: colors.text }}
                        >
                            Join with Invite Code
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    
    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-purple-600">
                <View className="px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View className="ml-3">
                                <Text className="text-white text-xl font-bold">{currentFamily.name}</Text>
                                <Text className="text-purple-200 text-xs">
                                    {members.length} member{members.length !== 1 ? 's' : ''} • Sprint Week {familyVelocity?.weekNumber || 1}
                                </Text>
                            </View>
                        </View>
                        
                        <View className="flex-row items-center">
                            {/* Kudos Notification */}
                            {unreadKudosCount > 0 && (
                                <TouchableOpacity 
                                    onPress={() => router.push('/family/kudos' as any)}
                                    className="mr-3 relative"
                                >
                                    <MaterialCommunityIcons name="hand-clap" size={24} color="#fff" />
                                    <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                                        <Text className="text-white text-xs font-bold">{unreadKudosCount}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            
                            {/* Settings */}
                            <TouchableOpacity onPress={() => router.push('/family/settings' as any)}>
                                <MaterialCommunityIcons name="cog" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
            
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Stats */}
                <View className="flex-row px-4 mt-4 gap-3">
                    <View 
                        className="flex-1 p-4 rounded-2xl items-center"
                        style={{ backgroundColor: '#10B98115' }}
                    >
                        <Text className="text-2xl font-bold" style={{ color: '#10B981' }}>
                            {completedTasks}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            Tasks Done
                        </Text>
                    </View>
                    <View 
                        className="flex-1 p-4 rounded-2xl items-center"
                        style={{ backgroundColor: '#8B5CF615' }}
                    >
                        <Text className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>
                            {activeEpics}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            Active Epics
                        </Text>
                    </View>
                    <View 
                        className="flex-1 p-4 rounded-2xl items-center"
                        style={{ backgroundColor: '#F59E0B15' }}
                    >
                        <Text className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
                            {familyVelocity?.averageCompletion || 0}%
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            Completion
                        </Text>
                    </View>
                </View>
                
                {/* Today's Ceremonies */}
                {todaysCeremonies.length > 0 && (
                    <View className="px-4 mt-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <Text className="text-lg">📅</Text>
                                <Text 
                                    className="text-lg font-bold ml-2"
                                    style={{ color: colors.text }}
                                >
                                    Today's Ceremonies
                                </Text>
                            </View>
                        </View>
                        {todaysCeremonies.map(ceremony => (
                            <CeremonyCard 
                                key={ceremony.id}
                                ceremony={ceremony}
                                onPress={() => router.push(`/family/ceremony/${ceremony.id}` as any)}
                                onStart={() => router.push(`/family/standup?id=${ceremony.id}` as any)}
                            />
                        ))}
                    </View>
                )}
                
                {/* Family Members */}
                <View className="mt-6">
                    <View className="flex-row items-center justify-between px-4 mb-3">
                        <Text 
                            className="text-lg font-bold"
                            style={{ color: colors.text }}
                        >
                            Family Members
                        </Text>
                        <TouchableOpacity 
                            onPress={() => router.push('/family/members' as any)}
                            className="flex-row items-center"
                        >
                            <Text 
                                className="text-sm font-medium mr-1"
                                style={{ color: '#8B5CF6' }}
                            >
                                Manage
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={18} color="#8B5CF6" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {members.map(member => (
                            <MemberCard
                                key={member.userId}
                                member={member}
                                compact
                                isCurrentUser={member.userId === 'user-1'} // Mock current user
                                onPress={() => router.push(`/family/member/${member.userId}` as any)}
                            />
                        ))}
                        
                        {/* Add Member Button */}
                        {hasPermission('invite_members') && (
                            <TouchableOpacity
                                onPress={handleShareInvite}
                                className="items-center justify-center p-3 rounded-xl mr-3"
                                style={{ 
                                    backgroundColor: colors.card,
                                    borderWidth: 2,
                                    borderColor: colors.border,
                                    borderStyle: 'dashed',
                                    minWidth: 100,
                                }}
                            >
                                <MaterialCommunityIcons 
                                    name="account-plus" 
                                    size={24} 
                                    color={colors.textSecondary}
                                />
                                <Text 
                                    className="text-xs mt-1"
                                    style={{ color: colors.textSecondary }}
                                >
                                    Invite
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
                
                {/* Shared Epics */}
                <View className="px-4 mt-6">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text 
                            className="text-lg font-bold"
                            style={{ color: colors.text }}
                        >
                            Shared Epics
                        </Text>
                        <TouchableOpacity 
                            onPress={() => router.push('/family/epics' as any)}
                            className="flex-row items-center"
                        >
                            <Text 
                                className="text-sm font-medium mr-1"
                                style={{ color: '#8B5CF6' }}
                            >
                                View All
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={18} color="#8B5CF6" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        {sharedEpics.slice(0, 3).map(epic => (
                            <SharedEpicCard
                                key={epic.id}
                                epic={epic}
                                compact
                                onPress={() => router.push(`/family/epic/${epic.id}` as any)}
                            />
                        ))}
                    </ScrollView>
                </View>
                
                {/* Quick Actions */}
                <View className="px-4 mt-6">
                    <Text 
                        className="text-lg font-bold mb-3"
                        style={{ color: colors.text }}
                    >
                        Quick Actions
                    </Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => {
                                // Set view scope to family and navigate to backlog
                                setViewScope('family');
                                router.push('/(tabs)/sdlc/backlog' as any);
                            }}
                            className="flex-1 p-4 rounded-2xl items-center"
                            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                        >
                            <MaterialCommunityIcons name="clipboard-list" size={28} color="#3B82F6" />
                            <Text 
                                className="text-sm font-medium mt-2"
                                style={{ color: colors.text }}
                            >
                                Family Backlog
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                // Set view scope to family and navigate to calendar
                                setViewScope('family');
                                router.push('/(tabs)/sdlc/calendar' as any);
                            }}
                            className="flex-1 p-4 rounded-2xl items-center"
                            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                        >
                            <MaterialCommunityIcons name="calendar-month" size={28} color="#10B981" />
                            <Text 
                                className="text-sm font-medium mt-2"
                                style={{ color: colors.text }}
                            >
                                Family Calendar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/family/family-standup' as any)}
                            className="flex-1 p-4 rounded-2xl items-center"
                            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                        >
                            <MaterialCommunityIcons name="account-voice" size={28} color="#F59E0B" />
                            <Text 
                                className="text-sm font-medium mt-2"
                                style={{ color: colors.text }}
                            >
                                Standup
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Velocity Chart */}
                {familyVelocity && (
                    <View className="px-4 mt-6">
                        <VelocityChart 
                            velocity={familyVelocity}
                            onMemberPress={(userId) => router.push(`/family/member/${userId}` as any)}
                        />
                    </View>
                )}
                
                {/* Recent Activity */}
                <View className="mt-6 mb-8">
                    <View className="flex-row items-center justify-between px-4 mb-3">
                        <Text 
                            className="text-lg font-bold"
                            style={{ color: colors.text }}
                        >
                            Recent Activity
                        </Text>
                    </View>
                    
                    <View 
                        className="mx-4 rounded-2xl overflow-hidden"
                        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                    >
                        {activityFeed.slice(0, 5).map(activity => (
                            <ActivityFeedItem
                                key={activity.id}
                                activity={activity}
                            />
                        ))}
                        
                        {activityFeed.length > 5 && (
                            <TouchableOpacity 
                                onPress={() => router.push('/family/activity' as any)}
                                className="py-3 items-center"
                            >
                                <Text 
                                    className="text-sm font-medium"
                                    style={{ color: '#8B5CF6' }}
                                >
                                    View All Activity
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
            
            {/* Kudos Modal */}
            <KudosModal
                visible={showKudosModal}
                onClose={() => {
                    setShowKudosModal(false);
                    setSelectedMember(null);
                }}
                recipient={selectedMember}
            />
        </View>
    );
}
