# Touch Gestures Feature Documentation

## Overview

This document describes the touch gesture implementation for the AI Vision feature of Artistry Cart. The gesture system enhances the mobile and desktop user experience with intuitive interactions including swipe navigation, pinch-to-zoom, and long-press context menus.

## Technology Stack

- **Gesture Library**: `@use-gesture/react` v10.3.1
- **Framework**: React 19 with Next.js 15
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables

## Components

### 1. ConceptCarousel

**Location**: `apps/user-ui/src/app/ai-vision/_components/gestures/ConceptCarousel.tsx`

A swipeable image carousel for browsing multiple concept images.

#### Features

- **Swipe Navigation**: Swipe left/right to navigate between images
- **Touch Optimization**: Responsive to both touch and mouse gestures
- **Visual Feedback**: Indicators for swipe direction, current position
- **Desktop Controls**: Arrow buttons visible on hover
- **Keyboard Support**: Arrow key navigation (via standard controls)
- **Mobile-First Design**: Optimized touch targets and gesture thresholds

#### Props

```typescript
interface ConceptCarouselProps {
  images: string[];           // Array of image URLs
  initialIndex?: number;      // Starting image index (default: 0)
  onIndexChange?: (index: number) => void; // Callback when image changes
  aspectRatio?: 'square' | 'video' | 'portrait'; // Container aspect ratio
}
```

#### Gesture Behavior

- **Swipe Threshold**: 50px minimum movement
- **Velocity Sensitivity**: Respects swipe velocity for responsive feedback
- **Axis Lock**: Vertical scrolling preserved (axis: 'x')
- **Tap Filtering**: Prevents accidental navigation on taps

#### Usage Example

```tsx
import ConceptCarousel from '@/app/ai-vision/_components/gestures/ConceptCarousel';

<ConceptCarousel
  images={[
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg'
  ]}
  aspectRatio="video"
  onIndexChange={(index) => console.log('Current image:', index)}
/>
```

#### Visual Elements

1. **Navigation Indicators**:
   - Chevron overlays (visible on hover for desktop)
   - Dot indicators at bottom (clickable)
   - Image counter (top-right corner)

2. **Responsive Behavior**:
   - Mobile: Full touch gestures, no arrow buttons
   - Desktop: Arrow buttons + touch gestures
   - Tablet: Hybrid touch + hover controls

### 2. ImageZoom

**Location**: `apps/user-ui/src/app/ai-vision/_components/gestures/ImageZoom.tsx`

A full-screen image viewer with pinch-to-zoom and pan capabilities.

#### Features

- **Pinch to Zoom**: Two-finger pinch gesture for mobile zoom
- **Wheel Zoom**: Mouse wheel zoom for desktop
- **Pan & Drag**: Drag to reposition when zoomed
- **Double-Click Reset**: Double-click to reset zoom and position
- **Zoom Controls**: Button controls for precise zoom levels
- **Smooth Animations**: Fluid transitions between zoom levels
- **Modal View**: Full-screen viewing experience

#### Props

```typescript
interface ImageZoomProps {
  src: string;              // Image source URL
  alt: string;              // Alt text for accessibility
  trigger?: React.ReactNode; // Custom trigger element (default: thumbnail with zoom icon)
  maxZoom?: number;         // Maximum zoom level (default: 4)
  minZoom?: number;         // Minimum zoom level (default: 1)
}
```

#### Gesture Behavior

- **Pinch Gesture**: Maps pinch distance to zoom level
- **Wheel Zoom**: 0.1x zoom per wheel tick
- **Drag Pan**: Only active when zoom > 1
- **Zoom Limits**: Constrained between minZoom and maxZoom
- **Auto-Reset Pan**: Position resets to center when zoom reaches 1

#### Usage Example

```tsx
import ImageZoom from '@/app/ai-vision/_components/gestures/ImageZoom';

// With default trigger
<ImageZoom
  src="https://example.com/high-res-image.jpg"
  alt="Concept artwork"
  maxZoom={5}
/>

// With custom trigger
<ImageZoom
  src="https://example.com/high-res-image.jpg"
  alt="Concept artwork"
  trigger={
    <div className="cursor-pointer">
      <Image src={thumbnailUrl} alt="Thumbnail" />
    </div>
  }
/>
```

#### Modal Controls

1. **Top-Right Controls**:
   - Zoom percentage indicator
   - Zoom out button (-)
   - Zoom in button (+)
   - Close button (X)

2. **Bottom Instructions**:
   - "Pinch to zoom • Drag to pan • Scroll to zoom"

3. **Interaction Feedback**:
   - Cursor changes to grab/grabbing when zoomed
   - Buttons disabled at min/max zoom levels

