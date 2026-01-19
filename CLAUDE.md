# Digital Workplace AI - Claude Code Instructions

## Project Overview
Digital Workplace AI is a Next.js 16 application with Clerk authentication and Supabase backend, deployed on Vercel. Features a dark theme with an edgy, tech-forward aesthetic.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk (@clerk/nextjs) - Google OAuth
- **Database**: Supabase
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion, GSAP
- **Audio**: Web Audio API (procedural sound effects)
- **Deployment**: Vercel

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with ClerkProvider
│   ├── page.tsx            # Home page (redirects to dashboard)
│   ├── globals.css         # Global styles
│   ├── sign-in/            # Sign-in page (full-screen layout)
│   │   ├── layout.tsx      # Auth-specific layout (no header)
│   │   └── [[...sign-in]]/
│   │       └── page.tsx    # Minimalistic login page
│   ├── sign-up/            # Sign-up page
│   │   └── [[...sign-up]]/
│   │       └── page.tsx
│   ├── sso-callback/       # OAuth callback handler
│   │   ├── layout.tsx      # SSO callback layout
│   │   └── page.tsx
│   ├── dashboard/          # Main dashboard (protected)
│   │   └── page.tsx        # Product cards with animated SVGs
│   └── admin/              # Admin panel (super_admin only)
│       └── page.tsx        # User management interface
├── components/
│   ├── audio/              # Audio components
│   │   ├── BackgroundMusic.tsx  # Background music player (disabled)
│   │   └── SoundToggle.tsx      # Sound effects toggle (active)
│   ├── brand/              # Brand identity components
│   │   ├── Wordmark.tsx        # Basic animated wordmark
│   │   ├── WordmarkEdgy.tsx    # SVG-based wordmark
│   │   └── WordmarkGlitch.tsx  # Glitch effect wordmark (primary)
│   ├── login/              # Login-related components
│   │   └── LoginBackground.tsx # World map with floating avatars
│   └── ui/                 # shadcn/ui components
│       └── button.tsx      # Button component
└── lib/
    ├── utils.ts            # Utility functions (cn)
    ├── supabase.ts         # Supabase client configuration
    ├── userRole.ts         # User role management & Clerk sync
    ├── sounds.ts           # Web Audio API sound effects
    └── backgroundMusic.ts  # Procedural music generator (disabled)
```

## Key Files

### Authentication
- `src/app/layout.tsx` - ClerkProvider wrapper
- `src/app/sign-in/[[...sign-in]]/page.tsx` - Google OAuth login
- `src/app/sso-callback/page.tsx` - OAuth redirect handler

### Dashboard
- `src/app/dashboard/page.tsx` - Main dashboard with:
  - 4 product cards (Support IQ, Intranet IQ, Test Pilot IQ, Chat Core IQ)
  - Animated SVG illustrations for each product
  - 3D tilt effects with Framer Motion
  - Colored borders matching product themes
  - Continuous looping animations
  - User avatar with dropdown menu
  - Super admin badge and link

### User Role System
- `src/lib/userRole.ts` - Supabase user management:
  - `getUserByEmail(email)` - Get user by email
  - `getUserByClerkId(clerkId)` - Get user by Clerk ID
  - `syncUserWithClerk(email, clerkId, fullName?, avatarUrl?)` - Sync Clerk user to Supabase
  - `isSuperAdmin(email)` - Check if user is super admin
  - `isAdmin(email)` - Check if user is admin or super admin
  - `getAllUsers()` - Get all users (for admin)
  - `updateUserRole(userId, role)` - Update user role

### Admin Panel
- `src/app/admin/page.tsx` - Super admin interface:
  - User list with role badges
  - Role assignment dropdown
  - Protected route (super_admin only)

### Login Page Design
- `src/components/login/LoginBackground.tsx` - Full-screen world map with:
  - 24 floating avatar photos positioned across screen
  - Dark grey theme (#0f0f1a, #1a1a2e)
  - GSAP-powered floating animations
  - 15 max concurrent Framer Motion chat bubbles (40% slower speed)
  - Lighter mint-green chat bubbles with 70% opacity
  - Slow bezier-curve green dot animations (7-15s)
  - Pulsing location indicators
  - Connection arc lines
  - Avatar click-to-focus with auto-minimize (2.5s)
  - Sound effects (ambient pulse, data packets, chat bubbles)
  - **Responsive**: Smaller avatars on mobile (44-52px vs 58-68px desktop)
  - **Responsive**: Smaller chat bubbles and labels on mobile

### Audio System
- `src/lib/sounds.ts` - Web Audio API sound effects:
  - `playGlitchSound()` - Digital glitch effect
  - `playDataPacketSound()` - Soft blip for data packets
  - `playAmbientPulse()` - Subtle ambient pad (A minor chord)
  - `playChatBubbleSound()` - Soft pop notification
  - `playConnectionSound()` - Ultra-soft ping
  - Sound enabled by default, respects toggle state
  - **Browser autoplay handling**: Listens for user interaction (click, touch, keydown) to resume AudioContext
  - Sounds auto-play after first user interaction

- `src/components/audio/SoundToggle.tsx` - Toggle button:
  - Fixed top-right position (responsive: smaller on mobile)
  - Three states: "Enable" (initial), "On" (active), "Off" (muted)
  - Pulsing speaker icon before first interaction
  - Green animated bars when ON
  - Muted speaker icon when OFF
  - Text labels hidden on mobile for compact display

### Brand Components
- `src/components/brand/WordmarkGlitch.tsx` - Primary wordmark with:
  - Chromatic aberration (red/cyan split)
  - Variable intensity glitches (every 2.6 seconds)
  - Initial glitch at 500ms after load
  - Double-tap stuttering
  - Horizontal slice distortion
  - Corner bracket decorations
  - Blinking cursor

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Development Commands
```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment
- Hosted on Vercel
- Auto-deploys on push to `main` branch
- Production URL: https://digitalworkplace-ai.vercel.app

