"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn } from "@/lib/motion";
import { getEventById, mockEvents, mockEmployees, type MockEvent } from "@/lib/mockData";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Check,
  X,
  HelpCircle,
  Share2,
  Bell,
  AlertCircle,
  ExternalLink,
  Download,
  Plus,
  FileText,
} from "lucide-react";

// Extended event data for detail view
interface EventDetailData extends MockEvent {
  agenda: Array<{
    time: string;
    title: string;
    speaker: string;
    duration: number;
  }>;
  resources: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  attendees: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: "accepted" | "maybe" | "declined";
  }>;
}

// Extended mock data for event details
const mockEventDetails: Record<string, EventDetailData> = {
  "1": {
    ...mockEvents.find(e => e.id === "1")!,
    agenda: [
      { time: "10:00 AM", title: "Welcome & Introduction", speaker: "Sarah Chen", duration: 10 },
      { time: "10:10 AM", title: "Q4 Financial Review", speaker: "Sarah Chen", duration: 20 },
      { time: "10:30 AM", title: "Engineering Update", speaker: "Mike Johnson", duration: 20 },
      { time: "10:50 AM", title: "Product Vision", speaker: "James Wilson", duration: 20 },
      { time: "11:10 AM", title: "People & Culture", speaker: "Lisa Park", duration: 15 },
      { time: "11:25 AM", title: "Break", speaker: "", duration: 5 },
      { time: "11:30 AM", title: "Q&A Session", speaker: "All Leaders", duration: 30 },
    ],
    resources: [
      { name: "Q4 Financial Summary", type: "pdf", url: "#" },
      { name: "2026 Strategic Deck", type: "pptx", url: "#" },
      { name: "Slido Q&A Link", type: "link", url: "#" },
    ],
    attendees: [
      { id: "2", name: "Mike Johnson", role: "VP Engineering", avatar: "MJ", status: "accepted" },
      { id: "3", name: "Lisa Park", role: "HR Director", avatar: "LP", status: "accepted" },
      { id: "4", name: "James Wilson", role: "Product Lead", avatar: "JW", status: "accepted" },
      { id: "7", name: "Emily Rodriguez", role: "VP Customer Success", avatar: "ER", status: "accepted" },
      { id: "8", name: "Alex Kim", role: "Staff Engineer", avatar: "AK", status: "maybe" },
    ],
  },
  "2": {
    ...mockEvents.find(e => e.id === "2")!,
    agenda: [
      { time: "Day 1, 9:00 AM", title: "Breakfast & Icebreakers", speaker: "", duration: 60 },
      { time: "Day 1, 10:00 AM", title: "Architecture Review", speaker: "Alex Kim", duration: 90 },
      { time: "Day 1, 1:00 PM", title: "Hackathon Kickoff", speaker: "Mike Johnson", duration: 240 },
      { time: "Day 1, 6:00 PM", title: "Team Dinner", speaker: "", duration: 180 },
      { time: "Day 2, 9:00 AM", title: "Hackathon Demos", speaker: "All Teams", duration: 120 },
      { time: "Day 2, 11:00 AM", title: "2026 Roadmap", speaker: "Mike Johnson", duration: 60 },
    ],
    resources: [
      { name: "Venue Map & Parking", type: "pdf", url: "#" },
      { name: "Hackathon Guidelines", type: "doc", url: "#" },
      { name: "Lightning Talk Sign-up", type: "link", url: "#" },
    ],
    attendees: [
      { id: "8", name: "Alex Kim", role: "Staff Engineer", avatar: "AK", status: "accepted" },
      { id: "2", name: "Mike Johnson", role: "VP Engineering", avatar: "MJ", status: "accepted" },
      { id: "10", name: "Marcus Johnson", role: "Security Engineer", avatar: "MJ2", status: "accepted" },
    ],
  },
  "3": {
    ...mockEvents.find(e => e.id === "3")!,
    agenda: [
      { time: "9:00 AM", title: "Company Overview", speaker: "Lisa Park", duration: 60 },
      { time: "10:00 AM", title: "Tools & Systems", speaker: "IT Support", duration: 60 },
      { time: "11:00 AM", title: "Culture & Expectations", speaker: "Emily Rodriguez", duration: 60 },
      { time: "12:00 PM", title: "Buddy Meet & Lunch", speaker: "", duration: 60 },
    ],
    resources: [
      { name: "Employee Handbook", type: "pdf", url: "#" },
      { name: "Benefits Guide 2026", type: "pdf", url: "#" },
      { name: "IT Setup Checklist", type: "doc", url: "#" },
    ],
    attendees: [
      { id: "3", name: "Lisa Park", role: "HR Director", avatar: "LP", status: "accepted" },
      { id: "6", name: "Amanda Foster", role: "Benefits Manager", avatar: "AF", status: "accepted" },
    ],
  },
  "4": {
    ...mockEvents.find(e => e.id === "4")!,
    agenda: [
      { time: "2:00 PM", title: "Welcome & Introduction", speaker: "James Wilson", duration: 5 },
      { time: "2:05 PM", title: "Document Processing Demo", speaker: "AI Team", duration: 20 },
      { time: "2:25 PM", title: "Advanced Search 2.0", speaker: "Alex Kim", duration: 20 },
      { time: "2:45 PM", title: "Workflow Automation", speaker: "Product Team", duration: 20 },
      { time: "3:05 PM", title: "Conversational Analytics", speaker: "Data Team", duration: 20 },
      { time: "3:25 PM", title: "Hands-on Session", speaker: "Product Team", duration: 30 },
      { time: "3:55 PM", title: "Closing Remarks", speaker: "James Wilson", duration: 5 },
    ],
    resources: [
      { name: "Feature Documentation", type: "link", url: "#" },
      { name: "Demo Environment Access", type: "link", url: "#" },
    ],
    attendees: [
      { id: "4", name: "James Wilson", role: "Product Lead", avatar: "JW", status: "accepted" },
      { id: "8", name: "Alex Kim", role: "Staff Engineer", avatar: "AK", status: "accepted" },
    ],
  },
  "5": {
    ...mockEvents.find(e => e.id === "5")!,
    agenda: [
      { time: "12:00 PM", title: "Welcome & Breathing", speaker: "Maya Thompson", duration: 5 },
      { time: "12:05 PM", title: "Guided Meditation", speaker: "Maya Thompson", duration: 15 },
      { time: "12:20 PM", title: "Discussion & Tips", speaker: "All", duration: 10 },
    ],
    resources: [
      { name: "Meditation App Recommendation", type: "link", url: "#" },
      { name: "Stress Management Guide", type: "pdf", url: "#" },
    ],
    attendees: [],
  },
  "6": {
    ...mockEvents.find(e => e.id === "6")!,
    agenda: [
      { time: "9:00 AM", title: "Welcome & Introductions", speaker: "Emily Rodriguez", duration: 15 },
      { time: "9:15 AM", title: "Product Roadmap Review", speaker: "James Wilson", duration: 30 },
      { time: "9:45 AM", title: "Customer Feedback Session", speaker: "All", duration: 45 },
      { time: "10:30 AM", title: "Break", speaker: "", duration: 15 },
      { time: "10:45 AM", title: "Feature Prioritization", speaker: "All", duration: 30 },
      { time: "11:15 AM", title: "Closing Remarks", speaker: "Sarah Chen", duration: 15 },
      { time: "11:30 AM", title: "Networking Lunch", speaker: "", duration: 60 },
    ],
    resources: [
      { name: "Q1 Roadmap Deck", type: "pptx", url: "#" },
      { name: "Feedback Form", type: "link", url: "#" },
    ],
    attendees: [
      { id: "1", name: "Sarah Chen", role: "CEO", avatar: "SC", status: "accepted" },
      { id: "4", name: "James Wilson", role: "Product Lead", avatar: "JW", status: "accepted" },
      { id: "7", name: "Emily Rodriguez", role: "VP Customer Success", avatar: "ER", status: "accepted" },
    ],
  },
  "7": {
    ...mockEvents.find(e => e.id === "7")!,
    agenda: [
      { time: "3:00 PM", title: "Introduction to RAG", speaker: "Alex Kim", duration: 20 },
      { time: "3:20 PM", title: "Architecture Deep Dive", speaker: "Alex Kim", duration: 30 },
      { time: "3:50 PM", title: "Live Demo", speaker: "Alex Kim", duration: 20 },
      { time: "4:10 PM", title: "Q&A", speaker: "All", duration: 20 },
    ],
    resources: [
      { name: "RAG Architecture Slides", type: "pptx", url: "#" },
      { name: "Sample Code Repository", type: "link", url: "#" },
      { name: "Recommended Reading", type: "pdf", url: "#" },
    ],
    attendees: [
      { id: "8", name: "Alex Kim", role: "Staff Engineer", avatar: "AK", status: "accepted" },
      { id: "2", name: "Mike Johnson", role: "VP Engineering", avatar: "MJ", status: "accepted" },
    ],
  },
  "8": {
    ...mockEvents.find(e => e.id === "8")!,
    agenda: [
      { time: "8:00 AM", title: "Breakfast & Registration", speaker: "", duration: 60 },
      { time: "9:00 AM", title: "CEO Welcome", speaker: "Sarah Chen", duration: 30 },
      { time: "9:30 AM", title: "2026 Sales Targets", speaker: "VP Sales", duration: 45 },
      { time: "10:15 AM", title: "Product Training", speaker: "James Wilson", duration: 90 },
      { time: "12:00 PM", title: "Lunch", speaker: "", duration: 60 },
      { time: "1:00 PM", title: "Success Stories", speaker: "Top Performers", duration: 90 },
      { time: "2:30 PM", title: "Break", speaker: "", duration: 30 },
      { time: "3:00 PM", title: "Team Workshops", speaker: "Various", duration: 120 },
      { time: "5:00 PM", title: "Closing & Awards", speaker: "VP Sales", duration: 60 },
    ],
    resources: [
      { name: "2026 Sales Playbook", type: "pdf", url: "#" },
      { name: "Product Demo Videos", type: "link", url: "#" },
      { name: "Compensation Plan", type: "pdf", url: "#" },
    ],
    attendees: [],
  },
};

