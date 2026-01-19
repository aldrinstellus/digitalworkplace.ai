// Supabase-backed data store for dCQ
// Migrated from JSON files to Supabase dcq schema

import { supabase } from './supabase';

// =============================================================================
// TYPE DEFINITIONS (Compatible with existing API routes)
// =============================================================================

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  views: number;
  helpful: number;
  notHelpful: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  url?: string;
  workflowAction?: {
    type: 'appointment' | 'service-request' | 'external-link';
    buttonLabel: string;
    configId?: string;
    externalUrl?: string;
  };
}

// Language Configuration Types
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  isDefault: boolean;
  autoDetect: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageSettings {
  languages: LanguageConfig[];
  autoDetectEnabled: boolean;
  fallbackLanguage: string;
  browserDetectEnabled: boolean;
  userOverrideAllowed: boolean;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  startDate: string;
  endDate: string;
  targetAudience: 'all' | 'residents' | 'businesses';
  language: 'en' | 'es' | 'ht' | 'all';
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Settings Types
export interface Settings {
  general: {
    botName: string;
    welcomeMessage: string;
    welcomeMessageEs: string;
    welcomeMessageHt?: string;
    welcomeMessages?: Record<string, string>;
    defaultLanguage: string;
    enableBilingual: boolean;
    officeHours: {
      start: string;
      end: string;
      timezone: string;
    };
  };
  chatbot: {
    maxMessagesPerSession: number;
    sessionTimeout: number;
    enableSentimentAnalysis: boolean;
    autoEscalateNegative: boolean;
    escalationThreshold: number;
    responseDelay: number;
  };
  appearance: {
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    showSources: boolean;
    showFeedback: boolean;
  };
  llm: {
    primaryLLM: 'claude-3-haiku' | 'claude-3-sonnet' | 'claude-3-opus' | 'gpt-4o-mini' | 'gpt-4o';
    backupLLM: 'claude-3-haiku' | 'claude-3-sonnet' | 'claude-3-opus' | 'gpt-4o-mini' | 'gpt-4o' | 'none';
    temperature: number;
    maxTokens: number;
  };
  notifications: {
    emailAlerts: boolean;
    escalationEmail: string;
    dailyDigest: boolean;
    digestTime: string;
    alertOnEscalation: boolean;
    alertOnNegativeFeedback: boolean;
  };
  integration: {
    enableIVR: boolean;
    enableSMS: boolean;
    enableSocial: boolean;
    twilioPhone: string;
  };
  integrations: {
    crmEnabled: boolean;
    crmProvider: 'salesforce' | 'dynamics' | 'none';
    sharePointEnabled: boolean;
  };
}

// Escalation Types
export interface Escalation {
  id: string;
  sessionId: string;
  userName: string;
  contactMethod: 'email' | 'phone';
  contactValue: string;
  reason: string;
  status: 'pending' | 'in_progress' | 'resolved';
  requestedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  notes: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

// Uploaded Document Types
export interface UploadedDocument {
  id: string;
  filename: string;
  originalName: string;
  type: 'pdf' | 'docx' | 'txt';
  size: number;
  chunks: number;
  uploadedAt: string;
}

// Crawler URL Types
export interface CrawlerURL {
  id: string;
  url: string;
  fullUrl: string;
  title: string;
  section: string;
  enabled: boolean;
  isCustom: boolean;
  lastCrawled: string | null;
  lastStatus: 'success' | 'error' | 'pending' | 'never';
}

// Knowledge Entry Types
export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  section: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'system' | 'activity' | 'reminder';
  category: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

// Workflow Type Interface
export interface WorkflowType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  handlerType: 'appointment' | 'routing' | 'faq-action' | 'custom';
  isActive: boolean;
  isSystem: boolean;
  order: number;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Workflow Category Interface
export interface WorkflowCategory {
  id: string;
  name: string;
  workflowTypeId: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Banner Settings Types
export interface BannerSettings {
  rotationEnabled: boolean;
  rotationInterval: number;
  pauseOnHover: boolean;
  showNavigation: boolean;
  showDismiss: boolean;
  updatedAt: string;
}

// Feedback Types
export interface Feedback {
  id: string;
  messageId: string;
  conversationId: string;
  rating: 'positive' | 'negative';
  query?: string;
  response?: string;
  language: 'en' | 'es';
  createdAt: string;
}

// =============================================================================
// DEFAULT DATA (for fallback)
// =============================================================================

const DEFAULT_SETTINGS: Settings = {
  general: {
    botName: 'Chat Core IQ Assistant',
    welcomeMessage: 'Hello! I\'m the Chat Core IQ Assistant. How can I help you today?',
    welcomeMessageEs: '¡Hola! Soy el Asistente de Chat Core IQ. ¿Cómo puedo ayudarle hoy?',
    defaultLanguage: 'en',
    enableBilingual: true,
    officeHours: {
      start: '08:00',
      end: '17:00',
      timezone: 'America/New_York',
    },
  },
  chatbot: {
    maxMessagesPerSession: 50,
    sessionTimeout: 30,
    enableSentimentAnalysis: true,
    autoEscalateNegative: true,
    escalationThreshold: 5,
    responseDelay: 500,
  },
  appearance: {
    primaryColor: '#a855f7',
    position: 'bottom-right',
    showSources: true,
    showFeedback: true,
  },
  llm: {
    primaryLLM: 'claude-sonnet-4-20250514',
    backupLLM: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1024,
  },
  notifications: {
    emailAlerts: true,
    escalationEmail: 'admin@chatcoreiq.com',
    dailyDigest: true,
    digestTime: '09:00',
    alertOnEscalation: true,
    alertOnNegativeFeedback: true,
  },
  integration: {
    enableIVR: true,
    enableSMS: true,
    enableSocial: true,
    twilioPhone: '',
  },
  integrations: {
    crmEnabled: false,
    crmProvider: 'none',
    sharePointEnabled: false,
  },
};

const DEFAULT_BANNER_SETTINGS: BannerSettings = {
  rotationEnabled: true,
  rotationInterval: 8000,
  pauseOnHover: true,
  showNavigation: true,
  showDismiss: true,
  updatedAt: new Date().toISOString(),
};

// =============================================================================
// FAQ FUNCTIONS
// =============================================================================

export async function getFAQs(): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from('dcq.faqs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching FAQs from Supabase:', error);
    return [];
  }

  return (data || []).map(mapFaqFromDb);
}

export async function saveFAQs(faqs: FAQ[]): Promise<void> {
  // For bulk save, we need to upsert each FAQ
  for (const faq of faqs) {
    await saveFAQ(faq);
  }
}

export async function saveFAQ(faq: FAQ): Promise<string | null> {
  const isNewItem = faq.id.startsWith('faq-');
  const dbFaq = mapFaqToDb(faq);

  if (isNewItem) {
    // Insert new item - let Supabase generate the id
    const { data, error } = await supabase
      .from('dcq.faqs')
      .insert(dbFaq)
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting FAQ to Supabase:', error);
      return null;
    }
    return data?.id || null;
  } else {
    // Update existing item
    const { error } = await supabase
      .from('dcq.faqs')
      .update(dbFaq)
      .eq('id', faq.id);

    if (error) {
      console.error('Error updating FAQ in Supabase:', error);
      return null;
    }
    return faq.id;
  }
}

