# Test Pilot IQ (dTQ) — Demo Guide

> **Version:** 1.0.0
> **Last Updated:** 2026-02-04
> **Status:** Production Demo
> **Part of:** Digital Workplace AI Product Suite

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Access & Navigation](#2-access--navigation)
3. [Personas — Full Spectrum](#3-personas--full-spectrum)
   - [3a. C-Suite (Executive)](#3a-c-suite-executive)
   - [3b. QA Manager](#3b-qa-manager)
   - [3c. Tech Lead (Engineer)](#3c-tech-lead-engineer)
4. [Dashboard Page — Full Walkthrough](#4-dashboard-page--full-walkthrough)
5. [Test Reports Page — Full Walkthrough](#5-test-reports-page--full-walkthrough)
6. [Metrics History Page — Full Walkthrough](#6-metrics-history-page--full-walkthrough)
7. [AI Chat Assistant — Full Walkthrough](#7-ai-chat-assistant--full-walkthrough)
8. [Interactive Modals — Reference](#8-interactive-modals--reference)
9. [Real-Time Simulation](#9-real-time-simulation)
10. [Data Export](#10-data-export)
11. [TDD Test Scenarios (Full Spectrum)](#11-tdd-test-scenarios-full-spectrum)
12. [Appendix](#12-appendix)

---

## 1. Executive Overview

### What is Test Pilot IQ?

Test Pilot IQ (dTQ) is an **AI-powered QA & testing intelligence platform** that gives engineering teams unified, real-time visibility into test health, feature coverage, and quality trends. It is part of the Digital Workplace AI product suite.

### The Problem It Solves

QA teams today lack a single pane of glass that connects test execution data, feature coverage, risk analysis, and quality trends — and presents them in a way that is meaningful to every stakeholder, from executives to individual engineers. Test Pilot IQ solves this by providing:

- **Role-based dashboards** — the same dataset, presented through the lens of C-Suite executives, QA Managers, and Tech Leads.
- **Real-time simulation** — continuous test run generation that mimics a live CI/CD pipeline.
- **AI-powered insights** — a floating chat assistant backed by Claude AI and RAG (Retrieval-Augmented Generation) that can answer natural-language questions about test data.
- **Actionable navigation** — every metric, chart point, feature, and category is clickable, opening detailed drill-down modals.

### Key Value Propositions

| Value | Description |
|-------|-------------|
| **3 Persona Views** | C-Suite sees ROI and risk reduction; QA Manager sees team pass rates and regression times; Tech Lead sees flaky test rates and pipeline efficiency. |
| **Real-Time Simulation** | A new test run is generated every 8–15 seconds, with metrics fluctuating to mimic a live environment. |
| **AI Chat with RAG** | Ask natural-language questions. The system embeds your query, performs semantic search across 130 knowledge base items, and generates a contextual response via Claude. |
| **Actionable Navigation** | Click any metric card, chart data point, feature row, or category header to open a detailed drill-down modal. Chat link cards navigate you directly to the relevant page and modal. |

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Supabase | @supabase/supabase-js | Database + pgvector |
| Claude AI (Anthropic) | Sonnet 4 | Chat responses with RAG context |
| OpenAI | text-embedding-3-small | 1536-dim embeddings for semantic search |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | UI animations |
| Recharts | 3.x | Charts and visualizations |
| GSAP | 3.x | Advanced animations |

---

## Quick Reference — Q&A Tables

This section provides quick-reference tables showing questions users can ask, actions they can take, and expected behaviors/results.

---

### QR-1. AI Chat Quick Actions (4 Pre-Defined)

The AI Chat widget provides four quick action buttons that send pre-built queries:

| # | Quick Action Button | Query Sent | Expected Response |
|---|---------------------|------------|-------------------|
| 1 | **High-risk features** | "High-risk features" | List of 3+ features with risk score ≥40, showing coverage %, open defects, and pass rates. Includes link cards to feature details. |
| 2 | **Feature status** | "Feature status" | Overall stats: "80 features across 20 categories, 88% avg coverage." Breakdown of automation status (fully automated vs partially automated). |
| 3 | **Automation gaps** | "Automation gaps" | Top 5 partially-automated features with coverage gaps. Recommendations for automation priorities. |
| 4 | **Quality summary** | "Quality summary" | Executive KPIs: overall pass rate, automation coverage %, total open defects, trend indicators. Persona-specific metrics included. |

---

### QR-2. AI Chat Free-Form Queries

Users can type natural-language questions. The RAG pipeline finds relevant context from 130 knowledge base items:

| # | Example Query | Response Type | What You'll See |
|---|--------------|---------------|-----------------|
| 1 | "What features have highest risk?" | High-risk analysis | Feature list sorted by risk score (≥40), recommendations, link cards to each feature |
| 2 | "Show me pass rate trends" | Metric trend | Inline sparkline chart (180×36px) showing 14-day trend + narrative analysis |
| 3 | "Tell me about xAPI integration" | Feature detail | Feature coverage (92%), risk score (45), pass rate (94%) + link card to FeatureDetailModal |
| 4 | "Test execution history" | Report link | Link cards navigating to Reports page with TestRunDetailModal |
| 5 | "Learning Experience category" | Category summary | Category stats (4 features, avg 89% coverage) + link card to CategoryAnalyticsModal |
| 6 | "What's our automation ROI?" | KPI analysis | "285% ROI" with cost savings breakdown (C-Suite persona), link to Automation ROI metric |
| 7 | "Flaky test rate" | Engineering metric | "3.2% flaky rate, trending down -1.5%" (Tech Lead persona), inline sparkline |
| 8 | "Regression execution time" | Team metric | "42 min avg, improved by 8 min" (QA Manager persona) |
| 9 | "CI/CD pipeline status" | Multi-feature | Build Orchestration, Deploy Pipeline, Rollback Automation details with link cards |
| 10 | "Compare coverage by category" | Category comparison | Table-style breakdown of all categories with coverage percentages |

---

### QR-3. Dashboard Interactions

Every element on the Dashboard is interactive. Here's what you can click and what opens:

| # | Click Target | What Opens | What You See |
|---|-------------|------------|--------------|
| 1 | **Total Features** metric card | MetricDrillDownModal | 30-day trend chart, 4-stat summary (current, avg, peak, low), category breakdown bar chart |
| 2 | **Automation Rate** metric card | MetricDrillDownModal | Automation trends over 30 days, fully vs partially automated comparison |
| 3 | **Risk Distribution** metric card | MetricDrillDownModal | High/Medium/Low risk counts, 30-day risk trend, features by risk level |
| 4 | **Open Defects** metric card | MetricDrillDownModal | Defect trends, defects by category, related high-defect features |
| 5 | **Persona KPI card** (e.g., Pass Rate) | MetricDrillDownModal | KPI-specific trends, period comparison (current vs previous), category breakdown |
| 6 | **Chart data point** (any trend chart) | ChartDrillDownModal | Selected day's value prominently displayed, change vs previous day, percentile ranking, contributing factors |
| 7 | **Feature row** in Feature Coverage | FeatureDetailModal | Coverage %, risk score, open/closed defects, pass rate, 14-day history chart, recent test runs |
| 8 | **Category header** in Feature Coverage | CategoryAnalyticsModal | Avg coverage, avg pass rate, high-risk count, total defects, feature comparison bar chart, risk distribution pie |
| 9 | **High Risk Banner** feature card | FeatureDetailModal | Same as #7 — full feature detail with history |

---

### QR-4. Reports Page Interactions

The Reports page (`/dtq/reports`) provides test execution history with filtering and drill-down:

| # | Action | How | What Happens |
|---|--------|-----|--------------|
| 1 | **Filter by status** | Click "All" / "Passed" / "Failed" tabs | Table shows only matching test runs; count updates in tab badge |
| 2 | **Search by feature** | Type in "Search feature name..." box | Filters test runs by feature name (case-insensitive substring match) |
| 3 | **Sort by column** | Click column header (Status, Feature Name, Duration, Executed, Issues) | 3-click cycle: ascending → descending → clear sort. Arrow indicator shows sort direction. |
| 4 | **View test run detail** | Click any table row | Opens TestRunDetailModal with status badge, test counts, pass rate, issues list (if failed) |
| 5 | **Filter issues by severity** | In TestRunDetailModal, click "All" / "High" / "Medium" / "Low" tabs | Shows only issues matching selected severity |
| 6 | **Expand stack trace** | Click issue's error message | Stack trace expands below; click again to collapse |
| 7 | **Copy stack trace** | Click copy button (clipboard icon) | Stack trace copied to clipboard |
| 8 | **Navigate to feature** | Click "View Feature" in TestRunDetailModal | Closes test run modal, opens FeatureDetailModal for that feature |
| 9 | **Export CSV** | Click "Export CSV" button | Downloads `test-reports-YYYY-MM-DD.csv` with all test runs |
| 10 | **Export PDF** | Click "Export PDF" button | Opens browser print dialog for PDF generation |
| 11 | **Paginate** | Click page numbers or navigation buttons (⏮ ◀ ▶ ⏭) | Shows 10 rows per page; smart ellipsis for many pages |

---

### QR-5. History Page Interactions

The Metrics History page (`/dtq/history`) shows 30-day trends with time range selection:

| # | Action | How | What Happens |
|---|--------|-----|--------------|
| 1 | **Change time range** | Click 7d / 30d / 90d / 12m pill buttons | All 4 charts update to show selected time range; summary cards recalculate averages |
| 2 | **View metric detail** | Click any summary card (Avg Pass Rate, First Pass Rate, Defect Detection, Effectiveness) | Opens MetricDrillDownModal with full trend chart, statistics, period comparison |
| 3 | **Drill into chart point** | Click any data point on the 4 trend charts | Opens ChartDrillDownModal with that day's value, change analysis, percentile ranking |

**Metrics Tracked:**
| Metric | Chart Type | Color | Description |
|--------|------------|-------|-------------|
| Test Pass Rate | Line | Green | Percentage of tests passing per day |
| First Run Pass Rate | Line | Pink | Tests passing on first execution |
| Defect Detection | Area | Orange | Defects caught during testing |
| Test Effectiveness | Area | Blue | Overall test case effectiveness score |

---

### QR-6. Persona-Specific Query Guide

Each persona sees different KPIs and responds to different question types:

#### C-Suite (Executive) Persona

| Query Focus | Example Questions | Response Style |
|-------------|-------------------|----------------|
| **ROI metrics** | "What's our automation ROI?" "Cost savings?" | Business impact: "$2.3M annual savings", "285% ROI", dollar amounts |
| **Risk reduction** | "Risk assessment?" "Revenue protection?" | Strategic view: "68% risk reduction", customer impact metrics |
| **Release velocity** | "Time to market?" "Release speed?" | "12 days mean time to market, improved by 4 days" |
| **Defect escape** | "Defect escape rate?" "Production bugs?" | "2.1% escape rate, down 0.8%" — business quality metrics |
| **Capacity** | "Team capacity?" "Efficiency gains?" | "42% capacity unlocked" — resource optimization |

**C-Suite KPIs (7 total):**
| KPI | Value | Trend |
|-----|-------|-------|
| Release Velocity | +35% | ↑ +8% |
| Mean Time to Market | 12 days | ↓ -4 days |
| Automation ROI | 285% | ↑ +45% |
| Defect Escape Rate | 2.1% | ↓ -0.8% |
| Incidents Prevented | 47 | ↑ +12 |
| Risk Reduction | 68% | ↑ +15% |
| Capacity Unlocked | 42% | ↑ +8% |

---

#### QA Manager Persona

| Query Focus | Example Questions | Response Style |
|-------------|-------------------|----------------|
| **Team metrics** | "Pass rate trends?" "Team performance?" | "94.2% pass rate, up 2.3%" — team-level aggregates |
| **Automation ratio** | "Automation coverage?" "Auto vs manual?" | "8.5:1 automated to manual ratio" |
| **Defect tracking** | "Open defects?" "Blocker bugs?" | Defect counts by category, severity breakdown |
| **Regression** | "Regression time?" "Execution speed?" | "42 min regression, improved 8 min" |
| **Environment** | "Environment uptime?" "Stability?" | "99.2% environment uptime" |

**QA Manager KPIs (9 total):**
| KPI | Value | Trend |
|-----|-------|-------|
| Test Pass Rate | 94.2% | ↑ +2.3% |
| Automated vs Manual | 8.5:1 | ↑ +0.5 |
| Test Effectiveness | 0.87 | → stable |
| Regression Execution | 42 min | ↓ -8 min |
| First-Run Pass Rate | 87.5% | ↑ +4.2% |
| Escalation Rate | 12.3% | ↓ -2.1% |
| Test Case Reuse | 76.8% | ↑ +5.3% |
| Blocker Defects | 3 | ↓ -2 |
| Environment Uptime | 99.2% | → stable |

---

#### Tech Lead (Engineer) Persona

| Query Focus | Example Questions | Response Style |
|-------------|-------------------|----------------|
| **Flaky tests** | "Flaky test rate?" "Unstable tests?" | "3.2% flaky rate, trending down 1.5%" — technical metrics |
| **Execution time** | "Average execution?" "Test speed?" | "4.2 min avg execution, improved 0.8 min" |
| **Token costs** | "Token usage?" "AI costs?" | "$0.42 per run, down $0.15" — cost efficiency |
| **Pipeline** | "CI/CD status?" "Build health?" | Feature-by-feature pipeline status with coverage |
| **Security** | "Security testing?" "Penetration tests?" | Coverage and pass rates for security test suites |

**Tech Lead KPIs (8 total):**
| KPI | Value | Trend |
|-----|-------|-------|
| Flaky Test Rate | 3.2% | ↓ -1.5% |
| Avg Execution Time | 4.2 min | ↓ -0.8 min |
| Token Usage Cost | $0.42 | ↓ -$0.15 |
| Context Hit Rate | 94.5% | ↑ +2.3% |
| Tool Call Success | 97.8% | ↑ +1.2% |
| Parallel Efficiency | 78.5% | ↑ +5% |
| Automation Coverage | 93.3% | ↑ +2.1% |
| Total Test Cases | 1247 | ↑ +86 |

---

### QR-7. Navigation Flow Reference

How chat link cards navigate to modals:

```
AI Chat Response
    │
    └── Link Card Click
            │
            ├── feature link ──────→ Dashboard ──→ FeatureDetailModal
            │
            ├── category link ─────→ Dashboard ──→ CategoryAnalyticsModal
            │
            ├── metric link ───────→ Dashboard ──→ MetricDrillDownModal
            │                  or → History ───→ MetricDrillDownModal
            │
            ├── report link ───────→ Reports ───→ TestRunDetailModal
            │
            └── history link ──────→ History ───→ Time range + charts
```

**Cross-Modal Navigation:**
```
CategoryAnalyticsModal
    │
    └── Click feature in list
            │
            └── Closes CategoryAnalyticsModal
                Opens FeatureDetailModal

TestRunDetailModal
    │
    └── Click "View Feature"
            │
            └── Closes TestRunDetailModal
                Opens FeatureDetailModal
```

---

### QR-8. Simulation & Real-Time Behavior

The app simulates a live CI/CD pipeline:

| Behavior | Interval | What Happens |
|----------|----------|--------------|
| **Metric fluctuation** | Every 30 seconds | Latest day's metrics receive ±0.5–1.5% variance |
| **New test run** | Every 8–15 seconds | Random feature gets new test run (85% pass probability) |
| **Live indicator** | Continuous | Green pulsing dot in header; shows "Updated X seconds ago" |
| **Row highlight** | On new run | Newest row in Reports table gets 1.5s highlight animation |

**Live/Pause Toggle:**
| State | Visual | Behavior |
|-------|--------|----------|
| **Live** | Green pulsing dot | Simulation active, metrics updating |
| **Paused** | Grey dot | Simulation stopped, data static |

---

## 2. Access & Navigation

### URLs

| Environment | Dashboard | History | Reports |
|-------------|-----------|---------|---------|
| **Local Dev** | http://localhost:3004/dtq/dashboard | http://localhost:3004/dtq/history | http://localhost:3004/dtq/reports |
| **Production** | `https://<domain>/dtq/dashboard` | `https://<domain>/dtq/history` | `https://<domain>/dtq/reports` |

> **Note:** The app uses `basePath: "/dtq"` in `next.config.ts`. Port 3004 is the default dev port.

### Sidebar Navigation

The left sidebar provides navigation to the three main pages:

| Icon | Label | Route | Description |
|------|-------|-------|-------------|
| LayoutDashboard | **Dashboard** | `/dtq/dashboard` | Primary metrics, KPIs, trend charts, feature coverage |
| Clock | **Metrics History** | `/dtq/history` | 30-day trend charts and summary averages |
| FileText | **Test Reports** | `/dtq/reports` | Test run table with filtering, sorting, pagination |

### Persona Switcher

Located in the sidebar, below the navigation links. Three persona buttons are displayed:

| Persona | Icon | ID |
|---------|------|----|
| **C-Suite** | Crown | `csuite` |
| **QA Manager** | Users | `manager` |
| **Tech Lead** | Code | `techlead` |

**Behavior:** Clicking a persona button updates the entire dashboard — all features, KPIs, test runs, and daily metrics change to reflect the selected persona's data. The active persona is highlighted with the accent color.

### Live / Pause Toggle

Located in the top-right corner of every page. Displays a pulsing green dot when live.

- **Live (default):** New test runs are generated every 8–15 seconds. Metrics fluctuate with small variance.
- **Paused:** Simulation stops. Data remains static until resumed.

---

## 3. Personas — Full Spectrum

Test Pilot IQ presents the same underlying platform through three distinct lenses. Each persona has its own set of features, categories, KPIs, and test runs.

---

### 3a. C-Suite (Executive)

**Role Description:** The C-Suite persona is designed for VPs of Engineering, CTOs, and other executive stakeholders who care about business impact — revenue protection, customer experience, compliance posture, and strategic ROI on test automation.

**Summary:** 16 features | 5 categories | 7 KPIs

#### Categories & Features

**Revenue Platform** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| cs-f1 | Payment Gateway | 96% | Fully Automated | 12 | 98% | 95 |
| cs-f2 | Subscription Billing | 93% | Fully Automated | 18 | 96% | 92 |
| cs-f3 | Revenue Analytics | 91% | Fully Automated | 15 | 97% | 90 |
| cs-f4 | Pricing Engine | 88% | Partially Automated | 22 | 94% | 88 |

**Customer Experience** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| cs-f5 | Customer Portal | 94% | Fully Automated | 14 | 97% | 93 |
| cs-f6 | NPS Tracking | 89% | Partially Automated | 20 | 93% | 86 |
| cs-f7 | Support Escalation | 92% | Fully Automated | 16 | 96% | 89 |
| cs-f8 | Onboarding Journey | 90% | Fully Automated | 19 | 95% | 91 |

**Market Expansion** (3 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| cs-f9 | Multi-Region Deployment | 87% | Partially Automated | 24 | 92% | 94 |
| cs-f10 | Localization Engine | 85% | Partially Automated | 28 | 90% | 82 |
| cs-f11 | Partner Integration | 91% | Fully Automated | 17 | 95% | 87 |

**Strategic Compliance** (3 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| cs-f12 | SOC 2 Validation | 97% | Fully Automated | 10 | 99% | 96 |
| cs-f13 | GDPR Data Handling | 95% | Fully Automated | 13 | 98% | 94 |
| cs-f14 | Audit Trail System | 93% | Fully Automated | 16 | 96% | 91 |

**Digital Transformation** (2 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| cs-f15 | AI Feature Pipeline | 82% | Partially Automated | 30 | 89% | 97 |
| cs-f16 | Legacy Migration | 84% | Partially Automated | 26 | 91% | 85 |

#### KPIs (7 metrics)

| Key | Label | Value | Unit | Trend | Trend Value |
|-----|-------|-------|------|-------|-------------|
| releaseVelocity | Release Velocity | +35 | % | up | +8% |
| timeToMarket | Mean Time to Market | 12 | days | down | -4 days |
| automationROI | Automation ROI | 285 | % | up | +45% |
| escapeRate | Defect Escape Rate | 2.1 | % | down | -0.8% |
| incidentsPrevented | Incidents Prevented | 47 | count | up | +12 |
| riskReduction | Risk Reduction | 68 | % | up | +15% |
| capacityUnlocked | Capacity Unlocked | 42 | % | up | +8% |

#### Use Case Scenario

> *"As a VP of Engineering, I want to see the ROI on test automation investment. I open the Dashboard with the C-Suite persona selected. The Automation ROI metric card shows 285% — I click it and the MetricDrillDownModal reveals 30-day trends, period comparison, and category breakdown. I then ask the AI Chat 'What is our defect escape rate trend?' and receive a contextual answer with a link card that navigates me to the Metrics History page."*

---

### 3b. QA Manager

**Role Description:** The QA Manager persona focuses on team performance and operational quality — pass rates, regression execution times, test case reuse, escalation rates, and environment stability.

**Summary:** 46 features | 10 categories | 9 KPIs

#### Categories & Features

**Advanced / Enterprise** (5 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f1 | xAPI / LRS Integration | 92% | Fully Automated | 45 | 94% | 85 |
| f2 | Multi-Tenant Configuration | 88% | Partially Automated | 32 | 91% | 92 |
| f3 | Advanced Compliance Tracking | 95% | Fully Automated | 18 | 97% | 88 |
| f4 | Custom Branding Engine | 78% | Partially Automated | 25 | 89% | 65 |
| f5 | Enterprise SSO | 96% | Fully Automated | 12 | 98% | 95 |

**Learning Experience** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f6 | Adaptive Learning Paths | 85% | Partially Automated | 38 | 88% | 90 |
| f7 | Personalized Recommendations | 91% | Fully Automated | 22 | 93% | 82 |
| f8 | Skill Gap Analysis | 87% | Partially Automated | 28 | 90% | 78 |
| f9 | Learning Goals Tracking | 93% | Fully Automated | 15 | 96% | 75 |

**Reporting & Analytics** (5 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f10 | Executive Dashboard | 94% | Fully Automated | 20 | 95% | 92 |
| f11 | Custom Report Builder | 82% | Partially Automated | 35 | 87% | 85 |
| f12 | Learning Analytics | 89% | Partially Automated | 42 | 91% | 88 |
| f13 | Compliance Reports | 97% | Fully Automated | 10 | 99% | 94 |
| f14 | Export Center | 90% | Fully Automated | 16 | 94% | 70 |

**Course Catalog & Enrollment** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f15 | Course Discovery | 86% | Partially Automated | 30 | 89% | 85 |
| f16 | Self-Enrollment | 95% | Fully Automated | 14 | 97% | 90 |
| f17 | Manager-Assigned Learning | 88% | Partially Automated | 24 | 92% | 82 |
| f18 | Waitlist Management | 79% | Partially Automated | 20 | 86% | 60 |

**Social & Collaboration** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f19 | Discussion Forums | 83% | Partially Automated | 26 | 88% | 75 |
| f20 | Peer Reviews | 91% | Fully Automated | 18 | 93% | 72 |
| f21 | Learning Groups | 87% | Partially Automated | 22 | 90% | 68 |
| f22 | Social Sharing | 76% | Partially Automated | 15 | 85% | 55 |

**Course Creation & Management** (5 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f23 | SCORM Import | 94% | Fully Automated | 19 | 95% | 88 |
| f24 | Content Authoring | 81% | Partially Automated | 34 | 86% | 92 |
| f25 | Assessment Builder | 89% | Partially Automated | 28 | 91% | 85 |
| f26 | Media Library | 85% | Partially Automated | 21 | 89% | 78 |
| f27 | Course Versioning | 92% | Fully Automated | 16 | 94% | 80 |

**Admin & Configuration** (6 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f28 | User Management | 96% | Fully Automated | 12 | 98% | 95 |
| f29 | Role-Based Access Control | 93% | Fully Automated | 18 | 96% | 94 |
| f30 | Notification Settings | 84% | Partially Automated | 22 | 88% | 65 |
| f31 | Integration Hub | 78% | Partially Automated | 36 | 85% | 88 |
| f32 | Audit Logs | 97% | Fully Automated | 10 | 99% | 90 |
| f33 | System Configuration | 88% | Partially Automated | 24 | 91% | 85 |

**Assessments & Certification** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f34 | Quiz Engine | 92% | Fully Automated | 20 | 94% | 88 |
| f35 | Certification Paths | 90% | Fully Automated | 16 | 93% | 92 |
| f36 | Proctoring Support | 75% | Partially Automated | 32 | 84% | 78 |
| f37 | Certificate Designer | 86% | Partially Automated | 18 | 90% | 70 |

**Events & Live Sessions** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f38 | Webinar Integration | 82% | Partially Automated | 28 | 87% | 82 |
| f39 | ILT Scheduling | 89% | Partially Automated | 22 | 92% | 85 |
| f40 | Attendance Tracking | 94% | Fully Automated | 14 | 96% | 78 |
| f41 | Virtual Classroom | 77% | Partially Automated | 38 | 85% | 88 |

**Core User Journeys** (5 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| f42 | User Onboarding | 91% | Fully Automated | 24 | 93% | 95 |
| f43 | Course Completion Flow | 95% | Fully Automated | 12 | 97% | 98 |
| f44 | Profile Management | 88% | Partially Automated | 18 | 91% | 72 |
| f45 | Mobile Experience | 79% | Partially Automated | 42 | 86% | 90 |
| f46 | Search & Discovery | 84% | Partially Automated | 30 | 88% | 85 |

#### KPIs (9 metrics)

| Key | Label | Value | Unit | Trend | Trend Value |
|-----|-------|-------|------|-------|-------------|
| passRate | Test Pass Rate | 94.2 | % | up | +2.3% |
| autoManualRatio | Automated vs Manual | 8.5:1 | ratio | up | +0.5 |
| effectiveness | Test Case Effectiveness | 0.87 | score | stable | 0.0 |
| regressionTime | Regression Execution | 42 | min | down | -8 min |
| firstRunPass | First-Run Pass Rate | 87.5 | % | up | +4.2% |
| escalationRate | Escalation Rate | 12.3 | % | down | -2.1% |
| testReuse | Test Case Reuse | 76.8 | % | up | +5.3% |
| blockerDefects | Blocker Defects | 3 | count | down | -2 |
| envUptime | Environment Uptime | 99.2 | % | stable | 0.0% |

#### Use Case Scenario

> *"As a QA Manager, I want to monitor my team's pass rates and identify flaky test areas. I open the Dashboard and see the Test Pass Rate KPI at 94.2% with an upward trend. I click the Regression Execution metric card and see it's down to 42 minutes — an 8-minute improvement. In the Feature Coverage section, I expand 'Core User Journeys' and click 'Mobile Experience' (risk score 42) to see its 14-day history chart and open defects."*

---

### 3c. Tech Lead (Engineer)

**Role Description:** The Tech Lead persona provides engineering depth — CI/CD pipeline health, API infrastructure reliability, performance engineering metrics, security testing posture, and DevOps automation coverage.

**Summary:** 18 features | 5 categories | 8 KPIs

#### Categories & Features

**CI/CD Pipeline** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| tl-f1 | Build Orchestration | 88% | Fully Automated | 25 | 91% | 90 |
| tl-f2 | Deploy Pipeline | 85% | Partially Automated | 32 | 88% | 92 |
| tl-f3 | Rollback Automation | 82% | Partially Automated | 35 | 86% | 88 |
| tl-f4 | Feature Flags | 90% | Fully Automated | 20 | 93% | 78 |

**API Infrastructure** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| tl-f5 | REST API Gateway | 92% | Fully Automated | 18 | 94% | 95 |
| tl-f6 | GraphQL Layer | 79% | Partially Automated | 38 | 85% | 88 |
| tl-f7 | Rate Limiting | 86% | Fully Automated | 22 | 92% | 82 |
| tl-f8 | API Versioning | 83% | Partially Automated | 28 | 89% | 76 |

**Performance Engineering** (3 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| tl-f9 | Load Testing Framework | 78% | Partially Automated | 40 | 84% | 90 |
| tl-f10 | Memory Profiler | 75% | Partially Automated | 36 | 82% | 85 |
| tl-f11 | CDN Optimization | 91% | Fully Automated | 15 | 95% | 80 |

**Security Testing** (3 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| tl-f12 | Penetration Test Suite | 70% | Partially Automated | 45 | 80% | 96 |
| tl-f13 | Dependency Scanner | 93% | Fully Automated | 16 | 94% | 88 |
| tl-f14 | Auth Token Validation | 89% | Fully Automated | 20 | 92% | 94 |

**DevOps Automation** (4 features)

| ID | Feature | Coverage | Status | Risk | Pass Rate | Impact |
|----|---------|----------|--------|------|-----------|--------|
| tl-f15 | Container Orchestration | 84% | Partially Automated | 30 | 88% | 92 |
| tl-f16 | Log Aggregation | 87% | Fully Automated | 19 | 91% | 78 |
| tl-f17 | Infra-as-Code | 81% | Partially Automated | 33 | 86% | 90 |
| tl-f18 | Secrets Management | 96% | Fully Automated | 10 | 98% | 95 |

#### KPIs (8 metrics)

| Key | Label | Value | Unit | Trend | Trend Value |
|-----|-------|-------|------|-------|-------------|
| flakyRate | Flaky Test Rate | 3.2 | % | down | -1.5% |
| avgExecution | Avg Execution Time | 4.2 | min | down | -0.8 min |
| tokenCost | Token Usage Cost | 0.42 | $ | down | -$0.15 |
| contextHitRate | Context Hit Rate | 94.5 | % | up | +2.3% |
| toolCallSuccess | Tool Call Success | 97.8 | % | up | +1.2% |
| parallelEfficiency | Parallel Efficiency | 78.5 | % | up | +5% |
| automationCoverage | Automation Coverage | 93.3 | % | up | +2.1% |
| totalTests | Total Test Cases | 1247 | count | up | +86 |

#### Use Case Scenario

> *"As a Tech Lead, I want to see flaky test rates and pipeline efficiency. I switch to the Tech Lead persona and immediately see the Flaky Test Rate at 3.2% (trending down). I click the 'CI/CD Pipeline' category in Feature Coverage and the CategoryAnalyticsModal shows a bar chart comparing Build Orchestration, Deploy Pipeline, Rollback Automation, and Feature Flags. I notice Rollback Automation has a risk score of 35, so I click it to see its 14-day trend and 2 open defects."*

---

## 4. Dashboard Page — Full Walkthrough

The Dashboard (`/dtq/dashboard`) is the primary page. It is divided into six sections from top to bottom.

### 4.1 Header

- **Title:** "Test IQ Dashboard" (with "Dashboard" in accent pink `#ff3366`)
- **Subtitle:** "AI-Powered Testing Intelligence for Enterprise Quality"
- **Live Indicator:** Top-right, shows pulsing green dot when live, last update timestamp, and toggle button.

### 4.2 Persona Card

Displays the currently selected persona with its icon, name, title, and description. Updates when the persona is switched via the sidebar.

### 4.3 Primary Metrics Grid (4 cards)

Four `MetricCard` components in a responsive grid (1 column on mobile, 2 on tablet, 4 on desktop):

| Card | Value (Manager Example) | Subtitle | Icon | Click Action |
|------|------------------------|----------|------|--------------|
| **Total Features** | 46 | "88% avg coverage" | Layers | Opens MetricDrillDownModal |
| **Automation Rate** | 43% | "20 fully automated" | Cpu | Opens MetricDrillDownModal |
| **Risk Distribution** | "3 High" | "25 Med / 18 Low" | AlertTriangle | Opens MetricDrillDownModal |
| **Open Defects** | 47 | "Across all features" | Bug | Opens MetricDrillDownModal |

> **Note:** Values shown are for the QA Manager persona. C-Suite and Tech Lead personas display different computed values.

### 4.4 High Risk Banner

Appears when any features have a risk score ≥ 40. Displays the top 3 highest-risk features as clickable cards.

- Each card shows: feature name, risk score, coverage %, and pass rate.
- Clicking a feature card opens the **FeatureDetailModal**.
- The banner can be expanded or dismissed.

**Manager persona example (risk ≥ 40):**

| Feature | Risk Score | Coverage | Pass Rate |
|---------|-----------|----------|-----------|
| xAPI / LRS Integration | 45 | 92% | 94% |
| Learning Analytics | 42 | 89% | 91% |
| Mobile Experience | 42 | 79% | 86% |

### 4.5 Persona-Specific KPI Grid

Displays role-specific metrics in a responsive grid (1/2/3 columns). Each KPI card is clickable and opens the **MetricDrillDownModal**.

- **C-Suite:** 7 KPIs (see Section 3a)
- **QA Manager:** 9 KPIs (see Section 3b)
- **Tech Lead:** 8 KPIs (see Section 3c)

Each card shows: label, value with unit, description, trend direction (up/down/stable), and trend value.

### 4.6 Trend Charts (7-Day)

Two charts side by side (stacked on mobile):

| Chart | Type | Color | Data Source |
|-------|------|-------|-------------|
| **Test Pass Rate Trend (7 Days)** | Line chart | `var(--accent-primary)` | Last 7 entries of `dailyMetrics.passRate` |
| **Automation Coverage (7 Days)** | Area chart | `var(--chart-secondary)` | Last 7 entries of `dailyMetrics.automationCoverage` |

**Click interaction:** Clicking any data point on either chart opens the **ChartDrillDownModal** with that point's value, date, trend analysis, and context comparison.

### 4.7 Feature Coverage Section

An expandable accordion of categories. Each category header shows:
- Category name
- Number of features
- Average coverage %
- High-risk feature count

**Interactions:**
- **Click category header:** Expands to show feature list; also serves as button to open **CategoryAnalyticsModal**.
- **Click feature row:** Opens the **FeatureDetailModal** for that feature.
- **Search:** A search input filters features by name across all categories.

---

## 5. Test Reports Page — Full Walkthrough

The Reports page (`/dtq/reports`) provides a comprehensive test execution history with filtering, sorting, pagination, and export capabilities.

### 5.1 Header

- **Title:** "Test Reports" (with "Reports" in accent pink)
- **Subtitle:** "Test execution history and issue tracking"
- **Live Indicator:** Top-right with live/pause toggle.
- **Refresh Button:** Manual refresh icon button next to the live indicator.

### 5.2 Summary Row (4 metric cards)

| Card | Value | Icon | Interactive |
|------|-------|------|-------------|
| **Total Runs** | Dynamic count | TestTube2 | No |
| **Pass Rate** | Computed % | Activity | No |
| **Failed Runs** | Count of failed | XCircle | No |
| **Avg Duration** | Computed average (seconds) | Clock | No |

These cards are informational only (not clickable).

### 5.3 Filter Bar

Three sections arranged horizontally:

**Status Filter Tabs:**
- **All** — Shows all test runs with count
- **Passed** — Shows only passed runs with count
- **Failed** — Shows only failed runs with count

Active tab is highlighted with an elevated background.

**Search Input:**
- Placeholder: "Search feature name..."
- Filters test runs by feature name (case-insensitive substring match)
- Has a search icon on the left

**Export Buttons:**
- **Export CSV** — Downloads a `.csv` file of all test runs
- **Export PDF** — Opens browser print dialog for PDF generation

### 5.4 Sortable Table

6 columns with sort functionality:

| Column | Sortable | Sort Key | Description |
|--------|----------|----------|-------------|
| **Status** | Yes | `status` | Pass/fail icon (CheckCircle2 green / XCircle red) |
| **Feature Name** | Yes | `featureName` | Feature name text |
| **Tests** | No | — | Passed/Total format (e.g., "18/18") |
| **Duration** | Yes | `duration` | Duration in seconds (hidden on mobile) |
| **Executed** | Yes | `executedAt` | Relative time (e.g., "2 days ago") |
| **Issues** | Yes | `issues` | Issue count badge or dash (hidden on mobile) |

**Sort behavior (3-click cycle):**
1. First click: Sort ascending (↑ arrow shown)
2. Second click: Sort descending (↓ arrow shown)
3. Third click: Clear sort (returns to default order)

Unsorted columns show a faint ↑ arrow on hover.

**Row click:** Opens the **TestRunDetailModal** for that test run.

### 5.5 Row Highlight

When a new test run is generated by the real-time simulation, the newest row receives a brief highlight animation (`animate-highlight-row`) for 1.5 seconds.

### 5.6 Pagination

Displayed below the table when there are results:

- **Row indicator:** "1–10 of 40 runs"
- **Navigation buttons:** First (⏮), Previous (◀), Page numbers, Next (▶), Last (⏭)
- **Page size:** 10 rows per page (constant `ROWS_PER_PAGE = 10`)
- **Smart ellipsis:** Shows first, last, current, and neighbor page numbers with "..." for gaps
- Page resets to 1 when filters or sort change

### 5.7 Empty State

When no test runs match the current filters, a centered message appears:
- Search icon
- "No test runs match your filters"
- "Try adjusting the status filter or search query"

### 5.8 Cross-Modal Navigation

From the **TestRunDetailModal**, clicking "View Feature" navigates to the **FeatureDetailModal** for the associated feature. The test run modal closes and the feature modal opens.

---

## 6. Metrics History Page — Full Walkthrough

The Metrics History page (`/dtq/history`) provides 30-day trend analysis with four summary cards and four trend charts.

### 6.1 Header

- **Title:** "Team Performance Metrics" (with "Metrics" in accent pink)
- **Subtitle:** "Monitor team effectiveness and quality trends over the past 30 days"
- **Live Indicator:** Top-right with live/pause toggle.

### 6.2 Summary Cards (30-Day Averages)

Four large `MetricCard` components, each clickable to open **MetricDrillDownModal**:

| Card | Icon | Metric Key | Description |
|------|------|-----------|-------------|
| **Average Pass Rate** | CheckCircle2 | `passRate` | 30-day average of `dailyMetrics.passRate` |
| **First Pass Rate** | Zap | `firstRunPassRate` | 30-day average of `dailyMetrics.firstRunPassRate` |
| **Defect Detection** | Bug | `defectDetection` | 30-day average of `dailyMetrics.defectDetection` |
| **Test Effectiveness** | Target | `effectiveness` | 30-day average of `dailyMetrics.effectiveness` |

### 6.3 Trend Charts (30-Day, Full Range)

Four charts in a 2×2 grid:

| Chart | Type | Color | Data Source |
|-------|------|-------|-------------|
| **Test Pass Rate Trend** | Line | `var(--status-success)` | All 30 days of `passRate` |
| **First Run Pass Rate** | Line | `var(--accent-primary)` | All 30 days of `firstRunPassRate` |
| **Defect Detection Percentage** | Area | `var(--risk-medium)` | All 30 days of `defectDetection` |
| **Test Case Effectiveness** | Area | `var(--chart-secondary)` | All 30 days of `effectiveness` |

**Click interaction:** Clicking any data point opens the **ChartDrillDownModal** with detailed analysis of that day's value, including comparison to previous/next days and percentile ranking.

---

## 7. AI Chat Assistant — Full Walkthrough

The AI Chat Assistant is a floating widget accessible from every page. It provides natural-language Q&A powered by Claude AI with RAG (Retrieval-Augmented Generation).

### 7.1 How to Open

A **floating action button** (FAB) is fixed at the bottom-right corner of the screen:
- Pink circle (`var(--accent-primary)`) with a `MessageCircle` icon
- Pulsing shadow effect
- Click to open the chat panel

When closed, an **unread badge** appears on the FAB if there are new messages (shows count, "9+" for 10+).

### 7.2 Chat Panel

When open, a 400px-wide (full-width on mobile) panel slides up from the bottom-right:

**Header:**
- AI sparkle icon with "AI Insights" title
- "Powered by intelligent analysis" subtitle
- Persona badge showing current persona (C-Suite / Manager / Tech Lead)
- Reset button (appears when messages exist) — clears all messages
- Close button (X)

**Welcome State (no messages):**
- Bot icon
- "Ask me about your testing metrics"
- "I have access to all 46 features with real-time data"

### 7.3 Quick Action Pills

Four pre-built query buttons, always visible above the input area:

| ID | Icon | Label |
|----|------|-------|
| `high-risk` | Target | High-risk features |
| `feature-status` | BarChart3 | Feature status |
| `automation-gaps` | Settings | Automation gaps |
| `quality-summary` | TrendingUp | Quality summary |

Clicking a pill sends the label as a user message and triggers the AI response pipeline.

### 7.4 Custom Questions

Type a question in the input field and press Enter or click the Send button. The input field auto-focuses when the panel opens.

### 7.5 RAG Pipeline

The full pipeline for each question:

1. **User message** is sent to `/api/dtq/chat` along with the current persona and conversation history.
2. **Embedding:** The message is converted to a 1536-dimensional vector using OpenAI's `text-embedding-3-small` model.
3. **Semantic search:** The vector is used to query `public.search_dtq_knowledge_semantic`, which performs cosine similarity search across 130 knowledge base items.
4. **Context injection:** Top matching items are injected as context into the Claude prompt.
5. **Claude response:** Claude Sonnet 4 generates a response using the RAG context, persona awareness, and conversation history.
6. **Link resolution:** The response text is processed by `link-resolver.ts` using a 4-tier resolution pipeline with a global entity index (80 features, 20 categories, 24 KPIs across all 3 personas):
   - **Tier 1 — Source-based:** Maps all 5 RAG source types (`feature`, `category_summary`, `persona_kpi`, `test_run_summary`, `daily_metrics_summary`) to navigation links
   - **Tier 2 — Entity text scanning:** Substring matches entity names in the response text (bold text first, then full-text scan); cross-persona feature resolution enabled
   - **Tier 3 — Keyword detection:** ~20 pattern groups covering test execution, trends, pass rate, defects, automation, risk, effectiveness, compliance, security, CI/CD, performance, API, revenue, learning, assessments, and more
   - **Tier 4 — Context-aware fallback:** Guarantees every response has at least 1 link; uses persona-appropriate defaults when all other tiers produce no matches
   - **Constraints:** Maximum 5 links per response; minimum entity name length of 4 characters for substring matching; features sorted by name length descending to avoid partial matches
7. **Response rendered** with markdown formatting, source count, and related link cards.

### 7.6 Related Link Cards

Below AI responses, link cards may appear under a "Related" header. Each card shows:
- An icon matching the link target type (Target for feature, Boxes for category, Activity for metric, FileText for report, Clock for history, TestTube2 for test-run)
- Label (feature/category/metric name)
- Description (optional context)
- Chevron arrow on hover

**Click behavior:** Clicking a link card triggers `NavigationContext.dispatch()`, which:
1. Routes to the target page (`/dtq/dashboard`, `/dtq/reports`, or `/dtq/history`)
2. Sets a `pendingAction` with the link details
3. The target page's `useEffect` detects the pending action and opens the corresponding modal
4. The action is cleared after processing

### 7.7 Demo Mode vs RAG Mode

- **RAG Mode (default):** When API keys are configured, the full RAG pipeline is used.
- **Demo Mode (fallback):** When the API call fails, pre-built responses from `aiResponses` in `data.ts` are used. These provide rich markdown responses for the four quick actions.

### 7.8 Cross-Page Chat Persistence

The chat widget uses `ChatContext` to persist messages across page navigation. Messages are maintained in React state and survive route changes within the SPA.

### 7.9 Example Conversations by Persona

**C-Suite:**
- "What's our automation ROI?" → Response with 285% ROI, cost savings breakdown, link to Automation ROI metric
- "Show high-risk features" → Response listing AI Feature Pipeline (risk 30), Localization Engine (risk 28), Legacy Migration (risk 26)

**QA Manager:**
- "What's our regression execution time?" → Response with 42 min, -8 min improvement, link to regression metric
- "Which features have the most open defects?" → Response listing top defect features with links

**Tech Lead:**
- "What's the flaky test rate?" → Response with 3.2%, trending down, link to Flaky Test Rate metric
- "Show CI/CD pipeline status" → Response with Build Orchestration, Deploy Pipeline details, links to features

---

## 8. Interactive Modals — Reference

All modals use a shared `BaseModal` component with animated entry/exit (Framer Motion), escape key handling, tab focus trapping, and customizable sizes (sm/md/lg/xl/full).

### 8.1 MetricDrillDownModal

**Triggered by:** Clicking any metric card (Dashboard KPIs, Dashboard primary metrics, History summary cards)

**Contents:**
- **Header:** Metric label, current value with unit, trend badge
- **30-Day Trend Chart:** Area chart showing the metric's daily values over 30 days
- **Statistics Row:** Current value, 30-Day Average, Peak, Low
- **Period Comparison:** Current value vs previous period value with percentage change
- **Category Breakdown:** Bar chart showing the metric broken down by feature category
- **Related Features:** List of features most impacted by this metric

### 8.2 ChartDrillDownModal

**Triggered by:** Clicking a data point on any trend chart (Dashboard or History)

**Contents:**
- **Header:** Metric label and date
- **Large Value Display:** The selected data point's value prominently displayed
- **Trend vs Previous Day:** Percentage change from the previous day
- **Percentile Ranking:** Where this value falls in the 30-day distribution
- **Context Comparison:** Previous day and next day values side by side
- **Contributing Factors:** List of factors that may have influenced this data point

### 8.3 FeatureDetailModal

**Triggered by:** Clicking a feature in Feature Coverage, High Risk Banner, or via cross-modal navigation

**Contents:**
- **Header:** Feature name, category, automation status badge
- **4 KPI Cards:** Coverage %, Risk Score, Open Defects (open/closed), Pass Rate
- **14-Day History Chart:** Line chart showing the feature's pass rate over the last 14 days
- **Recent Test Runs:** List of up to 10 most recent test runs for this feature, with status icons, test counts, duration, and timestamps
- **Open Defects Section:** List of current open defects with severity badges

### 8.4 CategoryAnalyticsModal

**Triggered by:** Clicking a category header in Feature Coverage

**Contents:**
- **Header:** Category name with feature count
- **4 Summary Cards:** Average coverage, average pass rate, high-risk feature count, total open defects
- **Feature Comparison Bar Chart:** Horizontal bar chart comparing coverage across all features in the category
- **Risk Distribution Pie Chart:** Pie chart showing the distribution of risk scores (high/medium/low)
- **Automation Breakdown:** Visual showing fully automated vs partially automated feature counts
- **Clickable Feature List:** Each feature row is clickable, opening the FeatureDetailModal (cross-modal navigation: category modal closes, feature modal opens)

### 8.5 TestRunDetailModal

**Triggered by:** Clicking a row in the Reports table

**Contents:**
- **Header:** Feature name, with status and date as description
- **Status Badge:** Large pass/fail indicator
- **4 Stat Cards:** Total Tests, Passed Tests, Failed Tests, Pass Rate (%)
- **Issues Section (failed runs only):**
  - Severity filter tabs (All / High / Medium / Low)
  - Each issue shows: test case name, severity badge, error message
  - Expandable stack trace (click to toggle)
  - **Copy button:** Copies stack trace to clipboard
- **View Feature Button:** Cross-modal navigation to the FeatureDetailModal for the associated feature

---

## 9. Real-Time Simulation

### How It Works

The `useRealTimeSimulation` hook manages two simulation loops:

1. **Metric Fluctuation (every 10 seconds):** The latest day's daily metrics receive small random variance (±0.5–1.5%) to simulate live metric movement.

2. **New Test Run Generation (every 8–15 seconds):** A new test run is generated with:
   - A random feature from the current persona's feature set
   - ~85% pass rate probability
   - 10–34 total tests per run
   - 1–5 failed tests (if failed)
   - 4–13 second duration
   - Error messages and stack traces selected from pre-defined pools

### Live / Pause Toggle

- **Location:** Top-right corner of every page
- **Live state:** Green pulsing dot, simulation active
- **Paused state:** Grey dot, simulation paused
- **Timestamp:** Shows "Updated X seconds ago" based on last update

### Feature Pass Rate Updates

When a new test run is generated, the associated feature's pass rate is updated using an **exponential moving average** to provide smooth, realistic fluctuation.

### Manual Refresh (Reports Page)

The Reports page includes a refresh button (rotating arrow icon) next to the Live Indicator. Clicking it triggers an immediate data refresh without waiting for the next simulation tick.

---

## 10. Data Export

### CSV Export

Three export functions are available:

**Test Runs CSV (`exportTestRunsToCSV`):**
- File name: `test-reports-YYYY-MM-DD.csv`
- Columns: ID, Feature, Status, Total Tests, Passed, Failed, Duration (s), Executed At
- Includes all test runs in the current dataset

**Features CSV (`exportFeaturesToCSV`):**
- File name: `features-YYYY-MM-DD.csv`
- Columns: ID, Name, Category, Coverage (%), Status, Open Defects, Closed Defects, Risk Score, Pass Rate (%), Impact Score

**Metrics CSV (`exportMetricsToCSV`):**
- File name: `metrics-YYYY-MM-DD.csv`
- Columns: Date, Pass Rate (%), First Run Pass Rate (%), Defect Detection (%), Effectiveness (%), Automation Coverage (%)

### PDF Export

**Method:** `exportTestRunsToPDF` generates an HTML document with styled tables and opens the browser's print dialog (`window.print()`). The user can then save as PDF from the print dialog.

**Includes:** Test run summary table with pass/fail status, test counts, duration, and execution timestamps.

### File Naming Convention

All exported files follow the pattern: `{type}-YYYY-MM-DD.{ext}`

Examples:
- `test-reports-2026-02-04.csv`
- `features-2026-02-04.csv`
- `metrics-2026-02-04.csv`

---

## 11. TDD Test Scenarios (Full Spectrum)

The following test cases are structured as executable specifications using Given/When/Then format. They cover every interactive element in the application.

---

### 11.1 Navigation Tests

#### NAV-001: Sidebar navigation to Dashboard
```
Given the user is on any page
When they click "Dashboard" in the sidebar
Then the URL changes to /dtq/dashboard
And the Dashboard page content is displayed
And the "Dashboard" sidebar link is highlighted
```

#### NAV-002: Sidebar navigation to Metrics History
```
Given the user is on any page
When they click "Metrics History" in the sidebar
Then the URL changes to /dtq/history
And the History page content is displayed
And the "Metrics History" sidebar link is highlighted
```

#### NAV-003: Sidebar navigation to Test Reports
```
Given the user is on any page
When they click "Test Reports" in the sidebar
Then the URL changes to /dtq/reports
And the Reports page content is displayed
And the "Test Reports" sidebar link is highlighted
```

#### NAV-004: Persona switching to C-Suite
```
Given the user is on the Dashboard page
When they click the "C-Suite" persona button in the sidebar
Then all metric cards update to show C-Suite data (16 features, 7 KPIs)
And the persona card displays "C-Suite / Executive"
And the Feature Coverage section shows 5 categories
```

#### NAV-005: Persona switching to QA Manager
```
Given the user is on the Dashboard page
When they click the "QA Manager" persona button in the sidebar
Then all metric cards update to show Manager data (46 features, 9 KPIs)
And the persona card displays "QA Manager / Manager"
And the Feature Coverage section shows 10 categories
```

#### NAV-006: Persona switching to Tech Lead
```
Given the user is on the Dashboard page
When they click the "Tech Lead" persona button in the sidebar
Then all metric cards update to show Tech Lead data (18 features, 8 KPIs)
And the persona card displays "Tech Lead / Engineer"
And the Feature Coverage section shows 5 categories
```

#### NAV-007: Direct URL access to Dashboard
```
Given the user navigates directly to /dtq/dashboard
Then the Dashboard page loads with the default persona (Manager)
And all components render without errors
```

#### NAV-008: Direct URL access to Reports
```
Given the user navigates directly to /dtq/reports
Then the Reports page loads with test run data
And the table displays up to 10 rows per page
```

#### NAV-009: Direct URL access to History
```
Given the user navigates directly to /dtq/history
Then the History page loads with 30-day metric data
And all 4 trend charts render
```

---

### 11.2 Dashboard Tests

#### DASH-001: Primary metric card click opens MetricDrillDownModal
```
Given the user is on the Dashboard page
When they click the "Total Features" metric card
Then the MetricDrillDownModal opens
And it displays the label "Total Features"
And it shows a 30-day trend chart
And it includes period comparison data
```

#### DASH-002: Automation Rate metric card click
```
Given the user is on the Dashboard page
When they click the "Automation Rate" metric card
Then the MetricDrillDownModal opens
And it displays the automation rate value with "%" unit
And the trend shows "up"
```

#### DASH-003: Risk Distribution metric card click
```
Given the user is on the Dashboard page
When they click the "Risk Distribution" metric card
Then the MetricDrillDownModal opens
And it displays the high-risk count with "high risk" unit
```

#### DASH-004: Open Defects metric card click
```
Given the user is on the Dashboard page
When they click the "Open Defects" metric card
Then the MetricDrillDownModal opens
And it displays the open defects count
```

#### DASH-005: Persona KPI card click opens MetricDrillDownModal
```
Given the user is on the Dashboard with QA Manager persona
When they click the "Test Pass Rate" KPI card
Then the MetricDrillDownModal opens
And it displays "Test Pass Rate" with value 94.2%
And trend shows "up" with "+2.3%"
```

#### DASH-006: Pass Rate chart data point click
```
Given the user is on the Dashboard page
When they click a data point on the "Test Pass Rate Trend" chart
Then the ChartDrillDownModal opens
And it shows the value for the clicked date
And it displays comparison to previous/next days
```

#### DASH-007: Automation Coverage chart data point click
```
Given the user is on the Dashboard page
When they click a data point on the "Automation Coverage" chart
Then the ChartDrillDownModal opens
And it shows the automation coverage value for that date
```

#### DASH-008: Feature click opens FeatureDetailModal
```
Given the user is on the Dashboard with a category expanded
When they click a feature row (e.g., "Mobile Experience")
Then the FeatureDetailModal opens
And it shows the feature name, category, and status
And it displays 4 KPI cards (coverage, risk, defects, pass rate)
And it shows a 14-day history chart
And it lists recent test runs
```

#### DASH-009: Category click opens CategoryAnalyticsModal
```
Given the user is on the Dashboard page
When they click a category header (e.g., "Core User Journeys")
Then the CategoryAnalyticsModal opens
And it shows summary cards for the category
And it displays a feature comparison bar chart
And it shows a risk distribution pie chart
```

#### DASH-010: High Risk Banner feature click
```
Given the user is on the Dashboard with high-risk features present
When they click a feature in the High Risk Banner
Then the FeatureDetailModal opens for that feature
And the risk score is displayed (≥ 40)
```

#### DASH-011: Live toggle pause
```
Given the simulation is running (live)
When the user clicks the Live toggle
Then the indicator changes to paused state (grey dot)
And no new test runs are generated
And metrics stop fluctuating
```

#### DASH-012: Live toggle resume
```
Given the simulation is paused
When the user clicks the Live toggle
Then the indicator changes to live state (green pulsing dot)
And new test runs resume generating every 8-15 seconds
And metrics resume fluctuating
```

#### DASH-013: Feature Coverage search
```
Given the user is on the Dashboard page
When they type "mobile" in the Feature Coverage search input
Then only features matching "mobile" are displayed
And non-matching features are hidden
```

#### DASH-014: Cross-modal from CategoryAnalyticsModal to FeatureDetailModal
```
Given the CategoryAnalyticsModal is open
When the user clicks a feature in the category's feature list
Then the CategoryAnalyticsModal closes
And the FeatureDetailModal opens for the clicked feature
```

---

### 11.3 Reports Tests

#### RPT-001: Status filter — All tab
```
Given the user is on the Reports page
When they click the "All" filter tab
Then all test runs are displayed in the table
And the tab shows the total count
```

#### RPT-002: Status filter — Passed tab
```
Given the user is on the Reports page
When they click the "Passed" filter tab
Then only passed test runs are displayed
And every row shows a green check icon
And the tab count matches the visible rows
```

#### RPT-003: Status filter — Failed tab
```
Given the user is on the Reports page
When they click the "Failed" filter tab
Then only failed test runs are displayed
And every row shows a red X icon
And the issue column shows non-zero counts
```

#### RPT-004: Search by feature name
```
Given the user is on the Reports page
When they type "SCORM" in the search input
Then only test runs with "SCORM" in the feature name are shown
And the pagination updates to reflect the filtered count
```

#### RPT-005: Column sorting — ascending
```
Given the user is on the Reports page with no active sort
When they click the "Feature Name" column header
Then rows are sorted alphabetically A→Z by feature name
And an up arrow (↑) appears next to the column header
```

#### RPT-006: Column sorting — descending
```
Given the "Feature Name" column is sorted ascending
When the user clicks the "Feature Name" column header again
Then rows are sorted alphabetically Z→A
And a down arrow (↓) appears next to the column header
```

#### RPT-007: Column sorting — clear
```
Given the "Feature Name" column is sorted descending
When the user clicks the "Feature Name" column header a third time
Then the sort is cleared
And rows return to default order (most recent first)
And no sort arrow is displayed
```

#### RPT-008: Duration column sorting
```
Given the user is on the Reports page
When they click the "Duration" column header
Then rows are sorted by duration ascending (shortest first)
```

#### RPT-009: Executed column sorting
```
Given the user is on the Reports page
When they click the "Executed" column header
Then rows are sorted by execution date ascending (oldest first)
```

#### RPT-010: Issues column sorting
```
Given the user is on the Reports page
When they click the "Issues" column header
Then rows are sorted by issue count ascending (0 first)
```

#### RPT-011: Pagination — next page
```
Given the Reports table has more than 10 rows
When the user clicks the Next page button (▶)
Then the table shows rows 11-20
And the row indicator updates to "11–20 of N runs"
```

#### RPT-012: Pagination — previous page
```
Given the user is on page 2 of the Reports table
When they click the Previous page button (◀)
Then the table shows rows 1-10
```

#### RPT-013: Pagination — first page
```
Given the user is on page 3 of the Reports table
When they click the First page button (⏮)
Then the table shows rows 1-10
And page 1 is highlighted in the page numbers
```

#### RPT-014: Pagination — last page
```
Given the user is on page 1 of the Reports table
When they click the Last page button (⏭)
Then the table shows the final page of results
```

#### RPT-015: Pagination — page number click
```
Given the Reports table has multiple pages
When the user clicks page number "2"
Then the table shows rows 11-20
And page 2 is highlighted
```

#### RPT-016: Pagination — smart ellipsis
```
Given the Reports table has 5+ pages
And the user is on page 3
Then the page numbers show: 1 ... 2 3 4 ... 5
```

#### RPT-017: Row click opens TestRunDetailModal
```
Given the user is on the Reports page
When they click a test run row
Then the TestRunDetailModal opens
And it shows the feature name with status and date
And it displays test counts (total, passed, failed)
```

#### RPT-018: Cross-modal — test run to feature detail
```
Given the TestRunDetailModal is open
When the user clicks "View Feature"
Then the TestRunDetailModal closes
And the FeatureDetailModal opens for the associated feature
```

#### RPT-019: CSV export download
```
Given the user is on the Reports page
When they click "Export CSV"
Then a file named "test-reports-YYYY-MM-DD.csv" downloads
And it contains headers: ID, Feature, Status, Total Tests, Passed, Failed, Duration (s), Executed At
And every test run is included as a row
```

#### RPT-020: PDF export dialog
```
Given the user is on the Reports page
When they click "Export PDF"
Then the browser print dialog opens
And the print preview shows a styled test run table
```

#### RPT-021: Row highlight on newest run
```
Given the simulation is live
When a new test run is generated
Then the newest row receives a highlight animation
And the highlight fades after 1.5 seconds
```

#### RPT-022: Filter resets pagination
```
Given the user is on page 3 of the Reports table
When they click the "Failed" filter tab
Then the page resets to page 1
And only failed runs are shown
```

#### RPT-023: Search resets pagination
```
Given the user is on page 2 of the Reports table
When they type a search query
Then the page resets to page 1
```

#### RPT-024: Empty state display
```
Given the user is on the Reports page
When they search for a non-existent feature name (e.g., "xyznonexistent")
Then the table shows an empty state message
And the message says "No test runs match your filters"
```

---

### 11.4 History Tests

#### HIST-001: Summary card click — Average Pass Rate
```
Given the user is on the History page
When they click the "Average Pass Rate" summary card
Then the MetricDrillDownModal opens
And it displays "Average Pass Rate" with the 30-day average
And it shows a 30-day trend chart
```

#### HIST-002: Summary card click — First Pass Rate
```
Given the user is on the History page
When they click the "First Pass Rate" summary card
Then the MetricDrillDownModal opens
And it displays the first-run pass rate average
```

#### HIST-003: Summary card click — Defect Detection
```
Given the user is on the History page
When they click the "Defect Detection" summary card
Then the MetricDrillDownModal opens
And it displays the defect detection average
```

#### HIST-004: Summary card click — Test Effectiveness
```
Given the user is on the History page
When they click the "Test Effectiveness" summary card
Then the MetricDrillDownModal opens
And it displays the effectiveness average
```

#### HIST-005: Chart point click — Pass Rate Trend
```
Given the user is on the History page
When they click a data point on the "Test Pass Rate Trend" chart
Then the ChartDrillDownModal opens
And it shows the pass rate value for the clicked date
And it displays the percentile ranking
```

#### HIST-006: Chart point click — First Run Pass Rate
```
Given the user is on the History page
When they click a data point on the "First Run Pass Rate" chart
Then the ChartDrillDownModal opens
And the metric label says "First Run Pass Rate"
```

#### HIST-007: Chart point click — Defect Detection
```
Given the user is on the History page
When they click a data point on the "Defect Detection Percentage" chart
Then the ChartDrillDownModal opens
And the metric label says "Defect Detection"
```

#### HIST-008: Chart point click — Test Effectiveness
```
Given the user is on the History page
When they click a data point on the "Test Case Effectiveness" chart
Then the ChartDrillDownModal opens
And the metric label says "Test Effectiveness"
```

#### HIST-009: 30-day data validation
```
Given the user is on the History page
Then each of the 4 trend charts displays exactly 30 data points
And dates range from 2026-01-05 to 2026-02-03
And all values are within expected ranges per persona
```

---

### 11.5 Chat Tests

#### CHAT-001: Open chat widget
```
Given the chat widget is closed (FAB visible)
When the user clicks the floating action button
Then the chat panel slides open
And the welcome state is displayed ("Ask me about your testing metrics")
And the input field is auto-focused
```

#### CHAT-002: Close chat widget
```
Given the chat widget is open
When the user clicks the X close button
Then the chat panel closes
And the floating action button reappears
```

#### CHAT-003: Quick action pill — High-risk features
```
Given the chat widget is open
When the user clicks the "High-risk features" quick action pill
Then a user message "High-risk features" appears in the chat
And a typing indicator is shown
And an assistant response appears with high-risk feature analysis
```

#### CHAT-004: Quick action pill — Feature status
```
Given the chat widget is open
When the user clicks the "Feature status" quick action pill
Then a user message "Feature status" appears
And an assistant response appears with feature coverage summary
```

#### CHAT-005: Quick action pill — Automation gaps
```
Given the chat widget is open
When the user clicks the "Automation gaps" quick action pill
Then a user message "Automation gaps" appears
And an assistant response appears with automation coverage opportunities
```

#### CHAT-006: Quick action pill — Quality summary
```
Given the chat widget is open
When the user clicks the "Quality summary" quick action pill
Then a user message "Quality summary" appears
And an assistant response appears with executive quality summary
```

#### CHAT-007: Custom message send via Enter key
```
Given the chat widget is open
And the user has typed "What is the flaky test rate?" in the input
When the user presses Enter
Then the input clears
And a user message appears with the typed text
And a typing indicator shows while awaiting response
And an assistant response appears
```

#### CHAT-008: Custom message send via Send button
```
Given the chat widget is open
And the user has typed a question in the input
When the user clicks the Send button
Then the message is sent and the input clears
```

#### CHAT-009: Send button disabled when input empty
```
Given the chat widget is open
And the input field is empty
Then the Send button is visually disabled (50% opacity)
And clicking it does nothing
```

#### CHAT-010: Related link card click — navigate to feature
```
Given an assistant response includes a related link card for a feature
When the user clicks the link card
Then the app navigates to /dtq/dashboard
And the FeatureDetailModal opens for the linked feature
```

#### CHAT-011: Related link card click — navigate to category
```
Given an assistant response includes a related link card for a category
When the user clicks the link card
Then the app navigates to /dtq/dashboard
And the CategoryAnalyticsModal opens for the linked category
```

#### CHAT-012: Related link card click — navigate to report
```
Given an assistant response includes a related link card for a test run
When the user clicks the link card
Then the app navigates to /dtq/reports
And the TestRunDetailModal opens for the linked test run
```

#### CHAT-013: Related link card click — navigate to history metric
```
Given an assistant response includes a related link card for a history metric
When the user clicks the link card
Then the app navigates to /dtq/history
And the MetricDrillDownModal opens for the linked metric
```

#### CHAT-014: Cross-page chat persistence
```
Given the user has sent messages in the chat on the Dashboard page
When the user navigates to the Reports page via sidebar
Then the chat widget retains all previous messages
And the conversation history is preserved
```

#### CHAT-015: Reset button clears history
```
Given the chat widget has messages
When the user clicks the Reset button (rotating arrow icon)
Then all messages are cleared
And the welcome state reappears
```

#### CHAT-016: Reset button hidden when no messages
```
Given the chat widget is open with no messages
Then the Reset button is not visible
```

#### CHAT-017: Unread badge counter
```
Given the chat widget is closed
When a quick action or background response generates a new message
Then an unread badge appears on the floating action button
And the badge shows the unread count
```

#### CHAT-018: Unread badge overflow
```
Given the unread count exceeds 9
Then the badge displays "9+" instead of the actual number
```

#### CHAT-019: Source display
```
Given an assistant response was generated using RAG
Then below the response, a source indicator shows (e.g., "3 sources used")
And a paperclip icon is displayed
```

#### CHAT-020: Persona badge in header
```
Given the chat widget is open
Then the header shows a persona badge with the current persona name
And the badge icon matches the persona (Crown/Users/Code)
```

---

### 11.6 Cross-Page Navigation Tests

#### XNAV-001: Chat link → Dashboard feature modal
```
Given the user is on the Reports page
And the chat has a related link card targeting a feature on the Dashboard
When the user clicks the link card
Then the app navigates to /dtq/dashboard
And the FeatureDetailModal opens for the specified feature
```

#### XNAV-002: Chat link → Dashboard category modal
```
Given the user is on the History page
And the chat has a related link card targeting a category
When the user clicks the link card
Then the app navigates to /dtq/dashboard
And the CategoryAnalyticsModal opens for the specified category
```

#### XNAV-003: Chat link → Reports page test run
```
Given the user is on the Dashboard page
And the chat has a related link card targeting a test run
When the user clicks the link card
Then the app navigates to /dtq/reports
And the TestRunDetailModal opens for the matching test run
```

#### XNAV-004: Chat link → History page metric
```
Given the user is on the Dashboard page
And the chat has a related link card targeting a history metric (e.g., "passRate")
When the user clicks the link card
Then the app navigates to /dtq/history
And the MetricDrillDownModal opens for the specified metric
```

#### XNAV-005: Navigation action TTL expiration
```
Given a navigation action has been dispatched
When 30 seconds pass without the target page processing it (ACTION_TTL_MS = 30000)
Then the pending action is considered stale
And the target page does not open a modal for expired actions
```

---

### 11.7 Modal Tests

#### MOD-001: Modal close via X button
```
Given any modal is open
When the user clicks the X close button
Then the modal closes with an exit animation
And the underlying page is interactive again
```

#### MOD-002: Modal close via Escape key
```
Given any modal is open
When the user presses the Escape key
Then the modal closes
```

#### MOD-003: Modal focus trap
```
Given a modal is open
When the user presses Tab repeatedly
Then focus cycles through focusable elements within the modal
And focus does not escape to the background page
```

#### MOD-004: TestRunDetailModal severity filtering
```
Given the TestRunDetailModal is open for a failed test run
When the user clicks the "High" severity filter tab
Then only high-severity issues are displayed
And medium and low severity issues are hidden
```

#### MOD-005: TestRunDetailModal stack trace expand
```
Given the TestRunDetailModal is open with issues
When the user clicks on an issue's error message
Then the stack trace expands below the error message
And clicking again collapses the stack trace
```

#### MOD-006: TestRunDetailModal copy button
```
Given the TestRunDetailModal shows an issue with a stack trace
When the user clicks the copy button
Then the stack trace is copied to the clipboard
```

---

## 12. Appendix

### 12.1 All 80 Features

| # | ID | Feature | Category | Persona | Coverage | Risk | Pass Rate |
|---|----|---------|----------|---------|----------|------|-----------|
| 1 | cs-f1 | Payment Gateway | Revenue Platform | C-Suite | 96% | 12 | 98% |
| 2 | cs-f2 | Subscription Billing | Revenue Platform | C-Suite | 93% | 18 | 96% |
| 3 | cs-f3 | Revenue Analytics | Revenue Platform | C-Suite | 91% | 15 | 97% |
| 4 | cs-f4 | Pricing Engine | Revenue Platform | C-Suite | 88% | 22 | 94% |
| 5 | cs-f5 | Customer Portal | Customer Experience | C-Suite | 94% | 14 | 97% |
| 6 | cs-f6 | NPS Tracking | Customer Experience | C-Suite | 89% | 20 | 93% |
| 7 | cs-f7 | Support Escalation | Customer Experience | C-Suite | 92% | 16 | 96% |
| 8 | cs-f8 | Onboarding Journey | Customer Experience | C-Suite | 90% | 19 | 95% |
| 9 | cs-f9 | Multi-Region Deployment | Market Expansion | C-Suite | 87% | 24 | 92% |
| 10 | cs-f10 | Localization Engine | Market Expansion | C-Suite | 85% | 28 | 90% |
| 11 | cs-f11 | Partner Integration | Market Expansion | C-Suite | 91% | 17 | 95% |
| 12 | cs-f12 | SOC 2 Validation | Strategic Compliance | C-Suite | 97% | 10 | 99% |
| 13 | cs-f13 | GDPR Data Handling | Strategic Compliance | C-Suite | 95% | 13 | 98% |
| 14 | cs-f14 | Audit Trail System | Strategic Compliance | C-Suite | 93% | 16 | 96% |
| 15 | cs-f15 | AI Feature Pipeline | Digital Transformation | C-Suite | 82% | 30 | 89% |
| 16 | cs-f16 | Legacy Migration | Digital Transformation | C-Suite | 84% | 26 | 91% |
| 17 | f1 | xAPI / LRS Integration | Advanced / Enterprise | Manager | 92% | 45 | 94% |
| 18 | f2 | Multi-Tenant Configuration | Advanced / Enterprise | Manager | 88% | 32 | 91% |
| 19 | f3 | Advanced Compliance Tracking | Advanced / Enterprise | Manager | 95% | 18 | 97% |
| 20 | f4 | Custom Branding Engine | Advanced / Enterprise | Manager | 78% | 25 | 89% |
| 21 | f5 | Enterprise SSO | Advanced / Enterprise | Manager | 96% | 12 | 98% |
| 22 | f6 | Adaptive Learning Paths | Learning Experience | Manager | 85% | 38 | 88% |
| 23 | f7 | Personalized Recommendations | Learning Experience | Manager | 91% | 22 | 93% |
| 24 | f8 | Skill Gap Analysis | Learning Experience | Manager | 87% | 28 | 90% |
| 25 | f9 | Learning Goals Tracking | Learning Experience | Manager | 93% | 15 | 96% |
| 26 | f10 | Executive Dashboard | Reporting & Analytics | Manager | 94% | 20 | 95% |
| 27 | f11 | Custom Report Builder | Reporting & Analytics | Manager | 82% | 35 | 87% |
| 28 | f12 | Learning Analytics | Reporting & Analytics | Manager | 89% | 42 | 91% |
| 29 | f13 | Compliance Reports | Reporting & Analytics | Manager | 97% | 10 | 99% |
| 30 | f14 | Export Center | Reporting & Analytics | Manager | 90% | 16 | 94% |
| 31 | f15 | Course Discovery | Course Catalog & Enrollment | Manager | 86% | 30 | 89% |
| 32 | f16 | Self-Enrollment | Course Catalog & Enrollment | Manager | 95% | 14 | 97% |
| 33 | f17 | Manager-Assigned Learning | Course Catalog & Enrollment | Manager | 88% | 24 | 92% |
| 34 | f18 | Waitlist Management | Course Catalog & Enrollment | Manager | 79% | 20 | 86% |
| 35 | f19 | Discussion Forums | Social & Collaboration | Manager | 83% | 26 | 88% |
| 36 | f20 | Peer Reviews | Social & Collaboration | Manager | 91% | 18 | 93% |
| 37 | f21 | Learning Groups | Social & Collaboration | Manager | 87% | 22 | 90% |
| 38 | f22 | Social Sharing | Social & Collaboration | Manager | 76% | 15 | 85% |
| 39 | f23 | SCORM Import | Course Creation & Management | Manager | 94% | 19 | 95% |
| 40 | f24 | Content Authoring | Course Creation & Management | Manager | 81% | 34 | 86% |
| 41 | f25 | Assessment Builder | Course Creation & Management | Manager | 89% | 28 | 91% |
| 42 | f26 | Media Library | Course Creation & Management | Manager | 85% | 21 | 89% |
| 43 | f27 | Course Versioning | Course Creation & Management | Manager | 92% | 16 | 94% |
| 44 | f28 | User Management | Admin & Configuration | Manager | 96% | 12 | 98% |
| 45 | f29 | Role-Based Access Control | Admin & Configuration | Manager | 93% | 18 | 96% |
| 46 | f30 | Notification Settings | Admin & Configuration | Manager | 84% | 22 | 88% |
| 47 | f31 | Integration Hub | Admin & Configuration | Manager | 78% | 36 | 85% |
| 48 | f32 | Audit Logs | Admin & Configuration | Manager | 97% | 10 | 99% |
| 49 | f33 | System Configuration | Admin & Configuration | Manager | 88% | 24 | 91% |
| 50 | f34 | Quiz Engine | Assessments & Certification | Manager | 92% | 20 | 94% |
| 51 | f35 | Certification Paths | Assessments & Certification | Manager | 90% | 16 | 93% |
| 52 | f36 | Proctoring Support | Assessments & Certification | Manager | 75% | 32 | 84% |
| 53 | f37 | Certificate Designer | Assessments & Certification | Manager | 86% | 18 | 90% |
| 54 | f38 | Webinar Integration | Events & Live Sessions | Manager | 82% | 28 | 87% |
| 55 | f39 | ILT Scheduling | Events & Live Sessions | Manager | 89% | 22 | 92% |
| 56 | f40 | Attendance Tracking | Events & Live Sessions | Manager | 94% | 14 | 96% |
| 57 | f41 | Virtual Classroom | Events & Live Sessions | Manager | 77% | 38 | 85% |
| 58 | f42 | User Onboarding | Core User Journeys | Manager | 91% | 24 | 93% |
| 59 | f43 | Course Completion Flow | Core User Journeys | Manager | 95% | 12 | 97% |
| 60 | f44 | Profile Management | Core User Journeys | Manager | 88% | 18 | 91% |
| 61 | f45 | Mobile Experience | Core User Journeys | Manager | 79% | 42 | 86% |
| 62 | f46 | Search & Discovery | Core User Journeys | Manager | 84% | 30 | 88% |
| 63 | tl-f1 | Build Orchestration | CI/CD Pipeline | Tech Lead | 88% | 25 | 91% |
| 64 | tl-f2 | Deploy Pipeline | CI/CD Pipeline | Tech Lead | 85% | 32 | 88% |
| 65 | tl-f3 | Rollback Automation | CI/CD Pipeline | Tech Lead | 82% | 35 | 86% |
| 66 | tl-f4 | Feature Flags | CI/CD Pipeline | Tech Lead | 90% | 20 | 93% |
| 67 | tl-f5 | REST API Gateway | API Infrastructure | Tech Lead | 92% | 18 | 94% |
| 68 | tl-f6 | GraphQL Layer | API Infrastructure | Tech Lead | 79% | 38 | 85% |
| 69 | tl-f7 | Rate Limiting | API Infrastructure | Tech Lead | 86% | 22 | 92% |
| 70 | tl-f8 | API Versioning | API Infrastructure | Tech Lead | 83% | 28 | 89% |
| 71 | tl-f9 | Load Testing Framework | Performance Engineering | Tech Lead | 78% | 40 | 84% |
| 72 | tl-f10 | Memory Profiler | Performance Engineering | Tech Lead | 75% | 36 | 82% |
| 73 | tl-f11 | CDN Optimization | Performance Engineering | Tech Lead | 91% | 15 | 95% |
| 74 | tl-f12 | Penetration Test Suite | Security Testing | Tech Lead | 70% | 45 | 80% |
| 75 | tl-f13 | Dependency Scanner | Security Testing | Tech Lead | 93% | 16 | 94% |
| 76 | tl-f14 | Auth Token Validation | Security Testing | Tech Lead | 89% | 20 | 92% |
| 77 | tl-f15 | Container Orchestration | DevOps Automation | Tech Lead | 84% | 30 | 88% |
| 78 | tl-f16 | Log Aggregation | DevOps Automation | Tech Lead | 87% | 19 | 91% |
| 79 | tl-f17 | Infra-as-Code | DevOps Automation | Tech Lead | 81% | 33 | 86% |
| 80 | tl-f18 | Secrets Management | DevOps Automation | Tech Lead | 96% | 10 | 98% |

### 12.2 All 24 KPIs

| # | Persona | Key | Label | Value | Unit | Trend |
|---|---------|-----|-------|-------|------|-------|
| 1 | C-Suite | releaseVelocity | Release Velocity | +35 | % | up |
| 2 | C-Suite | timeToMarket | Mean Time to Market | 12 | days | down |
| 3 | C-Suite | automationROI | Automation ROI | 285 | % | up |
| 4 | C-Suite | escapeRate | Defect Escape Rate | 2.1 | % | down |
| 5 | C-Suite | incidentsPrevented | Incidents Prevented | 47 | count | up |
| 6 | C-Suite | riskReduction | Risk Reduction | 68 | % | up |
| 7 | C-Suite | capacityUnlocked | Capacity Unlocked | 42 | % | up |
| 8 | Manager | passRate | Test Pass Rate | 94.2 | % | up |
| 9 | Manager | autoManualRatio | Automated vs Manual | 8.5:1 | ratio | up |
| 10 | Manager | effectiveness | Test Case Effectiveness | 0.87 | score | stable |
| 11 | Manager | regressionTime | Regression Execution | 42 | min | down |
| 12 | Manager | firstRunPass | First-Run Pass Rate | 87.5 | % | up |
| 13 | Manager | escalationRate | Escalation Rate | 12.3 | % | down |
| 14 | Manager | testReuse | Test Case Reuse | 76.8 | % | up |
| 15 | Manager | blockerDefects | Blocker Defects | 3 | count | down |
| 16 | Manager | envUptime | Environment Uptime | 99.2 | % | stable |
| 17 | Tech Lead | flakyRate | Flaky Test Rate | 3.2 | % | down |
| 18 | Tech Lead | avgExecution | Avg Execution Time | 4.2 | min | down |
| 19 | Tech Lead | tokenCost | Token Usage Cost | 0.42 | $ | down |
| 20 | Tech Lead | contextHitRate | Context Hit Rate | 94.5 | % | up |
| 21 | Tech Lead | toolCallSuccess | Tool Call Success | 97.8 | % | up |
| 22 | Tech Lead | parallelEfficiency | Parallel Efficiency | 78.5 | % | up |
| 23 | Tech Lead | automationCoverage | Automation Coverage | 93.3 | % | up |
| 24 | Tech Lead | totalTests | Total Test Cases | 1247 | count | up |

### 12.3 All 20 Categories

| # | Category | Persona | Feature Count |
|---|----------|---------|---------------|
| 1 | Revenue Platform | C-Suite | 4 |
| 2 | Customer Experience | C-Suite | 4 |
| 3 | Market Expansion | C-Suite | 3 |
| 4 | Strategic Compliance | C-Suite | 3 |
| 5 | Digital Transformation | C-Suite | 2 |
| 6 | Advanced / Enterprise | Manager | 5 |
| 7 | Learning Experience | Manager | 4 |
| 8 | Reporting & Analytics | Manager | 5 |
| 9 | Course Catalog & Enrollment | Manager | 4 |
| 10 | Social & Collaboration | Manager | 4 |
| 11 | Course Creation & Management | Manager | 5 |
| 12 | Admin & Configuration | Manager | 6 |
| 13 | Assessments & Certification | Manager | 4 |
| 14 | Events & Live Sessions | Manager | 4 |
| 15 | Core User Journeys | Manager | 5 |
| 16 | CI/CD Pipeline | Tech Lead | 4 |
| 17 | API Infrastructure | Tech Lead | 4 |
| 18 | Performance Engineering | Tech Lead | 3 |
| 19 | Security Testing | Tech Lead | 3 |
| 20 | DevOps Automation | Tech Lead | 4 |

### 12.4 API Endpoint Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dtq/features` | GET | List all features for current persona |
| `/api/dtq/categories` | GET | Categories with aggregated stats |
| `/api/dtq/test-runs` | GET | Test run history with issues |
| `/api/dtq/test-runs` | POST | Create new test run (simulation) |
| `/api/dtq/metrics` | GET | Daily metrics (30 days) |
| `/api/dtq/metrics?type=summary` | GET | Summary metrics computed from features |
| `/api/dtq/personas` | GET | All personas with their KPI metrics |
| `/api/dtq/chat` | POST | Claude-powered AI chat with RAG pipeline |

### 12.5 Knowledge Base Statistics

| Item Type | Count | Description |
|-----------|-------|-------------|
| `feature` | 80 | All features across 3 personas (16 + 46 + 18) |
| `category_summary` | 20 | Category aggregations (5 + 10 + 5) |
| `persona_kpi` | 24 | KPI metrics (7 + 9 + 8) |
| `test_run_summary` | 3 | Per-persona test execution summaries |
| `daily_metrics_summary` | 3 | Per-persona 30-day metrics overviews |
| **Total** | **130** | **100% embedding coverage (1536-dim)** |

### 12.6 Database Schema

| Table | Description | Row Count |
|-------|-------------|-----------|
| `dtq.features` | Test features across categories | 46 (Manager base) |
| `dtq.test_runs` | Test execution history | 40+ |
| `dtq.test_issues` | Failures/defects from test runs | 30 |
| `dtq.daily_metrics` | 30-day historical metrics | 30 |
| `dtq.personas` | Role-based persona definitions | 3 |
| `dtq.persona_metrics` | KPIs per persona | 24 |
| `dtq.knowledge_base` | AI knowledge base with vector embeddings | 130 |

### 12.7 Semantic Search RPC

**Function:** `public.search_dtq_knowledge_semantic`

**Input:** JSONB containing:
- `query_embedding` — 1536-dimensional vector from OpenAI
- `match_threshold` — Minimum cosine similarity (default: 0.5)
- `match_count` — Maximum results to return

**Output:** Matching knowledge base rows with similarity scores, ordered by relevance.

---

*Part of Digital Workplace AI Product Suite*
*Location: `/Users/aldrin-mac-mini/digitalworkplace.ai/apps/test-iq`*
*Port: 3004 | BasePath: /dtq | Status: IMPLEMENTED*
