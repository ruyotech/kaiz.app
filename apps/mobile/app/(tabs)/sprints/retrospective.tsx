/**
 * Sprint Retrospective Screen
 *
 * Facilitates sprint retrospective ceremony with structured reflection,
 * improvement identification, and action item generation.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStartCeremony } from '../../../hooks/queries';
import { useThemeContext } from '../../../providers/ThemeProvider';

type RetroCategory = 'went_well' | 'improve' | 'try_next';

interface RetroItem {
    id: string;
    category: RetroCategory;
    text: string;
    votes: number;
}

export default function SprintRetrospectiveScreen() {
    const { colors, isDark } = useThemeContext();
    const startCeremonyMutation = useStartCeremony();

    const [isStarted, setIsStarted] = useState(false);
    const [step, setStep] = useState<'collect' | 'discuss' | 'actions'>('collect');
    const [items, setItems] = useState<RetroItem[]>([
        { id: '1', category: 'went_well', text: 'Consistent morning routine', votes: 0 },
        { id: '2', category: 'went_well', text: 'Completed reading goal', votes: 0 },
        { id: '3', category: 'improve', text: 'Finance tasks keep getting pushed', votes: 0 },
        { id: '4', category: 'improve', text: 'Overcommitted on points', votes: 0 },
    ]);
    const [newItem, setNewItem] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<RetroCategory>('went_well');
    const [actionItems, setActionItems] = useState<string[]>([]);
    const [newAction, setNewAction] = useState('');

    const handleStartRetro = async () => {
        await startCeremonyMutation.mutateAsync('retrospective');
        setIsStarted(true);
    };

    const addItem = () => {
        if (newItem.trim()) {
            setItems([
                ...items,
                { id: Date.now().toString(), category: selectedCategory, text: newItem.trim(), votes: 0 },
            ]);
            setNewItem('');
        }
    };

    const toggleVote = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, votes: item.votes > 0 ? 0 : 1 } : item
        ));
    };

    const addAction = () => {
        if (newAction.trim()) {
            setActionItems([...actionItems, newAction.trim()]);
            setNewAction('');
        }
    };

    const categoryConfig: Record<RetroCategory, { title: string; icon: string; color: string }> = {
        went_well: { title: 'What Went Well', icon: 'thumb-up', color: '#10B981' },
        improve: { title: 'What to Improve', icon: 'alert-circle', color: '#F59E0B' },
        try_next: { title: 'Try Next Sprint', icon: 'lightbulb', color: '#3B82F6' },
    };

    const renderCollectStep = () => (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            {/* Category Tabs */}
            <View className="flex-row mb-4">
                {(Object.keys(categoryConfig) as RetroCategory[]).map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        className="flex-1 p-3 rounded-xl mr-2"
                        style={{
                            backgroundColor: selectedCategory === cat
                                ? categoryConfig[cat].color + '20'
                                : colors.card,
                        }}
                    >
                        <View className="items-center">
                            <MaterialCommunityIcons
                                name={categoryConfig[cat].icon as any}
                                size={24}
                                color={selectedCategory === cat ? categoryConfig[cat].color : colors.textTertiary}
                            />
                            <Text
                                className="text-xs mt-1"
                                style={{ color: selectedCategory === cat ? colors.text : colors.textTertiary }}
                            >
                                {categoryConfig[cat].title.split(' ').slice(-1)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Add New Item */}
            <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="font-semibold mb-3" style={{ color: colors.text }}>{categoryConfig[selectedCategory].title}</Text>
                <View className="flex-row">
                    <TextInput
                        value={newItem}
                        onChangeText={setNewItem}
                        placeholder="Add your thought..."
                        placeholderTextColor={colors.placeholder}
                        className="flex-1 p-3 rounded-xl mr-2"
                        style={{ backgroundColor: colors.inputBackground, color: colors.text }}
                    />
                    <TouchableOpacity
                        onPress={addItem}
                        className="w-12 h-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: colors.success }}
                    >
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Items by Category */}
            {(Object.keys(categoryConfig) as RetroCategory[]).map(cat => {
                const catItems = items.filter(i => i.category === cat);
                if (catItems.length === 0) return null;

                return (
                    <View key={cat} className="mb-4">
                        <View className="flex-row items-center mb-3">
                            <MaterialCommunityIcons name={categoryConfig[cat].icon as any} size={20} color={categoryConfig[cat].color} />
                            <Text className="font-semibold ml-2" style={{ color: colors.text }}>{categoryConfig[cat].title}</Text>
                            <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: categoryConfig[cat].color + '20' }}>
                                <Text style={{ color: categoryConfig[cat].color }}>{catItems.length}</Text>
                            </View>
                        </View>
                        {catItems.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggleVote(item.id)}
                                className="p-4 rounded-xl mb-2 flex-row items-center"
                                style={{
                                    backgroundColor: colors.card,
                                    borderWidth: item.votes > 0 ? 2 : 0,
                                    borderColor: item.votes > 0 ? categoryConfig[cat].color : 'transparent',
                                }}
                            >
                                <Text className="flex-1" style={{ color: colors.text }}>{item.text}</Text>
                                <MaterialCommunityIcons
                                    name={item.votes > 0 ? 'star' : 'star-outline'}
                                    size={20}
                                    color={item.votes > 0 ? '#F59E0B' : colors.textTertiary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            })}

            <TouchableOpacity
                onPress={() => setStep('discuss')}
                className="p-4 rounded-xl mt-4"
                style={{ backgroundColor: colors.success }}
            >
                <Text className="text-white text-center font-semibold text-lg">Continue to Discussion</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderDiscussStep = () => {
        const starredItems = items.filter(i => i.votes > 0);
        const topItems = starredItems.length > 0 ? starredItems : items.slice(0, 3);

        return (
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                <View className="rounded-2xl p-6 mb-4" style={{ backgroundColor: colors.card }}>
                    <View className="flex-row items-center mb-4">
                        <MaterialCommunityIcons name="chart-line" size={24} color={colors.success} />
                        <Text className="text-lg font-semibold ml-2" style={{ color: colors.text }}>Sprint Analysis</Text>
                    </View>

                    <Text className="mb-4" style={{ color: colors.textSecondary }}>
                        Based on your sprint data and reflection, here are the key themes:
                    </Text>

                    <View className="p-4 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }}>
                        <Text className="font-semibold mb-2" style={{ color: colors.success }}>Strength Pattern</Text>
                        <Text style={{ color: colors.textSecondary }}>
                            Your Health and Growth dimensions showed consistent progress.
                            Morning routines are working well for you.
                        </Text>
                    </View>

                    <View className="p-4 rounded-xl mt-4" style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB' }}>
                        <Text className="font-semibold mb-2" style={{ color: '#F59E0B' }}>Improvement Area</Text>
                        <Text style={{ color: colors.textSecondary }}>
                            Finance tasks were deprioritized 3 sprints in a row.
                            Consider scheduling them earlier in the sprint.
                        </Text>
                    </View>

                    <View className="p-4 rounded-xl mt-4" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }}>
                        <Text className="font-semibold mb-2" style={{ color: '#3B82F6' }}>Suggestion</Text>
                        <Text style={{ color: colors.textSecondary }}>
                            Your completion rate improves when you plan 15% fewer points.
                            Quality over quantity is your winning strategy.
                        </Text>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>Focus Items</Text>
                    {topItems.map(item => (
                        <View
                            key={item.id}
                            className="p-4 rounded-xl mb-2"
                            style={{
                                backgroundColor: colors.card,
                                borderLeftWidth: 4,
                                borderLeftColor: categoryConfig[item.category].color,
                            }}
                        >
                            <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                                {categoryConfig[item.category].title}
                            </Text>
                            <Text style={{ color: colors.text }}>{item.text}</Text>
                        </View>
                    ))}
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => setStep('collect')}
                        className="flex-1 p-4 rounded-xl"
                        style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                        <Text className="text-center font-semibold" style={{ color: colors.text }}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setStep('actions')}
                        className="flex-1 p-4 rounded-xl"
                        style={{ backgroundColor: colors.success }}
                    >
                        <Text className="text-white text-center font-semibold">Create Actions</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    };

    const renderActionsStep = () => (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            <View className="rounded-2xl p-6 mb-4" style={{ backgroundColor: colors.card }}>
                <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Action Items</Text>
                <Text className="mb-4" style={{ color: colors.textSecondary }}>
                    What specific changes will you make next sprint?
                </Text>

                <Text className="text-sm mb-2" style={{ color: colors.textTertiary }}>Suggested actions:</Text>
                {[
                    'Schedule finance review for sprint day 2',
                    'Reduce planned points by 10%',
                    'Add morning routine as recurring task',
                ].map((suggestion, idx) => (
                    <TouchableOpacity
                        key={idx}
                        onPress={() => {
                            if (!actionItems.includes(suggestion)) {
                                setActionItems([...actionItems, suggestion]);
                            }
                        }}
                        className="flex-row items-center p-3 rounded-lg mb-2"
                        style={{
                            backgroundColor: actionItems.includes(suggestion)
                                ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5')
                                : colors.backgroundSecondary,
                        }}
                    >
                        <MaterialCommunityIcons
                            name={actionItems.includes(suggestion) ? 'check-circle' : 'plus-circle-outline'}
                            size={20}
                            color={actionItems.includes(suggestion) ? colors.success : colors.textTertiary}
                        />
                        <Text className="ml-3" style={{ color: colors.text }}>{suggestion}</Text>
                    </TouchableOpacity>
                ))}

                <View className="flex-row mt-4">
                    <TextInput
                        value={newAction}
                        onChangeText={setNewAction}
                        placeholder="Add custom action..."
                        placeholderTextColor={colors.placeholder}
                        className="flex-1 p-3 rounded-xl mr-2"
                        style={{ backgroundColor: colors.inputBackground, color: colors.text }}
                    />
                    <TouchableOpacity
                        onPress={addAction}
                        className="w-12 h-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: colors.success }}
                    >
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {actionItems.length > 0 && (
                <View className="rounded-2xl p-6 mb-4" style={{ backgroundColor: colors.card }}>
                    <Text className="font-semibold mb-3" style={{ color: colors.text }}>
                        Your Action Items ({actionItems.length})
                    </Text>
                    {actionItems.map((action, idx) => (
                        <View
                            key={idx}
                            className="flex-row items-center p-3 rounded-lg mb-2"
                            style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }}
                        >
                            <View className="w-6 h-6 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.success }}>
                                <Text className="text-white font-bold text-sm">{idx + 1}</Text>
                            </View>
                            <Text className="flex-1" style={{ color: colors.text }}>{action}</Text>
                            <TouchableOpacity onPress={() => setActionItems(actionItems.filter((_, i) => i !== idx))}>
                                <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={() => setStep('discuss')}
                    className="flex-1 p-4 rounded-xl"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <Text className="text-center font-semibold" style={{ color: colors.text }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-1 p-4 rounded-xl"
                    style={{ backgroundColor: colors.success }}
                >
                    <Text className="text-white text-center font-semibold">Complete Retro</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    if (!isStarted) {
        return (
            <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                <View className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold" style={{ color: colors.text }}>Retrospective</Text>
                </View>

                <View className="flex-1 justify-center items-center p-6">
                    <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }}>
                        <MaterialCommunityIcons name="comment-multiple" size={48} color="#F97316" />
                    </View>

                    <Text className="text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>
                        Time to Reflect
                    </Text>
                    <Text className="text-center mb-8" style={{ color: colors.textSecondary }}>
                        Let's examine what worked, what didn't, and how to improve next sprint.
                    </Text>

                    <View className="rounded-2xl p-6 w-full mb-6" style={{ backgroundColor: colors.card }}>
                        <Text className="font-semibold mb-4" style={{ color: colors.text }}>Retrospective process:</Text>
                        {[
                            { icon: 'thumb-up', text: 'Identify what went well', color: '#10B981' },
                            { icon: 'alert-circle', text: 'Note areas for improvement', color: '#F59E0B' },
                            { icon: 'lightbulb', text: 'Brainstorm experiments', color: '#3B82F6' },
                            { icon: 'checkbox-marked', text: 'Commit to action items', color: '#A855F7' },
                        ].map((item, idx) => (
                            <View key={idx} className="flex-row items-center mb-3">
                                <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                                <Text className="ml-3" style={{ color: colors.textSecondary }}>{item.text}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleStartRetro}
                        className="w-full p-4 rounded-xl"
                        style={{ backgroundColor: '#F97316' }}
                    >
                        <Text className="text-white text-center font-semibold text-lg">Start Retrospective</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <View className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-xl font-semibold flex-1" style={{ color: colors.text }}>Retrospective</Text>

                <View className="flex-row">
                    {['collect', 'discuss', 'actions'].map((s, idx) => (
                        <View
                            key={s}
                            className="w-2 h-2 rounded-full mx-1"
                            style={{
                                backgroundColor: ['collect', 'discuss', 'actions'].indexOf(step) >= idx
                                    ? '#F97316'
                                    : colors.backgroundSecondary,
                            }}
                        />
                    ))}
                </View>
            </View>

            {step === 'collect' && renderCollectStep()}
            {step === 'discuss' && renderDiscussStep()}
            {step === 'actions' && renderActionsStep()}
        </SafeAreaView>
    );
}
