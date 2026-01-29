/**
 * Direct Messaging System
 * Handles DMs and group chats for employee communication
 *
 * V2.0 Feature: Direct Messaging - EPIC 9
 */

import { createClient } from '@supabase/supabase-js';
import { UserContext } from './rbac';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// Types
// ============================================================================

export type ConversationType = 'direct' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string; // For group chats
  description?: string;
  participants: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  last_message_preview?: string;
  metadata?: Record<string, unknown>;
  // Joined data
  participant_details?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    is_online?: boolean;
  }[];
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'system';
  attachments?: MessageAttachment[];
  reply_to_id?: string;
  edited_at?: string;
  deleted_at?: string;
  read_by: string[];
  created_at: string;
  metadata?: Record<string, unknown>;
  // Joined data
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  reply_to?: Message;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  started_at: string;
}

export interface ReadReceipt {
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface CreateConversationInput {
  type: ConversationType;
  participants: string[];
  name?: string;
  description?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'file' | 'image';
  attachments?: MessageAttachment[];
  replyToId?: string;
}

// ============================================================================
// Conversation Functions
// ============================================================================

/**
 * Create a new conversation (DM or group)
 */
export async function createConversation(
  userContext: UserContext,
  input: CreateConversationInput
): Promise<Conversation> {
  const { type, participants, name, description } = input;

  // Ensure creator is in participants
  const allParticipants = [...new Set([userContext.userId, ...participants])];

  // For DMs, check if conversation already exists
  if (type === 'direct' && allParticipants.length === 2) {
    const existingConvo = await findDirectConversation(
      allParticipants[0],
      allParticipants[1]
    );
    if (existingConvo) {
      return existingConvo;
    }
  }

  // Validate participants exist
  const { data: validUsers } = await supabase
    .from('users')
    .select('id')
    .in('id', allParticipants);

  if (!validUsers || validUsers.length !== allParticipants.length) {
    throw new Error('One or more participants not found');
  }

  // Create conversation
  const { data: conversation, error } = await supabase
    .schema('diq')
    .from('conversations')
    .insert({
      type,
      name: type === 'group' ? name : null,
      description: type === 'group' ? description : null,
      participants: allParticipants,
      created_by: userContext.userId,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }

  // Create participant records
  const participantRecords = allParticipants.map(userId => ({
    conversation_id: conversation.id,
    user_id: userId,
    joined_at: new Date().toISOString(),
    role: userId === userContext.userId ? 'admin' : 'member',
  }));

  await supabase
    .schema('diq')
    .from('conversation_participants')
    .insert(participantRecords);

  // Notify participants
  await notifyConversationParticipants(
    conversation,
    userContext.userId,
    'added_to_conversation',
    allParticipants.filter(p => p !== userContext.userId)
  );

  return conversation;
}

/**
 * Find existing direct conversation between two users
 */
async function findDirectConversation(
  userId1: string,
  userId2: string
): Promise<Conversation | null> {
  const { data } = await supabase
    .schema('diq')
    .from('conversations')
    .select('*')
    .eq('type', 'direct')
    .contains('participants', [userId1, userId2])
    .limit(1);

  if (data && data.length > 0) {
    // Verify it's exactly these two users
    const convo = data[0];
    if (convo.participants.length === 2 &&
        convo.participants.includes(userId1) &&
        convo.participants.includes(userId2)) {
      return convo;
    }
  }

  return null;
}

/**
 * Get user's conversations
 */
export async function getUserConversations(
  userContext: UserContext,
  options?: { type?: ConversationType; limit?: number; offset?: number }
): Promise<{ conversations: Conversation[]; total: number }> {
  let query = supabase
    .schema('diq')
    .from('conversations')
    .select('*', { count: 'exact' })
    .contains('participants', [userContext.userId])
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (options?.type) {
    query = query.eq('type', options.type);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error('Failed to fetch conversations');
  }

  // Enrich with participant details and unread counts
  const enrichedConversations = await Promise.all(
    (data || []).map(async (convo) => {
      // Get participant details
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', convo.participants);

      // Get unread count
      const { count: unreadCount } = await supabase
        .schema('diq')
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('conversation_id', convo.id)
        .not('read_by', 'cs', `{${userContext.userId}}`);

      return {
        ...convo,
        participant_details: users || [],
        unread_count: unreadCount || 0,
      };
    })
  );

  return {
    conversations: enrichedConversations,
    total: count || 0,
  };
}

/**
 * Get a specific conversation
 */
export async function getConversation(
  userContext: UserContext,
  conversationId: string
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .schema('diq')
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if user is a participant
  if (!data.participants.includes(userContext.userId)) {
    throw new Error('Not a participant in this conversation');
  }

  // Enrich with participant details
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, avatar_url')
    .in('id', data.participants);

  return {
    ...data,
    participant_details: users || [],
  };
}

/**
 * Leave a conversation (group only)
 */
export async function leaveConversation(
  userContext: UserContext,
  conversationId: string
): Promise<void> {
  const { data: conversation, error } = await supabase
    .schema('diq')
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error || !conversation) {
    throw new Error('Conversation not found');
  }

  if (conversation.type !== 'group') {
    throw new Error('Cannot leave a direct conversation');
  }

  if (!conversation.participants.includes(userContext.userId)) {
    throw new Error('Not a participant');
  }

  // Remove user from participants
  const newParticipants = conversation.participants.filter(
    (p: string) => p !== userContext.userId
  );

  if (newParticipants.length === 0) {
    // Delete conversation if no participants left
    await supabase
      .schema('diq')
      .from('conversations')
      .delete()
      .eq('id', conversationId);
  } else {
    // Update participants
    await supabase
      .schema('diq')
      .from('conversations')
      .update({ participants: newParticipants })
      .eq('id', conversationId);
  }

  // Remove participant record
  await supabase
    .schema('diq')
    .from('conversation_participants')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('user_id', userContext.userId);

  // Add system message
  await sendMessage(
    { userId: 'system', email: '', role: 'super_admin', isAdmin: true, isSuperAdmin: true },
    {
      conversationId,
      content: `${userContext.email} left the conversation`,
      messageType: 'text',
    },
    true
  );
}

// ============================================================================
// Message Functions
// ============================================================================

/**
 * Send a message
 */
export async function sendMessage(
  userContext: UserContext,
  input: SendMessageInput,
  isSystemMessage: boolean = false
): Promise<Message> {
  const { conversationId, content, messageType = 'text', attachments, replyToId } = input;

  // Verify user is a participant (unless system message)
  if (!isSystemMessage) {
    const { data: conversation } = await supabase
      .schema('diq')
      .from('conversations')
      .select('participants')
      .eq('id', conversationId)
      .single();

    if (!conversation || !conversation.participants.includes(userContext.userId)) {
      throw new Error('Not a participant in this conversation');
    }
  }

  // Create message
  const { data: message, error } = await supabase
    .schema('diq')
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: isSystemMessage ? null : userContext.userId,
      content,
      message_type: isSystemMessage ? 'system' : messageType,
      attachments,
      reply_to_id: replyToId,
      read_by: isSystemMessage ? [] : [userContext.userId],
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }

  // Update conversation
  await supabase
    .schema('diq')
    .from('conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content.slice(0, 100),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  // Notify other participants
  if (!isSystemMessage) {
    const { data: conversation } = await supabase
      .schema('diq')
      .from('conversations')
      .select('participants')
      .eq('id', conversationId)
      .single();

    if (conversation) {
      await notifyNewMessage(
        message,
        conversation.participants.filter((p: string) => p !== userContext.userId)
      );
    }
  }

  return message;
}

/**
 * Get messages in a conversation
 */
export async function getMessages(
  userContext: UserContext,
  conversationId: string,
  options?: { limit?: number; before?: string; after?: string }
): Promise<{ messages: Message[]; hasMore: boolean }> {
  // Verify participation
  const { data: conversation } = await supabase
    .schema('diq')
    .from('conversations')
    .select('participants')
    .eq('id', conversationId)
    .single();

  if (!conversation || !conversation.participants.includes(userContext.userId)) {
    throw new Error('Not a participant in this conversation');
  }

  const limit = options?.limit || 50;

  let query = supabase
    .schema('diq')
    .from('messages')
    .select(`
      *,
      sender:sender_id(id, full_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (options?.before) {
    query = query.lt('created_at', options.before);
  }

  if (options?.after) {
    query = query.gt('created_at', options.after);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Failed to fetch messages');
  }

  const messages = data || [];
  const hasMore = messages.length > limit;

  if (hasMore) {
    messages.pop();
  }

  return {
    messages: messages.reverse(),
    hasMore,
  };
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  userContext: UserContext,
  conversationId: string,
  messageIds?: string[]
): Promise<void> {
  // Verify participation
  const { data: conversation } = await supabase
    .schema('diq')
    .from('conversations')
    .select('participants')
    .eq('id', conversationId)
    .single();

  if (!conversation || !conversation.participants.includes(userContext.userId)) {
    throw new Error('Not a participant in this conversation');
  }

  // Get unread messages
  let query = supabase
    .schema('diq')
    .from('messages')
    .select('id, read_by')
    .eq('conversation_id', conversationId)
    .not('read_by', 'cs', `{${userContext.userId}}`);

  if (messageIds && messageIds.length > 0) {
    query = query.in('id', messageIds);
  }

  const { data: unreadMessages } = await query;

  if (!unreadMessages || unreadMessages.length === 0) {
    return;
  }

  // Update each message
  for (const msg of unreadMessages) {
    const newReadBy = [...(msg.read_by || []), userContext.userId];
    await supabase
      .schema('diq')
      .from('messages')
      .update({ read_by: newReadBy })
      .eq('id', msg.id);
  }
}

/**
 * Edit a message
 */
export async function editMessage(
  userContext: UserContext,
  messageId: string,
  newContent: string
): Promise<Message> {
  // Get message
  const { data: message, error } = await supabase
    .schema('diq')
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (error || !message) {
    throw new Error('Message not found');
  }

  // Verify sender
  if (message.sender_id !== userContext.userId) {
    throw new Error('Can only edit your own messages');
  }

  // Can't edit system messages
  if (message.message_type === 'system') {
    throw new Error('Cannot edit system messages');
  }

  // Update message
  const { data: updated, error: updateError } = await supabase
    .schema('diq')
    .from('messages')
    .update({
      content: newContent,
      edited_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select('*')
    .single();

  if (updateError) {
    throw new Error('Failed to edit message');
  }

  return updated;
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(
  userContext: UserContext,
  messageId: string
): Promise<void> {
  // Get message
  const { data: message, error } = await supabase
    .schema('diq')
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (error || !message) {
    throw new Error('Message not found');
  }

  // Verify sender or admin
  if (message.sender_id !== userContext.userId && !userContext.isAdmin) {
    throw new Error('Not authorized to delete this message');
  }

  // Soft delete
  await supabase
    .schema('diq')
    .from('messages')
    .update({
      deleted_at: new Date().toISOString(),
      content: '[Message deleted]',
    })
    .eq('id', messageId);
}

// ============================================================================
// Typing Indicators
// ============================================================================

/**
 * Set typing indicator
 */
export async function setTypingIndicator(
  userContext: UserContext,
  conversationId: string,
  isTyping: boolean
): Promise<void> {
  if (isTyping) {
    await supabase
      .schema('diq')
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: userContext.userId,
        started_at: new Date().toISOString(),
      });
  } else {
    await supabase
      .schema('diq')
      .from('typing_indicators')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userContext.userId);
  }
}

/**
 * Get typing indicators for a conversation
 */
export async function getTypingIndicators(
  conversationId: string
): Promise<TypingIndicator[]> {
  const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();

  const { data } = await supabase
    .schema('diq')
    .from('typing_indicators')
    .select('*')
    .eq('conversation_id', conversationId)
    .gt('started_at', fiveSecondsAgo);

  return data || [];
}

// ============================================================================
// Notification Functions
// ============================================================================

async function notifyConversationParticipants(
  conversation: Conversation,
  actorId: string,
  action: string,
  targetUserIds: string[]
): Promise<void> {
  if (targetUserIds.length === 0) return;

  const { data: actor } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', actorId)
    .single();

  const notifications = targetUserIds.map(userId => ({
    user_id: userId,
    type: 'conversation',
    title: action === 'added_to_conversation'
      ? 'Added to Conversation'
      : 'Conversation Update',
    message: action === 'added_to_conversation'
      ? `${actor?.full_name || 'Someone'} added you to ${conversation.type === 'group' ? `"${conversation.name}"` : 'a conversation'}`
      : `Update in ${conversation.type === 'group' ? `"${conversation.name}"` : 'conversation'}`,
    link: `/diq/messages/${conversation.id}`,
    metadata: {
      conversation_id: conversation.id,
      action,
    },
  }));

  await supabase.schema('diq').from('notifications').insert(notifications);
}

async function notifyNewMessage(
  message: Message,
  recipientIds: string[]
): Promise<void> {
  if (recipientIds.length === 0) return;

  const { data: sender } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', message.sender_id)
    .single();

  const notifications = recipientIds.map(userId => ({
    user_id: userId,
    type: 'new_message',
    title: 'New Message',
    message: `${sender?.full_name || 'Someone'}: ${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}`,
    link: `/diq/messages/${message.conversation_id}`,
    metadata: {
      conversation_id: message.conversation_id,
      message_id: message.id,
      sender_id: message.sender_id,
    },
  }));

  await supabase.schema('diq').from('notifications').insert(notifications);
}
