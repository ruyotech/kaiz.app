import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDays, subDays, format } from 'date-fns';
import { getSprintName, getWeekNumber } from '../../../utils/dateHelpers';
import { WeekHeader } from '../../../components/calendar/WeekHeader';
import { TaskViewSwitcher } from '../../../components/calendar/TaskViewSwitcher';
import { mockApi } from '../../../services/mockApi';
import { Task } from '../../../types/models';

type ViewMode = 'eisenhower' | 'status' | 'size';

export default function SprintCalendar() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('eisenhower');
    const [weekTasks, setWeekTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['eq-2', 'todo']));
    const [viewType, setViewType] = useState<'day' | 'week'>('week'); // NEW: day vs week view

    // Touch tracking for horizontal swipe
    const touchStart = useRef({ x: 0, y: 0, time: 0 });
    const touchMove = useRef({ x: 0, y: 0 });

    const currentWeek = getWeekNumber(currentDate);
    const currentYear = currentDate.getFullYear();

    // Format: S04-Jan-2026
    const monthName = format(currentDate, 'MMM');
    const sprintName = `S${currentWeek.toString().padStart(2, '0')}-${monthName}-${currentYear}`;

    // Load tasks for current week
    useEffect(() => {
        const loadTasks = async () => {
            setLoading(true);
            try {
                const sprints = await mockApi.getSprints(currentYear);
                const currentSprint = sprints.find((s: any) => s.weekNumber === currentWeek);

                if (currentSprint) {
                    const allTasksUnfiltered = await mockApi.getTasks();
                    const filtered = allTasksUnfiltered.filter((t: any) => t.sprintId === currentSprint.id);
                    setWeekTasks(filtered);
                } else {
                    setWeekTasks([]);
                }
            } catch (error) {
                console.error('Error loading tasks:', error);
            } finally {
                setLoading(false);
            }
        };
        loadTasks();
    }, [currentDate, currentWeek, currentYear]);

    // Filter tasks by selected date if in day view
    const displayedTasks = viewType === 'day'
        ? weekTasks.filter(task => {
            // For now, show all tasks assigned to sprint on any day
            // In production, you'd check task.scheduledDate === currentDate
            return true;
        })
        : weekTasks;

    const handleDatePress = (date: Date) => {
        setCurrentDate(date);
        setViewType('day'); // Switch to day view when clicking a date
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
        const quadrants = [
            { id: 'eq-1', title: 'Urgent & Important', color: 'bg-red-100', borderColor: 'border-red-400', iconColor: '#DC2626' },
            { id: 'eq-2', title: 'Not Urgent & Important', color: 'bg-blue-100', borderColor: 'border-blue-400', iconColor: '#2563EB' },
            { id: 'eq-3', title: 'Urgent & Not Important', color: 'bg-yellow-100', borderColor: 'border-yellow-400', iconColor: '#CA8A04' },
            { id: 'eq-4', title: 'Not Urgent & Not Important', color: 'bg-gray-100', borderColor: 'border-gray-400', iconColor: '#6B7280' },
        ];

        return (
            <View className="px-4 pt-4">
                {quadrants.map((quadrant) => {
                    const quadrantTasks = displayedTasks.filter(t => t.eisenhowerQuadrantId === quadrant.id);
                    const isExpanded = expandedSections.has(quadrant.id);

                    return (
                        <View key={quadrant.id} className="mb-3">
                            <TouchableOpacity
                                onPress={() => toggleSection(quadrant.id)}
                                className={'flex-row items-center justify-between p-4 rounded-lg border-2 ' + quadrant.color + ' ' + quadrant.borderColor}
                            >
                                <View className="flex-row items-center flex-1">
                                    <Text className="text-base font-semibold mr-2">{quadrant.title}</Text>
                                    <View className="bg-white px-2 py-0.5 rounded-full">
                                        <Text className="text-xs font-bold">{quadrantTasks.length}</Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={quadrant.iconColor}
                                />
                            </TouchableOpacity>

                            {isExpanded && quadrantTasks.length > 0 && (
                                <View className="mt-2 ml-2">
                                    {quadrantTasks.map((task) => (
                                        <TouchableOpacity
                                            key={task.id}
                                            className="bg-white rounded-lg p-3 mb-2 border border-gray-200"
                                            onPress={() => router.push(`/ (tabs) / sdlc / task / ${task.id} `)}
                                        >
                                            <Text className="font-medium" numberOfLines={1}>{task.title}</Text>
                                            <Text className="text-xs text-gray-600 mt-1">{task.storyPoints || 0} pts • {task.status}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderStatusView = () => {
        const statuses = [
            { value: 'todo', label: 'To Do', color: 'bg-gray-100', borderColor: 'border-gray-400', iconColor: '#6B7280', icon: 'checkbox-blank-circle-outline' },
            { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100', borderColor: 'border-blue-400', iconColor: '#2563EB', icon: 'progress-clock' },
            { value: 'done', label: 'Done', color: 'bg-green-100', borderColor: 'border-green-400', iconColor: '#16A34A', icon: 'check-circle' },
        ];

        return (
            <View className="px-4 pt-4">
                {statuses.map((status) => {
                    const statusTasks = displayedTasks.filter(t => t.status === status.value);
                    const isExpanded = expandedSections.has(status.value);

                    return (
                        <View key={status.value} className="mb-3">
                            <TouchableOpacity
                                onPress={() => toggleSection(status.value)}
                                className={'flex-row items-center justify-between p-4 rounded-lg border-2 ' + status.color + ' ' + status.borderColor}
                            >
                                <View className="flex-row items-center flex-1">
                                    <MaterialCommunityIcons name={status.icon as any} size={20} color={status.iconColor} />
                                    <Text className="ml-2 text-base font-semibold mr-2">{status.label}</Text>
                                    <View className="bg-white px-2 py-0.5 rounded-full">
                                        <Text className="text-xs font-bold">{statusTasks.length}</Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={status.iconColor}
                                />
                            </TouchableOpacity>

                            {isExpanded && statusTasks.length > 0 && (
                                <View className="mt-2 ml-2">
                                    {statusTasks.map((task) => (
                                        <TouchableOpacity
                                            key={task.id}
                                            className="bg-white rounded-lg p-3 mb-2 border border-gray-200"
                                            onPress={() => router.push(`/ (tabs) / sdlc / task / ${task.id} `)}
                                        >
                                            <Text className="font-medium" numberOfLines={1}>{task.title}</Text>
                                            <Text className="text-xs text-gray-600 mt-1">{task.storyPoints || 0} pts</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderSizeView = () => {
        const sizes = [
            { value: 'small', label: 'Small (1-3)', color: 'bg-green-100', borderColor: 'border-green-400', iconColor: '#16A34A', range: [1, 3] },
            { value: 'medium', label: 'Medium (5-8)', color: 'bg-yellow-100', borderColor: 'border-yellow-400', iconColor: '#CA8A04', range: [5, 8] },
            { value: 'large', label: 'Large (13+)', color: 'bg-red-100', borderColor: 'border-red-400', iconColor: '#DC2626', range: [13, 100] },
        ];

        return (
            <View className="px-4 pt-4">
                {sizes.map((size) => {
                    const sizeTasks = displayedTasks.filter(t =>
                        t.storyPoints && t.storyPoints >= size.range[0] && t.storyPoints <= size.range[1]
                    );
                    const isExpanded = expandedSections.has(size.value);

                    return (
                        <View key={size.value} className="mb-3">
                            <TouchableOpacity
                                onPress={() => toggleSection(size.value)}
                                className={'flex-row items-center justify-between p-4 rounded-lg border-2 ' + size.color + ' ' + size.borderColor}
                            >
                                <View className="flex-row items-center flex-1">
                                    <MaterialCommunityIcons name="ruler" size={20} color={size.iconColor} />
                                    <Text className="ml-2 text-base font-semibold mr-2">{size.label}</Text>
                                    <View className="bg-white px-2 py-0.5 rounded-full">
                                        <Text className="text-xs font-bold">{sizeTasks.length}</Text>
                                    </View>
                                </View>
                                <MaterialCommunityIcons
                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={24}
                                    color={size.iconColor}
                                />
                            </TouchableOpacity>

                            {isExpanded && sizeTasks.length > 0 && (
                                <View className="mt-2 ml-2">
                                    {sizeTasks.map((task) => (
                                        <TouchableOpacity
                                            key={task.id}
                                            className="bg-white rounded-lg p-3 mb-2 border border-gray-200"
                                            onPress={() => router.push(`/ (tabs) / sdlc / task / ${task.id} `)}
                                        >
                                            <Text className="font-medium" numberOfLines={1}>{task.title}</Text>
                                            <View className="flex-row items-center mt-1">
                                                <View className="bg-gray-100 px-2 py-0.5 rounded mr-2">
                                                    <Text className="text-xs font-semibold">{task.storyPoints || 0} pts</Text>
                                                </View>
                                                <Text className="text-xs text-gray-600 capitalize">{task.status}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
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
            className="flex-1 bg-gray-50"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <WeekHeader
                currentDate={currentDate}
                sprintName={sprintName}
                onDatePress={handleDatePress}
                toggleElement={
                    <TouchableOpacity
                        onPress={() => setViewType(viewType === 'week' ? 'day' : 'week')}
                        className="bg-white/20 px-3 py-1 rounded border border-white/40"
                    >
                        <Text className="text-white text-xs font-semibold">
                            {viewType === 'week' ? 'Weekly' : 'Daily'}
                        </Text>
                    </TouchableOpacity>
                }
            />


            <TaskViewSwitcher
                currentView={viewMode}
                onViewChange={setViewMode}
            />

            {/* Normal ScrollView without gesture conflicts */}
            <ScrollView className="flex-1">
                {viewMode === 'eisenhower' && renderEisenhowerView()}
                {viewMode === 'status' && renderStatusView()}
                {viewMode === 'size' && renderSizeView()}

                {displayedTasks.length === 0 && (
                    <View className="items-center justify-center py-12">
                        <MaterialCommunityIcons name="calendar-blank" size={64} color="#ccc" />
                        <Text className="text-gray-500 mt-4">
                            {viewType === 'day' ? 'No tasks for this day' : 'No tasks for this sprint'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
