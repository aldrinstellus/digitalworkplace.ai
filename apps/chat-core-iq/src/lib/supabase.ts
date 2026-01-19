import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for server-side operations (API routes)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =============================================================================
// TYPE DEFINITIONS - DCQ SCHEMA
// =============================================================================

// Bot Configuration
export interface Bot {
  id: string
  name: string
  description: string | null
  is_active: boolean
  welcome_message: string | null
  fallback_message: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Intent Recognition
export interface Intent {
  id: string
  bot_id: string | null
  name: string
  description: string | null
  is_active: boolean
  priority: number
  embedding: number[] | null
  created_at: string
  updated_at: string
}

export interface TrainingPhrase {
  id: string
  intent_id: string
  phrase: string
  language: string
  embedding: number[] | null
  created_at: string
}

export interface Entity {
  id: string
  bot_id: string | null
  name: string
  type: 'list' | 'regex' | 'system'
  values: string[]
  patterns: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface IntentResponse {
  id: string
  intent_id: string
  response_type: 'text' | 'card' | 'buttons' | 'carousel' | 'custom'
  content: Record<string, unknown>
  language: string
  priority: number
  conditions: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// FAQ Management
export interface FAQ {
  id: string
  bot_id: string | null
  question: string
  answer: string
  category: string | null
  url: string | null
  priority: 'low' | 'normal' | 'high' | 'critical'
  status: 'draft' | 'active' | 'archived'
  language: string
  tags: string[]
  view_count: number
  helpful_count: number
  not_helpful_count: number
  workflow_action: Record<string, unknown> | null
  embedding: number[] | null
  created_at: string
  updated_at: string
}

// Conversations & Messages
export interface Conversation {
  id: string
  bot_id: string | null
  session_id: string
  channel: 'web' | 'ivr' | 'sms' | 'whatsapp' | 'facebook' | 'instagram' | 'api'
  language: string
  user_id: string | null
  user_name: string | null
  user_email: string | null
  user_phone: string | null
  metadata: Record<string, unknown>
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent' | null
  escalated: boolean
  feedback_rating: number | null
  started_at: string
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  message_type: 'text' | 'audio' | 'image' | 'file' | 'action'
  intent_id: string | null
  confidence: number | null
  sources: Record<string, unknown>[]
  metadata: Record<string, unknown>
  embedding: number[] | null
  created_at: string
}

// Fallback & Feedback
export interface FallbackLog {
  id: string
  bot_id: string | null
  conversation_id: string | null
  user_input: string
  attempted_intent: string | null
  confidence: number | null
  fallback_response: string
  embedding: number[] | null
  resolved: boolean
  resolved_intent_id: string | null
  created_at: string
}

export interface Feedback {
  id: string
  conversation_id: string | null
  message_id: string | null
  rating: 'positive' | 'negative'
  comment: string | null
  tags: string[]
  created_at: string
}

// Admin Settings
export interface Settings {
  id: string
  bot_id: string | null
  category: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  bot_id: string | null
  title: string
  content: string
  type: 'info' | 'warning' | 'urgent' | 'maintenance'
  target_audience: 'all' | 'residents' | 'businesses' | 'visitors'
  language: string
  start_date: string
  end_date: string | null
  is_active: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface Escalation {
  id: string
  conversation_id: string | null
  bot_id: string | null
  user_name: string
  contact_method: 'email' | 'phone' | 'callback'
  contact_value: string
  reason: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  assigned_to: string | null
  notes: string | null
  requested_at: string
  resolved_at: string | null
  created_at: string
  updated_at: string
}

// Appointments & Services
export interface Appointment {
  id: string
  conversation_id: string | null
  bot_id: string | null
  service_type: string
  department: string | null
  user_name: string
  user_email: string | null
  user_phone: string | null
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  notes: string | null
  confirmation_sent: boolean
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface ServiceRequest {
  id: string
  conversation_id: string | null
  bot_id: string | null
  request_type: string
  category: string | null
  description: string
  user_name: string
  user_email: string | null
  user_phone: string | null
  address: string | null
  location_coords: { lat: number; lng: number } | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'submitted' | 'reviewing' | 'in_progress' | 'completed' | 'rejected'
  reference_number: string | null
  assigned_department: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
}

// Knowledge Base
export interface KnowledgeEntry {
  id: string
  bot_id: string | null
  title: string
  content: string
  section: string | null
  url: string | null
  source_type: 'manual' | 'crawled' | 'imported' | 'api'
  language: string
  tags: string[]
  is_active: boolean
  view_count: number
  embedding: number[] | null
  metadata: Record<string, unknown>
  last_verified: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  bot_id: string | null
  filename: string
  original_name: string
  file_type: 'pdf' | 'docx' | 'txt' | 'html' | 'csv' | 'xlsx'
  file_size: number
  storage_path: string | null
  chunk_count: number
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_error: string | null
  metadata: Record<string, unknown>
  uploaded_at: string
  processed_at: string | null
}

export interface CrawlerUrl {
  id: string
  bot_id: string | null
  url: string
  title: string | null
  section: string | null
  crawl_depth: number
  is_enabled: boolean
  is_custom: boolean
  language: string
  last_crawled: string | null
  last_status: 'success' | 'error' | 'pending' | 'never'
  last_error: string | null
  crawl_frequency: 'daily' | 'weekly' | 'monthly' | 'manual'
  content_hash: string | null
  created_at: string
  updated_at: string
}

// Audit & Notifications
export interface AuditLog {
  id: string
  bot_id: string | null
  user_id: string | null
  user_name: string | null
  action: string
  resource_type: string
  resource_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface Notification {
  id: string
  bot_id: string | null
  user_id: string | null
  type: 'system' | 'activity' | 'reminder' | 'alert' | 'escalation'
  category: string | null
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  link: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  created_at: string
}

// Cross-Channel
export interface CrossChannelToken {
  id: string
  token: string
  source_channel: string
  target_channel: string
  source_session_id: string
  conversation_data: Record<string, unknown>
  expires_at: string
  redeemed: boolean
  redeemed_at: string | null
  redeemed_session_id: string | null
  created_at: string
}

export interface Channel {
  id: string
  bot_id: string | null
  code: string
  name: string
  is_enabled: boolean
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Workflow & Configuration
export interface WorkflowCategory {
  id: string
  bot_id: string | null
  code: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkflowType {
  id: string
  category_id: string
  code: string
  name: string
  description: string | null
  form_schema: Record<string, unknown> | null
  requires_auth: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoutingRule {
  id: string
  bot_id: string | null
  name: string
  conditions: Record<string, unknown>
  action_type: 'transfer' | 'escalate' | 'workflow' | 'custom'
  action_config: Record<string, unknown>
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Language {
  id: string
  bot_id: string | null
  code: string
  name: string
  native_name: string | null
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BannerSettings {
  id: string
  bot_id: string | null
  is_enabled: boolean
  content: string | null
  background_color: string | null
  text_color: string | null
  link_url: string | null
  link_text: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface Analytics {
  id: string
  bot_id: string | null
  period_start: string
  period_end: string
  period_type: 'hourly' | 'daily' | 'weekly' | 'monthly'
  total_conversations: number
  total_messages: number
  unique_users: number
  avg_messages_per_conversation: number
  avg_session_duration_seconds: number
  intent_distribution: Record<string, number>
  sentiment_distribution: Record<string, number>
  channel_distribution: Record<string, number>
  language_distribution: Record<string, number>
  top_questions: Record<string, unknown>[]
  escalation_rate: number
  resolution_rate: number
  created_at: string
}

// =============================================================================
// HELPER FUNCTIONS - BOTS & SETTINGS
// =============================================================================

export async function getDefaultBot(): Promise<Bot | null> {
  const { data, error } = await supabase
    .from('dcq.bots')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching default bot:', error)
    return null
  }
  return data as Bot
}

export async function getSettings(category?: string, botId?: string): Promise<Settings[]> {
  let query = supabase.from('dcq.settings').select('*')

  if (category) query = query.eq('category', category)
  if (botId) query = query.eq('bot_id', botId)

  const { data, error } = await query.order('category')

  if (error) {
    console.error('Error fetching settings:', error)
    return []
  }
  return data as Settings[]
}

export async function updateSettings(
  category: string,
  settings: Record<string, unknown>,
  botId?: string
): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('dcq.settings')
    .upsert({
      bot_id: botId || null,
      category,
      settings,
      updated_at: new Date().toISOString()
    }, { onConflict: 'bot_id,category' })
    .select()
    .single()

  if (error) {
    console.error('Error updating settings:', error)
    return null
  }
  return data as Settings
}

export async function getBannerSettings(botId?: string): Promise<BannerSettings | null> {
  let query = supabase.from('dcq.banner_settings').select('*')
  if (botId) query = query.eq('bot_id', botId)
  else query = query.is('bot_id', null)

  const { data, error } = await query.limit(1).single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching banner settings:', error)
    return null
  }
  return data as BannerSettings | null
}

// =============================================================================
// HELPER FUNCTIONS - FAQS
// =============================================================================

export interface FAQFilter {
  category?: string
  status?: FAQ['status']
  language?: string
  url?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export async function getFAQs(options: FAQFilter = {}): Promise<FAQ[]> {
  let query = supabase
    .from('dcq.faqs')
    .select('*')

  if (options.category) query = query.eq('category', options.category)
  if (options.status) query = query.eq('status', options.status)
  if (options.language) query = query.eq('language', options.language)
  if (options.url) query = query.eq('url', options.url)
  if (options.tags && options.tags.length > 0) {
    query = query.overlaps('tags', options.tags)
  }

  query = query.order('priority', { ascending: false })
    .order('view_count', { ascending: false })

  if (options.limit) query = query.limit(options.limit)
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching FAQs:', error)
    return []
  }
  return data as FAQ[]
}

export async function getFAQById(id: string): Promise<FAQ | null> {
  const { data, error } = await supabase
    .from('dcq.faqs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching FAQ:', error)
    return null
  }
  return data as FAQ
}

export async function createFAQ(faq: Partial<FAQ>): Promise<FAQ | null> {
  const { data, error } = await supabase
    .from('dcq.faqs')
    .insert({
      ...faq,
      status: faq.status || 'draft',
      language: faq.language || 'en',
      tags: faq.tags || [],
      priority: faq.priority || 'normal'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating FAQ:', error)
    return null
  }
  return data as FAQ
}

export async function updateFAQ(id: string, updates: Partial<FAQ>): Promise<FAQ | null> {
  const { data, error } = await supabase
    .from('dcq.faqs')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating FAQ:', error)
    return null
  }
  return data as FAQ
}

export async function deleteFAQ(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('dcq.faqs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting FAQ:', error)
    return false
  }
  return true
}

export async function incrementFAQView(id: string): Promise<void> {
  await supabase.rpc('dcq.increment_faq_view', { faq_id: id })
}

export async function recordFAQFeedback(id: string, helpful: boolean): Promise<void> {
  await supabase.rpc('dcq.record_faq_feedback', { faq_id: id, is_helpful: helpful })
}

// =============================================================================
// HELPER FUNCTIONS - CONVERSATIONS & MESSAGES
// =============================================================================

export interface ConversationFilter {
  channel?: Conversation['channel']
  sessionId?: string
  escalated?: boolean
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export async function getConversations(options: ConversationFilter = {}): Promise<Conversation[]> {
  let query = supabase
    .from('dcq.conversations')
    .select('*')

  if (options.channel) query = query.eq('channel', options.channel)
  if (options.sessionId) query = query.eq('session_id', options.sessionId)
  if (options.escalated !== undefined) query = query.eq('escalated', options.escalated)
  if (options.dateFrom) query = query.gte('created_at', options.dateFrom)
  if (options.dateTo) query = query.lte('created_at', options.dateTo)

  query = query.order('created_at', { ascending: false })

  if (options.limit) query = query.limit(options.limit)
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
  return data as Conversation[]
}

export async function getConversationBySessionId(sessionId: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('dcq.conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching conversation:', error)
    return null
  }
  return data as Conversation | null
}

export async function createConversation(conversation: Partial<Conversation>): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('dcq.conversations')
    .insert({
      session_id: conversation.session_id || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      channel: conversation.channel || 'web',
      language: conversation.language || 'en',
      metadata: conversation.metadata || {},
      ...conversation
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }
  return data as Conversation
}

export async function updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('dcq.conversations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating conversation:', error)
    return null
  }
  return data as Conversation
}

export async function endConversation(id: string): Promise<Conversation | null> {
  return updateConversation(id, { ended_at: new Date().toISOString() })
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('dcq.messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }
  return data as Message[]
}

export async function addMessage(message: Partial<Message>): Promise<Message | null> {
  const { data, error } = await supabase
    .from('dcq.messages')
    .insert({
      conversation_id: message.conversation_id,
      role: message.role || 'user',
      content: message.content || '',
      message_type: message.message_type || 'text',
      sources: message.sources || [],
      metadata: message.metadata || {},
      ...message
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding message:', error)
    return null
  }
  return data as Message
}

// =============================================================================
// HELPER FUNCTIONS - KNOWLEDGE BASE
// =============================================================================

export interface KnowledgeFilter {
  section?: string
  sourceType?: KnowledgeEntry['source_type']
  language?: string
  isActive?: boolean
  tags?: string[]
  limit?: number
  offset?: number
}

export async function getKnowledgeEntries(options: KnowledgeFilter = {}): Promise<KnowledgeEntry[]> {
  let query = supabase
    .from('dcq.knowledge_entries')
    .select('*')

  if (options.section) query = query.eq('section', options.section)
  if (options.sourceType) query = query.eq('source_type', options.sourceType)
  if (options.language) query = query.eq('language', options.language)
  if (options.isActive !== undefined) query = query.eq('is_active', options.isActive)
  if (options.tags && options.tags.length > 0) {
    query = query.overlaps('tags', options.tags)
  }

  query = query.order('view_count', { ascending: false })

  if (options.limit) query = query.limit(options.limit)
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching knowledge entries:', error)
    return []
  }
  return data as KnowledgeEntry[]
}

export async function getKnowledgeById(id: string): Promise<KnowledgeEntry | null> {
  const { data, error } = await supabase
    .from('dcq.knowledge_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching knowledge entry:', error)
    return null
  }
  return data as KnowledgeEntry
}

export async function createKnowledgeEntry(entry: Partial<KnowledgeEntry>): Promise<KnowledgeEntry | null> {
  const { data, error } = await supabase
    .from('dcq.knowledge_entries')
    .insert({
      ...entry,
      source_type: entry.source_type || 'manual',
      language: entry.language || 'en',
      tags: entry.tags || [],
      is_active: entry.is_active !== false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating knowledge entry:', error)
    return null
  }
  return data as KnowledgeEntry
}

export async function updateKnowledgeEntry(id: string, updates: Partial<KnowledgeEntry>): Promise<KnowledgeEntry | null> {
  const { data, error } = await supabase
    .from('dcq.knowledge_entries')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating knowledge entry:', error)
    return null
  }
  return data as KnowledgeEntry
}

export async function deleteKnowledgeEntry(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('dcq.knowledge_entries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting knowledge entry:', error)
    return false
  }
  return true
}

// =============================================================================
// HELPER FUNCTIONS - ANNOUNCEMENTS
// =============================================================================

export interface AnnouncementFilter {
  type?: Announcement['type']
  targetAudience?: Announcement['target_audience']
  language?: string
  active?: boolean
  limit?: number
}

export async function getAnnouncements(options: AnnouncementFilter = {}): Promise<Announcement[]> {
  let query = supabase
    .from('dcq.announcements')
    .select('*')

  if (options.type) query = query.eq('type', options.type)
  if (options.targetAudience) query = query.eq('target_audience', options.targetAudience)
  if (options.language) query = query.eq('language', options.language)
  if (options.active !== undefined) query = query.eq('is_active', options.active)

  // Filter by date range for active announcements
  if (options.active) {
    const now = new Date().toISOString()
    query = query.lte('start_date', now).or(`end_date.is.null,end_date.gte.${now}`)
  }

  query = query.order('start_date', { ascending: false })

  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching announcements:', error)
    return []
  }
  return data as Announcement[]
}

export async function getActiveAnnouncements(language?: string): Promise<Announcement[]> {
  return getAnnouncements({ active: true, language, limit: 10 })
}

export async function createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from('dcq.announcements')
    .insert({
      ...announcement,
      type: announcement.type || 'info',
      target_audience: announcement.target_audience || 'all',
      language: announcement.language || 'en',
      is_active: announcement.is_active !== false,
      start_date: announcement.start_date || new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating announcement:', error)
    return null
  }
  return data as Announcement
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from('dcq.announcements')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating announcement:', error)
    return null
  }
  return data as Announcement
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('dcq.announcements')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting announcement:', error)
    return false
  }
  return true
}

// =============================================================================
// HELPER FUNCTIONS - ESCALATIONS
// =============================================================================

export interface EscalationFilter {
  status?: Escalation['status']
  priority?: Escalation['priority']
  assignedTo?: string
  limit?: number
  offset?: number
}

export async function getEscalations(options: EscalationFilter = {}): Promise<Escalation[]> {
  let query = supabase
    .from('dcq.escalations')
    .select('*')

  if (options.status) query = query.eq('status', options.status)
  if (options.priority) query = query.eq('priority', options.priority)
  if (options.assignedTo) query = query.eq('assigned_to', options.assignedTo)

  query = query.order('requested_at', { ascending: false })

  if (options.limit) query = query.limit(options.limit)
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching escalations:', error)
    return []
  }
  return data as Escalation[]
}

