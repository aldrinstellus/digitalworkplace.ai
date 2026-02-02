/**
 * Cross-Reference User Mapping for dIQ Full Ecosystem Integration
 *
 * This file provides functions to map users across different app integrations
 * to dIQ employees. Uses email-based matching as primary method with manual
 * mapping fallback.
 */

import { mockEmployees, type MockEmployee } from './mockData';
import {
  mockSlackMessages,
  mockJiraTickets,
  mockGitHubPRs,
  mockDriveFiles,
  mockZoomMeetings,
  mockConfluencePages,
  mockSalesforceOpportunities,
  mockFigmaProjects,
  mockNotionPages,
  mockAuzmorOfficePosts,
  type SlackMessage,
  type JiraTicket,
  type GitHubPullRequest,
  type DriveFile,
  type ZoomMeeting,
  type ConfluencePage,
  type SalesforceOpportunity,
  type FigmaProject,
  type NotionPage,
} from './mockAppsData';
import type { DataSource, UnifiedEmployee } from './unifiedTypes';

// =============================================================================
// USER IDENTITY TYPES
// =============================================================================

export interface AppUser {
  source: DataSource;
  id?: string;
  name: string;
  email?: string;
  avatar?: string;
  username?: string;
  title?: string;
}

export interface UserMapping {
  employeeId: string;
  email: string;
  appIdentities: Partial<Record<DataSource, AppUser>>;
}

// =============================================================================
// MANUAL USER MAPPINGS
// =============================================================================

/**
 * Manual mappings for users where email matching doesn't work.
 * Map app user names to dIQ employee emails.
 */
const MANUAL_USER_MAPPINGS: Record<string, string> = {
  // Slack names → employee emails
  'Sarah Chen': 'sarah.chen@digitalworkplace.ai',
  'Mike Johnson': 'mike.johnson@digitalworkplace.ai',
  'Alex Kim': 'alex.kim@digitalworkplace.ai',
  'Emily Rodriguez': 'emily.rodriguez@digitalworkplace.ai',
  'James Wilson': 'james.wilson@digitalworkplace.ai',
  'Lisa Park': 'lisa.park@digitalworkplace.ai',
  'David Brown': 'david.brown@digitalworkplace.ai',
  'Amanda Foster': 'amanda.foster@digitalworkplace.ai',
  'Tom Chen': 'tom.chen@digitalworkplace.ai',
  'Tom Martinez': 'tom.martinez@digitalworkplace.ai',
  'Marcus Johnson': 'marcus.johnson@digitalworkplace.ai',
  'Priya Sharma': 'priya.sharma@digitalworkplace.ai',
  'Jennifer Kim': 'jennifer.kim@digitalworkplace.ai',
  'Chris O\'Brien': 'chris.obrien@digitalworkplace.ai',
  'Marcus Lee': 'marcus.lee@digitalworkplace.ai',
};

/**
 * GitHub usernames → employee emails
 */
const GITHUB_USERNAME_MAPPINGS: Record<string, string> = {
  'alexkim': 'alex.kim@digitalworkplace.ai',
  'mikejohnson': 'mike.johnson@digitalworkplace.ai',
  'jameswilson': 'james.wilson@digitalworkplace.ai',
  'sarahchen': 'sarah.chen@digitalworkplace.ai',
  'emilyrodriguez': 'emily.rodriguez@digitalworkplace.ai',
};

// =============================================================================
// EMAIL-BASED MATCHING (Primary Method)
// =============================================================================

/**
 * Find employee by email address
 */
