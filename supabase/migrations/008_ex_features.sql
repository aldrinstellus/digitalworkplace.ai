-- =============================================================================
-- Migration 008: EX (Employee Experience) Features
-- Adds notifications, reactions, recognitions, polls, channels, and celebrations
-- =============================================================================

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

-- Main notifications table
CREATE TABLE IF NOT EXISTS diq.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'mention', 'reaction', 'comment', 'assignment', 'system', 'reminder'
  entity_type VARCHAR(50), -- 'post', 'article', 'comment', 'event', 'workflow', 'task'
  entity_id UUID,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- who triggered the notification
  title TEXT NOT NULL,
  message TEXT,
  link VARCHAR(500), -- URL to navigate to
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON diq.notifications(user_id);
CREATE INDEX idx_notifications_read ON diq.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON diq.notifications(created_at DESC);
CREATE INDEX idx_notifications_entity ON diq.notifications(entity_type, entity_id);

-- Notification preferences
CREATE TABLE IF NOT EXISTS diq.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  -- Notification channels
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  -- Notification types
  mentions BOOLEAN DEFAULT TRUE,
  reactions BOOLEAN DEFAULT TRUE,
  comments BOOLEAN DEFAULT TRUE,
  direct_messages BOOLEAN DEFAULT TRUE,
  assignments BOOLEAN DEFAULT TRUE,
  reminders BOOLEAN DEFAULT TRUE,
  news_updates BOOLEAN DEFAULT TRUE,
  event_reminders BOOLEAN DEFAULT TRUE,
  system_alerts BOOLEAN DEFAULT TRUE,
  -- Digest settings
  digest_frequency VARCHAR(20) DEFAULT 'daily', -- 'instant', 'hourly', 'daily', 'weekly', 'none'
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- REACTIONS
-- =============================================================================

-- Unified reactions table for all entity types
CREATE TABLE IF NOT EXISTS diq.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'article', 'message'
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  emoji VARCHAR(20) NOT NULL, -- emoji code like ':thumbsup:', ':heart:', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, user_id, emoji) -- One reaction type per user per entity
);

-- Indexes for reactions
CREATE INDEX idx_reactions_entity ON diq.reactions(entity_type, entity_id);
CREATE INDEX idx_reactions_user ON diq.reactions(user_id);

-- =============================================================================
-- RECOGNITIONS / SHOUT-OUTS
-- =============================================================================

-- Recognition posts
CREATE TABLE IF NOT EXISTS diq.recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES diq.news_posts(id) ON DELETE SET NULL, -- Link to news post if created as one
  type VARCHAR(50) NOT NULL DEFAULT 'shoutout', -- 'shoutout', 'kudos', 'thanks', 'milestone', 'award'
  message TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}', -- e.g., 'teamwork', 'innovation', 'customer-focus'
  is_public BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recognition recipients (many-to-many)
CREATE TABLE IF NOT EXISTS diq.recognition_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recognition_id UUID NOT NULL REFERENCES diq.recognitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ, -- When the recipient acknowledged/thanked
  UNIQUE(recognition_id, user_id)
);

-- Indexes for recognitions
CREATE INDEX idx_recognitions_author ON diq.recognitions(author_id);
CREATE INDEX idx_recognitions_type ON diq.recognitions(type);
CREATE INDEX idx_recognitions_created ON diq.recognitions(created_at DESC);
CREATE INDEX idx_recognition_recipients_user ON diq.recognition_recipients(user_id);

-- =============================================================================
-- POLLS
-- =============================================================================

-- Polls table
CREATE TABLE IF NOT EXISTS diq.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES diq.news_posts(id) ON DELETE SET NULL, -- Link to news post
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  description TEXT,
  is_multiple_choice BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  allow_add_options BOOLEAN DEFAULT FALSE, -- Users can add new options
  status VARCHAR(20) DEFAULT 'active', -- 'draft', 'active', 'closed'
  expires_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll options
CREATE TABLE IF NOT EXISTS diq.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES diq.polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  added_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- If user-added
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll votes
CREATE TABLE IF NOT EXISTS diq.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES diq.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES diq.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, option_id, user_id) -- One vote per option per user
);

-- Indexes for polls
CREATE INDEX idx_polls_creator ON diq.polls(creator_id);
CREATE INDEX idx_polls_status ON diq.polls(status);
CREATE INDEX idx_poll_options_poll ON diq.poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll ON diq.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON diq.poll_votes(user_id);

-- =============================================================================
-- CHANNELS (Real Backend)
-- =============================================================================

