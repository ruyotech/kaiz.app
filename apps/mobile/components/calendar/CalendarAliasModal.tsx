/**
 * CalendarAliasModal.tsx - Life Context Settings for Calendars
 * 
 * Allows users to set custom aliases and colors for their calendars.
 * This helps organize events by life context (Work, Personal, Side Hustle, etc.)
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    useCalendarSyncStore,
    LIFE_CONTEXTS,
    type CalendarProvider,
    type ExternalCalendar,
} from '../../store/calendarSyncStore';

// ============================================================================
// Types
// ============================================================================

interface CalendarAliasModalProps {
    visible: boolean;
    onClose: () => void;
    calendar: ExternalCalendar | null;
    provider: CalendarProvider;
    accountId?: string; // Multi-account support
}

// ============================================================================
// Component
// ============================================================================

export const CalendarAliasModal: React.FC<CalendarAliasModalProps> = ({
    visible,
    onClose,
    calendar,
    provider,
    accountId,
}) => {
    const { setCalendarAlias } = useCalendarSyncStore();
    
    const [alias, setAlias] = useState('');
    const [selectedColor, setSelectedColor] = useState('#6B7280');
    const [showCustomInput, setShowCustomInput] = useState(false);
    
    // Initialize with calendar's current values
    useEffect(() => {
        if (calendar) {
            setAlias(calendar.alias || calendar.name);
            setSelectedColor(calendar.contextColor || calendar.color || '#6B7280');
            setShowCustomInput(
                !LIFE_CONTEXTS.some(
                    (ctx) => ctx.label === (calendar.alias || calendar.name)
                )
            );
        }
    }, [calendar]);
    
    const handleSelectContext = (context: typeof LIFE_CONTEXTS[number]) => {
        setAlias(context.label);
        setSelectedColor(context.color);
        setShowCustomInput(false);
    };
    
    const handleCustom = () => {
        setShowCustomInput(true);
        setAlias('');
    };
    
    const handleSave = () => {
        if (calendar && alias.trim()) {
            setCalendarAlias(provider, calendar.id, alias.trim(), selectedColor, accountId);
            onClose();
        }
    };
    
    if (!calendar) return null;
    
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white dark:bg-gray-900 rounded-t-3xl">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-gray-500 dark:text-gray-400 text-base">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                            Life Context
                        </Text>
                        
                        <TouchableOpacity onPress={handleSave}>
                            <Text className="text-indigo-600 dark:text-indigo-400 text-base font-semibold">
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView className="max-h-96">
                        {/* Calendar Info */}
                        <View className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50">
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Original Calendar
                            </Text>
                            <View className="flex-row items-center">
                                <View
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: calendar.color }}
                                />
                                <Text className="text-base text-gray-900 dark:text-white">
                                    {calendar.name}
                                </Text>
                            </View>
                        </View>
                        
                        {/* Preset Contexts */}
                        <View className="px-5 py-4">
                            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                Quick Select Context
                            </Text>
                            
                            <View className="flex-row flex-wrap gap-2">
                                {LIFE_CONTEXTS.map((context) => {
                                    const isSelected = alias === context.label;
                                    return (
                                        <TouchableOpacity
                                            key={context.label}
                                            onPress={() => handleSelectContext(context)}
                                            className={`flex-row items-center px-3 py-2 rounded-full border ${
                                                isSelected
                                                    ? 'border-transparent'
                                                    : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected
                                                    ? context.color + '20'
                                                    : 'transparent',
                                                borderColor: isSelected
                                                    ? context.color
                                                    : undefined,
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name={context.icon as any}
                                                size={16}
                                                color={isSelected ? context.color : '#6B7280'}
                                            />
                                            <Text
                                                className={`ml-1.5 text-sm ${
                                                    isSelected
                                                        ? 'font-medium'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                }`}
                                                style={{
                                                    color: isSelected ? context.color : undefined,
                                                }}
                                            >
                                                {context.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                                
                                {/* Custom Option */}
                                <TouchableOpacity
                                    onPress={handleCustom}
                                    className={`flex-row items-center px-3 py-2 rounded-full border ${
                                        showCustomInput
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <MaterialCommunityIcons
                                        name="pencil"
                                        size={16}
                                        color={showCustomInput ? '#6366F1' : '#6B7280'}
                                    />
                                    <Text
                                        className={`ml-1.5 text-sm ${
                                            showCustomInput
                                                ? 'font-medium text-indigo-600 dark:text-indigo-400'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        Custom
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        {/* Custom Input */}
                        {showCustomInput && (
                            <View className="px-5 pb-4">
                                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Custom Name
                                </Text>
                                <TextInput
                                    value={alias}
                                    onChangeText={setAlias}
                                    placeholder="e.g., Work @ Google, Client ABC"
                                    placeholderTextColor="#9CA3AF"
                                    className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white"
                                    autoFocus
                                />
                            </View>
                        )}
                        
                        {/* Color Picker (for custom) */}
                        {showCustomInput && (
                            <View className="px-5 pb-4">
                                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                    Tag Color
                                </Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {LIFE_CONTEXTS.map((context) => (
                                        <TouchableOpacity
                                            key={context.color}
                                            onPress={() => setSelectedColor(context.color)}
                                            className={`w-10 h-10 rounded-full items-center justify-center ${
                                                selectedColor === context.color
                                                    ? 'border-2 border-gray-900 dark:border-white'
                                                    : ''
                                            }`}
                                            style={{ backgroundColor: context.color }}
                                        >
                                            {selectedColor === context.color && (
                                                <MaterialCommunityIcons
                                                    name="check"
                                                    size={20}
                                                    color="white"
                                                />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                        
                        {/* Preview */}
                        <View className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50">
                            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                Preview
                            </Text>
                            <View className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <View className="flex-row items-center mb-1">
                                    <View
                                        className="px-2 py-0.5 rounded-full mr-2"
                                        style={{ backgroundColor: selectedColor + '30' }}
                                    >
                                        <Text
                                            className="text-xs font-medium"
                                            style={{ color: selectedColor }}
                                        >
                                            {alias || 'Context'}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-base text-gray-900 dark:text-white">
                                    Sample Event Title
                                </Text>
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                    10:00 AM - 11:00 AM
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                    
                    {/* Bottom Padding for Safe Area */}
                    <View className="h-8" />
                </View>
            </View>
        </Modal>
    );
};

export default CalendarAliasModal;
