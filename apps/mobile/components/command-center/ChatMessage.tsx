/**
 * ChatMessage Component
 * Displays user and AI messages in the chat interface
 */

import React from 'react';
import { View, Text, ActivityIndicator, Image, Pressable, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ChatMessage as ChatMessageType, DraftPreview, getDraftTypeDisplayName, getDraftTypeIcon, getDraftTypeColor } from '../../types/commandCenter';

interface ChatMessageProps {
  message: ChatMessageType;
  onDraftApprove?: () => void;
  onDraftReject?: () => void;
  onDraftEdit?: () => void;
  onDraftPress?: (draft: DraftPreview) => void;
  isProcessing?: boolean;
}

export function ChatMessage({ 
  message, 
  onDraftApprove, 
  onDraftReject, 
  onDraftEdit,
  onDraftPress,
  isProcessing 
}: ChatMessageProps) {
  if (message.role === 'system') {
    return <SystemMessage message={message} />;
  }
  
  if (message.role === 'user') {
    return <UserMessage message={message} />;
  }
  
  return (
    <AssistantMessage 
      message={message}
      onDraftApprove={onDraftApprove}
      onDraftReject={onDraftReject}
      onDraftEdit={onDraftEdit}
      onDraftPress={onDraftPress}
      isProcessing={isProcessing}
    />
  );
}

// ============================================================================
// User Message
// ============================================================================

function UserMessage({ message }: { message: ChatMessageType }) {
  return (
    <View className="flex-row justify-end mb-4 px-4">
      <View className="max-w-[85%]">
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <View className="mb-2 flex-row flex-wrap justify-end gap-2">
            {message.attachments.map((att, i) => (
              <View 
                key={i}
                className="bg-blue-500 rounded-xl px-3 py-2 flex-row items-center"
              >
                <MaterialCommunityIcons 
                  name={getAttachmentIcon(att.type)} 
                  size={16} 
                  color="white" 
                />
                <Text className="text-white text-sm ml-2" numberOfLines={1}>
                  {att.name}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Message bubble */}
        <View className="bg-blue-600 rounded-2xl rounded-br-sm px-4 py-3">
          <Text className="text-white text-base leading-6">{message.content}</Text>
          <Text className="text-blue-200 text-xs mt-2 text-right">
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Assistant Message
// ============================================================================

interface AssistantMessageProps {
  message: ChatMessageType;
  onDraftApprove?: () => void;
  onDraftReject?: () => void;
  onDraftEdit?: () => void;
  onDraftPress?: (draft: DraftPreview) => void;
  isProcessing?: boolean;
}

function AssistantMessage({ 
  message, 
  onDraftApprove, 
  onDraftReject, 
  onDraftEdit,
  onDraftPress,
  isProcessing 
}: AssistantMessageProps) {
  return (
    <View className="mb-4 px-4">
      {/* AI Avatar */}
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
          <MaterialCommunityIcons name="robot" size={18} color="#8B5CF6" />
        </View>
        <Text className="text-sm font-semibold text-purple-600 ml-2">SensAI</Text>
        {message.isThinking && (
          <View className="flex-row items-center ml-2">
            <ActivityIndicator size="small" color="#8B5CF6" />
          </View>
        )}
      </View>
      
      {/* Message content */}
      <View className="ml-10">
        {message.isThinking ? (
          <ThinkingBubble />
        ) : message.draft ? (
          <DraftPreviewCard
            draft={message.draft}
            onApprove={onDraftApprove}
            onReject={onDraftReject}
            onEdit={onDraftEdit}
            onPress={onDraftPress}
            isProcessing={isProcessing}
          />
        ) : message.clarification ? (
          <ClarificationCard clarification={message.clarification} />
        ) : (
          <MessageBubble content={message.content} timestamp={message.timestamp} />
        )}
      </View>
    </View>
  );
}

function ThinkingBubble() {
  return (
    <View className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 self-start">
      <View className="flex-row items-center">
        <View className="flex-row gap-1">
          <View className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
          <View className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <View className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </View>
        <Text className="text-gray-500 ml-2">Thinking...</Text>
      </View>
    </View>
  );
}

function MessageBubble({ content, timestamp }: { content: string; timestamp: Date }) {
  return (
    <View className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 self-start max-w-[90%]">
      <Text className="text-gray-800 text-base leading-6">{content}</Text>
      <Text className="text-gray-400 text-xs mt-2">
        {formatTime(timestamp)}
      </Text>
    </View>
  );
}

// ============================================================================
// Draft Preview Card
// ============================================================================

interface DraftPreviewCardProps {
  draft: ChatMessageType['draft'];
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onPress?: (draft: DraftPreview) => void;
  isProcessing?: boolean;
}

function DraftPreviewCard({ draft, onApprove, onReject, onEdit, onPress, isProcessing }: DraftPreviewCardProps) {
  const router = useRouter();
  
  if (!draft) return null;
  
  const typeColor = getDraftTypeColor(draft.draftType);
  const typeIcon = getDraftTypeIcon(draft.draftType);
  const typeName = getDraftTypeDisplayName(draft.draftType);
  
  // Navigate to draft detail screen when card is pressed
  const handleCardPress = () => {
    if (onPress) {
      onPress(draft);
    } else {
      // Default navigation to draft detail screen
      router.push({
        pathname: '/(tabs)/command-center/draft-detail',
        params: { draft: JSON.stringify(draft) },
      });
    }
  };
  
  return (
    <Pressable onPress={handleCardPress} disabled={isProcessing}>
      <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm max-w-full">
        {/* Header */}
        <View 
          className="px-4 py-3 flex-row items-center"
          style={{ backgroundColor: typeColor + '15' }}
        >
          <View 
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: typeColor + '25' }}
          >
            <MaterialCommunityIcons name={typeIcon as any} size={20} color={typeColor} />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-sm text-gray-500">{typeName}</Text>
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {draft.title}
            </Text>
          </View>
          <View 
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: typeColor + '20' }}
          >
            <Text className="text-xs font-medium" style={{ color: typeColor }}>
              {Math.round(draft.confidence * 100)}% confident
            </Text>
          </View>
        </View>
        
        {/* Content */}
        <View className="px-4 py-3">
          {draft.description && (
            <Text className="text-gray-600 text-sm mb-3" numberOfLines={3}>
              {draft.description}
            </Text>
          )}
          
          {/* Draft-specific fields */}
          <DraftFields draft={draft.draft} />
          
          {/* AI Reasoning */}
          {draft.reasoning && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <View className="flex-row items-center mb-1">
                <MaterialCommunityIcons name="lightbulb-outline" size={14} color="#8B5CF6" />
                <Text className="text-xs font-medium text-purple-600 ml-1">AI Reasoning</Text>
              </View>
              <Text className="text-xs text-gray-500" numberOfLines={2}>{draft.reasoning}</Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions - Simplified for new flow */}
        <View className="px-4 py-3 border-t border-gray-100 flex-row gap-2">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onReject?.();
            }}
            disabled={isProcessing}
            className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
          >
            <Text className="text-gray-600 font-medium">Reject</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleCardPress}
            disabled={isProcessing}
            className="flex-1 rounded-xl py-3 items-center flex-row justify-center"
            style={{ backgroundColor: typeColor }}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={18} color="white" />
                <Text className="text-white font-semibold ml-1">Create</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Tap for more options hint */}
        <View className="px-4 pb-3 flex-row items-center justify-center">
          <MaterialCommunityIcons name="gesture-tap" size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs ml-1">Tap card for more options</Text>
        </View>
      </View>
    </Pressable>
  );
}

