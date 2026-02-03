/**
 * InterventionCard Component
 * 
 * Displays AI interventions with appropriate urgency styling
 * and action options.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
    Intervention, 
    InterventionType, 
    InterventionUrgency,
    SuggestedAction,
} from '../../types/sensai.types';
import { useTranslation } from '../../hooks';

interface InterventionCardProps {
    intervention: Intervention;
    onAcknowledge: (action: 'acknowledge' | 'override' | 'defer') => void;
    onDismiss?: () => void;
    expanded?: boolean;
    onToggleExpand?: () => void;
}

const URGENCY_STYLES: Record<InterventionUrgency, { bg: string; border: string; badge: string; text: string }> = {
    high: {
        bg: 'bg-red-50',
        border: 'border-red-300',
        badge: 'bg-red-500',
        text: 'text-red-700',
    },
    medium: {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        badge: 'bg-amber-500',
        text: 'text-amber-700',
    },
    low: {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        badge: 'bg-blue-500',
        text: 'text-blue-700',
    },
    positive: {
        bg: 'bg-green-50',
        border: 'border-green-300',
        badge: 'bg-green-500',
        text: 'text-green-700',
    },
};

const TYPE_ICONS: Record<InterventionType, string> = {
    alert: 'alert-octagon',
    warning: 'alert',
    nudge: 'lightbulb-on-outline',
    celebration: 'party-popper',
};

export function InterventionCard({
    intervention,
    onAcknowledge,
    onDismiss,
    expanded = false,
    onToggleExpand,
}: InterventionCardProps) {
    const { t } = useTranslation();
    const style = URGENCY_STYLES[intervention.urgency];
    const icon = TYPE_ICONS[intervention.type];

    const CATEGORY_LABELS: Record<string, string> = {
        capacity: t('sensai.interventions.capacity'),
        balance: t('sensai.interventions.balance'),
        execution: t('sensai.interventions.execution'),
        motivation: t('sensai.interventions.motivation'),
    };

    const renderDataSummary = () => {
        const { data } = intervention;
        if (!data) return null;

        switch (data.type) {
            case 'overcommit':
                return (
                    <View className="bg-white/60 rounded-lg p-3 mt-2">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-xs text-gray-500">{t('sensai.interventions.planned')}</Text>
                            <Text className="text-sm font-semibold text-gray-900">{data.plannedPoints} {t('common.pts')}</Text>
                        </View>
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-xs text-gray-500">{t('sensai.interventions.yourVelocity')}</Text>
                            <Text className="text-sm font-semibold text-gray-900">{data.velocity} {t('common.pts')}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-xs text-gray-500">{t('sensai.interventions.overcommit')}</Text>
                            <Text className={`text-sm font-bold ${style.text}`}>+{data.overcommitPercentage}%</Text>
                        </View>
                    </View>
                );

            case 'neglect':
                return (
                    <View className="bg-white/60 rounded-lg p-3 mt-2">
                        <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="alert-circle" size={16} color="#F59E0B" />
                            <Text className="text-sm text-gray-700 ml-2">
                                {data.dimensionName} {t('sensai.interventions.atZeroFor', { weeks: data.weeksNeglected })}
                            </Text>
                        </View>
                        <View className="bg-amber-100 rounded-lg p-2">
                            <Text className="text-xs text-amber-800 font-medium">{t('sensai.interventions.suggestedTask')}</Text>
                            <Text className="text-sm text-amber-900 mt-1">"{data.suggestedTask}"</Text>
                            <Text className="text-xs text-amber-600 mt-1">{data.suggestedPoints} {t('common.points')}</Text>
                        </View>
                    </View>
                );

            case 'sprint_risk':
                return (
                    <View className="bg-white/60 rounded-lg p-3 mt-2">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-xs text-gray-500">{t('common.progress')}</Text>
                            <Text className={`text-sm font-semibold ${style.text}`}>{data.completionPercentage}%</Text>
                        </View>
                        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <View 
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${data.completionPercentage}%` }}
                            />
                        </View>
                        <View className="flex-row justify-between mt-2">
                            <Text className="text-xs text-gray-500">{t('sensai.standup.dayOfSprint', { current: data.dayOfSprint ?? 1, total: data.totalDays ?? 14 })}</Text>
                            <Text className="text-xs text-gray-500">{data.remainingPoints ?? 0} {t('common.pts')} {t('common.remaining').toLowerCase()}</Text>
                        </View>
                    </View>
                );

            case 'velocity_milestone':
                return (
                    <View className="bg-white/60 rounded-lg p-3 mt-2">
                        <View className="items-center">
                            <MaterialCommunityIcons name="trophy" size={32} color="#10B981" />
                            <Text className="text-2xl font-bold text-green-600 mt-1">{data.newVelocity} {t('common.pts')}</Text>
                            <Text className="text-xs text-gray-500">{t('sensai.interventions.personalBest')}</Text>
                            <Text className="text-sm text-green-600 mt-1">+{data.improvementPercentage}% {t('common.improvement')}</Text>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View className={`${style.bg} ${style.border} border rounded-2xl p-4 mb-3`}>
            {/* Header */}
            <TouchableOpacity 
                onPress={onToggleExpand}
                className="flex-row items-start"
                activeOpacity={0.7}
            >
                <View className={`w-10 h-10 ${style.badge} rounded-full items-center justify-center mr-3`}>
                    <MaterialCommunityIcons 
                        name={icon as any} 
                        size={22} 
                        color="white" 
                    />
                </View>
                
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <View className={`px-2 py-0.5 ${style.badge} rounded-full mr-2`}>
                            <Text className="text-xs font-medium text-white uppercase">
                                {intervention.type}
                            </Text>
                        </View>
                        <Text className="text-xs text-gray-500">
                            {CATEGORY_LABELS[intervention.category]}
                        </Text>
                    </View>
                    
                    <Text className="text-base font-bold text-gray-900">
                        {intervention.title}
                    </Text>
                    
                    <Text className="text-sm text-gray-600 mt-1" numberOfLines={expanded ? undefined : 2}>
                        {intervention.message}
                    </Text>
                </View>

                {onDismiss && intervention.type === 'nudge' && (
                    <TouchableOpacity onPress={onDismiss} className="p-1">
                        <MaterialCommunityIcons name="close" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>

            {/* Expanded Content */}
            {expanded && (
                <>
                    {renderDataSummary()}

                    {/* Actions */}
                    <View className="flex-row flex-wrap mt-4 gap-2">
                        {intervention.type === 'celebration' ? (
                            <TouchableOpacity
                                onPress={() => onAcknowledge('acknowledge')}
                                className="flex-1 bg-green-600 py-3 rounded-xl items-center"
                            >
                                <Text className="text-white font-semibold">{t('sensai.interventions.awesome')}</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    onPress={() => onAcknowledge('acknowledge')}
                                    className="flex-1 bg-blue-600 py-3 rounded-xl items-center"
                                >
                                    <Text className="text-white font-semibold">{t('sensai.interventions.gotIt')}</Text>
                                </TouchableOpacity>
                                
                                {intervention.urgency !== 'positive' && (
                                    <TouchableOpacity
                                        onPress={() => onAcknowledge('defer')}
                                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl"
                                    >
                                        <Text className="text-gray-700 font-medium">{t('common.later')}</Text>
                                    </TouchableOpacity>
                                )}
                                
                                {intervention.urgency === 'high' && (
                                    <TouchableOpacity
                                        onPress={() => onAcknowledge('override')}
                                        className="px-4 py-3 bg-gray-100 rounded-xl"
                                    >
                                        <Text className="text-gray-500 font-medium">{t('sensai.interventions.override')}</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </>
            )}

            {/* Expand/Collapse Indicator */}
            {!expanded && (
                <TouchableOpacity 
                    onPress={onToggleExpand}
                    className="items-center mt-2"
                >
                    <MaterialCommunityIcons name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            )}
        </View>
    );
}

export default InterventionCard;
