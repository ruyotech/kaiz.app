/**
 * DraftPreviewCard - AI-generated draft preview component
 * 
 * Displays the draft created by AI with approve/edit/reject actions.
 * Shows different layouts based on draft type (task, challenge, event, etc.)
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    CommandCenterAIResponse,
    Draft,
    TaskDraft,
    EpicDraft,
    ChallengeDraft,
    EventDraft,
    BillDraft,
    NoteDraft,
    getDraftTypeIcon,
    getDraftTypeColor,
    getDraftTypeDisplayName,
    getDraftTitle,
    getConfidenceLevel,
} from '../../types/commandCenter.types';

// ============================================================================
// Props
// ============================================================================

interface DraftPreviewCardProps {
    response: CommandCenterAIResponse;
    onApprove: () => void;
    onEdit: () => void;
    onReject: () => void;
    isLoading?: boolean;
}

// ============================================================================
// Helper Components
// ============================================================================

interface DetailRowProps {
    icon: string;
    label: string;
    value: string | null | undefined;
    color?: string;
}

function DetailRow({ icon, label, value, color = '#6B7280' }: DetailRowProps) {
    if (!value) return null;
    return (
        <View className="flex-row items-center py-1.5">
            <MaterialCommunityIcons name={icon as any} size={16} color={color} />
            <Text className="text-xs text-gray-500 ml-2 w-20">{label}</Text>
            <Text className="text-sm text-gray-800 flex-1" numberOfLines={1}>{value}</Text>
        </View>
    );
}

interface TagBadgeProps {
    text: string;
    color: string;
    bgColor: string;
}

function TagBadge({ text, color, bgColor }: TagBadgeProps) {
    return (
        <View className="rounded-full px-2 py-0.5 mr-1 mb-1" style={{ backgroundColor: bgColor }}>
            <Text className="text-xs font-medium" style={{ color }}>{text}</Text>
        </View>
    );
}

// ============================================================================
// Draft-specific Renderers
// ============================================================================

function TaskDraftDetails({ draft }: { draft: TaskDraft }) {
    return (
        <View className="mt-2">
            {draft.description && (
                <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
                    {draft.description}
                </Text>
            )}
            <DetailRow icon="view-grid-outline" label="Life Area" value={draft.lifeWheelAreaId} />
            <DetailRow icon="grid" label="Quadrant" value={draft.eisenhowerQuadrantId} />
            <DetailRow icon="star-outline" label="Story Points" value={draft.storyPoints?.toString()} color="#F59E0B" />
            {draft.dueDate && (
                <DetailRow icon="calendar" label="Due Date" value={draft.dueDate} color="#EF4444" />
            )}
            {draft.isRecurring && (
                <DetailRow icon="repeat" label="Recurring" value="Yes" color="#8B5CF6" />
            )}
        </View>
    );
}

function EpicDraftDetails({ draft }: { draft: EpicDraft }) {
    return (
        <View className="mt-2">
            {draft.description && (
                <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
                    {draft.description}
                </Text>
            )}
            <DetailRow icon="view-grid-outline" label="Life Area" value={draft.lifeWheelAreaId} />
            {draft.startDate && <DetailRow icon="calendar-start" label="Start" value={draft.startDate} />}
            {draft.endDate && <DetailRow icon="calendar-end" label="End" value={draft.endDate} />}
            {draft.suggestedTasks.length > 0 && (
                <View className="mt-2">
                    <Text className="text-xs text-gray-500 mb-1">Suggested Tasks ({draft.suggestedTasks.length})</Text>
                    {draft.suggestedTasks.slice(0, 3).map((task, i) => (
                        <View key={i} className="flex-row items-center py-1">
                            <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={14} color="#3B82F6" />
                            <Text className="text-sm text-gray-700 ml-2" numberOfLines={1}>{task.title}</Text>
                        </View>
                    ))}
                    {draft.suggestedTasks.length > 3 && (
                        <Text className="text-xs text-blue-500 ml-5">+{draft.suggestedTasks.length - 3} more</Text>
                    )}
                </View>
            )}
        </View>
    );
}

function ChallengeDraftDetails({ draft }: { draft: ChallengeDraft }) {
    return (
        <View className="mt-2">
            {draft.description && (
                <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
                    {draft.description}
                </Text>
            )}
            <DetailRow icon="timer-sand" label="Duration" value={`${draft.duration} days`} color="#F59E0B" />
            <DetailRow icon="repeat" label="Frequency" value={draft.recurrence} />
            <DetailRow icon="target" label="Metric" value={draft.metricType} />
            {draft.targetValue && (
                <DetailRow 
                    icon="flag-checkered" 
                    label="Target" 
                    value={`${draft.targetValue}${draft.unit ? ` ${draft.unit}` : ''}`} 
                />
            )}
            {draft.whyStatement && (
                <View className="mt-2 p-2 bg-amber-50 rounded-lg">
                    <Text className="text-xs text-amber-700 font-medium">Why:</Text>
                    <Text className="text-sm text-amber-800" numberOfLines={2}>{draft.whyStatement}</Text>
                </View>
            )}
        </View>
    );
}

function EventDraftDetails({ draft }: { draft: EventDraft }) {
    return (
        <View className="mt-2">
            {draft.description && (
                <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
                    {draft.description}
                </Text>
            )}
            {draft.date && <DetailRow icon="calendar" label="Date" value={draft.date} color="#06B6D4" />}
            {!draft.isAllDay && draft.startTime && (
                <DetailRow icon="clock-outline" label="Time" value={`${draft.startTime}${draft.endTime ? ` - ${draft.endTime}` : ''}`} />
            )}
            {draft.isAllDay && <DetailRow icon="hours-24" label="All Day" value="Yes" />}
            {draft.location && <DetailRow icon="map-marker-outline" label="Location" value={draft.location} />}
            {draft.attendees.length > 0 && (
                <DetailRow icon="account-group-outline" label="Attendees" value={draft.attendees.join(', ')} />
            )}
        </View>
    );
}

function BillDraftDetails({ draft }: { draft: BillDraft }) {
    return (
        <View className="mt-2">
            <View className="flex-row items-center mb-2">
                <Text className="text-2xl font-bold text-green-600">
                    {draft.currency} {draft.amount.toFixed(2)}
                </Text>
            </View>
            {draft.dueDate && <DetailRow icon="calendar-alert" label="Due" value={draft.dueDate} color="#EF4444" />}
            {draft.category && <DetailRow icon="tag-outline" label="Category" value={draft.category} />}
            {draft.isRecurring && <DetailRow icon="repeat" label="Recurring" value={draft.recurrence || 'Yes'} />}
            {draft.notes && (
                <Text className="text-sm text-gray-500 mt-2" numberOfLines={2}>{draft.notes}</Text>
            )}
        </View>
    );
}

function NoteDraftDetails({ draft }: { draft: NoteDraft }) {
    return (
        <View className="mt-2">
            {draft.content && (
                <Text className="text-sm text-gray-600 mb-3" numberOfLines={4}>
                    {draft.content}
                </Text>
            )}
            {draft.tags.length > 0 && (
                <View className="flex-row flex-wrap mb-2">
                    {draft.tags.map((tag, i) => (
                        <TagBadge key={i} text={`#${tag}`} color="#6B7280" bgColor="#F3F4F6" />
                    ))}
                </View>
            )}
            {draft.clarifyingQuestions.length > 0 && (
                <View className="bg-yellow-50 p-3 rounded-lg mt-2">
                    <Text className="text-xs font-medium text-yellow-700 mb-1">Questions to clarify:</Text>
                    {draft.clarifyingQuestions.map((q, i) => (
                        <View key={i} className="flex-row items-start py-0.5">
                            <Text className="text-yellow-600 mr-1">•</Text>
                            <Text className="text-sm text-yellow-800 flex-1">{q}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function DraftPreviewCard({
    response,
    onApprove,
    onEdit,
    onReject,
    isLoading = false,
}: DraftPreviewCardProps) {
    const { draft, intentDetected, confidenceScore, reasoning, suggestions } = response;
    const confidence = getConfidenceLevel(confidenceScore);
    const typeColor = getDraftTypeColor(intentDetected);
    const typeIcon = getDraftTypeIcon(intentDetected);
    const title = getDraftTitle(draft);

    const renderDraftDetails = () => {
        switch (draft.type) {
            case 'task':
                return <TaskDraftDetails draft={draft} />;
            case 'epic':
                return <EpicDraftDetails draft={draft} />;
            case 'challenge':
                return <ChallengeDraftDetails draft={draft} />;
            case 'event':
                return <EventDraftDetails draft={draft} />;
            case 'bill':
                return <BillDraftDetails draft={draft} />;
            case 'note':
                return <NoteDraftDetails draft={draft} />;
            default:
                return null;
        }
    };

    return (
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <View 
                className="p-4 border-b border-gray-100"
                style={{ backgroundColor: typeColor + '10' }}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                        <View 
                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: typeColor + '20' }}
                        >
                            <MaterialCommunityIcons name={typeIcon as any} size={22} color={typeColor} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                                {title}
                            </Text>
                            <Text className="text-xs text-gray-500">
                                {getDraftTypeDisplayName(intentDetected)}
                            </Text>
                        </View>
                    </View>
                    
                    {/* Confidence Badge */}
                    <View 
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: confidence.color + '15' }}
                    >
                        <Text className="text-xs font-medium" style={{ color: confidence.color }}>
                            {Math.round(confidenceScore * 100)}%
                        </Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            <View className="p-4">
                {renderDraftDetails()}

                {/* AI Reasoning */}
                {reasoning && (
                    <View className="mt-3 p-3 bg-purple-50 rounded-xl">
                        <View className="flex-row items-center mb-1">
                            <MaterialCommunityIcons name="robot-outline" size={14} color="#8B5CF6" />
                            <Text className="text-xs font-medium text-purple-700 ml-1">AI Reasoning</Text>
                        </View>
                        <Text className="text-sm text-purple-800" numberOfLines={3}>
                            {reasoning}
                        </Text>
                    </View>
                )}

                {/* Suggestions */}
                {suggestions && suggestions.length > 0 && (
                    <View className="mt-2">
                        <Text className="text-xs text-gray-500 mb-1">💡 Suggestions</Text>
                        {suggestions.slice(0, 2).map((s, i) => (
                            <Text key={i} className="text-xs text-gray-600" numberOfLines={1}>• {s}</Text>
                        ))}
                    </View>
                )}
            </View>

            {/* Actions */}
            <View className="flex-row border-t border-gray-100">
                <TouchableOpacity
                    onPress={onReject}
                    disabled={isLoading}
                    className="flex-1 py-3 items-center justify-center border-r border-gray-100"
                >
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="close" size={18} color="#EF4444" />
                        <Text className="text-sm font-medium text-red-500 ml-1">Reject</Text>
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={onEdit}
                    disabled={isLoading}
                    className="flex-1 py-3 items-center justify-center border-r border-gray-100"
                >
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="pencil" size={18} color="#6B7280" />
                        <Text className="text-sm font-medium text-gray-600 ml-1">Edit</Text>
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                    onPress={onApprove}
                    disabled={isLoading}
                    className="flex-1 py-3 items-center justify-center"
                    style={{ backgroundColor: typeColor + '10' }}
                >
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="check" size={18} color={typeColor} />
                        <Text className="text-sm font-semibold ml-1" style={{ color: typeColor }}>
                            Create
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default DraftPreviewCard;
