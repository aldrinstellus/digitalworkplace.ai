# Changelog

All notable changes to Digital Workplace AI are documented in this file.

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
  - 12 floating avatar photos from Unsplash:
    - Sarah, Marcus, Emily, David, Sophia, James
    - Olivia, Michael, Ava, Robert, Isabella, Daniel
  - Geographic positioning at major regions:
    - USA, Canada, Brazil, UK, Germany, Africa
    - Dubai, India, China, Japan, Singapore, Australia
  - 3 depth layers (front, middle, back) with parallax effect
  - GSAP-powered floating animations:
    - Vertical floating with randomized duration (3-5s)
    - Subtle rotation and 3D perspective
    - Staggered animation start times
  - Online status indicators with CSS pulse animation
  - Framer Motion chat bubbles:
    - 12 rotating messages
    - Random appearance every 3 seconds
    - Smooth enter/exit animations
    - White background with speech bubble tail
  - Connection elements:
    - Arc lines between regions (SVG paths)
    - Pulsing city location indicators
    - Floating particle effects

  ##### AnimatedLoginForm.tsx
  - Custom logo (teal diamond SVG icon)
  - "Digital Workplace AI" branding
  - "Sign In" heading with descriptive subtitle
  - Form fields:
    - Work Email / Username input (rounded-full style)
    - Password input with show/hide toggle
  - "Forgot Password?" link
  - Sign In button (gray, disabled state until valid)
  - SSO button (white outline style)
  - Sign Up link
  - Staggered Framer Motion entrance animations
  - Error handling with animated error banner
  - Loading state with spinning indicator

  ##### Sign-In Page Layout
  - Full-screen split layout (50/50 on desktop)
  - Mobile responsive (form only, background hidden on small screens)
  - Fixed positioning layout to hide main app header
  - Smooth page transition animations

- **Project Documentation**
  - `CLAUDE.md` - Claude Code instructions and conventions
  - `context.md` - Detailed project context and specifications
  - `CHANGELOG.md` - This file
  - `savepoint.md` - Session savepoint for continuity

#### Configuration
- Environment variables structure in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_PUBLISHABLE_KEY
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  ```

#### Styling
- Hidden Next.js development indicators (error button, floating buttons)
- Custom CSS in `globals.css` for dev UI hiding
- Tailwind CSS utility-first approach
- Teal/neutral color palette throughout

---

## File Structure Created

```
digitalworkplace.ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with ClerkProvider
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles + Next.js UI hiding
│   │   ├── sign-in/
│   │   │   ├── layout.tsx          # Fixed positioning layout
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx        # Sign-in page with split layout
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx        # Sign-up page
│   │   └── sso-callback/
│   │       └── page.tsx            # OAuth callback handler
│   └── components/
│       └── login/
│           ├── LoginBackground.tsx  # World map with avatars
│           └── AnimatedLoginForm.tsx # Animated sign-in form
├── CLAUDE.md                        # Claude Code instructions
├── context.md                       # Project context
├── CHANGELOG.md                     # This changelog
├── savepoint.md                     # Session savepoint
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

### Development
- `typescript` - Type safety
- `tailwindcss` - Utility CSS
- `eslint` - Code linting
- `@types/react` - React types
- `@types/node` - Node types

---

## Reference

### Design Reference
Based on: `/Users/aldrin-mac-mini/v1/office_frontend-v1` (Auzmor Office login page)

### Key Animations
1. **GSAP Floating** - Avatars float vertically with subtle rotation
2. **Framer Motion Stagger** - Form elements appear sequentially
3. **CSS Pulse** - Online status indicators pulse green
4. **Chat Bubbles** - Random messages appear and fade

### Color Palette
| Color | Hex | Tailwind |
|-------|-----|----------|
| Primary Teal | #0d9488 | teal-600 |
| Teal Light | #14b8a6 | teal-500 |
| Teal Dark | #115e59 | teal-800 |
| Background | #fafafa | neutral-50 |
| Text | #171717 | neutral-900 |
| Muted | #737373 | neutral-500 |
| Green Indicator | #4ade80 | green-400 |

---

## Deployment

- **Platform**: Vercel
- **Production URL**: https://digitalworkplace-ai.vercel.app (pending deployment)
- **Auto-deploy**: On push to `main` branch

---

## Next Release Planning

### [0.2.0] - Planned
- Dashboard page after login
- User profile management
- Navigation header for authenticated users

### [0.3.0] - Planned
- AI Assistant integration
- Document management features
- Team collaboration tools
