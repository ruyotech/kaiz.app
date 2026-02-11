import { logger } from '../../utils/logger';
/**
 * Onboarding V4 - Engaging New User Experience
 * 
 * A completely redesigned onboarding that:
 * 1. Collects useful marketing data (name, referral source)
 * 2. Handles plan types (Individual, Family, Corporate)
 * 3. Lets users pick from engaging task/epic templates
 * 4. Optionally add important dates (birthdays, anniversaries)
 * 5. Results in a pre-populated sprint backlog
 * 
 * Flow:
 * Step 0: Welcome & Name
 * Step 1: Plan Type Selection
 * Step 2: Pick Your Focus Areas (Goal Categories)
 * Step 3: Customize Your Tasks
 * Step 4: Important Dates (Optional)
 * Step 5: Final Setup & Account Creation
 */

import { View, Text, Pressable, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import Animated, { 
    FadeInDown, 
    FadeOutUp, 
    FadeInRight,
    FadeOutLeft,
    SlideInRight,
    SlideOutLeft,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../components/layout/Container';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore, GOAL_CATEGORIES, EPIC_TEMPLATES, REFERRAL_SOURCES, LIFE_WHEEL_ASSESSMENT, QUICK_START_BUNDLES, TaskTemplate, ImportantDate, LifeWheelQuestion, QuickStartBundle } from '../../store/onboardingStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { onboardingApi, OnboardingRequest } from '../../services/api';

type OnboardingStep = 'welcome' | 'plan' | 'assessment' | 'goals' | 'tasks' | 'dates' | 'account';

const STEPS: OnboardingStep[] = ['welcome', 'plan', 'assessment', 'goals', 'tasks', 'dates', 'account'];

export default function OnboardingSetup() {
    const router = useRouter();
    const { setOnboarded } = useAppStore();
    const { register } = useAuthStore();
    const { markOnboardingComplete } = usePreferencesStore();
    const {
        data,
        currentStep,
        setFirstName,
        setLastName,
        setPlanType,
        setCorporateCode,
        setLifeWheelScore,
        selectBundle,
        toggleGoalCategory,
        toggleTaskTemplate,
        toggleEpicTemplate,
        addImportantDate,
        removeImportantDate,
        setHowDidYouHear,
        setMainGoal,
        getSelectedTemplates,
        getSelectedEpics,
        getEstimatedWeeklyPoints,
        getLowScoringAreas,
        getSuggestedTemplatesFromAssessment,
        completeOnboarding,
        reset: resetOnboarding,
    } = useOnboardingStore();

    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [loading, setLoading] = useState(false);
    
    // Account creation fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const stepIndex = STEPS.indexOf(step);
    const progress = ((stepIndex + 1) / STEPS.length) * 100;

    const canProceed = (): boolean => {
        switch (step) {
            case 'welcome':
                return data.firstName.trim().length >= 2;
            case 'plan':
                if (data.planType === 'corporate') {
                    return (data.corporateCode?.trim().length || 0) >= 3;
                }
                return true;
            case 'assessment':
                // Require at least 4 areas to be rated for engagement
                return Object.keys(data.lifeWheelScores).length >= 4;
            case 'goals':
                return data.selectedGoalCategories.length >= 1 || data.selectedBundleId !== undefined;
            case 'tasks':
                return data.selectedTaskTemplates.length >= 1;
            case 'dates':
                return true; // Optional step
            case 'account':
                return email.trim().length > 0 && password.length >= 8;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (!canProceed()) {
            const messages: Record<OnboardingStep, string> = {
                welcome: 'Please enter your first name',
                plan: data.planType === 'corporate' ? 'Please enter your company code' : '',
                assessment: 'Please rate at least 4 life areas to continue',
                goals: 'Please select at least one focus area or quick start bundle',
                tasks: 'Please select at least one task',
                dates: '',
                account: 'Please fill in your email and password',
            };
            if (messages[step]) {
                Alert.alert('Required', messages[step]);
                return;
            }
        }

        const nextIndex = stepIndex + 1;
        if (nextIndex < STEPS.length) {
            setStep(STEPS[nextIndex]);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        const prevIndex = stepIndex - 1;
        if (prevIndex >= 0) {
            setStep(STEPS[prevIndex]);
        }
    };

    const handleSkipDates = () => {
        setStep('account');
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            const fullName = `${data.firstName} ${data.lastName}`.trim();
            
            // Register the user first
            await register(email, password, fullName);
            
            // Now complete onboarding by creating tasks/epics/events
            const onboardingRequest: OnboardingRequest = {
                firstName: data.firstName,
                lastName: data.lastName || undefined,
                planType: data.planType.toUpperCase() as 'INDIVIDUAL' | 'FAMILY' | 'CORPORATE',
                corporateCode: data.corporateCode,
                familyRole: data.familyRole,
                selectedTaskTemplateIds: data.selectedTaskTemplates,
                selectedEpicTemplateIds: data.selectedEpicTemplates,
                importantDates: data.importantDates.map(d => ({
                    personName: d.personName,
                    relationship: d.relationship,
                    dateType: d.dateType,
                    date: d.date,
                    year: d.year,
                    reminderDaysBefore: d.reminderDaysBefore,
                })),
                preferredWorkStyle: data.preferredWorkStyle,
                weeklyCommitmentHours: data.weeklyCommitmentHours,
                howDidYouHear: data.howDidYouHear,
                mainGoal: data.mainGoal,
            };

            try {
                const result = await onboardingApi.completeOnboarding(onboardingRequest);
                logger.log('Onboarding completed:', result);
            } catch (apiError) {
                // If onboarding API fails, continue anyway - user is registered
                logger.warn('Onboarding API failed, but user is registered:', apiError);
            }
            
            // Mark onboarding complete
            completeOnboarding();
            markOnboardingComplete();
            setOnboarded(true);
            
            Alert.alert(
                'Welcome to Kaiz!',
                `You're all set, ${data.firstName}! We've prepared ${data.selectedTaskTemplates.length} tasks and ${data.selectedEpicTemplates.length} epics for your first sprints.`,
                [{ text: 'Let\'s Go!', onPress: () => router.replace('/(tabs)/sprints/calendar' as any) }]
            );
        } catch (error: unknown) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container safeArea={false}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 pt-12">
                    {/* Progress Bar */}
                    <View className="px-6 mb-4">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-sm font-semibold text-gray-900">
                                Step {stepIndex + 1} of {STEPS.length}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                {Math.round(progress)}%
                            </Text>
                        </View>
                        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <Animated.View
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </View>
                    </View>

                    {/* Content */}
                    <ScrollView 
                        className="flex-1" 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {step === 'welcome' && (
                            <WelcomeStep
                                firstName={data.firstName}
                                lastName={data.lastName}
                                setFirstName={setFirstName}
                                setLastName={setLastName}
                                howDidYouHear={data.howDidYouHear}
                                setHowDidYouHear={setHowDidYouHear}
                            />
                        )}

                        {step === 'plan' && (
                            <PlanStep
                                planType={data.planType}
                                setPlanType={setPlanType}
                                corporateCode={data.corporateCode}
                                setCorporateCode={setCorporateCode}
                            />
                        )}

                        {step === 'assessment' && (
                            <AssessmentStep
                                scores={data.lifeWheelScores}
                                setScore={setLifeWheelScore}
                                firstName={data.firstName}
                            />
                        )}

                        {step === 'goals' && (
                            <GoalsStep
                                selectedCategories={data.selectedGoalCategories}
                                toggleCategory={toggleGoalCategory}
                                selectedBundleId={data.selectedBundleId}
                                selectBundle={selectBundle}
                                lowScoringAreas={getLowScoringAreas()}
                            />
                        )}

                        {step === 'tasks' && (
                            <TasksStep
                                selectedCategories={data.selectedGoalCategories}
                                selectedTemplates={data.selectedTaskTemplates}
                                selectedEpics={data.selectedEpicTemplates}
                                toggleTemplate={toggleTaskTemplate}
                                toggleEpic={toggleEpicTemplate}
                                estimatedPoints={getEstimatedWeeklyPoints()}
                            />
                        )}

                        {step === 'dates' && (
                            <DatesStep
                                dates={data.importantDates}
                                addDate={addImportantDate}
                                removeDate={removeImportantDate}
                            />
                        )}

                        {step === 'account' && (
                            <AccountStep
                                firstName={data.firstName}
                                email={email}
                                setEmail={setEmail}
                                password={password}
                                setPassword={setPassword}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                selectedTasksCount={data.selectedTaskTemplates.length}
                                selectedEpicsCount={data.selectedEpicTemplates.length}
                                importantDatesCount={data.importantDates.length}
                            />
                        )}
                    </ScrollView>

                    {/* Bottom Actions */}
                    <View className="bg-white border-t border-gray-200 px-6 py-4">
                        <View className="flex-row gap-3">
                            {stepIndex > 0 && (
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
                            {step === 'dates' && (
                                <View className="flex-1">
                                    <Button
                                        onPress={handleSkipDates}
                                        variant="outline"
                                        size="lg"
                                    >
                                        Skip
                                    </Button>
                                </View>
                            )}
                            <View className={step === 'dates' ? 'flex-1' : stepIndex === 0 ? 'flex-1' : 'flex-1'}>
                                <Button
                                    onPress={handleNext}
                                    size="lg"
                                    loading={loading}
                                    disabled={!canProceed()}
                                >
                                    {stepIndex === STEPS.length - 1 ? 'Create Account' : 'Continue'}
                                </Button>
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Container>
    );
}

// Step 1: Welcome & Name
function WelcomeStep({
    firstName,
    lastName,
    setFirstName,
    setLastName,
    howDidYouHear,
    setHowDidYouHear,
}: {
    firstName: string;
    lastName: string;
    setFirstName: (name: string) => void;
    setLastName: (name: string) => void;
    howDidYouHear?: string;
    setHowDidYouHear: (source: string) => void;
}) {
    return (
        <Animated.View entering={FadeInDown} className="px-6 pb-8">
            <View className="items-center mb-8">
                <Text className="text-6xl mb-4"></Text>
                <Text className="text-3xl font-bold text-center">Welcome to Kaiz!</Text>
                <Text className="text-base text-gray-600 text-center mt-2">
                    Let's set up your personal life operating system
                </Text>
            </View>

            <View className="mb-4">
                <Input
                    label="First Name *"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                />
            </View>

            <View className="mb-6">
                <Input
                    label="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                />
            </View>

            <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-3">
                    How did you hear about us?
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    {REFERRAL_SOURCES.map(source => (
                        <Pressable
                            key={source.id}
                            onPress={() => setHowDidYouHear(source.id)}
                            className={`px-3 py-2 rounded-full border-2 flex-row items-center gap-1 ${
                                howDidYouHear === source.id
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-300 bg-white'
                            }`}
                        >
                            <Text>{source.icon}</Text>
                            <Text className={`text-sm ${
                                howDidYouHear === source.id ? 'text-blue-900 font-semibold' : 'text-gray-700'
                            }`}>
                                {source.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View className="mt-4 p-4 bg-blue-50 rounded-xl">
                <Text className="text-sm text-blue-900">
                    <Text className="font-semibold">5 minutes to a better life:</Text> We'll help you set up tasks and goals so you hit the ground running!
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 2: Plan Selection
function PlanStep({
    planType,
    setPlanType,
    corporateCode,
    setCorporateCode,
}: {
    planType: 'individual' | 'family' | 'corporate';
    setPlanType: (type: 'individual' | 'family' | 'corporate') => void;
    corporateCode?: string;
    setCorporateCode: (code: string) => void;
}) {
    const plans = [
        {
            id: 'individual' as const,
            title: 'Individual',
            icon: 'account-outline',
            description: 'Perfect for personal productivity',
            features: ['Unlimited tasks & sprints', 'AI Scrum Master', 'Life Wheel tracking'],
            color: 'blue',
        },
        {
            id: 'family' as const,
            title: 'Family',
            icon: 'account-group-outline',
            description: 'Coordinate with loved ones',
            features: ['Shared family goals', 'Kid-friendly mode', 'Family calendar sync'],
            color: 'purple',
        },
        {
            id: 'corporate' as const,
            title: 'Corporate',
            icon: 'office-building-outline',
            description: 'Provided by your employer',
            features: ['Employee wellness perk', 'No additional cost', 'Personal use only'],
            color: 'green',
        },
    ];

    return (
        <Animated.View entering={FadeInDown} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">Choose Your Plan</Text>
            <Text className="text-base text-gray-600 mb-6">
                Select how you'll use Kaiz
            </Text>

            <View className="gap-3 mb-6">
                {plans.map(plan => {
                    const isSelected = planType === plan.id;
                    const borderColor = isSelected ? `border-${plan.color}-600` : 'border-gray-300';
                    const bgColor = isSelected ? `bg-${plan.color}-50` : 'bg-white';
                    
                    return (
                        <Pressable
                            key={plan.id}
                            onPress={() => setPlanType(plan.id)}
                            className={`p-4 rounded-xl border-2 ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}
                        >
                            <View className="flex-row items-center mb-2">
                                <Text className="text-3xl mr-3">{plan.icon}</Text>
                                <View className="flex-1">
                                    <Text className={`text-lg font-bold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                        {plan.title}
                                    </Text>
                                    <Text className="text-sm text-gray-600">{plan.description}</Text>
                                </View>
                                {isSelected && (
                                    <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
                                        <Text className="text-white text-xs font-bold">✓</Text>
                                    </View>
                                )}
                            </View>
                            <View className="ml-12 mt-2">
                                {plan.features.map((feature, i) => (
                                    <View key={i} className="flex-row items-center mb-1">
                                        <Text className="text-green-500 mr-2">✓</Text>
                                        <Text className="text-sm text-gray-600">{feature}</Text>
                                    </View>
                                ))}
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            {planType === 'corporate' && (
                <Animated.View entering={FadeInDown}>
                    <Input
                        label="Company Code *"
                        value={corporateCode || ''}
                        onChangeText={setCorporateCode}
                        placeholder="Enter your employer's code"
                        autoCapitalize="characters"
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                        Ask your HR department for this code
                    </Text>
                </Animated.View>
            )}

            <View className="mt-4 p-4 bg-yellow-50 rounded-xl">
                <Text className="text-sm text-yellow-900">
                    <Text className="font-semibold">All plans include:</Text> Full access to all features. Corporate plans are billed to your employer.
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 3: Life Wheel Assessment - The engaging part!
function AssessmentStep({
    scores,
    setScore,
    firstName,
}: {
    scores: Record<string, number>;
    setScore: (areaId: string, score: number) => void;
    firstName: string;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentQuestion = LIFE_WHEEL_ASSESSMENT[currentIndex];
    const answeredCount = Object.keys(scores).length;
    const currentScore = scores[currentQuestion?.areaId] || 0;

    const handleScoreSelect = (score: number) => {
        if (currentQuestion) {
            setScore(currentQuestion.areaId, score);
            // Auto advance after a short delay
            setTimeout(() => {
                if (currentIndex < LIFE_WHEEL_ASSESSMENT.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                }
            }, 300);
        }
    };

    return (
        <Animated.View entering={FadeInDown} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">Let's check in, {firstName}!</Text>
            <Text className="text-base text-gray-600 mb-4">
                Rate your satisfaction in each area (1 = struggling, 10 = thriving)
            </Text>

            {/* Progress dots */}
            <View className="flex-row justify-center gap-2 mb-6">
                {LIFE_WHEEL_ASSESSMENT.map((q, i) => {
                    const hasScore = scores[q.areaId] !== undefined;
                    const isActive = i === currentIndex;
                    return (
                        <Pressable 
                            key={q.id}
                            onPress={() => setCurrentIndex(i)}
                            className={`w-8 h-8 rounded-full items-center justify-center ${
                                isActive ? 'bg-blue-600' : 
                                hasScore ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        >
                            <Text className="text-white text-xs font-bold">
                                {hasScore ? scores[q.areaId] : q.icon}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {currentQuestion && (
                <Animated.View 
                    key={currentQuestion.id}
                    entering={SlideInRight}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                    <View className="items-center mb-4">
                        <Text className="text-5xl mb-3">{currentQuestion.icon}</Text>
                        <Text className="text-xl font-bold text-center text-gray-900">
                            {currentQuestion.question}
                        </Text>
                        <Text className="text-sm text-gray-500 text-center mt-1">
                            {currentQuestion.subtext}
                        </Text>
                    </View>

                    {/* Score selector */}
                    <View className="flex-row flex-wrap justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                            const isSelected = currentScore === score;
                            const isLow = score <= 4;
                            const isMid = score >= 5 && score <= 7;
                            const isHigh = score >= 8;
                            
                            return (
                                <Pressable
                                    key={score}
                                    onPress={() => handleScoreSelect(score)}
                                    className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
                                        isSelected 
                                            ? isLow ? 'bg-red-500 border-red-500' 
                                            : isHigh ? 'bg-green-500 border-green-500' 
                                            : 'bg-yellow-500 border-yellow-500'
                                            : 'bg-white border-gray-300'
                                    }`}
                                >
                                    <Text className={`text-lg font-bold ${
                                        isSelected ? 'text-white' : 'text-gray-700'
                                    }`}>
                                        {score}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Feedback message */}
                    {currentScore > 0 && (
                        <View className={`p-3 rounded-lg ${
                            currentScore <= 5 ? 'bg-orange-50' : 'bg-green-50'
                        }`}>
                            <Text className={`text-sm text-center ${
                                currentScore <= 5 ? 'text-orange-800' : 'text-green-800'
                            }`}>
                                {currentScore <= 5 
                                    ? currentQuestion.lowScoreMessage 
                                    : currentQuestion.highScoreMessage}
                            </Text>
                        </View>
                    )}
                </Animated.View>
            )}

            {/* Navigation */}
            <View className="flex-row justify-between mt-4">
                <Pressable
                    onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className={`px-4 py-2 rounded-full ${
                        currentIndex === 0 ? 'opacity-30' : ''
                    }`}
                >
                    <Text className="text-blue-600 font-semibold">← Previous</Text>
                </Pressable>
                <Text className="text-gray-500 self-center">
                    {answeredCount} of {LIFE_WHEEL_ASSESSMENT.length} rated
                </Text>
                <Pressable
                    onPress={() => setCurrentIndex(Math.min(LIFE_WHEEL_ASSESSMENT.length - 1, currentIndex + 1))}
                    disabled={currentIndex === LIFE_WHEEL_ASSESSMENT.length - 1}
                    className={`px-4 py-2 rounded-full ${
                        currentIndex === LIFE_WHEEL_ASSESSMENT.length - 1 ? 'opacity-30' : ''
                    }`}
                >
                    <Text className="text-blue-600 font-semibold">Next →</Text>
                </Pressable>
            </View>

            <View className="mt-6 p-4 bg-blue-50 rounded-xl">
                <Text className="text-sm text-blue-900">
                    <Text className="font-semibold">Why this matters:</Text> We'll suggest tasks for areas where you want to improve!
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 4: Goals Selection with Quick Start Bundles
function GoalsStep({
    selectedCategories,
    toggleCategory,
    selectedBundleId,
    selectBundle,
    lowScoringAreas,
}: {
    selectedCategories: string[];
    toggleCategory: (id: string) => void;
    selectedBundleId?: string;
    selectBundle: (bundleId: string) => void;
    lowScoringAreas: LifeWheelQuestion[];
}) {
    const [viewMode, setViewMode] = useState<'bundles' | 'categories'>('bundles');

    return (
        <Animated.View entering={FadeInDown} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">Choose Your Path</Text>
            <Text className="text-base text-gray-600 mb-4">
                Pick a quick-start bundle or customize your own
            </Text>

            {/* Show improvement areas based on assessment */}
            {lowScoringAreas.length > 0 && (
                <View className="mb-4 p-4 bg-orange-50 rounded-xl">
                    <Text className="text-sm font-semibold text-orange-900 mb-2">
                        Based on your assessment, focus on:
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {lowScoringAreas.slice(0, 3).map(area => (
                            <View 
                                key={area.id}
                                className="flex-row items-center px-3 py-1 bg-white rounded-full"
                            >
                                <Text className="mr-1">{area.icon}</Text>
                                <Text className="text-sm text-gray-700">
                                    {GOAL_CATEGORIES.find(c => c.id === area.categoryId)?.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Toggle between bundles and categories */}
            <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
                <Pressable
                    onPress={() => setViewMode('bundles')}
                    className={`flex-1 py-2 rounded-md ${viewMode === 'bundles' ? 'bg-white shadow' : ''}`}
                >
                    <Text className={`text-center font-semibold ${viewMode === 'bundles' ? 'text-blue-600' : 'text-gray-600'}`}>
                        Quick Start
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setViewMode('categories')}
                    className={`flex-1 py-2 rounded-md ${viewMode === 'categories' ? 'bg-white shadow' : ''}`}
                >
                    <Text className={`text-center font-semibold ${viewMode === 'categories' ? 'text-blue-600' : 'text-gray-600'}`}>
                        Customize
                    </Text>
                </Pressable>
            </View>

            {viewMode === 'bundles' ? (
                <View className="gap-3">
                    {QUICK_START_BUNDLES.map(bundle => {
                        const isSelected = selectedBundleId === bundle.id;
                        return (
                            <Pressable
                                key={bundle.id}
                                onPress={() => selectBundle(bundle.id)}
                                className={`p-4 rounded-xl border-2 ${
                                    isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                                }`}
                            >
                                <View className="flex-row items-center">
                                    <View 
                                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: bundle.color + '20' }}
                                    >
                                        <Text className="text-2xl">{bundle.icon}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`text-base font-bold ${
                                            isSelected ? 'text-blue-900' : 'text-gray-900'
                                        }`}>
                                            {bundle.name}
                                        </Text>
                                        <Text className="text-sm text-gray-600">
                                            {bundle.description}
                                        </Text>
                                        <Text className="text-xs text-gray-400 mt-1">
                                            {bundle.templateIds.length} tasks • {bundle.targetAudience}
                                        </Text>
                                    </View>
                                    <View 
                                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                        }`}
                                    >
                                        {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
                                    </View>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            ) : (
                <View className="gap-3">
                    {GOAL_CATEGORIES.map(category => {
                        const isSelected = selectedCategories.includes(category.id);
                        const isRecommended = lowScoringAreas.some(a => a.categoryId === category.id);
                        return (
                            <Pressable
                                key={category.id}
                                onPress={() => toggleCategory(category.id)}
                                className={`p-4 rounded-xl border-2 flex-row items-center ${
                                    isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                                }`}
                            >
                                <View 
                                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: category.color + '20' }}
                                >
                                    <Text className="text-2xl">{category.icon}</Text>
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className={`text-base font-bold ${
                                            isSelected ? 'text-blue-900' : 'text-gray-900'
                                        }`}>
                                            {category.name}
                                        </Text>
                                        {isRecommended && (
                                            <View className="ml-2 px-2 py-0.5 bg-orange-100 rounded-full">
                                                <Text className="text-xs text-orange-700 font-semibold">Recommended</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-sm text-gray-600">
                                        {category.description}
                                    </Text>
                                </View>
                                <View 
                                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                    }`}
                                >
                                    {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            )}

            <View className="mt-4 p-4 bg-purple-50 rounded-xl">
                <Text className="text-sm text-purple-900">
                    <Text className="font-semibold">Pro tip:</Text> Start with a bundle, then customize tasks on the next screen!
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 5: Task & Epic Selection
function TasksStep({
    selectedCategories,
    selectedTemplates,
    selectedEpics,
    toggleTemplate,
    toggleEpic,
    estimatedPoints,
}: {
    selectedCategories: string[];
    selectedTemplates: string[];
    selectedEpics: string[];
    toggleTemplate: (id: string) => void;
    toggleEpic: (id: string) => void;
    estimatedPoints: number;
}) {
    const [showEpics, setShowEpics] = useState(false);
    
    // Show ALL categories for selection now, not just pre-selected ones
    const relevantCategories = GOAL_CATEGORIES;
    
    const relevantEpics = EPIC_TEMPLATES;

    return (
        <Animated.View entering={FadeInDown} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">Build Your First Sprint</Text>
            <Text className="text-base text-gray-600 mb-2">
                Select tasks to add to your backlog
            </Text>
            
            {/* Points indicator */}
            <View className="flex-row items-center mb-4 p-3 bg-gray-100 rounded-lg">
                <Text className="text-2xl mr-2"></Text>
                <View className="flex-1">
                    <Text className="text-sm text-gray-600">Estimated weekly load</Text>
                    <Text className={`text-lg font-bold ${
                        estimatedPoints > 40 ? 'text-red-600' : 
                        estimatedPoints > 25 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                        {estimatedPoints} story points
                    </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${
                    estimatedPoints > 40 ? 'bg-red-100' : 
                    estimatedPoints > 25 ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                    <Text className={`text-xs font-semibold ${
                        estimatedPoints > 40 ? 'text-red-700' : 
                        estimatedPoints > 25 ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                        {estimatedPoints > 40 ? 'Heavy' : 
                         estimatedPoints > 25 ? 'Moderate' : 'Light'}
                    </Text>
                </View>
            </View>

            {/* Toggle between Tasks and Epics */}
            <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
                <Pressable
                    onPress={() => setShowEpics(false)}
                    className={`flex-1 py-2 rounded-md ${!showEpics ? 'bg-white shadow' : ''}`}
                >
                    <Text className={`text-center font-semibold ${!showEpics ? 'text-blue-600' : 'text-gray-600'}`}>
                        Tasks ({selectedTemplates.length})
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setShowEpics(true)}
                    className={`flex-1 py-2 rounded-md ${showEpics ? 'bg-white shadow' : ''}`}
                >
                    <Text className={`text-center font-semibold ${showEpics ? 'text-blue-600' : 'text-gray-600'}`}>
                        Epics ({selectedEpics.length})
                    </Text>
                </Pressable>
            </View>

            {!showEpics ? (
                // Tasks view
                <View className="gap-4">
                    {relevantCategories.map(category => (
                        <View key={category.id}>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-xl mr-2">{category.icon}</Text>
                                <Text className="text-base font-semibold text-gray-900">
                                    {category.name}
                                </Text>
                            </View>
                            <View className="gap-2">
                                {category.templates.map(template => {
                                    const isSelected = selectedTemplates.includes(template.id);
                                    return (
                                        <Pressable
                                            key={template.id}
                                            onPress={() => toggleTemplate(template.id)}
                                            className={`p-3 rounded-lg border flex-row items-center ${
                                                isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <View 
                                                className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                                                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                                }`}
                                            >
                                                {isSelected && <Text className="text-white text-xs">✓</Text>}
                                            </View>
                                            <View className="flex-1">
                                                <Text className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {template.title}
                                                </Text>
                                                <View className="flex-row items-center mt-1 gap-2">
                                                    <View className="bg-gray-100 px-2 py-0.5 rounded">
                                                        <Text className="text-xs text-gray-600">{template.storyPoints} pts</Text>
                                                    </View>
                                                    {template.isRecurring && (
                                                        <View className="bg-purple-100 px-2 py-0.5 rounded">
                                                            <Text className="text-xs text-purple-700">Recurring</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                // Epics view
                <View className="gap-3">
                    <Text className="text-sm text-gray-600 mb-2">
                        Epics are bigger goals that span multiple sprints
                    </Text>
                    {relevantEpics.length > 0 ? (
                        relevantEpics.map(epic => {
                            const isSelected = selectedEpics.includes(epic.id);
                            return (
                                <Pressable
                                    key={epic.id}
                                    onPress={() => toggleEpic(epic.id)}
                                    className={`p-4 rounded-xl border-2 ${
                                        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                                    }`}
                                >
                                    <View className="flex-row items-center">
                                        <Text className="text-3xl mr-3">{epic.icon}</Text>
                                        <View className="flex-1">
                                            <Text className={`text-base font-bold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {epic.title}
                                            </Text>
                                            <Text className="text-sm text-gray-600">{epic.description}</Text>
                                            <View className="flex-row items-center mt-2 gap-2">
                                                <View className="bg-gray-100 px-2 py-0.5 rounded">
                                                    <Text className="text-xs text-gray-600">~{epic.estimatedWeeks} weeks</Text>
                                                </View>
                                                <View className="bg-purple-100 px-2 py-0.5 rounded">
                                                    <Text className="text-xs text-purple-700">{epic.taskTemplateIds.length} tasks</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View 
                                            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                                isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                            }`}
                                        >
                                            {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })
                    ) : (
                        <View className="p-4 bg-gray-50 rounded-xl items-center">
                            <Text className="text-gray-500">Select more goal areas to see relevant epics</Text>
                        </View>
                    )}
                </View>
            )}

            <View className="mt-4 p-4 bg-green-50 rounded-xl">
                <Text className="text-sm text-green-900">
                    <Text className="font-semibold">Don't worry:</Text> You can always add, remove, or customize tasks later!
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 5: Important Dates
function DatesStep({
    dates,
    addDate,
    removeDate,
}: {
    dates: ImportantDate[];
    addDate: (date: ImportantDate) => void;
    removeDate: (id: string) => void;
}) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [personName, setPersonName] = useState('');
    const [relationship, setRelationship] = useState<'family' | 'friend' | 'colleague' | 'other'>('family');
    const [dateType, setDateType] = useState<'birthday' | 'anniversary' | 'other'>('birthday');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');

    const handleAddDate = () => {
        if (!personName.trim() || !month || !day) {
            Alert.alert('Required', 'Please fill in all fields');
            return;
        }

        const newDate: ImportantDate = {
            id: `date-${Date.now()}`,
            personName: personName.trim(),
            relationship,
            dateType,
            date: `${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
            reminderDaysBefore: 7,
        };

        addDate(newDate);
        setPersonName('');
        setMonth('');
        setDay('');
        setShowAddForm(false);
    };

    const relationships = [
        { id: 'family' as const, icon: 'account-group-outline', label: 'Family' },
        { id: 'friend' as const, icon: 'handshake-outline', label: 'Friend' },
        { id: 'colleague' as const, icon: 'briefcase-outline', label: 'Colleague' },
        { id: 'other' as const, icon: 'account-outline', label: 'Other' },
    ];

    const dateTypes = [
        { id: 'birthday' as const, icon: 'cake-variant-outline', label: 'Birthday' },
        { id: 'anniversary' as const, icon: 'ring', label: 'Anniversary' },
        { id: 'other' as const, icon: 'calendar-outline', label: 'Other' },
    ];

    return (
        <Animated.View entering={FadeInDown} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">Important Dates</Text>
            <Text className="text-base text-gray-600 mb-6">
                Never forget birthdays or anniversaries again! (Optional)
            </Text>

            {/* Added dates list */}
            {dates.length > 0 && (
                <View className="mb-4 gap-2">
                    {dates.map(date => (
                        <View key={date.id} className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                            <Text className="text-2xl mr-3">
                                {date.dateType === 'birthday' ? '' : date.dateType === 'anniversary' ? '' : ''}
                            </Text>
                            <View className="flex-1">
                                <Text className="font-semibold text-gray-900">{date.personName}</Text>
                                <Text className="text-sm text-gray-600">
                                    {date.dateType === 'birthday' ? 'Birthday' : 
                                     date.dateType === 'anniversary' ? 'Anniversary' : 'Event'} • {date.date}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => removeDate(date.id)}
                                className="p-2"
                            >
                                <MaterialCommunityIcons name="close" size={20} color="#9CA3AF" />
                            </Pressable>
                        </View>
                    ))}
                </View>
            )}

            {/* Add date form */}
            {showAddForm ? (
                <View className="p-4 bg-blue-50 rounded-xl mb-4">
                    <View className="mb-3">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Person's Name</Text>
                        <TextInput
                            value={personName}
                            onChangeText={setPersonName}
                            placeholder="e.g., Mom, John, Sarah"
                            className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                        />
                    </View>

                    <View className="mb-3">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Relationship</Text>
                        <View className="flex-row gap-2">
                            {relationships.map(rel => (
                                <Pressable
                                    key={rel.id}
                                    onPress={() => setRelationship(rel.id)}
                                    className={`px-3 py-2 rounded-full border ${
                                        relationship === rel.id 
                                            ? 'border-blue-600 bg-white' 
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <Text className="text-sm">{rel.icon} {rel.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View className="mb-3">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Date Type</Text>
                        <View className="flex-row gap-2">
                            {dateTypes.map(dt => (
                                <Pressable
                                    key={dt.id}
                                    onPress={() => setDateType(dt.id)}
                                    className={`px-3 py-2 rounded-full border ${
                                        dateType === dt.id 
                                            ? 'border-blue-600 bg-white' 
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <Text className="text-sm">{dt.icon} {dt.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Date (Month/Day)</Text>
                        <View className="flex-row gap-2">
                            <TextInput
                                value={month}
                                onChangeText={setMonth}
                                placeholder="MM"
                                keyboardType="number-pad"
                                maxLength={2}
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-center"
                            />
                            <Text className="text-2xl text-gray-400 self-center">/</Text>
                            <TextInput
                                value={day}
                                onChangeText={setDay}
                                placeholder="DD"
                                keyboardType="number-pad"
                                maxLength={2}
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-center"
                            />
                        </View>
                    </View>

                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={() => setShowAddForm(false)}
                            className="flex-1 py-3 border border-gray-300 rounded-lg"
                        >
                            <Text className="text-center text-gray-700 font-semibold">Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleAddDate}
                            className="flex-1 py-3 bg-blue-600 rounded-lg"
                        >
                            <Text className="text-center text-white font-semibold">Add Date</Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <Pressable
                    onPress={() => setShowAddForm(true)}
                    className="flex-row items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl mb-4"
                >
                    <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#3B82F6" />
                    <Text className="text-blue-600 font-semibold ml-2">Add Important Date</Text>
                </Pressable>
            )}

            <View className="p-4 bg-yellow-50 rounded-xl">
                <Text className="text-sm text-yellow-900">
                    <Text className="font-semibold">Pro tip:</Text> Kaiz will remind you a week before each event so you have time to prepare!
                </Text>
            </View>
        </Animated.View>
    );
}

// Step 6: Account Creation
function AccountStep({
    firstName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    selectedTasksCount,
    selectedEpicsCount,
    importantDatesCount,
}: {
    firstName: string;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    selectedTasksCount: number;
    selectedEpicsCount: number;
    importantDatesCount: number;
}) {
    const router = useRouter();
    return (
        <Animated.View entering={FadeInDown} className="px-6 pb-8">
            <Text className="text-3xl font-bold mb-2">You're Almost There!</Text>
            <Text className="text-base text-gray-600 mb-6">
                Create your account to save your personalized setup
            </Text>

            {/* Summary card */}
            <View className="p-4 bg-gradient-to-r bg-blue-50 rounded-xl mb-6">
                <Text className="text-lg font-bold text-blue-900 mb-3">
                    {firstName}'s Setup Summary
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    <View className="bg-white px-3 py-2 rounded-lg">
                        <Text className="text-2xl font-bold text-blue-600">{selectedTasksCount}</Text>
                        <Text className="text-xs text-gray-600">Tasks</Text>
                    </View>
                    <View className="bg-white px-3 py-2 rounded-lg">
                        <Text className="text-2xl font-bold text-purple-600">{selectedEpicsCount}</Text>
                        <Text className="text-xs text-gray-600">Epics</Text>
                    </View>
                    <View className="bg-white px-3 py-2 rounded-lg">
                        <Text className="text-2xl font-bold text-pink-600">{importantDatesCount}</Text>
                        <Text className="text-xs text-gray-600">Dates</Text>
                    </View>
                </View>
            </View>

            <View className="mb-4">
                <Input
                    label="Email Address *"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View className="relative mb-4">
                <Input
                    label="Password *"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 8 characters"
                    secureTextEntry={!showPassword}
                />
                <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-11"
                >
                    <Text className="text-blue-600 font-semibold">
                        {showPassword ? 'Hide' : 'Show'}
                    </Text>
                </Pressable>
            </View>

            <View className="flex-row items-start mb-4">
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                <Text className="flex-1 text-sm text-gray-600 ml-2">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>

            <View className="p-4 bg-green-50 rounded-xl">
                <Text className="text-sm text-green-900">
                    <Text className="font-semibold">Ready to transform your life!</Text> Your tasks and epics will be waiting for you in your sprint backlog.
                </Text>
            </View>

            {/* Sign In link for returning users */}
            <Pressable
                onPress={() => router.push('/(auth)/login' as any)}
                className="mt-6 items-center py-2"
            >
                <Text className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Text className="text-blue-600 font-semibold">Sign In</Text>
                </Text>
            </Pressable>
        </Animated.View>
    );
}
