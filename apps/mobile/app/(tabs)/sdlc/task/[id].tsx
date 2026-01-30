import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Image, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task, TaskComment, TaskHistory } from '../../../../types/models';
import { lifeWheelApi, taskApi, fileUploadApi } from '../../../../services/api';
import { useEpicStore } from '../../../../store/epicStore';
import { useTaskStore } from '../../../../store/taskStore';
import { useTranslation } from '../../../../hooks/useTranslation';
import { AttachmentPicker, AttachmentPreview, CommentAttachment } from '../../../../components/ui/AttachmentPicker';

type TabType = 'overview' | 'comments' | 'checklist' | 'history';

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

    // Load comments from API
    const loadComments = useCallback(async (taskId: string) => {
        try {
            setCommentsLoading(true);
            const fetchedComments = await taskApi.getTaskComments(taskId);
            setComments(fetchedComments || []);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setCommentsLoading(false);
        }
    }, []);

    // Load history from API
    const loadHistory = useCallback(async (taskId: string) => {
        try {
            setHistoryLoading(true);
            const fetchedHistory = await taskApi.getTaskHistory(taskId);
            setHistory(fetchedHistory || []);
        } catch (error) {
            console.error('Error loading history:', error);
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
            console.error('Error loading task:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLifeWheelAreas = async () => {
        try {
            const areas = await lifeWheelApi.getLifeWheelAreas();
            setLifeWheelAreas(areas);
        } catch (error) {
            console.error('Error loading life wheel areas:', error);
        }
    };

    // Update task when tasks are loaded
    useEffect(() => {
        const foundTask = tasks.find((t: Task) => t.id === id);
        if (foundTask) {
            setTask(foundTask);
            
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
        
        if (fieldName === 'status') {
            if (!item.oldValue && item.newValue) {
                return { action: 'Task created', detail: `Initial status: ${item.newValue}` };
            }
            if (item.newValue === 'TODO' && item.oldValue === 'DRAFT') {
                return { action: 'Moved to Sprint', detail: 'Task added to active sprint' };
            }
            return { action: 'Status changed', detail: `${item.oldValue || 'None'} → ${item.newValue}` };
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
                await taskApi.updateTask(task.id, { status: newStatus });
                // Reload history to get the updated history from backend
                loadHistory(task.id);
            } catch (error) {
                console.error('Error updating status:', error);
                // Revert on error
                setTask({ ...task, status: oldStatus });
            }
        }
        setShowStatusMenu(false);
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
                    console.log('📤 Uploading comment attachments...');
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
                            console.error('Failed to upload attachment:', attachment.name, uploadResult.error);
                            throw new Error(`Failed to upload ${attachment.name}`);
                        }
                    }
                    console.log('✅ All attachments uploaded:', uploadedAttachments.length);
                }

                // Now add the comment with attachments
                const createdComment = await taskApi.addComment(task.id, { 
                    commentText: newComment.trim() || 'Attachment added',
                    attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
                });
                
                // Add the new comment to the list
                setComments([...comments, createdComment]);
                setNewComment('');
                setCommentAttachments([]);
            } catch (error) {
                console.error('Error adding comment:', error);
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
            <View className="flex-1 items-center justify-center bg-white">
                <Text>{t('common.loading')}</Text>
            </View>
        );
    }

    const currentStatus = statusOptions.find(s => s.value === task.status) || statusOptions[0];
    const completedChecklist = checklist.filter(item => item.completed).length;
    const totalChecklist = checklist.length;

    return (
        <View className="flex-1 bg-gray-50">
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
                        <TouchableOpacity
                            onPress={() => router.push(`/(tabs)/sdlc/task/edit?id=${task.id}` as any)}
                            className="w-9 h-9 bg-white/20 rounded-lg items-center justify-center border border-white/40"
                        >
                            <MaterialCommunityIcons name="pencil" size={18} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                // Navigate to Pomodoro with task context
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
                            className="w-9 h-9 bg-white/20 rounded-lg items-center justify-center border border-white/40"
                        >
                            <MaterialCommunityIcons name="bullseye-arrow" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

            {/* Tab Bar */}
            <View className="bg-white border-b border-gray-200 flex-row">
                {[
                    { id: 'overview', label: t('tasks.tabs.overview'), icon: 'information-outline' },
                    { id: 'comments', label: t('tasks.tabs.comments'), icon: 'comment-outline', badge: (comments.length + attachments.length) > 0 ? (comments.length + attachments.length) : undefined },
                    { id: 'checklist', label: t('tasks.tabs.checklist'), icon: 'checkbox-marked-outline', badge: `${completedChecklist}/${totalChecklist}` },
                    { id: 'history', label: t('tasks.tabs.history'), icon: 'history', badge: history.length > 0 ? history.length : undefined },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id as TabType)}
                        className={`flex-1 py-3 border-b-2 ${activeTab === tab.id ? 'border-blue-600' : 'border-transparent'
                            }`}
                    >
                        <View className="items-center">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons
                                    name={tab.icon as any}
                                    size={18}
                                    color={activeTab === tab.id ? '#3B82F6' : '#9CA3AF'}
                                />
                                {tab.badge && (
                                    <View className="ml-1 bg-blue-100 px-1.5 py-0.5 rounded-full">
                                        <Text className="text-xs text-blue-600 font-semibold">{tab.badge}</Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                className={`text-xs mt-1 ${activeTab === tab.id ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                    }`}
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
                        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-3">{t('tasks.details.taskDetails')}</Text>
                            {task.description && (
                                <View className="mb-4 pb-4 border-b border-gray-100">
                                    <Text className="text-xs text-gray-500 mb-1.5">{t('tasks.details.description')}</Text>
                                    <Text className="text-gray-700 leading-5">{task.description}</Text>
                                </View>
                            )}
                            <View className="flex-row flex-wrap gap-3">
                                <View className="flex-1 min-w-[45%]">
                                    <Text className="text-xs text-gray-500 mb-1">{t('tasks.details.storyPoints')}</Text>
                                    <View className="flex-row items-center">
                                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2">
                                            <Text className="text-blue-600 font-bold text-sm">{task.storyPoints}</Text>
                                        </View>
                                        <Text className="text-gray-600 text-xs">{t('common.points')}</Text>
                                    </View>
                                </View>
                                <View className="flex-1 min-w-[45%]">
                                    <Text className="text-xs text-gray-500 mb-1">{t('tasks.details.lifeWheel')}</Text>
                                    <Text className="text-gray-800 font-medium">{getLifeWheelName()}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Eisenhower Matrix & Tags */}
                        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-3">{t('tasks.details.priorityTags')}</Text>

                            {/* Eisenhower Quadrant */}
                            <View className="mb-3">
                                <Text className="text-xs text-gray-500 mb-2">{t('tasks.details.eisenhowerMatrix')}</Text>
                                <View className={`px-4 py-2.5 rounded-lg border-2 ${task.eisenhowerQuadrantId === 'eq-1' ? 'bg-red-50 border-red-300' :
                                    task.eisenhowerQuadrantId === 'eq-2' ? 'bg-blue-50 border-blue-300' :
                                        task.eisenhowerQuadrantId === 'eq-3' ? 'bg-yellow-50 border-yellow-300' :
                                            'bg-gray-50 border-gray-300'
                                    }`}>
                                    <Text className="font-medium text-gray-800">
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
                                    <View className="bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200">
                                        <Text className="text-purple-700 font-medium text-xs">📅 Sprint {task.sprintId}</Text>
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
                        <View className="bg-white rounded-xl p-4 shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-3">{t('tasks.details.quickActions')}</Text>
                            <TouchableOpacity className="bg-gray-100 py-3.5 rounded-lg mb-2 flex-row items-center justify-center">
                                <MaterialCommunityIcons name="playlist-plus" size={20} color="#4B5563" />
                                <Text className="text-gray-700 font-semibold ml-2">{t('tasks.details.addRelatedTask')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-gray-100 py-3.5 rounded-lg flex-row items-center justify-center">
                                <MaterialCommunityIcons name="link-variant-plus" size={20} color="#4B5563" />
                                <Text className="text-gray-700 font-semibold ml-2">{t('tasks.details.addRelatedTask')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                    <View className="p-4">
                        {commentsLoading ? (
                            <View className="items-center py-8">
                                <Text className="text-gray-500">{t('common.loading')}</Text>
                            </View>
                        ) : (comments.length === 0 && attachments.length === 0) ? (
                            <View className="bg-white rounded-lg p-8 items-center mb-4">
                                <MaterialCommunityIcons name="comment-outline" size={48} color="#D1D5DB" />
                                <Text className="text-gray-500 mt-3">No activity yet</Text>
                                <Text className="text-gray-400 text-sm">Comments and attachments will appear here</Text>
                            </View>
                        ) : (
                            <>
                                {/* Show attachments first if any */}
                                {attachments.length > 0 && (
                                    <View className="bg-white rounded-lg p-4 mb-3">
                                        <View className="flex-row items-center mb-3">
                                            <MaterialCommunityIcons name="attachment" size={18} color="#6B7280" />
                                            <Text className="font-semibold text-gray-700 ml-2">Attachments ({attachments.length})</Text>
                                        </View>
                                        <View className="flex-row flex-wrap gap-2">
                                            {attachments.map((attachment) => (
                                                <TouchableOpacity 
                                                    key={attachment.id} 
                                                    className="bg-gray-50 rounded-lg p-2 flex-row items-center"
                                                    style={{ maxWidth: '48%' }}
                                                    onPress={() => {
                                                        if (attachment.fileUrl) {
                                                            Linking.openURL(attachment.fileUrl);
                                                        }
                                                    }}
                                                >
                                                    {attachment.fileType?.startsWith('image/') ? (
                                                        <Image 
                                                            source={{ uri: attachment.fileUrl }} 
                                                            className="w-10 h-10 rounded"
                                                            resizeMode="cover"
                                                        />
                                                    ) : (
                                                        <View className="w-10 h-10 rounded bg-gray-100 items-center justify-center">
                                                            <MaterialCommunityIcons 
                                                                name={
                                                                    attachment.fileType?.includes('pdf') ? 'file-pdf-box' :
                                                                    attachment.fileType?.includes('word') ? 'file-word-box' :
                                                                    'file-document'
                                                                } 
                                                                size={20} 
                                                                color="#6B7280" 
                                                            />
                                                        </View>
                                                    )}
                                                    <View className="flex-1 ml-2">
                                                        <Text className="text-xs text-gray-800 font-medium" numberOfLines={1}>
                                                            {attachment.filename}
                                                        </Text>
                                                        {attachment.fileSize && (
                                                            <Text className="text-xs text-gray-500">
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
                                    <View key={comment.id} className="bg-white rounded-lg p-4 mb-3">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <View className="flex-row items-center">
                                                <Text className="font-semibold text-gray-800">
                                                    {(comment as any).userName || 'User'}
                                                </Text>
                                                {comment.isAiGenerated && (
                                                    <View className="ml-2 bg-purple-100 px-2 py-0.5 rounded">
                                                        <Text className="text-xs text-purple-600">AI</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-xs text-gray-500">
                                                {formatDate((comment as any).createdAt || comment.timestamp)}
                                            </Text>
                                        </View>
                                        <Text className="text-gray-600">{comment.commentText}</Text>
                                        
                                        {/* Comment Attachments */}
                                        {(comment as any).attachments && (comment as any).attachments.length > 0 && (
                                            <View className="mt-3 flex-row flex-wrap gap-2">
                                                {(comment as any).attachments.map((attachment: any, index: number) => (
                                                    <TouchableOpacity
                                                        key={attachment.id || index}
                                                        className="bg-gray-50 rounded-lg p-2 flex-row items-center"
                                                        style={{ maxWidth: '48%' }}
                                                        onPress={() => {
                                                            if (attachment.fileUrl) {
                                                                Linking.openURL(attachment.fileUrl);
                                                            }
                                                        }}
                                                    >
                                                        {attachment.fileType?.startsWith('image/') ? (
                                                            <Image 
                                                                source={{ uri: attachment.fileUrl }} 
                                                                className="w-10 h-10 rounded"
                                                                resizeMode="cover"
                                                            />
                                                        ) : attachment.fileType?.startsWith('audio/') ? (
                                                            <View className="w-10 h-10 rounded bg-purple-100 items-center justify-center">
                                                                <MaterialCommunityIcons 
                                                                    name="microphone" 
                                                                    size={20} 
                                                                    color="#7C3AED" 
                                                                />
                                                            </View>
                                                        ) : (
                                                            <View className="w-10 h-10 rounded bg-gray-100 items-center justify-center">
                                                                <MaterialCommunityIcons 
                                                                    name={
                                                                        attachment.fileType?.includes('pdf') ? 'file-pdf-box' :
                                                                        attachment.fileType?.includes('word') ? 'file-word-box' :
                                                                        'file-document'
                                                                    } 
                                                                    size={20} 
                                                                    color="#6B7280" 
                                                                />
                                                            </View>
                                                        )}
                                                        <View className="flex-1 ml-2">
                                                            <Text className="text-xs text-gray-800 font-medium" numberOfLines={1}>
                                                                {attachment.filename}
                                                            </Text>
                                                            {attachment.fileSize && (
                                                                <Text className="text-xs text-gray-500">
                                                                    {(attachment.fileSize / 1024).toFixed(1)} KB
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </>
                        )}

                        <View className="bg-white rounded-lg p-4">
                            <TextInput
                                value={newComment}
                                onChangeText={setNewComment}
                                placeholder="Add a comment about your progress..."
                                multiline
                                numberOfLines={3}
                                className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
                                textAlignVertical="top"
                            />

                            {/* Comment Attachments Preview */}
                            {commentAttachments.length > 0 && (
                                <View className="mb-3">
                                    <AttachmentPreview
                                        attachments={commentAttachments}
                                        onRemove={(index) => setCommentAttachments(prev => prev.filter((_, i) => i !== index))}
                                        compact
                                    />
                                </View>
                            )}

                            {/* Attachment Button */}
                            <TouchableOpacity
                                onPress={() => setShowAttachmentPicker(true)}
                                className="flex-row items-center justify-center bg-gray-100 py-2.5 rounded-lg mb-3"
                            >
                                <MaterialCommunityIcons name="attachment" size={20} color="#6B7280" />
                                <Text className="text-gray-700 text-sm font-medium ml-2">
                                    {t('common.addAttachment') || 'Add Attachment'}
                                </Text>
                                {commentAttachments.length > 0 && (
                                    <View className="ml-2 bg-blue-500 px-2 py-0.5 rounded-full">
                                        <Text className="text-white text-xs font-semibold">{commentAttachments.length}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleAddComment}
                                disabled={(!newComment.trim() && commentAttachments.length === 0) || submittingComment}
                                className={`py-3 rounded-lg ${(newComment.trim() || commentAttachments.length > 0) && !submittingComment ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <Text className="text-white text-center font-semibold">
                                    {submittingComment ? 'Posting...' : t('tasks.details.postComment')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Checklist Tab */}
                {
                    activeTab === 'checklist' && (
                        <View className="p-4">
                            <View className="bg-white rounded-lg overflow-hidden mb-3">
                                {checklist.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => toggleChecklistItem(item.id)}
                                        className="flex-row items-center p-4 border-b border-gray-100"
                                    >
                                        <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${item.completed ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                            }`}>
                                            {item.completed && (
                                                <MaterialCommunityIcons name="check" size={16} color="white" />
                                            )}
                                        </View>
                                        <Text className={`flex-1 ${item.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                            {item.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {showAddChecklist ? (
                                <View className="bg-white rounded-lg p-4">
                                    <TextInput
                                        value={newChecklistItem}
                                        onChangeText={setNewChecklistItem}
                                        placeholder="Enter checklist item..."
                                        className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
                                        autoFocus
                                    />
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={handleAddChecklistItem}
                                            disabled={!newChecklistItem.trim()}
                                            className={`flex-1 py-3 rounded-lg ${newChecklistItem.trim() ? 'bg-blue-600' : 'bg-gray-300'}`}
                                        >
                                            <Text className="text-white text-center font-semibold">{t('common.add')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowAddChecklist(false);
                                                setNewChecklistItem('');
                                            }}
                                            className="flex-1 py-3 rounded-lg bg-gray-100"
                                        >
                                            <Text className="text-gray-700 text-center font-semibold">{t('common.cancel')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setShowAddChecklist(true)}
                                    className="bg-white rounded-lg p-4 flex-row items-center justify-center"
                                >
                                    <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#3B82F6" />
                                    <Text className="text-blue-600 font-semibold ml-2">{t('tasks.details.addChecklistItem')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                }

                {/* History Tab */}
                {
                    activeTab === 'history' && (
                        <View className="p-4">
                            {historyLoading ? (
                                <View className="items-center py-8">
                                    <Text className="text-gray-500">{t('common.loading')}</Text>
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
                                            bgColor: 'bg-green-100',
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
                                    
                                    const timestamp = new Date(item.timestamp);
                                    if (isNaN(timestamp.getTime())) return;
                                    
                                    // Determine icon and colors based on action type
                                    let icon = 'pencil';
                                    let iconColor = '#3B82F6';
                                    let bgColor = 'bg-blue-100';
                                    
                                    if (isCreation) {
                                        icon = 'plus-circle';
                                        iconColor = '#10B981';
                                        bgColor = 'bg-green-100';
                                    } else if (isSprint) {
                                        icon = 'calendar-arrow-right';
                                        iconColor = '#8B5CF6';
                                        bgColor = 'bg-purple-100';
                                    } else if (isComment) {
                                        icon = 'comment-text';
                                        iconColor = '#F59E0B';
                                        bgColor = 'bg-yellow-100';
                                    } else if (isAttachment) {
                                        icon = 'attachment';
                                        iconColor = '#EC4899';
                                        bgColor = 'bg-pink-100';
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
                                        <View className="bg-white rounded-lg p-8 items-center">
                                            <MaterialCommunityIcons name="history" size={48} color="#D1D5DB" />
                                            <Text className="text-gray-500 mt-3">No history yet</Text>
                                            <Text className="text-gray-400 text-sm">Task changes will appear here</Text>
                                        </View>
                                    );
                                }
                                
                                return timeline.map((entry, index) => (
                                    <View key={entry.id} className="bg-white rounded-lg p-4 mb-3">
                                        <View className="flex-row items-start">
                                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${entry.bgColor}`}>
                                                <MaterialCommunityIcons 
                                                    name={entry.icon as any} 
                                                    size={18} 
                                                    color={entry.iconColor} 
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row justify-between items-start mb-1">
                                                    <Text className="font-semibold text-gray-800">
                                                        {entry.userName}
                                                    </Text>
                                                    <Text className="text-xs text-gray-500">
                                                        {entry.timestamp.toLocaleString()}
                                                    </Text>
                                                </View>
                                                <Text className="text-sm text-gray-600 mb-1">
                                                    {entry.action}
                                                </Text>
                                                {entry.detail && (
                                                    <Text className="text-sm text-gray-500">
                                                        {entry.detail}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        {/* Timeline connector line */}
                                        {index < timeline.length - 1 && (
                                            <View className="absolute left-8 top-14 bottom-0 w-0.5 bg-gray-200" style={{ height: 20 }} />
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
                    className="flex-1 bg-black/50 justify-end"
                    onPress={() => setShowStatusMenu(false)}
                >
                    <Pressable>
                        <View className="bg-white rounded-t-3xl pt-4 pb-8 px-4">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold">{t('tasks.details.changeStatus')}</Text>
                                <TouchableOpacity onPress={() => setShowStatusMenu(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => handleStatusChange(option.value)}
                                    className={`flex-row items-center p-4 rounded-lg mb-2 ${task.status === option.value ? 'bg-blue-50 border-2 border-blue-600' : 'bg-gray-50'
                                        }`}
                                >
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={24}
                                        color={option.color}
                                    />
                                    <Text className={`ml-3 text-base font-medium ${task.status === option.value ? 'text-blue-600' : 'text-gray-800'
                                        }`}>
                                        {option.label}
                                    </Text>
                                    {task.status === option.value && (
                                        <MaterialCommunityIcons
                                            name="check"
                                            size={20}
                                            color="#3B82F6"
                                            className="ml-auto"
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
        </View >
    );
}
