# Digital Workplace AI - Learning & Reference Guide

**Created**: 2026-01-28
**Purpose**: Permanent reference for critical configurations, lessons learned, and troubleshooting guides.
**Location**: `.claude/learning.md` (git-tracked, auto-read by Claude)

---

## TABLE OF CONTENTS

1. [Clerk OAuth Configuration](#1-clerk-oauth-configuration-critical)
2. [Authentication Flow](#2-authentication-flow)
3. [Environment Variables](#3-environment-variables)
4. [Troubleshooting Guide](#4-troubleshooting-guide)
5. [Deployment Checklist](#5-deployment-checklist)
6. [Common Issues & Fixes](#6-common-issues--fixes)

---

## 1. CLERK OAUTH CONFIGURATION (CRITICAL)

### The Problem That Was Fixed (2026-01-28)

**Symptom**: After Google OAuth authentication, users were stuck at `/sign-in/tasks?redirect_url=...` with an endless spinner instead of reaching `/dashboard`.

**Root Cause**: Clerk Dashboard had **"Organizations → Membership required"** enabled, which forced users through an organization creation/join flow before accessing the app.

**Solution**: Changed Clerk Dashboard configuration to **"Membership optional"**.

### Required Clerk Dashboard Settings

```
URL: https://dashboard.clerk.com
App: digitalworkplace.ai
Environment: Development (and Production when applicable)

Navigate to: Configure → Organizations → Settings

REQUIRED SETTING:
┌─────────────────────────────────────────────────────────────┐
│ Membership options                                          │
│                                                             │
│ ○ Membership required                                       │
│   Users need to belong to at least one organization.        │
│   Common for most B2B SaaS applications                     │
│                                                             │
│ ● Membership optional  ← THIS MUST BE SELECTED              │
│   Users can work outside of an organization with a          │
│   personal account                                          │
└─────────────────────────────────────────────────────────────┘
```

### Why This Matters

When "Membership required" is enabled:
1. User clicks "Continue with Google"
2. Google OAuth authenticates successfully
3. Clerk checks if user belongs to an organization
4. If NO organization → Clerk redirects to `/sign-in/tasks` to complete organization setup
5. Our custom sign-in page doesn't handle Clerk's internal task flow
6. User sees endless spinner

When "Membership optional" is enabled:
1. User clicks "Continue with Google"
2. Google OAuth authenticates successfully
3. Clerk allows access with personal account (no org required)
4. User redirects directly to `/dashboard`

---

## 2. AUTHENTICATION FLOW

### Expected Flow (Working)

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   /sign-in       │───▶│  Google OAuth    │───▶│   /dashboard     │
│                  │    │  (accounts.google│    │                  │
│ "Continue with   │    │   .com)          │    │ "Welcome back,   │
│  Google" button  │    │                  │    │  [Name]"         │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Broken Flow (What We Fixed)

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   /sign-in       │───▶│  Google OAuth    │───▶│ /sign-in/tasks   │ ← STUCK!
│                  │    │                  │    │                  │
│ "Continue with   │    │                  │    │ Endless spinner  │
│  Google" button  │    │                  │    │ (org setup)      │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Code Configuration

#### 1. ClerkProvider (`apps/main/src/app/layout.tsx`)

```typescript
<ClerkProvider
  signInForceRedirectUrl="/dashboard"
  signUpForceRedirectUrl="/dashboard"
>
  {children}
</ClerkProvider>
```

#### 2. OAuth Redirect (`apps/main/src/app/sign-in/[[...sign-in]]/page.tsx`)

```typescript
await signIn.authenticateWithRedirect({
  strategy: "oauth_google",
  redirectUrl: "/sso-callback",
  redirectUrlComplete: "/dashboard",  // Must be /dashboard, NOT /
});
```

#### 3. Middleware (`apps/main/src/proxy.ts`)

```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',      // Includes /sign-in/tasks
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/icon(.*)',
  '/apple-icon(.*)',
  '/api/tracking/session/end',
  '/api/tracking/pageview',
  '/api/tracking/navigation',
  '/api/analytics(.*)',
]);
```

---

## 3. ENVIRONMENT VARIABLES

### Required in `.env.local` AND Vercel Dashboard

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (REQUIRED)
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Force Redirect URLs (CRITICAL - use FORCE, not AFTER)
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL="/dashboard"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Deprecated Variables (DO NOT USE)

```bash
# DEPRECATED - These were replaced with FORCE versions
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
# NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"
# NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/dashboard"
```

---

## 4. TROUBLESHOOTING GUIDE

### Issue: Stuck at `/sign-in/tasks` with spinner

**Diagnosis Steps:**
1. Check Clerk Dashboard → Organizations → Settings
2. Verify "Membership optional" is selected
3. Check browser console for redirect errors

**Fix:**
- Change Clerk Dashboard to "Membership optional"
- Clear browser cookies/cache
- Test in incognito window

### Issue: OAuth redirects to wrong page

**Diagnosis Steps:**
1. Check `redirectUrlComplete` in `signIn.authenticateWithRedirect()`
2. Check ClerkProvider props in `layout.tsx`
3. Check environment variables for redirect URLs

**Fix:**
- Ensure `redirectUrlComplete: "/dashboard"` (not `/` or `/sign-in`)
- Ensure `signInForceRedirectUrl="/dashboard"` in ClerkProvider

### Issue: Clerk hosted page appears instead of custom page

**Diagnosis Steps:**
1. Check `NEXT_PUBLIC_CLERK_SIGN_IN_URL` is set to `/sign-in`
2. Check middleware is not blocking sign-in routes
3. Verify custom sign-in page exists at correct path

**Fix:**
- Set `NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"` in env
- Ensure `/sign-in/[[...sign-in]]/page.tsx` exists
- Check middleware `isPublicRoute` includes `/sign-in(.*)`

### Issue: 401 Unauthorized after OAuth

**Diagnosis Steps:**
1. Check Clerk API keys match environment
2. Check for trailing whitespace in API keys
3. Verify Clerk app matches (dev vs prod)

**Fix:**
- Re-copy API keys from Clerk Dashboard
- Trim whitespace from environment variables
- Ensure correct Clerk app is selected

---

## 5. DEPLOYMENT CHECKLIST

### Before Every Deployment

- [ ] Verify Clerk Dashboard "Membership optional" is set
- [ ] Check environment variables in Vercel Dashboard
- [ ] Run `npm run build` locally to catch errors
- [ ] Test OAuth flow locally before deploying

### After Deployment

- [ ] Test OAuth flow on production in incognito window
- [ ] Verify redirect goes directly to `/dashboard`
- [ ] Check no `/sign-in/tasks` intermediate page
- [ ] Verify user data appears correctly on dashboard

### Clerk Dashboard Verification

```
1. Go to: https://dashboard.clerk.com
2. Select: digitalworkplace.ai
3. Navigate: Configure → Organizations → Settings
4. Verify: "Membership optional" is selected
5. If changed: Click "Save" and wait for confirmation
```

---

## 6. COMMON ISSUES & FIXES

### Issue Registry

| Issue | Symptom | Root Cause | Fix |
|-------|---------|------------|-----|
| Spinner at /sign-in/tasks | Endless loading after OAuth | Clerk "Membership required" | Set "Membership optional" in Clerk Dashboard |
| Redirect to Clerk.ai | See Clerk hosted pages | Missing env variables | Set `NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"` |
| 401 after OAuth | Unauthorized error | Wrong/expired API keys | Re-copy keys from Clerk Dashboard |
| Wrong redirect URL | Goes to / instead of /dashboard | Old ClerkProvider props | Use `signInForceRedirectUrl` instead of fallback |
| Hydration mismatch | Console errors on load | Client/server mismatch | Add `mounted` state, render after mount |

### Quick Diagnostic Commands

```bash
# Check if production is responding
curl -s -o /dev/null -w "%{http_code}" https://www.digitalworkplace.ai/sign-in

# Check environment variables (local)
grep CLERK .env.local

# Check git status
git status

# View recent commits
git log --oneline -5
```

---

## VERSION HISTORY

| Version | Date | Change |
|---------|------|--------|
| 0.8.2 | 2026-01-28 | Fixed OAuth flow - Clerk "Membership optional" |
| 0.8.1 | 2026-01-28 | Security audit, CORS fixes |
| 0.8.0 | 2026-01-28 | dCQ v1.2.0 City of Doral import |

---

## REFERENCES

- Clerk Documentation: https://clerk.com/docs
- Clerk Organizations: https://clerk.com/docs/organizations/overview
- Next.js App Router: https://nextjs.org/docs/app
- Vercel Deployment: https://vercel.com/docs

---

*This file is auto-read by Claude Code at session start.*
*Location: /Users/aldrin-mac-mini/digitalworkplace.ai/.claude/learning.md*
*Last Updated: 2026-01-28*
