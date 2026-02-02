/**
 * Comprehensive Mock Data for dIQ Intranet
 *
 * This file contains all mock data used throughout the app.
 * Both listing pages and detail pages use this shared data source.
 */

// =============================================================================
// NEWS POSTS
// =============================================================================

export interface MockNewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  department_id: string;
  department_name: string;
  type: 'post' | 'announcement' | 'event' | 'poll';
  visibility: 'all' | 'department' | 'private';
  pinned: boolean;
  likes_count: number;
  comments_count: number;
  views_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  attachments: { id: string; type: string; name: string; url: string; size?: number }[];
}

export const mockNewsPosts: MockNewsPost[] = [
  {
    id: "1",
    title: "Q4 2025 Company Results: Record-Breaking Performance",
    content: `We are thrilled to announce that Digital Workplace AI has achieved record-breaking results in Q4 2025, exceeding all expectations and setting new benchmarks for our industry.

## Key Metrics

### Revenue Growth
- **Total Revenue**: $42.5M (+35% YoY)
- **Recurring Revenue**: $38.2M (+42% YoY)
- **Net Revenue Retention**: 127%

### Customer Success
- **New Enterprise Clients**: 47 (+58% vs Q3)
- **Customer Satisfaction Score**: 4.8/5.0
- **Support Response Time**: <2 hours average

### Product Milestones
- Launched AI Assistant 3.0 with advanced reasoning
- Deployed 500+ custom workflows for enterprise clients
- Achieved SOC 2 Type II certification
- Released native mobile apps for iOS and Android

## Team Growth

We've expanded our team significantly this quarter, adding 38 new team members across Engineering, Sales, Customer Success, and Product.

## Looking Ahead to 2026

Our roadmap for 2026 includes exciting developments:
1. **Enterprise AI Platform**: Enhanced LLM capabilities with custom model training
2. **Global Expansion**: New offices in London, Singapore, and Sydney
3. **Partner Ecosystem**: Launch of certified partner program
4. **Advanced Analytics**: Real-time insights and predictive analytics

Thank you all for your incredible work. Let's continue this momentum into 2026!`,
    excerpt: "Record-breaking Q4 results with $42.5M revenue (+35% YoY), 47 new enterprise clients, and major product milestones including AI Assistant 3.0 launch.",
    author_id: "1",
    author_name: "Sarah Chen",
    author_role: "CEO",
    author_avatar: "SC",
    department_id: "dept-exec",
    department_name: "Executive Team",
    type: "announcement",
    visibility: "all",
    pinned: true,
    likes_count: 234,
    comments_count: 47,
    views_count: 1892,
    published_at: "2026-01-28T09:00:00Z",
    created_at: "2026-01-28T08:30:00Z",
    updated_at: "2026-01-28T09:00:00Z",
    tags: ["Q4 Results", "Company News", "Financials", "Growth"],
    attachments: [
      { id: "att-001", type: "file", name: "Q4-2025-Financial-Summary.pdf", url: "#", size: 2400000 },
      { id: "att-002", type: "file", name: "2026-Strategic-Roadmap.pdf", url: "#", size: 1800000 },
    ],
  },
  {
    id: "2",
    title: "Welcome Our New Engineering Team Members!",
    content: `We're excited to welcome 17 new team members to our Engineering department this month! Each brings unique expertise and passion that will help us continue building amazing products.

## New Team Members

### Backend Engineering
- **Dr. Alex Kim** - Senior Staff Engineer (ex-Google, PhD in Distributed Systems)
- **Maria Santos** - Senior Backend Engineer (ex-Stripe)
- **David Chen** - Backend Engineer (UC Berkeley grad)
- **Priya Sharma** - Backend Engineer (IIT Delhi)

### Frontend Engineering
- **Jordan Williams** - Senior Frontend Engineer (ex-Airbnb)
- **Sophie Anderson** - Frontend Engineer (React specialist)
- **Tom Martinez** - Frontend Engineer (Vue.js expert)

### Platform Engineering
- **Dr. Nina Patel** - Principal Platform Engineer (ex-AWS)
- **Marcus Johnson** - DevOps Engineer (Kubernetes certified)
- **Ava Thompson** - SRE (ex-Netflix)

### AI/ML Team
- **Dr. Robert Zhang** - Staff ML Engineer (Stanford AI Lab)
- **Jennifer Lee** - ML Engineer (NLP specialist)
- **Chris O'Brien** - ML Engineer (Computer Vision)

### Mobile Engineering
- **Kenji Tanaka** - iOS Lead (ex-Apple)
- **Rachel Green** - Android Engineer (ex-Samsung)
- **Omar Hassan** - Mobile Engineer (Flutter expert)

### QA Engineering
- **Linda Wu** - QA Lead (10+ years experience)

## Welcome Events

Please join us in welcoming our new colleagues:
- **Monday**: Team lunch at Bella Italia (12:30 PM)
- **Wednesday**: Engineering All-Hands (3:00 PM, Room 4A)
- **Friday**: Happy Hour (5:00 PM, Rooftop Lounge)`,
    excerpt: "17 new team members joining Engineering including senior hires from Google, Stripe, AWS, Apple, and Netflix.",
    author_id: "2",
    author_name: "Mike Johnson",
    author_role: "VP Engineering",
    author_avatar: "MJ",
    department_id: "dept-eng",
    department_name: "Engineering",
    type: "announcement",
    visibility: "all",
    pinned: false,
    likes_count: 156,
    comments_count: 34,
    views_count: 1245,
    published_at: "2026-01-27T14:00:00Z",
    created_at: "2026-01-27T13:30:00Z",
    updated_at: "2026-01-27T14:00:00Z",
    tags: ["New Hires", "Engineering", "Team", "Welcome"],
    attachments: [],
  },
  {
    id: "3",
    title: "Updated Remote Work Policy - Effective February 1st",
    content: `After extensive feedback from our team and careful analysis of productivity data, we're excited to announce our updated remote work policy, effective February 1st, 2026.

## Work Arrangement Options

### 1. Fully Remote (Available to all roles)
- Work from anywhere in approved time zones (UTC-8 to UTC+2)
- Quarterly in-person team gatherings (travel expenses covered)
- $2,000 annual home office stipend

### 2. Hybrid (3 days remote, 2 days office)
- Choose your in-office days each week
- Reserved desk in your preferred office location
- Full access to office amenities

### 3. Office-First (4-5 days in office)
- Dedicated desk assignment
- Additional office perks (parking, gym access)
- Leadership track priority for certain roles

## Core Hours

Regardless of arrangement, all team members should be available during core hours:
- **Americas**: 10 AM - 2 PM PT
- **EMEA**: 2 PM - 6 PM GMT
- **APAC**: 10 AM - 2 PM SGT

## Equipment Provided

All employees receive:
- MacBook Pro (M3 Max) or equivalent
- 27" 4K monitor
- Ergonomic keyboard and mouse
- Noise-canceling headphones
- Standing desk (for office-first)

Questions? Reach out to your HR Business Partner or post in #remote-work Slack channel.`,
    excerpt: "New flexible work guidelines with three arrangement options: Fully Remote, Hybrid, and Office-First. Includes $2,000 home office stipend.",
    author_id: "3",
    author_name: "Lisa Park",
    author_role: "HR Director",
    author_avatar: "LP",
    department_id: "dept-hr",
    department_name: "Human Resources",
    type: "announcement",
    visibility: "all",
    pinned: true,
    likes_count: 312,
    comments_count: 89,
    views_count: 2456,
    published_at: "2026-01-25T11:00:00Z",
    created_at: "2026-01-25T10:00:00Z",
    updated_at: "2026-01-25T11:00:00Z",
    tags: ["Policy", "Remote Work", "HR", "Benefits"],
    attachments: [
      { id: "att-003", type: "file", name: "Remote-Work-Policy-2026.pdf", url: "#", size: 890000 },
    ],
  },
  {
    id: "4",
    title: "Product Launch: AI Assistant 3.0 Now Available",
    content: `After months of development and beta testing with 50+ enterprise customers, we're proud to announce the general availability of AI Assistant 3.0!

## What's New

### Advanced Reasoning Engine
Our new reasoning engine can:
- Break down complex problems into logical steps
- Show its thinking process for transparency
- Self-correct when it detects errors
- Handle multi-step workflows autonomously

### Enhanced Knowledge Integration
- **Real-time data access**: Connect to live databases and APIs
- **Document understanding**: Process PDFs, spreadsheets, images
- **Contextual memory**: Remember conversation history across sessions
- **Source citations**: Every answer includes verifiable sources

### Enterprise Security
- SOC 2 Type II certified
- End-to-end encryption
- Role-based access control
- Audit logging for compliance

## Performance Benchmarks

| Metric | v2.5 | v3.0 | Improvement |
|--------|------|------|-------------|
| Response accuracy | 87% | 96% | +10% |
| Query processing time | 2.3s | 0.8s | -65% |
| Context window | 8K tokens | 128K tokens | 16x |
| Concurrent users | 1,000 | 10,000 | 10x |

## Migration Guide

Existing v2.5 users will be automatically upgraded over the next 2 weeks. No action required.

We want to hear from you! Share your experience:
- Slack: #ai-assistant-feedback
- Email: product@digitalworkplace.ai`,
    excerpt: "AI Assistant 3.0 launches with advanced reasoning, 128K context window, 10x concurrent users, and 96% response accuracy.",
    author_id: "4",
    author_name: "James Wilson",
    author_role: "Product Lead",
    author_avatar: "JW",
    department_id: "dept-product",
    department_name: "Product",
    type: "announcement",
    visibility: "all",
    pinned: true,
    likes_count: 445,
    comments_count: 112,
    views_count: 3567,
    published_at: "2026-01-24T08:00:00Z",
    created_at: "2026-01-24T07:00:00Z",
    updated_at: "2026-01-24T08:00:00Z",
    tags: ["Product", "AI", "Launch", "Features"],
    attachments: [
      { id: "att-004", type: "file", name: "AI-Assistant-3.0-Release-Notes.pdf", url: "#", size: 1500000 },
    ],
  },
  {
    id: "5",
    title: "Office Renovation Complete - New Spaces Now Open!",
    content: `After 3 months of renovation, our headquarters is now complete with exciting new spaces designed for collaboration, focus, and wellness.

## New Spaces

### The Innovation Hub (Floor 3)
- 4 soundproof brainstorming pods
- Interactive whiteboard walls
- VR/AR demo area
- Prototype workshop with 3D printers

### The Library (Floor 2)
- 20 individual focus pods
- Whisper-quiet environment
- Natural lighting with plants
- Book collection (500+ titles)

### The Rooftop Terrace
- Outdoor meeting spaces
- BBQ and entertainment area
- Garden with fresh herbs
- City skyline views

### Wellness Center (Floor 1)
- Meditation room
- Yoga studio
- Shower facilities
- Nap pods

## Grand Opening Celebration

**Date**: Friday, January 31st
**Time**: 3:00 PM - 7:00 PM
**Activities**:
- Guided tours every 30 minutes
- Food trucks in the parking lot
- Live music by "The Debuggers" (our employee band!)
- Prize drawings for office supplies

## Sustainability Features

Our renovation prioritized sustainability:
- 100% LED lighting (energy savings: 40%)
- Recycled materials in 60% of furniture
- Smart HVAC system
- EV charging stations (8 new spots)
- Solar panels on rooftop`,
    excerpt: "New Innovation Hub, Library, Rooftop Terrace, and Wellness Center now open. Grand opening celebration Friday at 3 PM.",
    author_id: "5",
    author_name: "Tom Chen",
    author_role: "Facilities Manager",
    author_avatar: "TC",
    department_id: "dept-ops",
    department_name: "Operations",
    type: "announcement",
    visibility: "all",
    pinned: false,
    likes_count: 287,
    comments_count: 65,
    views_count: 1890,
    published_at: "2026-01-23T10:00:00Z",
    created_at: "2026-01-23T09:00:00Z",
    updated_at: "2026-01-23T10:00:00Z",
    tags: ["Office", "Facilities", "Renovation", "Wellness"],
    attachments: [],
  },
  {
    id: "6",
    title: "Annual Benefits Enrollment Open - Action Required by Feb 15",
    content: `It's that time of year! Annual benefits enrollment is now open and will close on **February 15th, 2026**.

## What's New for 2026

### Healthcare
- **New PPO Option**: Lower premiums, wider network
- **Mental Health Coverage**: Unlimited therapy sessions covered at 100%
- **Fertility Benefits**: Up to $25,000 lifetime coverage
- **Telehealth**: $0 copay for virtual visits

### Wellness Programs
- **Gym Reimbursement**: Increased to $150/month (was $100)
- **Wellness Stipend**: $1,000 annual for health-related purchases
- **Health Coaching**: Free 1:1 sessions with certified coaches

### Financial Benefits
- **401(k) Match**: Increased to 6% (was 4%)
- **Stock Options**: Refresher grants for employees >2 years
- **Student Loan Assistance**: $200/month contribution (new!)
- **Pet Insurance**: Discounted group rates (new!)

## Action Required

1. **Review current elections** in Benefits Portal
2. **Update dependents** if family situation changed
3. **Select 2026 plans** by February 15th
4. **Submit FSA/HSA elections** if applicable

## Important Dates

| Date | Event |
|------|-------|
| Jan 20 | Enrollment opens |
| Jan 25 | Benefits Fair (virtual) |
| Feb 1 | Deadline for benefit questions |
| Feb 15 | **Enrollment closes (5 PM PT)** |
| Mar 1 | New benefits effective |

Don't miss the deadline!`,
    excerpt: "2026 benefits enrollment open with new mental health coverage, 6% 401k match, and student loan assistance. Deadline Feb 15.",
    author_id: "6",
    author_name: "Amanda Foster",
    author_role: "Benefits Manager",
    author_avatar: "AF",
    department_id: "dept-hr",
    department_name: "Human Resources",
    type: "announcement",
    visibility: "all",
    pinned: true,
    likes_count: 198,
    comments_count: 56,
    views_count: 2134,
    published_at: "2026-01-20T09:00:00Z",
    created_at: "2026-01-20T08:00:00Z",
    updated_at: "2026-01-20T09:00:00Z",
    tags: ["Benefits", "HR", "Enrollment", "Healthcare"],
    attachments: [
      { id: "att-005", type: "file", name: "2026-Benefits-Guide.pdf", url: "#", size: 3200000 },
    ],
  },
  {
    id: "7",
    title: "Customer Success Team Achieves 127% Net Revenue Retention",
    content: `I'm incredibly proud to share that our Customer Success team has achieved a 127% Net Revenue Retention rate for 2025 - setting a new company record!

## What This Means

Net Revenue Retention (NRR) measures how much revenue we retain and grow from existing customers. A rate above 100% means we're growing revenue from our customer base even faster than any churn.

### Key Achievements

- **0 Enterprise Churns** in Q4 2025
- **47 Expansion Deals** closed
- **89% of Customers** upgraded plans
- **4.8/5.0** Customer Satisfaction Score

## Team Recognition

Special shoutouts to:
- **Chris O'Brien** - Closed our largest expansion deal ($2.4M)
- **Priya Sharma** - Highest CSAT scores (4.95/5.0)
- **Marcus Lee** - Most successful onboardings (23 in Q4)
- **Jennifer Kim** - Created the new QBR framework

## What's Next

For 2026, we're aiming for:
- 135% NRR target
- Launch Customer Advisory Board
- Expand to 24/7 support coverage
- New proactive health score system

Thank you to every team member who made this possible!`,
    excerpt: "Customer Success achieves record 127% NRR with zero enterprise churns and 47 expansion deals in 2025.",
    author_id: "7",
    author_name: "Emily Rodriguez",
    author_role: "VP Customer Success",
    author_avatar: "ER",
    department_id: "dept-cs",
    department_name: "Customer Success",
    type: "announcement",
    visibility: "all",
    pinned: false,
    likes_count: 178,
    comments_count: 42,
    views_count: 1456,
    published_at: "2026-01-22T15:00:00Z",
    created_at: "2026-01-22T14:00:00Z",
    updated_at: "2026-01-22T15:00:00Z",
    tags: ["Customer Success", "NRR", "Achievement", "Team"],
    attachments: [],
  },
  {
    id: "8",
    title: "Engineering Blog: How We Scaled to 10,000 Concurrent Users",
    content: `Our engineering team recently completed a major infrastructure upgrade that allows AI Assistant to handle 10,000 concurrent users - up from 1,000. Here's how we did it.

## The Challenge

Our original architecture used a single-region deployment with synchronous processing. As we grew, we hit bottlenecks:
- 95th percentile latency exceeded 5 seconds
- Database connections maxed out at peak
- Memory pressure during large document processing

## The Solution

### 1. Multi-Region Deployment
We deployed to 3 AWS regions (us-west-2, eu-west-1, ap-southeast-1) with global load balancing.

### 2. Async Processing Pipeline
Moved to an event-driven architecture using:
- Kafka for message streaming
- Redis for caching and rate limiting
- Background workers for heavy computation

### 3. Database Optimization
- Read replicas in each region
- Query optimization (40% faster)
- Connection pooling with PgBouncer

### 4. AI Inference at Scale
- Model sharding across GPU clusters
- Batched inference for efficiency
- Smart routing based on query complexity

## Results

| Metric | Before | After |
|--------|--------|-------|
| Concurrent Users | 1,000 | 10,000 |
| P95 Latency | 5.2s | 0.8s |
| Availability | 99.5% | 99.99% |
| Cost per Query | $0.12 | $0.04 |

Full technical deep-dive on our engineering blog: engineering.digitalworkplace.ai`,
    excerpt: "Technical deep-dive on scaling AI Assistant from 1,000 to 10,000 concurrent users with 85% latency reduction.",
    author_id: "8",
    author_name: "Alex Kim",
    author_role: "Staff Engineer",
    author_avatar: "AK",
    department_id: "dept-eng",
    department_name: "Engineering",
    type: "post",
    visibility: "all",
    pinned: false,
    likes_count: 234,
    comments_count: 67,
    views_count: 1823,
    published_at: "2026-01-21T10:00:00Z",
    created_at: "2026-01-21T09:00:00Z",
    updated_at: "2026-01-21T10:00:00Z",
    tags: ["Engineering", "Architecture", "Scaling", "Technical"],
    attachments: [],
  },
  {
    id: "9",
    title: "Friday Trivia Night is Back! 90s Movies Theme",
    content: `📽️ Get ready for our monthly Trivia Night!

## Details

**Theme**: 90s Movies 🎬
**When**: Friday, January 31st, 5:30 PM PT
**Where**: Rooftop Terrace (or join via Zoom)
**Teams**: 4-6 people per team

## Categories

1. Blockbusters (Titanic, Jurassic Park, etc.)
2. Comedies (Clueless, Dumb and Dumber, etc.)
3. Soundtracks (Name that tune!)
4. Quotes (Who said it?)
5. Behind the Scenes

## Prizes

🥇 **1st Place**: $100 Amazon gift card per team member
🥈 **2nd Place**: $50 gift card per team member
🥉 **3rd Place**: Bragging rights

## How to Join

1. Form a team or sign up as a free agent
2. RSVP in #social-events Slack channel
3. Show up ready to have fun!

Food and drinks provided. Non-alcoholic options available.

See you there! 🍿`,
    excerpt: "Monthly trivia night returns with 90s Movies theme. Friday 5:30 PM on the Rooftop Terrace with prizes!",
    author_id: "9",
    author_name: "Tom Martinez",
    author_role: "Recruiter",
    author_avatar: "TM",
    department_id: "dept-hr",
    department_name: "Human Resources",
    type: "event",
    visibility: "all",
    pinned: false,
    likes_count: 89,
    comments_count: 34,
    views_count: 567,
    published_at: "2026-01-29T16:30:00Z",
    created_at: "2026-01-29T16:00:00Z",
    updated_at: "2026-01-29T16:30:00Z",
    tags: ["Social", "Trivia", "Team Building", "Fun"],
    attachments: [],
  },
  {
    id: "10",
    title: "Security Alert: Phishing Attempt Detected",
    content: `⚠️ **Important Security Notice**

Our security team has detected a phishing campaign targeting Digital Workplace AI employees. Here's what you need to know.

## What Happened

Several employees received emails appearing to be from "IT Support" asking them to verify their credentials on a fake login page.

## How to Identify the Phishing Email

- **Sender**: support@digitalworkplace-ai.com (note the hyphen - our real domain has no hyphen)
- **Subject**: "Urgent: Password Expiration Notice"
- **Request**: Asks you to click a link and enter your password

## What to Do

### If You Received the Email
1. **DO NOT** click any links
2. **DO NOT** enter any credentials
3. Forward the email to security@digitalworkplace.ai
4. Delete the email

### If You Clicked the Link
1. **Immediately** change your password
2. Contact IT Security at security@digitalworkplace.ai
3. Enable 2FA if not already active
4. Monitor your accounts for suspicious activity

## Prevention Tips

- Always verify sender email addresses
- Never enter credentials from an email link
- When in doubt, navigate directly to the site
- Report suspicious emails immediately

Our IT Security team is actively blocking these attempts. Thank you for staying vigilant!`,
    excerpt: "Phishing campaign detected targeting employees. Do not click links from support@digitalworkplace-ai.com (fake domain).",
    author_id: "10",
    author_name: "Marcus Johnson",
    author_role: "Security Engineer",
    author_avatar: "MJ2",
    department_id: "dept-it",
    department_name: "IT Security",
    type: "announcement",
    visibility: "all",
    pinned: true,
    likes_count: 156,
    comments_count: 23,
    views_count: 2345,
    published_at: "2026-01-30T08:00:00Z",
    created_at: "2026-01-30T07:30:00Z",
    updated_at: "2026-01-30T08:00:00Z",
    tags: ["Security", "Alert", "Phishing", "Important"],
    attachments: [],
  },
];

