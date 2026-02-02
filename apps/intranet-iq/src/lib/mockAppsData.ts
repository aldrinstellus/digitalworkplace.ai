// =============================================================================
// MOCK APPS DATA - Realistic Enterprise App Integrations
// =============================================================================

// Slack Mock Data
export interface SlackMessage {
  id: string;
  channel: string;
  channelId: string;
  user: {
    name: string;
    avatar: string;
    status: "online" | "away" | "dnd" | "offline";
    title: string;
  };
  content: string;
  timestamp: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
  thread?: { replyCount: number; participants: string[] };
  attachments?: { type: string; name: string; size: string }[];
  isEdited?: boolean;
}

export interface SlackChannel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

export const mockSlackChannels: SlackChannel[] = [
  { id: "ch1", name: "general", description: "Company-wide announcements and updates", memberCount: 247, isPrivate: false, unreadCount: 12, lastMessage: "Welcome to the new quarter everyone!", lastMessageTime: "10:45 AM" },
  { id: "ch2", name: "engineering", description: "Engineering team discussions", memberCount: 63, isPrivate: false, unreadCount: 5, lastMessage: "The deployment to staging is complete", lastMessageTime: "10:32 AM" },
  { id: "ch3", name: "product-launch", description: "Q1 Product Launch coordination", memberCount: 28, isPrivate: true, unreadCount: 3, lastMessage: "Demo scheduled for Thursday at 2pm PST", lastMessageTime: "10:15 AM" },
  { id: "ch4", name: "design", description: "Design team collaboration", memberCount: 18, isPrivate: false, unreadCount: 0, lastMessage: "New mockups uploaded to Figma", lastMessageTime: "9:45 AM" },
  { id: "ch5", name: "sales", description: "Sales team updates and wins", memberCount: 42, isPrivate: false, unreadCount: 8, lastMessage: "🎉 Closed the Acme deal!", lastMessageTime: "9:30 AM" },
  { id: "ch6", name: "random", description: "Non-work banter and fun", memberCount: 189, isPrivate: false, unreadCount: 24, lastMessage: "Anyone up for coffee?", lastMessageTime: "10:50 AM" },
];

export const mockSlackMessages: SlackMessage[] = [
  {
    id: "sm1",
    channel: "engineering",
    channelId: "ch2",
    user: { name: "Sarah Chen", avatar: "SC", status: "online", title: "VP of Engineering" },
    content: "Team, I'm excited to announce that we've successfully completed the migration to our new microservices architecture! 🎉 This was a massive undertaking and I want to thank everyone who contributed. Special shoutout to @mike.johnson and @alex.kim for leading the infrastructure work.",
    timestamp: "10:32 AM",
    reactions: [
      { emoji: "🎉", count: 24, users: ["Mike Johnson", "Alex Kim", "Emily Rodriguez"] },
      { emoji: "💪", count: 18, users: ["James Wilson", "Lisa Park"] },
      { emoji: "🚀", count: 12, users: ["David Brown"] },
    ],
    thread: { replyCount: 15, participants: ["Mike Johnson", "Alex Kim", "Emily Rodriguez", "James Wilson"] },
  },
  {
    id: "sm2",
    channel: "engineering",
    channelId: "ch2",
    user: { name: "Mike Johnson", avatar: "MJ", status: "online", title: "Senior Backend Engineer" },
    content: "Thanks Sarah! Here's the performance comparison before and after:\n\n```\nAPI Response Time (p99):\n  Before: 450ms\n  After: 89ms\n\nDatabase Query Time (avg):\n  Before: 120ms  \n  After: 23ms\n\nMemory Usage:\n  Before: 4.2GB\n  After: 1.8GB\n```\n\nThe new architecture is handling 3x the traffic with half the resources.",
    timestamp: "10:35 AM",
    reactions: [
      { emoji: "🔥", count: 31, users: ["Sarah Chen", "Alex Kim"] },
      { emoji: "👏", count: 22, users: ["Emily Rodriguez"] },
    ],
  },
  {
    id: "sm3",
    channel: "engineering",
    channelId: "ch2",
    user: { name: "Alex Kim", avatar: "AK", status: "dnd", title: "DevOps Lead" },
    content: "Just pushed the updated Kubernetes configs to the repo. All auto-scaling policies are now in place. We can handle up to 10x current load without manual intervention.\n\nMonitoring dashboards: https://grafana.internal/dashboards/prod-overview",
    timestamp: "10:41 AM",
    attachments: [{ type: "link", name: "Grafana Dashboard", size: "" }],
    reactions: [{ emoji: "👀", count: 8, users: ["Sarah Chen"] }],
  },
  {
    id: "sm4",
    channel: "product-launch",
    channelId: "ch3",
    user: { name: "Emily Rodriguez", avatar: "ER", status: "online", title: "Product Manager" },
    content: "📋 **Q1 Launch Checklist Update**\n\n✅ Feature freeze complete\n✅ QA sign-off received\n✅ Marketing materials approved\n✅ Sales enablement training done\n⏳ Final security audit (ETA: Tomorrow 5pm)\n⏳ Customer success briefing (Thursday 9am)\n\nWe're on track for the February 3rd launch! @sarah.chen can we get executive approval by EOD Wednesday?",
    timestamp: "10:15 AM",
    reactions: [{ emoji: "✅", count: 6, users: ["Sarah Chen", "Mike Johnson"] }],
    thread: { replyCount: 8, participants: ["Sarah Chen", "James Wilson", "Lisa Park"] },
  },
  {
    id: "sm5",
    channel: "sales",
    channelId: "ch5",
    user: { name: "David Brown", avatar: "DB", status: "online", title: "Account Executive" },
    content: "🎉🎉🎉 HUGE NEWS! Just closed Acme Corporation - our biggest enterprise deal this quarter!\n\n**Deal Details:**\n- Contract Value: $2.4M ARR\n- Term: 3 years\n- 15,000 seats\n- Full platform deployment\n\nThis puts us at 127% of Q4 quota! Thanks @lisa.park for the amazing demo and @james.wilson for the technical deep-dive. Team effort! 💪",
    timestamp: "9:30 AM",
    reactions: [
      { emoji: "🎉", count: 47, users: ["Sarah Chen", "Emily Rodriguez", "Mike Johnson"] },
      { emoji: "💰", count: 32, users: ["Lisa Park", "James Wilson"] },
      { emoji: "🏆", count: 28, users: ["Alex Kim"] },
    ],
    thread: { replyCount: 23, participants: ["Sarah Chen", "Emily Rodriguez", "Lisa Park", "James Wilson", "Mike Johnson"] },
  },
  {
    id: "sm6",
    channel: "design",
    channelId: "ch4",
    user: { name: "James Wilson", avatar: "JW", status: "away", title: "Senior Product Designer" },
    content: "Just uploaded the final dashboard mockups to Figma. Key changes based on user feedback:\n\n1. Simplified navigation - reduced from 8 to 5 main tabs\n2. New widget system with drag-and-drop customization\n3. Dark mode refinements for better contrast\n4. Accessibility improvements (WCAG 2.1 AA compliant)\n\n🔗 Figma: https://figma.com/file/abc123/Dashboard-v3\n\nPlease review and leave comments by EOD tomorrow.",
    timestamp: "9:45 AM",
    attachments: [{ type: "figma", name: "Dashboard-v3.fig", size: "12.4 MB" }],
    reactions: [{ emoji: "😍", count: 14, users: ["Emily Rodriguez", "Sarah Chen"] }],
  },
  {
    id: "sm7",
    channel: "general",
    channelId: "ch1",
    user: { name: "Amanda Foster", avatar: "AF", status: "online", title: "Chief People Officer" },
    content: "📢 **Important Reminder: Benefits Enrollment Deadline**\n\nHi everyone! Just a friendly reminder that open enrollment for 2026 benefits closes this Friday, January 31st at 11:59 PM PST.\n\n**What's new this year:**\n• Enhanced mental health coverage\n• New fertility benefits\n• Increased 401(k) match (now 6%!)\n• Pet insurance option\n\nIf you haven't made your selections yet, please visit the Benefits Portal: benefits.digitalworkplace.ai\n\nQuestions? Reach out to benefits@company.com or DM me directly!",
    timestamp: "10:45 AM",
    reactions: [
      { emoji: "👍", count: 89, users: ["Sarah Chen", "Mike Johnson", "Emily Rodriguez"] },
      { emoji: "🐕", count: 23, users: ["Alex Kim", "James Wilson"] },
    ],
    thread: { replyCount: 12, participants: ["Emily Rodriguez", "Mike Johnson", "Lisa Park"] },
  },
];

