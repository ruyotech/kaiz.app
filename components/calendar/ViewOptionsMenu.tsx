import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ViewMode = 'eisenhower' | 'status' | 'size';

interface ViewOptionsMenuProps {
    visible: boolean;
    onClose: () => void;
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function ViewOptionsMenu({
    visible,
    onClose,
    currentView,
    onViewChange,
}: ViewOptionsMenuProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1"
                activeOpacity={1}
                onPress={onClose}
            >
                <View className="absolute top-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 min-w-48">
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        {/* View Type Section */}
                        <View className="p-3">
                            <Text className="text-xs font-semibold text-gray-500 mb-2">VIEW TYPE</Text>

                            <TouchableOpacity
                                onPress={() => { onViewChange('eisenhower'); onClose(); }}
                                className={`flex-row items-center p-2 rounded ${currentView === 'eisenhower' ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <MaterialCommunityIcons
                                    name="grid"
                                    size={20}
                                    color={currentView === 'eisenhower' ? '#3B82F6' : '#374151'}
                                />
                                <Text className={`ml-2 ${currentView === 'eisenhower' ? 'text-blue-600 font-semibold' : 'text-gray-800'
                                    }`}>Eisenhower Matrix</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => { onViewChange('status'); onClose(); }}
                                className={`flex-row items-center p-2 rounded mt-1 ${currentView === 'status' ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <MaterialCommunityIcons
                                    name="format-list-bulleted"
                                    size={20}
                                    color={currentView === 'status' ? '#3B82F6' : '#374151'}
                                />
                                <Text className={`ml-2 ${currentView === 'status' ? 'text-blue-600 font-semibold' : 'text-gray-800'
                                    }`}>Status</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => { onViewChange('size'); onClose(); }}
                                className={`flex-row items-center p-2 rounded mt-1 ${currentView === 'size' ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <MaterialCommunityIcons
                                    name="resize"
                                    size={20}
                                    color={currentView === 'size' ? '#3B82F6' : '#374151'}
                                />
                                <Text className={`ml-2 ${currentView === 'size' ? 'text-blue-600 font-semibold' : 'text-gray-800'
                                    }`}>Size</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
