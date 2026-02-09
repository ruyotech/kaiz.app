import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../providers/ThemeProvider';
import type { TaskStatus } from '../../types/models';

export type StatusTab = TaskStatus;

interface StatusTabConfig {
    key: StatusTab;
    label: string;
    icon: string;
    activeColor: string;
    activeBg: string;
}

const TAB_CONFIG: StatusTabConfig[] = [
    { key: 'todo', label: 'To Do', icon: 'checkbox-blank-circle-outline', activeColor: '#6B7280', activeBg: 'rgba(107,114,128,0.12)' },
    { key: 'in_progress', label: 'Active', icon: 'progress-clock', activeColor: '#2563EB', activeBg: 'rgba(37,99,235,0.12)' },
    { key: 'done', label: 'Done', icon: 'check-circle', activeColor: '#16A34A', activeBg: 'rgba(22,163,74,0.12)' },
    { key: 'blocked', label: 'Blocked', icon: 'alert-circle', activeColor: '#DC2626', activeBg: 'rgba(220,38,38,0.12)' },
];

interface StatusTabBarProps {
    activeTab: StatusTab;
    onTabChange: (tab: StatusTab) => void;
    counts: Record<StatusTab, number>;
}

export const StatusTabBar = React.memo(function StatusTabBar({
    activeTab,
    onTabChange,
    counts,
}: StatusTabBarProps) {
    const { colors, isDark } = useThemeContext();

    const renderTab = useCallback((config: StatusTabConfig) => {
        const isActive = activeTab === config.key;
        const count = counts[config.key] ?? 0;

        return (
            <TouchableOpacity
                key={config.key}
                onPress={() => onTabChange(config.key)}
                className="flex-row items-center rounded-xl px-3.5 py-2 mr-2"
                style={{
                    backgroundColor: isActive
                        ? (isDark ? config.activeColor + '25' : config.activeBg)
                        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    borderWidth: isActive ? 1.5 : 1,
                    borderColor: isActive
                        ? config.activeColor + (isDark ? '60' : '40')
                        : 'transparent',
                }}
                activeOpacity={0.7}
            >
                <MaterialCommunityIcons
                    name={config.icon as any}
                    size={16}
                    color={isActive ? config.activeColor : colors.textTertiary}
                />
                <Text
                    className="text-xs font-semibold ml-1.5"
                    style={{
                        color: isActive ? config.activeColor : colors.textSecondary,
                    }}
                >
                    {config.label}
                </Text>
                {count > 0 && (
                    <View
                        className="ml-1.5 rounded-full px-1.5 min-w-[20px] items-center"
                        style={{
                            backgroundColor: isActive
                                ? config.activeColor + '20'
                                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'),
                        }}
                    >
                        <Text
                            className="text-[10px] font-bold"
                            style={{
                                color: isActive ? config.activeColor : colors.textTertiary,
                            }}
                        >
                            {count}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [activeTab, counts, colors, isDark, onTabChange]);

    return (
        <View
            className="px-4 py-2.5"
            style={{
                backgroundColor: colors.background,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
            }}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
            >
                {TAB_CONFIG.map(renderTab)}
            </ScrollView>
        </View>
    );
});

export default StatusTabBar;
