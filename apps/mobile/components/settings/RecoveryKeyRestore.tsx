/**
 * RecoveryKeyRestore — Restore encryption from 24-word recovery mnemonic.
 *
 * Used when:
 * - User logs into a new device and master key is not in SecureStore
 * - User forgot password and reset it (needs to re-derive encryption)
 *
 * Flow:
 * 1. User enters 24-word recovery phrase
 * 2. Fetch the encrypted recovery blob from server
 * 3. Derive recovery wrapping key from mnemonic
 * 4. Unwrap master key from blob
 * 5. Store master key in SecureStore
 * 6. Re-wrap master key with current password (if available)
 *
 * @module components/settings/RecoveryKeyRestore
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useThemeContext } from '../../providers/ThemeProvider';
import { useEncryptionStore } from '../../services/encryption/encryptionStore';
import {
  deriveKeyFromMnemonic,
  unwrapMasterKey,
  wrapMasterKey,
  hashKey,
  keyToBase64,
} from '../../services/encryption/cryptoService';
import { encryptionApi } from '../../services/api';
import { logger } from '../../utils/logger';
import type { WrappedMasterKey } from '../../types/encryption.types';
import { ENCRYPTION_VERSION } from '../../types/encryption.types';

const TAG = 'RecoveryKeyRestore';
const WORD_COUNT = 24;

interface RecoveryKeyRestoreProps {
  visible: boolean;
  onClose: () => void;
  /** Called after master key is successfully restored */
  onRestored?: () => void;
}

