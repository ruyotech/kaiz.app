/**
 * Command Center — AI Scrum Master Chat Screen
 *
 * Pure presentation layer (~200 lines).
 * All business logic lives in useCommandCenter hook.
 * State management → commandCenterStore (Zustand).
 *
 * Features:
 *  - Text / image / document / voice input via ChatInput
 *  - Streaming AI responses (SSE when enabled, REST fallback)
 *  - Draft preview, approve / reject / edit flow
 *  - Ceremony awareness (planning / standup / retro banner)
 *  - Pending drafts badge + navigation
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { ChatMessageBubble } from '../../../components/command-center/ChatMessageBubble';
import { CeremonyBanner } from '../../../components/command-center/CeremonyBanner';
import { ChatInputBar } from '../../../components/command-center/ChatInputBar';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useCommandCenterStore } from '../../../store/commandCenterStore';
import { useCommandCenter } from '../../../hooks/useCommandCenter';
import { commandCenterApi } from '../../../services/api';

// ============================================================================
// Main Screen
// ============================================================================

export default function CommandCenterScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors } = useThemeContext();

  // -- Hook: all business logic ------------------------------------------
  const {
    sendMessage,
    approveDraft,
    rejectDraft,
    editDraft,
    isProcessing,
  } = useCommandCenter();

  // -- Zustand store (presentation only) ---------------------------------
  const messages = useCommandCenterStore((s) => s.messages);
  const isStreaming = useCommandCenterStore((s) => s.isStreaming);
  const ceremonyContext = useCommandCenterStore((s) => s.ceremonyContext);
  const error = useCommandCenterStore((s) => s.error);
  const clearError = useCommandCenterStore((s) => s.clearError);
  const resetConversation = useCommandCenterStore((s) => s.resetConversation);

  // -- Local state (UI-only) ------------------------------------------------
  const [pendingCount, setPendingCount] = useState(0);

  // -- Seed initial greeting ------------------------------------------------
  useEffect(() => {
    if (messages.length === 0) {
      useCommandCenterStore.getState().loadMessages([
        {
          id: 'greeting-1',
          role: 'coach',
          content:
            "Hey! I'm your Scrum Master. Tell me what you'd like to create - a task, challenge, event, or anything else. You can also send images, files, or voice notes!",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // -- Auto-scroll on new messages ------------------------------------------
  useEffect(() => {
    const timer = setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    );
    return () => clearTimeout(timer);
  }, [messages.length, isStreaming]);

  // -- Fetch pending count on focus -----------------------------------------
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const drafts = await commandCenterApi.getPendingDrafts();
          setPendingCount(Array.isArray(drafts) ? drafts.length : 0);
        } catch {
          // silent - badge just won't show
        }
      })();
    }, []),
  );

  // -- Error toast ----------------------------------------------------------
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  // =========================================================================
  // Render helpers
  // =========================================================================

  const HeaderRight = React.memo(function HeaderRight() {
    return (
      <View className="flex-row items-center gap-3">
        {/* Pending drafts */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/command-center/pending')}
          className="relative"
        >
          <MaterialCommunityIcons
            name="clock-check-outline"
            size={24}
            color={colors.textSecondary}
          />
          {pendingCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {pendingCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {/* New conversation */}
        <TouchableOpacity onPress={resetConversation}>
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    );
  });

  // =========================================================================
  // JSX
  // =========================================================================

  return (
    <Container safeArea={false}>
      <ScreenHeader title="Scrum Master" rightAction={<HeaderRight />} />

      {ceremonyContext && (
        <CeremonyBanner
          ceremony={ceremonyContext}
          onExit={() => useCommandCenterStore.getState().setCeremonyContext(null)}
        />
      )}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              onDraftConfirm={
                msg.drafts?.[0]
                  ? () => approveDraft(msg.drafts![0])
                  : undefined
              }
              onDraftReject={
                msg.drafts?.[0]
                  ? () => rejectDraft(msg.drafts![0])
                  : undefined
              }
              onDraftEdit={
                msg.drafts?.[0]
                  ? () => editDraft(msg.drafts![0])
                  : undefined
              }
              isProcessing={isProcessing}
            />
          ))}
          {isStreaming && (
            <View className="flex-row items-center px-3 py-2">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                className="ml-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Thinking...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <ChatInputBar
          onSend={sendMessage}
          disabled={isProcessing}
          placeholder={
            ceremonyContext
              ? `Message during ${ceremonyContext.mode.toLowerCase()}...`
              : undefined
          }
        />
      </KeyboardAvoidingView>
    </Container>
  );
}
