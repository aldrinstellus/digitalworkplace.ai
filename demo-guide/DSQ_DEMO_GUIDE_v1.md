# DSQ Demo Guide v1 - Support IQ (dSQ)

**Version**: 1.1.0 (Grouped Queries Edition)
**Last Updated**: January 27, 2026
**Production URL**: https://dsq.digitalworkplace.ai/dsq
**Test Status**: 116/116 Tests Passing (100%)

---

## Overview

Support IQ (dSQ) is an AI-enhanced customer support platform supporting **3 modes** and **10 personas**. This guide groups similar queries together for easier reference.

### Modes Summary

| Mode | Personas | Test Coverage |
|------|----------|---------------|
| **Government** | COR, Program Manager, Stakeholder Lead | 34/34 (100%) |
| **Project** | Project Manager, Service Team Lead, Service Team Member | 31/31 (100%) |
| **ATC** | Executive, CS Manager, Support Agent, CSM | 51/51 (100%) |

---

## Government Mode

---

### 1. COR - Contracting Officer's Representative

**Persona**: Alexa Johnson | **Badge**: COR (Purple) | **URL**: `/dsq/demo/cor`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show contract status" / "Show me current contract status" / "Show contract performance dashboard" | `contract-performance-dashboard` | Contract performance dashboard shows portfolio metrics and status |
| 2 | "Show vendor performance" / "Show me vendor performance metrics" / "Show me compliance dashboard" | `vendor-compliance-dashboard` | Vendor compliance dashboard shows SLA performance and compliance status |
| 3 | "Show deliverables due this month" / "Show me contract deliverables status" | `deliverable-review-list` | Deliverable reviews pending your approval |
| 4 | "Show me budget tracking dashboard" / "Budget remaining for contracts" | `budget-utilization-dashboard` | Budget utilization and burn rate analysis |
| 5 | "Who is top performing agent?" | `agent-performance-comparison` | Performance comparison for your team |
| 6 | "Who is most slacking agent?" | `team-workload-dashboard` | Team workload analysis showing agents who may need support |

---

### 2. Program Manager

**Persona**: Jennifer Chen | **Badge**: PM (Blue) | **URL**: `/dsq/demo/program-manager`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show program overview" / "Show program health dashboard" / "Program health" | `program-health-dashboard` | Program health dashboard shows portfolio status and key metrics |
| 2 | "Show milestone status" / "Milestone status" | `milestone-tracking-dashboard` | Milestone progress tracking toward key phases |
| 3 | "Show risk register" | `program-health-dashboard` | Risk register shows active risks and mitigation plans |
| 4 | "Critical risk" | `change-request-dashboard` | Change requests and risk items requiring attention |
| 5 | "Show resource allocation" / "Resource capacity" | `resource-capacity-dashboard` | Resource capacity and utilization across the team |
| 6 | "Show me sprint burndown" / "Sprint burn-down" | `sprint-burndown-chart` | Sprint burndown chart shows current sprint progress |
| 7 | "top performers" | `agent-performance-comparison` | Performance comparison for your team |

---

### 3. Stakeholder Lead

**Persona**: Jessica Martinez | **Badge**: LEAD (Green) | **URL**: `/dsq/demo/stakeholder-lead`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show impact analysis" / "Stakeholder engagement status" / "Show stakeholder engagement" | `stakeholder-engagement-dashboard` | Stakeholder engagement metrics and communication effectiveness |
| 2 | "Show change requests" / "Change request pending" | `change-request-dashboard` | Change requests and risk items requiring attention |
| 3 | "Show user feedback" | `nps-sentiment-analysis` | User feedback analysis and satisfaction trends |
| 4 | "Show requirements tracking" / "Requirements tracking status" / "Requirements traceability" | `requirements-tracking-dashboard` | Requirements tracking shows implementation progress |
| 5 | "Upcoming meetings" | `meeting-scheduler` | Meeting scheduler and upcoming appointments |

---

## Project Mode

---

### 4. Project Manager

