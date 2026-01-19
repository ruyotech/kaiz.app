import { View, Text, FlatList, Pressable } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../../store/taskStore';
import { useEffect } from 'react';
import { Task } from '../../../types/models';

export default function TasksScreen() {
    const router = useRouter();
    const { tasks, loading, fetchTasks } = useTaskStore();

    useEffect(() => {
        fetchTasks({ isDraft: false });
    }, []);

    const renderTask = ({ item }: { item: Task }) => {
        const getStatusBadge = () => {
            switch (item.status) {
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

        return (
            <Pressable onPress={() => router.push(`/sdlc/task/${item.id}`)}>
                <Card className="mb-3">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-lg font-semibold flex-1 mr-2">
                            {item.title}
                        </Text>
                        {getStatusBadge()}
                    </View>
                    <Text className="text-gray-600 mb-2" numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View className="flex-row items-center">
                        <Text className="text-blue-600 font-medium">
                            {item.storyPoints} points
                        </Text>
                    </View>
                </Card>
            </Pressable>
        );
    };

    return (
        <Container>
            <ScreenHeader
                title="Tasks"
                subtitle="Manage your work"
                rightAction={
                    <Button
                        onPress={() => router.push('/sdlc/create-task')}
                        size="sm"
                    >
                        + New
                    </Button>
                }
            />

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <Text>Loading...</Text>
                </View>
            ) : tasks.length === 0 ? (
                <EmptyState
                    icon="📝"
                    title="No tasks yet"
                    message="Create your first task to get started with your personal SDLC"
                    action={
                        <Button onPress={() => router.push('/sdlc/create-task')}>
                            Create Task
                        </Button>
                    }
                />
            ) : (
                <FlatList
                    data={tasks}
                    renderItem={renderTask}
                    keyExtractor={(item) => item.id}
                    contentContainerClassName="p-4"
                />
            )}
        </Container>
    );
}
