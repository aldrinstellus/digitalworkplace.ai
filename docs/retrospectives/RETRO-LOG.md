# Retrospective Ledger — digitalworkplace.ai

Append-only. One entry per savepoint. Corrections are new entries, never edits.
Lane discipline: `SAVEPOINT.md` = where the project is now; this file = what we learned + where each learning went.

---

## 2026-07-03 · grc-iq-5th-product-card · 9271baa
**Outcome:** GRC IQ / AI Compliance card shipped + live-verified on www.digitalworkplace.ai (Launch App → Auctor.GRC dashboard proven by live click; PDF 200; deploy Ready; alias serving). Verdict: GO, live evidence.

### ✅ Successes
- Fully data-driven card architecture held: 5th card needed only a `products` entry + one illustration fn + a map row + a grid class — zero `ProductCard` changes.
- Plan-mode exploration (2 parallel Explore agents) surfaced both repos' exact patterns before any edit; the 3 product decisions (naming/color/guide) were put to Aldrin up front, so execution was single-pass.
- Aldo's Axiom end-to-end: deploy watched to Ready, new-deploy-serves-domain proven via the PDF (a file that didn't exist on the old deploy), Launch App live-clicked, responsive rules grep-confirmed in the shipped CSS.

### ❌ Failures / friction
- `npm run build` failed first run — **root cause:** fresh checkout had no `node_modules`; an earlier "lint exit 0" was actually the pipe's exit code, not eslint's — **fix:** `npm install`, then re-ran lint + build for real. Never trust `cmd | tail; echo $?`.
- Browser resize verification no-op'd — **root cause:** `claude-in-chrome` resize_window reports success but can't resize a macOS fullscreen window — **fix:** verified `window.innerWidth` (unchanged), switched to fetching the shipped CSS and asserting the `sm:2/lg:3/xl:5` media-query rules exist.
- Direct `git push` to main was classifier-blocked despite plan approval — **fix:** committed locally, asked Aldrin explicitly, pushed on his yes. Deploy-affecting pushes need their own explicit approval.

### 💡 Learnings
- [`gotcha`] Cookieless curl of a Clerk-protected route returns 404 (not 307) on this app — liveness-check `/sign-in` or a real session instead → **routed:** SAVEPOINT learnings + this ledger.
- [`gotcha`] `claude-in-chrome` resize_window silently no-ops on fullscreen macOS windows; stylesheet-grep of shipped CSS is the stronger responsive oracle anyway → **routed:** memory:browser-and-playwright (pending) / ledger.
- [`process`] Cross-repo link dependencies get recorded on BOTH sides + a deterministic curl in the consumer's maintenance protocol (launcher card ↔ auctor alias) → **routed:** CLAUDE.md maintenance step (done this session).
- [`one-off`] Chat Core IQ leaks clerk_id/session_id/email in launch URL query params → **routed:** ~/.claude/BACKLOG.md B8.

### 📊 Signal
- Lint 0 errors · build exit 0 · Vercel deploy `digitalworkplace-ht7ktdqj7` Ready · live screenshots (5-card grid, hover CTA row, Auctor dashboard) · PDF curl 200 application/pdf 7,552,475 B.
