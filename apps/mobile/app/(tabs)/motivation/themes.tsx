/**
 * Themes Screen — premium visual theme picker for mindset cards
 *
 * Full-width immersive cards with background image previews, gradient overlays,
 * sample quote text, and a clean selection UI. Tap to select.
 * Uses useMindsetThemes() from TanStack Query.
 */
import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { useMindsetThemes } from '../../../hooks/queries';
import { useMindsetPreferencesStore } from '../../../store/mindsetStore';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { mindsetIcons, actionIcons } from '../../../constants/icons';
import { AppIcon } from '../../../components/ui/AppIcon';
import { moduleColors, spacing, borderRadius } from '../../../constants/theme';
import type { MindsetTheme } from '../../../types/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 220;

const SAMPLE_QUOTES = [
  '"The only way to do great work is to love what you do."',
  '"Believe you can and you\'re halfway there."',
  '"In the middle of difficulty lies opportunity."',
  '"What we think, we become."',
  '"The best time to start is now."',
];

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
    (theme: MindsetTheme, index: number) => {
      const isActive =
        theme.id === selectedThemeId ||
        (!selectedThemeId && themes[0]?.id === theme.id);
      const hasGradient = theme.gradientColors.length >= 2;
      const hasImage = !!theme.defaultAsset;
      const sampleQuote = SAMPLE_QUOTES[index % SAMPLE_QUOTES.length];

      return (
        <Pressable
          key={theme.id}
          onPress={() => handleSelect(theme.id)}
          style={({ pressed }) => [
            styles.themeCard,
            {
              borderColor: isActive ? moduleColors.mindset : 'transparent',
              borderWidth: isActive ? 2.5 : 0,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          {/* Background: image > gradient > solid */}
          {hasImage ? (
            <>
              <Image
                source={{ uri: theme.defaultAsset ?? '' }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
              <View style={[StyleSheet.absoluteFill, styles.imageOverlay]} />
            </>
          ) : hasGradient ? (
            <LinearGradient
              colors={theme.gradientColors as [string, string, ...string[]]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundColor }]}
            />
          )}

          {/* Content overlay */}
          <View style={styles.cardContent}>
            {/* Sample quote */}
            <Text
              style={[
                styles.sampleQuote,
                { color: hasImage ? '#FFFFFF' : theme.textColor },
              ]}
              numberOfLines={3}
            >
              {sampleQuote}
            </Text>

            {/* Theme name badge */}
            <View style={styles.nameRow}>
              <View
                style={[
                  styles.nameBadge,
                  {
                    backgroundColor: hasImage
                      ? 'rgba(0,0,0,0.5)'
                      : 'rgba(255,255,255,0.2)',
                  },
                ]}
              >
                <AppIcon icon={mindsetIcons.theme} size={14} color={hasImage ? '#FFFFFF' : theme.accentColor} />
                <Text
                  style={[
                    styles.nameText,
                    { color: hasImage ? '#FFFFFF' : theme.textColor },
                  ]}
                  numberOfLines={1}
                >
                  {theme.name}
                </Text>
              </View>

              {/* Color palette dots */}
              <View style={styles.palette}>
                {theme.gradientColors.slice(0, 3).map((c, i) => (
                  <View
                    key={`${theme.id}-c-${i}`}
                    style={[styles.paletteDot, { backgroundColor: c }]}
                  />
                ))}
                {theme.gradientColors.length < 2 && (
                  <>
                    <View style={[styles.paletteDot, { backgroundColor: theme.backgroundColor }]} />
                    <View style={[styles.paletteDot, { backgroundColor: theme.accentColor }]} />
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Active indicator */}
          {isActive ? (
            <View style={styles.activeBadge}>
              <AppIcon icon={actionIcons.check} size={18} color="#FFFFFF" />
            </View>
          ) : null}
        </Pressable>
      );
    },
    [selectedThemeId, themes, handleSelect],
  );

  return (
    <Container>
      <ScreenHeader
        title="Themes"
        subtitle="Pick a style that inspires you"
        showBack
        showNotifications={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active theme indicator */}
        {themes.length > 0 && (
          <View style={[styles.activeInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.activeInfoDot, { backgroundColor: moduleColors.mindset }]} />
            <Text style={[styles.activeInfoText, { color: colors.textSecondary }]}>
              {themes.find((t) => t.id === selectedThemeId)?.name ?? themes[0]?.name ?? 'Default'} is active
            </Text>
          </View>
        )}

        {/* Theme cards */}
        {themes.map((theme, index) => renderThemeCard(theme, index))}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  activeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: 16,
  },
  activeInfoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeInfoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageOverlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  sampleQuote: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.3,
    maxWidth: '85%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '600',
  },
  palette: {
    flexDirection: 'row',
    gap: 6,
  },
  paletteDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  activeBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: moduleColors.mindset,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomSpacer: {
    height: 40,
  },
});