function mapFaqFromDb(row: Record<string, unknown>): FAQ {
  return {
    id: row.id as string,
    question: row.question as string,
    answer: row.answer as string,
    category: (row.category as string) || 'General',
    priority: mapPriority(row.priority as string),
    views: (row.view_count as number) || 0,
    helpful: (row.helpful_count as number) || 0,
    notHelpful: (row.not_helpful_count as number) || 0,
    status: (row.status as string) === 'active' ? 'active' : 'inactive',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    url: row.url as string | undefined,
    workflowAction: row.workflow_action as FAQ['workflowAction'] | undefined,
  };
}

function mapFaqToDb(faq: FAQ): Record<string, unknown> {
  const isNewItem = faq.id.startsWith('faq-');
  const dbRecord: Record<string, unknown> = {
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    priority: faq.priority === 'high' ? 'high' : faq.priority === 'low' ? 'low' : 'normal',
    view_count: faq.views,
    helpful_count: faq.helpful,
    not_helpful_count: faq.notHelpful,
    status: faq.status === 'active' ? 'active' : 'archived',
    url: faq.url || null,
    workflow_action: faq.workflowAction || null,
    updated_at: new Date().toISOString(),
  };

  // Only include id for existing items (not starting with 'faq-')
  if (!isNewItem) {
    dbRecord.id = faq.id;
  }

  return dbRecord;
}

function mapPriority(priority: string): 'low' | 'medium' | 'high' {
  if (priority === 'high' || priority === 'critical') return 'high';
  if (priority === 'low') return 'low';
  return 'medium';
}

// =============================================================================
// ANNOUNCEMENT FUNCTIONS
// =============================================================================

export async function getAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('dcq.announcements')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching announcements from Supabase:', error);
    return [];
  }

  return (data || []).map(mapAnnouncementFromDb);
}

export async function saveAnnouncements(announcements: Announcement[]): Promise<void> {
  for (const ann of announcements) {
    await saveAnnouncement(ann);
  }
}

