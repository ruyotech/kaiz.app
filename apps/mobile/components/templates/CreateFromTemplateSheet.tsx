import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TaskTemplate, RecurrencePattern } from '../../types/models';
import { LIFE_WHEEL_CONFIG } from './TemplateCard';
import { useTemplateStore } from '../../store/templateStore';
import { taskApi, sprintApi, lifeWheelApi } from '../../services/api';
import { STORY_POINTS } from '../../utils/constants';
import { Calendar } from 'react-native-calendars';

interface CreateFromTemplateSheetProps {
    visible: boolean;
    template: TaskTemplate | null;
    onClose: () => void;
    onSuccess?: (taskId: string) => void;
}

interface Sprint {
    id: string;
    name: string;
    weekNumber: number;
    startDate: string;
    endDate: string;
}

interface EisenhowerQuadrant {
    id: string;
    name: string;
    label: string;
    color: string;
}

// User-friendly recurrence presets
const RECURRENCE_PRESETS: { 
    id: string; 
    label: string; 
    emoji: string; 
    frequency: string | null;
}[] = [
    { id: 'none', label: 'Once', emoji: '1️⃣', frequency: null },
    { id: 'daily', label: 'Daily', emoji: '📅', frequency: 'daily' },
    { id: 'weekdays', label: 'Weekdays', emoji: '💼', frequency: 'weekdays' },
    { id: 'weekly', label: 'Weekly', emoji: '🔄', frequency: 'weekly' },
    { id: 'biweekly', label: 'Bi-weekly', emoji: '📆', frequency: 'biweekly' },
    { id: 'monthly', label: 'Monthly', emoji: '🗓️', frequency: 'monthly' },
    { id: 'yearly', label: 'Yearly', emoji: '🎂', frequency: 'yearly' },
    { id: 'custom', label: 'Custom', emoji: '⚙️', frequency: 'custom' },
];

// Custom recurrence interval options
const CUSTOM_INTERVALS = [
    { value: 1, label: 'Every' },
    { value: 2, label: 'Every 2' },
    { value: 3, label: 'Every 3' },
    { value: 4, label: 'Every 4' },
];

const CUSTOM_UNITS = [
    { value: 'day', label: 'Days' },
    { value: 'week', label: 'Weeks' },
    { value: 'month', label: 'Months' },
];

