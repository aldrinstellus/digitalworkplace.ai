# Test IQ - Feature Inventory

**Source:** https://auzmor-test.lovable.app/
**Date Captured:** 2026-02-03
**Status:** Reverse-engineered from Auzmor LMS Test Metrics

---

## Screenshots Index

| Category | File | Description |
|----------|------|-------------|
| Dashboard | `dashboard/01-main-dashboard.png` | Auth/login page |
| Dashboard | `dashboard/03-main-dashboard-full.png` | Full dashboard view (QA Manager persona) |
| Dashboard | `dashboard/04-feature-accordion-expanded.png` | Feature coverage with expanded accordion |
| Dashboard | `dashboard/05-ai-assistant-response.png` | AI Insights Assistant with response |
| Personas | `personas/01-csuite-executive.png` | C-Suite Executive persona view |
| Personas | `personas/02-tech-lead.png` | Tech Lead / Test Automation Engineer view |
| Personas | `personas/03-manager.png` | QA Manager persona view |
| Navigation | `navigation/02-metrics-history.png` | Metrics History / Team Performance page |
| Reports | `reports/01-test-reports.png` | Test Reports list (full page) |
| Defects | `defects/01-view-issues-modal.png` | View Issues modal dialog |

---

## 1. Navigation Structure

### Sidebar Navigation
- **Dashboard** (`/`) - Main dashboard with metrics
- **Metrics History** (`/history`) - Team performance metrics over 30 days
- **Test Reports** (`/test-reports`) - Test execution history and issues

### Demo Personas (Sidebar)
1. **C-Suite** - Executive insights
2. **Manager** - Team metrics
3. **Tech Lead** - Technical deep dive

---

## 2. Dashboard Features

### 2.1 Header Section
- Logo and branding ("auzmor")
- Title: "Auzmor LMS Test Metrics"
- Subtitle: "Agentic Testing Intelligence for Enterprise Learning Management"

### 2.2 Active Persona Card
- Avatar icon
- "Active Persona View" label
- Persona name (e.g., "QA Manager")
- Persona description (e.g., "Team performance and operational effectiveness")
- "Live Dashboard" badge

### 2.3 Summary Metrics Cards (Top Row)
Four primary metric cards:
1. **Total Features** - Count with average coverage %
2. **Automation Rate** - Percentage with fully automated count
3. **Risk Distribution** - High/Medium/Low breakdown
4. **Open Defects** - Count across all features

### 2.4 High Risk Features Alert
- Warning banner with icon
- Lists top 3 high-risk features with:
  - Feature name
  - Coverage percentage
  - Risk score
  - Defect count

### 2.5 Secondary Metrics Grid (9 cards)
Persona-specific metrics that change based on selected persona:

**QA Manager Metrics:**
- Test Pass Rate (with trend indicator)
- Automated vs Manual Ratio
- Test Case Effectiveness
- Regression Execution Time
- First-Run Pass Rate
- Escalation Rate
- Test Case Reuse
- Blocker Defects
- Test Environment Uptime

**C-Suite Executive Metrics:**
- Release Velocity Increase
- Mean Time to Market
- Automation ROI
- Production Defect Escape Rate
- Incidents Prevented
- Risk Reduction Score
- Capacity Unlocked

**Tech Lead Metrics:**
- Flaky Test Rate
- Avg Execution Time
- Token Usage Cost (agentic)
- Context Hit Rate
- Tool Call Success Rate
- Parallel Execution Efficiency
- Automation Coverage
- Total Test Cases

### 2.6 Trend Charts (2 columns)
1. **Test Pass Rate Trend** - Line chart over 7 days
2. **Automation Coverage** - Area chart over 7 days

### 2.7 Feature Coverage Accordion
- Header: "Auzmor LMS - Feature Coverage"
- Subtitle: "46 features with agentic test coverage"
- Legend: Fully Automated (green) / Partial (cyan)
- Search input: "Search features..."

**Feature Categories (10 collapsible sections):**
1. Advanced / Enterprise (5 features)
2. Learning Experience (4 features)
3. Reporting & Analytics (5 features)
4. Course Catalog & Enrollment (4 features)
5. Social & Collaboration (4 features)
6. Course Creation & Management (5 features)
7. Admin & Configuration (6 features)
8. Assessments & Certification (4 features)
9. Events & Live Sessions (4 features)
10. Core User Journeys (5 features)

