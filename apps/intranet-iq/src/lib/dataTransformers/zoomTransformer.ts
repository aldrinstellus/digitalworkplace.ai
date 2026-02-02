/**
 * Zoom Data Transformer
 *
 * Transforms Zoom meetings into unified dIQ types.
 */

import type { ZoomMeeting } from '../mockAppsData';
import type { UnifiedSearchItem, UnifiedEvent, UnifiedActivity, EventStatus, EventType } from '../unifiedTypes';
import { findEmployeeByName } from '../crossReferences';

/**
 * Map Zoom meeting status to unified event status
 */
function mapZoomStatus(status: ZoomMeeting['status']): EventStatus {
  const statusMap: Record<ZoomMeeting['status'], EventStatus> = {
    'upcoming': 'upcoming',
    'live': 'live',
    'ended': 'ended',
  };
  return statusMap[status] || 'upcoming';
}

/**
 * Map Zoom meeting type to unified event type
 */
function mapZoomType(type: ZoomMeeting['type']): EventType {
  const typeMap: Record<ZoomMeeting['type'], EventType> = {
    'scheduled': 'meeting',
    'recurring': 'meeting',
    'instant': 'meeting',
  };
  return typeMap[type] || 'meeting';
}

/**
 * Transform a Zoom meeting to a unified search item
 */
export function transformZoomMeetingToSearchItem(meeting: ZoomMeeting): UnifiedSearchItem {
  const host = findEmployeeByName(meeting.host.name);

  return {
    id: `zoom-${meeting.id}`,
    type: 'zoom_meeting',
    source: 'zoom',
    title: meeting.title,
    description: `${meeting.status === 'live' ? '🔴 LIVE' : meeting.startTime} • ${meeting.duration} • Hosted by ${meeting.host.name}`,
    content: `${meeting.title} ${meeting.notes || ''} ${meeting.participants.map(p => p.name).join(' ')}`,
    excerpt: `${meeting.startTime} - ${meeting.duration}`,
    url: `/diq/integrations/zoom/meetings/${meeting.id}`,
    createdAt: meeting.startTime,
    updatedAt: meeting.startTime,
    author: {
      id: host?.id,
      name: meeting.host.name,
      avatar: meeting.host.avatar,
      email: host?.email,
    },
    tags: ['zoom', 'meeting', meeting.type, meeting.status],
    metadata: {
      status: meeting.status,
      type: meeting.type,
      duration: meeting.duration,
      participantCount: meeting.participants.length,
      participants: meeting.participants,
      recording: meeting.recording,
      notes: meeting.notes,
    },
  };
}

/**
 * Transform a Zoom meeting to a unified event
 */
export function transformZoomMeetingToEvent(meeting: ZoomMeeting): UnifiedEvent {
  const host = findEmployeeByName(meeting.host.name);

  return {
    id: `zoom-event-${meeting.id}`,
    source: 'zoom',
    sourceId: meeting.id,
    title: meeting.title,
    description: meeting.notes || `Zoom meeting hosted by ${meeting.host.name}`,
    type: mapZoomType(meeting.type),
    status: mapZoomStatus(meeting.status),
    locationType: 'virtual',
    meetingUrl: `/diq/integrations/zoom/meetings/${meeting.id}`,
    startTime: meeting.startTime,
    duration: meeting.duration,
    host: {
      id: host?.id,
      name: meeting.host.name,
      avatar: meeting.host.avatar,
      email: host?.email,
    },
    participants: meeting.participants.map(p => {
      const employee = findEmployeeByName(p.name);
      return {
        id: employee?.id,
        name: p.name,
        avatar: p.avatar,
        status: p.status,
      };
    }),
    currentAttendees: meeting.participants.filter(p => p.status === 'joined').length,
    url: `/diq/integrations/zoom/meetings/${meeting.id}`,
    metadata: {
      recording: meeting.recording,
      notes: meeting.notes,
    },
  };
}

/**
 * Transform a Zoom meeting to activity
 */
export function transformZoomMeetingToActivity(
  meeting: ZoomMeeting,
  activityType: 'meeting_started' | 'meeting_ended' = 'meeting_started'
): UnifiedActivity {
  const host = findEmployeeByName(meeting.host.name);

  const title = activityType === 'meeting_started'
    ? `Started: ${meeting.title}`
    : `Ended: ${meeting.title}`;

  const description = activityType === 'meeting_started'
    ? `${meeting.participants.length} participants invited`
    : meeting.recording
      ? `Recording available (${meeting.recording.duration})`
      : 'Meeting completed';

  return {
    id: `zoom-activity-${meeting.id}-${activityType}`,
    source: 'zoom',
    type: activityType,
    title,
    description,
    actor: {
      id: host?.id,
      name: meeting.host.name,
      avatar: meeting.host.avatar,
      email: host?.email,
    },
    target: {
      id: meeting.id,
      type: 'zoom_meeting',
      title: meeting.title,
      url: `/diq/integrations/zoom/meetings/${meeting.id}`,
    },
    createdAt: meeting.startTime,
    metadata: {
      status: meeting.status,
      duration: meeting.duration,
      participantCount: meeting.participants.length,
      hasRecording: !!meeting.recording,
    },
  };
}

/**
 * Transform all Zoom meetings to search items
 */
export function transformAllZoomMeetingsToSearchItems(meetings: ZoomMeeting[]): UnifiedSearchItem[] {
  return meetings.map(transformZoomMeetingToSearchItem);
}

/**
 * Transform all Zoom meetings to unified events
 */
export function transformAllZoomMeetingsToEvents(meetings: ZoomMeeting[]): UnifiedEvent[] {
  return meetings.map(transformZoomMeetingToEvent);
}

/**
 * Get upcoming Zoom meetings for a user
 */
export function getUpcomingZoomMeetingsForUser(meetings: ZoomMeeting[], userName: string): UnifiedEvent[] {
  return meetings
    .filter(m =>
      m.status === 'upcoming' && (
        m.host.name === userName ||
        m.participants.some(p => p.name === userName)
      )
    )
    .map(transformZoomMeetingToEvent);
}

/**
 * Get live Zoom meetings for a user
 */
export function getLiveZoomMeetingsForUser(meetings: ZoomMeeting[], userName: string): UnifiedEvent[] {
  return meetings
    .filter(m =>
      m.status === 'live' && (
        m.host.name === userName ||
        m.participants.some(p => p.name === userName && p.status === 'joined')
      )
    )
    .map(transformZoomMeetingToEvent);
}
