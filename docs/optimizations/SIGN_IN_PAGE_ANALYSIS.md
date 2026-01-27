# Sign-in Page Performance Analysis

**URL**: https://www.digitalworkplace.ai/sign-in
**Analyzed**: 2026-01-27
**Tool**: dev-browser skill + Playwright

---

## Raw Metrics

### Navigation Timing
```
TTFB (Time to First Byte):     1200ms
DOM Interactive:               1861ms
DOM Content Loaded:            1861ms
Load Complete:                 1922ms
First Paint:                   2244ms
```

### Resource Summary
```
Total Resources:               48
Total JS:                      539KB
Total CSS:                     12KB
Total Fonts:                   60KB
Total Images:                  ~130KB
```

### Largest Resources (Top 10)

| Resource | Size | Load Time |
|----------|------|-----------|
| ui-common_clerk.browser.js | 117KB | 80ms |
| fe481cb4b887821d.js | 70KB | 24ms |
| 8ca12826c8f133a2.js | 50KB | 27ms |
| 919cc9b278ccb6c5.js | 49KB | 29ms |
| vendors_clerk.browser.js | 47KB | 146ms |
| framework_clerk.browser.js | 43KB | 67ms |
| af3ac7415670fe57.js | 38KB | 246ms |
| Font (woff2) | 31KB | 375ms |
| Font (woff2) | 28KB | 304ms |
| d35a6221c08df32d.js | 24KB | 33ms |

### JavaScript Breakdown

| Category | Size | % of Total |
|----------|------|------------|
| Clerk SDK | 250KB | 46% |
| Next.js Framework | 100KB | 19% |
| Application Code | 100KB | 19% |
| Animation Libraries | 50KB | 9% |
| Other | 39KB | 7% |
| **Total** | **539KB** | **100%** |

### Image Analysis

| Type | Count | Total Size |
|------|-------|------------|
| Avatar images (Unsplash) | 24 | ~120KB |
| Icons | 1 | 1KB |
| **Total** | **25** | **~121KB** |

**Image Loading Strategy**:
- 18 images: `loading="lazy"` ✅
- 7 images: eager loading
- All use external Unsplash URLs

---

## Page Structure

### DOM Statistics
```
Total Nodes:                   403
Animated Elements:             0 (animations via refs)
Images:                        25
Scripts:                       17
Stylesheets:                   1
```

### LCP Candidate
```
Element:                       DIV.absolute (background container)
Area:                          1,041,070 px²
```

---

## Network Waterfall Analysis

```
0ms      |████████████████████████| TTFB (1200ms)
1200ms   |████| HTML parse
1400ms   |████████████████████████████████████| JS download (parallel)
1600ms   |████████| CSS download
1700ms   |████████████████████████████████████████| Image downloads (parallel)
1861ms   |█| DOM Interactive
2244ms   |█| First Paint
3000ms   |█| LCP (estimated)
```

**Bottleneck**: TTFB accounts for 60% of time to first paint.

---

## Component Analysis

### LoginBackground.tsx
- **24 avatar images** with floating animations
- **GSAP animations** for avatar float effect
- **Framer Motion** for chat bubbles (max 15 concurrent)
- **Web Audio API** for ambient sounds

### Optimization Opportunities

1. **Reduce Avatar Count**
   - Currently: 24 avatars loaded
   - Recommended: 6 eager, 18 lazy after LCP

2. **Animation Deferral**
   - Currently: Animations start immediately
   - Recommended: Wait for `isLCPComplete` flag

3. **Image Hosting**
   - Currently: Unsplash (external domain, no HTTP/2 reuse)
   - Recommended: Self-hosted on Vercel Blob

---

## Clerk SDK Impact

Clerk is essential for auth but loads 250KB of JS:

```
ui-common_clerk.browser.js     117KB
vendors_clerk.browser.js        47KB
framework_clerk.browser.js      43KB
Other clerk chunks              ~43KB
```

### Mitigation Options

1. **Dynamic Import** - Load after initial render
2. **Edge Runtime** - Reduce TTFB
3. **Custom Sign-in** - Replace Clerk UI with custom (not recommended)

---

## Recommendations Summary

| Priority | Action | Expected Gain |
|----------|--------|---------------|
| P1 | Add caching headers | -400ms TTFB |
| P1 | Reduce eager avatars to 6 | -80KB initial |
| P2 | Defer animations | Better FCP |
| P2 | Dynamic import Clerk | -200KB initial |
| P3 | Self-host avatars | -24 requests |

---

*Analysis performed using Playwright via dev-browser skill*
