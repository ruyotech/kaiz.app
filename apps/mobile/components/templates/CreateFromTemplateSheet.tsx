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
import { Ionicons } from '@expo/vector-icons';
import { TaskTemplate, RecurrencePattern } from '../../types/models';
import { LIFE_WHEEL_CONFIG } from './TemplateCard';
import { useTemplateStore } from '../../store/templateStore';
import { taskApi, sprintApi } from '../../services/api';

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

type SprintOption = 'current' | 'next' | 'backlog' | string;

const RECURRENCE_OPTIONS: { label: string; value: RecurrencePattern | null }[] = [
    { label: 'No recurrence', value: null },
    { label: 'Daily', value: { frequency: 'daily', interval: 1, endDate: null } },
    { label: 'Weekly', value: { frequency: 'weekly', interval: 1, endDate: null } },
    { label: 'Bi-weekly', value: { frequency: 'biweekly', interval: 1, endDate: null } },
    { label: 'Monthly', value: { frequency: 'monthly', interval: 1, endDate: null } },
    { label: 'Yearly', value: { frequency: 'yearly', interval: 1, endDate: null } },
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
    const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
    const [nextSprint, setNextSprint] = useState<Sprint | null>(null);
    const [loadingSprints, setLoadingSprints] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSprint, setSelectedSprint] = useState<SprintOption>('current');
    const [recurrence, setRecurrence] = useState<RecurrencePattern | null>(null);
    const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
    const [duration, setDuration] = useState<number>(30);
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [useAiRefinement, setUseAiRefinement] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Event-specific state
    const [location, setLocation] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);

    useEffect(() => {
        if (template) {
            setTitle(template.name);
            setDescription(template.description || '');
            setDuration(template.defaultDuration || 30);
            setPriority('MEDIUM'); // Templates don't have priority, use default
            setRecurrence(template.recurrencePattern || null);
            setLocation(template.defaultLocation || '');
            setIsAllDay(template.isAllDay || false);
            
            // Set suggested sprint
            if (template.suggestedSprint) {
                setSelectedSprint(template.suggestedSprint.toLowerCase());
            }
        }
    }, [template]);

    useEffect(() => {
        if (visible) {
            fetchSprints();
        }
    }, [visible]);

    const fetchSprints = async () => {
        setLoadingSprints(true);
        try {
            const currentYear = new Date().getFullYear();
            const sprintData = await sprintApi.getSprints(currentYear);
            const now = new Date();
            
            // Find current and next sprints
            const availableSprints = sprintData.filter((s: Sprint) => 
                new Date(s.endDate) >= now
            ).sort((a: Sprint, b: Sprint) => 
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );
            
            setSprints(availableSprints);
            if (availableSprints.length > 0) {
                setCurrentSprint(availableSprints[0]);
                if (availableSprints.length > 1) {
                    setNextSprint(availableSprints[1]);
                }
            }
        } catch (error) {
            console.error('Failed to load sprints:', error);
        } finally {
            setLoadingSprints(false);
        }
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

            // Determine sprint ID
            let sprintId: string | null = null;
            if (selectedSprint === 'current' && currentSprint) {
                sprintId = currentSprint.id;
            } else if (selectedSprint === 'next' && nextSprint) {
                sprintId = nextSprint.id;
            } else if (selectedSprint !== 'backlog' && selectedSprint !== 'current' && selectedSprint !== 'next') {
                sprintId = selectedSprint;
            }

            // Create the task
            const taskData: any = {
                title: title,
                description: description,
                priority: priority,
                lifeWheelAreaId: template.defaultLifeWheelAreaId,
                sprintId: sprintId,
                storyPoints: template.defaultStoryPoints || 3,
                status: 'todo',
                // Event fields
                ...(template.type === 'event' && {
                    isEvent: true,
                    location: location,
                    isAllDay: isAllDay,
                    durationMinutes: duration,
                }),
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

    if (!template) return null;

    const wheelConfig = template.defaultLifeWheelAreaId
        ? LIFE_WHEEL_CONFIG[template.defaultLifeWheelAreaId]
        : { color: '#6b7280', name: 'General', emoji: '📋' };

    return (
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
                                style={{ backgroundColor: wheelConfig.color + '10' }}
                            >
                                <Text className="text-2xl mr-3">{template.icon || wheelConfig.emoji}</Text>
                                <View className="flex-1">
                                    <Text className="text-sm text-gray-500">From template</Text>
                                    <Text className="font-semibold text-gray-900">{template.name}</Text>
                                </View>
                                <View
                                    className="px-2 py-1 rounded-full"
                                    style={{ backgroundColor: wheelConfig.color + '20' }}
                                >
                                    <Text className="text-xs font-medium" style={{ color: wheelConfig.color }}>
                                        {wheelConfig.name}
                                    </Text>
                                </View>
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

                            {/* Sprint Selection */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    Add to Sprint
                                </Text>
                                {loadingSprints ? (
                                    <View className="py-4 items-center">
                                        <ActivityIndicator size="small" color="#3b82f6" />
                                    </View>
                                ) : (
                                    <View className="flex-row flex-wrap gap-2">
                                        {currentSprint && (
                                            <TouchableOpacity
                                                onPress={() => setSelectedSprint('current')}
                                                className={`px-4 py-2 rounded-xl border ${
                                                    selectedSprint === 'current'
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <Text
                                                    className={`font-medium ${
                                                        selectedSprint === 'current' ? 'text-white' : 'text-gray-700'
                                                    }`}
                                                >
                                                    🏃 Current Sprint
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        {nextSprint && (
                                            <TouchableOpacity
                                                onPress={() => setSelectedSprint('next')}
                                                className={`px-4 py-2 rounded-xl border ${
                                                    selectedSprint === 'next'
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <Text
                                                    className={`font-medium ${
                                                        selectedSprint === 'next' ? 'text-white' : 'text-gray-700'
                                                    }`}
                                                >
                                                    📅 Next Sprint
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => setSelectedSprint('backlog')}
                                            className={`px-4 py-2 rounded-xl border ${
                                                selectedSprint === 'backlog'
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <Text
                                                className={`font-medium ${
                                                    selectedSprint === 'backlog' ? 'text-white' : 'text-gray-700'
                                                }`}
                                            >
                                                📦 Backlog
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Duration */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">
                                    Duration (minutes)
                                </Text>
                                <View className="flex-row items-center gap-2">
                                    {[15, 30, 45, 60, 90, 120].map((min) => (
                                        <TouchableOpacity
                                            key={min}
                                            onPress={() => setDuration(min)}
                                            className={`px-3 py-2 rounded-lg ${
                                                duration === min ? 'bg-blue-600' : 'bg-gray-100'
                                            }`}
                                        >
                                            <Text
                                                className={`text-sm font-medium ${
                                                    duration === min ? 'text-white' : 'text-gray-700'
                                                }`}
                                            >
                                                {min}m
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Priority */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">Priority</Text>
                                <View className="flex-row gap-2">
                                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                                        <TouchableOpacity
                                            key={p}
                                            onPress={() => setPriority(p)}
                                            className={`flex-1 py-3 rounded-xl items-center ${
                                                priority === p
                                                    ? p === 'HIGH'
                                                        ? 'bg-red-100'
                                                        : p === 'MEDIUM'
                                                        ? 'bg-yellow-100'
                                                        : 'bg-green-100'
                                                    : 'bg-gray-100'
                                            }`}
                                        >
                                            <Ionicons
                                                name="flag"
                                                size={18}
                                                color={
                                                    priority === p
                                                        ? p === 'HIGH'
                                                            ? '#ef4444'
                                                            : p === 'MEDIUM'
                                                            ? '#f59e0b'
                                                            : '#10b981'
                                                        : '#9ca3af'
                                                }
                                            />
                                            <Text
                                                className={`text-sm font-medium mt-1 capitalize ${
                                                    priority === p ? 'text-gray-900' : 'text-gray-500'
                                                }`}
                                            >
                                                {p.toLowerCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Recurrence */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 mb-2">Recurrence</Text>
                                <TouchableOpacity
                                    onPress={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
                                    className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between"
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="repeat" size={20} color="#6b7280" />
                                        <Text className="text-gray-700 ml-3">
                                            {recurrence
                                                ? RECURRENCE_OPTIONS.find(
                                                      (o) =>
                                                          o.value?.frequency === recurrence.frequency &&
                                                          o.value?.interval === recurrence.interval
                                                  )?.label || 'Custom'
                                                : 'No recurrence'}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={showRecurrenceOptions ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#6b7280"
                                    />
                                </TouchableOpacity>
                                {showRecurrenceOptions && (
                                    <View className="bg-gray-50 rounded-xl mt-2 overflow-hidden">
                                        {RECURRENCE_OPTIONS.map((option, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => {
                                                    setRecurrence(option.value);
                                                    setShowRecurrenceOptions(false);
                                                }}
                                                className={`px-4 py-3 flex-row items-center justify-between border-b border-gray-100 ${
                                                    JSON.stringify(recurrence) === JSON.stringify(option.value)
                                                        ? 'bg-blue-50'
                                                        : ''
                                                }`}
                                            >
                                                <Text
                                                    className={
                                                        JSON.stringify(recurrence) === JSON.stringify(option.value)
                                                            ? 'text-blue-600 font-medium'
                                                            : 'text-gray-700'
                                                    }
                                                >
                                                    {option.label}
                                                </Text>
                                                {JSON.stringify(recurrence) === JSON.stringify(option.value) && (
                                                    <Ionicons name="checkmark" size={20} color="#3b82f6" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
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

                    {/* Action Button */}
                    <View className="px-4 py-4 border-t border-gray-100">
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={isLoading}
                            className={`rounded-xl py-4 items-center flex-row justify-center ${
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
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export default CreateFromTemplateSheet;