export function CreateFromTemplateSheet({
    visible,
    template,
    onClose,
    onSuccess,
}: CreateFromTemplateSheetProps) {
    const { useTemplate } = useTemplateStore();

    // Sprint data
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loadingSprints, setLoadingSprints] = useState(false);
    const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
    const [showSprintPicker, setShowSprintPicker] = useState(false);

    // Eisenhower quadrants
    const [quadrants, setQuadrants] = useState<EisenhowerQuadrant[]>([]);
    const [loadingQuadrants, setLoadingQuadrants] = useState(false);

    // Life Wheel areas
    const [lifeWheelAreas, setLifeWheelAreas] = useState<any[]>([]);
    const [selectedLifeWheelAreaId, setSelectedLifeWheelAreaId] = useState<string>('');
    const [showLifeWheelPicker, setShowLifeWheelPicker] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedRecurrenceId, setSelectedRecurrenceId] = useState<string>('none');
    const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
    const [storyPoints, setStoryPoints] = useState<number>(3);
    const [eisenhowerQuadrantId, setEisenhowerQuadrantId] = useState<string>('eq-2');
    const [useAiRefinement, setUseAiRefinement] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Tags
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);

    // Comment
    const [comment, setComment] = useState('');

    // Date picker for specific date
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'target' | 'start' | 'end' | 'yearly'>('target');

    // Recurrence dates (for recurring tasks)
    const [recurrenceStartDate, setRecurrenceStartDate] = useState<Date>(new Date());
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
    const [hasEndDate, setHasEndDate] = useState(false);

    // Custom recurrence
    const [customInterval, setCustomInterval] = useState(1);
    const [customUnit, setCustomUnit] = useState<'day' | 'week' | 'month'>('week');

    // Recurrence specific day/time options
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(new Date().getDay()); // 0=Sun, 1=Mon...
    const [selectedDayOfMonth, setSelectedDayOfMonth] = useState<number>(1); // 1-31
    const [yearlyDate, setYearlyDate] = useState<Date>(new Date()); // For yearly: specific date
    const [hasTime, setHasTime] = useState(false);
    const [selectedHour, setSelectedHour] = useState<number>(9); // Default 9 AM
    const [selectedMinute, setSelectedMinute] = useState<number>(0);
    const [showYearlyDatePicker, setShowYearlyDatePicker] = useState(false);

    // Days of week for selection
    const DAYS_OF_WEEK = [
        { id: 0, short: 'Sun', full: 'Sunday' },
        { id: 1, short: 'Mon', full: 'Monday' },
        { id: 2, short: 'Tue', full: 'Tuesday' },
        { id: 3, short: 'Wed', full: 'Wednesday' },
        { id: 4, short: 'Thu', full: 'Thursday' },
        { id: 5, short: 'Fri', full: 'Friday' },
        { id: 6, short: 'Sat', full: 'Saturday' },
    ];

    // Hours for time picker
    const HOURS = Array.from({ length: 24 }, (_, i) => i);
    const MINUTES = [0, 15, 30, 45];

    // Comment formatting
    const [commentBold, setCommentBold] = useState(false);
    const [commentItalic, setCommentItalic] = useState(false);
    const [commentBulletList, setCommentBulletList] = useState(false);
    const [attachments, setAttachments] = useState<{name: string; type: string}[]>([]);

    // Event-specific state
    const [location, setLocation] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);

    useEffect(() => {
        if (template) {
            setTitle(template.name);
            setDescription(template.description || '');
            setStoryPoints(template.defaultStoryPoints || 3);
            setEisenhowerQuadrantId(template.defaultEisenhowerQuadrantId || 'eq-2');
            setLocation(template.defaultLocation || '');
            setIsAllDay(template.isAllDay || false);
            setSelectedLifeWheelAreaId(template.defaultLifeWheelAreaId || '');
            setTags([]);  // Start with no tags - user adds their own
            setComment('');
            setTargetDate(null);
            setRecurrenceStartDate(new Date());
            setRecurrenceEndDate(null);
            setHasEndDate(false);
            setCustomInterval(1);
            setCustomUnit('week');
            setAttachments([]);
            // Reset day/time options
            setSelectedDayOfWeek(new Date().getDay());
            setSelectedDayOfMonth(1);
            setYearlyDate(new Date());
            setHasTime(false);
            setSelectedHour(9);
            setSelectedMinute(0);
            
            // Set recurrence from template
            if (template.recurrencePattern) {
                const matchingPreset = RECURRENCE_PRESETS.find(p => 
                    p.frequency === template.recurrencePattern?.frequency
                );
                setSelectedRecurrenceId(matchingPreset?.id || 'none');
            } else {
                setSelectedRecurrenceId('none');
            }
        }
    }, [template]);

    useEffect(() => {
        if (visible) {
            fetchSprints();
            fetchQuadrants();
            fetchLifeWheelAreas();
        }
    }, [visible]);

    const fetchLifeWheelAreas = async () => {
        try {
            const areas = await lifeWheelApi.getLifeWheelAreas();
            setLifeWheelAreas(areas);
        } catch (error) {
            console.error('Failed to load life wheel areas:', error);
        }
    };

    const fetchQuadrants = async () => {
        setLoadingQuadrants(true);
        try {
            const quadrantsData = await lifeWheelApi.getEisenhowerQuadrants();
            setQuadrants(quadrantsData);
        } catch (error) {
            console.error('Failed to load quadrants:', error);
            // Fallback to default quadrants
            setQuadrants([
                { id: 'eq-1', name: 'Do First', label: 'Urgent & Important', color: '#DC2626' },
                { id: 'eq-2', name: 'Schedule', label: 'Not Urgent & Important', color: '#2563EB' },
                { id: 'eq-3', name: 'Delegate', label: 'Urgent & Not Important', color: '#CA8A04' },
                { id: 'eq-4', name: 'Eliminate', label: 'Not Urgent & Not Important', color: '#6B7280' },
            ]);
        } finally {
            setLoadingQuadrants(false);
        }
    };

    const fetchSprints = async () => {
        setLoadingSprints(true);
        try {
            const currentYear = new Date().getFullYear();
            const sprintData = await sprintApi.getSprints(currentYear);
            const now = new Date();
            
            // Get all available sprints (current and future)
            const availableSprints = sprintData.filter((s: Sprint) => 
                new Date(s.endDate) >= now
            ).sort((a: Sprint, b: Sprint) => 
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );
            
            setSprints(availableSprints);
            // Auto-select current sprint
            if (availableSprints.length > 0 && !selectedSprintId) {
                setSelectedSprintId(availableSprints[0].id);
            }
        } catch (error) {
            console.error('Failed to load sprints:', error);
        } finally {
            setLoadingSprints(false);
        }
    };

    // Add a new tag
    const handleAddTag = () => {
        const trimmedTag = newTag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setNewTag('');
            setShowTagInput(false);
        }
    };

    // Remove a tag
    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    // Get selected sprint info
    const getSelectedSprint = (): Sprint | null => {
        return sprints.find(s => s.id === selectedSprintId) || null;
    };

    // Format sprint display name
    const formatSprintName = (sprint: Sprint): string => {
        const start = new Date(sprint.startDate);
        const end = new Date(sprint.endDate);
        const isCurrentSprint = sprints[0]?.id === sprint.id;
        const monthName = start.toLocaleDateString('en-US', { month: 'short' });
        return `S${sprint.weekNumber.toString().padStart(2, '0')} • ${monthName} ${start.getDate()}-${end.getDate()}${isCurrentSprint ? ' (Current)' : ''}`;
    };

    const handleCreate = async () => {
        if (!template) return;
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        setIsLoading(true);
        try {
            // Track template usage
            await useTemplate(template.id);

            // Build recurrence object for backend
            const isRecurring = selectedRecurrenceId !== 'none';
            let recurrence: any = null;
            
            if (isRecurring) {
                const preset = RECURRENCE_PRESETS.find(p => p.id === selectedRecurrenceId);
                let frequency = preset?.frequency?.toUpperCase() || 'WEEKLY';
                let intervalValue = 1;
                
                if (selectedRecurrenceId === 'custom') {
                    frequency = customUnit === 'day' ? 'DAILY' : customUnit === 'week' ? 'WEEKLY' : 'MONTHLY';
                    intervalValue = customInterval;
                } else if (selectedRecurrenceId === 'biweekly') {
                    frequency = 'BIWEEKLY';
                    intervalValue = 1;
                } else if (selectedRecurrenceId === 'weekdays') {
                    frequency = 'WEEKLY';
                }

                // Format date as YYYY-MM-DD for LocalDate
                const formatLocalDate = (date: Date) => {
                    return date.toISOString().split('T')[0];
                };

                // Build scheduled time string if specified
                const scheduledTime = hasTime 
                    ? `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}:00`
                    : null;
                
                recurrence = {
                    frequency: frequency,
                    intervalValue: intervalValue,
                    startDate: formatLocalDate(recurrenceStartDate),
                    endDate: hasEndDate && recurrenceEndDate ? formatLocalDate(recurrenceEndDate) : null,
                    dayOfWeek: (selectedRecurrenceId === 'weekly' || selectedRecurrenceId === 'biweekly') 
                        ? selectedDayOfWeek : null,
                    dayOfMonth: selectedRecurrenceId === 'monthly' ? selectedDayOfMonth : null,
                    yearlyDate: selectedRecurrenceId === 'yearly' 
                        ? formatLocalDate(yearlyDate) : null,
                    scheduledTime: scheduledTime,
                };
            }

            // Build attachments in backend format
            const formattedAttachments = attachments.length > 0 
                ? attachments.map(att => ({
                    filename: att.name || att.uri.split('/').pop() || 'attachment',
                    fileUrl: att.uri,
                    fileType: att.type || 'application/octet-stream',
                    fileSize: att.size || null,
                }))
                : null;

            // Create the task with backend-compatible format
            const taskData: any = {
                title: title,
                description: description,
                eisenhowerQuadrantId: eisenhowerQuadrantId,
                lifeWheelAreaId: selectedLifeWheelAreaId || template.defaultLifeWheelAreaId,
                sprintId: isRecurring ? null : selectedSprintId,
                storyPoints: storyPoints,
                status: 'TODO',
                createdFromTemplateId: template.id,
                // Recurrence
                isRecurring: isRecurring,
                recurrence: recurrence,
                // Target date for non-recurring tasks
                targetDate: !isRecurring && targetDate ? targetDate.toISOString() : null,
                // Tags as array of strings
                tags: tags.length > 0 ? tags : null,
                // Initial comment
                comment: comment.trim() || null,
                // Attachments
                attachments: formattedAttachments,
                // Event fields
                isEvent: template.type === 'event',
                location: template.type === 'event' ? location : null,
                isAllDay: template.type === 'event' ? isAllDay : false,
            };

            const newTask = await taskApi.createTask(taskData);
            
            if (newTask && onSuccess) {
                onSuccess(newTask.id);
            }
            
            Alert.alert(
                'Success!',
                `${template.type === 'event' ? 'Event' : 'Task'} created successfully`,
                [{ text: 'OK', onPress: onClose }]
            );
        } catch (error) {
            console.error('Failed to create task:', error);
            Alert.alert('Error', 'Failed to create task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Get selected quadrant info for display
    const selectedQuadrant = quadrants.find(q => q.id === eisenhowerQuadrantId);
    const selectedRecurrence = RECURRENCE_PRESETS.find(p => p.id === selectedRecurrenceId);
    const selectedSprint = getSelectedSprint();
    
    // Get current life wheel config
    const currentWheelAreaId = selectedLifeWheelAreaId || template?.defaultLifeWheelAreaId;
    const currentWheelConfig = currentWheelAreaId 
        ? LIFE_WHEEL_CONFIG[currentWheelAreaId] || { color: '#6b7280', name: 'General', emoji: '📋' }
        : { color: '#6b7280', name: 'General', emoji: '📋' };

    if (!template) return null;

    return (
        <>
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 bg-white">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                        <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                            <Ionicons name="close" size={28} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-lg font-semibold">
                            Create {template.type === 'event' ? 'Event' : 'Task'}
                        </Text>
                        <View className="w-10" />
                    </View>

                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Template Badge */}
                        <View className="px-4 pt-4 pb-2">
                            <View
                                className="flex-row items-center p-3 rounded-xl"
                                style={{ backgroundColor: currentWheelConfig.color + '10' }}
                            >
                                <Text className="text-2xl mr-3">{template.icon || currentWheelConfig.emoji}</Text>
                                <View className="flex-1">
                                    <Text className="text-sm text-gray-500">From template</Text>
                                    <Text className="font-semibold text-gray-900">{template.name}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowLifeWheelPicker(true)}
                                    className="px-3 py-1.5 rounded-full flex-row items-center"
                                    style={{ backgroundColor: currentWheelConfig.color + '20' }}
                                >
                                    <Text className="text-xs font-medium mr-1" style={{ color: currentWheelConfig.color }}>
                                        {currentWheelConfig.name}
                                    </Text>
                                    <Ionicons name="chevron-down" size={12} color={currentWheelConfig.color} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="px-4 py-4">
                            {/* Title */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">Title *</Text>
                                <TextInput
                                    className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
                                    placeholder="Enter title..."
                                    placeholderTextColor="#9ca3af"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>

                            {/* Description */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                                <TextInput
                                    className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
                                    placeholder="Add description..."
                                    placeholderTextColor="#9ca3af"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    style={{ minHeight: 80 }}
                                />
                            </View>

                            {/* Repeat / Recurrence - FIRST because it controls Sprint visibility */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold text-gray-700 mb-3">Repeat</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
                                    <View className="flex-row gap-2">
                                        {RECURRENCE_PRESETS.map((preset) => (
                                            <TouchableOpacity
                                                key={preset.id}
                                                onPress={() => setSelectedRecurrenceId(preset.id)}
                                                className={`px-4 py-2.5 rounded-xl border-2 flex-row items-center ${
                                                    selectedRecurrenceId === preset.id
                                                        ? 'bg-purple-50 border-purple-500'
                                                        : 'bg-white border-gray-200'
                                                }`}
                                            >
                                                <Text className="mr-2">{preset.emoji}</Text>
                                                <Text
                                                    className={`font-medium ${
                                                        selectedRecurrenceId === preset.id
                                                            ? 'text-purple-700'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    {preset.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                {/* Custom Recurrence Options */}
                                {selectedRecurrenceId === 'custom' && (
                                    <View className="mt-3 p-4 bg-purple-50 rounded-xl">
                                        <View className="flex-row items-center gap-3">
                                            <View className="flex-row items-center bg-white rounded-lg border border-purple-200 overflow-hidden">
                                                {CUSTOM_INTERVALS.map((int) => (
                                                    <TouchableOpacity
                                                        key={int.value}
                                                        onPress={() => setCustomInterval(int.value)}
                                                        className={`px-3 py-2 ${
                                                            customInterval === int.value ? 'bg-purple-500' : ''
                                                        }`}
                                                    >
                                                        <Text className={customInterval === int.value ? 'text-white font-medium' : 'text-gray-700'}>
                                                            {int.value}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                            <View className="flex-row items-center bg-white rounded-lg border border-purple-200 overflow-hidden flex-1">
                                                {CUSTOM_UNITS.map((unit) => (
                                                    <TouchableOpacity
                                                        key={unit.value}
                                                        onPress={() => setCustomUnit(unit.value as any)}
                                                        className={`flex-1 px-3 py-2 items-center ${
                                                            customUnit === unit.value ? 'bg-purple-500' : ''
                                                        }`}
                                                    >
                                                        <Text className={customUnit === unit.value ? 'text-white font-medium' : 'text-gray-700'}>
                                                            {unit.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {/* Day of Week Selector - For Weekly, Bi-weekly, Weekdays */}
                                {(selectedRecurrenceId === 'weekly' || selectedRecurrenceId === 'biweekly') && (
                                    <View className="mt-3 p-4 bg-blue-50 rounded-xl">
                                        <Text className="text-xs font-medium text-blue-700 mb-2">
                                            Every {selectedRecurrenceId === 'biweekly' ? 'other ' : ''}
                                        </Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row gap-2">
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <TouchableOpacity
                                                        key={day.id}
                                                        onPress={() => setSelectedDayOfWeek(day.id)}
                                                        className={`w-12 h-12 rounded-xl items-center justify-center border-2 ${
                                                            selectedDayOfWeek === day.id
                                                                ? 'bg-blue-500 border-blue-500'
                                                                : 'bg-white border-gray-200'
                                                        }`}
                                                    >
                                                        <Text className={`font-semibold ${
                                                            selectedDayOfWeek === day.id ? 'text-white' : 'text-gray-700'
                                                        }`}>
                                                            {day.short}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                )}

                                {/* Day of Month Selector - For Monthly */}
                                {selectedRecurrenceId === 'monthly' && (
                                    <View className="mt-3 p-4 bg-indigo-50 rounded-xl">
                                        <Text className="text-xs font-medium text-indigo-700 mb-2">On day of month</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row gap-1.5">
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                    <TouchableOpacity
                                                        key={day}
                                                        onPress={() => setSelectedDayOfMonth(day)}
                                                        className={`w-9 h-9 rounded-lg items-center justify-center ${
                                                            selectedDayOfMonth === day
                                                                ? 'bg-indigo-500'
                                                                : 'bg-white border border-gray-200'
                                                        }`}
                                                    >
                                                        <Text className={`text-sm font-medium ${
                                                            selectedDayOfMonth === day ? 'text-white' : 'text-gray-700'
                                                        }`}>
                                                            {day}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                )}

                                {/* Yearly Date Selector */}
                                {selectedRecurrenceId === 'yearly' && (
                                    <View className="mt-3">
                                        <TouchableOpacity
                                            onPress={() => { 
                                                setDatePickerMode('yearly'); 
                                                setShowDatePicker(true); 
                                            }}
                                            activeOpacity={0.7}
                                            className="p-4 bg-pink-50 rounded-xl border border-pink-200 flex-row items-center"
                                        >
                                            <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center mr-3">
                                                <Text className="text-lg">🎂</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-xs text-pink-600 font-medium">Every year on</Text>
                                                <Text className="text-pink-800 font-semibold text-lg">
                                                    {yearlyDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                                </Text>
                                            </View>
                                            <Ionicons name="calendar" size={22} color="#db2777" />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Optional Time Selector - For Daily, Weekly, Bi-weekly */}
                                {(selectedRecurrenceId === 'daily' || selectedRecurrenceId === 'weekly' || 
                                  selectedRecurrenceId === 'biweekly' || selectedRecurrenceId === 'weekdays') && (
                                    <View className="mt-3">
                                        <TouchableOpacity
                                            onPress={() => setHasTime(!hasTime)}
                                            className={`flex-row items-center p-3 rounded-xl border ${
                                                hasTime ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                                                hasTime ? 'bg-amber-100' : 'bg-gray-200'
                                            }`}>
                                                <Ionicons name="time-outline" size={18} color={hasTime ? '#d97706' : '#6b7280'} />
                                            </View>
                                            <Text className={`flex-1 font-medium ${hasTime ? 'text-amber-800' : 'text-gray-600'}`}>
                                                {hasTime 
                                                    ? `At ${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
                                                    : 'Add specific time (optional)'
                                                }
                                            </Text>
                                            <Ionicons 
                                                name={hasTime ? "checkbox" : "square-outline"} 
                                                size={22} 
                                                color={hasTime ? "#d97706" : "#9ca3af"} 
                                            />
                                        </TouchableOpacity>

                                        {/* Time Picker */}
                                        {hasTime && (
                                            <View className="mt-2 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                <View className="flex-row items-center justify-center gap-2">
                                                    {/* Hour Selector */}
                                                    <View className="flex-1">
                                                        <Text className="text-xs text-amber-700 font-medium mb-2 text-center">Hour</Text>
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-12">
                                                            <View className="flex-row gap-1">
                                                                {HOURS.map((hour) => (
                                                                    <TouchableOpacity
                                                                        key={hour}
                                                                        onPress={() => setSelectedHour(hour)}
                                                                        className={`w-10 h-10 rounded-lg items-center justify-center ${
                                                                            selectedHour === hour
                                                                                ? 'bg-amber-500'
                                                                                : 'bg-white border border-amber-200'
                                                                        }`}
                                                                    >
                                                                        <Text className={`font-medium ${
                                                                            selectedHour === hour ? 'text-white' : 'text-gray-700'
                                                                        }`}>
                                                                            {hour.toString().padStart(2, '0')}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        </ScrollView>
                                                    </View>
                                                </View>
                                                {/* Minute Selector */}
                                                <View className="mt-3">
                                                    <Text className="text-xs text-amber-700 font-medium mb-2 text-center">Minute</Text>
                                                    <View className="flex-row justify-center gap-3">
                                                        {MINUTES.map((minute) => (
                                                            <TouchableOpacity
                                                                key={minute}
                                                                onPress={() => setSelectedMinute(minute)}
                                                                className={`w-14 h-10 rounded-lg items-center justify-center ${
                                                                    selectedMinute === minute
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-white border border-amber-200'
                                                                }`}
                                                            >
                                                                <Text className={`font-medium ${
                                                                    selectedMinute === minute ? 'text-white' : 'text-gray-700'
                                                                }`}>
                                                                    :{minute.toString().padStart(2, '0')}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Start & End Date for Recurring Tasks - NOT for yearly (already has date picker) */}
                                {selectedRecurrenceId !== 'none' && selectedRecurrenceId !== 'yearly' && (
                                    <View className="mt-4 space-y-3">
                                        {/* Start Date */}
                                        <TouchableOpacity
                                            onPress={() => { setDatePickerMode('start'); setShowDatePicker(true); }}
                                            className="p-3 rounded-xl bg-green-50 border border-green-200 flex-row items-center"
                                        >
                                            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                                                <Ionicons name="play" size={16} color="#16a34a" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-xs text-green-600 font-medium">Starts</Text>
                                                <Text className="text-green-800 font-semibold">
                                                    {recurrenceStartDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </Text>
                                            </View>
                                            <Ionicons name="calendar" size={20} color="#16a34a" />
                                        </TouchableOpacity>

                                        {/* End Date */}
                                        <View className="flex-row items-center gap-3 mt-3">
                                            <TouchableOpacity
                                                onPress={() => setHasEndDate(!hasEndDate)}
                                                className={`flex-row items-center px-3 py-2 rounded-lg border ${
                                                    hasEndDate ? 'bg-orange-50 border-orange-300' : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <Ionicons 
                                                    name={hasEndDate ? "checkbox" : "square-outline"} 
                                                    size={20} 
                                                    color={hasEndDate ? "#ea580c" : "#9ca3af"} 
                                                />
                                                <Text className={`ml-2 ${hasEndDate ? 'text-orange-700 font-medium' : 'text-gray-500'}`}>
                                                    Has end date
                                                </Text>
                                            </TouchableOpacity>
                                            
                                            {hasEndDate && (
                                                <TouchableOpacity
                                                    onPress={() => { setDatePickerMode('end'); setShowDatePicker(true); }}
                                                    className="flex-1 p-3 rounded-xl bg-orange-50 border border-orange-200 flex-row items-center"
                                                >
                                                    <View className="flex-1">
                                                        <Text className="text-xs text-orange-600 font-medium">Ends</Text>
                                                        <Text className="text-orange-800 font-semibold">
                                                            {recurrenceEndDate 
                                                                ? recurrenceEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                : 'Select date'
                                                            }
                                                        </Text>
                                                    </View>
                                                    <Ionicons name="calendar" size={18} color="#ea580c" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Sprint Selection - ONLY show for one-time tasks */}
                            {selectedRecurrenceId === 'none' && (
                                <View className="mb-5">
                                    <Text className="text-sm font-semibold text-gray-700 mb-3">Sprint</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowSprintPicker(true)}
                                        className={`p-4 rounded-xl border-2 flex-row items-center ${
                                            selectedSprintId ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                                            selectedSprintId ? 'bg-blue-100' : 'bg-gray-200'
                                        }`}>
                                            <Text className="text-lg">{selectedSprintId ? '🏃' : '📦'}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-xs text-gray-500">
                                                {selectedSprintId ? 'Assigned to' : 'Not assigned'}
                                            </Text>
                                            <Text className={`font-semibold ${selectedSprintId ? 'text-blue-700' : 'text-gray-600'}`}>
                                                {selectedSprint ? formatSprintName(selectedSprint) : 'Backlog (no sprint)'}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                    
                                    {/* Optional Due Date for one-time tasks */}
                                    <TouchableOpacity
                                        onPress={() => { setDatePickerMode('target'); setShowDatePicker(true); }}
                                        className="mt-3 p-3 rounded-xl bg-gray-50 flex-row items-center"
                                    >
                                        <Ionicons name="flag-outline" size={18} color="#6B7280" />
                                        <Text className="text-gray-600 ml-2 flex-1">
                                            {targetDate 
                                                ? `Due: ${targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                                                : 'Set due date (optional)'}
                                        </Text>
                                        {targetDate && (
                                            <TouchableOpacity onPress={() => setTargetDate(null)}>
                                                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Story Points - Like Sprint View */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold text-gray-700 mb-3">Point Size</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {STORY_POINTS.map((points) => (
                                        <TouchableOpacity
                                            key={points}
                                            onPress={() => setStoryPoints(points)}
                                            className={`w-12 h-12 rounded-xl items-center justify-center border-2 ${
                                                storyPoints === points 
                                                    ? 'bg-blue-600 border-blue-600' 
                                                    : 'bg-white border-gray-200'
                                            }`}
                                        >
                                            <Text className={`text-base font-bold ${
                                                storyPoints === points ? 'text-white' : 'text-gray-700'
                                            }`}>
                                                {points}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Eisenhower Matrix - 2x2 Grid */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold text-gray-700 mb-3">Priority</Text>
                                {loadingQuadrants ? (
                                    <View className="py-4 items-center">
                                        <ActivityIndicator size="small" color="#3b82f6" />
                                    </View>
                                ) : (
                                    <View className="flex-row flex-wrap gap-2">
                                        {quadrants.map((quad) => (
                                            <TouchableOpacity
                                                key={quad.id}
                                                onPress={() => setEisenhowerQuadrantId(quad.id)}
                                                className={`w-[48%] p-3 rounded-xl border-2 ${
                                                    eisenhowerQuadrantId === quad.id 
                                                        ? 'border-gray-900' 
                                                        : 'border-gray-200'
                                                }`}
                                                style={{
                                                    backgroundColor: eisenhowerQuadrantId === quad.id 
                                                        ? quad.color + '15' 
                                                        : 'white'
                                                }}
                                            >
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className={`font-bold text-sm ${
                                                        eisenhowerQuadrantId === quad.id ? 'text-gray-900' : 'text-gray-700'
                                                    }`} numberOfLines={1}>
                                                        {quad.name}
                                                    </Text>
                                                    {eisenhowerQuadrantId === quad.id && (
                                                        <View 
                                                            className="w-4 h-4 rounded-full items-center justify-center"
                                                            style={{ backgroundColor: quad.color }}
                                                        >
                                                            <Ionicons name="checkmark" size={10} color="white" />
                                                        </View>
                                                    )}
                                                </View>
                                                <Text className="text-xs text-gray-500" numberOfLines={1}>
                                                    {quad.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Tags */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold text-gray-700 mb-3">Tags</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <View
                                            key={tag}
                                            className="flex-row items-center bg-gray-100 rounded-full px-3 py-1.5"
                                        >
                                            <Text className="text-sm text-gray-700 mr-1">#{tag}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {showTagInput ? (
                                        <View className="flex-row items-center bg-gray-50 rounded-full px-3 py-1 border border-gray-200">
                                            <Text className="text-gray-400">#</Text>
                                            <TextInput
                                                className="text-sm text-gray-900 py-0.5 min-w-[60px]"
                                                placeholder="tag"
                                                placeholderTextColor="#9CA3AF"
                                                value={newTag}
                                                onChangeText={setNewTag}
                                                onSubmitEditing={handleAddTag}
                                                autoFocus
                                                returnKeyType="done"
                                            />
                                            <TouchableOpacity onPress={() => { setShowTagInput(false); setNewTag(''); }}>
                                                <Ionicons name="close" size={16} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => setShowTagInput(true)}
                                            className="flex-row items-center bg-gray-50 rounded-full px-3 py-1.5 border border-dashed border-gray-300"
                                        >
                                            <Ionicons name="add" size={16} color="#6B7280" />
                                            <Text className="text-sm text-gray-500 ml-1">Add tag</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Comment with Rich Text */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold text-gray-700 mb-3">Comment</Text>
                                <View className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                                    {/* Rich Text Toolbar */}
                                    <View className="flex-row items-center px-3 py-2 border-b border-gray-200 bg-white">
                                        <TouchableOpacity
                                            onPress={() => setCommentBold(!commentBold)}
                                            className={`w-8 h-8 rounded-lg items-center justify-center mr-1 ${
                                                commentBold ? 'bg-blue-100' : ''
                                            }`}
                                        >
                                            <Text className={`font-bold ${commentBold ? 'text-blue-600' : 'text-gray-600'}`}>B</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setCommentItalic(!commentItalic)}
                                            className={`w-8 h-8 rounded-lg items-center justify-center mr-1 ${
                                                commentItalic ? 'bg-blue-100' : ''
                                            }`}
                                        >
                                            <Text className={`italic ${commentItalic ? 'text-blue-600' : 'text-gray-600'}`}>I</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setCommentBulletList(!commentBulletList)}
                                            className={`w-8 h-8 rounded-lg items-center justify-center mr-1 ${
                                                commentBulletList ? 'bg-blue-100' : ''
                                            }`}
                                        >
                                            <Ionicons name="list" size={18} color={commentBulletList ? '#2563eb' : '#6b7280'} />
                                        </TouchableOpacity>
                                        
                                        <View className="h-5 w-px bg-gray-300 mx-2" />
                                        
                                        {/* Attachment Button */}
                                        <TouchableOpacity
                                            onPress={() => {
                                                // Simulate adding an attachment
                                                Alert.alert(
                                                    'Add Attachment',
                                                    'Choose attachment type',
                                                    [
                                                        { text: 'Photo Library', onPress: () => setAttachments([...attachments, { name: 'image.jpg', type: 'image' }]) },
                                                        { text: 'Take Photo', onPress: () => setAttachments([...attachments, { name: 'photo.jpg', type: 'image' }]) },
                                                        { text: 'File', onPress: () => setAttachments([...attachments, { name: 'document.pdf', type: 'file' }]) },
                                                        { text: 'Cancel', style: 'cancel' },
                                                    ]
                                                );
                                            }}
                                            className="w-8 h-8 rounded-lg items-center justify-center mr-1"
                                        >
                                            <Ionicons name="attach" size={18} color="#6b7280" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert('Add Image', 'Select from gallery', [
                                                    { text: 'Choose Image', onPress: () => setAttachments([...attachments, { name: 'image.png', type: 'image' }]) },
                                                    { text: 'Cancel', style: 'cancel' },
                                                ]);
                                            }}
                                            className="w-8 h-8 rounded-lg items-center justify-center"
                                        >
                                            <Ionicons name="image-outline" size={18} color="#6b7280" />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {/* Text Input */}
                                    <TextInput
                                        className="px-4 py-3 text-gray-900"
                                        placeholder="Add a comment..."
                                        placeholderTextColor="#9ca3af"
                                        value={comment}
                                        onChangeText={setComment}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                        style={{ 
                                            minHeight: 80,
                                            fontWeight: commentBold ? 'bold' : 'normal',
                                            fontStyle: commentItalic ? 'italic' : 'normal',
                                        }}
                                    />
                                    
                                    {/* Attachments Preview */}
                                    {attachments.length > 0 && (
                                        <View className="px-4 pb-3">
                                            <View className="flex-row flex-wrap gap-2">
                                                {attachments.map((att, idx) => (
                                                    <View
                                                        key={idx}
                                                        className="flex-row items-center bg-white rounded-lg px-2 py-1.5 border border-gray-200"
                                                    >
                                                        <Ionicons 
                                                            name={att.type === 'image' ? 'image' : 'document'} 
                                                            size={14} 
                                                            color="#6b7280" 
                                                        />
                                                        <Text className="text-xs text-gray-600 ml-1.5 mr-1">{att.name}</Text>
                                                        <TouchableOpacity onPress={() => setAttachments(attachments.filter((_, i) => i !== idx))}>
                                                            <Ionicons name="close-circle" size={14} color="#9ca3af" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Event-specific fields */}
                            {template.type === 'event' && (
                                <>
                                    {/* Location */}
                                    <View className="mb-4">
                                        <Text className="text-sm font-medium text-gray-700 mb-2">Location</Text>
                                        <View className="flex-row items-center bg-gray-50 rounded-xl px-4">
                                            <Ionicons name="location-outline" size={20} color="#6b7280" />
                                            <TextInput
                                                className="flex-1 py-3 ml-3 text-gray-900"
                                                placeholder="Add location..."
                                                placeholderTextColor="#9ca3af"
                                                value={location}
                                                onChangeText={setLocation}
                                            />
                                        </View>
                                    </View>

                                    {/* All Day Toggle */}
                                    <View className="flex-row items-center justify-between mb-4 bg-gray-50 rounded-xl px-4 py-3">
                                        <View className="flex-row items-center">
                                            <Ionicons name="sunny-outline" size={20} color="#6b7280" />
                                            <Text className="text-gray-700 ml-3">All day event</Text>
                                        </View>
                                        <Switch
                                            value={isAllDay}
                                            onValueChange={setIsAllDay}
                                            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                                            thumbColor={isAllDay ? '#3b82f6' : '#f4f4f5'}
                                        />
                                    </View>
                                </>
                            )}

                            {/* AI Refinement */}
                            <View className="flex-row items-center justify-between mb-4 bg-purple-50 rounded-xl px-4 py-3">
                                <View className="flex-row items-center flex-1">
                                    <Text className="text-xl">✨</Text>
                                    <View className="ml-3 flex-1">
                                        <Text className="text-gray-900 font-medium">AI Refinement</Text>
                                        <Text className="text-xs text-gray-500">
                                            Enhance with SensAI suggestions
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={useAiRefinement}
                                    onValueChange={setUseAiRefinement}
                                    trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                                    thumbColor={useAiRefinement ? '#8b5cf6' : '#f4f4f5'}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Button - Full width to edges */}
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={isLoading}
                        className={`py-5 items-center flex-row justify-center ${
                            isLoading ? 'bg-gray-300' : 'bg-blue-600'
                        }`}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <Text className="text-white font-bold text-lg">Creating...</Text>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="white" />
                                <Text className="text-white font-bold text-lg ml-2">
                                    Create {template.type === 'event' ? 'Event' : 'Task'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>

        {/* Sprint Picker Modal */}
        <Modal
            visible={showSprintPicker}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowSprintPicker(false)}
        >
            <View className="flex-1 bg-white">
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => setShowSprintPicker(false)} className="p-2 -ml-2">
                        <Ionicons name="close" size={28} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold">Select Sprint</Text>
                    <View className="w-10" />
                </View>
                <ScrollView className="flex-1 p-4">
                    {sprints.map((sprint) => (
                        <TouchableOpacity
                            key={sprint.id}
                            onPress={() => {
                                setSelectedSprintId(sprint.id);
                                setShowSprintPicker(false);
                            }}
                            className={`p-4 rounded-xl mb-3 border-2 ${
                                selectedSprintId === sprint.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 bg-gray-50'
                            }`}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className={`font-semibold ${selectedSprintId === sprint.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                        {formatSprintName(sprint)}
                                    </Text>
                                    <Text className="text-xs text-gray-500 mt-1">
                                        {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                                    </Text>
                                </View>
                                {selectedSprintId === sprint.id && (
                                    <MaterialCommunityIcons name="check-circle" size={24} color="#2563EB" />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Modal>

        {/* Life Wheel Area Picker Modal */}
        <Modal
            visible={showLifeWheelPicker}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowLifeWheelPicker(false)}
        >
            <View className="flex-1 bg-white">
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => setShowLifeWheelPicker(false)} className="p-2 -ml-2">
                        <Ionicons name="close" size={28} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold">Select Life Area</Text>
                    <View className="w-10" />
                </View>
                <ScrollView className="flex-1 p-4">
                    {Object.entries(LIFE_WHEEL_CONFIG).map(([id, config]) => (
                        <TouchableOpacity
                            key={id}
                            onPress={() => {
                                setSelectedLifeWheelAreaId(id);
                                setShowLifeWheelPicker(false);
                            }}
                            className={`p-4 rounded-xl mb-3 border-2 flex-row items-center ${
                                selectedLifeWheelAreaId === id 
                                    ? 'border-blue-500' 
                                    : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: selectedLifeWheelAreaId === id ? config.color + '15' : '#f9fafb' }}
                        >
                            <Text className="text-2xl mr-3">{config.emoji}</Text>
                            <Text 
                                className={`flex-1 font-medium ${selectedLifeWheelAreaId === id ? 'text-gray-900' : 'text-gray-700'}`}
                            >
                                {config.name}
                            </Text>
                            {selectedLifeWheelAreaId === id && (
                                <MaterialCommunityIcons name="check-circle" size={24} color={config.color} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Modal>

        {/* Date Picker Modal - Handles target, start, end, yearly dates */}
        <Modal
            visible={showDatePicker}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowDatePicker(false)}
        >
            <View className="flex-1 bg-white">
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => setShowDatePicker(false)} className="p-2 -ml-2">
                        <Ionicons name="close" size={28} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold">
                        {datePickerMode === 'target' ? 'Due Date' : 
                         datePickerMode === 'start' ? 'Start Date' : 
                         datePickerMode === 'yearly' ? 'Yearly Date' : 'End Date'}
                    </Text>
                    {datePickerMode === 'target' && (
                        <TouchableOpacity 
                            onPress={() => {
                                setTargetDate(null);
                                setShowDatePicker(false);
                            }} 
                            className="p-2"
                        >
                            <Text className="text-red-500 font-medium">Clear</Text>
                        </TouchableOpacity>
                    )}
                    {datePickerMode === 'end' && (
                        <TouchableOpacity 
                            onPress={() => {
                                setRecurrenceEndDate(null);
                                setHasEndDate(false);
                                setShowDatePicker(false);
                            }} 
                            className="p-2"
                        >
                            <Text className="text-red-500 font-medium">Clear</Text>
                        </TouchableOpacity>
                    )}
                    {(datePickerMode === 'start' || datePickerMode === 'yearly') && <View className="w-10" />}
                </View>
                
                {/* Info banner for yearly */}
                {datePickerMode === 'yearly' && (
                    <View className="mx-4 mt-4 p-3 bg-pink-50 rounded-xl">
                        <Text className="text-center text-pink-700 font-medium">
                            🎂 Pick the month and day for your yearly event
                        </Text>
                    </View>
                )}
                
                <View className="flex-1 p-4">
                    <Calendar
                        current={datePickerMode === 'yearly' ? yearlyDate.toISOString().split('T')[0] : undefined}
                        onDayPress={(day: { dateString: string }) => {
                            const selectedDate = new Date(day.dateString);
                            if (datePickerMode === 'target') {
                                setTargetDate(selectedDate);
                            } else if (datePickerMode === 'start') {
                                setRecurrenceStartDate(selectedDate);
                            } else if (datePickerMode === 'yearly') {
                                selectedDate.setFullYear(new Date().getFullYear());
                                setYearlyDate(selectedDate);
                            } else {
                                setRecurrenceEndDate(selectedDate);
                            }
                            setShowDatePicker(false);
                        }}
                        markedDates={{
                            ...(datePickerMode === 'target' && targetDate ? {
                                [targetDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#3b82f6' }
                            } : {}),
                            ...(datePickerMode === 'start' ? {
                                [recurrenceStartDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#16a34a' }
                            } : {}),
                            ...(datePickerMode === 'end' && recurrenceEndDate ? {
                                [recurrenceEndDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#ea580c' }
                            } : {}),
                            ...(datePickerMode === 'yearly' ? {
                                [yearlyDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#db2777' }
                            } : {}),
                        }}
                        minDate={datePickerMode === 'end' ? recurrenceStartDate.toISOString().split('T')[0] : undefined}
                        theme={{
                            todayTextColor: datePickerMode === 'yearly' ? '#db2777' : '#3b82f6',
                            selectedDayBackgroundColor: 
                                datePickerMode === 'start' ? '#16a34a' : 
                                datePickerMode === 'end' ? '#ea580c' : 
                                datePickerMode === 'yearly' ? '#db2777' : '#3b82f6',
                            arrowColor: datePickerMode === 'yearly' ? '#db2777' : '#3b82f6',
                        }}
                    />
                </View>
            </View>
        </Modal>
    </>
    );
}

export default CreateFromTemplateSheet;
