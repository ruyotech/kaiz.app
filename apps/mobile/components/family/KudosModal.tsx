import { logger } from '../../utils/logger';
/**
 * KudosModal.tsx - Send Kudos Modal Component
 * 
 * Beautiful modal for sending kudos/encouragement to family members
 */

import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    TextInput, 
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FamilyMember, KudosType, KUDOS_OPTIONS } from '../../types/family.types';
import { useThemeContext } from '../../providers/ThemeProvider';
import { useFamilyStore } from '../../store/familyStore';

interface KudosModalProps {
    visible: boolean;
    onClose: () => void;
    recipient: FamilyMember | null;
}

export function KudosModal({ visible, onClose, recipient }: KudosModalProps) {
    const { colors, isDark } = useThemeContext();
    const { sendKudos, loading } = useFamilyStore();
    
    const [selectedType, setSelectedType] = useState<KudosType | null>(null);
    const [message, setMessage] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [sent, setSent] = useState(false);
    
    const handleSend = async () => {
        if (!selectedType || !recipient) return;
        
        try {
            await sendKudos(
                recipient.userId,
                selectedType,
                message || getDefaultMessage(selectedType),
                isPrivate
            );
            setSent(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            logger.error('Failed to send kudos:', error);
        }
    };
    
    const handleClose = () => {
        setSelectedType(null);
        setMessage('');
        setIsPrivate(false);
        setSent(false);
        onClose();
    };
    
    const getDefaultMessage = (type: KudosType) => {
        const option = KUDOS_OPTIONS.find(o => o.type === type);
        return option?.label || '';
    };
    
    if (!recipient) return null;
    
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <Pressable 
                className="flex-1 justify-end"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                onPress={handleClose}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <Pressable 
                        className="rounded-t-3xl"
                        style={{ backgroundColor: colors.background }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {sent ? (
                            // Success State
                            <View className="items-center py-16 px-6">
                                <View 
                                    className="w-24 h-24 rounded-full items-center justify-center mb-6"
                                    style={{ backgroundColor: '#10B98120' }}
                                >
                                    <Text className="text-5xl"></Text>
                                </View>
                                <Text 
                                    className="text-2xl font-bold text-center mb-2"
                                    style={{ color: colors.text }}
                                >
                                    Kudos Sent!
                                </Text>
                                <Text 
                                    className="text-base text-center"
                                    style={{ color: colors.textSecondary }}
                                >
                                    {recipient.displayName} will be so happy!
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* Header */}
                                <View 
                                    className="flex-row items-center justify-between p-4 border-b"
                                    style={{ borderBottomColor: colors.border }}
                                >
                                    <TouchableOpacity onPress={handleClose}>
                                        <MaterialCommunityIcons 
                                            name="close" 
                                            size={24} 
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                    <Text 
                                        className="text-lg font-bold"
                                        style={{ color: colors.text }}
                                    >
                                        Send Kudos
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={handleSend}
                                        disabled={!selectedType || loading}
                                        style={{ opacity: selectedType ? 1 : 0.5 }}
                                    >
                                        <Text 
                                            className="text-base font-bold"
                                            style={{ color: '#8B5CF6' }}
                                        >
                                            {loading ? 'Sending...' : 'Send'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <ScrollView className="max-h-[500px]">
                                    {/* Recipient */}
                                    <View className="items-center pt-6 pb-4">
                                        <View 
                                            className="w-20 h-20 rounded-full items-center justify-center mb-3"
                                            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                                        >
                                            <Text className="text-4xl">{recipient.avatar}</Text>
                                        </View>
                                        <Text 
                                            className="text-xl font-bold"
                                            style={{ color: colors.text }}
                                        >
                                            {recipient.displayName}
                                        </Text>
                                        <Text 
                                            className="text-sm mt-1"
                                            style={{ color: colors.textSecondary }}
                                        >
                                            Send some encouragement!
                                        </Text>
                                    </View>
                                    
                                    {/* Kudos Types */}
                                    <View className="px-4 pb-4">
                                        <Text 
                                            className="text-sm font-semibold mb-3"
                                            style={{ color: colors.textSecondary }}
                                        >
                                            Choose a type
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {KUDOS_OPTIONS.map((option) => (
                                                <TouchableOpacity
                                                    key={option.type}
                                                    onPress={() => setSelectedType(option.type)}
                                                    className="flex-row items-center px-4 py-3 rounded-xl"
                                                    style={{ 
                                                        backgroundColor: selectedType === option.type 
                                                            ? `${option.color}20`
                                                            : isDark ? '#374151' : '#F3F4F6',
                                                        borderWidth: selectedType === option.type ? 2 : 0,
                                                        borderColor: option.color,
                                                    }}
                                                >
                                                    <Text className="text-xl mr-2">{option.emoji}</Text>
                                                    <Text 
                                                        className="font-medium"
                                                        style={{ 
                                                            color: selectedType === option.type 
                                                                ? option.color 
                                                                : colors.text 
                                                        }}
                                                    >
                                                        {option.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                    
                                    {/* Message */}
                                    <View className="px-4 pb-4">
                                        <Text 
                                            className="text-sm font-semibold mb-2"
                                            style={{ color: colors.textSecondary }}
                                        >
                                            Add a personal message (optional)
                                        </Text>
                                        <TextInput
                                            value={message}
                                            onChangeText={setMessage}
                                            placeholder="Write something nice..."
                                            placeholderTextColor={colors.textSecondary}
                                            multiline
                                            numberOfLines={3}
                                            className="rounded-xl p-4"
                                            style={{ 
                                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                                color: colors.text,
                                                minHeight: 80,
                                                textAlignVertical: 'top',
                                            }}
                                        />
                                    </View>
                                    
                                    {/* Privacy Toggle */}
                                    <TouchableOpacity 
                                        onPress={() => setIsPrivate(!isPrivate)}
                                        className="flex-row items-center justify-between mx-4 mb-6 p-4 rounded-xl"
                                        style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                                    >
                                        <View className="flex-row items-center flex-1">
                                            <MaterialCommunityIcons 
                                                name={isPrivate ? 'lock' : 'account-group'} 
                                                size={22} 
                                                color={colors.textSecondary}
                                            />
                                            <View className="ml-3 flex-1">
                                                <Text 
                                                    className="font-medium"
                                                    style={{ color: colors.text }}
                                                >
                                                    {isPrivate ? 'Private' : 'Visible to family'}
                                                </Text>
                                                <Text 
                                                    className="text-xs mt-0.5"
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    {isPrivate 
                                                        ? 'Only visible to recipient'
                                                        : 'Everyone in the family can see'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View 
                                            className="w-12 h-7 rounded-full justify-center"
                                            style={{ 
                                                backgroundColor: isPrivate ? '#8B5CF6' : '#D1D5DB',
                                                paddingHorizontal: 2,
                                            }}
                                        >
                                            <View 
                                                className="w-6 h-6 rounded-full bg-white"
                                                style={{ 
                                                    alignSelf: isPrivate ? 'flex-end' : 'flex-start',
                                                }}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </ScrollView>
                            </>
                        )}
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
}
