/**
 * WheelPicker — Pure-JS scroll-based picker that mimics the native iOS Picker.
 *
 * Uses a ScrollView with snap-to-interval for the "wheel" effect.
 * No native modules required — works with OTA / EAS Update.
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useThemeContext } from '../../providers/ThemeProvider';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface WheelPickerItem {
  label: string;
  value: string | number;
}

interface WheelPickerProps {
  items: WheelPickerItem[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  style?: object;
}

function WheelPickerComponent({
  items,
  selectedValue,
  onValueChange,
  style,
}: WheelPickerProps) {
  const { colors, isDark } = useThemeContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Offset for centering: we add empty items above and below
  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);

  // Find the index of the selected value
  const selectedIndex = items.findIndex((item) => item.value === selectedValue);
  const initialIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Scroll to selected value on mount and when selectedValue changes externally
  useEffect(() => {
    if (!isUserScrolling && scrollViewRef.current) {
      const idx = items.findIndex((item) => item.value === selectedValue);
      if (idx >= 0) {
        scrollViewRef.current.scrollTo({
          y: idx * ITEM_HEIGHT,
          animated: false,
        });
      }
    }
  }, [selectedValue, items, isUserScrolling]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

      if (items[clampedIndex] && items[clampedIndex].value !== selectedValue) {
        onValueChange(items[clampedIndex].value);
      }
      setIsUserScrolling(false);
    },
    [items, selectedValue, onValueChange],
  );

  const handleScrollBeginDrag = useCallback(() => {
    setIsUserScrolling(true);
  }, []);

  return (
    <View style={[styles.container, { height: PICKER_HEIGHT }, style]}>
      {/* Selection highlight bar */}
      <View
        style={[
          styles.selectionIndicator,
          {
            top: paddingItems * ITEM_HEIGHT,
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.06)',
          },
        ]}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingTop: paddingItems * ITEM_HEIGHT,
          paddingBottom: paddingItems * ITEM_HEIGHT,
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        contentOffset={{ x: 0, y: initialIndex * ITEM_HEIGHT }}
        nestedScrollEnabled
      >
        {items.map((item, index) => {
          const isSelected = item.value === selectedValue;
          return (
            <View key={`${item.value}-${index}`} style={styles.itemContainer}>
              <Text
                style={[
                  styles.itemText,
                  {
                    color: isSelected ? colors.text : colors.textTertiary,
                    fontWeight: isSelected ? '600' : '400',
                    fontSize: isSelected ? 20 : 17,
                  },
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const WheelPicker = React.memo(WheelPickerComponent);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    zIndex: 1,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
});