**Persona**: Dale Thompson | **Badge**: PM (Blue) | **URL**: `/dsq/demo/project-manager`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show sprint burndown" / "Burndown" | `sprint-burndown-chart` | Sprint burndown chart shows current sprint progress |
| 2 | "Show team velocity" / "Velocity" | `team-velocity-dashboard` | Team velocity trends across recent sprints |
| 3 | "Show resource capacity" / "Resource capacity" | `resource-capacity-dashboard` | Resource capacity and utilization across the team |
| 4 | "Show blockers" / "Blocker" | `blocker-resolution-dashboard` | Active blockers requiring attention |
| 5 | "Sprint planning" | `task-kanban-board` | Sprint task board shows current work items |
| 6 | "top performers" | `agent-performance-comparison` | Performance comparison for your team |

---

### 5. Service Team Lead

**Persona**: Herbert Roberts | **Badge**: LEAD (Green) | **URL**: `/dsq/demo/service-team-lead`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show team workload" / "Team workload" | `team-workload-dashboard` | Team workload dashboard shows task distribution |
| 2 | "Show code quality metrics" / "Code quality" / "technical debt" | `code-quality-dashboard` | Code quality metrics show technical debt and test coverage |
| 3 | "Show code reviews" | `code-review-dashboard` | Code review status and pending reviews |
| 4 | "Show deployment status" / "Deployment" | `deployment-pipeline-dashboard` | Deployment pipeline shows CI/CD health |
| 5 | "DORA metrics" / "DORA" / "Show DORA metrics" | `dora-metrics-dashboard` | DORA metrics show engineering performance indicators |

---

### 6. Service Team Member

**Persona**: Molly Rivera | **Badge**: MEMBER (Gray) | **URL**: `/dsq/demo/service-team-member`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show my assigned requests" / "Daily update" | `agent-dashboard` | Your daily overview with tasks and priorities |
| 2 | "my dashboard" / "Show my performance this week" / "my performance" | `agent-performance-stats` | Your personal performance metrics |
| 3 | "Show my sprint tasks" / "My tasks" / "Sprint task" | `task-kanban-board` | Sprint task board shows current work items |
| 4 | "code quality" | `code-quality-dashboard` | Code quality metrics show technical debt |
| 5 | "top performers" | `agent-performance-comparison` | Performance comparison for your team |

---

## ATC Mode (Enterprise Support)

---

### 7. C-Level Executive

**Persona**: Jennifer Anderson | **Badge**: EXEC (Gold) | **URL**: `/dsq/demo/atc-executive`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show me executive summary" / "Show board-level metrics" | `executive-summary` | Executive summary shows key business metrics |
| 2 | "Show detailed analytics" / "Show me the detailed analytics" | `analytics-dashboard` | Analytics dashboard shows operational trends |
| 3 | "Show me SLA performance" / "Show me the SLA performance breakdown" | `sla-performance-chart` | SLA performance breakdown by tier |
| 4 | "Which customers are at churn risk?" / "Show me high-risk customers" | `customer-risk-list` | High-risk customers requiring attention |
| 5 | "customer sentiment" | `nps-sentiment-analysis` | Customer sentiment analysis and trending topics |
| 6 | "top performers" | `agent-performance-comparison` | Performance comparison for your team |

---

### 8. CS Manager

**Persona**: David Miller | **Badge**: MGR (Orange) | **URL**: `/dsq/demo/atc-manager`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show me team status" / "Show me my team's status" / "Show workload balance" | `team-workload-dashboard` | Team workload dashboard shows task distribution |
| 2 | "Who is top performing agent?" / "Who are the top and bottom performers?" / "compare agent performance" | `agent-performance-comparison` | Performance comparison for your team |
| 3 | "Who is most slacking agent?" | `team-workload-dashboard` | Team workload analysis showing agents who may need support |
| 4 | "Show me all high-risk customers" | `customer-risk-list` | High-risk customers requiring attention |
| 5 | "Show team budget" | `budget-utilization-dashboard` | Team budget overview and allocation |
| 6 | "my current tickets" | `ticket-list` | Latest end user requests |
| 7 | "Show ticket DESK-1001" | `ticket-detail` | Ticket details |

---

### 9. Support Agent

