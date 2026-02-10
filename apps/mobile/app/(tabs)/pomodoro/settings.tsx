import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { usePomodoroStore } from '../../../store/pomodoroStore';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';

export default function PomodoroSettings() {
  const {
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    autoStartBreaks,
    autoStartPomodoros,
    longBreakInterval,
    updateSettings,
  } = usePomodoroStore();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const adjustDuration = (
    type: 'focusDuration' | 'shortBreakDuration' | 'longBreakDuration',
    delta: number
  ) => {
    const current = usePomodoroStore.getState()[type];
    const newValue = Math.max(60, Math.min(3600, current + delta * 60)); // Min 1 min, max 60 min
    updateSettings({ [type]: newValue });
  };

  const adjustLongBreakInterval = (delta: number) => {
    const newValue = Math.max(2, Math.min(10, longBreakInterval + delta));
    updateSettings({ longBreakInterval: newValue });
  };

  return (
    <Container>
      <ScreenHeader title="Pomodoro Settings" subtitle="Configure your timer" showBack />

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Timer Durations */}
        <View className="mt-2">
          <Text className="text-gray-900 text-lg font-semibold mb-4">Timer Durations</Text>

          {/* Focus Duration */}
          <Card className="mb-3">
            <Text className="text-gray-600 text-sm mb-3">Focus Session</Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className="bg-gray-200 rounded-lg p-3 w-12 items-center"
                onPress={() => adjustDuration('focusDuration', -5)}
              >
                <Text className="text-gray-900 text-xl">−</Text>
              </TouchableOpacity>
              <Text className="text-gray-900 text-2xl font-semibold">
                {formatDuration(focusDuration)}
              </Text>
              <TouchableOpacity
                className="bg-gray-200 rounded-lg p-3 w-12 items-center"
                onPress={() => adjustDuration('focusDuration', 5)}
              >
                <Text className="text-gray-900 text-xl">+</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Short Break Duration */}
          <Card className="mb-3">
            <Text className="text-gray-600 text-sm mb-3">Short Break</Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className="bg-gray-200 rounded-lg p-3 w-12 items-center"
                onPress={() => adjustDuration('shortBreakDuration', -1)}
              >
                <Text className="text-gray-900 text-xl">−</Text>
              </TouchableOpacity>
              <Text className="text-gray-900 text-2xl font-semibold">
                {formatDuration(shortBreakDuration)}
              </Text>
              <TouchableOpacity
                className="bg-gray-200 rounded-lg p-3 w-12 items-center"
                onPress={() => adjustDuration('shortBreakDuration', 1)}
              >
                <Text className="text-gray-900 text-xl">+</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Long Break Duration */}
          <Card className="mb-3">
            <Text className="text-gray-600 text-sm mb-3">Long Break</Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className="bg-gray-200 rounded-lg p-3 w-12 items-center"
                onPress={() => adjustDuration('longBreakDuration', -5)}
              >
                <Text className="text-gray-900 text-xl">−</Text>
              </TouchableOpacity>
              <Text className="text-gray-900 text-2xl font-semibold">
                {formatDuration(longBreakDuration)}
              </Text>
              <TouchableOpacity
                className="bg-gray-200 rounded-lg p-3 w-12 items-center"
                onPress={() => adjustDuration('longBreakDuration', 5)}
              >
                <Text className="text-gray-900 text-xl">+</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Long Break Interval */}
          <Card>
            <Text className="text-gray-600 text-sm mb-3">Long Break After</Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className="bg-gray-200 rounded-lg p-3 w-12 items-center"
                onPress={() => adjustLongBreakInterval(-1)}
              >
                <Text className="text-gray-900 text-xl">−</Text>
              </TouchableOpacity>
              <Text className="text-gray-900 text-2xl font-semibold">
                {longBreakInterval} sessions
              </Text>
              <TouchableOpacity
                className="bg-gray-200 rounded-lg p-3 w-12 items-center"
                onPress={() => adjustLongBreakInterval(1)}
              >
                <Text className="text-gray-900 text-xl">+</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Auto-Start Options */}
        <View className="mt-8">
          <Text className="text-gray-900 text-lg font-semibold mb-4">Auto-Start</Text>

          <Card className="mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-gray-900 text-base mb-1">Auto-Start Breaks</Text>
                <Text className="text-gray-600 text-sm">
                  Automatically start break timers after focus sessions
                </Text>
              </View>
              <Toggle
                enabled={autoStartBreaks}
                onToggle={() => updateSettings({ autoStartBreaks: !autoStartBreaks })}
              />
            </View>
          </Card>

          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-gray-900 text-base mb-1">Auto-Start Pomodoros</Text>
                <Text className="text-gray-600 text-sm">
                  Automatically start focus sessions after breaks
                </Text>
              </View>
              <Toggle
                enabled={autoStartPomodoros}
                onToggle={() => updateSettings({ autoStartPomodoros: !autoStartPomodoros })}
              />
            </View>
          </Card>
        </View>

        {/* Info */}
        <View className="mt-8 mb-8 bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
          <Text className="text-blue-400 text-sm leading-6">
            The Pomodoro Technique uses 25-minute focused work sessions followed by short breaks
            to maintain productivity and prevent burnout.
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
