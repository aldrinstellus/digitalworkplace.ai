# Changelog

All notable changes to Digital Workplace AI are documented in this file.

---

## [0.2.0] - 2026-01-19

### Major Redesign - Dark Theme & Edgy Wordmark

#### Changed
- **Full-Screen Immersive Login**
  - Removed split panel layout (was 50/50 left/right)
  - World map now spans entire screen edge-to-edge
  - Centered minimalistic login overlay
  - More dramatic, premium feel

- **Dark Grey Theme** (replacing teal)
  - Background: #0f0f1a (deep navy-black)
  - Mid-tone: #1a1a2e (dark purple-grey)
  - Light accent: #16213e (slate blue)
  - Green accent: #4ade80 (kept from original)

- **Enhanced Avatars**
  - Increased from 12 to 24 floating avatars
  - Repositioned to avoid center (login area)
  - Spread across entire screen
  - Maintained GSAP floating animations

- **Chat Messages Enhancement**
  - Increased from 12 to 48 unique messages
  - High-frequency display (600-1000ms intervals)
  - Up to 10 concurrent bubbles (was 6)
  - Initial burst of 8 messages on load

- **Green Dot Animations**
  - Changed from fast straight lines to slow curves
  - Now follow bezier curve paths between points
  - Duration: 7-15 seconds (was 4 seconds)
  - Varied speeds and delays for natural feel
  - Quadratic bezier interpolation for smooth arcs

- **Login Simplification**
  - Removed email/password form
  - Google OAuth only ("Continue with Google")
  - Semi-transparent button styling
  - shadcn/ui Button component

