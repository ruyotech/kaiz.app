import { View, Text, TextInput, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { useState } from 'react';

export default function CreateEpicScreen() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState('#3B82F6');
    const [selectedIcon, setSelectedIcon] = useState('rocket-launch');

    const COLORS = [
        '#3B82F6', // Blue
        '#EF4444', // Red
        '#10B981', // Green
        '#F59E0B', // Amber
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#6366F1', // Indigo
        '#14B8A6', // Teal
    ];

    const ICONS = [
        'rocket-launch',
        'target',
        'lightning-bolt',
        'star',
        'flag',
        'trophy',
        'chart-line',
        'cube-outline'
    ];

    return (
        <Container>
            <ScreenHeader title="Create Epic" subtitle="Define a new strategic goal" showBack />

            <ScrollView className="flex-1 p-6">

                {/* Title Input - Big and Bold */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Epic Title</Text>
                    <TextInput
                        className="text-3xl font-bold text-gray-900 border-b border-gray-200 pb-2"
                        placeholder="e.g. Q3 Mobile Redesign"
                        placeholderTextColor="#D1D5DB"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Color Selector - Creative Circles */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Theme Color</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                className={`w-12 h-12 rounded-full mr-4 items-center justify-center border-2 ${selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                            >
                                {selectedColor === color && (
                                    <MaterialCommunityIcons name="check" size={24} color="white" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Description Input */}
                <View className="mb-8">
                    <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Description</Text>
                    <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[120px]">
                        <TextInput
                            className="text-base text-gray-800 leading-relaxed"
                            placeholder="Describe what this epic aims to achieve..."
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                </View>

                {/* Icon Selector - Creative Grid */}
                <View className="mb-10">
                    <Text className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Identity Icon</Text>
                    <View className="flex-row flex-wrap gap-4">
                        {ICONS.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                onPress={() => setSelectedIcon(icon)}
                                className={`w-14 h-14 rounded-2xl items-center justify-center border ${selectedIcon === icon ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
                            >
                                <MaterialCommunityIcons
                                    name={icon as any}
                                    size={28}
                                    color={selectedIcon === icon ? 'white' : '#6B7280'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Submit Button - Floating feeling */}
                <TouchableOpacity
                    className="bg-blue-600 py-4 rounded-xl shadow-lg shadow-blue-200 flex-row items-center justify-center mb-10"
                    onPress={() => {
                        // Handle creation logic here
                        router.back();
                    }}
                >
                    <Text className="text-white font-bold text-lg mr-2">Create Epic</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                </TouchableOpacity>

            </ScrollView>
        </Container>
    );
}
