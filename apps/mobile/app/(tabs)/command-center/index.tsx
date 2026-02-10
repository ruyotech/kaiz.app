import { logger } from '../../../utils/logger';
/**
 * Command Center Screen
 * 
 * AI-powered conversation interface for creating tasks, challenges, events, etc.
 * - Supports text, image, voice, and file inputs
 * - Uses admin-configured LLM providers and system prompts
 * - Test attachments available for simulator testing
 * - Drafts are created as pending for user approval
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { ChatMessage, TestAttachmentPicker } from '../../../components/command-center';
import { commandCenterApi } from '../../../services/api';
import { useThemeContext } from '../../../providers/ThemeProvider';
import {
  ChatMessage as ChatMessageType,
  SmartInputAttachment,
  TestAttachment,
  DraftPreview,
  DraftType,
  getDraftTitle,
  getDraftTypeDisplayName,
} from '../../../types/commandCenter';

// ============================================================================
// Types
// ============================================================================

interface PendingAttachment {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'pdf' | 'document';
  mimeType: string;
  uri: string;
  size?: number;
  testAttachmentId?: string;
}

// ============================================================================
// Main Screen
// ============================================================================

export default function CommandCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors } = useThemeContext();
  const params = useLocalSearchParams<{ clearChat?: string }>();
  
  // =========================================================================
  // State
  // =========================================================================
  
  const initialMessage: ChatMessageType = {
    id: '1',
    role: 'assistant',
    content: "Hey! I'm your SensAI assistant. Tell me what you'd like to create - a task, challenge, event, or anything else. You can also send images, files, or voice notes!",
    timestamp: new Date(),
  };
  
  const [messages, setMessages] = useState<ChatMessageType[]>([initialMessage]);
  
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Input options modal
  const [showInputOptions, setShowInputOptions] = useState(false);
  const [showTestAttachments, setShowTestAttachments] = useState(false);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const recordingScale = useSharedValue(1);

  const recordingAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recordingScale.value }],
  }));

  // Test mode state (for simulator testing)
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [testAttachments, setTestAttachments] = useState<TestAttachment[]>([]);

  // Pending drafts state (for header badge)
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  
  // =========================================================================
  // Effects
  // =========================================================================

  // Handle clearChat navigation parameter - resets conversation for fresh start
  useFocusEffect(
    useCallback(() => {
      if (params.clearChat === 'true') {
        // Reset to initial state for fresh conversation
        setMessages([{
          id: Date.now().toString(),
          role: 'assistant',
          content: "Great! What would you like to create next? I can help with tasks, challenges, events, and more!",
          timestamp: new Date(),
        }]);
        setInputText('');
        setAttachments([]);
        setCurrentDraftId(null);
        setCurrentSessionId(null);
        // Clear the param to prevent re-triggering
        router.setParams({ clearChat: undefined });
      }
    }, [params.clearChat])
  );

  // Fetch pending tasks count for badge (uses same API as pending screen)
  const fetchPendingTasksCount = useCallback(async () => {
    try {
      const response = await commandCenterApi.getPendingApprovalTasks();
      if (response.success && response.data) {
        setPendingTasksCount(response.data.length);
      }
    } catch (error) {
      logger.error('Failed to fetch pending tasks count:', error);
    }
  }, []);

  // Refresh count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPendingTasksCount();
    }, [fetchPendingTasksCount])
  );

  // Fetch test attachments when test mode is enabled
  useEffect(() => {
    if (testModeEnabled && testAttachments.length === 0) {
      logger.log('[TestMode] Fetching test attachments...');
      commandCenterApi.getTestAttachments().then(response => {
        logger.log('[TestMode] Test attachments response:', JSON.stringify(response));
        if (response.success && response.data) {
          logger.log('[TestMode] Loaded', response.data.length, 'test attachments');
          setTestAttachments(response.data);
        } else {
          logger.log('[TestMode] No test attachments found or error');
        }
      });
    }
  }, [testModeEnabled, testAttachments.length]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Recording animation
  useEffect(() => {
    if (isRecording) {
      recordingScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
      );
    } else {
      cancelAnimation(recordingScale);
      recordingScale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording]);

  // =========================================================================
  // Message Handlers
  // =========================================================================

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    logger.log('[SendMessage] Called with text:', text, 'attachments:', attachments.length);
    logger.log('[SendMessage] Attachments details:', JSON.stringify(attachments));
    if (!text && attachments.length === 0) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: text || 'Attachment',
      timestamp: new Date(),
      attachments: attachments.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        mimeType: a.mimeType,
        uri: a.uri,
        size: a.size,
        testAttachmentId: a.testAttachmentId,
      })),
    };

    // Add thinking message
    const thinkingMessage: ChatMessageType = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isThinking: true,
    };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInputText('');
    setAttachments([]);
    setIsProcessing(true);

    try {
      let response;
      
      // Check if we have real file attachments (not test attachments)
      const realFileAttachments = attachments.filter(a => a.uri && !a.testAttachmentId);
      const testAttachments = attachments.filter(a => a.testAttachmentId);
      
      if (realFileAttachments.length > 0) {
        // Use multipart upload for real files (enables OCR/transcription)
        logger.log('[SendMessage] Using multipart upload for', realFileAttachments.length, 'files');
        response = await commandCenterApi.sendMessageWithFiles(
          text || null,
          realFileAttachments.map(a => ({
            uri: a.uri,
            name: a.name,
            mimeType: a.mimeType,
          })),
          currentSessionId || undefined
        );
      } else {
        // Use JSON API for text-only or test attachments
        const apiAttachments: SmartInputAttachment[] = testAttachments.map(a => ({
          type: a.type,
          uri: a.uri,
          mimeType: a.mimeType,
          name: a.name,
          testAttachmentId: a.testAttachmentId,
        }));

        response = await commandCenterApi.sendMessage(
          text || null,
          apiAttachments,
          currentSessionId || undefined
        );
      }

      if (response.success && response.data) {
        const aiResponse = response.data as any;
        logger.log('[AI Response] Raw:', JSON.stringify(aiResponse, null, 2));
        
        // Handle both /smart-input (sessionId) and /process (id) response formats
        const responseId = aiResponse.sessionId || aiResponse.id;
        setCurrentSessionId(responseId);

        // Transform backend response to frontend DraftPreview structure
        // /smart-input returns: { sessionId, status, intentDetected, confidenceScore, draft: {type, title, ...}, ... }
        // /process returns: { id, status, intentDetected, confidenceScore, draft: {type, title, ...}, ... }
        let draftPreview: DraftPreview | undefined = undefined;
        if (aiResponse.draft && (aiResponse.status === 'READY' || aiResponse.status === 'PENDING_APPROVAL' || aiResponse.draft)) {
          const rawDraft = aiResponse.draft;
          // Normalize draft type to uppercase
          const rawType = rawDraft?.type || '';
          const normalizedType = rawType.toUpperCase() || 'TASK';
          // Use intentDetected first (backend sets this), fallback to draft type
          const draftType = (aiResponse.intentDetected || normalizedType) as 'TASK' | 'EVENT' | 'CHALLENGE' | 'BILL' | 'NOTE' | 'EPIC' | 'GOAL';
          
          logger.log('[Draft] rawType:', rawType, 'intentDetected:', aiResponse.intentDetected, 'final draftType:', draftType);
          
          // Transform backend fields to frontend format, preserving all original fields
          const transformedDraft = {
            ...rawDraft,
            type: normalizedType, // Ensure type is uppercase
            // Keep backend IDs for proper mapping
            lifeWheelAreaId: rawDraft.lifeWheelAreaId,
            eisenhowerQuadrantId: rawDraft.eisenhowerQuadrantId,
            storyPoints: rawDraft.storyPoints,
          };
          
          draftPreview = {
            id: responseId, // Use sessionId or id as draft ID - THIS IS CRITICAL
            draftType: draftType,
            status: 'PENDING_APPROVAL' as const,
            confidence: Number(aiResponse.confidenceScore) || 0.8,
            title: rawDraft.title || rawDraft.name || 'Untitled',
            description: rawDraft.description,
            draft: transformedDraft,
            reasoning: aiResponse.reasoning,
            suggestions: aiResponse.suggestions,
            expiresAt: aiResponse.expiresAt,
            createdAt: new Date().toISOString(),
          };
          
          logger.log('[DraftPreview] Created with id:', draftPreview.id);
          setCurrentDraftId(responseId);
          // Refresh pending drafts
          fetchPendingTasksCount();
        }

        // Replace thinking with response
        const aiMessage: ChatMessageType = {
          id: thinkingMessage.id,
          role: 'assistant',
          content: aiResponse.reasoning || aiResponse.message || 'Here\'s what I understood:',
          timestamp: new Date(),
          draft: draftPreview,
          clarification: aiResponse.clarificationFlow || aiResponse.clarification,
        };

        setMessages(prev =>
          prev.map(m => (m.id === thinkingMessage.id ? aiMessage : m))
        );
      } else {
        // Error message
        const errorMessage: ChatMessageType = {
          id: thinkingMessage.id,
          role: 'assistant',
          content: `Sorry, something went wrong: ${response.error || 'Unknown error'}`,
          timestamp: new Date(),
        };

        setMessages(prev =>
          prev.map(m => (m.id === thinkingMessage.id ? errorMessage : m))
        );
      }
    } catch (error: unknown) {
      logger.error('Error sending message:', error);

      const errorMessage: ChatMessageType = {
        id: thinkingMessage.id,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev =>
        prev.map(m => (m.id === thinkingMessage.id ? errorMessage : m))
      );
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, attachments, currentSessionId, fetchPendingTasksCount]);

  // =========================================================================
  // Draft Actions
  // =========================================================================

  const handleApprove = useCallback(async () => {
    if (!currentDraftId) return;

    setIsProcessing(true);
    try {
      const response = await commandCenterApi.approveDraft(currentDraftId);

      if (response.success) {
        const draftMessage = messages.find(m => m.draft?.id === currentDraftId);
        const draftType = draftMessage?.draft?.draftType;
        const title = draftMessage?.draft ? getDraftTitle(draftMessage.draft.draft) : 'Item';
        const displayType = draftType ? getDraftTypeDisplayName(draftType) : 'Item';

        // Success message
        const successMessage: ChatMessageType = {
          id: Date.now().toString(),
          role: 'system',
          content: `${displayType} "${title}" created successfully!`,
          timestamp: new Date(),
        };

        // Follow-up message
        const followUpMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Great! Your ${displayType.toLowerCase()} has been created. Would you like to create something else?`,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, successMessage, followUpMessage]);
        setCurrentDraftId(null);
        setCurrentSessionId(null);
        // Refresh pending drafts
        fetchPendingTasksCount();
      } else {
        Alert.alert('Error', String(response.error || 'Failed to create. Please try again.'));
      }
    } catch (error) {
      logger.error('Error approving draft:', error);
      Alert.alert('Error', 'Failed to create. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [currentDraftId, messages, fetchPendingTasksCount]);

  const handleReject = useCallback(async () => {
    if (!currentDraftId) return;

    setIsProcessing(true);
    try {
      await commandCenterApi.rejectDraft(currentDraftId);

      const rejectMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'system',
        content: 'Draft rejected',
        timestamp: new Date(),
      };

      const followUpMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "No problem! Tell me more about what you'd like to create, or try describing it differently.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, rejectMessage, followUpMessage]);
      setCurrentDraftId(null);
      // Refresh pending drafts
      fetchPendingTasksCount();
    } catch (error) {
      logger.error('Error rejecting draft:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentDraftId, fetchPendingTasksCount]);

  // Handler for when draft is confirmed via createPendingFromDraft (no approveDraft call needed)
  const handleConfirmed = useCallback((title: string, draftType: string) => {
    const displayType = getDraftTypeDisplayName(draftType as DraftType);
    
    // Success message
    const successMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'system',
      content: `${displayType} "${title}" saved to pending approval!`,
      timestamp: new Date(),
    };

    // Follow-up message
    const followUpMessage: ChatMessageType = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Your ${displayType.toLowerCase()} has been saved for review. Would you like to create something else?`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, successMessage, followUpMessage]);
    setCurrentDraftId(null);
    setCurrentSessionId(null);
    // Refresh pending drafts
    fetchPendingTasksCount();
  }, [fetchPendingTasksCount]);

  // =========================================================================
  // Attachment Handlers
  // =========================================================================

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachments(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name: asset.fileName || 'image.jpg',
          type: 'image',
          mimeType: asset.mimeType || 'image/jpeg',
          uri: asset.uri,
          size: asset.fileSize,
        },
      ]);
    }
    setShowInputOptions(false);
  }, []);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachments(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name: 'photo.jpg',
          type: 'image',
          mimeType: 'image/jpeg',
          uri: asset.uri,
        },
      ]);
    }
    setShowInputOptions(false);
  }, []);

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/*', 'application/msword'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setAttachments(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            name: asset.name,
            type: asset.mimeType?.includes('pdf') ? 'pdf' : 'document',
            mimeType: asset.mimeType || 'application/octet-stream',
            uri: asset.uri,
            size: asset.size,
          },
        ]);
      }
    } catch (error) {
      logger.error('Error picking document:', error);
    }
    setShowInputOptions(false);
  }, []);

  const handleTestAttachmentSelect = useCallback((testAttachment: TestAttachment) => {
    setAttachments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: testAttachment.attachmentName,
        type: testAttachment.attachmentType.toLowerCase() as any,
        mimeType: testAttachment.mimeType,
        uri: testAttachment.fileUrl || '',
        testAttachmentId: testAttachment.id,
      },
    ]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  // Handle + button press - auto-add test attachment if test mode is on
  const handlePlusPress = useCallback(async () => {
    logger.log('[TestMode] + pressed, testModeEnabled:', testModeEnabled);
    
    if (testModeEnabled) {
      // Fetch test attachment from web admin and add it
      logger.log('[TestMode] Fetching test attachment from web admin...');
      const response = await commandCenterApi.getTestAttachments();
      logger.log('[TestMode] Response:', JSON.stringify(response));
      
      if (response.success && response.data && response.data.length > 0) {
        const testAttachment = response.data[0];
        logger.log('[TestMode] Adding test attachment:', testAttachment.attachmentName);
        
        const newAttachment = {
          id: Date.now().toString(),
          name: testAttachment.attachmentName,
          type: testAttachment.attachmentType.toLowerCase() as any,
          mimeType: testAttachment.mimeType,
          uri: testAttachment.fileUrl || '',
          testAttachmentId: testAttachment.id,
        };
        
        setAttachments(prev => [...prev, newAttachment]);
        Alert.alert('Test Attachment Added', `File: ${testAttachment.attachmentName}`);
      } else {
        Alert.alert('No Test Attachments', 'Upload a test file in Web Admin first.');
      }
    } else {
      setShowInputOptions(!showInputOptions);
    }
  }, [testModeEnabled, showInputOptions]);

  // =========================================================================
  // Voice Recording
  // =========================================================================

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      logger.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        setAttachments(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            name: 'voice_note.m4a',
            type: 'audio',
            mimeType: 'audio/m4a',
            uri,
          },
        ]);
      }
    } catch (error) {
      logger.error('Failed to stop recording:', error);
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  }, [recording]);

  // =========================================================================
  // Header Components
  // =========================================================================

  const HeaderRightActions = () => (
    <View className="flex-row items-center">
      {/* Test Mode Toggle */}
      <Pressable
        onPress={() => setTestModeEnabled(!testModeEnabled)}
        className="mr-2"
      >
        <View 
          className="w-9 h-9 rounded-full items-center justify-center" 
          style={{ 
            backgroundColor: testModeEnabled ? '#8B5CF620' : colors.card, 
            borderWidth: 1, 
            borderColor: testModeEnabled ? '#8B5CF6' : colors.border 
          }}
        >
          <MaterialCommunityIcons 
            name="test-tube" 
            size={18} 
            color={testModeEnabled ? '#8B5CF6' : colors.textSecondary} 
          />
        </View>
      </Pressable>
      {/* Pending Approval */}
      <Pressable
        onPress={() => {
          router.push('/(tabs)/command-center/pending');
        }}
        className="relative mr-2"
      >
        <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
          <MaterialCommunityIcons name="clock-check-outline" size={20} color={colors.primary} />
        </View>
        {pendingTasksCount > 0 && (
          <View className="absolute -top-1 -right-1 min-w-5 h-5 bg-orange-500 rounded-full items-center justify-center px-1">
            <Text className="text-white text-xs font-bold">
              {pendingTasksCount > 9 ? '9+' : pendingTasksCount}
            </Text>
          </View>
        )}
      </Pressable>
      {/* Close Button */}
      <Pressable onPress={() => router.back()}>
        <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
          <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
        </View>
      </Pressable>
    </View>
  );

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <Container safeArea={false}>
      <ScreenHeader
        title="Command Center"
        subtitle={testModeEnabled ? "Test mode ON - + adds test file" : "AI-powered quick input"}
        showBack={false}
        useSafeArea={false}
        showNotifications={false}
        rightAction={<HeaderRightActions />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onDraftApprove={message.draft?.id === currentDraftId ? handleApprove : undefined}
              onDraftReject={message.draft?.id === currentDraftId ? handleReject : undefined}
              onDraftConfirmed={message.draft?.id === currentDraftId ? handleConfirmed : undefined}
              isProcessing={isProcessing}
            />
          ))}
        </ScrollView>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {attachments.map((att) => (
                <View key={att.id} className="mr-2 relative">
                  <View className="bg-blue-100 rounded-xl px-3 py-2 flex-row items-center">
                    <MaterialCommunityIcons
                      name={
                        att.type === 'image' ? 'image' :
                        att.type === 'audio' ? 'microphone' :
                        att.type === 'pdf' ? 'file-pdf-box' : 'file-document'
                      }
                      size={16}
                      color="#3B82F6"
                    />
                    <Text className="text-blue-700 text-sm ml-2 max-w-24" numberOfLines={1}>
                      {att.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeAttachment(att.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                  >
                    <MaterialCommunityIcons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View
          className="border-t border-gray-200 bg-white px-4 py-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row items-end gap-2">
            {/* Attachment Button */}
            <TouchableOpacity
              onPress={handlePlusPress}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: testModeEnabled ? '#8B5CF620' : '#F3F4F6' }}
            >
              <MaterialCommunityIcons
                name={testModeEnabled ? 'test-tube' : (showInputOptions ? 'close' : 'plus')}
                size={24}
                color={testModeEnabled ? '#8B5CF6' : '#6B7280'}
              />
            </TouchableOpacity>

            {/* Text Input */}
            <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 max-h-32">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Describe what you want to create..."
                placeholderTextColor="#9CA3AF"
                multiline
                className="text-base text-gray-800"
                style={{ maxHeight: 100 }}
                editable={!isProcessing}
              />
            </View>

            {/* Send / Voice Button */}
            {inputText.trim() || attachments.length > 0 || testModeEnabled ? (
              <TouchableOpacity
                onPress={sendMessage}
                disabled={isProcessing || (!inputText.trim() && attachments.length === 0)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ 
                  backgroundColor: (inputText.trim() || attachments.length > 0) ? '#9333EA' : '#D1D5DB'
                }}
              >
                <MaterialCommunityIcons name="send" size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <Animated.View style={recordingAnimStyle}>
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isRecording ? 'bg-red-500' : 'bg-purple-600'
                  }`}
                >
                  <MaterialCommunityIcons
                    name={isRecording ? 'stop' : 'microphone'}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          {/* Input Options - only show when not in test mode */}
          {showInputOptions && !testModeEnabled && (
            <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
              <TouchableOpacity
                onPress={takePhoto}
                className="flex-1 bg-blue-50 rounded-xl py-3 items-center flex-row justify-center"
              >
                <MaterialCommunityIcons name="camera" size={20} color="#3B82F6" />
                <Text className="text-blue-600 font-medium ml-2">Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImage}
                className="flex-1 bg-green-50 rounded-xl py-3 items-center flex-row justify-center"
              >
                <MaterialCommunityIcons name="image" size={20} color="#10B981" />
                <Text className="text-green-600 font-medium ml-2">Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickDocument}
                className="flex-1 bg-orange-50 rounded-xl py-3 items-center flex-row justify-center"
              >
                <MaterialCommunityIcons name="file-document" size={20} color="#F97316" />
                <Text className="text-orange-600 font-medium ml-2">File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowInputOptions(false);
                  setShowTestAttachments(true);
                }}
                className="flex-1 bg-purple-50 rounded-xl py-3 items-center flex-row justify-center"
              >
                <MaterialCommunityIcons name="test-tube" size={20} color="#8B5CF6" />
                <Text className="text-purple-600 font-medium ml-2">Test</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Test Attachments Picker */}
      <TestAttachmentPicker
        visible={showTestAttachments}
        onClose={() => setShowTestAttachments(false)}
        onSelect={handleTestAttachmentSelect}
      />
    </Container>
  );
}
