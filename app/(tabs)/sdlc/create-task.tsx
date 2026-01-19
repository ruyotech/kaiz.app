import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useTaskStore } from '../../../store/taskStore';
import { mockApi } from '../../../services/mockApi';
import { STORY_POINTS } from '../../../utils/constants';

export default function CreateTaskScreen() {
    const router = useRouter();
    const { addTask } = useTaskStore();

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
            const areas = await mockApi.getLifeWheelAreas();
            const quads = await mockApi.getEisenhowerQuadrants();
            const epicsData = await mockApi.getEpics();

            setLifeWheelAreas(areas);
            setQuadrants(quads);
            setEpics(epicsData);

            // Set defaults
            if (areas.length > 0) setLifeWheelAreaId(areas[0].id);
            if (quads.length > 0) setEisenhowerQuadrantId(quads[0].id);
        };

        loadData();
    }, []);

    const handleCreate = () => {
        if (!title.trim()) return;

        addTask({
            title,
            description,
            storyPoints: storyPoints as any,
            lifeWheelAreaId,
            eisenhowerQuadrantId,
            epicId: epicId || null,
            status: 'todo',
        });

        router.back();
    };

    return (
        <Container>
            <ScreenHeader
                title="Create Task"
                showBack
            />

            <ScrollView className="flex-1 p-4">
                <Input
                    label="Task Title *"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter task title"
                />

                <Input
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter task description"
                    multiline
                    numberOfLines={4}
                />

                {/* Story Points Picker */}
                <Card className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        Story Points *
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {STORY_POINTS.map((points) => (
                            <Pressable
                                key={points}
                                onPress={() => setStoryPoints(points)}
                                className={`
                  px-4 py-2 rounded-lg border-2
                  ${storyPoints === points
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-gray-300'
                                    }
                `}
                            >
                                <Text className={`font-semibold ${storyPoints === points ? 'text-white' : 'text-gray-700'}`}>
                                    {points}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Card>

                {/* Life Wheel Area */}
                <Card className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        Life Area *
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {lifeWheelAreas.map((area) => (
                            <Pressable
                                key={area.id}
                                onPress={() => setLifeWheelAreaId(area.id)}
                                className={`
                  px-3 py-2 rounded-lg border-2
                  ${lifeWheelAreaId === area.id
                                        ? 'border-blue-600'
                                        : 'border-gray-300'
                                    }
                `}
                                style={{
                                    backgroundColor: lifeWheelAreaId === area.id ? area.color + '20' : 'white'
                                }}
                            >
                                <Text className="font-medium">
                                    {area.icon} {area.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Card>

                {/* Eisenhower Quadrant */}
                <Card className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                        Priority *
                    </Text>
                    <View className="flex-wrap gap-2">
                        {quadrants.map((quad) => (
                            <Pressable
                                key={quad.id}
                                onPress={() => setEisenhowerQuadrantId(quad.id)}
                                className={`
                  px-4 py-3 rounded-lg border-2 mb-2
                  ${eisenhowerQuadrantId === quad.id
                                        ? 'border-blue-600'
                                        : 'border-gray-300'
                                    }
                `}
                            >
                                <Text className="font-semibold">{quad.name}</Text>
                                <Text className="text-sm text-gray-600">{quad.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </Card>

                {/* Epic (Optional) */}
                {epics.length > 0 && (
                    <Card className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">
                            Epic (Optional)
                        </Text>
                        <Pressable
                            onPress={() => setEpicId('')}
                            className={`
                px-4 py-2 rounded-lg border-2 mb-2
                ${!epicId ? 'bg-gray-100 border-gray-400' : 'border-gray-300'}
              `}
                        >
                            <Text className="font-medium">No Epic</Text>
                        </Pressable>
                        {epics.map((epic) => (
                            <Pressable
                                key={epic.id}
                                onPress={() => setEpicId(epic.id)}
                                className={`
                  px-4 py-2 rounded-lg border-2 mb-2
                  ${epicId === epic.id
                                        ? 'bg-blue-100 border-blue-600'
                                        : 'border-gray-300'
                                    }
                `}
                            >
                                <Text className="font-semibold">{epic.title}</Text>
                                <Text className="text-sm text-gray-600">{epic.description}</Text>
                            </Pressable>
                        ))}
                    </Card>
                )}

                <Button
                    onPress={handleCreate}
                    disabled={!title.trim()}
                    fullWidth
                >
                    Create Task
                </Button>

                <View className="h-8" />
            </ScrollView>
        </Container>
    );
}
