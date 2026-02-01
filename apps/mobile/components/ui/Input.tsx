import React from 'react';
import { TextInput, Text, View, TextInputProps } from 'react-native';
import { useThemeContext } from '../../providers/ThemeProvider';

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
    const { colors } = useThemeContext();
    
    return (
        <View className="mb-4">
            {label && (
                <Text 
                    className="text-sm font-medium mb-1"
                    style={{ color: colors.textSecondary }}
                >
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
                className={`rounded-lg px-4 py-3 text-base ${multiline ? 'min-h-[100px]' : ''}`}
                style={{
                    borderWidth: 1,
                    borderColor: error ? colors.error : colors.border,
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                }}
                placeholderTextColor={colors.textTertiary}
            />
            {error && (
                <Text 
                    className="text-sm mt-1"
                    style={{ color: colors.error }}
                >
                    {error}
                </Text>
            )}
        </View>
    );
}
