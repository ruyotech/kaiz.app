/**
 * AppIcon — Centralized icon component.
 *
 * All icons in the app render through this component.
 * Currently delegates to MaterialCommunityIcons.
 * To swap to custom SVG/image assets later, change ONLY this file.
 */

import React, { memo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { IconDef } from '../../constants/icons';

interface AppIconProps {
  /** Icon definition from constants/icons.ts */
  icon: IconDef;
  /** Size in points (default 24) */
  size?: number;
  /** Color string */
  color?: string;
  /** Optional style */
  style?: object;
  /** Accessibility label */
  accessibilityLabel?: string;
}

function AppIconComponent({
  icon,
  size = 24,
  color = '#6B7280',
  style,
  accessibilityLabel,
}: AppIconProps) {
  // Currently all icons are MaterialCommunityIcons
  // Future: switch on icon.source to render SVG / Image / SF Symbols
  return (
    <MaterialCommunityIcons
      name={icon.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
      size={size}
      color={color}
      style={style}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

export const AppIcon = memo(AppIconComponent);