// Jira Mock Data
export interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  description: string;
  type: "bug" | "story" | "task" | "epic" | "subtask";
  status: "todo" | "in-progress" | "in-review" | "done" | "blocked";
  priority: "highest" | "high" | "medium" | "low" | "lowest";
  assignee: { name: string; avatar: string };
  reporter: { name: string; avatar: string };
  project: string;
  sprint: string;
  storyPoints: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  comments: { user: string; content: string; timestamp: string }[];
}

export const mockJiraTickets: JiraTicket[] = [
  {
    id: "jira1",
    key: "DIQ-1234",
    summary: "Implement real-time notification system",
    description: "As a user, I want to receive real-time notifications for important events so that I can stay informed without manually refreshing the page.\n\n**Acceptance Criteria:**\n- WebSocket connection established on login\n- Notifications appear within 500ms of event\n- Notification badge updates in real-time\n- Support for notification preferences\n- Fallback to polling if WebSocket fails",
    type: "story",
    status: "in-progress",
    priority: "high",
    assignee: { name: "Mike Johnson", avatar: "MJ" },
    reporter: { name: "Emily Rodriguez", avatar: "ER" },
    project: "Intranet IQ",
    sprint: "Sprint 14",
    storyPoints: 8,
    labels: ["frontend", "real-time", "notifications"],
    createdAt: "2026-01-20",
    updatedAt: "2026-01-30",
    dueDate: "2026-02-03",
    comments: [
      { user: "Emily Rodriguez", content: "This is a priority for the Q1 launch. Let's sync tomorrow to review the WebSocket implementation approach.", timestamp: "Jan 21, 10:30 AM" },
      { user: "Mike Johnson", content: "Sounds good. I've been researching Socket.io vs native WebSockets. Will prepare a comparison doc.", timestamp: "Jan 21, 2:15 PM" },
      { user: "Alex Kim", content: "From an infra perspective, we have Redis pub/sub ready to support this. Let me know if you need any help with the backend.", timestamp: "Jan 22, 9:00 AM" },
    ],
  },
  {
    id: "jira2",
    key: "DIQ-1235",
    summary: "[BUG] Search results not updating after content deletion",
    description: "**Bug Description:**\nWhen a user deletes content from the knowledge base, the search results still show the deleted item until the page is hard-refreshed.\n\n**Steps to Reproduce:**\n1. Search for an article\n2. Delete the article from the KB\n3. Perform the same search\n4. Deleted article still appears in results\n\n**Expected Behavior:**\nDeleted content should be immediately removed from search results.\n\n**Actual Behavior:**\nDeleted content remains in search until browser cache is cleared.",
    type: "bug",
    status: "in-review",
    priority: "highest",
    assignee: { name: "Alex Kim", avatar: "AK" },
    reporter: { name: "Lisa Park", avatar: "LP" },
    project: "Intranet IQ",
    sprint: "Sprint 14",
    storyPoints: 3,
    labels: ["bug", "search", "cache", "urgent"],
    createdAt: "2026-01-28",
    updatedAt: "2026-01-30",
    comments: [
      { user: "Alex Kim", content: "Found the issue - our Elasticsearch index wasn't being invalidated on delete. PR is up for review: #2847", timestamp: "Jan 29, 4:30 PM" },
      { user: "Sarah Chen", content: "Good catch! This needs to be in the release. @alex.kim can we get this merged today?", timestamp: "Jan 30, 9:15 AM" },
    ],
  },
  {
    id: "jira3",
    key: "DIQ-1236",
    summary: "Design and implement AI-powered search suggestions",
    description: "Enhance the search experience with AI-powered suggestions that appear as users type.\n\n**Features:**\n- Real-time suggestions based on user query\n- Personalized suggestions based on user history\n- Trending searches across organization\n- \"Did you mean\" spell correction\n- Recent searches (per user)",
    type: "epic",
    status: "in-progress",
    priority: "high",
    assignee: { name: "Sarah Chen", avatar: "SC" },
    reporter: { name: "Sarah Chen", avatar: "SC" },
    project: "Intranet IQ",
    sprint: "Sprint 14",
    storyPoints: 21,
    labels: ["epic", "ai", "search", "ux"],
    createdAt: "2026-01-15",
    updatedAt: "2026-01-30",
    dueDate: "2026-02-14",
    comments: [
      { user: "James Wilson", content: "I've completed the UI designs for the suggestions dropdown. Added to Figma.", timestamp: "Jan 18, 11:00 AM" },
      { user: "Mike Johnson", content: "Backend API is ready. Endpoint: GET /api/search/suggestions?q={query}", timestamp: "Jan 25, 3:45 PM" },
    ],
  },
  {
    id: "jira4",
    key: "DIQ-1237",
    summary: "Add keyboard shortcuts for power users",
    description: "Implement keyboard shortcuts to improve productivity for power users.\n\n**Shortcuts to implement:**\n- `Cmd/Ctrl + K`: Open search\n- `Cmd/Ctrl + /`: Open help\n- `Cmd/Ctrl + N`: New document\n- `Cmd/Ctrl + Shift + N`: New channel\n- `Esc`: Close modal/sidebar\n- `?`: Show keyboard shortcuts cheat sheet",
    type: "task",
    status: "todo",
    priority: "medium",
    assignee: { name: "James Wilson", avatar: "JW" },
    reporter: { name: "Emily Rodriguez", avatar: "ER" },
    project: "Intranet IQ",
    sprint: "Sprint 15",
    storyPoints: 5,
    labels: ["ux", "accessibility", "productivity"],
    createdAt: "2026-01-28",
    updatedAt: "2026-01-28",
    comments: [],
  },
  {
    id: "jira5",
    key: "DIQ-1238",
    summary: "Integrate with Microsoft 365 Calendar",
    description: "Enable two-way calendar sync with Microsoft 365 to show meetings in the My Day view.\n\n**Requirements:**\n- OAuth2 authentication with Microsoft\n- Read calendar events\n- Create/update events from dIQ\n- Sync meeting participants\n- Show availability status",
    type: "story",
    status: "blocked",
    priority: "high",
    assignee: { name: "Lisa Park", avatar: "LP" },
    reporter: { name: "Amanda Foster", avatar: "AF" },
    project: "Intranet IQ",
    sprint: "Sprint 14",
    storyPoints: 13,
    labels: ["integration", "microsoft", "calendar"],
    createdAt: "2026-01-10",
    updatedAt: "2026-01-29",
    dueDate: "2026-02-07",
    comments: [
      { user: "Lisa Park", content: "Blocked waiting for IT to approve the Microsoft Graph API permissions. Created ticket IT-456.", timestamp: "Jan 25, 10:00 AM" },
      { user: "Amanda Foster", content: "Following up with IT. Should have approval by end of week.", timestamp: "Jan 29, 2:30 PM" },
    ],
  },
];

