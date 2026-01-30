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
  summary: string;
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
    summary: "Complete guide to getting started with Digital Workplace AI platform. Covers the Quick Start Checklist, Platform Overview of all four products, and how to get help.",
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
    summary: "Comprehensive security guidelines covering passwords, 2FA, and incident reporting. Includes password requirements, authentication methods, and incident response procedures.",
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
    summary: "Complete guide to employee benefits including health insurance options (PPO and HSA plans), 401k with 6% company match, PTO policies based on tenure, and parental leave.",
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
    summary: "Learn how to effectively use the AI Assistant powered by Claude 3.5 for productivity. Covers access methods, use cases for information retrieval, document assistance, and task automation.",
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
    summary: "Best practices for remote work success including home office setup, communication guidelines for core hours and async work, and productivity tips for maintaining work-life balance.",
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
// KNOWLEDGE BASE CATEGORIES
// =============================================================================

export interface MockKBCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  article_count: number;
  parent_id: string | null;
  department_id: string | null;
  order: number;
}

export const mockKBCategories: MockKBCategory[] = [
  { id: "cat-001", name: "Getting Started", slug: "getting-started", description: "New employee onboarding and basics", icon: "rocket", article_count: 15, parent_id: null, department_id: "dept-hr", order: 1 },
  { id: "cat-002", name: "Company Policies", slug: "company-policies", description: "HR policies, guidelines, and procedures", icon: "shield", article_count: 24, parent_id: null, department_id: "dept-hr", order: 2 },
  { id: "cat-003", name: "Benefits & Compensation", slug: "benefits-compensation", description: "Health, 401k, stock options, and perks", icon: "gift", article_count: 18, parent_id: null, department_id: "dept-hr", order: 3 },
  { id: "cat-004", name: "AI & Tools", slug: "ai-tools", description: "AI Assistant, productivity tools, and integrations", icon: "cpu", article_count: 12, parent_id: null, department_id: "dept-product", order: 4 },
  { id: "cat-005", name: "Work Policies", slug: "work-policies", description: "Remote work, PTO, and workplace guidelines", icon: "briefcase", article_count: 9, parent_id: null, department_id: "dept-hr", order: 5 },
  { id: "cat-006", name: "Engineering", slug: "engineering", description: "Technical docs, architecture, and best practices", icon: "code", article_count: 42, parent_id: null, department_id: "dept-eng", order: 6 },
  { id: "cat-007", name: "Product", slug: "product", description: "Roadmaps, specs, and product updates", icon: "package", article_count: 28, parent_id: null, department_id: "dept-product", order: 7 },
  { id: "cat-008", name: "Sales & Marketing", slug: "sales-marketing", description: "Sales playbooks, marketing materials", icon: "trending-up", article_count: 35, parent_id: null, department_id: "dept-sales", order: 8 },
];

// =============================================================================
// DEPARTMENTS
// =============================================================================

export interface MockDepartment {
  id: string;
  name: string;
  description: string;
  head_id: string;
  head_name: string;
  employee_count: number;
  color: string;
}

export const mockDepartments: MockDepartment[] = [
  { id: "dept-exec", name: "Executive Team", description: "Company leadership and strategic direction", head_id: "1", head_name: "Sarah Chen", employee_count: 4, color: "#10b981" },
  { id: "dept-eng", name: "Engineering", description: "Product development and technical infrastructure", head_id: "2", head_name: "Mike Johnson", employee_count: 45, color: "#3b82f6" },
  { id: "dept-hr", name: "Human Resources", description: "People operations, recruiting, and culture", head_id: "3", head_name: "Lisa Park", employee_count: 12, color: "#8b5cf6" },
  { id: "dept-product", name: "Product", description: "Product management and design", head_id: "4", head_name: "James Wilson", employee_count: 18, color: "#f59e0b" },
  { id: "dept-finance", name: "Finance", description: "Financial planning, accounting, and operations", head_id: "5", head_name: "Tom Chen", employee_count: 8, color: "#ef4444" },
  { id: "dept-cs", name: "Customer Success", description: "Customer support and success management", head_id: "7", head_name: "Emily Rodriguez", employee_count: 22, color: "#06b6d4" },
  { id: "dept-sales", name: "Sales", description: "Revenue generation and business development", head_id: "9", head_name: "David Kim", employee_count: 28, color: "#ec4899" },
  { id: "dept-marketing", name: "Marketing", description: "Brand, content, and demand generation", head_id: "10", head_name: "Rachel Martinez", employee_count: 15, color: "#84cc16" },
];

