import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../../hooks/useTranslation';

export default function WikiScreen() {
    const router = useRouter();
    const { t } = useTranslation();

    const WIKI_TOPICS = [
        {
            id: 'agile',
            title: t('wiki.topics.agile.title'),
            description: t('wiki.topics.agile.description'),
            color: '#3B82F6',
            icon: 'infinity'
        },
        {
            id: 'scrum',
            title: t('wiki.topics.scrum.title'),
            description: t('wiki.topics.scrum.description'),
            color: '#10B981',
            icon: 'account-group'
        },
        {
            id: 'pomodoro',
            title: t('wiki.topics.pomodoro.title'),
            description: t('wiki.topics.pomodoro.description'),
            color: '#EF4444',
            icon: 'timer-outline'
        },
        {
            id: 'eisenhower',
            title: t('wiki.topics.eisenhower.title'),
            description: t('wiki.topics.eisenhower.description'),
            color: '#F59E0B',
            icon: 'view-grid-plus'
        },
        {
            id: 'life-wheel',
            title: t('wiki.topics.lifeWheel.title'),
            description: t('wiki.topics.lifeWheel.description'),
            color: '#8B5CF6',
            icon: 'chart-pie'
        },
        {
            id: 'kaizen',
            title: t('wiki.topics.kaizen.title'),
            description: t('wiki.topics.kaizen.description'),
            color: '#EC4899',
            icon: 'leaf'
        }
    ];

    return (
        <Container>
            <ScreenHeader title={t('wiki.title')} subtitle={t('wiki.subtitle')} showBack />

            <ScrollView className="flex-1 p-4">
                {/* Hero Section */}
                <View className="bg-gray-900 rounded-2xl p-6 mb-6 overflow-hidden relative">
                    <View className="absolute right-0 top-0 opacity-20">
                        <MaterialCommunityIcons name="book-open-page-variant" size={120} color="white" />
                    </View>
                    <Text className="text-white font-bold text-2xl w-2/3 mb-2">{t('wiki.heroTitle')}</Text>
                    <Text className="text-gray-300 text-sm w-3/4">
                        {t('wiki.heroDescription')}
                    </Text>
                </View>

                {/* Topics Grid */}
                <View className="flex-row flex-wrap justify-between gap-y-4">
                    {WIKI_TOPICS.map((topic) => (
                        <Pressable
                            key={topic.id}
                            style={{ width: '48%' }}
                            onPress={() => {
                                // In future: navigate to specific article
                                // router.push(`/(tabs)/sprints/wiki/${topic.id}`);
                            }}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                        >
                            <View
                                className="w-10 h-10 rounded-full items-center justify-center mb-3"
                                style={{ backgroundColor: topic.color + '20' }}
                            >
                                <MaterialCommunityIcons name={topic.icon as any} size={24} color={topic.color} />
                            </View>
                            <Text className="font-bold text-gray-900 text-base mb-1">{topic.title}</Text>
                            <Text className="text-xs text-gray-500 leading-snug">{topic.description}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* Recent Articles / Tips */}
                <View className="mt-8 mb-20">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Quick Tips</Text>
                    <View className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex-row items-start mb-3">
                        <MaterialCommunityIcons name="lightbulb-on" size={20} color="#EA580C" className="mt-0.5" />
                        <View className="ml-3 flex-1">
                            <Text className="font-bold text-orange-900 mb-1">Status Updates</Text>
                            <Text className="text-sm text-orange-800">Keep standups under 15 minutes. Focus on blockers, not just status.</Text>
                        </View>
                    </View>
                    <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex-row items-start">
                        <MaterialCommunityIcons name="water" size={20} color="#2563EB" className="mt-0.5" />
                        <View className="ml-3 flex-1">
                            <Text className="font-bold text-blue-900 mb-1">Deep Work</Text>
                            <Text className="text-sm text-blue-800">Schedule 2-hour blocks of uninterrupted time for complex dev tasks.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Container>
    );
}