**Each category shows:**
- Category name
- Feature count
- Average coverage %
- High risk count (if any)
- Open defects count

**Expanded accordion shows table with columns:**
- Feature name
- Coverage % (with progress bar)
- Status (Fully Automated / Partially Automated)
- Defects (open / closed)
- Risk score
- Pass Rate %
- Impact score

### 2.8 AI Insights Assistant
- Header with sparkle icon: "AI Insights Assistant"
- Bot avatar
- "Ask me about your testing metrics"
- "I have access to all 46 Auzmor LMS features with real-time data"

**Quick Action Buttons (4):**
1. "🎯 High-risk features" - Show features needing attention
2. "📊 Feature status" - Check specific feature metrics
3. "⚙️ Automation gaps" - Find coverage opportunities
4. "📈 Quality summary" - Get executive overview

**Chat Input:**
- Placeholder: "Ask about specific features, metrics, or trends..."
- Send button

**AI Response Format:**
- Structured markdown with headers
- Bulleted lists with metrics
- Actionable recommendations

---

## 3. Metrics History Page (`/history`)

### Header
- Title: "Team Performance Metrics"
- Subtitle: "Monitor team effectiveness and quality trends over the past 30 days"

### Summary Cards (4)
1. Average Pass Rate (%)
2. First Pass Rate (%)
3. Defect Detection (%)
4. Test Effectiveness (%)

### Trend Charts (4 in 2x2 grid)
1. Test Pass Rate Trend
2. First Run Pass Rate
3. Defect Detection Percentage
4. Test Case Effectiveness

---

## 4. Test Reports Page (`/test-reports`)

### Header
- Title: "Test Reports"
- Subtitle: "View regression test execution history and issues"
- Actions: "Export CSV" button, "Export PDF" button

### Report Cards (List)
Each test run card shows:
- Feature name (heading)
- Execution time ("Executed X days ago")
- Status badge (Passed/Failed)
- Metrics row:
  - Total Tests
  - Passed count
  - Failed count
  - Duration
- "View Issues" button (for failed runs)

### View Issues Modal
- Title: "Test Issues"
- Subtitle: "Detailed information about test failures"
- Close button (X)

**For each failed test:**
- Test case name (e.g., "Test Case 1 - xAPI / LRS Integration")
- Severity badge (high/medium/low)
- Error message
- Stack trace (code block)

---

## 5. Persona-Specific Views

### 5.1 C-Suite Executive
- Focus on business metrics
- ROI and cost savings
- Strategic risk indicators
- Customer impact metrics

### 5.2 QA Manager
- Team performance metrics
- Test efficiency ratios
- Regression and reuse metrics
- Environment stability

### 5.3 Tech Lead / Test Automation Engineer
- Technical metrics
- Flakiness and execution time
- Token/cost metrics for agentic testing
- Code coverage and tool accuracy
- Action buttons: "Run Regression Tests", "View Reports"

---

## 6. UI Components Library

### Cards
- Metric cards with icon, value, label, and subtitle
- Trend indicators (up/down arrows)
- Progress bars for percentages

### Badges
- Status badges (Passed - green, Failed - red)
- Risk badges (High - red, Medium - yellow, Low - green)
- Automation status badges

### Charts
- Line charts (trends)
- Area charts (coverage)
- Progress bars (inline)

### Tables
- Sortable columns
- Expandable rows
- Inline status indicators

### Accordions
- Collapsible sections
- Summary header with expand/collapse icon
- Animated transitions

### Modals
- Dialog overlay
- Close button
- Scrollable content

### Forms
- Search inputs
- Chat input with send button
- Tab navigation (Sign In / Sign Up)

---

## 7. Data Model Overview

### Features
- 46 total features
- Grouped into 10 categories
- Each feature has: coverage %, status, defects, risk score, pass rate, impact

### Metrics
- Real-time calculated from test data
- 30-day historical trends
- Persona-specific views

### Test Runs
- Execution history
- Pass/fail counts
- Duration tracking
- Issue details

### Defects
- Linked to features
- Open/closed status
- Severity levels
