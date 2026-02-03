# Environment Variables - Digital Workplace AI

This folder contains environment variable templates for all Digital Workplace AI apps.

## Setup Instructions

1. Copy the relevant `.env.example` file to your app's directory as `.env.local`
2. Fill in the actual values (get from team lead or secrets manager)
3. Never commit `.env.local` files to git

## Files

| File | App | Port | Copy To |
|------|-----|------|---------|
| `root.env.example` | Root/Shared | - | `/.env.local` |
| `main.env.example` | Main Dashboard | 3000 | `/apps/main/.env.local` |
| `intranet-iq.env.example` | Intranet IQ (dIQ) | 3001 | `/apps/intranet-iq/.env.local` |
| `chat-core-iq.env.example` | Chat Core IQ (dCQ) | 3002 | `/apps/chat-core-iq/.env.local` |
| `support-iq.env.example` | Support IQ (dSQ) | 3003 | `/apps/support-iq/.env.local` |

## Quick Setup Commands

```bash
# From digitalworkplace.ai root folder:

# Root shared env
cp env/root.env.example .env.local

# Main app
cp env/main.env.example apps/main/.env.local

# Intranet IQ
cp env/intranet-iq.env.example apps/intranet-iq/.env.local

# Chat Core IQ
cp env/chat-core-iq.env.example apps/chat-core-iq/.env.local

# Support IQ
cp env/support-iq.env.example apps/support-iq/.env.local
```

## Where to Get Keys

| Variable | Source |
|----------|--------|
| `CLERK_SECRET_KEY` | https://dashboard.clerk.com → API Keys |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | https://dashboard.clerk.com → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `ELEVENLABS_API_KEY` | https://elevenlabs.io/app/settings/api-keys |
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` |

## Shared Configuration

All apps share the same Supabase project but use different schemas:
- `public` - Shared tables (users, organizations)
- `diq` - Intranet IQ specific tables
- `dcq` - Chat Core IQ specific tables
- `dsq` - Support IQ specific tables

All apps share the same Clerk authentication instance.

---
*Last Updated: February 2, 2026*
