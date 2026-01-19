import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { useTaskStore } from '../../../../store/taskStore';
import { useEffect, useState } from 'react';
import { mockApi } from '../../../../services/mockApi';
import { formatDate, formatDateTime } from '../../../../utils/dateHelpers';

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { getTaskById, updateTask } = useTaskStore();
    const [task, setTask] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const loadTask = async () => {
            const taskData = await mockApi.getTaskById(id);
            const taskComments = await mockApi.getTaskComments(id);
            const taskHistory = await mockApi.getTaskHistory(id);

            setTask(taskData);
            setComments(taskComments);
            setHistory(taskHistory);
        };

        loadTask();
    }, [id]);

    if (!task) {
        return (
            <Container>
                <Text>Loading...</Text>
            </Container>
        );
    }

    const getStatusBadge = () => {
        switch (task.status) {
            case 'done':
                return <Badge variant="success">Done</Badge>;
            case 'in_progress':
                return <Badge variant="warning">In Progress</Badge>;
            case 'todo':
                return <Badge variant="info">To Do</Badge>;
            default:
                return <Badge>Draft</Badge>;
        }
    };

    const handleStatusChange = (newStatus: string) => {
        updateTask(id, { status: newStatus });
        setTask({ ...task, status: newStatus });
    };

    return (
        <Container>
            <ScreenHeader
                title="Task Details"
                showBack
                rightAction={
                    <Pressable onPress={() => router.push(`/sdlc/task/${id}/edit`)}>
                        <Text className="text-blue-600 font-semibold">Edit</Text>
                    </Pressable>
                }
            />

            <ScrollView className="flex-1 p-4">
                {/* Status & Points */}
                <Card className="mb-4">
                    <View className="flex-row justify-between items-start mb-3">
                        <Text className="text-2xl font-bold flex-1 mr-2">
                            {task.title}
                        </Text>
                        {getStatusBadge()}
                    </View>

                    <View className="flex-row items-center mb-3">
                        <Text className="text-3xl font-bold text-blue-600">
                            {task.storyPoints}
                        </Text>
                        <Text className="text-gray-600 ml-2">story points</Text>
                    </View>

                    {task.description && (
                        <Text className="text-gray-700 mb-3">
                            {task.description}
                        </Text>
                    )}

                    {task.aiConfidence && (
                        <View className="mt-2">
                            <Text className="text-sm text-gray-600">
                                AI Confidence: {Math.round(task.aiConfidence * 100)}%
                            </Text>
                        </View>
                    )}
                </Card>

                {/* Quick Actions */}
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-3">Change Status</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {task.status !== 'todo' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onPress={() => handleStatusChange('todo')}
                            >
                                To Do
                            </Button>
                        )}
                        {task.status !== 'in_progress' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onPress={() => handleStatusChange('in_progress')}
                            >
                                In Progress
                            </Button>
                        )}
                        {task.status !== 'done' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onPress={() => handleStatusChange('done')}
                            >
                                Mark Done
                            </Button>
                        )}
                    </View>
                </Card>

                {/* Comments */}
                {comments.length > 0 && (
                    <Card className="mb-4">
                        <Text className="text-lg font-semibold mb-3">
                            Comments ({comments.length})
                        </Text>
                        {comments.map((comment) => (
                            <View key={comment.id} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0">
                                <View className="flex-row items-center mb-1">
                                    {comment.isAiGenerated ? (
                                        <>
                                            <Text className="text-sm font-semibold text-purple-600">🤖 AI Assistant</Text>
                                            <Badge variant="info" size="sm" className="ml-2">AI</Badge>
                                        </>
                                    ) : (
                                        <Text className="text-sm font-semibold text-gray-900">You</Text>
                                    )}
                                    <Text className="text-xs text-gray-500 ml-2">
                                        {formatDateTime(comment.timestamp)}
                                    </Text>
                                </View>
                                <Text className="text-gray-700">{comment.commentText}</Text>
                            </View>
                        ))}
                    </Card>
                )}

                {/* History */}
                {history.length > 0 && (
                    <Card>
                        <Text className="text-lg font-semibold mb-3">
                            History ({history.length})
                        </Text>
                        {history.map((item) => (
                            <View key={item.id} className="mb-2">
                                <Text className="text-sm text-gray-700">
                                    Changed <Text className="font-semibold">{item.fieldName}</Text>
                                    {' '}from <Text className="font-semibold">{item.oldValue}</Text>
                                    {' '}to <Text className="font-semibold">{item.newValue}</Text>
                                </Text>
                                <Text className="text-xs text-gray-500">
                                    {formatDateTime(item.timestamp)}
                                </Text>
                            </View>
                        ))}
                    </Card>
                )}
            </ScrollView>
        </Container>
    );
}
