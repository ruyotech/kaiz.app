import { logger } from '../../../utils/logger';
import { useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { addDays, subDays, isThisWeek, getDay, isSameDay } from 'date-fns';
import { getWeekNumber, getWeekStartDate } from '../../../utils/dateHelpers';
import { formatLocalized } from '../../../utils/localizedDate';
import { WeekHeader } from '../../../components/calendar/WeekHeader';
import { DayScheduleView } from '../../../components/calendar/DayScheduleView';
import { EnhancedTaskCard } from '../../../components/calendar/EnhancedTaskCard';
import { StatusTabBar, type StatusTab } from '../../../components/sprints/StatusTabBar';
import { SwipeableTaskCard } from '../../../components/sprints/SwipeableTaskCard';
import { CeremonyCard } from '../../../components/sprints/CeremonyCard';
import { FamilyScopeSwitcher } from '../../../components/family/FamilyScopeSwitcher';
import { Task, type TaskStatus } from '../../../types/models';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useFamilyStore } from '../../../store/familyStore';
import { useTaskStore } from '../../../store/taskStore';
import {
    useSprints,
    useCurrentSprint,
    useSprintTasks,
    useUpdateTaskStatus,
} from '../../../hooks/queries';
import { useEpics } from '../../../hooks/queries';
import { useLifeWheelAreas } from '../../../hooks/queries';

interface LifeWheelArea {
    id: string;
    displayId?: string;
    name: string;
    icon: string;
    color: string;
}

