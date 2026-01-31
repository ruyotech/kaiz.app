/**
 * RichTextEditor.tsx - Mobile Rich Text Editor Component
 * 
 * A user-friendly rich text editor with formatting toolbar for mobile:
 * - Bold, Italic, Underline buttons
 * - Link insertion
 * - Bullet/numbered lists
 * - Text area (multiline) input
 * 
 * Modern 2026 UX design with intuitive touch interactions
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    Platform,
    Modal,
    Pressable,
    Animated,
    ScrollView,
    NativeSyntheticEvent,
    TextInputSelectionChangeEventData,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ============================================================================
// Types
// ============================================================================

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: number;
    maxHeight?: number;
    editable?: boolean;
    autoFocus?: boolean;
}

interface TextSelection {
    start: number;
    end: number;
}

interface FormatButton {
    icon: string;
    label: string;
    format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'link' | 'bullet' | 'numbered' | 'code' | 'quote';
}

// ============================================================================
// Format Buttons Configuration
// ============================================================================

const FORMAT_BUTTONS: FormatButton[] = [
    { icon: 'format-bold', label: 'Bold', format: 'bold' },
    { icon: 'format-italic', label: 'Italic', format: 'italic' },
    { icon: 'format-underline', label: 'Underline', format: 'underline' },
    { icon: 'format-strikethrough', label: 'Strikethrough', format: 'strikethrough' },
    { icon: 'link-variant', label: 'Link', format: 'link' },
    { icon: 'format-list-bulleted', label: 'Bullet List', format: 'bullet' },
    { icon: 'format-list-numbered', label: 'Numbered List', format: 'numbered' },
    { icon: 'code-tags', label: 'Code', format: 'code' },
    { icon: 'format-quote-close', label: 'Quote', format: 'quote' },
];

// ============================================================================
// Rich Text Editor Component
// ============================================================================

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write something...',
    minHeight = 100,
    maxHeight = 300,
    editable = true,
    autoFocus = false,
}: RichTextEditorProps) {
    const inputRef = useRef<TextInput>(null);
    const [selection, setSelection] = useState<TextSelection>({ start: 0, end: 0 });
    const [isFocused, setIsFocused] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
    
    // Animation for toolbar
    const toolbarOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(toolbarOpacity, {
            toValue: isFocused ? 1 : 0.7,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isFocused]);

    // Detect active formats at current selection
    useEffect(() => {
        if (selection.start === selection.end) {
            // Cursor position - check surrounding text for formats
            const beforeCursor = value.substring(0, selection.start);
            const formats = new Set<string>();
            
            // Check for unclosed format tags
            const boldOpen = (beforeCursor.match(/\*\*/g) || []).length % 2 === 1;
            const italicOpen = (beforeCursor.match(/(?<!\*)\*(?!\*)/g) || []).length % 2 === 1;
            const underlineOpen = (beforeCursor.match(/__/g) || []).length % 2 === 1;
            const strikeOpen = (beforeCursor.match(/~~/g) || []).length % 2 === 1;
            const codeOpen = (beforeCursor.match(/`/g) || []).length % 2 === 1;
            
            if (boldOpen) formats.add('bold');
            if (italicOpen) formats.add('italic');
            if (underlineOpen) formats.add('underline');
            if (strikeOpen) formats.add('strikethrough');
            if (codeOpen) formats.add('code');
            
            setActiveFormats(formats);
        }
    }, [selection, value]);

    const handleSelectionChange = useCallback((
        event: NativeSyntheticEvent<TextInputSelectionChangeEventData>
    ) => {
        setSelection(event.nativeEvent.selection);
    }, []);

    const wrapSelection = useCallback((prefix: string, suffix: string) => {
        const { start, end } = selection;
        const selectedText = value.substring(start, end);
        
        if (start === end) {
            // No selection - insert format markers at cursor
            const newText = value.substring(0, start) + prefix + suffix + value.substring(end);
            onChange(newText);
            // Position cursor between markers
            setTimeout(() => {
                inputRef.current?.setNativeProps({
                    selection: { start: start + prefix.length, end: start + prefix.length }
                });
            }, 10);
        } else {
            // Wrap selected text
            const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
            onChange(newText);
            // Select the wrapped text
            setTimeout(() => {
                inputRef.current?.setNativeProps({
                    selection: { start: start + prefix.length, end: end + prefix.length }
                });
            }, 10);
        }
        
        inputRef.current?.focus();
    }, [selection, value, onChange]);

    const insertAtCursor = useCallback((text: string) => {
        const { start, end } = selection;
        const newText = value.substring(0, start) + text + value.substring(end);
        onChange(newText);
        
        const newPos = start + text.length;
        setTimeout(() => {
            inputRef.current?.setNativeProps({
                selection: { start: newPos, end: newPos }
            });
        }, 10);
        
        inputRef.current?.focus();
    }, [selection, value, onChange]);

    const handleFormat = useCallback((format: FormatButton['format']) => {
        switch (format) {
            case 'bold':
                wrapSelection('**', '**');
                break;
            case 'italic':
                wrapSelection('*', '*');
                break;
            case 'underline':
                wrapSelection('__', '__');
                break;
            case 'strikethrough':
                wrapSelection('~~', '~~');
                break;
            case 'code':
                wrapSelection('`', '`');
                break;
            case 'quote':
                insertAtCursor('\n> ');
                break;
            case 'bullet':
                insertAtCursor('\n• ');
                break;
            case 'numbered':
                // Count existing numbered items
                const lines = value.split('\n');
                const lastNumberedLine = lines.reverse().find(l => /^\d+\.\s/.test(l));
                const nextNumber = lastNumberedLine 
                    ? parseInt(lastNumberedLine.match(/^(\d+)/)?.[1] || '0') + 1 
                    : 1;
                insertAtCursor(`\n${nextNumber}. `);
                break;
            case 'link':
                const { start, end } = selection;
                const selectedText = value.substring(start, end);
                setLinkText(selectedText);
                setLinkUrl('');
                setShowLinkModal(true);
                break;
        }
    }, [wrapSelection, insertAtCursor, selection, value]);

    const handleInsertLink = useCallback(() => {
        if (linkUrl) {
            const displayText = linkText || linkUrl;
            const linkMarkdown = `[${displayText}](${linkUrl})`;
            
            const { start, end } = selection;
            const newText = value.substring(0, start) + linkMarkdown + value.substring(end);
            onChange(newText);
            
            const newPos = start + linkMarkdown.length;
            setTimeout(() => {
                inputRef.current?.setNativeProps({
                    selection: { start: newPos, end: newPos }
                });
            }, 10);
        }
        
        setShowLinkModal(false);
        setLinkUrl('');
        setLinkText('');
        inputRef.current?.focus();
    }, [linkUrl, linkText, selection, value, onChange]);

    return (
        <View style={styles.container}>
            {/* Formatting Toolbar */}
            <Animated.View style={[styles.toolbar, { opacity: toolbarOpacity }]}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.toolbarContent}
                    keyboardShouldPersistTaps="always"
                >
                    {FORMAT_BUTTONS.map((button) => (
                        <TouchableOpacity
                            key={button.format}
                            onPress={() => handleFormat(button.format)}
                            style={[
                                styles.formatButton,
                                activeFormats.has(button.format) && styles.formatButtonActive
                            ]}
                            activeOpacity={0.7}
                            accessibilityLabel={button.label}
                            accessibilityRole="button"
                        >
                            <MaterialCommunityIcons
                                name={button.icon as any}
                                size={20}
                                color={activeFormats.has(button.format) ? '#3B82F6' : '#6B7280'}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>

            {/* Text Area */}
            <View style={[
                styles.textAreaContainer,
                isFocused && styles.textAreaFocused
            ]}>
                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={onChange}
                    onSelectionChange={handleSelectionChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    autoFocus={autoFocus}
                    editable={editable}
                    style={[
                        styles.textArea,
                        { minHeight, maxHeight }
                    ]}
                    scrollEnabled
                    keyboardType="default"
                    returnKeyType="default"
                />
            </View>

            {/* Character Count */}
            <View style={styles.footer}>
                <Text style={styles.charCount}>
                    {value.length} characters
                </Text>
                <View style={styles.formatHint}>
                    <MaterialCommunityIcons name="information-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.hintText}>
                        Tap toolbar buttons to format
                    </Text>
                </View>
            </View>

            {/* Link Insert Modal */}
            <Modal
                visible={showLinkModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLinkModal(false)}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setShowLinkModal(false)}
                >
                    <Pressable style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Insert Link</Text>
                            <TouchableOpacity 
                                onPress={() => setShowLinkModal(false)}
                                style={styles.modalClose}
                            >
                                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Display Text</Text>
                            <TextInput
                                value={linkText}
                                onChangeText={setLinkText}
                                placeholder="Link text (optional)"
                                placeholderTextColor="#9CA3AF"
                                style={styles.modalInput}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>URL</Text>
                            <TextInput
                                value={linkUrl}
                                onChangeText={setLinkUrl}
                                placeholder="https://example.com"
                                placeholderTextColor="#9CA3AF"
                                style={styles.modalInput}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="url"
                                autoFocus
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => setShowLinkModal(false)}
                                style={[styles.modalButton, styles.modalButtonSecondary]}
                            >
                                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleInsertLink}
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                disabled={!linkUrl}
                            >
                                <Text style={styles.modalButtonPrimaryText}>Insert</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    toolbar: {
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: '#E5E7EB',
    },
    toolbarContent: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 8,
        gap: 4,
    },
    formatButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    formatButtonActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    textAreaContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    textAreaFocused: {
        borderColor: '#3B82F6',
    },
    textArea: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        lineHeight: 24,
        color: '#1F2937',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingTop: 8,
    },
    charCount: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    formatHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    hintText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    modalClose: {
        padding: 4,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonSecondary: {
        backgroundColor: '#F3F4F6',
    },
    modalButtonSecondaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    modalButtonPrimary: {
        backgroundColor: '#3B82F6',
    },
    modalButtonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default RichTextEditor;