### 3. LongPressMenu

**Location**: `apps/user-ui/src/app/ai-vision/_components/gestures/LongPressMenu.tsx`

A context menu that appears on long-press or right-click.

#### Features

- **Long-Press Detection**: 500ms hold to trigger menu
- **Haptic Feedback**: Vibration feedback on supported devices
- **Right-Click Support**: Desktop context menu support
- **Touch-Friendly**: Large tap targets for mobile
- **Customizable Actions**: Flexible menu item configuration
- **Visual Variants**: Support for destructive actions (red)

#### Props

```typescript
interface ContextMenuItem {
  label: string;                          // Menu item text
  icon?: React.ReactNode;                 // Optional icon
  onClick: () => void;                    // Action handler
  variant?: 'default' | 'destructive';    // Visual variant
  separator?: boolean;                    // Add separator before item
}

interface LongPressMenuProps {
  items: ContextMenuItem[];    // Menu items configuration
  children: React.ReactNode;   // Content to wrap
  disabled?: boolean;          // Disable menu (default: false)
  hapticFeedback?: boolean;    // Enable vibration (default: true)
}
```

#### Gesture Behavior

- **Long-Press Duration**: 500ms threshold
- **Tap Filter**: Prevents menu on quick taps
- **Position Aware**: Opens at touch/click position
- **Haptic Duration**: 50ms vibration pulse

#### Usage Example

```tsx
import LongPressMenu from '@/app/ai-vision/_components/gestures/LongPressMenu';
import { Heart, Share2, Flag, Bookmark } from 'lucide-react';

<LongPressMenu
  items={[
    {
      label: 'Add to Favorites',
      icon: <Heart className="h-4 w-4" />,
      onClick: () => handleFavorite(),
    },
    {
      label: 'Add to Collection',
      icon: <Bookmark className="h-4 w-4" />,
      onClick: () => handleCollection(),
    },
    {
      label: 'Share',
      icon: <Share2 className="h-4 w-4" />,
      onClick: () => handleShare(),
      separator: true,
    },
    {
      label: 'Report',
      icon: <Flag className="h-4 w-4" />,
      onClick: () => handleReport(),
      variant: 'destructive',
    },
  ]}
>
  <Card className="p-4">
    {/* Card content */}
  </Card>
</LongPressMenu>
```

#### Menu Item Variants

1. **Default**: Standard menu item
2. **Destructive**: Red text for dangerous actions (delete, report)
3. **Separator**: Adds visual divider before item

## Integration Points

### ExploreTab Integration

**File**: `apps/user-ui/src/app/ai-vision/_components/ExploreTab.tsx`

The Explore tab now includes:

1. **LongPressMenu** on each concept card with actions:
   - View Details
   - Add to Favorites
   - Add to Collection
   - Share
   - Report (destructive)

2. **ImageZoom** on concept thumbnails:
   - Click thumbnail to zoom
   - Full-screen viewing experience

### Concept Detail Page Integration

**File**: `apps/user-ui/src/app/ai-vision/concept/[id]/page.tsx`

The concept detail page now includes:

1. **ConceptCarousel** for multiple images:
   - Swipe between concept variations
   - Automatic detection of multiple images

2. **ImageZoom** for single images:
   - Fallback when only one image exists
   - High-resolution viewing

## Mobile Considerations

### Touch Gestures

1. **Swipe Navigation**:
   - Minimum 50px movement to trigger
   - Respects scroll lock on other axes
   - Visual feedback during gesture

2. **Pinch Zoom**:
   - Smooth scaling transitions
   - Constrained to defined min/max
   - Auto-reset on double-tap

3. **Long Press**:
   - 500ms activation time
   - Haptic feedback (if supported)
   - Visual menu positioning

### Performance Optimization

1. **Gesture Debouncing**: Prevents excessive state updates
2. **Transform Optimization**: Uses CSS transforms for smooth animations
3. **Touch-Action CSS**: Proper `touch-pan-y` and `touch-none` declarations
4. **Pointer Events**: Strategic `pointer-events: none` for overlays

### Browser Compatibility

| Feature | iOS Safari | Chrome Mobile | Desktop Chrome | Firefox | Edge |
|---------|------------|---------------|----------------|---------|------|
| Swipe   | ✅         | ✅            | ✅             | ✅      | ✅   |
| Pinch   | ✅         | ✅            | ⚠️ (wheel)     | ⚠️ (wheel) | ⚠️ (wheel) |
| Long Press | ✅      | ✅            | ✅             | ✅      | ✅   |
| Haptics | ✅         | ✅            | ❌             | ❌      | ❌   |

⚠️ = Fallback behavior available
❌ = Not supported by browser

