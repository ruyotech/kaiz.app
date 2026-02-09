import { logger } from '../../../utils/logger';
import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDays, subDays, format, isThisWeek, getDay } from 'date-fns';
import { getSprintName, getWeekNumber, getWeekStartDate } from '../../../utils/dateHelpers';
import { getMonthShort, formatLocalized } from '../../../utils/localizedDate';
import { WeekHeader } from '../../../components/calendar/WeekHeader';
import { MonthSelector } from '../../../components/calendar/MonthSelector';
import { DayScheduleView } from '../../../components/calendar/DayScheduleView';
import { EnhancedTaskCard } from '../../../components/calendar/EnhancedTaskCard';
import { CeremonyCard } from '../../../components/sprints/CeremonyCard';
import { FamilyScopeSwitcher } from '../../../components/family/FamilyScopeSwitcher';
import { taskApi, sprintApi, epicApi, lifeWheelApi, AuthExpiredError } from '../../../services/api';
import { Task } from '../../../types/models';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useFamilyStore } from '../../../store/familyStore';
import { useTaskStore } from '../../../store/taskStore';

type ViewMode = 'eisenhower' | 'status' | 'size';

interface LifeWheelArea {
    id: string;
    displayId: string;
    name: string;
    icon: string;
    color: string;
}

