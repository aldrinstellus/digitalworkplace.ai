/**
 * Appointment Booking Flow
 *
 * Multi-step workflow for booking appointments through the chatbot.
 * Handles service selection, date/time picking, and confirmation.
 */

import { promises as fs } from 'fs';
import path from 'path';
import {
  getOrCreateState,
  advanceWorkflow,
  clearWorkflow,
  startWorkflow,
  APPOINTMENT_STEPS,
  type AppointmentWorkflowData,
} from '../conversation-state';
import { ActionButton } from './faq-actions';
import { AppointmentConfig } from '../workflow-matcher';
import { Language } from '../i18n';

// Types
export interface Appointment {
  id: string;
  configId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  timeSlot: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
  notes: string;
  createdAt: string;
}

export interface AppointmentFlowResponse {
  message: string;
  messageEs?: string;
  actions: ActionButton[];
  workflowState: {
    active: boolean;
    type: 'appointment';
    step: number;
    stepName: string;
  };
  appointmentConfirmation?: {
    id: string;
    serviceName: string;
    date: string;
    time: string;
  };
}

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Load appointment configurations
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
 * Load existing appointments
 */
async function loadAppointments(): Promise<Appointment[]> {
  try {
    const filePath = path.join(DATA_DIR, 'appointments.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save appointments to file
 */
async function saveAppointments(appointments: Appointment[]): Promise<void> {
  const filePath = path.join(DATA_DIR, 'appointments.json');
  await fs.writeFile(filePath, JSON.stringify(appointments, null, 2), 'utf-8');
}

/**
 * Get available services (active appointment configs)
 */
export async function getAvailableServices(): Promise<AppointmentConfig[]> {
  const configs = await loadAppointmentConfigs();
  return configs.filter(c => c.isActive);
}

/**
 * Get available dates for a service (next 14 days, excluding unavailable days)
 */
export async function getAvailableDates(serviceId: string): Promise<string[]> {
  const configs = await loadAppointmentConfigs();
  const config = configs.find(c => c.id === serviceId);

  if (!config || !config.isActive) {
    return [];
  }

  const dates: string[] = [];
  const today = new Date();
  const leadTime = config.leadTimeHours || 24;

  // Start from tomorrow if lead time requires it
  const startDate = new Date(today);
  startDate.setHours(startDate.getHours() + leadTime);
  startDate.setHours(0, 0, 0, 0);

  // Look ahead 14 days
  for (let i = 0; i < 14 && dates.length < 7; i++) {
    const checkDate = new Date(startDate);
    checkDate.setDate(checkDate.getDate() + i);

    const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    if (config.availableDays.includes(dayName)) {
      dates.push(checkDate.toISOString().split('T')[0]);
    }
  }

  return dates;
}

/**
 * Get available time slots for a service on a specific date
 */
export async function getAvailableSlots(serviceId: string, date: string): Promise<string[]> {
  const configs = await loadAppointmentConfigs();
  const config = configs.find(c => c.id === serviceId);

  if (!config || !config.isActive) {
    return [];
  }

  const appointments = await loadAppointments();
  const duration = config.duration || 30;
  const maxPerSlot = config.maxPerSlot || 1;

  // Count existing appointments per slot
  const bookedSlots: Record<string, number> = {};
  for (const apt of appointments) {
    if (apt.configId === serviceId && apt.date === date && apt.status !== 'cancelled') {
      bookedSlots[apt.timeSlot] = (bookedSlots[apt.timeSlot] || 0) + 1;
    }
  }

  // Generate all possible slots
  const availableSlots: string[] = [];

  for (const range of config.timeSlots) {
    const [startHour, startMin] = range.start.split(':').map(Number);
    const [endHour, endMin] = range.end.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + duration <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      const slot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      const booked = bookedSlots[slot] || 0;
      if (booked < maxPerSlot) {
        availableSlots.push(slot);
      }

      currentMinutes += duration;
    }
  }

  return availableSlots;
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  data: AppointmentWorkflowData
): Promise<Appointment | null> {
  if (!data.selectedServiceId || !data.selectedDate || !data.selectedTime ||
      !data.userName || !data.userEmail) {
    return null;
  }

  const appointments = await loadAppointments();

  // Generate new ID
  const maxId = appointments.reduce((max, apt) => {
    const num = parseInt(apt.id.replace('book-', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);

  const newAppointment: Appointment = {
    id: `book-${(maxId + 1).toString().padStart(3, '0')}`,
    configId: data.selectedServiceId,
    userName: data.userName,
    userEmail: data.userEmail,
    userPhone: data.userPhone || '',
    date: data.selectedDate,
    timeSlot: data.selectedTime,
    status: 'confirmed',
    reason: '',
    notes: 'Booked via chatbot',
    createdAt: new Date().toISOString()
  };

  appointments.push(newAppointment);
  await saveAppointments(appointments);

  return newAppointment;
}

/**
 * Format date for display
 */
function formatDate(dateStr: string, language: Language): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time for display
 */
function formatTime(timeStr: string): string {
  const [hour, minute] = timeStr.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

/**
 * Start the appointment booking flow
 */
export async function startAppointmentFlow(
  sessionId: string,
  language: Language = 'en',
  preselectedServiceId?: string
): Promise<AppointmentFlowResponse> {
  // Start or reset workflow
  startWorkflow(sessionId, 'appointment', {
    selectedServiceId: preselectedServiceId
  });

  // If service is preselected, skip to date selection
  if (preselectedServiceId) {
    return handleSelectService(sessionId, preselectedServiceId, language);
  }

  // Show available services
  const services = await getAvailableServices();

  if (services.length === 0) {
    clearWorkflow(sessionId);
    return {
      message: 'Sorry, there are no appointment services currently available. Please try again later or contact us directly.',
      messageEs: 'Lo sentimos, no hay servicios de citas disponibles actualmente. Por favor intente más tarde o contáctenos directamente.',
      actions: [],
      workflowState: {
        active: false,
        type: 'appointment',
        step: 0,
        stepName: 'none'
      }
    };
  }

  const isSpanish = language === 'es';
  const actions: ActionButton[] = services.map(service => ({
    type: 'select-option',
    label: service.serviceName,
    data: { command: '__SELECT_SERVICE__', value: service.id },
    variant: 'primary'
  }));

  // Add cancel button
  actions.push({
    type: 'cancel',
    label: isSpanish ? 'Cancelar' : 'Cancel',
    data: { command: '__CANCEL_WORKFLOW__' },
    variant: 'outline'
  });

  return {
    message: 'I can help you book an appointment. Please select a service:',
    messageEs: 'Puedo ayudarte a agendar una cita. Por favor selecciona un servicio:',
    actions,
    workflowState: {
      active: true,
      type: 'appointment',
      step: APPOINTMENT_STEPS.SELECT_SERVICE,
      stepName: 'select-service'
    }
  };
}

/**
 * Handle service selection
 */
export async function handleSelectService(
  sessionId: string,
  serviceId: string,
  language: Language = 'en'
): Promise<AppointmentFlowResponse> {
  const configs = await loadAppointmentConfigs();
  const service = configs.find(c => c.id === serviceId);

  if (!service) {
    return {
      message: 'Sorry, that service is not available. Please select a different service.',
      messageEs: 'Lo sentimos, ese servicio no está disponible. Por favor selecciona otro servicio.',
      actions: [],
      workflowState: {
        active: true,
        type: 'appointment',
        step: APPOINTMENT_STEPS.SELECT_SERVICE,
        stepName: 'select-service'
      }
    };
  }

  // Update state with selected service
  advanceWorkflow(sessionId, {
    selectedServiceId: serviceId,
    selectedServiceName: service.serviceName
  });

  // Get available dates
  const dates = await getAvailableDates(serviceId);

  if (dates.length === 0) {
    return {
      message: `No available dates for ${service.serviceName} in the next two weeks. Would you like to choose a different service?`,
      messageEs: `No hay fechas disponibles para ${service.serviceName} en las próximas dos semanas. ¿Desea elegir otro servicio?`,
      actions: [
        {
          type: 'select-option',
          label: language === 'es' ? 'Elegir otro servicio' : 'Choose another service',
          data: { command: '__START_APPOINTMENT__' },
          variant: 'primary'
        },
        {
          type: 'cancel',
          label: language === 'es' ? 'Cancelar' : 'Cancel',
          data: { command: '__CANCEL_WORKFLOW__' },
          variant: 'outline'
        }
      ],
      workflowState: {
        active: true,
        type: 'appointment',
        step: APPOINTMENT_STEPS.SELECT_DATE,
        stepName: 'select-date'
      }
    };
  }

  const isSpanish = language === 'es';
  const actions: ActionButton[] = dates.slice(0, 5).map(date => ({
    type: 'select-option',
    label: formatDate(date, language),
    data: { command: '__SELECT_DATE__', value: date },
    variant: 'primary'
  }));

  actions.push({
    type: 'cancel',
    label: isSpanish ? 'Cancelar' : 'Cancel',
    data: { command: '__CANCEL_WORKFLOW__' },
    variant: 'outline'
  });

  return {
    message: `Great! You selected ${service.serviceName}. Please choose a date:`,
    messageEs: `¡Excelente! Seleccionaste ${service.serviceName}. Por favor elige una fecha:`,
    actions,
    workflowState: {
      active: true,
      type: 'appointment',
      step: APPOINTMENT_STEPS.SELECT_DATE,
      stepName: 'select-date'
    }
  };
}

/**
 * Handle date selection
 */
export async function handleSelectDate(
  sessionId: string,
  date: string,
  language: Language = 'en'
): Promise<AppointmentFlowResponse> {
  const state = getOrCreateState(sessionId, language);
  const workflowData = state.workflowData as AppointmentWorkflowData;
  const serviceId = workflowData.selectedServiceId;

  if (!serviceId) {
    return startAppointmentFlow(sessionId, language);
  }

  // Update state with selected date
  advanceWorkflow(sessionId, { selectedDate: date });

  // Get available time slots
  const slots = await getAvailableSlots(serviceId, date);

  if (slots.length === 0) {
    return {
      message: `No available time slots on ${formatDate(date, language)}. Please choose a different date.`,
      messageEs: `No hay horarios disponibles el ${formatDate(date, language)}. Por favor elige otra fecha.`,
      actions: [
        {
          type: 'select-option',
          label: language === 'es' ? 'Elegir otra fecha' : 'Choose another date',
          data: { command: '__SELECT_SERVICE__', value: serviceId },
          variant: 'primary'
        },
        {
          type: 'cancel',
          label: language === 'es' ? 'Cancelar' : 'Cancel',
          data: { command: '__CANCEL_WORKFLOW__' },
          variant: 'outline'
        }
      ],
      workflowState: {
        active: true,
        type: 'appointment',
        step: APPOINTMENT_STEPS.SELECT_TIME,
        stepName: 'select-time'
      }
    };
  }

  const isSpanish = language === 'es';
  const actions: ActionButton[] = slots.slice(0, 6).map(slot => ({
    type: 'select-option',
    label: formatTime(slot),
    data: { command: '__SELECT_TIME__', value: slot },
    variant: 'primary'
  }));

  actions.push({
    type: 'cancel',
    label: isSpanish ? 'Cancelar' : 'Cancel',
    data: { command: '__CANCEL_WORKFLOW__' },
    variant: 'outline'
  });

  return {
    message: `Available times on ${formatDate(date, language)}:`,
    messageEs: `Horarios disponibles el ${formatDate(date, language)}:`,
    actions,
    workflowState: {
      active: true,
      type: 'appointment',
      step: APPOINTMENT_STEPS.SELECT_TIME,
      stepName: 'select-time'
    }
  };
}

/**
 * Handle time selection - prompt for contact info
 */
export async function handleSelectTime(
  sessionId: string,
  time: string,
  language: Language = 'en'
): Promise<AppointmentFlowResponse> {
  // Update state with selected time
  advanceWorkflow(sessionId, { selectedTime: time });

  const isSpanish = language === 'es';

  return {
    message: `Perfect! You selected ${formatTime(time)}. Please provide your contact information:\n\n**Name, Email, and Phone** (e.g., "John Doe, john@email.com, 305-555-1234")`,
    messageEs: `¡Perfecto! Seleccionaste las ${formatTime(time)}. Por favor proporciona tu información de contacto:\n\n**Nombre, Email y Teléfono** (ej: "Juan Pérez, juan@email.com, 305-555-1234")`,
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
      type: 'appointment',
      step: APPOINTMENT_STEPS.COLLECT_INFO,
      stepName: 'collect-info'
    }
  };
}

/**
 * Parse contact info from user message
 */
function parseContactInfo(message: string): {
  name?: string;
  email?: string;
  phone?: string;
} | null {
  // Try to extract email
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : undefined;

  // Try to extract phone
  const phoneMatch = message.match(/\(?[\d]{3}\)?[-.\s]?[\d]{3}[-.\s]?[\d]{4}/);
  const phone = phoneMatch ? phoneMatch[0] : undefined;

  // Extract name (everything before email/phone or first part of comma-separated)
  let name: string | undefined;

  if (message.includes(',')) {
    const parts = message.split(',').map(p => p.trim());
    // First part is usually the name
    name = parts[0].replace(/[\w.-]+@[\w.-]+\.\w+/, '').replace(/\(?[\d]{3}\)?[-.\s]?[\d]{3}[-.\s]?[\d]{4}/, '').trim();
  } else {
    // Try to find name before email or phone
    let remaining = message;
    if (email) remaining = remaining.replace(email, '');
    if (phone) remaining = remaining.replace(phone, '');
    name = remaining.trim().replace(/^,|,$/g, '').trim();
  }

  if (!name && !email) {
    return null;
  }

  return { name, email, phone };
}

/**
 * Handle contact info submission
 */
export async function handleContactInfo(
  sessionId: string,
  message: string,
  language: Language = 'en'
): Promise<AppointmentFlowResponse> {
  const parsed = parseContactInfo(message);

  if (!parsed || !parsed.name || !parsed.email) {
    return {
      message: 'I couldn\'t understand your contact information. Please provide your Name, Email, and Phone in this format:\n\n"John Doe, john@email.com, 305-555-1234"',
      messageEs: 'No pude entender tu información de contacto. Por favor proporciona tu Nombre, Email y Teléfono en este formato:\n\n"Juan Pérez, juan@email.com, 305-555-1234"',
      actions: [
        {
          type: 'cancel',
          label: language === 'es' ? 'Cancelar' : 'Cancel',
          data: { command: '__CANCEL_WORKFLOW__' },
          variant: 'outline'
        }
      ],
      workflowState: {
        active: true,
        type: 'appointment',
        step: APPOINTMENT_STEPS.COLLECT_INFO,
        stepName: 'collect-info'
      }
    };
  }

  // Update state with contact info
  advanceWorkflow(sessionId, {
    userName: parsed.name,
    userEmail: parsed.email,
    userPhone: parsed.phone
  });

  // Get complete workflow data
  const state = getOrCreateState(sessionId, language);
  const data = state.workflowData as AppointmentWorkflowData;

  // Get service name
  const configs = await loadAppointmentConfigs();
  const service = configs.find(c => c.id === data.selectedServiceId);
  const serviceName = service?.serviceName || 'Appointment';

  const isSpanish = language === 'es';
  const formattedDate = formatDate(data.selectedDate!, language);
  const formattedTime = formatTime(data.selectedTime!);

  return {
    message: `Please confirm your appointment:\n\n**Service:** ${serviceName}\n**Date:** ${formattedDate}\n**Time:** ${formattedTime}\n**Name:** ${parsed.name}\n**Email:** ${parsed.email}\n**Phone:** ${parsed.phone || 'Not provided'}`,
    messageEs: `Por favor confirma tu cita:\n\n**Servicio:** ${serviceName}\n**Fecha:** ${formattedDate}\n**Hora:** ${formattedTime}\n**Nombre:** ${parsed.name}\n**Email:** ${parsed.email}\n**Teléfono:** ${parsed.phone || 'No proporcionado'}`,
    actions: [
      {
        type: 'confirm',
        label: isSpanish ? 'Confirmar Cita' : 'Confirm Appointment',
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
      type: 'appointment',
      step: APPOINTMENT_STEPS.CONFIRM,
      stepName: 'confirm'
    }
  };
}

/**
 * Confirm and create the appointment
 */
export async function confirmAppointment(
  sessionId: string,
  language: Language = 'en'
): Promise<AppointmentFlowResponse> {
  const state = getOrCreateState(sessionId, language);
  const data = state.workflowData as AppointmentWorkflowData;

  // Create the appointment
  const appointment = await createAppointment(data);

  // Clear the workflow
  clearWorkflow(sessionId);

  if (!appointment) {
    return {
      message: 'Sorry, there was an error creating your appointment. Please try again or contact us directly.',
      messageEs: 'Lo sentimos, hubo un error al crear tu cita. Por favor intenta de nuevo o contáctanos directamente.',
      actions: [
        {
          type: 'select-option',
          label: language === 'es' ? 'Intentar de nuevo' : 'Try again',
          data: { command: '__START_APPOINTMENT__' },
          variant: 'primary'
        }
      ],
      workflowState: {
        active: false,
        type: 'appointment',
        step: 0,
        stepName: 'none'
      }
    };
  }

  // Get service name
  const configs = await loadAppointmentConfigs();
  const service = configs.find(c => c.id === appointment.configId);
  const serviceName = service?.serviceName || 'Appointment';

  const formattedDate = formatDate(appointment.date, language);
  const formattedTime = formatTime(appointment.timeSlot);

  return {
    message: `**Your appointment is confirmed!**\n\n**Confirmation #:** ${appointment.id.toUpperCase()}\n**Service:** ${serviceName}\n**Date:** ${formattedDate}\n**Time:** ${formattedTime}\n\nA confirmation email has been sent to ${appointment.userEmail}.\n\nIs there anything else I can help you with?`,
    messageEs: `**¡Tu cita está confirmada!**\n\n**Confirmación #:** ${appointment.id.toUpperCase()}\n**Servicio:** ${serviceName}\n**Fecha:** ${formattedDate}\n**Hora:** ${formattedTime}\n\nSe ha enviado un correo de confirmación a ${appointment.userEmail}.\n\n¿Hay algo más en lo que pueda ayudarte?`,
    actions: [],
    workflowState: {
      active: false,
      type: 'appointment',
      step: 0,
      stepName: 'completed'
    },
    appointmentConfirmation: {
      id: appointment.id,
      serviceName,
      date: formattedDate,
      time: formattedTime
    }
  };
}

/**
 * Cancel the appointment workflow
 */
export function cancelAppointmentFlow(
  sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: Language = 'en'
): AppointmentFlowResponse {
  clearWorkflow(sessionId);

  return {
    message: 'Appointment booking cancelled. Is there anything else I can help you with?',
    messageEs: 'Reserva de cita cancelada. ¿Hay algo más en lo que pueda ayudarte?',
    actions: [],
    workflowState: {
      active: false,
      type: 'appointment',
      step: 0,
      stepName: 'cancelled'
    }
  };
}

/**
 * Process appointment workflow step based on current state
 */
export async function processAppointmentStep(
  sessionId: string,
  message: string,
  language: Language = 'en'
): Promise<AppointmentFlowResponse> {
  const state = getOrCreateState(sessionId, language);

  // Check current step
  switch (state.workflowStep) {
    case APPOINTMENT_STEPS.SELECT_SERVICE:
      return startAppointmentFlow(sessionId, language);

    case APPOINTMENT_STEPS.SELECT_DATE:
      // Date should be selected via button
      return handleSelectService(
        sessionId,
        (state.workflowData as AppointmentWorkflowData).selectedServiceId!,
        language
      );

    case APPOINTMENT_STEPS.SELECT_TIME:
      // Time should be selected via button
      return handleSelectDate(
        sessionId,
        (state.workflowData as AppointmentWorkflowData).selectedDate!,
        language
      );

    case APPOINTMENT_STEPS.COLLECT_INFO:
      return handleContactInfo(sessionId, message, language);

    case APPOINTMENT_STEPS.CONFIRM:
      // Check if user is confirming
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('confirm') || lowerMessage.includes('yes') ||
          lowerMessage.includes('confirmar') || lowerMessage.includes('sí')) {
        return confirmAppointment(sessionId, language);
      }
      // Show confirmation again
      return handleContactInfo(sessionId, '', language);

    default:
      return startAppointmentFlow(sessionId, language);
  }
}
