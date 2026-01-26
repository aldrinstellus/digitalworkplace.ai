# Master Demo Guide - Support IQ (dSQ)

**Version**: 1.0.0
**Last Updated**: January 26, 2026
**Production URL**: https://dsq.digitalworkplace.ai/dsq
**Test Status**: 117/117 Tests Passing (100%)

---

## Table of Contents

1. [Overview](#overview)
2. [Government Mode](#government-mode)
   - [COR - Contracting Officer's Representative](#1-cor---contracting-officers-representative)
   - [Program Manager](#2-program-manager)
   - [Stakeholder Lead](#3-stakeholder-lead)
3. [Project Mode](#project-mode)
   - [Project Manager](#4-project-manager)
   - [Service Team Lead](#5-service-team-lead)
   - [Service Team Member](#6-service-team-member)
4. [ATC Mode (Enterprise Support)](#atc-mode-enterprise-support)
   - [C-Level Executive](#7-c-level-executive)
   - [CS Manager](#8-cs-manager)
   - [Support Agent](#9-support-agent)
   - [Customer Success Manager (CSM)](#10-customer-success-manager-csm)
5. [Universal Queries](#universal-queries)
6. [Quick Reference Matrix](#quick-reference-matrix)
7. [Technical Details](#technical-details)

---

## Overview

Support IQ (dSQ) is an AI-enhanced customer support platform supporting **3 modes** and **10 personas**. Each persona has role-specific queries that return appropriate widgets based on semantic pattern matching with pgvector embeddings.

### Modes Summary

| Mode | Description | Personas |
|------|-------------|----------|
| **Government** | Federal & public sector contract management | COR, Program Manager, Stakeholder Lead |
| **Project** | Agile project management & development teams | Project Manager, Service Team Lead, Service Team Member |
| **ATC** | Enterprise support & customer success | Executive, CS Manager, Support Agent, CSM |

### Test Coverage

| Mode | Tests | Pass Rate |
|------|-------|-----------|
| Government | 33/33 | 100% |
| Project | 31/31 | 100% |
| ATC | 53/53 | 100% |
| **Total** | **117/117** | **100%** |

---

## Government Mode

Government mode focuses on federal contracting, program oversight, and stakeholder management. Uses terminology like "Compliance" instead of "SLA".

---

### 1. COR - Contracting Officer's Representative

**Persona**: Alexa Johnson
**Role**: Contracting Officer's Representative
**Badge**: COR (Purple)
**URL**: `/dsq/demo/cor`

#### Quick Actions
- Contract Status (Active)
- Vendor Performance (92%)
- Compliance Dashboard (✓)
- Budget Tracking ($2.4M)
- Deliverables Review (8)

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Show contract status" | `contract-performance-dashboard` | Contract performance dashboard shows portfolio metrics and status |
| 2 | "Show me current contract status" | `contract-performance-dashboard` | Contract performance dashboard shows portfolio metrics and status |
| 3 | "Show contract performance dashboard" | `contract-performance-dashboard` | Contract performance dashboard shows portfolio metrics and status |
| 4 | "Show vendor performance" | `vendor-compliance-dashboard` | Vendor compliance dashboard shows SLA performance and compliance status |
| 5 | "Show me vendor performance metrics" | `vendor-compliance-dashboard` | Vendor compliance dashboard shows SLA performance and compliance status |
| 6 | "Show me compliance dashboard" | `vendor-compliance-dashboard` | Vendor compliance dashboard shows SLA performance and compliance status |
| 7 | "Show deliverables due this month" | `deliverable-review-list` | Deliverable reviews pending your approval |
| 8 | "Show me contract deliverables status" | `deliverable-review-list` | Deliverable reviews pending your approval |
| 9 | "Show me budget tracking dashboard" | `budget-utilization-dashboard` | Budget utilization and burn rate analysis |
| 10 | "Budget remaining for contracts" | `budget-utilization-dashboard` | Budget utilization and burn rate analysis |
| 11 | "Who is top performing agent?" | `agent-performance-comparison` | Here's the performance comparison for your team |
| 12 | "Who is most slacking agent?" | `team-workload-dashboard` | Team workload analysis showing agents who may need support |

---

### 2. Program Manager

**Persona**: Jennifer Chen
**Role**: Program Manager
**Badge**: PM (Blue)
**URL**: `/dsq/demo/program-manager`

#### Quick Actions
- Program Overview (5 Projects)
- Milestone Tracker (12)
- Stakeholder Reports (Q4)
- Resource Allocation (View)
- Risk Register (3)

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Show program overview" | `program-health-dashboard` | Program health dashboard shows portfolio status and key metrics |
| 2 | "Show program health dashboard" | `program-health-dashboard` | Program health dashboard shows portfolio status and key metrics |
| 3 | "Program health" | `program-health-dashboard` | Program health dashboard shows portfolio status and key metrics |
| 4 | "Show milestone status" | `milestone-tracking-dashboard` | Milestone progress tracking toward key phases |
| 5 | "Milestone status" | `milestone-tracking-dashboard` | Milestone progress tracking toward key phases |
| 6 | "Show risk register" | `program-health-dashboard` | Risk register shows active risks and mitigation plans |
| 7 | "Critical risk" | `change-request-dashboard` | Change requests and risk items requiring attention |
| 8 | "Show resource allocation" | `resource-capacity-dashboard` | Resource capacity and utilization across the team |
| 9 | "Resource capacity" | `resource-capacity-dashboard` | Resource capacity and utilization across the team |
| 10 | "Show me sprint burndown" | `sprint-burndown-chart` | Sprint burndown chart shows current sprint progress and velocity tracking |
| 11 | "Sprint burn-down" | `sprint-burndown-chart` | Sprint burndown chart shows current sprint progress and velocity tracking |
| 12 | "top performers" | `agent-performance-comparison` | Here's the performance comparison for your team |

---

### 3. Stakeholder Lead

**Persona**: Jessica Martinez
**Role**: Stakeholder Lead
**Badge**: LEAD (Green)
**URL**: `/dsq/demo/stakeholder-lead`

#### Quick Actions
- Impact Analysis (New)
- Change Requests (7)
- User Feedback (24)
- Requirements Tracking (89%)
- Communication Log

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Show impact analysis" | `stakeholder-engagement-dashboard` | Stakeholder engagement metrics and communication effectiveness |
| 2 | "Stakeholder engagement status" | `stakeholder-engagement-dashboard` | Stakeholder engagement metrics and communication effectiveness |
| 3 | "Show stakeholder engagement" | `stakeholder-engagement-dashboard` | Stakeholder engagement metrics and communication effectiveness |
| 4 | "Show change requests" | `change-request-dashboard` | Change requests and risk items requiring attention |
| 5 | "Change request pending" | `change-request-dashboard` | Change requests and risk items requiring attention |
| 6 | "Show user feedback" | `sentiment-analysis` | User feedback analysis and satisfaction trends |
| 7 | "Show requirements tracking" | `requirements-tracking-dashboard` | Requirements tracking shows implementation progress and coverage |
| 8 | "Requirements tracking status" | `requirements-tracking-dashboard` | Requirements tracking shows implementation progress and coverage |
| 9 | "Requirements traceability" | `requirements-tracking-dashboard` | Requirements tracking shows implementation progress and coverage |
| 10 | "Upcoming meetings" | `meeting-scheduler` | Meeting scheduler and upcoming appointments |

---

## Project Mode

Project mode focuses on agile development, sprint management, code quality, and team performance.

---

### 4. Project Manager

**Persona**: Dale Thompson
**Role**: Project Manager
**Badge**: PM (Blue)
**URL**: `/dsq/demo/project-manager`

#### Quick Actions
- Project Dashboard (Live)
- Sprint Planning (Sprint 12)
- Team Capacity (78%)
- Blocker Resolution (5)
- Client Meetings (3)

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Show sprint burndown" | `sprint-burndown-chart` | Sprint burndown chart shows current sprint progress and velocity tracking |
| 2 | "Burndown" | `sprint-burndown-chart` | Sprint burndown chart shows current sprint progress and velocity tracking |
| 3 | "Show team velocity" | `team-velocity-dashboard` | Team velocity trends across recent sprints |
| 4 | "Velocity" | `team-velocity-dashboard` | Team velocity trends across recent sprints |
| 5 | "Show resource capacity" | `resource-capacity-dashboard` | Resource capacity and utilization across the team |
| 6 | "Resource capacity" | `resource-capacity-dashboard` | Resource capacity and utilization across the team |
| 7 | "Show blockers" | `blocker-resolution-dashboard` | Active blockers requiring attention |
| 8 | "Blocker" | `blocker-resolution-dashboard` | Active blockers requiring attention |
| 9 | "Sprint planning" | `task-kanban-board` | Sprint task board shows current work items |
| 10 | "top performers" | `agent-performance-comparison` | Here's the performance comparison for your team |

---

### 5. Service Team Lead

**Persona**: Herbert Roberts
**Role**: Service Team Lead
**Badge**: LEAD (Green)
**URL**: `/dsq/demo/service-team-lead`

#### Quick Actions
- Team Workload (12 Tasks)
- Code Quality (94%)
- Code Reviews (8)
- Deployment Status (✓)
- Team Performance (View)

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Show team workload" | `team-workload-dashboard` | Team workload dashboard shows task distribution and capacity |
| 2 | "Team workload" | `team-workload-dashboard` | Team workload dashboard shows task distribution and capacity |
| 3 | "Show code quality metrics" | `code-quality-dashboard` | Code quality metrics show technical debt and test coverage |
| 4 | "Code quality" | `code-quality-dashboard` | Code quality metrics show technical debt and test coverage |
| 5 | "technical debt" | `code-quality-dashboard` | Code quality metrics show technical debt and test coverage |
| 6 | "Show code reviews" | `code-quality-dashboard` | Code review status and pending reviews |
| 7 | "Show deployment status" | `deployment-pipeline-dashboard` | Deployment pipeline status shows CI/CD health and recent deployments |
| 8 | "Deployment" | `deployment-pipeline-dashboard` | Deployment pipeline status shows CI/CD health and recent deployments |
| 9 | "DORA metrics" | `dora-metrics-dashboard` | DORA metrics show engineering performance indicators |
| 10 | "DORA" | `dora-metrics-dashboard` | DORA metrics show engineering performance indicators |
| 11 | "Show DORA metrics" | `dora-metrics-dashboard` | DORA metrics show engineering performance indicators |

---

### 6. Service Team Member

**Persona**: Molly Rivera
**Role**: Service Team Member
**Badge**: MEMBER (Gray)
**URL**: `/dsq/demo/service-team-member`

#### Quick Actions
- My Sprint Tasks (7)
- My Pull Requests (3)
- My Performance Stats
- Knowledge Base Search
- My Blockers (2)

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Show my assigned requests" | `agent-dashboard` | Here's your daily overview with tasks and priorities |
| 2 | "Daily update" | `agent-dashboard` | Here's your daily overview with tasks and priorities |
| 3 | "my dashboard" | `agent-performance-stats` | Your personal performance metrics |
| 4 | "Show my performance this week" | `agent-performance-stats` | Your personal performance metrics |
| 5 | "my performance" | `agent-performance-stats` | Your personal performance metrics |
| 6 | "Show my sprint tasks" | `task-kanban-board` | Sprint task board shows current work items |
| 7 | "My tasks" | `task-kanban-board` | Sprint task board shows current work items |
| 8 | "Sprint task" | `task-kanban-board` | Sprint task board shows current work items |
| 9 | "code quality" | `code-quality-dashboard` | Code quality metrics show technical debt and test coverage |
| 10 | "top performers" | `agent-performance-comparison` | Here's the performance comparison for your team |

---

## ATC Mode (Enterprise Support)

ATC mode focuses on enterprise customer support, success management, and executive oversight.

---

### 7. C-Level Executive

**Persona**: Jennifer Anderson
**Role**: C-Level Executive (CEO)
**Badge**: EXEC (Gold)
**URL**: `/dsq/demo/atc-executive`

#### Quick Actions
- SLA Performance (92%)
- Churn Risk (5)
- Executive Summary (Q4)
- Board Metrics
- High-Value Accounts (18)

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Show me executive summary" | `executive-summary` | Executive summary shows key business metrics and performance |
| 2 | "Show board-level metrics" | `executive-summary` | Executive summary shows key business metrics and performance |
| 3 | "Show detailed analytics" | `analytics-dashboard` | Analytics dashboard shows operational trends and metrics |
| 4 | "Show me the detailed analytics" | `analytics-dashboard` | Analytics dashboard shows operational trends and metrics |
| 5 | "Show me SLA performance" | `sla-performance-chart` | SLA performance breakdown by tier |
| 6 | "Show me the SLA performance breakdown" | `sla-performance-chart` | SLA performance breakdown by tier |
| 7 | "Which customers are at churn risk?" | `customer-risk-list` | High-risk customers requiring attention |
| 8 | "Show me high-risk customers" | `customer-risk-list` | High-risk customers requiring attention |
| 9 | "customer sentiment" | `sentiment-analysis` | Customer sentiment analysis and trending topics |
| 10 | "top performers" | `agent-performance-comparison` | Here's the performance comparison for your team |

---

### 8. CS Manager

**Persona**: David Miller
**Role**: Customer Success Manager
**Badge**: MGR (Orange)
**URL**: `/dsq/demo/atc-manager`

#### Quick Actions
- Priority Customers (12)
- Agent Performance
- Most Slacking (!)
- Top Performing
- Workload Balance
- Team Budget ($450K)

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Show me team status" | `team-workload-dashboard` | Team workload dashboard shows task distribution and capacity |
| 2 | "Show me my team's status" | `team-workload-dashboard` | Team workload dashboard shows task distribution and capacity |
| 3 | "Show workload balance" | `team-workload-dashboard` | Team workload dashboard shows task distribution and capacity |
| 4 | "Who is top performing agent?" | `agent-performance-comparison` | Here's the performance comparison for your team |
| 5 | "Who are the top and bottom performers?" | `agent-performance-comparison` | Here's the performance comparison for your team |
| 6 | "compare agent performance" | `agent-performance-comparison` | Here's the performance comparison for your team |
| 7 | "Who is most slacking agent?" | `team-workload-dashboard` | Team workload analysis showing agents who may need support |
| 8 | "Show me all high-risk customers" | `customer-risk-list` | High-risk customers requiring attention |
| 9 | "Show team budget" | `analytics-dashboard` | Team budget overview and allocation |
| 10 | "my current tickets" | `ticket-list` | Here are the latest end user requests |
| 11 | "Show ticket DESK-1001" | `ticket-detail` | Ticket details |

---

### 9. Support Agent

**Persona**: Christopher Hayes
**Role**: Senior Support Engineer
**Badge**: SUPPORT AGENT (Teal)
**URL**: `/dsq/demo/atc-support`

#### Quick Actions
- Live Tickets Dashboard (New)
- My Open Tickets (18)
- AI-Resolved Today (23)
- Escalated to Me (5)
- Today's Meetings (3)
- Jira Sync Status (✓)
- High-Priority Alerts (7)

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Good morning, what's on my plate today?" | `agent-dashboard` | Here's your daily overview with tasks and priorities |
| 2 | "what is on my plate today" | `agent-dashboard` | Here's your daily overview with tasks and priorities |
| 3 | "good morning" | `agent-dashboard` | Here's your daily overview with tasks and priorities |
| 4 | "Show me my performance stats" | `agent-performance-stats` | Your personal performance metrics |
| 5 | "Show me my tickets" | `ticket-list` | Here are the latest end user requests |
| 6 | "my tickets" | `ticket-list` | Here are the latest end user requests |
| 7 | "Show ticket DESK-1001" | `ticket-detail` | Ticket details |
| 8 | "Show me ticket TICK-001" | `ticket-detail` | Ticket details |
| 9 | "Find similar tickets I've resolved" | `similar-tickets-analysis` | Similar tickets and resolution patterns |
| 10 | "similar tickets" | `similar-tickets-analysis` | Similar tickets and resolution patterns |
| 11 | "Help me prepare for the call with Acme Corp" | `call-prep-notes` | Call preparation notes for your upcoming customer call |
| 12 | "prepare for call" | `call-prep-notes` | Call preparation notes for your upcoming customer call |
| 13 | "Draft response for angry customer" | `response-composer` | I'll help you draft a professional response |
| 14 | "draft response" | `response-composer` | I'll help you draft a professional response |
| 15 | "Search knowledge base for password reset" | `knowledge-article` | Password reset guide |
| 16 | "knowledge base" | `knowledge-base-search` | Knowledge base search results |
| 17 | "password reset" | `knowledge-article` | Password reset guide |

---

### 10. Customer Success Manager (CSM)

**Persona**: Jordan Taylor
**Role**: Customer Success Manager
**Badge**: CSM (Purple)
**URL**: `/dsq/demo/atc-csm`

#### Quick Actions
- Customer Health Scores (Live)
- Product Adoption (Metrics)
- Renewal Pipeline (12)
- Customer Feedback (NPS)
- Upsell Opportunities ($2.4M)
- Product Roadmap (Q1)
- Customer Meetings (8)

#### Demo Queries

| # | Query | Widget | Response |
|---|-------|--------|----------|
| 1 | "Show customer health scores" | `customer-risk-list` | Customer health scores and account status |
| 2 | "customer health scores" | `customer-risk-list` | Customer health scores and account status |
| 3 | "Show upcoming renewals" | `analytics-dashboard` | Upcoming contract renewals |
| 4 | "upcoming renewals" | `analytics-dashboard` | Upcoming contract renewals |
| 5 | "Show upsell opportunities" | `customer-risk-list` | Expansion and upsell opportunities |
| 6 | "upsell opportunities" | `customer-risk-list` | Expansion and upsell opportunities |
| 7 | "expansion opportunities" | `customer-risk-list` | Expansion and upsell opportunities |
| 8 | "Which customers declining adoption?" | `analytics-dashboard` | Product adoption metrics and feature usage |
| 9 | "product adoption" | `analytics-dashboard` | Product adoption metrics and feature usage |
| 10 | "churn risk analysis" | `customer-risk-profile` | Churn risk analysis for at-risk clients |
| 11 | "NPS survey results" | `sentiment-analysis` | NPS and customer feedback analysis |
| 12 | "business review" | `meeting-scheduler` | Business review scheduling |
| 13 | "top performers" | `agent-performance-comparison` | Here's the performance comparison for your team |

---

## Universal Queries

These queries work across ALL personas:

| Query | Widget | Response |
|-------|--------|----------|
| "Show me zoho tickets" | `ticket-list` | Here are the latest end user requests |
| "show me my zoho tickets" | `ticket-list` | Here are the latest end user requests |
| "Show me tickets" | `ticket-list` | Here are the latest end user requests |
| "top performers" | `agent-performance-comparison` | Here's the performance comparison for your team |
| "Who is top performing agent?" | `agent-performance-comparison` | Here's the performance comparison for your team |
| "draft a response" | `response-composer` | I'll help you draft a professional response |

---

## Quick Reference Matrix

### Widgets by Persona

| Widget | COR | PM (Gov) | SL | PM (Proj) | STL | STM | Exec | Mgr | Support | CSM |
|--------|-----|----------|----|-----------|----|-----|------|-----|---------|-----|
| contract-performance-dashboard | ✓ | | | | | | | | | |
| vendor-compliance-dashboard | ✓ | | | | | | | | | |
| deliverable-review-list | ✓ | | | | | | | | | |
| program-health-dashboard | | ✓ | | | | | | | | |
| stakeholder-engagement-dashboard | | | ✓ | | | | | | | |
| requirements-tracking-dashboard | | | ✓ | | | | | | | |
| change-request-dashboard | | ✓ | ✓ | | | | | | | |
| sprint-burndown-chart | | ✓ | | ✓ | | | | | | |
| team-velocity-dashboard | | | | ✓ | ✓ | | | | | |
| resource-capacity-dashboard | | ✓ | | ✓ | ✓ | | | | | |
| blocker-resolution-dashboard | | | | ✓ | | | | | | |
| task-kanban-board | | | | ✓ | ✓ | ✓ | | | | |
| team-workload-dashboard | | | | | ✓ | | | ✓ | | |
| code-quality-dashboard | | | | | ✓ | ✓ | | | | |
| deployment-pipeline-dashboard | | | | | ✓ | | | | | |
| dora-metrics-dashboard | | | | | ✓ | | | | | |
| executive-summary | | | | | | | ✓ | | | |
| analytics-dashboard | | | | | | | ✓ | ✓ | | ✓ |
| sla-performance-chart | | | | | | | ✓ | | | |
| customer-risk-list | | | | | | | ✓ | ✓ | | ✓ |
| customer-risk-profile | | | | | | | | | | ✓ |
| sentiment-analysis | | | ✓ | | | | ✓ | | | ✓ |
| agent-dashboard | | | | | | ✓ | | | ✓ | |
| agent-performance-stats | | | | | | ✓ | | | ✓ | |
| agent-performance-comparison | ✓ | ✓ | | ✓ | | ✓ | ✓ | ✓ | | ✓ |
| ticket-list | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ticket-detail | | | | | | | | ✓ | ✓ | |
| similar-tickets-analysis | | | | | | | | | ✓ | |
| call-prep-notes | | | | | | | | | ✓ | |
| response-composer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| knowledge-base-search | | | | | | ✓ | | | ✓ | |
| knowledge-article | | | | | | | | | ✓ | |
| meeting-scheduler | | | ✓ | | | | | ✓ | | ✓ |

---

## Technical Details

### Database Configuration

| Property | Value |
|----------|-------|
| Database | Supabase (PostgreSQL 17.6) |
| Project | digitalworkplace-ai |
| Region | us-east-1 |

### Vector Embeddings

| Property | Value |
|----------|-------|
| Extension | pgvector v0.8.0 |
| Model | OpenAI text-embedding-3-small |
| Dimensions | 1536 |
| Coverage | 100% (382 vectors) |

### Pattern Matching

| Property | Value |
|----------|-------|
| Algorithm | Jaccard + Levenshtein |
| Patterns | 148 semantic patterns |
| Personas | 10 personas |
| Modes | 3 modes |

### Production URLs

| Persona | URL |
|---------|-----|
| COR | https://dsq.digitalworkplace.ai/dsq/demo/cor |
| Program Manager | https://dsq.digitalworkplace.ai/dsq/demo/program-manager |
| Stakeholder Lead | https://dsq.digitalworkplace.ai/dsq/demo/stakeholder-lead |
| Project Manager | https://dsq.digitalworkplace.ai/dsq/demo/project-manager |
| Service Team Lead | https://dsq.digitalworkplace.ai/dsq/demo/service-team-lead |
| Service Team Member | https://dsq.digitalworkplace.ai/dsq/demo/service-team-member |
| C-Level Executive | https://dsq.digitalworkplace.ai/dsq/demo/atc-executive |
| CS Manager | https://dsq.digitalworkplace.ai/dsq/demo/atc-manager |
| Support Agent | https://dsq.digitalworkplace.ai/dsq/demo/atc-support |
| CSM | https://dsq.digitalworkplace.ai/dsq/demo/atc-csm |

---

## Source Documents

This master guide consolidates information from:

1. `aldrin_script_v18.md` - Original V18 demo script
2. `v18-demo-script.md` - Extended demo script with 60 queries
3. `v18-demo-clean.md` - Clean version of demo script
4. `test-all-personas.md` - Persona testing documentation
5. `semantic-query-patterns.ts` - Pattern matching source code

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-26 | Initial comprehensive guide with 117 verified queries |

---

**Document maintained by Digital Workplace AI Team**
**For questions, contact: support@digitalworkplace.ai**
