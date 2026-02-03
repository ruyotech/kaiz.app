import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePomodoroStore, PomodoroSession } from '../../../store/pomodoroStore';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';

type TimeRange = 'today' | 'week' | 'month' | 'all';

interface DailyStats {
  date: string;
  focusMinutes: number;
  sessionsCompleted: number;
}

export default function FocusAnalyticsScreen() {
  const router = useRouter();
  const { colors, isDark } = useThemeContext();
  const { t } = useTranslation();
  const { sessions, getTotalFocusTime, loadSettings } = usePomodoroStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  // Filter sessions based on time range
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return (sessions || []).filter((session) => {
      if (!session.completedAt) return false;
      const sessionDate = new Date(session.completedAt);
      
      switch (timeRange) {
        case 'today':
          return sessionDate >= today;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return sessionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return sessionDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [sessions, timeRange]);

  // Calculate stats
  const stats = useMemo(() => {
    const focusSessions = filteredSessions.filter(s => s.mode === 'focus' && !s.interrupted);
    const totalFocusMinutes = Math.floor(focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
    const totalSessions = focusSessions.length;
    const averageSessionMinutes = totalSessions > 0 ? Math.floor(totalFocusMinutes / totalSessions) : 0;
    const interruptedSessions = filteredSessions.filter(s => s.mode === 'focus' && s.interrupted).length;
    const completionRate = totalSessions + interruptedSessions > 0 
      ? Math.round((totalSessions / (totalSessions + interruptedSessions)) * 100) 
      : 0;

    return {
      totalFocusMinutes,
      totalSessions,
      averageSessionMinutes,
      interruptedSessions,
      completionRate,
    };
  }, [filteredSessions]);

  // Calculate daily stats for chart
  const dailyStats = useMemo(() => {
    const days: Record<string, DailyStats> = {};
    const daysToShow = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    
    // Initialize days
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days[dateStr] = { date: dateStr, focusMinutes: 0, sessionsCompleted: 0 };
    }

    // Fill in session data
    filteredSessions.filter(s => s.mode === 'focus' && !s.interrupted).forEach(session => {
      const dateStr = session.completedAt.split('T')[0];
      if (days[dateStr]) {
        days[dateStr].focusMinutes += Math.floor((session.duration || 0) / 60);
        days[dateStr].sessionsCompleted += 1;
      }
    });

    return Object.values(days).reverse();
  }, [filteredSessions, timeRange]);

  // Find max for chart scaling
  const maxMinutes = Math.max(...dailyStats.map(d => d.focusMinutes), 30);

  // Get top tasks by focus time
  const topTasks = useMemo(() => {
    const taskMap: Record<string, { title: string; minutes: number; sessions: number }> = {};
    
    filteredSessions.filter(s => s.mode === 'focus' && s.taskId && !s.interrupted).forEach(session => {
      const key = session.taskId!;
      if (!taskMap[key]) {
        taskMap[key] = { title: session.taskTitle || 'Unknown Task', minutes: 0, sessions: 0 };
      }
      taskMap[key].minutes += Math.floor((session.duration || 0) / 60);
      taskMap[key].sessions += 1;
    });

    return Object.entries(taskMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);
  }, [filteredSessions]);

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === 'today') return 'Today';
    if (timeRange === 'week') {
      return date.toLocaleDateString('en', { weekday: 'short' });
    }
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  return (
    <Container safeArea={false}>
      <ScreenHeader
        title={t('navigation.moreMenu.focusAnalytics')}
        subtitle="Deep work insights"
        useSafeArea={false}
      />

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Time Range Selector */}
        <View className="flex-row mb-4" style={{ gap: 8 }}>
          {(['today', 'week', 'month', 'all'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              className="flex-1 py-2 rounded-lg items-center"
              style={{
                backgroundColor: timeRange === range 
                  ? colors.primary 
                  : colors.backgroundSecondary,
              }}
            >
              <Text
                className="text-sm font-medium capitalize"
                style={{
                  color: timeRange === range ? '#fff' : colors.textSecondary,
                }}
              >
                {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View className="flex-row flex-wrap mb-4" style={{ gap: 12 }}>
          <View className="flex-1 min-w-[140px]">
            <Card className="p-4">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                <Text className="text-xs ml-2" style={{ color: colors.textSecondary }}>Total Focus</Text>
              </View>
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {formatMinutes(stats.totalFocusMinutes)}
              </Text>
            </Card>
          </View>
          <View className="flex-1 min-w-[140px]">
            <Card className="p-4">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="counter" size={20} color="#10B981" />
                <Text className="text-xs ml-2" style={{ color: colors.textSecondary }}>Sessions</Text>
              </View>
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {stats.totalSessions}
              </Text>
            </Card>
          </View>
          <View className="flex-1 min-w-[140px]">
            <Card className="p-4">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="timer-sand" size={20} color="#F59E0B" />
                <Text className="text-xs ml-2" style={{ color: colors.textSecondary }}>Avg Session</Text>
              </View>
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {formatMinutes(stats.averageSessionMinutes)}
              </Text>
            </Card>
          </View>
          <View className="flex-1 min-w-[140px]">
            <Card className="p-4">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="check-circle" size={20} color="#8B5CF6" />
                <Text className="text-xs ml-2" style={{ color: colors.textSecondary }}>Completion</Text>
              </View>
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {stats.completionRate}%
              </Text>
            </Card>
          </View>
        </View>

        {/* Focus Time Chart */}
        <Card className="p-4 mb-4">
          <Text className="text-base font-bold mb-4" style={{ color: colors.text }}>
            Focus Time Trend
          </Text>
          <View className="flex-row items-end justify-between" style={{ height: 120 }}>
            {dailyStats.slice(-(timeRange === 'month' ? 14 : 7)).map((day, index) => {
              const height = maxMinutes > 0 ? (day.focusMinutes / maxMinutes) * 100 : 0;
              return (
                <View key={day.date} className="flex-1 items-center mx-0.5">
                  <View
                    className="w-full rounded-t-sm"
                    style={{
                      height: Math.max(height, 4),
                      backgroundColor: day.focusMinutes > 0 ? colors.primary : colors.backgroundSecondary,
                    }}
                  />
                  <Text className="text-[9px] mt-1" style={{ color: colors.textTertiary }}>
                    {formatDayLabel(day.date)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Top Tasks */}
        <Card className="p-4 mb-6">
          <Text className="text-base font-bold mb-4" style={{ color: colors.text }}>
            Top Tasks by Focus Time
          </Text>
          {topTasks.length === 0 ? (
            <View className="items-center py-4">
              <MaterialCommunityIcons name="timer-off" size={32} color={colors.textTertiary} />
              <Text className="text-sm mt-2" style={{ color: colors.textSecondary }}>
                No focus sessions yet
              </Text>
            </View>
          ) : (
            topTasks.map((task, index) => (
              <View 
                key={task.id} 
                className="flex-row items-center py-3"
                style={{ borderTopWidth: index > 0 ? 1 : 0, borderTopColor: colors.border }}
              >
                <View 
                  className="w-6 h-6 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.backgroundSecondary }}
                >
                  <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium" style={{ color: colors.text }} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    {task.sessions} sessions
                  </Text>
                </View>
                <Text className="text-sm font-bold" style={{ color: colors.primary }}>
                  {formatMinutes(task.minutes)}
                </Text>
              </View>
            ))
          )}
        </Card>

        {/* Quick Actions */}
        <View className="flex-row mb-6" style={{ gap: 12 }}>
          <TouchableOpacity
            className="flex-1 p-3 rounded-lg items-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
            onPress={() => router.push('/(tabs)/pomodoro/history' as any)}
          >
            <MaterialCommunityIcons name="history" size={20} color={colors.textSecondary} />
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>View History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 p-3 rounded-lg items-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
            onPress={() => router.push('/(tabs)/pomodoro/settings' as any)}
          >
            <MaterialCommunityIcons name="cog-outline" size={20} color={colors.textSecondary} />
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 p-3 rounded-lg items-center"
            style={{ backgroundColor: colors.primary }}
            onPress={() => router.push('/(tabs)/pomodoro' as any)}
          >
            <MaterialCommunityIcons name="play" size={20} color="#fff" />
            <Text className="text-xs mt-1 text-white">Start Focus</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}
