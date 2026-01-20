"use client";

import { useState, useEffect } from "react";
import { Video, Clock, Users, ExternalLink, X } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  meeting_url?: string;
  provider?: "zoom" | "teams" | "meet" | "other";
  attendees?: { name: string; avatar?: string }[];
}

// Demo meeting data - in production, this would come from calendar integration
const demoMeetings: Meeting[] = [
  {
    id: "1",
    title: "Weekly Team Standup",
    start_time: new Date(Date.now() + 15 * 60000).toISOString(), // 15 min from now
    end_time: new Date(Date.now() + 45 * 60000).toISOString(),
    meeting_url: "https://zoom.us/j/123456789",
    provider: "zoom",
    attendees: [
      { name: "Sarah Chen" },
      { name: "Alex Kim" },
      { name: "Jordan Lee" },
    ],
  },
];

const providerConfig = {
  zoom: { name: "Zoom", color: "bg-blue-500", icon: "🎥" },
  teams: { name: "Teams", color: "bg-purple-500", icon: "👥" },
  meet: { name: "Meet", color: "bg-green-500", icon: "📹" },
  other: { name: "Meeting", color: "bg-gray-500", icon: "🔗" },
};

export function MeetingCard() {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [timeUntil, setTimeUntil] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Find next upcoming meeting
    const now = new Date();
    const upcoming = demoMeetings.find(
      (m) => new Date(m.start_time) > now && new Date(m.start_time) < new Date(now.getTime() + 30 * 60000)
    );
    setMeeting(upcoming || null);
  }, []);

  useEffect(() => {
    if (!meeting) return;

    const updateTime = () => {
      const now = new Date();
      const start = new Date(meeting.start_time);
      const diff = start.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntil("Now");
      } else {
        const minutes = Math.floor(diff / 60000);
        setTimeUntil(`in ${minutes} min`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [meeting]);

  if (!meeting || dismissed) return null;

  const provider = providerConfig[meeting.provider || "other"];

  return (
    <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-4">
        {/* Meeting Icon */}
        <div className={`w-12 h-12 rounded-xl ${provider.color} flex items-center justify-center text-white text-xl`}>
          <Video className="w-6 h-6" />
        </div>

        {/* Meeting Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
              {provider.name}
            </span>
            <span className="text-xs text-green-400 font-medium">{timeUntil}</span>
          </div>
          <h3 className="text-white font-medium truncate">{meeting.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(meeting.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {meeting.attendees && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {meeting.attendees.length} attendees
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            Prep for meeting
          </button>
          <a
            href={meeting.meeting_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Video className="w-4 h-4" />
            Join
          </a>
        </div>
      </div>
    </div>
  );
}
