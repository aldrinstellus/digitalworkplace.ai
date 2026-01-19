/**
 * Workflow Matcher - Intent Detection & Matching
 *
 * This module detects user intent from chat messages and matches them
 * to configured workflows (appointments, service routing, FAQ actions).
 */

import { promises as fs } from 'fs';
import path from 'path';

// Types
export interface WorkflowIntent {
  type: 'appointment' | 'service-request' | 'faq-action';
  confidence: number;
  matchedKeywords: string[];
  data?: Record<string, unknown>;
}

export interface RoutingRule {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  targetDepartment: string;
  priority: 'low' | 'medium' | 'high';
  slaHours: number;
  autoAssign: boolean;
  isActive: boolean;
}

export interface AppointmentConfig {
  id: string;
  department: string;
  serviceName: string;
  description: string;
  duration: number;
  availableDays: string[];
  timeSlots: Array<{ start: string; end: string }>;
  maxPerSlot: number;
  leadTimeHours: number;
  isActive: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  workflowAction?: {
    type: 'appointment' | 'service-request' | 'external-link';
    buttonLabel: string;
    configId?: string;
    externalUrl?: string;
  };
}

// Appointment intent keywords (EN/ES)
const APPOINTMENT_KEYWORDS = [
  // English
  'schedule', 'book', 'appointment', 'meeting', 'reserve', 'reservation',
  'set up', 'arrange', 'plan', 'slot', 'time slot', 'available times',
  'when can i', 'make an appointment', 'book a time',
  // Spanish
  'cita', 'agendar', 'programar', 'reservar', 'reservación', 'horario',
  'disponible', 'hacer una cita', 'sacar cita'
];

// Informational phrases that should NOT trigger appointment workflow
// These indicate user is asking FOR INFORMATION about meetings, not TO BOOK one
const APPOINTMENT_EXCLUSION_PHRASES = [
  // City Council related
  'city council', 'council meeting', 'council schedule', 'council agenda',
  'next meeting', 'meeting agenda', 'public meeting', 'meeting schedule',
  'when is the', 'where can i find', 'what is the schedule',
  // Spanish equivalents
  'concejo municipal', 'reunión del concejo', 'agenda del concejo',
  'próxima reunión', 'agenda de la reunión', 'reunión pública'
];

// Service request intent keywords (EN/ES)
const SERVICE_REQUEST_KEYWORDS = [
  // English
  'report', 'complaint', 'problem', 'issue', 'broken', 'damaged',
  'need help', 'fix', 'repair', 'submit', 'request', 'file a',
  // Spanish
  'reportar', 'queja', 'problema', 'roto', 'dañado', 'reparar',
  'solicitud', 'arreglar', 'ayuda'
];

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Load routing rules from JSON file
 */