#### Added
- **Brand Components** (`src/components/brand/`)

  ##### WordmarkGlitch.tsx (Primary)
  - Dramatic chromatic aberration effect
  - Red (#ff0040) and cyan (#00ffff) split layers
  - Variable intensity glitches (light/heavy)
  - Double-tap stuttering effect
  - Horizontal slice distortion during glitch
  - Whole text skew on glitch
  - "digital" at 75% opacity with glow
  - "workplace" at 100% white with glow
  - ".ai" in green with triple-layer glow
  - Corner bracket decorations
  - Blinking cursor
  - More frequent triggers (50% chance every 2s)
  - Faster transitions (20ms for snappy feel)

  ##### Wordmark.tsx
  - Simple letter-by-letter animation
  - Staggered entrance with Framer Motion
  - Decorative angle brackets

  ##### WordmarkEdgy.tsx
  - SVG-based wordmark
  - Animated underline
  - Data point decorations
  - Gradient fills

- **shadcn/ui Integration**
  - `components.json` configuration
  - `src/components/ui/button.tsx` - Button component
  - `src/lib/utils.ts` - cn() utility function
  - Tailwind CSS variable theming

#### Fixed
- **tw-animate-css Import Error**
  - Removed `@import "tw-animate-css"` from globals.css
  - Was causing 500 error on page load
  - Framer Motion handles all animations instead

#### Removed
- Split panel layout
- Email/password login form
- AnimatedLoginForm.tsx (no longer used)
- Teal color scheme

---

## [0.1.0] - 2026-01-19

### Project Initialization

#### Added
- **Next.js 16 Project Setup**
  - Created new Next.js 16 application with App Router
  - TypeScript configuration with strict mode
  - Tailwind CSS v4 for styling
  - ESLint configuration

- **Authentication System (Clerk)**
  - Integrated `@clerk/nextjs` for authentication
  - Custom sign-in page at `/sign-in`
  - Custom sign-up page at `/sign-up`
  - SSO callback handler at `/sso-callback`
  - OAuth support (Google, GitHub ready)
  - Email/password authentication

- **Database Integration (Supabase)**
  - Supabase client configuration
  - Environment variables setup for Supabase URL and keys

- **Login Page Design** (Based on Auzmor Office reference)

  ##### LoginBackground.tsx
  - Teal gradient background (`#0d9488` to `#134e4a`)
  - World map SVG overlay with inverted colors (22% opacity)
  - 12 floating avatar photos from Unsplash
  - Geographic positioning at major regions
  - 3 depth layers (front, middle, back) with parallax effect
  - GSAP-powered floating animations
  - Online status indicators with CSS pulse animation
  - Framer Motion chat bubbles
  - Connection elements (arc lines, pulsing indicators)

  ##### AnimatedLoginForm.tsx
  - Custom logo (teal diamond SVG icon)
  - "Digital Workplace AI" branding
  - Form fields (email, password)
  - "Forgot Password?" link
  - Sign In and SSO buttons
  - Staggered Framer Motion entrance animations
  - Error handling with animated error banner

  ##### Sign-In Page Layout
  - Full-screen split layout (50/50 on desktop)
  - Mobile responsive (form only on small screens)
  - Fixed positioning layout to hide main app header

- **Project Documentation**
  - `CLAUDE.md` - Claude Code instructions and conventions
  - `context.md` - Detailed project context and specifications
  - `CHANGELOG.md` - This file
  - `SAVEPOINT.md` - Session savepoint for continuity

#### Configuration
- Environment variables structure in `.env.local`
- Hidden Next.js development indicators
- Custom CSS for dev UI hiding

---

## File Structure (Current)

```
digitalworkplace.ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with ClerkProvider
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   ├── sign-in/
│   │   │   ├── layout.tsx          # Fixed positioning layout
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx        # Minimalistic login page
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx        # Sign-up page
│   │   └── sso-callback/
│   │       └── page.tsx            # OAuth callback handler
│   ├── components/
│   │   ├── brand/
│   │   │   ├── Wordmark.tsx        # Basic wordmark
│   │   │   ├── WordmarkEdgy.tsx    # SVG wordmark
│   │   │   └── WordmarkGlitch.tsx  # Glitch effect wordmark (active)
│   │   ├── login/
│   │   │   └── LoginBackground.tsx # World map with avatars
│   │   └── ui/
│   │       └── button.tsx          # shadcn/ui Button
│   └── lib/
│       └── utils.ts                # Utility functions
├── components.json                  # shadcn/ui config
├── CLAUDE.md                        # Claude Code instructions
├── context.md                       # Project context
├── CHANGELOG.md                     # This changelog
├── SAVEPOINT.md                     # Session savepoint
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Dependencies

### Production
- `next` - ^16.x
- `react` - ^19.x
- `react-dom` - ^19.x
- `@clerk/nextjs` - Authentication
- `@supabase/supabase-js` - Database client
- `framer-motion` - React animations
- `gsap` - High-performance animations
- `class-variance-authority` - Component variants (shadcn/ui)
- `clsx` - Class name utility
- `tailwind-merge` - Tailwind class merging

### Development
- `typescript` - Type safety
- `tailwindcss` - Utility CSS
- `eslint` - Code linting
- `@types/react` - React types
- `@types/node` - Node types

---

## Design System

### Color Palette (v0.2.0)
| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | #0f0f1a | Main background |
| Background Mid | #1a1a2e | Cards, overlays |
| Background Light | #16213e | Borders, accents |
| Green Accent | #4ade80 | .ai, indicators |
| Green Glow | rgba(74,222,128,0.5) | Shadows |
| Red Glitch | #ff0040 | Chromatic aberration |
| Cyan Glitch | #00ffff | Chromatic aberration |
| White | #ffffff | Primary text |
| White 75% | rgba(255,255,255,0.75) | Secondary text |

### Typography
| Element | Font | Weight | Color |
|---------|------|--------|-------|
| Wordmark "digital" | JetBrains Mono | 300 | White 75% |
| Wordmark "workplace" | JetBrains Mono | 500 | White 100% |
| Wordmark ".ai" | JetBrains Mono | 600 | #4ade80 |

---

## Deployment

- **Platform**: Vercel
- **Production URL**: https://digitalworkplace-ai.vercel.app
- **Auto-deploy**: On push to `main` branch

---

## Next Release Planning

### [0.3.0] - Planned
- Dashboard page after login
- User profile management
- Navigation header (dark theme)
- Sign-up page redesign to match login

### [0.4.0] - Planned
- Supabase schema implementation
- User data persistence
- Team/organization support

### [0.5.0] - Planned
- AI Assistant integration
- Document management features
- Real-time collaboration
