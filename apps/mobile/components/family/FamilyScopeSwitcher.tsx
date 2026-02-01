/**
 * FamilyScopeSwitcher.tsx - Reusable Family Scope Selector
 * 
 * Allows users to switch between different view scopes:
 * - "My View": Personal tasks only
 * - "Family": All family-visible tasks
 * - "{Child's Name}": Parent viewing specific child's tasks
 * 
 * @author Kaiz Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../providers/ThemeProvider';
import { useFamilyStore } from '../../store/familyStore';
import { useTranslation } from '../../hooks/useTranslation';
import { ViewScope, FamilyRole, ROLE_CONFIGURATIONS } from '../../types/family.types';

// ==========================================
// Types
// ==========================================

interface FamilyScopeSwitcherProps {
    /** Current view scope value */
    value: ViewScope;
    /** Callback when scope changes */
    onChange: (scope: ViewScope) => void;
    /** Display variant: 'compact' for header, 'full' for settings */
    variant?: 'compact' | 'full';
    /** Additional styling */
    style?: any;
    /** Whether the switcher is disabled */
    disabled?: boolean;
}

interface ScopeOption {
    value: ViewScope;
    label: string;
    icon: string;
    description?: string;
    color?: string;
}

// ==========================================
// Component
// ==========================================

export function FamilyScopeSwitcher({
    value,
    onChange,
    variant = 'compact',
    style,
    disabled = false,
}: FamilyScopeSwitcherProps) {
    const { colors, isDark } = useThemeContext();
    const { t } = useTranslation();
    const [showDropdown, setShowDropdown] = useState(false);
    
    const {
        currentFamily,
        members,
        currentMemberRole,
    } = useFamilyStore();

    // Check if user has family plan
    const hasFamily = !!currentFamily && members.length > 0;

    // Build scope options based on user's role
    const scopeOptions = useMemo((): ScopeOption[] => {
        const options: ScopeOption[] = [
            {
                value: 'mine',
                label: t('family.scope.mine', 'My View'),
                icon: 'account',
                description: t('family.scope.mineDescription', 'Your personal tasks'),
                color: colors.primary,
            },
        ];

        if (hasFamily) {
            options.push({
                value: 'family',
                label: t('family.scope.family', 'Family'),
                icon: 'account-group',
                description: t('family.scope.familyDescription', 'All family shared tasks'),
                color: '#8B5CF6',
            });

            // Adults can see children's views
            if (currentMemberRole === 'owner' || currentMemberRole === 'adult') {
                const children = members.filter(
                    m => m.role === 'teen' || m.role === 'child'
                );
                
                children.forEach(child => {
                    const roleConfig = ROLE_CONFIGURATIONS[child.role];
                    options.push({
                        value: `child:${child.userId}` as ViewScope,
                        label: child.displayName,
                        icon: roleConfig.icon,
                        description: `${roleConfig.label}'s tasks`,
                        color: roleConfig.color,
                    });
                });
            }
        }

        return options;
    }, [hasFamily, members, currentMemberRole, colors.primary, t]);

    // Get current option
    const currentOption = useMemo(() => {
        return scopeOptions.find(opt => opt.value === value) || scopeOptions[0];
    }, [value, scopeOptions]);

    // Handle selection
    const handleSelect = useCallback((scope: ViewScope) => {
        onChange(scope);
        setShowDropdown(false);
    }, [onChange]);

    // If no family, don't show switcher
    if (!hasFamily) {
        return null;
    }

    // ==========================================
    // Compact Variant (Header dropdown)
    // ==========================================
    if (variant === 'compact') {
        return (
            <>
                <TouchableOpacity
                    onPress={() => !disabled && setShowDropdown(true)}
                    disabled={disabled}
                    style={[
                        styles.compactButton,
                        {
                            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                            opacity: disabled ? 0.5 : 1,
                        },
                        style,
                    ]}
                >
                    <MaterialCommunityIcons
                        name={currentOption.icon as any}
                        size={16}
                        color={currentOption.color || '#8B5CF6'}
                    />
                    <Text
                        style={[
                            styles.compactLabel,
                            { color: currentOption.color || '#8B5CF6' },
                        ]}
                        numberOfLines={1}
                    >
                        {currentOption.label}
                    </Text>
                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={16}
                        color={currentOption.color || '#8B5CF6'}
                    />
                </TouchableOpacity>

                <Modal
                    visible={showDropdown}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowDropdown(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowDropdown(false)}
                    >
                        <View
                            style={[
                                styles.dropdown,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <View style={styles.dropdownHeader}>
                                <Text style={[styles.dropdownTitle, { color: colors.text }]}>
                                    {t('family.scope.selectView', 'Select View')}
                                </Text>
                            </View>
                            <ScrollView style={styles.dropdownScroll}>
                                {scopeOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.dropdownItem,
                                            value === option.value && {
                                                backgroundColor: isDark
                                                    ? 'rgba(139, 92, 246, 0.2)'
                                                    : 'rgba(139, 92, 246, 0.1)',
                                            },
                                        ]}
                                        onPress={() => handleSelect(option.value)}
                                    >
                                        <View
                                            style={[
                                                styles.optionIcon,
                                                { backgroundColor: `${option.color}20` },
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name={option.icon as any}
                                                size={20}
                                                color={option.color}
                                            />
                                        </View>
                                        <View style={styles.optionText}>
                                            <Text
                                                style={[
                                                    styles.optionLabel,
                                                    { color: colors.text },
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                            {option.description && (
                                                <Text
                                                    style={[
                                                        styles.optionDescription,
                                                        { color: colors.textSecondary },
                                                    ]}
                                                >
                                                    {option.description}
                                                </Text>
                                            )}
                                        </View>
                                        {value === option.value && (
                                            <MaterialCommunityIcons
                                                name="check"
                                                size={20}
                                                color="#8B5CF6"
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </>
        );
    }

    // ==========================================
    // Full Variant (Segmented control)
    // ==========================================
    return (
        <View style={[styles.fullContainer, style]}>
            <Text style={[styles.fullLabel, { color: colors.textSecondary }]}>
                {t('family.scope.viewAs', 'View as')}
            </Text>
            <View
                style={[
                    styles.segmentedControl,
                    {
                        backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                        borderColor: colors.border,
                    },
                ]}
            >
                {scopeOptions.map((option, index) => {
                    const isSelected = value === option.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.segment,
                                isSelected && {
                                    backgroundColor: colors.card,
                                    borderColor: option.color || '#8B5CF6',
                                },
                                index === 0 && styles.segmentFirst,
                                index === scopeOptions.length - 1 && styles.segmentLast,
                            ]}
                            onPress={() => handleSelect(option.value)}
                            disabled={disabled}
                        >
                            <MaterialCommunityIcons
                                name={option.icon as any}
                                size={18}
                                color={isSelected ? (option.color || '#8B5CF6') : colors.textSecondary}
                            />
                            <Text
                                style={[
                                    styles.segmentLabel,
                                    {
                                        color: isSelected
                                            ? (option.color || '#8B5CF6')
                                            : colors.textSecondary,
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

// ==========================================
// Styles
// ==========================================

const styles = StyleSheet.create({
    // Compact Variant
    compactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        gap: 4,
    },
    compactLabel: {
        fontSize: 13,
        fontWeight: '600',
        maxWidth: 80,
    },
    
    // Dropdown Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdown: {
        width: '100%',
        maxWidth: 320,
        maxHeight: 400,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    dropdownHeader: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    dropdownScroll: {
        maxHeight: 300,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    optionDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    
    // Full Variant
    fullContainer: {
        width: '100%',
    },
    fullLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    segmentedControl: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        padding: 4,
    },
    segment: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        gap: 4,
    },
    segmentFirst: {
        marginRight: 2,
    },
    segmentLast: {
        marginLeft: 2,
    },
    segmentLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
});

export default FamilyScopeSwitcher;
