/**
 * SensAI Dashboard Screen
 * 
 * Main hub for the AI Scrum Master featuring:
 * - Coach messages
 * - Sprint health overview
 * - Daily standup access
 * - Active interventions
 * - Quick actions
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSensAIStore } from '../../../store/sensaiStore';
import { useAuthStore } from '../../../store/authStore';
import { useTranslation } from '../../../hooks';
import { useThemeContext } from '../../../providers/ThemeProvider';
import {
    CoachMessage,
    InterventionCard,
    SprintHealthCard,
    VelocityCard,
    StandupCard,
    QuickActionsBar,
    getSensAIQuickActions,
} from '../../../components/sensai';

export default function SensAIDashboard() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const { user } = useAuthStore();
    const {
        isInitialized,
        loading,
        error,
        velocityMetrics,
        currentSprintHealth,
        todayStandup,
        activeInterventions,
        coachMessages,
        initialize,
        refreshData,
        acknowledgeIntervention,
        dismissIntervention,
        clearError,
    } = useSensAIStore();

    const [refreshing, setRefreshing] = useState(false);
    const [expandedIntervention, setExpandedIntervention] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id && !isInitialized) {
            initialize(user.id);
        }
    }, [user?.id, isInitialized]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshData();
        setRefreshing(false);
    };

    const quickActions = getSensAIQuickActions({
        onStandup: () => router.push('/(tabs)/sensai/standup' as any),
        onPlanning: () => router.push('/(tabs)/sensai/planning' as any),
        onIntake: () => router.push('/(tabs)/sensai/intake' as any),
        onInterventions: () => router.push('/(tabs)/sensai/interventions' as any),
        onLifeWheel: () => router.push('/(tabs)/sensai/lifewheel' as any),
        interventionCount: activeInterventions.filter(i => !i.acknowledged).length,
    });

    const latestMessage = coachMessages.find(m => !m.read);
    const urgentInterventions = activeInterventions.filter(
        i => !i.acknowledged && (i.urgency === 'high' || i.urgency === 'medium')
    ).slice(0, 2);

    if (!isInitialized && loading) {
        return (
            <SafeAreaView 
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: colors.background }}
            >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary, marginTop: 16 }}>{t('sensai.initializing')}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="px-4 pt-4 pb-2">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text 
                                className="text-2xl font-bold"
                                style={{ color: colors.text }}
                            >{t('sensai.title')}</Text>
                            <Text 
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                            >{t('sensai.subtitle')}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/sensai/settings' as any)}
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: colors.backgroundSecondary }}
                        >
                            <MaterialCommunityIcons name="cog-outline" size={22} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <QuickActionsBar actions={quickActions} />

                {/* Coach Message */}
                {latestMessage && (
                    <View className="px-4 mt-2">
                        <CoachMessage
                            message={latestMessage}
                            onDismiss={() => useSensAIStore.getState().markMessageRead(latestMessage.id)}
                        />
                    </View>
                )}

                {/* Daily Standup Card */}
                <View className="px-4 mt-4">
                    <StandupCard
                        standup={todayStandup}
                        sprintHealth={currentSprintHealth}
                        onStartStandup={() => router.push('/(tabs)/sensai/standup' as any)}
                        onViewStandup={() => router.push('/(tabs)/sensai/standup' as any)}
                    />
                </View>

                {/* Urgent Interventions */}
                {urgentInterventions.length > 0 && (
                    <View className="px-4 mt-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text 
                                className="text-lg font-bold"
                                style={{ color: colors.text }}
                            >{t('sensai.needsAttention')}</Text>
                            {activeInterventions.length > 2 && (
                                <TouchableOpacity
                                    onPress={() => router.push('/(tabs)/sensai/interventions' as any)}
                                >
                                    <Text className="text-sm font-medium" style={{ color: colors.primary }}>{t('common.seeAll')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {urgentInterventions.map(intervention => (
                            <InterventionCard
                                key={intervention.id}
                                intervention={intervention}
                                expanded={expandedIntervention === intervention.id}
                                onToggleExpand={() => setExpandedIntervention(
                                    expandedIntervention === intervention.id ? null : intervention.id
                                )}
                                onAcknowledge={(action) => acknowledgeIntervention(intervention.id, action)}
                                onDismiss={() => dismissIntervention(intervention.id)}
                            />
                        ))}
                    </View>
                )}

                {/* Sprint Health */}
                {currentSprintHealth && (
                    <View className="px-4 mt-6">
                        <Text 
                            className="text-lg font-bold mb-3"
                            style={{ color: colors.text }}
                        >{t('sensai.sprintHealth.title')}</Text>
                        <SprintHealthCard health={currentSprintHealth} />
                    </View>
                )}

                {/* Velocity Overview */}
                {velocityMetrics && (
                    <View className="px-4 mt-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text 
                                className="text-lg font-bold"
                                style={{ color: colors.text }}
                            >{t('sensai.yourVelocity')}</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/sensai/velocity' as any)}
                            >
                                <Text className="text-sm font-medium" style={{ color: colors.primary }}>{t('sensai.details')}</Text>
                            </TouchableOpacity>
                        </View>
                        <VelocityCard metrics={velocityMetrics} showChart={false} />
                    </View>
                )}

                {/* Ceremonies Section */}
                <View className="px-4 mt-6 mb-8">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text 
                            className="text-lg font-bold"
                            style={{ color: colors.text }}
                        >{t('sprints.sprintCeremonies')}</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/sensai/ceremonies' as any)}
                        >
                            <Text className="text-sm font-medium" style={{ color: colors.primary }}>{t('common.viewAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row">
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/sensai/planning' as any)}
                            className="flex-1 rounded-xl p-4 mr-2"
                            style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }}
                        >
                            <MaterialCommunityIcons name="clipboard-list-outline" size={28} color={colors.primary} />
                            <Text 
                                className="text-sm font-semibold mt-2"
                                style={{ color: isDark ? '#93C5FD' : '#1E40AF' }}
                            >{t('sensai.ceremonies.sprintPlanning')}</Text>
                            <Text 
                                className="text-xs mt-1"
                                style={{ color: isDark ? '#60A5FA' : '#3B82F6' }}
                            >{t('sensai.planYourWeek')}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/sensai/review' as any)}
                            className="flex-1 rounded-xl p-4 ml-2"
                            style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF' }}
                        >
                            <MaterialCommunityIcons name="trophy-outline" size={28} color="#8B5CF6" />
                            <Text 
                                className="text-sm font-semibold mt-2"
                                style={{ color: isDark ? '#C4B5FD' : '#5B21B6' }}
                            >{t('sensai.ceremonies.sprintReview')}</Text>
                            <Text 
                                className="text-xs mt-1"
                                style={{ color: isDark ? '#A78BFA' : '#7C3AED' }}
                            >{t('sensai.celebrateWins')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
