import { View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { useState, useEffect } from 'react';
import { useEpicStore } from '../../../../store/epicStore';
import { useTaskStore } from '../../../../store/taskStore';
import { Task } from '../../../../types/models';

export default function CreateEpicScreen() {
    const router = useRouter();
    const { addEpic } = useEpicStore();
    const { tasks, fetchTasks } = useTaskStore();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState('#3B82F6');
    const [selectedIcon, setSelectedIcon] = useState('rocket-launch');
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [showTaskModal, setShowTaskModal] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const availableTasks = tasks.filter(t => !t.epicId || t.epicId === null);
    const selectedTasks = tasks.filter(t => selectedTaskIds.includes(t.id));

    const COLORS = [
        '#3B82F6', // Blue
        '#EF4444', // Red
        '#10B981', // Green
        '#F59E0B', // Amber
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#6366F1', // Indigo
        '#14B8A6', // Teal
    ];

    const ICONS = [
        'rocket-launch',
        'target',
        'lightning-bolt',
        'star',
        'flag',
        'trophy',
        'chart-line',
        'cube-outline',
        'heart-pulse',
        'cash-multiple',
        'home-automation',
        'book-open-variant'
    ];

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTaskIds(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const handleCreate = () => {
        if (!title.trim()) {
            return;
        }

        const totalPoints = selectedTasks.reduce((sum, t) => sum + t.storyPoints, 0);
        const completedPoints = selectedTasks
            .filter(t => t.status === 'done')
            .reduce((sum, t) => sum + t.storyPoints, 0);

        const now = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

        addEpic({
            title,
            description,
            color: selectedColor,
            icon: selectedIcon,
            lifeWheelAreaId: 'lw-2',
            targetSprintId: 'sprint-4',
            status: 'planning',
            totalPoints,
            completedPoints,
            taskIds: selectedTaskIds,
            startDate: now.toISOString(),
            endDate: threeMonthsLater.toISOString(),
        });

        router.back();
    };

    const renderAvailableTask = ({ item }: { item: Task }) => {
        const isSelected = selectedTaskIds.includes(item.id);
        return (
            <TouchableOpacity
                onPress={() => toggleTaskSelection(item.id)}
                className={`rounded-xl p-4 mb-3 border-2 ${
                    isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'
                }`}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                        <Text className={`text-base font-semibold mb-1 ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                            {item.title}
                        </Text>
                        <Text className="text-sm text-gray-500" numberOfLines={1}>{item.description}</Text>
                        <View className="flex-row items-center mt-2">
                            <MaterialCommunityIcons name="checkbox-marked-circle" size={14} color="#6B7280" />
                            <Text className="text-xs text-gray-600 ml-1">{item.storyPoints} pts</Text>
                        </View>
                    </View>
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                        {isSelected && (
                            <MaterialCommunityIcons name="check" size={16} color="white" />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Container>
            <ScreenHeader title="Create Epic" subtitle="Define a new strategic goal" showBack />

            <ScrollView className="flex-1 p-6">
                {/* Title Input */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Epic Title</Text>
                    <TextInput
                        className="text-3xl font-bold text-gray-900 border-b border-gray-200 pb-2"
                        placeholder="e.g. Q3 Mobile Redesign"
                        placeholderTextColor="#D1D5DB"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Color Selector */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Theme Color</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                className={`w-12 h-12 rounded-full mr-4 items-center justify-center border-2 ${
                                    selectedColor === color ? 'border-gray-900' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                            >
                                {selectedColor === color && (
                                    <MaterialCommunityIcons name="check" size={24} color="white" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Icon Selector */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Identity Icon</Text>
                    <View className="flex-row flex-wrap gap-4">
                        {ICONS.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                onPress={() => setSelectedIcon(icon)}
                                className={`w-14 h-14 rounded-2xl items-center justify-center border ${
                                    selectedIcon === icon ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'
                                }`}
                            >
                                <MaterialCommunityIcons
                                    name={icon as any}
                                    size={28}
                                    color={selectedIcon === icon ? 'white' : '#6B7280'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Description Input */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Description</Text>
                    <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[120px]">
                        <TextInput
                            className="text-base text-gray-800 leading-relaxed"
                            placeholder="Describe what this epic aims to achieve..."
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                </View>

                {/* Add Tasks Section */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Tasks ({selectedTasks.length})
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowTaskModal(true)}
                            className="flex-row items-center bg-gray-900 px-3 py-2 rounded-lg"
                        >
                            <MaterialCommunityIcons name="plus" size={16} color="white" />
                            <Text className="text-white font-semibold ml-1 text-xs">Add Tasks</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedTasks.length === 0 ? (
                        <View className="bg-gray-50 rounded-xl p-6 items-center border border-dashed border-gray-300">
                            <MaterialCommunityIcons name="clipboard-text-outline" size={40} color="#9CA3AF" />
                            <Text className="text-gray-500 text-sm mt-2">No tasks added yet</Text>
                        </View>
                    ) : (
                        <View className="bg-white rounded-xl border border-gray-200 p-4">
                            {selectedTasks.map(task => (
                                <View key={task.id} className="flex-row items-center justify-between py-2">
                                    <View className="flex-1">
                                        <Text className="text-sm font-medium text-gray-900">{task.title}</Text>
                                        <Text className="text-xs text-gray-500">{task.storyPoints} pts</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => toggleTaskSelection(task.id)}
                                        className="ml-2"
                                    >
                                        <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View className="mt-3 pt-3 border-t border-gray-100">
                                <Text className="text-xs text-gray-600 font-semibold">
                                    Total: {selectedTasks.reduce((sum, t) => sum + t.storyPoints, 0)} story points
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    className="bg-blue-600 py-4 rounded-xl shadow-lg shadow-blue-200 flex-row items-center justify-center mb-10"
                    onPress={handleCreate}
                    disabled={!title.trim()}
                >
                    <Text className="text-white font-bold text-lg mr-2">Create Epic</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                </TouchableOpacity>
            </ScrollView>

            {/* Task Selection Modal */}
            <Modal
                visible={showTaskModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowTaskModal(false)}
            >
                <View className="flex-1 bg-gray-50">
                    <View className="bg-white border-b border-gray-200">
                        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
                            <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                            <Text className="text-lg font-bold text-gray-900">Select Tasks</Text>
                            <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                                <Text className="text-blue-600 font-semibold">Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView className="flex-1 px-4 pt-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                Available Tasks ({availableTasks.length})
                            </Text>
                            <Text className="text-sm font-bold text-blue-600">
                                {selectedTaskIds.length} selected
                            </Text>
                        </View>

                        {availableTasks.length === 0 ? (
                            <View className="bg-white rounded-xl p-8 items-center">
                                <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-3">No available tasks</Text>
                                <Text className="text-gray-400 text-sm mt-1 text-center">
                                    All tasks are already assigned to epics
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={availableTasks}
                                renderItem={renderAvailableTask}
                                keyExtractor={item => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </Container>
    );
}
