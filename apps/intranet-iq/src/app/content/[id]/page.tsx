"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn } from "@/lib/motion";
import {
  ArrowLeft,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Printer,
  Edit,
  History,
  Tag,
  Folder,
  User,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileText,
  Link2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

// Comprehensive mock articles data
const mockArticlesData: Record<string, ArticleDetail> = {
  "1": {
    id: "1",
    title: "Getting Started with Digital Workplace AI",
    slug: "getting-started-digital-workplace-ai",
    content: `
# Welcome to Digital Workplace AI

This comprehensive guide will help you get started with our AI-powered workplace platform. Whether you're new to the company or exploring new features, this guide has everything you need.

## Quick Start Checklist

Before diving in, ensure you have:
- [ ] Completed your employee profile
- [ ] Set up two-factor authentication
- [ ] Joined your team's Slack channels
- [ ] Bookmarked this knowledge base

## Platform Overview

Digital Workplace AI consists of four integrated products:

### 1. Intranet IQ (dIQ)
Your central hub for company information, news, and collaboration.

**Key Features:**
- Company news and announcements
- Employee directory and org charts
- Knowledge base articles
- AI-powered search

### 2. Support IQ (dSQ)
AI-enhanced customer support platform.

**Key Features:**
- Multi-persona support interfaces
- Real-time ticket management
- Knowledge base integration
- Performance analytics

### 3. Chat Core IQ (dCQ)
Intelligent chatbot platform for customer engagement.

**Key Features:**
- Multi-language support (EN/ES/HT)
- Semantic search
- Custom workflows
- Analytics dashboard

### 4. Test Pilot IQ (dTQ)
Quality assurance and testing automation.

**Key Features:**
- Automated test generation
- Visual regression testing
- Performance monitoring
- Bug tracking integration

## Navigation Basics

### Sidebar Navigation
The left sidebar provides quick access to all major sections:
- **Dashboard**: Your personalized home view
- **Search**: AI-powered enterprise search
- **Chat**: AI Assistant for instant help
- **People**: Employee directory and org charts
- **Content**: Knowledge base articles
- **News**: Company announcements
- **Events**: Calendar and upcoming events

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Cmd/Ctrl + K\` | Open search |
| \`Cmd/Ctrl + /\` | Open AI Assistant |
| \`Cmd/Ctrl + B\` | Toggle sidebar |
| \`Cmd/Ctrl + N\` | New item (context-aware) |

## Getting Help

If you need assistance:

1. **AI Assistant**: Click the chat icon or press \`Cmd/Ctrl + /\`
2. **Knowledge Base**: Search for articles on any topic
3. **IT Support**: Submit a ticket via the help desk
4. **Manager**: Reach out to your direct manager

## Next Steps

- Explore the [Employee Directory](/people)
- Read the [IT Security Guidelines](/content/security-guidelines)
- Set up your [Notification Preferences](/settings)
    `,
    summary: "A comprehensive guide to getting started with the Digital Workplace AI platform, including setup checklist, navigation basics, and key features.",
    category: {
      id: "cat-1",
      name: "Getting Started",
      slug: "getting-started",
      icon: "rocket",
      color: "#10b981",
    },
    author: {
      id: "user-1",
      name: "Sarah Chen",
      role: "CEO",
      avatar: "SC",
      email: "sarah.chen@digitalworkplace.ai",
    },
    status: "published",
    published_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-28T14:30:00Z",
    tags: ["Getting Started", "Onboarding", "Guide", "Platform Overview"],
    view_count: 4523,
    helpful_count: 892,
    not_helpful_count: 23,
    version: 5,
    versions: [
      { version: 5, date: "2026-01-28", author: "Sarah Chen", summary: "Added keyboard shortcuts section" },
      { version: 4, date: "2026-01-20", author: "James Wilson", summary: "Updated product descriptions" },
      { version: 3, date: "2026-01-10", author: "Lisa Park", summary: "Added help section" },
      { version: 2, date: "2025-12-15", author: "Sarah Chen", summary: "Added quick start checklist" },
      { version: 1, date: "2025-11-01", author: "Sarah Chen", summary: "Initial publication" },
    ],
    related_articles: ["2", "3", "4"],
    breadcrumb: [
      { id: "root", name: "Knowledge Base", href: "/content" },
      { id: "cat-1", name: "Getting Started", href: "/content?category=getting-started" },
    ],
    toc: [
      { id: "quick-start-checklist", title: "Quick Start Checklist", level: 2 },
      { id: "platform-overview", title: "Platform Overview", level: 2 },
      { id: "navigation-basics", title: "Navigation Basics", level: 2 },
      { id: "getting-help", title: "Getting Help", level: 2 },
      { id: "next-steps", title: "Next Steps", level: 2 },
    ],
  },
  "2": {
    id: "2",
    title: "IT Security Guidelines and Best Practices",
    slug: "security-guidelines",
    content: `
# IT Security Guidelines

Protecting company data is everyone's responsibility. This guide outlines our security policies and best practices to keep our systems and data safe.

## Password Requirements

### Complexity Rules
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

### Password Best Practices
- **Never reuse passwords** across different accounts
- **Use a password manager** (we provide 1Password for all employees)
- **Change passwords** every 90 days
- **Never share passwords** via email, chat, or phone

## Two-Factor Authentication (2FA)

2FA is **required** for all employees. We support:

1. **Authenticator Apps** (Recommended)
   - Google Authenticator
   - Authy
   - Microsoft Authenticator

2. **Hardware Keys**
   - YubiKey (provided to all employees)
   - Request at IT help desk

3. **SMS** (Last resort only)
   - Less secure than other methods
   - Only use if other options unavailable

### Setting Up 2FA
1. Go to Settings → Security
2. Click "Enable 2FA"
3. Scan QR code with authenticator app
4. Enter verification code
5. Save backup codes securely

## Data Classification

| Level | Description | Examples |
|-------|-------------|----------|
| **Public** | Can be shared externally | Marketing materials, public docs |
| **Internal** | Company-wide access | Policies, org charts |
| **Confidential** | Need-to-know basis | Customer data, financials |
| **Restricted** | Highly sensitive | PII, credentials, legal |

## Device Security

### Company Devices
- Full disk encryption enabled
- Automatic screen lock (5 min)
- Remote wipe capability
- Approved software only

### Personal Devices (BYOD)
- Must register with IT
- Install MDM profile
- Separate work/personal data
- Report loss immediately

## Reporting Security Incidents

If you suspect a security incident:

1. **Don't panic** - but act quickly
2. **Report immediately** to security@digitalworkplace.ai
3. **Preserve evidence** - don't delete or modify anything
4. **Document** what you observed
5. **Don't discuss** with unauthorized persons

### What to Report
- Phishing emails
- Suspicious login attempts
- Lost or stolen devices
- Unauthorized access
- Malware/virus infections
- Data breaches

## Phishing Awareness

### Red Flags
- Urgent or threatening language
- Requests for credentials
- Suspicious sender addresses
- Misspelled domains
- Unexpected attachments

### When in Doubt
1. Don't click links
2. Don't download attachments
3. Forward to security@digitalworkplace.ai
4. Delete the email

## Remote Work Security

### VPN Usage
- **Always use VPN** when on public WiFi
- Connect before accessing company resources
- Disconnect when not in use

### Home Network
- Change default router password
- Enable WPA3 encryption
- Keep firmware updated
- Separate guest network

## Compliance

We adhere to:
- SOC 2 Type II
- GDPR
- CCPA
- HIPAA (where applicable)

## Resources

- [Password Manager Setup Guide](/content/password-manager)
- [VPN Installation Guide](/content/vpn-guide)
- [Phishing Quiz](/training/phishing)
- [Security Training Videos](/training/security)
    `,
    summary: "Comprehensive security guidelines covering passwords, 2FA, data classification, device security, and incident reporting procedures.",
    category: {
      id: "cat-2",
      name: "IT & Security",
      slug: "it-security",
      icon: "shield",
      color: "#ef4444",
    },
    author: {
      id: "user-7",
      name: "Marcus Johnson",
      role: "DevOps Engineer",
      avatar: "MJ",
      email: "marcus.johnson@digitalworkplace.ai",
    },
    status: "published",
    published_at: "2025-11-15T09:00:00Z",
    updated_at: "2026-01-25T11:00:00Z",
    tags: ["Security", "IT", "Compliance", "Guidelines", "Best Practices"],
    view_count: 3891,
    helpful_count: 756,
    not_helpful_count: 12,
    version: 8,
    versions: [
      { version: 8, date: "2026-01-25", author: "Marcus Johnson", summary: "Updated compliance section" },
      { version: 7, date: "2026-01-10", author: "Nina Patel", summary: "Added remote work section" },
    ],
    related_articles: ["1", "5", "6"],
    breadcrumb: [
      { id: "root", name: "Knowledge Base", href: "/content" },
      { id: "cat-2", name: "IT & Security", href: "/content?category=it-security" },
    ],
    toc: [
      { id: "password-requirements", title: "Password Requirements", level: 2 },
      { id: "two-factor-authentication", title: "Two-Factor Authentication", level: 2 },
      { id: "data-classification", title: "Data Classification", level: 2 },
      { id: "device-security", title: "Device Security", level: 2 },
      { id: "reporting-security-incidents", title: "Reporting Security Incidents", level: 2 },
    ],
  },
  "3": {
    id: "3",
    title: "Employee Benefits Guide 2026",
    slug: "benefits-guide-2026",
    content: `
# Employee Benefits Guide 2026

Welcome to your comprehensive guide to Digital Workplace AI's employee benefits. We believe in taking care of our team members with competitive benefits that support your health, wealth, and well-being.

## Health Insurance

### Medical Plans

We offer three medical plan options:

| Plan | Monthly Premium | Deductible | Out-of-Pocket Max |
|------|----------------|------------|-------------------|
| PPO Select | $150 | $500 | $3,000 |
| PPO Premium | $250 | $250 | $2,000 |
| HSA-Compatible | $100 | $1,500 | $4,000 |

**Coverage Includes:**
- Preventive care at 100%
- Mental health services
- Prescription drugs
- Vision and dental (separate plans)
- Fertility treatments (up to $25,000)

### Dental & Vision

**Dental (Delta Dental)**
- Preventive: 100% covered
- Basic: 80% covered
- Major: 50% covered
- Orthodontia: 50% (lifetime max $2,000)

**Vision (VSP)**
- Annual eye exam: $10 copay
- Frames: $150 allowance
- Lenses: Covered in full
- Contacts: $150 allowance

## Financial Benefits

### 401(k) Retirement Plan

- **Company match**: 6% of salary (increased from 4%!)
- **Vesting**: Immediate
- **Provider**: Fidelity
- **Investment options**: 30+ funds including target-date

### Equity Compensation

- Stock options granted at hire
- Annual refresher grants for tenured employees
- Quarterly vesting schedule
- Early exercise available

### Life Insurance

- **Basic**: 2x annual salary (company-paid)
- **Supplemental**: Up to 5x salary (employee-paid)
- **AD&D**: 2x annual salary (company-paid)

## Time Off

### Paid Time Off (PTO)

| Tenure | Annual PTO |
|--------|------------|
| 0-2 years | 20 days |
| 2-5 years | 25 days |
| 5+ years | 30 days |

**Additional Leave:**
- 10 company holidays
- 5 sick days
- 2 volunteer days
- Jury duty (as needed)

### Parental Leave

- **Birth parent**: 16 weeks paid
- **Non-birth parent**: 8 weeks paid
- **Adoption**: 12 weeks paid
- Gradual return-to-work option

## Wellness Benefits

### Wellness Programs

- **Gym reimbursement**: $150/month
- **Mental health**: Unlimited therapy sessions
- **Wellness stipend**: $1,000 annual
- **Meditation app**: Calm subscription included

### Employee Assistance Program (EAP)

Free, confidential support for:
- Mental health counseling
- Financial counseling
- Legal assistance
- Work-life balance coaching

## Professional Development

### Learning & Development

- **Annual budget**: $3,000 per employee
- **Conference attendance**: Fully covered
- **Books & subscriptions**: Reimbursed
- **Internal training**: Ongoing programs

### Tuition Reimbursement

- Up to $10,000/year for degree programs
- 80% reimbursement for certifications
- Must maintain B average

## Perks

### Office Perks
- Free lunch (3 days/week)
- Snacks and beverages
- Standing desks
- Ergonomic equipment

### Remote Perks
- $2,000 home office setup
- $100/month internet stipend
- Co-working space allowance

### Other Perks
- Pet insurance (discounted rates)
- Commuter benefits
- Employee discounts
- Referral bonuses ($5,000)

## Enrollment

### Important Dates
- **Open Enrollment**: January 15 - February 15
- **New Hire Enrollment**: Within 30 days of start
- **Life Event Changes**: Within 30 days of event

### How to Enroll
1. Log into BambooHR
2. Go to Benefits → Enrollment
3. Review plan options
4. Select your coverage
5. Add dependents if applicable
6. Submit before deadline

## Questions?

- **Benefits Portal**: benefits.digitalworkplace.ai
- **Email**: benefits@digitalworkplace.ai
- **Office Hours**: Mon-Wed 2-4 PM
    `,
    summary: "Complete guide to employee benefits including health insurance, retirement plans, time off policies, wellness programs, and professional development opportunities.",
    category: {
      id: "cat-3",
      name: "HR & Benefits",
      slug: "hr-benefits",
      icon: "heart",
      color: "#ec4899",
    },
    author: {
      id: "user-6",
      name: "Amanda Foster",
      role: "Benefits Manager",
      avatar: "AF",
      email: "amanda.foster@digitalworkplace.ai",
    },
    status: "published",
    published_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
    tags: ["Benefits", "HR", "Health Insurance", "401k", "PTO"],
    view_count: 5672,
    helpful_count: 1234,
    not_helpful_count: 8,
    version: 3,
    versions: [
      { version: 3, date: "2026-01-20", author: "Amanda Foster", summary: "Updated 401k match percentage" },
      { version: 2, date: "2026-01-10", author: "Lisa Park", summary: "Added parental leave details" },
      { version: 1, date: "2026-01-01", author: "Amanda Foster", summary: "2026 benefits launch" },
    ],
    related_articles: ["6", "7", "8"],
    breadcrumb: [
      { id: "root", name: "Knowledge Base", href: "/content" },
      { id: "cat-3", name: "HR & Benefits", href: "/content?category=hr-benefits" },
    ],
    toc: [
      { id: "health-insurance", title: "Health Insurance", level: 2 },
      { id: "financial-benefits", title: "Financial Benefits", level: 2 },
      { id: "time-off", title: "Time Off", level: 2 },
      { id: "wellness-benefits", title: "Wellness Benefits", level: 2 },
      { id: "professional-development", title: "Professional Development", level: 2 },
    ],
  },
  "4": {
    id: "4",
    title: "Using the AI Assistant Effectively",
    slug: "ai-assistant-guide",
    content: `
# Using the AI Assistant Effectively

Our AI Assistant is powered by Claude 3.5 and designed to help you work smarter. This guide will help you get the most out of this powerful tool.

## Quick Start

Access the AI Assistant in three ways:
1. Click the chat icon in the sidebar
2. Press \`Cmd/Ctrl + /\`
3. Navigate to /chat

## What the AI Can Help With

### Information Retrieval
- "What's our vacation policy?"
- "Find the latest product roadmap"
- "Who is the head of engineering?"

### Document Assistance
- "Summarize this document"
- "Help me write a project proposal"
- "Review my email draft"

### Task Automation
- "Schedule a meeting with the marketing team"
- "Create a Jira ticket for this bug"
- "Set a reminder for my 1:1 tomorrow"

### Data Analysis
- "Show me Q4 sales numbers"
- "Compare this quarter vs last"
- "Create a chart of monthly users"

## Tips for Better Results

### Be Specific
❌ "Tell me about the product"
✅ "What are the key features of AI Assistant 3.0?"

### Provide Context
❌ "Write me an email"
✅ "Write a follow-up email to John about the budget meeting yesterday"

### Use Natural Language
The AI understands conversational requests:
- "Can you help me understand..."
- "I'm looking for information about..."
- "Please explain the difference between..."

### Iterate and Refine
- Start with a simple query
- Ask follow-up questions
- Request modifications to responses

## Understanding Sources

The AI shows sources for its answers:
- 📄 **Knowledge Base**: Internal articles
- 👤 **People**: Employee directory info
- 📅 **Events**: Calendar and meetings
- 📊 **Data**: Company metrics

Click on sources to verify information.

## Privacy & Security

### What's Shared
- Your conversation history (encrypted)
- Documents you explicitly share
- Search queries

### What's NOT Shared
- Personal credentials
- Financial information
- Private messages

### Data Retention
- Conversations stored for 90 days
- Can be deleted on request
- Admin audit access for compliance

## Limitations

The AI Assistant:
- Cannot access external websites
- Cannot make purchases or payments
- Cannot modify production systems
- Cannot access other users' private data

## Feedback

Help us improve! Rate responses with 👍 or 👎 and tell us why.

## Examples

### Example 1: Meeting Prep
**You**: "Prepare me for my 1:1 with Sarah Chen tomorrow"

**AI**: Based on your calendar and recent interactions, here's your prep:
- Last meeting was Jan 15, discussed Q4 goals
- Action items: Follow up on budget proposal
- Topics to discuss: Team expansion plans
- Sarah's recent news: Announced Q4 results

### Example 2: Document Summary
**You**: "Summarize the Q4 financial report"

**AI**: Here are the key highlights from the Q4 2025 Financial Report:
- Revenue: $42.5M (+35% YoY)
- Net Retention: 127%
- New Customers: 47 enterprises
[View full report →]

### Example 3: Policy Question
**You**: "How many vacation days do I get?"

**AI**: Based on your tenure (3 years), you receive:
- 25 days PTO annually
- 10 company holidays
- 5 sick days
[View Benefits Guide →]
    `,
    summary: "Learn how to effectively use the AI Assistant for information retrieval, document assistance, task automation, and data analysis.",
    category: {
      id: "cat-4",
      name: "AI & Tools",
      slug: "ai-tools",
      icon: "bot",
      color: "#8b5cf6",
    },
    author: {
      id: "user-4",
      name: "James Wilson",
      role: "Product Lead",
      avatar: "JW",
      email: "james.wilson@digitalworkplace.ai",
    },
    status: "published",
    published_at: "2026-01-24T12:00:00Z",
    updated_at: "2026-01-29T09:00:00Z",
    tags: ["AI", "Assistant", "Guide", "Productivity", "Tips"],
    view_count: 2891,
    helpful_count: 567,
    not_helpful_count: 15,
    version: 2,
    versions: [
      { version: 2, date: "2026-01-29", author: "James Wilson", summary: "Added examples section" },
      { version: 1, date: "2026-01-24", author: "James Wilson", summary: "Initial publication" },
    ],
    related_articles: ["1", "5", "9"],
    breadcrumb: [
      { id: "root", name: "Knowledge Base", href: "/content" },
      { id: "cat-4", name: "AI & Tools", href: "/content?category=ai-tools" },
    ],
    toc: [
      { id: "quick-start", title: "Quick Start", level: 2 },
      { id: "what-the-ai-can-help-with", title: "What the AI Can Help With", level: 2 },
      { id: "tips-for-better-results", title: "Tips for Better Results", level: 2 },
      { id: "understanding-sources", title: "Understanding Sources", level: 2 },
      { id: "examples", title: "Examples", level: 2 },
    ],
  },
};

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

interface Version {
  version: number;
  date: string;
  author: string;
  summary: string;
}

interface Breadcrumb {
  id: string;
  name: string;
  href: string;
}

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: Category;
  author: Author;
  status: string;
  published_at: string;
  updated_at: string;
  tags: string[];
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  version: number;
  versions: Version[];
  related_articles: string[];
  breadcrumb: Breadcrumb[];
  toc: TOCItem[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    setTimeout(() => {
      setArticle(mockArticlesData[id] || null);
      setLoading(false);
    }, 500);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[var(--bg-obsidian)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[var(--accent-ember)] animate-spin" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex h-screen bg-[var(--bg-obsidian)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <FadeIn>
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Article Not Found</h1>
                <p className="text-[var(--text-secondary)] mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
                <a href="/diq/content" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-ember)] text-white rounded-lg">
                  <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
                </a>
              </div>
            </FadeIn>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              {/* Breadcrumb */}
              <FadeIn>
                <nav className="flex items-center gap-2 text-sm mb-6">
                  {article.breadcrumb.map((crumb, index) => (
                    <span key={crumb.id} className="flex items-center gap-2">
                      {index > 0 && <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
                      <a href={crumb.href} className="text-[var(--text-secondary)] hover:text-[var(--accent-ember)]">
                        {crumb.name}
                      </a>
                    </span>
                  ))}
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)]">{article.title}</span>
                </nav>
              </FadeIn>

              {/* Header */}
              <FadeIn delay={0.1}>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
                    >
                      {article.category.name}
                    </span>
                    <span className="text-[var(--text-muted)] text-sm">v{article.version}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">{article.title}</h1>
                  <p className="text-[var(--text-secondary)] mb-4">{article.summary}</p>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-[var(--accent-ember)] text-xs">
                        {article.author.avatar}
                      </div>
                      {article.author.name}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Updated {formatDate(article.updated_at)}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.view_count.toLocaleString()} views
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Actions */}
              <FadeIn delay={0.15}>
                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-[var(--border-subtle)]">
                  <button
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      bookmarked ? "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]" : "bg-[var(--bg-charcoal)] text-[var(--text-secondary)] hover:bg-[var(--bg-slate)]"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                    {bookmarked ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-charcoal)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-slate)]"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-charcoal)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-slate)]">
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-charcoal)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-slate)]"
                  >
                    <History className="w-4 h-4" />
                    History
                  </button>
                </div>
              </FadeIn>

              {/* Version History Modal */}
              {showVersionHistory && (
                <FadeIn>
                  <div className="mb-6 p-4 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Version History</h3>
                    <div className="space-y-3">
                      {article.versions.map((v) => (
                        <div key={v.version} className="flex items-center gap-4 p-3 bg-[var(--bg-slate)] rounded-lg">
                          <span className="text-[var(--accent-ember)] font-mono">v{v.version}</span>
                          <span className="text-[var(--text-muted)]">{v.date}</span>
                          <span className="text-[var(--text-primary)]">{v.summary}</span>
                          <span className="text-[var(--text-muted)] ml-auto">by {v.author}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Content */}
              <FadeIn delay={0.2}>
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-8 mb-6">
                  <div
                    className="prose prose-invert max-w-none prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)] prose-a:text-[var(--accent-ember)] prose-code:text-[var(--accent-gold)] prose-code:bg-[var(--bg-slate)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[var(--bg-slate)] prose-li:text-[var(--text-secondary)]"
                    dangerouslySetInnerHTML={{
                      __html: article.content
                        .replace(/^# /gm, '<h1 class="text-2xl font-bold mb-4 mt-8 first:mt-0">')
                        .replace(/^## /gm, '<h2 class="text-xl font-semibold mb-3 mt-6">')
                        .replace(/^### /gm, '<h3 class="text-lg font-medium mb-2 mt-4">')
                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                        .replace(/`([^`]+)`/g, '<code>$1</code>')
                        .replace(/\n\n/g, '</p><p class="mb-4">')
                        .replace(/\n- /g, '</p><li class="ml-4 mb-1">• ')
                        .replace(/\n\d\. /g, '</p><li class="ml-4 mb-1">')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'),
                    }}
                  />
                </div>
              </FadeIn>

              {/* Tags */}
              <FadeIn delay={0.25}>
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/diq/content?tag=${encodeURIComponent(tag)}`}
                      className="flex items-center gap-1 px-3 py-1 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-secondary)] hover:border-[var(--accent-ember)]/50"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </a>
                  ))}
                </div>
              </FadeIn>

              {/* Helpful Section */}
              <FadeIn delay={0.3}>
                <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Was this article helpful?</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setHelpful(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        helpful === true
                          ? "bg-green-500/20 text-green-400 border border-green-500/50"
                          : "bg-[var(--bg-slate)] text-[var(--text-secondary)] hover:bg-[var(--bg-obsidian)]"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Yes ({article.helpful_count + (helpful === true ? 1 : 0)})
                    </button>
                    <button
                      onClick={() => setHelpful(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        helpful === false
                          ? "bg-red-500/20 text-red-400 border border-red-500/50"
                          : "bg-[var(--bg-slate)] text-[var(--text-secondary)] hover:bg-[var(--bg-obsidian)]"
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      No ({article.not_helpful_count + (helpful === false ? 1 : 0)})
                    </button>
                  </div>
                  {helpful !== null && (
                    <p className="mt-4 text-[var(--text-muted)]">
                      {helpful ? "Thanks for your feedback!" : "We'll work to improve this article."}
                    </p>
                  )}
                </div>
              </FadeIn>

              {/* Related Articles */}
              {article.related_articles.length > 0 && (
                <FadeIn delay={0.35}>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Related Articles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {article.related_articles.map((relatedId) => {
                        const related = mockArticlesData[relatedId];
                        if (!related) return null;
                        return (
                          <a
                            key={relatedId}
                            href={`/diq/content/${relatedId}`}
                            className="block p-4 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--accent-ember)]/50 transition-colors"
                          >
                            <div
                              className="text-xs font-medium mb-2"
                              style={{ color: related.category.color }}
                            >
                              {related.category.name}
                            </div>
                            <h4 className="text-[var(--text-primary)] font-medium line-clamp-2">{related.title}</h4>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>

            {/* Sidebar - Table of Contents */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FadeIn delay={0.2}>
                <div className="sticky top-8">
                  <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">On this page</h4>
                    <nav className="space-y-2">
                      {article.toc.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className="block text-sm text-[var(--text-secondary)] hover:text-[var(--accent-ember)] transition-colors"
                          style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                        >
                          {item.title}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