export default function SprintCalendar() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('eisenhower');
    const [weekTasks, setWeekTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['eq-2', 'todo']));
    const [viewType, setViewType] = useState<'day' | 'week'>('week'); // NEW: day vs week view
    const [isMonthExpanded, setIsMonthExpanded] = useState(false); // NEW: month view expansion
    const [currentSprint, setCurrentSprint] = useState<any>(null); // Store current sprint data
    // view options menu removed from header
    const [epics, setEpics] = useState<any[]>([]); // Store epics for epic info display
    const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([]); // Life wheel areas for task display

    // Family state for scope filtering
    const currentFamily = useFamilyStore((state) => state.currentFamily);
    const fetchMyFamily = useFamilyStore((state) => state.fetchMyFamily);
    const currentViewScope = useTaskStore((state) => state.currentViewScope);
    const setViewScope = useTaskStore((state) => state.setViewScope);

    // Fetch family data on mount to enable scope switcher
    useEffect(() => {
        if (!currentFamily) {
            fetchMyFamily();
        }
    }, []);

    // Touch tracking for horizontal swipe
    const touchStart = useRef({ x: 0, y: 0, time: 0 });
    const touchMove = useRef({ x: 0, y: 0 });

    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();

    // Determine which month has more days in this week
    const weekStart = getWeekStartDate(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Count days per month using localized month name
    const monthCounts = weekDays.reduce((acc, day) => {
        const monthKey = formatLocalized(day, 'MMM-yyyy');
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Find month with most days
    const dominantMonth = Object.entries(monthCounts).reduce((max, [month, count]) =>
        count > max.count ? { month, count } : max,
        { month: formatLocalized(weekStart, 'MMM-yyyy'), count: 0 }
    );

    const [monthName, yearFromMonth] = dominantMonth.month.split('-');
    const sprintName = `S${currentWeek.toString().padStart(2, '0')}-${monthName}-${yearFromMonth}`;

    // Load tasks for current week
    useEffect(() => {
        const loadTasks = async () => {
            setLoading(true);
            try {
                const sprints = await sprintApi.getSprints(currentYear);
                const sprint = sprints.find((s: any) => s.weekNumber === currentWeek);
                const epicsData = await epicApi.getEpics();
                setEpics(epicsData);
                
                // Load life wheel areas
                const areasData = await lifeWheelApi.getLifeWheelAreas();
                setLifeWheelAreas(areasData as LifeWheelArea[]);

                if (sprint) {
                    setCurrentSprint(sprint); // Store sprint data for color coding
                    const filtered = await taskApi.getTasksBySprint((sprint as any).id);
                    setWeekTasks(filtered as Task[]);
                } else {
                    setCurrentSprint(null);
                    setWeekTasks([]);
                }
            } catch (error) {
                // Ignore auth expired errors - redirect is handled automatically
                if (error instanceof AuthExpiredError) return;
                logger.error('Error loading tasks:', error);
            } finally {
                setLoading(false);
            }
        };
        loadTasks();
    }, [currentDate, currentWeek, currentYear]);

    // Helper: Check if a recurring task should appear on a specific day
    const shouldShowTaskOnDay = (task: Task, date: Date): boolean => {
        if (!task.isRecurring || !task.recurrence) {
            // Non-recurring task - always show in sprint
            return true;
        }

        const freq = task.recurrence.frequency;
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        switch (freq) {
            case 'DAILY':
                // For "weekdays" tasks, show only Mon-Fri
                // Assuming DAILY means weekdays (Mon-Fri) for most work tasks
                return dayOfWeek >= 1 && dayOfWeek <= 5;
            case 'WEEKLY':
            case 'BIWEEKLY':
                return task.recurrence.dayOfWeek === dayOfWeek;
            case 'MONTHLY':
                return task.recurrence.dayOfMonth === date.getDate();
            default:
                return true;
        }
    };

    // Helper: Get life wheel area for a task
    const getLifeWheelArea = (lifeWheelAreaId: string) => {
        return lifeWheelAreas.find(a => a.id === lifeWheelAreaId || a.displayId === lifeWheelAreaId);
    };

    // Helper: Filter tasks by family view scope
    const filterByViewScope = (tasks: Task[]): Task[] => {
        // If no family or viewing own tasks, show personal tasks (no familyId or visibility === 'private')
        if (!currentFamily || currentViewScope === 'mine') {
            return tasks.filter(task => !task.familyId || task.visibility === 'private');
        }
        
        // If viewing family tasks, show shared/assigned family tasks
        if (currentViewScope === 'family') {
            return tasks.filter(task => 
                task.familyId === currentFamily.id && 
                (task.visibility === 'shared' || task.visibility === 'assigned')
            );
        }
        
        // If viewing a specific child's tasks (child:userId format)
        if (currentViewScope.startsWith('child:')) {
            const childUserId = currentViewScope.replace('child:', '');
            return tasks.filter(task => 
                task.familyId === currentFamily.id && 
                task.assignedToUserId === childUserId
            );
        }
        
        return tasks;
    };

    // Filter tasks based on view type and scope
    // In week view: show all tasks (recurring once with "weekdaily" tag)
    // In day view: filter to only tasks scheduled for that day
    const scopeFilteredTasks = filterByViewScope(weekTasks);
    const displayedTasks = viewType === 'day'
        ? scopeFilteredTasks.filter(task => shouldShowTaskOnDay(task, currentDate))
        : scopeFilteredTasks;

    // Empty sprint / mid-week guidance detection
    const isCurrentWeek = isThisWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const dayOfWeek = getDay(new Date()); // 0=Sun, 1=Mon, ...
    const isMidWeek = dayOfWeek >= 3 && dayOfWeek <= 5; // Wed-Fri
    const sprintNotCommitted = isCurrentWeek && currentSprint && !currentSprint.committedAt;
    const sprintEmpty = isCurrentWeek && currentSprint && weekTasks.length === 0;
    const showPlanningNudge = sprintNotCommitted || sprintEmpty;
    const isSunday = dayOfWeek === 0;

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
                style={{
                    backgroundColor: nudgeBg,
                    borderWidth: 1,
                    borderColor: nudgeColor + '40',
                }}
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
                            {isSunday
                                ? '🌟 Sunday Planning Ceremony'
                                : isUrgent
                                    ? '⚠️ Sprint Not Planned Yet'
                                    : 'Plan Your Week'}
                        </Text>
                        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                            {sprintEmpty
                                ? 'Your sprint is empty — add tasks to make progress this week.'
                                : isUrgent
                                    ? "It's mid-week and your sprint isn't committed. Plan now to stay on track."
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

                {weekTasks.length > 0 && !currentSprint?.committedAt && (
                    <Text className="text-xs text-center mt-2" style={{ color: colors.textTertiary }}>
                        You have {weekTasks.length} task{weekTasks.length !== 1 ? 's' : ''} but haven't committed the sprint yet.
                    </Text>
                )}
            </View>
        );
    };

    const handleDatePress = (date: Date) => {
        setCurrentDate(date);
        setViewType('day'); // Switch to day view when clicking a date
        setIsMonthExpanded(false); // Collapse month view when selecting a date
    };

    const handleMonthSelect = (date: Date) => {
        setCurrentDate(date);
        setIsMonthExpanded(false); // Collapse after selecting month
    };

    const toggleMonthExpansion = () => {
        setIsMonthExpanded(!isMonthExpanded);
    };

    const handlePrevWeek = () => {
        setCurrentDate(subDays(currentDate, 7));
    };

    const handleNextWeek = () => {
        setCurrentDate(addDays(currentDate, 7));
    };

    // Touch handlers for horizontal swipe
    const handleTouchStart = (e: any) => {
        const touch = e.nativeEvent.touches[0];
        touchStart.current = { x: touch.pageX, y: touch.pageY, time: Date.now() };
        touchMove.current = { x: touch.pageX, y: touch.pageY };
    };

    const handleTouchMove = (e: any) => {
        const touch = e.nativeEvent.touches[0];
        touchMove.current = { x: touch.pageX, y: touch.pageY };
    };

    const handleTouchEnd = () => {
        // Disable swipe navigation when in weekly view
        if (viewType === 'week') {
            return;
        }

        const deltaX = touchMove.current.x - touchStart.current.x;
        const deltaY = touchMove.current.y - touchStart.current.y;
        const deltaTime = Date.now() - touchStart.current.time;

        // Only trigger if:
        // 1. Horizontal movement is greater than vertical (it's a horizontal swipe)
        // 2. Moved at least 50px
        // 3. Completed in less than 300ms (it's a swipe, not a slow drag)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 300) {
            if (deltaX > 0) {
                // Swiped right -> previous week
                handlePrevWeek();
            } else {
                // Swiped left -> next week
                handleNextWeek();
            }
        }
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    const renderEisenhowerView = () => {
        // Theme-aware quadrant colors with semantic accent colors
        const quadrants = [
            { id: 'eq-1', title: t('calendar.urgentImportant'), accentColor: isDark ? '#FCA5A5' : '#DC2626', bgAccent: isDark ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.1)', borderAccent: isDark ? '#DC2626' : '#F87171', icon: 'fire' },
            { id: 'eq-2', title: t('calendar.notUrgentImportant'), accentColor: isDark ? '#93C5FD' : '#2563EB', bgAccent: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.1)', borderAccent: isDark ? '#2563EB' : '#60A5FA', icon: 'target' },
            { id: 'eq-3', title: t('calendar.urgentNotImportant'), accentColor: isDark ? '#FCD34D' : '#CA8A04', bgAccent: isDark ? 'rgba(202, 138, 4, 0.15)' : 'rgba(202, 138, 4, 0.1)', borderAccent: isDark ? '#CA8A04' : '#FBBF24', icon: 'clock-fast' },
            { id: 'eq-4', title: t('calendar.notUrgentNotImportant'), accentColor: isDark ? '#9CA3AF' : '#6B7280', bgAccent: isDark ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.1)', borderAccent: isDark ? '#6B7280' : '#9CA3AF', icon: 'delete-outline' },
        ];

        // Calculate total story points for each quadrant
        const getQuadrantStats = (tasks: Task[]) => {
            const total = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
            const done = tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.storyPoints || 0), 0);
            return { total, done, count: tasks.length };
        };

        return (
            <View className="px-4 pt-4">
                {quadrants.map((quadrant) => {
                    const quadrantTasks = displayedTasks.filter(t => t.eisenhowerQuadrantId === quadrant.id);
                    const isExpanded = expandedSections.has(quadrant.id);
                    const stats = getQuadrantStats(quadrantTasks);

                    return (
                        <View key={quadrant.id} className="mb-4">
                            {/* Quadrant Header - Accordion */}
                            <TouchableOpacity
                                onPress={() => toggleSection(quadrant.id)}
                                className="flex-row items-center justify-between p-4 rounded-xl"
                                style={{
                                    backgroundColor: quadrant.bgAccent,
                                    borderWidth: 2,
                                    borderColor: quadrant.borderAccent,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 1,
                                }}
                            >
                                <View className="flex-row items-center flex-1">
                                    <MaterialCommunityIcons 
                                        name={quadrant.icon as any} 
                                        size={20} 
                                        color={quadrant.accentColor} 
                                    />
                                    <Text 
                                        className="text-base font-bold ml-2 mr-2"
                                        style={{ color: colors.text }}
                                    >
                                        {quadrant.title}
                                    </Text>
                                    {/* Task count badge */}
                                    <View 
                                        className="px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                                    >
                                        <Text 
                                            className="text-xs font-bold"
                                            style={{ color: colors.text }}
                                        >
                                            {stats.count}
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* Points progress */}
                                <View className="flex-row items-center mr-2">
                                    <Text 
                                        className="text-xs font-semibold"
                                        style={{ color: colors.textSecondary }}
                                    >
                                        {stats.done}/{stats.total} pts
                                    </Text>
                                </View>

                                <MaterialCommunityIcons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={quadrant.accentColor}
                                />
                            </TouchableOpacity>

                            {/* Expanded Task List - Using Enhanced Task Cards */}
                            {isExpanded && quadrantTasks.length > 0 && (
                                <View className="mt-3 ml-1">
                                    {quadrantTasks.map((task) => {
                                        const taskEpic = epics.find(e => e.id === task.epicId);
                                        const lifeWheelArea = getLifeWheelArea(task.lifeWheelAreaId);
                                        
                                        return (
                                            <EnhancedTaskCard
                                                key={task.id}
                                                task={task}
                                                epic={taskEpic}
                                                lifeWheelArea={lifeWheelArea}
                                                onPress={() => router.push(`/(tabs)/sprints/task/${task.id}` as any)}
                                                viewType={viewType}
                                            />
                                        );
                                    })}
                                </View>
                            )}

                            {/* Empty state for quadrant */}
                            {isExpanded && quadrantTasks.length === 0 && (
                                <View 
                                    className="mt-2 ml-2 p-4 rounded-lg"
                                    style={{ 
                                        backgroundColor: colors.card,
                                        borderWidth: 1,
                                        borderStyle: 'dashed',
                                        borderColor: colors.border
                                    }}
                                >
                                    <Text 
                                        className="text-sm text-center"
                                        style={{ color: colors.textTertiary }}
                                    >
                                        {t('calendar.noTasksInQuadrant')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderStatusView = () => {
        // Theme-aware status colors
        const statuses = [
            { value: 'todo', label: t('tasks.statusTodo'), accentColor: isDark ? '#9CA3AF' : '#6B7280', bgAccent: isDark ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.1)', borderAccent: isDark ? '#6B7280' : '#9CA3AF', icon: 'checkbox-blank-circle-outline' },
            { value: 'in_progress', label: t('tasks.statusInProgress'), accentColor: isDark ? '#93C5FD' : '#2563EB', bgAccent: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.1)', borderAccent: isDark ? '#2563EB' : '#60A5FA', icon: 'progress-clock' },
            { value: 'done', label: t('tasks.statusDone'), accentColor: isDark ? '#86EFAC' : '#16A34A', bgAccent: isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.1)', borderAccent: isDark ? '#16A34A' : '#4ADE80', icon: 'check-circle' },
        ];

        // Calculate stats for each status
        const getStatusStats = (tasks: Task[]) => {
            const total = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
            return { total, count: tasks.length };
        };

        return (
            <View className="px-4 pt-4">
                {statuses.map((status) => {
                    const statusTasks = displayedTasks.filter(t => t.status === status.value);
                    const isExpanded = expandedSections.has(status.value);
                    const stats = getStatusStats(statusTasks);

                    return (
                        <View key={status.value} className="mb-4">
                            <TouchableOpacity
                                onPress={() => toggleSection(status.value)}
                                className="flex-row items-center justify-between p-4 rounded-lg"
                                style={{
                                    backgroundColor: status.bgAccent,
                                    borderWidth: 2,
                                    borderColor: status.borderAccent,
                                }}
                            >
                                <View className="flex-row items-center flex-1">
                                    <MaterialCommunityIcons name={status.icon as any} size={20} color={status.accentColor} />
                                    <Text 
                                        className="ml-2 text-base font-semibold mr-2"
                                        style={{ color: colors.text }}
                                    >
                                        {status.label}
                                    </Text>
                                    <View 
                                        className="px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                                    >
                                        <Text 
                                            className="text-xs font-bold"
                                            style={{ color: colors.text }}
                                        >
                                            {statusTasks.length}
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* Points total */}
                                <View className="flex-row items-center mr-2">
                                    <Text 
                                        className="text-xs font-semibold"
                                        style={{ color: colors.textSecondary }}
                                    >
                                        {stats.total} pts
                                    </Text>
                                </View>

                                <MaterialCommunityIcons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={status.accentColor}
                                />
                            </TouchableOpacity>

                            {isExpanded && statusTasks.length > 0 && (
                                <View className="mt-3 ml-1">
                                    {statusTasks.map((task) => {
                                        const taskEpic = epics.find(e => e.id === task.epicId);
                                        const lifeWheelArea = getLifeWheelArea(task.lifeWheelAreaId);
                                        
                                        return (
                                            <EnhancedTaskCard
                                                key={task.id}
                                                task={task}
                                                epic={taskEpic}
                                                lifeWheelArea={lifeWheelArea}
                                                onPress={() => router.push(`/(tabs)/sprints/task/${task.id}` as any)}
                                                viewType={viewType}
                                            />
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderSizeView = () => {
        // Theme-aware size colors
        const sizes = [
            { value: 'small', label: t('tasks.sizeSmall'), accentColor: isDark ? '#86EFAC' : '#16A34A', bgAccent: isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(22, 163, 74, 0.1)', borderAccent: isDark ? '#16A34A' : '#4ADE80', range: [1, 3], icon: 'size-s' },
            { value: 'medium', label: t('tasks.sizeMedium'), accentColor: isDark ? '#FCD34D' : '#CA8A04', bgAccent: isDark ? 'rgba(202, 138, 4, 0.15)' : 'rgba(202, 138, 4, 0.1)', borderAccent: isDark ? '#CA8A04' : '#FBBF24', range: [5, 8], icon: 'size-m' },
            { value: 'large', label: t('tasks.sizeLarge'), accentColor: isDark ? '#FCA5A5' : '#DC2626', bgAccent: isDark ? 'rgba(220, 38, 38, 0.15)' : 'rgba(220, 38, 38, 0.1)', borderAccent: isDark ? '#DC2626' : '#F87171', range: [13, 100], icon: 'size-l' },
        ];

        // Calculate stats for each size
        const getSizeStats = (tasks: Task[]) => {
            const total = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
            return { total, count: tasks.length };
        };

        return (
            <View className="px-4 pt-4">
                {sizes.map((size) => {
                    const sizeTasks = displayedTasks.filter(t =>
                        t.storyPoints && t.storyPoints >= size.range[0] && t.storyPoints <= size.range[1]
                    );
                    const isExpanded = expandedSections.has(size.value);
                    const stats = getSizeStats(sizeTasks);

                    return (
                        <View key={size.value} className="mb-4">
                            <TouchableOpacity
                                onPress={() => toggleSection(size.value)}
                                className="flex-row items-center justify-between p-4 rounded-xl"
                                style={{
                                    backgroundColor: size.bgAccent,
                                    borderWidth: 2,
                                    borderColor: size.borderAccent,
                                }}
                            >
                                <View className="flex-row items-center flex-1">
                                    <MaterialCommunityIcons name="ruler" size={20} color={size.accentColor} />
                                    <Text 
                                        className="ml-2 text-base font-bold mr-2"
                                        style={{ color: colors.text }}
                                    >
                                        {size.label}
                                    </Text>
                                    <View 
                                        className="px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                                    >
                                        <Text 
                                            className="text-xs font-bold"
                                            style={{ color: colors.text }}
                                        >
                                            {sizeTasks.length}</Text>
                                    </View>
                                </View>
                                
                                {/* Points total */}
                                <View className="flex-row items-center mr-2">
                                    <Text 
                                        className="text-xs font-semibold"
                                        style={{ color: colors.textSecondary }}
                                    >
                                        {stats.total} pts
                                    </Text>
                                </View>

                                <MaterialCommunityIcons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={size.accentColor}
                                />
                            </TouchableOpacity>

                            {isExpanded && sizeTasks.length > 0 && (
                                <View className="mt-3 ml-1">
                                    {sizeTasks.map((task) => {
                                        const taskEpic = epics.find(e => e.id === task.epicId);
                                        const lifeWheelArea = getLifeWheelArea(task.lifeWheelAreaId);
                                        
                                        return (
                                            <EnhancedTaskCard
                                                key={task.id}
                                                task={task}
                                                epic={taskEpic}
                                                lifeWheelArea={lifeWheelArea}
                                                onPress={() => router.push(`/(tabs)/sprints/task/${task.id}` as any)}
                                                viewType={viewType}
                                            />
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View
            className="flex-1"
            style={{ backgroundColor: colors.background }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header Layer - High Z-Index to stay above overlay */}
            <View style={{ zIndex: 20 }}>
                <WeekHeader
                    currentDate={currentDate}
                    sprintName={sprintName}
                    onDatePress={handleDatePress}
                    isExpanded={isMonthExpanded}
                    onSprintNamePress={toggleMonthExpansion}
                    onMonthSelect={handleMonthSelect}
                    viewType={viewType}
                    sprintStartDate={currentSprint?.startDate}
                    sprintEndDate={currentSprint?.endDate}
                    toggleElement={
                        <View className="flex-row items-center gap-2">
                            {/* Family Scope Switcher - Only show if user has family */}
                            {currentFamily && (
                                <FamilyScopeSwitcher
                                    variant="compact"
                                    value={currentViewScope}
                                    onChange={setViewScope}
                                />
                            )}
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/sprints/preferences')}
                                className="px-2 py-1 rounded"
                                style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.4)'
                                }}
                            >
                                <MaterialCommunityIcons name="cog-outline" size={16} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setViewType(viewType === 'week' ? 'day' : 'week')}
                                className="px-3 py-1 rounded"
                                style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.4)'
                                }}
                            >
                                <Text className="text-white text-xs font-semibold">
                                    {viewType === 'week' ? t('calendar.weekly') : t('calendar.daily')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>

            {/* Overlay Layer - Medium Z-Index, covers content but behind header */}
            {isMonthExpanded && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setIsMonthExpanded(false)}
                    className="absolute inset-0"
                    style={{ zIndex: 10, backgroundColor: colors.overlay }}
                />
            )}

            {/* Content Layer - Low Z-Index */}
            <View className="flex-1" style={{ zIndex: 1 }}>
                {/* Day Schedule View - Outlook-like 24-hour view */}
                {viewType === 'day' ? (
                    <DayScheduleView
                        currentDate={currentDate}
                        tasks={weekTasks}
                        epics={epics}
                        lifeWheelAreas={lifeWheelAreas}
                        onTaskPress={(taskId) => router.push(`/(tabs)/sprints/task/${taskId}` as any)}
                    />
                ) : (
                    <ScrollView className="flex-1">
                        {renderPlanningNudge()}

                        {/* Committed sprint badge */}
                        {isCurrentWeek && currentSprint?.committedAt && !loading && (
                            <View
                                className="mx-4 mt-3 px-4 py-2.5 rounded-xl flex-row items-center"
                                style={{
                                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                                    borderWidth: 1,
                                    borderColor: isDark ? '#10B98140' : '#A7F3D0',
                                }}
                            >
                                <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                                <Text className="ml-2 text-sm font-semibold" style={{ color: '#10B981' }}>
                                    Sprint Committed
                                </Text>
                                <Text className="ml-1 text-xs" style={{ color: colors.textTertiary }}>
                                    • {weekTasks.length} task{weekTasks.length !== 1 ? 's' : ''} • {weekTasks.reduce((s, t) => s + (t.storyPoints || 0), 0)} pts
                                </Text>
                            </View>
                        )}

                        {/* Sunday Ceremony Cards — only show if planning nudge is NOT visible (dedup) */}
                        {viewType === 'week' && isSunday && isCurrentWeek && !showPlanningNudge && (
                            <View className="px-4 mt-4">
                                <Text className="text-xs uppercase tracking-wide mb-2" style={{ color: colors.textTertiary }}>
                                    Today's Ceremonies
                                </Text>
                                <CeremonyCard
                                    type="planning"
                                    onStart={() => router.push('/(tabs)/sprints/planning' as any)}
                                    isAvailable={!currentSprint?.committedAt}
                                    ceremony={currentSprint?.committedAt ? {
                                        id: 'planning-done',
                                        type: 'planning',
                                        status: 'completed',
                                        completedAt: currentSprint.committedAt,
                                    } as any : undefined}
                                />
                            </View>
                        )}

                        {viewMode === 'eisenhower' && renderEisenhowerView()}
                        {viewMode === 'status' && renderStatusView()}
                        {viewMode === 'size' && renderSizeView()}

                        {displayedTasks.length === 0 && !showPlanningNudge && (
                            <View className="items-center justify-center py-12">
                                <MaterialCommunityIcons name="calendar-blank" size={64} color={colors.textTertiary} />
                                <Text style={{ color: colors.textTertiary, marginTop: 16 }}>
                                    {t('calendar.noTasksSprint')}
                                </Text>
                                {isCurrentWeek && (
                                    <TouchableOpacity
                                        onPress={() => router.push('/(tabs)/sprints/planning' as any)}
                                        className="mt-4 px-6 py-3 rounded-xl"
                                        style={{ backgroundColor: colors.primary }}
                                    >
                                        <Text className="text-white font-semibold">Plan This Sprint</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </View>
    );
}
