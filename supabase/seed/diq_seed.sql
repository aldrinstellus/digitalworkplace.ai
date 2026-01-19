-- =============================================================================
-- dIQ SEED DATA
-- Run this after migrations to populate demo data
-- =============================================================================

-- Insert dIQ project if not exists
INSERT INTO public.projects (code, name, description, color_primary, color_secondary, is_active)
VALUES ('dIQ', 'Intranet IQ', 'AI-powered internal knowledge network', '#3b82f6', '#8b5cf6', true)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- DEPARTMENTS
-- =============================================================================

INSERT INTO diq.departments (id, name, slug, description, parent_id, manager_id) VALUES
('dept-exec', 'Executive', 'executive', 'Executive leadership team', NULL, NULL),
('dept-eng', 'Engineering', 'engineering', 'Software engineering and development', NULL, NULL),
('dept-mkt', 'Marketing', 'marketing', 'Marketing and communications', NULL, NULL),
('dept-sales', 'Sales', 'sales', 'Sales and business development', NULL, NULL),
('dept-hr', 'Human Resources', 'human-resources', 'Human resources and people operations', NULL, NULL),
('dept-finance', 'Finance', 'finance', 'Finance and accounting', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- DEMO USERS (will sync with Clerk on login)
-- =============================================================================

INSERT INTO public.users (id, clerk_id, email, full_name, avatar_url, role) VALUES
('user-1', 'demo_james', 'james.morrison@company.com', 'James Morrison', NULL, 'super_admin'),
('user-2', 'demo_sarah', 'sarah.chen@company.com', 'Sarah Chen', NULL, 'admin'),
('user-3', 'demo_michael', 'michael.park@company.com', 'Michael Park', NULL, 'admin'),
('user-4', 'demo_emily', 'emily.rodriguez@company.com', 'Emily Rodriguez', NULL, 'user'),
('user-5', 'demo_david', 'david.kim@company.com', 'David Kim', NULL, 'admin'),
('user-6', 'demo_alex', 'alex.thompson@company.com', 'Alex Thompson', NULL, 'user'),
('user-7', 'demo_lisa', 'lisa.wang@company.com', 'Lisa Wang', NULL, 'user'),
('user-8', 'demo_robert', 'robert.johnson@company.com', 'Robert Johnson', NULL, 'user')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- EMPLOYEES
-- =============================================================================

INSERT INTO diq.employees (id, user_id, department_id, job_title, phone, location, skills, manager_id, hire_date) VALUES
('emp-1', 'user-1', 'dept-exec', 'CEO', '+1 (555) 100-0001', 'San Francisco, CA', ARRAY['leadership', 'strategy'], NULL, '2018-01-15'),
('emp-2', 'user-2', 'dept-eng', 'VP of Engineering', '+1 (555) 100-0002', 'San Francisco, CA', ARRAY['software', 'management', 'architecture'], 'emp-1', '2019-03-01'),
('emp-3', 'user-3', 'dept-mkt', 'VP of Marketing', '+1 (555) 100-0003', 'New York, NY', ARRAY['marketing', 'brand', 'communications'], 'emp-1', '2019-06-15'),
('emp-4', 'user-4', 'dept-sales', 'VP of Sales', '+1 (555) 100-0004', 'Chicago, IL', ARRAY['sales', 'negotiation', 'partnerships'], 'emp-1', '2020-01-10'),
('emp-5', 'user-5', 'dept-hr', 'VP of HR', '+1 (555) 100-0005', 'San Francisco, CA', ARRAY['hr', 'recruiting', 'culture'], 'emp-1', '2019-09-01'),
('emp-6', 'user-6', 'dept-eng', 'Engineering Manager', '+1 (555) 100-0006', 'Austin, TX', ARRAY['software', 'agile', 'team-lead'], 'emp-2', '2020-05-15'),
('emp-7', 'user-7', 'dept-eng', 'Senior Software Engineer', '+1 (555) 100-0007', 'Remote', ARRAY['typescript', 'react', 'node'], 'emp-2', '2021-02-01'),
('emp-8', 'user-8', 'dept-mkt', 'Marketing Manager', '+1 (555) 100-0008', 'New York, NY', ARRAY['content', 'social-media', 'campaigns'], 'emp-3', '2021-08-15')
ON CONFLICT (id) DO NOTHING;

-- Update department managers
UPDATE diq.departments SET manager_id = 'user-1' WHERE id = 'dept-exec';
UPDATE diq.departments SET manager_id = 'user-2' WHERE id = 'dept-eng';
UPDATE diq.departments SET manager_id = 'user-3' WHERE id = 'dept-mkt';
UPDATE diq.departments SET manager_id = 'user-4' WHERE id = 'dept-sales';
UPDATE diq.departments SET manager_id = 'user-5' WHERE id = 'dept-hr';

-- =============================================================================
-- KB CATEGORIES
-- =============================================================================

INSERT INTO diq.kb_categories (id, name, slug, description, department_id, icon, color, sort_order, is_public) VALUES
('cat-eng', 'Engineering', 'engineering', 'Engineering documentation and guidelines', 'dept-eng', 'code', '#3b82f6', 1, true),
('cat-eng-dev', 'Development Guidelines', 'development-guidelines', 'Code standards and best practices', 'dept-eng', 'file-code', '#3b82f6', 1, true),
('cat-eng-arch', 'Architecture', 'architecture', 'System architecture documents', 'dept-eng', 'layers', '#3b82f6', 2, true),
('cat-hr', 'Human Resources', 'human-resources', 'HR policies and procedures', 'dept-hr', 'users', '#10b981', 2, true),
('cat-hr-policy', 'Policies', 'policies', 'Company policies and guidelines', 'dept-hr', 'shield', '#10b981', 1, true),
('cat-hr-benefits', 'Benefits', 'benefits', 'Employee benefits information', 'dept-hr', 'heart', '#10b981', 2, true),
('cat-mkt', 'Marketing', 'marketing', 'Marketing resources and templates', 'dept-mkt', 'megaphone', '#8b5cf6', 3, true),
('cat-sales', 'Sales', 'sales', 'Sales playbooks and resources', 'dept-sales', 'trending-up', '#f59e0b', 4, false)
ON CONFLICT (id) DO NOTHING;

-- Set parent categories
UPDATE diq.kb_categories SET parent_id = 'cat-eng' WHERE id IN ('cat-eng-dev', 'cat-eng-arch');
UPDATE diq.kb_categories SET parent_id = 'cat-hr' WHERE id IN ('cat-hr-policy', 'cat-hr-benefits');

-- =============================================================================
-- ARTICLES
-- =============================================================================

INSERT INTO diq.articles (id, category_id, title, slug, content, summary, author_id, status, published_at, tags, view_count, helpful_count) VALUES
('art-1', 'cat-eng-dev', 'Code Review Standards', 'code-review-standards',
'# Code Review Standards

## Overview
This document outlines our code review standards and best practices for all engineering teams.

## Key Principles
1. **Be Respectful**: Reviews should be constructive and professional
2. **Be Thorough**: Check for logic errors, security issues, and performance
3. **Be Timely**: Complete reviews within 24 hours when possible

## Review Checklist
- [ ] Code follows style guide
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

## Approval Requirements
- At least 2 approvals required for production code
- 1 approval from a senior engineer for critical changes',
'Guidelines for conducting effective code reviews', 'user-2', 'published', NOW() - INTERVAL '2 days', ARRAY['development', 'standards', 'code-review'], 234, 45),

('art-2', 'cat-eng-dev', 'Git Workflow', 'git-workflow',
'# Git Workflow Guide

## Branch Naming
- feature/TICKET-description
- bugfix/TICKET-description
- hotfix/TICKET-description

## Commit Messages
Follow conventional commits format:
```
type(scope): description

[optional body]
```

## Pull Request Process
1. Create feature branch from main
2. Make changes and commit
3. Push and create PR
4. Get reviews and approval
5. Squash and merge',
'Our standard Git workflow and branching strategy', 'user-6', 'published', NOW() - INTERVAL '1 day', ARRAY['git', 'workflow', 'version-control'], 156, 32),

('art-3', 'cat-eng-arch', 'System Architecture Overview', 'system-architecture',
'# System Architecture

## Overview
Our system follows a microservices architecture deployed on Kubernetes.

## Components
- API Gateway
- Authentication Service
- Core Services
- Database Layer
- Message Queue

## Tech Stack
- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Python
- **Database**: PostgreSQL, Redis
- **Infrastructure**: Kubernetes, AWS',
'High-level overview of our system architecture', 'user-2', 'published', NOW() - INTERVAL '7 days', ARRAY['architecture', 'system', 'infrastructure'], 89, 21),

('art-4', 'cat-hr-policy', 'Employee Handbook', 'employee-handbook',
'# Employee Handbook

## Welcome
Welcome to our company! This handbook contains important information about policies and procedures.

## Work Hours
- Standard hours: 9 AM - 5 PM
- Flexible work arrangements available
- Remote work policy applies

## Time Off
- 20 days PTO annually
- 10 holidays per year
- Sick leave as needed

## Code of Conduct
All employees are expected to maintain professional behavior and respect colleagues.',
'Comprehensive guide to company policies and procedures', 'user-5', 'published', NOW() - INTERVAL '30 days', ARRAY['policy', 'handbook', 'onboarding'], 892, 156),

('art-5', 'cat-hr-policy', 'Vacation Policy', 'vacation-policy',
'# Vacation Policy

## Annual Leave Entitlement
- Full-time employees: 20 days per year
- Part-time employees: Pro-rated based on hours
- Additional days after 5 years of service

## Key Points
1. Leave requests should be submitted at least 2 weeks in advance
2. Maximum consecutive days: 15 working days
3. Unused days can carry over (max 5 days) to the next year

## Holiday Scheduling
- Peak periods (Dec-Jan) require 4 weeks notice
- Team coverage must be maintained',
'Details on vacation and time off policies', 'user-5', 'published', NOW() - INTERVAL '14 days', ARRAY['policy', 'vacation', 'time-off'], 567, 89),

('art-6', 'cat-hr-benefits', 'Benefits Guide', 'benefits-guide',
'# Employee Benefits Guide

## Health Insurance
- Medical, dental, and vision coverage
- Company covers 80% of premiums
- HSA/FSA options available

## Retirement
- 401(k) with 4% company match
- Vesting after 2 years

## Other Benefits
- Life insurance (2x salary)
- Disability insurance
- Wellness program
- Employee assistance program',
'Overview of employee benefits and perks', 'user-5', 'published', NOW() - INTERVAL '7 days', ARRAY['benefits', 'insurance', 'compensation'], 345, 67),

('art-7', 'cat-mkt', 'Brand Guidelines', 'brand-guidelines',
'# Brand Guidelines

## Logo Usage
- Minimum size: 32px height
- Clear space: 20% of logo height
- Never stretch or distort

## Colors
- Primary: #3b82f6 (Blue)
- Secondary: #8b5cf6 (Purple)
- Accent: #10b981 (Green)

## Typography
- Headings: Inter, 600 weight
- Body: Inter, 400 weight
- Code: JetBrains Mono',
'Official brand guidelines and assets', 'user-3', 'published', NOW() - INTERVAL '3 days', ARRAY['brand', 'guidelines', 'design'], 234, 34),

('art-8', 'cat-sales', 'Sales Playbook', 'sales-playbook',
'# Sales Playbook

## Sales Process
1. Lead Generation
2. Qualification
3. Discovery
4. Proposal
5. Negotiation
6. Closing

## Key Metrics
- Conversion rate target: 25%
- Average deal size: $50,000
- Sales cycle: 45 days

## Resources
- CRM: Salesforce
- Communication: Slack
- Documents: Google Drive',
'Comprehensive sales methodology and resources', 'user-4', 'published', NOW() - INTERVAL '5 days', ARRAY['sales', 'playbook', 'methodology'], 456, 78)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WORKFLOWS
-- =============================================================================

INSERT INTO diq.workflows (id, name, description, created_by, status, trigger_type, trigger_config, is_template, template_category) VALUES
('wf-1', 'New Employee Onboarding', 'Automates the onboarding process for new employees including account setup, welcome emails, and training assignments.', 'user-5', 'active', 'event', '{"event": "employee.created"}', false, NULL),
('wf-2', 'Support Ticket Triage', 'AI-powered ticket classification and routing based on content analysis and priority scoring.', 'user-2', 'active', 'event', '{"event": "ticket.created"}', false, NULL),
('wf-3', 'Weekly Report Generator', 'Compiles data from multiple sources to generate automated weekly summary reports.', 'user-3', 'paused', 'schedule', '{"cron": "0 9 * * 1"}', false, NULL),
('wf-4', 'Contract Review Assistant', 'AI-assisted contract analysis for risk identification and compliance checking.', 'user-4', 'draft', 'manual', '{}', false, NULL),
('wf-5', 'Employee Onboarding Template', 'Template for creating employee onboarding workflows', 'user-5', 'active', 'event', '{}', true, 'HR'),
('wf-6', 'Document Approval Template', 'Template for document approval workflows', 'user-2', 'active', 'event', '{}', true, 'Operations')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- WORKFLOW STEPS
-- =============================================================================

INSERT INTO diq.workflow_steps (id, workflow_id, step_number, name, type, config) VALUES
-- Onboarding workflow steps
('step-1-1', 'wf-1', 1, 'New Employee Added', 'action', '{"trigger": "hr_system.new_employee", "description": "When a new employee record is created in HR system"}'),
('step-1-2', 'wf-1', 2, 'Create Accounts', 'action', '{"action": "create_accounts", "systems": ["email", "slack", "github"], "description": "Set up email, Slack, and system accounts"}'),
('step-1-3', 'wf-1', 3, 'Send Welcome Email', 'action', '{"action": "send_email", "template": "welcome", "description": "Send personalized welcome message with resources"}'),
('step-1-4', 'wf-1', 4, 'Assign Training', 'action', '{"action": "assign_training", "modules": ["security", "compliance", "tools"], "description": "Enroll in required training modules"}'),
('step-1-5', 'wf-1', 5, 'Notify Manager', 'action', '{"action": "notify", "recipient": "manager", "description": "Send completion summary to hiring manager"}'),

-- Support ticket triage steps
('step-2-1', 'wf-2', 1, 'New Ticket Created', 'action', '{"trigger": "support.ticket_created", "description": "When a support ticket is submitted"}'),
('step-2-2', 'wf-2', 2, 'Analyze Content', 'llm', '{"model": "gpt-4", "prompt": "Analyze ticket content and classify", "description": "Use AI to understand ticket intent"}'),
('step-2-3', 'wf-2', 3, 'Priority Check', 'condition', '{"field": "priority", "operators": ["high", "medium", "low"], "description": "Evaluate urgency and impact"}'),
('step-2-4', 'wf-2', 4, 'Route to Team', 'action', '{"action": "assign_team", "description": "Assign to appropriate support team"}'),

-- Weekly report steps
('step-3-1', 'wf-3', 1, 'Scheduled (Weekly)', 'action', '{"schedule": "0 9 * * 1", "description": "Every Monday at 9:00 AM"}'),
('step-3-2', 'wf-3', 2, 'Gather Data', 'search', '{"sources": ["metrics", "analytics", "sales"], "description": "Pull metrics from connected systems"}'),
('step-3-3', 'wf-3', 3, 'Generate Report', 'llm', '{"model": "gpt-4", "template": "weekly_report", "description": "Create formatted report document"}'),
('step-3-4', 'wf-3', 4, 'Distribute', 'action', '{"action": "send_email", "recipients": "stakeholders", "description": "Email report to stakeholders"}'),

-- Contract review steps
('step-4-1', 'wf-4', 1, 'Contract Uploaded', 'action', '{"trigger": "document.uploaded", "filter": "contract", "description": "When new contract document is added"}'),
('step-4-2', 'wf-4', 2, 'Extract Terms', 'llm', '{"model": "claude-3", "task": "extract_terms", "description": "AI extracts key contract terms"}'),
('step-4-3', 'wf-4', 3, 'Risk Assessment', 'condition', '{"analysis": "risk_score", "threshold": 70, "description": "Evaluate potential risks and flags"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- NEWS POSTS
-- =============================================================================

INSERT INTO diq.news_posts (id, author_id, title, content, type, department_id, visibility, pinned, likes_count, comments_count, published_at) VALUES
('post-1', 'user-1', 'Q4 Company Update', 'Excited to share our Q4 results! We exceeded targets across all departments. Thank you to everyone for your hard work and dedication. Looking forward to an amazing 2026!', 'announcement', NULL, 'all', true, 47, 12, NOW() - INTERVAL '1 day'),
('post-2', 'user-2', 'Engineering Team Wins Hackathon', 'Congratulations to the engineering team for winning the internal hackathon! Their AI-powered solution will be integrated into our product roadmap.', 'post', 'dept-eng', 'all', false, 32, 8, NOW() - INTERVAL '3 days'),
('post-3', 'user-3', 'New Brand Guidelines Released', 'We''ve updated our brand guidelines with new colors and typography. Please review the latest version in the Marketing folder.', 'announcement', 'dept-mkt', 'all', false, 18, 5, NOW() - INTERVAL '5 days'),
('post-4', 'user-5', 'Open Enrollment Reminder', 'Reminder: Open enrollment for benefits ends next Friday. Please submit your selections through the HR portal.', 'announcement', 'dept-hr', 'all', true, 25, 3, NOW() - INTERVAL '2 days'),
('post-5', 'user-4', 'Sales Record Broken!', 'Amazing news - we just closed our largest deal ever! Thanks to the entire sales team for their incredible work.', 'post', 'dept-sales', 'all', false, 56, 15, NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- EVENTS
-- =============================================================================

INSERT INTO diq.events (id, title, description, organizer_id, department_id, location, location_type, meeting_url, start_time, end_time, all_day, visibility, max_attendees) VALUES
('evt-1', 'All Hands Meeting', 'Monthly all-hands meeting with company updates and Q&A', 'user-1', NULL, 'Main Conference Room', 'hybrid', 'https://zoom.us/j/123456789', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', NOW() + INTERVAL '2 days' + INTERVAL '15 hours', false, 'all', 200),
('evt-2', 'Engineering Sprint Planning', 'Q1 sprint planning session for engineering teams', 'user-2', 'dept-eng', 'Engineering Hub', 'in_person', NULL, NOW() + INTERVAL '3 days' + INTERVAL '10 hours', NOW() + INTERVAL '3 days' + INTERVAL '12 hours', false, 'department', 30),
('evt-3', 'Marketing Campaign Review', 'Review Q4 campaign performance and plan Q1', 'user-3', 'dept-mkt', NULL, 'virtual', 'https://meet.google.com/abc-defg-hij', NOW() + INTERVAL '4 days' + INTERVAL '15 hours', NOW() + INTERVAL '4 days' + INTERVAL '16 hours', false, 'department', 15),
('evt-4', 'New Hire Orientation', 'Welcome session for new employees', 'user-5', 'dept-hr', 'Training Room A', 'in_person', NULL, NOW() + INTERVAL '7 days' + INTERVAL '9 hours', NOW() + INTERVAL '7 days' + INTERVAL '12 hours', false, 'all', 20),
('evt-5', 'Company Holiday Party', 'Annual holiday celebration', 'user-1', NULL, 'Grand Ballroom, Hotel Downtown', 'in_person', NULL, NOW() + INTERVAL '14 days' + INTERVAL '18 hours', NOW() + INTERVAL '14 days' + INTERVAL '22 hours', false, 'all', 300)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SEARCH HISTORY (for demo)
-- =============================================================================

INSERT INTO diq.search_history (id, user_id, query, filters, results_count, clicked_results) VALUES
('sh-1', 'user-7', 'vacation policy', '{}', 5, ARRAY['art-5']),
('sh-2', 'user-6', 'git workflow', '{}', 3, ARRAY['art-2']),
('sh-3', 'user-8', 'brand guidelines', '{}', 2, ARRAY['art-7']),
('sh-4', 'user-7', 'onboarding', '{}', 8, ARRAY['art-4', 'wf-1'])
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- USER SETTINGS (defaults)
-- =============================================================================

INSERT INTO diq.user_settings (id, user_id, notification_prefs, appearance, ai_prefs, privacy) VALUES
('settings-7', 'user-7',
  '{"email_digest": true, "news_mentions": true, "article_updates": true, "event_reminders": true}',
  '{"theme": "dark", "sidebar_collapsed": false, "density": "comfortable"}',
  '{"default_llm": "claude-3", "response_style": "balanced", "show_sources": true}',
  '{"show_profile": true, "show_activity": true, "searchable": true}'
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- KNOWLEDGE ITEMS (for cross-project search)
-- =============================================================================

-- Link articles to knowledge_items for unified search
INSERT INTO public.knowledge_items (project_id, source_table, source_id, type, title, content, summary, tags, created_by)
SELECT
  (SELECT id FROM public.projects WHERE code = 'dIQ'),
  'diq.articles',
  a.id,
  'article',
  a.title,
  a.content,
  a.summary,
  a.tags,
  a.author_id
FROM diq.articles a
WHERE a.status = 'published'
ON CONFLICT DO NOTHING;

COMMIT;
