/**
 * GitHub Data Transformer
 *
 * Transforms GitHub pull requests into unified dIQ types.
 */

import type { GitHubPullRequest } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedTask, UnifiedActivity, TaskStatus, TaskPriority } from '../unifiedTypes';
import { findEmployeeByName, findEmployeeByGitHubUsername } from '../crossReferences';

/**
 * Map GitHub PR status to unified task status
 */
function mapGitHubStatus(status: GitHubPullRequest['status']): TaskStatus {
  const statusMap: Record<GitHubPullRequest['status'], TaskStatus> = {
    'open': 'in_progress',
    'merged': 'done',
    'closed': 'cancelled',
    'draft': 'todo',
  };
  return statusMap[status] || 'in_progress';
}

/**
 * Infer priority from PR labels
 */
function inferPriorityFromLabels(labels: string[]): TaskPriority {
  if (labels.some(l => l.includes('critical') || l.includes('urgent') || l.includes('priority:high'))) {
    return 'high';
  }
  if (labels.some(l => l.includes('bug'))) {
    return 'high';
  }
  if (labels.some(l => l.includes('feature'))) {
    return 'medium';
  }
  if (labels.some(l => l.includes('chore') || l.includes('maintenance'))) {
    return 'low';
  }
  return 'medium';
}

/**
 * Transform a GitHub PR to a unified search item
 */
export function transformGitHubPRToSearchItem(pr: GitHubPullRequest): UnifiedSearchItem {
  const author = findEmployeeByName(pr.author.name) || findEmployeeByGitHubUsername(pr.author.username);

  return {
    id: `github-pr-${pr.id}`,
    type: 'github_pr',
    source: 'github',
    title: `#${pr.number}: ${pr.title}`,
    description: pr.description.slice(0, 300) + (pr.description.length > 300 ? '...' : ''),
    content: pr.description,
    excerpt: pr.title,
    url: `/diq/integrations/github/pulls/${pr.number}`,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    author: {
      id: author?.id,
      name: pr.author.name,
      avatar: pr.author.avatar,
      email: author?.email,
    },
    tags: [...pr.labels, 'github', 'pull-request', pr.status],
    metadata: {
      number: pr.number,
      status: pr.status,
      branch: pr.branch,
      commits: pr.commits,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changedFiles,
      reviewers: pr.reviewers,
      checks: pr.checks,
      commentCount: pr.comments.length,
    },
  };
}

/**
 * Transform a GitHub PR to a unified task (for PRs needing review)
 */
export function transformGitHubPRToTask(pr: GitHubPullRequest): UnifiedTask {
  const author = findEmployeeByName(pr.author.name) || findEmployeeByGitHubUsername(pr.author.username);

  return {
    id: `github-task-${pr.id}`,
    source: 'github',
    sourceId: pr.id,
    sourceKey: `#${pr.number}`,
    title: pr.title,
    description: pr.description,
    status: mapGitHubStatus(pr.status),
    priority: inferPriorityFromLabels(pr.labels),
    assignee: {
      id: author?.id,
      name: pr.author.name,
      avatar: pr.author.avatar,
      email: author?.email,
    },
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    labels: pr.labels,
    url: `/diq/integrations/github/pulls/${pr.number}`,
    metadata: {
      prNumber: pr.number,
      branch: pr.branch,
      commits: pr.commits,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changedFiles,
      reviewers: pr.reviewers,
      checks: pr.checks,
    },
    comments: pr.comments,
  };
}

/**
 * Transform a GitHub PR to activity item
 */
export function transformGitHubPRToActivity(
  pr: GitHubPullRequest,
  activityType: 'pr_opened' | 'pr_merged' | 'pr_reviewed' = 'pr_opened'
): UnifiedActivity {
  const author = findEmployeeByName(pr.author.name) || findEmployeeByGitHubUsername(pr.author.username);

  let title: string;
  let description: string;

  switch (activityType) {
    case 'pr_opened':
      title = `Opened PR #${pr.number}: ${pr.title}`;
      description = `${pr.commits} commits, +${pr.additions}/-${pr.deletions}`;
      break;
    case 'pr_merged':
      title = `Merged PR #${pr.number}: ${pr.title}`;
      description = `Merged ${pr.branch.from} into ${pr.branch.to}`;
      break;
    case 'pr_reviewed':
      title = `Reviewed PR #${pr.number}: ${pr.title}`;
      description = `Review submitted on ${pr.changedFiles} files`;
      break;
    default:
      title = `Updated PR #${pr.number}: ${pr.title}`;
      description = `Status: ${pr.status}`;
  }

  return {
    id: `github-activity-${pr.id}-${activityType}`,
    source: 'github',
    type: activityType,
    title,
    description,
    actor: {
      id: author?.id,
      name: pr.author.name,
      avatar: pr.author.avatar,
      email: author?.email,
    },
    target: {
      id: pr.id,
      type: 'github_pr',
      title: `#${pr.number}: ${pr.title}`,
      url: `/diq/integrations/github/pulls/${pr.number}`,
    },
    createdAt: pr.updatedAt,
    metadata: {
      prNumber: pr.number,
      status: pr.status,
      branch: pr.branch,
      additions: pr.additions,
      deletions: pr.deletions,
    },
  };
}

/**
 * Transform all GitHub PRs to search items
 */
export function transformAllGitHubPRsToSearchItems(prs: GitHubPullRequest[]): UnifiedSearchItem[] {
  return prs.map(transformGitHubPRToSearchItem);
}

/**
 * Transform all GitHub PRs to unified tasks
 */
export function transformAllGitHubPRsToTasks(prs: GitHubPullRequest[]): UnifiedTask[] {
  return prs.map(transformGitHubPRToTask);
}

/**
 * Get PRs pending review for a specific user
 */
export function getPRsPendingReviewForUser(prs: GitHubPullRequest[], userName: string): UnifiedTask[] {
  return prs
    .filter(pr =>
      pr.status === 'open' &&
      pr.reviewers.some(r => r.name === userName && r.status === 'pending')
    )
    .map(transformGitHubPRToTask);
}

/**
 * Get open PRs authored by a specific user
 */
export function getOpenPRsForUser(prs: GitHubPullRequest[], userName: string): UnifiedTask[] {
  return prs
    .filter(pr => pr.author.name === userName && pr.status === 'open')
    .map(transformGitHubPRToTask);
}
