# Digital Workplace AI - Claude Code Instructions

## Project Overview
Digital Workplace AI is a Next.js 16 application with Clerk authentication and Supabase backend, deployed on Vercel.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Authentication**: Clerk (@clerk/nextjs)
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **Deployment**: Vercel

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with ClerkProvider
│   ├── page.tsx            # Home page
│   ├── sign-in/            # Sign-in page (full-screen layout)
│   │   ├── layout.tsx      # Auth-specific layout (no header)
│   │   └── [[...sign-in]]/
│   │       └── page.tsx
│   ├── sign-up/            # Sign-up page
│   │   └── [[...sign-up]]/
│   │       └── page.tsx
│   └── sso-callback/       # OAuth callback handler
│       └── page.tsx
├── components/
│   └── login/              # Login-related components
│       ├── LoginBackground.tsx    # World map with floating avatars
│       └── AnimatedLoginForm.tsx  # Animated sign-in form
└── globals.css             # Global styles
```

## Key Files

### Authentication
- `src/app/layout.tsx` - ClerkProvider wrapper
- `src/components/login/AnimatedLoginForm.tsx` - Custom login form with Clerk's `useSignIn` hook
- `src/app/sso-callback/page.tsx` - OAuth redirect handler

### Login Page Design
- `src/components/login/LoginBackground.tsx` - World map background with:
  - 12 floating avatar photos positioned on world map
  - GSAP-powered floating animations
  - Framer Motion chat bubbles
  - Pulsing location indicators
  - Connection lines between avatars

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
- Follow existing patterns in login components

### Styling
- Use Tailwind CSS utility classes
- Color scheme: Teal/neutral palette
- Rounded inputs: `rounded-full` for form fields
- Consistent spacing with Tailwind's spacing scale

### TypeScript
- Strict mode enabled
- Use proper type annotations
- Avoid `any` types where possible

## Common Tasks

### Adding a new page
1. Create folder in `src/app/`
2. Add `page.tsx` with component
3. Add `layout.tsx` if custom layout needed

### Modifying login design
1. Edit `src/components/login/LoginBackground.tsx` for left panel
2. Edit `src/components/login/AnimatedLoginForm.tsx` for right panel

### Adding OAuth providers
1. Configure in Clerk Dashboard
2. Add button in `AnimatedLoginForm.tsx`
3. Use `signIn.authenticateWithRedirect()` with appropriate strategy