export async function saveAnnouncement(ann: Announcement): Promise<string | null> {
  const isNewItem = ann.id.startsWith('ann-');
  const dbAnn = mapAnnouncementToDb(ann);

  if (isNewItem) {
    // Insert new item - let Supabase generate the id
    const { data, error } = await supabase
      .from('dcq.announcements')
      .insert(dbAnn)
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting announcement to Supabase:', error);
      return null;
    }
    return data?.id || null;
  } else {
    // Update existing item
    const { error } = await supabase
      .from('dcq.announcements')
      .update(dbAnn)
      .eq('id', ann.id);

    if (error) {
      console.error('Error updating announcement in Supabase:', error);
      return null;
    }
    return ann.id;
  }
}

function mapAnnouncementFromDb(row: Record<string, unknown>): Announcement {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    type: (row.type as string) as Announcement['type'] || 'info',
    startDate: row.start_date as string,
    endDate: row.end_date as string || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: (row.target_audience as string) as Announcement['targetAudience'] || 'all',
    language: (row.language as string) as Announcement['language'] || 'all',
    isActive: row.is_active as boolean,
    views: (row.view_count as number) || 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapAnnouncementToDb(ann: Announcement): Record<string, unknown> {
  const isNewItem = ann.id.startsWith('ann-');
  const dbRecord: Record<string, unknown> = {
    title: ann.title,
    content: ann.content,
    type: ann.type,
    start_date: ann.startDate,
    end_date: ann.endDate,
    target_audience: ann.targetAudience,
    language: ann.language === 'all' ? 'en' : ann.language,
    is_active: ann.isActive,
    view_count: ann.views,
    updated_at: new Date().toISOString(),
  };

  // Only include id for existing items (not starting with 'ann-')
  if (!isNewItem) {
    dbRecord.id = ann.id;
  }

  return dbRecord;
}

// =============================================================================
// SETTINGS FUNCTIONS
// =============================================================================

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from('dcq.settings')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching settings, using defaults:', error);
    return DEFAULT_SETTINGS;
  }

  // Map from Supabase columns to Settings interface
  return {
    general: {
      botName: data.general?.botName || data.general?.siteName || 'Chat Core IQ Assistant',
      welcomeMessage: data.general?.welcomeMessage || data.chatbot?.greeting || 'Hello! How can I help you?',
      welcomeMessageEs: data.general?.welcomeMessageEs || '¡Hola! ¿Cómo puedo ayudarle?',
      defaultLanguage: data.general?.defaultLanguage || 'en',
      enableBilingual: data.general?.enableBilingual !== false,
      officeHours: data.general?.officeHours || { start: '08:00', end: '17:00', timezone: data.general?.timezone || 'America/New_York' },
    },
    chatbot: {
      maxMessagesPerSession: data.chatbot?.maxMessagesPerSession || 50,
      sessionTimeout: data.chatbot?.sessionTimeout || 30,
      enableSentimentAnalysis: data.chatbot?.enableSentimentAnalysis !== false,
      autoEscalateNegative: data.chatbot?.autoEscalateNegative !== false,
      escalationThreshold: data.chatbot?.escalationThreshold || 5,
      responseDelay: data.chatbot?.responseDelay || 500,
    },
    appearance: {
      primaryColor: data.appearance?.primaryColor || '#a855f7',
      position: data.chatbot?.position || data.appearance?.position || 'bottom-right',
      showSources: data.chatbot?.showSources !== false,
      showFeedback: data.chatbot?.showFeedback !== false,
    },
    llm: {
      primaryLLM: data.llm?.model || data.llm?.primaryLLM || 'claude-sonnet-4-20250514',
      backupLLM: data.llm?.backupLLM || 'gpt-4o-mini',
      temperature: data.llm?.temperature || 0.7,
      maxTokens: data.llm?.maxTokens || 1024,
    },
    notifications: {
      emailAlerts: data.notifications?.email !== false,
      escalationEmail: data.notifications?.escalationEmail || 'admin@chatcoreiq.com',
      dailyDigest: data.notifications?.dailyDigest !== false,
      digestTime: data.notifications?.digestTime || '09:00',
      alertOnEscalation: data.notifications?.alertOnEscalation !== false,
      alertOnNegativeFeedback: data.notifications?.alertOnNegativeFeedback !== false,
    },
    integration: data.integration || {
      enableIVR: true,
      enableSMS: true,
      enableSocial: true,
      twilioPhone: '',
    },
    integrations: data.integrations || {
      crmEnabled: false,
      crmProvider: 'none',
      sharePointEnabled: false,
    },
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  // Map Settings interface back to Supabase column structure
  const dbData = {
    general: {
      siteName: settings.general.botName,
      timezone: settings.general.officeHours?.timezone || 'America/New_York',
      defaultLanguage: settings.general.defaultLanguage,
      welcomeMessage: settings.general.welcomeMessage,
      welcomeMessageEs: settings.general.welcomeMessageEs,
      enableBilingual: settings.general.enableBilingual,
      officeHours: settings.general.officeHours,
    },
    chatbot: {
      enabled: true,
      greeting: settings.general.welcomeMessage,
      position: settings.appearance.position,
      showSources: settings.appearance.showSources,
      showFeedback: settings.appearance.showFeedback,
      maxMessagesPerSession: settings.chatbot.maxMessagesPerSession,
      sessionTimeout: settings.chatbot.sessionTimeout,
      enableSentimentAnalysis: settings.chatbot.enableSentimentAnalysis,
      autoEscalateNegative: settings.chatbot.autoEscalateNegative,
      escalationThreshold: settings.chatbot.escalationThreshold,
      responseDelay: settings.chatbot.responseDelay,
    },
    appearance: {
      theme: 'light',
      primaryColor: settings.appearance.primaryColor,
      secondaryColor: '#ec4899',
    },
    llm: {
      provider: 'anthropic',
      model: settings.llm.primaryLLM,
      backupLLM: settings.llm.backupLLM,
      temperature: settings.llm.temperature,
      maxTokens: settings.llm.maxTokens,
    },
    notifications: {
      email: settings.notifications.emailAlerts,
      slack: false,
      escalationEmail: settings.notifications.escalationEmail,
      dailyDigest: settings.notifications.dailyDigest,
      digestTime: settings.notifications.digestTime,
      alertOnEscalation: settings.notifications.alertOnEscalation,
      alertOnNegativeFeedback: settings.notifications.alertOnNegativeFeedback,
    },
    integration: settings.integration,
    integrations: settings.integrations,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('dcq.settings')
    .update(dbData)
    .eq('id', 'b0000000-0000-0000-0000-000000000001');

  if (error) {
    console.error('Error saving settings:', error);
  }
}

// =============================================================================
// ESCALATION FUNCTIONS
// =============================================================================

export async function getEscalations(): Promise<Escalation[]> {
  const { data, error } = await supabase
    .from('dcq.escalations')
    .select('*')
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Error fetching escalations from Supabase:', error);
    return [];
  }

  return (data || []).map(mapEscalationFromDb);
}

