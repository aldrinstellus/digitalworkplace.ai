# dIQ - Intranet IQ | Demo Guide

**Version:** 1.1.1
**Production URL:** https://intranet-iq.vercel.app/diq/dashboard
**Last Updated:** January 22, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Dashboard](#1-dashboard)
3. [AI Assistant (Chat)](#2-ai-assistant-chat)
4. [Enterprise Search](#3-enterprise-search)
5. [People Directory](#4-people-directory)
6. [Knowledge Base (Content)](#5-knowledge-base-content)
7. [Workflow Automation (Agents)](#6-workflow-automation-agents)
8. [News Feed](#7-news-feed)
9. [Events Calendar](#8-events-calendar)
10. [Channels](#9-channels)
11. [Notifications](#10-notifications)
12. [My Day (Productivity)](#11-my-day-productivity)
13. [Settings](#12-settings)
14. [Admin Features](#13-admin-features)
15. [Sample Demo Script](#sample-demo-script)

---

## Overview

dIQ (Intranet IQ) is an AI-powered internal knowledge network designed for enterprise organizations. It combines traditional intranet features with modern AI capabilities to help employees find information, collaborate, and automate workflows.

### Key Capabilities
- **AI-Powered Search**: Semantic search across 28,000+ documents
- **Intelligent Assistant**: Claude-powered chatbot with RAG and function calling
- **Knowledge Management**: 212 articles across 20 department categories
- **Workflow Automation**: 31 pre-built workflow templates
- **Employee Experience**: Notifications, reactions, polls, recognition
- **Productivity Tools**: Task management, daily briefings

### User Roles
| Role | Access Level |
|------|--------------|
| **Super Admin** | Full system access, user management, analytics |
| **Admin** | Department-level management, content approval |
| **Editor** | Create/edit content, manage workflows |
| **Viewer** | Read-only access to content and search |

---

## 1. Dashboard

**URL:** `/diq/dashboard`

The central hub displaying personalized information at a glance.

### Features
- Recent news posts
- Upcoming events
- Activity feed
- Quick stats (articles, employees, workflows)
- Trending topics
- Quick actions

### Demo Scenarios

#### Scenario 1.1: First-Time User Experience
> "I just joined the company. What should I see on my first day?"

**Demo Steps:**
1. Navigate to Dashboard
2. Point out the welcome message with user's name
3. Show recent company news
4. Highlight upcoming events (onboarding sessions)
5. Demonstrate quick actions for common tasks

#### Scenario 1.2: Daily Check-In
> "I want to quickly see what's happening today."

**Demo Steps:**
1. Review today's events in the sidebar
2. Check recent announcements
3. View activity feed for team updates
4. Click trending topics to explore popular searches

#### Scenario 1.3: Executive Overview
> "As a manager, I need a quick pulse on company activity."

**Demo Steps:**
1. Show stats cards (total articles, active users)
2. Demonstrate drill-down on metrics
3. Review department-specific news
4. Check workflow execution status

---

## 2. AI Assistant (Chat)

**URL:** `/diq/chat`

Intelligent conversational AI powered by Claude with access to company knowledge.

### Features
- Natural language queries
- Streaming responses (real-time typing)
- Vector-based RAG (Retrieval Augmented Generation)
- Function calling (search, employee lookup, workflow triggers)
- Conversation history
- File upload and processing (PDF, text, markdown)

### Demo Scenarios

#### Scenario 2.1: Knowledge Query
> "What is our company's vacation policy?"

**Demo Steps:**
1. Open Chat page
2. Type: "What is our vacation policy?"
3. Watch streaming response
4. Note the source citations from KB articles
5. Ask follow-up: "How do I request time off?"

#### Scenario 2.2: Employee Lookup
> "Who is the head of Engineering?"

**Demo Steps:**
1. Ask: "Who leads the Engineering department?"
2. AI uses function calling to search employee directory
3. Returns employee card with contact info
4. Follow-up: "What's their email?"

#### Scenario 2.3: Process Guidance
> "How do I submit an expense report?"

**Demo Steps:**
1. Ask: "How do I submit expenses?"
2. AI retrieves relevant KB article
3. Provides step-by-step instructions
4. Offers to trigger the expense workflow

#### Scenario 2.4: Document Analysis
> "Can you summarize this PDF?"

**Demo Steps:**
1. Click upload button
2. Select a PDF document
3. Ask: "Summarize the key points"
4. AI processes and provides summary

#### Scenario 2.5: Multi-Turn Conversation
> "I need help planning an event."

**Demo Steps:**
1. Start: "I want to plan a team building event"
2. AI asks clarifying questions
3. Continue conversation with details
4. AI provides recommendations and next steps
5. Show conversation history maintained

### Sample Questions to Ask

| Category | Sample Questions |
|----------|------------------|
| **HR/Policy** | "What's the remote work policy?" |
| | "How many sick days do I have?" |
| | "What are the company holidays?" |
| **IT/Technical** | "How do I reset my password?" |
| | "What software is approved for use?" |
| | "How do I connect to VPN?" |
| **Company Info** | "What are our core values?" |
| | "Who founded the company?" |
| | "What's our mission statement?" |
| **Processes** | "How do I onboard a new hire?" |
| | "What's the procurement process?" |
| | "How do I request equipment?" |

---

## 3. Enterprise Search

**URL:** `/diq/search`

Powerful search across all company knowledge sources.

### Features
- Keyword search (Elasticsearch)
- Semantic search (vector embeddings)
- Federated search (external connectors)
- AI-generated summaries
- Faceted filtering (department, date, type)
- Search suggestions and autocomplete

### Demo Scenarios

#### Scenario 3.1: Basic Keyword Search
> "Find all documents about 'security compliance'"

**Demo Steps:**
1. Type "security compliance" in search bar
2. Show instant results
3. Highlight relevance scoring
4. Filter by department (IT, Legal)

#### Scenario 3.2: Semantic Search
> "Find information about taking time off when sick"

**Demo Steps:**
1. Search: "taking time off when sick"
2. Note: returns "Sick Leave Policy" even though exact words don't match
3. Explain semantic understanding
4. Show AI summary of results

#### Scenario 3.3: Federated Search
> "Search across SharePoint and Confluence"

**Demo Steps:**
1. Toggle "Include external sources"
2. Search for a topic
3. Show results from multiple connectors
4. Click through to external source

#### Scenario 3.4: Advanced Filtering
> "Find HR policies updated in the last month"

**Demo Steps:**
1. Search "policy"
2. Apply filter: Department = HR
3. Apply filter: Updated = Last 30 days
4. Sort by date
5. Export results

#### Scenario 3.5: Zero-Results Recovery
> "What if I search for something that doesn't exist?"

**Demo Steps:**
1. Search for obscure term
2. Show "No results found" message
3. Demonstrate suggestions for similar terms
4. Show "Ask AI Assistant" option

---

## 4. People Directory

**URL:** `/diq/people`

Complete employee directory with org chart visualization.

### Features
- Grid, list, and tree views
- Search by name, department, title
- Org chart visualization
- Employee profiles with contact info
- Department filtering
- 60 employees across 15 departments

### Demo Scenarios

#### Scenario 4.1: Find a Colleague
> "I need to find someone in Marketing."

**Demo Steps:**
1. Navigate to People page
2. Filter by Department: Marketing
3. Browse employee cards
4. Click on a profile for details

#### Scenario 4.2: Org Chart Navigation
> "Show me the reporting structure for Engineering."

**Demo Steps:**
1. Switch to Tree View
2. Expand Engineering department
3. Show manager → direct reports hierarchy
4. Click on nodes to view profiles

#### Scenario 4.3: Contact Lookup
> "I need to email the Finance Director."

**Demo Steps:**
1. Search: "Finance Director"
2. View profile
3. Click email to open mail client
4. Show phone number and location

#### Scenario 4.4: New Employee Discovery
> "Who joined the company recently?"

**Demo Steps:**
1. Sort by "Hire Date" (newest first)
2. View recent hires
3. Filter by department if needed
4. Show welcome/introduction feature

---

## 5. Knowledge Base (Content)

**URL:** `/diq/content`

Centralized repository of company knowledge organized by department.

### Features
- 212 articles across 20 categories
- Tree navigation by category
- Full-text search within KB
- Version history
- Article status (draft, published, archived)
- Rich text editor

### Demo Scenarios

#### Scenario 5.1: Browse by Category
> "I want to explore IT documentation."

**Demo Steps:**
1. Navigate to Content page
2. Expand IT category in tree
3. Show subcategories (Security, Hardware, Software)
4. Click on an article to view

#### Scenario 5.2: Create New Article
> "I need to document a new process."

**Demo Steps:**
1. Click "New Article" button
2. Select category
3. Enter title and content
4. Use rich text editor features
5. Save as draft
6. Publish when ready

#### Scenario 5.3: Search Within KB
> "Find all articles about 'onboarding'"

**Demo Steps:**
1. Use KB search bar
2. Search: "onboarding"
3. Filter by category if needed
4. View search results
5. Open relevant article

#### Scenario 5.4: Article Management
> "I need to update an outdated policy."

**Demo Steps:**
1. Find the article
2. Click Edit
3. Make changes
4. View version history
5. Publish updated version

### Knowledge Base Categories

| Department | Article Count | Sample Topics |
|------------|---------------|---------------|
| HR | 45 | Policies, Benefits, Onboarding |
| IT | 38 | Security, Software, Support |
| Finance | 25 | Expenses, Procurement, Budgets |
| Operations | 22 | Facilities, Travel, Vendors |
| Legal | 18 | Compliance, Contracts, Privacy |
| Marketing | 20 | Brand, Events, Social Media |
| Sales | 15 | CRM, Proposals, Territories |
| Engineering | 29 | Code Standards, Architecture, DevOps |

---

## 6. Workflow Automation (Agents)

**URL:** `/diq/agents`

Visual workflow builder for automating business processes.

### Features
- 31 pre-built workflow templates
- Drag-and-drop workflow builder
- Node types: Trigger, Search, Action, Condition, Transform, Output
- LLM-powered actions (Claude integration)
- Webhook and scheduled triggers
- Execution history and monitoring

### Demo Scenarios

#### Scenario 6.1: Browse Templates
> "What automations are available?"

**Demo Steps:**
1. Navigate to Agents page
2. Browse template gallery
3. Show categories (HR, IT, Finance, etc.)
4. Preview a template

#### Scenario 6.2: Create from Template
> "I want to set up employee onboarding automation."

**Demo Steps:**
1. Find "Employee Onboarding" template
2. Click "Use Template"
3. Review workflow steps:
   - Create accounts
   - Order equipment
   - Schedule training
   - Send welcome email
4. Customize parameters
5. Activate workflow

#### Scenario 6.3: Build Custom Workflow
> "I need a custom approval process."

**Demo Steps:**
1. Click "New Workflow"
2. Add Trigger node (Form submission)
3. Add Condition node (Amount > $1000?)
4. Add Action nodes (Send for approval / Auto-approve)
5. Add Output node (Notify requester)
6. Connect nodes
7. Test workflow

#### Scenario 6.4: Monitor Executions
> "Did my workflow run successfully?"

**Demo Steps:**
1. Go to workflow detail page
2. View execution history
3. Check status (Success/Failed)
4. View step-by-step logs
5. Debug failed executions

### Workflow Templates

| Category | Template Name | Description |
|----------|---------------|-------------|
| **HR** | Employee Onboarding | 6-step new hire setup |
| | Offboarding | Account deactivation, equipment return |
| | Time-Off Request | Approval routing |
| **IT** | Access Request | Permission provisioning |
| | Incident Response | Alert triage and escalation |
| | Password Reset | Self-service with verification |
| **Finance** | Expense Approval | Multi-level approval routing |
| | Invoice Processing | Vendor payment workflow |
| | Budget Request | Department allocation |
| **Operations** | Visitor Management | Guest registration and badges |
| | Facility Request | Maintenance ticketing |
| | Travel Booking | Approval and booking |

---

## 7. News Feed

**URL:** `/diq/news`

Company-wide announcements and updates.

### Features
- News posts with rich content
- Emoji reactions
- Comments with threading
- Recognition/shout-outs
- Pinned announcements
- Category filtering

### Demo Scenarios

#### Scenario 7.1: Read Latest News
> "What's new at the company?"

**Demo Steps:**
1. Navigate to News page
2. Scroll through recent posts
3. Note pinned announcements at top
4. Click on a post for full view

#### Scenario 7.2: React and Comment
> "I want to acknowledge this announcement."

**Demo Steps:**
1. Click reaction button on a post
2. Select emoji reaction
3. Add a comment
4. Reply to existing comment (threading)

#### Scenario 7.3: Post Recognition
> "I want to give a shout-out to my colleague."

**Demo Steps:**
1. Click "New Post"
2. Select type: "Recognition"
3. @mention the colleague
4. Write recognition message
5. Add tags (teamwork, innovation, etc.)
6. Post

#### Scenario 7.4: Create Announcement
> "I need to announce a new policy." (Admin)

**Demo Steps:**
1. Click "New Post"
2. Select type: "Announcement"
3. Write content with formatting
4. Add attachments if needed
5. Choose to pin post
6. Publish

---

## 8. Events Calendar

**URL:** `/diq/events`

Company events, meetings, and important dates.

### Features
- Calendar view (month, week, day)
- Event categories (All-Hands, Training, Social)
- RSVP functionality
- Event reminders
- Recurring events
- 49 events in database

### Demo Scenarios

#### Scenario 8.1: View Upcoming Events
> "What events are happening this month?"

**Demo Steps:**
1. Navigate to Events page
2. View calendar in month view
3. Click on events to see details
4. Filter by category

#### Scenario 8.2: RSVP to Event
> "I want to attend the company picnic."

**Demo Steps:**
1. Find the event
2. Click for details
3. Click "RSVP" button
4. Select attendance status (Yes/No/Maybe)
5. Add to personal calendar

#### Scenario 8.3: Create Event
> "I need to schedule a team meeting." (Editor+)

**Demo Steps:**
1. Click "New Event"
2. Enter title, description
3. Set date/time
4. Choose category
5. Set recurrence if needed
6. Invite attendees
7. Publish

---

## 9. Channels

**URL:** `/diq/channels`

Team communication spaces for collaboration.

### Features
- Public and private channels
- Real-time messaging
- Message reactions
- File sharing
- Member management
- Channel search

### Demo Scenarios

#### Scenario 9.1: Join a Channel
> "I want to join the Engineering channel."

**Demo Steps:**
1. Navigate to Channels page
2. Browse available channels
3. Click "Join" on Engineering channel
4. View channel history

#### Scenario 9.2: Send Message
> "I need to ask a question in the channel."

**Demo Steps:**
1. Open a channel
2. Type message in input box
3. Add emoji or mention @someone
4. Send message
5. React to others' messages

#### Scenario 9.3: Create Private Channel
> "I need a private space for my project team."

**Demo Steps:**
1. Click "New Channel"
2. Enter channel name
3. Set to Private
4. Add team members
5. Create channel

---

## 10. Notifications

**URL:** `/diq/notifications`

Centralized notification center for all activity.

### Features
- All notification types in one place
- Mark as read/unread
- Notification preferences
- Filter by type
- Bulk actions

### Demo Scenarios

#### Scenario 10.1: Check Notifications
> "What notifications do I have?"

**Demo Steps:**
1. Click notification bell in header
2. See dropdown preview
3. Click "View All" for full page
4. Review notifications

#### Scenario 10.2: Manage Preferences
> "I'm getting too many notifications."

**Demo Steps:**
1. Go to Notifications page
2. Click "Preferences"
3. Toggle notification types
4. Set email vs in-app preferences
5. Save preferences

---

## 11. My Day (Productivity)

**URL:** `/diq/my-day`

Personal productivity hub for daily planning.

### Features
- Daily task list
- AI-generated daily briefing
- Quick capture for new tasks
- Task priorities and due dates
- Kanban board view
- Today's meetings

### Demo Scenarios

#### Scenario 11.1: Morning Planning
> "Help me plan my day."

**Demo Steps:**
1. Navigate to My Day
2. Review AI daily briefing
3. Check today's tasks
4. View today's meetings
5. Prioritize tasks

#### Scenario 11.2: Quick Task Capture
> "I just remembered something I need to do."

**Demo Steps:**
1. Click "Quick Capture" button
2. Enter task title
3. Set priority (optional)
4. Set due date (optional)
5. Add task

#### Scenario 11.3: Task Management
> "I need to organize my tasks."

**Demo Steps:**
1. Switch to Kanban view
2. Drag tasks between columns
3. Update task status
4. Mark tasks complete

---

## 12. Settings

**URL:** `/diq/settings`

User preferences and account settings.

### Features
- Profile settings
- Appearance (theme)
- Notification preferences
- Language settings
- Security settings
- Connected accounts
- 9 settings panels

### Demo Scenarios

#### Scenario 12.1: Update Profile
> "I need to update my contact information."

**Demo Steps:**
1. Go to Settings
2. Click "Profile" tab
3. Update phone number
4. Update profile picture
5. Save changes

#### Scenario 12.2: Change Theme
> "I prefer dark mode."

**Demo Steps:**
1. Go to Settings
2. Click "Appearance" tab
3. Select Dark theme
4. See instant preview
5. Save preference

---

## 13. Admin Features

### Admin Dashboard
**URL:** `/diq/admin/dashboard`

#### Features
- User statistics (total, active, new, churn)
- Content metrics
- Search analytics (top queries, zero results)
- AI usage and costs
- System health monitoring

#### Demo Scenario: Executive Review
> "Show me the platform usage metrics."

**Demo Steps:**
1. Navigate to Admin Dashboard
2. Review user growth chart
3. Check content creation metrics
4. Analyze search patterns
5. Monitor AI token usage

---

### Analytics
**URL:** `/diq/admin/analytics`

#### Features
- Detailed charts and graphs
- Drill-down capabilities
- Export to CSV
- Custom date ranges

---

### Permissions (RBAC)
**URL:** `/diq/admin/permissions`

#### Features
- Role management
- User role assignment
- Permission matrix
- Audit log

#### Demo Scenario: Assign Role
> "I need to make someone an Editor."

**Demo Steps:**
1. Go to Permissions page
2. Find user
3. Click "Edit Role"
4. Select "Editor"
5. Save changes

---

### Elasticsearch Admin
**URL:** `/diq/admin/elasticsearch`

#### Features
- Cluster health (3 nodes)
- Index statistics (28,690 docs)
- Reindex operations
- Query testing

---

## Sample Demo Script

### 5-Minute Quick Demo

1. **Dashboard (30 sec)**
   - "This is your personalized homepage with news, events, and quick stats."

2. **Search (1 min)**
   - Search: "vacation policy"
   - "Our AI understands context and finds relevant results instantly."

3. **AI Chat (1.5 min)**
   - Ask: "How do I submit an expense report?"
   - "The AI assistant can answer questions using company knowledge."

4. **People (30 sec)**
   - Search for a name
   - "Find anyone in the company with full contact details."

5. **Workflows (1 min)**
   - Show template gallery
   - "Automate any business process with our visual workflow builder."

6. **Wrap-up (30 sec)**
   - "dIQ brings together everything employees need in one intelligent platform."

---

### 15-Minute Full Demo

1. **Introduction (1 min)**
   - Company overview
   - Problem being solved

2. **Dashboard Tour (2 min)**
   - News feed
   - Events
   - Stats and quick actions

3. **Enterprise Search (2 min)**
   - Keyword search
   - Semantic search example
   - AI summary feature

4. **AI Assistant Deep Dive (3 min)**
   - Policy question
   - Employee lookup
   - Multi-turn conversation

5. **Knowledge Base (2 min)**
   - Browse categories
   - Article creation
   - Version history

6. **Workflow Automation (3 min)**
   - Template gallery
   - Create from template
   - Build custom workflow

7. **Collaboration Features (1 min)**
   - News reactions
   - Channels preview

8. **Admin Overview (1 min)**
   - Analytics dashboard
   - User management

---

## Frequently Asked Questions

### General
**Q: How do I get started?**
A: Log in and you'll land on the Dashboard. Explore the sidebar menu to access all features.

**Q: Is my data secure?**
A: Yes, we use role-based access control, encryption, and audit logging.

**Q: Can I access this on mobile?**
A: Yes, the interface is fully responsive.

### Search
**Q: Why can't I find a document?**
A: Try using different keywords or ask the AI Assistant. Check if you have permission to view the content.

**Q: How does semantic search work?**
A: We use AI embeddings to understand meaning, not just keywords. "time off when sick" finds "Sick Leave Policy."

### AI Assistant
**Q: What can I ask the AI?**
A: Anything about company policies, processes, people, or general questions. It has access to all KB articles.

**Q: Are my conversations private?**
A: Yes, only you can see your chat history.

### Workflows
**Q: Can I create my own workflows?**
A: Editors and above can create workflows. Viewers can only trigger existing ones.

**Q: How do I know if a workflow ran?**
A: Check the execution history on the workflow detail page.

---

## Support

For technical issues or feature requests:
- **Internal:** Ask in #diq-support channel
- **Documentation:** Browse the Knowledge Base under "dIQ Help"
- **AI Assistant:** Ask "How do I..." questions directly

---

*Part of Digital Workplace AI Product Suite*
*https://intranet-iq.vercel.app/diq/dashboard*