export async function createEscalation(escalation: Partial<Escalation>): Promise<Escalation | null> {
  const { data, error } = await supabase
    .from('dcq.escalations')
    .insert({
      ...escalation,
      status: 'pending',
      priority: escalation.priority || 'normal',
      requested_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating escalation:', error)
    return null
  }
  return data as Escalation
}

export async function updateEscalation(id: string, updates: Partial<Escalation>): Promise<Escalation | null> {
  const updateData: Partial<Escalation> = {
    ...updates,
    updated_at: new Date().toISOString()
  }

  // Auto-set resolved_at when status changes to resolved/closed
  if (updates.status === 'resolved' || updates.status === 'closed') {
    updateData.resolved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('dcq.escalations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating escalation:', error)
    return null
  }
  return data as Escalation
}

// =============================================================================
// HELPER FUNCTIONS - NOTIFICATIONS
// =============================================================================

export interface NotificationFilter {
  type?: Notification['type']
  severity?: Notification['severity']
  isRead?: boolean
  userId?: string
  limit?: number
}

export async function getNotifications(options: NotificationFilter = {}): Promise<Notification[]> {
  let query = supabase
    .from('dcq.notifications')
    .select('*')

  if (options.type) query = query.eq('type', options.type)
  if (options.severity) query = query.eq('severity', options.severity)
  if (options.isRead !== undefined) query = query.eq('is_read', options.isRead)
  if (options.userId) query = query.eq('user_id', options.userId)

  query = query.order('created_at', { ascending: false })

  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
  return data as Notification[]
}

export async function getUnreadNotifications(userId?: string): Promise<Notification[]> {
  return getNotifications({ isRead: false, userId, limit: 50 })
}

export async function createNotification(notification: Partial<Notification>): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('dcq.notifications')
    .insert({
      ...notification,
      type: notification.type || 'system',
      severity: notification.severity || 'info',
      metadata: notification.metadata || {},
      is_read: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return null
  }
  return data as Notification
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('dcq.notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    console.error('Error marking notification read:', error)
    return false
  }
  return true
}

export async function markAllNotificationsRead(userId?: string): Promise<boolean> {
  let query = supabase
    .from('dcq.notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('is_read', false)

  if (userId) query = query.eq('user_id', userId)

  const { error } = await query

  if (error) {
    console.error('Error marking all notifications read:', error)
    return false
  }
  return true
}

// =============================================================================
// HELPER FUNCTIONS - AUDIT LOGS
// =============================================================================

export async function logAuditAction(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: { oldValue?: Record<string, unknown>; newValue?: Record<string, unknown>; userName?: string; userId?: string }
): Promise<void> {
  await supabase.from('dcq.audit_logs').insert({
    action,
    resource_type: resourceType,
    resource_id: resourceId || null,
    old_value: details?.oldValue || null,
    new_value: details?.newValue || null,
    user_name: details?.userName || null,
    user_id: details?.userId || null
  })
}

export async function getAuditLogs(options: {
  resourceType?: string
  resourceId?: string
  action?: string
  limit?: number
  offset?: number
} = {}): Promise<AuditLog[]> {
  let query = supabase
    .from('dcq.audit_logs')
    .select('*')

  if (options.resourceType) query = query.eq('resource_type', options.resourceType)
  if (options.resourceId) query = query.eq('resource_id', options.resourceId)
  if (options.action) query = query.eq('action', options.action)

  query = query.order('created_at', { ascending: false })

  if (options.limit) query = query.limit(options.limit)
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
  return data as AuditLog[]
}

// =============================================================================
// HELPER FUNCTIONS - CROSS-CHANNEL TOKENS (IVR <-> WEB)
// =============================================================================

export async function createCrossChannelToken(
  sourceChannel: string,
  targetChannel: string,
  sourceSessionId: string,
  conversationData: Record<string, unknown>,
  expiresInMinutes: number = 15
): Promise<CrossChannelToken | null> {
  const token = generateToken(6)
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('dcq.cross_channel_tokens')
    .insert({
      token,
      source_channel: sourceChannel,
      target_channel: targetChannel,
      source_session_id: sourceSessionId,
      conversation_data: conversationData,
      expires_at: expiresAt,
      redeemed: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating cross-channel token:', error)
    return null
  }
  return data as CrossChannelToken
}

export async function redeemCrossChannelToken(
  token: string,
  redeemedSessionId: string
): Promise<CrossChannelToken | null> {
  // First check if token exists and is valid
  const { data: existing, error: checkError } = await supabase
    .from('dcq.cross_channel_tokens')
    .select('*')
    .eq('token', token.toUpperCase())
    .eq('redeemed', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (checkError || !existing) {
    console.error('Token not found or expired:', checkError)
    return null
  }

  // Mark as redeemed
  const { data, error } = await supabase
    .from('dcq.cross_channel_tokens')
    .update({
      redeemed: true,
      redeemed_at: new Date().toISOString(),
      redeemed_session_id: redeemedSessionId
    })
    .eq('id', existing.id)
    .select()
    .single()

  if (error) {
    console.error('Error redeeming token:', error)
    return null
  }
  return data as CrossChannelToken
}

export async function getTokenByCode(token: string): Promise<CrossChannelToken | null> {
  const { data, error } = await supabase
    .from('dcq.cross_channel_tokens')
    .select('*')
    .eq('token', token.toUpperCase())
    .single()

  if (error) {
    console.error('Error fetching token:', error)
    return null
  }
  return data as CrossChannelToken
}

function generateToken(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// =============================================================================
// HELPER FUNCTIONS - SEMANTIC SEARCH (PGVECTOR)
// =============================================================================

export interface SearchResult {
  source_type: 'faq' | 'knowledge'
  id: string
  title: string
  content: string
  url: string | null
  similarity: number
}

export async function searchFAQsSemantic(
  queryEmbedding: number[],
  options: {
    matchThreshold?: number
    maxResults?: number
    language?: string
    category?: string
  } = {}
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('dcq.search_faqs_semantic', {
    query_embedding: queryEmbedding,
    match_threshold: options.matchThreshold || 0.3,
    max_results: options.maxResults || 5,
    filter_language: options.language || 'en',
    filter_category: options.category || null
  })

  if (error) {
    console.error('Error in semantic FAQ search:', error)
    return []
  }
  return data as SearchResult[]
}

export async function searchKnowledgeSemantic(
  queryEmbedding: number[],
  options: {
    matchThreshold?: number
    maxResults?: number
    language?: string
    section?: string
  } = {}
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('dcq.search_knowledge_semantic', {
    query_embedding: queryEmbedding,
    match_threshold: options.matchThreshold || 0.3,
    max_results: options.maxResults || 5,
    filter_language: options.language || 'en',
    filter_section: options.section || null
  })

  if (error) {
    console.error('Error in semantic knowledge search:', error)
    return []
  }
  return data as SearchResult[]
}

export async function searchFAQsHybrid(
  searchQuery: string,
  queryEmbedding: number[],
  options: {
    matchThreshold?: number
    maxResults?: number
    language?: string
    semanticWeight?: number
  } = {}
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('dcq.search_faqs_hybrid', {
    search_query: searchQuery,
    query_embedding: queryEmbedding,
    match_threshold: options.matchThreshold || 0.2,
    max_results: options.maxResults || 10,
    filter_language: options.language || 'en',
    semantic_weight: options.semanticWeight || 0.6
  })

  if (error) {
    console.error('Error in hybrid FAQ search:', error)
    return []
  }
  return data as SearchResult[]
}

export async function getChatContext(
  queryEmbedding: number[],
  options: {
    matchThreshold?: number
    maxResults?: number
    language?: string
  } = {}
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('dcq.get_chat_context', {
    query_embedding: queryEmbedding,
    match_threshold: options.matchThreshold || 0.3,
    max_results: options.maxResults || 5,
    filter_language: options.language || 'en'
  })

  if (error) {
    console.error('Error getting chat context:', error)
    return []
  }
  return data as SearchResult[]
}

export async function findSimilarFallbacks(
  queryEmbedding: number[],
  options: {
    matchThreshold?: number
    maxResults?: number
  } = {}
): Promise<FallbackLog[]> {
  const { data, error } = await supabase.rpc('dcq.find_similar_fallbacks', {
    query_embedding: queryEmbedding,
    match_threshold: options.matchThreshold || 0.5,
    max_results: options.maxResults || 5
  })

  if (error) {
    console.error('Error finding similar fallbacks:', error)
    return []
  }
  return data as FallbackLog[]
}

// =============================================================================
// HELPER FUNCTIONS - LANGUAGES
// =============================================================================

export async function getLanguages(activeOnly: boolean = true): Promise<Language[]> {
  let query = supabase
    .from('dcq.languages')
    .select('*')

  if (activeOnly) query = query.eq('is_active', true)

  query = query.order('is_default', { ascending: false }).order('name')

  const { data, error } = await query

  if (error) {
    console.error('Error fetching languages:', error)
    return []
  }
  return data as Language[]
}

export async function getDefaultLanguage(): Promise<Language | null> {
  const { data, error } = await supabase
    .from('dcq.languages')
    .select('*')
    .eq('is_default', true)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching default language:', error)
    return null
  }
  return data as Language
}

// =============================================================================
// HELPER FUNCTIONS - CHANNELS
// =============================================================================

export async function getChannels(enabledOnly: boolean = true): Promise<Channel[]> {
  let query = supabase
    .from('dcq.channels')
    .select('*')

  if (enabledOnly) query = query.eq('is_enabled', true)

  query = query.order('code')

  const { data, error } = await query

  if (error) {
    console.error('Error fetching channels:', error)
    return []
  }
  return data as Channel[]
}

// =============================================================================
// HELPER FUNCTIONS - WORKFLOW CATEGORIES & TYPES
// =============================================================================

export async function getWorkflowCategories(activeOnly: boolean = true): Promise<WorkflowCategory[]> {
  let query = supabase
    .from('dcq.workflow_categories')
    .select('*')

  if (activeOnly) query = query.eq('is_active', true)

  query = query.order('display_order').order('name')

  const { data, error } = await query

  if (error) {
    console.error('Error fetching workflow categories:', error)
    return []
  }
  return data as WorkflowCategory[]
}

export async function getWorkflowTypes(categoryId?: string, activeOnly: boolean = true): Promise<WorkflowType[]> {
  let query = supabase
    .from('dcq.workflow_types')
    .select('*')

  if (categoryId) query = query.eq('category_id', categoryId)
  if (activeOnly) query = query.eq('is_active', true)

  query = query.order('name')

  const { data, error } = await query

  if (error) {
    console.error('Error fetching workflow types:', error)
    return []
  }
  return data as WorkflowType[]
}

// =============================================================================
// HELPER FUNCTIONS - FEEDBACK & FALLBACKS
// =============================================================================

export async function createFeedback(feedback: Partial<Feedback>): Promise<Feedback | null> {
  const { data, error } = await supabase
    .from('dcq.feedback')
    .insert({
      ...feedback,
      tags: feedback.tags || []
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating feedback:', error)
    return null
  }
  return data as Feedback
}

export async function logFallback(fallback: Partial<FallbackLog>): Promise<FallbackLog | null> {
  const { data, error } = await supabase
    .from('dcq.fallback_logs')
    .insert({
      ...fallback,
      resolved: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error logging fallback:', error)
    return null
  }
  return data as FallbackLog
}

export async function resolveFallback(id: string, resolvedIntentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('dcq.fallback_logs')
    .update({
      resolved: true,
      resolved_intent_id: resolvedIntentId
    })
    .eq('id', id)

  if (error) {
    console.error('Error resolving fallback:', error)
    return false
  }
  return true
}

// =============================================================================
// HELPER FUNCTIONS - DOCUMENTS & CRAWLER
// =============================================================================

export async function getDocuments(options: {
  status?: Document['processing_status']
  fileType?: Document['file_type']
  limit?: number
} = {}): Promise<Document[]> {
  let query = supabase
    .from('dcq.documents')
    .select('*')

  if (options.status) query = query.eq('processing_status', options.status)
  if (options.fileType) query = query.eq('file_type', options.fileType)

  query = query.order('uploaded_at', { ascending: false })

  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }
  return data as Document[]
}

export async function getCrawlerUrls(options: {
  enabled?: boolean
  section?: string
  status?: CrawlerUrl['last_status']
  limit?: number
} = {}): Promise<CrawlerUrl[]> {
  let query = supabase
    .from('dcq.crawler_urls')
    .select('*')

  if (options.enabled !== undefined) query = query.eq('is_enabled', options.enabled)
  if (options.section) query = query.eq('section', options.section)
  if (options.status) query = query.eq('last_status', options.status)

  query = query.order('section').order('url')

  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching crawler URLs:', error)
    return []
  }
  return data as CrawlerUrl[]
}

export async function updateCrawlerUrl(id: string, updates: Partial<CrawlerUrl>): Promise<CrawlerUrl | null> {
  const { data, error } = await supabase
    .from('dcq.crawler_urls')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating crawler URL:', error)
    return null
  }
  return data as CrawlerUrl
}

// =============================================================================
// HELPER FUNCTIONS - APPOINTMENTS & SERVICE REQUESTS
// =============================================================================

export async function createAppointment(appointment: Partial<Appointment>): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('dcq.appointments')
    .insert({
      ...appointment,
      status: 'pending',
      confirmation_sent: false,
      reminder_sent: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating appointment:', error)
    return null
  }
  return data as Appointment
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('dcq.appointments')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating appointment:', error)
    return null
  }
  return data as Appointment
}

export async function createServiceRequest(request: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
  // Generate reference number
  const refNumber = `SR-${Date.now().toString(36).toUpperCase()}`

  const { data, error } = await supabase
    .from('dcq.service_requests')
    .insert({
      ...request,
      status: 'submitted',
      priority: request.priority || 'normal',
      reference_number: refNumber
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating service request:', error)
    return null
  }
  return data as ServiceRequest
}

export async function updateServiceRequest(id: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
  const { data, error } = await supabase
    .from('dcq.service_requests')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating service request:', error)
    return null
  }
  return data as ServiceRequest
}

// =============================================================================
// CROSS-PROJECT SEARCH (via public.knowledge_items)
// =============================================================================

export async function searchCrossProject(
  searchQuery: string,
  options: {
    projectCodes?: string[]
    itemTypes?: string[]
    maxResults?: number
  } = {}
): Promise<Array<{
  id: string
  project_code: string
  type: string
  title: string
  content: string
  url: string | null
  tags: string[]
  rank: number
}>> {
  const { data, error } = await supabase.rpc('search_knowledge', {
    search_query: searchQuery,
    project_codes: options.projectCodes || null,
    item_types: options.itemTypes || null,
    max_results: options.maxResults || 20
  })

  if (error) {
    console.error('Error in cross-project search:', error)
    return []
  }
  return data || []
}
