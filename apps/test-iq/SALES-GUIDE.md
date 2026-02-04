# Test Pilot IQ (dTQ) -- Sales Demo Script & Walkthrough Guide

> **Version:** 1.0.0
> **Last Updated:** 2026-02-04
> **Total Demo Time:** 30 minutes (full) | 15 minutes (short) | 5 minutes (lightning)
> **Product:** Test Pilot IQ -- Part of the Digital Workplace AI Suite

---

## Table of Contents

1. [Pre-Demo Checklist](#1-pre-demo-checklist)
2. [Opening -- The Hook (2 min)](#2-opening--the-hook--2-minutes)
3. [Act 1: The Executive View -- C-Suite (5 min)](#3-act-1-the-executive-view--c-suite--5-minutes)
4. [Act 2: The Manager's Command Center (7 min)](#4-act-2-the-managers-command-center--7-minutes)
5. [Act 3: The Engineer's Cockpit -- Tech Lead (5 min)](#5-act-3-the-engineers-cockpit--tech-lead--5-minutes)
6. [Act 4: AI Chat -- The Wow Factor (5 min)](#6-act-4-ai-chat--the-wow-factor--5-minutes)
7. [Act 5: Real-Time & Exports (3 min)](#7-act-5-real-time--exports--3-minutes)
8. [Closing & Objection Handling (3 min)](#8-closing--objection-handling--3-minutes)
9. [Quick Reference Card](#9-quick-reference-card)
10. [Demo Flow Timing Guide](#10-demo-flow-timing-guide)

---

## 1. Pre-Demo Checklist

### Environment Setup

| Item | Status | Details |
|------|--------|---------|
| Dev server running | [ ] | `npm run dev` on port 3004 |
| Dashboard URL loaded | [ ] | `http://localhost:3004/dtq/dashboard` |
| Browser | [ ] | Chrome or Edge, dark mode preferred |
| Screen resolution | [ ] | 1920x1080 minimum, no scaling above 100% |
| Browser DevTools | [ ] | Closed -- do not show console to customers |
| Other tabs | [ ] | Close all unrelated tabs |
| Notifications | [ ] | Silence system and browser notifications |
| AI Chat API keys | [ ] | Verify Anthropic + OpenAI keys are configured for live RAG |

### Recommended Screen Setup

- **Single screen:** Browser fullscreen, sidebar visible
- **Dual screen:** Browser on primary, speaker notes on secondary
- **Virtual meeting:** Share the browser tab only (not entire screen)

### Key Talking Points to Memorize

These are the numbers you should be able to cite from memory:

| Stat | Value | Context |
|------|-------|---------|
| Automation ROI | 285% | C-Suite headline metric |
| Defect Escape Rate | 2.1% | Down 0.8% -- shows quality improvement |
| Test Pass Rate | 94.2% | QA Manager headline metric |
| Regression Execution | 42 min | Down 8 min from prior period |
| Flaky Test Rate | 3.2% | Down 1.5% -- Tech Lead headline |
| Total Features Tracked | 80 | Across all 3 personas (16 + 46 + 18) |
| Knowledge Base Items | 130 | Items indexed for AI semantic search |
| Real-time interval | 8-15 sec | New test runs generated automatically |
| Personas | 3 | C-Suite, QA Manager, Tech Lead |

### Pre-Flight Test (5 Minutes Before Demo)

1. Load `http://localhost:3004/dtq/dashboard` -- confirm the page renders
2. Click a metric card -- confirm the MetricDrillDownModal opens
3. Click the AI Chat button (bottom-right pink circle) -- confirm it opens
4. Click one quick action pill -- confirm a response appears
5. Switch persona to C-Suite and back to QA Manager -- confirm data changes
6. Check that the green pulsing live indicator is visible in the top-right corner

---

## 2. Opening -- The Hook -- 2 Minutes

### The Problem Statement

**SAY:** "Let me ask you a question. Right now, if your VP of Engineering walks over and asks: 'What is our automation ROI?' or 'What is our defect escape rate this quarter?' -- how fast can your team answer that?"

*Pause for 3 seconds. Let the silence land.*

**SAY:** "In most organizations, answering that question means pulling data from Jira, exporting test results from TestRail, cross-referencing Jenkins logs, and building a spreadsheet. It takes hours. Sometimes days. And by the time you have the answer, the numbers have already changed."

### The Value Proposition

**SAY:** "Test Pilot IQ solves this in three ways. First, it gives every stakeholder -- from the C-Suite to the QA Manager to the Tech Lead -- their own view of the same data, tuned to what they care about. Second, it updates in real time. And third, it has an AI assistant that can answer any question about your test data in plain English."

**SAY:** "Let me show you what this looks like in action."

**SHOW:** The Dashboard should already be visible at `http://localhost:3004/dtq/dashboard` with the QA Manager persona selected (the default).

---

## 3. Act 1: The Executive View -- C-Suite -- 5 Minutes

### Switch to C-Suite Persona

**SHOW:** Click the **Crown icon** (C-Suite) in the left sidebar persona switcher.

**SAY:** "Let's start where the conversation usually begins -- at the executive level. I've just switched to the C-Suite persona. Notice how the entire dashboard transformed. Different KPIs, different categories, different metrics. Same platform, but now we're looking through the lens of a VP of Engineering or CTO."

### Walk Through the Persona Card

**SHOW:** Point to the persona card at the top showing "C-Suite / Executive" with the description "Strategic business metrics and ROI insights."

**SAY:** "The persona card confirms who we are -- a C-Suite executive focused on strategic business metrics and ROI insights."

### Highlight Business KPIs

**SHOW:** Scroll down to the persona-specific KPI grid. Point to each card as you mention it.

**SAY:** "Here are the seven KPIs that matter to an executive. Let me walk you through the highlights."

| KPI | Value | What to Say |
|-----|-------|-------------|
| Release Velocity | +35% | "Release velocity is up 35% -- we're shipping more features per quarter." |
| Mean Time to Market | 12 days | "Mean time to market is down to 12 days, a 4-day improvement." |
| **Automation ROI** | **285%** | "This is the number your CFO wants to see. Automation ROI at 285%, trending up 45%. Every dollar invested in test automation is returning nearly three dollars." |
| Defect Escape Rate | 2.1% | "Only 2.1% of defects are reaching production. That's down 0.8% from last period." |
| Incidents Prevented | 47 | "47 customer-impacting incidents prevented by catching them in test." |
| Risk Reduction | 68% | "68% risk reduction, business-impact weighted." |
| Capacity Unlocked | 42% | "42% of QA capacity has been unlocked and redirected to innovation work." |

### Click a Metric Card for Drill-Down

**SHOW:** Click the **Automation ROI** card (285%).

**SAY:** "Every metric is clickable. Here's the drill-down for Automation ROI. You can see the 30-day trend chart, period comparison, statistical breakdown -- current value, 30-day average, peak, and low -- and a category-level breakdown. This is the kind of depth your board expects."

**SHOW:** Close the modal by clicking the X or pressing Escape.

### Highlight Key Categories

**SHOW:** Scroll down to the Feature Coverage section. Point to the **Revenue Platform** and **Strategic Compliance** categories.

**SAY:** "At the executive level, features are organized into business categories. Revenue Platform covers Payment Gateway at 96% coverage, Subscription Billing at 93%. Strategic Compliance shows SOC 2 Validation at 97% coverage with a risk score of only 10 -- that's rock-solid."

**SHOW:** Click the **Strategic Compliance** category header to open the CategoryAnalyticsModal.

**SAY:** "Clicking a category opens this analytics view -- bar chart comparison of all features in the category, risk distribution pie chart, and automation breakdown. SOC 2 Validation and GDPR Data Handling are both fully automated. Audit Trail System is at 93%."

**SHOW:** Close the modal.

### Closing Message for This Act

**SAY:** "The key takeaway here is this: your VP of Engineering sees business impact visibility without needing to understand a single test script. ROI, risk reduction, compliance posture -- it's all right here, updated in real time."

---

## 4. Act 2: The Manager's Command Center -- 7 Minutes

### Switch to QA Manager Persona

**SHOW:** Click the **Users icon** (QA Manager) in the left sidebar.

**SAY:** "Now let's look at this from the QA Manager's perspective. This is where the operational depth lives."

### Highlight the Scale

**SHOW:** Point to the primary metrics grid at the top.

**SAY:** "The QA Manager is tracking 46 features across 10 categories. The automation rate is 43% -- 20 features are fully automated. There are 3 high-risk features flagged, and 47 open defects across the portfolio."

### Walk Through the KPIs

**SHOW:** Scroll to the persona-specific KPI grid. Highlight key cards.

| KPI | Value | What to Say |
|-----|-------|-------------|
| Test Pass Rate | 94.2% | "Test pass rate at 94.2%, trending up 2.3%." |
| Automated vs Manual | 8.5:1 ratio | "For every manual test, there are 8.5 automated tests running." |
| Regression Execution | 42 min | "Full regression suite completes in 42 minutes -- that's an 8-minute improvement." |
| First-Run Pass Rate | 87.5% | "New features pass at 87.5% on first run." |
| Escalation Rate | 12.3% | "Escalation rate is down to 12.3% -- fewer tests needing manual review." |
| Blocker Defects | 3 | "Only 3 blocker-level defects open, down from 5." |
| Environment Uptime | 99.2% | "Test environment stability at 99.2%." |

### Show the High Risk Banner

**SHOW:** Point to the High Risk Banner (the red/orange section below the KPIs).

**SAY:** "This banner automatically surfaces the top 3 highest-risk features. Right now those are:"

| Feature | Risk Score | Coverage | Pass Rate |
|---------|-----------|----------|-----------|
| xAPI / LRS Integration | 45 | 92% | 94% |
| Learning Analytics | 42 | 89% | 91% |
| Mobile Experience | 42 | 79% | 86% |

**SAY:** "xAPI / LRS Integration has the highest risk score at 45. Mobile Experience has the lowest coverage of the three at 79%. Both are clear signals for where to invest next."

### Open a Category

**SHOW:** Scroll to Feature Coverage. Click the **Core User Journeys** category header.

**SAY:** "Let's drill into Core User Journeys. The CategoryAnalyticsModal shows 5 features, average coverage comparison in a bar chart, and risk distribution. Course Completion Flow is the strongest at 95% coverage. Mobile Experience at 79% is the weakest."

### Click a Feature

**SHOW:** Inside the CategoryAnalyticsModal, click **Mobile Experience** (or close the modal first and click it from the feature list).

**SAY:** "Clicking any feature opens the FeatureDetailModal. Here's Mobile Experience -- risk score 42, coverage 79%, pass rate 86%, 3 open defects, 7 closed. Below that is a 14-day history chart showing the pass rate trend. And at the bottom, the 10 most recent test runs for this feature."

**SHOW:** Close the modal.

### Navigate to the Reports Page

**SHOW:** Click **Test Reports** in the left sidebar.

**SAY:** "The Reports page is the test execution log. Every test run is listed here with filtering, sorting, and pagination."

### Show Filtering and Sorting

**SHOW:** Click the **Failed** status filter tab.

**SAY:** "I can filter by status -- let me show just the failed runs. Each one shows the feature name, how many tests passed and failed, duration, and issue count."

**SHOW:** Click the **Feature Name** column header to sort alphabetically.

**SAY:** "Every column is sortable. Click once for ascending, again for descending, a third time to clear the sort."

### Click a Failed Run

**SHOW:** Click a failed test run row (for example, "xAPI / LRS Integration" or "Mobile Experience").

**SAY:** "Clicking a row opens the TestRunDetailModal. Here you see the full breakdown: total tests, passed, failed, pass rate percentage. Below that, every issue is listed with severity, error message, and -- most importantly for engineers -- an expandable stack trace."

**SHOW:** Click on an issue to expand the stack trace. Click the copy button.

**SAY:** "One click copies the stack trace to the clipboard. Your engineer can paste it directly into a bug report or a Slack message."

**SHOW:** Close the modal. Click the **All** filter tab to reset.

### Closing Message for This Act

**SAY:** "Everything your QA Manager needs in one view -- no spreadsheets, no Jira queries, no hunting through CI/CD logs. Pass rates, regression times, risk alerts, test execution history -- all in one place."

---

## 5. Act 3: The Engineer's Cockpit -- Tech Lead -- 5 Minutes

### Switch to Tech Lead Persona

**SHOW:** Navigate back to the Dashboard via the sidebar. Click the **Code icon** (Tech Lead) in the sidebar.

**SAY:** "Now let's look at the engineering perspective. The Tech Lead persona is designed for engineering leads who care about pipeline health, test infrastructure, and technical depth."

### Highlight Engineering Metrics

**SHOW:** Point to the persona-specific KPI grid.

| KPI | Value | What to Say |
|-----|-------|-------------|
| Flaky Test Rate | 3.2% | "Flaky test rate at 3.2%, down 1.5% -- test stability is improving." |
| Avg Execution Time | 4.2 min | "Average test execution is 4.2 minutes per suite, down 0.8 minutes." |
| Token Usage Cost | $0.42 | "AI token cost per agentic test run is only $0.42, down 15 cents." |
| Context Hit Rate | 94.5% | "The AI context hit rate is 94.5% -- it's finding relevant data almost every time." |
| Tool Call Success | 97.8% | "Automated tool calls succeed 97.8% of the time." |
| Parallel Efficiency | 78.5% | "Parallel test execution at 78.5% efficiency versus theoretical maximum." |
| Automation Coverage | 93.3% | "Code and requirements coverage at 93.3%." |
| Total Test Cases | 1,247 | "1,247 active test cases, up 86 from last period." |

### Show CI/CD and Security Categories

**SHOW:** Scroll to Feature Coverage. Point to **CI/CD Pipeline** and **Security Testing**.

**SAY:** "The Tech Lead sees engineering categories: CI/CD Pipeline, API Infrastructure, Performance Engineering, Security Testing, and DevOps Automation. Let's look at the one that keeps security teams up at night."

### Click Penetration Test Suite

**SHOW:** Expand the **Security Testing** category and click **Penetration Test Suite**.

**SAY:** "Penetration Test Suite has the highest risk score in the Tech Lead view at 45. Coverage is only 70%, pass rate 80%, and there are 4 open defects. The 14-day trend chart shows where this feature has been. This is exactly the kind of visibility an engineering leader needs to make a resource allocation decision."

**SHOW:** Close the modal.

### Navigate to History Page

**SHOW:** Click **Metrics History** in the left sidebar.

**SAY:** "The History page shows 30-day trends across four key metrics: Test Pass Rate, First Run Pass Rate, Defect Detection Percentage, and Test Case Effectiveness. Each chart plots all 30 days."

### Click a Chart Point

**SHOW:** Click a data point on the **Test Pass Rate Trend** chart.

**SAY:** "Clicking any data point opens the ChartDrillDownModal. You see the exact value for that date, comparison to the previous and next days, percentile ranking within the 30-day window, and contributing factors."

**SHOW:** Close the modal.

### Closing Message for This Act

**SAY:** "Engineers get the technical depth they need -- pipeline efficiency, flaky test rates, security posture, token costs -- without having to build their own dashboards from raw CI/CD data."

---

## 6. Act 4: AI Chat -- The Wow Factor -- 5 Minutes

### Open the AI Chat

**SHOW:** Click the **pink floating action button** (circle with MessageCircle icon) in the bottom-right corner of the screen.

**SAY:** "This is where it gets really interesting. Test Pilot IQ has a built-in AI assistant powered by Claude and RAG -- Retrieval-Augmented Generation. It can answer any question about your test data in plain English."

**SHOW:** Point to the chat panel that slides up. Note the persona badge in the header showing the current persona.

**SAY:** "Notice the persona badge -- the AI knows which persona you're viewing as and tailors its answers accordingly."

### Click the "High-risk features" Quick Action

**SHOW:** Click the **"High-risk features"** quick action pill.

**SAY:** "Let's start with a pre-built query. I'll click 'High-risk features.'"

*Wait for the response to appear.*

**SAY:** "The AI has analyzed all features and identified the highest-risk ones. Notice the response is formatted in markdown -- headers, bullet points, actionable recommendations. And look below the response..."

### Show Related Link Cards

**SHOW:** Point to the **Related** section below the AI response, showing link cards.

**SAY:** "These are related link cards. Each one is clickable and will navigate you directly to the relevant feature, category, or metric -- anywhere in the application."

### Click a Link Card

**SHOW:** Click one of the link cards (for example, one pointing to a high-risk feature).

**SAY:** "Watch what happens when I click this link card."

*The app navigates to the Dashboard and opens the FeatureDetailModal for the linked feature.*

**SAY:** "It navigated me to the Dashboard and automatically opened the detail modal for that specific feature. The chat and the dashboard are fully interlinked."

**SHOW:** Close the modal. Reopen the chat if it was minimized.

### Type a Custom Question

**SHOW:** Type in the chat input: `What areas need the most automation improvement?`

**SAY:** "Now let me ask a custom question: 'What areas need the most automation improvement?'"

*Wait for the response.*

**SAY:** "The AI searched across 130 knowledge base items using semantic vector search -- not keyword matching, but actual understanding of meaning -- and generated a contextual answer. It identified the features with the largest automation gaps and ranked them."

### Show Source Indicators

**SHOW:** Point to the source indicator below the AI response (e.g., "3 sources used" with a paperclip icon).

**SAY:** "You can see how many knowledge sources were used to generate this answer. This is not a hallucination -- it's grounded in your actual test data."

### Closing Message for This Act

**SAY:** "Ask any question in plain English. The AI searches 130 knowledge items and gives you actionable answers with direct links. No query language. No SQL. No dashboards to configure. Just ask."

---

## 7. Act 5: Real-Time & Exports -- 3 Minutes

### Point Out the Live Indicator

**SHOW:** Navigate to the **Reports** page. Point to the green pulsing dot in the top-right corner.

**SAY:** "See this green pulsing dot? That means the system is live. New test runs are being generated every 8 to 15 seconds, simulating a real CI/CD pipeline."

### Watch a New Test Run Appear

**SHOW:** Wait for a new row to appear at the top of the Reports table. Point to the row highlight animation.

**SAY:** "There -- a new test run just came in. Notice how it appeared at the top of the table with a brief highlight animation. In production, this would be a real test run from your CI/CD pipeline streaming in."

### Pause the Simulation

**SHOW:** Click the **Live toggle button** to pause.

**SAY:** "I can pause the simulation to freeze the data. Useful when you want to analyze a specific moment in time without the numbers changing under you. Click again to resume."

**SHOW:** Click the toggle to resume.

### Show CSV Export

**SHOW:** Click the **Export CSV** button in the Reports filter bar.

**SAY:** "One click exports the entire test run history as a CSV file. The file is named with today's date -- `test-reports-2026-02-04.csv`. Open it in Excel, Google Sheets, or pipe it into your BI tools."

### Show PDF Export

**SHOW:** Click the **Export PDF** button.

**SAY:** "The PDF export opens your browser's print dialog with a pre-formatted report. Save as PDF and send it to any stakeholder -- no login required on their end."

**SHOW:** Close the print dialog.

### Closing Message for This Act

**SAY:** "Real-time visibility with one-click exports for stakeholders. No scheduling. No waiting for nightly builds. Your dashboard is always current, and you can share it with anyone in seconds."

---

## 8. Closing & Objection Handling -- 3 Minutes

### Summary Wrap-Up

**SAY:** "Let me bring it all together. We've seen three perspectives on the same data."

**SAY:** "The C-Suite Executive sees ROI, risk reduction, and business impact -- Automation ROI at 285%, Defect Escape Rate at 2.1%, 47 incidents prevented."

**SAY:** "The QA Manager sees team performance and operational health -- Pass Rate 94.2%, Regression Execution in 42 minutes, 46 features across 10 categories tracked in real time."

**SAY:** "The Tech Lead sees engineering depth -- Flaky Test Rate 3.2%, Pipeline Efficiency, Token Cost $0.42 per run, 1,247 active test cases."

**SAY:** "One platform. Three perspectives. Every metric clickable. Every chart interactive. An AI assistant that answers questions in plain English. Real-time data with one-click exports."

### Common Objections and Responses

#### "We already use Jira / TestRail / Xray."

**SAY:** "Test Pilot IQ doesn't replace those tools -- it sits on top of them. Jira tracks issues. TestRail manages test cases. Test Pilot IQ gives you the unified intelligence layer that connects all of that into a single view with executive-level visibility. Think of it as the 'single pane of glass' that your existing tools can't provide on their own."

#### "Is the AI accurate?"

**SAY:** "Great question. The AI uses RAG -- Retrieval-Augmented Generation. That means it doesn't make up answers. Every response is grounded in your actual test data. We embed your data as vectors, perform semantic search to find the most relevant items, and then Claude generates a response using only that context. You can see the source count on every response. If it used 3 sources, those are 3 real data points from your system."

#### "How does it integrate with our stack?"

**SAY:** "The platform is built on Supabase with a full REST API. Every data point you see -- features, test runs, metrics, personas -- is available via API endpoints. It can be embedded in your existing tools, and it supports webhooks for CI/CD pipeline integration. The architecture is designed to sit alongside your existing infrastructure, not replace it."

#### "What about data security?"

**SAY:** "Security is built in, not bolted on. The platform includes SOC 2 validation tracking at 97% coverage, GDPR data handling at 95% coverage, and a full audit trail system. Row-level security is enforced at the database level. AI queries never leave your tenant boundary -- the RAG search happens within your own data."

#### "How much does it cost?"

**SAY:** "Pricing depends on your team size, data volume, and integration complexity. Let me connect you with our solutions team to scope a pilot. What I can tell you is that at 285% automation ROI, the platform pays for itself quickly."

### Call to Action

**SAY:** "Here's what I'd like to propose. Let's set up a pilot with your actual test data. We'll configure the three personas for your organization, connect your CI/CD pipeline, and within two weeks you'll have a live dashboard that your VP of Engineering, your QA Manager, and your Tech Leads can all use -- each seeing exactly what matters to them."

**SAY:** "What questions do you have?"

---

## 9. Quick Reference Card

### Three Personas at a Glance

| Persona | Icon | Features | KPIs | Top Metric |
|---------|------|----------|------|------------|
| **C-Suite** | Crown | 16 features, 5 categories | 7 KPIs | Automation ROI: 285% |
| **QA Manager** | Users | 46 features, 10 categories | 9 KPIs | Test Pass Rate: 94.2% |
| **Tech Lead** | Code | 18 features, 5 categories | 8 KPIs | Flaky Test Rate: 3.2% |

### Five Killer Features to Highlight

1. **Role-Based Dashboards** -- Same data, three lenses. Every stakeholder sees what matters to them.
2. **AI Chat with RAG** -- Ask questions in plain English. 130 knowledge items searched semantically. Grounded answers with source indicators.
3. **Interlinked Navigation** -- Click any AI response link card and it navigates you directly to the relevant feature, category, or metric modal. Chat and dashboard are fully connected.
4. **Real-Time Simulation** -- New test runs every 8-15 seconds. Metrics fluctuate live. Green pulsing indicator. Pause and resume at will.
5. **One-Click Exports** -- CSV and PDF exports for any stakeholder. No login required for recipients. File names include the export date.

### Three Competitive Differentiators

1. **Persona-Driven Intelligence** -- No other QA platform adapts its entire view based on the stakeholder role. Executives, managers, and engineers each get purpose-built metrics.
2. **AI-Powered Natural Language Query** -- RAG-backed answers, not keyword search. Claude AI generates contextual responses from real test data with navigation links.
3. **Actionable, Not Passive** -- Every metric card, chart point, feature row, and AI response link is clickable. The platform is designed for investigation, not just observation.

### Navigation Quick Reference

| Action | How |
|--------|-----|
| Switch persona | Click Crown / Users / Code icon in sidebar |
| Open metric drill-down | Click any metric card or KPI card |
| Open feature detail | Click any feature row in Feature Coverage |
| Open category analytics | Click any category header |
| Open test run detail | Click any row in the Reports table |
| Open chart drill-down | Click any data point on any trend chart |
| Open AI Chat | Click the pink floating button (bottom-right) |
| Export CSV | Reports page, click "Export CSV" |
| Export PDF | Reports page, click "Export PDF" |
| Pause/Resume simulation | Click the Live toggle (top-right) |

### URLs

| Page | Local Dev URL |
|------|---------------|
| Dashboard | `http://localhost:3004/dtq/dashboard` |
| Metrics History | `http://localhost:3004/dtq/history` |
| Test Reports | `http://localhost:3004/dtq/reports` |

---

## 10. Demo Flow Timing Guide

### Full Demo -- 30 Minutes

| Time | Section | Duration | Key Actions |
|------|---------|----------|-------------|
| 0:00 | **Opening -- The Hook** | 2 min | Problem statement, value prop, transition |
| 2:00 | **Act 1: Executive View (C-Suite)** | 5 min | Switch persona, walk KPIs, click Automation ROI drill-down, show Revenue Platform and Strategic Compliance categories |
| 7:00 | **Act 2: Manager's Command Center** | 7 min | Switch persona, walk 46 features and 9 KPIs, show High Risk Banner, open Core User Journeys category, click Mobile Experience, navigate to Reports, filter/sort, click failed run, show stack trace |
| 14:00 | **Act 3: Engineer's Cockpit (Tech Lead)** | 5 min | Switch persona, walk 8 KPIs, show CI/CD and Security categories, click Penetration Test Suite, navigate to History, click chart point |
| 19:00 | **Act 4: AI Chat** | 5 min | Open chat, click "High-risk features", show link cards, click a link card, type custom question, show source indicators |
| 24:00 | **Act 5: Real-Time & Exports** | 3 min | Show live indicator, watch new row appear, pause/resume, CSV export, PDF export |
| 27:00 | **Closing & Objections** | 3 min | Summary of 3 personas, handle objections, call to action |

### Short Demo -- 15 Minutes

*Skip Acts 3 (Tech Lead) and 5 (Real-Time & Exports).*

| Time | Section | Duration | Key Actions |
|------|---------|----------|-------------|
| 0:00 | **Opening -- The Hook** | 2 min | Problem statement, value prop |
| 2:00 | **Act 1: Executive View (C-Suite)** | 4 min | Switch persona, highlight Automation ROI 285% and Defect Escape Rate 2.1%, click one drill-down |
| 6:00 | **Act 2: Manager's Command Center** | 5 min | Switch persona, highlight Pass Rate 94.2% and Regression Execution 42 min, show High Risk Banner, click one feature, briefly show Reports page |
| 11:00 | **Act 4: AI Chat** | 3 min | Open chat, click one quick action, show link card navigation, mention 130 knowledge items |
| 14:00 | **Closing** | 1 min | "One platform, three perspectives" summary, call to action |

### Lightning Demo -- 5 Minutes

*Executive View + AI Chat only. Maximum impact in minimum time.*

| Time | Section | Duration | Key Actions |
|------|---------|----------|-------------|
| 0:00 | **Hook** | 30 sec | "What if your VP of Engineering could see automation ROI in real time?" |
| 0:30 | **Executive View** | 2 min | Show C-Suite persona, point to Automation ROI 285%, Defect Escape Rate 2.1%, click one metric drill-down |
| 2:30 | **AI Chat** | 2 min | Open chat, click "High-risk features", show RAG-powered response with link cards, click one link to navigate |
| 4:30 | **Close** | 30 sec | "One platform, three perspectives, AI-powered. Let's set up a pilot." |

---

*Part of the Digital Workplace AI Product Suite*
*Location: `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq`*
*Port: 3004 | BasePath: /dtq*