async function loadRoutingRules(): Promise<RoutingRule[]> {
  try {
    const filePath = path.join(DATA_DIR, 'workflow-routing.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    console.error('Failed to load routing rules');
    return [];
  }
}

/**
 * Load appointment configurations from JSON file
 */
async function loadAppointmentConfigs(): Promise<AppointmentConfig[]> {
  try {
    const filePath = path.join(DATA_DIR, 'appointment-config.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    console.error('Failed to load appointment configs');
    return [];
  }
}

/**
 * Load FAQs from JSON file
 */
async function loadFAQs(): Promise<FAQ[]> {
  try {
    const filePath = path.join(DATA_DIR, 'faqs.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    console.error('Failed to load FAQs');
    return [];
  }
}

/**
 * Normalize text for matching (lowercase, remove punctuation)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if message contains any keywords from a list
 */
function findMatchingKeywords(message: string, keywords: string[]): string[] {
  const normalizedMessage = normalizeText(message);
  return keywords.filter(keyword => {
    const normalizedKeyword = normalizeText(keyword);
    return normalizedMessage.includes(normalizedKeyword);
  });
}

/**
 * Detect if the user wants to book an appointment
 */
export function detectAppointmentIntent(message: string): WorkflowIntent | null {
  // First check for exclusion phrases - if found, this is an informational query, not appointment booking
  const exclusionMatches = findMatchingKeywords(message, APPOINTMENT_EXCLUSION_PHRASES);
  if (exclusionMatches.length > 0) {
    // User is asking about meeting information, not trying to book
    return null;
  }

  const matchedKeywords = findMatchingKeywords(message, APPOINTMENT_KEYWORDS);

  if (matchedKeywords.length === 0) {
    return null;
  }

  // Calculate confidence based on number of matched keywords
  const confidence = Math.min(matchedKeywords.length * 0.3 + 0.3, 1.0);

  return {
    type: 'appointment',
    confidence,
    matchedKeywords
  };
}

/**
 * Detect if the user wants to submit a service request
 */
export function detectServiceRequestIntent(message: string): WorkflowIntent | null {
  const matchedKeywords = findMatchingKeywords(message, SERVICE_REQUEST_KEYWORDS);

  if (matchedKeywords.length === 0) {
    return null;
  }

  const confidence = Math.min(matchedKeywords.length * 0.25 + 0.25, 1.0);

  return {
    type: 'service-request',
    confidence,
    matchedKeywords
  };
}

/**
 * Match message to a routing rule based on keywords
 */
export async function matchRoutingRule(message: string): Promise<RoutingRule | null> {
  const rules = await loadRoutingRules();
  const activeRules = rules.filter(r => r.isActive);
  const normalizedMessage = normalizeText(message);

  let bestMatch: { rule: RoutingRule; score: number } | null = null;

  for (const rule of activeRules) {
    if (rule.keywords.length === 0) continue; // Skip catch-all rule

    const matchedKeywords = findMatchingKeywords(normalizedMessage, rule.keywords);
    const score = matchedKeywords.length;

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { rule, score };
    }
  }

  return bestMatch?.rule || null;
}

/**
 * Find FAQ that best matches the user's message
 * Returns FAQ with workflow action if available
 */
export async function matchFAQWithAction(message: string): Promise<FAQ | null> {
  const faqs = await loadFAQs();
  const activeFAQs = faqs.filter(f => f.isActive && f.workflowAction);
  const normalizedMessage = normalizeText(message);

  let bestMatch: { faq: FAQ; score: number } | null = null;

  for (const faq of activeFAQs) {
    // Check question similarity
    const normalizedQuestion = normalizeText(faq.question);
    const questionWords = normalizedQuestion.split(' ').filter(w => w.length > 2);
    const messageWords = normalizedMessage.split(' ').filter(w => w.length > 2);

    // Count matching words
    const matchCount = questionWords.filter(word =>
      messageWords.some(mw => mw.includes(word) || word.includes(mw))
    ).length;

    const score = matchCount / Math.max(questionWords.length, 1);

    if (score > 0.3 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { faq, score };
    }
  }

  return bestMatch?.faq || null;
}

/**
 * Get available appointment services
 */
export async function getActiveAppointmentServices(): Promise<AppointmentConfig[]> {
  const configs = await loadAppointmentConfigs();
  return configs.filter(c => c.isActive);
}

/**
 * Main workflow detection function
 * Analyzes message and returns the most likely workflow intent
 */
export async function detectWorkflowIntent(message: string): Promise<WorkflowIntent | null> {
  // Check for explicit appointment intent
  const appointmentIntent = detectAppointmentIntent(message);

  // Check for service request intent with routing rule match
  const serviceIntent = detectServiceRequestIntent(message);
  const routingRule = await matchRoutingRule(message);

  // Check for FAQ with action
  const faqMatch = await matchFAQWithAction(message);

  // Prioritize based on confidence and specificity
  const candidates: Array<WorkflowIntent & { priority: number }> = [];

  if (appointmentIntent && appointmentIntent.confidence > 0.4) {
    candidates.push({
      ...appointmentIntent,
      priority: appointmentIntent.confidence * 1.2 // Slight boost for explicit appointment intent
    });
  }

  if (serviceIntent && routingRule) {
    candidates.push({
      type: 'service-request',
      confidence: serviceIntent.confidence,
      matchedKeywords: serviceIntent.matchedKeywords,
      data: {
        routingRule: {
          id: routingRule.id,
          name: routingRule.name,
          department: routingRule.targetDepartment,
          priority: routingRule.priority,
          slaHours: routingRule.slaHours
        }
      },
      priority: serviceIntent.confidence * 1.1
    });
  }

  if (faqMatch && faqMatch.workflowAction) {
    candidates.push({
      type: 'faq-action',
      confidence: 0.7, // FAQ matches have moderate confidence
      matchedKeywords: [],
      data: {
        faqId: faqMatch.id,
        question: faqMatch.question,
        answer: faqMatch.answer,
        workflowAction: faqMatch.workflowAction
      },
      priority: 0.8
    });
  }

  // Return highest priority match
  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const best = candidates[0];

  // Remove the priority field before returning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { priority, ...intent } = best;
  return intent;
}

/**
 * Check if message is a special workflow command
 */
export function isWorkflowCommand(message: string): { command: string; payload?: string } | null {
  const trimmed = message.trim();

  if (trimmed === '__START_APPOINTMENT__') {
    return { command: 'start-appointment' };
  }

  if (trimmed === '__START_SERVICE_REQUEST__') {
    return { command: 'start-service-request' };
  }

  if (trimmed.startsWith('__SELECT_SERVICE__:')) {
    return { command: 'select-service', payload: trimmed.replace('__SELECT_SERVICE__:', '') };
  }

  if (trimmed.startsWith('__SELECT_DATE__:')) {
    return { command: 'select-date', payload: trimmed.replace('__SELECT_DATE__:', '') };
  }

  if (trimmed.startsWith('__SELECT_TIME__:')) {
    return { command: 'select-time', payload: trimmed.replace('__SELECT_TIME__:', '') };
  }

  if (trimmed === '__CANCEL_WORKFLOW__') {
    return { command: 'cancel-workflow' };
  }

  if (trimmed.startsWith('__SELECT_OPTION__:')) {
    return { command: 'select-option', payload: trimmed.replace('__SELECT_OPTION__:', '') };
  }

  return null;
}
