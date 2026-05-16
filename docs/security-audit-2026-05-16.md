# Digital Workplace AI — Security Audit · 2026-05-16

**Scope:** All apps in the monorepo — `apps/main`, `apps/intranet-iq` (dIQ), `apps/chat-core-iq` (dCQ), `apps/support-iq` (dSQ, submodule), `apps/test-iq`.
**Auditor:** Claude Code (Opus 4.7 1M).
**Threat model:** federal-sector POC + production-adjacent. Customer-facing, Clerk-auth-gated, Supabase + Anthropic + Zoho integrations.

**Severity scale:**
- 🔴 **Critical** — exploitable without auth, leaks secrets or data, code execution
- 🟠 **High** — auth bypass, privilege escalation, sensitive data leak, exploitable injection
- 🟡 **Medium** — info disclosure, missing best-practice header, weak validation
- 🔵 **Low** — defensive-depth improvement, theoretical issue

---

## Phase 1: Secrets + env sweep
_In progress._

## Phase 2: Dependency audit
_Pending._

## Phase 3: Auth + middleware
_Pending._

## Phase 4: API endpoint surface
_Pending._

## Phase 5: Headers + CORS
_Pending._

## Phase 6: Dangerous code patterns
_Pending._

## Phase 7: Per-app deep dive
_Pending._

## Phase 8: Live endpoint probing
_Pending._

## Phase 9: Findings summary + fixes
_Pending._
