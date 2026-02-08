import { logger } from '../../../../utils/logger';
import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Linking, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, TaskComment, TaskHistory } from '../../../../types/models';
import { lifeWheelApi, taskApi, fileUploadApi, AuthExpiredError } from '../../../../services/api';
import { useEpicStore } from '../../../../store/epicStore';
import { useTaskStore } from '../../../../store/taskStore';
import { useTranslation } from '../../../../hooks/useTranslation';
import { AttachmentPicker, AttachmentPreview, CommentAttachment } from '../../../../components/ui/AttachmentPicker';
import { RichTextComment } from '../../../../components/ui/RichTextComment';
import { AttachmentPreviewModal, AttachmentData } from '../../../../components/ui/AttachmentPreviewModal';
import { RichTextEditor } from '../../../../components/ui/RichTextEditor';
import { useThemeContext } from '../../../../providers/ThemeProvider';

type TabType = 'overview' | 'comments' | 'history';

type ChecklistItem = {
    id: string;
    text: string;
    completed: boolean;
};

interface LifeWheelArea {
    id: string;
    displayId: string;
    name: string;
    icon: string;
}

interface Attachment {
    id: string;
    filename: string;
    fileUrl: string;
    fileType: string;
    fileSize: number | null;
}

export default function TaskWorkView() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const { id } = useLocalSearchParams();
    const { epics, fetchEpics } = useEpicStore();
    const { tasks, fetchTasks } = useTaskStore();
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<Task | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([]);

    // Comments - fetched from API
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // History - fetched from API
    const [history, setHistory] = useState<TaskHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Attachments from task
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    // Checklist
    const [checklist, setChecklist] = useState<ChecklistItem[]>([
        { id: '1', text: 'Review requirements', completed: true },
        { id: '2', text: 'Design solution', completed: true },
        { id: '3', text: 'Implement backend', completed: false },
        { id: '4', text: 'Write tests', completed: false },
        { id: '5', text: 'Deploy to staging', completed: false },
    ]);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [showAddChecklist, setShowAddChecklist] = useState(false);

    // Quick status update
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    // Comment attachments
    const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
    const [commentAttachments, setCommentAttachments] = useState<CommentAttachment[]>([]);

    // Attachment preview modal
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState<AttachmentData | null>(null);
    const [previewAttachments, setPreviewAttachments] = useState<AttachmentData[]>([]);
    const [previewInitialIndex, setPreviewInitialIndex] = useState(0);

    // Open attachment in preview modal
    const openAttachmentPreview = useCallback((attachment: AttachmentData, allAttachments?: AttachmentData[], index?: number) => {
        setPreviewAttachment(attachment);
        if (allAttachments && allAttachments.length > 0) {
            setPreviewAttachments(allAttachments);
            setPreviewInitialIndex(index || 0);
        } else {
            setPreviewAttachments([]);
            setPreviewInitialIndex(0);
        }
        setPreviewModalVisible(true);
    }, []);

    // Load comments from API
    const loadComments = useCallback(async (taskId: string) => {
        try {
            setCommentsLoading(true);
            const fetchedComments = await taskApi.getTaskComments(taskId);
            setComments((fetchedComments || []) as TaskComment[]);
        } catch (error) {
            // Ignore auth expired errors - redirect is handled automatically
            if (error instanceof AuthExpiredError) return;
            logger.error('Error loading comments:', error);
        } finally {
            setCommentsLoading(false);
        }
    }, []);

    // Load history from API
    const loadHistory = useCallback(async (taskId: string) => {
        try {
            setHistoryLoading(true);
            const fetchedHistory = await taskApi.getTaskHistory(taskId);
            setHistory((fetchedHistory || []) as TaskHistory[]);
        } catch (error) {
            // Ignore auth expired errors - redirect is handled automatically
            if (error instanceof AuthExpiredError) return;
            logger.error('Error loading history:', error);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTask();
        fetchEpics();
        loadLifeWheelAreas();
    }, [id]);

    const loadTask = async () => {
        try {
            setLoading(true);
            await fetchTasks();
        } catch (error) {
            // Ignore auth expired errors - redirect is handled automatically
            if (error instanceof AuthExpiredError) return;
            logger.error('Error loading task:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLifeWheelAreas = async () => {
        try {
            const areas = await lifeWheelApi.getLifeWheelAreas();
            setLifeWheelAreas(areas as LifeWheelArea[]);
        } catch (error) {
            // Ignore auth expired errors - redirect is handled automatically
            if (error instanceof AuthExpiredError) return;
            logger.error('Error loading life wheel areas:', error);
        }
    };

    // Update task when tasks are loaded
    useEffect(() => {
        const foundTask = tasks.find((t: Task) => t.id === id);
        if (foundTask) {
            setTask(foundTask);
            
            // Debug: Log task recurrence info
            logger.log('📋 Task Detail - task:', {
                title: foundTask.title,
                isRecurring: foundTask.isRecurring,
                recurrence: foundTask.recurrence,
            });
            
            // Set attachments from task
            if ((foundTask as any).attachments) {
                setAttachments((foundTask as any).attachments);
            }
            
            // Load comments and history from API
            loadComments(foundTask.id);
            loadHistory(foundTask.id);
        }
    }, [tasks, id]);

    const getTaskEpic = () => {
        if (!task || !task.epicId) return null;
        return epics.find(e => e.id === task.epicId);
    };

    const getLifeWheelName = () => {
        if (!task) return '';
        const area = lifeWheelAreas.find(a => a.displayId === task.lifeWheelAreaId || a.id === task.lifeWheelAreaId);
        return area ? `${area.icon} ${area.name}` : '';
    };

    const statusOptions: Array<{ value: Task['status'] | 'blocked'; label: string; icon: string; color: string; bgColor: string }> = [
        { value: 'draft', label: 'Move to Backlog', icon: 'archive-outline', color: '#9CA3AF', bgColor: '#6B7280' },
        { value: 'todo', label: 'To Do', icon: 'checkbox-blank-circle-outline', color: '#6B7280', bgColor: '#4B5563' },
        { value: 'in_progress', label: 'In Progress', icon: 'progress-clock', color: '#3B82F6', bgColor: '#2563EB' },
        { value: 'blocked', label: 'Blocked', icon: 'alert-circle', color: '#EF4444', bgColor: '#DC2626' },
        { value: 'done', label: 'Done', icon: 'check-circle', color: '#10B981', bgColor: '#059669' },
    ];

    // Helper to format date safely
    const formatDate = (dateValue: string | Date | undefined | null): string => {
        if (!dateValue) return '';
        try {
            const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
            if (isNaN(date.getTime())) return '';
            return date.toLocaleString();
        } catch {
            return '';
        }
    };

    // Get friendly description for history field changes
    const getHistoryDescription = (item: TaskHistory): { action: string; detail: string } => {
        const fieldName = item.fieldName?.toLowerCase() || '';
        
        // Helper to format status for display
        const formatStatus = (status: string | null): string => {
            if (!status) return 'None';
            const statusMap: Record<string, string> = {
                'DRAFT': '📋 Backlog',
                'TODO': '📝 To Do',
                'IN_PROGRESS': '🔄 In Progress',
                'BLOCKED': '🚫 Blocked',
                'DONE': '✅ Done',
            };
            return statusMap[status.toUpperCase()] || status;
        };
        
        if (fieldName === 'status') {
            if (!item.oldValue && item.newValue) {
                return { action: 'Task created', detail: `Initial status: ${formatStatus(item.newValue)}` };
            }
            if (item.newValue === 'TODO' && item.oldValue === 'DRAFT') {
                return { action: 'Moved to Sprint', detail: 'Task added to active sprint' };
            }
            if (item.newValue === 'DONE') {
                return { action: '🎉 Task completed!', detail: `${formatStatus(item.oldValue)} → ${formatStatus(item.newValue)}` };
            }
            if (item.newValue === 'BLOCKED') {
                return { action: '⚠️ Task blocked', detail: `${formatStatus(item.oldValue)} → ${formatStatus(item.newValue)}` };
            }
            if (item.newValue === 'IN_PROGRESS') {
                return { action: 'Started working', detail: `${formatStatus(item.oldValue)} → ${formatStatus(item.newValue)}` };
            }
            return { action: 'Status changed', detail: `${formatStatus(item.oldValue)} → ${formatStatus(item.newValue)}` };
        }
        if (fieldName === 'sprintid' || fieldName === 'sprint_id') {
            if (!item.oldValue && item.newValue) {
                return { action: 'Added to Sprint', detail: `Sprint: ${item.newValue}` };
            }
            if (item.oldValue && !item.newValue) {
                return { action: 'Removed from Sprint', detail: 'Moved to backlog' };
            }
            return { action: 'Sprint changed', detail: `${item.oldValue} → ${item.newValue}` };
        }
        if (fieldName === 'comment') {
            return { action: 'Comment added', detail: '' };
        }
        if (fieldName === 'attachment') {
            return { action: 'Attachment added', detail: item.newValue || '' };
        }
        if (fieldName === 'title') {
            return { action: 'Title updated', detail: item.newValue || '' };
        }
        if (fieldName === 'description') {
            return { action: 'Description updated', detail: '' };
        }
        if (fieldName === 'storypoints' || fieldName === 'story_points') {
            return { action: 'Story points changed', detail: `${item.oldValue || '0'} → ${item.newValue}` };
        }
        
        // Default
        return { 
            action: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} changed`, 
            detail: item.oldValue ? `${item.oldValue} → ${item.newValue}` : `Set to: ${item.newValue}` 
        };
    };

    const handleStatusChange = async (newStatus: Task['status']) => {
        if (task) {
            const oldStatus = task.status;
            setTask({ ...task, status: newStatus });
            try {
                // Convert to uppercase for backend API (DRAFT, TODO, IN_PROGRESS, DONE)
                const apiStatus = newStatus.toUpperCase();
                await taskApi.updateTaskStatus(task.id, apiStatus);
                // Reload history to get the updated history from backend
                loadHistory(task.id);
            } catch (error) {
                logger.error('Error updating status:', error);
                // Revert on error
                setTask({ ...task, status: oldStatus });
            }
        }
        setShowStatusMenu(false);
    };

    const handleDeleteTask = () => {
        Alert.alert(
            t('tasks.details.deleteTask'),
            t('tasks.details.confirmDelete'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('tasks.details.deleteTask'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await taskApi.deleteTask(task!.id);
                            router.back();
                        } catch (error) {
                            logger.error('Error deleting task:', error);
                        }
                    },
                },
            ]
        );
    };

    const handleAddComment = async () => {
        if ((newComment.trim() || commentAttachments.length > 0) && task) {
            setSubmittingComment(true);
            try {
                // First, upload any attachments to cloud storage
                let uploadedAttachments: Array<{
                    filename: string;
                    fileUrl: string;
                    fileType: string;
                    fileSize: number | null;
                }> = [];

                if (commentAttachments.length > 0) {
                    logger.log('📤 Uploading comment attachments...');
                    for (const attachment of commentAttachments) {
                        const uploadResult = await fileUploadApi.uploadFile({
                            uri: attachment.uri,
                            name: attachment.name,
                            mimeType: attachment.mimeType,
                        });

                        if (uploadResult.success && uploadResult.data) {
                            uploadedAttachments.push({
                                filename: uploadResult.data.filename,
                                fileUrl: uploadResult.data.fileUrl,
                                fileType: uploadResult.data.fileType,
                                fileSize: uploadResult.data.fileSize,
                            });
                        } else {
                            logger.error('Failed to upload attachment:', attachment.name, uploadResult.error);
                            throw new Error(`Failed to upload ${attachment.name}`);
                        }
                    }
                    logger.log('✅ All attachments uploaded:', uploadedAttachments.length);
                }

                // Now add the comment with attachments
                const createdComment = await taskApi.addComment(task.id, { 
                    commentText: newComment.trim() || 'Attachment added',
                    attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
                });
                
                // Add the new comment to the list
                setComments([...comments, createdComment as TaskComment]);
                setNewComment('');
                setCommentAttachments([]);
            } catch (error) {
                logger.error('Error adding comment:', error);
            } finally {
                setSubmittingComment(false);
            }
        }
    };

    const toggleChecklistItem = (itemId: string) => {
        setChecklist(checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        ));
    };

    const handleAddChecklistItem = () => {
        if (newChecklistItem.trim()) {
            const item: ChecklistItem = {
                id: Date.now().toString(),
                text: newChecklistItem,
                completed: false,
            };
            setChecklist([...checklist, item]);
            setNewChecklistItem('');
            setShowAddChecklist(false);
        }
    };

    if (loading || !task) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>{t('common.loading')}</Text>
            </View>
        );
    }

    const currentStatus = statusOptions.find(s => s.value === task.status) || statusOptions[0];
    const completedChecklist = checklist.filter(item => item.completed).length;
    const totalChecklist = checklist.length;

    // Calculate timeline count for history badge (1 for task created + history entries minus duplicates)
    const getTimelineCount = () => {
        let count = 0;
        // Add 1 for task created entry if task has createdAt
        if (task?.createdAt) {
            count = 1;
        }
        // Add history entries, excluding duplicate creation entries
        history.forEach((item) => {
            const fieldName = item.fieldName?.toLowerCase() || '';
            const isCreation = fieldName === 'status' && !item.oldValue && item.newValue;
            // Skip if this would be a duplicate creation entry
            if (isCreation && task?.createdAt) {
                return;
            }
            count++;
        });
        return count;
    };
    const timelineCount = getTimelineCount();

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header with Task Name - Status Based Color */}
            <View style={{ backgroundColor: currentStatus.bgColor }} className="pt-12 pb-4 px-4">
                <View className="flex-row items-center mb-3">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold flex-1" numberOfLines={2}>
                        {task.title}
                    </Text>
                    {/* Compact Icon Buttons */}
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => setShowStatusMenu(true)}
                            className="w-9 h-9 bg-white/20 rounded-lg items-center justify-center border border-white/40"
                        >
                            <MaterialCommunityIcons name={currentStatus.icon as any} size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

            {/* Tab Bar */}
            <View className="flex-row" style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                {[
                    { id: 'overview', label: t('tasks.tabs.overview'), icon: 'information-outline' },
                    { id: 'comments', label: t('tasks.tabs.comments'), icon: 'comment-outline', badge: (comments.length + attachments.length) > 0 ? (comments.length + attachments.length) : undefined },
                    { id: 'history', label: t('tasks.tabs.history'), icon: 'history', badge: timelineCount > 0 ? timelineCount : undefined },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id as TabType)}
                        className="flex-1 py-3"
                        style={{ borderBottomWidth: 2, borderBottomColor: activeTab === tab.id ? '#3B82F6' : 'transparent' }}
                    >
                        <View className="items-center">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons
                                    name={tab.icon as any}
                                    size={18}
                                    color={activeTab === tab.id ? '#3B82F6' : colors.textSecondary}
                                />
                                {tab.badge && (
                                    <View className="ml-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }}>
                                        <Text className="text-xs font-semibold" style={{ color: '#3B82F6' }}>{tab.badge}</Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                className="text-xs mt-1"
                                style={{ 
                                    color: activeTab === tab.id ? '#3B82F6' : colors.textSecondary,
                                    fontWeight: activeTab === tab.id ? '600' : 'normal'
                                }}
                            >
                                {tab.label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <ScrollView className="flex-1">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <View className="p-4">
                        {/* Task Info Cards */}
                        <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: colors.card }}>
                            <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>{t('tasks.details.taskDetails')}</Text>
                            {task.description && (
                                <View className="mb-4 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                    <Text className="text-xs mb-1.5" style={{ color: colors.textTertiary }}>{t('tasks.details.description')}</Text>
                                    <Text className="leading-5" style={{ color: colors.textSecondary }}>{task.description}</Text>
                                </View>
                            )}
                            <View className="flex-row flex-wrap gap-3">
                                <View className="flex-1 min-w-[45%]">
                                    <Text className="text-xs mb-1" style={{ color: colors.textTertiary }}>{t('tasks.details.storyPoints')}</Text>
                                    <View className="flex-row items-center">
                                        <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }}>
                                            <Text className="font-bold text-sm" style={{ color: '#3B82F6' }}>{task.storyPoints}</Text>
                                        </View>
                                        <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('common.points')}</Text>
                                    </View>
                                </View>
                                <View className="flex-1 min-w-[45%]">
                                    <Text className="text-xs mb-1" style={{ color: colors.textTertiary }}>{t('tasks.details.lifeWheel')}</Text>
                                    <Text className="font-medium" style={{ color: colors.text }}>{getLifeWheelName()}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Recurrence Schedule (for recurring tasks) */}
                        {(task.isRecurring || task.recurrence?.frequency) && task.recurrence && (
                            <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: colors.card }}>
                                <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>📅 Recurring Schedule</Text>
                                <View className="rounded-lg p-3" style={{ backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : '#FDF2F8', borderWidth: 1, borderColor: isDark ? 'rgba(236, 72, 153, 0.3)' : '#FBCFE8' }}>
                                    <View className="flex-row items-center">
                                        <Text className="text-2xl mr-3">
                                            {task.recurrence.frequency === 'DAILY' ? '📆' :
                                             task.recurrence.frequency === 'WEEKLY' ? '📅' :
                                             task.recurrence.frequency === 'BIWEEKLY' ? '🗓️' :
                                             task.recurrence.frequency === 'MONTHLY' ? '🗓️' :
                                             task.recurrence.frequency === 'YEARLY' ? '🎂' : '🔄'}
                                        </Text>
                                        <View className="flex-1">
                                            <Text className="text-pink-800 font-semibold">
                                                {task.recurrence.frequency === 'DAILY' ? 'Every Day' :
                                                 task.recurrence.frequency === 'WEEKLY' ? `Every Week on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][task.recurrence.dayOfWeek || 0]}` :
                                                 task.recurrence.frequency === 'BIWEEKLY' ? `Every 2 Weeks on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][task.recurrence.dayOfWeek || 0]}` :
                                                 task.recurrence.frequency === 'MONTHLY' ? `Every Month on Day ${task.recurrence.dayOfMonth}` :
                                                 task.recurrence.frequency === 'YEARLY' && task.recurrence.yearlyDate ? 
                                                    `Every Year on ${new Date(task.recurrence.yearlyDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` :
                                                 'Recurring'}
                                            </Text>
                                            {task.recurrence.scheduledTime && (
                                                <Text className="text-pink-600 text-sm mt-1">
                                                    ⏰ {task.recurrence.scheduledTime.substring(0, 5)}
                                                    {task.recurrence.scheduledEndTime && ` - ${task.recurrence.scheduledEndTime.substring(0, 5)}`}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Eisenhower Matrix & Tags */}
                        <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: colors.card }}>
                            <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>{t('tasks.details.priorityTags')}</Text>

                            {/* Eisenhower Quadrant */}
                            <View className="mb-3">
                                <Text className="text-xs mb-2" style={{ color: colors.textTertiary }}>{t('tasks.details.eisenhowerMatrix')}</Text>
                                <View 
                                    className="px-4 py-2.5 rounded-lg"
                                    style={{
                                        borderWidth: 2,
                                        backgroundColor: task.eisenhowerQuadrantId === 'eq-1' 
                                            ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2')
                                            : task.eisenhowerQuadrantId === 'eq-2' 
                                            ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF')
                                            : task.eisenhowerQuadrantId === 'eq-3' 
                                            ? (isDark ? 'rgba(234, 179, 8, 0.15)' : '#FEFCE8')
                                            : colors.backgroundSecondary,
                                        borderColor: task.eisenhowerQuadrantId === 'eq-1' 
                                            ? (isDark ? 'rgba(239, 68, 68, 0.4)' : '#FCA5A5')
                                            : task.eisenhowerQuadrantId === 'eq-2' 
                                            ? (isDark ? 'rgba(59, 130, 246, 0.4)' : '#93C5FD')
                                            : task.eisenhowerQuadrantId === 'eq-3' 
                                            ? (isDark ? 'rgba(234, 179, 8, 0.4)' : '#FDE047')
                                            : colors.border,
                                    }}
                                >
                                    <Text className="font-medium" style={{ color: colors.text }}>
                                        {task.eisenhowerQuadrantId === 'eq-1' && `🔴 ${t('calendar.urgentImportant')}`}
                                        {task.eisenhowerQuadrantId === 'eq-2' && `🔵 ${t('calendar.notUrgentImportant')}`}
                                        {task.eisenhowerQuadrantId === 'eq-3' && `🟡 ${t('calendar.urgentNotImportant')}`}
                                        {task.eisenhowerQuadrantId === 'eq-4' && `⚪ ${t('calendar.notUrgentNotImportant')}`}
                                    </Text>
                                </View>
                            </View>

                            {/* Sprint & Epic Tags */}
                            <View className="flex-row gap-2 flex-wrap">
                                {task.sprintId && (
                                    <View 
                                        className="px-3 py-1.5 rounded-lg"
                                        style={{ backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : '#F3E8FF', borderWidth: 1, borderColor: isDark ? 'rgba(147, 51, 234, 0.3)' : '#E9D5FF' }}
                                    >
                                        <Text className="font-medium text-xs" style={{ color: isDark ? '#C4B5FD' : '#7E22CE' }}>📅 Sprint {task.sprintId}</Text>
                                    </View>
                                )}
                                {task.epicId && getTaskEpic() && (
                                    <View 
                                        className="px-3 py-1.5 rounded-lg flex-row items-center"
                                        style={{ 
                                            backgroundColor: getTaskEpic()!.color + '20',
                                            borderColor: getTaskEpic()!.color,
                                            borderWidth: 1
                                        }}
                                    >
                                        <MaterialCommunityIcons 
                                            name={getTaskEpic()!.icon as any} 
                                            size={14} 
                                            color={getTaskEpic()!.color} 
                                        />
                                        <Text 
                                            className="font-bold text-xs ml-1.5"
                                            style={{ color: getTaskEpic()!.color }}
                                        >
                                            {getTaskEpic()!.title}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <View className="rounded-xl p-4" style={{ backgroundColor: colors.card }}>
                            <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>{t('tasks.details.quickActions')}</Text>
                            <View className="flex-row flex-wrap gap-2">
                                <TouchableOpacity 
                                    onPress={() => setShowStatusMenu(true)}
                                    className="py-3 px-3 rounded-lg flex-row items-center justify-center"
                                    style={{ backgroundColor: colors.backgroundSecondary, width: '48%' }}
                                >
                                    <MaterialCommunityIcons name="swap-horizontal" size={18} color="#3B82F6" />
                                    <Text className="font-medium ml-2 text-sm" style={{ color: '#3B82F6' }}>{t('tasks.details.changeStatus')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => router.push(`/(tabs)/sprints/task/edit?id=${task.id}` as any)}
                                    className="py-3 px-3 rounded-lg flex-row items-center justify-center"
                                    style={{ backgroundColor: colors.backgroundSecondary, width: '48%' }}
                                >
                                    <MaterialCommunityIcons name="pencil" size={18} color={colors.textSecondary} />
                                    <Text className="font-medium ml-2 text-sm" style={{ color: colors.textSecondary }}>{t('tasks.details.editTask')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => {
                                        router.push({
                                            pathname: '/(tabs)/pomodoro',
                                            params: { 
                                                taskId: task.id, 
                                                taskTitle: task.title,
                                                taskDescription: task.description,
                                                taskStoryPoints: task.storyPoints,
                                                taskQuadrant: task.quadrant,
                                                returnTo: 'task'
                                            }
                                        } as any);
                                    }}
                                    className="py-3 px-3 rounded-lg flex-row items-center justify-center"
                                    style={{ backgroundColor: colors.backgroundSecondary, width: '48%' }}
                                >
                                    <MaterialCommunityIcons name="bullseye-arrow" size={18} color="#F59E0B" />
                                    <Text className="font-medium ml-2 text-sm" style={{ color: colors.textSecondary }}>{t('tasks.details.startPomodoro')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setShowAddChecklist(true)}
                                    className="py-3 px-3 rounded-lg flex-row items-center justify-center"
                                    style={{ backgroundColor: colors.backgroundSecondary, width: '48%' }}
                                >
                                    <MaterialCommunityIcons name="checkbox-marked-outline" size={18} color="#10B981" />
                                    <Text className="font-medium ml-2 text-sm" style={{ color: colors.textSecondary }}>{t('tasks.details.addChecklistItem')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={handleDeleteTask}
                                    className="py-3 px-3 rounded-lg flex-row items-center justify-center"
                                    style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2', width: '100%' }}
                                >
                                    <MaterialCommunityIcons name="delete-outline" size={18} color="#EF4444" />
                                    <Text className="font-medium ml-2 text-sm" style={{ color: '#EF4444' }}>{t('tasks.details.deleteTask')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Checklist Section */}
                        <View className="rounded-xl p-4" style={{ backgroundColor: colors.card }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons name="checkbox-marked-outline" size={18} color={colors.textSecondary} />
                                    <Text className="text-sm font-semibold ml-2" style={{ color: colors.textSecondary }}>
                                        {t('tasks.details.checklist')} ({completedChecklist}/{totalChecklist})
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowAddChecklist(!showAddChecklist)}>
                                    <MaterialCommunityIcons 
                                        name={showAddChecklist ? "minus-circle-outline" : "plus-circle-outline"} 
                                        size={22} 
                                        color={colors.primary} 
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Progress bar */}
                            {totalChecklist > 0 && (
                                <View className="h-1.5 rounded-full mb-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                                    <View 
                                        className="h-1.5 rounded-full"
                                        style={{ 
                                            backgroundColor: '#10B981', 
                                            width: `${(completedChecklist / totalChecklist) * 100}%` 
                                        }}
                                    />
                                </View>
                            )}

                            {/* Add checklist item input */}
                            {showAddChecklist && (
                                <View className="flex-row items-center gap-2 mb-3">
                                    <TextInput
                                        value={newChecklistItem}
                                        onChangeText={setNewChecklistItem}
                                        placeholder={t('tasks.details.addChecklistPlaceholder')}
                                        placeholderTextColor={colors.textTertiary}
                                        className="flex-1 py-2 px-3 rounded-lg text-sm"
                                        style={{ 
                                            backgroundColor: colors.backgroundSecondary, 
                                            color: colors.text,
                                            borderWidth: 1,
                                            borderColor: colors.border 
                                        }}
                                        onSubmitEditing={handleAddChecklistItem}
                                    />
                                    <TouchableOpacity
                                        onPress={handleAddChecklistItem}
                                        className="py-2 px-3 rounded-lg"
                                        style={{ backgroundColor: '#10B981' }}
                                    >
                                        <MaterialCommunityIcons name="check" size={18} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Checklist items */}
                            {checklist.length === 0 ? (
                                <Text className="text-sm text-center py-4" style={{ color: colors.textTertiary }}>
                                    {t('tasks.details.noChecklistItems')}
                                </Text>
                            ) : (
                                checklist.map(item => (
                                    <TouchableOpacity 
                                        key={item.id}
                                        onPress={() => toggleChecklistItem(item.id)}
                                        className="flex-row items-center py-2.5 px-1"
                                        style={{ borderBottomWidth: 0.5, borderBottomColor: colors.border }}
                                    >
                                        <MaterialCommunityIcons 
                                            name={item.completed ? "checkbox-marked" : "checkbox-blank-outline"} 
                                            size={22} 
                                            color={item.completed ? '#10B981' : colors.textTertiary} 
                                        />
                                        <Text 
                                            className="ml-2.5 flex-1 text-sm" 
                                            style={{ 
                                                color: item.completed ? colors.textTertiary : colors.text,
                                                textDecorationLine: item.completed ? 'line-through' : 'none'
                                            }}
                                        >
                                            {item.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                    <View className="p-4">
                        {commentsLoading ? (
                            <View className="items-center py-8">
                                <Text style={{ color: colors.textTertiary }}>{t('common.loading')}</Text>
                            </View>
                        ) : (comments.length === 0 && attachments.length === 0) ? (
                            <View className="rounded-lg p-8 items-center mb-4" style={{ backgroundColor: colors.card }}>
                                <MaterialCommunityIcons name="comment-outline" size={48} color={colors.textTertiary} />
                                <Text className="mt-3" style={{ color: colors.textTertiary }}>No activity yet</Text>
                                <Text className="text-sm" style={{ color: colors.textTertiary }}>Comments and attachments will appear here</Text>
                            </View>
                        ) : (
                            <>
                                {/* Show attachments first if any */}
                                {attachments.length > 0 && (
                                    <View className="rounded-lg p-4 mb-3" style={{ backgroundColor: colors.card }}>
                                        <View className="flex-row items-center mb-3">
                                            <MaterialCommunityIcons name="attachment" size={18} color={colors.textSecondary} />
                                            <Text className="font-semibold ml-2" style={{ color: colors.textSecondary }}>Attachments ({attachments.length})</Text>
                                        </View>
                                        <View className="flex-row flex-wrap gap-2">
                                            {attachments.map((attachment, index) => (
                                                <TouchableOpacity 
                                                    key={attachment.id} 
                                                    className="rounded-lg p-2 flex-row items-center"
                                                    style={{ maxWidth: '48%', backgroundColor: colors.backgroundSecondary }}
                                                    onPress={() => {
                                                        openAttachmentPreview(
                                                            attachment as AttachmentData,
                                                            attachments as AttachmentData[],
                                                            index
                                                        );
                                                    }}
                                                >
                                                    {attachment.fileType?.startsWith('image/') ? (
                                                        <Image 
                                                            source={{ uri: attachment.fileUrl }} 
                                                            className="w-10 h-10 rounded"
                                                            contentFit="cover"
                                                        />
                                                    ) : (
                                                        <View className="w-10 h-10 rounded items-center justify-center" style={{ backgroundColor: colors.backgroundTertiary }}>
                                                            <MaterialCommunityIcons 
                                                                name={
                                                                    attachment.fileType?.includes('pdf') ? 'file-pdf-box' :
                                                                    attachment.fileType?.includes('word') ? 'file-word-box' :
                                                                    'file-document'
                                                                } 
                                                                size={20} 
                                                                color={colors.textTertiary} 
                                                            />
                                                        </View>
                                                    )}
                                                    <View className="flex-1 ml-2">
                                                        <Text className="text-xs font-medium" style={{ color: colors.text }} numberOfLines={1}>
                                                            {attachment.filename}
                                                        </Text>
                                                        {attachment.fileSize && (
                                                            <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                                                {(attachment.fileSize / 1024).toFixed(1)} KB
                                                            </Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                                
                                {/* Show comments */}
                                {comments.map((comment) => (
                                    <View key={comment.id} className="rounded-lg p-4 mb-3" style={{ backgroundColor: colors.card }}>
                                        <View className="flex-row justify-between items-start mb-2">
                                            <View className="flex-row items-center">
                                                <Text className="font-semibold" style={{ color: colors.text }}>
                                                    {(comment as any).userName || 'User'}
                                                </Text>
                                                {comment.isAiGenerated && (
                                                    <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : '#F3E8FF' }}>
                                                        <Text className="text-xs" style={{ color: isDark ? '#C4B5FD' : '#9333EA' }}>AI</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                                {formatDate((comment as any).createdAt || comment.timestamp)}
                                            </Text>
                                        </View>
                                        {/* Rich Text Comment with markdown support */}
                                        <RichTextComment text={comment.commentText} textColor={colors.textSecondary} />
                                        
                                        {/* Comment Attachments */}
                                        {(comment as any).attachments && (comment as any).attachments.length > 0 && (
                                            <View className="mt-3 flex-row flex-wrap gap-2">
                                                {(comment as any).attachments.map((attachment: any, index: number) => {
                                                    const commentAttachmentsList: AttachmentData[] = (comment as any).attachments;
                                                    return (
                                                    <TouchableOpacity
                                                        key={attachment.id || index}
                                                        className="rounded-lg p-2 flex-row items-center"
                                                        style={{ maxWidth: '48%', backgroundColor: colors.backgroundSecondary }}
                                                        onPress={() => {
                                                            openAttachmentPreview(attachment, commentAttachmentsList, index);
                                                        }}
                                                    >
                                                        {attachment.fileType?.startsWith('image/') ? (
                                                            <Image 
                                                                source={{ uri: attachment.fileUrl }} 
                                                                className="w-10 h-10 rounded"
                                                                contentFit="cover"
                                                            />
                                                        ) : attachment.fileType?.startsWith('audio/') ? (
                                                            <View className="w-10 h-10 rounded items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : '#F3E8FF' }}>
                                                                <MaterialCommunityIcons 
                                                                    name="microphone" 
                                                                    size={20} 
                                                                    color="#7C3AED" 
                                                                />
                                                            </View>
                                                        ) : (
                                                            <View className="w-10 h-10 rounded items-center justify-center" style={{ backgroundColor: colors.backgroundSecondary }}>
                                                                <MaterialCommunityIcons 
                                                                    name={
                                                                        attachment.fileType?.includes('pdf') ? 'file-pdf-box' :
                                                                        attachment.fileType?.includes('word') ? 'file-word-box' :
                                                                        'file-document'
                                                                    } 
                                                                    size={20} 
                                                                    color={colors.textTertiary} 
                                                                />
                                                            </View>
                                                        )}
                                                        <View className="flex-1 ml-2">
                                                            <Text className="text-xs font-medium" style={{ color: colors.text }} numberOfLines={1}>
                                                                {attachment.filename}
                                                            </Text>
                                                            {attachment.fileSize && (
                                                                <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                                                    {(attachment.fileSize / 1024).toFixed(1)} KB
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </>
                        )}

                        {/* Rich Text Comment Editor */}
                        <View className="rounded-xl p-4" style={{ backgroundColor: colors.card }}>
                            <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>Add Comment</Text>
                            
                            <RichTextEditor
                                value={newComment}
                                onChange={setNewComment}
                                placeholder="Write your comment here..."
                                minHeight={100}
                                maxHeight={200}
                            />

                            {/* Comment Attachments Preview */}
                            {commentAttachments.length > 0 && (
                                <View className="mt-3">
                                    <AttachmentPreview
                                        attachments={commentAttachments}
                                        onRemove={(index) => setCommentAttachments(prev => prev.filter((_, i) => i !== index))}
                                        compact
                                    />
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View className="flex-row gap-3 mt-4">
                                {/* Attachment Button */}
                                <TouchableOpacity
                                    onPress={() => setShowAttachmentPicker(true)}
                                    className="flex-1 flex-row items-center justify-center py-3 rounded-lg"
                                    style={{ backgroundColor: colors.backgroundSecondary }}
                                >
                                    <MaterialCommunityIcons name="attachment" size={20} color={colors.textSecondary} />
                                    <Text className="text-sm font-medium ml-2" style={{ color: colors.textSecondary }}>
                                        Attach
                                    </Text>
                                    {commentAttachments.length > 0 && (
                                        <View className="ml-2 bg-blue-500 px-2 py-0.5 rounded-full">
                                            <Text className="text-white text-xs font-semibold">{commentAttachments.length}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Post Comment Button */}
                                <TouchableOpacity
                                    onPress={handleAddComment}
                                    disabled={(!newComment.trim() && commentAttachments.length === 0) || submittingComment}
                                    className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${(newComment.trim() || commentAttachments.length > 0) && !submittingComment ? 'bg-blue-600' : 'bg-gray-300'}`}
                                >
                                    <MaterialCommunityIcons 
                                        name={submittingComment ? "loading" : "send"} 
                                        size={18} 
                                        color="#FFFFFF" 
                                    />
                                    <Text className="text-white font-semibold ml-2">
                                        {submittingComment ? 'Posting...' : 'Post'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* History Tab */}
                {
                    activeTab === 'history' && (
                        <View className="p-4">
                            {historyLoading ? (
                                <View className="items-center py-8">
                                    <Text style={{ color: colors.textTertiary }}>{t('common.loading')}</Text>
                                </View>
                            ) : (() => {
                                // Build unified timeline
                                type TimelineEntry = {
                                    id: string;
                                    type: 'created' | 'sprint' | 'change';
                                    action: string;
                                    detail: string;
                                    userName: string;
                                    timestamp: Date;
                                    icon: string;
                                    iconColor: string;
                                    bgColor: string;
                                };
                                
                                const timeline: TimelineEntry[] = [];
                                
                                // 1. Add task creation entry
                                if (task?.createdAt) {
                                    const createdDate = new Date(task.createdAt);
                                    if (!isNaN(createdDate.getTime())) {
                                        // Check if task was created directly to sprint or backlog
                                        const wasCreatedToSprint = task.sprintId && 
                                            !history.some(h => 
                                                (h.fieldName?.toLowerCase() === 'sprintid' || h.fieldName?.toLowerCase() === 'sprint_id') &&
                                                !h.oldValue && h.newValue
                                            );
                                        
                                        timeline.push({
                                            id: 'task-created',
                                            type: 'created',
                                            action: 'Task created',
                                            detail: wasCreatedToSprint 
                                                ? `Created directly in Sprint ${task.sprintId}` 
                                                : 'Created in backlog',
                                            userName: 'System',
                                            timestamp: createdDate,
                                            icon: 'plus-circle',
                                            iconColor: '#10B981',
                                            bgColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
                                        });
                                    }
                                }
                                
                                // 2. Add history entries
                                history.forEach((item) => {
                                    const { action, detail } = getHistoryDescription(item);
                                    const isCreation = action === 'Task created';
                                    const isSprint = action.includes('Sprint');
                                    const isComment = action === 'Comment added';
                                    const isAttachment = action === 'Attachment added';
                                    
                                    // Skip if this is a duplicate creation entry
                                    if (isCreation && timeline.some(t => t.type === 'created')) {
                                        return;
                                    }
                                    
                                    const timestamp = new Date(item.createdAt);
                                    if (isNaN(timestamp.getTime())) return;
                                    
                                    // Determine icon and colors based on action type
                                    let icon = 'pencil';
                                    let iconColor = '#3B82F6';
                                    let bgColor = isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE';
                                    
                                    if (isCreation) {
                                        icon = 'plus-circle';
                                        iconColor = '#10B981';
                                        bgColor = isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5';
                                    } else if (isSprint) {
                                        icon = 'calendar-arrow-right';
                                        iconColor = '#8B5CF6';
                                        bgColor = isDark ? 'rgba(139, 92, 246, 0.2)' : '#EDE9FE';
                                    } else if (isComment) {
                                        icon = 'comment-text';
                                        iconColor = '#F59E0B';
                                        bgColor = isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7';
                                    } else if (isAttachment) {
                                        icon = 'attachment';
                                        iconColor = '#EC4899';
                                        bgColor = isDark ? 'rgba(236, 72, 153, 0.2)' : '#FCE7F3';
                                    }
                                    
                                    timeline.push({
                                        id: item.id,
                                        type: isSprint ? 'sprint' : 'change',
                                        action,
                                        detail,
                                        userName: (item as any).changedByUserName || 'User',
                                        timestamp,
                                        icon,
                                        iconColor,
                                        bgColor,
                                    });
                                });
                                
                                // Sort by timestamp descending (newest first)
                                timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                                
                                if (timeline.length === 0) {
                                    return (
                                        <View className="rounded-lg p-8 items-center" style={{ backgroundColor: colors.card }}>
                                            <MaterialCommunityIcons name="history" size={48} color={colors.textTertiary} />
                                            <Text className="mt-3" style={{ color: colors.textTertiary }}>No history yet</Text>
                                            <Text className="text-sm" style={{ color: colors.textTertiary }}>Task changes will appear here</Text>
                                        </View>
                                    );
                                }
                                
                                return timeline.map((entry, index) => (
                                    <View key={entry.id} className="rounded-lg p-4 mb-3" style={{ backgroundColor: colors.card }}>
                                        <View className="flex-row items-start">
                                            <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: entry.bgColor }}>
                                                <MaterialCommunityIcons 
                                                    name={entry.icon as any} 
                                                    size={18} 
                                                    color={entry.iconColor} 
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row justify-between items-start mb-1">
                                                    <Text className="font-semibold" style={{ color: colors.text }}>
                                                        {entry.userName}
                                                    </Text>
                                                    <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                                        {entry.timestamp.toLocaleString()}
                                                    </Text>
                                                </View>
                                                <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                                                    {entry.action}
                                                </Text>
                                                {entry.detail && (
                                                    <Text className="text-sm" style={{ color: colors.textTertiary }}>
                                                        {entry.detail}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        {/* Timeline connector line */}
                                        {index < timeline.length - 1 && (
                                            <View className="absolute left-8 top-14 bottom-0 w-0.5" style={{ height: 20, backgroundColor: colors.border }} />
                                        )}
                                    </View>
                                ));
                            })()}
                        </View>
                    )
                }
            </ScrollView >

            {/* Quick Status Change Modal */}
            < Modal visible={showStatusMenu} transparent animationType="slide" >
                <Pressable
                    className="flex-1 justify-end"
                    style={{ backgroundColor: colors.overlay }}
                    onPress={() => setShowStatusMenu(false)}
                >
                    <Pressable>
                        <View className="rounded-t-3xl pt-4 pb-8 px-4" style={{ backgroundColor: colors.card }}>
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold" style={{ color: colors.text }}>{t('tasks.details.changeStatus')}</Text>
                                <TouchableOpacity onPress={() => setShowStatusMenu(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => handleStatusChange(option.value)}
                                    className="flex-row items-center p-4 rounded-lg mb-2"
                                    style={{
                                        backgroundColor: task.status === option.value 
                                            ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF') 
                                            : colors.backgroundSecondary,
                                        borderWidth: task.status === option.value ? 2 : 0,
                                        borderColor: task.status === option.value ? '#3B82F6' : 'transparent'
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={24}
                                        color={option.color}
                                    />
                                    <Text className="ml-3 text-base font-medium" style={{ color: task.status === option.value ? '#3B82F6' : colors.text }}>
                                        {option.label}
                                    </Text>
                                    {task.status === option.value && (
                                        <MaterialCommunityIcons
                                            name="check"
                                            size={20}
                                            color="#3B82F6"
                                            style={{ marginLeft: 'auto' }}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal >

            {/* Attachment Picker Modal */}
            <AttachmentPicker
                visible={showAttachmentPicker}
                onClose={() => setShowAttachmentPicker(false)}
                onAttachmentAdded={(attachment) => {
                    setCommentAttachments(prev => [...prev, attachment]);
                }}
                maxAttachments={5}
                currentAttachmentsCount={commentAttachments.length}
            />

            {/* Attachment Preview Modal - View images, audio, documents in-app */}
            <AttachmentPreviewModal
                visible={previewModalVisible}
                onClose={() => setPreviewModalVisible(false)}
                attachment={previewAttachment}
                attachments={previewAttachments}
                initialIndex={previewInitialIndex}
            />
        </View >
    );
}
