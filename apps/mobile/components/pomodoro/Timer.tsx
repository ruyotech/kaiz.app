import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../providers/ThemeProvider';

interface TimerProps {
  timeRemaining: number;
  mode: 'focus' | 'shortBreak' | 'longBreak' | 'idle';
  isPaused: boolean;
}

export default function Timer({ timeRemaining, mode, isPaused }: TimerProps) {
  const { colors, isDark } = useThemeContext();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundType, setSoundType] = useState<'tick' | 'none'>('none');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      mins: mins.toString().padStart(2, '0'),
      secs: secs.toString().padStart(2, '0')
    };
  };

  const getModeConfig = () => {
    if (isPaused) {
      return {
        bgColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
        icon: 'pause-circle',
        iconColor: '#F59E0B',
        textColor: isDark ? '#FCD34D' : '#92400E',
        label: 'Paused'
      };
    }
    switch (mode) {
      case 'focus':
        return {
          bgColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
          icon: 'brain',
          iconColor: '#10B981',
          textColor: isDark ? '#6EE7B7' : '#065F46',
          label: 'Focus'
        };
      case 'shortBreak':
        return {
          bgColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
          icon: 'coffee',
          iconColor: '#3B82F6',
          textColor: isDark ? '#93C5FD' : '#1E40AF',
          label: 'Short Break'
        };
      case 'longBreak':
        return {
          bgColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#EDE9FE',
          icon: 'spa',
          iconColor: '#8B5CF6',
          textColor: isDark ? '#C4B5FD' : '#5B21B6',
          label: 'Long Break'
        };
      default:
        return {
          bgColor: colors.backgroundSecondary,
          icon: 'timer-outline',
          iconColor: colors.textSecondary,
          textColor: colors.text,
          label: 'Idle'
        };
    }
  };

  const toggleSound = () => {
    if (soundEnabled) {
      setSoundEnabled(false);
      setSoundType('none');
    } else {
      setSoundEnabled(true);
      setSoundType('tick');
    }
  };

  const config = getModeConfig();
  const time = formatTime(timeRemaining);

  return (
    <View className="items-center my-6">
      {/* Main Timer Circle */}
      <View 
        className="items-center justify-center rounded-full p-8 shadow-lg relative"
        style={{ 
          backgroundColor: config.bgColor,
          width: 280,
          height: 280
        }}
      >
        {/* Icon */}
        <View className="mb-2">
          <MaterialCommunityIcons 
            name={config.icon as any} 
            size={36} 
            color={config.iconColor} 
          />
        </View>
        
        {/* Time Display */}
        <View className="flex-row items-center justify-center">
          <Text 
            className="text-8xl font-bold tracking-tight"
            style={{ color: config.textColor }}
          >
            {time.mins}
          </Text>
          <Text 
            className="text-6xl font-bold mx-1"
            style={{ color: config.textColor, opacity: 0.5 }}
          >
            :
          </Text>
          <Text 
            className="text-8xl font-bold tracking-tight"
            style={{ color: config.textColor }}
          >
            {time.secs}
          </Text>
        </View>

        {/* Status Label */}
        <View className="mt-2 px-3 py-1 rounded-full" style={{ backgroundColor: config.iconColor + '20' }}>
          <Text 
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: config.iconColor }}
          >
            {config.label}
          </Text>
        </View>

        {/* Sound Toggle - Top Right Corner */}
        <TouchableOpacity
          className="absolute top-4 right-4 p-2 rounded-full"
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.7)' }}
          onPress={toggleSound}
        >
          <MaterialCommunityIcons 
            name={soundEnabled ? 'volume-high' : 'volume-off'} 
            size={20} 
            color={config.iconColor} 
          />
        </TouchableOpacity>
      </View>

      {/* Sound Type Indicator */}
      {soundEnabled && (
        <View className="mt-3 flex-row items-center gap-2">
          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
          <Text className="text-xs" style={{ color: colors.textSecondary }}>Tick sound enabled</Text>
        </View>
      )}
    </View>
  );
}