// GitHub Mock Data
export interface GitHubPullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  status: "open" | "merged" | "closed" | "draft";
  author: { name: string; avatar: string; username: string };
  reviewers: { name: string; avatar: string; status: "approved" | "changes-requested" | "pending" }[];
  branch: { from: string; to: string };
  commits: number;
  additions: number;
  deletions: number;
  changedFiles: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  checks: { name: string; status: "passed" | "failed" | "pending" }[];
  comments: { user: string; content: string; timestamp: string; isReview?: boolean }[];
}

export const mockGitHubPRs: GitHubPullRequest[] = [
  {
    id: "gh1",
    number: 2847,
    title: "fix: invalidate Elasticsearch cache on content deletion",
    description: "## Summary\nFixes the issue where deleted content still appears in search results.\n\n## Changes\n- Added cache invalidation hook in delete handler\n- Updated Elasticsearch service to support single-document invalidation\n- Added integration tests for cache invalidation\n\n## Testing\n- [x] Unit tests pass\n- [x] Integration tests pass\n- [x] Manual testing in staging\n\nFixes DIQ-1235",
    status: "open",
    author: { name: "Alex Kim", avatar: "AK", username: "alexkim" },
    reviewers: [
      { name: "Mike Johnson", avatar: "MJ", status: "approved" },
      { name: "Sarah Chen", avatar: "SC", status: "pending" },
    ],
    branch: { from: "fix/search-cache-invalidation", to: "main" },
    commits: 3,
    additions: 127,
    deletions: 23,
    changedFiles: 5,
    labels: ["bug", "search", "priority:high"],
    createdAt: "2026-01-29",
    updatedAt: "2026-01-30",
    checks: [
      { name: "CI / Build", status: "passed" },
      { name: "CI / Unit Tests", status: "passed" },
      { name: "CI / Integration Tests", status: "passed" },
      { name: "Security Scan", status: "passed" },
      { name: "Code Coverage", status: "passed" },
    ],
    comments: [
      { user: "Mike Johnson", content: "LGTM! Clean implementation. One small suggestion: consider adding a retry mechanism for the cache invalidation in case ES is temporarily unavailable.", timestamp: "Jan 30, 10:15 AM", isReview: true },
      { user: "Alex Kim", content: "@mikejohnson Good point! Added retry with exponential backoff in the latest commit.", timestamp: "Jan 30, 11:30 AM" },
    ],
  },
  {
    id: "gh2",
    number: 2846,
    title: "feat: implement WebSocket-based real-time notifications",
    description: "## Summary\nAdds real-time notification system using WebSockets.\n\n## Changes\n- New WebSocket server integration\n- Client-side notification handler\n- Notification preferences API\n- Redis pub/sub for horizontal scaling\n\n## Testing\n- [x] Unit tests\n- [x] Integration tests\n- [x] Load testing (10k concurrent connections)\n\nImplements DIQ-1234",
    status: "open",
    author: { name: "Mike Johnson", avatar: "MJ", username: "mikejohnson" },
    reviewers: [
      { name: "Alex Kim", avatar: "AK", status: "approved" },
      { name: "Emily Rodriguez", avatar: "ER", status: "approved" },
    ],
    branch: { from: "feature/realtime-notifications", to: "main" },
    commits: 12,
    additions: 1847,
    deletions: 234,
    changedFiles: 28,
    labels: ["feature", "notifications", "websocket"],
    createdAt: "2026-01-25",
    updatedAt: "2026-01-30",
    checks: [
      { name: "CI / Build", status: "passed" },
      { name: "CI / Unit Tests", status: "passed" },
      { name: "CI / Integration Tests", status: "passed" },
      { name: "Security Scan", status: "passed" },
      { name: "Code Coverage", status: "passed" },
      { name: "Performance Test", status: "passed" },
    ],
    comments: [
      { user: "Alex Kim", content: "Excellent work! The Redis pub/sub integration looks solid. This will scale well across our Kubernetes pods.", timestamp: "Jan 28, 3:45 PM", isReview: true },
      { user: "Emily Rodriguez", content: "Tested in staging and it's working great. Notifications are nearly instant. Ship it! 🚀", timestamp: "Jan 29, 11:00 AM", isReview: true },
    ],
  },
  {
    id: "gh3",
    number: 2845,
    title: "chore: upgrade to Next.js 16.2 and React 19",
    description: "## Summary\nUpgrades framework versions for latest features and security patches.\n\n## Changes\n- Next.js 16.1.3 → 16.2.0\n- React 18.3 → 19.0.0\n- Updated deprecated APIs\n- Fixed breaking changes\n\n## Testing\n- [x] All existing tests pass\n- [x] Visual regression testing\n- [x] Performance benchmarks (no regression)",
    status: "merged",
    author: { name: "James Wilson", avatar: "JW", username: "jameswilson" },
    reviewers: [
      { name: "Mike Johnson", avatar: "MJ", status: "approved" },
      { name: "Sarah Chen", avatar: "SC", status: "approved" },
    ],
    branch: { from: "chore/framework-upgrade", to: "main" },
    commits: 8,
    additions: 456,
    deletions: 389,
    changedFiles: 42,
    labels: ["dependencies", "maintenance"],
    createdAt: "2026-01-27",
    updatedAt: "2026-01-29",
    checks: [
      { name: "CI / Build", status: "passed" },
      { name: "CI / Unit Tests", status: "passed" },
      { name: "CI / Integration Tests", status: "passed" },
      { name: "Security Scan", status: "passed" },
    ],
    comments: [
      { user: "Sarah Chen", content: "Thanks for taking this on! Let's get this merged before the feature freeze.", timestamp: "Jan 29, 9:00 AM", isReview: true },
    ],
  },
];

