/**
 * MetricCard — Reusable card that shows a single KPI value
 * with a label, icon, and optional trend indicator.
 */
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../providers/ThemeProvider';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export const MetricCard = React.memo(function MetricCard({
  label,
  value,
  icon,
  iconColor,
  subtitle,
  trend,
  trendValue,
}: MetricCardProps) {
  const { colors } = useThemeContext();

  const trendConfig = {
    up: { icon: 'arrow-up', color: '#10B981' },
    down: { icon: 'arrow-down', color: '#EF4444' },
    stable: { icon: 'minus', color: '#6B7280' },
  };
  const trendInfo = trend ? trendConfig[trend] : null;
  const resolvedIconColor = iconColor ?? colors.primary;

  return (
    <View
      className="flex-1 rounded-2xl p-4"
      style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row items-center mb-2">
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: `${resolvedIconColor}15` }}
        >
          <MaterialCommunityIcons name={icon as any} size={16} color={resolvedIconColor} />
        </View>
        <Text className="text-xs" style={{ color: colors.textSecondary }} numberOfLines={1}>
          {label}
        </Text>
      </View>

      <Text className="text-2xl font-bold" style={{ color: colors.text }}>
        {value}
      </Text>

      {(subtitle || trendInfo) && (
        <View className="flex-row items-center mt-1">
          {trendInfo && (
            <View className="flex-row items-center mr-1">
              <MaterialCommunityIcons
                name={trendInfo.icon as any}
                size={12}
                color={trendInfo.color}
              />
              {trendValue && (
                <Text className="text-xs ml-0.5" style={{ color: trendInfo.color }}>
                  {trendValue}
                </Text>
              )}
            </View>
          )}
          {subtitle && (
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
});
