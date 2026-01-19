/**
 * Service Request Flow
 *
 * Workflow for submitting service requests through the chatbot.
 * Handles category detection, detail collection, and confirmation.
 */

import { promises as fs } from 'fs';
import path from 'path';
import {
  getOrCreateState,
  advanceWorkflow,
  clearWorkflow,
  startWorkflow,
  SERVICE_REQUEST_STEPS,
  type ServiceRequestWorkflowData,
} from '../conversation-state';
import { ActionButton } from './faq-actions';
import { RoutingRule, matchRoutingRule } from '../workflow-matcher';
import { Language } from '../i18n';

// Types
export interface ServiceRequest {
  id: string;
  category: string;
  department: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  location: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  status: 'submitted' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  slaHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestFlowResponse {
  message: string;
  messageEs?: string;
  actions: ActionButton[];
  workflowState: {
    active: boolean;
    type: 'service-request';
    step: number;
    stepName: string;
  };
  ticketConfirmation?: {
    ticketNumber: string;
    category: string;
    department: string;
    slaHours: number;
  };
}

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
 * Load existing service requests
 */
async function loadServiceRequests(): Promise<ServiceRequest[]> {
  try {
    const filePath = path.join(DATA_DIR, 'service-requests.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save service requests to file
 */
async function saveServiceRequests(requests: ServiceRequest[]): Promise<void> {
  const filePath = path.join(DATA_DIR, 'service-requests.json');
  await fs.writeFile(filePath, JSON.stringify(requests, null, 2), 'utf-8');
}

/**
 * Get active routing categories
 */
export async function getActiveCategories(): Promise<RoutingRule[]> {
  const rules = await loadRoutingRules();
  return rules.filter(r => r.isActive && r.keywords.length > 0);
}

/**
 * Create a new service request
 */
export async function createServiceRequest(
  data: ServiceRequestWorkflowData & { userName?: string; userEmail?: string; userPhone?: string }
): Promise<ServiceRequest | null> {
  if (!data.category || !data.department || !data.description) {
    return null;
  }

  const requests = await loadServiceRequests();

  // Generate new ID
  const now = new Date();
  const year = now.getFullYear();
  const maxId = requests.reduce((max, req) => {
    const match = req.id.match(/SR-\d{4}-(\d+)/);
    if (match) {
      return Math.max(max, parseInt(match[1], 10));
    }
    return max;
  }, 0);

  const newRequest: ServiceRequest = {
    id: `SR-${year}-${(maxId + 1).toString().padStart(5, '0')}`,
    category: data.category,
    department: data.department,
    priority: data.priority || 'medium',
    description: data.description,
    location: data.location || '',
    userName: data.userName,
    userEmail: data.userEmail,
    userPhone: data.userPhone,
    status: 'submitted',
    slaHours: getSLAHours(data.priority || 'medium'),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  requests.push(newRequest);
  await saveServiceRequests(requests);

  return newRequest;
}

/**
 * Get SLA hours based on priority
 */
function getSLAHours(priority: 'low' | 'medium' | 'high'): number {
  switch (priority) {
    case 'high': return 24;
    case 'medium': return 48;
    case 'low': return 72;
    default: return 48;
  }
}

/**
 * Get human-readable SLA message
 */
function getSLAMessage(hours: number, language: Language): string {
  if (hours <= 24) {
    return language === 'es' ? 'dentro de 24 horas' : 'within 24 hours';
  } else if (hours <= 48) {
    return language === 'es' ? 'dentro de 48 horas' : 'within 48 hours';
  } else {
    return language === 'es' ? `dentro de ${hours} horas` : `within ${hours} hours`;
  }
}

/**
 * Start the service request flow
 */
export async function startServiceRequestFlow(
  sessionId: string,
  language: Language = 'en',
  predetectedCategory?: { rule: RoutingRule; initialMessage?: string }
): Promise<ServiceRequestFlowResponse> {
  // Start workflow with optional pre-detected category
  const initialData: ServiceRequestWorkflowData = {};

  if (predetectedCategory) {
    initialData.category = predetectedCategory.rule.name;
    initialData.department = predetectedCategory.rule.targetDepartment;
    initialData.priority = predetectedCategory.rule.priority;
    initialData.routingRuleId = predetectedCategory.rule.id;
    if (predetectedCategory.initialMessage) {
      initialData.description = predetectedCategory.initialMessage;
    }
  }

  startWorkflow(sessionId, 'service-request', initialData);

  // If category is pre-detected with description, go straight to location
  if (predetectedCategory && predetectedCategory.initialMessage) {
    advanceWorkflow(sessionId, {});
    return promptForLocation(sessionId, predetectedCategory.rule, language);
  }

  // If category is pre-detected, prompt for details
  if (predetectedCategory) {
    return promptForDetails(sessionId, predetectedCategory.rule, language);
  }

  // Show category selection
  const categories = await getActiveCategories();

  if (categories.length === 0) {
    clearWorkflow(sessionId);
    return {
      message: 'Sorry, service request submission is currently unavailable. Please contact us directly.',
      messageEs: 'Lo sentimos, el envío de solicitudes de servicio no está disponible actualmente. Por favor contáctenos directamente.',
      actions: [],
      workflowState: {
        active: false,
        type: 'service-request',
        step: 0,
        stepName: 'none'
      }
    };
  }

  const isSpanish = language === 'es';
  const actions: ActionButton[] = categories.slice(0, 5).map(rule => ({
    type: 'select-option',
    label: rule.name,
    data: { command: '__SELECT_OPTION__', value: rule.id },
    variant: 'primary'
  }));

  actions.push({
    type: 'cancel',
    label: isSpanish ? 'Cancelar' : 'Cancel',
    data: { command: '__CANCEL_WORKFLOW__' },
    variant: 'outline'
  });

  return {
    message: 'I can help you submit a service request. What type of issue would you like to report?',
    messageEs: '¿Puedo ayudarte a enviar una solicitud de servicio. ¿Qué tipo de problema deseas reportar?',
    actions,
    workflowState: {
      active: true,
      type: 'service-request',
      step: SERVICE_REQUEST_STEPS.COLLECT_DETAILS,
      stepName: 'select-category'
    }
  };
}

/**
 * Prompt for issue details
 */
function promptForDetails(
  sessionId: string,
  rule: RoutingRule,
  language: Language
): ServiceRequestFlowResponse {
  const isSpanish = language === 'es';

  return {
    message: `I'll route your request to **${rule.targetDepartment}**. Please describe the issue in detail:`,
    messageEs: `Dirigiré tu solicitud a **${rule.targetDepartment}**. Por favor describe el problema en detalle:`,
    actions: [
      {
        type: 'cancel',
        label: isSpanish ? 'Cancelar' : 'Cancel',
        data: { command: '__CANCEL_WORKFLOW__' },
        variant: 'outline'
      }
    ],
    workflowState: {
      active: true,
      type: 'service-request',
      step: SERVICE_REQUEST_STEPS.COLLECT_DETAILS,
      stepName: 'collect-details'
    }
  };
}

/**
 * Prompt for location
 */
function promptForLocation(
  sessionId: string,
  rule: RoutingRule,
  language: Language
): ServiceRequestFlowResponse {
  const isSpanish = language === 'es';

  return {
    message: 'Thank you. Please provide the location or address where this issue is occurring:',
    messageEs: 'Gracias. Por favor proporciona la ubicación o dirección donde ocurre este problema:',
    actions: [
      {
        type: 'select-option',
        label: isSpanish ? 'Omitir ubicación' : 'Skip location',
        data: { command: '__SELECT_OPTION__', value: 'skip-location' },
        variant: 'outline'
      },
      {
        type: 'cancel',
        label: isSpanish ? 'Cancelar' : 'Cancel',
        data: { command: '__CANCEL_WORKFLOW__' },
        variant: 'outline'
      }
    ],
    workflowState: {
      active: true,
      type: 'service-request',
      step: SERVICE_REQUEST_STEPS.COLLECT_LOCATION,
      stepName: 'collect-location'
    }
  };
}

/**
 * Handle category selection
 */
export async function handleCategorySelection(
  sessionId: string,
  ruleId: string,
  language: Language = 'en'
): Promise<ServiceRequestFlowResponse> {
  const rules = await loadRoutingRules();
  const rule = rules.find(r => r.id === ruleId);

  if (!rule) {
    return {
      message: 'Sorry, that category is not available. Please try again.',
      messageEs: 'Lo sentimos, esa categoría no está disponible. Por favor intenta de nuevo.',
      actions: [],
      workflowState: {
        active: true,
        type: 'service-request',
        step: SERVICE_REQUEST_STEPS.COLLECT_DETAILS,
        stepName: 'select-category'
      }
    };
  }

  // Update workflow data
  advanceWorkflow(sessionId, {
    category: rule.name,
    department: rule.targetDepartment,
    priority: rule.priority,
    routingRuleId: rule.id
  });

  return promptForDetails(sessionId, rule, language);
}

/**
 * Handle details submission
 */
export async function handleDetailsSubmission(
  sessionId: string,
  description: string,
  language: Language = 'en'
): Promise<ServiceRequestFlowResponse> {
  // Update workflow with description
  advanceWorkflow(sessionId, { description });

  const state = getOrCreateState(sessionId, language);
  const data = state.workflowData as ServiceRequestWorkflowData;

  const rules = await loadRoutingRules();
  const rule = rules.find(r => r.id === data.routingRuleId);

  return promptForLocation(sessionId, rule || rules[0], language);
}

/**
 * Handle location submission or skip
 */
export async function handleLocationSubmission(
  sessionId: string,
  location: string,
  language: Language = 'en'
): Promise<ServiceRequestFlowResponse> {
  // Update workflow with location
  const actualLocation = location === 'skip-location' ? '' : location;
  advanceWorkflow(sessionId, { location: actualLocation });

  // Show confirmation
  const state = getOrCreateState(sessionId, language);
  const data = state.workflowData as ServiceRequestWorkflowData;

  const isSpanish = language === 'es';

  return {
    message: `Please confirm your service request:\n\n**Category:** ${data.category}\n**Department:** ${data.department}\n**Priority:** ${data.priority?.charAt(0).toUpperCase()}${data.priority?.slice(1)}\n**Description:** ${data.description}\n**Location:** ${data.location || 'Not specified'}`,
    messageEs: `Por favor confirma tu solicitud de servicio:\n\n**Categoría:** ${data.category}\n**Departamento:** ${data.department}\n**Prioridad:** ${data.priority === 'high' ? 'Alta' : data.priority === 'medium' ? 'Media' : 'Baja'}\n**Descripción:** ${data.description}\n**Ubicación:** ${data.location || 'No especificada'}`,
    actions: [
      {
        type: 'confirm',
        label: isSpanish ? 'Enviar Solicitud' : 'Submit Request',
        data: { command: '__SELECT_OPTION__', value: 'confirm' },
        variant: 'primary'
      },
      {
        type: 'cancel',
        label: isSpanish ? 'Cancelar' : 'Cancel',
        data: { command: '__CANCEL_WORKFLOW__' },
        variant: 'outline'
      }
    ],
    workflowState: {
      active: true,
      type: 'service-request',
      step: SERVICE_REQUEST_STEPS.CONFIRM,
      stepName: 'confirm'
    }
  };
}

/**
 * Confirm and create the service request
 */
export async function confirmServiceRequest(
  sessionId: string,
  language: Language = 'en'
): Promise<ServiceRequestFlowResponse> {
  const state = getOrCreateState(sessionId, language);
  const data = state.workflowData as ServiceRequestWorkflowData;

  // Create the service request
  const request = await createServiceRequest(data);

  // Clear the workflow
  clearWorkflow(sessionId);

  if (!request) {
    return {
      message: 'Sorry, there was an error submitting your request. Please try again or contact us directly.',
      messageEs: 'Lo sentimos, hubo un error al enviar tu solicitud. Por favor intenta de nuevo o contáctanos directamente.',
      actions: [
        {
          type: 'select-option',
          label: language === 'es' ? 'Intentar de nuevo' : 'Try again',
          data: { command: '__START_SERVICE_REQUEST__' },
          variant: 'primary'
        }
      ],
      workflowState: {
        active: false,
        type: 'service-request',
        step: 0,
        stepName: 'none'
      }
    };
  }

  const slaMessage = getSLAMessage(request.slaHours, language);

  return {
    message: `**Your service request has been submitted!**\n\n**Ticket #:** ${request.id}\n**Category:** ${request.category}\n**Department:** ${request.department}\n**Expected Response:** ${slaMessage}\n\nYou can reference this ticket number for follow-up. Is there anything else I can help you with?`,
    messageEs: `**¡Tu solicitud de servicio ha sido enviada!**\n\n**Ticket #:** ${request.id}\n**Categoría:** ${request.category}\n**Departamento:** ${request.department}\n**Respuesta Esperada:** ${slaMessage}\n\nPuedes usar este número de ticket para seguimiento. ¿Hay algo más en lo que pueda ayudarte?`,
    actions: [],
    workflowState: {
      active: false,
      type: 'service-request',
      step: 0,
      stepName: 'completed'
    },
    ticketConfirmation: {
      ticketNumber: request.id,
      category: request.category,
      department: request.department,
      slaHours: request.slaHours
    }
  };
}

/**
 * Cancel the service request workflow
 */
export function cancelServiceRequestFlow(
  sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: Language = 'en'
): ServiceRequestFlowResponse {
  clearWorkflow(sessionId);

  return {
    message: 'Service request cancelled. Is there anything else I can help you with?',
    messageEs: 'Solicitud de servicio cancelada. ¿Hay algo más en lo que pueda ayudarte?',
    actions: [],
    workflowState: {
      active: false,
      type: 'service-request',
      step: 0,
      stepName: 'cancelled'
    }
  };
}

/**
 * Process service request workflow step based on current state
 */
export async function processServiceRequestStep(
  sessionId: string,
  message: string,
  language: Language = 'en'
): Promise<ServiceRequestFlowResponse> {
  const state = getOrCreateState(sessionId, language);
  const data = state.workflowData as ServiceRequestWorkflowData;

  switch (state.workflowStep) {
    case SERVICE_REQUEST_STEPS.COLLECT_DETAILS:
      // If we have a category but no description, this is the description
      if (data.category && !data.description) {
        return handleDetailsSubmission(sessionId, message, language);
      }
      // Otherwise, try to detect category from message
      const rule = await matchRoutingRule(message);
      if (rule) {
        return startServiceRequestFlow(sessionId, language, { rule, initialMessage: message });
      }
      return startServiceRequestFlow(sessionId, language);

    case SERVICE_REQUEST_STEPS.COLLECT_LOCATION:
      return handleLocationSubmission(sessionId, message, language);

    case SERVICE_REQUEST_STEPS.CONFIRM:
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('confirm') || lowerMessage.includes('yes') ||
          lowerMessage.includes('submit') || lowerMessage.includes('confirmar') ||
          lowerMessage.includes('sí') || lowerMessage.includes('enviar')) {
        return confirmServiceRequest(sessionId, language);
      }
      // Show confirmation again
      return handleLocationSubmission(sessionId, data.location || '', language);

    default:
      return startServiceRequestFlow(sessionId, language);
  }
}
