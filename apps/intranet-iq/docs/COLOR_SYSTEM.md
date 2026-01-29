# dIQ Color System - Single Source of Truth

**Design System:** Midnight Green
**Primary Accent:** Emerald (#10b981)
**Last Updated:** January 29, 2026

---

## CRITICAL RULES

### DO NOT:
- ❌ Hardcode hex colors in components (e.g., `color="#10b981"`)
- ❌ Use arbitrary Tailwind values for theme colors (e.g., `bg-[#0f0f14]`)
- ❌ Define new colors without adding them to `colors.ts`
- ❌ Use different shades of the same color inconsistently

### ALWAYS:
- ✅ Import from `@/lib/theme/colors` for hex values
- ✅ Use CSS variables from `globals.css` in stylesheets
- ✅ Use Tailwind semantic classes (e.g., `bg-emerald-500/15`)
- ✅ Add new colors to `colors.ts` first, then use them

---

## Color Sources (In Order of Preference)

### 1. CSS Variables (Best for stylesheets and inline styles)

```css
/* Primary accent */
var(--accent-ember)       /* #10b981 - Primary green */
var(--accent-ember-soft)  /* #34d399 - Hover state */
var(--accent-copper)      /* #059669 - Active state */
var(--accent-gold)        /* #6ee7b7 - Highlights */

/* Backgrounds */
var(--bg-obsidian)        /* #08080c - Page background */
var(--bg-charcoal)        /* #121218 - Cards */
var(--bg-slate)           /* #1c1c24 - Inputs */

/* Text */
var(--text-primary)       /* #fafafa */
var(--text-secondary)     /* rgba(250,250,250,0.7) */
var(--text-muted)         /* rgba(250,250,250,0.5) */

/* Semantic */
var(--success)            /* #22c55e */
var(--warning)            /* #eab308 */
var(--error)              /* #ef4444 */
```

**Usage:**
```tsx
<div style={{ backgroundColor: 'var(--bg-charcoal)' }}>
<div className="bg-[var(--accent-ember)]">
```

### 2. Theme Colors TypeScript (Best for JavaScript logic)

```typescript
import { BRAND, SEMANTIC, WORKFLOW_NODES } from '@/lib/theme';

// Use color values
const primaryColor = BRAND.primary;        // '#10b981'
const successColor = SEMANTIC.success;     // '#22c55e'
const triggerColor = WORKFLOW_NODES.trigger.color; // '#a855f7'
```

### 3. Tailwind Classes (Best for component styling)

```tsx
// Backgrounds
<div className="bg-emerald-500/15">    // Primary accent background
<div className="bg-green-500/15">      // Success background

// Text
<span className="text-emerald-400">    // Primary accent text
<span className="text-green-400">      // Success text

// Borders
<div className="border-emerald-500/30"> // Primary accent border
```

---

## Color Categories

### Brand Colors
| Token | Hex | CSS Variable | Tailwind |
|-------|-----|--------------|----------|
| Primary | #10b981 | `--accent-ember` | `emerald-500` |
| Primary Soft | #34d399 | `--accent-ember-soft` | `emerald-400` |
| Primary Dark | #059669 | `--accent-copper` | `emerald-600` |
| Primary Light | #6ee7b7 | `--accent-gold` | `emerald-300` |

### Semantic Colors
| Purpose | Hex | CSS Variable | Tailwind |
|---------|-----|--------------|----------|
| Success | #22c55e | `--success` | `green-500` |
| Warning | #eab308 | `--warning` | `yellow-500` |
| Error | #ef4444 | `--error` | `red-500` |
| Info | #3b82f6 | N/A | `blue-500` |

### Workflow Node Colors
| Node Type | Color | Background | Border |
|-----------|-------|------------|--------|
| Trigger | #a855f7 | purple-500/15 | purple-500/40 |
| Search | #3b82f6 | blue-500/15 | blue-500/40 |
| Action | #22c55e | green-500/15 | green-500/40 |
| Condition | #10b981 | emerald-500/15 | emerald-500/40 |
| Transform | #06b6d4 | cyan-500/15 | cyan-500/40 |
| Output | #fbbf24 | amber-500/15 | amber-500/40 |
| Approval | #14b8a6 | teal-500/15 | teal-500/40 |

---

## Examples

### Correct Usage

```tsx
// ✅ Using CSS variable
<div style={{ backgroundColor: 'var(--bg-charcoal)' }}>

// ✅ Using theme import
import { SEMANTIC } from '@/lib/theme';
const color = isSuccess ? SEMANTIC.success : SEMANTIC.error;

// ✅ Using Tailwind with semantic meaning
<span className="text-emerald-400">Primary text</span>
<div className="bg-green-500/15">Success background</div>

// ✅ Using utility function
import { getStatusColor } from '@/lib/theme';
const { color, bg } = getStatusColor('active');
```

### Incorrect Usage

```tsx
// ❌ Hardcoded hex
<div style={{ backgroundColor: '#121218' }}>

// ❌ Arbitrary value for theme color
<div className="bg-[#0f0f14]">

// ❌ Magic number color
const primaryColor = '#10b981';
```

---

## Migration Guide

If you find hardcoded colors, replace them:

| Old (Wrong) | New (Correct) |
|-------------|---------------|
| `bg-[#0f0f14]` | `bg-[var(--bg-charcoal)]` |
| `bg-[#121218]` | `bg-[var(--bg-charcoal)]` |
| `color: '#10b981'` | `color: 'var(--accent-ember)'` |
| `"#22c55e"` | `import { SEMANTIC } from '@/lib/theme'; SEMANTIC.success` |

---

## Adding New Colors

1. Add to `/src/lib/theme/colors.ts`
2. Add CSS variable to `/src/app/globals.css` if needed
3. Document in this file
4. Use the new color via import or CSS variable

---

## Enforcement

This color system is enforced by:

1. **Code Review** - PRs with hardcoded colors will be rejected
2. **Theme Import** - All colors must be imported from `@/lib/theme`
3. **CSS Variables** - Use `var(--*)` for all theme colors in styles

---

## Files Reference

- **Central Colors:** `/src/lib/theme/colors.ts`
- **CSS Variables:** `/src/app/globals.css`
- **This Documentation:** `/docs/COLOR_SYSTEM.md`