-- Channels table
CREATE TABLE IF NOT EXISTS diq.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_direct_message BOOLEAN DEFAULT FALSE, -- DM between 2 users
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  department_id UUID REFERENCES diq.departments(id) ON DELETE SET NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  settings JSONB DEFAULT '{}', -- notifications, moderation settings
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel members
CREATE TABLE IF NOT EXISTS diq.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES diq.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member'
  notifications VARCHAR(20) DEFAULT 'all', -- 'all', 'mentions', 'none'
  is_muted BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Channel messages
CREATE TABLE IF NOT EXISTS diq.channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES diq.channels(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  thread_id UUID REFERENCES diq.channel_messages(id) ON DELETE CASCADE, -- For threaded replies
  reply_to_id UUID REFERENCES diq.channel_messages(id) ON DELETE SET NULL, -- Direct reply
  is_pinned BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]', -- Array of {type, url, name, size}
  mentions UUID[] DEFAULT '{}', -- Array of mentioned user IDs
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for channels
CREATE INDEX idx_channels_slug ON diq.channels(slug);
CREATE INDEX idx_channels_department ON diq.channels(department_id);
CREATE INDEX idx_channel_members_channel ON diq.channel_members(channel_id);
CREATE INDEX idx_channel_members_user ON diq.channel_members(user_id);
CREATE INDEX idx_channel_messages_channel ON diq.channel_messages(channel_id);
CREATE INDEX idx_channel_messages_thread ON diq.channel_messages(thread_id);
CREATE INDEX idx_channel_messages_created ON diq.channel_messages(channel_id, created_at DESC);

-- =============================================================================
-- CELEBRATIONS (Birthdays, Anniversaries)
-- =============================================================================

-- Celebrations table (can be auto-generated or manual)
CREATE TABLE IF NOT EXISTS diq.celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'birthday', 'work_anniversary', 'promotion', 'new_hire', 'custom'
  title TEXT,
  message TEXT,
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE, -- TRUE for birthdays/anniversaries
  visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'department', 'private'
  notification_sent BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add birth_date to employees if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'diq' AND table_name = 'employees' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE diq.employees ADD COLUMN birth_date DATE;
  END IF;
END
$$;

-- Celebration wishes (comments/reactions on celebrations)
CREATE TABLE IF NOT EXISTS diq.celebration_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celebration_id UUID NOT NULL REFERENCES diq.celebrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT,
  emoji VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for celebrations
CREATE INDEX idx_celebrations_user ON diq.celebrations(user_id);
CREATE INDEX idx_celebrations_date ON diq.celebrations(date);
CREATE INDEX idx_celebrations_type ON diq.celebrations(type);
CREATE INDEX idx_celebration_wishes_celebration ON diq.celebration_wishes(celebration_id);

-- =============================================================================
-- TASKS (Personal Productivity)
-- =============================================================================

CREATE TABLE IF NOT EXISTS diq.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo', -- 'todo', 'in_progress', 'done', 'cancelled'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  due_date DATE,
  due_time TIME,
  project_id UUID, -- Optional project grouping
  parent_id UUID REFERENCES diq.tasks(id) ON DELETE CASCADE, -- Subtasks
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task tags table for organization
CREATE TABLE IF NOT EXISTS diq.task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20),
  UNIQUE(user_id, name)
);

-- Indexes for tasks
CREATE INDEX idx_tasks_user ON diq.tasks(user_id);
CREATE INDEX idx_tasks_status ON diq.tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON diq.tasks(user_id, due_date);
CREATE INDEX idx_tasks_priority ON diq.tasks(user_id, priority);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE diq.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.recognitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.recognition_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.celebrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.celebration_wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diq.tasks ENABLE ROW LEVEL SECURITY;

-- Notifications: Users can only see their own
CREATE POLICY notifications_select ON diq.notifications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY notifications_update ON diq.notifications FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Notification preferences: Users can only manage their own
CREATE POLICY notification_prefs_all ON diq.notification_preferences FOR ALL USING (auth.uid()::text = user_id::text);

-- Reactions: Anyone can see, users can manage their own
CREATE POLICY reactions_select ON diq.reactions FOR SELECT USING (true);
CREATE POLICY reactions_insert ON diq.reactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY reactions_delete ON diq.reactions FOR DELETE USING (auth.uid()::text = user_id::text);

-- Recognitions: Public can see, users can create
CREATE POLICY recognitions_select ON diq.recognitions FOR SELECT USING (is_public OR auth.uid()::text = author_id::text);
CREATE POLICY recognitions_insert ON diq.recognitions FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);

-- Polls: Active polls visible to all, creators can manage
CREATE POLICY polls_select ON diq.polls FOR SELECT USING (status = 'active' OR auth.uid()::text = creator_id::text);
CREATE POLICY polls_insert ON diq.polls FOR INSERT WITH CHECK (auth.uid()::text = creator_id::text);
CREATE POLICY polls_update ON diq.polls FOR UPDATE USING (auth.uid()::text = creator_id::text);

