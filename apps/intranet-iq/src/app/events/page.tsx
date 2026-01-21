"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { FadeIn, StaggerContainer, StaggerItem } from "@/lib/motion";
import { useUpcomingEvents } from "@/lib/hooks/useSupabase";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Loader2,
  Video,
  Building,
  Globe,
} from "lucide-react";
import type { Event } from "@/lib/database.types";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "virtual" | "in-person" | "hybrid">("all");
  const { events, loading } = useUpcomingEvents({ limit: 50 });

  const filteredEvents = events.filter((event: Event) => {
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
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-[var(--accent-ember)]" />
              Upcoming Events
            </h1>
            <p className="text-[var(--text-muted)]">
              View and manage upcoming company events and meetings
            </p>
          </div>

          {/* Search and Filter */}
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
                onChange={(e) => setFilter(e.target.value as "all" | "virtual" | "in-person" | "hybrid")}
                className="bg-transparent text-[var(--text-primary)] py-3 pr-2 outline-none cursor-pointer"
              >
                <option value="all">All Events</option>
                <option value="virtual">Virtual</option>
                <option value="in-person">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-ember)]" />
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
            <StaggerContainer className="space-y-4">
              {filteredEvents.map((event: Event) => (
                <StaggerItem key={event.id}>
                  <motion.div
                    whileHover={{ scale: 1.01, borderColor: "rgba(249,115,22,0.3)" }}
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
                            {event.location_type}
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
                          {event.max_attendees && (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {event.max_attendees} max attendees
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeIn>
      </main>
    </div>
  );
}
