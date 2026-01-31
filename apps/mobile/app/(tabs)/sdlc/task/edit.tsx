import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Modal, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task } from '../../../../types/models';
import { useTaskStore } from '../../../../store/taskStore';
import { useEpicStore } from '../../../../store/epicStore';
import { useTranslation } from '../../../../hooks/useTranslation';
import { AuthExpiredError } from '../../../../services/api';

export default function TaskEditScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const taskId = Array.isArray(id) ? id[0] : id;
    
    const { tasks, fetchTasks, updateTask } = useTaskStore();
    const { epics, fetchEpics, addTaskToEpic, removeTaskFromEpic } = useEpicStore();
    
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
    const [originalEpicId, setOriginalEpicId] = useState<string | null>(null);
    const [showEpicPicker, setShowEpicPicker] = useState(false);

    useEffect(() => {
        loadTask();
        fetchEpics();
    }, [taskId]);

    const loadTask = async () => {
        try {
            setLoading(true);
            await fetchTasks();
        } catch (error) {
            // Ignore auth expired errors - redirect is handled automatically
            if (error instanceof AuthExpiredError) return;
            console.error('Error loading task:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update form when tasks are loaded
    useEffect(() => {
        const foundTask = tasks.find((t: Task) => t.id === taskId);
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
            setOriginalEpicId(foundTask.epicId);
        }
    }, [tasks, taskId]);

    const handleSave = async () => {
        if (!taskId) return;

        // Update task in store
        updateTask(taskId, {
            title,
            description,
            status,
            storyPoints,
            eisenhowerQuadrantId,
            lifeWheelAreaId,
            sprintId,
            epicId,
        });

        // Handle epic changes
        if (originalEpicId !== epicId) {
            // Remove from old epic
            if (originalEpicId) {
                removeTaskFromEpic(originalEpicId, taskId);
            }
            // Add to new epic
            if (epicId) {
                addTaskToEpic(epicId, taskId);
            }
        }

        router.back();
    };

    const storyPointOptions: Task['storyPoints'][] = [1, 2, 3, 5, 8, 13, 21];
    const statusOptions: Array<{ value: Task['status']; label: string }> = [
        { value: 'draft', label: `📝 ${t('tasks.status.draft')}` },
        { value: 'todo', label: `⚪ ${t('tasks.statusTodo')}` },
        { value: 'in_progress', label: `🔵 ${t('tasks.statusInProgress')}` },
        { value: 'done', label: `✅ ${t('tasks.statusDone')}` },
    ];

    const eisenhowerOptions = [
        { id: 'eq-1', label: t('calendar.urgentImportant'), color: 'bg-red-100' },
        { id: 'eq-2', label: t('calendar.notUrgentImportant'), color: 'bg-blue-100' },
        { id: 'eq-3', label: t('calendar.urgentNotImportant'), color: 'bg-yellow-100' },
        { id: 'eq-4', label: t('calendar.notUrgentNotImportant'), color: 'bg-gray-100' },
    ];

    const selectedEpic = epics.find(e => e.id === epicId);
    const epicChanged = originalEpicId !== epicId;

    const handleEpicSelect = (selectedEpicId: string | null) => {
        setEpicId(selectedEpicId);
        setShowEpicPicker(false);
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>{t('common.loading')}</Text>
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
                <Text className="text-white text-xl font-bold flex-1">{t('tasks.edit.editTask')}</Text>
                <TouchableOpacity onPress={handleSave} className="bg-white px-4 py-2 rounded-lg">
                    <Text className="text-blue-600 font-semibold">{t('common.save')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4">
                {/* Title */}
                <View className="mt-6">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">{t('tasks.edit.titleLabel')}</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder={t('tasks.edit.titlePlaceholder')}
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                    />
                </View>

                {/* Description */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">{t('tasks.edit.descriptionLabel')}</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder={t('tasks.edit.descriptionPlaceholder')}
                        multiline
                        numberOfLines={4}
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                        textAlignVertical="top"
                    />
                </View>

                {/* Status */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">{t('tasks.edit.statusLabel')}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {statusOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setStatus(option.value)}
                                className={`px-4 py-2 rounded-lg border-2 ${status === option.value ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                                    }`}
                            >
                                <Text className={status === option.value ? 'text-blue-600 font-semibold' : 'text-gray-700'}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Story Points */}
                <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">{t('tasks.edit.storyPointsLabel')}</Text>
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
                    <Text className="text-sm font-semibold text-gray-700 mb-2">{t('tasks.edit.priorityLabel')}</Text>
                    {eisenhowerOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            onPress={() => setEisenhowerQuadrantId(option.id)}
                            className={`p-4 rounded-lg mb-2 border-2 ${option.color} ${eisenhowerQuadrantId === option.id ? 'border-gray-800' : 'border-gray-300'
                                }`}
                        >
                            <Text className="font-semibold">{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Epic Assignment - Simplified */}
                <View className="mt-4 mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">{t('tasks.edit.epicLabel')}</Text>
                    <TouchableOpacity
                        onPress={() => setShowEpicPicker(true)}
                        className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center bg-white"
                    >
                        {selectedEpic ? (
                            <View className="flex-row items-center flex-1">
                                <View 
                                    className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                                    style={{ backgroundColor: selectedEpic.color + '20' }}
                                >
                                    <MaterialCommunityIcons 
                                        name={selectedEpic.icon as any} 
                                        size={18} 
                                        color={selectedEpic.color} 
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-semibold text-gray-900">{selectedEpic.title}</Text>
                                    {epicChanged && (
                                        <Text className="text-xs text-blue-600 mt-0.5">● {t('tasks.edit.changed')}</Text>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <View className="flex-row items-center flex-1">
                                <MaterialCommunityIcons name="inbox-outline" size={20} color="#9CA3AF" />
                                <Text className="ml-3 text-gray-600">{t('tasks.edit.noEpicAssigned')}</Text>
                            </View>
                        )}
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Sprint Assignment */}
                <View className="mt-4 mb-8">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">{t('tasks.edit.assignToSprint')}</Text>
                    <TouchableOpacity
                        className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                        onPress={() => {/* TODO: Open sprint picker */ }}
                    >
                        <Text className="text-base text-gray-700">
                            {sprintId ? `Sprint ${sprintId}` : t('tasks.edit.noSprintAssigned')}
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Epic Picker Modal */}
            <Modal
                visible={showEpicPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEpicPicker(false)}
            >
                <Pressable
                    className="flex-1 bg-black/50 justify-end"
                    onPress={() => setShowEpicPicker(false)}
                >
                    <Pressable>
                        <View className="bg-white rounded-t-3xl pt-4 pb-8 px-4 max-h-[70%]">
                            <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
                                <Text className="text-lg font-bold">{t('tasks.edit.selectEpic')}</Text>
                                <TouchableOpacity onPress={() => setShowEpicPicker(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* No Epic Option */}
                                <TouchableOpacity
                                    onPress={() => handleEpicSelect(null)}
                                    className={`flex-row items-center p-4 rounded-xl mb-2 ${
                                        !epicId ? 'bg-gray-100 border-2 border-gray-900' : 'bg-gray-50'
                                    }`}
                                >
                                    <View className="w-10 h-10 bg-gray-200 rounded-lg items-center justify-center mr-3">
                                        <MaterialCommunityIcons name="inbox-outline" size={24} color="#6B7280" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-semibold ${!epicId ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {t('tasks.edit.noEpic')}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-0.5">{t('tasks.edit.standaloneTask')}</Text>
                                    </View>
                                    {!epicId && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color="#1F2937" />
                                    )}
                                </TouchableOpacity>

                                {/* Epic Options */}
                                {epics.length > 0 ? (
                                    epics.map((epic) => (
                                        <TouchableOpacity
                                            key={epic.id}
                                            onPress={() => handleEpicSelect(epic.id)}
                                            className={`flex-row items-center p-4 rounded-xl mb-2 border-2 ${
                                                epicId === epic.id 
                                                    ? 'border-gray-900' 
                                                    : 'bg-white border-gray-200'
                                            }`}
                                            style={epicId === epic.id ? { backgroundColor: epic.color + '10' } : {}}
                                        >
                                            <View 
                                                className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                                                style={{ backgroundColor: epic.color + '30' }}
                                            >
                                                <MaterialCommunityIcons 
                                                    name={epic.icon as any} 
                                                    size={24} 
                                                    color={epic.color} 
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-bold text-gray-900">{epic.title}</Text>
                                                <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                                                    {epic.description}
                                                </Text>
                                            </View>
                                            {epicId === epic.id && (
                                                <MaterialCommunityIcons 
                                                    name="check-circle" 
                                                    size={24} 
                                                    color={epic.color} 
                                                />
                                            )}
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View className="py-8 items-center">
                                        <MaterialCommunityIcons name="rocket-launch-outline" size={48} color="#D1D5DB" />
                                        <Text className="text-gray-500 mt-3 text-center">{t('tasks.edit.noEpicsAvailable')}</Text>
                                        <Text className="text-gray-400 text-sm mt-1 text-center">
                                            {t('tasks.edit.createEpicFirst')}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