// =============================================================================
// CHAT THREADS & MESSAGES
// =============================================================================

export interface MockChatThread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  preview: string;
}

export interface MockChatMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const mockChatThreads: MockChatThread[] = [
  { id: "thread-1", title: "Q4 Budget Questions", created_at: "2026-01-28T10:00:00Z", updated_at: "2026-01-28T10:15:00Z", message_count: 4, preview: "Can you help me understand the Q4 budget allocation..." },
  { id: "thread-2", title: "Remote Work Policy", created_at: "2026-01-27T14:00:00Z", updated_at: "2026-01-27T14:30:00Z", message_count: 6, preview: "What are the guidelines for remote work?" },
  { id: "thread-3", title: "Engineering Roadmap", created_at: "2026-01-26T09:00:00Z", updated_at: "2026-01-26T09:45:00Z", message_count: 8, preview: "Summarize the Q1 engineering priorities..." },
  { id: "thread-4", title: "Benefits Enrollment", created_at: "2026-01-25T11:00:00Z", updated_at: "2026-01-25T11:20:00Z", message_count: 3, preview: "When is the deadline for benefits enrollment?" },
  { id: "thread-5", title: "Meeting Notes Summary", created_at: "2026-01-24T16:00:00Z", updated_at: "2026-01-24T16:10:00Z", message_count: 2, preview: "Can you summarize the key points from today's all-hands?" },
];

export const mockChatMessages: MockChatMessage[] = [
  { id: "msg-1", thread_id: "thread-1", role: "user", content: "Can you help me understand the Q4 budget allocation for the engineering team?", created_at: "2026-01-28T10:00:00Z" },
  { id: "msg-2", thread_id: "thread-1", role: "assistant", content: "Based on the Q4 financial reports, the Engineering department received $8.2M in budget allocation, representing 35% of total company spending. Key areas include:\n\n• Infrastructure: $3.1M (cloud, tooling)\n• Headcount: $4.2M (new hires, salaries)\n• R&D: $900K (AI initiatives)", created_at: "2026-01-28T10:01:00Z" },
  { id: "msg-3", thread_id: "thread-1", role: "user", content: "How does that compare to Q3?", created_at: "2026-01-28T10:10:00Z" },
  { id: "msg-4", thread_id: "thread-1", role: "assistant", content: "Q4 engineering budget increased 18% compared to Q3 ($6.9M). The main increases were:\n\n• Headcount +25% (17 new engineers hired)\n• R&D +40% (expanded AI team)\n• Infrastructure +12% (scaling for growth)", created_at: "2026-01-28T10:11:00Z" },
];

// =============================================================================
// RECENT ACTIVITY
// =============================================================================

export interface MockActivity {
  id: string;
  type: "news" | "event" | "article" | "channel" | "recognition" | "announcement";
  title: string;
  description: string;
  actor_name: string;
  actor_avatar: string;
  target_id: string;
  target_type: string;
  created_at: string;
}

