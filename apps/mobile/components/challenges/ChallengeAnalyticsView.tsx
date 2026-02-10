import React from 'react';
import { View, Text } from 'react-native';
import { ChallengeAnalytics } from '../../types/models';
import { Card } from '../ui/Card';

interface ChallengeAnalyticsViewProps {
    analytics: ChallengeAnalytics;
}

export function ChallengeAnalyticsView({ analytics }: ChallengeAnalyticsViewProps) {
    return (
        <View>
            <Text className="text-xl font-bold mb-4">Performance Analytics</Text>
            
            <View className="flex-row flex-wrap gap-3 mb-4">
                {/* Completion Rate */}
                <Card className="flex-1 min-w-[45%]">
                    <Text className="text-gray-600 text-sm mb-1">Completion Rate</Text>
                    <Text className="text-3xl font-bold text-blue-600">
                        {analytics.completionRate.toFixed(0)}%
                    </Text>
                </Card>
                
                {/* Consistency Score */}
                <Card className="flex-1 min-w-[45%]">
                    <Text className="text-gray-600 text-sm mb-1">Consistency</Text>
                    <Text className="text-3xl font-bold text-green-600">
                        {analytics.consistencyScore.toFixed(0)}%
                    </Text>
                </Card>
                
                {/* Average Value (if applicable) */}
                {analytics.averageValue !== undefined && (
                    <Card className="flex-1 min-w-[45%]">
                        <Text className="text-gray-600 text-sm mb-1">Average</Text>
                        <Text className="text-3xl font-bold text-purple-600">
                            {analytics.averageValue.toFixed(0)}
                        </Text>
                    </Card>
                )}
                
                {/* Total Impact */}
                <Card className="flex-1 min-w-[45%]">
                    <Text className="text-gray-600 text-sm mb-1">Total Impact</Text>
                    <Text className="text-3xl font-bold text-orange-600">
                        {analytics.totalImpact}
                    </Text>
                    <Text className="text-xs text-gray-500">points contributed</Text>
                </Card>
            </View>
            
            {/* Best/Worst Days */}
            {(analytics.bestDay || analytics.worstDay) && (
                <Card>
                    <Text className="font-semibold mb-2">Insights</Text>
                    {analytics.bestDay && (
                        <Text className="text-sm text-gray-700 mb-1">
                            Best day: {new Date(analytics.bestDay).toLocaleDateString()}
                        </Text>
                    )}
                    {analytics.worstDay && (
                        <Text className="text-sm text-gray-700">
                            Room for improvement: {new Date(analytics.worstDay).toLocaleDateString()}
                        </Text>
                    )}
                </Card>
            )}
        </View>
    );
}
