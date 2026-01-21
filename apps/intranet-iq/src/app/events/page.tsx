"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
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
        return "bg-blue-500/20 text-blue-400";
      case "hybrid":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-green-500/20 text-green-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Sidebar />

      <main className="ml-16 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-white mb-2 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-green-400" />
              Upcoming Events
            </h1>
            <p className="text-white/50">
              View and manage upcoming company events and meetings
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full bg-[#0f0f14] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 bg-[#0f0f14] border border-white/10 rounded-xl px-2">
              <Filter className="w-4 h-4 text-white/40" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "virtual" | "in-person" | "hybrid")}
                className="bg-transparent text-white py-3 pr-2 outline-none cursor-pointer"
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
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/50 mb-2">No events found</h3>
              <p className="text-sm text-white/30">
                {searchQuery ? "Try different search terms" : "No upcoming events scheduled"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event: Event) => (
                <div
                  key={event.id}
                  className="bg-[#0f0f14] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors cursor-pointer"
                >
                  <div className="flex gap-6">
                    {/* Date Column */}
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="bg-green-500/20 rounded-xl p-3">
                        <div className="text-2xl font-bold text-green-400">
                          {new Date(event.start_time).getDate()}
                        </div>
                        <div className="text-xs text-green-400/70 uppercase">
                          {new Date(event.start_time).toLocaleDateString("en-US", { month: "short" })}
                        </div>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-medium text-white">{event.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 ${getLocationColor(event.location_type)}`}>
                          {getLocationIcon(event.location_type)}
                          {event.location_type}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-white/60 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-white/40">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
