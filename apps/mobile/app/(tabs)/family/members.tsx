/**
 * Family Members Screen - Manage Family Members
 * 
 * Features:
 * - View all family members with details
 * - Invite new members
 * - Manage member roles
 * - Send kudos
 * - Start independence transitions
 */

import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    RefreshControl,
    Alert,
    Share,
    Modal,
    TextInput,
    Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useFamilyStore } from '../../../store/familyStore';
import { MemberCard } from '../../../components/family/MemberCard';
import { KudosModal } from '../../../components/family/KudosModal';
import { IndependenceWizard } from '../../../components/family/IndependenceWizard';
import { 
    FamilyMember, 
    FamilyRole, 
    ROLE_CONFIGURATIONS 
} from '../../../types/family.types';

export default function FamilyMembersScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const {
        currentFamily,
        members,
        pendingInvites,
        loading,
        hasPermission,
        fetchMembers,
        inviteMember,
        updateMemberRole,
        removeMember,
        generateInviteCode,
        initiateIndependenceTransition,
    } = useFamilyStore();
    
    const [refreshing, setRefreshing] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showKudosModal, setShowKudosModal] = useState(false);
    const [showIndependenceWizard, setShowIndependenceWizard] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<FamilyRole>('adult');
    
    useEffect(() => {
        fetchMembers();
    }, []);
    
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMembers();
        setRefreshing(false);
    };
    
    const handleShareInvite = async () => {
        try {
            const code = await generateInviteCode();
            await Share.share({
                message: `Join our family workspace "${currentFamily?.name}" on Kaiz !\n\nUse invite code: ${code}\n\nDownload the app and enter this code to join.`,
                title: 'Join Our Family',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to generate invite code');
        }
    };
    
    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            Alert.alert('Error', 'Please enter an email address');
            return;
        }
        
        try {
            await inviteMember(inviteEmail.trim(), inviteRole);
            setShowInviteModal(false);
            setInviteEmail('');
            Alert.alert('Success', 'Invitation sent!');
        } catch (error) {
            Alert.alert('Error', 'Failed to send invitation');
        }
    };
    
    const handleRoleChange = async (newRole: FamilyRole) => {
        if (!selectedMember) return;
        
        try {
            await updateMemberRole(selectedMember.userId, newRole);
            setShowRoleModal(false);
            setSelectedMember(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to update role');
        }
    };
    
    const handleRemoveMember = (member: FamilyMember) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${member.displayName} from the family?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeMember(member.userId);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove member');
                        }
                    }
                },
            ]
        );
    };
    
    const handleStartIndependence = (member: FamilyMember) => {
        Alert.alert(
            'Start Independence Transition',
            `Are you ready to help ${member.displayName} transition to their own independent account?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Start Transition',
                    onPress: async () => {
                        try {
                            await initiateIndependenceTransition(member.userId);
                            setSelectedMember(member);
                            setShowIndependenceWizard(true);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to start transition');
                        }
                    }
                },
            ]
        );
    };
    
    const handleManageMember = (member: FamilyMember) => {
        setSelectedMember(member);
        
        const options = [];
        
        if (hasPermission('manage_members')) {
            options.push({
                text: 'Change Role',
                onPress: () => setShowRoleModal(true),
            });
        }
        
        if (hasPermission('approve_independence') && ['teen', 'child'].includes(member.role)) {
            options.push({
                text: 'Start Independence Transition',
                onPress: () => handleStartIndependence(member),
            });
        }
        
        if (hasPermission('remove_members') && member.role !== 'owner') {
            options.push({
                text: 'Remove from Family',
                style: 'destructive' as const,
                onPress: () => handleRemoveMember(member),
            });
        }
        
        options.push({ text: 'Cancel', style: 'cancel' as const });
        
        Alert.alert(
            member.displayName,
            'What would you like to do?',
            options
        );
    };
    
    // Group members by role
    const owners = members.filter(m => m.role === 'owner');
    const adults = members.filter(m => m.role === 'adult');
    const teens = members.filter(m => m.role === 'teen');
    const children = members.filter(m => m.role === 'child');
    
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
                                <Text className="text-white text-xl font-bold">Family Members</Text>
                                <Text className="text-purple-200 text-xs">
                                    {members.length} member{members.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                        </View>
                        
                        {hasPermission('invite_members') && (
                            <TouchableOpacity 
                                onPress={handleShareInvite}
                                className="flex-row items-center bg-white/20 px-4 py-2 rounded-full"
                            >
                                <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
                                <Text className="text-white font-medium ml-2">Invite</Text>
                            </TouchableOpacity>
                        )}
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
                {/* Invite Code Card */}
                {hasPermission('invite_members') && (
                    <TouchableOpacity
                        onPress={() => setShowInviteModal(true)}
                        className="mx-4 mt-4 p-4 rounded-2xl flex-row items-center"
                        style={{ backgroundColor: '#8B5CF615', borderWidth: 1, borderColor: '#8B5CF640' }}
                    >
                        <View 
                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: '#8B5CF6' }}
                        >
                            <MaterialCommunityIcons name="email-plus" size={24} color="#fff" />
                        </View>
                        <View className="flex-1">
                            <Text 
                                className="font-bold"
                                style={{ color: colors.text }}
                            >
                                Invite Someone
                            </Text>
                            <Text 
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                            >
                                Send an invite via email or share code
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#8B5CF6" />
                    </TouchableOpacity>
                )}
                
                {/* Owners */}
                {owners.length > 0 && (
                    <View className="mt-6 px-4">
                        <View className="flex-row items-center mb-3">
                            <MaterialCommunityIcons 
                                name={ROLE_CONFIGURATIONS.owner.icon as any} 
                                size={18} 
                                color={ROLE_CONFIGURATIONS.owner.color}
                            />
                            <Text 
                                className="text-sm font-bold ml-2"
                                style={{ color: colors.textSecondary }}
                            >
                                OWNER
                            </Text>
                        </View>
                        {owners.map(member => (
                            <MemberCard
                                key={member.userId}
                                member={member}
                                isCurrentUser={member.userId === 'user-1'}
                                onSendKudos={() => {
                                    setSelectedMember(member);
                                    setShowKudosModal(true);
                                }}
                                onManage={hasPermission('manage_members') ? () => handleManageMember(member) : undefined}
                            />
                        ))}
                    </View>
                )}
                
                {/* Adults */}
                {adults.length > 0 && (
                    <View className="mt-6 px-4">
                        <View className="flex-row items-center mb-3">
                            <MaterialCommunityIcons 
                                name={ROLE_CONFIGURATIONS.adult.icon as any} 
                                size={18} 
                                color={ROLE_CONFIGURATIONS.adult.color}
                            />
                            <Text 
                                className="text-sm font-bold ml-2"
                                style={{ color: colors.textSecondary }}
                            >
                                ADULTS
                            </Text>
                        </View>
                        {adults.map(member => (
                            <MemberCard
                                key={member.userId}
                                member={member}
                                isCurrentUser={member.userId === 'user-1'}
                                onSendKudos={() => {
                                    setSelectedMember(member);
                                    setShowKudosModal(true);
                                }}
                                onManage={hasPermission('manage_members') ? () => handleManageMember(member) : undefined}
                            />
                        ))}
                    </View>
                )}
                
                {/* Teens */}
                {teens.length > 0 && (
                    <View className="mt-6 px-4">
                        <View className="flex-row items-center mb-3">
                            <MaterialCommunityIcons 
                                name={ROLE_CONFIGURATIONS.teen.icon as any} 
                                size={18} 
                                color={ROLE_CONFIGURATIONS.teen.color}
                            />
                            <Text 
                                className="text-sm font-bold ml-2"
                                style={{ color: colors.textSecondary }}
                            >
                                TEENS
                            </Text>
                        </View>
                        {teens.map(member => (
                            <MemberCard
                                key={member.userId}
                                member={member}
                                isCurrentUser={member.userId === 'user-1'}
                                onSendKudos={() => {
                                    setSelectedMember(member);
                                    setShowKudosModal(true);
                                }}
                                onManage={hasPermission('manage_members') ? () => handleManageMember(member) : undefined}
                            />
                        ))}
                    </View>
                )}
                
                {/* Children */}
                {children.length > 0 && (
                    <View className="mt-6 px-4 mb-8">
                        <View className="flex-row items-center mb-3">
                            <MaterialCommunityIcons 
                                name={ROLE_CONFIGURATIONS.child.icon as any} 
                                size={18} 
                                color={ROLE_CONFIGURATIONS.child.color}
                            />
                            <Text 
                                className="text-sm font-bold ml-2"
                                style={{ color: colors.textSecondary }}
                            >
                                CHILDREN
                            </Text>
                        </View>
                        {children.map(member => (
                            <MemberCard
                                key={member.userId}
                                member={member}
                                isCurrentUser={member.userId === 'user-1'}
                                onSendKudos={() => {
                                    setSelectedMember(member);
                                    setShowKudosModal(true);
                                }}
                                onManage={hasPermission('manage_members') ? () => handleManageMember(member) : undefined}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
            
            {/* Invite Modal */}
            <Modal
                visible={showInviteModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowInviteModal(false)}
            >
                <Pressable 
                    className="flex-1 justify-end"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onPress={() => setShowInviteModal(false)}
                >
                    <Pressable 
                        className="rounded-t-3xl p-6"
                        style={{ backgroundColor: colors.background }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text 
                            className="text-xl font-bold mb-4"
                            style={{ color: colors.text }}
                        >
                            Invite Family Member
                        </Text>
                        
                        {/* Email Input */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Email Address
                        </Text>
                        <TextInput
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                            placeholder="Enter email address"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="p-4 rounded-xl mb-4"
                            style={{ 
                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                color: colors.text,
                            }}
                        />
                        
                        {/* Role Selection */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Role
                        </Text>
                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {(['adult', 'teen', 'child'] as FamilyRole[]).map(role => {
                                const config = ROLE_CONFIGURATIONS[role];
                                return (
                                    <TouchableOpacity
                                        key={role}
                                        onPress={() => setInviteRole(role)}
                                        className="flex-row items-center px-4 py-3 rounded-xl"
                                        style={{ 
                                            backgroundColor: inviteRole === role 
                                                ? `${config.color}20` 
                                                : isDark ? '#374151' : '#F3F4F6',
                                            borderWidth: inviteRole === role ? 2 : 0,
                                            borderColor: config.color,
                                        }}
                                    >
                                        <MaterialCommunityIcons 
                                            name={config.icon as any} 
                                            size={18} 
                                            color={inviteRole === role ? config.color : colors.textSecondary}
                                        />
                                        <Text 
                                            className="font-medium ml-2"
                                            style={{ 
                                                color: inviteRole === role ? config.color : colors.text 
                                            }}
                                        >
                                            {config.label.split(' ')[0]}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        
                        {/* Actions */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={handleShareInvite}
                                className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                            >
                                <MaterialCommunityIcons name="share-variant" size={20} color={colors.textSecondary} />
                                <Text 
                                    className="font-medium ml-2"
                                    style={{ color: colors.text }}
                                >
                                    Share Code
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleInvite}
                                className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                                style={{ backgroundColor: '#8B5CF6' }}
                            >
                                <MaterialCommunityIcons name="send" size={20} color="#fff" />
                                <Text className="font-bold text-white ml-2">Send Invite</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
            
            {/* Role Change Modal */}
            <Modal
                visible={showRoleModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowRoleModal(false)}
            >
                <Pressable 
                    className="flex-1 justify-end"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onPress={() => setShowRoleModal(false)}
                >
                    <Pressable 
                        className="rounded-t-3xl p-6"
                        style={{ backgroundColor: colors.background }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text 
                            className="text-xl font-bold mb-4"
                            style={{ color: colors.text }}
                        >
                            Change Role for {selectedMember?.displayName}
                        </Text>
                        
                        {(['adult', 'teen', 'child'] as FamilyRole[]).map(role => {
                            const config = ROLE_CONFIGURATIONS[role];
                            const isSelected = selectedMember?.role === role;
                            
                            return (
                                <TouchableOpacity
                                    key={role}
                                    onPress={() => handleRoleChange(role)}
                                    className="flex-row items-center p-4 rounded-xl mb-2"
                                    style={{ 
                                        backgroundColor: isSelected 
                                            ? `${config.color}20` 
                                            : isDark ? '#374151' : '#F3F4F6',
                                        borderWidth: isSelected ? 2 : 0,
                                        borderColor: config.color,
                                    }}
                                >
                                    <MaterialCommunityIcons 
                                        name={config.icon as any} 
                                        size={24} 
                                        color={config.color}
                                    />
                                    <View className="flex-1 ml-3">
                                        <Text 
                                            className="font-bold"
                                            style={{ color: colors.text }}
                                        >
                                            {config.label}
                                        </Text>
                                        <Text 
                                            className="text-xs"
                                            style={{ color: colors.textSecondary }}
                                        >
                                            {config.description}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <MaterialCommunityIcons 
                                            name="check-circle" 
                                            size={24} 
                                            color={config.color}
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </Pressable>
                </Pressable>
            </Modal>
            
            {/* Kudos Modal */}
            <KudosModal
                visible={showKudosModal}
                onClose={() => {
                    setShowKudosModal(false);
                    setSelectedMember(null);
                }}
                recipient={selectedMember}
            />
            
            {/* Independence Wizard */}
            <IndependenceWizard
                visible={showIndependenceWizard}
                onClose={() => {
                    setShowIndependenceWizard(false);
                    setSelectedMember(null);
                }}
                memberName={selectedMember?.displayName || ''}
                isParentInitiated
            />
        </View>
    );
}