**Persona**: Christopher Hayes | **Badge**: SUPPORT AGENT (Teal) | **URL**: `/dsq/demo/atc-support`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Good morning, what's on my plate today?" / "what is on my plate today" / "good morning" | `agent-dashboard` | Your daily overview with tasks and priorities |
| 2 | "Show me my performance stats" | `agent-performance-stats` | Your personal performance metrics |
| 3 | "Show me my tickets" / "my tickets" | `ticket-list` | Latest end user requests |
| 4 | "Show ticket DESK-1001" / "Show me ticket TICK-001" | `ticket-detail` | Ticket details |
| 5 | "Find similar tickets I've resolved" / "similar tickets" | `similar-tickets-analysis` | Similar tickets and resolution patterns |
| 6 | "Help me prepare for the call with Acme Corp" / "prepare for call" | `call-prep-notes` | Call preparation notes for upcoming customer call |
| 7 | "Draft response for angry customer" / "draft response" | `response-composer` | Draft a professional response |
| 8 | "Search knowledge base for password reset" / "password reset" | `knowledge-article` | Password reset guide |
| 9 | "knowledge base" | `knowledge-base-search` | Knowledge base search results |

---

### 10. Customer Success Manager (CSM)

**Persona**: Jordan Taylor | **Badge**: CSM (Purple) | **URL**: `/dsq/demo/atc-csm`

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show customer health scores" / "customer health scores" | `customer-risk-list` | Customer health scores and account status |
| 2 | "Show upcoming renewals" / "upcoming renewals" | `renewal-pipeline` | Upcoming contract renewals |
| 3 | "Show upsell opportunities" / "upsell opportunities" / "expansion opportunities" | `upsell-opportunities` | Expansion and upsell opportunities |
| 4 | "Which customers declining adoption?" / "product adoption" | `product-adoption-metrics` | Product adoption metrics and feature usage |
| 5 | "churn risk analysis" | `customer-risk-profile` | Churn risk analysis for at-risk clients |
| 6 | "NPS survey results" | `nps-sentiment-analysis` | NPS and customer feedback analysis |
| 7 | "business review" | `meeting-scheduler` | Business review scheduling |
| 8 | "top performers" | `agent-performance-comparison` | Performance comparison for your team |

---

## Universal Queries

These queries work across ALL personas:

| # | Queries (Grouped) | Widget | Response |
|---|-------------------|--------|----------|
| 1 | "Show me zoho tickets" / "show me my zoho tickets" / "Show me tickets" | `ticket-list` | Latest end user requests |
| 2 | "top performers" / "Who is top performing agent?" | `agent-performance-comparison` | Performance comparison for your team |
| 3 | "draft a response" | `response-composer` | Draft a professional response |

---

## Quick Stats

| Metric | Value |
|--------|-------|
| **Total Unique Widgets** | 28 |
| **Total Query Patterns** | 116 |
| **Grouped Query Sets** | 52 |
| **Personas** | 10 |
| **Modes** | 3 |

---

## Production URLs

| Mode | Persona | URL |
|------|---------|-----|
| Government | COR | https://dsq.digitalworkplace.ai/dsq/demo/cor |
| Government | Program Manager | https://dsq.digitalworkplace.ai/dsq/demo/program-manager |
| Government | Stakeholder Lead | https://dsq.digitalworkplace.ai/dsq/demo/stakeholder-lead |
| Project | Project Manager | https://dsq.digitalworkplace.ai/dsq/demo/project-manager |
| Project | Service Team Lead | https://dsq.digitalworkplace.ai/dsq/demo/service-team-lead |
| Project | Service Team Member | https://dsq.digitalworkplace.ai/dsq/demo/service-team-member |
| ATC | C-Level Executive | https://dsq.digitalworkplace.ai/dsq/demo/atc-executive |
| ATC | CS Manager | https://dsq.digitalworkplace.ai/dsq/demo/atc-manager |
| ATC | Support Agent | https://dsq.digitalworkplace.ai/dsq/demo/atc-support |
| ATC | CSM | https://dsq.digitalworkplace.ai/dsq/demo/atc-csm |

---

**Document maintained by Digital Workplace AI Team**
**For questions, contact: support@digitalworkplace.ai**