// =============================================================================
// EVENTS
// =============================================================================

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  organizer_name: string;
  organizer_role: string;
  organizer_avatar: string;
  department_id: string;
  department_name: string;
  location: string;
  location_type: 'in_person' | 'virtual' | 'hybrid';
  meeting_url: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  visibility: string;
  max_attendees: number | null;
  current_attendees: number;
  tags: string[];
}

export const mockEvents: MockEvent[] = [
  {
    id: "1",
    title: "Q1 2026 All-Hands Meeting",
    description: "Join us for our quarterly all-hands meeting where leadership will share company updates, celebrate wins, and outline our vision for Q1 2026.",
    organizer_id: "1",
    organizer_name: "Sarah Chen",
    organizer_role: "CEO",
    organizer_avatar: "SC",
    department_id: "dept-exec",
    department_name: "Executive Team",
    location: "Main Auditorium (Floor 1) + Virtual",
    location_type: "hybrid",
    meeting_url: "https://zoom.us/j/123456789",
    start_time: "2026-02-03T10:00:00-08:00",
    end_time: "2026-02-03T12:00:00-08:00",
    all_day: false,
    visibility: "all",
    max_attendees: 500,
    current_attendees: 342,
    tags: ["All-Hands", "Company", "Quarterly"],
  },
  {
    id: "2",
    title: "Engineering Team Offsite 2026",
    description: "Our annual 2-day engineering team offsite focused on team building, technical deep dives, and strategic planning for the year ahead.",
    organizer_id: "2",
    organizer_name: "Mike Johnson",
    organizer_role: "VP Engineering",
    organizer_avatar: "MJ",
    department_id: "dept-eng",
    department_name: "Engineering",
    location: "Bay View Conference Center, San Francisco",
    location_type: "in_person",
    meeting_url: null,
    start_time: "2026-02-10T09:00:00-08:00",
    end_time: "2026-02-11T14:00:00-08:00",
    all_day: false,
    visibility: "department",
    max_attendees: 80,
    current_attendees: 62,
    tags: ["Engineering", "Offsite", "Team Building"],
  },
  {
    id: "3",
    title: "New Employee Orientation - February Cohort",
    description: "Comprehensive 4-hour session covering company overview, tools & systems, culture & expectations, and buddy introductions.",
    organizer_id: "3",
    organizer_name: "Lisa Park",
    organizer_role: "HR Director",
    organizer_avatar: "LP",
    department_id: "dept-hr",
    department_name: "Human Resources",
    location: "Training Room 2A + Zoom",
    location_type: "hybrid",
    meeting_url: "https://zoom.us/j/987654321",
    start_time: "2026-02-05T09:00:00-08:00",
    end_time: "2026-02-05T13:00:00-08:00",
    all_day: false,
    visibility: "private",
    max_attendees: 20,
    current_attendees: 8,
    tags: ["Onboarding", "New Hire", "Training"],
  },
  {
    id: "4",
    title: "Product Demo Day - AI Features Showcase",
    description: "Demo day showcasing the latest AI-powered features including Document Processing, Advanced Search 2.0, Workflow Automation, and Conversational Analytics.",
    organizer_id: "4",
    organizer_name: "James Wilson",
    organizer_role: "Product Lead",
    organizer_avatar: "JW",
    department_id: "dept-product",
    department_name: "Product",
    location: "Demo Theater (Floor 2)",
    location_type: "hybrid",
    meeting_url: "https://zoom.us/j/456789123",
    start_time: "2026-02-07T14:00:00-08:00",
    end_time: "2026-02-07T16:00:00-08:00",
    all_day: false,
    visibility: "all",
    max_attendees: 100,
    current_attendees: 78,
    tags: ["Product", "AI", "Demo", "Innovation"],
  },
  {
    id: "5",
    title: "Wellness Wednesday: Meditation & Mindfulness",
    description: "Weekly 30-minute guided meditation session. This week's theme: Managing Work Stress.",
    organizer_id: "6",
    organizer_name: "Amanda Foster",
    organizer_role: "Benefits Manager",
    organizer_avatar: "AF",
    department_id: "dept-hr",
    department_name: "Human Resources",
    location: "Virtual Only",
    location_type: "virtual",
    meeting_url: "https://zoom.us/j/wellness2026",
    start_time: "2026-02-05T12:00:00-08:00",
    end_time: "2026-02-05T12:30:00-08:00",
    all_day: false,
    visibility: "all",
    max_attendees: null,
    current_attendees: 45,
    tags: ["Wellness", "Meditation", "Self-Care"],
  },
  {
    id: "6",
    title: "Customer Advisory Board Meeting",
    description: "Q1 Customer Advisory Board meeting with top enterprise customers for product roadmap feedback and feature prioritization.",
    organizer_id: "7",
    organizer_name: "Emily Rodriguez",
    organizer_role: "VP Customer Success",
    organizer_avatar: "ER",
    department_id: "dept-cs",
    department_name: "Customer Success",
    location: "Executive Boardroom",
    location_type: "in_person",
    meeting_url: null,
    start_time: "2026-02-14T09:00:00-08:00",
    end_time: "2026-02-14T12:30:00-08:00",
    all_day: false,
    visibility: "private",
    max_attendees: 15,
    current_attendees: 12,
    tags: ["Customer", "Advisory", "Enterprise"],
  },
  {
    id: "7",
    title: "Tech Talk: Introduction to RAG Systems",
    description: "Learn how Retrieval-Augmented Generation (RAG) powers our AI Assistant with accurate, up-to-date responses.",
    organizer_id: "8",
    organizer_name: "Alex Kim",
    organizer_role: "Staff Engineer",
    organizer_avatar: "AK",
    department_id: "dept-eng",
    department_name: "Engineering",
    location: "Conference Room 3A + Virtual",
    location_type: "hybrid",
    meeting_url: "https://zoom.us/j/techtalk001",
    start_time: "2026-02-06T15:00:00-08:00",
    end_time: "2026-02-06T16:30:00-08:00",
    all_day: false,
    visibility: "all",
    max_attendees: 50,
    current_attendees: 38,
    tags: ["Tech Talk", "AI", "Engineering", "Learning"],
  },
  {
    id: "8",
    title: "Sales Kickoff 2026",
    description: "Annual sales kickoff with 2026 targets, new product training, and success stories from top performers.",
    organizer_id: "user-011",
    organizer_name: "David Martinez",
    organizer_role: "VP Sales",
    organizer_avatar: "DM",
    department_id: "dept-sales",
    department_name: "Sales",
    location: "Grand Ballroom, Marriott Downtown",
    location_type: "in_person",
    meeting_url: null,
    start_time: "2026-02-12T08:00:00-08:00",
    end_time: "2026-02-12T17:00:00-08:00",
    all_day: true,
    visibility: "department",
    max_attendees: 60,
    current_attendees: 54,
    tags: ["Sales", "Kickoff", "Training"],
  },
];

