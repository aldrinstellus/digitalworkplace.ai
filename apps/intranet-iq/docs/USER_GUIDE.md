# dIQ - Intranet IQ | Comprehensive User Guide

**Version:** 0.6.5
**Last Updated:** January 21, 2026
**Application URL:** https://intranet-iq.vercel.app/diq/dashboard

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [Enterprise Search](#3-enterprise-search)
4. [AI Assistant (Chat)](#4-ai-assistant-chat)
5. [People Directory](#5-people-directory)
6. [Knowledge Base (Content)](#6-knowledge-base-content)
7. [Workflow Automation (Agents)](#7-workflow-automation-agents)
8. [Settings](#8-settings)
9. [Admin Panel](#9-admin-panel)
10. [Test Scenarios](#10-test-scenarios)

---

## 1. Getting Started

### 1.1 Accessing dIQ

| Environment | URL |
|-------------|-----|
| **Production** | https://intranet-iq.vercel.app/diq/dashboard |
| **Local Development** | http://localhost:3001/diq/dashboard |

### 1.2 Navigation

The application uses a left sidebar for navigation with the following menu items:

| Icon | Menu Item | Route | Description |
|------|-----------|-------|-------------|
| Home | Home | `/diq/dashboard` | Main dashboard with overview |
| Chat | Chat | `/diq/chat` | AI Assistant interface |
| Agents | Agents | `/diq/agents` | Workflow automation |
| People | People | `/diq/people` | Employee directory |
| Content | Content | `/diq/content` | Knowledge base management |
| Search | Search | `/diq/search` | Enterprise search |
| Settings | Settings | `/diq/settings` | User and admin settings |

**Admin-only menu items:**
- Elasticsearch (`/diq/admin/elasticsearch`)
- Analytics (`/diq/admin/analytics`)
- Permissions (`/diq/admin/permissions`)

---

## 2. Dashboard

**Route:** `/diq/dashboard`

The dashboard is your central hub for accessing all dIQ features.

### 2.1 Dashboard Components

#### Greeting Section
- Personalized greeting ("Hello there")
- Tab switcher: "For you" | "Company"
- "Customize Dashboard" button

#### Quick Search Bar
- Click the search bar to navigate to Enterprise Search
- Displays "Ask anything..." placeholder
- Shows "Fast" indicator for semantic search capability

#### Upcoming Meeting Widget
- Shows next scheduled meeting (e.g., "Weekly Team Standup")
- Displays meeting platform (Zoom), time, and attendee count
- Action buttons: "Prep for meeting" | "Join"

#### Quick Action Cards
| Card | Description | Navigates To |
|------|-------------|--------------|
| Recent Documents | View recently accessed files | `/diq/content` |
| Team Updates | See what your team is working on | `/diq/people` |
| AI Assistant | Ask questions and get answers | `/diq/chat` |

#### Company News Section
- Displays latest company news articles
- Shows title, summary, likes, and comments
- "View all" link to full news list

#### Upcoming Events Section
- Lists upcoming company events
- Shows event name, date/time, type badge (in_person/virtual), location
- "View all" link to events calendar

#### Recent Activity Feed
- Shows recent document updates, channel messages, and activities
- Displays item title, author/source, and timestamp
- Clickable items for quick access

#### Trending Topics
- Shows trending search terms in your organization
- Clickable tags that navigate to search with that query
- Examples: "AI Strategy", "Q4 Goals", "New Hires"

#### Integration Quick Links (Bottom Bar)
- Scrollable bar with connected service icons
- Google Drive, Slack, Zoom, Confluence, Jira, Salesforce, LinkedIn, GitHub, Notion, Figma

### 2.2 Dashboard Workflows

#### Workflow: Join an Upcoming Meeting
1. Locate the meeting widget at the top of the dashboard
2. Review meeting details (time, attendees)
3. Click "Prep for meeting" to review agenda (optional)
4. Click "Join" button to launch meeting

#### Workflow: Access Recent Documents
1. Click the "Recent Documents" card
2. You'll be redirected to the Content page
3. View your recently accessed files

#### Workflow: Search Trending Topic
1. Scroll to "Trending in your organization" section
2. Click any trending tag (e.g., "AI Strategy")
3. Search page opens with pre-filled query

---

## 3. Enterprise Search

**Route:** `/diq/search`

Enterprise Search provides powerful search capabilities across all company content using keyword, semantic, and hybrid search modes.

### 3.1 Search Interface

#### Search Bar
- Large text input: "Search anything..."
- "Advanced" button for filters
- "Search" button (enabled when text entered)

#### Filter Panel (Left Side)
**Content Type Filters:**
| Filter | Description |
|--------|-------------|
| All | Show all content types |
| Articles | Knowledge base articles |
| People | Employee profiles |
| Events | Company events |
| Documents | Uploaded documents |

**Department Filters:**
- Customer Success
- Data Science
- Design
- DevOps
- Engineering
- Finance
- Human Resources
- Legal
- Marketing
- Operations
- Product
- Quality Assurance
- Research
- Sales
- Security

#### Results Panel (Right Side)
- Result count display
- "Search history" button
- Individual result cards with:
  - Content type badge
  - Title
  - Summary/excerpt
  - "Summarize" button for AI summary

### 3.2 AI Summary Feature

When search returns results, an AI Summary panel appears:

```
AI Summary: Found 20 results for "company policy". Includes knowledge base articles.
[Ask AI for more details →]
```

- Provides quick overview of search results
- "Was this helpful?" feedback buttons (thumbs up/down)
- Click "Ask AI for more details" for deeper analysis

### 3.3 Search Workflows

#### Workflow: Basic Keyword Search
1. Navigate to `/diq/search`
2. Type your query in the search bar (e.g., "vacation policy")
3. Press Enter or click "Search"
4. Review results in the list
5. Click any result to view full content

**Test Scenario:**
```
Query: "company policy"
Expected: 20+ results including Employee Handbook, Corporate Card Policy, Expense Policy, Travel Policy, etc.
```

#### Workflow: Filtered Search
1. Enter search query
2. Click "Advanced" button
3. Select content type filter (e.g., "Articles")
4. Check department filters as needed
5. View filtered results

#### Workflow: Get AI Summary of Results
1. Perform a search
2. View the AI Summary at the top of results
3. Click "Ask AI for more details" for expanded analysis
4. Rate the summary using thumbs up/down

#### Workflow: Summarize Individual Result
1. Perform a search
2. Hover over any result card
3. Click "Summarize this result" button
4. View AI-generated summary of that specific item

---

## 4. AI Assistant (Chat)

**Route:** `/diq/chat`

The AI Assistant is powered by Claude 3 (Anthropic) and provides intelligent answers grounded in your organization's knowledge base.

### 4.1 Chat Interface

#### Header Section
- "AI Assistant" title with "Powered by Claude 3 (Anthropic)"
- "Company sources" dropdown - select knowledge sources
- "Show work" toggle - view AI reasoning
- "Settings" dropdown - configure chat behavior

#### Chat Area
- Welcome message: "Start a conversation"
- Conversation history (when available)

#### Input Section
- Text input: "Ask anything about your organization..."
- Supports @ mentions for people and documents
- Attachment button for file uploads
- Voice input button for speech-to-text
- Send button

#### Spaces Panel (Right Side)
- Search spaces functionality
- "Direct Messages" section
- "Favorites" section (starred spaces)
- "All Spaces" section
- Unread message counts per space

#### Chat History Panel
- Shows previous conversations
- "New chat" button to start fresh

### 4.2 Chat Features

| Feature | Description |
|---------|-------------|
| @ Mentions | Type @ to mention people or documents |
| Voice Input | Click microphone for speech-to-text |
| File Attachments | Upload files for context |
| Spaces | Organize conversations by topic/team |
| Source Citations | AI shows where answers came from |

### 4.3 Chat Workflows

#### Workflow: Ask a Question
1. Navigate to `/diq/chat`
2. Type your question in the input field
3. Press Enter or click send button
4. Review AI response with source citations

**Test Scenario:**
```
Question: "What is our vacation policy?"
Expected: AI provides answer citing Employee Handbook or PTO Policy
```

#### Workflow: Start a New Conversation
1. Click the "+" button in Chat History
2. Type your first message
3. AI responds and conversation is saved

#### Workflow: Use @ Mention
1. Type "@" in the input field
2. Select a person or document from dropdown
3. Complete your question
4. AI uses that context in its response

#### Workflow: Join a Space
1. View "All Spaces" in right panel
2. Click on a space (e.g., "Engineering", "Product")
3. View space messages and participate

---

## 5. People Directory

**Route:** `/diq/people`

The People Directory provides a searchable employee directory with 60 employees across the organization.

### 5.1 Directory Interface

#### Header Section
- "People Directory" title
- Employee count: "60 employees across the organization"
- View toggle buttons: Grid | List | Tree

#### Search and Filter
- Search input: "Search by name, title, or email..."
- Department dropdown filter

#### Employee Cards (Grid View)
Each card displays:
- Initials avatar
- Full name
- Job title
- Department badge
- Location

### 5.2 Department Filter Options

| Department | Employee Count |
|------------|---------------|
| All Departments | 60 |
| Customer Success | 5 |
| Data Science | 5 |
| Design | 3 |
| DevOps | 4 |
| Engineering | 8 |
| Finance | 4 |
| Human Resources | 5 |
| Legal | 3 |
| Marketing | 5 |
| Operations | 3 |
| Product | 5 |
| Quality Assurance | 1 |
| Research | 0 |
| Sales | 5 |
| Security | 4 |

### 5.3 People Directory Workflows

#### Workflow: Find an Employee
1. Navigate to `/diq/people`
2. Type name in search box (e.g., "Sarah")
3. View matching employees

**Test Scenario:**
```
Search: "Sarah"
Expected: Sarah Johnson (Senior Frontend Engineer) appears
```

#### Workflow: Filter by Department
1. Click department dropdown
2. Select department (e.g., "Engineering")
3. View 8 engineering employees

#### Workflow: View Employee Profile
1. Find employee in directory
2. Click on employee card
3. View full profile details

---

## 6. Knowledge Base (Content)

**Route:** `/diq/content`

The Knowledge Base provides a hierarchical tree structure for organizing and managing company documentation.

### 6.1 Content Interface

#### Header Section
- "Knowledge Base" title
- "Pending Approvals" button (for editors/admins)
- "New" button to create content

#### Search
- Search input: "Search knowledge base..."

#### Category Tree (Left Panel)
Expandable folder structure with 20+ categories:

| Category | Description |
|----------|-------------|
| General | General company information |
| Benefits | Employee benefits documentation |
| Company Policies | Corporate policies |
| Customer Success | CS team resources |
| Data & Analytics | Data team documentation |
| Engineering | Technical documentation |
| Finance | Financial procedures |
| Getting Started | Onboarding materials |
| HR Policies | Human resources policies |
| IT Support | IT help articles |
| Legal & Compliance | Legal documents |
| Marketing | Marketing resources |
| Operations | Operational procedures |
| Product | Product documentation |
| Project Management | PM resources |
| Remote Work | Remote work guidelines |
| Sales | Sales resources |
| Security | Security policies |
| Team Resources | Team-specific docs |
| Training | Training materials |
| Wellness | Wellness programs |

#### Content Panel (Right Side)
- Displays selected article/folder content
- Article editor for creating/editing

### 6.2 Content Workflows

#### Workflow: Browse Knowledge Base
1. Navigate to `/diq/content`
2. Expand category folder (click arrow)
3. Click on article to view content

#### Workflow: Search Knowledge Base
1. Type in "Search knowledge base..." field
2. View matching articles
3. Click result to open

#### Workflow: Create New Article (Editors)
1. Click "+" button in header
2. Select parent category
3. Enter article title and content
4. Click "Save" or "Submit for Approval"

#### Workflow: Review Pending Approvals (Admins)
1. Click "Pending Approvals" button
2. Review submitted articles
3. Approve or request changes

---

## 7. Workflow Automation (Agents)

**Route:** `/diq/agents`

Agents provides workflow automation with pre-built templates and custom workflow creation.

### 7.1 Agents Interface

#### Featured Agents Section
Pre-built automation agents:

| Agent | Description | Usage |
|-------|-------------|-------|
| Daily Report Generator | Automated report creation | 1,250 runs |
| Email Auto-Responder | Automated email responses | 890 runs |
| Data Sync Bot | Data synchronization | 2,100 runs |

#### Workflows Section
- Grid/List view toggle
- "New" button to create workflow
- Search workflows field
- Status filters: All | Active | Paused | Draft

#### Workflow List
Each workflow card shows:
- Icon and name
- Department/category
- Status badge (Active/Paused/Draft)
- Description
- Created date
- "Template" indicator if applicable

### 7.2 Available Workflows

| Workflow | Department | Status | Description |
|----------|------------|--------|-------------|
| PTO Request Approval | HR | Active | Automated PTO routing with calendar check |
| Employee Onboarding | HR | Active | New hire onboarding with IT setup |
| Access Request | IT | Active | Multi-level access provisioning |
| Security Incident Response | IT | Active | Security incident handling |

### 7.3 Workflow Steps (Example: PTO Request Approval)

| Step | Type | Description |
|------|------|-------------|
| 1 | Validation | Check PTO Balance |
| 2 | Condition | Check Team Coverage |
| 3 | Approval | Manager Approval |
| 4 | Integration | Update HR System |
| 5 | Action | Update Team Calendar |
| 6 | Notification | Send Confirmation |

### 7.4 Agents Workflows

#### Workflow: View Workflow Details
1. Navigate to `/diq/agents`
2. Click on any workflow card (e.g., "PTO Request Approval")
3. View workflow details panel:
   - Name, created date, trigger
   - Status and step count
   - Visual workflow steps

#### Workflow: Run a Workflow Manually
1. Select a workflow
2. Click "Run Now" button
3. Confirm execution
4. Monitor progress

#### Workflow: Create New Workflow
1. Click "New" button
2. Select template or start from scratch
3. Configure trigger conditions
4. Add workflow steps
5. Save as draft or activate

#### Workflow: Pause/Resume Workflow
1. Select active workflow
2. Click "Pause" button
3. Workflow stops processing
4. Click "Resume" to reactivate

---

## 8. Settings

**Route:** `/diq/settings`

Settings provides user and admin configuration options across 9 panels.

### 8.1 User Settings

#### Profile Settings
- **Profile Photo**: Upload/change/remove
- **Basic Information**:
  - First Name
  - Last Name
  - Email (read-only)
  - Department dropdown
  - Job Title
- "Save Changes" button

#### Notifications Settings
Configure notification preferences:

| Notification Type | Email | Push | In-App |
|-------------------|-------|------|--------|
| Content Updates | Toggle | Toggle | Toggle |
| Mentions | Toggle | Toggle | Toggle |
| Workflow Alerts | Toggle | Toggle | Toggle |
| System Announcements | Toggle | Toggle | Toggle |
| AI Responses | Toggle | Toggle | Toggle |

- Quiet Hours configuration

#### Appearance Settings
- **Theme**: Dark / Light / System
- **Language**: English (more options)
- **Timezone**: Select timezone

#### Privacy & Security Settings
- **Two-Factor Authentication**: Enable/Disable
- **Active Sessions**: View and manage
- **Profile Visibility**: Public / Private
- **Activity Status**: Show / Hide

#### Integrations Settings
Connected services management:

| Integration | Status |
|-------------|--------|
| Microsoft 365 | Connected |
| Google Workspace | Connected |
| Slack | Connected |
| Salesforce | Available |
| Jira | Available |
| GitHub | Available |

### 8.2 Admin Settings

#### User Management
- Search users
- "Invite User" button
- User list with role dropdowns
- Edit/delete user actions

#### Roles & Permissions
- View all roles
- Create custom roles
- Configure permissions per role

#### Audit Logs
- Search logs
- Filter by action type
- View log entries with:
  - Timestamp
  - User
  - Action
  - Details
- Export functionality

#### System Settings
- **Organization Name**
- **AI Configuration**: Model selection (Claude 3.5)
- **Search Configuration**: Default mode, result limits
- **Security Settings**: Session timeout, password policies

### 8.3 Settings Workflows

#### Workflow: Update Profile Information
1. Navigate to `/diq/settings`
2. Click "Profile" in sidebar
3. Update fields (name, department, title)
4. Click "Save Changes"

#### Workflow: Configure Notifications
1. Go to Settings → Notifications
2. Toggle notification types on/off
3. Set quiet hours if needed
4. Changes auto-save

#### Workflow: Change Theme
1. Go to Settings → Appearance
2. Select theme (Dark/Light/System)
3. Theme applies immediately

#### Workflow: Enable Two-Factor Authentication
1. Go to Settings → Privacy & Security
2. Click "Enable" next to 2FA
3. Follow setup instructions
4. Scan QR code with authenticator app
5. Enter verification code

---

## 9. Admin Panel

### 9.1 Elasticsearch Dashboard

**Route:** `/diq/admin/elasticsearch`

Monitor and manage search infrastructure.

#### Overview Tab
| Metric | Description | Current Value |
|--------|-------------|---------------|
| Cluster Health | Overall cluster status | Green |
| Total Documents | Indexed document count | 28,690 |
| Active Nodes | Running ES nodes | 3 |
| Active Shards | Data shards | 30 |

#### Index Overview Table
| Index | Documents | Size | Health | Status |
|-------|-----------|------|--------|--------|
| diq-content | 15,420 | 128MB | Green | Open |
| diq-articles | 3,250 | 45MB | Green | Open |
| diq-employees | 850 | 12MB | Green | Open |
| diq-events | 420 | 8MB | Yellow | Open |
| diq-documents | 8,750 | 256MB | Green | Open |

#### Node Health
For each node (es-node-1, es-node-2, es-node-3):
- IP Address
- CPU Usage %
- Memory Usage %
- Heap Usage %

#### Admin Actions
- Refresh status
- Settings configuration
- Index operations (query, reindex, delete)

### 9.2 Analytics Dashboard

**Route:** `/diq/admin/analytics`

Monitor usage patterns and content performance.

#### Key Metrics
| Metric | Value | Change |
|--------|-------|--------|
| Active Users | 2,847 | +12.5% |
| Search Queries | 15,432 | +8.3% |
| AI Conversations | 3,291 | +2.1% |
| Content Views | 45,120 | +15.7% |

#### Weekly Activity Chart
Visual representation of:
- Searches (blue)
- Views (purple)
- Chats (green)

#### Usage by Feature
| Feature | Percentage |
|---------|------------|
| Search | 45% |
| AI Chat | 28% |
| Content Browse | 18% |
| People Directory | 9% |

#### Top Search Queries
| Query | Count | Avg Results | CTR |
|-------|-------|-------------|-----|
| vacation policy | 342 | 12 | 78% |
| expense report | 289 | 8 | 85% |
| onboarding checklist | 256 | 15 | 72% |
| remote work guidelines | 234 | 6 | 91% |
| benefits enrollment | 198 | 10 | 68% |

#### Top Content
1. Employee Handbook 2026 - 1,245 views
2. Q1 Company Update - 987 views
3. Remote Work Policy - 876 views
4. Benefits Guide - 765 views
5. Tech Stack Overview - 654 views

#### AI Assistant Performance
| Metric | Value |
|--------|-------|
| Answer Accuracy | 87% |
| Avg Response Time | 1.2s |
| User Satisfaction | 92% |
| Source Citation Rate | 78% |

### 9.3 Permissions & Access Control

**Route:** `/diq/admin/permissions`

Manage roles, permissions, and user access.

#### Roles Overview
| Role | Description | User Count |
|------|-------------|------------|
| Super Admin | Full system access | 3 |
| Admin | Administrative access (no system settings) | 8 |
| Editor | Can create and edit content | 24 |
| Viewer | Read-only access | 156 |

#### Permission Categories

**Content Permissions:**
- View content
- Create content
- Edit content
- Delete content
- Publish content

**Search Permissions:**
- Basic search
- Advanced search
- Export results

**AI Chat Permissions:**
- Use AI chat
- View history
- Create spaces

**Workflows Permissions:**
- View workflows
- Create workflows
- Edit workflows
- Run workflows
- Delete workflows

**Administration Permissions:**
- Manage users
- Manage roles
- System settings
- View analytics
- Audit logs

### 9.4 Admin Workflows

#### Workflow: Check Cluster Health
1. Navigate to `/diq/admin/elasticsearch`
2. View "Cluster Health" card
3. Green = healthy, Yellow = warning, Red = critical
4. Click "Refresh" for latest status

#### Workflow: Export Analytics Report
1. Navigate to `/diq/admin/analytics`
2. Select date range dropdown
3. Click "Export" button
4. Choose format (CSV, PDF)
5. Download report

#### Workflow: Create New Role
1. Navigate to `/diq/admin/permissions`
2. Click "+" in Roles section
3. Enter role name and description
4. Configure permissions for each category
5. Save new role

#### Workflow: Modify User Role
1. Go to Permissions → Users tab
2. Search for user
3. Click user's role dropdown
4. Select new role
5. Confirm change

---

## 10. Test Scenarios

Use these scenarios to verify dIQ functionality.

### 10.1 Dashboard Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| DASH-01 | Load Dashboard | Navigate to `/diq/dashboard` | Page loads with all widgets |
| DASH-02 | Quick Search | Click search bar | Redirects to `/diq/search` |
| DASH-03 | View News | Click "View all" in Company News | Opens news list |
| DASH-04 | Trending Topic | Click any trending tag | Search opens with query |

### 10.2 Search Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| SRCH-01 | Basic Search | Search "company policy" | 20+ results returned |
| SRCH-02 | AI Summary | Perform any search | AI Summary appears at top |
| SRCH-03 | Filter by Type | Select "Articles" filter | Only articles shown |
| SRCH-04 | Department Filter | Check "Engineering" department | Results filtered by dept |
| SRCH-05 | Empty Search | Search for "xyznonexistent" | "No results" message |

### 10.3 Chat Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CHAT-01 | Load Chat | Navigate to `/diq/chat` | Chat interface loads |
| CHAT-02 | View Spaces | Check right panel | 3 spaces visible |
| CHAT-03 | New Chat | Click "+" button | New conversation starts |

### 10.4 People Directory Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| PPL-01 | Load Directory | Navigate to `/diq/people` | 60 employees displayed |
| PPL-02 | Search Employee | Search "Sarah" | Sarah Johnson appears |
| PPL-03 | Filter Department | Select "Engineering" | 8 employees shown |
| PPL-04 | View All Depts | Check dropdown options | 16 departments listed |

### 10.5 Content Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CONT-01 | Load KB | Navigate to `/diq/content` | Category tree displays |
| CONT-02 | Browse Categories | Expand "Company Policies" | Sub-items visible |
| CONT-03 | Search KB | Search "handbook" | Matching articles shown |

### 10.6 Agents Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| AGNT-01 | Load Agents | Navigate to `/diq/agents` | 3 featured agents visible |
| AGNT-02 | View Workflow | Click "PTO Request Approval" | 6 workflow steps shown |
| AGNT-03 | Filter Status | Click "Active" filter | Only active workflows |

### 10.7 Settings Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| SET-01 | Load Settings | Navigate to `/diq/settings` | Profile panel displays |
| SET-02 | Navigate Panels | Click each settings panel | All 9 panels accessible |
| SET-03 | Admin Access | Click "User Management" | Admin panel loads |

### 10.8 Admin Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| ADM-01 | ES Dashboard | Navigate to ES admin | Cluster health = Green |
| ADM-02 | Analytics | Navigate to Analytics | 4 metric cards visible |
| ADM-03 | Permissions | Navigate to Permissions | 4 roles displayed |
| ADM-04 | Index Stats | Check ES indices | 5 indices, 28,690 docs |

---

## Quick Reference

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Send search/message |
| Shift+Enter | New line in chat |
| @ | Mention person/document |
| Ctrl/Cmd+K | Global search (when implemented) |

### Support

For technical issues or feature requests:
- Contact your IT administrator
- Check the Knowledge Base for troubleshooting guides
- Use the AI Assistant for quick answers

---

*dIQ - Intranet IQ*
*Part of Digital Workplace AI Product Suite*
*Version 0.6.5 | January 2026*
