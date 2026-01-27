# Digital Workplace AI - Project Context

## Vision
Digital Workplace AI is an AI-powered digital workplace solution designed to enhance team collaboration and productivity. Features a dark, tech-forward aesthetic with unique brand identity and immersive sound design.

---

## ⚠️ URL ROUTING (CRITICAL)

**THE SIGN-IN PAGE IS THE DEFAULT LANDING PAGE.**

| Route | Behavior | File |
|-------|----------|------|
| `/` (root) | **REDIRECT** → `/sign-in` (unauthenticated) or `/dashboard` (authenticated) | `apps/main/src/app/page.tsx` |
| `/sign-in` | **DEFAULT LANDING PAGE** - Full-screen world map with Google OAuth | `apps/main/src/app/sign-in/` |
| `/dashboard` | Protected - 4 AI product cards | `apps/main/src/app/dashboard/` |
| `/admin` | Protected - super_admin only | `apps/main/src/app/admin/` |

**There is NO separate home/landing page. The root URL always redirects.**

```typescript
// apps/main/src/app/page.tsx
useEffect(() => {
  if (isLoaded) {
    if (user) {
      router.replace("/dashboard");  // Authenticated → Dashboard
    } else {
      router.replace("/sign-in");    // Unauthenticated → Sign-in
    }
  }
}, [isLoaded, user, router]);
```

*Last verified: 2026-01-19*

---

## Architecture

### Frontend
- **Next.js 16** with App Router for server-side rendering and routing
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for headless UI components
- **Framer Motion** for declarative React animations
- **GSAP** for high-performance JavaScript animations
- **Web Audio API** for procedural sound effects

### Authentication
- **Clerk** handles all authentication flows:
  - Google OAuth (primary method) with "Continue with Google" button
  - Custom credentials with account picker always shown (`prompt=select_account`)
  - SSO support
  - Session management
  - Server-side route protection via `proxy.ts`

