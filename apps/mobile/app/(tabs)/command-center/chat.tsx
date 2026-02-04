/**
 * Command Center Chat Screen
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
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { ChatMessage, TestAttachmentPicker } from '../../../components/command-center';
import { commandCenterService } from '../../../services/commandCenter';
import {
  ChatMessage as ChatMessageType,
  SmartInputAttachment,
  TestAttachment,
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

export default function CommandCenterChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // =========================================================================
  // State
  // =========================================================================
  
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! I'm your Kaiz AI assistant. Tell me what you'd like to create - a task, challenge, event, or anything else. You can also send images, files, or voice notes!",
      timestamp: new Date(),
    },
  ]);
  
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
  const recordingAnimation = useRef(new Animated.Value(1)).current;
  
  // =========================================================================
  // Effects
  // =========================================================================
  
  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Recording animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      recordingAnimation.setValue(1);
    }
  }, [isRecording]);

  // =========================================================================
  // Message Handlers
  // =========================================================================

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text && attachments.length === 0) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: text || '📎 Attachment',
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
      // Convert attachments to API format
      const apiAttachments: SmartInputAttachment[] = attachments.map(a => ({
        type: a.type,
        uri: a.uri,
        mimeType: a.mimeType,
        name: a.name,
        testAttachmentId: a.testAttachmentId,
      }));

      // Send to AI
      const response = await commandCenterService.sendMessage(
        text || null,
        apiAttachments,
        currentSessionId || undefined
      );

      if (response.success && response.data) {
        const aiResponse = response.data as any; // Backend response structure differs from frontend types
        setCurrentSessionId(aiResponse.sessionId);

        // Transform backend response to frontend DraftPreview structure
        // Backend returns: { sessionId, status, intentDetected, confidenceScore, draft: {type, title, ...}, ... }
        // Frontend expects: { draft: { id, draftType, status, confidence, title, draft: {type, title, ...}, ... } }
        let draftPreview = null;
        if (aiResponse.draft && aiResponse.status === 'READY') {
          const rawDraft = aiResponse.draft;
          const draftType = (aiResponse.intentDetected || rawDraft.type?.toUpperCase() || 'TASK') as any;
          draftPreview = {
            id: aiResponse.sessionId, // Use sessionId as draft ID
            draftType: draftType,
            status: 'PENDING_APPROVAL' as const,
            confidence: aiResponse.confidenceScore || 0.8,
            title: rawDraft.title || rawDraft.name || 'Untitled',
            description: rawDraft.description,
            draft: rawDraft,
            reasoning: aiResponse.reasoning,
            suggestions: aiResponse.suggestions,
            expiresAt: aiResponse.expiresAt,
            createdAt: new Date().toISOString(),
          };
          setCurrentDraftId(aiResponse.sessionId);
        }

        // Replace thinking with response
        const aiMessage: ChatMessageType = {
          id: thinkingMessage.id,
          role: 'assistant',
          content: aiResponse.reasoning || 'Here\'s what I understood from your input:',
          timestamp: new Date(),
          draft: draftPreview,
          clarification: aiResponse.clarificationFlow,
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
    } catch (error: any) {
      console.error('Error sending message:', error);

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
  }, [inputText, attachments, currentSessionId]);

  // =========================================================================
  // Draft Actions
  // =========================================================================

  const handleApprove = useCallback(async () => {
    if (!currentDraftId) return;

    setIsProcessing(true);
    try {
      const response = await commandCenterService.approveDraft(currentDraftId);

      if (response.success) {
        const draftMessage = messages.find(m => m.draft?.id === currentDraftId);
        const draftType = draftMessage?.draft?.draftType;
        const title = draftMessage?.draft ? getDraftTitle(draftMessage.draft.draft) : 'Item';
        const displayType = draftType ? getDraftTypeDisplayName(draftType) : 'Item';

        // Success message
        const successMessage: ChatMessageType = {
          id: Date.now().toString(),
          role: 'system',
          content: `✅ ${displayType} "${title}" created successfully!`,
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
      } else {
        Alert.alert('Error', response.error || 'Failed to create. Please try again.');
      }
    } catch (error) {
      console.error('Error approving draft:', error);
      Alert.alert('Error', 'Failed to create. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [currentDraftId, messages]);

  const handleReject = useCallback(async () => {
    if (!currentDraftId) return;

    setIsProcessing(true);
    try {
      await commandCenterService.rejectDraft(currentDraftId);

      const rejectMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'system',
        content: '❌ Draft rejected',
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
    } catch (error) {
      console.error('Error rejecting draft:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentDraftId]);

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
      console.error('Error picking document:', error);
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
      console.error('Failed to start recording:', error);
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
      console.error('Failed to stop recording:', error);
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  }, [recording]);

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <Container safeArea={false}>
      <ScreenHeader
        title="AI Chat"
        subtitle="Create anything with natural language"
        showBack
        useSafeArea={false}
        showNotifications={false}
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
              onPress={() => setShowInputOptions(!showInputOptions)}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <MaterialCommunityIcons
                name={showInputOptions ? 'close' : 'plus'}
                size={24}
                color="#6B7280"
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
            {inputText.trim() || attachments.length > 0 ? (
              <TouchableOpacity
                onPress={sendMessage}
                disabled={isProcessing}
                className="w-10 h-10 bg-purple-600 rounded-full items-center justify-center"
              >
                <MaterialCommunityIcons name="send" size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <Animated.View style={{ transform: [{ scale: recordingAnimation }] }}>
                <TouchableOpacity
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
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

          {/* Input Options */}
          {showInputOptions && (
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