// Google Drive Mock Data
export interface DriveFile {
  id: string;
  name: string;
  type: "document" | "spreadsheet" | "presentation" | "folder" | "pdf" | "image";
  owner: { name: string; avatar: string };
  sharedWith: string[];
  lastModified: string;
  lastModifiedBy: string;
  size: string;
  starred: boolean;
  path: string;
}

export const mockDriveFiles: DriveFile[] = [
  { id: "df1", name: "Q1 2026 Product Roadmap", type: "presentation", owner: { name: "Emily Rodriguez", avatar: "ER" }, sharedWith: ["Engineering", "Product", "Design"], lastModified: "2 hours ago", lastModifiedBy: "Emily Rodriguez", size: "24.5 MB", starred: true, path: "/Product/Roadmaps" },
  { id: "df2", name: "Engineering Team OKRs", type: "spreadsheet", owner: { name: "Sarah Chen", avatar: "SC" }, sharedWith: ["Engineering"], lastModified: "Yesterday", lastModifiedBy: "Mike Johnson", size: "1.2 MB", starred: true, path: "/Engineering/Planning" },
  { id: "df3", name: "Q4 2025 Financial Report", type: "document", owner: { name: "Amanda Foster", avatar: "AF" }, sharedWith: ["Executive Team"], lastModified: "3 days ago", lastModifiedBy: "Amanda Foster", size: "856 KB", starred: false, path: "/Finance/Reports" },
  { id: "df4", name: "Brand Guidelines v3.0", type: "pdf", owner: { name: "James Wilson", avatar: "JW" }, sharedWith: ["Everyone"], lastModified: "1 week ago", lastModifiedBy: "James Wilson", size: "45.2 MB", starred: true, path: "/Marketing/Brand" },
  { id: "df5", name: "Architecture Diagrams", type: "folder", owner: { name: "Alex Kim", avatar: "AK" }, sharedWith: ["Engineering"], lastModified: "4 hours ago", lastModifiedBy: "Alex Kim", size: "156 MB", starred: false, path: "/Engineering" },
  { id: "df6", name: "Customer Success Playbook", type: "document", owner: { name: "Lisa Park", avatar: "LP" }, sharedWith: ["Customer Success", "Sales"], lastModified: "5 hours ago", lastModifiedBy: "Lisa Park", size: "2.3 MB", starred: true, path: "/Sales/Playbooks" },
  { id: "df7", name: "Meeting Notes - Product Sync", type: "document", owner: { name: "Emily Rodriguez", avatar: "ER" }, sharedWith: ["Product Team"], lastModified: "30 minutes ago", lastModifiedBy: "Emily Rodriguez", size: "124 KB", starred: false, path: "/Product/Meetings" },
  { id: "df8", name: "2026 Budget Planning", type: "spreadsheet", owner: { name: "Amanda Foster", avatar: "AF" }, sharedWith: ["Finance", "Executive Team"], lastModified: "1 day ago", lastModifiedBy: "David Brown", size: "3.8 MB", starred: true, path: "/Finance/Budget" },
];