## Accessibility

### Keyboard Navigation

- **Arrow Keys**: Navigate carousel (via button controls)
- **Tab**: Focus zoom controls in modal
- **Escape**: Close modal viewers
- **Space/Enter**: Activate buttons

### Screen Reader Support

- All interactive elements have `aria-label` attributes
- Image alt text for concept images
- Button labels for zoom controls
- Menu item descriptions

### Focus Management

- Focus trapped in modals when open
- Focus returned to trigger on close
- Visible focus indicators on all controls

## User Experience Guidelines

### When to Use Each Gesture

1. **Swipe (ConceptCarousel)**:
   - Multiple related images (variations, angles)
   - Sequential viewing experience
   - Mobile-first browsing

2. **Pinch-to-Zoom (ImageZoom)**:
   - High-detail artwork inspection
   - Quality verification
   - Design detail examination

3. **Long Press (LongPressMenu)**:
   - Contextual actions
   - Power user features
   - Space-constrained UIs (mobile)

### Best Practices

1. **Visual Affordances**:
   - Show swipe indicators on first visit
   - Hover overlays for desktop users
   - Clear zoom controls and instructions

2. **Gesture Discovery**:
   - Progressive disclosure of advanced features
   - Tooltips on first interaction
   - Onboarding hints for new users

3. **Fallback Interactions**:
   - Always provide button alternatives
   - Support both touch and mouse
   - Keyboard shortcuts for power users

## Testing

### Manual Testing Checklist

- [ ] Swipe left/right navigates carousel
- [ ] Pinch gesture zooms image in/out
- [ ] Long press shows context menu
- [ ] Right-click shows context menu (desktop)
- [ ] Double-click resets zoom
- [ ] Wheel zooms on desktop
- [ ] Drag pans zoomed image
- [ ] Buttons work when gestures disabled
- [ ] Haptic feedback on supported devices
- [ ] Keyboard navigation functional
- [ ] Screen reader announces interactions

### Cross-Device Testing

1. **Mobile Devices**:
   - iOS Safari (iPhone, iPad)
   - Chrome Mobile (Android)
   - Samsung Internet

2. **Desktop Browsers**:
   - Chrome (Windows, macOS)
   - Firefox (Windows, macOS)
   - Safari (macOS)
   - Edge (Windows)

3. **Hybrid Devices**:
   - Windows Surface (touch + mouse)
   - iPad with keyboard/mouse
   - 2-in-1 laptops

### Performance Testing

1. **Frame Rate**: Maintain 60fps during gestures
2. **Memory**: No leaks from gesture handlers
3. **Battery**: Minimal impact on mobile devices
4. **Network**: Lazy load images in carousels

## Troubleshooting

### Common Issues

1. **Gestures Not Working**:
   - Check `touch-action` CSS properties
   - Verify `@use-gesture/react` is installed
   - Ensure ref is properly attached

2. **Choppy Animations**:
   - Use CSS transforms instead of position
   - Enable `will-change` for animating elements
   - Reduce component re-renders

3. **Haptic Feedback Not Working**:
   - Feature requires HTTPS
   - Not supported on all browsers
   - Check `navigator.vibrate` availability

4. **Menu Positioning Issues**:
   - Ensure proper viewport calculation
   - Account for scroll position
   - Test on different screen sizes

### Debug Tips

```tsx
// Enable gesture debug mode
const bind = useDrag(
  (state) => {
    console.log('Drag state:', state);
    // ... handler logic
  },
  { debug: true }
);
```

## Future Enhancements

### Planned Features

1. **Multi-Touch Gestures**:
   - Three-finger swipe for navigation
   - Rotation gesture for image orientation

2. **Gesture Customization**:
   - User preference for gesture sensitivity
   - Custom gesture mappings

3. **Advanced Zoom**:
   - Region-specific zoom
   - Zoom focus on tap location
   - Animated zoom transitions

4. **Context Menu Improvements**:
   - Submenu support
   - Custom positioning logic
   - Touch-optimized layouts

### Performance Improvements

1. Image preloading in carousels
2. Virtual scrolling for large galleries
3. GPU-accelerated animations
4. Optimistic UI updates

## Related Documentation

- [Camera Feature Documentation](./CAMERA_FEATURE.md)
- [Collections Feature Documentation](./COLLECTIONS_FEATURE.md)
- [Comments Feature Documentation](./COMMENTS_FEATURE.md)
- [@use-gesture/react Documentation](https://use-gesture.netlify.app/)

## Support

For issues or questions about gesture implementation:
1. Check gesture library docs: https://use-gesture.netlify.app/
2. Review browser compatibility tables
3. Test on multiple devices
4. Submit bug reports with device/browser info