export default function RecoveryKeyRestore({
  visible,
  onClose,
  onRestored,
}: RecoveryKeyRestoreProps) {
  const { colors } = useThemeContext();
  const setHasRecoveryKey = useEncryptionStore((s) => s.setHasRecoveryKey);

  // ── State ──────────────────────────────────────────────────────────────
  const [wordInputs, setWordInputs] = useState<string[]>(
    Array.from({ length: WORD_COUNT }, () => ''),
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // ── Reset on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setWordInputs(Array.from({ length: WORD_COUNT }, () => ''));
      setIsRestoring(false);
      setIsSuccess(false);
      setPasteMode(false);
      setPasteText('');
    }
  }, [visible]);

  // ── Word input handler ─────────────────────────────────────────────────
  const updateWord = useCallback((index: number, value: string) => {
    setWordInputs((prev) => {
      const updated = [...prev];
      updated[index] = value.toLowerCase().trim();
      return updated;
    });
  }, []);

  // ── Paste all words at once ────────────────────────────────────────────
  const handlePaste = useCallback(() => {
    const trimmed = pasteText.trim().toLowerCase();
    const pastedWords = trimmed.split(/\s+/);
    if (pastedWords.length !== WORD_COUNT) {
      Alert.alert(
        'Invalid Phrase',
        `Expected ${WORD_COUNT} words but found ${pastedWords.length}. Please check your recovery phrase.`,
      );
      return;
    }
    setWordInputs(pastedWords);
    setPasteMode(false);
    setPasteText('');
  }, [pasteText]);

  // ── Form validation ────────────────────────────────────────────────────
  const isFormComplete = useMemo(() => {
    return wordInputs.every((w) => w.trim().length > 0);
  }, [wordInputs]);

  const filledCount = useMemo(() => {
    return wordInputs.filter((w) => w.trim().length > 0).length;
  }, [wordInputs]);

  // ── Restore Handler ────────────────────────────────────────────────────
  const handleRestore = useCallback(async () => {
    if (!isFormComplete) return;

    setIsRestoring(true);
    try {
      const mnemonic = wordInputs.join(' ');

      // 1. Fetch the recovery blob from server
      logger.info(TAG, 'Fetching recovery blob from server…');
      const { recoveryBlob } = await encryptionApi.getRecoveryKey();
      if (!recoveryBlob) {
        throw new Error('No recovery key found on your account. Please contact support.');
      }

      // 2. Derive recovery wrapping key from mnemonic
      logger.info(TAG, 'Deriving recovery key from mnemonic…');
      const recoveryKey = deriveKeyFromMnemonic(mnemonic);

      // 3. Unwrap master key from recovery blob
      logger.info(TAG, 'Unwrapping master key…');
      const wrapped: WrappedMasterKey = {
        encryptedKey: recoveryBlob,
        version: ENCRYPTION_VERSION,
      };
      const masterKey = unwrapMasterKey(wrapped, recoveryKey);

      // 4. Store the master key in SecureStore via the encryption store
      // We use the initializeFromSecureStore path — first write the key manually
      const { keyToBase64: toB64 } = await import('../../services/encryption/cryptoService');
      const SecureStore = await import('expo-secure-store');
      const { ENCRYPTION_STORE_KEYS } = await import('../../types/encryption.types');

      await SecureStore.setItemAsync(ENCRYPTION_STORE_KEYS.MASTER_KEY, toB64(masterKey));

      // 5. Mark encryption as initialized
      const initialized = await useEncryptionStore.getState().initializeFromSecureStore();
      if (!initialized) {
        throw new Error('Failed to initialize encryption after recovery');
      }

      // 6. Re-wrap master key with current password and update server
      // (This will happen on next login — for now the key is in SecureStore)

      setHasRecoveryKey(true);
      setIsSuccess(true);
      logger.info(TAG, 'Recovery key restoration successful');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Recovery failed';
      logger.error(TAG, 'Recovery key restoration failed', error);

      if (message.includes('Decryption failed') || message.includes('authentication tag')) {
        Alert.alert(
          'Incorrect Recovery Phrase',
          'The recovery phrase you entered does not match. Please double-check each word and try again.',
        );
      } else {
        Alert.alert('Recovery Failed', message);
      }
    } finally {
      setIsRestoring(false);
    }
  }, [isFormComplete, wordInputs, setHasRecoveryKey]);

  // ── Handle Close ──────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (isSuccess) {
      onRestored?.();
    }
    // Clear sensitive data
    setWordInputs(Array.from({ length: WORD_COUNT }, () => ''));
    setPasteText('');
    onClose();
  }, [isSuccess, onClose, onRestored]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 pt-4 pb-3"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <MaterialCommunityIcons
              name={isSuccess ? 'check' : 'close'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            Restore Encryption
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          className="flex-1 px-5 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {isSuccess ? renderSuccess() : renderInput()}
        </ScrollView>
      </View>
    </Modal>
  );

  // ── Input Screen ───────────────────────────────────────────────────────
  function renderInput() {
    return (
      <View>
        {/* Icon */}
        <View className="items-center mb-5">
          <View
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: '#FEF3C7' }}
          >
            <MaterialCommunityIcons name="key-variant" size={32} color="#D97706" />
          </View>
        </View>

        <Text
          className="text-xl font-bold text-center mb-2"
          style={{ color: colors.text }}
        >
          Enter Recovery Phrase
        </Text>
        <Text
          className="text-sm text-center mb-5"
          style={{ color: colors.textSecondary }}
        >
          Enter your 24-word recovery phrase to restore access to your
          encrypted data on this device.
        </Text>

        {/* Progress indicator */}
        <View
          className="flex-row items-center justify-between mb-4 px-1"
        >
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {filledCount} of {WORD_COUNT} words entered
          </Text>
          <TouchableOpacity
            onPress={() => setPasteMode(!pasteMode)}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="content-paste"
              size={14}
              color="#3B82F6"
            />
            <Text className="text-xs font-medium ml-1" style={{ color: '#3B82F6' }}>
              {pasteMode ? 'Enter individually' : 'Paste all'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Paste mode */}
        {pasteMode ? (
          <View className="mb-5">
            <TextInput
              className="py-3 px-4 rounded-xl text-sm"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              multiline
              placeholder="Paste your 24-word recovery phrase here…"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={pasteText}
              onChangeText={setPasteText}
            />
            <TouchableOpacity
              onPress={handlePaste}
              disabled={!pasteText.trim()}
              className="mt-3 py-3 rounded-xl items-center"
              style={{
                backgroundColor: pasteText.trim() ? '#3B82F6' : '#93C5FD',
              }}
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-semibold">
                Apply Words
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Individual word inputs (2 columns) */
          <View
            className="rounded-2xl p-3 mb-5"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
          >
            <View className="flex-row flex-wrap">
              {Array.from({ length: WORD_COUNT }).map((_, index) => (
                <View key={index} className="w-1/2 px-1.5 mb-2.5">
                  <View className="flex-row items-center">
                    <Text
                      className="text-xs font-medium w-6 text-right mr-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      {index + 1}.
                    </Text>
                    <TextInput
                      className="flex-1 py-2 px-2.5 rounded-lg text-sm"
                      style={{
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: wordInputs[index] ? '#3B82F6' : colors.border,
                        color: colors.text,
                      }}
                      placeholder={`word ${index + 1}`}
                      placeholderTextColor={colors.textSecondary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={wordInputs[index]}
                      onChangeText={(text) => updateWord(index, text)}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Restore button */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={!isFormComplete || isRestoring}
          className="py-4 rounded-2xl items-center flex-row justify-center"
          style={{
            backgroundColor: isFormComplete && !isRestoring ? '#3B82F6' : '#93C5FD',
          }}
          activeOpacity={0.8}
        >
          {isRestoring ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-white text-base font-semibold ml-2">
                Restoring…
              </Text>
            </>
          ) : (
            <Text className="text-white text-base font-semibold">
              Restore Encryption
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // ── Success Screen ─────────────────────────────────────────────────────
  function renderSuccess() {
    return (
      <View className="items-center">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: '#D1FAE5' }}
        >
          <MaterialCommunityIcons name="check-circle" size={40} color="#10B981" />
        </View>

        <Text
          className="text-2xl font-bold text-center mb-3"
          style={{ color: colors.text }}
        >
          Encryption Restored!
        </Text>

        <Text
          className="text-base text-center leading-6 mb-8"
          style={{ color: colors.textSecondary }}
        >
          Your encryption key has been successfully restored on this device.
          All your data is now accessible.
        </Text>

        <TouchableOpacity
          onPress={handleClose}
          className="w-full py-4 rounded-2xl items-center"
          style={{ backgroundColor: '#10B981' }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
