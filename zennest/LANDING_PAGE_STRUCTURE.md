# Landing Page Structure

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER (Fixed)                        │
│              Logo | Nav Links | Auth Buttons                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│                     HERO SECTION (100vh)                      │
│              [Background: homestays_video.webm]               │
│                                                               │
│   ┌──────────────────────────────────────────────┐          │
│   │  ⭐ Trusted by Thousands                     │          │
│   │                                               │          │
│   │  Your Perfect                                 │          │
│   │  Escape Awaits                               │ (Gradient)│
│   │                                               │          │
│   │  Discover unique homestays, unforgettable    │          │
│   │  experiences, and local services...          │          │
│   │                                               │          │
│   │  [Explore Stays]  [Become a Host]            │          │
│   └──────────────────────────────────────────────┘          │
│                                                               │
│                    ↓ Scroll Indicator                         │
│        ~~~~~~~~~ Wave Divider (wave (1).svg) ~~~~~~~~~       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  WHY CHOOSE ZENNEST SECTION                  │
│               (Light Gray Background: #f1f5f9)                │
│                                                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │ 🏠 Verify│  │ ✅ Instant│  │ 🛡️ Secure│  │ ⭐ Top   │  │
│   │ Listings │  │ Booking  │  │ Payments │  │ Rated    │  │
│   │          │  │          │  │          │  │          │  │
│   │ All prop │  │ Book in  │  │ Your     │  │ 4.9 avg  │  │
│   │ verified │  │ few clicks│ │ transactions│ │ rating  │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   EXPLORE CATEGORIES SECTION                 │
│                    (White Background)                         │
│                                                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │🏖️        │  │🏙️        │  │⛰️        │  │🍴        │  │
│   │  Beach   │  │   City   │  │ Mountain │  │  Local   │  │
│   │ Escapes  │  │  Stays   │  │ Retreats │  │ Services │  │
│   │          │  │          │  │          │  │          │  │
│   │Sun, sand │  │Urban adv │  │Peace in  │  │Authentic │  │
│   │and sea   │  │awaits    │  │highlands │  │experiences│ │
│   │    →     │  │    →     │  │    →     │  │    →     │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│     (Gradient)    (Gradient)    (Gradient)    (Gradient)    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      STATS SECTION                           │
│         (Gradient Background: Emerald to Cyan)                │
│                                                               │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │   200+   │  │  1000+   │  │   4.9    │  │   50+    │  │
│   │Properties│  │  Happy   │  │   Avg    │  │Locations │  │
│   │          │  │  Guests  │  │  Rating  │  │          │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    GUEST BENEFITS SECTION                    │
│               (Light Gray Background: #f1f5f9)                │
│                                                               │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  Guest Benefits     │  │                              │ │
│  │                     │  │  Ready to Start?             │ │
│  │  ✓ No booking fees  │  │                              │ │
│  │  ✓ 24/7 support     │  │  Join thousands who found   │ │
│  │  ✓ Flexible cancel  │  │  their perfect stay         │ │
│  │  ✓ Best price       │  │                              │ │
│  │  ✓ Verified hosts   │  │  [Browse Homestays]         │ │
│  │  ✓ Instant confirm  │  │                              │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    CALL-TO-ACTION SECTION                    │
│                  (Dark Background: #111827)                   │
│                                                               │
│               Earn with Your Property                         │
│                                                               │
│   List your property and start earning. Join our             │
│   community of successful hosts today                        │
│                                                               │
│              [Start Hosting Today]                            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                         FOOTER                                │
│              (Company Info, Links, Social)                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Hero Section
- **Video Background**: `homestays_video.webm` (autoplay, loop, muted)
- **Gradient Overlays**: Black/Emerald for text readability
- **Badge**: "Trusted by Thousands" with star icon
- **Heading**: Large, bold "Your Perfect Escape Awaits" with gradient text
- **Description**: Brief tagline about the service
- **CTAs**: Two buttons (primary and secondary)
- **Scroll Indicator**: Animated mouse scroll icon
- **Wave Divider**: SVG wave at bottom

### Features Grid (4 Cards)
- Verified Listings (Emerald)
- Instant Booking (Blue)
- Secure Payments (Purple)
- Top Rated (Yellow)

### Categories Grid (4 Cards)
- Beach Escapes (Blue gradient) → `/homestays?category=beach`
- City Stays (Purple gradient) → `/homestays?category=city`
- Mountain Retreats (Green gradient) → `/homestays?category=countryside`
- Local Services (Orange gradient) → `/services`

### Stats Bar (4 Metrics)
- Properties count
- Happy guests count
- Average rating
- Locations count

### Benefits Section
- Left: List of 6 benefits with checkmarks
- Right: CTA card with button

### Final CTA
- Dark background section
- Centered content
- "Start Hosting Today" button

## Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Stacked elements
- Larger touch targets
- Simplified hero section
- Compact typography
- Hidden decorative elements

### Tablet (640px - 1024px)
- 2-column grids
- Moderate spacing
- Balanced layouts
- Medium-sized text

### Desktop (> 1024px)
- Full multi-column layouts
- Maximum spacing and breathing room
- Larger hero elements
- Decorative background elements
- Full animations

## Animation Effects

1. **Fade In**: Opacity 0 → 1
2. **Slide In**: 
   - From left (x: -50 → 0)
   - From right (x: 50 → 0)
   - From bottom (y: 30 → 0)
3. **Scale**: Zoom in/out effects
4. **Hover Effects**: 
   - Scale (1.05)
   - Translate (-5px)
   - Shadow enhancement
5. **Scroll-triggered**: Intersection Observer based animations

## Color Palette

- **Primary**: Emerald (#10b981, #059669)
- **Secondary**: Cyan (#06b6d4)
- **Accent**: Various gradients
- **Background**: White, Slate-50 (#f1f5f9), Gray-900
- **Text**: White, Gray-900, Gray-600

## Typography Scale

- **Hero Title**: text-4xl to text-7xl (responsive)
- **Section Titles**: text-3xl to text-5xl
- **Body Text**: text-base to text-xl
- **Small Text**: text-sm to text-xs
- **Weights**: Medium (500), SemiBold (600)

---

**Total Sections**: 6 main content sections
**Total Interactive Elements**: 12+ clickable cards/buttons
**Animation Count**: 30+ individual animations
**Responsive Breakpoints**: 3 (sm, md, lg)

