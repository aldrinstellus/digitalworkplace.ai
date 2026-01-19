/**
 * FAQ Actions Processing
 *
 * When a FAQ matches a user's question and has an associated workflow action,
 * this module generates the appropriate action buttons for the response.
 */

import { FAQ } from '../workflow-matcher';
import { Language } from '../i18n';

// Action button types that can be rendered in the chat widget
export interface ActionButton {
  type: 'start-appointment' | 'start-service-request' | 'link' | 'select-option' | 'confirm' | 'cancel';
  label: string;
  labelEs?: string; // Spanish label
  labelHt?: string; // Haitian Creole label
  data?: Record<string, unknown>;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface FAQActionResult {
  faqId: string;
  answer: string;
  answerEs?: string;
  actions: ActionButton[];
}

/**
 * Process a matched FAQ and generate action buttons
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function processFAQAction(faq: FAQ, _language: Language = 'en'): FAQActionResult | null {
  if (!faq.workflowAction) {
    return null;
  }

  const actions: ActionButton[] = [];

  switch (faq.workflowAction.type) {
    case 'appointment':
      actions.push({
        type: 'start-appointment',
        label: faq.workflowAction.buttonLabel || 'Book Appointment',
        labelEs: 'Agendar Cita',
        labelHt: 'Pran Randevou',
        data: faq.workflowAction.configId ? { configId: faq.workflowAction.configId } : undefined,
        variant: 'primary'
      });
      break;

    case 'service-request':
      actions.push({
        type: 'start-service-request',
        label: faq.workflowAction.buttonLabel || 'Submit Request',
        labelEs: 'Enviar Solicitud',
        labelHt: 'Voye Demann',
        variant: 'primary'
      });
      break;

    case 'external-link':
      if (faq.workflowAction.externalUrl) {
        actions.push({
          type: 'link',
          label: faq.workflowAction.buttonLabel || 'Learn More',
          labelEs: 'Más Información',
          labelHt: 'Aprann Plis',
          data: { url: faq.workflowAction.externalUrl },
          variant: 'secondary'
        });
      }
      break;
  }

  // Return null if no actions were generated
  if (actions.length === 0) {
    return null;
  }

  return {
    faqId: faq.id,
    answer: faq.answer,
    actions
  };
}

/**
 * Check if a FAQ has a workflow action
 */
export function faqHasAction(faq: FAQ): boolean {
  return !!faq.workflowAction && !!faq.workflowAction.type;
}

/**
 * Get the action type for a FAQ
 */
export function getFAQActionType(faq: FAQ): string | null {
  return faq.workflowAction?.type || null;
}

/**
 * Create a generic "helpful links" action set
 * Used when the answer references external resources
 */
export function createHelpfulLinksActions(links: Array<{ label: string; url: string }>): ActionButton[] {
  return links.map(link => ({
    type: 'link' as const,
    label: link.label,
    data: { url: link.url },
    variant: 'outline' as const
  }));
}

/**
 * Create follow-up action buttons after answering a question
 */
export function createFollowUpActions(language: Language = 'en'): ActionButton[] {
  const isSpanish = language === 'es';

  return [
    {
      type: 'start-appointment',
      label: isSpanish ? 'Agendar Cita' : 'Book Appointment',
      variant: 'outline'
    },
    {
      type: 'start-service-request',
      label: isSpanish ? 'Hacer una Solicitud' : 'Submit a Request',
      variant: 'outline'
    }
  ];
}

/**
 * Bilingual button labels
 */
export const BUTTON_LABELS = {
  bookAppointment: {
    en: 'Book Appointment',
    es: 'Agendar Cita',
    ht: 'Pran Randevou'
  },
  submitRequest: {
    en: 'Submit Request',
    es: 'Enviar Solicitud',
    ht: 'Voye Demann'
  },
  learnMore: {
    en: 'Learn More',
    es: 'Más Información',
    ht: 'Aprann Plis'
  },
  cancel: {
    en: 'Cancel',
    es: 'Cancelar',
    ht: 'Anile'
  },
  confirm: {
    en: 'Confirm',
    es: 'Confirmar',
    ht: 'Konfime'
  },
  goBack: {
    en: 'Go Back',
    es: 'Volver',
    ht: 'Tounen'
  },
  startOver: {
    en: 'Start Over',
    es: 'Comenzar de Nuevo',
    ht: 'Rekòmanse'
  },
  payOnline: {
    en: 'Pay Online',
    es: 'Pagar en Línea',
    ht: 'Peye Sou Entènèt'
  },
  viewSchedule: {
    en: 'View Schedule',
    es: 'Ver Horario',
    ht: 'Gade Orè'
  },
  contactUs: {
    en: 'Contact Us',
    es: 'Contáctenos',
    ht: 'Kontakte Nou'
  }
} as const;

/**
 * Get localized button label
 */
export function getButtonLabel(
  key: keyof typeof BUTTON_LABELS,
  language: Language = 'en'
): string {
  return BUTTON_LABELS[key][language];
}

/**
 * Serialize action buttons for JSON response
 */
export function serializeActions(actions: ActionButton[]): object[] {
  return actions.map(action => ({
    type: action.type,
    label: action.label,
    labelEs: action.labelEs,
    labelHt: action.labelHt,
    data: action.data,
    variant: action.variant || 'primary'
  }));
}
