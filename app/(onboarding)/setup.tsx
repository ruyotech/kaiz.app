import { View, Text, Pressable, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../components/layout/Container';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppStore } from '../../store/appStore';
import { usePreferencesStore, SupportedLocale } from '../../store/preferencesStore';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

interface LifeWheelArea {
    id: string;
    name: string;
    icon: string;
    color: string;
}

const LIFE_WHEEL_AREAS: LifeWheelArea[] = [
    { id: 'lw-1', name: 'Health & Fitness', icon: '💪', color: 'bg-green-500' },
    { id: 'lw-2', name: 'Career & Work', icon: '💼', color: 'bg-blue-500' },
    { id: 'lw-3', name: 'Finance & Money', icon: '💰', color: 'bg-yellow-500' },
    { id: 'lw-4', name: 'Personal Growth', icon: '📚', color: 'bg-purple-500' },
    { id: 'lw-5', name: 'Relationships & Family', icon: '❤️', color: 'bg-red-500' },
    { id: 'lw-6', name: 'Social Life', icon: '👥', color: 'bg-pink-500' },
    { id: 'lw-7', name: 'Fun & Recreation', icon: '🎮', color: 'bg-teal-500' },
    { id: 'lw-8', name: 'Environment & Home', icon: '🏡', color: 'bg-lime-500' },
];

const WORK_STYLES = [
    { id: 'consistent', label: 'Consistent', icon: '📊', description: 'Steady pace every day' },
    { id: 'bursts', label: 'Burst Worker', icon: '⚡', description: 'Intense focus sessions' },
    { id: 'flexible', label: 'Flexible', icon: '🌊', description: 'Adapt to the day' },
    { id: 'structured', label: 'Structured', icon: '📋', description: 'Fixed schedule' },
];

const VELOCITY_LEVELS = [
    { id: 'light', label: 'Light', points: '15-25', description: 'Part-time focus' },
    { id: 'moderate', label: 'Moderate', points: '25-35', description: 'Balanced approach' },
    { id: 'heavy', label: 'Heavy', points: '35-50', description: 'High intensity' },
    { id: 'custom', label: 'Custom', points: 'Set later', description: 'I\'ll decide as I go' },
];

const PRIORITY_STYLES = [
    { id: 'urgent-first', label: 'Urgent First', icon: '🔥', description: 'Handle crises immediately' },
    { id: 'important-first', label: 'Important First', icon: '🎯', description: 'Q2 strategic work' },
    { id: 'balanced', label: 'Balanced Mix', icon: '⚖️', description: 'Split focus daily' },
    { id: 'ai-decides', label: 'AI Suggests', icon: '🤖', description: 'Let AI prioritize' },
];

const COACHING_STYLES = [
    { id: 'aggressive', label: 'Push Me Hard', icon: '💪', description: 'Challenge me constantly' },
    { id: 'supportive', label: 'Supportive Coach', icon: '🤝', description: 'Encourage and guide' },
    { id: 'minimal', label: 'Minimal Nudges', icon: '👁️', description: 'Only when needed' },
    { id: 'data-only', label: 'Just Data', icon: '📊', description: 'Show metrics, I decide' },
];

type OnboardingStep = 'personal' | 'balance' | 'capacity' | 'priorities' | 'coaching';

export default function SetupScreen() {
    const router = useRouter();
    const { setOnboarded } = useAppStore();
    const {
        locale,
        setLocale,
        setTimezone,
        setSelectedLifeWheelAreas,
        toggleLifeWheelArea,
        setNotificationPreferences,
        markOnboardingComplete,
        selectedLifeWheelAreaIds,
    } = usePreferencesStore();

    const [currentStep, setCurrentStep] = useState<OnboardingStep>('personal');
    const [loading, setLoading] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    // Step 1: Personal
    const [fullName, setFullName] = useState('');
    const [detectedTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York');
    
    const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === locale) || SUPPORTED_LANGUAGES[0];

    // Step 3: Capacity
    const [workStyle, setWorkStyle] = useState('flexible');
    const [velocityLevel, setVelocityLevel] = useState('moderate');

    // Step 4: Priorities
    const [priorityStyle, setPriorityStyle] = useState('balanced');

    // Step 5: Coaching
    const [coachingStyle, setCoachingStyle] = useState('supportive');
    const [enableDailyReminders, setEnableDailyReminders] = useState(true);
    const [enableAiInsights, setEnableAiInsights] = useState(true);

    const steps: OnboardingStep[] = ['personal', 'balance', 'capacity', 'priorities', 'coaching'];
    const currentStepIndex = steps.indexOf(currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 'personal':
                if (!fullName.trim()) {
                    Alert.alert('Required', 'Please enter your name');
                    return false;
                }
                return true;
            case 'balance':
                if (selectedLifeWheelAreaIds.length === 0) {
                    Alert.alert('Required', 'Please select at least one life area');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (!validateCurrentStep()) return;

        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex]);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex]);
        }
    };

    const handleComplete = async () => {
        setLoading(true);

        try {
            // Save all preferences
            setTimezone(detectedTimezone);
            setNotificationPreferences({
                enableDailyReminders,
                enableAiInsights,
                enableChallengeUpdates: true,
                enableBillReminders: true,
            });
            markOnboardingComplete();

            // Save work preferences (we'll add these to the store later if needed)
            // For now, these can be stored in user profile when they create an account
            
            await new Promise((resolve) => setTimeout(resolve, 500));

            setOnboarded(true);
            setLoading(false);
            
            // Go to registration
            // @ts-ignore - Dynamic route
            router.replace('/(auth)/register');
        } catch (error) {
            Alert.alert('Error', 'Setup failed. Please try again.');
            setLoading(false);
        }
    };

    const handleLanguageSelect = (langCode: SupportedLocale) => {
        setLocale(langCode);
        setShowLanguageModal(false);
    };

    return (
        <Container safeArea={false}>
            <View className="flex-1 pt-12">
                {/* Progress Bar */}
                <View className="px-6 mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-sm font-semibold text-gray-900">
                            Step {currentStepIndex + 1} of {steps.length}
                        </Text>
                        <Text className="text-sm text-gray-600">
                            {Math.round(progress)}%
                        </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </View>
                </View>

                {/* Content */}
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {currentStep === 'personal' && (
                        <PersonalStep
                            fullName={fullName}
                            setFullName={setFullName}
                            timezone={detectedTimezone}
                            currentLanguage={currentLanguage}
                            onLanguagePress={() => setShowLanguageModal(true)}
                        />
                    )}

                    {currentStep === 'balance' && (
                        <BalanceStep
                            areas={LIFE_WHEEL_AREAS}
                            selectedAreas={selectedLifeWheelAreaIds}
                            toggleArea={toggleLifeWheelArea}
                        />
                    )}

                    {currentStep === 'capacity' && (
                        <CapacityStep
                            workStyle={workStyle}
                            setWorkStyle={setWorkStyle}
                            velocityLevel={velocityLevel}
                            setVelocityLevel={setVelocityLevel}
                        />
                    )}

                    {currentStep === 'priorities' && (
                        <PrioritiesStep
                            priorityStyle={priorityStyle}
                            setPriorityStyle={setPriorityStyle}
                        />
                    )}

                    {currentStep === 'coaching' && (
                        <CoachingStep
                            coachingStyle={coachingStyle}
                            setCoachingStyle={setCoachingStyle}
                            enableDailyReminders={enableDailyReminders}
                            setEnableDailyReminders={setEnableDailyReminders}
                            enableAiInsights={enableAiInsights}
                            setEnableAiInsights={setEnableAiInsights}
                        />
                    )}
                </ScrollView>

                {/* Bottom Actions - Fixed positioning */}
                <View className="bg-white border-t border-gray-200 px-6 py-4">
                    <View className="flex-row gap-3">
                        {currentStepIndex > 0 && (
                            <View className="flex-1">
                                <Button
                                    onPress={handleBack}
                                    variant="outline"
                                    size="lg"
                                >
                                    Back
                                </Button>
                            </View>
                        )}
                        <View className="flex-1">
                            <Button
                                onPress={handleNext}
                                size="lg"
                                loading={loading}
                            >
                                {currentStepIndex === steps.length - 1 ? 'Complete' : 'Continue'}
                            </Button>
                        </View>
                    </View>
                </View>

                {/* Language Selection Modal */}
                <Modal
                    visible={showLanguageModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowLanguageModal(false)}
                >
                    <TouchableOpacity
                        className="flex-1 bg-black/50 justify-end"
                        activeOpacity={1}
                        onPress={() => setShowLanguageModal(false)}
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={(e) => e.stopPropagation()}
                            className="bg-white rounded-t-3xl"
                        >
                            <View className="p-6">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-2xl font-bold text-gray-900">Select Language</Text>
                                    <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                        <MaterialCommunityIcons name="close" size={24} color="#374151" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView className="max-h-96">
                                    {SUPPORTED_LANGUAGES.map((lang) => (
                                        <TouchableOpacity
                                            key={lang.code}
                                            onPress={() => handleLanguageSelect(lang.code)}
                                            className={`flex-row items-center py-4 px-4 rounded-lg mb-2 ${
                                                locale === lang.code ? 'bg-blue-50' : 'bg-gray-50'
                                            }`}
                                        >
                                            <Text className="text-3xl mr-4">{lang.flag}</Text>
                                            <View className="flex-1">
                                                <Text className="text-base font-semibold text-gray-900">
                                                    {lang.nativeName}
                                                </Text>
                                                <Text className="text-sm text-gray-600">{lang.name}</Text>
                                            </View>
                                            {locale === lang.code && (
                                                <MaterialCommunityIcons name="check-circle" size={24} color="#3B82F6" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            </View>
        </Container>
    );
}

// Step 1: Personal Setup
function PersonalStep({
    fullName,
    setFullName,
    timezone,
    currentLanguage,
    onLanguagePress,
}: {
    fullName: string;
    setFullName: (value: string) => void;
    timezone: string;
    currentLanguage: any;
    onLanguagePress: () => void;
}) {
    return (
        <Animated.View entering={FadeInDown} exiting={FadeOutUp} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">Let's personalize your experience</Text>
            <Text className="text-base text-gray-600 mb-8">
                First, tell us a bit about yourself
            </Text>

            <Input
                label="Your Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
            />

            <TouchableOpacity
                onPress={onLanguagePress}
                className="mb-4"
            >
                <Text className="text-sm font-semibold text-gray-700 mb-2">Language</Text>
                <View className="bg-gray-50 rounded-lg px-4 py-4 flex-row items-center justify-between border border-gray-200">
                    <View className="flex-row items-center">
                        <Text className="text-3xl mr-3">{currentLanguage.flag}</Text>
                        <Text className="text-base text-gray-800 font-medium">{currentLanguage.nativeName}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                </View>
            </TouchableOpacity>

            <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Timezone</Text>
                <View className="bg-gray-50 rounded-lg px-4 py-4 border border-gray-200">
                    <Text className="text-base text-gray-800">{timezone}</Text>
                </View>
                <Text className="text-xs text-gray-500 mt-1">Auto-detected from your device</Text>
            </View>

            <View className="mt-6 p-4 bg-blue-50 rounded-xl">
                <Text className="text-sm text-blue-900">
                    🌍 <Text className="font-semibold">International App:</Text> Kaiz works in your language and timezone, wherever you are.
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 2: Life Balance
function BalanceStep({
    areas,
    selectedAreas,
    toggleArea,
}: {
    areas: LifeWheelArea[];
    selectedAreas: string[];
    toggleArea: (id: string) => void;
}) {
    return (
        <Animated.View entering={FadeInDown} exiting={FadeOutUp} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">What areas of life matter most?</Text>
            <Text className="text-base text-gray-600 mb-8">
                Select the dimensions you want to track and balance
            </Text>

            <View className="flex-row flex-wrap gap-3">
                {areas.map((area) => {
                    const isSelected = selectedAreas.includes(area.id);
                    return (
                        <Pressable
                            key={area.id}
                            onPress={() => toggleArea(area.id)}
                            className={`
                                px-4 py-3 rounded-xl border-2 flex-row items-center gap-2
                                ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}
                            `}
                        >
                            <Text className="text-2xl">{area.icon}</Text>
                            <Text
                                className={`font-semibold text-sm ${
                                    isSelected ? 'text-blue-900' : 'text-gray-700'
                                }`}
                            >
                                {area.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View className="mt-6 p-4 bg-purple-50 rounded-xl">
                <Text className="text-sm text-purple-900">
                    ⚖️ <Text className="font-semibold">Life Wheel:</Text> Kaiz tracks your sprint points across these areas, so you can see if you're neglecting anything important.
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 3: Sprint Capacity
function CapacityStep({
    workStyle,
    setWorkStyle,
    velocityLevel,
    setVelocityLevel,
}: {
    workStyle: string;
    setWorkStyle: (style: string) => void;
    velocityLevel: string;
    setVelocityLevel: (level: string) => void;
}) {
    return (
        <Animated.View entering={FadeInDown} exiting={FadeOutUp} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">How do you work best?</Text>
            <Text className="text-base text-gray-600 mb-8">
                Help us set your weekly sprint capacity
            </Text>

            <Text className="text-lg font-bold text-gray-900 mb-3">Work Style</Text>
            <View className="gap-3 mb-6">
                {WORK_STYLES.map((style) => (
                    <Pressable
                        key={style.id}
                        onPress={() => setWorkStyle(style.id)}
                        className={`
                            p-4 rounded-xl border-2 flex-row items-center
                            ${workStyle === style.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}
                        `}
                    >
                        <Text className="text-3xl mr-3">{style.icon}</Text>
                        <View className="flex-1">
                            <Text className={`text-base font-bold ${
                                workStyle === style.id ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                                {style.label}
                            </Text>
                            <Text className="text-sm text-gray-600">{style.description}</Text>
                        </View>
                        {workStyle === style.id && (
                            <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
                                <Text className="text-white text-xs font-bold">✓</Text>
                            </View>
                        )}
                    </Pressable>
                ))}
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-3">Weekly Velocity</Text>
            <View className="gap-3">
                {VELOCITY_LEVELS.map((level) => (
                    <Pressable
                        key={level.id}
                        onPress={() => setVelocityLevel(level.id)}
                        className={`
                            p-4 rounded-xl border-2
                            ${velocityLevel === level.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}
                        `}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className={`text-base font-bold mb-1 ${
                                    velocityLevel === level.id ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                    {level.label} ({level.points} points)
                                </Text>
                                <Text className="text-sm text-gray-600">{level.description}</Text>
                            </View>
                            {velocityLevel === level.id && (
                                <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
                                    <Text className="text-white text-xs font-bold">✓</Text>
                                </View>
                            )}
                        </View>
                    </Pressable>
                ))}
            </View>

            <View className="mt-6 p-4 bg-green-50 rounded-xl">
                <Text className="text-sm text-green-900">
                    📊 <Text className="font-semibold">Velocity Protection:</Text> Kaiz will warn you when you're overcommitting and track your real capacity over time.
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 4: Priorities
function PrioritiesStep({
    priorityStyle,
    setPriorityStyle,
}: {
    priorityStyle: string;
    setPriorityStyle: (style: string) => void;
}) {
    return (
        <Animated.View entering={FadeInDown} exiting={FadeOutUp} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">How do you prioritize?</Text>
            <Text className="text-base text-gray-600 mb-8">
                Choose your approach to the Eisenhower Matrix
            </Text>

            <View className="gap-3">
                {PRIORITY_STYLES.map((style) => (
                    <Pressable
                        key={style.id}
                        onPress={() => setPriorityStyle(style.id)}
                        className={`
                            p-4 rounded-xl border-2 flex-row items-center
                            ${priorityStyle === style.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}
                        `}
                    >
                        <Text className="text-3xl mr-3">{style.icon}</Text>
                        <View className="flex-1">
                            <Text className={`text-base font-bold ${
                                priorityStyle === style.id ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                                {style.label}
                            </Text>
                            <Text className="text-sm text-gray-600">{style.description}</Text>
                        </View>
                        {priorityStyle === style.id && (
                            <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
                                <Text className="text-white text-xs font-bold">✓</Text>
                            </View>
                        )}
                    </Pressable>
                ))}
            </View>

            <View className="mt-6 p-4 bg-yellow-50 rounded-xl">
                <Text className="text-sm text-yellow-900">
                    🎯 <Text className="font-semibold">Q2 Matters:</Text> Kaiz watches your Q2 (Important, Not Urgent) work. That's where your future is built.
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 5: AI Coaching
function CoachingStep({
    coachingStyle,
    setCoachingStyle,
    enableDailyReminders,
    setEnableDailyReminders,
    enableAiInsights,
    setEnableAiInsights,
}: {
    coachingStyle: string;
    setCoachingStyle: (style: string) => void;
    enableDailyReminders: boolean;
    setEnableDailyReminders: (value: boolean) => void;
    enableAiInsights: boolean;
    setEnableAiInsights: (value: boolean) => void;
}) {
    return (
        <Animated.View entering={FadeInDown} exiting={FadeOutUp} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">What kind of coach do you need?</Text>
            <Text className="text-base text-gray-600 mb-8">
                Configure your AI Scrum Master
            </Text>

            <View className="gap-3 mb-6">
                {COACHING_STYLES.map((style) => (
                    <Pressable
                        key={style.id}
                        onPress={() => setCoachingStyle(style.id)}
                        className={`
                            p-4 rounded-xl border-2 flex-row items-center
                            ${coachingStyle === style.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}
                        `}
                    >
                        <Text className="text-3xl mr-3">{style.icon}</Text>
                        <View className="flex-1">
                            <Text className={`text-base font-bold ${
                                coachingStyle === style.id ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                                {style.label}
                            </Text>
                            <Text className="text-sm text-gray-600">{style.description}</Text>
                        </View>
                        {coachingStyle === style.id && (
                            <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
                                <Text className="text-white text-xs font-bold">✓</Text>
                            </View>
                        )}
                    </Pressable>
                ))}
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-3">Notifications</Text>
            <View className="gap-3">
                <Pressable
                    onPress={() => setEnableDailyReminders(!enableDailyReminders)}
                    className="flex-row items-center justify-between p-4 rounded-xl bg-gray-50"
                >
                    <View className="flex-1 mr-3">
                        <Text className="font-semibold text-base text-gray-900">Daily Sprint Reminders</Text>
                        <Text className="text-sm text-gray-600">Morning planning & evening review</Text>
                    </View>
                    <View
                        className={`w-12 h-7 rounded-full p-1 ${
                            enableDailyReminders ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                        <View
                            className={`w-5 h-5 rounded-full bg-white ${
                                enableDailyReminders ? 'ml-auto' : ''
                            }`}
                        />
                    </View>
                </Pressable>

                <Pressable
                    onPress={() => setEnableAiInsights(!enableAiInsights)}
                    className="flex-row items-center justify-between p-4 rounded-xl bg-gray-50"
                >
                    <View className="flex-1 mr-3">
                        <Text className="font-semibold text-base text-gray-900">AI Insights & Warnings</Text>
                        <Text className="text-sm text-gray-600">Capacity alerts & smart suggestions</Text>
                    </View>
                    <View
                        className={`w-12 h-7 rounded-full p-1 ${
                            enableAiInsights ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                    >
                        <View
                            className={`w-5 h-5 rounded-full bg-white ${
                                enableAiInsights ? 'ml-auto' : ''
                            }`}
                        />
                    </View>
                </Pressable>
            </View>

            <View className="mt-6 p-4 bg-indigo-50 rounded-xl">
                <Text className="text-sm text-indigo-900">
                    🤖 <Text className="font-semibold">AI Proposes, You Decide:</Text> Your AI Scrum Master never changes anything without your permission.
                </Text>
            </View>
        </Animated.View>
    );
}
