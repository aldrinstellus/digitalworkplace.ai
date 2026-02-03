# Test IQ - Product Requirements Document (PRD)

**Version:** 1.0.0
**Date:** 2026-02-03
**Status:** Draft
**Project Code:** dTQ (Digital Test IQ)

---

## Executive Summary

Test IQ is an AI-powered QA & Testing Intelligence platform that provides real-time visibility into test coverage, quality metrics, and risk assessment across product features. The platform offers persona-based dashboards tailored to different stakeholder needs (C-Suite, Managers, Tech Leads) and includes an AI-powered insights assistant.

**Reference Application:** Auzmor LMS Test Metrics (https://auzmor-test.lovable.app/)

---

## 1. Product Overview

### 1.1 Vision
Create a comprehensive testing intelligence dashboard that enables QA teams, managers, and executives to monitor test coverage, identify risks, and make data-driven decisions about quality.

### 1.2 Goals
- Provide real-time visibility into test coverage and quality metrics
- Enable persona-based views with role-specific metrics
- Identify high-risk features requiring attention
- Track test execution history and defect trends
- Offer AI-powered insights and recommendations

### 1.3 Non-Goals (Out of Scope)
- User authentication/login functionality (not required per user request)
- User management and roles
- Test execution engine (data will be simulated/demo)
- Integration with CI/CD pipelines
- Defect management CRUD operations

---

## 2. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework with App Router |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling |
| **Supabase** | - | Database (optional for persistence) |
| **Recharts** | - | Charts and visualizations |
| **Framer Motion** | - | Animations |
| **Lucide React** | - | Icons |
| **shadcn/ui** | - | UI component library |

### 2.1 Design Requirements
- **Accent Color:** `#ff3366` (pink)
- **Theme:** Dark mode
- **No hardcoded color values** - use CSS variables
- Use `frontend-design` skill for implementation

---

## 3. URL Structure

| Route | Page | Description |
|-------|------|-------------|
| `/dtq/dashboard` | Dashboard | Main metrics dashboard |
| `/dtq/history` | Metrics History | Team performance over 30 days |
| `/dtq/reports` | Test Reports | Test execution history |

**Base Path:** `/dtq`
**Port:** 3004

---

## 4. Feature Specifications

### 4.1 Dashboard (`/dtq/dashboard`)

#### 4.1.1 Header Section
- **Logo:** Test IQ branding (can use existing Digital Workplace branding)
- **Title:** "Test IQ Metrics"
- **Subtitle:** "AI-Powered Testing Intelligence"

#### 4.1.2 Persona Selector (Sidebar)
Three demo personas with switchable views:

| Persona | Label | Description |
|---------|-------|-------------|
| C-Suite | Executive | Strategic business metrics and ROI insights |
| Manager | QA Manager | Team performance and operational effectiveness |
| Tech Lead | Engineer | Technical deep dive and engineering metrics |

**Behavior:**
- Clicking a persona updates the secondary metrics grid
- Visual indicator shows active persona
- Smooth transition between persona views

#### 4.1.3 Active Persona Card
**Fields:**
- Avatar/icon (different per persona)
- "Active Persona View" label
- Persona title (h2)
- Description text
- "Live Dashboard" badge

#### 4.1.4 Primary Metrics Cards (4 cards, top row)

| Metric | Value Type | Subtitle |
|--------|------------|----------|
| Total Features | Number | "X% avg coverage" |
| Automation Rate | Percentage | "X fully automated" |
| Risk Distribution | Breakdown | "X High / X Medium / X Low" |
| Open Defects | Number | "Across all features" |

**Card Design:**
- Icon on left
- Main value (large, bold)
- Label above value
- Subtitle below value
- Subtle hover effect

#### 4.1.5 High Risk Alert Banner
**Trigger:** Display when features with risk score > 40 exist

**Content:**
- Warning icon and "High Risk Features Requiring Attention" title
- List of top 3 high-risk features
- Each item shows: name, coverage %, risk score, defect count

#### 4.1.6 Secondary Metrics Grid (9 cards)
Cards change based on selected persona.

**QA Manager Metrics:**
| Metric | Unit | Description |
|--------|------|-------------|
| Test Pass Rate | % | Last 30 days trend |
| Automated vs Manual Ratio | X:1 | Test efficiency |
| Test Case Effectiveness | decimal | Defects found per test |
| Regression Execution Time | min | Full regression suite |
| First-Run Pass Rate | % | New features |
| Escalation Rate | % | Auto to manual review |
| Test Case Reuse | % | Across releases |
| Blocker Defects | count | Critical issues |
| Test Environment Uptime | % | Stability score |

**C-Suite Executive Metrics:**
| Metric | Unit | Description |
|--------|------|-------------|
| Release Velocity Increase | % | More releases per quarter |
| Mean Time to Market | days | For new features |
| Automation ROI | % | Cost savings from automation |
| Production Defect Escape Rate | % | Bugs reaching customers |
| Incidents Prevented | count | Customer-impacting incidents |
| Risk Reduction Score | % | Business impact weighted |
| Capacity Unlocked | % | QA time to innovation |

**Tech Lead Metrics:**
| Metric | Unit | Description |
|--------|------|-------------|
| Flaky Test Rate | % | Test stability |
| Avg Execution Time | min | Per test suite |
| Token Usage Cost | $ | Per run (agentic) |
| Context Hit Rate | % | Relevance score |
| Tool Call Success Rate | % | Click/type/assert accuracy |
| Parallel Execution Efficiency | % | Speed-up vs theoretical |
| Automation Coverage | % | Code + requirements |
| Total Test Cases | count | Active tests |

#### 4.1.7 Trend Charts Section
Two charts side by side:

1. **Test Pass Rate Trend**
   - Type: Line chart
   - Period: 7 days
   - Y-axis: 0-100%
   - X-axis: Date labels (MM/DD)

2. **Automation Coverage**
   - Type: Area chart (gradient fill)
   - Period: 7 days
   - Y-axis: 0-100%
   - X-axis: Date labels (MM/DD)

#### 4.1.8 Feature Coverage Section

**Header:**
- Title: "Feature Coverage"
- Subtitle: "X features with test coverage"
- Legend: Fully Automated (green icon) / Partial (cyan icon)
- Search input: "Search features..."

**Accordion List (10 categories):**

| Category | Feature Count |
|----------|---------------|
| Advanced / Enterprise | 5 |
| Learning Experience | 4 |
| Reporting & Analytics | 5 |
| Course Catalog & Enrollment | 4 |
| Social & Collaboration | 4 |
| Course Creation & Management | 5 |
| Admin & Configuration | 6 |
| Assessments & Certification | 4 |
| Events & Live Sessions | 4 |
| Core User Journeys | 5 |

**Collapsed State Shows:**
- Category name
- Feature count badge
- "Avg Coverage: X%"
- "X High Risk" (if any, with warning icon)
- "X Open Defects"
- Expand/collapse chevron

**Expanded State Shows Table:**

| Column | Description |
|--------|-------------|
| Feature | Feature name |
| Coverage | Percentage with progress bar |
| Status | "Fully Automated" or "Partially Automated" with icon |
| Defects | "X / Y closed" format |
| Risk | Risk score (color-coded) |
| Pass Rate | Percentage |
| Impact | Impact score |

#### 4.1.9 AI Insights Assistant

**Header:**
- Sparkle icon
- "AI Insights Assistant" title

**Initial State:**
- Bot avatar
- "Ask me about your testing metrics"
- "I have access to all X features with real-time data"

**Quick Action Buttons (4):**

| Button | Icon | Label | Sublabel |
|--------|------|-------|----------|
| 1 | 🎯 | High-risk features | Show features needing attention |
| 2 | 📊 | Feature status | Check specific feature metrics |
| 3 | ⚙️ | Automation gaps | Find coverage opportunities |
| 4 | 📈 | Quality summary | Get executive overview |

**Chat Interface:**
- Input: "Ask about specific features, metrics, or trends..."
- Send button (disabled when empty)
- Message history with user/assistant bubbles

**AI Response Format:**
- Markdown-rendered content
- Headers for sections
- Bulleted lists for data points
- Bold for important values
- Actionable recommendations at the end

**Note:** AI responses can be pre-generated or use a simple pattern matching system for demo purposes.

---

### 4.2 Metrics History Page (`/dtq/history`)

#### 4.2.1 Header
- Title: "Team Performance Metrics"
- Subtitle: "Monitor team effectiveness and quality trends over the past 30 days"

#### 4.2.2 Summary Cards (4)

| Metric | Icon |
|--------|------|
| Average Pass Rate | CheckCircle |
| First Pass Rate | Zap |
| Defect Detection | Bug |
| Test Effectiveness | Target |

Each card shows: value (large %), label below

#### 4.2.3 Trend Charts (2x2 grid)

| Chart | Type |
|-------|------|
| Test Pass Rate Trend | Line chart |
| First Run Pass Rate | Line chart |
| Defect Detection Percentage | Line chart |
| Test Case Effectiveness | Line chart |

All charts:
- 30-day period
- X-axis: Date (Oct 20, Oct 23, etc.)
- Y-axis: 0-100%
- Grid lines
- Accent color for line

---

### 4.3 Test Reports Page (`/dtq/reports`)

#### 4.3.1 Header
- Title: "Test Reports"
- Subtitle: "View regression test execution history and issues"
- **Export CSV** button (with icon)
- **Export PDF** button (with icon)

#### 4.3.2 Report List
Scrollable list of test execution cards.

**Each Card Shows:**
- Feature name (h3)
- "Executed X days ago" timestamp
- Status badge:
  - **Passed** - Green background, checkmark icon
  - **Failed** - Red background, X icon

**Metrics Row:**
| Label | Value |
|-------|-------|
| Total Tests | count |
| Passed | count |
| Failed | count |
| Duration | Xs |

**Failed Cards:** "View Issues" button (right-aligned)

#### 4.3.3 View Issues Modal

**Header:**
- Title: "Test Issues"
- Subtitle: "Detailed information about test failures"
- Close button (X)

**Content (for each failed test):**
- Test case title (e.g., "Test Case 1 - [Feature Name]")
- Severity badge (high/medium/low)
- **Error:** Description text
- **Stack Trace:** Code block with monospace font

---

## 5. Data Models

### 5.1 Feature
```typescript
interface Feature {
  id: string;
  name: string;
  category: string;
  coverage: number; // 0-100
  status: 'fully_automated' | 'partially_automated';
  openDefects: number;
  closedDefects: number;
  riskScore: number; // 0-100
  passRate: number; // 0-100
  impactScore: number; // 0-100
}
```

### 5.2 Category
```typescript
interface Category {
  id: string;
  name: string;
  features: Feature[];
  avgCoverage: number;
  highRiskCount: number;
  totalDefects: number;
}
```

### 5.3 TestRun
```typescript
interface TestRun {
  id: string;
  featureId: string;
  featureName: string;
  executedAt: Date;
  status: 'passed' | 'failed';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number; // seconds
  issues?: TestIssue[];
}
```

### 5.4 TestIssue
```typescript
interface TestIssue {
  id: string;
  testCaseName: string;
  severity: 'high' | 'medium' | 'low';
  errorMessage: string;
  stackTrace: string;
}
```

### 5.5 DailyMetric
```typescript
interface DailyMetric {
  date: string; // YYYY-MM-DD
  passRate: number;
  firstRunPassRate: number;
  defectDetection: number;
  effectiveness: number;
  automationCoverage: number;
}
```

### 5.6 Persona
```typescript
interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  metrics: PersonaMetric[];
}

interface PersonaMetric {
  key: string;
  label: string;
  value: string | number;
  unit: string;
  description: string;
}
```

---

## 6. Demo Data Requirements

### 6.1 Features
- **Total:** 46 features across 10 categories
- **Risk Distribution:** 2 High, 20 Medium, 24 Low
- **Automation:** 38 Fully Automated, 8 Partial
- **Average Coverage:** 93.3%

### 6.2 Test Runs
- Generate ~40 test runs over past 3 months
- Mix of passed and failed
- Duration: 5-10 seconds each
- Realistic feature names matching the reference app

### 6.3 Daily Metrics
- 30 days of historical data
- Pass rate fluctuating between 85-99%
- Realistic trends with some variation

---

## 7. Component Structure

```
src/
├── app/
│   └── dtq/
│       ├── layout.tsx          # Dashboard layout with sidebar
│       ├── dashboard/
│       │   └── page.tsx        # Main dashboard
│       ├── history/
│       │   └── page.tsx        # Metrics history
│       └── reports/
│           └── page.tsx        # Test reports
├── components/
│   └── dtq/
│       ├── Sidebar.tsx         # Navigation + personas
│       ├── PersonaCard.tsx     # Active persona display
│       ├── MetricCard.tsx      # Summary metric card
│       ├── HighRiskBanner.tsx  # Alert banner
│       ├── TrendChart.tsx      # Line/area charts
│       ├── FeatureCoverage.tsx # Accordion with table
│       ├── AIAssistant.tsx     # Chat interface
│       ├── ReportCard.tsx      # Test run card
│       └── IssuesModal.tsx     # View issues dialog
├── lib/
│   └── dtq/
│       ├── data.ts             # Demo data
│       ├── types.ts            # TypeScript interfaces
│       └── utils.ts            # Helper functions
└── styles/
    └── dtq.css                 # Component styles (if needed)
```

---

## 8. Implementation Phases

### Phase 1: Foundation
- [ ] Initialize Next.js project structure
- [ ] Set up Tailwind with CSS variables for colors
- [ ] Create base layout with sidebar
- [ ] Implement navigation routing

### Phase 2: Dashboard
- [ ] Build persona selector
- [ ] Create metric cards component
- [ ] Implement high-risk banner
- [ ] Add trend charts with Recharts
- [ ] Build feature coverage accordion

### Phase 3: AI Assistant
- [ ] Create chat interface component
- [ ] Implement quick action buttons
- [ ] Add pre-generated AI responses
- [ ] Style message bubbles

### Phase 4: Additional Pages
- [ ] Build Metrics History page
- [ ] Build Test Reports page
- [ ] Implement View Issues modal
- [ ] Add export buttons (UI only)

### Phase 5: Polish
- [ ] Add animations with Framer Motion
- [ ] Responsive design adjustments
- [ ] Final styling pass
- [ ] Demo data refinement

---

## 9. Acceptance Criteria

### Dashboard
- [ ] All 3 personas switch correctly with appropriate metrics
- [ ] Summary cards display accurate totals
- [ ] High-risk banner shows when applicable
- [ ] Charts render with correct data
- [ ] Feature accordion expands/collapses smoothly
- [ ] Feature table shows all required columns
- [ ] Search filters features correctly
- [ ] AI Assistant responds to quick actions

### Metrics History
- [ ] Summary cards show 30-day averages
- [ ] All 4 charts render with historical data
- [ ] Date range is clearly displayed

### Test Reports
- [ ] Report list is scrollable
- [ ] Passed/Failed status is clearly indicated
- [ ] View Issues button opens modal
- [ ] Modal displays error details correctly
- [ ] Export buttons are visible (functionality optional)

---

## 10. Reference Screenshots

All screenshots are located in: `reference/screenshots/`

| Screenshot | Purpose |
|------------|---------|
| `dashboard/03-main-dashboard-full.png` | Complete dashboard layout |
| `dashboard/04-feature-accordion-expanded.png` | Feature table view |
| `dashboard/05-ai-assistant-response.png` | AI chat response format |
| `personas/01-csuite-executive.png` | C-Suite metrics |
| `personas/02-tech-lead.png` | Tech Lead metrics |
| `personas/03-manager.png` | Manager metrics |
| `navigation/02-metrics-history.png` | History page layout |
| `reports/01-test-reports.png` | Reports list |
| `defects/01-view-issues-modal.png` | Issues modal |

---

## Appendix A: Color Palette

```css
:root {
  /* Primary Accent */
  --accent-primary: #ff3366;
  --accent-primary-hover: #ff4d7a;

  /* Status Colors */
  --status-success: #10b981;
  --status-error: #ef4444;
  --status-warning: #f59e0b;

  /* Risk Colors */
  --risk-high: #ef4444;
  --risk-medium: #f59e0b;
  --risk-low: #10b981;

  /* Chart Colors */
  --chart-primary: #ff3366;
  --chart-secondary: #06b6d4;

  /* Background (Dark Mode) */
  --bg-primary: #0f0f1a;
  --bg-secondary: #1a1a2e;
  --bg-tertiary: #16213e;

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.5);
}
```

---

## Appendix B: API Endpoints (Future)

If backend persistence is needed later:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dtq/features` | List all features |
| GET | `/api/dtq/categories` | List categories with aggregates |
| GET | `/api/dtq/metrics/daily` | Daily metrics for charts |
| GET | `/api/dtq/reports` | Test run history |
| GET | `/api/dtq/reports/:id/issues` | Issues for a test run |

---

*Document created: 2026-02-03*
*Based on reverse engineering of Auzmor LMS Test Metrics*