// =============================================================================
// EMPLOYEES
// =============================================================================

export interface MockEmployee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar: string;
  job_title: string;
  department_id: string;
  department_name: string;
  location: string;
  timezone: string;
  hire_date: string;
  bio: string;
  skills: string[];
  manager_id: string | null;
  manager_name: string | null;
  status: 'online' | 'away' | 'busy' | 'offline';
}

export const mockEmployees: MockEmployee[] = [
  {
    id: "1",
    user_id: "user-001",
    full_name: "Sarah Chen",
    email: "sarah.chen@digitalworkplace.ai",
    phone: "+1 (415) 555-0101",
    avatar: "SC",
    job_title: "Chief Executive Officer",
    department_id: "dept-exec",
    department_name: "Executive Team",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2019-03-15",
    bio: "Sarah is the founder and CEO of Digital Workplace AI. With over 15 years of experience in enterprise software, she leads our mission to transform how companies work through AI-powered tools. Before founding Digital Workplace AI, Sarah was VP of Product at Salesforce.",
    skills: ["Leadership", "Product Strategy", "Enterprise Sales", "AI/ML", "Public Speaking"],
    manager_id: null,
    manager_name: null,
    status: "online",
  },
  {
    id: "2",
    user_id: "user-002",
    full_name: "Mike Johnson",
    email: "mike.johnson@digitalworkplace.ai",
    phone: "+1 (415) 555-0102",
    avatar: "MJ",
    job_title: "VP of Engineering",
    department_id: "dept-eng",
    department_name: "Engineering",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2020-06-01",
    bio: "Mike leads our engineering team of 60+ engineers. He's passionate about building scalable systems and fostering a culture of engineering excellence. Previously, Mike was a Principal Engineer at Google.",
    skills: ["System Architecture", "Distributed Systems", "Team Leadership", "Python", "Go", "Kubernetes"],
    manager_id: "1",
    manager_name: "Sarah Chen",
    status: "online",
  },
  {
    id: "3",
    user_id: "user-003",
    full_name: "Lisa Park",
    email: "lisa.park@digitalworkplace.ai",
    phone: "+1 (415) 555-0103",
    avatar: "LP",
    job_title: "HR Director",
    department_id: "dept-hr",
    department_name: "Human Resources",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2020-09-15",
    bio: "Lisa oversees all people operations at Digital Workplace AI, including talent acquisition, employee experience, and organizational development. She's built our culture from the ground up.",
    skills: ["People Operations", "Talent Acquisition", "Employee Experience", "DEI", "Compensation"],
    manager_id: "1",
    manager_name: "Sarah Chen",
    status: "away",
  },
  {
    id: "4",
    user_id: "user-004",
    full_name: "James Wilson",
    email: "james.wilson@digitalworkplace.ai",
    phone: "+1 (212) 555-0104",
    avatar: "JW",
    job_title: "Product Lead",
    department_id: "dept-product",
    department_name: "Product",
    location: "New York, NY",
    timezone: "America/New_York",
    hire_date: "2021-01-10",
    bio: "James leads product strategy and roadmap for Digital Workplace AI. He's shipped products used by millions of users and is obsessed with creating delightful user experiences.",
    skills: ["Product Management", "User Research", "Data Analysis", "Agile", "Roadmapping"],
    manager_id: "1",
    manager_name: "Sarah Chen",
    status: "busy",
  },
  {
    id: "5",
    user_id: "user-005",
    full_name: "Tom Chen",
    email: "tom.chen@digitalworkplace.ai",
    phone: "+1 (415) 555-0105",
    avatar: "TC",
    job_title: "Facilities Manager",
    department_id: "dept-ops",
    department_name: "Operations",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2021-03-01",
    bio: "Tom manages our office facilities and workplace experience. He recently led our major office renovation project.",
    skills: ["Facilities Management", "Project Management", "Vendor Relations", "Sustainability"],
    manager_id: "1",
    manager_name: "Sarah Chen",
    status: "online",
  },
  {
    id: "6",
    user_id: "user-006",
    full_name: "Amanda Foster",
    email: "amanda.foster@digitalworkplace.ai",
    phone: "+1 (415) 555-0106",
    avatar: "AF",
    job_title: "Benefits Manager",
    department_id: "dept-hr",
    department_name: "Human Resources",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2021-06-15",
    bio: "Amanda manages our comprehensive benefits program, from healthcare to 401k to wellness initiatives. She's passionate about employee wellbeing.",
    skills: ["Benefits Administration", "Healthcare Plans", "Wellness Programs", "Compliance"],
    manager_id: "3",
    manager_name: "Lisa Park",
    status: "online",
  },
  {
    id: "7",
    user_id: "user-007",
    full_name: "Emily Rodriguez",
    email: "emily.rodriguez@digitalworkplace.ai",
    phone: "+1 (512) 555-0107",
    avatar: "ER",
    job_title: "VP of Customer Success",
    department_id: "dept-cs",
    department_name: "Customer Success",
    location: "Austin, TX",
    timezone: "America/Chicago",
    hire_date: "2021-04-01",
    bio: "Emily leads our customer success organization, ensuring our enterprise customers achieve their goals with Digital Workplace AI. She's built CSM teams at multiple SaaS companies.",
    skills: ["Customer Success", "Account Management", "SaaS Metrics", "Executive Relationships"],
    manager_id: "1",
    manager_name: "Sarah Chen",
    status: "online",
  },
  {
    id: "8",
    user_id: "user-008",
    full_name: "Alex Kim",
    email: "alex.kim@digitalworkplace.ai",
    phone: "+1 (415) 555-0108",
    avatar: "AK",
    job_title: "Staff Engineer",
    department_id: "dept-eng",
    department_name: "Engineering",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2022-01-15",
    bio: "Alex is a Staff Engineer focused on our core platform infrastructure. He recently led the project to scale our AI Assistant to 10,000 concurrent users.",
    skills: ["Distributed Systems", "Kubernetes", "Python", "Go", "System Design", "AI Infrastructure"],
    manager_id: "2",
    manager_name: "Mike Johnson",
    status: "online",
  },
  {
    id: "9",
    user_id: "user-009",
    full_name: "Tom Martinez",
    email: "tom.martinez@digitalworkplace.ai",
    phone: "+1 (415) 555-0109",
    avatar: "TM",
    job_title: "Technical Recruiter",
    department_id: "dept-hr",
    department_name: "Human Resources",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2022-03-01",
    bio: "Tom leads technical recruiting at Digital Workplace AI. He's helped us grow the engineering team from 20 to 60+ engineers.",
    skills: ["Technical Recruiting", "Sourcing", "Interview Design", "Employer Branding"],
    manager_id: "3",
    manager_name: "Lisa Park",
    status: "offline",
  },
  {
    id: "10",
    user_id: "user-010",
    full_name: "Marcus Johnson",
    email: "marcus.johnson@digitalworkplace.ai",
    phone: "+1 (415) 555-0110",
    avatar: "MJ2",
    job_title: "Security Engineer",
    department_id: "dept-it",
    department_name: "IT Security",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    hire_date: "2022-05-01",
    bio: "Marcus leads our security engineering efforts, from SOC 2 compliance to threat detection. He previously worked at AWS on security infrastructure.",
    skills: ["Security Engineering", "SOC 2", "Penetration Testing", "AWS Security", "Compliance"],
    manager_id: "2",
    manager_name: "Mike Johnson",
    status: "online",
  },
];

