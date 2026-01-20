import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockApi } from '../../../../services/mockApi';
import { Task } from '../../../../types/models';
import lifeWheelAreasData from '../../../../data/mock/lifeWheelAreas.json';
import epicsData from '../../../../data/mock/epics.json';

export default function TaskDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<Task | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Task['status']>('draft');
    const [storyPoints, setStoryPoints] = useState<Task['storyPoints']>(3);
    const [eisenhowerQuadrantId, setEisenhowerQuadrantId] = useState('eq-2');
    const [lifeWheelAreaId, setLifeWheelAreaId] = useState('lw-1');
    const [sprintId, setSprintId] = useState<string | null>(null);
    const [epicId, setEpicId] = useState<string | null>(null);

    // Recurring task state
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'>('weekly');

    // Modal states
    const [showSprintPicker, setShowSprintPicker] = useState(false);
    const [showLifeWheelPicker, setShowLifeWheelPicker] = useState(false);
    const [showEpicPicker, setShowEpicPicker] = useState(false);
    const [sprints, setSprints] = useState<any[]>([]);

    useEffect(() => {
        loadTask();
        loadSprints();
    }, [id]);

    const loadTask = async () => {
        try {
            setLoading(true);
            const tasks = await mockApi.getTasks();
            const foundTask = tasks.find((t: Task) => t.id === id);

            if (foundTask) {
                setTask(foundTask);
                setTitle(foundTask.title);
                setDescription(foundTask.description);
                setStatus(foundTask.status);
                setStoryPoints(foundTask.storyPoints);
                setEisenhowerQuadrantId(foundTask.eisenhowerQuadrantId);
                setLifeWheelAreaId(foundTask.lifeWheelAreaId);
                setSprintId(foundTask.sprintId);
                setEpicId(foundTask.epicId);
                setIsRecurring(foundTask.isRecurring || false);
                if (foundTask.recurrencePattern) {
                    setRecurrenceFrequency(foundTask.recurrencePattern.frequency);
                }
            }
        } catch (error) {
            console.error('Error loading task:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSprints = async () => {
        try {
            const year = new Date().getFullYear();
            const sprintsData = await mockApi.getSprints(year);
            setSprints(sprintsData);
        } catch (error) {
            console.error('Error loading sprints:', error);
        }
    };

    const handleSave = async () => {
        console.log('Saving task:', {
            title, description, status, storyPoints,
            lifeWheelAreaId, eisenhowerQuadrantId, sprintId, epicId,
            isRecurring, recurrenceFrequency
        });
        router.back();
    };

    const getLifeWheelName = () => {
        const area = lifeWheelAreasData.find(a => a.id === lifeWheelAreaId);
        return area ? `${area.icon} ${area.name}` : 'Select Life Wheel Area';
    };

    const getEpicName = () => {
        const epic = epicsData.find((e: any) => e.id === epicId);
        return epic ? epic.title : 'No Epic';
    };

    const getSprintName = () => {
        const sprint = sprints.find(s => s.id === sprintId);
        return sprint ? `S${sprint.weekNumber.toString().padStart(2, '0')}-${new Date().getFullYear()}` : 'No Sprint';
    };

    const storyPointOptions: Task['storyPoints'][] = [1, 2, 3, 5, 8, 13, 21];
    const statusOptions: Array<{ value: Task['status']; label: string; icon: string }> = [
        { value: 'draft', label: 'Draft', icon: '📝' },
        { value: 'todo', label: 'To Do', icon: '⚪' },
        { value: 'in_progress', label: 'In Progress', icon: '🔵' },
        { value: 'done', label: 'Done', icon: '✅' },
    ];

    const eisenhowerOptions = [
        { id: 'eq-1', label: 'Urgent & Important', color: 'bg-red-100', border: 'border-red-400' },
        { id: 'eq-2', label: 'Not Urgent & Important', color: 'bg-blue-100', border: 'border-blue-400' },
        { id: 'eq-3', label: 'Urgent & Not Important', color: 'bg-yellow-100', border: 'border-yellow-400' },
        { id: 'eq-4', label: 'Not Urgent & Not Important', color: 'bg-gray-100', border: 'border-gray-400' },
    ];

    const recurrenceOptions = [
        { value: 'daily', label: 'Daily', icon: '📅' },
        { value: 'weekly', label: 'Weekly', icon: '📆' },
        { value: 'biweekly', label: 'Every 2 Weeks', icon: '📋' },
        { value: 'monthly', label: 'Monthly', icon: '🗓️' },
        { value: 'yearly', label: 'Yearly', icon: '🎂' },
    ];

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-blue-600 pt-12 pb-4 px-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialCommunityIcons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold flex-1">Edit Task</Text>
                <TouchableOpacity onPress={handleSave} className="bg-white px-4 py-2 rounded-lg">
                    <Text className="text-blue-600 font-semibold">Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4">
                {/* Title */}
                <View className="mt-6">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Task title"
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                </View>

                {/* Description */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add details..."
                        multiline
                        numberOfLines={4}
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                        textAlignVertical="top"
                    />
                </View>

                {/* Status */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Status</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {statusOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setStatus(option.value)}
                                className={`px-4 py-2 rounded-lg border-2 ${status === option.value ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                                    }`}
                            >
                                <Text className={status === option.value ? 'text-blue-600 font-semibold' : 'text-gray-700'}>
                                    {option.icon} {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Story Points */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Story Points</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {storyPointOptions.map((points) => (
                            <TouchableOpacity
                                key={points}
                                onPress={() => setStoryPoints(points)}
                                className={`w-12 h-12 rounded-full border-2 items-center justify-center ${storyPoints === points ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                                    }`}
                            >
                                <Text className={`font-bold ${storyPoints === points ? 'text-blue-600' : 'text-gray-700'}`}>
                                    {points}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Eisenhower Matrix */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Priority (Eisenhower Matrix)</Text>
                    {eisenhowerOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            onPress={() => setEisenhowerQuadrantId(option.id)}
                            className={`p-4 rounded-lg mb-2 border-2 ${option.color} ${eisenhowerQuadrantId === option.id ? option.border : 'border-gray-300'
                                }`}
                        >
                            <Text className="font-semibold">{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Life Wheel Area */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Life Wheel Area</Text>
                    <TouchableOpacity
                        className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                        onPress={() => setShowLifeWheelPicker(true)}
                    >
                        <Text className="text-base text-gray-700">{getLifeWheelName()}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Sprint Assignment */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Assign to Sprint</Text>
                    <TouchableOpacity
                        className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                        onPress={() => setShowSprintPicker(true)}
                    >
                        <Text className="text-base text-gray-700">{getSprintName()}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Epic Assignment */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Epic</Text>
                    <TouchableOpacity
                        className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                        onPress={() => setShowEpicPicker(true)}
                    >
                        <Text className="text-base text-gray-700">{getEpicName()}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Recurring Task */}
                <View className="mt-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-semibold text-gray-700">Recurring Task</Text>
                        <TouchableOpacity
                            onPress={() => setIsRecurring(!isRecurring)}
                            className={`w-12 h-6 rounded-full ${isRecurring ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <View className={`w-6 h-6 rounded-full bg-white transform ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
                        </TouchableOpacity>
                    </View>

                    {isRecurring && (
                        <View className="mt-2">
                            <Text className="text-sm text-gray-600 mb-2">Frequency</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {recurrenceOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => setRecurrenceFrequency(option.value as any)}
                                        className={`px-3 py-2 rounded-lg border-2 ${recurrenceFrequency === option.value ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <Text className={recurrenceFrequency === option.value ? 'text-blue-600 font-semibold text-sm' : 'text-gray-700 text-sm'}>
                                            {option.icon} {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                <View className="h-8" />
            </ScrollView>

            {/* Sprint Picker Modal */}
            <Modal visible={showSprintPicker} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl pt-4 pb-8 px-4" style={{ maxHeight: '70%' }}>
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold">Select Sprint</Text>
                            <TouchableOpacity onPress={() => setShowSprintPicker(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={[{ id: null, weekNumber: 0, label: 'No Sprint' }, ...sprints]}
                            keyExtractor={(item) => item.id || 'none'}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`p-4 border-b border-gray-200 ${sprintId === item.id ? 'bg-blue-50' : ''}`}
                                    onPress={() => {
                                        setSprintId(item.id);
                                        setShowSprintPicker(false);
                                    }}
                                >
                                    <Text className={`text-base ${sprintId === item.id ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                                        {item.weekNumber === 0 ? 'No Sprint' : `S${item.weekNumber.toString().padStart(2, '0')}-${new Date().getFullYear()}`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Life Wheel Picker Modal */}
            <Modal visible={showLifeWheelPicker} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl pt-4 pb-8 px-4" style={{ maxHeight: '70%' }}>
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold">Select Life Wheel Area</Text>
                            <TouchableOpacity onPress={() => setShowLifeWheelPicker(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={lifeWheelAreasData}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`p-4 border-b border-gray-200 ${lifeWheelAreaId === item.id ? 'bg-blue-50' : ''}`}
                                    onPress={() => {
                                        setLifeWheelAreaId(item.id);
                                        setShowLifeWheelPicker(false);
                                    }}
                                >
                                    <Text className={`text-base ${lifeWheelAreaId === item.id ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                                        {item.icon} {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Epic Picker Modal */}
            <Modal visible={showEpicPicker} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl pt-4 pb-8 px-4" style={{ maxHeight: '70%' }}>
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold">Select Epic</Text>
                            <TouchableOpacity onPress={() => setShowEpicPicker(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={[{ id: null, title: 'No Epic' }, ...epicsData]}
                            keyExtractor={(item) => item.id || 'none'}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`p-4 border-b border-gray-200 ${epicId === item.id ? 'bg-blue-50' : ''}`}
                                    onPress={() => {
                                        setEpicId(item.id);
                                        setShowEpicPicker(false);
                                    }}
                                >
                                    <Text className={`text-base ${epicId === item.id ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
