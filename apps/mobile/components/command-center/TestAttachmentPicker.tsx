import { logger } from '../../utils/logger';
/**
 * TestAttachmentPicker Component
 * Allows selecting test attachments uploaded via admin for simulator testing
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  Pressable 
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TestAttachment } from '../../types/commandCenter';
import { commandCenterApi } from '../../services/api';

interface TestAttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (attachment: TestAttachment) => void;
  filterType?: 'IMAGE' | 'AUDIO' | 'PDF' | 'DOCUMENT';
}

export function TestAttachmentPicker({ 
  visible, 
  onClose, 
  onSelect,
  filterType 
}: TestAttachmentPickerProps) {
  const [attachments, setAttachments] = useState<TestAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');

  const tabs = ['ALL', 'IMAGE', 'AUDIO', 'PDF', 'DOCUMENT'];

  const loadAttachments = useCallback(async () => {
    setLoading(true);
    try {
      const type = filterType || (selectedTab !== 'ALL' ? selectedTab : undefined);
      const response = await commandCenterApi.getTestAttachments(type);
      if (response.success && response.data) {
        setAttachments(response.data.filter(a => a.isActive));
      }
    } catch (error) {
      logger.error('Failed to load test attachments:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTab, filterType]);

  useEffect(() => {
    if (visible) {
      loadAttachments();
    }
  }, [visible, loadAttachments]);

  const filteredAttachments = attachments.filter(a => 
    selectedTab === 'ALL' || a.attachmentType === selectedTab
  );

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'IMAGE': return 'image';
      case 'AUDIO': return 'microphone';
      case 'PDF': return 'file-pdf-box';
      case 'VIDEO': return 'video';
      default: return 'file-document';
    }
  };

  const getAttachmentColor = (type: string) => {
    switch (type) {
      case 'IMAGE': return '#10B981';
      case 'AUDIO': return '#8B5CF6';
      case 'PDF': return '#EF4444';
      case 'VIDEO': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const renderAttachment = ({ item }: { item: TestAttachment }) => {
    const color = getAttachmentColor(item.attachmentType);
    const icon = getAttachmentIcon(item.attachmentType);

    return (
      <TouchableOpacity
        onPress={() => {
          onSelect(item);
          onClose();
        }}
        className="flex-row items-center p-4 bg-white rounded-xl mb-2 border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {/* Thumbnail or Icon */}
        <View 
          className="w-14 h-14 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: color + '15' }}
        >
          {item.attachmentType === 'IMAGE' && item.fileUrl ? (
            <Image
              source={{ uri: item.fileUrl }}
              className="w-14 h-14 rounded-xl"
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <MaterialCommunityIcons name={icon as any} size={28} color={color} />
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
            {item.attachmentName}
          </Text>
          {item.description && (
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
              {item.description}
            </Text>
          )}
          <View className="flex-row items-center mt-1">
            <View 
              className="px-2 py-0.5 rounded-full mr-2"
              style={{ backgroundColor: color + '20' }}
            >
              <Text className="text-xs font-medium" style={{ color }}>
                {item.attachmentType}
              </Text>
            </View>
            {item.useCase && (
              <Text className="text-xs text-gray-400">{item.useCase}</Text>
            )}
          </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        
        <View className="bg-gray-50 rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
            <View>
              <Text className="text-xl font-bold text-gray-900">Test Attachments</Text>
              <Text className="text-sm text-gray-500">For simulator testing</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          {!filterType && (
            <View className="flex-row px-4 py-3 border-b border-gray-100">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    selectedTab === tab ? 'bg-purple-600' : 'bg-gray-100'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedTab === tab ? 'text-white' : 'text-gray-600'
                  }`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Content */}
          {loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="text-gray-500 mt-3">Loading attachments...</Text>
            </View>
          ) : filteredAttachments.length === 0 ? (
            <View className="py-12 items-center px-4">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <MaterialCommunityIcons name="file-hidden" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-semibold text-gray-800 mb-1">No attachments</Text>
              <Text className="text-gray-500 text-center">
                Upload test attachments via the admin panel to use them here.
              </Text>
            </View>
          ) : (
            <FlashList
              data={filteredAttachments}
              renderItem={renderAttachment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default TestAttachmentPicker;
