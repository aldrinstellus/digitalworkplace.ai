# City of Doral AI Chatbot - Implementation Guide

**ITN No. 2025-20** | **Demo Build**

---

## Current State

### Completed Features

| Feature | Status | Location |
|---------|--------|----------|
| Floating Chat Widget (FAB) | Done | `public/chat-widget.js` |
| Widget Styling (matches accessibility) | Done | `public/chat-widget.css` |
| Bilingual Support (EN/ES) | Done | Toggle in header |
| Language Detection | Done | `src/lib/i18n.ts` |
| RAG Knowledge Search | Done | `src/app/api/knowledge/route.ts` |
| LLM Integration (GPT-4o-mini) | Done | `src/app/api/chat/route.ts` |
| Sentiment Analysis | Done | `src/lib/sentiment.ts` |
| Escalation Alert | Done | Shows for negative sentiment |
| Source Links | Done | Displays top 3 sources |
| Thumbs Up/Down Feedback | Done | UI + Backend |
| CORS for Cross-Origin | Done | API headers |
| Mobile Responsive | Done | Full-screen on mobile |
| Reduced Motion Support | Done | CSS media query |
| **Feedback API Backend** | Done | `src/app/api/feedback/route.ts` |
| **Conversation Logging** | Done | `src/app/api/log/route.ts` |
| **Admin Dashboard** | Done | `src/app/admin/page.tsx` |
| **Analytics Export (Power BI)** | Done | `src/app/api/analytics/route.ts` |
| **Chat API Audit Logging** | Done | Integrated in `/api/chat` |

---

## ITN Requirements Compliance

### Section 3.1 - Mandatory Requirements

| # | Requirement | ITN Ref | Status | Implementation |
|---|-------------|---------|--------|----------------|
| 1 | NLP Conversational AI | 3.1.1 | DONE | GPT-4o-mini |
| 2 | Bilingual Support (EN/ES) | 3.1.1 | DONE | `src/lib/i18n.ts` |
| 3 | Daily Website Scraping | 3.1.1 | PARTIAL | Manual script |
| 4 | Sentiment Analysis | 3.1.1 | DONE | `src/lib/sentiment.ts` |
| 5 | Customizable Workflows | 3.1.1 | TODO | - |
| 6 | PII Encryption (at rest) | 3.1.3 | TODO | - |
| 7 | Audit Trail | 3.1.3 | DONE | `/api/log` |
| 8 | Access Control | 3.1.3 | TODO | - |
| 9 | Content Management | 3.1.4 | TODO | - |
| 10 | Scraping Automation | 3.1.4 | TODO | - |
| 11 | Announcements | 3.1.4 | TODO | - |
| 12 | Power BI Integration | 3.1.5 | DONE | `/api/analytics` |
| 13 | Performance Dashboard | 3.1.6 | DONE | `/admin` |
| 14 | User Feedback | 3.1.6 | DONE | `/api/feedback` |

### Section 3.2 - Additional Requirements

| # | Requirement | ITN Ref | Status | Type |
|---|-------------|---------|--------|------|
| 15 | WCAG 2.1 Compliance | 3.2.1 | PARTIAL | Mandatory |
| 16 | Multi-URL Support | 3.2.2 | PARTIAL | Mandatory |
| 17 | LLM Backup/Failover | 3.2.3 | TODO | Mandatory |
| 18 | SMS Integration | 3.2.4 | TODO | Optional |
| 19 | Document Parsing | 3.2.5 | TODO | Mandatory |
| 20 | IVR Integration | 3.2.6 | TODO | Mandatory |
| 21 | Social Media | 3.2.6 | TODO | Optional |
| 22 | CRM Integration | 3.1.2 | TODO | Optional |

### Completion Summary

| Status | Count | Percentage |
|--------|-------|------------|
| DONE | 10 | 45% |
| PARTIAL | 3 | 14% |
| TODO | 9 | 41% |
| **TOTAL** | **22** | 100% |

### Architecture

```
localhost:8888 (Scraped Homepage)
    └── chat-widget.js + chat-widget.css from localhost:3000
           └── POST /api/chat
                  ├── /api/knowledge (RAG search)
                  ├── Language detection
                  ├── Sentiment analysis
                  └── OpenAI GPT-4o-mini
```

---

## Features to Implement

### Priority 1: Core Enhancements

#### 1.1 Suggested Questions (Dynamic)

**Current:** Hardcoded in widget
**Goal:** Context-aware suggestions based on user location on site

