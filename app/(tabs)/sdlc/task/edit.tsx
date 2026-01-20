import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mockApi } from '../../../../services/mockApi';
import { Task } from '../../../../types/models';

export default function TaskEditScreen() {
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

    useEffect(() => {
        loadTask();
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
            }
        } catch (error) {
            console.error('Error loading task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // TODO: Implement save logic
        console.log('Saving task:', { title, description, status, storyPoints });
        router.back();
    };

    const storyPointOptions: Task['storyPoints'][] = [1, 2, 3, 5, 8, 13, 21];
    const statusOptions: Array<{ value: Task['status']; label: string }> = [
        { value: 'draft', label: '📝 Draft' },
        { value: 'todo', label: '⚪ To Do' },
        { value: 'in_progress', label: '🔵 In Progress' },
        { value: 'done', label: '✅ Done' },
    ];

    const eisenhowerOptions = [
        { id: 'eq-1', label: 'Urgent & Important', color: 'bg-red-100' },
        { id: 'eq-2', label: 'Not Urgent & Important', color: 'bg-blue-100' },
        { id: 'eq-3', label: 'Urgent & Not Important', color: 'bg-yellow-100' },
        { id: 'eq-4', label: 'Not Urgent & Not Important', color: 'bg-gray-100' },
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
                                    {option.label}
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
                            className={`p-4 rounded-lg mb-2 border-2 ${option.color} ${eisenhowerQuadrantId === option.id ? 'border-gray-800' : 'border-gray-300'
                                }`}
                        >
                            <Text className="font-semibold">{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sprint Assignment */}
                <View className="mt-4 mb-8">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Assign to Sprint</Text>
                    <TouchableOpacity
                        className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                        onPress={() => {/* TODO: Open sprint picker */ }}
                    >
                        <Text className="text-base text-gray-700">
                            {sprintId ? `Sprint ${sprintId}` : 'No sprint assigned'}
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
