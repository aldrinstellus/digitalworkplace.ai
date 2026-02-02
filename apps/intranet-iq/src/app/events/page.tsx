"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn, StaggerContainer, StaggerItem } from "@/lib/motion";
import { mockEvents, type MockEvent } from "@/lib/mockData";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Video,
  Building,
  Globe,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Check,
  HelpCircle,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";

type ViewMode = "list" | "calendar";
type RSVPStatus = "going" | "maybe" | "not-going" | null;

interface EventRSVP {
  eventId: string;
  status: RSVPStatus;
  attendeeCount: number;
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "virtual" | "in_person" | "hybrid">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "hybrid" as "virtual" | "in_person" | "hybrid",
  });

  // Use mock data directly
  const events = mockEvents;
  const [rsvps, setRsvps] = useState<Map<string, EventRSVP>>(new Map());

  // Generate consistent attendee counts based on event id (deterministic, not random)
  const getBaseAttendeeCount = useCallback((eventId: string): number => {
    // Use hash of eventId to generate a consistent "random" number
    let hash = 0;
    for (let i = 0; i < eventId.length; i++) {
      const char = eventId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash % 50) + 5; // 5-54 attendees
  }, []);

  const handleRSVP = useCallback((eventId: string, status: RSVPStatus) => {
    setRsvps((prev) => {
      const newMap = new Map(prev);
      const currentRsvp = newMap.get(eventId);
      const currentStatus = currentRsvp?.status;
      const baseCount = getBaseAttendeeCount(eventId);
      const currentCount = currentRsvp?.attendeeCount ?? baseCount;

      // Toggle off if clicking the same status
      if (currentStatus === status) {
        newMap.set(eventId, { eventId, status: null, attendeeCount: currentCount - (status === "going" ? 1 : 0) });
      } else {
        // Adjust attendee count based on RSVP change
        let newCount = currentCount;
        if (currentStatus === "going") newCount--;
        if (status === "going") newCount++;
        newMap.set(eventId, { eventId, status, attendeeCount: newCount });
      }
      return newMap;
    });
  }, [getBaseAttendeeCount]);

  const getRSVP = useCallback((eventId: string): EventRSVP => {
    const existingRsvp = rsvps.get(eventId);
    if (existingRsvp) return existingRsvp;
    return { eventId, status: null, attendeeCount: getBaseAttendeeCount(eventId) };
  }, [rsvps, getBaseAttendeeCount]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDay = (day: number) => {
    return events.filter((event: MockEvent) => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const filteredEvents = events.filter((event: MockEvent) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || event.location_type === filter;
    return matchesSearch && matchesFilter;
  });

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "virtual":
        return <Video className="w-4 h-4" />;
      case "hybrid":
        return <Globe className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case "virtual":
        return "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]";
      case "hybrid":
        return "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]";
      default:
        return "bg-[var(--success)]/20 text-[var(--success)]";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)]">
      <Sidebar />

      <main className="ml-16 p-8">
        <FadeIn className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-[var(--accent-ember)]" />
                Upcoming Events
              </h1>
              <p className="text-[var(--text-muted)]">
                View and manage upcoming company events and meetings
              </p>
            </div>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] text-white flex items-center gap-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Create Event
            </motion.button>
          </div>

          {/* Search, Filter, and View Toggle */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl px-2">
              <Filter className="w-4 h-4 text-[var(--text-muted)]" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "virtual" | "in_person" | "hybrid")}
                className="bg-transparent text-[var(--text-primary)] py-3 pr-2 outline-none cursor-pointer"
              >
                <option value="all">All Events</option>
                <option value="virtual">Virtual</option>
                <option value="in_person">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-1">
              <motion.button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="List view"
              >
                <List className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode("calendar")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "calendar"
                    ? "bg-[var(--accent-ember)]/20 text-[var(--accent-ember)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-slate)]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Calendar view"
              >
                <Grid3X3 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Events Content */}
          {viewMode === "calendar" ? (
            /* Calendar View */
            <div className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                <motion.button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <h3 className="text-lg font-medium text-[var(--text-primary)]">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <motion.button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 border-b border-[var(--border-subtle)]">
                {weekDays.map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-[var(--text-muted)]">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before the first day of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="min-h-[100px] p-2 border-b border-r border-[var(--border-subtle)] bg-[var(--bg-slate)]/30" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dayEvents = getEventsForDay(day);
                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth.getMonth() === new Date().getMonth() &&
                    currentMonth.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={day}
                      className={`min-h-[100px] p-2 border-b border-r border-[var(--border-subtle)] ${
                        isToday ? "bg-[var(--accent-ember)]/5" : ""
                      }`}
                    >
                      <div className={`text-sm mb-1 ${
                        isToday
                          ? "w-6 h-6 rounded-full bg-[var(--accent-ember)] text-white flex items-center justify-center font-medium"
                          : "text-[var(--text-muted)]"
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event: MockEvent) => (
                          <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="block text-xs p-1 rounded bg-[var(--accent-ember)]/20 text-[var(--accent-ember)] truncate cursor-pointer hover:bg-[var(--accent-ember)]/30 transition-colors"
                            title={event.title}
                          >
                            {event.title}
                          </Link>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-[var(--text-muted)]">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-[var(--text-muted)]/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No events found</h3>
              <p className="text-sm text-[var(--text-muted)]/70">
                {searchQuery ? "Try different search terms" : "No upcoming events scheduled"}
              </p>
            </div>
          ) : (
            /* List View */
            <StaggerContainer className="space-y-4">
              {filteredEvents.map((event: MockEvent) => (
                <StaggerItem key={event.id}>
                  <Link href={`/events/${event.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.01, borderColor: "rgba(16,185,129,0.3)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-xl p-6 cursor-pointer"
                    >
                      <div className="flex gap-6">
                        {/* Date Column */}
                        <div className="flex-shrink-0 w-20 text-center">
                          <div className="bg-[var(--accent-ember)]/20 rounded-xl p-3">
                            <div className="text-2xl font-bold text-[var(--accent-ember)]">
                              {new Date(event.start_time).getDate()}
                            </div>
                            <div className="text-xs text-[var(--accent-ember)]/70 uppercase">
                              {new Date(event.start_time).toLocaleDateString("en-US", { month: "short" })}
                            </div>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-medium text-[var(--text-primary)]">{event.title}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 ${getLocationColor(event.location_type)}`}>
                              {getLocationIcon(event.location_type)}
                              {event.location_type.replace('_', '-')}
                            </span>
                          </div>

                          {event.description && (
                            <p className="text-[var(--text-secondary)] mb-4 line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {new Date(event.start_time).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                              {event.end_time && (
                                <> - {new Date(event.end_time).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}</>
                              )}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {event.current_attendees} attending
                            </span>
                          </div>

                        {/* RSVP Buttons */}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                          {getRSVP(event.id).status && (
                            <span className="text-sm text-[var(--text-muted)] mr-2">
                              Your RSVP:{" "}
                              <span className={`font-medium ${
                                getRSVP(event.id).status === "going"
                                  ? "text-emerald-500"
                                  : getRSVP(event.id).status === "maybe"
                                  ? "text-amber-500"
                                  : "text-red-400"
                              }`}>
                                {getRSVP(event.id).status === "going"
                                  ? "Going"
                                  : getRSVP(event.id).status === "maybe"
                                  ? "Maybe"
                                  : "Can't Go"}
                              </span>
                            </span>
                          )}
                          <div className="flex gap-2 ml-auto">
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRSVP(event.id, "going");
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                getRSVP(event.id).status === "going"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Check className="w-4 h-4" />
                              Going
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRSVP(event.id, "maybe");
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                getRSVP(event.id).status === "maybe"
                                  ? "bg-amber-500 text-white"
                                  : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <HelpCircle className="w-4 h-4" />
                              Maybe
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRSVP(event.id, "not-going");
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                getRSVP(event.id).status === "not-going"
                                  ? "bg-red-500 text-white"
                                  : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <X className="w-4 h-4" />
                              Can&apos;t Go
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeIn>
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-charcoal)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--accent-ember)]" />
                Create New Event
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title..."
                  className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Event description..."
                  rows={3}
                  className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1.5">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1.5">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Enter location or meeting link..."
                  className="w-full bg-[var(--bg-slate)] border border-[var(--border-subtle)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-ember)]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1.5">Event Type</label>
                <div className="flex gap-2">
                  {(["virtual", "in_person", "hybrid"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewEvent({ ...newEvent, type })}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        newEvent.type === type
                          ? "bg-[var(--accent-ember)]/20 border-[var(--accent-ember)]/50 text-[var(--accent-ember)]"
                          : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-white/5"
                      }`}
                    >
                      {type === "virtual" && <Video className="w-4 h-4" />}
                      {type === "in_person" && <Building className="w-4 h-4" />}
                      {type === "hybrid" && <Globe className="w-4 h-4" />}
                      {type.replace("_", "-")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Creating event:", newEvent);
                  setShowCreateModal(false);
                  setNewEvent({ title: "", description: "", date: "", time: "", location: "", type: "hybrid" });
                }}
                disabled={!newEvent.title || !newEvent.date}
                className="px-4 py-2 rounded-lg bg-[var(--accent-ember)] hover:bg-[var(--accent-ember-soft)] disabled:bg-[var(--accent-ember)]/50 disabled:cursor-not-allowed text-white transition-colors"
              >
                Create Event
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