// Zoom Mock Data
export interface ZoomMeeting {
  id: string;
  title: string;
  host: { name: string; avatar: string };
  participants: { name: string; avatar: string; status: "joined" | "invited" | "declined" }[];
  startTime: string;
  duration: string;
  type: "scheduled" | "recurring" | "instant";
  status: "upcoming" | "live" | "ended";
  recording?: { url: string; duration: string };
  notes?: string;
}

export const mockZoomMeetings: ZoomMeeting[] = [
  {
    id: "zm1",
    title: "Weekly Team Standup",
    host: { name: "Sarah Chen", avatar: "SC" },
    participants: [
      { name: "Mike Johnson", avatar: "MJ", status: "joined" },
      { name: "Alex Kim", avatar: "AK", status: "joined" },
      { name: "Emily Rodriguez", avatar: "ER", status: "joined" },
      { name: "James Wilson", avatar: "JW", status: "invited" },
    ],
    startTime: "Today, 10:00 AM",
    duration: "30 min",
    type: "recurring",
    status: "live",
  },
  {
    id: "zm2",
    title: "Q1 Planning Review",
    host: { name: "Emily Rodriguez", avatar: "ER" },
    participants: [
      { name: "Sarah Chen", avatar: "SC", status: "invited" },
      { name: "James Wilson", avatar: "JW", status: "invited" },
      { name: "Lisa Park", avatar: "LP", status: "invited" },
      { name: "David Brown", avatar: "DB", status: "invited" },
    ],
    startTime: "Today, 2:00 PM",
    duration: "1 hour",
    type: "scheduled",
    status: "upcoming",
  },
  {
    id: "zm3",
    title: "Product Demo - Acme Corp",
    host: { name: "David Brown", avatar: "DB" },
    participants: [
      { name: "Lisa Park", avatar: "LP", status: "joined" },
      { name: "Emily Rodriguez", avatar: "ER", status: "joined" },
    ],
    startTime: "Yesterday, 3:00 PM",
    duration: "45 min",
    type: "scheduled",
    status: "ended",
    recording: { url: "/recordings/acme-demo", duration: "42:18" },
    notes: "Great demo! Client was impressed with the AI features. Follow-up scheduled for next week.",
  },
  {
    id: "zm4",
    title: "Engineering All-Hands",
    host: { name: "Sarah Chen", avatar: "SC" },
    participants: [
      { name: "Mike Johnson", avatar: "MJ", status: "joined" },
      { name: "Alex Kim", avatar: "AK", status: "joined" },
      { name: "James Wilson", avatar: "JW", status: "joined" },
    ],
    startTime: "Yesterday, 11:00 AM",
    duration: "1 hour",
    type: "recurring",
    status: "ended",
    recording: { url: "/recordings/eng-allhands", duration: "58:32" },
  },
];

// Confluence Mock Data
export interface ConfluencePage {
  id: string;
  title: string;
  space: string;
  author: { name: string; avatar: string };
  lastUpdated: string;
  lastUpdatedBy: string;
  content: string;
  likes: number;
  views: number;
  comments: number;
  labels: string[];
}

export const mockConfluencePages: ConfluencePage[] = [
  {
    id: "cf1",
    title: "Engineering Onboarding Guide",
    space: "Engineering",
    author: { name: "Sarah Chen", avatar: "SC" },
    lastUpdated: "2 days ago",
    lastUpdatedBy: "Mike Johnson",
    content: "Complete guide for new engineering hires including setup instructions, coding standards, and team processes.",
    likes: 45,
    views: 1234,
    comments: 12,
    labels: ["onboarding", "engineering", "guide"],
  },
  {
    id: "cf2",
    title: "API Documentation - v3.0",
    space: "Engineering",
    author: { name: "Mike Johnson", avatar: "MJ" },
    lastUpdated: "5 hours ago",
    lastUpdatedBy: "Alex Kim",
    content: "Complete API reference for the dIQ platform including authentication, endpoints, and examples.",
    likes: 28,
    views: 2456,
    comments: 8,
    labels: ["api", "documentation", "reference"],
  },
  {
    id: "cf3",
    title: "Product Vision 2026",
    space: "Product",
    author: { name: "Emily Rodriguez", avatar: "ER" },
    lastUpdated: "1 week ago",
    lastUpdatedBy: "Emily Rodriguez",
    content: "Our product vision and strategy for 2026, including key initiatives and success metrics.",
    likes: 67,
    views: 856,
    comments: 23,
    labels: ["vision", "strategy", "2026"],
  },
  {
    id: "cf4",
    title: "Design System Components",
    space: "Design",
    author: { name: "James Wilson", avatar: "JW" },
    lastUpdated: "3 days ago",
    lastUpdatedBy: "James Wilson",
    content: "Complete inventory of our design system components with usage guidelines and code snippets.",
    likes: 34,
    views: 1567,
    comments: 15,
    labels: ["design-system", "components", "ui"],
  },
  {
    id: "cf5",
    title: "Security Best Practices",
    space: "Engineering",
    author: { name: "Alex Kim", avatar: "AK" },
    lastUpdated: "1 day ago",
    lastUpdatedBy: "Alex Kim",
    content: "Security guidelines and best practices for all engineering teams.",
    likes: 52,
    views: 987,
    comments: 6,
    labels: ["security", "best-practices", "compliance"],
  },
];

// Salesforce Mock Data
export interface SalesforceOpportunity {
  id: string;
  name: string;
  account: string;
  stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
  amount: number;
  probability: number;
  closeDate: string;
  owner: { name: string; avatar: string };
  nextStep: string;
  lastActivity: string;
}

