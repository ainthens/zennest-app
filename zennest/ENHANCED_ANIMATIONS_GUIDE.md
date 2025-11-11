# Enhanced Animations Guide

## Animation Timing Reference

### Hero Section
```
Video Background: Parallax scale (1 → 1.1) on scroll
├─ Badge (⭐): Fade + slide up (0.4s delay)
├─ Title "Your Perfect Escape Awaits": Fade + slide up (0.5s delay)
│  └─ Gradient word: Scale effect (0.6s delay)
├─ Description: Fade + slide up (0.7s delay)
├─ CTA Buttons: Fade + slide up (0.8s delay)
│  ├─ Hover: Scale 1.05
│  └─ Tap: Scale 0.95
└─ Scroll Indicator: Bounce animation (infinite)
```

### Features Section (Why Choose Zennest)
```
Background: Gradient with decorative blur orbs
├─ Badge "Premium Service": Scale (0.2s delay)
├─ Section Title: Fade + slide up (0s)
├─ Description: Fade + slide up (0s)
└─ Cards (4 items):
    ├─ Card 1: Fade + slide up + scale (0.45s delay) [Spring animation]
    ├─ Card 2: Fade + slide up + scale (0.60s delay)
    ├─ Card 3: Fade + slide up + scale (0.75s delay)
    └─ Card 4: Fade + slide up + scale (0.90s delay)
    
    On Hover (each card):
    ├─ Lift: -10px (y-axis)
    ├─ Scale: 1.05
    ├─ Icon: Rotate wiggle animation
    ├─ Background: Gradient reveal
    └─ Shadow: Enhanced (lg → 2xl)
```

### Categories Section (Explore Categories)
```
├─ Badge "Discover Your Escape": Scale (0.2s delay)
├─ Section Title: Fade + slide up
├─ Description: Fade + slide up
└─ Category Cards (4 items):
    ├─ Card 1: Fade + slide up + scale (0.35s delay) [Spring stiffness: 80]
    ├─ Card 2: Fade + slide up + scale (0.50s delay)
    ├─ Card 3: Fade + slide up + scale (0.65s delay)
    └─ Card 4: Fade + slide up + scale (0.80s delay)
    
    On Hover (each card):
    ├─ Scale: 1.05
    ├─ Lift: -10px
    ├─ Overlay: Rotating white gradient pattern
    ├─ Icon container: Scale 1.2 + rotate wiggle
    ├─ Arrow: Translate right 2px
    └─ Duration: 500ms
```

### Stats Section (Trusted Worldwide)
```
Background: Emerald to Cyan gradient + blur orbs
├─ Section Title: Fade + slide up
├─ Description: Fade + slide up
└─ Stat Cards (4 items):
    ├─ Card 1: Fade + scale (0.5 → 1) + slide up (0.15s delay)
    ├─ Card 2: Fade + scale (0.5 → 1) + slide up (0.30s delay)
    ├─ Card 3: Fade + scale (0.5 → 1) + slide up (0.45s delay)
    └─ Card 4: Fade + scale (0.5 → 1) + slide up (0.60s delay)
    
    Each Card Structure:
    ├─ Outer glow: Blur effect (white/20)
    ├─ Glassmorphic card: backdrop-blur + border
    └─ Content: Large number + label
    
    On Hover (each card):
    ├─ Scale: 1.1
    ├─ Wiggle: Rotate animation (-5° to +5°)
    ├─ Glow: Enhanced (white/30)
    └─ Duration: 500ms
```

### Benefits Section (Guest Benefits)
```
Background: Gradient with decorative blur orbs
├─ Left Column:
│   ├─ Badge "Guest Perks": Fade + slide up (0.2s delay)
│   ├─ Title: Fade + slide from left (0s)
│   ├─ Description: Fade + slide from left (0s)
│   └─ Benefit Cards (6 items):
│       ├─ Card 1: Fade + slide + scale (0.50s delay)
│       ├─ Card 2: Fade + slide + scale (0.60s delay)
│       ├─ Card 3: Fade + slide + scale (0.70s delay)
│       ├─ Card 4: Fade + slide + scale (0.80s delay)
│       ├─ Card 5: Fade + slide + scale (0.90s delay)
│       └─ Card 6: Fade + slide + scale (1.00s delay)
│       
│       On Hover (each card):
│       ├─ Slide right: 5px
│       ├─ Checkmark: Rotate 360° + scale 1.2
│       └─ Shadow: sm → md
│
└─ Right Column (CTA Card):
    ├─ Fade + slide from right + scale (0.3s delay)
    ├─ Background: Animated rotating pattern (infinite)
    ├─ Star icon: Scale animation (0.6s delay)
    ├─ Button: Arrow slide on hover
    └─ Hover: Scale 1.02 + lift -5px
```

