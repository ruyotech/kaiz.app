import { View, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useMindsetStore } from '../../../store/mindsetStore';
import { useTaskStore } from '../../../store/taskStore';
import { MindsetFeed } from '../../../components/motivation/MindsetFeed';
import { ActionIntakeModal } from '../../../components/motivation/ActionIntakeModal';
import { MindsetContent, LifeWheelDimensionTag } from '../../../types/models';
import mindsetContentData from '../../../data/mock/mindsetContent.json';
import mindsetThemesData from '../../../data/mock/mindsetThemes.json';

export default function MotivationScreen() {
    const router = useRouter();
    const {
        setAllContent,
        setThemes,
        updateWeakDimensions,
        startSession,
        endSession,
        internalize,
        operationalize,
        toggleFavorite,
    } = useMindsetStore();

    const { tasks } = useTaskStore();
    
    const [selectedContent, setSelectedContent] = useState<MindsetContent | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);

    useEffect(() => {
        loadMindsetData();
        startSession();

        return () => {
            endSession();
        };
    }, []);

    // Calculate weak dimensions based on tasks in current sprint
    useEffect(() => {
        if (tasks.length > 0) {
            // Count tasks per dimension
            const dimensionCounts: Record<string, number> = {};
            tasks.forEach((task) => {
                const dim = task.lifeWheelAreaId;
                dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
            });

            // Find dimensions with low task count (weak areas)
            const allDimensions: LifeWheelDimensionTag[] = ['lw-1', 'lw-2', 'lw-3', 'lw-4', 'lw-5', 'lw-6', 'lw-7', 'lw-8'];
            const weakDims = allDimensions.filter((dim) => (dimensionCounts[dim] || 0) < 2);

            updateWeakDimensions(weakDims);
        }
    }, [tasks]);

    const loadMindsetData = async () => {
        try {
            setAllContent(mindsetContentData as MindsetContent[]);
            setThemes(mindsetThemesData as any[]);
        } catch (error) {
            console.error('Failed to load mindset data:', error);
        }
    };

    const handleLongPress = (content: MindsetContent) => {
        setSelectedContent(content);
        setShowActionModal(true);
    };

    const handleInternalize = (note: string) => {
        if (selectedContent) {
            internalize(selectedContent.id);
            Alert.alert(
                '📝 Saved to Journal',
                'This insight has been added to your reflections.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleOperationalize = (taskTitle: string) => {
        if (selectedContent) {
            operationalize(selectedContent.id);
            
            // Navigate to task creation with pre-filled data
            router.push({
                pathname: '/(tabs)/sdlc/create-task',
                params: {
                    title: taskTitle,
                    dimension: selectedContent.dimensionTag,
                    source: 'mindset',
                },
            } as any);
        }
    };

    const handleAddToCollection = () => {
        if (selectedContent) {
            const isFav = toggleFavorite(selectedContent.id);
            Alert.alert(
                '⭐ Added to Favorites',
                'View all your favorites in the More menu.',
                [
                    { text: 'OK' },
                    {
                        text: 'View Favorites',
                        onPress: () => router.push('/(tabs)/motivation/favorites'),
                    },
                ]
            );
        }
    };

    return (
        <View className="flex-1 bg-black">
            <MindsetFeed onLongPress={handleLongPress} />
            
            <ActionIntakeModal
                visible={showActionModal}
                content={selectedContent}
                onClose={() => setShowActionModal(false)}
                onInternalize={handleInternalize}
                onOperationalize={handleOperationalize}
                onAddToCollection={handleAddToCollection}
            />
        </View>
    );
}