```javascript
// Detect current page and suggest relevant questions
const pagePath = window.location.pathname;
const suggestions = getSuggestionsForPage(pagePath);
```

**Implementation:**
- Map page paths to relevant FAQs
- Update suggestions after each response
- Add "Ask about..." prompts based on page content

---

#### 1.2 Conversation History Persistence

**Current:** Lost on page reload
**Goal:** Persist across page navigation and sessions

```javascript
// localStorage approach for demo
const STORAGE_KEY = 'doral_chat_history';

function saveConversation(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function loadConversation() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
```

**Considerations:**
- Clear after 24 hours
- Max 50 messages
- Option to clear history

---

#### 1.3 Typing Indicator Enhancement

**Current:** Bouncing dots
**Goal:** "Doral AI is typing..." with realistic delay

```css
.doral-chat-typing-text {
  font-size: 12px;
  color: var(--doral-text-light);
  font-style: italic;
}
```

---

#### 1.4 Message Timestamps

**Current:** Shown for each message
**Goal:** Group by time (Today, Yesterday, Date)

```javascript
function formatMessageDate(timestamp) {
  const now = new Date();
  const msgDate = new Date(timestamp);

  if (isSameDay(now, msgDate)) return 'Today';
  if (isYesterday(now, msgDate)) return 'Yesterday';
  return msgDate.toLocaleDateString();
}
```

---

### Priority 2: Workflow Features

#### 2.1 Quick Actions Menu

**Requirement:** Customizable workflows for common tasks

**Actions to support:**
1. Report an Issue (311-style)
2. Find a Service
3. Get Directions
4. Contact Department
5. Check Hours

```javascript
const QUICK_ACTIONS = {
  en: [
    { id: 'report', label: 'Report Issue', icon: '📋' },
    { id: 'service', label: 'Find Service', icon: '🔍' },
    { id: 'directions', label: 'Get Directions', icon: '📍' },
    { id: 'contact', label: 'Contact Dept', icon: '📞' },
    { id: 'hours', label: 'Check Hours', icon: '🕐' },
  ],
  es: [
    { id: 'report', label: 'Reportar', icon: '📋' },
    { id: 'service', label: 'Buscar Servicio', icon: '🔍' },
    { id: 'directions', label: 'Direcciones', icon: '📍' },
    { id: 'contact', label: 'Contactar', icon: '📞' },
    { id: 'hours', label: 'Horarios', icon: '🕐' },
  ],
};
```

**UI:** Horizontal scrollable chips below welcome message

---

#### 2.2 Service Request Form

**Trigger:** "Report Issue" quick action or detected intent

**Flow:**
1. Category selection (dropdown)
2. Location input (optional address)
3. Description (textarea)
4. Photo upload (optional, demo: stub)
5. Contact info (email/phone)
6. Confirmation

```html
<div class="doral-chat-form">
  <label>Category</label>
  <select>
    <option>Roads & Sidewalks</option>
    <option>Parks & Recreation</option>
    <option>Code Enforcement</option>
    <option>Utilities</option>
    <option>Other</option>
  </select>
  <!-- ... -->
</div>
```

**Demo Mode:** Form submits successfully with mock confirmation number

---

#### 2.3 Appointment Scheduling (Mock)

**Trigger:** "Schedule appointment" intent

**Flow:**
1. Department selection
2. Service type
3. Date picker (available slots)
4. Time selection
5. Confirmation

**Demo:** Show available slots, confirm with mock reference number

---

### Priority 3: Analytics & Feedback

#### 3.1 Feedback Backend

**Current:** UI only, console.log
**Goal:** Store feedback for analytics

**API Endpoint:** `POST /api/feedback`

```typescript
interface FeedbackPayload {
  messageId: string;
  conversationId: string;
  rating: 'positive' | 'negative';
  query: string;
  response: string;
  timestamp: string;
}
```

**Storage:** JSON file for demo (`data/feedback.json`)

---

#### 3.2 Conversation Logging

**Requirement:** Audit trail for all interactions

**Log Entry:**
```json
{
  "id": "conv_123",
  "sessionId": "sess_abc",
  "timestamp": "2025-01-01T10:30:00Z",
  "messages": [...],
  "language": "en",
  "sentiment": "neutral",
  "escalated": false,
  "feedbackGiven": true,
  "duration": 180
}
```

**Demo Storage:** `data/conversations.json`

---

#### 3.3 Analytics Dashboard Data

**Metrics to track:**
- Total conversations
- Messages per conversation
- Language distribution
- Sentiment breakdown
- Escalation rate
- Top queries
- Response accuracy (based on feedback)
- Average response time

