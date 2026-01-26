import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePomodoroStore, PomodoroSession } from '../../../store/pomodoroStore';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { toLocaleDateStringLocalized, formatTimeLocalized } from '../../../utils/localizedDate';

type FilterType = 'all' | 'today' | 'week' | 'month';

export default function PomodoroHistory() {
  const { sessions, getTotalFocusTime, sessionsCompleted, sessionsUntilLongBreak } = usePomodoroStore();
  const [filter, setFilter] = useState<FilterType>('today');
  const [filteredSessions, setFilteredSessions] = useState<PomodoroSession[]>([]);

  useEffect(() => {
    filterSessions();
  }, [sessions, filter]);

  const filterSessions = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let filtered = [...sessions].reverse(); // Most recent first

    switch (filter) {
      case 'today':
        filtered = filtered.filter((s) => s.completedAt.startsWith(today));
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((s) => new Date(s.completedAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((s) => new Date(s.completedAt) >= monthAgo);
        break;
    }

    setFilteredSessions(filtered);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const timeStr = formatTimeLocalized(date);
    const dateStr = toLocaleDateStringLocalized(date, {
      month: 'short',
      day: 'numeric',
    });
    return { time: timeStr, date: dateStr };
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'focus':
        return '#10B981';
      case 'shortBreak':
        return '#3B82F6';
      case 'longBreak':
        return '#8B5CF6';
      default:
        return '#64748B';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'focus':
        return 'Focus';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return mode;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'focus':
        return 'brain';
      case 'shortBreak':
        return 'coffee';
      case 'longBreak':
        return 'spa';
      default:
        return 'timer';
    }
  };

  // Calculate stats
  const focusSessions = filteredSessions.filter((s) => s.mode === 'focus' && !s.interrupted);
  const totalFocusTime = focusSessions.reduce((sum, s) => sum + s.duration, 0);
  const completedSessions = filteredSessions.filter((s) => !s.interrupted).length;
  const interruptedSessions = filteredSessions.filter((s) => s.interrupted).length;

  const renderSession = ({ item }: { item: PomodoroSession }) => {
    const { time, date } = formatDateTime(item.completedAt);
    const modeColor = getModeColor(item.mode);

    return (
      <Card className="mb-3">
        <View className="flex-row items-start">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${modeColor}20` }}
          >
            <MaterialCommunityIcons name={getModeIcon(item.mode) as any} size={24} color={modeColor} />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 font-semibold">{getModeLabel(item.mode)}</Text>
              <Text className="text-gray-600 text-sm">{formatTime(item.duration)}</Text>
            </View>

            {item.taskTitle && (
              <Text className="text-gray-600 text-sm mb-1" numberOfLines={1}>
                {item.taskTitle}
              </Text>
            )}

            <View className="flex-row items-center justify-between">
              <Text className="text-gray-500 text-xs">
                {date} at {time}
              </Text>
              {item.interrupted && (
                <View className="bg-yellow-100 px-2 py-1 rounded">
                  <Text className="text-yellow-600 text-xs">Interrupted</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <Container>
      <ScreenHeader title="Focus History" subtitle="View your sessions" showBack />

      {/* Today's Progress - Prominent */}
      <View className="px-4 mt-4 mb-4">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <Text className="text-gray-900 text-lg font-semibold mb-4">Today's Progress</Text>
          <View className="flex-row items-center justify-between">
            <View className="items-center flex-1">
              <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" />
              <Text className="text-3xl font-bold text-gray-900 mt-2">{sessionsCompleted}</Text>
              <Text className="text-gray-600 text-sm">Completed</Text>
            </View>
            <View className="w-px h-16 bg-gray-300" />
            <View className="items-center flex-1">
              <MaterialCommunityIcons name="timer-sand" size={32} color="#3B82F6" />
              <Text className="text-3xl font-bold text-gray-900 mt-2">{sessionsUntilLongBreak}</Text>
              <Text className="text-gray-600 text-sm">Until break</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mt-4 mb-4" style={{ gap: 8 }}>
        {(['today', 'week', 'month', 'all'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            className={`px-4 py-2 rounded-lg ${
              filter === f ? 'bg-green-600' : 'bg-slate-800/50'
            }`}
            onPress={() => setFilter(f)}
          >
            <Text
              className={`text-sm font-medium capitalize ${
                filter === f ? 'text-white' : 'text-gray-400'
              }`}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Summary */}
      <View className="px-4 mb-4">
        <Card>
          <View className="flex-row justify-between mb-3">
            <View className="flex-1 items-center">
              <Text className="text-gray-600 text-xs mb-1">Focus Sessions</Text>
              <Text className="text-gray-900 text-2xl font-bold">{focusSessions.length}</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-gray-600 text-xs mb-1">Total Time</Text>
              <Text className="text-gray-900 text-2xl font-bold">
                {Math.floor(totalFocusTime / 60)}m
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-gray-600 text-xs mb-1">Completed</Text>
              <Text className="text-gray-900 text-2xl font-bold">{completedSessions}</Text>
            </View>
          </View>

          {interruptedSessions > 0 && (
            <View className="pt-3 border-t border-gray-200">
              <Text className="text-yellow-600 text-sm text-center">
                {interruptedSessions} interrupted session{interruptedSessions !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </Card>
      </View>

      {/* Session List */}
      {filteredSessions.length === 0 ? (
        <View className="flex-1 px-4 items-center justify-center">
          <MaterialCommunityIcons name="history" size={64} color="#D1D5DB" />
          <Text className="text-gray-900 text-lg font-semibold mt-4">No Sessions Yet</Text>
          <Text className="text-gray-600 text-center mt-2">
            You haven't completed any focus sessions {
              filter === 'today' ? 'today' : `in the past ${filter}`
            }.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
}