export async function saveEscalations(escalations: Escalation[]): Promise<void> {
  for (const esc of escalations) {
    await saveEscalation(esc);
  }
}

export async function saveEscalation(esc: Escalation): Promise<void> {
  const dbEsc = mapEscalationToDb(esc);

  const { error } = await supabase
    .from('dcq.escalations')
    .upsert(dbEsc, { onConflict: 'id' });

  if (error) {
    console.error('Error saving escalation to Supabase:', error);
  }
}

function mapEscalationFromDb(row: Record<string, unknown>): Escalation {
  return {
    id: row.id as string,
    sessionId: (row.conversation_id as string) || '',
    userName: row.user_name as string,
    contactMethod: (row.contact_method as string) as Escalation['contactMethod'],
    contactValue: row.contact_value as string,
    reason: row.reason as string,
    status: (row.status as string) as Escalation['status'],
    requestedAt: row.requested_at as string,
    assignedTo: row.assigned_to as string | undefined,
    resolvedAt: row.resolved_at as string | undefined,
    notes: (row.notes as string) || '',
  };
}

function mapEscalationToDb(esc: Escalation): Record<string, unknown> {
  return {
    id: esc.id.startsWith('esc-') ? undefined : esc.id,
    user_name: esc.userName,
    contact_method: esc.contactMethod,
    contact_value: esc.contactValue,
    reason: esc.reason,
    status: esc.status,
    requested_at: esc.requestedAt,
    assigned_to: esc.assignedTo || null,
    resolved_at: esc.resolvedAt || null,
    notes: esc.notes || null,
    updated_at: new Date().toISOString(),
  };
}

// =============================================================================
// AUDIT LOG FUNCTIONS
// =============================================================================

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('dcq.audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error fetching audit logs from Supabase:', error);
    return [];
  }

  return (data || []).map(mapAuditLogFromDb);
}

export async function saveAuditLogs(logs: AuditLog[]): Promise<void> {
  // Audit logs are append-only, so just insert new ones
  for (const log of logs) {
    if (log.id.startsWith('log-')) {
      await addAuditLog(log.user, log.action, log.resource, log.resourceId, log.details);
    }
  }
}

export async function addAuditLog(
  user: string,
  action: string,
  resource: string,
  resourceId: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabase
    .from('dcq.audit_logs')
    .insert({
      user_name: user,
      action,
      resource_type: resource,
      resource_id: resourceId,
      new_value: details,
    });

  if (error) {
    console.error('Error adding audit log to Supabase:', error);
  }
}