export const mockSalesforceOpportunities: SalesforceOpportunity[] = [
  { id: "sf1", name: "Acme Corp - Enterprise License", account: "Acme Corporation", stage: "closed-won", amount: 2400000, probability: 100, closeDate: "2026-01-30", owner: { name: "David Brown", avatar: "DB" }, nextStep: "Contract signed - Handoff to CS", lastActivity: "Contract signed" },
  { id: "sf2", name: "TechStart Inc - Startup Plan", account: "TechStart Inc", stage: "negotiation", amount: 180000, probability: 75, closeDate: "2026-02-15", owner: { name: "Lisa Park", avatar: "LP" }, nextStep: "Final pricing review meeting", lastActivity: "Sent revised proposal" },
  { id: "sf3", name: "Global Finance - Platform Migration", account: "Global Finance Ltd", stage: "proposal", amount: 850000, probability: 50, closeDate: "2026-03-01", owner: { name: "David Brown", avatar: "DB" }, nextStep: "Technical deep-dive scheduled", lastActivity: "Demo completed" },
  { id: "sf4", name: "HealthCare Plus - Compliance Package", account: "HealthCare Plus", stage: "qualification", amount: 425000, probability: 30, closeDate: "2026-03-15", owner: { name: "Lisa Park", avatar: "LP" }, nextStep: "Security questionnaire review", lastActivity: "Initial discovery call" },
  { id: "sf5", name: "Retail Giant - Analytics Suite", account: "Retail Giant Co", stage: "prospecting", amount: 1200000, probability: 10, closeDate: "2026-04-01", owner: { name: "David Brown", avatar: "DB" }, nextStep: "Schedule intro meeting", lastActivity: "Received inbound lead" },
];

// Figma Mock Data
export interface FigmaProject {
  id: string;
  name: string;
  thumbnail: string;
  lastModified: string;
  lastModifiedBy: string;
  editors: { name: string; avatar: string }[];
  viewers: number;
  comments: number;
  status: "in-progress" | "review" | "approved" | "archived";
}

export const mockFigmaProjects: FigmaProject[] = [
  { id: "fg1", name: "Dashboard v3.0 Redesign", thumbnail: "🎨", lastModified: "2 hours ago", lastModifiedBy: "James Wilson", editors: [{ name: "James Wilson", avatar: "JW" }, { name: "Emily Rodriguez", avatar: "ER" }], viewers: 24, comments: 18, status: "review" },
  { id: "fg2", name: "Mobile App - iOS", thumbnail: "📱", lastModified: "Yesterday", lastModifiedBy: "James Wilson", editors: [{ name: "James Wilson", avatar: "JW" }], viewers: 15, comments: 32, status: "in-progress" },
  { id: "fg3", name: "Design System v2.0", thumbnail: "🎯", lastModified: "3 days ago", lastModifiedBy: "James Wilson", editors: [{ name: "James Wilson", avatar: "JW" }, { name: "Sarah Chen", avatar: "SC" }], viewers: 67, comments: 45, status: "approved" },
  { id: "fg4", name: "Marketing Landing Pages", thumbnail: "🚀", lastModified: "1 week ago", lastModifiedBy: "Emily Rodriguez", editors: [{ name: "James Wilson", avatar: "JW" }, { name: "Emily Rodriguez", avatar: "ER" }], viewers: 12, comments: 8, status: "approved" },
];

// Notion Mock Data
export interface NotionPage {
  id: string;
  title: string;
  icon: string;
  workspace: string;
  lastEdited: string;
  lastEditedBy: string;
  type: "page" | "database" | "wiki" | "meeting-notes";
  shared: boolean;
}

export const mockNotionPages: NotionPage[] = [
  { id: "nt1", title: "Team Wiki", icon: "📚", workspace: "Engineering", lastEdited: "1 hour ago", lastEditedBy: "Mike Johnson", type: "wiki", shared: true },
  { id: "nt2", title: "Sprint Planning Board", icon: "📋", workspace: "Engineering", lastEdited: "30 minutes ago", lastEditedBy: "Sarah Chen", type: "database", shared: true },
  { id: "nt3", title: "Product Ideas Backlog", icon: "💡", workspace: "Product", lastEdited: "2 hours ago", lastEditedBy: "Emily Rodriguez", type: "database", shared: true },
  { id: "nt4", title: "1:1 Meeting Notes", icon: "📝", workspace: "Personal", lastEdited: "Yesterday", lastEditedBy: "You", type: "meeting-notes", shared: false },
  { id: "nt5", title: "Company Handbook", icon: "📖", workspace: "HR", lastEdited: "3 days ago", lastEditedBy: "Amanda Foster", type: "wiki", shared: true },
];

// Auzmor Office Mock Data
export interface AuzmorOfficePost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    department: string;
    title: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  type: "update" | "announcement" | "celebration" | "poll" | "shoutout";
  images: string[];
  pinned?: boolean;
  reactions?: { emoji: string; count: number }[];
}

export interface AuzmorOfficeUser {
  id: string;
  name: string;
  avatar: string;
  title: string;
  department: string;
  email: string;
  status: "online" | "away" | "dnd" | "offline";
  location: string;
  timezone: string;
}

export interface AuzmorOfficeChannel {
  id: string;
  name: string;
  description: string;
  members: number;
  unread: number;
  isPrivate: boolean;
  lastActivity: string;
}