// =============================================================================
// ARTICLES (Knowledge Base)
// =============================================================================

export interface MockArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  summary?: string;
  category_id: string;
  category_name: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  status: 'published' | 'draft' | 'archived' | 'pending_review';
  published_at: string;
  updated_at: string;
  tags: string[];
  view_count: number;
  helpful_count: number;
}

export const mockArticles: MockArticle[] = [
  {
    id: "1",
    title: "Getting Started with Digital Workplace AI",
    slug: "getting-started",
    content: `Welcome to Digital Workplace AI! This comprehensive guide will help you get started with our AI-powered workplace platform.

## Quick Start Checklist

Before diving in, ensure you have:
- Completed your employee profile
- Set up two-factor authentication
- Joined your team's Slack channels
- Bookmarked this knowledge base

## Platform Overview

Digital Workplace AI consists of four integrated products:

### 1. Intranet IQ (dIQ)
Your central hub for company information, news, and collaboration.

### 2. Support IQ (dSQ)
AI-enhanced customer support platform.

### 3. Chat Core IQ (dCQ)
Intelligent chatbot platform for customer engagement.

### 4. Test Pilot IQ (dTQ)
Quality assurance and testing automation.

## Getting Help

If you need assistance:
1. **AI Assistant**: Click the chat icon or press Cmd/Ctrl + /
2. **Knowledge Base**: Search for articles on any topic
3. **IT Support**: Submit a ticket via the help desk`,
    excerpt: "Complete guide to getting started with Digital Workplace AI platform.",
    category_id: "cat-001",
    category_name: "Getting Started",
    author_id: "1",
    author_name: "Sarah Chen",
    author_avatar: "SC",
    status: "published",
    published_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-28T14:30:00Z",
    tags: ["Getting Started", "Onboarding", "Guide"],
    view_count: 4523,
    helpful_count: 892,
  },
  {
    id: "2",
    title: "IT Security Guidelines and Best Practices",
    slug: "security-guidelines",
    content: `Protecting company data is everyone's responsibility. This guide outlines our security policies and best practices.

## Password Requirements

- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and special characters
- Change every 90 days
- Never reuse passwords

## Two-Factor Authentication (2FA)

2FA is required for all employees. We support:
- Authenticator Apps (recommended)
- Hardware Keys (YubiKey)
- SMS (last resort)

## Reporting Security Incidents

If you suspect a security incident:
1. Don't panic - but act quickly
2. Report to security@digitalworkplace.ai
3. Preserve evidence
4. Document what you observed`,
    excerpt: "Comprehensive security guidelines covering passwords, 2FA, and incident reporting.",
    category_id: "cat-002",
    category_name: "IT & Security",
    author_id: "10",
    author_name: "Marcus Johnson",
    author_avatar: "MJ2",
    status: "published",
    published_at: "2025-11-15T09:00:00Z",
    updated_at: "2026-01-25T11:00:00Z",
    tags: ["Security", "IT", "Compliance", "Best Practices"],
    view_count: 3891,
    helpful_count: 756,
  },
  {
    id: "3",
    title: "Employee Benefits Guide 2026",
    slug: "benefits-guide-2026",
    content: `Welcome to your comprehensive guide to Digital Workplace AI's employee benefits.

## Health Insurance

We offer three medical plan options:
- PPO Select: $150/month, $500 deductible
- PPO Premium: $250/month, $250 deductible
- HSA-Compatible: $100/month, $1,500 deductible

## 401(k) Retirement Plan

- Company match: 6% of salary
- Immediate vesting
- 30+ investment options

## Time Off

| Tenure | Annual PTO |
|--------|------------|
| 0-2 years | 20 days |
| 2-5 years | 25 days |
| 5+ years | 30 days |

## Parental Leave

- Birth parent: 16 weeks paid
- Non-birth parent: 8 weeks paid
- Adoption: 12 weeks paid`,
    excerpt: "Complete guide to employee benefits including health insurance, 401k, and PTO.",
    category_id: "cat-003",
    category_name: "HR & Benefits",
    author_id: "6",
    author_name: "Amanda Foster",
    author_avatar: "AF",
    status: "published",
    published_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
    tags: ["Benefits", "HR", "Health Insurance", "401k"],
    view_count: 5672,
    helpful_count: 1234,
  },
  {
    id: "4",
    title: "Using the AI Assistant Effectively",
    slug: "ai-assistant-guide",
    content: `Our AI Assistant is powered by Claude 3.5 and designed to help you work smarter.

## Quick Start

Access the AI Assistant in three ways:
1. Click the chat icon in the sidebar
2. Press Cmd/Ctrl + /
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

## Tips for Better Results

- Be specific with your questions
- Provide context when needed
- Iterate and refine your requests`,
    excerpt: "Learn how to effectively use the AI Assistant for productivity.",
    category_id: "cat-004",
    category_name: "AI & Tools",
    author_id: "4",
    author_name: "James Wilson",
    author_avatar: "JW",
    status: "published",
    published_at: "2026-01-24T12:00:00Z",
    updated_at: "2026-01-29T09:00:00Z",
    tags: ["AI", "Assistant", "Guide", "Productivity"],
    view_count: 2891,
    helpful_count: 567,
  },
  {
    id: "5",
    title: "Remote Work Best Practices",
    slug: "remote-work-best-practices",
    content: `Our flexible work policy supports remote, hybrid, and office-first arrangements. Here are best practices for success.

## Setting Up Your Home Office

- Dedicated workspace with proper lighting
- Ergonomic chair and desk setup
- Reliable internet (50+ Mbps recommended)
- Good quality webcam and headset

## Communication Guidelines

- Be responsive during core hours
- Use async communication when possible
- Turn on video for important meetings
- Update your status in Slack

## Productivity Tips

- Block focus time on your calendar
- Use the Pomodoro technique
- Take regular breaks
- Maintain work-life boundaries`,
    excerpt: "Best practices for remote work productivity and communication.",
    category_id: "cat-005",
    category_name: "Work Policies",
    author_id: "3",
    author_name: "Lisa Park",
    author_avatar: "LP",
    status: "published",
    published_at: "2026-01-18T10:00:00Z",
    updated_at: "2026-01-26T15:00:00Z",
    tags: ["Remote Work", "Productivity", "Work From Home"],
    view_count: 3456,
    helpful_count: 678,
  },
];

