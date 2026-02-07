import { logger } from '../../../utils/logger';
/**
 * Quick Intake Screen
 * 
 * Universal intake system for capturing tasks, ideas, and items
 * with AI-powered categorization and prioritization.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSensAIStore } from '../../../store/sensaiStore';
import { LIFE_WHEEL_DIMENSIONS, IntakeResult } from '../../../types/sensai.types';

type IntakeType = 'task' | 'idea' | 'commitment' | 'goal';

export default function IntakeScreen() {
    const { processIntake } = useSensAIStore();
    const [input, setInput] = useState('');
    const [type, setType] = useState<IntakeType>('task');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<IntakeResult | null>(null);
    const [recentIntakes, setRecentIntakes] = useState<Array<{ text: string; result: IntakeResult }>>([]);

    const typeConfig: Record<IntakeType, { icon: string; color: string; label: string; placeholder: string }> = {
        task: { 
            icon: 'checkbox-marked-circle-outline', 
            color: '#3B82F6', 
            label: 'Task',
            placeholder: 'What needs to get done?'
        },
        idea: { 
            icon: 'lightbulb-outline', 
            color: '#F59E0B', 
            label: 'Idea',
            placeholder: 'What\'s on your mind?'
        },
        commitment: { 
            icon: 'handshake', 
            color: '#EC4899', 
            label: 'Commitment',
            placeholder: 'What did you commit to?'
        },
        goal: { 
            icon: 'flag-checkered', 
            color: '#10B981', 
            label: 'Goal',
            placeholder: 'What do you want to achieve?'
        },
    };

    const handleSubmit = async () => {
        if (!input.trim()) return;

        setIsProcessing(true);
        try {
            const intakeResult = await processIntake(input, type);
            setResult(intakeResult);
            setRecentIntakes([{ text: input, result: intakeResult }, ...recentIntakes.slice(0, 4)]);
            setInput('');
        } catch (error) {
            logger.error('Intake processing failed:', error);
        }
        setIsProcessing(false);
    };

    const getDimensionColor = (dimension: string) => {
        const dim = LIFE_WHEEL_DIMENSIONS.find(d => d.id === dimension);
        return dim?.color || '#6B7280';
    };

    const getDimensionName = (dimension: string) => {
        const dim = LIFE_WHEEL_DIMENSIONS.find(d => d.id === dimension);
        return dim?.name || dimension;
    };

    const renderResult = () => {
        if (!result || !result.parsedTask) return null;

        const parsedTask = result.parsedTask;
        const dimension = result.suggestedDimension || 'lw-2';

        return (
            <View className="bg-gray-800 rounded-2xl p-6 mb-4">
                <View className="flex-row items-center mb-4">
                    <MaterialCommunityIcons name="robot" size={24} color="#10B981" />
                    <Text className="text-white text-lg font-semibold ml-2">Coach Analysis</Text>
                </View>

                {/* Parsed Task */}
                <View className="bg-gray-700 rounded-xl p-4 mb-4">
                    <Text className="text-white font-medium mb-2">{parsedTask.title}</Text>
                    {parsedTask.description && (
                        <Text className="text-gray-400 text-sm">{parsedTask.description}</Text>
                    )}
                </View>

                {/* Categorization */}
                <View className="flex-row flex-wrap mb-4">
                    <View 
                        className="px-3 py-2 rounded-full mr-2 mb-2"
                        style={{ backgroundColor: getDimensionColor(dimension) + '30' }}
                    >
                        <Text style={{ color: getDimensionColor(dimension) }}>
                            {getDimensionName(dimension)}
                        </Text>
                    </View>
                    <View className="bg-gray-700 px-3 py-2 rounded-full mr-2 mb-2">
                        <Text className="text-white">{parsedTask.estimatedPoints} points</Text>
                    </View>
                    {parsedTask.priority && (
                        <View 
                            className={`px-3 py-2 rounded-full mb-2 ${
                                parsedTask.priority === 'high' ? 'bg-red-500/30' :
                                parsedTask.priority === 'medium' ? 'bg-yellow-500/30' :
                                'bg-gray-700'
                            }`}
                        >
                            <Text 
                                className={
                                    parsedTask.priority === 'high' ? 'text-red-400' :
                                    parsedTask.priority === 'medium' ? 'text-yellow-400' :
                                    'text-gray-400'
                                }
                            >
                                {parsedTask.priority} priority
                            </Text>
                        </View>
                    )}
                </View>

                {/* Scheduling Suggestion */}
                {result.suggestedSchedule && (
                    <View className="bg-blue-500/20 p-4 rounded-xl mb-4">
                        <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="calendar-clock" size={20} color="#3B82F6" />
                            <Text className="text-blue-400 font-semibold ml-2">Suggested Schedule</Text>
                        </View>
                        <Text className="text-gray-300">
                            {result.suggestedSchedule.optimalTime || 'This week'}
                            {result.suggestedSchedule.reasoning && ` - ${result.suggestedSchedule.reasoning}`}
                        </Text>
                    </View>
                )}

                {/* Conflicts */}
                {result.conflicts && result.conflicts.length > 0 && (
                    <View className="bg-yellow-500/20 p-4 rounded-xl mb-4">
                        <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="alert" size={20} color="#EAB308" />
                            <Text className="text-yellow-400 font-semibold ml-2">Potential Conflicts</Text>
                        </View>
                        {result.conflicts.map((conflict: { message: string }, idx: number) => (
                            <Text key={idx} className="text-gray-300">• {conflict.message}</Text>
                        ))}
                    </View>
                )}

                {/* Coach Message */}
                {result.coachMessage && (
                    <View className="bg-emerald-500/20 p-4 rounded-xl">
                        <Text className="text-emerald-400">{result.coachMessage}</Text>
                    </View>
                )}

                {/* Actions */}
                <View className="flex-row gap-3 mt-4">
                    <TouchableOpacity
                        onPress={() => setResult(null)}
                        className="flex-1 bg-gray-700 p-3 rounded-xl"
                    >
                        <Text className="text-white text-center font-semibold">Adjust</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            // Add to backlog
                            setResult(null);
                        }}
                        className="flex-1 bg-emerald-500 p-3 rounded-xl"
                    >
                        <Text className="text-white text-center font-semibold">Add to Backlog</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-semibold">Quick Intake</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Type Selector */}
                <View className="flex-row mb-4">
                    {(Object.keys(typeConfig) as IntakeType[]).map(t => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => setType(t)}
                            className={`flex-1 p-3 rounded-xl mr-2 items-center ${
                                type === t ? 'bg-gray-700' : 'bg-gray-800'
                            }`}
                            style={type === t ? { borderWidth: 2, borderColor: typeConfig[t].color } : {}}
                        >
                            <MaterialCommunityIcons 
                                name={typeConfig[t].icon as any} 
                                size={24} 
                                color={type === t ? typeConfig[t].color : '#6B7280'} 
                            />
                            <Text 
                                className={`text-xs mt-1 ${type === t ? 'text-white' : 'text-gray-500'}`}
                            >
                                {typeConfig[t].label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Input Area */}
                <View className="bg-gray-800 rounded-2xl p-4 mb-4">
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder={typeConfig[type].placeholder}
                        placeholderTextColor="#6B7280"
                        className="text-white text-lg mb-4"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        style={{ minHeight: 100 }}
                    />
                    
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={!input.trim() || isProcessing}
                        className={`p-4 rounded-xl flex-row items-center justify-center ${
                            input.trim() && !isProcessing ? 'bg-emerald-500' : 'bg-gray-700'
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <ActivityIndicator color="#fff" size="small" />
                                <Text className="text-white font-semibold ml-2">Processing...</Text>
                            </>
                        ) : (
                            <>
                                <MaterialCommunityIcons name="brain" size={20} color="#fff" />
                                <Text className="text-white font-semibold ml-2">Process with AI</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Quick Tips */}
                {!result && (
                    <View className="bg-gray-800 rounded-2xl p-6 mb-4">
                        <View className="flex-row items-center mb-4">
                            <MaterialCommunityIcons name="lightbulb" size={20} color="#F59E0B" />
                            <Text className="text-white font-semibold ml-2">Tips for Better Intake</Text>
                        </View>
                        <View className="space-y-3">
                            <Text className="text-gray-400">
                                • Include context: "Review budget <Text className="text-blue-400">with Sarah</Text>"
                            </Text>
                            <Text className="text-gray-400 mt-2">
                                • Add timing: "Call mom <Text className="text-blue-400">this weekend</Text>"
                            </Text>
                            <Text className="text-gray-400 mt-2">
                                • Mention effort: "Write report - <Text className="text-blue-400">about 2 hours</Text>"
                            </Text>
                            <Text className="text-gray-400 mt-2">
                                • Set importance: "<Text className="text-blue-400">Urgent:</Text> Submit application"
                            </Text>
                        </View>
                    </View>
                )}

                {/* Result Display */}
                {renderResult()}

                {/* Recent Intakes */}
                {recentIntakes.length > 0 && !result && (
                    <View className="mb-4">
                        <Text className="text-gray-400 text-sm mb-3">Recent Intakes</Text>
                        {recentIntakes.map((intake, idx) => {
                            const intakeDimension = intake.result.suggestedDimension || 'lw-2';
                            const intakeTask = intake.result.parsedTask;
                            if (!intakeTask) return null;
                            return (
                                <View 
                                    key={idx}
                                    className="bg-gray-800 p-4 rounded-xl mb-2 flex-row items-center"
                                >
                                    <View 
                                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: getDimensionColor(intakeDimension) + '30' }}
                                    >
                                        <MaterialCommunityIcons 
                                            name="check" 
                                            size={16} 
                                            color={getDimensionColor(intakeDimension)} 
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white" numberOfLines={1}>
                                            {intakeTask.title}
                                        </Text>
                                        <Text className="text-gray-500 text-xs">
                                            {getDimensionName(intakeDimension)} • {intakeTask.estimatedPoints} pts
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Voice Input Hint */}
                <View className="bg-gray-800/50 rounded-2xl p-4 items-center">
                    <MaterialCommunityIcons name="microphone" size={32} color="#6B7280" />
                    <Text className="text-gray-500 text-sm mt-2">Voice input coming soon</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
