/**
 * Family Standup Screen - "How's everyone doing?"
 * 
 * Features:
 * - Daily check-in ceremony
 * - Mood tracking for family members
 * - Highlights and blockers sharing
 * - Celebration of accomplishments
 */

import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    RefreshControl,
    Modal,
    TextInput,
    Pressable,
    Alert,
    Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useFamilyStore } from '../../../store/familyStore';
import { FamilyMember } from '../../../types/family.types';
import { KudosModal } from '../../../components/family/KudosModal';

type MoodType = 'great' | 'good' | 'okay' | 'struggling' | 'tough';

interface StandupEntry {
    memberId: string;
    mood: MoodType;
    highlight: string;
    blocker: string;
    helpNeeded: string;
    timestamp: string;
}

const MOOD_OPTIONS: { type: MoodType; emoji: string; label: string; color: string }[] = [
    { type: 'great', emoji: 'emoticon-excited-outline', label: 'Great!', color: '#10B981' },
    { type: 'good', emoji: 'emoticon-happy-outline', label: 'Good', color: '#3B82F6' },
    { type: 'okay', emoji: 'emoticon-neutral-outline', label: 'Okay', color: '#F59E0B' },
    { type: 'struggling', emoji: 'emoticon-sad-outline', label: 'Struggling', color: '#F97316' },
    { type: 'tough', emoji: 'emoticon-cry-outline', label: 'Tough day', color: '#EF4444' },
];