### Branding
- **Favicon** (`icon.tsx`): Dynamic 32x32 PNG with "d." design
  - Dark background (#0f0f1a)
  - White "d" letter
  - Green dot (#4ade80) representing ".ai"
- **Apple Touch Icon** (`apple-icon.tsx`): 180x180 PNG for iOS

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

### Cache Prevention (v0.7.6 - CRITICAL)

**All apps have permanent cache-busting configured to prevent stale deployments.**

| App | Config | Cache Headers |
|-----|--------|---------------|
| **Main** | `apps/main/next.config.ts` | `no-store, must-revalidate` |
| **dSQ** | `apps/support-iq/next.config.ts` | `no-store, must-revalidate` |
| **dIQ** | `apps/intranet-iq/next.config.ts` | `no-store, must-revalidate` |
| **dCQ** | `apps/chat-core-iq/next.config.ts` | `no-store, must-revalidate` |

**Required Configuration** (in every `next.config.ts`):
```typescript
generateBuildId: async () => {
  return `build-${Date.now()}`;
},

async headers() {
  return [{
    source: '/((?!_next/static|_next/image|favicon.ico).*)',
    headers: [
      { key: 'Cache-Control', value: 'no-store, must-revalidate' },
    ],
  }];
}
```

**Full Documentation**: `/docs/QUERY_DETECTION_STANDARDS.md` (Section 10)

## Login Page Design (v0.3.0)

### Design Philosophy
- Full-screen immersive experience
- Dark grey theme for premium, tech-forward feel
- Minimalistic centered login overlay
- High-frequency activity indicators for "alive" platform feel
- Edgy wordmark with glitch effects
- Ambient sound effects for enhanced engagement

### Components

#### LoginBackground.tsx
Full-screen background featuring:
- Dark grey gradient (#0f0f1a to #1a1a2e)
- World map SVG overlay (20% opacity)
- 24 floating avatar photos:
  - Positioned across entire screen (avoiding center)
  - 2 depth layers (front, middle) - all visible without blur
  - GSAP floating animations
  - Online status indicators with pulse effect
  - Click-to-focus with auto-minimize (2.5s)
- 15 max concurrent chat messages:
  - Slower display speed (40% reduction)
  - Interval: 210-400ms
  - Duration: 1.7-2.5 seconds
  - Lighter mint-green with 70% opacity
  - Backdrop blur effect
- Green data packets:
  - Slow bezier curve paths (7-15 seconds)
  - Point-to-point connections
  - Quadratic interpolation for smooth arcs
- Connection elements:
  - Arc lines between regions
  - Pulsing city indicators
- Sound effects:
  - Ambient pulse (A minor chord, every 8-12s)
  - Data packet sounds (soft blips, every 3-5s)
  - Chat bubble pops (5% probability per bubble)
  - All enabled by default, auto-play on load

#### SoundToggle.tsx
Fixed top-right corner toggle (responsive):
- **Initial state**: Pulsing speaker icon + "Enable" text (desktop)
- **On state**: Green animated equalizer bars + "On" text (desktop)
- **Off state**: Muted speaker icon + "Off" text (desktop)
- Mobile: Icon only (text hidden for compact display)
- First click activates audio (browser autoplay compliance)
- Subsequent clicks toggle sound on/off

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
- SoundToggle component (top-right)
- WordmarkGlitch component
- "Continue with Google" button (shadcn/ui Button)
- Semi-transparent styling

### Layout
- Full-screen immersive (no split panels)
- Mobile: Simplified, centered login
- Fixed positioning to hide main header

### Responsive Breakpoints
| Breakpoint | Width | Avatar Size | Chat Bubble | Sound Toggle |
|------------|-------|-------------|-------------|--------------|
| Mobile | <640px | 44-52px | text-xs, px-3 | Icon only |
| Tablet | 640-1024px | 58-68px | text-sm, px-4 | Icon + text |
| Desktop | >1024px | 58-68px | text-sm, px-4 | Icon + text |

## Audio System

### sounds.ts
Web Audio API procedural sound generation:
- `enableAudio()` / `disableAudio()` - Global toggle
- `isAudioEnabled()` - Check state
- `initAudio()` - Initialize audio context and add interaction listeners
- `playGlitchSound(intensity)` - Digital glitch effect
- `playDataPacketSound()` - Soft blip for data travel
- `playAmbientPulse()` - Subtle A minor chord pad
- `playChatBubbleSound()` - Soft pop notification
- `playConnectionSound()` - Ultra-soft high ping

All sounds check `audioEnabled` before playing.
Sound enabled by default (`audioEnabled = true`).

### Browser Autoplay Handling
- Modern browsers require user interaction before allowing audio
- System adds global listeners for: click, touchstart, keydown, mousedown, pointerdown
- AudioContext resumes on first user interaction
- All sounds play automatically after first interaction
- Listeners are removed after successful audio context resume

### backgroundMusic.ts (Disabled)
Procedural 120 BPM music generator (not in use):
- Happy chord progression (I-V-vi-IV)
- Kick, snare, hi-hat drums
- Bass and melody lines
- Removed due to browser autoplay restrictions

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
- 6 avatars in top row
- 4 avatars in upper-middle area
- 4 avatars in middle area (sides only)
- 4 avatars in lower-middle area
- 6 avatars in bottom row

All avoiding the center area where the login appears.
All fully visible without blur (z-index 18-32).

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
| Mint Green | rgba(134, 239, 172, 0.7) | Chat bubbles |
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
| Avatar float | 3-7s | sine.inOut |
| Chat bubble appear | 400ms | backOut |
| Chat bubble visible | 1.7-2.5s | - |
| Green dot travel | 7-15s | easeInOut |
| Glitch initial | 500ms after load | - |
| Glitch interval | 2.6s | consistent |
| Glitch duration | 200ms + 120ms (double-tap) | - |
| Ambient pulse | 8-12s interval | - |
| Data packet | 3-5s interval | - |

## Dashboard (v0.4.0)

### Overview
Protected dashboard page accessible after authentication featuring 4 AI product cards.

### Products
| Product | Theme Color | Description | Status |
|---------|-------------|-------------|--------|
| Support IQ | Green (#10b981) | Intelligent customer support automation | ✅ Active |
| Intranet IQ | Blue (#3b82f6) | Smart internal knowledge network | ✅ Active |
| Test Pilot IQ | Orange (#f59e0b) | Automated QA & testing intelligence | ⬜ Pending |
| Chat Core IQ | Purple (#a855f7) | Conversational AI for your business | ✅ Live: https://dcq.digitalworkplace.ai |

### dCQ - Chat Core IQ (v1.0.2) - PRODUCTION LIVE (Full Spectrum Audit PASSED)
- **Port**: 3002
- **Production**: https://chat-core-iq.vercel.app/dcq/Home/index.html
- **Admin**: https://chat-core-iq.vercel.app/dcq/admin
- **GitHub**: https://github.com/aldrinstellus/digitalworkplace.ai (monorepo)
- **Audit Score**: 100/100 ✅
- **Features**:
  - AI Chatbot: Claude (primary) + GPT-4o-mini (fallback)
  - 348 knowledge items + 7 FAQs with 100% embedding coverage
  - 10 Admin pages with 150+ features
  - Multi-language support (EN/ES/HT - English, Spanish, Haitian Creole)
  - Interactive Voice Response (IVR) demo with transfer codes
  - 28 Supabase tables in dcq schema
  - 19+ external integrations (Tyler Technologies, CRM, IVR, SMS, Social)
- **Audit Results (2026-01-22)**:
  - Homepage & Chatbot: 100% ✅
  - IVR Demo: 100% ✅
  - Admin Panel (10 pages): 100% ✅
  - Database (28 tables): 100% ✅
  - Vector Embeddings: 100% ✅
  - API Endpoints (9): 100% ✅

### dSQ - Support IQ (v1.2.5)
- **Port**: 3003
- **Production**: https://dsq.digitalworkplace.ai
- **GitHub**: https://github.com/aldrinstellus/support-iq
- **Features**:
  - 3 Modes: Government, Project, ATC (SME)
  - 10 Personas across all modes
  - FloatingModeSwitcher (top-right dropdown)
  - Theme toggle with animations
  - 15 Supabase tables with 100% embedding coverage
  - Fully responsive (mobile/tablet/desktop)

### dIQ - Intranet IQ (v1.1.0) - Full Spectrum Implementation
- **Port**: 3001
- **Production**: https://intranet-iq.vercel.app
- **GitHub**: https://github.com/aldrinstellus/digitalworkplace.ai (monorepo)
- **Audit Score**: 100/100 (upgraded from 63/100)
- **Features**:
  - 19 fully verified production pages
  - AI Assistant: Claude streaming, RAG, function calling
  - Semantic Search: 212 articles + federated search across connectors
  - AI Summary: Anthropic API generating search summaries
  - RBAC: 4 roles, 191 users
  - Elasticsearch: 3 nodes, 28,690 indexed documents
  - 45+ Supabase tables in diq schema
  - **NEW** Notification Center with preferences
  - **NEW** Reactions, Polls, Recognition system
  - **NEW** Productivity Hub (/my-day page)
  - **NEW** Workflow Execution Engine with webhooks/cron
  - **NEW** Connector Framework (Confluence, SharePoint, Notion, GDrive)
  - **NEW** Admin Analytics Dashboard with system health

### Product Card Features
- **Animated SVG Illustrations**: Each product has unique animated SVG background
  - Support IQ: Headset with sound waves, chat bubbles
  - Intranet IQ: Globe with orbiting nodes, data particles
  - Test Pilot IQ: Bug icon, checklist with checkmarks, progress bar
  - Chat Core IQ: Chat interface mockup, typing indicator
- **3D Tilt Effect**: Cards tilt toward cursor using Framer Motion springs
- **Colored Borders**: 2px borders in product theme colors (visible in default state)
- **Continuous Animations**: All animations loop infinitely in all states
- **Hover Effects**: Enhanced glow, brighter borders, shine sweep
- **Launch App Button**: Animated arrow on hover

### User Avatar
- Displays Google profile picture from Clerk
- Falls back to first initial if image fails
- Uses `referrerPolicy="no-referrer"` for Google images
- Dropdown menu with sign out option
- Admin link for super admins

### Admin Panel
- Super admin only access
- User management with role assignment
- Roles: user, admin, super_admin

### User Role System (Supabase)
```typescript
type UserRole = 'user' | 'admin' | 'super_admin';

interface UserData {
  id: string;
  clerk_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
```

## Database Architecture (Supabase)

### Multi-Schema Structure
```
┌───────────────────────────────────────────────────────────────┐
│                     PUBLIC SCHEMA (Shared)                    │
│  organizations ── projects ── knowledge_items ── activity_log │
│       │               │                                       │
│       └── users ──────┴── user_project_access                │
└───────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐     ┌─────────┐     ┌─────────┐
        │   diq   │     │   dsq   │     │   dtq   │
        │ schema  │     │ (future)│     │ (future)│
        └─────────┘     └─────────┘     └─────────┘
```

### Key Features
- **Schema Separation**: Each sub-project (dIQ, dSQ, etc.) has its own PostgreSQL schema
- **Cross-Project Search**: `public.knowledge_items` table with full-text search
- **Row-Level Security**: All tables have RLS policies for access control
- **Activity Logging**: `public.activity_log` for audit trails

### Migration Files
```
supabase/migrations/
├── 001_core_schema.sql     # Shared tables (public schema)
└── 002_diq_schema.sql      # dIQ-specific tables
```

### Documentation
- Full architecture: `docs/DATABASE_ARCHITECTURE.md`
- dIQ types: `apps/intranet-iq/src/lib/database.types.ts`
- dIQ client: `apps/intranet-iq/src/lib/supabase.ts`

---

## Future Enhancements
- AI Assistant integration
- Document management
- Team collaboration features
- Settings and preferences
- Notification system
- Sign-up page redesign
- Real-time presence indicators
- Product-specific dashboards
