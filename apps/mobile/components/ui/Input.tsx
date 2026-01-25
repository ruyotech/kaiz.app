import React from 'react';
import { TextInput, Text, View, TextInputProps } from 'react-native';

interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    multiline?: boolean;
    numberOfLines?: number;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: TextInputProps['autoCapitalize'];
}

export function Input({
    value,
    onChangeText,
    placeholder,
    label,
    error,
    multiline = false,
    numberOfLines = 1,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize,
}: InputProps) {
    return (
        <View className="mb-4">
            {label && (
                <Text className="text-sm font-medium text-gray-700 mb-1">
                    {label}
                </Text>
            )}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                multiline={multiline}
                numberOfLines={numberOfLines}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                className={`
          border rounded-lg px-4 py-3 text-base
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${multiline ? 'min-h-[100px]' : ''}
        `}
                placeholderTextColor="#9CA3AF"
            />
            {error && (
                <Text className="text-sm text-red-500 mt-1">
                    {error}
                </Text>
            )}
        </View>
    );
}
