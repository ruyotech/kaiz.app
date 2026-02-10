import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useChallengeStore } from '../../../store/challengeStore';
import { Challenge, ChallengeMetricType, ChallengeRecurrence } from '../../../types/models';

const LIFE_WHEEL_AREAS = [
    { id: 'life-health', name: 'Health', icon: 'arm-flex-outline', color: '#10b981' },
    { id: 'life-career', name: 'Career', icon: 'briefcase-outline', color: '#3b82f6' },
    { id: 'life-finance', name: 'Finance', icon: 'cash-multiple', color: '#f59e0b' },
    { id: 'life-family', name: 'Family', icon: 'account-supervisor-outline', color: '#ec4899' },
    { id: 'life-romance', name: 'Romance', icon: 'heart-outline', color: '#ef4444' },
    { id: 'life-friends', name: 'Friends', icon: 'account-group-outline', color: '#8b5cf6' },
    { id: 'life-growth', name: 'Growth', icon: 'sprout-outline', color: '#06b6d4' },
    { id: 'life-fun', name: 'Fun', icon: 'party-popper', color: '#f97316' },
    { id: 'life-environment', name: 'Environment', icon: 'home-outline', color: '#84cc16' },
];

const METRIC_TYPES: { id: ChallengeMetricType; name: string; description: string }[] = [
    { id: 'count', name: 'Count', description: 'Track numbers (steps, pages, etc.)' },
    { id: 'yesno', name: 'Yes/No', description: 'Did it or didn\'t (binary)' },
    { id: 'streak', name: 'Streak', description: 'Consecutive days' },
    { id: 'time', name: 'Time', description: 'Minutes or hours' },
    { id: 'completion', name: 'Completion', description: 'Task milestones' },
];

const RECURRENCE_OPTIONS: { id: ChallengeRecurrence; name: string }[] = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'biweekly', name: 'Bi-weekly' },
    { id: 'monthly', name: 'Monthly' },
];

const DURATION_PRESETS = [7, 14, 21, 30, 60, 90, 365];