-- Poll options: Follow poll visibility
CREATE POLICY poll_options_select ON diq.poll_options FOR SELECT USING (true);
CREATE POLICY poll_options_insert ON diq.poll_options FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM diq.polls WHERE id = poll_id AND (auth.uid()::text = creator_id::text OR allow_add_options))
);

-- Poll votes: Users can manage their own votes
CREATE POLICY poll_votes_select ON diq.poll_votes FOR SELECT USING (true);
CREATE POLICY poll_votes_insert ON diq.poll_votes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY poll_votes_delete ON diq.poll_votes FOR DELETE USING (auth.uid()::text = user_id::text);

-- Channels: Members can see their channels, public channels visible to all
CREATE POLICY channels_select ON diq.channels FOR SELECT USING (
  NOT is_private OR
  EXISTS (SELECT 1 FROM diq.channel_members WHERE channel_id = id AND user_id::text = auth.uid()::text)
);
CREATE POLICY channels_insert ON diq.channels FOR INSERT WITH CHECK (auth.uid()::text = creator_id::text);

-- Channel members: Members can see other members
CREATE POLICY channel_members_select ON diq.channel_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM diq.channel_members cm WHERE cm.channel_id = channel_id AND cm.user_id::text = auth.uid()::text)
);

-- Channel messages: Members can see and create messages
CREATE POLICY channel_messages_select ON diq.channel_messages FOR SELECT USING (
  deleted_at IS NULL AND
  EXISTS (SELECT 1 FROM diq.channel_members WHERE channel_id = channel_messages.channel_id AND user_id::text = auth.uid()::text)
);
CREATE POLICY channel_messages_insert ON diq.channel_messages FOR INSERT WITH CHECK (
  auth.uid()::text = author_id::text AND
  EXISTS (SELECT 1 FROM diq.channel_members WHERE channel_id = channel_messages.channel_id AND user_id::text = auth.uid()::text)
);
CREATE POLICY channel_messages_update ON diq.channel_messages FOR UPDATE USING (auth.uid()::text = author_id::text);

-- Celebrations: Based on visibility
CREATE POLICY celebrations_select ON diq.celebrations FOR SELECT USING (
  visibility = 'public' OR auth.uid()::text = user_id::text
);

-- Tasks: Users can only see their own tasks or assigned tasks
CREATE POLICY tasks_select ON diq.tasks FOR SELECT USING (
  auth.uid()::text = user_id::text OR auth.uid()::text = assignee_id::text
);
CREATE POLICY tasks_insert ON diq.tasks FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY tasks_update ON diq.tasks FOR UPDATE USING (
  auth.uid()::text = user_id::text OR auth.uid()::text = assignee_id::text
);
CREATE POLICY tasks_delete ON diq.tasks FOR DELETE USING (auth.uid()::text = user_id::text);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION diq.get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM diq.notifications
  WHERE user_id = p_user_id AND read = FALSE;
