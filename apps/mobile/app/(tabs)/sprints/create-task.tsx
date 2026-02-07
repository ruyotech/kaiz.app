import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { useTaskStore } from '../../../store/taskStore';
import { useEpicStore } from '../../../store/epicStore';
import { lifeWheelApi, epicApi } from '../../../services/api';
import { STORY_POINTS } from '../../../utils/constants';
import { useTranslation } from '../../../hooks';

export default function CreateTaskScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { addTask } = useTaskStore();
    const { addTaskToEpic } = useEpicStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [storyPoints, setStoryPoints] = useState<number>(3);
    const [lifeWheelAreaId, setLifeWheelAreaId] = useState('');
    const [eisenhowerQuadrantId, setEisenhowerQuadrantId] = useState('');
    const [epicId, setEpicId] = useState('');

    const [lifeWheelAreas, setLifeWheelAreas] = useState<any[]>([]);
    const [quadrants, setQuadrants] = useState<any[]>([]);
    const [epics, setEpics] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const [areas, quads, epicsData] = await Promise.all([
                lifeWheelApi.getLifeWheelAreas(),
                lifeWheelApi.getEisenhowerQuadrants(),
                epicApi.getEpics()
            ]);

            setLifeWheelAreas(areas);
            setQuadrants(quads);
            setEpics(epicsData);

            // Set defaults
            if (areas.length > 0) setLifeWheelAreaId((areas[0] as any).id);
            if (quads.length > 0) setEisenhowerQuadrantId((quads[0] as any).id);
        };

        loadData();
    }, []);

    const handleCreate = () => {
        if (!title.trim()) return;

        const taskId = `task-${Date.now()}`;
        
        addTask({
            id: taskId,
            title,
            description,
            storyPoints: storyPoints as any,
            lifeWheelAreaId,
            eisenhowerQuadrantId,
            epicId: epicId || null,
            status: 'todo',
        });

        // If epic selected, add task to epic's taskIds
        if (epicId) {
            addTaskToEpic(epicId, taskId);
        }

        router.back();
    };

    const selectedLifeArea = lifeWheelAreas.find(a => a.id === lifeWheelAreaId);
    const selectedQuadrant = quadrants.find(q => q.id === eisenhowerQuadrantId);
    const selectedEpic = epics.find(e => e.id === epicId);

    return (
        <Container>
            <ScreenHeader title={t('tasks.createTask')} subtitle={t('tasks.addToBacklog')} showBack />

            <ScrollView className="flex-1 p-6">
                {/* Title Input - Big and Bold */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{t('tasks.taskTitle')}</Text>
                    <TextInput
                        className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2"
                        placeholder={t('tasks.taskTitlePlaceholder')}
                        placeholderTextColor="#D1D5DB"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Description Input */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{t('tasks.description')}</Text>
                    <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[100px]">
                        <TextInput
                            className="text-base text-gray-800 leading-relaxed"
                            placeholder={t('tasks.descriptionPlaceholder')}
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                </View>

                {/* Story Points - Modern Cards */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">{t('tasks.storyPoints')}</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {STORY_POINTS.map((points) => (
                            <TouchableOpacity
                                key={points}
                                onPress={() => setStoryPoints(points)}
                                className={`w-14 h-14 rounded-2xl items-center justify-center border-2 ${
                                    storyPoints === points 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : 'bg-white border-gray-200'
                                }`}
                            >
                                <Text className={`text-lg font-bold ${
                                    storyPoints === points ? 'text-white' : 'text-gray-700'
                                }`}>
                                    {points}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Life Wheel Area - Colorful Pills */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">{t('tasks.lifeArea')}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {lifeWheelAreas.map((area) => (
                            <TouchableOpacity
                                key={area.id}
                                onPress={() => setLifeWheelAreaId(area.id)}
                                className={`px-4 py-3 rounded-xl border-2 ${
                                    lifeWheelAreaId === area.id 
                                        ? 'border-gray-900' 
                                        : 'border-gray-200'
                                }`}
                                style={{
                                    backgroundColor: lifeWheelAreaId === area.id 
                                        ? area.color + '30' 
                                        : 'white'
                                }}
                            >
                                <Text className={`font-semibold ${
                                    lifeWheelAreaId === area.id ? 'text-gray-900' : 'text-gray-600'
                                }`}>
                                    {area.icon} {area.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Eisenhower Priority - Cards with Labels */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">{t('tasks.priorityEisenhower')}</Text>
                    <View className="gap-3">
                        {quadrants.map((quad) => (
                            <TouchableOpacity
                                key={quad.id}
                                onPress={() => setEisenhowerQuadrantId(quad.id)}
                                className={`p-4 rounded-xl border-2 flex-row items-center justify-between ${
                                    eisenhowerQuadrantId === quad.id 
                                        ? 'bg-gray-900 border-gray-900' 
                                        : 'bg-white border-gray-200'
                                }`}
                            >
                                <View>
                                    <Text className={`font-bold text-base mb-1 ${
                                        eisenhowerQuadrantId === quad.id ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {quad.name}
                                    </Text>
                                    <Text className={`text-sm ${
                                        eisenhowerQuadrantId === quad.id ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        {quad.label}
                                    </Text>
                                </View>
                                {eisenhowerQuadrantId === quad.id && (
                                    <MaterialCommunityIcons name="check-circle" size={24} color="white" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Epic Selector - Optional with Epic Cards */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                        {t('tasks.linkToEpic')}
                    </Text>
                    
                    {/* No Epic Option */}
                    <TouchableOpacity
                        onPress={() => setEpicId('')}
                        className={`p-4 rounded-xl border-2 mb-3 flex-row items-center justify-between ${
                            !epicId ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-200'
                        }`}
                    >
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons 
                                name="inbox-outline" 
                                size={20} 
                                color={!epicId ? '#374151' : '#9CA3AF'} 
                            />
                            <Text className={`ml-3 font-semibold ${
                                !epicId ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                                {t('tasks.noEpicStandalone')}
                            </Text>
                        </View>
                        {!epicId && (
                            <MaterialCommunityIcons name="check-circle" size={20} color="#374151" />
                        )}
                    </TouchableOpacity>

                    {/* Epic Options */}
                    {epics.length > 0 && (
                        <View className="gap-3">
                            {epics.map((epic) => (
                                <TouchableOpacity
                                    key={epic.id}
                                    onPress={() => setEpicId(epic.id)}
                                    className={`rounded-xl border-2 overflow-hidden ${
                                        epicId === epic.id 
                                            ? 'border-gray-900' 
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <View className="h-1" style={{ backgroundColor: epic.color }} />
                                    <View className="p-4 bg-white flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <View className="flex-row items-center mb-1">
                                                <MaterialCommunityIcons 
                                                    name={epic.icon as any} 
                                                    size={18} 
                                                    color={epic.color} 
                                                />
                                                <Text className="ml-2 font-bold text-gray-900">
                                                    {epic.title}
                                                </Text>
                                            </View>
                                            <Text className="text-sm text-gray-500" numberOfLines={1}>
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
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {epics.length === 0 && (
                        <View className="bg-gray-50 rounded-xl p-6 items-center border border-dashed border-gray-300">
                            <MaterialCommunityIcons name="rocket-launch-outline" size={40} color="#9CA3AF" />
                            <Text className="text-gray-500 text-sm mt-2 text-center">
                                {t('tasks.noEpicsYet')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Create Button */}
                <TouchableOpacity
                    className={`py-4 rounded-xl shadow-lg flex-row items-center justify-center mb-10 ${
                        title.trim() 
                            ? 'bg-blue-600 shadow-blue-200' 
                            : 'bg-gray-300'
                    }`}
                    onPress={handleCreate}
                    disabled={!title.trim()}
                >
                    <MaterialCommunityIcons 
                        name="check" 
                        size={20} 
                        color="white" 
                    />
                    <Text className="text-white font-bold text-lg ml-2">{t('tasks.createTask')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </Container>
    );
}