// =============================================================================
// CHANNELS
// =============================================================================

export interface MockChannel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  category: string;
  member_count: number;
  created_at: string;
  created_by_name: string;
  is_starred: boolean;
  is_muted: boolean;
}

export const mockChannels: MockChannel[] = [
  {
    id: "1",
    name: "general",
    description: "Company-wide announcements and updates. All employees are members.",
    type: "public",
    category: "Company",
    member_count: 156,
    created_at: "2019-03-15T10:00:00Z",
    created_by_name: "Sarah Chen",
    is_starred: true,
    is_muted: false,
  },
  {
    id: "2",
    name: "engineering",
    description: "Engineering team discussions, technical updates, and code reviews.",
    type: "public",
    category: "Engineering",
    member_count: 68,
    created_at: "2019-04-01T10:00:00Z",
    created_by_name: "Mike Johnson",
    is_starred: true,
    is_muted: false,
  },
  {
    id: "3",
    name: "product",
    description: "Product discussions, roadmap updates, and feature planning.",
    type: "public",
    category: "Product",
    member_count: 42,
    created_at: "2019-04-15T10:00:00Z",
    created_by_name: "James Wilson",
    is_starred: false,
    is_muted: false,
  },
  {
    id: "4",
    name: "leadership-sync",
    description: "Private channel for leadership team discussions.",
    type: "private",
    category: "Executive",
    member_count: 8,
    created_at: "2019-03-20T10:00:00Z",
    created_by_name: "Sarah Chen",
    is_starred: true,
    is_muted: false,
  },
  {
    id: "5",
    name: "random",
    description: "Non-work banter and water cooler chat. Have fun!",
    type: "public",
    category: "Social",
    member_count: 134,
    created_at: "2019-03-15T12:00:00Z",
    created_by_name: "Sarah Chen",
    is_starred: false,
    is_muted: true,
  },
  {
    id: "6",
    name: "customer-success",
    description: "CS team updates, customer feedback, and best practices.",
    type: "public",
    category: "Customer Success",
    member_count: 28,
    created_at: "2021-04-15T10:00:00Z",
    created_by_name: "Emily Rodriguez",
    is_starred: false,
    is_muted: false,
  },
  {
    id: "7",
    name: "hr-announcements",
    description: "HR updates, policy changes, and company events.",
    type: "public",
    category: "HR",
    member_count: 156,
    created_at: "2020-09-20T10:00:00Z",
    created_by_name: "Lisa Park",
    is_starred: false,
    is_muted: false,
  },
  {
    id: "8",
    name: "security-alerts",
    description: "Security notifications and incident updates.",
    type: "public",
    category: "IT",
    member_count: 156,
    created_at: "2022-05-15T10:00:00Z",
    created_by_name: "Marcus Johnson",
    is_starred: true,
    is_muted: false,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getNewsPostById(id: string): MockNewsPost | undefined {
  return mockNewsPosts.find(post => post.id === id);
}

export function getEventById(id: string): MockEvent | undefined {
  return mockEvents.find(event => event.id === id);
}

export function getEmployeeById(id: string): MockEmployee | undefined {
  return mockEmployees.find(emp => emp.id === id);
}

export function getArticleById(id: string): MockArticle | undefined {
  return mockArticles.find(article => article.id === id);
}

export function getChannelById(id: string): MockChannel | undefined {
  return mockChannels.find(channel => channel.id === id);
}

// =============================================================================
// KB CATEGORIES
// =============================================================================

export interface MockKBCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  department_id?: string | null;
  article_count: number;
  icon?: string;
}

export const mockKBCategories: MockKBCategory[] = [
  { id: "cat-001", name: "Getting Started", slug: "getting-started", description: "Onboarding and basics", parent_id: null, article_count: 12, icon: "rocket" },
  { id: "cat-002", name: "IT & Security", slug: "it-security", description: "IT policies and security guidelines", parent_id: null, article_count: 18, icon: "shield" },
  { id: "cat-003", name: "HR Policies", slug: "hr-policies", description: "Human resources policies and procedures", parent_id: null, article_count: 24, icon: "users" },
  { id: "cat-004", name: "Engineering", slug: "engineering", description: "Technical documentation and standards", parent_id: null, article_count: 45, icon: "code" },
  { id: "cat-005", name: "Product", slug: "product", description: "Product guides and documentation", parent_id: null, article_count: 32, icon: "box" },
  { id: "cat-006", name: "Sales & Marketing", slug: "sales-marketing", description: "Sales playbooks and marketing resources", parent_id: null, article_count: 28, icon: "trending-up" },
  { id: "cat-007", name: "Finance", slug: "finance", description: "Financial policies and procedures", parent_id: null, article_count: 15, icon: "dollar-sign" },
  { id: "cat-008", name: "Legal", slug: "legal", description: "Legal guidelines and compliance", parent_id: null, article_count: 10, icon: "scale" },
];

export function getKBCategoryById(id: string): MockKBCategory | undefined {
  return mockKBCategories.find(cat => cat.id === id);
}

// =============================================================================
// DEPARTMENTS
// =============================================================================

export interface MockDepartment {
  id: string;
  name: string;
  description: string;
  manager_id: string;
  manager_name: string;
  employee_count: number;
  parent_id: string | null;
}

export const mockDepartments: MockDepartment[] = [
  { id: "dept-exec", name: "Executive Team", description: "Company leadership", manager_id: "1", manager_name: "Sarah Chen", employee_count: 5, parent_id: null },
  { id: "dept-eng", name: "Engineering", description: "Product development and infrastructure", manager_id: "2", manager_name: "Marcus Johnson", employee_count: 38, parent_id: null },
  { id: "dept-product", name: "Product", description: "Product management and design", manager_id: "5", manager_name: "Emily Rodriguez", employee_count: 12, parent_id: null },
  { id: "dept-sales", name: "Sales", description: "Revenue and business development", manager_id: "8", manager_name: "David Kim", employee_count: 22, parent_id: null },
  { id: "dept-marketing", name: "Marketing", description: "Brand and growth", manager_id: "11", manager_name: "Jessica Taylor", employee_count: 15, parent_id: null },
  { id: "dept-hr", name: "Human Resources", description: "People operations", manager_id: "14", manager_name: "Robert Williams", employee_count: 8, parent_id: null },
  { id: "dept-finance", name: "Finance", description: "Financial operations", manager_id: "17", manager_name: "Amanda Chen", employee_count: 10, parent_id: null },
  { id: "dept-legal", name: "Legal", description: "Legal and compliance", manager_id: "20", manager_name: "Michael Brown", employee_count: 6, parent_id: null },
  { id: "dept-it", name: "IT Operations", description: "Infrastructure and support", manager_id: "23", manager_name: "Chris Anderson", employee_count: 12, parent_id: null },
  { id: "dept-cs", name: "Customer Success", description: "Customer support and success", manager_id: "26", manager_name: "Lisa Martinez", employee_count: 18, parent_id: null },
];

export function getDepartmentById(id: string): MockDepartment | undefined {
  return mockDepartments.find(dept => dept.id === id);
}

// =============================================================================
// SEARCH RESULTS
// =============================================================================

export interface MockSearchResult {
  id: string;
  title: string;
  excerpt: string;
  description?: string;
  highlights?: string[];
  type: 'article' | 'news' | 'event' | 'employee' | 'channel';
  source: string;
  url: string;
  relevance: number;
  author?: string;
  date?: string;
  tags?: string[];
}

export const mockSearchResults: MockSearchResult[] = [
  { id: "sr-1", title: "Getting Started with Digital Workplace AI", excerpt: "Complete guide to getting started with the platform...", type: "article", source: "Knowledge Base", url: "/diq/content/1", relevance: 0.95, author: "Sarah Chen", tags: ["onboarding", "guide"] },
  { id: "sr-2", title: "IT Security Guidelines", excerpt: "Security best practices and policies for all employees...", type: "article", source: "Knowledge Base", url: "/diq/content/2", relevance: 0.88, author: "Marcus Johnson", tags: ["security", "IT"] },
  { id: "sr-3", title: "Q4 2025 Results Announcement", excerpt: "Record-breaking quarterly results with 35% YoY growth...", type: "news", source: "News", url: "/diq/news/1", relevance: 0.82, author: "Sarah Chen", date: "2026-01-28" },
  { id: "sr-4", title: "Annual Company Retreat 2026", excerpt: "Join us for the annual company retreat in Lake Tahoe...", type: "event", source: "Events", url: "/diq/events/1", relevance: 0.75, date: "2026-03-15" },
  { id: "sr-5", title: "Marcus Johnson", excerpt: "VP of Engineering, leading the platform development team...", type: "employee", source: "People", url: "/diq/people/2", relevance: 0.70 },
];

// =============================================================================
// CHAT THREADS & MESSAGES
// =============================================================================

export interface MockChatThread {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  model: string;
  parent_thread_id: string | null;
  branch_point_message_id: string | null;
  preview: string;
}

export interface MockChatMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: { id: string; title: string; type: string; url?: string }[];
}

