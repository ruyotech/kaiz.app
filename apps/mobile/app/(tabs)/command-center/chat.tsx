/**
 * CommandCenterChat - AI-powered conversation screen
 * 
 * This screen allows users to chat with the AI to create tasks, challenges,
 * events, etc. The AI processes input and returns a draft preview that
 * the user can approve, edit, or reject.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { ChatInput, Attachment } from '../../../components/chat/ChatInput';
import { DraftPreviewCard } from '../../../components/chat/DraftPreviewCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { commandCenterApi, CommandInputAttachment } from '../../../services/api';
import {
    ChatMessage,
    CommandCenterAIResponse,
    getDraftTitle,
    getDraftTypeDisplayName,
} from '../../../types/commandCenter.types';

// ============================================================================
// Message Bubble Components
// ============================================================================

interface UserMessageProps {
    message: ChatMessage;
}

function UserMessage({ message }: UserMessageProps) {
    return (
        <View className="flex-row justify-end mb-3 px-4">
            <View className="max-w-[85%] bg-blue-600 rounded-2xl rounded-br-sm px-4 py-3">
                <Text className="text-white text-base">{message.content}</Text>
                {message.attachments && message.attachments.length > 0 && (
                    <View className="mt-2 pt-2 border-t border-blue-500">
                        {message.attachments.map((att, i) => (
                            <View key={i} className="flex-row items-center">
                                <MaterialCommunityIcons 
                                    name={att.type === 'image' ? 'image' : att.type === 'audio' ? 'microphone' : 'file-document'} 
                                    size={14} 
                                    color="rgba(255,255,255,0.8)" 
                                />
                                <Text className="text-blue-100 text-xs ml-1" numberOfLines={1}>
                                    {att.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
                <Text className="text-blue-200 text-xs mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </View>
    );
}

interface AIMessageProps {
    message: ChatMessage;
    onApprove: () => void;
    onEdit: () => void;
    onReject: () => void;
    isLoading?: boolean;
}

function AIMessage({ message, onApprove, onEdit, onReject, isLoading }: AIMessageProps) {
    return (
        <View className="mb-3 px-4">
            {/* AI Avatar and Label */}
            <View className="flex-row items-center mb-2">
                <View className="w-7 h-7 bg-purple-100 rounded-full items-center justify-center">
                    <MaterialCommunityIcons name="robot" size={16} color="#8B5CF6" />
                </View>
                <Text className="text-xs font-medium text-purple-600 ml-2">Kaiz AI</Text>
            </View>
            
            {/* Message or Draft Card */}
            <View className="ml-9">
                {message.isLoading ? (
                    <View className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                        <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="#8B5CF6" />
                            <Text className="text-gray-600 ml-2">Thinking...</Text>
                        </View>
                    </View>
                ) : message.draft ? (
                    <DraftPreviewCard
                        response={message.draft}
                        onApprove={onApprove}
                        onEdit={onEdit}
                        onReject={onReject}
                        isLoading={isLoading}
                    />
                ) : (
                    <View className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                        <Text className="text-gray-800 text-base">{message.content}</Text>
                        <Text className="text-gray-400 text-xs mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

function SystemMessage({ message }: { message: ChatMessage }) {
    return (
        <View className="items-center my-3 px-4">
            <View className="bg-gray-200 rounded-full px-4 py-1">
                <Text className="text-xs text-gray-600">{message.content}</Text>
            </View>
        </View>
    );
}

// ============================================================================
// Main Screen
// ============================================================================

export default function CommandCenterChatScreen() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    
    // Messages state
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            type: 'ai',
            content: "Hi! I'm Kaiz AI. Tell me what you'd like to create - a task, challenge, event, or anything else. You can also share images, files, or voice messages!",
            timestamp: new Date(),
        },
    ]);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    // Convert ChatInput attachment to API attachment format
    const convertAttachment = (att: Attachment): CommandInputAttachment => ({
        type: att.type === 'audio' ? 'voice' : att.type,
        uri: att.uri,
        name: att.name,
        mimeType: att.mimeType,
    });

    // Handle sending a message
    const handleSend = useCallback(async (text: string, attachments: Attachment[]) => {
        if (!text.trim() && attachments.length === 0) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: text || '(attachment)',
            timestamp: new Date(),
            attachments: attachments.map(a => ({
                name: a.name,
                type: a.type,
                mimeType: a.mimeType,
                size: a.size,
            })),
        };
        
        // Add loading AI message
        const loadingMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: '',
            timestamp: new Date(),
            isLoading: true,
        };

        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setIsProcessing(true);

        try {
            // Call AI API
            const response = await commandCenterApi.processWithAI(
                text || null,
                attachments.map(convertAttachment)
            );

            if (response.success && response.data) {
                const aiResponse = response.data;
                setCurrentDraftId(aiResponse.id);

                // Replace loading message with draft preview
                const draftMessage: ChatMessage = {
                    id: loadingMessage.id,
                    type: 'ai',
                    content: '',
                    timestamp: new Date(),
                    draft: aiResponse,
                };

                setMessages(prev => 
                    prev.map(m => m.id === loadingMessage.id ? draftMessage : m)
                );
            } else {
                // Show error message
                const errorMessage: ChatMessage = {
                    id: loadingMessage.id,
                    type: 'ai',
                    content: `Sorry, I couldn't process that. ${response.error || 'Please try again.'}`,
                    timestamp: new Date(),
                };

                setMessages(prev => 
                    prev.map(m => m.id === loadingMessage.id ? errorMessage : m)
                );
            }
        } catch (error: any) {
            console.error('Error processing message:', error);
            
            // Show error message
            const errorMessage: ChatMessage = {
                id: loadingMessage.id,
                type: 'ai',
                content: "Sorry, something went wrong. Please try again.",
                timestamp: new Date(),
            };

            setMessages(prev => 
                prev.map(m => m.id === loadingMessage.id ? errorMessage : m)
            );
        } finally {
            setIsProcessing(false);
        }
    }, []);

    // Handle draft approval
    const handleApprove = useCallback(async () => {
        if (!currentDraftId) return;
        
        setIsProcessing(true);
        try {
            const response = await commandCenterApi.approveDraft(currentDraftId);
            
            if (response.success) {
                // Find the draft to get its type for the success message
                const draftMessage = messages.find(m => m.draft?.id === currentDraftId);
                const draftType = draftMessage?.draft?.intentDetected;
                const draftTitle = draftMessage?.draft ? getDraftTitle(draftMessage.draft.draft) : 'Item';
                const displayType = draftType ? getDraftTypeDisplayName(draftType) : 'Item';

                // Add success message
                const successMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `✅ ${displayType} "${draftTitle}" created successfully!`,
                    timestamp: new Date(),
                };

                setMessages(prev => [...prev, successMessage]);
                setCurrentDraftId(null);

                // Show success alert
                Alert.alert(
                    'Success!',
                    `Your ${displayType.toLowerCase()} has been created.`,
                    [
                        { text: 'Create Another', style: 'cancel' },
                        { text: 'View', onPress: () => router.back() },
                    ]
                );
            } else {
                const errorMsg = typeof response.error === 'string' 
                    ? response.error 
                    : response.error?.message || 'Failed to create. Please try again.';
                Alert.alert('Error', errorMsg);
            }
        } catch (error) {
            console.error('Error approving draft:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    }, [currentDraftId, messages, router]);

    // Handle draft edit
    const handleEdit = useCallback(() => {
        // TODO: Navigate to edit screen with draft data
        Alert.alert(
            'Edit Draft',
            'This will open the edit form with pre-filled data from the AI draft.',
            [{ text: 'OK' }]
        );
    }, []);

    // Handle draft rejection
    const handleReject = useCallback(async () => {
        if (!currentDraftId) return;

        setIsProcessing(true);
        try {
            const response = await commandCenterApi.rejectDraft(currentDraftId);
            
            if (response.success) {
                // Add rejection message
                const rejectMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: 'Draft discarded. Feel free to try again with different wording.',
                    timestamp: new Date(),
                };

                setMessages(prev => [...prev, rejectMessage]);
                setCurrentDraftId(null);
            } else {
                const errorMsg = typeof response.error === 'string' 
                    ? response.error 
                    : response.error?.message || 'Failed to reject draft.';
                Alert.alert('Error', errorMsg);
            }
        } catch (error) {
            console.error('Error rejecting draft:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    }, [currentDraftId]);

    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="AI Assistant"
                subtitle="Create with natural language"
                showBack
                useSafeArea={false}
            />

            <KeyboardAvoidingView 
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Messages */}
                <ScrollView 
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerStyle={{ paddingVertical: 16 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {messages.map((message) => {
                        switch (message.type) {
                            case 'user':
                                return <UserMessage key={message.id} message={message} />;
                            case 'ai':
                            case 'draft':
                                return (
                                    <AIMessage 
                                        key={message.id} 
                                        message={message}
                                        onApprove={handleApprove}
                                        onEdit={handleEdit}
                                        onReject={handleReject}
                                        isLoading={isProcessing}
                                    />
                                );
                            case 'system':
                                return <SystemMessage key={message.id} message={message} />;
                            default:
                                return null;
                        }
                    })}
                </ScrollView>

                {/* Input */}
                <ChatInput
                    onSend={handleSend}
                    placeholder="Describe what you want to create..."
                    disabled={isProcessing}
                />
            </KeyboardAvoidingView>
        </Container>
    );
}