## Code Conventions

### Components
- Use `"use client"` directive for client components
- Use Framer Motion for UI animations
- Use GSAP for complex/performant animations
- Use shadcn/ui for base components
- Follow existing patterns in brand/login components

### Styling
- Use Tailwind CSS utility classes
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Dark grey theme: #0f0f1a (bg), #1a1a2e (mid), #16213e (light)
- Green accent: #4ade80
- Lighter mint green for chat bubbles: rgba(134, 239, 172, 0.7)
- Monospace fonts: JetBrains Mono, Fira Code, SF Mono

### TypeScript
- Strict mode enabled
- Use proper type annotations
- Avoid `any` types where possible

## Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Background Dark | #0f0f1a | Main background |
| Background Mid | #1a1a2e | Cards, overlays |
| Background Light | #16213e | Borders, accents |
| Green Accent | #4ade80 | .ai, indicators |
| Mint Green | rgba(134, 239, 172, 0.7) | Chat bubbles |
| White | #ffffff | Primary text |
| White 75% | rgba(255,255,255,0.75) | Secondary text |

### Product Theme Colors
| Product | Primary | Secondary | Usage |
|---------|---------|-----------|-------|
| Support IQ | #10b981 | #06b6d4 | Green/Cyan |
| Intranet IQ | #3b82f6 | #8b5cf6 | Blue/Purple |
| Test Pilot IQ | #f59e0b | #ef4444 | Orange/Red |
| Chat Core IQ | #a855f7 | #ec4899 | Purple/Pink |

### Typography
| Element | Font | Weight |
|---------|------|--------|
| Wordmark "digital" | JetBrains Mono | 300 |
| Wordmark "workplace" | JetBrains Mono | 500 |
| Wordmark ".ai" | JetBrains Mono | 600 |

## Common Tasks

### Adding a new page
1. Create folder in `src/app/`
2. Add `page.tsx` with component
3. Add `layout.tsx` if custom layout needed

### Modifying login design
1. Edit `src/components/login/LoginBackground.tsx` for background
2. Edit `src/app/sign-in/[[...sign-in]]/page.tsx` for login content
3. Edit `src/components/brand/WordmarkGlitch.tsx` for wordmark

### Adding shadcn/ui components
```bash
npx shadcn@latest add [component-name]
```

### Adding OAuth providers
1. Configure in Clerk Dashboard
2. Add button in sign-in page
3. Use `signIn.authenticateWithRedirect()` with appropriate strategy

### Modifying Sound Effects
1. Edit `src/lib/sounds.ts` for sound generation
2. Edit `src/components/audio/SoundToggle.tsx` for toggle UI
3. Sounds auto-play on page load (enabled by default)

## Key Animation Patterns

### Glitch Effect
```typescript
const [glitchActive, setGlitchActive] = useState(false);
const [glitchIntensity, setGlitchIntensity] = useState(0);

const triggerGlitch = () => {
  setGlitchIntensity(Math.random() > 0.5 ? 2 : 1);
  setGlitchActive(true);
  // Double-tap effect
  setTimeout(() => {
    setGlitchActive(false);
    if (Math.random() > 0.5) {
      setTimeout(() => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 80);
      }, 50);
    }
  }, 120);
};
```

### GSAP Floating
```typescript
gsap.to(element, {
  y: -15,
  duration: 4,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut"
});
```

### Framer Motion Chat Bubbles
```typescript
<AnimatePresence>
  {bubbles.map(bubble => (
    <motion.div
      key={bubble.id}
      initial={{ opacity: 0, y: 10, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {bubble.message}
    </motion.div>
  ))}
</AnimatePresence>
```

### Web Audio Sound Effect
```typescript
export const playChatBubbleSound = (): void => {
  if (!audioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.02, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
};
```
