/**
 * RecoveryKeySetup — Zero-Knowledge Recovery Key Setup Modal
 *
 * Multi-step flow:
 * 1. Generate 24-word recovery mnemonic
 * 2. Show the words in a grid (user writes them down)
 * 3. Verify: user must confirm 3 randomly-selected words
 * 4. Encrypt master key with mnemonic-derived key → POST blob to server
 *
 * The server never sees the mnemonic — only the encrypted blob.
 *
 * @module components/settings/RecoveryKeySetup
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
import * as Clipboard from 'expo-clipboard';

import { useThemeContext } from '../../providers/ThemeProvider';
import { useEncryptionStore } from '../../services/encryption/encryptionStore';
import {
  generateRecoveryMnemonic,
  deriveKeyFromMnemonic,
  wrapMasterKey,
  keyToBase64,
} from '../../services/encryption/cryptoService';
import { getEncryptionKey } from '../../services/encryption/encryptionStore';
import { encryptionApi } from '../../services/api';
import { logger } from '../../utils/logger';

const TAG = 'RecoveryKeySetup';
const VERIFY_WORD_COUNT = 3;

type Step = 'intro' | 'display' | 'verify' | 'success';

interface RecoveryKeySetupProps {
  visible: boolean;
  onClose: () => void;
  /** Called after recovery key is successfully stored */
  onComplete?: () => void;
}

/**
 * Pick N random unique indices from 0..total-1
 */
function pickRandomIndices(total: number, count: number): number[] {
  const indices = new Set<number>();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * total));
  }
  return Array.from(indices).sort((a, b) => a - b);
}