### CTA Section (Earn with Your Property)
```
Background: White with emerald/cyan blur orbs
├─ Left Column:
│   ├─ Badge "Start Earning Today": Scale (0.2s delay)
│   ├─ Title: Fade + slide from left (0s)
│   │   └─ "Property": Gradient text
│   ├─ Description: Fade + slide from left (0s)
│   ├─ Host Benefit Cards (4 items):
│   │   ├─ Card 1: Fade + slide up (0.50s delay)
│   │   ├─ Card 2: Fade + slide up (0.60s delay)
│   │   ├─ Card 3: Fade + slide up (0.70s delay)
│   │   └─ Card 4: Fade + slide up (0.80s delay)
│   │   
│   │   On Hover (each card):
│   │   ├─ Slide right: 5px
│   │   ├─ Icon: Scale 1.1
│   │   └─ Shadow: sm → md
│   │
│   └─ CTA Button: Fade + slide up (0.8s delay)
│       ├─ Hover: Scale 1.05 + lift -2px
│       └─ Arrow: Translate right on hover
│
└─ Right Column (Stats Card):
    ├─ Fade + slide from right + scale (0.3s delay)
    ├─ Background: Rotating pattern (infinite, 25s duration)
    ├─ Earnings Card: Fade + slide up (0.5s delay)
    ├─ Small Stats (2): Fade + slide up (0.7s delay)
    └─ Testimonial: Scale in (0.9s delay)
```

---

## Hover Effects Summary

### Cards
- **Lift**: -5px to -10px translateY
- **Scale**: 1.02 to 1.05
- **Shadow**: Increase depth (lg → xl → 2xl)
- **Duration**: 200-300ms

### Icons
- **Rotate**: Wiggle animation (-10° to +10°)
- **Scale**: 1.1 to 1.2
- **Duration**: 300-500ms

### Buttons
- **Scale**: 1.05 (hover), 0.95 (tap)
- **Arrow**: Translate 2px right
- **Shadow**: Enhanced
- **Duration**: 300ms

### Special Effects
- **Gradient Reveal**: Opacity 0 → 1 on background
- **Rotating Pattern**: Infinite rotation animation
- **Checkmark**: 360° rotation + scale
- **Blur Orbs**: Pulsing scale animation

---

## Spring Animation Parameters

Used for natural, bouncy feel:

```javascript
{
  type: "spring",
  stiffness: 80-100,
  damping: default
}
```

Applied to:
- Feature cards
- Category cards  
- Stat cards
- Benefit cards

---

## Continuous Animations

1. **Hero Video**: Parallax scale on scroll
2. **Scroll Indicator**: Bounce (y: 0 → 10 → 0)
3. **Blur Orbs**: Subtle pulsing (where applicable)
4. **Rotating Patterns**: 
   - Benefits CTA: 20s infinite
   - Final CTA: 25s infinite

---

## Performance Notes

✅ **Optimized**:
- Intersection Observer for scroll triggers
- `triggerOnce: true` to prevent re-animations
- GPU-accelerated transforms (translate, scale, rotate)
- Conditional decorative elements on mobile

⚠️ **Considerations**:
- Infinite rotations use CSS transforms (efficient)
- Blur effects may impact older devices
- Many simultaneous animations = more CPU usage

---

## Mobile Optimizations

- Reduced animation delays
- Simpler effects (less decorative elements)
- Larger touch targets
- Single column layouts
- Fewer blur orbs

---

## Testing Checklist

- [ ] Scroll through page slowly
- [ ] Verify all animations trigger
- [ ] Test hover states on all interactive elements
- [ ] Check mobile responsiveness
- [ ] Verify performance (60fps)
- [ ] Test on different browsers
- [ ] Check accessibility (reduced motion)

---

**Pro Tip**: Open DevTools Performance panel to monitor animation frame rates. Target is 60fps for smooth experience.

