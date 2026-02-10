import { logger } from '../../utils/logger';
/**
 * ChatMessage Component
 * Displays user and AI messages in the chat interface
 */

import React from 'react';
import { View, Text, ActivityIndicator, Pressable, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ChatMessage as ChatMessageType, DraftPreview, getDraftTypeDisplayName, getDraftTypeIcon, getDraftTypeColor } from '../../types/commandCenter';
import { commandCenterApi } from '../../services/api';

interface ChatMessageProps {
  message: ChatMessageType;
  onDraftApprove?: () => void;
  onDraftReject?: () => void;
  onDraftEdit?: () => void;
  onDraftPress?: (draft: DraftPreview) => void;
  onDraftConfirmed?: (title: string, draftType: string) => void; // Called after createPendingFromDraft succeeds (no approveDraft needed)
  isProcessing?: boolean;
}

export function ChatMessage({ 
  message, 
  onDraftApprove, 
  onDraftReject, 
  onDraftEdit,
  onDraftPress,
  onDraftConfirmed,
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
      onDraftConfirmed={onDraftConfirmed}
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
  onDraftConfirmed?: (title: string, draftType: string) => void;
  isProcessing?: boolean;
}

function AssistantMessage({ 
  message, 
  onDraftApprove, 
  onDraftReject, 
  onDraftEdit,
  onDraftPress,
  onDraftConfirmed,
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
            onConfirmed={onDraftConfirmed}
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
  onConfirmed?: (title: string, draftType: string) => void; // Called after createPendingFromDraft succeeds
  isProcessing?: boolean;
}

function DraftPreviewCard({ draft, onApprove, onReject, onEdit, onPress, onConfirmed, isProcessing }: DraftPreviewCardProps) {
  const router = useRouter();
  
  if (!draft) return null;
  
  const typeColor = getDraftTypeColor(draft.draftType);
  const typeIcon = getDraftTypeIcon(draft.draftType);
  const typeName = getDraftTypeDisplayName(draft.draftType);
  
  // Helper to parse time from text like "2:00 PM", "14:00", "2:00 PM – 2:30 PM"
  const extractTimeFromText = (text: string): { startTime: string; endTime: string; date: string } => {
    let startTime = '';
    let endTime = '';
    let date = '';
    
    if (!text) return { startTime, endTime, date };
    
    // Try to extract date - patterns like "Monday, January 26", "Jan 27, 2026"
    const dateMatch = text.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?[,\s]*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,?\s*\d{4})?/i);
    if (dateMatch) {
      try {
        const parsed = new Date(dateMatch[0] + ', 2026'); // Add year if missing
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split('T')[0];
        }
      } catch (e) {}
    }
    
    // Try to extract time range - patterns like "2:00 PM – 2:30 PM", "10:00 AM - 11:00 AM"
    const timeRangeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    if (timeRangeMatch) {
      startTime = convertTo24Hour(timeRangeMatch[1].trim());
      endTime = convertTo24Hour(timeRangeMatch[2].trim());
    } else {
      // Try single time - pattern like "2:00 PM", "at 10:00 AM"
      const singleTimeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
      if (singleTimeMatch) {
        startTime = convertTo24Hour(singleTimeMatch[1].trim());
      }
    }
    
    return { startTime, endTime, date };
  };
  
  // Convert "2:00 PM" to "14:00"
  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return '';
    const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return time12h;
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3]?.toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };
  
  // Build complete draft data object for passing to create screen
  // draft.draft contains the raw backend TaskDraft/EventDraft/etc object
  const buildDraftDataObject = () => {
    const draftDetails = draft.draft as any;
    
    logger.log('[ChatMessage] Building draft data:');
    logger.log('  - draft:', JSON.stringify(draft, null, 2));
    logger.log('  - draftDetails:', JSON.stringify(draftDetails, null, 2));
    
    // Parse date/time from various possible formats
    let dateStr = '';
    let startTimeStr = '';
    let endTimeStr = '';
    
    // FALLBACK: If AI returned TASK but title/description/reasoning contains time patterns,
    // extract them. This handles cases where AI misclassified a calendar screenshot.
    // Include reasoning since AI often puts date/time info there (e.g., "date (Monday, January 26), time (2:00 PM – 2:30 PM)")
    const titleDescReasoning = `${draft.title || ''} ${draft.description || ''} ${draftDetails?.description || ''} ${draft.reasoning || ''}`;
    const extractedFromText = extractTimeFromText(titleDescReasoning);
    if (extractedFromText.date || extractedFromText.startTime) {
      logger.log('[ChatMessage] Extracted time from text:', extractedFromText);
    }
    
    // For events, parse startTime which might be ISO datetime
    if (draftDetails?.startTime) {
      try {
        const startDate = new Date(draftDetails.startTime);
        if (!isNaN(startDate.getTime())) {
          dateStr = startDate.toISOString().split('T')[0]; // yyyy-MM-dd
          startTimeStr = startDate.toTimeString().slice(0, 5); // HH:mm
        }
      } catch (e) {
        // If not ISO, might be just time string
        startTimeStr = draftDetails.startTime;
      }
    }
    
    if (draftDetails?.endTime) {
      try {
        const endDate = new Date(draftDetails.endTime);
        if (!isNaN(endDate.getTime())) {
          endTimeStr = endDate.toTimeString().slice(0, 5); // HH:mm
        }
      } catch (e) {
        endTimeStr = draftDetails.endTime;
      }
    }
    
    // For tasks, use dueDate
    if (draftDetails?.dueDate && !dateStr) {
      dateStr = draftDetails.dueDate;
    }
    
    // Also check for direct date field
    if (draftDetails?.date && !dateStr) {
      dateStr = draftDetails.date;
    }
    
    // FALLBACK: Use extracted time from title/description if not found in draft fields
    if (!dateStr && extractedFromText.date) {
      dateStr = extractedFromText.date;
    }
    if (!startTimeStr && extractedFromText.startTime) {
      startTimeStr = extractedFromText.startTime;
    }
    if (!endTimeStr && extractedFromText.endTime) {
      endTimeStr = extractedFromText.endTime;
    }
    
    // Determine if this should be treated as an event (even if AI said TASK)
    const hasTimeData = startTimeStr || extractedFromText.startTime;
    const shouldBeEvent = draft.draftType === 'EVENT' || hasTimeData;
    
    const builtData = {
      title: draft.title || draftDetails?.title || '',
      description: draft.description || draftDetails?.description || '',
      taskType: shouldBeEvent ? 'EVENT' : 'TASK',
      dueDate: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      lifeWheelAreaId: draftDetails?.lifeWheelAreaId || 'lw-4',
      eisenhowerQuadrantId: draftDetails?.eisenhowerQuadrantId || 'eq-2',
      storyPoints: draftDetails?.storyPoints || 3,
      isAllDay: draftDetails?.isAllDay || false,
      location: draftDetails?.location || '',
      isRecurring: draftDetails?.isRecurring || false,
      aiReasoning: draft.reasoning || '',
      aiSummary: draft.description || draftDetails?.description || '',
      draftType: shouldBeEvent ? 'EVENT' : draft.draftType,
    };
    
    logger.log('  - builtData:', JSON.stringify(builtData, null, 2));
    return builtData;
  };
  
  // Save to pending approval list when Confirm is pressed
  // Uses createPendingFromDraft to avoid session expiration issues
  // Does NOT navigate - just saves and clears chat via onApprove callback
  const handleConfirm = async () => {
    try {
      const draftData = buildDraftDataObject();
      
      logger.log('[ChatMessage] Creating pending from draft data:', draftData.title);
      
      // Use createPendingFromDraft which sends data directly (no session needed)
      // Backend uses `date` for events and `dueDate` for tasks
      // Convert empty strings to undefined (backend expects null/undefined, not empty strings for dates)
      const response = await commandCenterApi.createPendingFromDraft({
        draftType: draft.draftType || 'TASK',
        title: draftData.title,
        description: draftData.description || undefined,
        dueDate: draftData.dueDate || undefined, // For tasks - must be yyyy-MM-dd or undefined
        date: draftData.dueDate || undefined, // For events - must be yyyy-MM-dd or undefined
        storyPoints: draftData.storyPoints,
        eisenhowerQuadrantId: draftData.eisenhowerQuadrantId,
        lifeWheelAreaId: draftData.lifeWheelAreaId,
        startTime: draftData.startTime || undefined, // Must be HH:mm or undefined
        endTime: draftData.endTime || undefined, // Must be HH:mm or undefined
        location: draftData.location || undefined,
        isAllDay: draftData.isAllDay,
      });
      
      logger.log('[ChatMessage] Create pending result:', JSON.stringify(response));
      
      if (response.success) {
        // Call onConfirmed callback to clear chat and show success message
        // Do NOT call onApprove - that would call approveDraft endpoint again
        if (onConfirmed) {
          onConfirmed(draftData.title, draft.draftType || 'TASK');
        }
      } else {
        Alert.alert('Error', String(response.error || 'Failed to save to pending'));
      }
    } catch (error: unknown) {
      logger.error('Error saving to pending:', error);
      Alert.alert('Error', 'Failed to save to pending. Please try again.');
    }
  };
  
  // Navigate to create-from-sensai screen when Create Task/Event is pressed
  const handleCreateTask = () => {
    const draftData = buildDraftDataObject();
    
    logger.log('[ChatMessage] Navigating to create-from-sensai with:', JSON.stringify(draftData, null, 2));
    
    router.push({
      pathname: '/(tabs)/command-center/create-from-sensai',
      params: {
        draftData: JSON.stringify(draftData),
        clearChat: 'true',
      },
    });
  };
  
  // Navigate to draft detail screen when card is pressed for more details
  const handleCardPress = () => {
    if (onPress) {
      onPress(draft);
    } else {
      // Navigate to create form as default action
      handleConfirm();
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
              {Math.round((draft.confidence ?? 0.8) * 100)}% confident
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
        
        {/* Quick Actions - 3 options: Reject, Confirm (to pending), Create Task */}
        <View className="px-4 py-3 border-t border-gray-100">
          {/* Top row: Reject and Confirm */}
          <View className="flex-row gap-2 mb-2">
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
              onPress={(e) => {
                e.stopPropagation?.();
                handleConfirm();
              }}
              disabled={isProcessing}
              className="flex-1 rounded-xl py-3 items-center flex-row justify-center"
              style={{ backgroundColor: typeColor }}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={18} color="white" />
                  <Text className="text-white font-semibold ml-1">Confirm</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Bottom row: Create Task/Event (full width) */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              handleCreateTask();
            }}
            disabled={isProcessing}
            className="w-full bg-green-600 rounded-xl py-3 items-center flex-row justify-center"
          >
            <MaterialCommunityIcons name="plus-circle" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">
              {/* Show Create Event if: AI says EVENT OR title/description contains time */}
              {draft.draftType === 'EVENT' || 
               /\d{1,2}:\d{2}\s*(AM|PM)?/i.test(`${draft.title} ${draft.description}`) 
                ? 'Create Event' 
                : 'Create Task'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tap for details hint */}
        <View className="px-4 pb-3 flex-row items-center justify-center">
          <MaterialCommunityIcons name="gesture-tap" size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs ml-1">Tap card to review details</Text>
        </View>
      </View>
    </Pressable>
  );
}