export const mockRecentActivity: MockActivity[] = [
  { id: "act-1", type: "news", title: "Q4 2025 Company Results Published", description: "Sarah Chen posted a company announcement", actor_name: "Sarah Chen", actor_avatar: "SC", target_id: "1", target_type: "news", created_at: "2026-01-28T09:00:00Z" },
  { id: "act-2", type: "event", title: "Q1 All-Hands Meeting Scheduled", description: "New event added for February 3rd", actor_name: "Sarah Chen", actor_avatar: "SC", target_id: "1", target_type: "event", created_at: "2026-01-27T15:00:00Z" },
  { id: "act-3", type: "recognition", title: "Kudos to Engineering Team", description: "Emily Rodriguez recognized the team for Q4 launch", actor_name: "Emily Rodriguez", actor_avatar: "ER", target_id: "", target_type: "recognition", created_at: "2026-01-27T14:00:00Z" },
  { id: "act-4", type: "article", title: "AI Assistant Guide Updated", description: "James Wilson updated the knowledge base", actor_name: "James Wilson", actor_avatar: "JW", target_id: "4", target_type: "article", created_at: "2026-01-26T11:00:00Z" },
  { id: "act-5", type: "channel", title: "New #ai-projects Channel", description: "Alex Kim created a new channel", actor_name: "Alex Kim", actor_avatar: "AK", target_id: "5", target_type: "channel", created_at: "2026-01-25T10:00:00Z" },
  { id: "act-6", type: "news", title: "Remote Work Policy Updated", description: "Lisa Park announced policy changes", actor_name: "Lisa Park", actor_avatar: "LP", target_id: "3", target_type: "news", created_at: "2026-01-25T09:00:00Z" },
  { id: "act-7", type: "announcement", title: "Benefits Enrollment Open", description: "Amanda Foster reminded about enrollment deadline", actor_name: "Amanda Foster", actor_avatar: "AF", target_id: "6", target_type: "news", created_at: "2026-01-24T08:00:00Z" },
  { id: "act-8", type: "event", title: "Engineering Offsite Confirmed", description: "Mike Johnson finalized the offsite details", actor_name: "Mike Johnson", actor_avatar: "MJ", target_id: "2", target_type: "event", created_at: "2026-01-23T16:00:00Z" },
];

// =============================================================================
// USER SETTINGS
// =============================================================================

export interface MockUserSettings {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_slack: boolean;
  digest_frequency: "daily" | "weekly" | "never";
  timezone: string;
  language: string;
  compact_mode: boolean;
  appearance: {
    theme: string;
    language: string;
    timezone: string;
    sidebar_collapsed: boolean;
    density: string;
  };
  notification_prefs: Record<string, { email: boolean; push: boolean; inApp: boolean }>;
}

export const mockUserSettings: MockUserSettings = {
  id: "settings-1",
  user_id: "current-user",
  theme: "dark",
  notifications_email: true,
  notifications_push: true,
  notifications_slack: true,
  digest_frequency: "daily",
  timezone: "America/Los_Angeles",
  language: "en-US",
  compact_mode: false,
  appearance: {
    theme: "dark",
    language: "en-US",
    timezone: "America/Los_Angeles",
    sidebar_collapsed: false,
    density: "comfortable",
  },
  notification_prefs: {
    mentions: { email: true, push: true, inApp: true },
    channels: { email: false, push: true, inApp: true },
    documents: { email: true, push: false, inApp: true },
    calendar: { email: true, push: true, inApp: true },
    workflows: { email: false, push: true, inApp: true },
  },
};

export interface MockCurrentUser {
  id: string;
  email: string;
  full_name: string;
  avatar: string;
  job_title: string;
  department: string;
  department_id: string;
  role: "admin" | "editor" | "viewer";
  joined_at: string;
}

export const mockCurrentUser: MockCurrentUser = {
  id: "current-user",
  email: "you@digitalworkplace.ai",
  full_name: "Current User",
  avatar: "CU",
  job_title: "Product Manager",
  department: "Product",
  department_id: "dept-product",
  role: "admin",
  joined_at: "2024-06-15T00:00:00Z",
};

// =============================================================================
// SEARCH RESULTS
// =============================================================================

export interface MockSearchResult {
  id: string;
  type: "article" | "news" | "event" | "person" | "channel";
  title: string;
  description: string;
  url: string;
  relevance_score: number;
  highlights: string[];
  created_at: string;
  author?: string;
}