function mapAuditLogFromDb(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    timestamp: row.created_at as string,
    user: (row.user_name as string) || 'System',
    action: row.action as string,
    resource: row.resource_type as string,
    resourceId: (row.resource_id as string) || '',
    details: (row.new_value as Record<string, unknown>) || {},
    ipAddress: row.ip_address as string | undefined,
  };
}

// =============================================================================
// NOTIFICATION FUNCTIONS
// =============================================================================

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('dcq.notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications from Supabase:', error);
    return [];
  }

  return (data || []).map(mapNotificationFromDb);
}

export async function saveNotifications(notifications: Notification[]): Promise<void> {
  for (const notif of notifications) {
    await saveNotification(notif);
  }
}

export async function saveNotification(notif: Notification): Promise<void> {
  const dbNotif = mapNotificationToDb(notif);

  const { error } = await supabase
    .from('dcq.notifications')
    .upsert(dbNotif, { onConflict: 'id' });

  if (error) {
    console.error('Error saving notification to Supabase:', error);
  }
}

export async function createNotification(
  notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
): Promise<Notification> {
  const { data, error } = await supabase
    .from('dcq.notifications')
    .insert({
      type: notification.type,
      category: notification.category,
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      link: notification.link || null,
      metadata: notification.metadata || {},
      is_read: false,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating notification:', error);
    // Return a mock notification on error
    return {
      ...notification,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  }

  return mapNotificationFromDb(data);
}

export async function markNotificationRead(id: string): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('dcq.notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error marking notification read:', error);
    return null;
  }

  return mapNotificationFromDb(data);
}

export async function markAllNotificationsRead(): Promise<number> {
  const { data, error } = await supabase
    .from('dcq.notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('is_read', false)
    .select();

  if (error) {
    console.error('Error marking all notifications read:', error);
    return 0;
  }

  return data?.length || 0;
}

export async function deleteNotification(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('dcq.notifications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
}

function mapNotificationFromDb(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    type: (row.type as string) as Notification['type'],
    category: (row.category as string) || '',
    title: row.title as string,
    message: row.message as string,
    severity: (row.severity as string) as Notification['severity'],
    isRead: row.is_read as boolean,
    createdAt: row.created_at as string,
    link: row.link as string | undefined,
    metadata: row.metadata as Record<string, unknown> | undefined,
  };
}

function mapNotificationToDb(notif: Notification): Record<string, unknown> {
  return {
    id: notif.id.startsWith('notif-') ? undefined : notif.id,
    type: notif.type,
    category: notif.category,
    title: notif.title,
    message: notif.message,
    severity: notif.severity,
    is_read: notif.isRead,
    link: notif.link || null,
    metadata: notif.metadata || {},
  };
}

// =============================================================================
// KNOWLEDGE ENTRY FUNCTIONS
// =============================================================================

export async function getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from('dcq.knowledge_entries')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching knowledge entries from Supabase:', error);
    return [];
  }

  return (data || []).map(mapKnowledgeEntryFromDb);
}

export async function saveKnowledgeEntries(entries: KnowledgeEntry[]): Promise<void> {
  for (const entry of entries) {
    await saveKnowledgeEntry(entry);
  }
}

export async function saveKnowledgeEntry(entry: KnowledgeEntry): Promise<void> {
  const dbEntry = mapKnowledgeEntryToDb(entry);

  const { error } = await supabase
    .from('dcq.knowledge_entries')
    .upsert(dbEntry, { onConflict: 'id' });

  if (error) {
    console.error('Error saving knowledge entry to Supabase:', error);
  }
}