// Draft-specific fields display
function DraftFields({ draft }: { draft: any }) {
  if (!draft) return null;
  
  const fields: Array<{ icon: string; label: string; value: string }> = [];
  const draftType = (draft.type || '').toUpperCase();
  
  if (draftType === 'TASK') {
    if (draft.dueDate) fields.push({ icon: 'calendar', label: 'Due', value: formatDate(draft.dueDate) });
    if (draft.priority) fields.push({ icon: 'flag', label: 'Priority', value: draft.priority });
    if (draft.estimatedMinutes) fields.push({ icon: 'clock-outline', label: 'Time', value: `${draft.estimatedMinutes}min` });
  } else if (draftType === 'CHALLENGE') {
    if (draft.challengeType) fields.push({ icon: 'repeat', label: 'Type', value: draft.challengeType });
    if (draft.targetDays) fields.push({ icon: 'calendar-range', label: 'Duration', value: `${draft.targetDays} days` });
  } else if (draftType === 'EVENT') {
    if (draft.startTime) fields.push({ icon: 'clock', label: 'Time', value: formatDateTime(draft.startTime) });
    if (draft.location) fields.push({ icon: 'map-marker', label: 'Location', value: draft.location });
  } else if (draftType === 'BILL') {
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
  const isSuccess = message.content.includes('successfully') || message.content.includes('created') || message.content.includes('saved to pending');
  const isError = message.content.includes('rejected') || message.content.includes('error') || message.content.includes('failed');
  
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
