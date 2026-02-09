import { logger } from '../../utils/logger';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    Pressable,
    Platform,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TaskTemplate } from '../../types/models';
import { LIFE_WHEEL_CONFIG } from './TemplateCard';
import { useTrackTemplateUsage, useCreateTask } from '../../hooks/queries';
import { useThemeContext } from '../../providers/ThemeProvider';
import { sprintApi, lifeWheelApi, fileUploadApi } from '../../services/api';
import { STORY_POINTS } from '../../utils/constants';
import { AttachmentPicker, AttachmentPreview, CommentAttachment } from '../ui/AttachmentPicker';
import { TaskScheduler } from '../ui/TaskScheduler';
import {
    TaskScheduleState,
    createDefaultScheduleState,
    TaskType,
} from '../../types/schedule.types';

interface CreateFromTemplateSheetProps {
    visible: boolean;
    template: TaskTemplate | null;
    onClose: () => void;
    onSuccess?: (taskId: string) => void;
}

interface Sprint {
    id: string;
    name: string;
    weekNumber: number;
    startDate: string;
    endDate: string;
}

interface EisenhowerQuadrant {
    id: string;
    name: string;
    label: string;
    color: string;
}

export function CreateFromTemplateSheet({
    visible,
    template,
    onClose,
    onSuccess,
}: CreateFromTemplateSheetProps) {
    const trackUsageMutation = useTrackTemplateUsage();
    const createTaskMutation = useCreateTask();
    const { colors, isDark } = useThemeContext();

    // Sprint data (for auto-resolution)
    const [sprints, setSprints] = useState<Sprint[]>([]);

    // Eisenhower quadrants
    const [quadrants, setQuadrants] = useState<EisenhowerQuadrant[]>([]);
    const [loadingQuadrants, setLoadingQuadrants] = useState(false);

    // Life Wheel areas
    const [lifeWheelAreas, setLifeWheelAreas] = useState<any[]>([]);
    const [selectedLifeWheelAreaId, setSelectedLifeWheelAreaId] = useState<string>('');
    const [showLifeWheelPicker, setShowLifeWheelPicker] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [storyPoints, setStoryPoints] = useState<number>(3);
    const [eisenhowerQuadrantId, setEisenhowerQuadrantId] = useState<string>('eq-2');
    const [useAiRefinement, setUseAiRefinement] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Tags
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);

    // Comment
    const [comment, setComment] = useState('');
    const [commentBold, setCommentBold] = useState(false);
    const [commentItalic, setCommentItalic] = useState(false);
    const [commentBulletList, setCommentBulletList] = useState(false);
    const [attachments, setAttachments] = useState<CommentAttachment[]>([]);
    const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);

    // Unified schedule state — replaces ~20 individual state vars
    const [schedule, setSchedule] = useState<TaskScheduleState>(createDefaultScheduleState());

    // Derive initial task type from template
    const getTaskTypeFromTemplate = (tmpl: TaskTemplate): TaskType => {
        if (tmpl.type === 'event') return 'EVENT';
        return 'TASK';
    };

    // Map backend frequency string to RecurrencePreset
    const mapFrequencyToPreset = (frequency?: string): TaskScheduleState['recurrence'] => {
        if (!frequency) return 'NONE';
        switch (frequency.toLowerCase()) {
            case 'daily': return 'DAILY';
            case 'weekly': return 'WEEKLY';
            case 'monthly': return 'MONTHLY';
            case 'yearly': return 'YEARLY';
            default: return 'NONE';
        }
    };

    useEffect(() => {
        if (template) {
            setTitle(template.name);
            setDescription(template.description || '');
            setStoryPoints(template.defaultStoryPoints || 3);
            setEisenhowerQuadrantId(template.defaultEisenhowerQuadrantId || 'eq-2');
            setSelectedLifeWheelAreaId(template.defaultLifeWheelAreaId || '');
            setTags([]);
            setComment('');
            setAttachments([]);

            // Initialize schedule from template
            const taskType = getTaskTypeFromTemplate(template);
            setSchedule({
                ...createDefaultScheduleState(taskType),
                allDay: template.isAllDay || false,
                location: template.defaultLocation || '',
                sprintId: sprints.length > 0 ? sprints[0].id : null,
                ...(template.recurrencePattern ? {
                    recurrence: mapFrequencyToPreset(template.recurrencePattern.frequency),
                } : {}),
            });
        }
    }, [template]);

    useEffect(() => {
        if (visible) {
            fetchSprints();
            fetchQuadrants();
            fetchLifeWheelAreas();
        }
    }, [visible]);

    const fetchLifeWheelAreas = async () => {
        try {
            const areas = await lifeWheelApi.getLifeWheelAreas() as any[];
            setLifeWheelAreas(areas);
        } catch (error) {
            logger.error('Failed to load life wheel areas:', error);
        }
    };

    const fetchQuadrants = async () => {
        setLoadingQuadrants(true);
        try {
            const quadrantsData = await lifeWheelApi.getEisenhowerQuadrants() as EisenhowerQuadrant[];
            setQuadrants(quadrantsData);
        } catch (error) {
            logger.error('Failed to load quadrants:', error);
            // Fallback to default quadrants
            setQuadrants([
                { id: 'eq-1', name: 'Do First', label: 'Urgent & Important', color: '#DC2626' },
                { id: 'eq-2', name: 'Schedule', label: 'Not Urgent & Important', color: '#2563EB' },
                { id: 'eq-3', name: 'Delegate', label: 'Urgent & Not Important', color: '#CA8A04' },
                { id: 'eq-4', name: 'Eliminate', label: 'Not Urgent & Not Important', color: '#6B7280' },
            ]);
        } finally {
            setLoadingQuadrants(false);
        }
    };

    const fetchSprints = async () => {
        try {
            const currentYear = new Date().getFullYear();
            const sprintData = await sprintApi.getSprints(currentYear) as Sprint[];
            const now = new Date();
            const availableSprints = sprintData.filter((s: Sprint) =>
                new Date(s.endDate) >= now
            ).sort((a: Sprint, b: Sprint) =>
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );
            setSprints(availableSprints);
            // Auto-set first sprint (current) in schedule if none selected
            if (availableSprints.length > 0) {
                setSchedule(prev => prev.sprintId ? prev : { ...prev, sprintId: availableSprints[0].id });
            }
        } catch (error) {
            logger.error('CreateFromTemplate', 'Failed to load sprints', error);
        }
    };

    // Add a new tag
    const handleAddTag = () => {
        const trimmedTag = newTag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setNewTag('');
            setShowTagInput(false);
        }
    };

    // Remove a tag
    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleCreate = async () => {
        if (!template) return;
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        setIsLoading(true);
        try {
            // Track template usage
            trackUsageMutation.mutate(template.id);

            // Build recurrence object for backend from schedule state
            const isRecurring = schedule.recurrence !== 'NONE';
            let recurrence: any = null;

            if (isRecurring) {
                let frequency: string;
                let intervalValue = 1;

                if (schedule.recurrence === 'CUSTOM' && schedule.customRecurrence) {
                    const unitMap: Record<string, string> = {
                        day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY', year: 'YEARLY',
                    };
                    frequency = unitMap[schedule.customRecurrence.unit] || 'WEEKLY';
                    intervalValue = schedule.customRecurrence.interval;
                } else {
                    const presetMap: Record<string, string> = {
                        DAILY: 'DAILY',
                        WEEKLY: 'WEEKLY',
                        MONTHLY: 'MONTHLY',
                        YEARLY: 'YEARLY',
                    };
                    frequency = presetMap[schedule.recurrence] || 'WEEKLY';
                }

                const formatLocalDate = (date: Date) => date.toISOString().split('T')[0];

                const scheduledTime = !schedule.allDay && schedule.time
                    ? `${schedule.time.getHours().toString().padStart(2, '0')}:${schedule.time.getMinutes().toString().padStart(2, '0')}:00`
                    : null;

                const scheduledEndTime = !schedule.allDay && schedule.endTime
                    ? `${schedule.endTime.getHours().toString().padStart(2, '0')}:${schedule.endTime.getMinutes().toString().padStart(2, '0')}:00`
                    : null;

                recurrence = {
                    frequency,
                    intervalValue,
                    startDate: formatLocalDate(schedule.date),
                    endDate: schedule.customRecurrence?.endDate
                        ? formatLocalDate(schedule.customRecurrence.endDate)
                        : null,
                    scheduledTime,
                    scheduledEndTime,
                };
            }

            // Upload attachments to cloud storage
            let formattedAttachments: Array<{
                filename: string;
                fileUrl: string;
                fileType: string;
                fileSize: number | null;
            }> | null = null;

            if (attachments.length > 0) {
                logger.info('CreateFromTemplate', 'Uploading task attachments...');
                const uploadedAttachments: Array<{
                    filename: string;
                    fileUrl: string;
                    fileType: string;
                    fileSize: number | null;
                }> = [];

                for (const att of attachments) {
                    const uploadResult = await fileUploadApi.uploadFile({
                        uri: att.uri,
                        name: att.name || att.uri.split('/').pop() || 'attachment',
                        mimeType: att.mimeType,
                    });

                    if (uploadResult.success && uploadResult.data) {
                        uploadedAttachments.push({
                            filename: uploadResult.data.filename,
                            fileUrl: uploadResult.data.fileUrl,
                            fileType: uploadResult.data.fileType,
                            fileSize: uploadResult.data.fileSize,
                        });
                    } else {
                        logger.error('CreateFromTemplate', `Failed to upload ${att.name}`);
                        throw new Error(`Failed to upload ${att.name}`);
                    }
                }

                logger.info('CreateFromTemplate', `All attachments uploaded: ${uploadedAttachments.length}`);
                formattedAttachments = uploadedAttachments;
            }

            // Build event start/end times
            let eventStartTime: string | null = null;
            let eventEndTime: string | null = null;
            const isEventType = schedule.taskType === 'EVENT' || schedule.taskType === 'BIRTHDAY';

            if (isEventType && !schedule.allDay && schedule.time) {
                const d = new Date(schedule.date);
                d.setHours(schedule.time.getHours(), schedule.time.getMinutes(), 0, 0);
                eventStartTime = d.toISOString();
                if (schedule.endTime) {
                    const e = new Date(schedule.date);
                    e.setHours(schedule.endTime.getHours(), schedule.endTime.getMinutes(), 0, 0);
                    eventEndTime = e.toISOString();
                }
            }

            // Create the task with backend-compatible format
            const taskData: any = {
                title,
                description,
                eisenhowerQuadrantId,
                lifeWheelAreaId: selectedLifeWheelAreaId || template.defaultLifeWheelAreaId,
                sprintId: isRecurring || schedule.dateMode === 'backlog' ? null : schedule.sprintId,
                storyPoints,
                status: 'TODO',
                createdFromTemplateId: template.id,
                isRecurring,
                recurrence,
                targetDate: schedule.dateMode === 'specific' && !isRecurring ? schedule.date.toISOString() : null,
                tags: tags.length > 0 ? tags : null,
                comment: comment.trim() || null,
                attachments: formattedAttachments,
                // New enum fields
                taskType: schedule.taskType,
                alertBefore: schedule.alertBefore,
                isAllDay: isEventType ? schedule.allDay : false,
                eventStartTime,
                eventEndTime,
            };

            const newTask = await createTaskMutation.mutateAsync(taskData);
            
            if (newTask && onSuccess) {
                onSuccess((newTask as any).id);
            }

            const typeLabel = schedule.taskType === 'EVENT' ? 'Event'
                : schedule.taskType === 'BIRTHDAY' ? 'Birthday'
                : 'Task';
            
            Alert.alert(
                'Success!',
                `${typeLabel} created successfully`,
                [{ text: 'OK', onPress: onClose }]
            );
        } catch (error) {
            logger.error('CreateFromTemplate', 'Failed to create task', error);
            Alert.alert('Error', 'Failed to create task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Get selected quadrant info for display
    const selectedQuadrant = quadrants.find(q => q.id === eisenhowerQuadrantId);
    
    // Get current life wheel config
    const currentWheelAreaId = selectedLifeWheelAreaId || template?.defaultLifeWheelAreaId;
    const currentWheelConfig = currentWheelAreaId 
        ? LIFE_WHEEL_CONFIG[currentWheelAreaId] || { color: '#6b7280', name: 'General', emoji: '📋' }
        : { color: '#6b7280', name: 'General', emoji: '📋' };

    if (!template) return null;

    const typeLabel = schedule.taskType === 'EVENT' ? 'Event'
        : schedule.taskType === 'BIRTHDAY' ? 'Birthday'
        : 'Task';

    return (
        <>
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
                <View className="flex-1" style={{ backgroundColor: colors.background }}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
                        <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                            Create {typeLabel}
                        </Text>
                        <View className="w-10" />
                    </View>

                    <KeyboardAwareScrollView
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        enableOnAndroid
                        extraScrollHeight={Platform.OS === 'ios' ? 120 : 80}
                        enableAutomaticScroll
                        contentContainerStyle={{ paddingBottom: 100 }}
                    >
                        {/* Template Badge */}
                        <View className="px-4 pt-4 pb-2">
                            <View
                                className="flex-row items-center p-3 rounded-xl"
                                style={{ backgroundColor: currentWheelConfig.color + '10' }}
                            >
                                <Text className="text-2xl mr-3">{template.icon || currentWheelConfig.emoji}</Text>
                                <View className="flex-1">
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>From template</Text>
                                    <Text className="font-semibold" style={{ color: colors.text }}>{template.name}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowLifeWheelPicker(true)}
                                    className="px-3 py-1.5 rounded-full flex-row items-center"
                                    style={{ backgroundColor: currentWheelConfig.color + '20' }}
                                >
                                    <Text className="text-xs font-medium mr-1" style={{ color: currentWheelConfig.color }}>
                                        {currentWheelConfig.name}
                                    </Text>
                                    <Ionicons name="chevron-down" size={12} color={currentWheelConfig.color} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="px-4 py-4">
                            {/* Title */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>Title *</Text>
                                <TextInput
                                    className="rounded-xl px-4 py-3"
                                    style={{ backgroundColor: colors.inputBackground, color: colors.text }}
                                    placeholder="Enter title..."
                                    placeholderTextColor={colors.placeholder}
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>

                            {/* Description */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>Description</Text>
                                <TextInput
                                    className="rounded-xl px-4 py-3"
                                    style={{ backgroundColor: colors.inputBackground, color: colors.text }}
                                    placeholder="Add description..."
                                    placeholderTextColor={colors.placeholder}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    style={{ minHeight: 80 }}
                                />
                            </View>

                            {/* ====== UNIFIED TASK SCHEDULER ====== */}
                            <TaskScheduler
                                value={schedule}
                                onChange={setSchedule}
                                sprints={sprints}
                            />

                            {/* Story Points - Like Sprint View */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Point Size</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {STORY_POINTS.map((points) => (
                                        <TouchableOpacity
                                            key={points}
                                            onPress={() => setStoryPoints(points)}
                                            className={`w-12 h-12 rounded-xl items-center justify-center border-2`}
                                            style={{
                                                backgroundColor: storyPoints === points ? colors.primary : colors.card,
                                                borderColor: storyPoints === points ? colors.primary : colors.border,
                                            }}
                                        >
                                            <Text className={`text-base font-bold`} style={{
                                                color: storyPoints === points ? '#ffffff' : colors.text,
                                            }}>
                                                {points}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Eisenhower Matrix - 2x2 Grid */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Priority</Text>
                                {loadingQuadrants ? (
                                    <View className="py-4 items-center">
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    </View>
                                ) : (
                                    <View className="flex-row flex-wrap gap-2">
                                        {quadrants.map((quad) => (
                                            <TouchableOpacity
                                                key={quad.id}
                                                onPress={() => setEisenhowerQuadrantId(quad.id)}
                                                className={`w-[48%] p-3 rounded-xl border-2`}
                                                style={{
                                                    borderColor: eisenhowerQuadrantId === quad.id ? colors.text : colors.border,
                                                    backgroundColor: eisenhowerQuadrantId === quad.id 
                                                        ? quad.color + '15' 
                                                        : colors.card,
                                                }}
                                            >
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="font-bold text-sm" style={{ color: colors.text }} numberOfLines={1}>
                                                        {quad.name}
                                                    </Text>
                                                    {eisenhowerQuadrantId === quad.id && (
                                                        <View 
                                                            className="w-4 h-4 rounded-full items-center justify-center"
                                                            style={{ backgroundColor: quad.color }}
                                                        >
                                                            <Ionicons name="checkmark" size={10} color="white" />
                                                        </View>
                                                    )}
                                                </View>
                                                <Text className="text-xs" style={{ color: colors.textSecondary }} numberOfLines={1}>
                                                    {quad.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Tags */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Tags</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <View
                                            key={tag}
                                            className="flex-row items-center rounded-full px-3 py-1.5"
                                            style={{ backgroundColor: colors.backgroundTertiary }}
                                        >
                                            <Text className="text-sm mr-1" style={{ color: colors.text }}>#{tag}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                                <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {showTagInput ? (
                                        <View className="flex-row items-center rounded-full px-3 py-1 border" style={{ backgroundColor: colors.inputBackground, borderColor: colors.border }}>
                                            <Text style={{ color: colors.textTertiary }}>#</Text>
                                            <TextInput
                                                className="text-sm py-0.5 min-w-[60px]"
                                                style={{ color: colors.text }}
                                                placeholder="tag"
                                                placeholderTextColor={colors.placeholder}
                                                value={newTag}
                                                onChangeText={setNewTag}
                                                onSubmitEditing={handleAddTag}
                                                autoFocus
                                                returnKeyType="done"
                                            />
                                            <TouchableOpacity onPress={() => { setShowTagInput(false); setNewTag(''); }}>
                                                <Ionicons name="close" size={16} color={colors.textTertiary} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => setShowTagInput(true)}
                                            className="flex-row items-center rounded-full px-3 py-1.5 border border-dashed"
                                            style={{ backgroundColor: colors.inputBackground, borderColor: colors.borderSecondary }}
                                        >
                                            <Ionicons name="add" size={16} color={colors.textSecondary} />
                                            <Text className="text-sm ml-1" style={{ color: colors.textSecondary }}>Add tag</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Comment with Rich Text */}
                            <View className="mb-5">
                                <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>Comment</Text>
                                <View className="rounded-xl overflow-hidden border" style={{ backgroundColor: colors.inputBackground, borderColor: colors.border }}>
                                    {/* Rich Text Toolbar */}
                                    <View className="flex-row items-center px-3 py-2 border-b" style={{ borderBottomColor: colors.border, backgroundColor: colors.card }}>
                                        <TouchableOpacity
                                            onPress={() => setCommentBold(!commentBold)}
                                            className={`w-8 h-8 rounded-lg items-center justify-center mr-1`}
                                            style={{ backgroundColor: commentBold ? (isDark ? colors.primaryLight : '#dbeafe') : 'transparent' }}
                                        >
                                            <Text className={`font-bold`} style={{ color: commentBold ? colors.primary : colors.textSecondary }}>B</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setCommentItalic(!commentItalic)}
                                            className={`w-8 h-8 rounded-lg items-center justify-center mr-1`}
                                            style={{ backgroundColor: commentItalic ? (isDark ? colors.primaryLight : '#dbeafe') : 'transparent' }}
                                        >
                                            <Text className={`italic`} style={{ color: commentItalic ? colors.primary : colors.textSecondary }}>I</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setCommentBulletList(!commentBulletList)}
                                            className={`w-8 h-8 rounded-lg items-center justify-center mr-1`}
                                            style={{ backgroundColor: commentBulletList ? (isDark ? colors.primaryLight : '#dbeafe') : 'transparent' }}
                                        >
                                            <Ionicons name="list" size={18} color={commentBulletList ? colors.primary : colors.textSecondary} />
                                        </TouchableOpacity>
                                        
                                        <View className="h-5 w-px mx-2" style={{ backgroundColor: colors.border }} />
                                        
                                        {/* Attachment Button - Opens Picker Modal */}
                                        <TouchableOpacity
                                            onPress={() => setShowAttachmentPicker(true)}
                                            className="w-8 h-8 rounded-lg items-center justify-center"
                                        >
                                            <Ionicons name="attach" size={18} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {/* Text Input */}
                                    <TextInput
                                        className="px-4 py-3"
                                        style={{ color: colors.text }}
                                        placeholder="Add a comment..."
                                        placeholderTextColor={colors.placeholder}
                                        value={comment}
                                        onChangeText={setComment}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                        style={{ 
                                            minHeight: 80,
                                            fontWeight: commentBold ? 'bold' : 'normal',
                                            fontStyle: commentItalic ? 'italic' : 'normal',
                                        }}
                                    />
                                    
                                    {/* Attachments Preview */}
                                    {attachments.length > 0 && (
                                        <View className="px-4 pb-3">
                                            <AttachmentPreview
                                                attachments={attachments}
                                                onRemove={(index) => setAttachments(prev => prev.filter((_, i) => i !== index))}
                                                compact
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* AI Refinement */}
                            <View className="flex-row items-center justify-between mb-4 rounded-xl px-4 py-3" style={{ backgroundColor: isDark ? colors.backgroundTertiary : '#faf5ff' }}>
                                <View className="flex-row items-center flex-1">
                                    <Text className="text-xl">✨</Text>
                                    <View className="ml-3 flex-1">
                                        <Text className="font-medium" style={{ color: colors.text }}>AI Refinement</Text>
                                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                            Enhance with SensAI suggestions
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={useAiRefinement}
                                    onValueChange={setUseAiRefinement}
                                    trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                                    thumbColor={useAiRefinement ? '#8b5cf6' : '#f4f4f5'}
                                />
                            </View>
                        </View>
                    </KeyboardAwareScrollView>

                    {/* Native Bottom Action Button */}
                    <View style={{
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
                        backgroundColor: colors.background,
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: colors.border,
                    }}>
                        <Pressable
                            onPress={handleCreate}
                            disabled={isLoading}
                            style={({ pressed }) => [{
                                backgroundColor: colors.primary,
                                borderRadius: 14,
                                paddingVertical: 16,
                                flexDirection: 'row' as const,
                                alignItems: 'center' as const,
                                justifyContent: 'center' as const,
                                gap: 8,
                                opacity: pressed ? 0.85 : isLoading ? 0.6 : 1,
                            }]}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                                    <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>
                                        Create {typeLabel}
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>

                </View>

                {/* Life Wheel Area Picker Modal — INSIDE main modal so it stacks on iOS */}
                <Modal
                    visible={showLifeWheelPicker}
                    animationType="slide"
                    presentationStyle="pageSheet"
                    onRequestClose={() => setShowLifeWheelPicker(false)}
                >
                    <View className="flex-1" style={{ backgroundColor: colors.background }}>
                        <View className="flex-row items-center justify-between px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
                            <TouchableOpacity onPress={() => setShowLifeWheelPicker(false)} className="p-2 -ml-2">
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                            <Text className="text-lg font-semibold" style={{ color: colors.text }}>Select Life Area</Text>
                            <View className="w-10" />
                        </View>
                        <ScrollView className="flex-1 p-4">
                            {Object.entries(LIFE_WHEEL_CONFIG).map(([id, config]) => (
                                <TouchableOpacity
                                    key={id}
                                    onPress={() => {
                                        setSelectedLifeWheelAreaId(id);
                                        setShowLifeWheelPicker(false);
                                    }}
                                    className={`p-4 rounded-xl mb-3 border-2 flex-row items-center`}
                                    style={{
                                        borderColor: selectedLifeWheelAreaId === id ? colors.primary : colors.border,
                                        backgroundColor: selectedLifeWheelAreaId === id ? config.color + '15' : colors.backgroundTertiary,
                                    }}
                                >
                                    <Text className="text-2xl mr-3">{config.emoji}</Text>
                                    <Text 
                                        className="flex-1 font-medium" style={{ color: colors.text }}
                                    >
                                        {config.name}
                                    </Text>
                                    {selectedLifeWheelAreaId === id && (
                                        <MaterialCommunityIcons name="check-circle" size={24} color={config.color} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>

        </Modal>

        {/* Attachment Picker Modal */}
        <AttachmentPicker
            visible={showAttachmentPicker}
            onClose={() => setShowAttachmentPicker(false)}
            onAttachmentAdded={(attachment) => {
                setAttachments(prev => [...prev, attachment]);
            }}
            maxAttachments={5}
            currentAttachmentsCount={attachments.length}
        />
    </>
    );
}

export default CreateFromTemplateSheet;
