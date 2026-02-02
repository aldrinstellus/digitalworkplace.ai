/**
 * Salesforce Data Transformer
 *
 * Transforms Salesforce opportunities into unified dIQ types.
 */

import type { SalesforceOpportunity } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedActivity } from '../unifiedTypes';
import { findEmployeeByName } from '../crossReferences';

/**
 * Format currency amount
 */
function formatAmount(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

/**
 * Get stage color/emoji
 */
function getStageIndicator(stage: SalesforceOpportunity['stage']): string {
  const indicators: Record<SalesforceOpportunity['stage'], string> = {
    'prospecting': '🔵',
    'qualification': '🟡',
    'proposal': '🟠',
    'negotiation': '🟣',
    'closed-won': '✅',
    'closed-lost': '❌',
  };
  return indicators[stage] || '⚪';
}

/**
 * Transform a Salesforce opportunity to a unified search item
 */
export function transformSalesforceOppToSearchItem(opp: SalesforceOpportunity): UnifiedSearchItem {
  const owner = findEmployeeByName(opp.owner.name);

  return {
    id: `salesforce-${opp.id}`,
    type: 'salesforce_opp',
    source: 'salesforce',
    title: opp.name,
    description: `${getStageIndicator(opp.stage)} ${opp.account} • ${formatAmount(opp.amount)} • ${opp.probability}% probability`,
    content: `${opp.name} ${opp.account} ${opp.stage} ${opp.nextStep} ${opp.lastActivity}`,
    excerpt: `${formatAmount(opp.amount)} - ${opp.stage}`,
    url: `/diq/integrations/salesforce/opportunities/${opp.id}`,
    createdAt: opp.closeDate,
    updatedAt: opp.lastActivity,
    author: {
      id: owner?.id,
      name: opp.owner.name,
      avatar: opp.owner.avatar,
      email: owner?.email,
    },
    tags: ['salesforce', 'opportunity', opp.stage, opp.account],
    metadata: {
      account: opp.account,
      stage: opp.stage,
      amount: opp.amount,
      probability: opp.probability,
      closeDate: opp.closeDate,
      nextStep: opp.nextStep,
      lastActivity: opp.lastActivity,
    },
  };
}

/**
 * Transform a Salesforce deal close to activity
 */
export function transformSalesforceOppToActivity(opp: SalesforceOpportunity): UnifiedActivity {
  const owner = findEmployeeByName(opp.owner.name);

  const activityType: UnifiedActivity['type'] = 'deal_closed';
  let title: string;
  let description: string;

  if (opp.stage === 'closed-won') {
    title = `🎉 Won: ${opp.name}`;
    description = `${formatAmount(opp.amount)} deal closed with ${opp.account}`;
  } else if (opp.stage === 'closed-lost') {
    title = `Lost: ${opp.name}`;
    description = `${formatAmount(opp.amount)} opportunity with ${opp.account}`;
  } else {
    title = `Updated: ${opp.name}`;
    description = `${opp.stage} - ${opp.nextStep}`;
  }

  return {
    id: `salesforce-activity-${opp.id}`,
    source: 'salesforce',
    type: activityType,
    title,
    description,
    actor: {
      id: owner?.id,
      name: opp.owner.name,
      avatar: opp.owner.avatar,
      email: owner?.email,
    },
    target: {
      id: opp.id,
      type: 'salesforce_opp',
      title: opp.name,
      url: `/diq/integrations/salesforce/opportunities/${opp.id}`,
    },
    createdAt: opp.lastActivity,
    metadata: {
      account: opp.account,
      stage: opp.stage,
      amount: opp.amount,
      probability: opp.probability,
    },
  };
}

/**
 * Transform all Salesforce opportunities to search items
 */
export function transformAllSalesforceOppsToSearchItems(opps: SalesforceOpportunity[]): UnifiedSearchItem[] {
  return opps.map(transformSalesforceOppToSearchItem);
}

/**
 * Get open opportunities for a user
 */
export function getOpenOpportunitiesForUser(opps: SalesforceOpportunity[], userName: string): UnifiedSearchItem[] {
  return opps
    .filter(o =>
      o.owner.name === userName &&
      !o.stage.includes('closed')
    )
    .map(transformSalesforceOppToSearchItem);
}

/**
 * Calculate pipeline value for a user
 */
export function getPipelineValueForUser(opps: SalesforceOpportunity[], userName: string): number {
  return opps
    .filter(o => o.owner.name === userName && !o.stage.includes('closed'))
    .reduce((sum, o) => sum + (o.amount * o.probability / 100), 0);
}
