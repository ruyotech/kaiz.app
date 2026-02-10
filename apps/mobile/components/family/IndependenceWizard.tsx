/**
 * IndependenceWizard.tsx - Independence Transition Wizard Component
 * 
 * Multi-step wizard for child account independence transition
 */

import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    Modal,
    Pressable,
    Animated,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../providers/ThemeProvider';
import { useFamilyStore } from '../../store/familyStore';
import { TransitionDataSelections, TransitionDataSummary } from '../../types/family.types';

interface IndependenceWizardProps {
    visible: boolean;
    onClose: () => void;
    memberName: string;
    isParentInitiated?: boolean;
}

const STEPS = [
    { id: 'intro', title: 'Begin Your Journey', icon: 'butterfly-outline' },
    { id: 'review', title: 'Review Your Data', icon: 'clipboard-text-outline' },
    { id: 'select', title: 'Choose What to Keep', icon: 'bag-personal-outline' },
    { id: 'confirm', title: 'Ready to Launch', icon: 'rocket-launch-outline' },
    { id: 'celebration', title: "You're Independent!", icon: 'party-popper' },
];

export function IndependenceWizard({ 
    visible, 
    onClose, 
    memberName,
    isParentInitiated = false,
}: IndependenceWizardProps) {
    const { colors, isDark } = useThemeContext();
    const { 
        activeTransition,
        transitionDataSummary,
        fetchTransitionDataSummary,
        updateTransitionSelections,
        approveIndependence,
        completeIndependence,
        cancelIndependence,
        loading,
    } = useFamilyStore();
    
    const [currentStep, setCurrentStep] = useState(0);
    const [keepFamilyConnection, setKeepFamilyConnection] = useState(true);
    const [selections, setSelections] = useState<TransitionDataSelections>({
        movePersonalTasks: true,
        movePersonalEpics: true,
        copySharedTasksAsArchive: true,
        moveLifeWheelHistory: true,
        resetVelocityMetrics: true,
        archiveFamilyCeremonies: true,
    });
    
    const screenWidth = Dimensions.get('window').width;
    const progressAnim = React.useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        if (visible) {
            fetchTransitionDataSummary();
        }
    }, [visible]);
    
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: (currentStep / (STEPS.length - 1)) * 100,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [currentStep]);
    
    const handleNext = async () => {
        if (currentStep === 2) {
            // Update selections before confirming
            updateTransitionSelections(selections);
        }
        if (currentStep === 3) {
            // Approve and complete
            if (activeTransition) {
                await approveIndependence(activeTransition.id);
                await completeIndependence(activeTransition.id, keepFamilyConnection);
            }
        }
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };
    
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handleClose = () => {
        if (activeTransition && currentStep < STEPS.length - 1) {
            cancelIndependence(activeTransition.id);
        }
        setCurrentStep(0);
        onClose();
    };
    
    const toggleSelection = (key: keyof TransitionDataSelections) => {
        setSelections(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const renderStep = () => {
        const step = STEPS[currentStep];
        
        switch (step.id) {
            case 'intro':
                return (
                    <View className="items-center py-8 px-6">
                        <View 
                            className="w-32 h-32 rounded-full items-center justify-center mb-6"
                            style={{ backgroundColor: '#8B5CF620' }}
                        >
                            <Text className="text-6xl"></Text>
                        </View>
                        <Text 
                            className="text-2xl font-bold text-center mb-3"
                            style={{ color: colors.text }}
                        >
                            {isParentInitiated 
                                ? `Ready to release ${memberName}?`
                                : 'Ready for Independence?'
                            }
                        </Text>
                        <Text 
                            className="text-base text-center leading-6"
                            style={{ color: colors.textSecondary }}
                        >
                            {isParentInitiated 
                                ? `This wizard will help transition ${memberName} to their own independent account while preserving their journey.`
                                : "Congratulations on reaching this milestone! This wizard will help you transition to your own independent account."
                            }
                        </Text>
                        
                        <View 
                            className="mt-6 p-4 rounded-2xl w-full"
                            style={{ backgroundColor: '#F59E0B15' }}
                        >
                            <View className="flex-row items-center mb-2">
                                <MaterialCommunityIcons 
                                    name="information" 
                                    size={20} 
                                    color="#F59E0B"
                                />
                                <Text 
                                    className="font-bold ml-2"
                                    style={{ color: '#F59E0B' }}
                                >
                                    What to expect
                                </Text>
                            </View>
                            <Text 
                                className="text-sm leading-5"
                                style={{ color: colors.textSecondary }}
                            >
                                • Personal tasks and epics will move to your new account{'\n'}
                                • Your Life Wheel history continues with you{'\n'}
                                • Velocity metrics start fresh for a new era{'\n'}
                                • Family memories are archived for safekeeping
                            </Text>
                        </View>
                    </View>
                );
                
            case 'review':
                return (
                    <ScrollView className="px-6 py-4">
                        <Text 
                            className="text-xl font-bold mb-2"
                            style={{ color: colors.text }}
                        >
                            Your Journey So Far
                        </Text>
                        <Text 
                            className="text-sm mb-6"
                            style={{ color: colors.textSecondary }}
                        >
                            Here's a summary of what you've accomplished
                        </Text>
                        
                        {transitionDataSummary && (
                            <View className="gap-3">
                                <DataSummaryCard
                                    icon="checkbox-marked-circle"
                                    label="Personal Tasks"
                                    value={transitionDataSummary.personalTasksCount}
                                    color="#10B981"
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <DataSummaryCard
                                    icon="flag"
                                    label="Personal Epics"
                                    value={transitionDataSummary.personalEpicsCount}
                                    color="#8B5CF6"
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <DataSummaryCard
                                    icon="account-group"
                                    label="Shared Tasks Participated"
                                    value={transitionDataSummary.sharedTasksCount}
                                    color="#3B82F6"
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <DataSummaryCard
                                    icon="chart-donut"
                                    label="Life Wheel Entries"
                                    value={transitionDataSummary.lifeWheelEntriesCount}
                                    color="#F59E0B"
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <DataSummaryCard
                                    icon="calendar-week"
                                    label="Weeks of Velocity Data"
                                    value={transitionDataSummary.velocityWeeksCount}
                                    color="#06B6D4"
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <DataSummaryCard
                                    icon="calendar-heart"
                                    label="Family Ceremonies"
                                    value={transitionDataSummary.ceremoniesCount}
                                    color="#EC4899"
                                    colors={colors}
                                    isDark={isDark}
                                />
                                <DataSummaryCard
                                    icon="hand-clap"
                                    label="Kudos Received"
                                    value={transitionDataSummary.kudosReceivedCount}
                                    color="#F59E0B"
                                    colors={colors}
                                    isDark={isDark}
                                />
                            </View>
                        )}
                    </ScrollView>
                );
                
            case 'select':
                return (
                    <ScrollView className="px-6 py-4">
                        <Text 
                            className="text-xl font-bold mb-2"
                            style={{ color: colors.text }}
                        >
                            Choose Your Path
                        </Text>
                        <Text 
                            className="text-sm mb-6"
                            style={{ color: colors.textSecondary }}
                        >
                            Select what to bring to your new account
                        </Text>
                        
                        <View className="gap-3">
                            <SelectionOption
                                icon="checkbox-multiple-marked"
                                title="Personal Tasks & Epics"
                                description="Move all your personal tasks and epics"
                                selected={selections.movePersonalTasks}
                                onToggle={() => toggleSelection('movePersonalTasks')}
                                recommended
                                colors={colors}
                                isDark={isDark}
                            />
                            <SelectionOption
                                icon="archive"
                                title="Shared Tasks Archive"
                                description="Copy shared tasks as read-only memories"
                                selected={selections.copySharedTasksAsArchive}
                                onToggle={() => toggleSelection('copySharedTasksAsArchive')}
                                colors={colors}
                                isDark={isDark}
                            />
                            <SelectionOption
                                icon="chart-donut"
                                title="Life Wheel History"
                                description="Continue your self-development journey"
                                selected={selections.moveLifeWheelHistory}
                                onToggle={() => toggleSelection('moveLifeWheelHistory')}
                                recommended
                                colors={colors}
                                isDark={isDark}
                            />
                            <SelectionOption
                                icon="chart-line-variant"
                                title="Reset Velocity Metrics"
                                description="Start fresh with a new baseline"
                                selected={selections.resetVelocityMetrics}
                                onToggle={() => toggleSelection('resetVelocityMetrics')}
                                recommended
                                colors={colors}
                                isDark={isDark}
                            />
                            <SelectionOption
                                icon="calendar-heart"
                                title="Archive Family Ceremonies"
                                description="Keep memories of family moments"
                                selected={selections.archiveFamilyCeremonies}
                                onToggle={() => toggleSelection('archiveFamilyCeremonies')}
                                colors={colors}
                                isDark={isDark}
                            />
                        </View>
                        
                        {/* Family Connection */}
                        <View 
                            className="mt-6 p-4 rounded-2xl"
                            style={{ 
                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                borderWidth: 2,
                                borderColor: keepFamilyConnection ? '#8B5CF6' : 'transparent',
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => setKeepFamilyConnection(!keepFamilyConnection)}
                                className="flex-row items-center"
                            >
                                <View 
                                    className="w-6 h-6 rounded-md items-center justify-center mr-3"
                                    style={{ 
                                        backgroundColor: keepFamilyConnection ? '#8B5CF6' : 'transparent',
                                        borderWidth: keepFamilyConnection ? 0 : 2,
                                        borderColor: colors.border,
                                    }}
                                >
                                    {keepFamilyConnection && (
                                        <MaterialCommunityIcons 
                                            name="check" 
                                            size={16} 
                                            color="#fff"
                                        />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text 
                                        className="font-bold"
                                        style={{ color: colors.text }}
                                    >
                                        Stay Connected as Family Alumni
                                    </Text>
                                    <Text 
                                        className="text-xs mt-1"
                                        style={{ color: colors.textSecondary }}
                                    >
                                        View-only access to family activities
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                );
                
            case 'confirm':
                return (
                    <View className="items-center py-8 px-6">
                        <View 
                            className="w-24 h-24 rounded-full items-center justify-center mb-6"
                            style={{ backgroundColor: '#10B98120' }}
                        >
                            <Text className="text-5xl"></Text>
                        </View>
                        <Text 
                            className="text-2xl font-bold text-center mb-3"
                            style={{ color: colors.text }}
                        >
                            Ready for Takeoff!
                        </Text>
                        <Text 
                            className="text-base text-center mb-6"
                            style={{ color: colors.textSecondary }}
                        >
                            Review your selections and confirm to begin your independent journey.
                        </Text>
                        
                        <View 
                            className="w-full p-4 rounded-2xl"
                            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                        >
                            <Text 
                                className="font-bold mb-3"
                                style={{ color: colors.text }}
                            >
                                Summary
                            </Text>
                            <SummaryItem 
                                label="Personal data" 
                                value={selections.movePersonalTasks ? 'Moving' : 'Not moving'}
                                colors={colors}
                            />
                            <SummaryItem 
                                label="Shared tasks" 
                                value={selections.copySharedTasksAsArchive ? 'Archiving' : 'Not keeping'}
                                colors={colors}
                            />
                            <SummaryItem 
                                label="Life Wheel" 
                                value={selections.moveLifeWheelHistory ? 'Continuing' : 'Starting fresh'}
                                colors={colors}
                            />
                            <SummaryItem 
                                label="Velocity" 
                                value={selections.resetVelocityMetrics ? 'Fresh start' : 'Keeping history'}
                                colors={colors}
                            />
                            <SummaryItem 
                                label="Family connection" 
                                value={keepFamilyConnection ? 'Family Alumni' : 'Fully independent'}
                                colors={colors}
                            />
                        </View>
                        
                        <View 
                            className="mt-4 p-3 rounded-xl flex-row items-center"
                            style={{ backgroundColor: '#F59E0B15' }}
                        >
                            <MaterialCommunityIcons 
                                name="alert-circle-outline" 
                                size={20} 
                                color="#F59E0B"
                            />
                            <Text 
                                className="text-sm ml-2 flex-1"
                                style={{ color: colors.textSecondary }}
                            >
                                This action cannot be undone. Make sure you're ready!
                            </Text>
                        </View>
                    </View>
                );
                
            case 'celebration':
                return (
                    <View className="items-center py-8 px-6">
                        <Animated.View 
                            className="w-40 h-40 rounded-full items-center justify-center mb-6"
                            style={{ backgroundColor: '#8B5CF620' }}
                        >
                            <Text className="text-7xl"></Text>
                        </Animated.View>
                        <Text 
                            className="text-3xl font-bold text-center mb-3"
                            style={{ color: colors.text }}
                        >
                            Congratulations!
                        </Text>
                        <Text 
                            className="text-lg text-center mb-2"
                            style={{ color: '#8B5CF6' }}
                        >
                            Welcome to your new chapter!
                        </Text>
                        <Text 
                            className="text-base text-center leading-6"
                            style={{ color: colors.textSecondary }}
                        >
                            Your independent account is ready. All your data has been migrated successfully.
                        </Text>
                        
                        <View 
                            className="mt-6 p-4 rounded-2xl w-full"
                            style={{ backgroundColor: '#10B98115' }}
                        >
                            <Text 
                                className="font-bold mb-2 text-center"
                                style={{ color: '#10B981' }}
                            >
                                What's next?
                            </Text>
                            <Text 
                                className="text-sm text-center leading-5"
                                style={{ color: colors.textSecondary }}
                            >
                                • Set up your first sprint goals{'\n'}
                                • Explore new features available to you{'\n'}
                                • Start your own family workspace someday!
                            </Text>
                        </View>
                    </View>
                );
        }
    };
    
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View 
                className="flex-1"
                style={{ backgroundColor: colors.background }}
            >
                {/* Header */}
                <View 
                    className="flex-row items-center justify-between px-4 py-3 border-b"
                    style={{ borderBottomColor: colors.border }}
                >
                    <TouchableOpacity onPress={handleClose}>
                        <MaterialCommunityIcons 
                            name="close" 
                            size={24} 
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <Text className="text-xl mr-2">{STEPS[currentStep].icon}</Text>
                        <Text 
                            className="font-bold"
                            style={{ color: colors.text }}
                        >
                            {STEPS[currentStep].title}
                        </Text>
                    </View>
                    <View className="w-6" />
                </View>
                
                {/* Progress Bar */}
                <View 
                    className="h-1"
                    style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                >
                    <Animated.View 
                        className="h-full"
                        style={{ 
                            backgroundColor: '#8B5CF6',
                            width: progressAnim.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                            }),
                        }}
                    />
                </View>
                
                {/* Content */}
                <View className="flex-1">
                    {renderStep()}
                </View>
                
                {/* Footer */}
                <View 
                    className="flex-row items-center justify-between px-4 py-4 border-t"
                    style={{ borderTopColor: colors.border }}
                >
                    {currentStep > 0 && currentStep < STEPS.length - 1 ? (
                        <TouchableOpacity
                            onPress={handleBack}
                            className="flex-row items-center px-4 py-3 rounded-xl"
                            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                        >
                            <MaterialCommunityIcons 
                                name="chevron-left" 
                                size={20} 
                                color={colors.textSecondary}
                            />
                            <Text 
                                className="font-medium ml-1"
                                style={{ color: colors.textSecondary }}
                            >
                                Back
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View />
                    )}
                    
                    <TouchableOpacity
                        onPress={currentStep === STEPS.length - 1 ? handleClose : handleNext}
                        disabled={loading}
                        className="flex-row items-center px-6 py-3 rounded-xl"
                        style={{ 
                            backgroundColor: currentStep === 3 ? '#10B981' : '#8B5CF6',
                            opacity: loading ? 0.5 : 1,
                        }}
                    >
                        <Text className="font-bold text-white mr-1">
                            {currentStep === STEPS.length - 1 
                                ? 'Start My Journey'
                                : currentStep === 3 
                                    ? 'Confirm & Launch' 
                                    : 'Continue'
                            }
                        </Text>
                        <MaterialCommunityIcons 
                            name={currentStep === STEPS.length - 1 ? 'rocket-launch' : 'chevron-right'} 
                            size={20} 
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// Helper Components
function DataSummaryCard({ icon, label, value, color, colors, isDark }: any) {
    return (
        <View 
            className="flex-row items-center p-4 rounded-xl"
            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
        >
            <View 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${color}20` }}
            >
                <MaterialCommunityIcons name={icon} size={20} color={color} />
            </View>
            <View className="flex-1">
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    {label}
                </Text>
            </View>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
                {value}
            </Text>
        </View>
    );
}

function SelectionOption({ icon, title, description, selected, onToggle, recommended, colors, isDark }: any) {
    return (
        <TouchableOpacity
            onPress={onToggle}
            className="flex-row items-center p-4 rounded-xl"
            style={{ 
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                borderWidth: 2,
                borderColor: selected ? '#8B5CF6' : 'transparent',
            }}
        >
            <View 
                className="w-6 h-6 rounded-md items-center justify-center mr-3"
                style={{ 
                    backgroundColor: selected ? '#8B5CF6' : 'transparent',
                    borderWidth: selected ? 0 : 2,
                    borderColor: colors.border,
                }}
            >
                {selected && (
                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                )}
            </View>
            <MaterialCommunityIcons name={icon} size={24} color={colors.textSecondary} />
            <View className="flex-1 ml-3">
                <View className="flex-row items-center">
                    <Text className="font-semibold" style={{ color: colors.text }}>
                        {title}
                    </Text>
                    {recommended && (
                        <View 
                            className="ml-2 px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: '#10B98120' }}
                        >
                            <Text className="text-xs font-medium" style={{ color: '#10B981' }}>
                                Recommended
                            </Text>
                        </View>
                    )}
                </View>
                <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                    {description}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

function SummaryItem({ label, value, colors }: any) {
    return (
        <View className="flex-row items-center justify-between py-1">
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {label}
            </Text>
            <Text className="text-sm font-medium" style={{ color: colors.text }}>
                {value}
            </Text>
        </View>
    );
}