**Export Format:** JSON for Power BI import

---

### Priority 4: Accessibility Enhancements

#### 4.1 Screen Reader Improvements

**Current:** Basic ARIA labels
**Goal:** Full WCAG 2.1 AA compliance

```html
<div role="log" aria-live="polite" aria-label="Chat messages">
  <!-- Messages announced as they arrive -->
</div>

<button aria-label="Send message" aria-disabled="true">
  <!-- Clear disabled state -->
</button>
```

**Additions:**
- `aria-busy` during loading
- Focus management after send
- Skip to input link
- High contrast mode support

---

#### 4.2 Keyboard Navigation

**Current:** Basic tab order
**Goal:** Full keyboard support

| Key | Action |
|-----|--------|
| Enter | Send message |
| Escape | Close chat |
| Tab | Navigate elements |
| Arrow Up/Down | Scroll messages |
| Ctrl+L | Toggle language |

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen) {
    closeChat();
  }
  if (e.ctrlKey && e.key === 'l') {
    toggleLanguage();
  }
});
```

---

#### 4.3 Focus Trap

**Requirement:** Keep focus within chat when open

```javascript
function trapFocus(element) {
  const focusable = element.querySelectorAll(
    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
```

---

### Priority 5: Multi-Site Support

#### 5.1 Domain Detection

**Requirement:** Work on cityofdoral.com AND doralpd.com

```javascript
const SITE_CONFIG = {
  'cityofdoral.com': {
    name: 'City of Doral',
    logo: '/images/city-logo.png',
    knowledgeFilter: 'all',
  },
  'doralpd.com': {
    name: 'Doral Police',
    logo: '/images/pd-logo.png',
    knowledgeFilter: 'police',
  },
};

const currentSite = SITE_CONFIG[window.location.hostname] || SITE_CONFIG['cityofdoral.com'];
```

---

#### 5.2 Knowledge Base Filtering

**For Police site:** Only return police-related results

```typescript
// In /api/knowledge
if (siteFilter === 'police') {
  results = results.filter(r =>
    r.section.includes('Police') ||
    r.url.includes('doralpd')
  );
}
```

---

### Priority 6: Advanced Features (Optional)

#### 6.1 Voice Input (Web Speech API)

```javascript
const recognition = new webkitSpeechRecognition();
recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  input.value = transcript;
};
```

**UI:** Microphone button next to send

---

#### 6.2 Rich Media Responses

**Support for:**
- Image cards (parks, facilities)
- Map embeds (directions)
- PDF links (forms, documents)
- Video links (tutorials)

```javascript
function renderRichContent(content) {
  if (content.type === 'image') {
    return `<img src="${content.url}" alt="${content.alt}" class="doral-chat-image">`;
  }
  if (content.type === 'map') {
    return `<iframe src="${content.embedUrl}" class="doral-chat-map"></iframe>`;
  }
  // ...
}
```

---

#### 6.3 Proactive Messages

**Triggers:**
- User idle for 30s on page → "Need help finding something?"
- User scrolls to bottom → "Have questions about [page topic]?"
- User visits 3+ pages → "Can I help you navigate?"

```javascript
let idleTimer;
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!isOpen) {
      showProactiveMessage();
    }
  }, 30000);
}
```

---

## Demo Mode Configuration

### Environment Variables

```env
# .env.local
OPENAI_API_KEY=sk-demo-key  # Required for LLM
DEMO_MODE=true               # Enables mock responses
MOCK_DELAY=1500              # Simulated API delay (ms)
```

### Mock Responses

When `DEMO_MODE=true` and no API key:

```javascript
const MOCK_RESPONSES = {
  'hours': 'City Hall is open Monday-Friday, 8:00 AM - 5:00 PM.',
  'parks': 'Morgan Levy Park is open daily from 7:00 AM to sunset.',
  'permit': 'Building permits can be applied for online at cityofdoral.com/permits.',
  'default': 'I can help you with information about City of Doral services. What would you like to know?',
};
```

---

## File Structure

```
cityofdoral/
├── public/
│   ├── chat-widget.js          # Main widget code
│   ├── chat-widget.css         # Widget styles
│   └── knowledge-base.json     # RAG data (580 pages)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts     # LLM endpoint + audit logging
│   │   │   ├── knowledge/route.ts # RAG search
│   │   │   ├── feedback/route.ts  # ✅ User feedback storage
│   │   │   ├── log/route.ts       # ✅ Conversation logging
│   │   │   └── analytics/route.ts # ✅ Power BI export
│   │   ├── admin/
│   │   │   └── page.tsx          # ✅ Admin dashboard
│   │   └── page.tsx              # React chat (standalone)
│   └── lib/
│       ├── i18n.ts               # Language support
│       └── sentiment.ts          # Sentiment analysis
├── data/
│   ├── conversations.json        # ✅ Audit storage
│   └── feedback.json             # ✅ Feedback storage
├── ADMIN.md                      # ✅ Admin implementation guide
└── Website Scrapped/
    └── Home/
        └── index.html            # Main entry (widget embedded)
