/**
 * Conversation State Management
 *
 * Tracks multi-step workflow state for chat sessions.
 * Stores state in memory with session ID mapping.
 */

import { Language } from './i18n';

// In-memory state store (in production, use Redis or database)
const stateStore = new Map<string, ConversationState>();

// State cleanup interval (5 minutes)
const STATE_TTL_MS = 5 * 60 * 1000;

export type WorkflowType = 'appointment' | 'service-request' | null;

export interface AppointmentWorkflowData {
  selectedServiceId?: string;
  selectedServiceName?: string;
  selectedDate?: string;
  selectedTime?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export interface ServiceRequestWorkflowData extends Record<string, unknown> {
  category?: string;
  department?: string;
  description?: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high';
  routingRuleId?: string;
}

export interface ConversationState {
  sessionId: string;
  activeWorkflow: WorkflowType;
  workflowStep: number;
  workflowData: AppointmentWorkflowData | ServiceRequestWorkflowData | Record<string, unknown>;
  lastUpdated: number;
  language: Language;
}

/**
 * Create a new conversation state
 */
export function createState(sessionId: string, language: Language = 'en'): ConversationState {
  const state: ConversationState = {
    sessionId,
    activeWorkflow: null,
    workflowStep: 0,
    workflowData: {},
    lastUpdated: Date.now(),
    language
  };

  stateStore.set(sessionId, state);
  return state;
}

/**
 * Get conversation state by session ID
 */
export function getState(sessionId: string): ConversationState | null {
  const state = stateStore.get(sessionId);

  if (!state) {
    return null;
  }

  // Check if state is expired
  if (Date.now() - state.lastUpdated > STATE_TTL_MS) {
    stateStore.delete(sessionId);
    return null;
  }

  return state;
}

/**
 * Get or create conversation state
 */
export function getOrCreateState(sessionId: string, language: Language = 'en'): ConversationState {
  let state = getState(sessionId);

  if (!state) {
    state = createState(sessionId, language);
  }

  return state;
}

/**
 * Update conversation state
 */
export function updateState(
  sessionId: string,
  updates: Partial<Omit<ConversationState, 'sessionId' | 'lastUpdated'>>
): ConversationState | null {
  const state = getState(sessionId);

  if (!state) {
    return null;
  }

  // Merge updates
  Object.assign(state, updates, { lastUpdated: Date.now() });
  stateStore.set(sessionId, state);

  return state;
}

/**
 * Start a new workflow
 */
export function startWorkflow(
  sessionId: string,
  workflowType: 'appointment' | 'service-request',
  initialData: Record<string, unknown> = {}
): ConversationState {
  const state = getOrCreateState(sessionId);

  state.activeWorkflow = workflowType;
  state.workflowStep = 1;
  state.workflowData = initialData;
  state.lastUpdated = Date.now();

  stateStore.set(sessionId, state);
  return state;
}

/**
 * Advance to next workflow step
 */
export function advanceWorkflow(
  sessionId: string,
  dataUpdates: Record<string, unknown> = {}
): ConversationState | null {
  const state = getState(sessionId);

  if (!state || !state.activeWorkflow) {
    return null;
  }

  state.workflowStep += 1;
  state.workflowData = { ...state.workflowData, ...dataUpdates };
  state.lastUpdated = Date.now();

  stateStore.set(sessionId, state);
  return state;
}

/**
 * Clear active workflow (cancel or complete)
 */
export function clearWorkflow(sessionId: string): ConversationState | null {
  const state = getState(sessionId);

  if (!state) {
    return null;
  }

  state.activeWorkflow = null;
  state.workflowStep = 0;
  state.workflowData = {};
  state.lastUpdated = Date.now();

  stateStore.set(sessionId, state);
  return state;
}

/**
 * Delete session state entirely
 */
export function deleteState(sessionId: string): boolean {
  return stateStore.delete(sessionId);
}

/**
 * Check if user is in an active workflow
 */
export function isInWorkflow(sessionId: string): boolean {
  const state = getState(sessionId);
  return state?.activeWorkflow !== null;
}

/**
 * Get current workflow type
 */
export function getWorkflowType(sessionId: string): WorkflowType {
  const state = getState(sessionId);
  return state?.activeWorkflow || null;
}

/**
 * Get current workflow step
 */
export function getWorkflowStep(sessionId: string): number {
  const state = getState(sessionId);
  return state?.workflowStep || 0;
}

/**
 * Get workflow data
 */
export function getWorkflowData<T extends Record<string, unknown>>(sessionId: string): T | null {
  const state = getState(sessionId);
  return state?.workflowData as T | null;
}

/**
 * Set language preference
 */
export function setLanguage(sessionId: string, language: Language): void {
  const state = getOrCreateState(sessionId, language);
  state.language = language;
  state.lastUpdated = Date.now();
  stateStore.set(sessionId, state);
}

/**
 * Get language preference
 */
export function getLanguage(sessionId: string): Language {
  const state = getState(sessionId);
  return state?.language || 'en';
}

/**
 * Cleanup expired states (call periodically)
 */
export function cleanupExpiredStates(): number {
  let cleaned = 0;
  const now = Date.now();

  for (const [sessionId, state] of stateStore.entries()) {
    if (now - state.lastUpdated > STATE_TTL_MS) {
      stateStore.delete(sessionId);
      cleaned++;
    }
  }

  return cleaned;
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredStates, 60 * 1000);
}

/**
 * Export state store size for monitoring
 */
export function getStateCount(): number {
  return stateStore.size;
}

/**
 * Appointment workflow steps
 */
export const APPOINTMENT_STEPS = {
  SELECT_SERVICE: 1,
  SELECT_DATE: 2,
  SELECT_TIME: 3,
  COLLECT_INFO: 4,
  CONFIRM: 5
} as const;

/**
 * Service request workflow steps
 */
export const SERVICE_REQUEST_STEPS = {
  COLLECT_DETAILS: 1,
  COLLECT_LOCATION: 2,
  CONFIRM: 3
} as const;

/**
 * Get step name for appointment workflow
 */
export function getAppointmentStepName(step: number): string {
  const stepNames: Record<number, string> = {
    1: 'select-service',
    2: 'select-date',
    3: 'select-time',
    4: 'collect-info',
    5: 'confirm'
  };
  return stepNames[step] || 'unknown';
}

/**
 * Get step name for service request workflow
 */
export function getServiceRequestStepName(step: number): string {
  const stepNames: Record<number, string> = {
    1: 'collect-details',
    2: 'collect-location',
    3: 'confirm'
  };
  return stepNames[step] || 'unknown';
}
