# Icon Selection System V2 - Implementation Guide

## Overview

This document describes the enhanced icon selection system (`IconSelectionSheetV2`) inspired by Flutter Flow's architecture, adapted for React Native with Expo.

## Features

### 🎯 Dual Icon Libraries

1. **Material Symbols** (200+ icons)
   - Finance & banking icons
   - Shopping & retail
   - Food & dining
   - Transportation
   - Utilities & bills
   - Health & wellness
   - Entertainment
   - And more...

2. **Simple Icons** (100+ brand icons)
   - Financial services (PayPal, Apple Pay, Stripe, etc.)
   - Retail (Amazon, Target, Walmart, etc.)
   - Food delivery (Uber Eats, DoorDash, etc.)
   - Streaming (Netflix, Spotify, YouTube, etc.)
   - Gaming (Steam, PlayStation, Xbox, etc.)
   - Social media (Facebook, Instagram, Twitter, etc.)

### 🔍 Fuzzy Search

Powered by [Fuse.js](https://fusejs.io/), the search feature:
- Searches both icon names and keywords
- Smart relevance ranking
- Flexible matching (threshold: 0.4)
- Debounced input (300ms) for better performance
- Searches up to 100 results per query

### 🎨 Enhanced UI

- **Tab Navigation**: Switch between Symbols and Brands
- **Search with Clear**: Quick search reset button
- **Live Preview**: Shows selected icon in footer with name
- **Empty States**: Helpful messages when no icons match
- **Larger Icons**: 28px icons for better visibility
- **Responsive Grid**: 6-column layout optimized for mobile

## Architecture Comparison

### Flutter Implementation (Original)

```dart
// Icon data types
sealed class FlowIconData {}
class IconFlowIcon extends FlowIconData {}
class CharacterFlowIcon extends FlowIconData {}
class ImageFlowIcon extends FlowIconData {}

// Serialization
String serializeIcon(FlowIconData icon)
FlowIconData? parseIcon(String serialized)

// Icon queries
List<IconFlowIcon> queryMaterialSymbols(String query)
List<IconFlowIcon> querySimpleIcons(String query)
```

### React Native Implementation (Current)

```typescript
// Icon data (simplified for icon-only selection)
interface IconData {
  name: string
  keywords: string[]
}

// Icon libraries
const MATERIAL_SYMBOLS: IconData[]
const SIMPLE_ICONS: IconData[]

// Fuzzy search with Fuse.js
const fuseSymbols = new Fuse(MATERIAL_SYMBOLS, {
  keys: ["name", "keywords"],
  threshold: 0.4,
})
```

## Usage

### Basic Example

```tsx
import { IconSelectionSheetV2 } from "~/components/icon-selection-sheet-v2"
import { useBottomSheet } from "~/components/bottom-sheet"

function MyComponent() {
  const [icon, setIcon] = useState("wallet-outline")
  const sheet = useBottomSheet("icon-picker")

  return (
    <>
      <Pressable onPress={() => sheet.present()}>
        <MaterialCommunityIcons name={icon} size={48} />
      </Pressable>

      <IconSelectionSheetV2
        id="icon-picker"
        initialIcon={icon}
        onIconSelected={setIcon}
      />
    </>
  )
}
```

### Integration with Forms

```tsx
import { Controller } from "react-hook-form"

function CategoryForm() {
  const { control } = useForm<CategoriesFormSchema>()
  const sheet = useBottomSheet("category-icon-picker")

  return (
    <Controller
      control={control}
      name="icon"
      render={({ field: { value, onChange } }) => (
        <>
          <Pressable onPress={() => sheet.present()}>
            <MaterialCommunityIcons 
              name={value || "help-circle"} 
              size={48} 
            />
          </Pressable>

          <IconSelectionSheetV2
            id="category-icon-picker"
            initialIcon={value}
            onIconSelected={onChange}
          />
        </>
      )}
    />
  )
}
```

### With Database Storage

```tsx
// Store icon name in database
const category = await categoryService.create({
  name: "Groceries",
  icon: selectedIcon, // e.g., "cart-outline"
  colorSchemeName: "green",
})

// Retrieve and display
<MaterialCommunityIcons 
  name={category.icon} 
  size={24}
  color={colorScheme.primary}
/>
```

## Component API

### Props

```typescript
interface IconSelectionSheetV2Props {
  /** Unique identifier for the bottom sheet */
  id: string
  
  /** Callback when icon is selected */
  onIconSelected?: (icon: string) => void
  
  /** Initial selected icon name */
  initialIcon?: string
}
```

### Return Value

The component manages its own state and lifecycle. Icon selection is communicated via the `onIconSelected` callback.

## Implementation Details

### Icon Data Structure

Each icon in the library has:
- `name`: MaterialCommunityIcons icon name
- `keywords`: Array of searchable terms

```typescript
{
  name: "wallet-outline",
  keywords: ["money", "cash", "payment"]
}
```

### Search Algorithm

1. User types query (debounced 300ms)
2. Fuse.js searches `name` and `keywords` fields
3. Results ranked by relevance score
4. Top 100 results displayed
5. Empty query shows all icons (unfiltered)

### Performance Optimizations

- **Memoized Fuse instances**: Created once, reused for all searches
- **Debounced search**: Reduces unnecessary re-renders
- **Optimized FlatList**: 
  - `initialNumToRender={60}`
  - `maxToRenderPerBatch={60}`
  - `windowSize={7}`
  - Keyboard dismiss on drag

### Tab Switching

When switching tabs:
1. Search query is cleared
2. Debounced query is reset
3. Icon list refreshes immediately
4. Selected icon persists across tabs

## Adding New Icons

### Material Symbols

Add to `MATERIAL_SYMBOLS` array:

```typescript
const MATERIAL_SYMBOLS = [
  // ... existing icons
  { 
    name: "new-icon-name", 
    keywords: ["keyword1", "keyword2", "keyword3"] 
  },
]
```

### Brand Icons

Add to `SIMPLE_ICONS` array:

```typescript
const SIMPLE_ICONS = [
  // ... existing icons
  { 
    name: "brand-name", 
    keywords: ["company", "service", "category"] 
  },
]
```

**Note**: Icon names must exist in MaterialCommunityIcons. Verify at: https://icons.expo.fyi

## Future Enhancements

Based on the Flutter implementation guide, potential future features:

### 1. Character/Emoji Support

```typescript
interface CharacterFlowIcon {
  type: 'character'
  character: string
}

// Example: 🍕, 💰, 🚗
```

### 2. Custom Images

```typescript
interface ImageFlowIcon {
  type: 'image'
  imagePath: string
}

// Store custom images in file system
// Use expo-image-picker for selection
```

### 3. Icon Serialization

```typescript
export function serializeIcon(icon: FlowIconData): string {
  switch (icon.type) {
    case 'icon':
      return `IconFlowIcon:${icon.fontFamily},${icon.codePoint}`
    case 'character':
      return `CharacterFlowIcon:${icon.character}`
    case 'image':
      return `ImageFlowIcon:${icon.imagePath}`
  }
}

export function parseIcon(serialized: string): FlowIconData | null {
  const [type, payload] = serialized.split(':')
  // Parse based on type...
}
```

### 4. Icon Color Customization

Allow users to pick icon color independently from theme:

```typescript
interface IconWithColor {
  name: string
  color: string // hex color
}
```

### 5. Recent Icons

Track recently used icons for quick access:

```typescript
const [recentIcons, setRecentIcons] = useMMKV<string[]>("recent-icons", [])

// Display recent icons at top of list
```

## Dependencies

- `fuse.js` (^7.1.0) - Fuzzy search
- `@expo/vector-icons` (^15.0.3) - MaterialCommunityIcons
- `@gorhom/bottom-sheet` (^5.2.8) - Bottom sheet UI
- `react-native-unistyles` (^3.0.20) - Theming

## Known Limitations

1. **Icon Library**: Currently limited to MaterialCommunityIcons. To use Material Symbols (Google), would need custom icon font setup.

2. **Brand Icons**: Uses MaterialCommunityIcons brand icons (limited selection). For comprehensive brand icons, consider:
   - Creating custom icon font from [Simple Icons](https://simpleicons.org/)
   - Using SVG components (heavier bundle)

3. **Search Scope**: Keywords are manually curated. Automated keyword extraction would improve search coverage.

4. **Image Support**: Not yet implemented. Would require:
   - File system storage (expo-file-system)
   - Image picker (expo-image-picker)
   - Image cropping (expo-image-manipulator)

## Troubleshooting

### Icon not appearing?

1. Check icon name exists in MaterialCommunityIcons: https://icons.expo.fyi
2. Verify icon is added to `MATERIAL_SYMBOLS` or `SIMPLE_ICONS` arrays
3. Check console for warnings about invalid icon names

### Search not working?

1. Ensure `fuse.js` is installed: `pnpm add fuse.js`
2. Check keywords are relevant to icon
3. Verify threshold (0.4) is appropriate for your use case

### Performance issues?

1. Reduce `initialNumToRender` and `maxToRenderPerBatch`
2. Increase debounce delay (currently 300ms)
3. Limit icon arrays to most-used icons only
4. Consider pagination for large icon sets

## Related Files

- `src/components/icon-selection-sheet-v2.tsx` - Main component
- `src/components/icon-selection-sheet-v2-example.tsx` - Usage example
- `src/components/icon-selection-sheet.tsx` - Original (v1) implementation
- `src/components/ui/icon-symbol.tsx` - Icon wrapper component
- `src/types/categories.ts` - Category type with icon field

## References

- [MaterialCommunityIcons Directory](https://icons.expo.fyi)
- [Fuse.js Documentation](https://fusejs.io/)
- [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- [Bottom Sheet Documentation](https://gorhom.github.io/react-native-bottom-sheet/)