export const mockChatThreads: MockChatThread[] = [
  { id: "thread-1", title: "Help with onboarding process", created_at: "2026-01-30T10:00:00Z", updated_at: "2026-01-30T10:15:00Z", message_count: 4, model: "claude-sonnet-4-20250514", parent_thread_id: null, branch_point_message_id: null, preview: "How do I complete my onboarding checklist?" },
  { id: "thread-2", title: "PTO policy questions", created_at: "2026-01-29T14:30:00Z", updated_at: "2026-01-29T14:45:00Z", message_count: 6, model: "claude-sonnet-4-20250514", parent_thread_id: null, branch_point_message_id: null, preview: "What is our PTO policy?" },
  { id: "thread-3", title: "IT security requirements", created_at: "2026-01-28T09:00:00Z", updated_at: "2026-01-28T09:30:00Z", message_count: 8, model: "claude-sonnet-4-20250514", parent_thread_id: null, branch_point_message_id: null, preview: "What are the security requirements for remote access?" },
];

export const mockChatMessages: MockChatMessage[] = [
  { id: "msg-1", thread_id: "thread-1", role: "user", content: "How do I complete my onboarding checklist?", created_at: "2026-01-30T10:00:00Z" },
  { id: "msg-2", thread_id: "thread-1", role: "assistant", content: "I can help you with that! Your onboarding checklist includes several key steps:\n\n1. **Complete your profile** - Add your photo, bio, and contact information\n2. **Set up 2FA** - Enable two-factor authentication for security\n3. **Join team channels** - Connect with your team on Slack\n4. **Review policies** - Read through the employee handbook\n\nWould you like me to guide you through any of these steps?", created_at: "2026-01-30T10:01:00Z", sources: [{ id: "1", title: "Getting Started Guide", type: "article", url: "/diq/content/1" }] },
  { id: "msg-3", thread_id: "thread-2", role: "user", content: "What is our PTO policy?", created_at: "2026-01-29T14:30:00Z" },
  { id: "msg-4", thread_id: "thread-2", role: "assistant", content: "Our PTO policy provides generous time off benefits:\n\n- **Vacation**: 20 days per year for all full-time employees\n- **Sick Leave**: 10 days per year\n- **Personal Days**: 3 days per year\n- **Holidays**: 12 company-observed holidays\n\nPTO accrues monthly and can be carried over up to 5 days. For detailed information, please refer to the HR Policies section.", created_at: "2026-01-29T14:31:00Z", sources: [{ id: "3", title: "PTO Policy", type: "article", url: "/diq/content/3" }] },
];

