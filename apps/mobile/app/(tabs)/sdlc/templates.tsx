import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TaskTemplate } from '../../../types/models';
import { useTemplateStore } from '../../../store/templateStore';
import {
    TemplateList,
    TemplateDetailModal,
    CreateFromTemplateSheet,
} from '../../../components/templates';
import { useTranslation } from '../../../hooks';

type TabType = 'global' | 'my' | 'favorites';

export default function TemplatesScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const {
        globalTemplates,
        userTemplates,
        favoriteTemplates,
        loading,
        error,
        fetchAllTemplates,
        fetchGlobalTemplates,
        fetchUserTemplates,
        fetchFavoriteTemplates,
        cloneTemplate,
        clearError,
    } = useTemplateStore();

    const [activeTab, setActiveTab] = useState<TabType>('global');
    const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [templateForCreation, setTemplateForCreation] = useState<TaskTemplate | null>(null);

    useEffect(() => {
        fetchAllTemplates();
    }, []);

    const handleRefresh = useCallback(async () => {
        switch (activeTab) {
            case 'global':
                await fetchGlobalTemplates();
                break;
            case 'my':
                await fetchUserTemplates();
                break;
            case 'favorites':
                await fetchFavoriteTemplates();
                break;
        }
    }, [activeTab, fetchGlobalTemplates, fetchUserTemplates, fetchFavoriteTemplates]);

    const handleTemplatePress = (template: TaskTemplate) => {
        setSelectedTemplate(template);
        setShowDetailModal(true);
    };

    const handleTemplateUse = (template: TaskTemplate) => {
        setTemplateForCreation(template);
        setShowDetailModal(false);
        setShowCreateSheet(true);
    };

    const handleCloneTemplate = async (template: TaskTemplate) => {
        try {
            await cloneTemplate(template.id);
            setShowDetailModal(false);
            setActiveTab('my');
        } catch (error) {
            console.error('Failed to clone template:', error);
        }
    };

    const handleTaskCreated = (taskId: string) => {
        setShowCreateSheet(false);
        setTemplateForCreation(null);
        // Navigate to the task detail or sprint calendar
        router.push(`/(tabs)/sdlc/task/${taskId}`);
    };

    const getActiveTemplates = () => {
        switch (activeTab) {
            case 'global':
                return globalTemplates;
            case 'my':
                return userTemplates;
            case 'favorites':
                return favoriteTemplates;
            default:
                return globalTemplates;
        }
    };

    const getEmptyMessage = () => {
        switch (activeTab) {
            case 'global':
                return 'No global templates available';
            case 'my':
                return 'You haven\'t created any templates yet';
            case 'favorites':
                return 'No favorite templates yet. Star templates to add them here!';
            default:
                return 'No templates found';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="bg-white border-b border-gray-100 px-4 py-4">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-2 -ml-2"
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Templates</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/sdlc/create-template' as any)}
                        className="p-2 -mr-2"
                    >
                        <Ionicons name="add-circle-outline" size={28} color="#3b82f6" />
                    </TouchableOpacity>
                </View>

                {/* Tab Switcher */}
                <View className="flex-row mt-4 bg-gray-100 rounded-xl p-1">
                    <TouchableOpacity
                        onPress={() => setActiveTab('global')}
                        className={`flex-1 py-2.5 rounded-lg items-center ${
                            activeTab === 'global' ? 'bg-white shadow-sm' : ''
                        }`}
                    >
                        <Text
                            className={`font-semibold ${
                                activeTab === 'global' ? 'text-blue-600' : 'text-gray-500'
                            }`}
                        >
                            🌐 Global
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('my')}
                        className={`flex-1 py-2.5 rounded-lg items-center ${
                            activeTab === 'my' ? 'bg-white shadow-sm' : ''
                        }`}
                    >
                        <Text
                            className={`font-semibold ${
                                activeTab === 'my' ? 'text-blue-600' : 'text-gray-500'
                            }`}
                        >
                            👤 My Templates
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('favorites')}
                        className={`flex-1 py-2.5 rounded-lg items-center ${
                            activeTab === 'favorites' ? 'bg-white shadow-sm' : ''
                        }`}
                    >
                        <Text
                            className={`font-semibold ${
                                activeTab === 'favorites' ? 'text-blue-600' : 'text-gray-500'
                            }`}
                        >
                            ❤️ Favorites
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Error Banner */}
            {error && (
                <View className="bg-red-50 px-4 py-3 flex-row items-center justify-between">
                    <Text className="text-red-700 flex-1">{error}</Text>
                    <TouchableOpacity onPress={clearError}>
                        <Ionicons name="close" size={20} color="#b91c1c" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Template List */}
            <View className="flex-1 px-4 pt-4">
                <TemplateList
                    templates={getActiveTemplates()}
                    onTemplatePress={handleTemplatePress}
                    onTemplateUse={handleTemplateUse}
                    onRefresh={handleRefresh}
                    loading={loading}
                    showFilters={true}
                    showSearch={true}
                    emptyMessage={getEmptyMessage()}
                />
            </View>

            {/* Detail Modal */}
            <TemplateDetailModal
                visible={showDetailModal}
                template={selectedTemplate}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedTemplate(null);
                }}
                onUseTemplate={handleTemplateUse}
                onCloneTemplate={handleCloneTemplate}
            />

            {/* Create from Template Sheet */}
            <CreateFromTemplateSheet
                visible={showCreateSheet}
                template={templateForCreation}
                onClose={() => {
                    setShowCreateSheet(false);
                    setTemplateForCreation(null);
                }}
                onSuccess={handleTaskCreated}
            />
        </SafeAreaView>
    );
}