function mapKnowledgeEntryFromDb(row: Record<string, unknown>): KnowledgeEntry {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    section: (row.section as string) || 'General',
    url: row.url as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapKnowledgeEntryToDb(entry: KnowledgeEntry): Record<string, unknown> {
  return {
    id: entry.id.startsWith('ke-') ? undefined : entry.id,
    title: entry.title,
    content: entry.content,
    section: entry.section,
    url: entry.url || null,
    source_type: 'manual',
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

// =============================================================================
// DOCUMENT FUNCTIONS
// =============================================================================

export async function getUploadedDocuments(): Promise<UploadedDocument[]> {
  const { data, error } = await supabase
    .from('dcq.documents')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents from Supabase:', error);
    return [];
  }

  return (data || []).map(mapDocumentFromDb);
}

export async function saveUploadedDocuments(docs: UploadedDocument[]): Promise<void> {
  for (const doc of docs) {
    await saveUploadedDocument(doc);
  }
}

export async function saveUploadedDocument(doc: UploadedDocument): Promise<void> {
  const dbDoc = mapDocumentToDb(doc);

  const { error } = await supabase
    .from('dcq.documents')
    .upsert(dbDoc, { onConflict: 'id' });

  if (error) {
    console.error('Error saving document to Supabase:', error);
  }
}

function mapDocumentFromDb(row: Record<string, unknown>): UploadedDocument {
  return {
    id: row.id as string,
    filename: row.filename as string,
    originalName: row.original_name as string,
    type: (row.file_type as string) as UploadedDocument['type'],
    size: row.file_size as number,
    chunks: (row.chunk_count as number) || 0,
    uploadedAt: row.uploaded_at as string,
  };
}

function mapDocumentToDb(doc: UploadedDocument): Record<string, unknown> {
  return {
    id: doc.id.startsWith('doc-') ? undefined : doc.id,
    filename: doc.filename,
    original_name: doc.originalName,
    file_type: doc.type,
    file_size: doc.size,
    chunk_count: doc.chunks,
    processing_status: 'completed',
    uploaded_at: doc.uploadedAt,
  };
}

// =============================================================================
// CRAWLER URL FUNCTIONS
// =============================================================================

export async function getCrawlerUrls(lang: 'en' | 'es' | 'ht' = 'en'): Promise<CrawlerURL[]> {
  const { data, error } = await supabase
    .from('dcq.crawler_urls')
    .select('*')
    .eq('language', lang)
    .order('section')
    .order('url');

  if (error) {
    console.error('Error fetching crawler URLs from Supabase:', error);
    return [];
  }

  return (data || []).map(mapCrawlerUrlFromDb);
}

export async function saveCrawlerUrls(urls: CrawlerURL[], lang: 'en' | 'es' | 'ht' = 'en'): Promise<void> {
  for (const url of urls) {
    await saveCrawlerUrl(url, lang);
  }
}

export async function saveCrawlerUrl(url: CrawlerURL, lang: 'en' | 'es' | 'ht' = 'en'): Promise<void> {
  const dbUrl = mapCrawlerUrlToDb(url, lang);

  const { error } = await supabase
    .from('dcq.crawler_urls')
    .upsert(dbUrl, { onConflict: 'id' });

  if (error) {
    console.error('Error saving crawler URL to Supabase:', error);
  }
}

function mapCrawlerUrlFromDb(row: Record<string, unknown>): CrawlerURL {
  return {
    id: row.id as string,
    url: row.url as string,
    fullUrl: row.url as string,
    title: (row.title as string) || '',
    section: (row.section as string) || 'General',
    enabled: row.is_enabled as boolean,
    isCustom: row.is_custom as boolean,
    lastCrawled: row.last_crawled as string | null,
    lastStatus: (row.last_status as string) as CrawlerURL['lastStatus'],
  };
}

function mapCrawlerUrlToDb(url: CrawlerURL, lang: string): Record<string, unknown> {
  return {
    id: url.id.startsWith('curl-') ? undefined : url.id,
    url: url.url,
    title: url.title,
    section: url.section,
    is_enabled: url.enabled,
    is_custom: url.isCustom,
    language: lang,
    last_crawled: url.lastCrawled,
    last_status: url.lastStatus,
    updated_at: new Date().toISOString(),
  };
}

// =============================================================================
// LANGUAGE SETTINGS FUNCTIONS
// =============================================================================

export async function getLanguageSettings(): Promise<LanguageSettings> {
  const { data, error } = await supabase
    .from('dcq.languages')
    .select('*')
    .order('is_default', { ascending: false })
    .order('code');

  if (error || !data || data.length === 0) {
    console.error('Error fetching languages, using defaults:', error);
    return {
      languages: [
        { code: 'en', name: 'English', nativeName: 'English', enabled: true, isDefault: true, autoDetect: true, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { code: 'es', name: 'Spanish', nativeName: 'Español', enabled: true, isDefault: false, autoDetect: true, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
      autoDetectEnabled: true,
      fallbackLanguage: 'en',
      browserDetectEnabled: true,
      userOverrideAllowed: true,
    };
  }

  const languages: LanguageConfig[] = data.map((row) => ({
    code: row.code as string,
    name: row.name as string,
    nativeName: (row.native_name as string) || row.name as string,
    enabled: row.is_active as boolean,
    isDefault: row.is_default as boolean,
    autoDetect: true,
    order: 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));

  return {
    languages,
    autoDetectEnabled: true,
    fallbackLanguage: 'en',
    browserDetectEnabled: true,
    userOverrideAllowed: true,
  };
}

export async function saveLanguageSettings(settings: LanguageSettings): Promise<void> {
  for (const lang of settings.languages) {
    const { error } = await supabase
      .from('dcq.languages')
      .upsert({
        code: lang.code,
        name: lang.name,
        native_name: lang.nativeName,
        is_active: lang.enabled,
        is_default: lang.isDefault,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'bot_id,code' });

    if (error) {
      console.error(`Error saving language ${lang.code}:`, error);
    }
  }
}

export async function getEnabledLanguages(): Promise<LanguageConfig[]> {
  const settings = await getLanguageSettings();
  return settings.languages.filter(l => l.enabled).sort((a, b) => a.order - b.order);
}

export async function getDefaultLanguage(): Promise<string> {
  const settings = await getLanguageSettings();
  const defaultLang = settings.languages.find(l => l.isDefault);
  return defaultLang?.code || settings.fallbackLanguage || 'en';
}

// =============================================================================
// BANNER SETTINGS FUNCTIONS
// =============================================================================

export async function getBannerSettings(): Promise<BannerSettings> {
  const { data, error } = await supabase
    .from('dcq.banner_settings')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching banner settings, using defaults:', error);
    return DEFAULT_BANNER_SETTINGS;
  }

  return {
    rotationEnabled: data.is_enabled as boolean,
    rotationInterval: 8000,
    pauseOnHover: true,
    showNavigation: true,
    showDismiss: true,
    updatedAt: data.updated_at as string,
  };
}

export async function saveBannerSettings(settings: BannerSettings): Promise<void> {
  const { error } = await supabase
    .from('dcq.banner_settings')
    .upsert({
      is_enabled: settings.rotationEnabled,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error saving banner settings:', error);
  }
}

// =============================================================================
// WORKFLOW TYPE FUNCTIONS
// =============================================================================

export async function getWorkflowTypes(): Promise<WorkflowType[]> {
  const { data, error } = await supabase
    .from('dcq.workflow_types')
    .select('*, dcq.workflow_categories!workflow_types_category_id_fkey(code, name)')
    .eq('is_active', true)
    .order('created_at');

  if (error) {
    console.error('Error fetching workflow types from Supabase:', error);
    return getDefaultWorkflowTypes();
  }

  if (!data || data.length === 0) {
    return getDefaultWorkflowTypes();
  }

  return data.map(mapWorkflowTypeFromDb);
}

export async function saveWorkflowTypes(types: WorkflowType[]): Promise<void> {
  // Workflow types are managed via admin, just log for now
  console.log('Workflow types update requested:', types.length);
}

export async function getWorkflowTypeBySlug(slug: string): Promise<WorkflowType | null> {
  const types = await getWorkflowTypes();
  return types.find(t => t.slug === slug) || null;
}

function mapWorkflowTypeFromDb(row: Record<string, unknown>): WorkflowType {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.code as string,
    description: (row.description as string) || '',
    icon: 'Settings',
    color: 'from-blue-500 to-indigo-600',
    handlerType: 'custom',
    isActive: row.is_active as boolean,
    isSystem: false,
    order: 0,
    config: (row.form_schema as Record<string, unknown>) || {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function getDefaultWorkflowTypes(): WorkflowType[] {
  return [
    {
      id: 'wf-appointments',
      name: 'Appointment Scheduling',
      slug: 'appointments',
      description: 'Configure departments, time slots, and manage citizen appointments',
      icon: 'Calendar',
      color: 'from-blue-500 to-indigo-600',
      handlerType: 'appointment',
      isActive: true,
      isSystem: true,
      order: 1,
      config: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'wf-service-requests',
      name: 'Service Request Routing',
      slug: 'service-requests',
      description: 'Set up automatic routing rules for service requests by category',
      icon: 'GitBranch',
      color: 'from-emerald-500 to-teal-600',
      handlerType: 'routing',
      isActive: true,
      isSystem: true,
      order: 2,
      config: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'wf-faq-actions',
      name: 'FAQ Actions',
      slug: 'faq-actions',
      description: 'Connect FAQs to trigger appointment booking or service requests',
      icon: 'MessageSquareText',
      color: 'from-purple-500 to-violet-600',
      handlerType: 'faq-action',
      isActive: true,
      isSystem: true,
      order: 3,
      config: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// =============================================================================
// WORKFLOW CATEGORY FUNCTIONS
// =============================================================================

export async function getWorkflowCategories(): Promise<WorkflowCategory[]> {
  const { data, error } = await supabase
    .from('dcq.workflow_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
    .order('name');

  if (error) {
    console.error('Error fetching workflow categories from Supabase:', error);
    return [];
  }

  return (data || []).map(mapWorkflowCategoryFromDb);
}

export async function saveWorkflowCategories(categories: WorkflowCategory[]): Promise<void> {
  console.log('Workflow categories update requested:', categories.length);
}

export async function getCategoriesByWorkflowType(workflowTypeId: string): Promise<WorkflowCategory[]> {
  const categories = await getWorkflowCategories();
  return categories.filter(c => c.workflowTypeId === workflowTypeId && c.isActive);
}

function mapWorkflowCategoryFromDb(row: Record<string, unknown>): WorkflowCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    workflowTypeId: '',
    description: row.description as string | undefined,
    isActive: row.is_active as boolean,
    order: (row.display_order as number) || 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// =============================================================================
// FEEDBACK FUNCTIONS
// =============================================================================

export async function getFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('dcq.feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedback from Supabase:', error);
    return [];
  }

  return (data || []).map(mapFeedbackFromDb);
}

export async function saveFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback | null> {
  const { data, error } = await supabase
    .from('dcq.feedback')
    .insert({
      message_id: feedback.messageId || null,
      conversation_id: feedback.conversationId || null,
      rating: feedback.rating,
      comment: feedback.query || null,
      tags: [],
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error saving feedback:', error);
    return null;
  }

  return mapFeedbackFromDb(data);
}

function mapFeedbackFromDb(row: Record<string, unknown>): Feedback {
  return {
    id: row.id as string,
    messageId: (row.message_id as string) || '',
    conversationId: (row.conversation_id as string) || '',
    rating: (row.rating as string) as Feedback['rating'],
    query: row.comment as string | undefined,
    response: undefined,
    language: 'en',
    createdAt: row.created_at as string,
  };
}

// =============================================================================
// CONVERSATION/SESSION FUNCTIONS
// =============================================================================

export interface Conversation {
  id: string;
  sessionId: string;
  channel: 'web' | 'ivr' | 'sms';
  language: string;
  messages: Array<{ role: string; content: string }>;
  createdAt: string;
  updatedAt: string;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('dcq.conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id as string,
    sessionId: row.session_id as string,
    channel: (row.channel as string) as Conversation['channel'],
    language: (row.language as string) || 'en',
    messages: [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

export async function saveConversation(conversation: Partial<Conversation>): Promise<string | null> {
  const { data, error } = await supabase
    .from('dcq.conversations')
    .insert({
      session_id: conversation.sessionId || `sess_${Date.now()}`,
      channel: conversation.channel || 'web',
      language: conversation.language || 'en',
      metadata: {},
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error saving conversation:', error);
    return null;
  }

  return data.id as string;
}

// =============================================================================
// CROSS-CHANNEL TOKEN FUNCTIONS
// =============================================================================

export interface CrossChannelToken {
  token: string;
  sourceChannel: string;
  targetChannel: string;
  sessionId: string;
  messages: Array<{ role: string; content: string }>;
  expiresAt: string;
  redeemed: boolean;
}

export async function createCrossChannelToken(
  sourceChannel: string,
  targetChannel: string,
  sessionId: string,
  messages: Array<{ role: string; content: string }>
): Promise<CrossChannelToken | null> {
  const token = generateToken(6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('dcq.cross_channel_tokens')
    .insert({
      token,
      source_channel: sourceChannel,
      target_channel: targetChannel,
      source_session_id: sessionId,
      conversation_data: { messages },
      expires_at: expiresAt,
      redeemed: false,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating cross-channel token:', error);
    return null;
  }

  return {
    token: data.token as string,
    sourceChannel: data.source_channel as string,
    targetChannel: data.target_channel as string,
    sessionId: data.source_session_id as string,
    messages: (data.conversation_data as { messages: Array<{ role: string; content: string }> }).messages,
    expiresAt: data.expires_at as string,
    redeemed: data.redeemed as boolean,
  };
}

export async function redeemCrossChannelToken(
  token: string,
  newSessionId: string
): Promise<CrossChannelToken | null> {
  // First check if token exists and is valid
  const { data: existing, error: checkError } = await supabase
    .from('dcq.cross_channel_tokens')
    .select('*')
    .eq('token', token.toUpperCase())
    .eq('redeemed', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (checkError || !existing) {
    console.error('Token not found or expired:', checkError);
    return null;
  }

  // Mark as redeemed
  const { data, error } = await supabase
    .from('dcq.cross_channel_tokens')
    .update({
      redeemed: true,
      redeemed_at: new Date().toISOString(),
      redeemed_session_id: newSessionId,
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error redeeming token:', error);
    return null;
  }

  return {
    token: data.token as string,
    sourceChannel: data.source_channel as string,
    targetChannel: data.target_channel as string,
    sessionId: data.source_session_id as string,
    messages: (data.conversation_data as { messages: Array<{ role: string; content: string }> }).messages,
    expiresAt: data.expires_at as string,
    redeemed: data.redeemed as boolean,
  };
}

function generateToken(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// =============================================================================
// LEGACY JSON FILE FUNCTIONS (for backward compatibility during migration)
// =============================================================================

import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
