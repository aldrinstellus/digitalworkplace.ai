# Digital Workplace AI - Project Context

## Vision
Digital Workplace AI is an AI-powered digital workplace solution designed to enhance team collaboration and productivity. Features a dark, tech-forward aesthetic with unique brand identity.

## Architecture

### Frontend
- **Next.js 16** with App Router for server-side rendering and routing
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for headless UI components
- **Framer Motion** for declarative React animations
- **GSAP** for high-performance JavaScript animations

### Authentication
- **Clerk** handles all authentication flows:
  - Google OAuth (primary method)
  - SSO support
  - Session management

### Backend
- **Supabase** for:
  - PostgreSQL database
  - Real-time subscriptions
  - Row-level security
  - API auto-generation

### Deployment
- **Vercel** for:
  - Automatic deployments
  - Edge functions
  - CDN distribution
  - Environment variable management

## Login Page Design (v0.2.0)

### Design Philosophy
- Full-screen immersive experience
- Dark grey theme for premium, tech-forward feel
- Minimalistic centered login overlay
- High-frequency activity indicators for "alive" platform feel
- Edgy wordmark with glitch effects

### Components

#### LoginBackground.tsx
Full-screen background featuring:
- Dark grey gradient (#0f0f1a to #1a1a2e)
- World map SVG overlay (20% opacity)
- 24 floating avatar photos:
  - Positioned across entire screen (avoiding center)
  - 3 depth layers (front, middle, back)
  - GSAP floating animations
  - Online status indicators with pulse effect
- 48 chat messages:
  - High-frequency display (600-1000ms)
  - Up to 10 concurrent bubbles
  - Framer Motion enter/exit animations
- Green data packets:
  - Slow bezier curve paths (7-15 seconds)
  - Point-to-point connections
  - Quadratic interpolation for smooth arcs
- Connection elements:
  - Arc lines between regions
  - Pulsing city indicators

#### WordmarkGlitch.tsx
Centered wordmark featuring:
- "digital" - 75% white, font-weight 300
- "workplace" - 100% white, font-weight 500
- ".ai" - Green #4ade80, font-weight 600, triple-layer glow
- Glitch effects:
  - Chromatic aberration (red #ff0040, cyan #00ffff)
  - Variable intensity (light/heavy)
  - Double-tap stuttering
  - Horizontal slice distortion
  - Slight skew during glitch
- Corner bracket decorations
- Blinking cursor

#### Sign-In Page
- Full-screen dark background
- Centered vertically and horizontally
- WordmarkGlitch component
- "Continue with Google" button (shadcn/ui Button)
- Semi-transparent styling

### Layout
- Full-screen immersive (no split panels)
- Mobile: Simplified, centered login
- Fixed positioning to hide main header

## API Integration

### Clerk Hooks Used
```typescript
import { useSignIn } from "@clerk/nextjs";

const { isLoaded, signIn } = useSignIn();

// Google OAuth login
await signIn.authenticateWithRedirect({
  strategy: "oauth_google",
  redirectUrl: "/sso-callback",
  redirectUrlComplete: "/",
});
```

### Supabase Client
```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Avatar Data
24 diverse professional headshots from Unsplash positioned across the screen:
- 4 avatars in top row
- 4 avatars in upper section
- 4 avatars in upper-mid section
- 4 avatars in lower-mid section
- 4 avatars in lower section
- 4 avatars in bottom row

All avoiding the center area where the login appears.

## Chat Messages (48 total)
Rotating messages covering:
- Meeting coordination
- Design feedback
- Technical updates
- Casual greetings
- Collaboration requests
- Celebrations
- Project status
- Time-based greetings

## Color Palette (Dark Theme)

| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | #0f0f1a | Main background |
| Background Mid | #1a1a2e | Cards, overlays |
| Background Light | #16213e | Borders, accents |
| Green Accent | #4ade80 | .ai, indicators, dots |
| Green Glow | rgba(74,222,128,0.5) | Shadows, glows |
| Red Glitch | #ff0040 | Chromatic aberration |
| Cyan Glitch | #00ffff | Chromatic aberration |
| White | #ffffff | Primary text |
| White 75% | rgba(255,255,255,0.75) | "digital" text |
| White 10% | rgba(255,255,255,0.1) | Button backgrounds |

## Typography

| Element | Font Stack | Weight |
|---------|------------|--------|
| Wordmark | JetBrains Mono, Fira Code, SF Mono | 300-600 |
| UI Text | System fonts | 400-500 |
| Buttons | System fonts | 500 |

## Animation Timings

| Animation | Duration | Easing |
|-----------|----------|--------|
| Avatar float | 3-5s | sine.inOut |
| Chat bubble appear | 300ms | ease-out |
| Chat bubble visible | 4s | - |
| Green dot travel | 7-15s | linear |
| Glitch trigger | 2s interval | - |
| Glitch duration | 120ms + 80ms | - |

## Future Enhancements
- Sound effects for glitch/activity
- Dashboard with analytics
- AI Assistant integration
- Document management
- Team collaboration features
- Settings and preferences
- Notification system
- Sign-up page redesign