export default function FamilyStandupScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const {
        currentFamily,
        members,
        ceremonies,
        loading,
        sendKudos,
    } = useFamilyStore();
    
    const [refreshing, setRefreshing] = useState(false);
    const [showCheckinModal, setShowCheckinModal] = useState(false);
    const [showKudosModal, setShowKudosModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    
    // Today's standup entries (mock data - would be from store)
    const [standupEntries, setStandupEntries] = useState<StandupEntry[]>([
        {
            memberId: 'user1',
            mood: 'great',
            highlight: 'Finished the school project early!',
            blocker: '',
            helpNeeded: '',
            timestamp: new Date().toISOString(),
        },
        {
            memberId: 'user2',
            mood: 'good',
            highlight: 'Made progress on work presentation',
            blocker: 'Need some quiet time to focus',
            helpNeeded: '',
            timestamp: new Date().toISOString(),
        },
    ]);
    
    // Check-in form
    const [myMood, setMyMood] = useState<MoodType | null>(null);
    const [myHighlight, setMyHighlight] = useState('');
    const [myBlocker, setMyBlocker] = useState('');
    const [myHelpNeeded, setMyHelpNeeded] = useState('');
    
    const hasCheckedIn = standupEntries.some(e => e.memberId === 'currentUser');
    
    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };
    
    const handleSubmitCheckin = () => {
        if (!myMood) {
            Alert.alert('Oops!', 'Please select how you\'re feeling');
            return;
        }
        
        const newEntry: StandupEntry = {
            memberId: 'currentUser',
            mood: myMood,
            highlight: myHighlight.trim(),
            blocker: myBlocker.trim(),
            helpNeeded: myHelpNeeded.trim(),
            timestamp: new Date().toISOString(),
        };
        
        setStandupEntries([...standupEntries, newEntry]);
        setShowCheckinModal(false);
        resetForm();
    };
    
    const resetForm = () => {
        setMyMood(null);
        setMyHighlight('');
        setMyBlocker('');
        setMyHelpNeeded('');
    };
    
    const getMoodInfo = (mood: MoodType) => {
        return MOOD_OPTIONS.find(m => m.type === mood) || MOOD_OPTIONS[2];
    };
    
    const getMemberEntry = (memberId: string) => {
        return standupEntries.find(e => e.memberId === memberId);
    };
    
    // Calculate family mood average
    const familyMoodStats = () => {
        if (standupEntries.length === 0) return { average: 'N/A', emoji: 'help-circle-outline' };
        
        const moodScores: Record<MoodType, number> = {
            great: 5, good: 4, okay: 3, struggling: 2, tough: 1
        };
        
        const totalScore = standupEntries.reduce((sum, e) => sum + moodScores[e.mood], 0);
        const avg = totalScore / standupEntries.length;
        
        if (avg >= 4.5) return { average: 'Fantastic!', emoji: 'star-outline' };
        if (avg >= 3.5) return { average: 'Good vibes', emoji: 'star-four-points-outline' };
        if (avg >= 2.5) return { average: 'Hanging in', emoji: 'arm-flex-outline' };
        return { average: 'Needs support', emoji: 'heart-outline' };
    };
    
    const moodStats = familyMoodStats();
    
    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-purple-600">
                <View className="px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View className="ml-3">
                                <Text className="text-white text-xl font-bold">Family Standup</Text>
                                <Text className="text-purple-200 text-xs">
                                    How's everyone doing today?
                                </Text>
                            </View>
                        </View>
                        
                        <View 
                            className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full"
                        >
                            <Text className="text-lg mr-1">{moodStats.emoji}</Text>
                            <Text className="text-white text-sm font-medium">{moodStats.average}</Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
            
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Check-in Prompt */}
                {!hasCheckedIn && (
                    <TouchableOpacity
                        onPress={() => setShowCheckinModal(true)}
                        className="mx-4 mt-4 p-5 rounded-2xl"
                        style={{ 
                            backgroundColor: '#A855F7',
                        }}
                    >
                        <View className="flex-row items-center">
                            <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center">
                                <Text className="text-3xl"></Text>
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-white text-lg font-bold">
                                    Good morning! How are you?
                                </Text>
                                <Text className="text-purple-200 text-sm mt-1">
                                    Share your mood and what's on your mind
                                </Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
                        </View>
                    </TouchableOpacity>
                )}
                
                {/* Participation Stats */}
                <View className="px-4 mt-4">
                    <View 
                        className="p-4 rounded-2xl flex-row items-center justify-between"
                        style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                    >
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons 
                                name="account-check" 
                                size={24} 
                                color="#10B981"
                            />
                            <Text 
                                className="ml-2 font-semibold"
                                style={{ color: colors.text }}
                            >
                                {standupEntries.length}/{members.length} checked in
                            </Text>
                        </View>
                        <View className="flex-row">
                            {members.map(member => {
                                const hasEntry = getMemberEntry(member.userId);
                                return (
                                    <View 
                                        key={member.userId}
                                        className="w-8 h-8 rounded-full items-center justify-center -ml-2 first:ml-0"
                                        style={{ 
                                            backgroundColor: hasEntry 
                                                ? getMoodInfo(hasEntry.mood).color 
                                                : colors.textSecondary + '30',
                                            borderWidth: 2,
                                            borderColor: colors.background,
                                        }}
                                    >
                                        <Text className="text-sm">{member.avatar}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
                
                {/* Family Entries */}
                <View className="px-4 mt-6">
                    <Text 
                        className="text-lg font-bold mb-3"
                        style={{ color: colors.text }}
                    >
                        Today's Check-ins
                    </Text>
                    
                    {standupEntries.length === 0 ? (
                        <View 
                            className="items-center py-12 rounded-2xl"
                            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                        >
                            <MaterialCommunityIcons name="weather-sunset" size={40} color={colors.textTertiary} />
                            <Text 
                                className="text-lg font-semibold"
                                style={{ color: colors.text }}
                            >
                                No check-ins yet
                            </Text>
                            <Text 
                                className="text-sm text-center mt-1"
                                style={{ color: colors.textSecondary }}
                            >
                                Be the first to share how you're doing!
                            </Text>
                        </View>
                    ) : (
                        standupEntries.map(entry => {
                            const member = members.find(m => m.userId === entry.memberId);
                            if (!member) return null;
                            
                            const moodInfo = getMoodInfo(entry.mood);
                            
                            return (
                                <View
                                    key={entry.memberId}
                                    className="mb-4 rounded-2xl overflow-hidden"
                                    style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                                >
                                    {/* Header */}
                                    <View 
                                        className="flex-row items-center justify-between p-4"
                                        style={{ backgroundColor: moodInfo.color + '20' }}
                                    >
                                        <View className="flex-row items-center">
                                            <View 
                                                className="w-12 h-12 rounded-full items-center justify-center"
                                                style={{ backgroundColor: moodInfo.color + '30' }}
                                            >
                                                <Text className="text-2xl">{member.avatar}</Text>
                                            </View>
                                            <View className="ml-3">
                                                <Text 
                                                    className="font-bold"
                                                    style={{ color: colors.text }}
                                                >
                                                    {member.displayName}
                                                </Text>
                                                <View className="flex-row items-center mt-0.5">
                                                    <Text className="text-lg mr-1">{moodInfo.emoji}</Text>
                                                    <Text 
                                                        className="text-sm font-medium"
                                                        style={{ color: moodInfo.color }}
                                                    >
                                                        {moodInfo.label}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedMember(member);
                                                setShowKudosModal(true);
                                            }}
                                            className="px-3 py-2 rounded-full"
                                            style={{ backgroundColor: '#F59E0B20' }}
                                        >
                                            <Text className="text-lg"></Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {/* Content */}
                                    <View className="p-4">
                                        {/* Highlight */}
                                        {entry.highlight && (
                                            <View className="mb-3">
                                                <View className="flex-row items-center mb-1">
                                                    <MaterialCommunityIcons 
                                                        name="star" 
                                                        size={16} 
                                                        color="#F59E0B"
                                                    />
                                                    <Text 
                                                        className="text-xs font-semibold ml-1"
                                                        style={{ color: '#F59E0B' }}
                                                    >
                                                        HIGHLIGHT
                                                    </Text>
                                                </View>
                                                <Text style={{ color: colors.text }}>
                                                    {entry.highlight}
                                                </Text>
                                            </View>
                                        )}
                                        
                                        {/* Blocker */}
                                        {entry.blocker && (
                                            <View className="mb-3">
                                                <View className="flex-row items-center mb-1">
                                                    <MaterialCommunityIcons 
                                                        name="alert-circle" 
                                                        size={16} 
                                                        color="#EF4444"
                                                    />
                                                    <Text 
                                                        className="text-xs font-semibold ml-1"
                                                        style={{ color: '#EF4444' }}
                                                    >
                                                        CHALLENGE
                                                    </Text>
                                                </View>
                                                <Text style={{ color: colors.text }}>
                                                    {entry.blocker}
                                                </Text>
                                            </View>
                                        )}
                                        
                                        {/* Help Needed */}
                                        {entry.helpNeeded && (
                                            <View 
                                                className="p-3 rounded-xl"
                                                style={{ backgroundColor: '#3B82F620' }}
                                            >
                                                <View className="flex-row items-center mb-1">
                                                    <MaterialCommunityIcons 
                                                        name="hand-heart" 
                                                        size={16} 
                                                        color="#3B82F6"
                                                    />
                                                    <Text 
                                                        className="text-xs font-semibold ml-1"
                                                        style={{ color: '#3B82F6' }}
                                                    >
                                                        NEEDS HELP
                                                    </Text>
                                                </View>
                                                <Text style={{ color: colors.text }}>
                                                    {entry.helpNeeded}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
                
                {/* Missing Check-ins */}
                {members.length > standupEntries.length && (
                    <View className="px-4 mt-4 mb-8">
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Waiting for
                        </Text>
                        <View className="flex-row flex-wrap">
                            {members
                                .filter(m => !getMemberEntry(m.userId))
                                .map(member => (
                                    <View 
                                        key={member.userId}
                                        className="flex-row items-center px-3 py-2 rounded-full mr-2 mb-2"
                                        style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                                    >
                                        <Text className="text-lg mr-1">{member.avatar}</Text>
                                        <Text 
                                            className="text-sm"
                                            style={{ color: colors.textSecondary }}
                                        >
                                            {member.displayName.split(' ')[0]}
                                        </Text>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                )}
                
                {/* Quick Tips */}
                <View className="px-4 mb-8">
                    <View 
                        className="p-4 rounded-2xl"
                        style={{ backgroundColor: '#A855F720' }}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#A855F7" />
                            <Text 
                                className="ml-2 font-semibold"
                                style={{ color: '#A855F7' }}
                            >
                                Family Standup Tips
                            </Text>
                        </View>
                        <Text 
                            className="text-sm"
                            style={{ color: colors.text }}
                        >
                            • Share one thing you're grateful for{'\n'}
                            • Celebrate small wins together{'\n'}
                            • Offer help when someone's struggling{'\n'}
                            • Keep it brief - 2-3 minutes per person
                        </Text>
                    </View>
                </View>
            </ScrollView>
            
            {/* Check-in Modal */}
            <Modal
                visible={showCheckinModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCheckinModal(false)}
            >
                <View className="flex-1" style={{ backgroundColor: colors.background }}>
                    {/* Modal Header */}
                    <SafeAreaView edges={['top']}>
                        <View 
                            className="flex-row items-center justify-between px-4 py-3 border-b"
                            style={{ borderBottomColor: colors.border }}
                        >
                            <TouchableOpacity onPress={() => {
                                setShowCheckinModal(false);
                                resetForm();
                            }}>
                                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <Text 
                                className="text-lg font-bold"
                                style={{ color: colors.text }}
                            >
                                Daily Check-in
                            </Text>
                            <TouchableOpacity 
                                onPress={handleSubmitCheckin}
                                disabled={!myMood}
                                style={{ opacity: myMood ? 1 : 0.5 }}
                            >
                                <Text className="text-purple-500 font-bold">Done</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                    
                    <ScrollView className="flex-1 px-4 py-4">
                        {/* Mood Selection */}
                        <Text 
                            className="text-lg font-bold mb-3"
                            style={{ color: colors.text }}
                        >
                            How are you feeling today?
                        </Text>
                        <View className="flex-row justify-between mb-6">
                            {MOOD_OPTIONS.map(mood => (
                                <TouchableOpacity
                                    key={mood.type}
                                    onPress={() => setMyMood(mood.type)}
                                    className="items-center p-3 rounded-2xl flex-1 mx-1"
                                    style={{ 
                                        backgroundColor: myMood === mood.type 
                                            ? `${mood.color}20` 
                                            : isDark ? '#374151' : '#F3F4F6',
                                        borderWidth: myMood === mood.type ? 2 : 0,
                                        borderColor: mood.color,
                                    }}
                                >
                                    <Text className="text-2xl mb-1">{mood.emoji}</Text>
                                    <Text 
                                        className="text-xs font-medium"
                                        style={{ 
                                            color: myMood === mood.type ? mood.color : colors.textSecondary 
                                        }}
                                    >
                                        {mood.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        {/* Highlight */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            What's your highlight?
                        </Text>
                        <TextInput
                            value={myHighlight}
                            onChangeText={setMyHighlight}
                            placeholder="Something good happening..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            className="p-4 rounded-xl mb-4"
                            style={{ 
                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                color: colors.text,
                                minHeight: 80,
                                textAlignVertical: 'top',
                            }}
                        />
                        
                        {/* Challenge/Blocker */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Any challenges?
                        </Text>
                        <TextInput
                            value={myBlocker}
                            onChangeText={setMyBlocker}
                            placeholder="Something that's tough right now... (optional)"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            className="p-4 rounded-xl mb-4"
                            style={{ 
                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                color: colors.text,
                                minHeight: 80,
                                textAlignVertical: 'top',
                            }}
                        />
                        
                        {/* Help Needed */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Need any help?
                        </Text>
                        <TextInput
                            value={myHelpNeeded}
                            onChangeText={setMyHelpNeeded}
                            placeholder="How can family help you today? (optional)"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            className="p-4 rounded-xl mb-4"
                            style={{ 
                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                color: colors.text,
                                minHeight: 80,
                                textAlignVertical: 'top',
                            }}
                        />
                    </ScrollView>
                </View>
            </Modal>
            
            {/* Kudos Modal */}
            {selectedMember && (
                <KudosModal
                    visible={showKudosModal}
                    onClose={() => {
                        setShowKudosModal(false);
                        setSelectedMember(null);
                    }}
                    recipient={selectedMember}
                />
            )}
        </View>
    );
}