export const mockSearchResults: MockSearchResult[] = [
  { id: "sr-1", type: "article", title: "Getting Started with Digital Workplace AI", description: "Comprehensive guide for new employees", url: "/content/1", relevance_score: 0.95, highlights: ["Digital Workplace AI", "getting started", "onboarding"], created_at: "2026-01-15T00:00:00Z", author: "James Wilson" },
  { id: "sr-2", type: "news", title: "Q4 2025 Company Results", description: "Record-breaking performance announced", url: "/news/1", relevance_score: 0.92, highlights: ["Q4 results", "revenue growth", "company"], created_at: "2026-01-28T09:00:00Z", author: "Sarah Chen" },
  { id: "sr-3", type: "person", title: "Sarah Chen", description: "CEO - Executive Team", url: "/people/1", relevance_score: 0.88, highlights: ["CEO", "leadership", "founder"], created_at: "2019-03-15T00:00:00Z" },
  { id: "sr-4", type: "event", title: "Q1 All-Hands Meeting", description: "Quarterly company meeting", url: "/events/1", relevance_score: 0.85, highlights: ["all-hands", "Q1", "company meeting"], created_at: "2026-02-03T10:00:00Z" },
  { id: "sr-5", type: "article", title: "Remote Work Best Practices", description: "Guidelines for remote work success", url: "/content/5", relevance_score: 0.82, highlights: ["remote work", "work from home", "productivity"], created_at: "2026-01-18T00:00:00Z", author: "Lisa Park" },
  { id: "sr-6", type: "channel", title: "#engineering", description: "Engineering team discussions", url: "/channels/2", relevance_score: 0.78, highlights: ["engineering", "technical", "development"], created_at: "2020-01-10T00:00:00Z" },
  { id: "sr-7", type: "article", title: "Benefits & Compensation Guide", description: "Complete guide to employee benefits", url: "/content/3", relevance_score: 0.75, highlights: ["benefits", "health insurance", "401k"], created_at: "2026-01-01T00:00:00Z", author: "Amanda Foster" },
  { id: "sr-8", type: "news", title: "Welcome New Engineering Team", description: "17 new engineers join the team", url: "/news/2", relevance_score: 0.72, highlights: ["new hires", "engineering", "team growth"], created_at: "2026-01-27T14:00:00Z", author: "Mike Johnson" },
];

// =============================================================================
// WORKFLOWS
// =============================================================================

export interface MockWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'error' | 'archived';
  category: string;
  trigger_type: string;
  created_at: string;
  updated_at: string;
  last_run_at: string | null;
  total_runs: number;
  success_rate: number;
  created_by_id: string;
  created_by_name: string;
  steps: { id: string; type: string; name: string; config: Record<string, unknown> }[];
  definition: Record<string, unknown>;
}