export const mockAuzmorOfficePosts: AuzmorOfficePost[] = [
  {
    id: "aop1",
    author: { id: "u1", name: "Sarah Chen", avatar: "SC", department: "Engineering", title: "VP of Engineering" },
    content: "🎉 Thrilled to announce that our team just shipped the new real-time notification system! Huge thanks to Mike, Alex, and the entire engineering team for their incredible work. This is a major milestone for our platform!",
    timestamp: "2026-01-30T10:30:00Z",
    likes: 47,
    comments: 12,
    type: "update",
    images: [],
    reactions: [{ emoji: "🎉", count: 24 }, { emoji: "💪", count: 15 }, { emoji: "🚀", count: 8 }],
  },
  {
    id: "aop2",
    author: { id: "u8", name: "Amanda Foster", avatar: "AF", department: "People", title: "Chief People Officer" },
    content: "📢 Reminder: Open enrollment for 2026 benefits closes this Friday! Don't miss out on the new mental health coverage and increased 401(k) match. Visit the Benefits Portal to make your selections.",
    timestamp: "2026-01-30T08:15:00Z",
    likes: 89,
    comments: 23,
    type: "announcement",
    images: [],
    pinned: true,
    reactions: [{ emoji: "👍", count: 45 }, { emoji: "❤️", count: 22 }, { emoji: "🙏", count: 12 }],
  },
  {
    id: "aop3",
    author: { id: "u7", name: "David Brown", avatar: "DB", department: "Sales", title: "Account Executive" },
    content: "Just closed our biggest enterprise deal of the quarter! 🎯 $2.4M ARR with Acme Corporation. Couldn't have done it without the amazing support from Lisa and James on the demos. Team effort! 💪",
    timestamp: "2026-01-30T09:30:00Z",
    likes: 156,
    comments: 45,
    type: "celebration",
    images: [],
    reactions: [{ emoji: "🎉", count: 67 }, { emoji: "💰", count: 42 }, { emoji: "🏆", count: 28 }],
  },
  {
    id: "aop4",
    author: { id: "u5", name: "James Wilson", avatar: "JW", department: "Design", title: "Senior Product Designer" },
    content: "New dashboard designs are up in Figma! We've simplified the navigation from 8 to 5 main tabs based on user feedback. Would love everyone's input before we finalize.",
    timestamp: "2026-01-29T16:45:00Z",
    likes: 34,
    comments: 18,
    type: "update",
    images: ["dashboard-preview.png"],
    reactions: [{ emoji: "😍", count: 18 }, { emoji: "👀", count: 12 }],
  },
  {
    id: "aop5",
    author: { id: "u4", name: "Emily Rodriguez", avatar: "ER", department: "Product", title: "Product Manager" },
    content: "🗓️ Sprint 14 Retrospective Summary:\n\n✅ What went well: Team collaboration, on-time delivery\n🔄 What to improve: Earlier QA involvement\n💡 Action items: Weekly design-dev syncs starting next sprint\n\nThanks everyone for a great sprint!",
    timestamp: "2026-01-29T14:00:00Z",
    likes: 28,
    comments: 7,
    type: "update",
    images: [],
    reactions: [{ emoji: "✅", count: 15 }, { emoji: "💡", count: 8 }],
  },
  {
    id: "aop6",
    author: { id: "u6", name: "Lisa Park", avatar: "LP", department: "Engineering", title: "QA Engineer" },
    content: "🎊 Shoutout to @Mike Johnson for staying late to help debug the WebSocket connection issues! Your dedication is inspiring. Thank you! 🌟",
    timestamp: "2026-01-29T18:30:00Z",
    likes: 42,
    comments: 8,
    type: "shoutout",
    images: [],
    reactions: [{ emoji: "💜", count: 24 }, { emoji: "🙌", count: 14 }],
  },
  {
    id: "aop7",
    author: { id: "u3", name: "Alex Kim", avatar: "AK", department: "Engineering", title: "DevOps Lead" },
    content: "Infrastructure update: We've successfully migrated to the new Kubernetes cluster. Performance metrics are looking great - 40% faster deployments and 50% reduction in resource costs! 📈",
    timestamp: "2026-01-28T11:00:00Z",
    likes: 67,
    comments: 15,
    type: "update",
    images: [],
    reactions: [{ emoji: "🔥", count: 32 }, { emoji: "💪", count: 22 }, { emoji: "📈", count: 13 }],
  },
];

export const mockAuzmorOfficeUsers: AuzmorOfficeUser[] = [
  { id: "u1", name: "Sarah Chen", avatar: "SC", title: "VP of Engineering", department: "Engineering", email: "sarah.chen@company.com", status: "online", location: "San Francisco, CA", timezone: "PST" },
  { id: "u2", name: "Mike Johnson", avatar: "MJ", title: "Senior Backend Engineer", department: "Engineering", email: "mike.johnson@company.com", status: "online", location: "Austin, TX", timezone: "CST" },
  { id: "u3", name: "Alex Kim", avatar: "AK", title: "DevOps Lead", department: "Engineering", email: "alex.kim@company.com", status: "dnd", location: "Seattle, WA", timezone: "PST" },
  { id: "u4", name: "Emily Rodriguez", avatar: "ER", title: "Product Manager", department: "Product", email: "emily.rodriguez@company.com", status: "online", location: "New York, NY", timezone: "EST" },
  { id: "u5", name: "James Wilson", avatar: "JW", title: "Senior Product Designer", department: "Design", email: "james.wilson@company.com", status: "away", location: "Los Angeles, CA", timezone: "PST" },
  { id: "u6", name: "Lisa Park", avatar: "LP", title: "QA Engineer", department: "Engineering", email: "lisa.park@company.com", status: "online", location: "Chicago, IL", timezone: "CST" },
  { id: "u7", name: "David Brown", avatar: "DB", title: "Account Executive", department: "Sales", email: "david.brown@company.com", status: "online", location: "Boston, MA", timezone: "EST" },
  { id: "u8", name: "Amanda Foster", avatar: "AF", title: "Chief People Officer", department: "People", email: "amanda.foster@company.com", status: "offline", location: "Denver, CO", timezone: "MST" },
];