export default function RecoveryKeySetup({
  visible,
  onClose,
  onComplete,
}: RecoveryKeySetupProps) {
  const { colors } = useThemeContext();
  const setHasRecoveryKey = useEncryptionStore((s) => s.setHasRecoveryKey);

  // ── State ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('intro');
  const [mnemonic, setMnemonic] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [verifyIndices, setVerifyIndices] = useState<number[]>([]);
  const [verifyInputs, setVerifyInputs] = useState<Record<number, string>>({});
  const [verifyErrors, setVerifyErrors] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Reset on open ──────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setStep('intro');
      setMnemonic('');
      setWords([]);
      setVerifyIndices([]);
      setVerifyInputs({});
      setVerifyErrors({});
      setIsSubmitting(false);
      setCopied(false);
    }
  }, [visible]);

  // ── Generate Mnemonic ──────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    const m = generateRecoveryMnemonic();
    const w = m.split(' ');
    setMnemonic(m);
    setWords(w);
    setVerifyIndices(pickRandomIndices(w.length, VERIFY_WORD_COUNT));
    setStep('display');
    logger.info(TAG, 'Recovery mnemonic generated');
  }, []);

  // ── Copy to clipboard ─────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [mnemonic]);

  // ── Proceed to verify ─────────────────────────────────────────────────
  const handleProceedToVerify = useCallback(() => {
    setVerifyInputs({});
    setVerifyErrors({});
    setStep('verify');
  }, []);

  // ── Verify Words & Submit ─────────────────────────────────────────────
  const handleVerifyAndSubmit = useCallback(async () => {
    // Validate inputs match the original words
    const errors: Record<number, boolean> = {};
    let hasError = false;

    for (const idx of verifyIndices) {
      const input = (verifyInputs[idx] || '').trim().toLowerCase();
      if (input !== words[idx].toLowerCase()) {
        errors[idx] = true;
        hasError = true;
      }
    }

    setVerifyErrors(errors);
    if (hasError) {
      Alert.alert(
        'Incorrect Words',
        'One or more words don\'t match. Please check your recovery phrase and try again.',
      );
      return;
    }

    // All words correct — encrypt master key and store on server
    setIsSubmitting(true);
    try {
      // Derive recovery wrapping key from mnemonic
      const recoveryKey = deriveKeyFromMnemonic(mnemonic);

      // Get current master key from SecureStore
      const masterKey = await getEncryptionKey();
      if (!masterKey) {
        throw new Error('No encryption key found — please log in again');
      }

      // Wrap master key with recovery-derived key
      const wrapped = wrapMasterKey(masterKey, recoveryKey);

      // Store the encrypted blob on the server
      await encryptionApi.storeRecoveryKey({
        recoveryBlob: wrapped.encryptedKey,
      });

      setHasRecoveryKey(true);
      setStep('success');
      logger.info(TAG, 'Recovery key stored successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to store recovery key';
      logger.error(TAG, 'Failed to store recovery key', error);
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [verifyIndices, verifyInputs, words, mnemonic, setHasRecoveryKey]);

  // ── Handle Close ──────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (step === 'success') {
      onComplete?.();
    }
    // Clear sensitive data from memory
    setMnemonic('');
    setWords([]);
    setVerifyInputs({});
    onClose();
  }, [step, onClose, onComplete]);

  // ── Verify form valid ─────────────────────────────────────────────────
  const isVerifyFormComplete = useMemo(() => {
    return verifyIndices.every(
      (idx) => (verifyInputs[idx] || '').trim().length > 0,
    );
  }, [verifyIndices, verifyInputs]);

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
              name={step === 'success' ? 'check' : 'close'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            Recovery Key
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          className="flex-1 px-5 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'intro' && renderIntro()}
          {step === 'display' && renderDisplay()}
          {step === 'verify' && renderVerify()}
          {step === 'success' && renderSuccess()}
        </ScrollView>
      </View>
    </Modal>
  );

  // ── STEP 1: Intro ─────────────────────────────────────────────────────
  function renderIntro() {
    return (
      <View>
        {/* Shield icon */}
        <View className="items-center mb-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center"
            style={{ backgroundColor: '#DBEAFE' }}
          >
            <MaterialCommunityIcons name="shield-key" size={40} color="#3B82F6" />
          </View>
        </View>

        <Text
          className="text-2xl font-bold text-center mb-3"
          style={{ color: colors.text }}
        >
          Set Up Recovery Key
        </Text>

        <Text
          className="text-base text-center leading-6 mb-8"
          style={{ color: colors.textSecondary }}
        >
          Your data is encrypted with a key only you have. If you lose access to your
          device or forget your password, a recovery key is the only way to restore
          your data.
        </Text>

        {/* Info cards */}
        <InfoCard
          icon="lock-outline"
          title="Zero-Knowledge Encryption"
          description="Your recovery key never leaves your device. We store an encrypted
          blob that only your recovery words can unlock."
          colors={colors}
        />
        <InfoCard
          icon="pencil-outline"
          title="Write It Down"
          description="You'll see 24 words. Write them on paper and store in a safe place.
          Do not save them digitally or share with anyone."
          colors={colors}
        />
        <InfoCard
          icon="alert-circle-outline"
          title="Cannot Be Recovered"
          description="If you lose both your password and recovery key, your encrypted
          data cannot be recovered. There is no backdoor."
          colors={colors}
        />

        {/* Generate button */}
        <TouchableOpacity
          onPress={handleGenerate}
          className="mt-6 py-4 rounded-2xl items-center"
          style={{ backgroundColor: '#3B82F6' }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold">
            Generate Recovery Key
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── STEP 2: Display Mnemonic ──────────────────────────────────────────
  function renderDisplay() {
    return (
      <View>
        <Text
          className="text-xl font-bold text-center mb-2"
          style={{ color: colors.text }}
        >
          Your Recovery Phrase
        </Text>
        <Text
          className="text-sm text-center mb-6"
          style={{ color: colors.textSecondary }}
        >
          Write these 24 words down in order. Store them safely offline.
        </Text>

        {/* Warning banner */}
        <View
          className="flex-row items-start p-3.5 rounded-xl mb-5"
          style={{ backgroundColor: '#FEF3C7' }}
        >
          <MaterialCommunityIcons name="alert" size={18} color="#D97706" />
          <Text className="text-xs flex-1 ml-2" style={{ color: '#92400E' }}>
            Anyone with these words can access your encrypted data.
            Never share them or store them in a digital note.
          </Text>
        </View>

        {/* Word grid (2 columns) */}
        <View
          className="rounded-2xl p-4 mb-5"
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
        >
          <View className="flex-row flex-wrap">
            {words.map((word, index) => (
              <View
                key={index}
                className="w-1/2 flex-row items-center py-2 px-2"
              >
                <Text
                  className="text-xs font-medium w-7 text-right mr-2"
                  style={{ color: colors.textSecondary }}
                >
                  {index + 1}.
                </Text>
                <View
                  className="flex-1 py-2 px-3 rounded-lg"
                  style={{ backgroundColor: colors.background }}
                >
                  <Text
                    className="text-sm font-mono font-medium"
                    style={{ color: colors.text }}
                  >
                    {word}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Copy button */}
        <TouchableOpacity
          onPress={handleCopy}
          className="flex-row items-center justify-center py-3 rounded-xl mb-5"
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={copied ? 'check-circle' : 'content-copy'}
            size={18}
            color={copied ? '#10B981' : colors.textSecondary}
          />
          <Text
            className="text-sm font-medium ml-2"
            style={{ color: copied ? '#10B981' : colors.textSecondary }}
          >
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </Text>
        </TouchableOpacity>

        {/* Continue button */}
        <TouchableOpacity
          onPress={handleProceedToVerify}
          className="py-4 rounded-2xl items-center"
          style={{ backgroundColor: '#3B82F6' }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold">
            I've Written It Down
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── STEP 3: Verify ────────────────────────────────────────────────────
  function renderVerify() {
    return (
      <View>
        <Text
          className="text-xl font-bold text-center mb-2"
          style={{ color: colors.text }}
        >
          Verify Your Phrase
        </Text>
        <Text
          className="text-sm text-center mb-6"
          style={{ color: colors.textSecondary }}
        >
          Enter the following words from your recovery phrase to confirm you
          saved it correctly.
        </Text>

        {/* Verify inputs */}
        {verifyIndices.map((wordIndex) => (
          <View key={wordIndex} className="mb-4">
            <Text
              className="text-sm font-medium mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Word #{wordIndex + 1}
            </Text>
            <TextInput
              className="py-3 px-4 rounded-xl text-base"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1.5,
                borderColor: verifyErrors[wordIndex] ? '#EF4444' : colors.border,
                color: colors.text,
              }}
              placeholder={`Enter word #${wordIndex + 1}`}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              value={verifyInputs[wordIndex] || ''}
              onChangeText={(text) =>
                setVerifyInputs((prev) => ({ ...prev, [wordIndex]: text }))
              }
            />
            {verifyErrors[wordIndex] && (
              <Text className="text-xs mt-1" style={{ color: '#EF4444' }}>
                This word doesn't match. Please check your recovery phrase.
              </Text>
            )}
          </View>
        ))}

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleVerifyAndSubmit}
          disabled={!isVerifyFormComplete || isSubmitting}
          className="mt-4 py-4 rounded-2xl items-center flex-row justify-center"
          style={{
            backgroundColor: isVerifyFormComplete && !isSubmitting ? '#3B82F6' : '#93C5FD',
          }}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Verify & Save Recovery Key
            </Text>
          )}
        </TouchableOpacity>

        {/* Go back link */}
        <TouchableOpacity
          onPress={() => setStep('display')}
          className="mt-4 py-3 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            ← Show my recovery phrase again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── STEP 4: Success ───────────────────────────────────────────────────
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
          Recovery Key Saved!
        </Text>

        <Text
          className="text-base text-center leading-6 mb-8"
          style={{ color: colors.textSecondary }}
        >
          Your recovery key has been securely stored. Keep your 24-word phrase
          in a safe place — it's the only way to recover your encrypted data
          if you lose access to your account.
        </Text>

        <View
          className="w-full p-4 rounded-2xl mb-8"
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
        >
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="information-outline" size={16} color="#3B82F6" />
            <Text className="text-sm font-medium ml-2" style={{ color: colors.text }}>
              Remember
            </Text>
          </View>
          <Text className="text-xs leading-5" style={{ color: colors.textSecondary }}>
            • Store your recovery phrase on paper in a secure location{'\n'}
            • Never share it with anyone, including Kaiz support{'\n'}
            • You can regenerate a new recovery key anytime in Settings{'\n'}
            • Without this phrase, lost data cannot be recovered
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleClose}
          className="w-full py-4 rounded-2xl items-center"
          style={{ backgroundColor: '#10B981' }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold">Done</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

// ============================================================================
// Shared Sub-component
// ============================================================================

function InfoCard({
  icon,
  title,
  description,
  colors,
}: {
  icon: string;
  title: string;
  description: string;
  colors: { text: string; textSecondary: string; card: string; border: string };
}) {
  return (
    <View
      className="flex-row p-4 rounded-xl mb-3"
      style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: '#EFF6FF' }}
      >
        <MaterialCommunityIcons name={icon as any} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
          {title}
        </Text>
        <Text className="text-xs leading-5" style={{ color: colors.textSecondary }}>
          {description}
        </Text>
      </View>
    </View>
  );
}