function formatEventDate(startTime: string, endTime: string, allDay: boolean): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startDate = start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (allDay) {
    if (start.toDateString() === end.toDateString()) {
      return `${startDate} (All Day)`;
    }
    const endDate = end.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    return `${startDate} - ${endDate} (All Day)`;
  }

  const startTimeStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTimeStr = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });

  if (start.toDateString() === end.toDateString()) {
    return `${startDate}, ${startTimeStr} - ${endTimeStr}`;
  }

  const endDate = end.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return `${startDate}, ${startTimeStr} - ${endDate}, ${endTimeStr}`;
}

function getDurationInHours(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  if (diff < 1) return `${Math.round(diff * 60)} minutes`;
  if (diff === 1) return "1 hour";
  return `${diff.toFixed(1)} hours`;
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Get event from centralized mock data
  const baseEvent = getEventById(id);
  const eventDetail = mockEventDetails[id];

  const [rsvpStatus, setRsvpStatus] = useState<"accepted" | "declined" | "maybe" | null>(null);

  const handleRSVP = (status: "accepted" | "declined" | "maybe") => {
    setRsvpStatus(status);
  };

  const handleAddToCalendar = () => {
    alert("Event added to calendar!");
  };

  // Get related events (same department or organizer)
  const relatedEvents = mockEvents
    .filter(e => e.id !== id && (e.department_id === baseEvent?.department_id || e.organizer_id === baseEvent?.organizer_id))
    .slice(0, 3);

  if (!baseEvent) {
    return (
      <div className="flex h-screen bg-[var(--bg-obsidian)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto ml-16">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <FadeIn>
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Event Not Found
                </h1>
                <p className="text-[var(--text-secondary)] mb-6">
                  The event you&apos;re looking for doesn&apos;t exist or has been cancelled.
                </p>
                <a
                  href="/diq/events"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-ember)] text-white rounded-lg hover:bg-[var(--accent-ember-soft)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Events
                </a>
              </div>
            </FadeIn>
          </div>
        </main>
      </div>
    );
  }

  const event = eventDetail || {
    ...baseEvent,
    agenda: [],
    resources: [],
    attendees: [],
  };

  const locationLabel = event.location_type === "virtual" ? "Virtual Event" : event.location_type === "hybrid" ? "Hybrid (In-person + Virtual)" : "In-person Event";

  return (
    <div className="flex h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Back Button */}
          <FadeIn>
            <a
              href="/diq/events"
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-ember)] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </a>
          </FadeIn>

          {/* Event Header */}
          <FadeIn delay={0.1}>
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.location_type === "virtual"
                        ? "bg-purple-500/20 text-purple-400"
                        : event.location_type === "hybrid"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                    }`}>
                      {locationLabel}
                    </span>
                    {event.visibility === "private" && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                        Private
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                    {event.title}
                  </h1>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Calendar className="w-4 h-4 text-[var(--accent-ember)]" />
                      {formatEventDate(event.start_time, event.end_time, event.all_day)}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Clock className="w-4 h-4 text-[var(--accent-ember)]" />
                      Duration: {getDurationInHours(event.start_time, event.end_time)}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      {event.location_type === "virtual" ? (
                        <Video className="w-4 h-4 text-[var(--accent-ember)]" />
                      ) : (
                        <MapPin className="w-4 h-4 text-[var(--accent-ember)]" />
                      )}
                      {event.location}
                    </div>
                    {event.meeting_url && (
                      <a
                        href={event.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[var(--accent-ember)] hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Join Virtual Meeting
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
                    <Users className="w-4 h-4" />
                    {event.current_attendees} attending
                    {event.max_attendees && ` / ${event.max_attendees} max`}
                  </div>
                </div>
              </div>

              {/* Organizer */}
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-[var(--accent-ember)] font-medium">
                  {event.organizer_avatar}
                </div>
                <div>
                  <a href={`/diq/people/${event.organizer_id.replace('user-', 'emp-')}`} className="text-[var(--text-primary)] font-medium hover:text-[var(--accent-ember)] transition-colors">
                    Organized by {event.organizer_name}
                  </a>
                  <p className="text-xs text-[var(--text-muted)]">{event.organizer_role} • {event.department_name}</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* RSVP Section */}
          <FadeIn delay={0.15}>
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Your Response</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleRSVP("accepted")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    rsvpStatus === "accepted"
                      ? "bg-green-500/20 text-green-400 border border-green-500/50"
                      : "bg-[var(--bg-slate)] text-[var(--text-secondary)] hover:bg-[var(--bg-obsidian)]"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Going
                </button>
                <button
                  onClick={() => handleRSVP("maybe")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    rsvpStatus === "maybe"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                      : "bg-[var(--bg-slate)] text-[var(--text-secondary)] hover:bg-[var(--bg-obsidian)]"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  Maybe
                </button>
                <button
                  onClick={() => handleRSVP("declined")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    rsvpStatus === "declined"
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-[var(--bg-slate)] text-[var(--text-secondary)] hover:bg-[var(--bg-obsidian)]"
                  }`}
                >
                  <X className="w-4 h-4" />
                  Can&apos;t Go
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleAddToCalendar}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-ember)] text-white rounded-lg hover:bg-[var(--accent-ember-soft)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add to Calendar
                </button>
                <button
                  className="p-2 bg-[var(--bg-slate)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors"
                >
                  <Bell className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="p-2 bg-[var(--bg-slate)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Event Description */}
          <FadeIn delay={0.2}>
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">About This Event</h3>
              <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
                <p>{event.description}</p>
              </div>
            </div>
          </FadeIn>

          {/* Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <FadeIn delay={0.25}>
              <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Agenda</h3>
                <div className="space-y-3">
                  {event.agenda.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 bg-[var(--bg-slate)] rounded-lg"
                    >
                      <div className="w-24 flex-shrink-0">
                        <span className="text-[var(--accent-ember)] font-mono text-sm">{item.time}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[var(--text-primary)] font-medium">{item.title}</p>
                        {item.speaker && (
                          <p className="text-xs text-[var(--text-muted)]">{item.speaker}</p>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {item.duration} min
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Resources */}
          {event.resources && event.resources.length > 0 && (
            <FadeIn delay={0.3}>
              <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Resources</h3>
                <div className="space-y-2">
                  {event.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      className="flex items-center gap-3 p-3 bg-[var(--bg-slate)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors"
                    >
                      <div className="w-10 h-10 bg-[var(--accent-ember)]/20 rounded-lg flex items-center justify-center">
                        {resource.type === "link" ? (
                          <ExternalLink className="w-5 h-5 text-[var(--accent-ember)]" />
                        ) : (
                          <FileText className="w-5 h-5 text-[var(--accent-ember)]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[var(--text-primary)] font-medium">{resource.name}</p>
                        <p className="text-xs text-[var(--text-muted)] uppercase">{resource.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <FadeIn delay={0.35}>
              <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                  Attendees ({event.attendees.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {event.attendees.map((attendee) => (
                    <a
                      key={attendee.id}
                      href={`/diq/people/${attendee.id}`}
                      className="flex items-center gap-3 p-3 bg-[var(--bg-slate)] rounded-lg hover:bg-[var(--bg-obsidian)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--accent-ember)]/20 flex items-center justify-center text-[var(--accent-ember)] font-medium">
                        {attendee.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-primary)] font-medium truncate">{attendee.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{attendee.role}</p>
                      </div>
                      {attendee.status === "accepted" && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                      {attendee.status === "maybe" && (
                        <HelpCircle className="w-4 h-4 text-yellow-400" />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Tags */}
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap gap-2 mb-8">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-full text-xs text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </FadeIn>

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <FadeIn delay={0.45}>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                  Related Events
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedEvents.map((relatedEvent) => (
                    <a
                      key={relatedEvent.id}
                      href={`/diq/events/${relatedEvent.id}`}
                      className="block p-4 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--accent-ember)]/50 transition-colors"
                    >
                      <h4 className="text-[var(--text-primary)] font-medium line-clamp-2 mb-2">
                        {relatedEvent.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(relatedEvent.start_time).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </main>
    </div>
  );
}
