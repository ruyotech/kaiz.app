import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Challenge } from '../../types/models';
import { Button } from '../ui/Button';

interface LogEntryModalProps {
    visible: boolean;
    challenge: Challenge;
    onClose: () => void;
    onSubmit: (value: number | boolean, note?: string) => void;
}

export function LogEntryModal({ visible, challenge, onClose, onSubmit }: LogEntryModalProps) {
    const [value, setValue] = useState<string>('');
    const [yesNoValue, setYesNoValue] = useState<boolean | null>(null);
    const [note, setNote] = useState('');
    
    const handleSubmit = () => {
        if (challenge.metricType === 'yesno' && yesNoValue !== null) {
            onSubmit(yesNoValue, note);
            resetForm();
        } else if (challenge.metricType === 'streak') {
            onSubmit(true, note);
            resetForm();
        } else if (value) {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                Alert.alert('Error', 'Please enter a valid number');
                return;
            }
            onSubmit(numValue, note);
            resetForm();
        } else {
            Alert.alert('Error', 'Please enter a value');
        }
    };
    
    const resetForm = () => {
        setValue('');
        setYesNoValue(null);
        setNote('');
        onClose();
    };
    
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-bold">Log Entry</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-gray-500 text-xl">✕</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <Text className="text-lg font-semibold mb-4">{challenge.name}</Text>
                    
                    {/* Input based on metric type */}
                    {challenge.metricType === 'yesno' && (
                        <View className="mb-6">
                            <Text className="text-gray-600 mb-3">Did you complete this today?</Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setYesNoValue(true)}
                                    className={`flex-1 py-4 rounded-lg border-2 ${
                                        yesNoValue === true
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    <Text className={`text-center text-xl ${
                                        yesNoValue === true ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                        ✓ Yes
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setYesNoValue(false)}
                                    className={`flex-1 py-4 rounded-lg border-2 ${
                                        yesNoValue === false
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    <Text className={`text-center text-xl ${
                                        yesNoValue === false ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                        ✗ No
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    
                    {challenge.metricType === 'streak' && (
                        <View className="mb-6 bg-orange-50 rounded-lg p-4">
                            <Text className="text-center text-lg">
                                Keep your streak alive!
                            </Text>
                            <Text className="text-center text-gray-600 mt-2">
                                Tap "Log Entry" to mark today as complete
                            </Text>
                        </View>
                    )}
                    
                    {(challenge.metricType === 'count' || challenge.metricType === 'time') && (
                        <View className="mb-6">
                            <Text className="text-gray-600 mb-2">
                                How many {challenge.unit}?
                                {challenge.targetValue && ` (Goal: ${challenge.targetValue})`}
                            </Text>
                            <TextInput
                                value={value}
                                onChangeText={setValue}
                                placeholder={`Enter ${challenge.unit}...`}
                                keyboardType="numeric"
                                className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
                            />
                        </View>
                    )}
                    
                    {/* Optional Note */}
                    <View className="mb-6">
                        <Text className="text-gray-600 mb-2">Note (optional)</Text>
                        <TextInput
                            value={note}
                            onChangeText={setNote}
                            placeholder="Add a note about today..."
                            multiline
                            numberOfLines={3}
                            className="border border-gray-300 rounded-lg px-4 py-3"
                        />
                    </View>
                    
                    {/* Actions */}
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Button
                                onPress={onClose}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </View>
                        <View className="flex-1">
                            <Button
                                onPress={handleSubmit}
                            >
                                Log Entry
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
