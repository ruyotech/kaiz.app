/**
 * PendingDraftCard - Compact card for pending AI-generated drafts
 *
 * Displays in the Create screen's pending approval section with inline actions.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    DraftPreview,
    getDraftTitle,
    getDraftTypeIcon,
    getDraftTypeColor,
    getDraftTypeDisplayName,
} from '../../types/commandCenter';

interface PendingDraftCardProps {
    draft: DraftPreview;
    onApprove: (draftId: string) => void;
    onReject: (draftId: string) => void;
    onPress?: (draft: DraftPreview) => void;
    isLoading?: boolean;
}

export function PendingDraftCard({
    draft,
    onApprove,
    onReject,
    onPress,
    isLoading = false,
}: PendingDraftCardProps) {
    const title = getDraftTitle(draft.draft);
    const typeIcon = getDraftTypeIcon(draft.draftType);
    const typeColor = getDraftTypeColor(draft.draftType);
    const typeName = getDraftTypeDisplayName(draft.draftType);

    // Calculate time until expiration
    const expiresAt = draft.expiresAt ? new Date(draft.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const hoursRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));

    return (
        <TouchableOpacity
            onPress={() => onPress?.(draft)}
            disabled={isLoading}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            style={{ opacity: isLoading ? 0.6 : 1 }}
        >
            {/* Header Row */}
            <View className="flex-row items-center mb-3">
                {/* Type Icon */}
                <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: typeColor + '20' }}
                >
                    <MaterialCommunityIcons
                        name={typeIcon as any}
                        size={20}
                        color={typeColor}
                    />
                </View>

                {/* Title and Type */}
                <View className="flex-1">
                    <Text className="font-semibold text-gray-900" numberOfLines={1}>
                        {title}
                    </Text>
                    <View className="flex-row items-center mt-0.5">
                        <Text className="text-xs text-gray-500">{typeName}</Text>
                        <Text className="text-gray-300 mx-1">•</Text>
                        <Text className="text-xs text-gray-400">
                            {hoursRemaining > 0 ? `${hoursRemaining}h left` : 'Expiring soon'}
                        </Text>
                    </View>
                </View>

                {/* Confidence Badge */}
                <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: typeColor + '15' }}
                >
                    <Text className="text-xs font-medium" style={{ color: typeColor }}>
                        {Math.round((draft.confidence || 0.85) * 100)}%
                    </Text>
                </View>
            </View>

            {/* AI Reasoning (truncated) */}
            {draft.reasoning && (
                <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                    {draft.reasoning}
                </Text>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-2">
                {/* Reject Button */}
                <TouchableOpacity
                    onPress={() => onReject(draft.id)}
                    disabled={isLoading}
                    className="flex-1 flex-row items-center justify-center py-2 rounded-lg border border-red-200 bg-red-50"
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                            <Text className="text-sm font-medium text-red-500 ml-1">Reject</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Approve Button */}
                <TouchableOpacity
                    onPress={() => onApprove(draft.id)}
                    disabled={isLoading}
                    className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
                    style={{ backgroundColor: typeColor }}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="check" size={16} color="white" />
                            <Text className="text-sm font-semibold text-white ml-1">Approve</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

export default PendingDraftCard;
