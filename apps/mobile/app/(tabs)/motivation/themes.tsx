/**
 * Themes Screen — visual theme picker for mindset cards
 *
 * 2-column grid of theme previews. Tap to select.
 * Uses useMindsetThemes() from TanStack Query.
 */
import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { useMindsetThemes } from '../../../hooks/queries';
import { useMindsetPreferencesStore } from '../../../store/mindsetStore';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { mindsetIcons, actionIcons } from '../../../constants/icons';
import { AppIcon } from '../../../components/ui/AppIcon';
import type { MindsetTheme } from '../../../types/models';

export default function ThemesScreen() {
  const { colors } = useThemeContext();
  const { data: themes = [] } = useMindsetThemes();
  const { selectedThemeId, setSelectedTheme } = useMindsetPreferencesStore();

  const handleSelect = useCallback(
    (themeId: string) => {
      setSelectedTheme(themeId);
    },
    [setSelectedTheme],
  );

  const renderThemeCard = useCallback(
    (theme: MindsetTheme) => {
      const isActive = theme.id === selectedThemeId || (!selectedThemeId && themes[0]?.id === theme.id);
      const hasGradient = theme.gradientColors.length >= 2;

      return (
        <Pressable
          key={theme.id}
          onPress={() => handleSelect(theme.id)}
          style={[
            styles.themeCard,
            {
              borderColor: isActive ? colors.primary : colors.border,
              borderWidth: isActive ? 3 : 1,
            },
          ]}
        >
          {/* Preview background */}
          <View style={styles.themePreview}>
            {hasGradient ? (
              <LinearGradient
                colors={theme.gradientColors as [string, string, ...string[]]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundColor }]} />
            )}

            {/* Sample text */}
            <Text style={[styles.previewText, { color: theme.textColor }]} numberOfLines={2}>
              "{theme.name}"
            </Text>

            {/* Active check */}
            {isActive ? (
              <View style={[styles.activeCheck, { backgroundColor: colors.primary }]}>
                <AppIcon icon={actionIcons.check} size={16} color="#FFFFFF" />
              </View>
            ) : null}
          </View>

          {/* Info */}
          <View style={[styles.themeInfo, { backgroundColor: colors.card }]}>
            <Text style={[styles.themeName, { color: colors.text }]} numberOfLines={1}>
              {theme.name}
            </Text>
            <View style={styles.colorDots}>
              <View style={[styles.dot, { backgroundColor: theme.backgroundColor }]} />
              <View style={[styles.dot, { backgroundColor: theme.textColor }]} />
              <View style={[styles.dot, { backgroundColor: theme.accentColor }]} />
            </View>
          </View>
        </Pressable>
      );
    },
    [selectedThemeId, themes, colors, handleSelect],
  );

  return (
    <Container>
      <ScreenHeader
        title="Themes"
        subtitle="Customize your mindset experience"
        showBack
        showNotifications={false}
      />

      <ScrollView contentContainerStyle={styles.grid}>
        {themes.map(renderThemeCard)}

        {/* Tip */}
        <View style={[styles.tip, { backgroundColor: colors.primaryLight }]}>
          <AppIcon icon={mindsetIcons.theme} size={18} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.primary }]}>
            Themes change the visual style of your feed. Pick one that inspires you.
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 16,
    gap: 16,
  },
  themeCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  themePreview: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  activeCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  themeName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  colorDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
