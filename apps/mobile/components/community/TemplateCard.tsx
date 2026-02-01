import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityTemplate } from '../../types/models';
import { useThemeContext } from '../../providers/ThemeProvider';

interface TemplateCardProps {
    template: CommunityTemplate;
    onPress?: () => void;
    onDownload?: () => void;
    onBookmark?: () => void;
    compact?: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    sprint_plan: { label: 'Sprint Plan', icon: 'calendar-week', color: '#3B82F6' },
    epic: { label: 'Epic', icon: 'bookmark-multiple', color: '#8B5CF6' },
    ritual: { label: 'Ritual', icon: 'meditation', color: '#EC4899' },
    challenge: { label: 'Challenge', icon: 'trophy', color: '#F59E0B' },
    process: { label: 'Process', icon: 'cogs', color: '#10B981' },
    checklist: { label: 'Checklist', icon: 'checkbox-marked', color: '#06B6D4' },
};

export function TemplateCard({ template, onPress, onDownload, onBookmark, compact = false }: TemplateCardProps) {
    const { colors } = useThemeContext();
    const config = TYPE_CONFIG[template.type] || TYPE_CONFIG.process;
    
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <MaterialCommunityIcons key={i} name="star" size={12} color="#F59E0B" />
                );
            } else if (i === fullStars && hasHalf) {
                stars.push(
                    <MaterialCommunityIcons key={i} name="star-half-full" size={12} color="#F59E0B" />
                );
            } else {
                stars.push(
                    <MaterialCommunityIcons key={i} name="star-outline" size={12} color={colors.border} />
                );
            }
        }
        return stars;
    };

    if (compact) {
        return (
            <TouchableOpacity 
                className="rounded-xl p-3 mr-3 shadow-sm"
                style={{ width: 200, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View className="flex-row items-center mb-2">
                    <View 
                        className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                        style={{ backgroundColor: config.color + '20' }}
                    >
                        <MaterialCommunityIcons 
                            name={config.icon as any} 
                            size={18} 
                            color={config.color} 
                        />
                    </View>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>{config.label}</Text>
                </View>
                
                <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }} numberOfLines={2}>
                    {template.name}
                </Text>
                
                <View className="flex-row items-center">
                    <View className="flex-row">{renderStars(template.rating)}</View>
                    <Text className="text-xs ml-1" style={{ color: colors.textTertiary }}>
                        ({template.ratingCount})
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity 
            className="rounded-2xl p-4 mb-3 shadow-sm"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View className="flex-row">
                {/* Icon */}
                <View 
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: config.color + '20' }}
                >
                    <MaterialCommunityIcons 
                        name={config.icon as any} 
                        size={24} 
                        color={config.color} 
                    />
                </View>
                
                {/* Content */}
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <Text 
                            className="text-xs font-medium mr-2"
                            style={{ color: config.color }}
                        >
                            {config.label}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textTertiary }}>
                            by {template.authorName}
                        </Text>
                    </View>
                    
                    <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>
                        {template.name}
                    </Text>
                    
                    <Text className="text-sm" style={{ color: colors.textSecondary }} numberOfLines={2}>
                        {template.description}
                    </Text>
                </View>
            </View>
            
            {/* Tags */}
            <View className="flex-row flex-wrap mt-3">
                {template.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} className="rounded-full px-2.5 py-1 mr-2 mb-1" style={{ backgroundColor: colors.backgroundSecondary }}>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>{tag}</Text>
                    </View>
                ))}
            </View>
            
            {/* Footer */}
            <View className="flex-row items-center mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                <View className="flex-row items-center">
                    <View className="flex-row">{renderStars(template.rating)}</View>
                    <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                        {template.rating.toFixed(1)} ({template.ratingCount})
                    </Text>
                </View>
                
                <View className="flex-row items-center ml-4">
                    <MaterialCommunityIcons name="download" size={14} color={colors.textSecondary} />
                    <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                        {template.downloadCount.toLocaleString()}
                    </Text>
                </View>
                
                <View className="flex-1" />
                
                <TouchableOpacity 
                    className="mr-3"
                    onPress={onBookmark}
                >
                    <MaterialCommunityIcons 
                        name={template.isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                        size={20} 
                        color={template.isBookmarked ? colors.primary : colors.textSecondary} 
                    />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    className="px-4 py-1.5 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                    onPress={onDownload}
                >
                    <Text className="text-xs font-semibold" style={{ color: colors.textInverse }}>Use</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