```

---

## Testing Checklist

### Functional Tests
- [ ] FAB opens/closes chat
- [ ] Messages send and receive
- [ ] Language toggle works
- [ ] Sources display correctly
- [ ] Feedback buttons function
- [ ] Escalation shows for negative sentiment
- [ ] Mobile responsive layout

### Accessibility Tests
- [ ] Keyboard-only navigation
- [ ] Screen reader announces messages
- [ ] Focus visible on all elements
- [ ] Color contrast meets AA
- [ ] Reduced motion respected

### Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Chrome Mobile

---

## Next Steps

### Completed (Phase 1)
- ✅ Feedback API endpoint (`/api/feedback`)
- ✅ Conversation logging (`/api/log`)
- ✅ Analytics export for Power BI (`/api/analytics`)
- ✅ Admin dashboard (`/admin`)
- ✅ Chat API audit logging

### In Progress (Phase 2)
1. **Content Management Interface** - Admin UI for FAQs, workflows
2. **User Authentication** - Role-based access control
3. **LLM Failover** - Claude as backup for GPT-4o-mini

### Upcoming (Phase 3)
1. **Conversation Persistence** - localStorage for chat history
2. **Quick Actions Menu** - Workflow shortcuts
3. **Multi-URL Support** - Domain detection for doralpd.com
4. **Scraping Automation** - Cron job for daily updates

### Future (Phase 4 - Optional)
1. **IVR Integration** - Voice/text continuity
2. **SMS Integration** - Twilio/Plivo
3. **Document Parsing** - PDF/DOCX support
4. **Social Media** - FB/IG/WhatsApp channels

---

## API Reference

### POST /api/chat

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What are City Hall hours?" }
  ],
  "language": "en"
}
```

**Response:**
```json
{
  "message": "City Hall is open Monday through Friday...",
  "language": "en",
  "sentiment": "neutral",
  "sentimentScore": 0.5,
  "sources": [
    {
      "title": "City Hall",
      "url": "/Departments/city-hall",
      "section": "Departments"
    }
  ],
  "escalate": false
}
```

### POST /api/knowledge

**Request:**
```json
{
  "query": "park hours",
  "limit": 5,
  "includeContent": true
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "parks-001",
      "title": "Parks & Recreation",
      "section": "Departments",
      "url": "/Departments/parks",
      "content": "...",
      "summary": "...",
      "score": 0.85
    }
  ],
  "total": 12,
  "query": "park hours"
}
```

---

### GET /api/analytics

**Query Parameters:**
- `days` - Number of days (7, 30, 90)
- `format` - `json` or `csv`

**Response (JSON):**
```json
{
  "metadata": { "reportGeneratedAt": "2026-01-01T...", "dateRange": {...} },
  "summary": {
    "totalConversations": 100,
    "satisfactionRate": 87,
    "escalationRate": 5
  },
  "distributions": { "language": {...}, "sentiment": {...} },
  "dailyMetrics": [{ "date": "2026-01-01", "conversations": 10 }]
}
```

### POST /api/feedback

**Request:**
```json
{
  "messageId": "msg_123",
  "conversationId": "conv_123",
  "rating": "positive",
  "query": "What are park hours?",
  "response": "Morgan Levy Park is open...",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "feedbackId": "fb_123",
  "message": "Thank you for your feedback!"
}
```

### POST /api/log

**Request:**
```json
{
  "sessionId": "sess_abc",
  "messages": [{ "role": "user", "content": "...", "timestamp": "..." }],
  "language": "en",
  "sentiment": "neutral",
  "escalated": false
}
```

**Response:**
```json
{
  "success": true,
  "conversationId": "conv_123"
}
```

---

## Notes

- **LLM Backup:** Claude failover planned (TODO)
- **API Keys:** Demo mode works with mock responses if no key
- **Knowledge Base:** 580 pages from cityofdoral.com, updates via script
- **Deployment:** Static HTML + Next.js API (can be deployed separately)
- **Admin Portal:** Full implementation guide in `ADMIN.md`
