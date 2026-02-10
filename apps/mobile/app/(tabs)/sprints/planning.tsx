/**
 * Sprint Planning Screen — Full wizard with real data
 *
 * 4-step flow: Capacity → Select Tasks → Review Balance → Commit
 * Sources: Backlog, Templates, AI Suggestions
 * Persistent floating capacity bar throughout.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    useCurrentSprint,
    useCommitSprint,
    useSprintTasks,
} from '../../../hooks/queries/useSprints';
import { useBacklogTasks, useCreateTask } from '../../../hooks/queries/useTasks';
import { useLifeWheelAreas } from '../../../hooks/queries';
import { useSprintPreferences } from '../../../hooks/queries/useSprintCeremonies';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { LifeWheelBalance, CapacityBar } from '../../../components/sprints/LifeWheelBalance';
import { PlanningTemplatesTab } from '../../../components/sprints/PlanningTemplatesTab';
import { PlanningQuickAddTab } from '../../../components/sprints/PlanningQuickAddTab';
import { CarriedOverBadge } from '../../../components/sprints/CarriedOverBadge';
import { cancelMidWeekNudge } from '../../../utils/notifications';
import { logger } from '../../../utils/logger';
import { Task } from '../../../types/models';

interface SelectableTask {
    id: string;
    title: string;
    storyPoints: number;
    lifeWheelAreaId: string;
    epicId?: string;
    source: 'backlog' | 'template' | 'created' | 'sprint';
    carriedOverFromSprintId?: string;
    originalStoryPoints?: number;
}

const DIMENSION_META: Record<string, { color: string; name: string }> = {
    'lw-1': { color: '#EF4444', name: 'Health' },
    'lw-2': { color: '#3B82F6', name: 'Career' },
    'lw-3': { color: '#EC4899', name: 'Family' },
    'lw-4': { color: '#F59E0B', name: 'Finance' },
    'lw-5': { color: '#8B5CF6', name: 'Growth' },
    'lw-6': { color: '#06B6D4', name: 'Friends' },
    'lw-7': { color: '#F97316', name: 'Fun' },
    'lw-8': { color: '#14B8A6', name: 'Environment' },
};

type PlanningStep = 'capacity' | 'select' | 'review' | 'commit';
type SourceTab = 'backlog' | 'templates' | 'quick-add';

export default function SprintPlanningScreen() {
    const { colors, isDark } = useThemeContext();
    const params = useLocalSearchParams<{ sprintId?: string }>();

    // Data hooks
    const { data: currentSprintRaw } = useCurrentSprint();
    const currentSprint = currentSprintRaw as { id: string; weekNumber: number; year: number; startDate: string; endDate: string; totalPoints: number; status: string } | undefined;
    const sprintId = params.sprintId || currentSprint?.id || '';

    const { data: backlogRaw = [] } = useBacklogTasks();
    const { data: sprintTasksRaw = [] } = useSprintTasks(sprintId);
    const { data: settingsRaw } = useSprintPreferences();
    const { data: lifeWheelRaw = [] } = useLifeWheelAreas();
    const commitMutation = useCommitSprint();
    const createTaskMutation = useCreateTask();

    const settings = settingsRaw as { targetVelocity?: number } | undefined;
    const targetVelocity = settings?.targetVelocity || 56;

    // Existing sprint tasks (for edit mode)
    const sprintTasks: SelectableTask[] = useMemo(() => {
        const raw = Array.isArray(sprintTasksRaw) ? sprintTasksRaw : [];
        return raw.map((t: Task) => ({
            id: t.id,
            title: t.title,
            storyPoints: t.storyPoints || 3,
            lifeWheelAreaId: t.lifeWheelAreaId || 'lw-4',
            epicId: t.epicId || undefined,
            source: 'sprint' as const,
            carriedOverFromSprintId: t.carriedOverFromSprintId || undefined,
            originalStoryPoints: t.originalStoryPoints || undefined,
        }));
    }, [sprintTasksRaw]);

    // Detect edit mode — sprint already has committed tasks
    const isEditMode = sprintTasks.length > 0;

    // Cast backlog data — exclude tasks already in sprint
    const backlogTasks: SelectableTask[] = useMemo(() => {
        const raw = Array.isArray(backlogRaw) ? backlogRaw : [];
        const sprintTaskIds = new Set(sprintTasks.map(t => t.id));
        return raw
            .filter((t: Task) => !sprintTaskIds.has(t.id))
            .map((t: Task) => ({
                id: t.id,
                title: t.title,
                storyPoints: t.storyPoints || 3,
                lifeWheelAreaId: t.lifeWheelAreaId || 'lw-4',
                epicId: t.epicId || undefined,
                source: 'backlog' as const,
            }));
    }, [backlogRaw, sprintTasks]);

    // State — pre-populate from existing sprint tasks in edit mode
    const [step, setStep] = useState<PlanningStep>(isEditMode ? 'select' : 'capacity');
    const [capacity, setCapacity] = useState(targetVelocity);
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(
        isEditMode ? sprintTasks.map(t => t.id) : [],
    );
    const [createdTasks, setCreatedTasks] = useState<SelectableTask[]>([]);
    const [sprintGoal, setSprintGoal] = useState(
        (currentSprint as { sprintGoal?: string } | undefined)?.sprintGoal || '',
    );
    const [sourceTab, setSourceTab] = useState<SourceTab>('backlog');
    const [quickAddTitle, setQuickAddTitle] = useState('');
    const [quickAddPoints, setQuickAddPoints] = useState(3);

    // All available tasks (sprint existing + backlog + user-created during planning)
    const allTasks = useMemo(() => [...sprintTasks, ...backlogTasks, ...createdTasks], [sprintTasks, backlogTasks, createdTasks]);

    // Derived
    const selectedTasks = useMemo(() => allTasks.filter(t => selectedTaskIds.includes(t.id)), [allTasks, selectedTaskIds]);
    const selectedPoints = useMemo(() => selectedTasks.reduce((sum, t) => sum + t.storyPoints, 0), [selectedTasks]);
    const capacityPercent = capacity > 0 ? Math.round((selectedPoints / capacity) * 100) : 0;

    // Dimension distribution for Life Wheel Balance
    const dimensionDistribution = useMemo(() => {
        const allDimIds = Object.keys(DIMENSION_META);
        const map: Record<string, number> = {};
        allDimIds.forEach(id => { map[id] = 0; });
        selectedTasks.forEach(t => {
            const area = t.lifeWheelAreaId || 'lw-4';
            map[area] = (map[area] || 0) + t.storyPoints;
        });
        return allDimIds.map(id => ({ areaId: id, points: map[id] || 0 }));
    }, [selectedTasks]);

    const toggleTask = useCallback((taskId: string) => {
        setSelectedTaskIds(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    }, []);

    const handleQuickAdd = useCallback(async () => {
        if (!quickAddTitle.trim()) return;
        try {
            const result = await createTaskMutation.mutateAsync({
                title: quickAddTitle.trim(),
                storyPoints: quickAddPoints,
                status: 'TODO',
            });
            const newTask: SelectableTask = {
                id: (result as Record<string, unknown>)?.id as string || `quick-${Date.now()}`,
                title: quickAddTitle.trim(),
                storyPoints: quickAddPoints,
                lifeWheelAreaId: 'lw-4',
                source: 'created',
            };
            setCreatedTasks(prev => [...prev, newTask]);
            setSelectedTaskIds(prev => [...prev, newTask.id]);
            setQuickAddTitle('');
            setQuickAddPoints(3);
        } catch (error: unknown) {
            logger.error('Planning', 'Quick add failed', error);
        }
    }, [quickAddTitle, quickAddPoints, createTaskMutation]);

    // Callback for PlanningTemplatesTab / PlanningQuickAddTab bulk create
    const handleTabTasksCreated = useCallback((tasks: { id: string; title: string; storyPoints: number; lifeWheelAreaId: string }[]) => {
        const newTasks: SelectableTask[] = tasks.map(t => ({
            id: t.id,
            title: t.title,
            storyPoints: t.storyPoints,
            lifeWheelAreaId: t.lifeWheelAreaId,
            source: 'created' as const,
        }));
        setCreatedTasks(prev => [...prev, ...newTasks]);
        setSelectedTaskIds(prev => [...prev, ...newTasks.map(t => t.id)]);
    }, []);

    // Backlog select/deselect all
    const toggleSelectAllBacklog = useCallback(() => {
        const allBacklogIds = backlogTasks.map(t => t.id);
        const allSelected = allBacklogIds.every(id => selectedTaskIds.includes(id));
        if (allSelected) {
            setSelectedTaskIds(prev => prev.filter(id => !allBacklogIds.includes(id)));
        } else {
            setSelectedTaskIds(prev => [...new Set([...prev, ...allBacklogIds])]);
        }
    }, [backlogTasks, selectedTaskIds]);

    const handleCommit = useCallback(async () => {
        if (!sprintId || selectedTaskIds.length === 0) return;
        try {
            await commitMutation.mutateAsync({
                sprintId,
                data: {
                    taskIds: selectedTaskIds,
                    sprintGoal: sprintGoal.trim() || undefined,
                },
            });
            // Sprint committed — cancel any mid-week nudge
            await cancelMidWeekNudge();
            setStep('commit');
        } catch (error: unknown) {
            logger.error('Planning', 'Sprint commit failed', error);
            Alert.alert('Commit Failed', 'Could not commit sprint. Please try again.');
        }
    }, [sprintId, selectedTaskIds, sprintGoal, commitMutation]);

    const getDimColor = (areaId: string) => DIMENSION_META[areaId]?.color || '#6B7280';
    const getDimName = (areaId: string) => DIMENSION_META[areaId]?.name || areaId;

    // ── Step 1: Capacity ────────────────────────────────────────────────────
    const renderCapacityStep = () => (
        <ScrollView className="flex-1 p-4">
            <View className="rounded-2xl p-6 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="text-xl font-semibold mb-2" style={{ color: colors.text }}>Set Sprint Capacity</Text>
                <Text className="mb-6" style={{ color: colors.textSecondary }}>
                    Your target velocity is {targetVelocity} points/sprint. Adjust based on this week's availability.
                </Text>

                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => setCapacity(Math.max(10, capacity - 5))}
                        className="w-14 h-14 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                        <MaterialCommunityIcons name="minus" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-5xl font-bold" style={{ color: colors.text }}>{capacity}</Text>
                        <Text style={{ color: colors.textSecondary }}>points this sprint</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setCapacity(capacity + 5)}
                        className="w-14 h-14 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                        <MaterialCommunityIcons name="plus" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {capacity > targetVelocity * 1.2 && (
                    <View className="p-3 rounded-xl flex-row items-center" style={{ backgroundColor: '#FEF9C320' }}>
                        <MaterialCommunityIcons name="alert" size={20} color="#EAB308" />
                        <Text className="ml-2 flex-1 text-sm" style={{ color: '#EAB308' }}>
                            This is 20%+ above your target. Consider realistic commitments.
                        </Text>
                    </View>
                )}
            </View>

            {/* Sprint info */}
            {currentSprint && (
                <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.card }}>
                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>Planning for</Text>
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        Week {currentSprint.weekNumber} • {currentSprint.year}
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                        {currentSprint.startDate} → {currentSprint.endDate}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                onPress={() => setStep('select')}
                className="p-4 rounded-xl flex-row items-center justify-center"
                style={{ backgroundColor: colors.primary }}
            >
                <Text className="text-white font-bold text-lg">Select Tasks →</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    // ── Step 2: Select Tasks (3 source tabs) ────────────────────────────────
    const renderSelectStep = () => (
        <View className="flex-1">
            {/* Source tabs */}
            <View className="flex-row px-4 pt-3 pb-1">
                {([
                    { key: 'backlog' as const, label: 'Backlog', icon: 'inbox' },
                    { key: 'templates' as const, label: 'Templates', icon: 'file-document-outline' },
                    { key: 'quick-add' as const, label: 'Quick Add', icon: 'plus-circle-outline' },
                ] as const).map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setSourceTab(tab.key)}
                        className="flex-1 items-center py-3 rounded-xl mx-1"
                        style={{
                            backgroundColor: sourceTab === tab.key ? colors.primary + '15' : colors.backgroundSecondary,
                            borderWidth: sourceTab === tab.key ? 1.5 : 0,
                            borderColor: sourceTab === tab.key ? colors.primary : 'transparent',
                        }}
                    >
                        <MaterialCommunityIcons
                            name={tab.icon as 'inbox'}
                            size={18}
                            color={sourceTab === tab.key ? colors.primary : colors.textTertiary}
                        />
                        <Text className="text-xs mt-1 font-semibold" style={{
                            color: sourceTab === tab.key ? colors.primary : colors.textTertiary,
                        }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
                {sourceTab === 'backlog' && (
                    <>
                        {/* Existing sprint tasks (edit mode) */}
                        {isEditMode && sprintTasks.length > 0 && (
                            <View className="mb-3">
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-xs font-semibold" style={{ color: '#F59E0B' }}>
                                        In Sprint ({sprintTasks.length})
                                    </Text>
                                </View>
                                {sprintTasks.map(task => renderTaskRow(task))}
                                <View className="h-px my-2" style={{ backgroundColor: colors.border }} />
                            </View>
                        )}
                        {backlogTasks.length === 0 && !isEditMode ? (
                            <View className="items-center py-12">
                                <MaterialCommunityIcons name="inbox-outline" size={48} color={colors.textTertiary} />
                                <Text className="text-base mt-3 mb-1 font-semibold" style={{ color: colors.text }}>Backlog is empty</Text>
                                <Text className="text-sm text-center" style={{ color: colors.textSecondary }}>
                                    Use Quick Add to create tasks, or check Templates for inspiration.
                                </Text>
                            </View>
                        ) : backlogTasks.length > 0 ? (
                            <>
                                {/* Select All / Deselect All */}
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                        {backlogTasks.length} backlog task{backlogTasks.length !== 1 ? 's' : ''}
                                    </Text>
                                    <TouchableOpacity onPress={toggleSelectAllBacklog}>
                                        <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                                            {backlogTasks.every(t => selectedTaskIds.includes(t.id)) ? 'Deselect All' : 'Select All'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {backlogTasks.map(task => renderTaskRow(task))}
                            </>
                        ) : null}
                    </>
                )}

                {sourceTab === 'templates' && (
                    <PlanningTemplatesTab
                        sprintId={sprintId}
                        onTasksCreated={handleTabTasksCreated}
                    />
                )}

                {sourceTab === 'quick-add' && (
                    <PlanningQuickAddTab
                        sprintId={sprintId}
                        onTasksCreated={handleTabTasksCreated}
                    />
                )}

                {/* Show tasks created during planning in backlog view */}
                {sourceTab === 'backlog' && createdTasks.filter(t => selectedTaskIds.includes(t.id)).length > 0 && (
                    <>
                        <Text className="text-xs font-semibold mt-4 mb-2" style={{ color: colors.textSecondary }}>
                            Added during planning ({createdTasks.filter(t => selectedTaskIds.includes(t.id)).length})
                        </Text>
                        {createdTasks.filter(t => selectedTaskIds.includes(t.id)).map(task => renderTaskRow(task))}
                    </>
                )}
            </ScrollView>

            {/* Bottom nav */}
            <View className="flex-row gap-3 px-4 py-3">
                <TouchableOpacity
                    onPress={() => setStep('capacity')}
                    className="flex-1 p-4 rounded-xl"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <Text className="text-center font-semibold" style={{ color: colors.text }}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setStep('review')}
                    className="flex-1 p-4 rounded-xl"
                    style={{ backgroundColor: selectedTaskIds.length > 0 ? colors.primary : colors.textTertiary }}
                    disabled={selectedTaskIds.length === 0}
                >
                    <Text className="text-white text-center font-semibold">Review →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // ── Shared task row renderer ─────────────────────────────────────────────
    const renderTaskRow = (task: SelectableTask) => {
        const isSelected = selectedTaskIds.includes(task.id);
        const dimColor = getDimColor(task.lifeWheelAreaId);
        return (
            <TouchableOpacity
                key={task.id}
                onPress={() => toggleTask(task.id)}
                className="p-4 rounded-xl mb-2 flex-row items-center"
                style={{
                    backgroundColor: colors.card,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : 'transparent',
                }}
            >
                <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: dimColor + '25' }}
                >
                    <MaterialCommunityIcons
                        name={isSelected ? 'check' : 'plus'}
                        size={18}
                        color={isSelected ? colors.primary : dimColor}
                    />
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className="font-medium flex-shrink" style={{ color: colors.text }}>{task.title}</Text>
                        {task.carriedOverFromSprintId && (
                            <CarriedOverBadge
                                fromSprintId={task.carriedOverFromSprintId}
                                originalPoints={task.originalStoryPoints}
                                currentPoints={task.storyPoints}
                                compact
                            />
                        )}
                    </View>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        {getDimName(task.lifeWheelAreaId)}
                        {task.source === 'created' && ' • Added in planning'}
                        {task.source === 'template' && ' • From template'}
                        {task.source === 'sprint' && ' • In sprint'}
                    </Text>
                </View>
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <Text className="font-bold text-sm" style={{ color: colors.text }}>{task.storyPoints}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // ── Step 3: Review ──────────────────────────────────────────────────────
    const renderReviewStep = () => (
        <ScrollView className="flex-1 p-4">
            {/* Capacity bar - full version */}
            <View className="mb-4">
                <CapacityBar selectedPoints={selectedPoints} targetVelocity={capacity} />
            </View>

            {/* Life Wheel Balance */}
            <View className="mb-4">
                <LifeWheelBalance
                    distribution={dimensionDistribution}
                    totalPoints={selectedPoints}
                    targetVelocity={capacity}
                />
            </View>

            {/* Sprint Summary */}
            <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>Sprint Summary</Text>
                <View className="flex-row justify-between">
                    <View className="items-center">
                        <Text className="text-3xl font-bold" style={{ color: colors.text }}>{selectedTasks.length}</Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>Tasks</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-3xl font-bold" style={{ color: colors.primary }}>{selectedPoints}</Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>Points</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-3xl font-bold" style={{
                            color: capacityPercent > 100 ? '#EF4444' : capacityPercent > 85 ? '#F59E0B' : '#10B981',
                        }}>
                            {capacityPercent}%
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>Capacity</Text>
                    </View>
                </View>
            </View>

            {/* Selected tasks list */}
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>
                    Selected Tasks ({selectedTasks.length})
                </Text>
                {selectedTasks.map(task => (
                    <View key={task.id} className="flex-row items-center py-2" style={{ borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
                        <View className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: getDimColor(task.lifeWheelAreaId) }} />
                        <Text className="flex-1 text-sm" style={{ color: colors.text }}>{task.title}</Text>
                        <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>{task.storyPoints}pts</Text>
                    </View>
                ))}
            </View>

            {/* Sprint Goal */}
            <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="text-base font-bold mb-2" style={{ color: colors.text }}>Sprint Goal (optional)</Text>
                <TextInput
                    value={sprintGoal}
                    onChangeText={setSprintGoal}
                    placeholder="What's the main focus of this sprint?"
                    placeholderTextColor={colors.placeholder}
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: colors.backgroundSecondary, color: colors.text }}
                    multiline
                />
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-3 mb-8">
                <TouchableOpacity
                    onPress={() => setStep('select')}
                    className="flex-1 p-4 rounded-xl"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <Text className="text-center font-semibold" style={{ color: colors.text }}>← Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleCommit}
                    disabled={commitMutation.isPending}
                    className="flex-1 p-4 rounded-xl flex-row items-center justify-center"
                    style={{ backgroundColor: '#10B981' }}
                >
                    {commitMutation.isPending ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="check-bold" size={18} color="#FFFFFF" />
                            <Text className="text-white font-bold ml-2">
                                {isEditMode ? 'Update Sprint' : 'Commit Sprint'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    // ── Step 4: Committed ───────────────────────────────────────────────────
    const renderCommitStep = () => (
        <View className="flex-1 p-6 justify-center items-center">
            <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#10B98125' }}>
                <MaterialCommunityIcons name="check-circle" size={64} color="#10B981" />
            </View>

            <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                {isEditMode ? 'Sprint Updated!' : 'Sprint Committed!'}
            </Text>
            <Text className="text-center mb-6" style={{ color: colors.textSecondary }}>
                {selectedTasks.length} tasks • {selectedPoints} points committed for this week
            </Text>

            {sprintGoal ? (
                <View className="p-4 rounded-xl mb-6 w-full" style={{ backgroundColor: colors.card }}>
                    <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>Sprint Goal</Text>
                    <Text className="font-medium" style={{ color: colors.text }}>{sprintGoal}</Text>
                </View>
            ) : null}

            <View className="rounded-2xl p-5 w-full mb-8" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-3" style={{ color: colors.text }}>What's Next</Text>
                {[
                    { icon: 'play-circle', color: '#10B981', text: 'Sprint is now active — start working on tasks' },
                    { icon: 'clock-outline', color: '#3B82F6', text: 'Daily standups help track your progress' },
                    { icon: 'chart-line', color: '#8B5CF6', text: 'Keep your capacity balanced across life areas' },
                ].map((tip, idx) => (
                    <View key={idx} className="flex-row items-start mb-2">
                        <MaterialCommunityIcons name={tip.icon as 'play-circle'} size={18} color={tip.color} />
                        <Text className="ml-3 flex-1 text-sm" style={{ color: colors.textSecondary }}>{tip.text}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                onPress={() => router.back()}
                className="w-full p-4 rounded-xl"
                style={{ backgroundColor: colors.primary }}
            >
                <Text className="text-white text-center font-bold text-lg">Go to Sprint →</Text>
            </TouchableOpacity>
        </View>
    );

    // ── Main Layout ─────────────────────────────────────────────────────────
    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-lg font-bold flex-1" style={{ color: colors.text }}>
                    {isEditMode ? 'Edit Sprint' : 'Sprint Planning'}
                </Text>

                {/* Step indicators */}
                <View className="flex-row">
                    {(['capacity', 'select', 'review', 'commit'] as PlanningStep[]).map((s, idx) => (
                        <View
                            key={s}
                            className="w-2.5 h-2.5 rounded-full mx-0.5"
                            style={{
                                backgroundColor: (['capacity', 'select', 'review', 'commit'] as PlanningStep[]).indexOf(step) >= idx
                                    ? colors.primary
                                    : colors.backgroundSecondary,
                            }}
                        />
                    ))}
                </View>
            </View>

            {/* Step content */}
            {step === 'capacity' && renderCapacityStep()}
            {step === 'select' && renderSelectStep()}
            {step === 'review' && renderReviewStep()}
            {step === 'commit' && renderCommitStep()}

            {/* Floating capacity bar (visible during select step) */}
            {step === 'select' && (
                <CapacityBar selectedPoints={selectedPoints} targetVelocity={capacity} compact />
            )}
        </SafeAreaView>
    );
}
