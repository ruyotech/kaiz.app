/**
 * Sprint Insights Screen
 *
 * Comprehensive analytics dashboard showing velocity trends,
 * productivity patterns, and actionable insights across sprints.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';
import { useSprintAnalytics, useVelocityMetrics } from '../../../hooks/queries';
import { useThemeContext } from '../../../providers/ThemeProvider';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';
type InsightsTab = 'overview' | 'velocity' | 'patterns';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 64;

export default function InsightsScreen() {
    const { colors, isDark } = useThemeContext();
    const { data: analyticsData } = useSprintAnalytics('month');
    const { data: velocityData } = useVelocityMetrics();
    const [timeRange, setTimeRange] = useState<TimeRange>('month');
    const [activeTab, setActiveTab] = useState<InsightsTab>('overview');

    // Mock analytics data (replaced by real data once API connected)
    const weeklyData = [32, 38, 45, 35, 42, 28, 40];
    const monthlyTrend = [85, 92, 78, 88, 95, 82, 90, 87];

    const insights = [
        {
            type: 'positive',
            icon: 'trending-up',
            title: 'Velocity Improving',
            description: 'Your average velocity has increased 15% over the last month.',
        },
        {
            type: 'warning',
            icon: 'alert-circle',
            title: 'Area Needs Attention',
            description: 'Finance dimension has been below 6 for 3 consecutive sprints.',
        },
        {
            type: 'insight',
            icon: 'lightbulb',
            title: 'Best Day Pattern',
            description: 'You complete 40% more tasks on Tuesdays and Wednesdays.',
        },
        {
            type: 'positive',
            icon: 'check-circle',
            title: 'Consistent Health',
            description: 'Health dimension maintained above 7 for 5 sprints.',
        },
    ];

    const chartBgColor = colors.card;
    const gridColor = isDark ? '#374151' : '#E5E7EB';
    const chartAccent = colors.success;

    // --- Chart Renderers ---
    const renderBarChart = (data: number[], labels: string[], maxValue: number = 100) => {
        const chartHeight = 120;
        const barWidth = (chartWidth - 40) / data.length - 8;

        return (
            <Svg width={chartWidth} height={chartHeight + 30}>
                {data.map((value, index) => {
                    const barHeight = (value / maxValue) * chartHeight;
                    const x = 20 + index * (barWidth + 8);
                    const y = chartHeight - barHeight;

                    return (
                        <React.Fragment key={index}>
                            <Rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill={chartAccent} opacity={0.8} />
                            <SvgText x={x + barWidth / 2} y={chartHeight + 20} fill={colors.textTertiary} fontSize="10" textAnchor="middle">
                                {labels[index]}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>
        );
    };

    const renderLineChart = (data: number[], color: string = chartAccent) => {
        const chartHeight = 100;
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue || 1;

        const pathD = data
            .map((value, index) => {
                const x = 20 + (index / (data.length - 1)) * (chartWidth - 40);
                const y = chartHeight - ((value - minValue) / range) * (chartHeight - 20) - 10;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');

        return (
            <Svg width={chartWidth} height={chartHeight}>
                {[0, 1, 2].map(i => (
                    <Line key={i} x1={20} y1={10 + i * 40} x2={chartWidth - 20} y2={10 + i * 40} stroke={gridColor} strokeWidth={1} />
                ))}
                <Path d={pathD} stroke={color} strokeWidth={2} fill="none" />
                {data.map((value, index) => {
                    const x = 20 + (index / (data.length - 1)) * (chartWidth - 40);
                    const y = chartHeight - ((value - minValue) / range) * (chartHeight - 20) - 10;
                    return <Circle key={index} cx={x} cy={y} r={4} fill={color} />;
                })}
            </Svg>
        );
    };

    // --- Time Range Selector ---
    const renderTimeRangeSelector = () => (
        <View className="flex-row rounded-xl p-1 mb-4" style={{ backgroundColor: colors.backgroundSecondary }}>
            {(['week', 'month', 'quarter', 'year'] as TimeRange[]).map(range => (
                <TouchableOpacity
                    key={range}
                    onPress={() => setTimeRange(range)}
                    className="flex-1 py-2 rounded-lg"
                    style={timeRange === range ? { backgroundColor: colors.success } : {}}
                >
                    <Text
                        className="text-center"
                        style={{ color: timeRange === range ? '#fff' : colors.textSecondary, fontWeight: timeRange === range ? '600' : '400' }}
                    >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // --- Tab Selector ---
    const renderTabSelector = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {[
                { id: 'overview', label: 'Overview', icon: 'view-dashboard' },
                { id: 'velocity', label: 'Velocity', icon: 'speedometer' },
                { id: 'patterns', label: 'Patterns', icon: 'brain' },
            ].map(tab => (
                <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id as InsightsTab)}
                    className="flex-row items-center px-4 py-2 rounded-full mr-2"
                    style={{ backgroundColor: activeTab === tab.id ? colors.success : colors.backgroundSecondary }}
                >
                    <MaterialCommunityIcons
                        name={tab.icon as any}
                        size={18}
                        color={activeTab === tab.id ? '#fff' : colors.textTertiary}
                    />
                    <Text
                        className="ml-2"
                        style={{ color: activeTab === tab.id ? '#fff' : colors.textSecondary, fontWeight: activeTab === tab.id ? '600' : '400' }}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    // --- Overview Tab ---
    const renderOverviewTab = () => (
        <>
            {/* Key Metrics */}
            <View className="flex-row mb-4">
                <View className="flex-1 rounded-2xl p-4 mr-2" style={{ backgroundColor: colors.card }}>
                    <MaterialCommunityIcons name="speedometer" size={24} color={colors.success} />
                    <Text className="text-2xl font-bold mt-2" style={{ color: colors.text }}>
                        {velocityData?.averageCompleted || 38}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>Avg Velocity</Text>
                    <Text className="text-xs mt-1" style={{ color: colors.success }}>+12% vs last period</Text>
                </View>
                <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: colors.card }}>
                    <MaterialCommunityIcons name="percent" size={24} color="#3B82F6" />
                    <Text className="text-2xl font-bold mt-2" style={{ color: colors.text }}>87%</Text>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>Completion Rate</Text>
                    <Text className="text-xs mt-1" style={{ color: '#3B82F6' }}>+5% vs last period</Text>
                </View>
            </View>

            <View className="flex-row mb-4">
                <View className="flex-1 rounded-2xl p-4 mr-2" style={{ backgroundColor: colors.card }}>
                    <MaterialCommunityIcons name="fire" size={24} color="#F59E0B" />
                    <Text className="text-2xl font-bold mt-2" style={{ color: colors.text }}>14</Text>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>Day Streak</Text>
                </View>
                <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor: colors.card }}>
                    <MaterialCommunityIcons name="chart-donut" size={24} color="#A855F7" />
                    <Text className="text-2xl font-bold mt-2" style={{ color: colors.text }}>7.2</Text>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>Life Balance</Text>
                </View>
            </View>

            {/* Weekly Progress Chart */}
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-4" style={{ color: colors.text }}>Weekly Progress</Text>
                {renderBarChart(weeklyData, ['M', 'T', 'W', 'T', 'F', 'S', 'S'], 50)}
            </View>

            {/* Insights */}
            <View className="mb-4">
                <Text className="font-semibold mb-3" style={{ color: colors.text }}>Sprint Insights</Text>
                {insights.slice(0, 3).map((insight, idx) => (
                    <View
                        key={idx}
                        className="p-4 rounded-xl mb-2"
                        style={{
                            backgroundColor:
                                insight.type === 'positive'
                                    ? isDark ? 'rgba(16,185,129,0.2)' : '#ECFDF5'
                                    : insight.type === 'warning'
                                    ? isDark ? 'rgba(234,179,8,0.2)' : '#FFFBEB'
                                    : isDark ? 'rgba(59,130,246,0.2)' : '#EFF6FF',
                        }}
                    >
                        <View className="flex-row items-center mb-1">
                            <MaterialCommunityIcons
                                name={insight.icon as any}
                                size={18}
                                color={insight.type === 'positive' ? '#10B981' : insight.type === 'warning' ? '#EAB308' : '#3B82F6'}
                            />
                            <Text
                                className="font-semibold ml-2"
                                style={{
                                    color: insight.type === 'positive' ? '#10B981' : insight.type === 'warning' ? '#EAB308' : '#3B82F6',
                                }}
                            >
                                {insight.title}
                            </Text>
                        </View>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>{insight.description}</Text>
                    </View>
                ))}
            </View>
        </>
    );

    // --- Velocity Tab ---
    const renderVelocityTab = () => (
        <>
            {/* Velocity Trend */}
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-2" style={{ color: colors.text }}>Velocity Trend</Text>
                <Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>Points completed per sprint</Text>
                {renderLineChart(monthlyTrend, colors.success)}
                <View className="flex-row justify-between mt-4">
                    <View>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>Average</Text>
                        <Text className="font-semibold" style={{ color: colors.text }}>
                            {Math.round(monthlyTrend.reduce((a, b) => a + b) / monthlyTrend.length)}%
                        </Text>
                    </View>
                    <View>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>Peak</Text>
                        <Text className="font-semibold" style={{ color: colors.success }}>{Math.max(...monthlyTrend)}%</Text>
                    </View>
                    <View>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>Low</Text>
                        <Text className="font-semibold" style={{ color: colors.warning }}>{Math.min(...monthlyTrend)}%</Text>
                    </View>
                </View>
            </View>

            {/* Sprint Breakdown */}
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-4" style={{ color: colors.text }}>Sprint Breakdown</Text>
                {[
                    { label: 'Committed', value: 45, color: '#3B82F6' },
                    { label: 'Completed', value: 38, color: colors.success },
                    { label: 'Carried Over', value: 7, color: '#F59E0B' },
                ].map((item, idx) => (
                    <View key={idx} className="mb-3">
                        <View className="flex-row justify-between mb-1">
                            <Text style={{ color: colors.text }}>{item.label}</Text>
                            <Text style={{ color: item.color }}>{item.value} pts</Text>
                        </View>
                        <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary }}>
                            <View className="h-full rounded-full" style={{ width: `${(item.value / 45) * 100}%`, backgroundColor: item.color }} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Overcommitment History */}
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-4" style={{ color: colors.text }}>Overcommitment Frequency</Text>
                <View className="flex-row items-center mb-2">
                    <View className="flex-1 h-8 rounded-lg overflow-hidden flex-row" style={{ backgroundColor: colors.backgroundSecondary }}>
                        <View className="h-full" style={{ width: '70%', backgroundColor: colors.success }} />
                        <View className="h-full" style={{ width: '20%', backgroundColor: '#F59E0B' }} />
                        <View className="h-full" style={{ width: '10%', backgroundColor: '#EF4444' }} />
                    </View>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-xs" style={{ color: colors.success }}>On Track 70%</Text>
                    <Text className="text-xs" style={{ color: '#F59E0B' }}>Slightly Over 20%</Text>
                    <Text className="text-xs" style={{ color: '#EF4444' }}>Over 10%</Text>
                </View>
            </View>
        </>
    );

    // --- Patterns Tab ---
    const renderPatternsTab = () => (
        <>
            {/* Best Days */}
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-4" style={{ color: colors.text }}>Most Productive Days</Text>
                {[
                    { day: 'Tuesday', tasks: 8.2, color: colors.success },
                    { day: 'Wednesday', tasks: 7.8, color: colors.success },
                    { day: 'Monday', tasks: 6.5, color: '#3B82F6' },
                    { day: 'Thursday', tasks: 6.1, color: '#3B82F6' },
                    { day: 'Friday', tasks: 4.8, color: '#F59E0B' },
                    { day: 'Saturday', tasks: 3.2, color: '#F59E0B' },
                    { day: 'Sunday', tasks: 2.5, color: '#EF4444' },
                ].map((item, idx) => (
                    <View key={idx} className="flex-row items-center mb-2">
                        <Text className="w-24" style={{ color: colors.text }}>{item.day}</Text>
                        <View className="flex-1 h-4 rounded-full overflow-hidden mx-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                            <View className="h-full rounded-full" style={{ width: `${(item.tasks / 10) * 100}%`, backgroundColor: item.color }} />
                        </View>
                        <Text className="w-10 text-right" style={{ color: colors.textSecondary }}>{item.tasks}</Text>
                    </View>
                ))}
            </View>

            {/* Peak Hours */}
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-4" style={{ color: colors.text }}>Peak Hours</Text>
                <View className="flex-row justify-between">
                    {[
                        { time: 'Morning', icon: 'weather-sunny', value: 35, color: '#F59E0B' },
                        { time: 'Afternoon', icon: 'white-balance-sunny', value: 45, color: colors.success },
                        { time: 'Evening', icon: 'weather-night', value: 20, color: '#6366F1' },
                    ].map((item, idx) => (
                        <View key={idx} className="items-center">
                            <View className="w-16 h-16 rounded-full items-center justify-center mb-2" style={{ backgroundColor: item.color + '30' }}>
                                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                            </View>
                            <Text className="font-semibold" style={{ color: colors.text }}>{item.value}%</Text>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>{item.time}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Behavioral Patterns */}
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-4" style={{ color: colors.text }}>Behavioral Patterns</Text>
                {[
                    {
                        pattern: 'Task Batching',
                        description: 'You complete more when grouping similar tasks',
                        recommendation: 'Schedule focused blocks for each dimension',
                    },
                    {
                        pattern: 'Recovery Needed',
                        description: 'Productivity drops after 5+ high-intensity days',
                        recommendation: 'Plan lighter days every 5th day',
                    },
                    {
                        pattern: 'Social Boost',
                        description: 'Completion rate 20% higher on accountability days',
                        recommendation: 'Share goals with your support circle',
                    },
                ].map((item, idx) => (
                    <View key={idx} className="mb-4 p-3 rounded-xl" style={{ backgroundColor: colors.backgroundSecondary }}>
                        <Text className="font-semibold" style={{ color: colors.text }}>{item.pattern}</Text>
                        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>{item.description}</Text>
                        <View className="flex-row items-center mt-2">
                            <MaterialCommunityIcons name="lightbulb" size={14} color="#F59E0B" />
                            <Text className="text-xs ml-1" style={{ color: '#F59E0B' }}>{item.recommendation}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </>
    );

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-xl font-semibold" style={{ color: colors.text }}>Sprint Insights</Text>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {renderTimeRangeSelector()}
                {renderTabSelector()}

                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'velocity' && renderVelocityTab()}
                {activeTab === 'patterns' && renderPatternsTab()}
            </ScrollView>
        </SafeAreaView>
    );
}
