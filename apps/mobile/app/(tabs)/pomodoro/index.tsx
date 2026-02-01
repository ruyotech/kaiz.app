import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePomodoroStore } from '../../../store/pomodoroStore';
import { useNavigationStore } from '../../../store/navigationStore';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import Timer from '../../../components/pomodoro/Timer';
import SessionControls from '../../../components/pomodoro/SessionControls';
import TaskQuickPick from '../../../components/pomodoro/TaskQuickPick';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemeContext } from '../../../providers/ThemeProvider';

export default function PomodoroScreen() {
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const { colors, isDark } = useThemeContext();
  const {
    isActive,
    isPaused,
    mode,
    timeRemaining,
    currentTaskTitle,
    sessionsCompleted,
    sessionsUntilLongBreak,
    startSession,
    stopSession,
    loadSettings,
  } = usePomodoroStore();

  const { setCurrentApp } = useNavigationStore();
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    id: string;
    title: string;
    description: string;
    storyPoints: number;
    quadrant: string;
  } | null>(null);
  const [returnToTask, setReturnToTask] = useState<string | null>(null);

  useEffect(() => {
    setCurrentApp('pomodoro');
    loadSettings();
    
    // Auto-start focus session if params are provided from task view
    if (params.taskId && params.taskTitle && !isActive) {
      const taskDetails = {
        description: params.taskDescription as string || '',
        storyPoints: parseInt(params.taskStoryPoints as string) || 0,
        quadrant: params.taskQuadrant as string || '',
      };
      handleStartFocus(
        params.taskId as string,
        params.taskTitle as string,
        taskDetails
      );
      if (params.returnTo === 'task') {
        setReturnToTask(params.taskId as string);
      }
    }
  }, [params.taskId]);

  const handleStartFocus = (
    taskId: string | null,
    taskTitle: string | null,
    taskDetails?: { description: string; storyPoints: number; quadrant: string }
  ) => {
    if (taskId && taskDetails) {
      setSelectedTask({
        id: taskId,
        title: taskTitle || '',
        description: taskDetails.description,
        storyPoints: taskDetails.storyPoints,
        quadrant: taskDetails.quadrant,
      });
    }
    startSession(taskId, taskTitle, 'focus');
    setShowTaskPicker(false);
  };

  const handleStopSession = () => {
    Alert.alert(
      t('pomodoro.stopSession'),
      t('pomodoro.stopSessionMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('pomodoro.stop'),
          style: 'destructive',
          onPress: () => stopSession(),
        },
      ]
    );
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'focus':
        return t('pomodoro.focusSession');
      case 'shortBreak':
        return t('pomodoro.shortBreak');
      case 'longBreak':
        return t('pomodoro.longBreak');
      default:
        return t('pomodoro.pomodoroTimer');
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'focus':
        return '#10B981'; // green
      case 'shortBreak':
        return '#3B82F6'; // blue
      case 'longBreak':
        return '#8B5CF6'; // purple
      default:
        return '#64748B'; // gray
    }
  };

  const getNextModeText = () => {
    if (mode === 'focus') {
      return sessionsUntilLongBreak === 1 ? t('pomodoro.longBreak') : t('pomodoro.shortBreak');
    }
    return t('pomodoro.focusSession');
  };

  const getQuadrantColor = (quadrantId: string) => {
    switch (quadrantId) {
      case 'q1':
        return '#EF4444';
      case 'q2':
        return '#10B981';
      case 'q3':
        return '#F59E0B';
      case 'q4':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader
        title={t('pomodoro.title')}
        subtitle={t('pomodoro.subtitle')}
      />

      <ScrollView 
        className="flex-1 p-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Session Controls */}
        {isActive && selectedTask ? (
          <View>
            {/* Selected Task Card - Compact & Clickable */}
            <TouchableOpacity 
              className="mb-4 rounded-lg p-3 border-l-4 shadow-sm" 
              style={{ 
                borderLeftColor: getQuadrantColor(selectedTask.quadrant),
                backgroundColor: colors.card
              }}
              onPress={() => router.push(`/(tabs)/sdlc/task/${selectedTask.id}` as any)}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-lg font-bold flex-1" style={{ color: colors.text }} numberOfLines={2}>
                  {selectedTask.title}
                </Text>
                <View className="flex-row items-center gap-2">
                  <View 
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>{selectedTask.storyPoints} pts</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </View>
              </View>
              {selectedTask.description && (
                <Text className="text-sm" style={{ color: colors.textSecondary }} numberOfLines={2}>
                  {selectedTask.description}
                </Text>
              )}
            </TouchableOpacity>

            {/* Timer Display */}
            <Timer timeRemaining={timeRemaining} mode={mode} isPaused={isPaused} />

            {/* Session Controls */}
            <SessionControls />

            {/* Action Buttons */}
            <View className="mt-3" style={{ gap: 8 }}>
              {/* Back to Task Button - Show if returnToTask is set */}
              {returnToTask && (
                <TouchableOpacity
                  className="rounded-lg p-2.5 flex-row items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }}
                  onPress={() => router.push(`/(tabs)/sdlc/task/${returnToTask}` as any)}
                >
                  <MaterialCommunityIcons name="arrow-left" size={18} color={colors.primary} />
                  <Text className="text-sm font-semibold ml-2" style={{ color: colors.primary }}>{t('pomodoro.backToTask')}</Text>
                </TouchableOpacity>
              )}
              
              {/* Stop Button */}
              <TouchableOpacity
                className="rounded-lg p-2.5 flex-row items-center justify-center"
                style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }}
                onPress={handleStopSession}
              >
                <MaterialCommunityIcons name="stop-circle" size={18} color={colors.error} />
                <Text className="text-sm font-semibold ml-2" style={{ color: colors.error }}>{t('pomodoro.endSession')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isActive ? (
          <View>
            {/* Fallback for break timers */}
            <Card className="mb-4">
              <View className="flex-row items-center mb-2">
                <View
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getModeColor() }}
                />
                <Text className="text-xl font-semibold" style={{ color: colors.text }}>{getModeLabel()}</Text>
              </View>
            </Card>

            <Timer timeRemaining={timeRemaining} mode={mode} isPaused={isPaused} />
            <SessionControls />
          </View>
        ) : (
          <View>
            {/* Task Selection Required */}
            <View 
              className="rounded-xl p-4 mb-4 flex-row items-center"
              style={{ 
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'
              }}
            >
              <MaterialCommunityIcons name="information" size={24} color={colors.primary} />
              <Text className="text-sm ml-3 flex-1" style={{ color: colors.primary }}>
                {t('pomodoro.selectTaskInfo')}
              </Text>
            </View>

            <TaskQuickPick onSelectTask={handleStartFocus} />

            <View className="flex-row mt-4" style={{ gap: 12 }}>
              <TouchableOpacity
                className="flex-1 rounded-lg p-3 items-center"
                style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }}
                onPress={() => startSession(null, null, 'shortBreak')}
              >
                <MaterialCommunityIcons name="coffee" size={20} color={colors.primary} />
                <Text className="text-sm font-medium mt-1" style={{ color: colors.primary }}>{t('pomodoro.shortBreak')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-lg p-3 items-center"
                style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#EDE9FE' }}
                onPress={() => startSession(null, null, 'longBreak')}
              >
                <MaterialCommunityIcons name="spa" size={20} color="#8B5CF6" />
                <Text className="text-sm font-medium mt-1" style={{ color: '#8B5CF6' }}>{t('pomodoro.longBreak')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
