import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { useCreateTask } from '../../../hooks/queries/useTasks';
import { useLifeWheelAreas, useEisenhowerQuadrants } from '../../../hooks/queries';
import { useEpics } from '../../../hooks/queries/useEpics';
import { useCurrentSprint } from '../../../hooks/queries/useSprints';
import { STORY_POINTS } from '../../../utils/constants';
import { useTranslation } from '../../../hooks';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { logger } from '../../../utils/logger';

export default function CreateTaskScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ sprintId?: string }>();
    const { t } = useTranslation();
    const { colors } = useThemeContext();

    const createTaskMutation = useCreateTask();
    const { data: lifeWheelAreas = [] } = useLifeWheelAreas();
    const { data: quadrantsData = [] } = useEisenhowerQuadrants();
    const { data: epicsData = [] } = useEpics();
    const { data: currentSprint } = useCurrentSprint();

    const areas = Array.isArray(lifeWheelAreas) ? lifeWheelAreas as Array<{ id: string; name: string; icon: string; color: string }> : [];
    const quads = Array.isArray(quadrantsData) ? quadrantsData as Array<{ id: string; name: string; label: string; color: string }> : [];
    const epics = Array.isArray(epicsData) ? epicsData as Array<{ id: string; title: string; description: string; color: string; icon: string }> : [];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [storyPoints, setStoryPoints] = useState<number>(3);
    const [lifeWheelAreaId, setLifeWheelAreaId] = useState('');
    const [eisenhowerQuadrantId, setEisenhowerQuadrantId] = useState('');
    const [epicId, setEpicId] = useState('');
    const [assignToSprint, setAssignToSprint] = useState(!!params.sprintId);

    // Set defaults when data loads
    if (areas.length > 0 && !lifeWheelAreaId) setLifeWheelAreaId(areas[0].id);
    if (quads.length > 0 && !eisenhowerQuadrantId) setEisenhowerQuadrantId(quads[0].id);

    const resolvedSprintId = params.sprintId || (currentSprint as Record<string, unknown> | undefined)?.id as string | undefined;

    const handleCreate = async () => {
        if (!title.trim()) return;

        try {
            const taskData: Record<string, unknown> = {
                title: title.trim(),
                description: description.trim() || undefined,
                storyPoints,
                lifeWheelAreaId,
                eisenhowerQuadrantId,
                epicId: epicId || undefined,
                status: 'TODO',
            };

            if (assignToSprint && resolvedSprintId) {
                taskData.sprintId = resolvedSprintId;
            }

            await createTaskMutation.mutateAsync(taskData);
            router.back();
        } catch (error: unknown) {
            logger.error('CreateTask', 'Failed to create task', error);
        }
    };

    return (
        <Container>
            <ScreenHeader title={t('tasks.createTask')} subtitle={t('tasks.addToBacklog')} showBack />

            <ScrollView className="flex-1 p-6">
                {/* Title Input - Big and Bold */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                        {t('tasks.taskTitle')}
                    </Text>
                    <TextInput
                        className="text-2xl font-bold pb-2"
                        style={{ color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.border }}
                        placeholder={t('tasks.taskTitlePlaceholder')}
                        placeholderTextColor={colors.placeholder}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Description Input */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                        {t('tasks.description')}
                    </Text>
                    <View className="p-4 rounded-xl min-h-[100px]" style={{ backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border }}>
                        <TextInput
                            className="text-base leading-relaxed"
                            style={{ color: colors.text }}
                            placeholder={t('tasks.descriptionPlaceholder')}
                            placeholderTextColor={colors.placeholder}
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                </View>

                {/* Story Points - Modern Cards */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                        {t('tasks.storyPoints')}
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                        {STORY_POINTS.map((points) => (
                            <TouchableOpacity
                                key={points}
                                onPress={() => setStoryPoints(points)}
                                className="w-14 h-14 rounded-2xl items-center justify-center"
                                style={{
                                    backgroundColor: storyPoints === points ? colors.primary : colors.card,
                                    borderWidth: 2,
                                    borderColor: storyPoints === points ? colors.primary : colors.border,
                                }}
                            >
                                <Text className="text-lg font-bold" style={{ color: storyPoints === points ? '#FFFFFF' : colors.text }}>
                                    {points}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Sprint Assignment Toggle */}
                {resolvedSprintId && (
                    <View className="mb-8">
                        <Text className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                            Sprint Assignment
                        </Text>
                        <TouchableOpacity
                            onPress={() => setAssignToSprint(!assignToSprint)}
                            className="p-4 rounded-xl flex-row items-center justify-between"
                            style={{
                                backgroundColor: assignToSprint ? colors.primary + '15' : colors.card,
                                borderWidth: 2,
                                borderColor: assignToSprint ? colors.primary : colors.border,
                            }}
                        >
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons
                                    name={assignToSprint ? 'calendar-check' : 'calendar-blank-outline'}
                                    size={20}
                                    color={assignToSprint ? colors.primary : colors.textSecondary}
                                />
                                <Text className="ml-3 font-semibold" style={{ color: assignToSprint ? colors.primary : colors.text }}>
                                    {assignToSprint ? 'Add to current sprint' : 'Keep in backlog'}
                                </Text>
                            </View>
                            <MaterialCommunityIcons
                                name={assignToSprint ? 'check-circle' : 'circle-outline'}
                                size={22}
                                color={assignToSprint ? colors.primary : colors.textTertiary}
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Life Wheel Area - Colorful Pills */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                        {t('tasks.lifeArea')}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {areas.map((area) => (
                            <TouchableOpacity
                                key={area.id}
                                onPress={() => setLifeWheelAreaId(area.id)}
                                className="px-4 py-3 rounded-xl"
                                style={{
                                    borderWidth: 2,
                                    borderColor: lifeWheelAreaId === area.id ? colors.text : colors.border,
                                    backgroundColor: lifeWheelAreaId === area.id ? area.color + '30' : colors.card,
                                }}
                            >
                                <Text className="font-semibold" style={{ color: lifeWheelAreaId === area.id ? colors.text : colors.textSecondary }}>
                                    {area.icon} {area.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Eisenhower Priority - Cards with Labels */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                        {t('tasks.priorityEisenhower')}
                    </Text>
                    <View className="gap-3">
                        {quads.map((quad) => (
                            <TouchableOpacity
                                key={quad.id}
                                onPress={() => setEisenhowerQuadrantId(quad.id)}
                                className="p-4 rounded-xl flex-row items-center justify-between"
                                style={{
                                    borderWidth: 2,
                                    borderColor: eisenhowerQuadrantId === quad.id ? colors.text : colors.border,
                                    backgroundColor: eisenhowerQuadrantId === quad.id ? colors.text : colors.card,
                                }}
                            >
                                <View>
                                    <Text className="font-bold text-base mb-1" style={{
                                        color: eisenhowerQuadrantId === quad.id ? colors.card : colors.text,
                                    }}>
                                        {quad.name}
                                    </Text>
                                    <Text className="text-sm" style={{
                                        color: eisenhowerQuadrantId === quad.id ? colors.textTertiary : colors.textSecondary,
                                    }}>
                                        {quad.label}
                                    </Text>
                                </View>
                                {eisenhowerQuadrantId === quad.id && (
                                    <MaterialCommunityIcons name="check-circle" size={24} color={colors.card} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Epic Selector - Optional with Epic Cards */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                        {t('tasks.linkToEpic')}
                    </Text>
                    
                    {/* No Epic Option */}
                    <TouchableOpacity
                        onPress={() => setEpicId('')}
                        className="p-4 rounded-xl mb-3 flex-row items-center justify-between"
                        style={{
                            borderWidth: 2,
                            borderColor: !epicId ? colors.textSecondary : colors.border,
                            backgroundColor: !epicId ? colors.backgroundSecondary : colors.card,
                        }}
                    >
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons 
                                name="inbox-outline" 
                                size={20} 
                                color={!epicId ? colors.text : colors.textTertiary} 
                            />
                            <Text className="ml-3 font-semibold" style={{ color: !epicId ? colors.text : colors.textSecondary }}>
                                {t('tasks.noEpicStandalone')}
                            </Text>
                        </View>
                        {!epicId && (
                            <MaterialCommunityIcons name="check-circle" size={20} color={colors.text} />
                        )}
                    </TouchableOpacity>

                    {/* Epic Options */}
                    {epics.length > 0 && (
                        <View className="gap-3">
                            {epics.map((epic) => (
                                <TouchableOpacity
                                    key={epic.id}
                                    onPress={() => setEpicId(epic.id)}
                                    className="rounded-xl overflow-hidden"
                                    style={{
                                        borderWidth: 2,
                                        borderColor: epicId === epic.id ? colors.text : colors.border,
                                    }}
                                >
                                    <View className="h-1" style={{ backgroundColor: epic.color }} />
                                    <View className="p-4 flex-row items-center justify-between" style={{ backgroundColor: colors.card }}>
                                        <View className="flex-1">
                                            <View className="flex-row items-center mb-1">
                                                <MaterialCommunityIcons 
                                                    name={(epic.icon || 'rocket-launch-outline') as 'rocket-launch-outline'} 
                                                    size={18} 
                                                    color={epic.color} 
                                                />
                                                <Text className="ml-2 font-bold" style={{ color: colors.text }}>
                                                    {epic.title}
                                                </Text>
                                            </View>
                                            <Text className="text-sm" numberOfLines={1} style={{ color: colors.textSecondary }}>
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
                        <View className="rounded-xl p-6 items-center" style={{ backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border }}>
                            <MaterialCommunityIcons name="rocket-launch-outline" size={40} color={colors.textTertiary} />
                            <Text className="text-sm mt-2 text-center" style={{ color: colors.textSecondary }}>
                                {t('tasks.noEpicsYet')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Create Button */}
                <TouchableOpacity
                    className="py-4 rounded-xl shadow-lg flex-row items-center justify-center mb-10"
                    style={{
                        backgroundColor: title.trim() && !createTaskMutation.isPending ? colors.primary : colors.textTertiary,
                    }}
                    onPress={handleCreate}
                    disabled={!title.trim() || createTaskMutation.isPending}
                >
                    {createTaskMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                    )}
                    <Text className="text-white font-bold text-lg ml-2">{t('tasks.createTask')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </Container>
    );
}
