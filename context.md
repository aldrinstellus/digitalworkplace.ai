# Digital Workplace AI - Project Context

## Vision
Digital Workplace AI is an AI-powered digital workplace solution designed to enhance team collaboration and productivity.

## Architecture

### Frontend
- **Next.js 16** with App Router for server-side rendering and routing
- **TypeScript** for type safety
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for declarative React animations
- **GSAP** for high-performance JavaScript animations

### Authentication
- **Clerk** handles all authentication flows:
  - Email/password sign-in
  - OAuth providers (Google, GitHub)
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

## Login Page Design

### Reference Design
Based on Auzmor Office login page (`/Users/aldrin-mac-mini/v1/office_frontend-v1`)

### Components

#### LoginBackground.tsx
Left panel featuring:
- Teal gradient background (`#0d9488` to `#134e4a`)
- World map SVG overlay (22% opacity, inverted colors)
- 12 floating avatar photos from Unsplash:
  - Positioned at geographic locations
  - 3 depth layers (front, middle, back)
  - GSAP floating animations
  - Online status indicators with pulse effect
- Chat bubbles:
  - Random messages appearing
  - Framer Motion enter/exit animations
  - White background with tail
- Connection elements:
  - Arc lines between regions
  - Pulsing city indicators
  - Floating particles

#### AnimatedLoginForm.tsx
Right panel featuring:
- Custom logo (teal diamond icon)
- "Sign In" heading with subtitle
- Form fields:
  - Work Email / Username (rounded input)
  - Password (with show/hide toggle)
- Forgot Password link
- Sign In button (gray, disabled until valid)
- SSO button (white outline)
- Sign Up link
- Staggered Framer Motion animations

### Layout
- Full-screen split layout (50/50 on desktop)
- Mobile: Form only (background hidden)
- Sign-in pages use fixed positioning to hide main header

## API Integration

### Clerk Hooks Used
```typescript
import { useSignIn } from "@clerk/nextjs";

const { isLoaded, signIn, setActive } = useSignIn();

// Email/password login
await signIn.create({ identifier: email, password });

// OAuth login
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
12 diverse professional headshots from Unsplash:
```typescript
const uniqueAvatars = [
  { id: 1, src: "photo-1494790108377-be9c29b29330", name: "Sarah" },
  { id: 2, src: "photo-1507003211169-0a1dd7228f2d", name: "Marcus" },
  { id: 3, src: "photo-1438761681033-6461ffad8d80", name: "Emily" },
  { id: 4, src: "photo-1472099645785-5658abf4ff4e", name: "David" },
  { id: 5, src: "photo-1534528741775-53994a69daeb", name: "Sophia" },
  { id: 6, src: "photo-1500648767791-00dcc994a43e", name: "James" },
  { id: 7, src: "photo-1517841905240-472988babdf9", name: "Olivia" },
  { id: 8, src: "photo-1506794778202-cad84cf45f1d", name: "Michael" },
  { id: 9, src: "photo-1544005313-94ddf0286df2", name: "Ava" },
  { id: 10, src: "photo-1552058544-f2b08422138a", name: "Robert" },
  { id: 11, src: "photo-1531746020798-e6953c6e8e04", name: "Isabella" },
  { id: 12, src: "photo-1463453091185-61582044d556", name: "Daniel" },
];
```

## Geographic Avatar Positions
Avatars positioned at major global regions:
- USA (front layer, largest)
- Canada (back layer)
- Brazil (middle layer)
- UK (middle layer)
- Europe/Germany (back layer)
- Africa (middle layer)
- Dubai (middle layer)
- India (front layer)
- China (middle layer)
- Japan (back layer)
- Singapore (middle layer)
- Australia (front layer)

## Chat Messages
Rotating chat bubble messages:
- "Great meeting today!"
- "Love the new design!"
- "Thanks for the help!"
- "See you at standup"
- "Awesome work!"
- "Quick sync later?"
- "Just shipped it!"
- "Happy Friday!"
- "Nice job on that!"
- "Coffee break?"
- "Let's collaborate!"
- "You're amazing!"

## Color Palette
- **Primary Teal**: `#0d9488` (teal-600)
- **Teal Light**: `#14b8a6` (teal-500)
- **Teal Dark**: `#115e59` (teal-800)
- **Background**: `#fafafa` (neutral-50)
- **Text**: `#171717` (neutral-900)
- **Muted**: `#737373` (neutral-500)
- **Green Indicator**: `#4ade80` (green-400)

## Future Enhancements
- Dashboard with analytics
- AI Assistant integration
- Document management
- Team collaboration features
- Settings and preferences
- Notification system