export function findEmployeeByEmail(email: string): MockEmployee | undefined {
  return mockEmployees.find(
    emp => emp.email.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Find employee by name (fallback method)
 */
export function findEmployeeByName(name: string): MockEmployee | undefined {
  const normalizedName = name.toLowerCase().trim();

  // First try exact match
  let employee = mockEmployees.find(
    emp => emp.full_name.toLowerCase() === normalizedName
  );

  if (employee) return employee;

  // Try partial match (first name + last name contains)
  employee = mockEmployees.find(
    emp => {
      const empName = emp.full_name.toLowerCase();
      return empName.includes(normalizedName) || normalizedName.includes(empName);
    }
  );

  if (employee) return employee;

  // Try manual mapping
  const mappedEmail = MANUAL_USER_MAPPINGS[name];
  if (mappedEmail) {
    return findEmployeeByEmail(mappedEmail);
  }

  return undefined;
}

/**
 * Find employee by GitHub username
 */
export function findEmployeeByGitHubUsername(username: string): MockEmployee | undefined {
  const email = GITHUB_USERNAME_MAPPINGS[username.toLowerCase()];
  if (email) {
    return findEmployeeByEmail(email);
  }
  return undefined;
}

// =============================================================================
// RESOLVE APP USER TO EMPLOYEE
// =============================================================================

/**
 * Resolve any app user to a dIQ employee
 */
export function resolveAppUserToEmployee(appUser: AppUser): MockEmployee | undefined {
  // Try email first (most reliable)
  if (appUser.email) {
    const byEmail = findEmployeeByEmail(appUser.email);
    if (byEmail) return byEmail;
  }

  // Try GitHub username
  if (appUser.source === 'github' && appUser.username) {
    const byUsername = findEmployeeByGitHubUsername(appUser.username);
    if (byUsername) return byUsername;
  }

  // Try name matching
  if (appUser.name) {
    const byName = findEmployeeByName(appUser.name);
    if (byName) return byName;
  }

  return undefined;
}

// =============================================================================
// GET APP PRESENCE FOR EMPLOYEE
// =============================================================================

/**
 * Get all app activity/presence for a specific employee
 */
export function getAppPresenceForEmployee(employeeId: string): UnifiedEmployee['appPresence'] {
  const employee = mockEmployees.find(e => e.id === employeeId);
  if (!employee) return undefined;

  const employeeName = employee.full_name;

  // Slack presence
  const slackMessages = mockSlackMessages.filter(
    msg => msg.user.name === employeeName
  );
  const slackStatus = slackMessages.length > 0 ? slackMessages[0].user.status : 'offline';

  // Jira presence
  const jiraAssigned = mockJiraTickets.filter(
    ticket => ticket.assignee.name === employeeName
  );
  const jiraInProgress = jiraAssigned.filter(t => t.status === 'in-progress');

  // GitHub presence
  const githubPRs = mockGitHubPRs.filter(
    pr => pr.author.name === employeeName
  );
  const pendingReviews = mockGitHubPRs.filter(
    pr => pr.reviewers.some(r => r.name === employeeName && r.status === 'pending')
  );

  // Zoom presence
  const liveMeeting = mockZoomMeetings.find(
    meeting => meeting.status === 'live' && (
      meeting.host.name === employeeName ||
      meeting.participants.some(p => p.name === employeeName && p.status === 'joined')
    )
  );

  // Salesforce presence
  const sfOpportunities = mockSalesforceOpportunities.filter(
    opp => opp.owner.name === employeeName && !opp.stage.includes('closed')
  );
  const pipelineValue = sfOpportunities.reduce((sum, opp) => sum + opp.amount, 0);

  // Auzmor Office presence
  const auzmorPosts = mockAuzmorOfficePosts.filter(
    post => post.author.name === employeeName
  );

  return {
    slack: {
      status: slackStatus,
      lastActive: slackMessages.length > 0 ? slackMessages[0].timestamp : undefined,
    },
    jira: {
      assignedTickets: jiraAssigned.length,
      inProgressTickets: jiraInProgress.length,
    },
    github: {
      openPRs: githubPRs.filter(pr => pr.status === 'open').length,
      pendingReviews: pendingReviews.length,
    },
    zoom: {
      currentMeeting: liveMeeting?.title,
      inMeeting: !!liveMeeting,
    },
    salesforce: {
      openOpportunities: sfOpportunities.length,
      pipelineValue,
    },
    'auzmor-office': {
      status: auzmorPosts.length > 0 ? 'online' : 'offline',
      lastActive: auzmorPosts.length > 0 ? auzmorPosts[0].timestamp : undefined,
      posts: auzmorPosts.length,
      channels: [],
    },
  };
}

// =============================================================================
// GET ALL USERS WITH CROSS-REFERENCES
// =============================================================================

/**
 * Build complete user mappings across all integrations
 */
export function buildUserMappings(): UserMapping[] {
  const mappings: UserMapping[] = [];

  for (const employee of mockEmployees) {
    const mapping: UserMapping = {
      employeeId: employee.id,
      email: employee.email,
      appIdentities: {
        diq: {
          source: 'diq',
          id: employee.id,
          name: employee.full_name,
          email: employee.email,
          avatar: employee.avatar,
        },
      },
    };

    // Find Slack identity
    const slackUser = mockSlackMessages.find(m => m.user.name === employee.full_name);
    if (slackUser) {
      mapping.appIdentities.slack = {
        source: 'slack',
        name: slackUser.user.name,
        avatar: slackUser.user.avatar,
        title: slackUser.user.title,
      };
    }

    // Find Jira identity
    const jiraUser = mockJiraTickets.find(
      t => t.assignee.name === employee.full_name || t.reporter.name === employee.full_name
    );
    if (jiraUser) {
      const isAssignee = jiraUser.assignee.name === employee.full_name;
      const user = isAssignee ? jiraUser.assignee : jiraUser.reporter;
      mapping.appIdentities.jira = {
        source: 'jira',
        name: user.name,
        avatar: user.avatar,
      };
    }

    // Find GitHub identity
    const githubUser = mockGitHubPRs.find(pr => pr.author.name === employee.full_name);
    if (githubUser) {
      mapping.appIdentities.github = {
        source: 'github',
        name: githubUser.author.name,
        avatar: githubUser.author.avatar,
        username: githubUser.author.username,
      };
    }

    // Find Drive identity
    const driveUser = mockDriveFiles.find(f => f.owner.name === employee.full_name);
    if (driveUser) {
      mapping.appIdentities.drive = {
        source: 'drive',
        name: driveUser.owner.name,
        avatar: driveUser.owner.avatar,
      };
    }

    // Find Zoom identity
    const zoomUser = mockZoomMeetings.find(
      m => m.host.name === employee.full_name ||
           m.participants.some(p => p.name === employee.full_name)
    );
    if (zoomUser) {
      const isHost = zoomUser.host.name === employee.full_name;
      const user = isHost ? zoomUser.host : zoomUser.participants.find(p => p.name === employee.full_name);
      if (user) {
        mapping.appIdentities.zoom = {
          source: 'zoom',
          name: user.name,
          avatar: user.avatar,
        };
      }
    }

    // Find Confluence identity
    const confluenceUser = mockConfluencePages.find(p => p.author.name === employee.full_name);
    if (confluenceUser) {
      mapping.appIdentities.confluence = {
        source: 'confluence',
        name: confluenceUser.author.name,
        avatar: confluenceUser.author.avatar,
      };
    }

    // Find Salesforce identity
    const sfUser = mockSalesforceOpportunities.find(o => o.owner.name === employee.full_name);
    if (sfUser) {
      mapping.appIdentities.salesforce = {
        source: 'salesforce',
        name: sfUser.owner.name,
        avatar: sfUser.owner.avatar,
      };
    }

    // Find Figma identity
    const figmaUser = mockFigmaProjects.find(
      p => p.editors.some(e => e.name === employee.full_name)
    );
    if (figmaUser) {
      const editor = figmaUser.editors.find(e => e.name === employee.full_name);
      if (editor) {
        mapping.appIdentities.figma = {
          source: 'figma',
          name: editor.name,
          avatar: editor.avatar,
        };
      }
    }

    // Find Notion identity
    const notionUser = mockNotionPages.find(p => p.lastEditedBy === employee.full_name);
    if (notionUser) {
      mapping.appIdentities.notion = {
        source: 'notion',
        name: notionUser.lastEditedBy,
      };
    }

    mappings.push(mapping);
  }

  return mappings;
}

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Get employee ID from any app user identifier
 */
export function getEmployeeIdFromAppUser(
  source: DataSource,
  identifier: string,  // Could be name, email, or username
): string | undefined {
  // Try as email first
  const byEmail = findEmployeeByEmail(identifier);
  if (byEmail) return byEmail.id;

  // Try GitHub username
  if (source === 'github') {
    const byUsername = findEmployeeByGitHubUsername(identifier);
    if (byUsername) return byUsername.id;
  }

  // Try by name
  const byName = findEmployeeByName(identifier);
  if (byName) return byName.id;

  return undefined;
}

/**
 * Get all employees with their unified presence data
 */
export function getAllEmployeesWithPresence(): UnifiedEmployee[] {
  return mockEmployees.map(employee => ({
    id: employee.id,
    userId: employee.user_id,
    fullName: employee.full_name,
    email: employee.email,
    phone: employee.phone,
    avatar: employee.avatar,
    jobTitle: employee.job_title,
    department: {
      id: employee.department_id,
      name: employee.department_name,
    },
    location: employee.location,
    timezone: employee.timezone,
    hireDate: employee.hire_date,
    bio: employee.bio,
    skills: employee.skills,
    manager: employee.manager_id && employee.manager_name ? {
      id: employee.manager_id,
      name: employee.manager_name,
    } : undefined,
    status: employee.status,
    appPresence: getAppPresenceForEmployee(employee.id),
  }));
}

/**
 * Find a unified employee by ID with full presence data
 */
export function getUnifiedEmployeeById(employeeId: string): UnifiedEmployee | undefined {
  const employee = mockEmployees.find(e => e.id === employeeId);
  if (!employee) return undefined;

  return {
    id: employee.id,
    userId: employee.user_id,
    fullName: employee.full_name,
    email: employee.email,
    phone: employee.phone,
    avatar: employee.avatar,
    jobTitle: employee.job_title,
    department: {
      id: employee.department_id,
      name: employee.department_name,
    },
    location: employee.location,
    timezone: employee.timezone,
    hireDate: employee.hire_date,
    bio: employee.bio,
    skills: employee.skills,
    manager: employee.manager_id && employee.manager_name ? {
      id: employee.manager_id,
      name: employee.manager_name,
    } : undefined,
    status: employee.status,
    appPresence: getAppPresenceForEmployee(employee.id),
  };
}