export const mockAuzmorOfficeChannels: AuzmorOfficeChannel[] = [
  { id: "aoc1", name: "General", description: "Company-wide announcements and updates", members: 247, unread: 3, isPrivate: false, lastActivity: "10:45 AM" },
  { id: "aoc2", name: "Engineering", description: "Engineering team discussions and updates", members: 63, unread: 12, isPrivate: false, lastActivity: "10:32 AM" },
  { id: "aoc3", name: "Product", description: "Product updates and roadmap discussions", members: 28, unread: 5, isPrivate: false, lastActivity: "10:15 AM" },
  { id: "aoc4", name: "Design", description: "Design team collaboration and reviews", members: 18, unread: 0, isPrivate: false, lastActivity: "9:45 AM" },
  { id: "aoc5", name: "Sales", description: "Sales wins, updates, and strategies", members: 42, unread: 8, isPrivate: false, lastActivity: "9:30 AM" },
  { id: "aoc6", name: "Random", description: "Off-topic conversations and fun", members: 189, unread: 24, isPrivate: false, lastActivity: "10:50 AM" },
  { id: "aoc7", name: "Announcements", description: "Official company announcements", members: 247, unread: 1, isPrivate: false, lastActivity: "8:00 AM" },
  { id: "aoc8", name: "Leadership", description: "Leadership team discussions", members: 12, unread: 2, isPrivate: true, lastActivity: "Yesterday" },
];

// LinkedIn Mock Data
export interface LinkedInNotification {
  id: string;
  type: "connection" | "message" | "post" | "job" | "mention";
  content: string;
  from: { name: string; avatar: string; title: string };
  timestamp: string;
  read: boolean;
}

export const mockLinkedInNotifications: LinkedInNotification[] = [
  { id: "ln1", type: "connection", content: "accepted your connection request", from: { name: "Jennifer Smith", avatar: "JS", title: "VP of Sales at TechCorp" }, timestamp: "2 hours ago", read: false },
  { id: "ln2", type: "message", content: "Hi! I saw your post about AI in the workplace. Would love to connect and discuss.", from: { name: "Michael Chen", avatar: "MC", title: "CTO at StartupXYZ" }, timestamp: "3 hours ago", read: false },
  { id: "ln3", type: "post", content: "liked your post about \"The Future of Enterprise AI\"", from: { name: "Sarah Miller", avatar: "SM", title: "Product Manager at BigCo" }, timestamp: "5 hours ago", read: true },
  { id: "ln4", type: "mention", content: "mentioned you in a comment: \"Great insights from @you about...\"", from: { name: "David Lee", avatar: "DL", title: "Engineering Director at InnoTech" }, timestamp: "Yesterday", read: true },
  { id: "ln5", type: "job", content: "Your profile matches a new job: Senior Product Manager at Google", from: { name: "LinkedIn Jobs", avatar: "LI", title: "" }, timestamp: "Yesterday", read: true },
];

// App Integration Summary Data
export interface AppIntegration {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  unreadCount: number;
  quickStats: { label: string; value: string | number }[];
}

export const mockAppIntegrations: AppIntegration[] = [
  { id: "auzmor-office", name: "Auzmor Office", icon: "🏢", color: "bg-emerald-500/20", status: "connected", lastSync: "Just now", unreadCount: 5, quickStats: [{ label: "Posts", value: 7 }, { label: "Channels", value: 8 }, { label: "Team", value: 8 }] },
  { id: "slack", name: "Slack", icon: "💬", color: "bg-[var(--accent-ember)]/20", status: "connected", lastSync: "Just now", unreadCount: 28, quickStats: [{ label: "Unread", value: 28 }, { label: "Channels", value: 12 }, { label: "DMs", value: 5 }] },
  { id: "jira", name: "Jira", icon: "🎯", color: "bg-amber-400/20", status: "connected", lastSync: "2 min ago", unreadCount: 5, quickStats: [{ label: "Assigned", value: 8 }, { label: "In Progress", value: 3 }, { label: "To Review", value: 2 }] },
  { id: "github", name: "GitHub", icon: "🐙", color: "bg-[var(--bg-slate)]", status: "connected", lastSync: "5 min ago", unreadCount: 3, quickStats: [{ label: "Open PRs", value: 4 }, { label: "Reviews", value: 2 }, { label: "Issues", value: 7 }] },
  { id: "drive", name: "Google Drive", icon: "📁", color: "bg-amber-500/20", status: "connected", lastSync: "10 min ago", unreadCount: 0, quickStats: [{ label: "Recent", value: 12 }, { label: "Shared", value: 45 }, { label: "Starred", value: 8 }] },
  { id: "zoom", name: "Zoom", icon: "🎥", color: "bg-orange-500/20", status: "connected", lastSync: "Just now", unreadCount: 1, quickStats: [{ label: "Today", value: 3 }, { label: "Upcoming", value: 5 }, { label: "Recordings", value: 12 }] },
  { id: "confluence", name: "Confluence", icon: "📝", color: "bg-orange-600/20", status: "connected", lastSync: "15 min ago", unreadCount: 2, quickStats: [{ label: "Updated", value: 8 }, { label: "Watching", value: 15 }, { label: "Drafts", value: 3 }] },
  { id: "salesforce", name: "Salesforce", icon: "☁️", color: "bg-[var(--accent-gold)]/20", status: "connected", lastSync: "30 min ago", unreadCount: 4, quickStats: [{ label: "Pipeline", value: "$5.1M" }, { label: "Deals", value: 12 }, { label: "Tasks", value: 6 }] },
  { id: "figma", name: "Figma", icon: "🎨", color: "bg-[var(--accent-copper)]/20", status: "connected", lastSync: "1 hour ago", unreadCount: 0, quickStats: [{ label: "Projects", value: 8 }, { label: "Comments", value: 15 }, { label: "Updates", value: 3 }] },
  { id: "notion", name: "Notion", icon: "📓", color: "bg-[var(--border-default)]", status: "connected", lastSync: "45 min ago", unreadCount: 1, quickStats: [{ label: "Pages", value: 24 }, { label: "Databases", value: 6 }, { label: "Shared", value: 12 }] },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "bg-orange-700/20", status: "connected", lastSync: "2 hours ago", unreadCount: 5, quickStats: [{ label: "Messages", value: 3 }, { label: "Notifications", value: 8 }, { label: "Connections", value: 847 }] },
];
