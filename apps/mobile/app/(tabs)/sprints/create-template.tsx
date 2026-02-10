import { logger } from '../../../utils/logger';
import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCreateUserTemplate } from '../../../hooks/queries';
import { LIFE_WHEEL_CONFIG } from '../../../components/templates/TemplateCard';
import { RecurrencePattern, CreateTemplateRequest } from '../../../types/models';

type TemplateType = 'task' | 'event';

const LIFE_WHEEL_AREAS = Object.entries(LIFE_WHEEL_CONFIG).map(([id, config]) => ({
    id,
    ...config,
}));

const RECURRENCE_OPTIONS: { label: string; value: RecurrencePattern | null }[] = [
    { label: 'No recurrence', value: null },
    { label: 'Daily', value: { frequency: 'daily', interval: 1, endDate: null } },
    { label: 'Weekly', value: { frequency: 'weekly', interval: 1, endDate: null } },
    { label: 'Monthly', value: { frequency: 'monthly', interval: 1, endDate: null } },
];

const ICONS = ['clipboard-text-outline', 'check-circle-outline', 'calendar-outline', 'arm-flex-outline', 'book-open-variant', 'cash-multiple', 'heart-outline', 'home-outline', 'target', 'star-outline', 'fire', 'lightbulb-outline', 'palette-outline', 'music-note', 'airplane', 'food-apple'];

