import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const WIKI_TOPICS = [
    {
        id: 'agile',
        title: 'Agile Methodology',
        description: 'Iterative approach to software delivery.',
        color: '#3B82F6',
        icon: 'infinity'
    },
    {
        id: 'scrum',
        title: 'Scrum Framework',
        description: 'Roles, events, and artifacts.',
        color: '#10B981',
        icon: 'account-group'
    },
    {
        id: 'pomodoro',
        title: 'Pomodoro Technique',
        description: 'Time management method.',
        color: '#EF4444',
        icon: 'timer-outline'
    },
    {
        id: 'eisenhower',
        title: 'Eisenhower Matrix',
        description: 'Prioritize tasks by urgency & importance.',
        color: '#F59E0B',
        icon: 'view-grid-plus'
    },
    {
        id: 'life-wheel',
        title: 'Life Wheel',
        description: 'Balance different areas of your life.',
        color: '#8B5CF6',
        icon: 'chart-pie'
    },
    {
        id: 'kaizen',
        title: 'Kaizen Philosophy',
        description: 'Continuous improvement.',
        color: '#EC4899',
        icon: 'leaf'
    }
];

export default function WikiScreen() {
    const router = useRouter();

    return (
        <Container>
            <ScreenHeader title="Knowledge Hub" subtitle="Master the concepts" showBack />

            <ScrollView className="flex-1 p-4">
                {/* Hero Section */}
                <View className="bg-gray-900 rounded-2xl p-6 mb-6 overflow-hidden relative">
                    <View className="absolute right-0 top-0 opacity-20">
                        <MaterialCommunityIcons name="book-open-page-variant" size={120} color="white" />
                    </View>
                    <Text className="text-white font-bold text-2xl w-2/3 mb-2">Learn, Apply, Improve.</Text>
                    <Text className="text-gray-300 text-sm w-3/4">
                        Discover the methodologies that power high-performance teams and balanced lives.
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
                                // router.push(`/(tabs)/sdlc/wiki/${topic.id}`);
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