export function getChatThreadById(id: string): MockChatThread | undefined {
  return mockChatThreads.find(thread => thread.id === id);
}

export function getMessagesForThread(threadId: string): MockChatMessage[] {
  return mockChatMessages.filter(msg => msg.thread_id === threadId);
}

// =============================================================================
// RECENT ACTIVITY
// =============================================================================

export interface MockRecentActivity {
  id: string;
  type: 'article_published' | 'news_posted' | 'event_created' | 'employee_joined' | 'comment_added';
  title: string;
  description: string;
  user_name: string;
  user_avatar: string;
  timestamp: string;
  url?: string;
}

export const mockRecentActivity: MockRecentActivity[] = [
  { id: "act-1", type: "article_published", title: "New article published", description: "Getting Started with AI Workflows", user_name: "Sarah Chen", user_avatar: "SC", timestamp: "2026-01-30T15:30:00Z", url: "/diq/content/5" },
  { id: "act-2", type: "news_posted", title: "Company announcement", description: "Q4 2025 Results Released", user_name: "Marketing Team", user_avatar: "MT", timestamp: "2026-01-28T09:00:00Z", url: "/diq/news/1" },
  { id: "act-3", type: "event_created", title: "New event scheduled", description: "Team Retrospective - Q1 Planning", user_name: "Emily Rodriguez", user_avatar: "ER", timestamp: "2026-01-27T14:00:00Z", url: "/diq/events/3" },
  { id: "act-4", type: "employee_joined", title: "New team member", description: "Alex Thompson joined Engineering", user_name: "HR Team", user_avatar: "HR", timestamp: "2026-01-26T10:00:00Z", url: "/diq/people/42" },
  { id: "act-5", type: "comment_added", title: "New comment", description: "Discussion on IT Security Guidelines", user_name: "Marcus Johnson", user_avatar: "MJ", timestamp: "2026-01-25T16:45:00Z", url: "/diq/content/2" },
];
