# Chat Core IQ (dCQ) - Comprehensive Demo Guide

**Version**: 1.0.2
**Last Updated**: 2026-01-22
**Product**: Chat Core IQ - AI-Powered Citizen Services Platform

---

## Table of Contents

1. [Quick Start URLs](#quick-start-urls)
2. [Homepage Demo](#1-homepage-demo)
3. [AI Chatbot Scenarios](#2-ai-chatbot-scenarios)
4. [IVR Demo](#3-ivr-demo)
5. [Admin Panel Walkthrough](#4-admin-panel-walkthrough)
6. [Feature-by-Feature Guide](#5-feature-by-feature-guide)
7. [Sample Questions by Category](#6-sample-questions-by-category)
8. [End-to-End Workflows](#7-end-to-end-workflows)

---

## Quick Start URLs

| Environment | URL |
|-------------|-----|
| **Production Homepage** | https://dcq.digitalworkplace.ai/dcq/Home/index.html |
| **Production Admin** | https://dcq.digitalworkplace.ai/dcq/admin |
| **IVR Demo** | https://dcq.digitalworkplace.ai/dcq/demo/ivr |
| **Local Homepage** | http://localhost:3002/dcq/Home/index.html |
| **Local Admin** | http://localhost:3002/dcq/admin |

---

## 1. Homepage Demo

### 1.1 Landing Page Overview

When you visit the homepage, you'll see three main components:

| Component | Location | Description |
|-----------|----------|-------------|
| **Announcements Banner** | Top of page | Rotating announcements with navigation arrows |
| **AI Chatbot** | Right side | Multi-language chat interface (EN/ES/HT) |
| **FAQ Widget** | Below chat | Expandable FAQ accordion |

### 1.2 Demo Script: First-Time User Experience

**Step 1: Observe the Announcements**
- Notice the banner at the top showing current announcements
- Click the left/right arrows to navigate between announcements
- Close individual announcements with the X button

**Step 2: Explore the FAQ Widget**
- Scroll down to see the FAQ accordion
- Click any question to expand the answer
- Use the search box to filter FAQs
- Notice multi-language support (EN/ES/HT tabs)

**Step 3: Start a Chat Conversation**
- Click on the chatbot widget to open
- Select your preferred language (English, Spanish, or Haitian Creole)
- Type a question or select from suggested prompts
- Observe the AI response with source citations

---

## 2. AI Chatbot Scenarios

### 2.1 Language Selection Demo

**English Demo:**
```
User: "What are your office hours?"
Bot: "Our office hours are Monday-Friday 8:00 AM to 5:00 PM. We are closed on weekends and federal holidays."
[Sources: Office Information - knowledge base]
```

**Spanish Demo:**
```
User: "¿Cuáles son sus horarios de oficina?"
Bot: "Nuestro horario de oficina es de lunes a viernes de 8:00 AM a 5:00 PM. Estamos cerrados los fines de semana y días festivos federales."
```

**Haitian Creole Demo:**
```
User: "Ki lè biwo ou ouvè?"
Bot: "Biwo nou ouvri Lendi-Vandredi 8:00 AM a 5:00 PM. Nou fèmen nan wikenn ak jou ferye federal."
```

### 2.2 Information Inquiry Scenarios

#### Scenario A: Building Permits
```
User: "How do I apply for a building permit?"
Expected Response: Step-by-step process including:
- Required documents
- Application forms
- Fee information
- Processing timeline
- Online submission options
```

#### Scenario B: Business License
```
User: "I want to start a new business. What licenses do I need?"
Expected Response: Information about:
- Business license types
- Registration requirements
- Zoning compliance
- Home-based business rules
- Fee schedule
```

#### Scenario C: Utility Services
```
User: "How do I set up water service for my new home?"
Expected Response: Details on:
- New account setup
- Required documentation
- Deposit requirements
- Service activation timeline
```

#### Scenario D: Payment Questions
```
User: "Can I pay my property taxes online?"
Expected Response: Information about:
- Online payment portal
- Accepted payment methods
- Payment deadlines
- Installment options
```

### 2.3 Escalation Scenarios

When the chatbot cannot answer a question:

```
User: "I have a complaint about my neighbor's fence"
Bot: "I understand you have a concern about a neighbor's fence. This may require human assistance. Would you like me to:
1. Connect you with Code Enforcement
2. Provide the phone number for our call center
3. Create a service request ticket"
```

### 2.4 Feedback Flow

After each response:
1. User sees thumbs up/down buttons
2. Clicking thumbs down shows feedback form
3. Options: "Not Helpful", "Inaccurate", "Need Human Help"
4. Feedback is logged for quality improvement

---

## 3. IVR Demo

### 3.1 Accessing the IVR Demo

**URL**: https://dcq.digitalworkplace.ai/dcq/demo/ivr

### 3.2 IVR Demo Walkthrough

**Initial Screen:**
- Phone interface simulation
- Keypad (0-9, *, #)
- Language selection at top (EN/ES/HT)

**Demo Flow:**

1. **Welcome Message** (plays automatically)
   - "Welcome to City Services. For English, press 1. Para español, oprima 2. Pou Kreyòl, peze 3."

2. **Main Menu (English):**
   - Press 1: Building & Permits
   - Press 2: Business Services
   - Press 3: Utility Services
   - Press 4: Payments
   - Press 5: General Information
   - Press 0: Speak with Representative

3. **Sub-Menu Example (Press 1 - Building & Permits):**
   - Press 1: Permit Status
   - Press 2: New Permit Application
   - Press 3: Inspection Scheduling
   - Press 4: Permit Fees
   - Press *: Return to Main Menu

### 3.3 IVR Demo Features

| Feature | How to Test |
|---------|-------------|
| **Keypad Input** | Click any number, observe visual feedback |
| **Voice Prompts** | Listen to text-to-speech responses |
| **Language Switch** | Click EN/ES/HT tabs at top |
| **Transfer Code** | Complete a flow to receive unique code (e.g., EYJJIJ) |
| **Menu Navigation** | Press * to go back, # to repeat |
| **Call End** | Red phone button to end simulation |

### 3.4 Sample IVR Scenarios

**Scenario 1: Check Permit Status**
```
1 → (Building & Permits)
1 → (Permit Status)
Enter permit number: 12345#
"Your permit BP-12345 is currently APPROVED. Inspection scheduled for January 25, 2026."
```

**Scenario 2: Transfer to Representative**
```
0 → (Speak with Representative)
"Please hold while we connect you. Your reference code is: XYZABC"
[Transfer code displayed for reference]
```

---

## 4. Admin Panel Walkthrough

### 4.1 Admin Dashboard (`/dcq/admin`)

**KPI Overview Cards:**
| Card | Metric | Description |
|------|--------|-------------|
| Total Conversations | 1,234 | All-time chat sessions |
| Resolved Today | 89% | Questions answered without escalation |
| Pending | 12 | Awaiting response or follow-up |
| Avg Wait Time | 2.3s | Response time |

**Dashboard Sections:**

1. **Active Now Widget**
   - Current live sessions
   - Queue depth
   - Longest wait time

2. **Channel Health (6 channels)**
   - Web Chat: ✅ Online
   - IVR: ✅ Online
   - SMS: ✅ Online
   - Facebook: ✅ Online
   - Instagram: ✅ Online
   - WhatsApp: ✅ Online

3. **Response Time Distribution (Pie Chart)**
   - Under 5s: 65%
   - 5-15s: 25%
   - Over 15s: 10%

4. **Today vs Yesterday Comparison**
   - Conversations: +12%
   - Resolution Rate: +5%
   - Avg Duration: -8%
   - Escalations: -15%

**Actions:**
- Export button (JSON/CSV)
- Refresh button
- Quick links to Escalations and Audit Logs

### 4.2 Analytics (`/dcq/admin/analytics`)

**Date Range Filters:**
- 7 days | 30 days | 90 days | Custom

**Available Charts:**

1. **Conversation Trend** - Area chart showing daily volume
2. **Peak Hours Heatmap** - 7 days × 8 time slots showing busy periods
3. **Language Distribution** - Pie chart (EN 70%, ES 25%, HT 5%)
4. **Sentiment Analysis** - Positive/Neutral/Negative breakdown
5. **Top Categories** - Bar chart of most common topics
6. **Channel Performance** - Satisfaction % by channel
7. **Resolution Time** - Distribution buckets
8. **Top Questions** - Most frequently asked questions

**Export Options:**
- Power BI compatible JSON export
- CSV download

### 4.3 Workflows (`/dcq/admin/workflows`)

**Workflow Types:**

| Workflow | Status | Description |
|----------|--------|-------------|
| Appointments | Active | Schedule building permit appointments |
| Service Requests | Active | Process citizen service tickets |
| FAQ Actions | Active | Automate FAQ-triggered actions |

**Appointments Sub-page:**

Configure appointment types:
- Building Permit Review (30 min, max 4/slot)
- Business License Consultation (45 min, max 2/slot)
- Code Compliance Meeting (60 min, max 1/slot)
- Zoning Review (45 min, max 2/slot)

**Settings per Appointment:**
- Duration (minutes)
- Max per time slot
- Lead time (hours)
- Available days
- Time slots

### 4.4 Content Management (`/dcq/admin/content`)

**Four Content Tabs:**

1. **Knowledge Base**
   - 348 knowledge items
   - Category filter (8 categories)
   - Search functionality
   - Bulk edit/delete

2. **Custom FAQs**
   - 7 FAQs with 100% embedding coverage
   - CRUD operations
   - Priority and status settings
   - Language variants

3. **Documents**
   - Upload PDFs, Word docs
   - Auto-indexing for search
   - Category assignment

4. **Web Crawler**
   - Configure crawl sources
   - Schedule frequency
   - Indexing status

**Content Filters:**
- Category (8 options)
- Status (Active, Draft, Archived)
- Priority (High, Medium, Low)
- Language (EN, ES, HT)

### 4.5 Escalations (`/dcq/admin/escalations`)

**Statistics:**
- Total Escalations
- Pending
- In Progress
- Resolved

**Escalation Card Details:**
- Citizen name and contact
- Escalation reason
- Original chat transcript
- Assigned agent
- Status badges
- Action buttons (Assign, Resolve, Archive)

**Filters:**
- Status: All | Pending | In Progress | Resolved | Closed
- Search by name, contact, reason

### 4.6 Notifications (`/dcq/admin/notifications`)

**Filter Tabs:**
- All notifications
- Unread
- System alerts
- Activity updates
- Scheduled reminders

**Notification Actions:**
- Mark as read
- Archive
- Configure preferences

### 4.7 Announcements (`/dcq/admin/announcements`)

**Management Features:**

| Action | Description |
|--------|-------------|
| Create | New announcement with title, body, priority |
| Edit | Modify existing announcement |
| Deactivate | Hide from public without deleting |
| Delete | Permanently remove |
| Reorder | Drag and drop priority |

**Announcement Fields:**
- Title (EN/ES/HT)
- Body content (rich text)
- Priority (High, Normal, Low)
- Start/End dates
- Target audience

**Banner Settings:**
- Auto-rotation (on/off)
- Rotation interval (seconds)
- Navigation arrows (show/hide)
- Close button (enable/disable)

### 4.8 Audit Logs (`/dcq/admin/audit-logs`)

**Log Entry Fields:**
- Timestamp
- Admin name
- Action type
- Resource affected
- Location/IP

**Action Type Filters:**
- Create
- Read
- Update
- Delete
- Login
- Export
- Settings Change

**Date Filters:**
- Last 24 hours
- Last 7 days
- Last 30 days
- Last 90 days
- Custom range

**Security Notice:**
- 90-day retention policy displayed
- Export CSV available for compliance

### 4.9 Settings (`/dcq/admin/settings`)

**Five Settings Tabs:**

#### Profile Tab
- Avatar with initials
- Name, email, phone
- Password change (current, new, confirm)
- Two-factor authentication toggle
- Session timeout setting

#### Team Tab
| Member | Role | Status |
|--------|------|--------|
| Admin User | Admin | Active |
| Editor 1 | Editor | Active |
| Editor 2 | Editor | Inactive |
| Viewer 1 | Viewer | Active |
| Viewer 2 | Viewer | Active |

- Invite new member
- Change roles
- Remove access

#### Permissions Tab
- Three roles: Admin, Editor, Viewer
- Permission matrix (7 resources × 4 actions)
- CRUD toggles per role/resource
- Reset to defaults

#### Integrations Tab (19+ integrations)

| Category | Integrations |
|----------|--------------|
| **CRM** | Salesforce, Microsoft Dynamics 365 |
| **SharePoint** | 3 site connections |
| **IVR** | Twilio, Vonage, Amazon Connect |
| **SMS** | Twilio, MessageBird, Vonage |
| **Social** | Facebook Messenger, WhatsApp Business, Instagram DM |
| **Tyler Technologies** | Permitting, 311, Assets, Parks, Munis, Payments, Cashiering, Public Safety, Civic Portal, Content Manager, Records, Data & Insights |

Each integration shows:
- Connection status (Connected/Disconnected)
- Last sync timestamp
- Configure button
- Test connection button

#### Chatbot Tab (8 sub-tabs)
- General settings
- Welcome messages (EN/ES/HT)
- Primary LLM: Claude claude-sonnet-4-20250514
- Backup LLM: GPT-4o-mini
- Temperature: 0.7
- Max tokens: 1024
- Response length
- Personality settings

---

## 5. Feature-by-Feature Guide

### 5.1 Multi-Language Support

**Supported Languages:**
| Code | Language | Coverage |
|------|----------|----------|
| EN | English | 100% |
| ES | Spanish | 100% |
| HT | Haitian Creole | 100% |

**Language Detection:**
- Auto-detect from browser
- Manual selection available
- Persists across sessions

### 5.2 Semantic Search

**How It Works:**
1. User types question
2. Question converted to vector embedding
3. pgvector finds semantically similar knowledge items
4. Top results sent to Claude/GPT for response generation
5. Sources displayed with response

**Coverage:**
- 348 knowledge items indexed
- 100% embedding coverage
- Real-time search < 200ms

### 5.3 AI Response Generation

**Primary LLM:** Claude claude-sonnet-4-20250514
**Failover LLM:** GPT-4o-mini

**Response Features:**
- Context-aware answers
- Source citations
- Follow-up suggestions
- Escalation detection

### 5.4 Feedback System

**Feedback Flow:**
1. User receives response
2. Thumbs up/down displayed
3. Negative feedback triggers form
4. Form options: Not Helpful, Inaccurate, Need Human
5. Feedback logged with conversation ID
6. Admins review in Analytics

### 5.5 Export Capabilities

| Export Type | Format | Available From |
|-------------|--------|----------------|
| Dashboard Data | JSON, CSV | Dashboard page |
| Analytics | JSON (Power BI) | Analytics page |
| Audit Logs | CSV | Audit Logs page |
| Conversations | JSON | (Future feature) |

---

## 6. Sample Questions by Category

### 6.1 Building & Permits

```
"How do I apply for a building permit?"
"What is the status of my permit application?"
"How long does permit approval take?"
"What documents do I need for a renovation permit?"
"Can I schedule a building inspection online?"
"What are the permit fees for a new construction?"
"Do I need a permit for a fence?"
"How do I get a demolition permit?"
```

### 6.2 Business Services

```
"How do I register a new business?"
"What licenses do I need to open a restaurant?"
"How do I renew my business license?"
"Can I operate a business from my home?"
"What are the zoning requirements for a retail store?"
"How do I apply for a vendor permit?"
"What is the cost of a business license?"
"How do I change my business address?"
```

### 6.3 Utility Services

```
"How do I start water service?"
"Can I pay my water bill online?"
"How do I report a water main break?"
"What are the rates for water service?"
"How do I request a meter reading?"
"Can I set up automatic payments?"
"How do I stop service when I move?"
"What is the process for new construction water hookup?"
```

### 6.4 Payments & Taxes

```
"Can I pay my property taxes online?"
"When are property taxes due?"
"How do I get a copy of my tax bill?"
"What payment methods do you accept?"
"Is there a payment plan for taxes?"
"How do I appeal my property assessment?"
"Where can I pay in person?"
"Do you accept credit cards?"
```

### 6.5 General Information

```
"What are your office hours?"
"Where is the main office located?"
"How do I contact customer service?"
"Is there parking available?"
"Can I make an appointment?"
"What holidays are you closed?"
"How do I file a complaint?"
"Do you have wheelchair accessibility?"
```

### 6.6 Code Enforcement

```
"How do I report a code violation?"
"What constitutes a property violation?"
"How do I appeal a code violation notice?"
"What are the fines for code violations?"
"How do I check if my property is in compliance?"
"Can I report a violation anonymously?"
"What is the timeline for violation resolution?"
"Who do I contact about a noise complaint?"
```

---

## 7. End-to-End Workflows

### 7.1 Citizen Journey: Applying for a Building Permit

**Step 1: Initial Inquiry (Chatbot)**
```
Citizen: "I want to build an addition to my house. Where do I start?"
Bot: "Great! To build an addition, you'll need a Building Permit. Here's the process:
1. Submit application form
2. Include architectural drawings
3. Pay permit fee ($150-$500 based on value)
4. Wait for plan review (5-10 business days)
5. Schedule inspection after approval

Would you like me to:
A) Provide the application form link
B) Explain required documents
C) Help schedule a consultation"
```

**Step 2: Follow-up Questions**
```
Citizen: "What documents do I need?"
Bot: "For a residential addition permit, you'll need:
- Site plan showing property boundaries
- Floor plans with dimensions
- Structural drawings (if applicable)
- Energy compliance forms
- Contractor license (if using contractor)
- Property survey (for setback verification)

[Source: Building Permit Requirements - Knowledge Base]"
```

**Step 3: Appointment Scheduling**
```
Citizen: "Can I schedule a consultation?"
Bot: "I can help you schedule a Building Permit Consultation. Available slots:
- Monday 1/23: 10:00 AM, 2:00 PM
- Tuesday 1/24: 9:00 AM, 11:00 AM, 3:00 PM
- Wednesday 1/25: 10:00 AM, 2:00 PM

Which time works best for you?"
```

**Step 4: IVR Follow-up**
```
Citizen calls 311 → Press 1 (Building & Permits) → Press 3 (Inspection Scheduling)
"Enter your permit number followed by pound..."
"Your inspection for permit BP-2024-123 is scheduled for January 25 at 10:00 AM."
```

### 7.2 Admin Workflow: Managing Knowledge Base

**Step 1: Identify Gap**
- Review Analytics → Top Questions
- Notice "Solar panel permits" trending but low resolution rate

**Step 2: Create Content**
- Go to Content → Knowledge Base
- Click "Add Item"
- Fill in:
  - Title: "Solar Panel Permit Requirements"
  - Category: Building & Permits
  - Content: Detailed requirements
  - Languages: EN, ES, HT
- Save → Auto-generates embedding

**Step 3: Verify**
- Test in chatbot: "How do I get a solar panel permit?"
- Confirm accurate response with new source

**Step 4: Monitor**
- Check Analytics after 24 hours
- Verify resolution rate improved

### 7.3 Admin Workflow: Handling Escalations

**Step 1: Review Escalation**
- Dashboard shows "2 Pending Escalations"
- Click to view Escalations page
- Select escalation: "Citizen upset about permit denial"

**Step 2: Review Context**
- Read original chat transcript
- Note: Citizen asked about permit, got info, but wanted appeal process
- Bot couldn't provide specific appeal procedures

**Step 3: Take Action**
- Click "Assign to Agent"
- Select: Building Department supervisor
- Add note: "Citizen needs appeal process guidance"
- Status: In Progress

**Step 4: Follow-up**
- Agent contacts citizen
- Resolves issue
- Updates status: Resolved
- Adds resolution note

**Step 5: Improve**
- Add "permit appeal process" to Knowledge Base
- Future inquiries handled automatically

### 7.4 Multi-Channel Journey

**Scenario:** Citizen starts on web, continues on phone

**Web Chat (10:00 AM):**
```
Citizen: "I need to report a pothole on Main Street"
Bot: "I can help you report a pothole. I'll need:
- Exact location (address or cross streets)
- Size estimate (small, medium, large)
- Any safety concerns

What is the location?"

Citizen: "Corner of Main and 5th Street, it's pretty large"
Bot: "Thank you! I've created Service Request #SR-2024-456 for:
- Location: Main St & 5th St intersection
- Issue: Large pothole
- Priority: High (traffic intersection)

Estimated repair: 2-3 business days
Reference number: SR-2024-456

Would you like text updates on this request?"
```

**Phone IVR (2:00 PM):**
```
Citizen calls → Press 5 (General Information) → Press 2 (Service Request Status)
"Please enter your service request number followed by pound: 2024456#"
"Service Request SR-2024-456 for pothole repair at Main and 5th Street is currently IN PROGRESS. A repair crew has been dispatched. Estimated completion: today by 5:00 PM."
```

### 7.5 Announcement Management Workflow

**Step 1: Create Emergency Announcement**
- Admin → Announcements → Create New
- Title: "Water Main Break - North District"
- Body: "Emergency water main repair in progress. North District residents may experience low pressure. Estimated restoration: 6:00 PM today."
- Priority: High
- Languages: EN, ES, HT
- Activate immediately

**Step 2: Configure Banner**
- Banner Settings → Enable auto-rotation OFF (emergency static)
- Set as first position

**Step 3: Monitor**
- Dashboard shows announcement views
- Chatbot includes announcement context

**Step 4: Update**
- Service restored
- Edit announcement: "RESOLVED - Water service restored..."
- Change priority: Normal
- Schedule deactivation: tomorrow 8:00 AM

---

## Appendix: Quick Reference Cards

### Chatbot Commands
| Action | How |
|--------|-----|
| Change language | Click language button (EN/ES/HT) |
| Start new chat | Click "New Conversation" |
| Give feedback | Click thumbs up/down |
| Request human | Say "talk to someone" |

### IVR Navigation
| Key | Action |
|-----|--------|
| 1-9 | Menu selection |
| 0 | Speak to representative |
| * | Go back |
| # | Repeat/Confirm |
| Red phone | End call |

### Admin Shortcuts
| Page | URL Path |
|------|----------|
| Dashboard | /dcq/admin |
| Analytics | /dcq/admin/analytics |
| Workflows | /dcq/admin/workflows |
| Content | /dcq/admin/content |
| Escalations | /dcq/admin/escalations |
| Notifications | /dcq/admin/notifications |
| Announcements | /dcq/admin/announcements |
| Audit Logs | /dcq/admin/audit-logs |
| Settings | /dcq/admin/settings |

---

*Chat Core IQ Demo Guide v1.0.2*
*Last Updated: 2026-01-22*
*Part of Digital Workplace AI Product Suite*
