/**
 * SensAI Life Wheel Screen
 * 
 * Displays the 9-dimension Life Wheel with balance metrics
 * and recovery task suggestions.
 */

import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSensAIStore } from '../../../store/sensaiStore';
import { LifeWheelChart } from '../../../components/sensai';
import { LIFE_WHEEL_DIMENSIONS, RecoveryTask } from '../../../types/sensai.types';

export default function LifeWheelScreen() {
    const router = useRouter();
    const {
        lifeWheelMetrics,
        loading,
        fetchLifeWheelMetrics,
        addRecoveryTask,
    } = useSensAIStore();

    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        fetchLifeWheelMetrics();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchLifeWheelMetrics();
        setRefreshing(false);
    };

    const handleAddRecoveryTask = async (task: RecoveryTask) => {
        await addRecoveryTask(task);
    };

    const getBalanceStatus = (score: number | undefined) => {
        const safeScore = score ?? 0;
        if (safeScore >= 70) return { label: 'Well Balanced', color: 'text-green-600', bg: 'bg-green-50' };
        if (safeScore >= 50) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' };
        return { label: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const balanceScore = lifeWheelMetrics?.balanceScore ?? 0;
    const dimensions = lifeWheelMetrics?.dimensions || [];
    const status = lifeWheelMetrics ? getBalanceStatus(balanceScore) : null;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 ml-4">Life Wheel</Text>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Balance Score Header */}
                {lifeWheelMetrics && status && (
                    <View className={`mx-4 mt-4 ${status.bg} rounded-2xl p-4`}>
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-sm text-gray-600">Balance Score</Text>
                                <Text className={`text-3xl font-bold ${status.color}`}>
                                    {balanceScore.toFixed(0)}/100
                                </Text>
                            </View>
                            <View className={`px-3 py-1 rounded-full ${status.bg} border border-current`}>
                                <Text className={`text-sm font-medium ${status.color}`}>{status.label}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Life Wheel Chart */}
                {lifeWheelMetrics && (
                    <View className="px-4 mt-4">
                        <LifeWheelChart metrics={lifeWheelMetrics} size={300} showLegend={false} />
                    </View>
                )}

                {/* Dimension Details */}
                <View className="px-4 mt-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Dimensions</Text>
                    
                    {dimensions.map((dim) => {
                        const lwDim = LIFE_WHEEL_DIMENSIONS.find(d => d.id === dim.dimension);
                        
                        return (
                            <View 
                                key={dim.dimension}
                                className={`bg-white rounded-xl p-4 mb-3 border ${
                                    dim.isNeglected ? 'border-red-200' : 'border-gray-100'
                                }`}
                            >
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <View 
                                            className="w-10 h-10 rounded-full items-center justify-center"
                                            style={{ backgroundColor: `${lwDim?.color}20` }}
                                        >
                                            <MaterialCommunityIcons 
                                                name={lwDim?.icon as any || 'circle'} 
                                                size={20} 
                                                color={lwDim?.color || '#6B7280'} 
                                            />
                                        </View>
                                        <View className="ml-3">
                                            <Text className="text-base font-semibold text-gray-900">
                                                {lwDim?.name || dim.dimensionName}
                                            </Text>
                                            {dim.isNeglected && (
                                                <View className="flex-row items-center mt-1">
                                                    <MaterialCommunityIcons name="alert-circle" size={12} color="#EF4444" />
                                                    <Text className="text-xs text-red-500 ml-1">
                                                        {dim.sprintsAtZero} sprints at zero
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-lg font-bold text-gray-900">
                                            {(dim.percentageOfTotal ?? 0).toFixed(0)}%
                                        </Text>
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons 
                                                name={dim.trend === 'up' ? 'trending-up' : dim.trend === 'down' ? 'trending-down' : 'minus'} 
                                                size={14} 
                                                color={dim.trend === 'up' ? '#10B981' : dim.trend === 'down' ? '#EF4444' : '#6B7280'} 
                                            />
                                            <Text className="text-xs text-gray-500 ml-1">
                                                {dim.pointsThisSprint} pts this sprint
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Progress Bar */}
                                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <View 
                                        className="h-full rounded-full"
                                        style={{ 
                                            width: `${Math.min(dim.percentageOfTotal, 100)}%`,
                                            backgroundColor: lwDim?.color || '#6B7280'
                                        }}
                                    />
                                </View>

                                {/* Recovery Task Suggestion */}
                                {dim.isNeglected && dim.suggestedRecoveryTask && (
                                    <TouchableOpacity
                                        onPress={() => handleAddRecoveryTask(dim.suggestedRecoveryTask!)}
                                        className="mt-3 bg-blue-50 rounded-lg p-3 flex-row items-center"
                                    >
                                        <MaterialCommunityIcons name="plus-circle" size={20} color="#3B82F6" />
                                        <View className="flex-1 ml-2">
                                            <Text className="text-sm font-medium text-blue-900">
                                                {dim.suggestedRecoveryTask.title}
                                            </Text>
                                            <Text className="text-xs text-blue-600">
                                                {dim.suggestedRecoveryTask.points} points • Quick recovery task
                                            </Text>
                                        </View>
                                        <MaterialCommunityIcons name="chevron-right" size={20} color="#3B82F6" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Quick Recovery Tasks */}
                <View className="px-4 mt-4 mb-8">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Quick Recovery Tasks</Text>
                    
                    {LIFE_WHEEL_DIMENSIONS.slice(0, 4).map((dim) => (
                        <View key={dim.id} className="mb-4">
                            <View className="flex-row items-center mb-2">
                                <View 
                                    className="w-6 h-6 rounded-full items-center justify-center mr-2"
                                    style={{ backgroundColor: dim.color }}
                                >
                                    <MaterialCommunityIcons name={dim.icon as any} size={14} color="white" />
                                </View>
                                <Text className="text-sm font-medium text-gray-700">{dim.name}</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {dim.recoveryTasks.map((task, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleAddRecoveryTask(task)}
                                        className="bg-white border border-gray-200 rounded-xl p-3 mr-3"
                                        style={{ width: 160 }}
                                    >
                                        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                                            {task.title}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
                                            {task.description}
                                        </Text>
                                        <View className="flex-row items-center mt-2">
                                            <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                                            <Text className="text-xs text-gray-600 ml-1">{task.points} pts</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