// Draft-specific fields display
function DraftFields({ draft }: { draft: any }) {
  if (!draft) return null;
  
  const fields: Array<{ icon: string; label: string; value: string }> = [];
  
  if (draft.type === 'TASK') {
    if (draft.dueDate) fields.push({ icon: 'calendar', label: 'Due', value: formatDate(draft.dueDate) });
    if (draft.priority) fields.push({ icon: 'flag', label: 'Priority', value: draft.priority });
    if (draft.estimatedMinutes) fields.push({ icon: 'clock-outline', label: 'Time', value: `${draft.estimatedMinutes}min` });
  } else if (draft.type === 'CHALLENGE') {
    if (draft.challengeType) fields.push({ icon: 'repeat', label: 'Type', value: draft.challengeType });
    if (draft.targetDays) fields.push({ icon: 'calendar-range', label: 'Duration', value: `${draft.targetDays} days` });
  } else if (draft.type === 'EVENT') {
    if (draft.startTime) fields.push({ icon: 'clock', label: 'Time', value: formatDateTime(draft.startTime) });
    if (draft.location) fields.push({ icon: 'map-marker', label: 'Location', value: draft.location });
  } else if (draft.type === 'BILL') {
    if (draft.amount) fields.push({ icon: 'currency-usd', label: 'Amount', value: `$${draft.amount}` });
    if (draft.dueDate) fields.push({ icon: 'calendar', label: 'Due', value: formatDate(draft.dueDate) });
  }
  
  if (fields.length === 0) return null;
  
  return (
    <View className="flex-row flex-wrap gap-3">
      {fields.map((f, i) => (
        <View key={i} className="flex-row items-center">
          <MaterialCommunityIcons name={f.icon as any} size={14} color="#6B7280" />
          <Text className="text-xs text-gray-500 ml-1">{f.label}:</Text>
          <Text className="text-xs font-medium text-gray-700 ml-1">{f.value}</Text>
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// Clarification Card
// ============================================================================

function ClarificationCard({ clarification }: { clarification: ChatMessageType['clarification'] }) {
  if (!clarification) return null;
  
  return (
    <View className="bg-amber-50 rounded-2xl rounded-tl-sm p-4 border border-amber-200">
      <View className="flex-row items-center mb-3">
        <MaterialCommunityIcons name="help-circle-outline" size={20} color="#F59E0B" />
        <Text className="text-amber-800 font-semibold ml-2">Need a bit more info</Text>
      </View>
      <Text className="text-amber-700 text-sm mb-2">
        Question {clarification.questionCount} of {clarification.maxQuestions}
      </Text>
      {clarification.questions.map((q) => (
        <View key={q.id} className="mb-2">
          <Text className="text-gray-800">{q.question}</Text>
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// System Message
// ============================================================================

function SystemMessage({ message }: { message: ChatMessageType }) {
  const isSuccess = message.content.includes('✅');
  const isError = message.content.includes('⚠️') || message.content.includes('❌');
  
  const bgColor = isSuccess ? 'bg-green-100' : isError ? 'bg-red-100' : 'bg-gray-200';
  const textColor = isSuccess ? 'text-green-700' : isError ? 'text-red-700' : 'text-gray-600';
  
  return (
    <View className="items-center my-3 px-4">
      <View className={`${bgColor} rounded-full px-4 py-2`}>
        <Text className={`text-sm ${textColor}`}>{message.content}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getAttachmentIcon(type: string): any {
  switch (type) {
    case 'image': return 'image';
    case 'audio': return 'microphone';
    case 'pdf': return 'file-pdf-box';
    case 'document': return 'file-document';
    default: return 'file';
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export default ChatMessage;