$$ LANGUAGE SQL STABLE;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION diq.mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
  WITH updated AS (
    UPDATE diq.notifications
    SET read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id AND read = FALSE
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER FROM updated;
$$ LANGUAGE SQL;

-- Function to get upcoming celebrations
CREATE OR REPLACE FUNCTION diq.get_upcoming_celebrations(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  avatar_url TEXT,
  type VARCHAR(50),
  title TEXT,
  celebration_date DATE,
  days_until INTEGER
) AS $$
  SELECT
    c.id,
    c.user_id,
    u.full_name AS user_name,
    u.avatar_url,
    c.type,
    c.title,
    c.date AS celebration_date,
    (c.date - CURRENT_DATE)::INTEGER AS days_until
  FROM diq.celebrations c
  JOIN public.users u ON u.id = c.user_id
  WHERE c.date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
    AND c.visibility = 'public'
  ORDER BY c.date ASC;
$$ LANGUAGE SQL STABLE;

-- Function to get poll results
CREATE OR REPLACE FUNCTION diq.get_poll_results(p_poll_id UUID)
RETURNS TABLE (
  option_id UUID,
  option_text TEXT,
  vote_count BIGINT,
  percentage NUMERIC
) AS $$
  WITH total_votes AS (
    SELECT COUNT(*) AS total FROM diq.poll_votes WHERE poll_id = p_poll_id
  )
  SELECT
    po.id AS option_id,
    po.text AS option_text,
    COUNT(pv.id) AS vote_count,
    CASE
      WHEN (SELECT total FROM total_votes) > 0
      THEN ROUND((COUNT(pv.id)::NUMERIC / (SELECT total FROM total_votes)) * 100, 1)
      ELSE 0
    END AS percentage
  FROM diq.poll_options po
  LEFT JOIN diq.poll_votes pv ON pv.option_id = po.id
  WHERE po.poll_id = p_poll_id
  GROUP BY po.id, po.text, po.sort_order
  ORDER BY po.sort_order;
$$ LANGUAGE SQL STABLE;

-- Function to get channel with unread count
CREATE OR REPLACE FUNCTION diq.get_channels_with_unread(p_user_id UUID)
RETURNS TABLE (
  channel_id UUID,
  channel_name VARCHAR(100),
  channel_slug VARCHAR(100),
  is_private BOOLEAN,
  unread_count BIGINT,
  last_message_at TIMESTAMPTZ
) AS $$
  SELECT
    c.id AS channel_id,
    c.name AS channel_name,
    c.slug AS channel_slug,
    c.is_private,
    COUNT(cm.id) FILTER (WHERE cm.created_at > COALESCE(chm.last_read_at, '1970-01-01')) AS unread_count,
    MAX(cm.created_at) AS last_message_at
  FROM diq.channels c
  JOIN diq.channel_members chm ON chm.channel_id = c.id AND chm.user_id = p_user_id
  LEFT JOIN diq.channel_messages cm ON cm.channel_id = c.id AND cm.deleted_at IS NULL
  WHERE c.archived_at IS NULL
  GROUP BY c.id, c.name, c.slug, c.is_private, chm.last_read_at
  ORDER BY MAX(cm.created_at) DESC NULLS LAST;
$$ LANGUAGE SQL STABLE;

-- Trigger to create notification on mention
CREATE OR REPLACE FUNCTION diq.notify_on_mention()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user UUID;
BEGIN
  -- Check if mentions array has any users
  IF NEW.mentions IS NOT NULL AND array_length(NEW.mentions, 1) > 0 THEN
    FOREACH mentioned_user IN ARRAY NEW.mentions
    LOOP
      INSERT INTO diq.notifications (user_id, type, entity_type, entity_id, actor_id, title, message, link)
      VALUES (
        mentioned_user,
        'mention',
        'message',
        NEW.id,
        NEW.author_id,
        'You were mentioned in a message',
        substring(NEW.content for 100),
        '/diq/channels/' || (SELECT slug FROM diq.channels WHERE id = NEW.channel_id)
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_mention
AFTER INSERT ON diq.channel_messages
FOR EACH ROW EXECUTE FUNCTION diq.notify_on_mention();

-- Trigger to create notification on reaction
CREATE OR REPLACE FUNCTION diq.notify_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  entity_title TEXT;
BEGIN
  -- Get the owner of the reacted entity
  IF NEW.entity_type = 'post' THEN
    SELECT author_id INTO target_user_id FROM diq.news_posts WHERE id = NEW.entity_id;
    SELECT COALESCE(title, substring(content for 50)) INTO entity_title FROM diq.news_posts WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'message' THEN
    SELECT author_id INTO target_user_id FROM diq.channel_messages WHERE id = NEW.entity_id;
    SELECT substring(content for 50) INTO entity_title FROM diq.channel_messages WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'comment' THEN
    SELECT author_id INTO target_user_id FROM diq.news_comments WHERE id = NEW.entity_id;
    SELECT substring(content for 50) INTO entity_title FROM diq.news_comments WHERE id = NEW.entity_id;
  END IF;

  -- Don't notify if reacting to own content
  IF target_user_id IS NOT NULL AND target_user_id != NEW.user_id THEN
    INSERT INTO diq.notifications (user_id, type, entity_type, entity_id, actor_id, title, message)
    VALUES (
      target_user_id,
      'reaction',
      NEW.entity_type,
      NEW.entity_id,
      NEW.user_id,
      'Someone reacted to your ' || NEW.entity_type,
      NEW.emoji || ' on "' || entity_title || '"'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_reaction
AFTER INSERT ON diq.reactions
FOR EACH ROW EXECUTE FUNCTION diq.notify_on_reaction();

-- Update news_posts to support type 'shoutout' and 'poll'
-- (This is already handled by the existing type column which has 'post', 'announcement', 'event', 'poll')

COMMENT ON TABLE diq.notifications IS 'User notifications for mentions, reactions, comments, etc.';
COMMENT ON TABLE diq.reactions IS 'Emoji reactions on posts, comments, and messages';
COMMENT ON TABLE diq.recognitions IS 'Employee recognition and shout-outs';
COMMENT ON TABLE diq.polls IS 'Polls and surveys with voting';
COMMENT ON TABLE diq.channels IS 'Communication channels for team collaboration';
COMMENT ON TABLE diq.channel_messages IS 'Messages within channels, with threading support';
COMMENT ON TABLE diq.celebrations IS 'Birthdays, work anniversaries, and other celebrations';
COMMENT ON TABLE diq.tasks IS 'Personal task management for productivity';