export default function CreateChallengeScreen() {
    const router = useRouter();
    const { templateId } = useLocalSearchParams<{ templateId?: string }>();
    const { templates, createChallenge, createChallengeFromTemplate, loading } = useChallengeStore();
    
    const [step, setStep] = useState(1); // 1: Basics, 2: Configuration, 3: Motivation, 4: Preview
    
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [lifeWheelAreaId, setLifeWheelAreaId] = useState('life-health');
    const [metricType, setMetricType] = useState<ChallengeMetricType>('count');
    const [targetValue, setTargetValue] = useState('');
    const [unit, setUnit] = useState('');
    const [duration, setDuration] = useState(30);
    const [recurrence, setRecurrence] = useState<ChallengeRecurrence>('daily');
    const [whyStatement, setWhyStatement] = useState('');
    const [rewardDescription, setRewardDescription] = useState('');
    const [graceDays, setGraceDays] = useState(0);
    const [sprintIntegration, setSprintIntegration] = useState(false);
    const [pointValue, setPointValue] = useState('2');
    const [challengeType, setChallengeType] = useState<'solo' | 'group'>('solo');
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderTime, setReminderTime] = useState('09:00');
    
    useEffect(() => {
        // Pre-fill from template if provided
        if (templateId) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                setName(template.name);
                setDescription(template.description);
                setLifeWheelAreaId(template.lifeWheelAreaId);
                setMetricType(template.metricType);
                setTargetValue(template.targetValue?.toString() || '');
                setUnit(template.unit || '');
                setDuration(template.suggestedDuration);
                setRecurrence(template.recurrence);
            }
        }
    }, [templateId, templates]);
    
    const validateStep = (currentStep: number): boolean => {
        switch (currentStep) {
            case 1:
                if (!name.trim()) {
                    Alert.alert('Error', 'Please enter a challenge name');
                    return false;
                }
                return true;
            case 2:
                if ((metricType === 'count' || metricType === 'time') && !targetValue) {
                    Alert.alert('Error', 'Please enter a target value');
                    return false;
                }
                if ((metricType === 'count' || metricType === 'time') && !unit.trim()) {
                    Alert.alert('Error', 'Please enter a unit (e.g., steps, minutes)');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };
    
    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };
    
    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };
    
    const handleCreate = async () => {
        if (!validateStep(step)) return;
        
        const challengeData: Partial<Challenge> = {
            name,
            description,
            lifeWheelAreaId,
            metricType,
            targetValue: targetValue ? parseInt(targetValue) : undefined,
            unit: unit || undefined,
            duration,
            recurrence,
            whyStatement: whyStatement || undefined,
            rewardDescription: rewardDescription || undefined,
            graceDays,
            sprintIntegration,
            pointValue: sprintIntegration ? parseInt(pointValue) : undefined,
            challengeType,
            reminderEnabled,
            reminderTime: reminderEnabled ? reminderTime : undefined,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
            visibility: 'private',
            currentStreak: 0,
            bestStreak: 0,
            totalCompletions: 0,
            totalMissed: 0,
            createdByUserId: 'user-1', // TODO: get from auth
        };
        
        try {
            const newChallenge = await createChallenge(challengeData);
            router.replace(`/(tabs)/challenges/challenge/${newChallenge.id}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to create challenge');
        }
    };
    
    return (
        <Container safeArea={false}>
            <ScreenHeader
                title={`Create Challenge (${step}/4)`}
                subtitle={
                    step === 1 ? 'Basic Info' :
                    step === 2 ? 'Configuration' :
                    step === 3 ? 'Motivation' : 'Review'
                }
                showBack
                useSafeArea={false}
            />
            
            <ScrollView className="flex-1 p-4">
                {/* Step 1: Basics */}
                {step === 1 && (
                    <>
                        <Card className="mb-4">
                            <Text className="text-lg font-semibold mb-3">Challenge Name</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="e.g., 10K Steps Daily"
                                className="border border-gray-300 rounded-lg px-4 py-3 text-base mb-4"
                            />
                            
                            <Text className="text-lg font-semibold mb-3">Description (Optional)</Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="What's this challenge about?"
                                multiline
                                numberOfLines={3}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                            />
                        </Card>
                        
                        <Card className="mb-4">
                            <Text className="text-lg font-semibold mb-3">Life Wheel Dimension</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {LIFE_WHEEL_AREAS.map(area => (
                                    <TouchableOpacity
                                        key={area.id}
                                        onPress={() => setLifeWheelAreaId(area.id)}
                                        className={`px-4 py-3 rounded-lg border-2 ${
                                            lifeWheelAreaId === area.id ? '' : 'bg-gray-50'
                                        }`}
                                        style={{
                                            borderColor: lifeWheelAreaId === area.id ? area.color : '#e5e7eb',
                                            backgroundColor: lifeWheelAreaId === area.id ? `${area.color}20` : undefined,
                                        }}
                                    >
                                        <Text className="text-2xl mb-1">{area.icon}</Text>
                                        <Text className="text-sm font-semibold">{area.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Card>
                        
                        <Card>
                            <Text className="text-lg font-semibold mb-3">Challenge Type</Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setChallengeType('solo')}
                                    className={`flex-1 py-4 rounded-lg border-2 ${
                                        challengeType === 'solo' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                    }`}
                                >
                                    <MaterialCommunityIcons name="meditation" size={28} color={challengeType === 'solo' ? '#2563eb' : '#6b7280'} />
                                    <Text className="text-center font-semibold">Solo</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setChallengeType('group')}
                                    className={`flex-1 py-4 rounded-lg border-2 ${
                                        challengeType === 'group' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                    }`}
                                >
                                    <Text className="text-center text-2xl mb-1"></Text>
                                    <Text className="text-center font-semibold">Group</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    </>
                )}
                
                {/* Step 2: Configuration */}
                {step === 2 && (
                    <>
                        <Card className="mb-4">
                            <Text className="text-lg font-semibold mb-3">Metric Type</Text>
                            {METRIC_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.id}
                                    onPress={() => setMetricType(type.id)}
                                    className={`mb-2 p-4 rounded-lg border-2 ${
                                        metricType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                    }`}
                                >
                                    <Text className="font-semibold mb-1">{type.name}</Text>
                                    <Text className="text-sm text-gray-600">{type.description}</Text>
                                </TouchableOpacity>
                            ))}
                        </Card>
                        
                        {(metricType === 'count' || metricType === 'time') && (
                            <Card className="mb-4">
                                <Text className="text-lg font-semibold mb-3">Target & Unit</Text>
                                <View className="flex-row gap-3 mb-3">
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-600 mb-2">Target Value</Text>
                                        <TextInput
                                            value={targetValue}
                                            onChangeText={setTargetValue}
                                            placeholder="10000"
                                            keyboardType="numeric"
                                            className="border border-gray-300 rounded-lg px-4 py-3"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm text-gray-600 mb-2">Unit</Text>
                                        <TextInput
                                            value={unit}
                                            onChangeText={setUnit}
                                            placeholder="steps"
                                            className="border border-gray-300 rounded-lg px-4 py-3"
                                        />
                                    </View>
                                </View>
                            </Card>
                        )}
                        
                        <Card className="mb-4">
                            <Text className="text-lg font-semibold mb-3">Duration (Days)</Text>
                            <View className="flex-row flex-wrap gap-2 mb-3">
                                {DURATION_PRESETS.map(days => (
                                    <TouchableOpacity
                                        key={days}
                                        onPress={() => setDuration(days)}
                                        className={`px-4 py-2 rounded-full ${
                                            duration === days ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <Text className={`font-semibold ${
                                            duration === days ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            {days}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                value={duration.toString()}
                                onChangeText={(text) => setDuration(parseInt(text) || 30)}
                                placeholder="Custom duration"
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg px-4 py-3"
                            />
                        </Card>
                        
                        <Card>
                            <Text className="text-lg font-semibold mb-3">Recurrence</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {RECURRENCE_OPTIONS.map(option => (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => setRecurrence(option.id)}
                                        className={`px-4 py-2 rounded-full ${
                                            recurrence === option.id ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <Text className={`font-semibold ${
                                            recurrence === option.id ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            {option.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Card>
                    </>
                )}
                
                {/* Step 3: Motivation */}
                {step === 3 && (
                    <>
                        <Card className="mb-4">
                            <Text className="text-lg font-semibold mb-3">Why are you doing this?</Text>
                            <TextInput
                                value={whyStatement}
                                onChangeText={setWhyStatement}
                                placeholder="Your motivation..."
                                multiline
                                numberOfLines={3}
                                className="border border-gray-300 rounded-lg px-4 py-3"
                            />
                        </Card>
                        
                        <Card className="mb-4">
                            <Text className="text-lg font-semibold mb-3">Reward (Optional)</Text>
                            <TextInput
                                value={rewardDescription}
                                onChangeText={setRewardDescription}
                                placeholder="How will you celebrate?"
                                multiline
                                numberOfLines={2}
                                className="border border-gray-300 rounded-lg px-4 py-3"
                            />
                        </Card>
                        
                        <Card className="mb-4">
                            <Text className="text-lg font-semibold mb-3">Grace Days</Text>
                            <Text className="text-sm text-gray-600 mb-3">
                                Number of days you can miss without breaking your streak
                            </Text>
                            <View className="flex-row gap-2">
                                {[0, 1, 2, 3, 5].map(days => (
                                    <TouchableOpacity
                                        key={days}
                                        onPress={() => setGraceDays(days)}
                                        className={`px-4 py-2 rounded-full ${
                                            graceDays === days ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <Text className={`font-semibold ${
                                            graceDays === days ? 'text-white' : 'text-gray-700'
                                        }`}>
                                            {days}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Card>
                        
                        <Card className="mb-4">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-lg font-semibold">Sprint Integration</Text>
                                <Switch
                                    value={sprintIntegration}
                                    onValueChange={setSprintIntegration}
                                />
                            </View>
                            <Text className="text-sm text-gray-600 mb-3">
                                Auto-create sprint tasks and track in velocity
                            </Text>
                            {sprintIntegration && (
                                <View>
                                    <Text className="text-sm text-gray-600 mb-2">Points per completion</Text>
                                    <TextInput
                                        value={pointValue}
                                        onChangeText={setPointValue}
                                        placeholder="2"
                                        keyboardType="numeric"
                                        className="border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </View>
                            )}
                        </Card>
                        
                        <Card>
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-lg font-semibold">Daily Reminder</Text>
                                <Switch
                                    value={reminderEnabled}
                                    onValueChange={setReminderEnabled}
                                />
                            </View>
                            {reminderEnabled && (
                                <View>
                                    <Text className="text-sm text-gray-600 mb-2">Reminder Time</Text>
                                    <TextInput
                                        value={reminderTime}
                                        onChangeText={setReminderTime}
                                        placeholder="09:00"
                                        className="border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </View>
                            )}
                        </Card>
                    </>
                )}
                
                {/* Step 4: Preview */}
                {step === 4 && (
                    <>
                        <Card className="mb-4 bg-blue-50">
                            <Text className="text-2xl mb-2">
                                {LIFE_WHEEL_AREAS.find(a => a.id === lifeWheelAreaId)?.icon}
                            </Text>
                            <Text className="text-2xl font-bold mb-2">{name}</Text>
                            {description && (
                                <Text className="text-gray-600 mb-3">{description}</Text>
                            )}
                            <View className="flex-row gap-2 flex-wrap">
                                <View className="px-3 py-1 rounded-full bg-blue-100">
                                    <Text className="text-sm text-blue-700">{challengeType}</Text>
                                </View>
                                <View className="px-3 py-1 rounded-full bg-blue-100">
                                    <Text className="text-sm text-blue-700">{duration} days</Text>
                                </View>
                                <View className="px-3 py-1 rounded-full bg-blue-100">
                                    <Text className="text-sm text-blue-700">{recurrence}</Text>
                                </View>
                            </View>
                        </Card>
                        
                        <Card className="mb-4">
                            <Text className="font-semibold mb-2">Tracking</Text>
                            <Text className="text-gray-700">
                                {metricType === 'count' && `Count ${targetValue} ${unit}`}
                                {metricType === 'time' && `Track ${targetValue} ${unit}`}
                                {metricType === 'yesno' && 'Yes/No completion'}
                                {metricType === 'streak' && 'Streak tracking'}
                                {metricType === 'completion' && 'Task milestones'}
                            </Text>
                        </Card>
                        
                        {whyStatement && (
                            <Card className="mb-4">
                                <Text className="font-semibold mb-2">Why</Text>
                                <Text className="text-gray-700">{whyStatement}</Text>
                            </Card>
                        )}
                        
                        {rewardDescription && (
                            <Card className="mb-4">
                                <Text className="font-semibold mb-2">Reward</Text>
                                <Text className="text-gray-700">{rewardDescription}</Text>
                            </Card>
                        )}
                        
                        <Card className="mb-4">
                            <Text className="font-semibold mb-2">Settings</Text>
                            <Text className="text-gray-700 mb-1">Grace Days: {graceDays}</Text>
                            <Text className="text-gray-700 mb-1">
                                Sprint Integration: {sprintIntegration ? `Yes (${pointValue} pts)` : 'No'}
                            </Text>
                            <Text className="text-gray-700">
                                Reminders: {reminderEnabled ? `Yes (${reminderTime})` : 'No'}
                            </Text>
                        </Card>
                    </>
                )}
            </ScrollView>
            
            {/* Navigation Buttons */}
            <View className="p-4 border-t border-gray-200">
                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <Button
                            onPress={handleBack}
                            variant="outline"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </Button>
                    </View>
                    <View className="flex-1">
                        <Button
                            onPress={step === 4 ? handleCreate : handleNext}
                            disabled={loading}
                        >
                            {step === 4 ? 'Create Challenge' : 'Next'}
                        </Button>
                    </View>
                </View>
            </View>
        </Container>
    );
}
