import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { TemplateCard } from '../../../components/community/TemplateCard';
import { TemplateType } from '../../../types/models';

const TEMPLATE_TYPES: { key: TemplateType | 'all'; label: string; icon: string; color: string }[] = [
    { key: 'all', label: 'All', icon: 'view-grid', color: '#9333EA' },
    { key: 'sprint_plan', label: 'Sprints', icon: 'calendar-week', color: '#3B82F6' },
    { key: 'ritual', label: 'Rituals', icon: 'meditation', color: '#EC4899' },
    { key: 'challenge', label: 'Challenges', icon: 'trophy', color: '#F59E0B' },
    { key: 'epic', label: 'Epics', icon: 'bookmark-multiple', color: '#8B5CF6' },
    { key: 'checklist', label: 'Checklists', icon: 'checkbox-marked', color: '#10B981' },
];

type SortOption = 'popular' | 'rating' | 'newest';

export default function TemplatesScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('popular');
    const [searchQuery, setSearchQuery] = useState('');
    
    const { templates, fetchTemplates, downloadTemplate, bookmarkTemplate, loading } = useCommunityStore();

    useEffect(() => {
        fetchTemplates(selectedType === 'all' ? undefined : selectedType);
    }, [selectedType]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTemplates(selectedType === 'all' ? undefined : selectedType);
        setRefreshing(false);
    };

    const filteredTemplates = templates
        .filter(t => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return t.name.toLowerCase().includes(query) || 
                       t.description.toLowerCase().includes(query) ||
                       t.tags.some(tag => tag.toLowerCase().includes(query));
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return b.downloadCount - a.downloadCount;
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-white border-b border-gray-200">
                <View className="px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-xl font-bold text-gray-900">Templates</Text>
                            <Text className="text-xs text-gray-500">Ready-to-use plans & rituals</Text>
                        </View>
                        <TouchableOpacity className="bg-purple-600 px-4 py-2 rounded-full flex-row items-center">
                            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                            <Text className="text-white text-sm font-semibold ml-1">Create</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 mt-3">
                        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-2 text-base"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            </SafeAreaView>

            {/* Type Filter */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="bg-white border-b border-gray-100"
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }}
            >
                {TEMPLATE_TYPES.map((type) => (
                    <TouchableOpacity
                        key={type.key}
                        className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                            selectedType === type.key 
                                ? 'bg-purple-600' 
                                : 'bg-gray-100'
                        }`}
                        onPress={() => setSelectedType(type.key)}
                    >
                        <MaterialCommunityIcons 
                            name={type.icon as any} 
                            size={16} 
                            color={selectedType === type.key ? '#fff' : type.color} 
                        />
                        <Text 
                            className={`ml-1 text-sm font-medium ${
                                selectedType === type.key ? 'text-white' : 'text-gray-600'
                            }`}
                        >
                            {type.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Sort Options */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50">
                <Text className="text-sm text-gray-500">
                    {filteredTemplates.length} templates
                </Text>
                <View className="flex-row">
                    {([
                        { key: 'popular', label: 'Popular' },
                        { key: 'rating', label: 'Top Rated' },
                        { key: 'newest', label: 'Newest' },
                    ] as { key: SortOption; label: string }[]).map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            className={`px-3 py-1 rounded-full ml-2 ${
                                sortBy === option.key ? 'bg-purple-100' : ''
                            }`}
                            onPress={() => setSortBy(option.key)}
                        >
                            <Text 
                                className={`text-xs font-medium ${
                                    sortBy === option.key ? 'text-purple-600' : 'text-gray-500'
                                }`}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Templates List */}
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredTemplates.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <MaterialCommunityIcons name="file-search-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 text-base mt-3">No templates found</Text>
                        <Text className="text-gray-400 text-sm">Try adjusting your filters</Text>
                    </View>
                ) : (
                    filteredTemplates.map((template) => (
                        <TemplateCard 
                            key={template.id}
                            template={template}
                            onDownload={() => downloadTemplate(template.id)}
                            onBookmark={() => bookmarkTemplate(template.id)}
                        />
                    ))
                )}

                {/* Create Template CTA */}
                <View className="bg-purple-50 rounded-2xl p-4 mt-4 mb-4">
                    <View className="flex-row items-center">
                        <View className="flex-1">
                            <Text className="text-purple-800 font-bold mb-1">Share Your Workflow</Text>
                            <Text className="text-purple-600 text-sm">
                                Help others succeed by sharing your sprint plans, rituals, or checklists
                            </Text>
                        </View>
                        <TouchableOpacity className="bg-purple-600 px-4 py-2 rounded-full ml-3">
                            <Text className="text-white text-sm font-semibold">Create</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