export default function SprintCalendar() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<StatusTab>('todo');
    const [viewType, setViewType] = useState<'day' | 'week'>('week');
    const [isMonthExpanded, setIsMonthExpanded] = useState(false);

    // Family state for scope filtering
    const currentFamily = useFamilyStore((state) => state.currentFamily);
    const fetchMyFamily = useFamilyStore((state) => state.fetchMyFamily);
    const currentViewScope = useTaskStore((state) => state.currentViewScope);
    const setViewScope = useTaskStore((state) => state.setViewScope);

    // Touch tracking for horizontal swipe (day view only)
    const touchStart = useRef({ x: 0, y: 0, time: 0 });
    const touchMove = useRef({ x: 0, y: 0 });

    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();

    // Determine dominant month for sprint name
    const weekStart = getWeekStartDate(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const monthCounts = weekDays.reduce((acc, day) => {
        const monthKey = formatLocalized(day, 'MMM-yyyy');
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const dominantMonth = Object.entries(monthCounts).reduce((max, [month, count]) =>
        count > max.count ? { month, count } : max,
        { month: formatLocalized(weekStart, 'MMM-yyyy'), count: 0 }
    );
    const [monthName, yearFromMonth] = dominantMonth.month.split('-');
    const sprintName = `S${currentWeek.toString().padStart(2, '0')}-${monthName}-${yearFromMonth}`;

    // ── Data fetching via TanStack Query ──────────────────────────────────────

    const { data: allSprints = [] } = useSprints(currentYear);
    const { data: activeSprint } = useCurrentSprint();

    // Find sprint matching this calendar week
    const matchedSprint = useMemo(() => {
        const weekMatch = allSprints.find((s: any) => s.weekNumber === currentWeek);
        // If week-matched sprint has no committed tasks and we're on current week,
        // fall back to active sprint
        if (weekMatch && !weekMatch.committedAt && isThisWeek(currentDate, { weekStartsOn: 0 })) {
            if (activeSprint && (activeSprint as any).committedAt) {
                return activeSprint;
            }
        }
        return weekMatch || (isThisWeek(currentDate, { weekStartsOn: 0 }) ? activeSprint : null);
    }, [allSprints, currentWeek, currentDate, activeSprint]);

    const sprintId = (matchedSprint as any)?.id ?? '';
    const { data: sprintTasks = [], isLoading: loading } = useSprintTasks(sprintId);
    const weekTasks = sprintTasks as Task[];

    const { data: epicsData = [] } = useEpics();
    const epics = epicsData as any[];

    const { data: lifeWheelAreasData = [] } = useLifeWheelAreas();
    const lifeWheelAreas = lifeWheelAreasData as LifeWheelArea[];

    // Status mutation for swipe-to-change
    const updateTaskStatusMutation = useUpdateTaskStatus();

    // Fetch family data on mount
    useFocusEffect(
        useCallback(() => {
            if (!currentFamily) fetchMyFamily();
        }, [currentFamily])
    );

    // ── Helpers ───────────────────────────────────────────────────────────────

    const shouldShowTaskOnDay = useCallback((task: Task, date: Date): boolean => {
        // One-off events: check eventStartTime date
        if (task.eventStartTime) {
            try {
                return isSameDay(new Date(task.eventStartTime), date);
            } catch {
                return false;
            }
        }
        // Target date tasks
        if (task.targetDate && !task.isRecurring) {
            try {
                return isSameDay(new Date(task.targetDate), date);
            } catch {
                return false;
            }
        }
        if (!task.isRecurring || !task.recurrence) return true;
        const freq = task.recurrence.frequency;
        const dayOfWeek = date.getDay();
        switch (freq) {
            case 'DAILY': return true;
            case 'WEEKLY':
            case 'BIWEEKLY': return task.recurrence.dayOfWeek === dayOfWeek;
            case 'MONTHLY': return task.recurrence.dayOfMonth === date.getDate();
            case 'YEARLY': {
                const yd = task.recurrence.yearlyDate;
                if (yd) {
                    const d = new Date(yd);
                    return d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
                }
                return false;
            }
            default: return true;
        }
    }, []);

    const getLifeWheelArea = useCallback((areaId: string) => {
        return lifeWheelAreas.find(a => a.id === areaId || a.displayId === areaId);
    }, [lifeWheelAreas]);

    const filterByViewScope = useCallback((tasks: Task[]): Task[] => {
        if (!currentFamily || currentViewScope === 'mine') {
            return tasks.filter(task => !task.familyId || task.visibility === 'private');
        }
        if (currentViewScope === 'family') {
            return tasks.filter(task =>
                task.familyId === currentFamily.id &&
                (task.visibility === 'shared' || task.visibility === 'assigned')
            );
        }
        if (currentViewScope.startsWith('child:')) {
            const childUserId = currentViewScope.replace('child:', '');
            return tasks.filter(task =>
                task.familyId === currentFamily.id &&
                task.assignedToUserId === childUserId
            );
        }
        return tasks;
    }, [currentFamily, currentViewScope]);

    // ── Derived data ──────────────────────────────────────────────────────────

    const scopeFilteredTasks = useMemo(() => filterByViewScope(weekTasks), [weekTasks, filterByViewScope]);

    const displayedTasks = useMemo(() => {
        return viewType === 'day'
            ? scopeFilteredTasks.filter(task => shouldShowTaskOnDay(task, currentDate))
            : scopeFilteredTasks;
    }, [scopeFilteredTasks, viewType, currentDate, shouldShowTaskOnDay]);

    // Status tab counts
    const tabCounts = useMemo(() => {
        const counts: Record<StatusTab, number> = {
            all: displayedTasks.length,
            draft: 0, todo: 0, in_progress: 0, done: 0, blocked: 0, pending_approval: 0,
        };
        displayedTasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
        return counts;
    }, [displayedTasks]);

    // Filtered by active tab
    const tabFilteredTasks = useMemo(() => {
        if (activeTab === 'all') return displayedTasks;
        return displayedTasks.filter(t => t.status === activeTab);
    }, [displayedTasks, activeTab]);

    // Sprint stats
    const isCurrentWeek = isThisWeek(currentDate, { weekStartsOn: 0 });
    const dayOfWeek = getDay(new Date());
    const isMidWeek = dayOfWeek >= 3 && dayOfWeek <= 5;
    const isSunday = dayOfWeek === 0;
    const sprintNotCommitted = isCurrentWeek && matchedSprint && !(matchedSprint as any).committedAt;
    const sprintEmpty = isCurrentWeek && matchedSprint && weekTasks.length === 0;
    const showPlanningNudge = sprintNotCommitted || sprintEmpty;

    const totalPoints = useMemo(() =>
        weekTasks.reduce((s, t) => s + (t.storyPoints || 0), 0), [weekTasks]);
    const donePoints = useMemo(() =>
        weekTasks.filter(t => t.status === 'done').reduce((s, t) => s + (t.storyPoints || 0), 0), [weekTasks]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleStatusChange = useCallback((taskId: string, newStatus: TaskStatus) => {
        updateTaskStatusMutation.mutate({ id: taskId, status: newStatus });
    }, [updateTaskStatusMutation]);

    const handleDatePress = useCallback((date: Date) => {
        setCurrentDate(date);
        setViewType('day');
        setIsMonthExpanded(false);
    }, []);

    const handleMonthSelect = useCallback((date: Date) => {
        setCurrentDate(date);
        setIsMonthExpanded(false);
    }, []);

    const toggleMonthExpansion = useCallback(() => {
        setIsMonthExpanded(prev => !prev);
    }, []);

    const handlePrevWeek = useCallback(() => setCurrentDate(d => subDays(d, 7)), []);
    const handleNextWeek = useCallback(() => setCurrentDate(d => addDays(d, 7)), []);

    // Touch handlers for horizontal swipe (day view only)
    const handleTouchStart = useCallback((e: any) => {
        const touch = e.nativeEvent.touches[0];
        touchStart.current = { x: touch.pageX, y: touch.pageY, time: Date.now() };
        touchMove.current = { x: touch.pageX, y: touch.pageY };
    }, []);

    const handleTouchMove = useCallback((e: any) => {
        const touch = e.nativeEvent.touches[0];
        touchMove.current = { x: touch.pageX, y: touch.pageY };
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (viewType === 'week') return;
        const deltaX = touchMove.current.x - touchStart.current.x;
        const deltaY = touchMove.current.y - touchStart.current.y;
        const deltaTime = Date.now() - touchStart.current.time;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 300) {
            if (deltaX > 0) handlePrevWeek();
            else handleNextWeek();
        }
    }, [viewType, handlePrevWeek, handleNextWeek]);

    // ── Render helpers ────────────────────────────────────────────────────────

    const renderPlanningNudge = () => {
        if (!showPlanningNudge || loading) return null;
        const isUrgent = isMidWeek;
        const nudgeColor = isUrgent ? '#EF4444' : '#3B82F6';
        const nudgeBg = isUrgent
            ? isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2'
            : isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF';

        return (
            <View
                className="mx-4 mt-4 rounded-2xl p-5 overflow-hidden"
                style={{ backgroundColor: nudgeBg, borderWidth: 1, borderColor: nudgeColor + '40' }}
            >
                <View className="flex-row items-center mb-3">
                    <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: nudgeColor + '20' }}
                    >
                        <MaterialCommunityIcons
                            name={isUrgent ? 'alert-circle' : isSunday ? 'calendar-star' : 'clipboard-text-play'}
                            size={24}
                            color={nudgeColor}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold" style={{ color: colors.text }}>
                            {isSunday ? '🌟 Sunday Planning Ceremony'
                                : isUrgent ? '⚠️ Sprint Not Planned Yet'
                                    : 'Plan Your Week'}
                        </Text>
                        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                            {sprintEmpty ? 'Your sprint is empty — add tasks to make progress this week.'
                                : isUrgent ? "It's mid-week and your sprint isn't committed."
                                    : 'Select tasks from your backlog, templates, or create new ones.'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/sprints/planning' as any)}
                    className="flex-row items-center justify-center py-3 rounded-xl"
                    style={{ backgroundColor: nudgeColor }}
                >
                    <MaterialCommunityIcons name="rocket-launch" size={18} color="#fff" />
                    <Text className="text-white font-semibold ml-2">
                        {isSunday ? 'Start Planning Ceremony' : 'Open Sprint Planning'}
                    </Text>
                </TouchableOpacity>
                {weekTasks.length > 0 && !(matchedSprint as any)?.committedAt && (
                    <Text className="text-xs text-center mt-2" style={{ color: colors.textTertiary }}>
                        You have {weekTasks.length} task{weekTasks.length !== 1 ? 's' : ''} but haven't committed the sprint yet.
                    </Text>
                )}
            </View>
        );
    };

    const renderSprintProgressBar = () => {
        if (!isCurrentWeek || !(matchedSprint as any)?.committedAt || loading) return null;
        const progress = totalPoints > 0 ? donePoints / totalPoints : 0;

        return (
            <View
                className="mx-4 mt-3 px-4 py-3 rounded-xl"
                style={{
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
                    borderWidth: 1,
                    borderColor: isDark ? '#10B98130' : '#A7F3D0',
                }}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
                        <Text className="ml-1.5 text-sm font-semibold" style={{ color: '#10B981' }}>
                            Sprint Committed
                        </Text>
                    </View>
                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                        {donePoints}/{totalPoints} pts • {weekTasks.length} tasks
                    </Text>
                </View>
                {/* Progress bar */}
                <View
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#D1FAE5' }}
                >
                    <View
                        className="h-full rounded-full"
                        style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: '#10B981' }}
                    />
                </View>
            </View>
        );
    };

    const renderTaskList = () => {
        if (tabFilteredTasks.length === 0) {
            const emptyMessage = activeTab === 'all'
                ? t('calendar.noTasksSprint')
                : `No ${activeTab.replace('_', ' ')} tasks`;
            return (
                <View className="items-center justify-center py-16">
                    <MaterialCommunityIcons
                        name={activeTab === 'done' ? 'check-circle-outline' :
                            activeTab === 'blocked' ? 'alert-circle-outline' :
                                'clipboard-text-outline'}
                        size={56}
                        color={colors.textTertiary}
                    />
                    <Text className="text-sm mt-3" style={{ color: colors.textTertiary }}>
                        {emptyMessage}
                    </Text>
                    {isCurrentWeek && activeTab === 'all' && (
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/sprints/planning' as any)}
                            className="mt-4 px-6 py-3 rounded-xl"
                            style={{ backgroundColor: colors.primary }}
                        >
                            <Text className="text-white font-semibold">Plan This Sprint</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        return (
            <View className="px-4 pt-3 pb-8">
                {tabFilteredTasks.map((task) => {
                    const taskEpic = epics.find(e => e.id === task.epicId);
                    const lifeWheelArea = getLifeWheelArea(task.lifeWheelAreaId);
                    const hideStatus = activeTab !== 'all';

                    return (
                        <SwipeableTaskCard
                            key={task.id}
                            taskId={task.id}
                            currentStatus={task.status}
                            onStatusChange={handleStatusChange}
                        >
                            <EnhancedTaskCard
                                task={task}
                                epic={taskEpic}
                                lifeWheelArea={lifeWheelArea}
                                onPress={() => router.push(`/(tabs)/sprints/task/${task.id}` as any)}
                                hideStatusBadge={hideStatus}
                            />
                        </SwipeableTaskCard>
                    );
                })}
            </View>
        );
    };

    // ── Main Render ───────────────────────────────────────────────────────────

    return (
        <View
            className="flex-1"
            style={{ backgroundColor: colors.background }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header Layer */}
            <View style={{ zIndex: 20 }}>
                <WeekHeader
                    currentDate={currentDate}
                    sprintName={sprintName}
                    onDatePress={handleDatePress}
                    isExpanded={isMonthExpanded}
                    onSprintNamePress={toggleMonthExpansion}
                    onMonthSelect={handleMonthSelect}
                    viewType={viewType}
                    sprintStartDate={(matchedSprint as any)?.startDate}
                    sprintEndDate={(matchedSprint as any)?.endDate}
                    toggleElement={
                        <View className="flex-row items-center gap-2">
                            {currentFamily && (
                                <FamilyScopeSwitcher
                                    variant="compact"
                                    value={currentViewScope}
                                    onChange={setViewScope}
                                />
                            )}
                            <TouchableOpacity
                                onPress={() => setViewType(viewType === 'week' ? 'day' : 'week')}
                                className="px-3 py-1.5 rounded-lg"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.4)',
                                }}
                            >
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons
                                        name={viewType === 'week' ? 'view-week-outline' : 'calendar-today'}
                                        size={14}
                                        color="#fff"
                                    />
                                    <Text className="text-white text-xs font-semibold ml-1">
                                        {viewType === 'week' ? t('calendar.weekly') : t('calendar.daily')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>

            {/* Overlay for expanded month */}
            {isMonthExpanded && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setIsMonthExpanded(false)}
                    className="absolute inset-0"
                    style={{ zIndex: 10, backgroundColor: colors.overlay }}
                />
            )}

            {/* Content */}
            <View className="flex-1" style={{ zIndex: 1 }}>
                {viewType === 'day' ? (
                    <DayScheduleView
                        currentDate={currentDate}
                        tasks={weekTasks}
                        epics={epics}
                        lifeWheelAreas={lifeWheelAreas}
                        onTaskPress={(taskId) => router.push(`/(tabs)/sprints/task/${taskId}` as any)}
                    />
                ) : (
                    <>
                        {/* Status Tab Bar — sticky below header */}
                        <StatusTabBar
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            counts={tabCounts}
                        />

                        <ScrollView className="flex-1">
                            {renderPlanningNudge()}
                            {renderSprintProgressBar()}

                            {/* Sunday Ceremony Cards */}
                            {isSunday && isCurrentWeek && !showPlanningNudge && (
                                <View className="px-4 mt-4">
                                    <Text className="text-xs uppercase tracking-wide mb-2" style={{ color: colors.textTertiary }}>
                                        Today's Ceremonies
                                    </Text>
                                    <CeremonyCard
                                        type="planning"
                                        onStart={() => router.push('/(tabs)/sprints/planning' as any)}
                                        isAvailable={!(matchedSprint as any)?.committedAt}
                                        ceremony={(matchedSprint as any)?.committedAt ? {
                                            id: 'planning-done',
                                            type: 'planning',
                                            status: 'completed',
                                            completedAt: (matchedSprint as any).committedAt,
                                        } as any : undefined}
                                    />
                                </View>
                            )}

                            {/* Task List */}
                            {renderTaskList()}
                        </ScrollView>
                    </>
                )}
            </View>
        </View>
    );
}