export default function CreateTemplateScreen() {
    const router = useRouter();
    const createTemplateMutation = useCreateUserTemplate();

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<TemplateType>('task');
    const [selectedArea, setSelectedArea] = useState<string>('life-growth');
    const [selectedIcon, setSelectedIcon] = useState<string>('clipboard-text-outline');
    const [duration, setDuration] = useState<number>(30);
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
    const [recurrence, setRecurrence] = useState<RecurrencePattern | null>(null);
    const [tags, setTags] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);

    // Event specific
    const [location, setLocation] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a template name');
            return;
        }

        setIsLoading(true);
        try {
            const templateData: CreateTemplateRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                type,
                defaultLifeWheelAreaId: selectedArea,
                icon: selectedIcon,
                defaultDuration: duration,
                recurrencePattern: recurrence || undefined,
                tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
                ...(type === 'event' && {
                    defaultLocation: location || undefined,
                    isAllDay,
                }),
            };

            await createTemplateMutation.mutateAsync(templateData);
            Alert.alert('Success!', 'Template created successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error) {
            logger.error('Failed to create template:', error);
            Alert.alert('Error', 'Failed to create template. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const areaConfig = LIFE_WHEEL_CONFIG[selectedArea] || { color: '#6b7280', name: 'General', icon: 'clipboard-text-outline' };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="bg-white border-b border-gray-100 px-4 py-4 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                        <Ionicons name="close" size={28} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Create Template</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                    <View className="px-4 py-4">
                        {/* Template Type */}
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Type</Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setType('task')}
                                    className={`flex-1 py-4 rounded-xl items-center ${
                                        type === 'task' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                                    }`}
                                >
                                    <MaterialCommunityIcons name="check-circle-outline" size={28} color={type === 'task' ? '#1d4ed8' : '#4b5563'} />
                                    <Text className={`font-medium ${type === 'task' ? 'text-blue-700' : 'text-gray-600'}`}>
                                        Task
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setType('event')}
                                    className={`flex-1 py-4 rounded-xl items-center ${
                                        type === 'event' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                                    }`}
                                >
                                    <MaterialCommunityIcons name="calendar-outline" size={28} color={type === 'event' ? '#1d4ed8' : '#4b5563'} />
                                    <Text className={`font-medium ${type === 'event' ? 'text-blue-700' : 'text-gray-600'}`}>
                                        Event
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Icon Selection */}
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Icon</Text>
                            <TouchableOpacity
                                onPress={() => setShowIconPicker(!showIconPicker)}
                                className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons name={selectedIcon as any} size={28} color="#374151" style={{ marginRight: 12 }} />
                                    <Text className="text-gray-700">Select icon</Text>
                                </View>
                                <Ionicons name={showIconPicker ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
                            </TouchableOpacity>
                            {showIconPicker && (
                                <View className="flex-row flex-wrap gap-2 mt-3 p-3 bg-gray-50 rounded-xl">
                                    {ICONS.map((icon) => (
                                        <TouchableOpacity
                                            key={icon}
                                            onPress={() => {
                                                setSelectedIcon(icon);
                                                setShowIconPicker(false);
                                            }}
                                            className={`w-12 h-12 rounded-xl items-center justify-center ${
                                                selectedIcon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white'
                                            }`}
                                        >
                                            <MaterialCommunityIcons name={icon as any} size={24} color={selectedIcon === icon ? '#2563eb' : '#374151'} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Name */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Name *</Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                                placeholder="e.g., Morning Exercise Routine"
                                placeholderTextColor="#9ca3af"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Description */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                                placeholder="Describe the template..."
                                placeholderTextColor="#9ca3af"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                style={{ minHeight: 80 }}
                            />
                        </View>

                        {/* Life Wheel Area */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Life Wheel Area</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-2">
                                    {LIFE_WHEEL_AREAS.map((area) => (
                                        <TouchableOpacity
                                            key={area.id}
                                            onPress={() => setSelectedArea(area.id)}
                                            className={`px-3 py-2 rounded-full flex-row items-center ${
                                                selectedArea === area.id ? '' : 'bg-gray-100'
                                            }`}
                                            style={selectedArea === area.id ? { backgroundColor: area.color } : {}}
                                        >
                                            <MaterialCommunityIcons name={area.icon as any} size={16} color={selectedArea === area.id ? '#FFFFFF' : '#374151'} />
                                            <Text
                                                className={`ml-1 font-medium ${
                                                    selectedArea === area.id ? 'text-white' : 'text-gray-700'
                                                }`}
                                            >
                                                {area.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Duration */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Default Duration</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {[15, 30, 45, 60, 90, 120].map((min) => (
                                    <TouchableOpacity
                                        key={min}
                                        onPress={() => setDuration(min)}
                                        className={`px-4 py-2 rounded-lg ${
                                            duration === min ? 'bg-blue-600' : 'bg-gray-100'
                                        }`}
                                    >
                                        <Text
                                            className={`font-medium ${
                                                duration === min ? 'text-white' : 'text-gray-700'
                                            }`}
                                        >
                                            {min}m
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Priority */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Default Priority</Text>
                            <View className="flex-row gap-2">
                                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        onPress={() => setPriority(p)}
                                        className={`flex-1 py-3 rounded-xl items-center ${
                                            priority === p
                                                ? p === 'HIGH' ? 'bg-red-100' : p === 'MEDIUM' ? 'bg-yellow-100' : 'bg-green-100'
                                                : 'bg-gray-100'
                                        }`}
                                    >
                                        <Ionicons
                                            name="flag"
                                            size={18}
                                            color={
                                                priority === p
                                                    ? p === 'HIGH' ? '#ef4444' : p === 'MEDIUM' ? '#f59e0b' : '#10b981'
                                                    : '#9ca3af'
                                            }
                                        />
                                        <Text
                                            className={`text-sm font-medium mt-1 capitalize ${
                                                priority === p ? 'text-gray-900' : 'text-gray-500'
                                            }`}
                                        >
                                            {p.toLowerCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Recurrence */}
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Default Recurrence</Text>
                            <TouchableOpacity
                                onPress={() => setShowRecurrencePicker(!showRecurrencePicker)}
                                className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="repeat" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">
                                        {recurrence
                                            ? RECURRENCE_OPTIONS.find(o => 
                                                o.value?.frequency === recurrence.frequency
                                              )?.label || 'Custom'
                                            : 'No recurrence'}
                                    </Text>
                                </View>
                                <Ionicons name={showRecurrencePicker ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
                            </TouchableOpacity>
                            {showRecurrencePicker && (
                                <View className="bg-gray-50 rounded-xl mt-2 overflow-hidden">
                                    {RECURRENCE_OPTIONS.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => {
                                                setRecurrence(option.value);
                                                setShowRecurrencePicker(false);
                                            }}
                                            className={`px-4 py-3 flex-row items-center justify-between border-b border-gray-100 ${
                                                JSON.stringify(recurrence) === JSON.stringify(option.value) ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <Text
                                                className={
                                                    JSON.stringify(recurrence) === JSON.stringify(option.value)
                                                        ? 'text-blue-600 font-medium'
                                                        : 'text-gray-700'
                                                }
                                            >
                                                {option.label}
                                            </Text>
                                            {JSON.stringify(recurrence) === JSON.stringify(option.value) && (
                                                <Ionicons name="checkmark" size={20} color="#3b82f6" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Event-specific fields */}
                        {type === 'event' && (
                            <>
                                <View className="mb-4">
                                    <Text className="text-sm font-medium text-gray-700 mb-2">Default Location</Text>
                                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4">
                                        <Ionicons name="location-outline" size={20} color="#6b7280" />
                                        <TextInput
                                            className="flex-1 py-3 ml-3 text-gray-900"
                                            placeholder="e.g., Home gym, Office..."
                                            placeholderTextColor="#9ca3af"
                                            value={location}
                                            onChangeText={setLocation}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setIsAllDay(!isAllDay)}
                                    className={`flex-row items-center justify-between mb-4 px-4 py-3 rounded-xl ${
                                        isAllDay ? 'bg-blue-50' : 'bg-gray-100'
                                    }`}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="sunny-outline" size={20} color={isAllDay ? '#3b82f6' : '#6b7280'} />
                                        <Text className={`ml-3 ${isAllDay ? 'text-blue-700' : 'text-gray-700'}`}>
                                            All day event by default
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={isAllDay ? 'checkbox' : 'square-outline'}
                                        size={24}
                                        color={isAllDay ? '#3b82f6' : '#9ca3af'}
                                    />
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Tags */}
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                                placeholder="e.g., morning, workout, health"
                                placeholderTextColor="#9ca3af"
                                value={tags}
                                onChangeText={setTags}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View className="px-4 py-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading}
                        className={`rounded-xl py-4 items-center flex-row justify-center ${
                            isLoading ? 'bg-gray-300' : 'bg-blue-600'
                        }`}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <Text className="text-white font-bold text-lg">Creating...</Text>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="white" />
                                <Text className="text-white font-bold text-lg ml-2">Create Template</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
