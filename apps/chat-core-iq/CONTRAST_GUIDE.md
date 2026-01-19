# Color Contrast Guidelines - City of Doral

This guide ensures all UI elements meet WCAG 2.1 Level AA accessibility standards.

## WCAG AA Minimum Contrast Ratios

| Element Type | Minimum Ratio | Example |
|-------------|---------------|---------|
| Normal text (< 18px) | **4.5:1** | Body text, labels, buttons |
| Large text (18px+ or 14px bold) | **3:1** | Headings, large buttons |
| UI components & graphics | **3:1** | Borders, icons, focus indicators |

## Safe Tailwind Classes

### On Light Backgrounds (white, gray-50, gray-100)

| Use Case | Safe Classes | AVOID |
|----------|-------------|-------|
| Body text | `text-gray-700`, `text-gray-800`, `text-gray-900` | `text-gray-400`, `text-gray-300` |
| Secondary text | `text-gray-600`, `text-gray-500` | `text-gray-400` |
| Muted/tertiary | `text-gray-500` (minimum) | `text-gray-400`, `text-gray-300` |
| Borders | `border-gray-400`, `border-gray-500` | `border-gray-300`, `border-gray-200` |
| Icons | `text-gray-500` minimum | `text-gray-400`, `text-gray-300` |

### On Dark Backgrounds (slate-800, slate-900, navy)

| Use Case | Safe Classes | AVOID |
|----------|-------------|-------|
| Primary text | `text-white`, `text-gray-100` | `text-gray-300`, `text-gray-400` |
| Secondary text | `text-gray-200`, `text-blue-100` | `text-blue-200`, `text-blue-300` |
| Muted text | `text-slate-300` minimum | `text-slate-400`, `text-slate-500` |
| Labels | `text-blue-200`, `text-slate-300` | `text-blue-300/70`, opacity modifiers |

## Color Values Reference

### Chat Widget CSS Variables

```css
/* GOOD - High contrast (use these) */
--doral-text-primary: #1a1a2e;      /* 12.6:1 on white */
--doral-text-secondary: #374151;    /* 7.5:1 on white */
--doral-text-muted: #6b7280;        /* 5.0:1 on white */
--doral-border: #9ca3af;            /* 3.0:1 on white */

/* BAD - Low contrast (avoid these for text) */
#4a4a68  /* 3.1:1 - FAILS for normal text */
#5c5c7a  /* 3.3:1 - FAILS for normal text */
#d1d5db  /* 1.5:1 - FAILS for everything */
```

## Common Anti-Patterns

### 1. Opacity Modifiers
```tsx
// BAD - Opacity reduces contrast unpredictably
className="text-blue-300/70"  // 70% opacity fails

// GOOD - Use a solid color instead
className="text-blue-200"
```

### 2. Gray-300/400 on Light Backgrounds
```tsx
// BAD - Too light
className="text-gray-300"  // ~4.5:1 - borderline
className="text-gray-400"  // ~5.4:1 - marginal

// GOOD - Use darker grays
className="text-gray-500"  // 5.9:1 - safe
className="text-gray-600"  // 7.0:1 - recommended
```

### 3. Slate-400/500 on Dark Backgrounds
```tsx
// BAD - Too dark on dark
className="bg-slate-800 text-slate-500"  // ~3.8:1 FAILS
className="bg-slate-900 text-slate-400"  // ~4.2:1 FAILS

// GOOD - Use lighter slates
className="bg-slate-800 text-slate-300"  // 6.2:1 - safe
className="bg-slate-900 text-slate-200"  // 8.5:1 - recommended
```

### 4. Disabled States Using Only Opacity
```css
/* BAD - Relies only on opacity */
.disabled { opacity: 0.5; }

/* GOOD - Visual indicators beyond opacity */
.disabled {
  opacity: 0.6;
  color: var(--doral-text-muted);
  border-style: dashed;
}
```

## Testing Tools

1. **Chrome DevTools**: Inspect element > Computed > Contrast ratio
2. **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
3. **Lighthouse**: Chrome DevTools > Lighthouse > Accessibility audit
4. **axe DevTools**: Browser extension for accessibility testing

## Quick Reference Card

```
LIGHT BACKGROUNDS          DARK BACKGROUNDS
─────────────────         ─────────────────
text-gray-500+ OK         text-white OK
text-gray-400  RISKY      text-gray-100 OK
text-gray-300  FAIL       text-gray-200 OK
                          text-slate-300 OK
                          text-slate-400 RISKY
                          text-slate-500 FAIL
```

## File Locations

- Chat Widget: `public/chat-widget.css` (CSS variables at top)
- Global Styles: `src/app/globals.css`
- Tailwind Config: `tailwind.config.ts`

## Audit History

- **2026-01-06**: Full contrast audit completed. Fixed 22 issues in chat-widget.css, page.tsx, AdminLayoutClient.tsx, and ivr/page.tsx. Admin portal pages passed WCAG AA.
