# Custom Icons

This folder is reserved for custom icon assets (SVG, PNG).

## Current Setup

Icons are defined in `constants/icons.ts` (semantic registry) and rendered via
`components/ui/AppIcon.tsx`, which currently delegates to `@expo/vector-icons`
(MaterialCommunityIcons).

## To Add Custom Icons

1. Place your SVG/PNG files in this folder (e.g., `task.svg`, `challenge.svg`).
2. Create an `index.ts` here re-exporting them by semantic name.
3. Update `AppIcon.tsx` to render custom assets when `icon.source === 'custom'`.
4. Update `constants/icons.ts` entries to point to the new source.

No component files need to change — only the icon registry and renderer.
