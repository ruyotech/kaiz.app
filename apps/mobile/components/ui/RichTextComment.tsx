import { logger } from '../../utils/logger';
/**
 * RichTextComment.tsx - Rich Text Rendering for Comments
 * 
 * Renders markdown-style text with support for:
 * - **bold**
 * - *italic*
 * - [links](url)
 * - `code`
 * - Line breaks
 * - Mentions @user
 * - #hashtags
 * - Emoji support
 * 
 * Modern 2026 design with proper accessibility
 */

import React, { useMemo, useCallback } from 'react';
import { Text, Linking, Alert, View, StyleSheet } from 'react-native';

interface RichTextCommentProps {
    text: string;
    className?: string;
    textColor?: string;
}

type TextSegment = {
    type: 'text' | 'bold' | 'italic' | 'code' | 'link' | 'mention' | 'hashtag';
    content: string;
    url?: string;
};

export function RichTextComment({ 
    text, 
    className = '',
    textColor = '#4B5563' 
}: RichTextCommentProps) {
    
    const handleLinkPress = useCallback(async (url: string) => {
        try {
            // Add https if no protocol specified
            let finalUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                finalUrl = `https://${url}`;
            }
            
            const canOpen = await Linking.canOpenURL(finalUrl);
            if (canOpen) {
                await Linking.openURL(finalUrl);
            } else {
                Alert.alert('Cannot Open Link', `Unable to open: ${url}`);
            }
        } catch (error) {
            logger.error('Error opening link:', error);
            Alert.alert('Error', 'Failed to open link');
        }
    }, []);

    const parsedSegments = useMemo(() => {
        return parseRichText(text);
    }, [text]);

    const renderSegment = useCallback((segment: TextSegment, index: number) => {
        switch (segment.type) {
            case 'bold':
                return (
                    <Text key={index} style={[styles.bold, { color: textColor }]}>
                        {segment.content}
                    </Text>
                );
            
            case 'italic':
                return (
                    <Text key={index} style={[styles.italic, { color: textColor }]}>
                        {segment.content}
                    </Text>
                );
            
            case 'code':
                return (
                    <Text key={index} style={styles.code}>
                        {segment.content}
                    </Text>
                );
            
            case 'link':
                return (
                    <Text 
                        key={index} 
                        style={styles.link}
                        onPress={() => handleLinkPress(segment.url || segment.content)}
                        accessibilityRole="link"
                    >
                        {segment.content}
                    </Text>
                );
            
            case 'mention':
                return (
                    <Text key={index} style={styles.mention}>
                        {segment.content}
                    </Text>
                );
            
            case 'hashtag':
                return (
                    <Text key={index} style={styles.hashtag}>
                        {segment.content}
                    </Text>
                );
            
            default:
                return (
                    <Text key={index} style={{ color: textColor }}>
                        {segment.content}
                    </Text>
                );
        }
    }, [textColor, handleLinkPress]);

    return (
        <Text style={styles.container}>
            {parsedSegments.map(renderSegment)}
        </Text>
    );
}

/**
 * Parse markdown-style text into segments
 */
function parseRichText(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    
    // Combined regex for all patterns
    // Order matters: more specific patterns first
    const patterns = [
        // Links [text](url)
        { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'link' as const },
        // Bold **text**
        { regex: /\*\*([^*]+)\*\*/g, type: 'bold' as const },
        // Italic *text* (but not if preceded by *)
        { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, type: 'italic' as const },
        // Code `text`
        { regex: /`([^`]+)`/g, type: 'code' as const },
        // Mentions @username
        { regex: /@(\w+)/g, type: 'mention' as const },
        // Hashtags #tag
        { regex: /#(\w+)/g, type: 'hashtag' as const },
    ];

    // Build a combined pattern
    const combinedPattern = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(?<!\*)(\*([^*]+)\*)(?!\*)|(`([^`]+)`)|(@\w+)|(#\w+)/g;
    
    let lastIndex = 0;
    let match;

    while ((match = combinedPattern.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            segments.push({
                type: 'text',
                content: text.substring(lastIndex, match.index)
            });
        }

        // Determine match type
        if (match[1]) {
            // Link [text](url)
            segments.push({
                type: 'link',
                content: match[2],
                url: match[3]
            });
        } else if (match[4]) {
            // Bold **text**
            segments.push({
                type: 'bold',
                content: match[5]
            });
        } else if (match[6]) {
            // Italic *text*
            segments.push({
                type: 'italic',
                content: match[7]
            });
        } else if (match[8]) {
            // Code `text`
            segments.push({
                type: 'code',
                content: match[9]
            });
        } else if (match[10]) {
            // Mention @username
            segments.push({
                type: 'mention',
                content: match[10]
            });
        } else if (match[11]) {
            // Hashtag #tag
            segments.push({
                type: 'hashtag',
                content: match[11]
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({
            type: 'text',
            content: text.substring(lastIndex)
        });
    }

    // If no patterns matched, return the whole text
    if (segments.length === 0) {
        segments.push({ type: 'text', content: text });
    }

    return segments;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    bold: {
        fontWeight: '700',
    },
    italic: {
        fontStyle: 'italic',
    },
    code: {
        fontFamily: 'monospace',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        color: '#DC2626',
        fontSize: 13,
    },
    link: {
        color: '#3B82F6',
        textDecorationLine: 'underline',
    },
    mention: {
        color: '#8B5CF6',
        fontWeight: '600',
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 2,
        borderRadius: 2,
    },
    hashtag: {
        color: '#059669',
        fontWeight: '500',
    },
});

export default RichTextComment;