export const mockWorkflows: MockWorkflow[] = [
  {
    id: "wf-1",
    name: "Employee Onboarding Automation",
    description: "Automates the employee onboarding process including account creation, equipment requests, and training assignments",
    status: "active",
    category: "HR",
    trigger_type: "webhook",
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-28T14:00:00Z",
    last_run_at: "2026-01-29T09:30:00Z",
    total_runs: 156,
    success_rate: 98.7,
    created_by_id: "3",
    created_by_name: "Lisa Park",
    steps: [
      { id: "s1", type: "trigger", name: "New Hire Webhook", config: { endpoint: "/api/onboard" } },
      { id: "s2", type: "action", name: "Create Accounts", config: { systems: ["email", "slack", "jira"] } },
      { id: "s3", type: "action", name: "Request Equipment", config: { items: ["laptop", "monitor", "headset"] } },
      { id: "s4", type: "notification", name: "Welcome Email", config: { template: "new-hire-welcome" } },
    ],
    definition: {},
  },
  {
    id: "wf-2",
    name: "Document Approval Workflow",
    description: "Routes documents through approval chains based on type and value",
    status: "active",
    category: "Operations",
    trigger_type: "manual",
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-01-25T16:00:00Z",
    last_run_at: "2026-01-30T11:15:00Z",
    total_runs: 312,
    success_rate: 99.4,
    created_by_id: "5",
    created_by_name: "Tom Chen",
    steps: [
      { id: "s1", type: "trigger", name: "Document Submitted", config: { types: ["contract", "invoice", "proposal"] } },
      { id: "s2", type: "condition", name: "Check Value", config: { threshold: 10000 } },
      { id: "s3", type: "action", name: "Route to Manager", config: { notify: true } },
      { id: "s4", type: "notification", name: "Approval Notification", config: { channels: ["email", "slack"] } },
    ],
    definition: {},
  },
  {
    id: "wf-3",
    name: "Daily Report Generator",
    description: "Generates and distributes daily performance reports to stakeholders",
    status: "active",
    category: "Analytics",
    trigger_type: "schedule",
    created_at: "2025-12-15T10:00:00Z",
    updated_at: "2026-01-20T08:00:00Z",
    last_run_at: "2026-01-30T06:00:00Z",
    total_runs: 45,
    success_rate: 100,
    created_by_id: "4",
    created_by_name: "James Wilson",
    steps: [
      { id: "s1", type: "trigger", name: "Daily Schedule", config: { cron: "0 6 * * *" } },
      { id: "s2", type: "action", name: "Fetch Metrics", config: { sources: ["analytics", "sales", "support"] } },
      { id: "s3", type: "llm_call", name: "Generate Summary", config: { model: "claude-3" } },
      { id: "s4", type: "notification", name: "Send Report", config: { recipients: ["leadership-team"] } },
    ],
    definition: {},
  },
  {
    id: "wf-4",
    name: "Ticket Auto-Router",
    description: "Automatically routes support tickets to the appropriate team based on content analysis",
    status: "active",
    category: "Support",
    trigger_type: "webhook",
    created_at: "2026-01-08T11:00:00Z",
    updated_at: "2026-01-27T10:00:00Z",
    last_run_at: "2026-01-30T10:45:00Z",
    total_runs: 1247,
    success_rate: 96.8,
    created_by_id: "7",
    created_by_name: "Emily Rodriguez",
    steps: [
      { id: "s1", type: "trigger", name: "New Ticket", config: { source: "zendesk" } },
      { id: "s2", type: "llm_call", name: "Analyze Content", config: { model: "claude-3", task: "classify" } },
      { id: "s3", type: "condition", name: "Priority Check", config: { levels: ["high", "medium", "low"] } },
      { id: "s4", type: "action", name: "Assign to Team", config: { teams: ["billing", "technical", "sales"] } },
    ],
    definition: {},
  },
  {
    id: "wf-5",
    name: "Data Sync Pipeline",
    description: "Synchronizes data between CRM, ERP, and data warehouse systems",
    status: "paused",
    category: "IT",
    trigger_type: "schedule",
    created_at: "2025-11-20T14:00:00Z",
    updated_at: "2026-01-15T09:00:00Z",
    last_run_at: "2026-01-15T03:00:00Z",
    total_runs: 89,
    success_rate: 94.4,
    created_by_id: "10",
    created_by_name: "Marcus Johnson",
    steps: [
      { id: "s1", type: "trigger", name: "Scheduled Sync", config: { cron: "0 3 * * *" } },
      { id: "s2", type: "action", name: "Extract from CRM", config: { system: "salesforce" } },
      { id: "s3", type: "action", name: "Transform Data", config: { mapping: "standard-v2" } },
      { id: "s4", type: "action", name: "Load to Warehouse", config: { target: "snowflake" } },
    ],
    definition: {},
  },
  {
    id: "wf-6",
    name: "Marketing Email Campaign",
    description: "Automated email drip campaigns for marketing nurture sequences",
    status: "draft",
    category: "Marketing",
    trigger_type: "manual",
    created_at: "2026-01-25T15:00:00Z",
    updated_at: "2026-01-29T11:00:00Z",
    last_run_at: null,
    total_runs: 0,
    success_rate: 0,
    created_by_id: "9",
    created_by_name: "Tom Martinez",
    steps: [
      { id: "s1", type: "trigger", name: "Campaign Start", config: {} },
      { id: "s2", type: "action", name: "Segment Audience", config: { criteria: ["engagement", "industry"] } },
      { id: "s3", type: "action", name: "Send Email", config: { template: "nurture-v1" } },
      { id: "s4", type: "condition", name: "Wait for Response", config: { days: 3 } },
    ],
    definition: {},
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
